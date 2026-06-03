# Voice Agent (Gemini Live) — Design Spec
**이슈**: #45  
**날짜**: 2026-06-04

## 개요

EditorPage에 Gemini Live 기반 실시간 음성 에이전트를 추가한다.  
목표는 완성된 에이전트가 아닌 **전체 아키텍처 파이프라인 구성**이다.  
사용자는 실시간으로 AI와 대화하고, 대화 기록을 UI에서 볼 수 있다.  
AI는 `get_project_context` tool로 현재 열린 프로젝트의 블록 구조를 읽을 수 있다.

## 아키텍처

```
EditorPage
  └── <VoiceAgent workspaceRef projectTitle />
        ├── VoiceAgentToggle    // floating 🎙️ 버튼 (우측 하단 fixed)
        └── VoiceAgentPanel     // 슬라이드 패널 (chat history)
              └── useGeminiLive // WebSocket 세션 + 상태 관리
                    └── tools   // get_project_context 정의 + 핸들러
```

### Gemini Live 연결

- 모델: `gemini-2.0-flash-live` (또는 현재 사용 가능한 최신 Live 모델)
- 연결: 브라우저 → Gemini Live WebSocket 직접 연결
- API 키: `VITE_GEMINI_API_KEY` 환경변수 (`.env.local`)
- LangGraph 미사용 — Gemini Live가 대화 상태 및 tool calling 루프 내부 처리

## UI

### VoiceAgentToggle
- EditorPage 우측 하단 `position: fixed`
- 상태별 색상: idle(주황) / listening(초록) / speaking(파랑)
- 클릭 시 VoiceAgentPanel 오픈/클로즈

### VoiceAgentPanel
- 우측에서 슬라이드 인
- 구성: 헤더(상태 텍스트 + 닫기 버튼) + 채팅 히스토리 스크롤 영역
- 채팅: user 말풍선(우측), AI 말풍선(좌측)

## 마이크 인터랙션

- **Always-on (VAD)**: Gemini Live가 자체 VAD 처리
- 패널이 열려 있는 동안 마이크 활성화
- 패널 닫히면 세션 종료 (마이크 해제)

## 대화 기록

```ts
type Message = {
  role: 'user' | 'model'
  text: string
  ts: number
}
```

- Gemini Live `inputTranscript` 이벤트 → user 메시지 추가
- Gemini Live `outputTranscript` 이벤트 → model 메시지 추가

## Tool Calling

### get_project_context

```ts
// 입력: 없음
// 출력:
{
  title: string        // 프로젝트 제목
  blockCount: number   // 워크스페이스 블록 수
  blocks_json: object  // Blockly.serialization.workspaces.save() 결과
}
```

- 클라이언트에서 실행 (workspaceRef.current 직접 접근)
- 추후 tool 추가 시 `tools.ts`에만 등록하면 됨 (확장 포인트)

## 시스템 프롬프트

```
너는 WaCratch 블록 코딩 에디터의 AI 도우미야.
어린이 사용자가 블록 코딩을 배울 수 있도록 친절하고 쉽게 설명해줘.
get_project_context 툴로 현재 프로젝트 상태를 확인할 수 있어.
한국어로 대답해.
```

## 파일 구조

### 신규 생성
```
frontend/src/components/VoiceAgent/
  ├── VoiceAgent.tsx
  ├── VoiceAgentToggle.tsx
  ├── VoiceAgentPanel.tsx
  ├── useGeminiLive.ts
  ├── tools.ts
  └── VoiceAgent.module.css
```

### 수정
```
frontend/src/pages/EditorPage/EditorPage.tsx  // <VoiceAgent> 마운트
frontend/.env.local                           // VITE_GEMINI_API_KEY 추가
```

## 완료 조건

- [ ] EditorPage에서 🎙️ 버튼 클릭 시 패널 오픈
- [ ] 패널 오픈 시 Gemini Live 세션 연결 (마이크 활성화)
- [ ] 사용자가 말하면 AI가 음성으로 응답
- [ ] 대화 기록이 패널에 텍스트로 표시됨
- [ ] AI가 `get_project_context` 호출 시 현재 블록 정보 반환
- [ ] 패널 닫으면 세션 종료

## 범위 외 (추후)

- 백엔드 프록시 (API 키 보안)
- 블록 자동 추가/삭제 tool
- 다국어 지원
