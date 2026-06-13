import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Message } from './useTextAgent'
import s from './TextAgent.module.css'

interface Props {
  messages: Message[]
  isLoading: boolean
  onSend: (text: string) => void
  onClose: () => void
}

export default function TextAgentPanel({ messages, isLoading, onSend, onClose }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    onSend(text)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={s.panel}>
      <div className={s.panelHeader}>
        <span className={s.panelTitle}>🐱 와냥이</span>
        <button className={s.closeBtn} onClick={onClose} aria-label="닫기">✕</button>
      </div>

      <div className={s.messageList}>
        {messages.length === 0 && (
          <p className={s.emptyHint}>안녕! 나는 와냥이야! 뭐든 물어봐 😸</p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`${s.bubble} ${msg.role === 'user' ? s.userBubble : s.assistantBubble}`}>
            {msg.content || (msg.role === 'assistant' && isLoading ? <span className={s.typing}>…</span> : null)}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={s.inputRow}>
        <textarea
          className={s.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요 (Enter 전송)"
          rows={1}
          disabled={isLoading}
          aria-label="메시지 입력"
        />
        <button
          className={s.sendBtn}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          aria-label="전송"
        >
          전송
        </button>
      </div>
    </div>
  )
}
