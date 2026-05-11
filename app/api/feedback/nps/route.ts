import { NextRequest, NextResponse } from 'next/server'
import { FeedbackService } from '@/services/feedback.service'
import { calculateNPS, npsCategory } from '@/lib/analytics/nps-calculator'

/* GET /api/feedback/nps */
export async function GET(req: NextRequest) {
  try {
    const p         = req.nextUrl.searchParams
    const startDate = p.get('startDate') || undefined
    const endDate   = p.get('endDate')   || undefined

    const { data }  = await FeedbackService.list({ page:1, limit:10000, startDate, endDate })
    const scores    = data.filter(f => f.npsScore != null).map(f => f.npsScore as number)
    const result    = calculateNPS(scores)
    const category  = npsCategory(result.score)

    return NextResponse.json({ ...result, ...category })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}