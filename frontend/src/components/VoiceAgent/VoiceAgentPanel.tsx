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
