'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function APIAccessPage() {
  const [form, setForm] = useState({ name: '', org: '', use_case: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Submission failed. Please try again.')
      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Request received</h2>
          <p className="text-muted-foreground text-sm">
            We&apos;ll review your application and get back to you within a few business days.
          </p>
          <Link href="/" className="text-sm text-primary underline">Back to AidGraph</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-lg mx-auto space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">API Access</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Get programmatic access to AidGraph&apos;s database of 8M+ nonprofits. Ideal for platforms,
            researchers, and grantmakers building on top of our data.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'name', label: 'Your name', placeholder: 'Jane Smith', required: true },
            { id: 'org', label: 'Organization (optional)', placeholder: 'Acme Foundation', required: false },
            { id: 'email', label: 'Work email', placeholder: 'jane@example.com', required: true, type: 'email' },
          ].map(({ id, label, placeholder, required, type }) => (
            <div key={id}>
              <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
              <input
                type={type ?? 'text'}
                required={required}
                value={form[id as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-lg bg-card border border-border/60 text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">How will you use the API?</label>
            <textarea
              required
              rows={4}
              value={form.use_case}
              onChange={(e) => setForm((f) => ({ ...f, use_case: e.target.value }))}
              placeholder="Describe your use case..."
              className="w-full px-3 py-2.5 rounded-lg bg-card border border-border/60 text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors resize-none"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {loading ? 'Submitting...' : 'Request API access'}
          </Button>
        </form>
      </div>
    </div>
  )
}
