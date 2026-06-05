# Voice Agent (OpenAI Realtime API) — Design Spec
**이슈**: #45  
**날짜**: 2026-06-06

## 개요

EditorPage에 OpenAI Realtime API 기반 실시간 음성 에이전트를 추가한다.  
목표는 완성된 에이전트가 아닌 **전체 아키텍처 파이프라인 구성**이다.  
사용자는 실시간으로 AI와 음성 대화하고, 디버깅용으로 트랜스크립트를 확인할 수 있다.  
AI는 `get_project_context` tool로 현재 열린 프로젝트의 블록 구조를 읽을 수 있다.

## 아키텍처

```
EditorPage
  └── <VoiceAgent workspaceRef projectTitle />
        ├── VoiceAgentToggle        // floating 🎙️ 버튼 (fixed, 우측 하단)
        └── VoiceAgentPanel         // 슬라이드 패널
              └── useRealtimeVoice  // WebRTC 세션 + 오디오 I/O + tool 핸들링
                    └── tools.ts    // get_project_context (확장 포인트)

FastAPI
  └── POST /voice/token             // ephemeral token 발급 (1회)
```

## 연결 흐름

```
[1단계] 토큰 발급 (버튼 클릭 시 1회)
  Browser ──POST /voice/token (JWT)──▶ FastAPI
  FastAPI ──POST /v1/realtime/sessions──▶ OpenAI REST
  FastAPI ◀──ephemeral token────────── OpenAI REST
  Browser ◀──ephemeral token────────── FastAPI

[2단계] WebRTC 연결 수립
  Browser ──SDP offer + ephemeral token──▶ OpenAI Realtime API
  Browser ◀──SDP answer─────────────────  OpenAI Realtime API

[3단계] 실시간 대화 (FastAPI 관여 없음)
  Browser ◀══════════ WebRTC ══════════▶ OpenAI Realtime API
            마이크 오디오 스트림 →
            ← AI 음성 응답 스트림
            ← → data channel (tool call, transcription 이벤트)
```

## UI

### VoiceAgentToggle
- EditorPage 우측 하단 `position: fixed`
- 상태별 색상: idle(주황) / connecting(회색) / active(초록) / speaking(파랑)
- 클릭 시 패널 오픈/클로즈 + 세션 연결/해제

### VoiceAgentPanel
- 우측에서 슬라이드 인
- **헤더**: 타이틀("AI 와냥이") + 상태 텍스트 + 닫기 버튼
- **메인**: 상태 인디케이터 크게 표시 — "듣고 있어요 🎤" / "말하는 중 💬" / "연결 중..."
- **하단**: `▶ 대화 기록` 토글 — 기본 숨김, 펼치면 트랜스크립트 텍스트 표시 (디버깅용)

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
- `tools.ts`에 선언 + 핸들러 분리 → 추후 tool 추가 시 이 파일에만 등록

## 시스템 프롬프트

```
너는 WaCratch 블록 코딩 에디터의 AI 도우미야.
어린이 사용자가 블록 코딩을 배울 수 있도록 친절하고 쉽게 설명해줘.
get_project_context 툴로 현재 프로젝트 상태를 확인할 수 있어.
한국어로 대답해.
```

## 파일 영향 범위

### 신규 생성 (프론트)
```
frontend/src/components/VoiceAgent/
  ├── VoiceAgent.tsx           // 최상위 컴포넌트
  ├── VoiceAgentToggle.tsx     // floating 버튼
  ├── VoiceAgentPanel.tsx      // 슬라이드 패널 UI
  ├── useRealtimeVoice.ts      // WebRTC + 세션 + tool 핸들링 훅
  ├── tools.ts                 // tool 선언 + 핸들러 (확장 포인트)
  └── VoiceAgent.module.css
```

### 수정 (프론트)
```
frontend/src/pages/EditorPage/EditorPage.tsx  // <VoiceAgent> 마운트
```

### 신규 생성 (백엔드)
```
backend/app/routers/voice.py   // POST /voice/token
```

### 수정 (백엔드)
```
backend/app/main.py            // voice router 등록
```

### 환경변수
```
backend/.env                   // OPENAI_API_KEY 추가
```

## 완료 조건

- [ ] EditorPage에서 🎙️ 버튼 클릭 시 패널 오픈
- [ ] 패널 오픈 시 ephemeral token 발급 + WebRTC 세션 연결 (마이크 활성화)
- [ ] 사용자가 말하면 AI가 음성으로 응답
- [ ] AI가 `get_project_context` 호출 시 현재 블록 정보 반환
- [ ] 패널 하단 트랜스크립트 토글로 대화 내용 텍스트 확인 가능
- [ ] 패널 닫으면 세션 종료 (마이크 해제)

## 범위 외 (추후)

- 백엔드 tool 실행 (DB 조회, 프로젝트 저장 등)
- 블록 자동 추가/삭제 tool
- 다국어 지원
- API 키 사용량 제한
