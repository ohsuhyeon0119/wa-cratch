import { useState, useCallback, useRef } from 'react'
import type { RefObject } from 'react'
import * as Blockly from 'blockly'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const API_BASE = 'http://localhost:8000'

export function useTextAgent(
  workspaceRef: RefObject<Blockly.WorkspaceSvg | null>,
  projectTitle: string,
  nickname: string,
) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '' }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsLoading(true)

    const workspace = workspaceRef.current
    const blocksJson = workspace
      ? Blockly.serialization.workspaces.save(workspace)
      : {}

    const history = messages.map(m => ({ role: m.role, content: m.content }))

    abortRef.current = new AbortController()

    try {
      const token = localStorage.getItem('token') ?? ''
      const res = await fetch(`${API_BASE}/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          history,
          project_context: { title: projectTitle, blocks_json: blocksJson },
          nickname,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const lines = decoder.decode(value, { stream: true }).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const chunk = line.slice(5).trimStart()
          if (chunk === '[DONE]') break
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
  }, [isLoading, messages, workspaceRef, projectTitle, nickname])

  return { messages, isLoading, sendMessage }
}
