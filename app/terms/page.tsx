import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Terms of Service — AidGraph' }

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: June 2025</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using AidGraph (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">2. Description of Service</h2>
            <p>AidGraph provides an AI-powered research interface for querying nonprofit organization data. The Service is intended for due diligence, research, and informational purposes only.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">3. Data Accuracy</h2>
            <p>AidGraph aggregates publicly available data about nonprofit organizations. We do not guarantee the accuracy, completeness, or timeliness of any information provided. You should verify critical information through official sources before making decisions.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">4. Acceptable Use</h2>
            <p>You may not use the Service to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Scrape, harvest, or systematically extract data without authorization</li>
              <li>Reproduce or redistribute data for commercial purposes without an API license</li>
              <li>Attempt to circumvent rate limits or access controls</li>
              <li>Use the Service for any unlawful purpose</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">5. API Access</h2>
            <p>Programmatic access to AidGraph data requires a separate API license. To apply, visit our <Link href="/api-access" className="text-primary underline">API Access page</Link>. Unauthorized API usage may result in account termination.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">6. Disclaimer of Warranties</h2>
            <p>The Service is provided &quot;as is&quot; without warranty of any kind. AidGraph makes no warranties about the suitability, reliability, or accuracy of the Service for any purpose.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">7. Limitation of Liability</h2>
            <p>AidGraph shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount paid by you for the Service in the prior 12 months.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">8. Changes to Terms</h2>
            <p>We may modify these Terms at any time. Continued use of the Service constitutes acceptance of the updated Terms. We will notify users of material changes by email.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">9. Contact</h2>
            <p>For questions about these Terms, <Link href="/contact" className="text-primary underline">contact us here</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
