import os
from dataclasses import dataclass, field
from typing import Any, AsyncGenerator, Callable

from langchain_openai import ChatOpenAI
from app.ifc import (
    DataSource,
    IFCState,
    LabeledMessage,
    PlannerMemory,
    build_ifc_graph,
    get_source_label,
)

BLOCK_REFERENCE = [
    # ── CONTROL ──
    {"type": "wc_start", "description": "시작했을 때 (Hat 블록 — 제일 위에 놓는 블록, next로 다음 블록 연결)", "params": []},
    {"type": "wc_repeat", "description": "N번 반복하기", "params": [
        {"name": "TIMES", "kind": "field_number", "default": 10},
        {"name": "DO", "kind": "statement"},
    ]},
    {"type": "wc_forever", "description": "계속 반복하기 (무한루프)", "params": [{"name": "DO", "kind": "statement"}]},
    {"type": "wc_repeat_until", "description": "조건이 참이 될 때까지 반복", "params": [
        {"name": "COND", "kind": "value_boolean"},
        {"name": "DO", "kind": "statement"},
    ]},
    {"type": "wc_if", "description": "만약 조건이 참이라면 실행", "params": [
        {"name": "COND", "kind": "value_boolean"},
        {"name": "DO", "kind": "statement"},
    ]},
    {"type": "wc_if_else", "description": "만약~이라면/아니라면 (if-else)", "params": [
        {"name": "COND", "kind": "value_boolean"},
        {"name": "DO", "kind": "statement"},
        {"name": "ELSE", "kind": "statement"},
    ]},
    {"type": "wc_wait", "description": "N초 기다리기", "params": [{"name": "SECS", "kind": "field_number", "default": 1}]},
    {"type": "wc_stop_all", "description": "모두 멈추기", "params": []},
    # ── MOTION ──
    {"type": "wc_move_steps", "description": "현재 방향으로 N만큼 이동", "params": [{"name": "STEPS", "kind": "field_number", "default": 10}]},
    {"type": "wc_move_dir", "description": "지정 방향으로 N만큼 이동", "params": [
        {"name": "DIR", "kind": "field_dropdown", "options": ["UP", "DOWN", "RIGHT", "LEFT"]},
        {"name": "STEPS", "kind": "field_number", "default": 10},
    ]},
    {"type": "wc_go_to", "description": "x,y 좌표로 이동", "params": [
        {"name": "X", "kind": "field_number", "default": 0},
        {"name": "Y", "kind": "field_number", "default": 0},
    ]},
    {"type": "wc_rotate", "description": "N도 회전", "params": [{"name": "DEGREES", "kind": "field_number", "default": 15}]},
    {"type": "wc_reset_pos", "description": "처음 위치(0,0)로 이동", "params": []},
    {"type": "wc_change_x", "description": "x 좌표를 N만큼 바꾸기", "params": [{"name": "DX", "kind": "field_number", "default": 10}]},
    {"type": "wc_change_y", "description": "y 좌표를 N만큼 바꾸기", "params": [{"name": "DY", "kind": "field_number", "default": 10}]},
    {"type": "wc_set_direction", "description": "방향을 N도로 설정 (90=오른쪽, 0=위, 180=아래, 270=왼쪽)", "params": [{"name": "DIR", "kind": "field_number", "default": 90}]},
    {"type": "wc_bounce_wall", "description": "벽에서 튕기기", "params": []},
    {"type": "wc_glide_to", "description": "N초 동안 x,y 좌표로 부드럽게 이동", "params": [
        {"name": "SECS", "kind": "field_number", "default": 1},
        {"name": "X", "kind": "field_number", "default": 0},
        {"name": "Y", "kind": "field_number", "default": 0},
    ]},
    # ── SENSING ──
    {"type": "wc_key_hat_up", "description": "↑ 위 키 눌렸을 때 (Hat 블록)", "params": []},
    {"type": "wc_key_hat_down", "description": "↓ 아래 키 눌렸을 때 (Hat 블록)", "params": []},
    {"type": "wc_key_hat_left", "description": "← 왼쪽 키 눌렸을 때 (Hat 블록)", "params": []},
    {"type": "wc_key_hat_right", "description": "→ 오른쪽 키 눌렸을 때 (Hat 블록)", "params": []},
    {"type": "wc_key_hat_space", "description": "스페이스 키 눌렸을 때 (Hat 블록)", "params": []},
    {"type": "wc_mouse_click_hat", "description": "마우스를 클릭했을 때 (Hat 블록)", "params": []},
    {"type": "wc_key_pressed", "description": "키가 눌려있는가? (Boolean 반환)", "params": [
        {"name": "KEY", "kind": "field_dropdown", "options": ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " (스페이스)"]},
    ]},
    {"type": "wc_wall_touching", "description": "벽에 닿았는가? (Boolean 반환)", "params": []},
    {"type": "wc_mouse_x", "description": "마우스 x 좌표 (Number 반환)", "params": []},
    {"type": "wc_mouse_y", "description": "마우스 y 좌표 (Number 반환)", "params": []},
    {"type": "wc_set_x_to_mouse", "description": "x 좌표를 마우스 위치로 설정 (패들 제어에 유용)", "params": []},
    # ── SPEECH ──
    {"type": "wc_say", "description": "말풍선 표시 (텍스트)", "params": [{"name": "TEXT", "kind": "field_input", "default": "안녕!"}]},
    {"type": "wc_say_for", "description": "N초 동안 말풍선 표시", "params": [
        {"name": "TEXT", "kind": "field_input", "default": "안녕!"},
        {"name": "SECS", "kind": "field_number", "default": 2},
    ]},
    {"type": "wc_clear_speech", "description": "말풍선 지우기", "params": []},
    # ── LOOKS ──
    {"type": "wc_show", "description": "스프라이트 보이기", "params": []},
    {"type": "wc_hide", "description": "스프라이트 숨기기", "params": []},
    {"type": "wc_set_size", "description": "크기를 N%로 설정", "params": [{"name": "SIZE", "kind": "field_number", "default": 100}]},
    {"type": "wc_change_size", "description": "크기를 N만큼 키우기/줄이기", "params": [{"name": "DELTA", "kind": "field_number", "default": 10}]},
    # ── SOUND ──
    {"type": "wc_play_sound", "description": "소리 재생", "params": []},
    {"type": "wc_stop_sound", "description": "소리 멈추기", "params": []},
    # ── VARIABLES ──
    {"type": "wc_var_set", "description": "변수를 값으로 설정", "params": [
        {"name": "NAME", "kind": "field_input", "default": "점수"},
        {"name": "VALUE", "kind": "value_number"},
    ]},
    {"type": "wc_var_change", "description": "변수를 N만큼 바꾸기", "params": [
        {"name": "NAME", "kind": "field_input", "default": "점수"},
        {"name": "VALUE", "kind": "value_number"},
    ]},
    {"type": "wc_var_get", "description": "변수의 현재 값 (Number 반환)", "params": [
        {"name": "NAME", "kind": "field_input", "default": "점수"},
    ]},
    # ── MATH / OPERATORS ──
    {"type": "wc_num_literal", "description": "숫자 값 (Number 반환)", "params": [{"name": "NUM", "kind": "field_number", "default": 0}]},
    {"type": "wc_random", "description": "N부터 M 사이 랜덤 숫자 (Number 반환)", "params": [
        {"name": "FROM", "kind": "value_number"},
        {"name": "TO", "kind": "value_number"},
    ]},
    {"type": "wc_add", "description": "A + B (Number 반환)", "params": [{"name": "A", "kind": "value_number"}, {"name": "B", "kind": "value_number"}]},
    {"type": "wc_sub", "description": "A - B (Number 반환)", "params": [{"name": "A", "kind": "value_number"}, {"name": "B", "kind": "value_number"}]},
    {"type": "wc_mul", "description": "A × B (Number 반환)", "params": [{"name": "A", "kind": "value_number"}, {"name": "B", "kind": "value_number"}]},
    {"type": "wc_div", "description": "A ÷ B (Number 반환)", "params": [{"name": "A", "kind": "value_number"}, {"name": "B", "kind": "value_number"}]},
    {"type": "wc_gt", "description": "A > B (Boolean 반환)", "params": [{"name": "A", "kind": "value_number"}, {"name": "B", "kind": "value_number"}]},
    {"type": "wc_lt", "description": "A < B (Boolean 반환)", "params": [{"name": "A", "kind": "value_number"}, {"name": "B", "kind": "value_number"}]},
    {"type": "wc_eq", "description": "A = B (Boolean 반환)", "params": [{"name": "A", "kind": "value_number"}, {"name": "B", "kind": "value_number"}]},
]

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

