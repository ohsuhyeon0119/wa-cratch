# #45 Voice Agent (OpenAI Realtime API) 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** EditorPage에 OpenAI Realtime API 기반 실시간 음성 에이전트를 추가한다. Floating 버튼으로 패널 열면 WebRTC로 AI와 음성 대화, 디버그용 트랜스크립트 토글 제공.

**Architecture:** FastAPI `/voice/token`이 ephemeral token을 발급하고, 브라우저가 해당 토큰으로 OpenAI Realtime API에 WebRTC 직접 연결한다. `useRealtimeVoice` 훅이 WebRTC 세션·오디오 I/O·tool calling을 관리하고, `VoiceAgent` 컴포넌트가 UI를 조합해 EditorPage에 마운트된다.

**Tech Stack:** FastAPI + openai Python SDK (백엔드), WebRTC Web API + React + TypeScript + CSS Modules (프론트)

---

## 영향 범위

- 수정: `backend/requirements.txt` (openai 추가)
- 생성: `backend/app/routers/voice.py`
- 수정: `backend/app/main.py`
- 생성: `frontend/src/components/VoiceAgent/tools.ts`
- 생성: `frontend/src/components/VoiceAgent/useRealtimeVoice.ts`
- 생성: `frontend/src/components/VoiceAgent/VoiceAgent.module.css`
- 생성: `frontend/src/components/VoiceAgent/VoiceAgentToggle.tsx`
- 생성: `frontend/src/components/VoiceAgent/VoiceAgentPanel.tsx`
- 생성: `frontend/src/components/VoiceAgent/VoiceAgent.tsx`
- 수정: `frontend/src/pages/EditorPage/EditorPage.tsx`

---

## Task 1 — 백엔드: openai 패키지 설치 + voice router (3분)

**Files:**
- Modify: `backend/requirements.txt`
- Create: `backend/app/routers/voice.py`

- [ ] **Step 1: requirements.txt에 openai 추가**

`backend/requirements.txt` 마지막 줄에 추가:
```
openai>=1.30.0
```

- [ ] **Step 2: voice.py 작성**

```python
# backend/app/routers/voice.py
import os

from fastapi import APIRouter, Depends, HTTPException, status
from openai import OpenAI

from app.core.security import get_current_user

router = APIRouter()


@router.post("/token")
async def get_voice_token(current_user: dict = Depends(get_current_user)) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OPENAI_API_KEY not configured",
        )
    client = OpenAI(api_key=api_key)
    session = client.beta.realtime.sessions.create(
        model="gpt-4o-realtime-preview-2024-12-17",
    )
    return {"client_secret": session.client_secret.value}
```

- [ ] **Step 3: openai 패키지 설치 확인**

```bash
cd backend && pip install openai
```

Expected: openai 패키지 설치 완료

---

## Task 2 — 백엔드: main.py에 voice router 등록 + 커밋 (2분)

**Files:**
- Modify: `backend/app/main.py`

- [ ] **Step 1: voice router import 및 등록**

`backend/app/main.py`에서:

```python
# 기존 import 줄 아래에 추가
from app.routers import auth, projects, activity, users, likes, voice
```

```python
# 기존 app.include_router 줄들 아래에 추가
app.include_router(voice.router, prefix="/voice", tags=["voice"])
```

- [ ] **Step 2: 서버 기동 확인**

```bash
cd backend && uvicorn app.main:app --reload
```

Expected: `http://localhost:8000/docs` 에서 `/voice/token` 엔드포인트가 보임

- [ ] **Step 3: 커밋**

```bash
git add backend/requirements.txt backend/app/routers/voice.py backend/app/main.py
git commit -m "feat: POST /voice/token — OpenAI ephemeral token 발급 엔드포인트 (#45)"
```

---

## Task 3 — 프론트: tools.ts 작성 (2분)

**Files:**
- Create: `frontend/src/components/VoiceAgent/tools.ts`

- [ ] **Step 1: tools.ts 작성**

