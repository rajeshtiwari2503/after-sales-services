import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/notifications/email'
import type { EmailNotificationPayload } from '@/types/notification'

/* POST /api/notifications/email */
export async function POST(req: NextRequest) {
  try {
    const body: EmailNotificationPayload = await req.json()
    if (!body.to || !body.subject) {
      return NextResponse.json({ error: 'to and subject required' }, { status: 400 })
    }
    const result = await sendEmail(body)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}