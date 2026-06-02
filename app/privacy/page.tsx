import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Privacy Policy — AidGraph' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: June 2025</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account (email, password) and information generated through your use of the Service (search queries, conversation history).</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>To provide and improve the Service</li>
              <li>To save your research threads and conversation history</li>
              <li>To communicate with you about the Service</li>
              <li>To detect and prevent abuse</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">3. Data Storage</h2>
            <p>Your account data and conversation history are stored securely via Supabase. Queries are sent to our AI inference infrastructure to generate responses. We do not sell your personal data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">4. Data Retention</h2>
            <p>We retain your data for as long as your account is active. You may delete your account and all associated data at any time by contacting us.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">5. Contact</h2>
            <p>For privacy inquiries, <Link href="/contact" className="text-primary underline">contact us here</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
