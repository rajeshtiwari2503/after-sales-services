import { NextRequest, NextResponse } from 'next/server'
import { sendPushNotification } from '@/lib/notifications/push'
import type { PushSubscription } from '@/types/notification'

/* POST /api/notifications/push */
export async function POST(req: NextRequest) {
  try {
    const { subscription, title, message, url } = await req.json() as {
      subscription: PushSubscription
      title:        string
      message:      string
      url?:         string
    }
    if (!subscription || !title || !message) {
      return NextResponse.json({ error: 'subscription, title, message required' }, { status: 400 })
    }
    const result = await sendPushNotification(subscription, { title, message, url })
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* GET /api/notifications/push — return VAPID public key */
export async function GET() {
  return NextResponse.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' })
}