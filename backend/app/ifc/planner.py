from __future__ import annotations
from typing import Any
from typing_extensions import TypedDict
from langchain_core.messages import (
    BaseMessage, HumanMessage, AIMessage, SystemMessage,
)
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from .labels import IFCLabel, DataSource, get_source_label
from .memory import PlannerMemory, hide
from .policy import PolicyEngine


class LabeledMessage(TypedDict):
    role: str       # "user" | "assistant" | "system"
    content: str
    label: IFCLabel


class IFCState(TypedDict):
    messages: list[LabeledMessage]
    memory: PlannerMemory
    context_label: IFCLabel
    pending_tool_call: dict | None   # {"name": str, "args": dict, "id": str, "result": Any}
    policy_violation: str | None


def _to_lc_messages(messages: list[LabeledMessage]) -> list[BaseMessage]:
    """레이블을 제거하고 LangChain BaseMessage 리스트로 변환"""
    result: list[BaseMessage] = []
    for m in messages:
        role, content = m["role"], m["content"]
        if role == "user":
            result.append(HumanMessage(content=content))
        elif role == "assistant":
            result.append(AIMessage(content=content))
        elif role == "system":
            result.append(SystemMessage(content=content))
    return result


def build_ifc_graph(
    model: ChatOpenAI,
    tools: list,
    system_prompt: str,
    policy_engine: PolicyEngine | None = None,
    default_tool_label: IFCLabel | None = None,
    tool_sources: dict[str, DataSource] | None = None,
):
    """
    FIDES StateGraph 빌드 (Algorithm 7).

    default_tool_label: tool 결과에 부착할 기본 레이블 (tool_sources에 없는 경우).
                        None이면 DataSource.INTERNAL (T,L)을 사용한다.
    tool_sources: 툴별 DataSource 매핑. hide_node에서 결과 레이블 결정에 사용.
    """
    if policy_engine is None:
        policy_engine = PolicyEngine()
    if default_tool_label is None:
        default_tool_label = get_source_label(DataSource.INTERNAL)

    tool_map: dict[str, Any] = {t.__name__: t for t in tools}
    llm_with_tools = model.bind_tools(tools)

    def llm_node(state: IFCState) -> dict:
        sys_msgs = [SystemMessage(content=system_prompt)]
        stripped = _to_lc_messages(state["messages"])
        response = llm_with_tools.invoke(sys_msgs + stripped)

        if response.tool_calls:
            tc = response.tool_calls[0]
            return {
                "pending_tool_call": {
                    "name": tc["name"],
                    "args": tc["args"],
                    "id": tc["id"],
                    "result": None,
                }
            }

        content = response.content if isinstance(response.content, str) else str(response.content)
        new_msg = LabeledMessage(
            role="assistant",
            content=content,
            label=state["context_label"],
        )
        return {
            "messages": state["messages"] + [new_msg],
            "pending_tool_call": None,
            "policy_violation": None,
        }

    def policy_node(state: IFCState) -> dict:
        tc = state["pending_tool_call"]
        if tc is None:
            return {}
        _, args_labels = state["memory"].expand(tc["args"])
        violation = policy_engine.check(tc["name"], state["context_label"], args_labels)
        if violation:
            return {
                "policy_violation": f"[POLICY] {violation.tool_name}: {violation.reason}"
            }
        return {"policy_violation": None}

    def tool_node(state: IFCState) -> dict:
        tc = state["pending_tool_call"]
        expanded_args, _ = state["memory"].expand(tc["args"])
        tool_fn = tool_map.get(tc["name"])
        if tool_fn is None:
            result: Any = f"[ERROR] Tool '{tc['name']}' not found"
        else:
            try:
                result = tool_fn(**expanded_args)
            except Exception as exc:
                result = f"[ERROR] {exc}"
        return {"pending_tool_call": {**tc, "result": result}}

    def hide_node(state: IFCState) -> dict:
        tc = state["pending_tool_call"]
        tool_name = tc["name"]
        result_label = (
            get_source_label(tool_sources[tool_name])
            if tool_sources and tool_name in tool_sources
            else default_tool_label
        )
        content, new_ctx = hide(
            tool_name=tool_name,
            tool_result=tc["result"],
            result_label=result_label,
            context_label=state["context_label"],
            memory=state["memory"],
        )
        tool_msg = LabeledMessage(
            role="assistant",
            content=f"[{tc['name']}] → {content}",
            label=new_ctx,
        )
        return {
            "messages": state["messages"] + [tool_msg],
            "context_label": new_ctx,
            "pending_tool_call": None,
        }

    def violation_inject(state: IFCState) -> dict:
        violation_msg = LabeledMessage(
            role="system",
            content=state["policy_violation"],
            label=get_source_label(DataSource.INTERNAL),
        )
        return {
            "messages": state["messages"] + [violation_msg],
            "pending_tool_call": None,
            "policy_violation": None,
        }

    def route_after_llm(state: IFCState) -> str:
        return "policy_node" if state.get("pending_tool_call") else END

    def route_after_policy(state: IFCState) -> str:
        return "violation_inject" if state.get("policy_violation") else "tool_node"

    workflow = StateGraph(IFCState)
    workflow.add_node("llm_node", llm_node)
    workflow.add_node("policy_node", policy_node)
    workflow.add_node("tool_node", tool_node)
    workflow.add_node("hide_node", hide_node)
    workflow.add_node("violation_inject", violation_inject)

    workflow.add_edge(START, "llm_node")
    workflow.add_conditional_edges(
        "llm_node", route_after_llm,
        {"policy_node": "policy_node", END: END},
    )
    workflow.add_conditional_edges(
        "policy_node", route_after_policy,
        {"tool_node": "tool_node", "violation_inject": "violation_inject"},
    )
    workflow.add_edge("tool_node", "hide_node")
    workflow.add_edge("hide_node", "llm_node")
    workflow.add_edge("violation_inject", "llm_node")

    return workflow.compile()
