import { useState, useCallback } from 'react'
import type { RefObject } from 'react'
import type * as Blockly from 'blockly'
import { useRealtimeVoice } from './useRealtimeVoice'
import { useAuth } from '../../context/AuthContext'
import VoiceAgentToggle from './VoiceAgentToggle'

interface Props {
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>
  projectTitle: string
}

export default function VoiceAgent({ workspaceRef, projectTitle }: Props) {
  const [active, setActive] = useState(false)
  const { user } = useAuth()
  const { voiceState, connect, disconnect } = useRealtimeVoice(workspaceRef, projectTitle, user?.nickname ?? '')

  const handleToggle = useCallback(() => {
    if (active) {
      disconnect()
      setActive(false)
    } else {
      setActive(true)
      connect().catch(console.error)
    }
  }, [active, connect, disconnect])

  return <VoiceAgentToggle voiceState={voiceState} onClick={handleToggle} />
}
