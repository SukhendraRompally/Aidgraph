import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: thread } = await supabase
    .from('threads')
    .select('id')
    .eq('id', threadId)
    .eq('user_id', user.id)
    .single()
  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: thread } = await supabase
    .from('threads')
    .select('id')
    .eq('id', threadId)
    .eq('user_id', user.id)
    .single()
  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { messages } = await req.json()
  const rows = (messages as { role: string; content: string }[]).map((m) => ({
    thread_id: threadId,
    role: m.role,
    content: m.content,
  }))

  await supabase.from('messages').delete().eq('thread_id', threadId)
  const { error } = await supabase.from('messages').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase
    .from('threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', threadId)

  return NextResponse.json({ ok: true })
}