```typescript
// frontend/src/components/VoiceAgent/tools.ts
import type { RefObject } from 'react'
import * as Blockly from 'blockly'

interface ToolDeclaration {
  type: 'function'
  name: string
  description: string
  parameters: Record<string, unknown>
}

export const TOOL_DECLARATIONS: ToolDeclaration[] = [
  {
    type: 'function',
    name: 'get_project_context',
    description: '현재 열린 프로젝트의 제목, 블록 수, 블록 구조 JSON을 반환합니다.',
    parameters: { type: 'object', properties: {} },
  },
]

export function handleToolCall(
  name: string,
  _args: string,
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>,
  projectTitle: string
): Record<string, unknown> {
  if (name === 'get_project_context') {
    const workspace = workspaceRef.current
    if (!workspace) return { title: projectTitle, blockCount: 0, blocks_json: {} }
    return {
      title: projectTitle,
      blockCount: workspace.getAllBlocks(false).length,
      blocks_json: Blockly.serialization.workspaces.save(workspace),
    }
  }
  return { error: `Unknown tool: ${name}` }
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 에러 없음

---

## Task 4 — 프론트: useRealtimeVoice.ts 작성 (5분)

**Files:**
- Create: `frontend/src/components/VoiceAgent/useRealtimeVoice.ts`

- [ ] **Step 1: useRealtimeVoice.ts 작성**

```typescript
// frontend/src/components/VoiceAgent/useRealtimeVoice.ts
import { useState, useRef, useCallback, useEffect } from 'react'
import type { RefObject } from 'react'
import * as Blockly from 'blockly'
import client from '../../api/client'
import { TOOL_DECLARATIONS, handleToolCall } from './tools'

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking'
export type Transcript = { role: 'user' | 'model'; text: string; ts: number }

const SYSTEM_PROMPT = `너는 WaCratch 블록 코딩 에디터의 AI 도우미야.
어린이 사용자가 블록 코딩을 배울 수 있도록 친절하고 쉽게 설명해줘.
get_project_context 툴로 현재 프로젝트 상태를 확인할 수 있어.
한국어로 대답해.`

export function useRealtimeVoice(
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>,
  projectTitle: string
) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcripts, setTranscripts] = useState<Transcript[]>([])

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const projectTitleRef = useRef(projectTitle)

  useEffect(() => { projectTitleRef.current = projectTitle }, [projectTitle])

  const addTranscript = useCallback((role: 'user' | 'model', text: string) => {
    if (!text.trim()) return
    setTranscripts(prev => [...prev, { role, text, ts: Date.now() }])
  }, [])

  function cleanup() {
    pcRef.current?.close()
    pcRef.current = null
    dcRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (audioElRef.current) audioElRef.current.srcObject = null
  }

  const connect = useCallback(async () => {
    setVoiceState('connecting')
    try {
      // 1. ephemeral token 발급 (JWT 자동 포함)
      const { data } = await client.post<{ client_secret: string }>('/voice/token')
      const ephemeralKey = data.client_secret

      // 2. RTCPeerConnection 생성
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      // 3. AI 음성 출력
      if (!audioElRef.current) {
        audioElRef.current = document.createElement('audio')
        audioElRef.current.autoplay = true
      }
      pc.ontrack = (e) => {
        if (audioElRef.current) audioElRef.current.srcObject = e.streams[0]
      }

      // 4. 마이크 입력
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      pc.addTrack(stream.getTracks()[0])

      // 5. 이벤트 채널
      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc

      dc.onopen = () => {
        setVoiceState('listening')
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            instructions: SYSTEM_PROMPT,
            input_audio_transcription: { model: 'whisper-1' },
            tools: TOOL_DECLARATIONS,
            tool_choice: 'auto',
          },
        }))
      }

      dc.onmessage = (e: MessageEvent) => {
        const event = JSON.parse(e.data as string)

        if (event.type === 'response.function_call_arguments.done') {
          const result = handleToolCall(
            event.name as string,
            event.arguments as string,
            workspaceRef,
            projectTitleRef.current
          )
          dc.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: event.call_id,
              output: JSON.stringify(result),
            },
          }))
          dc.send(JSON.stringify({ type: 'response.create' }))
        }

        if (event.type === 'conversation.item.input_audio_transcription.completed') {
          addTranscript('user', (event.transcript as string) ?? '')
        }
        if (event.type === 'response.audio_transcript.done') {
          addTranscript('model', (event.transcript as string) ?? '')
        }
        if (event.type === 'response.audio.delta') setVoiceState('speaking')
        if (event.type === 'response.done') setVoiceState('listening')
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setVoiceState('idle')
          cleanup()
        }
      }

      // 6. SDP offer 생성
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 7. OpenAI SDP answer
      const sdpRes = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        {
          method: 'POST',
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
        }
      )
      const answerSdp = await sdpRes.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

    } catch (err) {
      console.error('Voice connection failed:', err)
      setVoiceState('idle')
      cleanup()
    }
  }, [addTranscript, workspaceRef])

  const disconnect = useCallback(() => {
    cleanup()
    setVoiceState('idle')
  }, [])

  return { voiceState, transcripts, connect, disconnect }
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 에러 없음

