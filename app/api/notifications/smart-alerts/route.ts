import { NextRequest, NextResponse } from 'next/server'
import { FeedbackService } from '@/services/feedback.service'
import { NotificationService } from '@/services/notification.service'
import { runSmartAlerts, buildNotificationFromAlert } from '@/lib/ai/smart-alert-engine'

/* GET /api/notifications/smart-alerts
   Scans pending feedback and fires any un-notified alerts */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || process.env.ADMIN_USER_ID || 'admin'
    const { data } = await FeedbackService.list({ page: 1, limit: 100, status: 'pending' })

    const created: unknown[] = []
    for (const feedback of data) {
      const alerts = runSmartAlerts(feedback)
      for (const alert of alerts) {
        const notifData = buildNotificationFromAlert(alert, userId)
        const notif     = await NotificationService.create(notifData as any)
        created.push(notif)
      }
    }

    return NextResponse.json({ processed: data.length, alertsCreated: created.length, alerts: created })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* POST /api/notifications/smart-alerts — run for a single feedbackId */
export async function POST(req: NextRequest) {
  try {
    const { feedbackId, userId } = await req.json()
    if (!feedbackId) return NextResponse.json({ error: 'feedbackId required' }, { status: 400 })

    const feedback = await FeedbackService.findById(feedbackId)
    if (!feedback)  return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })

    const targetUser = userId || process.env.ADMIN_USER_ID || 'admin'
    const alerts     = runSmartAlerts(feedback)
    const created    = await Promise.all(
      alerts.map(a => NotificationService.create(buildNotificationFromAlert(a, targetUser) as any))
    )

    return NextResponse.json({ alerts: created })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}