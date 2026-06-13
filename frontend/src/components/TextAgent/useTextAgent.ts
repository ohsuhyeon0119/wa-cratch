import { useState, useCallback, useRef, useEffect } from 'react'
import type { RefObject } from 'react'
import * as Blockly from 'blockly'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
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
) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // 마운트 시 서버에서 대화 히스토리 불러오기
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch(`${API_BASE}/agent/history`, { headers: authHeaders() })
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
      .catch(() => {/* 히스토리 로드 실패는 조용히 무시 */})
  }, [])

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

    abortRef.current = new AbortController()

    try {
      const res = await fetch(`${API_BASE}/agent/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          message: text,
          project_context: { title: projectTitle, blocks_json: blocksJson },
          nickname,
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
          // SSE 프로토콜 공백 1개만 제거, 내용의 leading space 보존, \r 제거
          const raw = line.slice(5)
          const chunk = (raw.startsWith(' ') ? raw.slice(1) : raw).trimEnd()
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
  }, [isLoading, workspaceRef, projectTitle, nickname])

  return { messages, isLoading, sendMessage }
}