---

## Task 5 — 프론트: VoiceAgent.module.css 작성 (3분)

**Files:**
- Create: `frontend/src/components/VoiceAgent/VoiceAgent.module.css`

- [ ] **Step 1: CSS 작성**

```css
/* frontend/src/components/VoiceAgent/VoiceAgent.module.css */

/* ── Toggle button ── */
.toggle {
  position: fixed;
  right: 20px;
  bottom: 36px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 600;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 2px 4px 0 rgba(0, 0, 0, 0.2);
}
.toggle:hover { transform: translateY(-2px); }
.toggleIdle      { background: var(--orange, #FF6B35); color: #fff; }
.toggleConnecting{ background: #aaa; color: #fff; }
.toggleListening { background: #22C55E; color: #fff; }
.toggleSpeaking  { background: #3B82F6; color: #fff; }

/* ── Panel ── */
.panel {
  position: fixed;
  right: 0;
  top: 58px;
  bottom: 28px;
  width: 300px;
  background: var(--cream, #FFF8F2);
  border-left: 3px solid var(--orange-pale, #FFE8DC);
  display: flex;
  flex-direction: column;
  z-index: 500;
  box-shadow: -4px 0 16px rgba(44, 24, 16, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.panelHidden { transform: translateX(308px); }

/* ── Panel header ── */
.panelHeader {
  padding: 12px 14px;
  background: var(--orange, #FF6B35);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.panelTitle { font-weight: 800; font-size: 15px; }
.closeBtn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.closeBtn:hover { background: rgba(255, 255, 255, 0.35); }

/* ── Status area ── */
.statusArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px;
}
.statusIndicator {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  transition: background 0.3s;
}
.status_idle       { background: #E0D8D4; }
.status_connecting { background: #aaa; animation: pulse 1s infinite; }
.status_listening  { background: #22C55E; animation: pulse 1.2s infinite; }
.status_speaking   { background: #3B82F6; animation: pulse 0.8s infinite; }
.statusLabel { font-size: 16px; font-weight: 700; color: #2C1810; }

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.08); opacity: 0.85; }
}

/* ── Transcript toggle ── */
.transcriptToggle {
  flex-shrink: 0;
  border-top: 2px solid var(--orange-pale, #FFE8DC);
}
.toggleBtn {
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: #B0A8A4;
  text-align: left;
}
.toggleBtn:hover { color: #2C1810; }

.transcriptArea {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.transcriptArea::-webkit-scrollbar { width: 4px; }
.transcriptArea::-webkit-scrollbar-thumb {
  background: var(--orange-pale, #FFE8DC);
  border-radius: 2px;
}
.emptyTranscript {
  font-size: 12px;
  color: #B0A8A4;
  text-align: center;
  padding: 8px;
}
.transcriptItem {
  font-size: 12px;
  line-height: 1.4;
  display: flex;
  gap: 6px;
}
.transcriptRole { font-weight: 700; flex-shrink: 0; }
.transcriptUser  .transcriptRole { color: var(--orange, #FF6B35); }
.transcriptModel .transcriptRole { color: #3B82F6; }
.transcriptText { color: #2C1810; }
```

