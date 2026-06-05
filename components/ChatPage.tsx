'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'
import { AuthGate } from './AuthGate'

const QUERY_COUNT_KEY = 'aidgraph_query_count'
const FREE_LIMIT = 3

const SUGGESTIONS = [
  'Food banks and hunger relief organizations in Chicago',
  'Senior focused nonprofits in Canada',
  'Environmental nonprofits in California with over $1M revenue',
  'Largest animal welfare organizations in the US by assets',
]

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  note?: string
  error?: boolean
}

type ChatPageProps = {
  threadId?: string
  initialMessages?: Message[]
}

let msgId = 0
const uid = () => `m${++msgId}`

export function ChatPage({ threadId: initialThreadId, initialMessages = [] }: ChatPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [threadId, setThreadId] = useState(initialThreadId)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamPhase, setStreamPhase] = useState('')
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [queryCount, setQueryCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (!user) {
      setQueryCount(parseInt(localStorage.getItem(QUERY_COUNT_KEY) || '0'))
    }
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    if (!streaming) { setStreamPhase(''); return }
    setStreamPhase('Analyzing your request…')
    const t1 = setTimeout(() => setStreamPhase('Searching details…'), 1500)
    const t2 = setTimeout(() => setStreamPhase('Formatting response…'), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [streaming])

  const saveMessages = useCallback(async (tid: string, msgs: Message[]) => {
    if (isSavingRef.current) return
    isSavingRef.current = true
    try {
      await fetch(`/api/messages/${tid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs.map(m => ({ role: m.role, content: m.content })) }),
      })
    } finally {
      isSavingRef.current = false
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || streaming) return
    if (!user && queryCount >= FREE_LIMIT) { setShowAuthGate(true); return }

    const userMsg: Message = { id: uid(), role: 'user', content: input.trim() }
    const assistantId = uid()
    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }])
    setInput('')
    setStreaming(true)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    const history = [...messages, userMsg].map(m => ({
      id: m.id,
      role: m.role,
      parts: [{ type: 'text', text: m.content }],
    }))

    let fullText = ''
    let noteText: string | undefined

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: ctrl.signal,
      })

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') break
          try {
            const event = JSON.parse(raw)
            if (event.type === 'note') {
              noteText = event.value
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, note: noteText } : m)
              )
            } else if (event.type === 'text' && event.value) {
              fullText += event.value
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m)
              )
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m => m.id === assistantId
            ? { ...m, content: 'Something went wrong — please try again.', error: true }
            : m
          )
        )
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }

    if (!user) {
      const newCount = queryCount + 1
      setQueryCount(newCount)
      localStorage.setItem(QUERY_COUNT_KEY, newCount.toString())
      if (newCount >= FREE_LIMIT) setShowAuthGate(true)
    } else {
      const allMsgs = [...messages, userMsg, { id: assistantId, role: 'assistant' as const, content: fullText, note: noteText }]
      let tid = threadId
      if (!tid) {
        const title = userMsg.content.slice(0, 70)
        const r = await fetch('/api/threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        })
        const { id } = await r.json()
        tid = id
        setThreadId(id)
        window.dispatchEvent(new CustomEvent('thread-created'))
      }
      await saveMessages(tid!, allMsgs)
    }
  }, [input, streaming, user, queryCount, messages, threadId, router, saveMessages])

  const handleStop = () => {
    abortRef.current?.abort()
    setStreaming(false)
  }

  const isEmpty = messages.length === 0
  const remaining = FREE_LIMIT - queryCount

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 sm:gap-8 px-4 py-8 sm:py-12">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">
                Research any <span className="text-primary">nonprofit</span> in the world.
              </h1>
              <p className="text-muted-foreground text-sm max-w-xs sm:max-w-sm mx-auto">
                8M+ organizations across 80 countries — missions, financials, governance, and more.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-border/50 bg-card/50 hover:border-primary/40 hover:bg-card transition-all text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {streaming && messages[messages.length - 1]?.content === '' && streamPhase && (
              <div className="flex items-center gap-2.5 px-1 py-1 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse shrink-0" />
                {streamPhase}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
        <div className="max-w-3xl mx-auto space-y-2">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onStop={handleStop}
            disabled={streaming}
            streaming={streaming}
            placeholder="Ask about any nonprofit..."
          />
          {!user && (
            <p className="text-center text-xs text-muted-foreground">
              {remaining > 0 ? (
                <><span className="text-accent font-medium">{remaining}</span> free {remaining === 1 ? 'query' : 'queries'} remaining — </>
              ) : 'Free queries used — '}
              <button onClick={() => router.push('/login')} className="underline underline-offset-2 hover:text-foreground transition-colors">
                sign in for unlimited access
              </button>
            </p>
          )}
        </div>
      </div>

      {showAuthGate && <AuthGate />}
    </div>
  )
}
