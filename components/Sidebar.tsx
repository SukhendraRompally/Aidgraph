'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, MessageSquare, Trash2 } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { cn } from '@/lib/utils'

type Thread = { id: string; title: string; updated_at: string }

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const currentThreadId = params?.threadId as string | undefined
  const [threads, setThreads] = useState<Thread[]>([])

  const fetchThreads = () => {
    if (!user) { setThreads([]); return }
    fetch('/api/threads')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setThreads(data))
  }

  useEffect(() => {
    fetchThreads()
  }, [user])

  // Re-fetch thread list when ChatPage creates a new thread
  useEffect(() => {
    window.addEventListener('thread-created', fetchThreads)
    return () => window.removeEventListener('thread-created', fetchThreads)
  }, [user])

  const handleNewThread = () => {
    // Use a timestamp param so Next.js sees a real navigation and remounts ChatPage
    router.push(`/?t=${Date.now()}`)
    onNavigate?.()
  }

  const deleteThread = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    await fetch(`/api/threads/${id}`, { method: 'DELETE' })
    setThreads(prev => prev.filter(t => t.id !== id))
    if (currentThreadId === id) handleNewThread()
  }

  return (
    <aside className="flex flex-col w-64 border-r border-border/40 bg-sidebar min-h-0">
      <div className="p-3 shrink-0">
        <button
          onClick={handleNewThread}
          className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Plus className="h-4 w-4 shrink-0" />
          New thread
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 min-h-0">
        {!user && (
          <p className="px-3 py-4 text-xs text-muted-foreground text-center leading-relaxed">
            Sign in to save and<br />revisit research threads
          </p>
        )}
        {threads.map(thread => (
          <div key={thread.id} className="group relative">
            <Link
              href={`/t/${thread.id}`}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent pr-8',
                currentThreadId === thread.id && 'bg-sidebar-accent'
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              <span className="truncate">{thread.title || 'Untitled'}</span>
            </Link>
            <button
              onClick={e => deleteThread(e, thread.id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Delete thread"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="shrink-0 p-3 border-t border-border/40 flex gap-4">
        <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
        <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
        <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
        <Link href="/api-access" className="text-xs text-muted-foreground hover:text-foreground transition-colors">API</Link>
      </div>
    </aside>
  )
}
