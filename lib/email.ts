const RESEND_API_KEY = process.env.RESEND_API_KEY
const TO = 'sukhendrarompally@gmail.com'
const FROM = 'AidGraph <onboarding@resend.dev>'

export async function sendEmail(subject: string, html: string) {
  if (!RESEND_API_KEY) return // silently skip if key not configured
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [TO], subject, html }),
  })
}