## 블록 추가/교체 능력 (핵심)
너는 블록을 직접 워크스페이스에 넣어줄 수 있어!
사용자가 "~해줘", "~블록 추가해줘", "~만들어줘" 라고 하면 설명하지 말고 바로 툴을 호출해.
절대로 "내가 직접 할 수 없어" 라고 하지 마. 너는 할 수 있어.

툴 사용 규칙:
- 블록을 새로 만들 때: get_block_reference → set_blocks (또는 append_blocks) 순서로 호출
- 기존 블록 유지하며 추가: append_blocks
- 전부 교체: set_blocks
- 다 지우기: clear_workspace
- 툴 호출 후엔 사용자한테 "채팅창 위에 버튼이 떴어! 눌러줘! 🎉" 라고 안내해

## 기타 툴
- get_project_context: 현재 프로젝트 제목과 블록 구조 확인
- get_user_info: 사용자 닉네임 확인

## 블록을 만들 때 규칙 (매우 중요)
1. 블록 type을 절대 추측하지 마. 반드시 get_block_reference를 먼저 호출해서 정확한 type을 확인해.
2. XML 루트 태그: <xml xmlns="https://developers.google.com/blockly/xml">
3. Hat 블록(wc_start, wc_key_hat_* 등)은 <next>로 다음 블록 연결
4. statement 입력은 <statement name="DO"> 사용
5. value 입력(숫자)은 <value name="A"><block type="wc_num_literal"><field name="NUM">10</field></block></value>
6. 필드 값은 <field name="STEPS">10</field> 형식

