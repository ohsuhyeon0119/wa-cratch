import { useState } from 'react'
import type { RefObject } from 'react'
import type * as Blockly from 'blockly'
import { useAuth } from '../../context/AuthContext'
import { useTextAgent } from './useTextAgent'
import TextAgentPanel from './TextAgentPanel'
import s from './TextAgent.module.css'

interface Props {
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>
  projectTitle: string
}

export default function TextAgent({ workspaceRef, projectTitle }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const { messages, isLoading, sendMessage } = useTextAgent(
    workspaceRef,
    projectTitle,
    user?.nickname ?? '',
  )

  return (
    <div className={s.widget}>
      {isOpen && (
        <TextAgentPanel
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onClose={() => setIsOpen(false)}
        />
      )}
      <button
        className={`${s.toggleBtn} ${isOpen ? s.toggleBtnActive : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="AI 와냥이 채팅 열기"
        title="AI 와냥이와 대화하기"
      >
        💬
      </button>
    </div>
  )
}
