import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsApp } from '@/lib/notifications/whatsapp'
import type { WhatsAppPayload } from '@/types/notification'

/* POST /api/notifications/whatsapp */
export async function POST(req: NextRequest) {
  try {
    const body: WhatsAppPayload = await req.json()
    if (!body.phone || !body.message) {
      return NextResponse.json({ error: 'phone and message required' }, { status: 400 })
    }
    const result = await sendWhatsApp(body)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}