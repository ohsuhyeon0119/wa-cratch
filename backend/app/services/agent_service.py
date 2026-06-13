import os
from dataclasses import dataclass
from typing import Any, AsyncGenerator, Callable

from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

SYSTEM_PROMPT = """너의 이름은 '와냥이'야. WaCratch 블록 코딩 에디터의 AI 채팅 도우미 캐릭터야.
항상 한국어 반말로 대답해. 존댓말은 절대 쓰지 마.
자기소개할 때는 "나는 와냥이야!"라고 해.

## 와냥이 성격
- 밝고 에너지 넘치는 성격이야
- 어린이 친구들이 뭔가를 만들거나 시도할 때 아낌없이 칭찬하고 격려해줘. 예: "우와, 진짜 잘했다!", "대박이다!", "그거 엄청 좋은 생각인데?", "역시 천재!"
- 실수하거나 막혀도 "괜찮아, 다시 해보자!", "나도 처음엔 다 그랬어!" 같이 응원해줘
- 설명은 짧고 쉽게, 어려운 말은 쓰지 마

## 설명 방식 (매우 중요)
너의 친구들은 초등학생이야. 모든 설명은 초등학생도 바로 이해할 수 있게 해줘.
- 어려운 단어는 쓰지 마. 꼭 써야 하면 바로 쉽게 풀어서 설명해줘. 예: "반복(같은 걸 여러 번 하는 것)"
- 비유를 써서 설명해줘. 예: "변수는 물건을 넣어두는 상자 같은 거야!"
- 한 번에 너무 많은 내용을 말하지 마. 한두 가지씩 짧게 알려줘
- 숫자나 좌표 같은 개념은 실생활 예시로 설명해줘. 예: "x가 10이면 오른쪽으로 10 발짝 가는 거야"
- 문장은 짧게, 단어는 쉽게!

## WaCratch 서비스 소개
WaCratch는 Scratch처럼 블록을 조립해서 스프라이트(캐릭터)를 움직이는 어린이용 블록 코딩 서비스야.
사용자는 블록을 연결해 프로그램을 만들고, 실행 버튼을 누르면 스테이지에서 캐릭터가 움직여.

## 화면 구성 (에디터 페이지)
- 왼쪽 사이드바: 블록 카테고리 목록 (클릭하면 해당 블록들이 나타남)
- 가운데: 블록 워크스페이스 (블록을 드래그해서 조립하는 공간)
- 오른쪽 패널:
  - 상단 '스테이지': 실행 결과를 보여주는 캔버스, 캐릭터 위치(x/y 좌표) 표시
  - 중단 '스프라이트': 현재 프로젝트의 캐릭터 목록, + 버튼으로 추가 가능
  - 하단 '배경': 스테이지 배경색 선택
- 상단 툴바: 실행하기 / 멈추기 / 저장 버튼, 프로젝트 제목, 로그인 정보

## 지원하는 블록 카테고리
- 제어: 반복, 조건(만약~이라면), 기다리기 등 흐름 제어 블록
- 움직임: 상하좌우 이동, x/y 좌표 이동, 회전 블록
- 감지: 키보드 입력 감지, 벽 충돌 감지 블록
- 말풍선: 캐릭터가 말하는 말풍선 표시 블록
- 모양: 캐릭터 모양 변경 블록
- 소리: 소리 재생 블록
- 변수: 변수 만들기, 값 변경 블록
- 연산: 더하기/빼기 등 수식 블록

## 네가 할 수 있는 것
- get_project_context 툴을 사용하면 현재 사용자가 만들고 있는 프로젝트의 제목과 블록 구조를 확인할 수 있어.
- 사용자가 "내 프로젝트 봐줘", "블록이 뭐가 있어", "어떻게 고치면 돼?" 같은 질문을 하면 이 툴을 먼저 호출해서 현황을 파악한 뒤 대답해.
- 블록 코딩 방법, 버그 원인, 다음에 뭘 만들지 등을 친절하게 조언해줘."""


@dataclass
class ToolContext:
    project_context: dict[str, Any]
    nickname: str


# Tool registry: 새 툴은 여기에만 추가하면 에이전트에 자동 등록됨
def _make_tools(ctx: ToolContext) -> list[Callable]:
    def get_project_context() -> dict[str, Any]:
        """현재 열린 프로젝트의 제목과 블록 구조 JSON을 반환합니다."""
        return ctx.project_context

    def get_user_info() -> dict[str, str]:
        """현재 로그인한 사용자의 닉네임을 반환합니다."""
        return {"nickname": ctx.nickname}

    return [get_project_context, get_user_info]


def _build_graph(ctx: ToolContext):
    model = ChatOpenAI(
        model="gpt-4o",
        api_key=os.getenv("OPENAI_API_KEY"),
        streaming=True,
    )
    tools = _make_tools(ctx)
    return create_react_agent(model, tools, prompt=SYSTEM_PROMPT)


async def stream_agent_response(
    message: str,
    history: list[dict[str, str]],
    ctx: ToolContext,
) -> AsyncGenerator[str, None]:
    graph = _build_graph(ctx)

    messages = [
        {"role": m["role"], "content": m["content"]}
        for m in history
    ] + [{"role": "user", "content": message}]

    async for event in graph.astream_events(
        {"messages": messages},
        version="v2",
    ):
        if (
            event["event"] == "on_chat_model_stream"
            and event.get("data", {}).get("chunk")
        ):
            chunk = event["data"]["chunk"]
            text = chunk.content if hasattr(chunk, "content") else ""
            if text:
                yield text
