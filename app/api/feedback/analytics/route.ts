 import { NextRequest, NextResponse } from 'next/server'
import { FeedbackService } from '@/services/feedback.service'
import { computeFeedbackAnalytics } from '@/lib/analytics/feedback-analytics'

/* GET /api/feedback/analytics */
export async function GET(req: NextRequest) {
  try {
    const p         = req.nextUrl.searchParams
    const startDate = p.get('startDate') || undefined
    const endDate   = p.get('endDate')   || undefined
    const clientId  = p.get('clientId')  || undefined

    const all       = await FeedbackService.list({ page:1, limit:10000, startDate, endDate, clientId })
    const analytics = computeFeedbackAnalytics(all.data)

    return NextResponse.json(analytics)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}