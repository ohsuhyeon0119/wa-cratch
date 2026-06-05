import { useState, useRef, useCallback, useEffect } from 'react'
import type { RefObject } from 'react'
import * as Blockly from 'blockly'
import client from '../../api/client'
import { TOOL_DECLARATIONS, handleToolCall } from './tools'

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking'
export type Transcript = { role: 'user' | 'model'; text: string; ts: number }

const SYSTEM_PROMPT = `너는 WaCratch 블록 코딩 에디터의 AI 음성 도우미야.
어린이 사용자가 블록 코딩을 배울 수 있도록 친절하고 쉽게 설명해줘. 항상 한국어 반말로 대답해. 존댓말은 절대 쓰지 마.

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
- 블록 코딩 방법, 버그 원인, 다음에 뭘 만들지 등을 친절하게 조언해줘.

## 세션 시작 시
연결되면 짧고 친근하게 인사해. 예: "안녕! 나는 WaCratch 도우미야. 블록 코딩 궁금한 거 있으면 뭐든 물어봐!"`

export function useRealtimeVoice(
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>,
  projectTitle: string,
  nickname: string
) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcripts, setTranscripts] = useState<Transcript[]>([])

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const projectTitleRef = useRef(projectTitle)
  const nicknameRef = useRef(nickname)

  useEffect(() => { projectTitleRef.current = projectTitle }, [projectTitle])
  useEffect(() => { nicknameRef.current = nickname }, [nickname])

  useEffect(() => {
    return () => { cleanup() }
  // cleanup은 ref만 사용하므로 의존성 불필요
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        const instructions = nicknameRef.current
          ? `${SYSTEM_PROMPT}\n\n## 현재 사용자\n닉네임: ${nicknameRef.current}\n인사할 때 이 닉네임을 불러줘.`
          : SYSTEM_PROMPT
        const sessionUpdatePayload = {
          type: 'session.update',
          session: {
            type: 'realtime',
            instructions,
            tools: TOOL_DECLARATIONS,
            tool_choice: 'auto',
          },
        }
        console.log('[VoiceAgent] sending session.update:', JSON.stringify(sessionUpdatePayload, null, 2))
        dc.send(JSON.stringify(sessionUpdatePayload))
        // response.create는 session.updated 이벤트 후에 전송 (아래 onmessage에서 처리)
      }

      let greetingSent = false
      dc.onmessage = (e: MessageEvent) => {
        const event = JSON.parse(e.data as string)
        console.log('[VoiceAgent] server event:', event.type, event)

        if (event.type === 'session.updated') {
          console.log('[VoiceAgent] session.updated — instructions:', event.session?.instructions?.slice(0, 80))
          console.log('[VoiceAgent] session.updated — tools:', event.session?.tools)
          if (!greetingSent) {
            greetingSent = true
            dc.send(JSON.stringify({ type: 'response.create' }))
          }
        }

        if (event.type === 'error') {
          console.error('[VoiceAgent] server error:', event.error)
        }

        if (event.type === 'response.function_call_arguments.done') {
          const result = handleToolCall(
            event.name as string,
            event.arguments as string,
            workspaceRef,
            projectTitleRef.current,
            nicknameRef.current
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
          console.log('[VoiceAgent] user transcript:', event.transcript)
          addTranscript('user', (event.transcript as string) ?? '')
        }
        if (event.type === 'response.audio_transcript.done') {
          console.log('[VoiceAgent] model transcript:', event.transcript)
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
        'https://api.openai.com/v1/realtime/calls',
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
