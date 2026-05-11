 import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/services/notification.service'

/* POST /api/notifications/read — mark specific IDs as read */
export async function POST(req: NextRequest) {
  try {
    const { ids, userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    if (ids && Array.isArray(ids)) {
      const count = await NotificationService.markRead(ids, userId)
      return NextResponse.json({ updated: count })
    }
    // mark all
    const count = await NotificationService.markAllRead(userId)
    return NextResponse.json({ updated: count })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}