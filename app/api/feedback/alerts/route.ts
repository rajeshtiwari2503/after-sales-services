 import { NextRequest, NextResponse } from 'next/server'
import { FeedbackService } from '@/services/feedback.service'
import { runSmartAlerts } from '@/lib/ai/smart-alert-engine'

/* GET /api/feedback/alerts — run smart alerts on recent feedback */
export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get('limit') || 50)
    const { data } = await FeedbackService.list({ page:1, limit, status:'pending' })
    const allAlerts = data.flatMap(f => runSmartAlerts(f).map(a => ({ ...a, feedback: f })))
    return NextResponse.json({ total: allAlerts.length, alerts: allAlerts })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* POST /api/feedback/alerts — run alerts for a specific feedbackId */
export async function POST(req: NextRequest) {
  try {
    const { feedbackId } = await req.json()
    if (!feedbackId) return NextResponse.json({ error: 'feedbackId required' }, { status: 400 })
    const feedback = await FeedbackService.findById(feedbackId)
    if (!feedback)  return NextResponse.json({ error: 'Feedback not found' }, { status: 404 })
    const alerts = runSmartAlerts(feedback)
    return NextResponse.json({ alerts })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}