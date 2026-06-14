import { useState, useEffect } from 'react'
import type { RefObject } from 'react'
import type * as Blockly from 'blockly'
import { useAuth } from '../../context/AuthContext'
import { useTextAgent } from './useTextAgent'
import type { BlockAction } from './useTextAgent'
import TextAgentPanel from './TextAgentPanel'
import s from './TextAgent.module.css'

interface Props {
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>
  projectTitle: string
  onPendingActionChange: (action: BlockAction | null) => void
}

export default function TextAgent({ workspaceRef, projectTitle, onPendingActionChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const { messages, isLoading, pendingAction, sendMessage, applyPendingAction, rejectPendingAction } = useTextAgent(
    workspaceRef,
    projectTitle,
    user?.nickname ?? '',
  )

  useEffect(() => {
    onPendingActionChange(pendingAction)
  }, [pendingAction, onPendingActionChange])

  return (
    <div className={s.widget}>
      {isOpen && (
        <TextAgentPanel
          messages={messages}
          isLoading={isLoading}
          pendingAction={pendingAction}
          onSend={sendMessage}
          onClose={() => setIsOpen(false)}
          onApply={applyPendingAction}
          onReject={rejectPendingAction}
        />
      )}
      <button
        className={`${s.toggleBtn} ${isOpen ? s.toggleBtnActive : ''} ${pendingAction ? s.toggleBtnPending : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="AI 와냥이 채팅 열기"
        title="AI 와냥이와 대화하기"
      >
        {pendingAction ? '🔧' : '💬'}
      </button>
    </div>
  )
}
