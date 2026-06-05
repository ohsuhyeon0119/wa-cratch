import type { VoiceState } from './useRealtimeVoice'
import s from './VoiceAgent.module.css'

const STATE_LABELS: Record<VoiceState, string | null> = {
  idle:       null,
  connecting: '연결 중',
  listening:  '듣는 중',
  speaking:   '말하는 중',
}

const BTN_CLASS: Record<VoiceState, string> = {
  idle:       s.btnIdle,
  connecting: s.btnConnecting,
  listening:  s.btnListening,
  speaking:   s.btnSpeaking,
}

const ICONS: Record<VoiceState, string> = {
  idle:       '🎙️',
  connecting: '🎙️',
  listening:  '🎙️',
  speaking:   '🔊',
}

interface Props {
  voiceState: VoiceState
  onClick: () => void
}

export default function VoiceAgentToggle({ voiceState, onClick }: Props) {
  const label = STATE_LABELS[voiceState]

  return (
    <div className={s.widget}>
      <div className={`${s.stateLabel} ${label ? s.stateLabelVisible : ''}`}>
        {label ?? ''}
      </div>
      <div className={`${s.btnWrap} ${s[voiceState]}`}>
        <div className={s.ring} />
        <div className={s.ring} />
        <button
          className={`${s.btn} ${BTN_CLASS[voiceState]}`}
          onClick={onClick}
          aria-label={`AI 와냥이 ${label ?? '시작'}`}
          title="AI 와냥이와 대화하기"
        >
          {ICONS[voiceState]}
        </button>
      </div>
    </div>
  )
}
