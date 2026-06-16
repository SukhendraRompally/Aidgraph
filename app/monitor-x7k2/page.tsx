'use client'
import { useState, useEffect } from 'react'

type DayCount = { date: string; count: number }
type Message = { role: string; content: string; created_at: string }
type Thread = {
  id: string
  title: string
  email: string
  created_at: string
  updated_at: string
  messages: Message[]
}
type QueryLog = {
  id: string
  email: string
  query: string
  answer: string | null
  filters: Record<string, unknown> | null
  result_count: number
  web_search_triggered: boolean
  created_at: string
}
type DashboardData = {
  totalUsers: number
  totalQueries: number
  signups: DayCount[]
  dau: DayCount[]
  threads: Thread[]
  queryLogs: QueryLog[]
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [logSearch, setLogSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'queries' | 'threads'>('queries')

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthed(true)
      loadData()
    } else {
      setAuthError('Wrong password')
    }
  }

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin')
      if (res.status === 401) { setAuthed(false); return }
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Try loading data on mount in case cookie already exists
    fetch('/api/admin').then(r => {
      if (r.ok) { setAuthed(true); r.json().then(setData) }
    })
  }, [])

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <form onSubmit={login} className="flex flex-col gap-4 w-80">
          <h1 className="text-xl font-semibold text-center">AidGraph Monitor</h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
          <button
            type="submit"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:opacity-90 transition"
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    )
  }

  const filteredThreads = data.threads.filter(t =>
    !search ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.messages.some(m => m.content.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AidGraph Monitor</h1>
        <button
          onClick={loadData}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total users" value={data.totalUsers} />
        <StatCard label="Total queries" value={data.totalQueries} />
        <StatCard label="Active today" value={data.dau[0]?.date === today() ? data.dau[0].count : 0} />
        <StatCard label="Signups today" value={data.signups[0]?.date === today() ? data.signups[0].count : 0} />
      </div>

      {/* Signups by day */}
      <Section title="New signups (last 30 days)">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground border-b border-border">
            <th className="pb-2">Date</th><th className="pb-2">Signups</th>
          </tr></thead>
          <tbody>
            {data.signups.map(r => (
              <tr key={r.date} className="border-b border-border/40">
                <td className="py-1.5">{r.date}</td>
                <td className="py-1.5 font-medium">{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* DAU */}
      <Section title="Active users per day (last 30 days)">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground border-b border-border">
            <th className="pb-2">Date</th><th className="pb-2">Active users</th>
          </tr></thead>
          <tbody>
            {data.dau.map(r => (
              <tr key={r.date} className="border-b border-border/40">
                <td className="py-1.5">{r.date}</td>
                <td className="py-1.5 font-medium">{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['queries', 'threads'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === tab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab === 'queries' ? `All queries (${data.queryLogs.length})` : `Threads (${data.threads.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'queries' && (
        <Section title="">
          <input
            type="text"
            placeholder="Search by email or query…"
            value={logSearch}
            onChange={e => setLogSearch(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2 bg-card text-foreground text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="space-y-2">
            {data.queryLogs
              .filter(q => !logSearch || q.email.includes(logSearch) || q.query.toLowerCase().includes(logSearch.toLowerCase()))
              .map(q => (
                <div key={q.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    className="w-full text-left px-4 py-3 flex justify-between items-start hover:bg-card/50 transition"
                    onClick={() => setExpandedLog(expandedLog === q.id ? null : q.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{q.query}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex gap-2 flex-wrap">
                        <span className={q.email === 'anonymous' ? 'text-orange-400' : ''}>{q.email}</span>
                        <span>·</span>
                        <span>{new Date(q.created_at).toLocaleString()}</span>
                        <span>·</span>
                        <span>{q.result_count} results</span>
                        {q.web_search_triggered && <span className="text-blue-400">· web search</span>}
                        {q.filters && Object.keys(q.filters).length > 0 && <span className="text-green-400">· filtered</span>}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs mt-1 ml-2">{expandedLog === q.id ? '▲' : '▼'}</span>
                  </button>
                  {expandedLog === q.id && q.answer && (
                    <div className="border-t border-border px-4 py-3 text-sm bg-card space-y-3">
                      {q.filters && Object.keys(q.filters).length > 0 && (
                        <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                          filters: {JSON.stringify(q.filters)}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{q.answer}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </Section>
      )}

      {activeTab === 'threads' && (
        <Section title="">
          <input
            type="text"
            placeholder="Search by email, title, or message content…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-border rounded-lg px-4 py-2 bg-card text-foreground text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="space-y-2">
            {filteredThreads.map(t => (
              <div key={t.id} className="border border-border rounded-lg overflow-hidden">
                <button
                  className="w-full text-left px-4 py-3 flex justify-between items-start hover:bg-card/50 transition"
                  onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                >
                  <div>
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.email} · {new Date(t.updated_at).toLocaleString()} · {t.messages.length} messages
                    </p>
                  </div>
                  <span className="text-muted-foreground text-xs mt-1">{expanded === t.id ? '▲' : '▼'}</span>
                </button>
                {expanded === t.id && (
                  <div className="border-t border-border divide-y divide-border/40">
                    {t.messages.map((m, i) => (
                      <div key={i} className={`px-4 py-3 text-sm ${m.role === 'user' ? 'bg-primary/5' : 'bg-card'}`}>
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{m.role}</p>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="border border-border rounded-xl p-4 bg-card">{children}</div>
    </div>
  )
}
