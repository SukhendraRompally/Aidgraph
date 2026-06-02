import { createClient } from '@/lib/supabase-server'
import { sendEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, org, use_case, email } = await req.json()
  if (!name || !use_case || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()
  await supabase.from('api_requests').insert({ name, org, use_case, email })

  await sendEmail(
    `AidGraph API Request: ${name}`,
    `<p><strong>Name:</strong> ${name}</p>
     <p><strong>Email:</strong> ${email}</p>
     ${org ? `<p><strong>Org:</strong> ${org}</p>` : ''}
     <p><strong>Use case:</strong></p>
     <p>${use_case.replace(/\n/g, '<br>')}</p>`
  )

  return NextResponse.json({ ok: true })
}
