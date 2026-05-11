 import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/services/notification.service'

/* GET /api/notifications/preferences?userId=xxx */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const prefs  = await NotificationService.getPreferences(userId)
    return NextResponse.json(prefs || {})
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* PUT /api/notifications/preferences */
export async function PUT(req: NextRequest) {
  try {
    const body   = await req.json()
    if (!body.userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const prefs  = await NotificationService.upsertPreferences(body.userId, body)
    return NextResponse.json(prefs)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}