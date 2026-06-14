import { useState, useCallback, useRef, useEffect } from 'react'
import type { RefObject } from 'react'
import * as Blockly from 'blockly'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface BlockAction {
  type: 'set_blocks' | 'append_blocks' | 'clear_workspace'
  xml: string | null
  sprite_name: string | null
}

const API_BASE = 'http://localhost:8000'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token') ?? ''
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export function useTextAgent(
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>,
  projectTitle: string,
  nickname: string,
  projectId: string,
) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<BlockAction | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // 저장된 프로젝트(실제 UUID)의 대화 히스토리만 불러오기
  useEffect(() => {
    setMessages([])
    const token = localStorage.getItem('token')
    if (!token || projectId === 'new') return

    fetch(`${API_BASE}/agent/history?project_id=${encodeURIComponent(projectId)}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then((data: { messages: Array<{ role: string; content: string }> } | null) => {
        if (!data?.messages?.length) return
        setMessages(
          data.messages.map(m => ({
            id: crypto.randomUUID(),
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))
        )
      })
      .catch(() => {})
  }, [projectId])

  const applyPendingAction = useCallback(() => {
    const workspace = workspaceRef.current
    if (!pendingAction || !workspace) return

    try {
      if (pendingAction.type === 'set_blocks' && pendingAction.xml) {
        workspace.clear()
        Blockly.Xml.domToWorkspace(
          Blockly.utils.xml.textToDom(pendingAction.xml),
          workspace,
        )
      } else if (pendingAction.type === 'append_blocks' && pendingAction.xml) {
        Blockly.Xml.domToWorkspace(
          Blockly.utils.xml.textToDom(pendingAction.xml),
          workspace,
        )
      } else if (pendingAction.type === 'clear_workspace') {
        workspace.clear()
      }
    } catch (err) {
      console.error('[TextAgent] 블록 적용 실패:', err)
    }
    setPendingAction(null)
  }, [pendingAction, workspaceRef])

  const rejectPendingAction = useCallback(() => {
    setPendingAction(null)
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsLoading(true)
    setPendingAction(null)

    const workspace = workspaceRef.current
    const blocksJson = workspace
      ? Blockly.serialization.workspaces.save(workspace)
      : {}

    abortRef.current = new AbortController()

    try {
      const res = await fetch(`${API_BASE}/agent/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          message: text,
          project_context: { title: projectTitle, blocks_json: blocksJson },
          nickname,
          project_id: projectId,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value, { stream: true }).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const raw = line.slice(5)
          const chunk = (raw.startsWith(' ') ? raw.slice(1) : raw).trimEnd()
          if (chunk === '[DONE]') break

          // ACTION 이벤트: 텍스트에 추가하지 않고 pendingAction 상태로 저장
          if (chunk.startsWith('ACTION:')) {
            try {
              const action = JSON.parse(chunk.slice(7)) as BlockAction
              setPendingAction(action)
            } catch {
              console.error('[TextAgent] ACTION 파싱 실패:', chunk)
            }
            continue
          }

          if (chunk) {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsg.id
                  ? { ...m, content: m.content + chunk }
                  : m
              )
            )
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id
              ? { ...m, content: '오류가 발생했어. 다시 시도해줘!' }
              : m
          )
        )
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [isLoading, workspaceRef, projectTitle, nickname, projectId])

  return { messages, isLoading, pendingAction, sendMessage, applyPendingAction, rejectPendingAction }
}
