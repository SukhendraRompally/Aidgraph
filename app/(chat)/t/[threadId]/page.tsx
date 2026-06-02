import { notFound, redirect } from 'next/navigation'
import { ChatPage } from '@/components/ChatPage'
import type { Message } from '@/components/ChatPage'
import { createClient } from '@/lib/supabase-server'

type Props = { params: Promise<{ threadId: string }> }

export default async function ThreadPage({ params }: Props) {
  const { threadId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: thread } = await supabase
    .from('threads')
    .select('id')
    .eq('id', threadId)
    .eq('user_id', user.id)
    .single()

  if (!thread) notFound()

  const { data: dbMessages } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  const initialMessages: Message[] = (dbMessages ?? []).map(m => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  return <ChatPage threadId={threadId} initialMessages={initialMessages} />
}