---

## Task 6 — 프론트: VoiceAgentToggle.tsx + VoiceAgentPanel.tsx (3분)

**Files:**
- Create: `frontend/src/components/VoiceAgent/VoiceAgentToggle.tsx`
- Create: `frontend/src/components/VoiceAgent/VoiceAgentPanel.tsx`

- [ ] **Step 1: VoiceAgentToggle.tsx 작성**

```tsx
// frontend/src/components/VoiceAgent/VoiceAgentToggle.tsx
import type { VoiceState } from './useRealtimeVoice'
import s from './VoiceAgent.module.css'

const STATE_CLASSES: Record<VoiceState, string> = {
  idle:       s.toggleIdle,
  connecting: s.toggleConnecting,
  listening:  s.toggleListening,
  speaking:   s.toggleSpeaking,
}

interface Props {
  voiceState: VoiceState
  onClick: () => void
}

export default function VoiceAgentToggle({ voiceState, onClick }: Props) {
  return (
    <button
      className={`${s.toggle} ${STATE_CLASSES[voiceState]}`}
      onClick={onClick}
      aria-label="AI 에이전트 열기"
      title="AI 와냥이와 대화하기"
    >
      🎙️
    </button>
  )
}
```

- [ ] **Step 2: VoiceAgentPanel.tsx 작성**

```tsx
// frontend/src/components/VoiceAgent/VoiceAgentPanel.tsx
import { useState, useEffect, useRef } from 'react'
import type { VoiceState, Transcript } from './useRealtimeVoice'
import s from './VoiceAgent.module.css'

const STATE_LABELS: Record<VoiceState, string> = {
  idle:       '대기 중',
  connecting: '연결 중...',
  listening:  '듣고 있어요 🎤',
  speaking:   '말하는 중 💬',
}

interface Props {
  open: boolean
  voiceState: VoiceState
  transcripts: Transcript[]
  onClose: () => void
}

export default function VoiceAgentPanel({ open, voiceState, transcripts, onClose }: Props) {
  const [showTranscript, setShowTranscript] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showTranscript) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcripts, showTranscript])

  return (
    <div className={`${s.panel} ${open ? '' : s.panelHidden}`}>
      <div className={s.panelHeader}>
        <div className={s.panelTitle}>🎙️ AI 와냥이</div>
        <button className={s.closeBtn} onClick={onClose} aria-label="닫기">✕</button>
      </div>

      <div className={s.statusArea}>
        <div className={`${s.statusIndicator} ${s[`status_${voiceState}`]}`} />
        <div className={s.statusLabel}>{STATE_LABELS[voiceState]}</div>
      </div>

      <div className={s.transcriptToggle}>
        <button
          className={s.toggleBtn}
          onClick={() => setShowTranscript(v => !v)}
        >
          {showTranscript ? '▼' : '▶'} 대화 기록 ({transcripts.length})
        </button>
        {showTranscript && (
          <div className={s.transcriptArea}>
            {transcripts.length === 0 ? (
              <div className={s.emptyTranscript}>대화 내용이 없어요</div>
            ) : (
              transcripts.map(t => (
                <div
                  key={t.ts}
                  className={`${s.transcriptItem} ${t.role === 'user' ? s.transcriptUser : s.transcriptModel}`}
                >
                  <span className={s.transcriptRole}>{t.role === 'user' ? '나' : 'AI'}</span>
                  <span className={s.transcriptText}>{t.text}</span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 타입 체크**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 에러 없음

---

## Task 7 — 프론트: VoiceAgent.tsx 작성 + 커밋 (2분)

**Files:**
- Create: `frontend/src/components/VoiceAgent/VoiceAgent.tsx`

- [ ] **Step 1: VoiceAgent.tsx 작성**

```tsx
// frontend/src/components/VoiceAgent/VoiceAgent.tsx
import { useState, useCallback } from 'react'
import type { RefObject } from 'react'
import type * as Blockly from 'blockly'
import { useRealtimeVoice } from './useRealtimeVoice'
import VoiceAgentToggle from './VoiceAgentToggle'
import VoiceAgentPanel from './VoiceAgentPanel'

