import { createClient } from '@/lib/supabase-server'
import { sendEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, email, question } = await req.json()
  if (!name || !email || !question) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()
  await supabase.from('contact_messages').insert({ name, email, question })

  await sendEmail(
    `AidGraph Contact: ${name}`,
    `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
     <p><strong>Question:</strong></p>
     <p>${question.replace(/\n/g, '<br>')}</p>`
  )

  return NextResponse.json({ ok: true })
}
