# #48 텍스트 기반 AI 채팅 에이전트 (LangGraph) 구현 플랜

## 브레인스토밍 결정 사항

- 인증: JWT 필수 (`get_current_user`)
- 히스토리: 프론트 관리 → 매 요청에 `history[]` 포함
- 스트리밍: 텍스트 청크만 단순 SSE (`data: "..."`)
- 툴: `get_project_context`, `get_user_info` (확장성 고려한 registry 구조)
- UI: 채널톡 스타일 — 우측 하단 플로팅 💬 버튼 → 채팅 패널 토글
- 기존 VoiceAgent 파일 보존

## 영향 범위

- 생성:
  - `backend/app/routers/agent.py`
  - `backend/app/services/agent_service.py`
  - `frontend/src/components/TextAgent/TextAgent.tsx`
  - `frontend/src/components/TextAgent/TextAgentPanel.tsx`
  - `frontend/src/components/TextAgent/useTextAgent.ts`
  - `frontend/src/components/TextAgent/TextAgent.module.css`
- 수정:
  - `backend/requirements.txt` — langgraph, langchain-anthropic 추가
  - `backend/app/main.py` — agent 라우터 등록
  - `frontend/src/pages/EditorPage/EditorPage.tsx` — VoiceAgent → TextAgent 교체
- 보존 (수정 금지):
  - `frontend/src/components/VoiceAgent/` 전체

---

## 태스크

### Task 1 — 백엔드 의존성 추가 (2분)
- 파일: `backend/requirements.txt`
- 구현:
  - `langgraph>=0.4.0`
  - `langchain-anthropic>=0.3.0`
  - `anthropic>=0.40.0`
  - `sse-starlette>=2.1.0` (FastAPI SSE 스트리밍용)
- 검증: `pip install -r backend/requirements.txt` 에러 없음

### Task 2 — LangGraph 에이전트 서비스 구현 (5분)
- 파일: `backend/app/services/agent_service.py`
- 구현:
  - `SYSTEM_PROMPT` — 와냥이 캐릭터 (VoiceAgent와 동일)
  - Tool registry 구조: `ToolContext` dataclass + `TOOL_REGISTRY: dict[str, Callable]`
  - `get_project_context(ctx)` 툴 — ctx의 project_context 반환
  - `get_user_info(ctx)` 툴 — ctx의 nickname 반환
  - `build_graph(ctx)` — `create_react_agent(ChatAnthropic(...), tools)` 로 LangGraph 에이전트 생성
  - `stream_response(message, history, ctx)` — async generator, 텍스트 청크 yield
- 검증: Python import 오류 없음

### Task 3 — 에이전트 라우터 구현 (3분)
- 파일: `backend/app/routers/agent.py`
- 구현:
  - `POST /chat` 엔드포인트 (인증: `get_current_user`)
  - Request schema: `AgentChatRequest(message, history, project_context, nickname)`
  - `EventSourceResponse`로 SSE 스트리밍
  - 청크 형식: `data: <text>\n\n` + 종료: `data: [DONE]\n\n`
- 검증: `curl -X POST /agent/chat` 스트리밍 응답 확인

### Task 4 — main.py 라우터 등록 (1분)
- 파일: `backend/app/main.py`
- 구현: `from app.routers import agent` + `app.include_router(agent.router, prefix="/agent", tags=["agent"])`
- 검증: `uvicorn app.main:app` 기동 시 `/agent/chat` 엔드포인트 확인 (`/docs`)

### Task 5 — SSE 스트리밍 훅 (4분)
- 파일: `frontend/src/components/TextAgent/useTextAgent.ts`
- 구현:
  - `Message` 타입: `{ role: 'user' | 'assistant', content: string, id: string }`
  - `useTextAgent(workspaceRef, projectTitle)` 훅
  - `sendMessage(text)` — `fetch POST /agent/chat` with `history`, `project_context`(blocks_json from workspace), `nickname`
  - `ReadableStream` / `TextDecoder`로 SSE 파싱, 청크 수신 시 마지막 assistant 메시지 content에 append
  - `messages`, `isLoading`, `sendMessage` 반환
- 검증: 훅 TypeScript 타입 오류 없음

### Task 6 — TextAgentPanel UI (4분)
- 파일: `frontend/src/components/TextAgent/TextAgentPanel.tsx`
- 구현:
  - 메시지 목록 렌더링 (user/assistant 말풍선 구분)
  - 텍스트 입력창 + 전송 버튼
  - `isLoading` 시 입력 비활성화 + 로딩 인디케이터
  - 새 메시지 수신 시 자동 스크롤
  - Props: `{ messages, isLoading, onSend, onClose }`
- 검증: 컴포넌트 마운트 시 패널 렌더링, 입력/전송 동작

### Task 7 — TextAgent 토글 컴포넌트 + 스타일 (3분)
- 파일: `frontend/src/components/TextAgent/TextAgent.tsx`, `TextAgent.module.css`
- 구현:
  - `TextAgent({ workspaceRef, projectTitle })` — `isOpen` 상태 관리
  - 우측 하단 플로팅 💬 버튼 (채널톡 스타일, `position: fixed`)
  - `isOpen` 시 `TextAgentPanel` 렌더링
  - CSS: 버튼 원형, 패널 `box-shadow`, 슬라이드 업 애니메이션
- 검증: 버튼 클릭 → 패널 토글 동작

### Task 8 — EditorPage 교체 (2분)
- 파일: `frontend/src/pages/EditorPage/EditorPage.tsx`
- 구현:
  - `import VoiceAgent` 제거, `import TextAgent` 추가
  - `<VoiceAgent ...>` → `<TextAgent workspaceRef={workspaceRef} projectTitle={projectTitle} />` 교체
- 검증: 에디터 로드 시 💬 버튼 표시, 마이크 버튼 미표시
