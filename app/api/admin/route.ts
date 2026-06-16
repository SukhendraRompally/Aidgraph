import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''
const ADMIN_COOKIE = 'ag_admin_token'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// POST /api/admin — verify password, set cookie
export async function POST(req: Request) {
  const { password } = await req.json()
  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, ADMIN_PASSWORD, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })
  return res
}

// GET /api/admin — return dashboard data
export async function GET(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!ADMIN_PASSWORD || token !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = adminClient()

  // All users from auth
  const { data: { users } } = await sb.auth.admin.listUsers({ perPage: 500 })

  // All threads with user email + messages
  const { data: threads } = await sb
    .from('threads')
    .select('id, title, created_at, updated_at, user_id, messages(role, content, created_at)')
    .order('updated_at', { ascending: false })
    .limit(200)

  // All query logs (anon + authenticated)
  const { data: queryLogs } = await sb
    .from('query_logs')
    .select('id, user_id, query, answer, filters, result_count, web_search_triggered, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  // Daily active users: count distinct user_ids per day from query_logs
  const { data: dailyActivity } = await sb
    .from('query_logs')
    .select('user_id, created_at')
    .order('created_at', { ascending: false })

  // Build user map: id → email
  const userMap: Record<string, string> = {}
  for (const u of users ?? []) {
    userMap[u.id] = u.email ?? u.id
  }

  // Group daily active users (from query_logs, includes anon as null)
  const dauMap: Record<string, Set<string>> = {}
  for (const row of dailyActivity ?? []) {
    const day = row.created_at.slice(0, 10)
    if (!dauMap[day]) dauMap[day] = new Set()
    dauMap[day].add(row.user_id ?? 'anon')
  }
  const dau = Object.entries(dauMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 30)
    .map(([date, ids]) => ({ date, count: ids.size }))

  // Enrich threads with email
  const enrichedThreads = (threads ?? []).map(t => ({
    ...t,
    email: userMap[t.user_id] ?? 'unknown',
  }))

  // Signups by day
  const signupMap: Record<string, number> = {}
  for (const u of users ?? []) {
    const day = (u.created_at ?? '').slice(0, 10)
    if (day) signupMap[day] = (signupMap[day] ?? 0) + 1
  }
  const signups = Object.entries(signupMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 30)
    .map(([date, count]) => ({ date, count }))

  // Enrich query logs with email
  const enrichedLogs = (queryLogs ?? []).map(q => ({
    ...q,
    email: q.user_id ? (userMap[q.user_id] ?? 'unknown') : 'anonymous',
  }))

  return NextResponse.json({
    totalUsers: users?.length ?? 0,
    totalQueries: queryLogs?.length ?? 0,
    signups,
    dau,
    threads: enrichedThreads,
    queryLogs: enrichedLogs,
  })
}