interface Props {
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>
  projectTitle: string
}

export default function VoiceAgent({ workspaceRef, projectTitle }: Props) {
  const [open, setOpen] = useState(false)
  const { voiceState, transcripts, connect, disconnect } = useRealtimeVoice(workspaceRef, projectTitle)

  const handleToggle = useCallback(() => {
    if (open) {
      disconnect()
      setOpen(false)
    } else {
      setOpen(true)
      connect().catch(console.error)
    }
  }, [open, connect, disconnect])

  const handleClose = useCallback(() => {
    disconnect()
    setOpen(false)
  }, [disconnect])

  return (
    <>
      <VoiceAgentToggle voiceState={voiceState} onClick={handleToggle} />
      <VoiceAgentPanel
        open={open}
        voiceState={voiceState}
        transcripts={transcripts}
        onClose={handleClose}
      />
    </>
  )
}
```

- [ ] **Step 2: 타입 체크**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add frontend/src/components/VoiceAgent/
git commit -m "feat: VoiceAgent 컴포넌트 구현 — tools/hook/UI (#45)"
```

---

## Task 8 — 프론트: EditorPage에 VoiceAgent 마운트 + 빌드 확인 (2분)

**Files:**
- Modify: `frontend/src/pages/EditorPage/EditorPage.tsx`

- [ ] **Step 1: import 추가**

`EditorPage.tsx` 상단 import 블록 마지막에 추가:
```tsx
import VoiceAgent from '../../components/VoiceAgent/VoiceAgent'
```

- [ ] **Step 2: JSX에 마운트**

`return` 블록 안, `<Toast .../>` 바로 앞에 추가:
```tsx
<VoiceAgent workspaceRef={workspaceRef} projectTitle={projectTitle} />
<Toast visible={toastVisible} message={toastMessage} type={toastType} />
```

- [ ] **Step 3: 타입 체크 + 빌드**

```bash
cd frontend && npx tsc --noEmit && yarn build
```

Expected: 에러 없음, 빌드 성공

- [ ] **Step 4: 커밋**

```bash
git add frontend/src/pages/EditorPage/EditorPage.tsx
git commit -m "feat: EditorPage에 VoiceAgent 마운트 (#45)"
```

---

## Task 9 — 로컬 동작 확인 (2분)

> **사전 조건:** 백엔드 실행 전 `OPENAI_API_KEY` 환경변수 설정 필요
> ```bash
> export OPENAI_API_KEY=sk-...
> cd backend && uvicorn app.main:app --reload
> ```

- [ ] **Step 1: 개발 서버 실행**

```bash
cd frontend && yarn dev
```

- [ ] **Step 2: 브라우저 동작 확인**

1. `http://localhost:5173/editor/new` 접속 (로그인 상태)
2. 우측 하단 🎙️ 주황 버튼 확인
3. 버튼 클릭 → 패널 열림, 마이크 권한 요청
4. 마이크 허용 → 상태 인디케이터가 초록으로 변경 ("듣고 있어요 🎤")
5. 말하면 AI가 음성으로 응답, 인디케이터가 파란색으로 변경 ("말하는 중 💬")
6. 패널 하단 `▶ 대화 기록` 클릭 → 트랜스크립트 텍스트 확인
7. ✕ 버튼 → 패널 닫힘, 마이크 해제