## 크기(SIZE) 관련 주의
- SIZE 값은 **퍼센트(%)** 야. 100 = 원래 크기, 50 = 절반, 20 = 5분의 1, 200 = 2배
- 절대로 소수(0.5, 0.2)로 쓰지 마. 50%, 20% 이런 식으로 정수로 써야 해
- "절반으로 줄여" → SIZE=50, "5분의 1로 줄여" → SIZE=20, "2배로 키워" → SIZE=200

## XML 예시
```xml
<!-- 시작하면 마우스를 따라 x 좌표 이동 (패들 제어) -->
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="wc_start">
    <next>
      <block type="wc_forever">
        <statement name="DO">
          <block type="wc_set_x_to_mouse"/>
        </statement>
      </block>
    </next>
  </block>
</xml>

<!-- 시작하면 크기를 20%로 설정 (5분의 1) -->
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="wc_start">
    <next>
      <block type="wc_set_size">
        <field name="SIZE">20</field>
      </block>
    </next>
  </block>
</xml>

<!-- 10번 반복해서 위로 이동 -->
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="wc_start">
    <next>
      <block type="wc_repeat">
        <field name="TIMES">10</field>
        <statement name="DO">
          <block type="wc_move_dir">
            <field name="DIR">UP</field>
            <field name="STEPS">10</field>
          </block>
        </statement>
      </block>
    </next>
  </block>
</xml>
```"""


@dataclass
class ToolContext:
    project_context: dict[str, Any]
    nickname: str
    pending_action: dict | None = field(default=None)


# Tool registry: 새 툴은 여기에만 추가하면 에이전트에 자동 등록됨
def _make_tools(ctx: ToolContext) -> list[Callable]:
    def get_project_context() -> dict[str, Any]:
        """현재 열린 프로젝트의 제목과 블록 구조 JSON을 반환합니다."""
        return ctx.project_context

    def get_user_info() -> dict[str, str]:
        """현재 로그인한 사용자의 닉네임을 반환합니다."""
        return {"nickname": ctx.nickname}

    def get_block_reference() -> dict[str, Any]:
        """이 프로젝트에서 사용 가능한 모든 블록의 type, 설명, 파라미터 목록을 반환합니다.
        set_blocks / append_blocks로 XML을 만들기 전에 반드시 이 툴을 먼저 호출해서
        정확한 block type과 파라미터를 확인하세요. block type을 절대 추측하지 마세요."""
        return {"blocks": BLOCK_REFERENCE}

    def set_blocks(xml: str, sprite_name: str | None = None) -> dict[str, Any]:
        """지정한 스프라이트의 워크스페이스를 주어진 Blockly XML로 완전히 교체합니다.
        기존 블록은 모두 지워집니다. 사용자 확인 후 적용됩니다.
        xml: Blockly XML 문자열 (<xml xmlns="https://developers.google.com/blockly/xml"> 루트 태그 포함)
        sprite_name: 블록을 넣을 스프라이트 이름 (생략 시 현재 선택된 스프라이트)"""
        ctx.pending_action = {"type": "set_blocks", "xml": xml, "sprite_name": sprite_name}
        return {"success": True, "message": "블록을 준비했어! 사용자가 확인 후 적용돼."}

    def append_blocks(xml: str, sprite_name: str | None = None) -> dict[str, Any]:
        """지정한 스프라이트의 워크스페이스에 블록을 추가합니다. 기존 블록은 유지됩니다.
        xml: 추가할 Blockly XML 문자열
        sprite_name: 블록을 넣을 스프라이트 이름 (생략 시 현재 선택된 스프라이트)"""
        ctx.pending_action = {"type": "append_blocks", "xml": xml, "sprite_name": sprite_name}
        return {"success": True, "message": "추가할 블록을 준비했어! 사용자가 확인 후 적용돼."}

    def clear_workspace(sprite_name: str | None = None) -> dict[str, Any]:
        """지정한 스프라이트의 워크스페이스를 비웁니다.
        sprite_name: 비울 스프라이트 이름 (생략 시 현재 선택된 스프라이트)"""
        ctx.pending_action = {"type": "clear_workspace", "xml": None, "sprite_name": sprite_name}
        return {"success": True, "message": "워크스페이스 초기화를 준비했어! 사용자가 확인 후 적용돼."}

    return [get_project_context, get_user_info, get_block_reference, set_blocks, append_blocks, clear_workspace]


def _build_graph(ctx: ToolContext, project_data_source: DataSource = DataSource.OWN_PROJECT):
    model = ChatOpenAI(
        model="gpt-4o",
        api_key=os.getenv("OPENAI_API_KEY"),
    )
    tools = _make_tools(ctx)
    return build_ifc_graph(
        model=model,
        tools=tools,
        system_prompt=SYSTEM_PROMPT,
        tool_sources={
            "get_project_context": project_data_source,
            "get_block_reference": DataSource.INTERNAL,
            "get_user_info": DataSource.INTERNAL,
        },
    )


async def stream_agent_response(
    message: str,
    history: list[dict[str, str]],
    ctx: ToolContext,
    project_data_source: DataSource = DataSource.OWN_PROJECT,
) -> AsyncGenerator[str, None]:
    graph = _build_graph(ctx, project_data_source)

    user_label = get_source_label(DataSource.USER_INPUT)
    context_label = get_source_label(project_data_source)

    labeled_history: list[LabeledMessage] = [
        LabeledMessage(role=m["role"], content=m["content"], label=user_label)
        for m in history
    ] + [LabeledMessage(role="user", content=message, label=user_label)]

    initial_state = IFCState(
        messages=labeled_history,
        memory=PlannerMemory(),
        context_label=context_label,
        pending_tool_call=None,
        policy_violation=None,
    )

    final_state = await graph.ainvoke(initial_state)

    # 마지막 어시스턴트 텍스트 응답 추출 (tool 결과 메시지 "[tool] →" 제외)
    for msg in reversed(final_state["messages"]):
        if msg["role"] == "assistant" and not msg["content"].startswith("["):
            yield msg["content"]
            break
