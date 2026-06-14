import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Message, BlockAction } from './useTextAgent'
import s from './TextAgent.module.css'

const ACTION_LABEL: Record<BlockAction['type'], string> = {
  set_blocks: '블록 교체',
  append_blocks: '블록 추가',
  clear_workspace: '워크스페이스 초기화',
}

interface Props {
  messages: Message[]
  isLoading: boolean
  pendingAction: BlockAction | null
  onSend: (text: string) => void
  onClose: () => void
  onApply: () => void
  onReject: () => void
}

export default function TextAgentPanel({ messages, isLoading, pendingAction, onSend, onClose, onApply, onReject }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingAction])

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

        {/* Human-in-the-loop 확인 카드 */}
        {pendingAction && (
          <div className={s.actionCard}>
            <p className={s.actionLabel}>
              🔧 <strong>{ACTION_LABEL[pendingAction.type]}</strong> 대기 중
            </p>
            <div className={s.actionBtns}>
              <button className={s.rejectBtn} onClick={onReject}>✕ 취소</button>
              <button className={s.applyBtn} onClick={onApply}>✓ 블록 적용하기</button>
            </div>
          </div>
        )}

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
