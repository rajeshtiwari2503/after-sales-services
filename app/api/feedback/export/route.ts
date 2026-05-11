import { NextRequest, NextResponse } from 'next/server'
import { FeedbackService } from '@/services/feedback.service'
import type { FeedbackFilter } from '@/types/feedback'

/* GET /api/feedback/export?format=csv&status=...  */
export async function GET(req: NextRequest) {
  try {
    const p      = req.nextUrl.searchParams
    const format = p.get('format') || 'csv'
    const filter: FeedbackFilter = {
      status:    p.get('status')    as any,
      type:      p.get('type')      as any,
      sentiment: p.get('sentiment') as any,
      startDate: p.get('startDate') || undefined,
      endDate:   p.get('endDate')   || undefined,
      minRating: p.get('minRating') ? Number(p.get('minRating')) : undefined,
      maxRating: p.get('maxRating') ? Number(p.get('maxRating')) : undefined,
    }

    if (format === 'csv') {
      const csv = await FeedbackService.exportCSV(filter)
      return new NextResponse(csv, {
        headers: {
          'Content-Type':        'text/csv',
          'Content-Disposition': `attachment; filename="feedback-${Date.now()}.csv"`,
        },
      })
    }

    // JSON export
    const { data } = await FeedbackService.list({ ...filter, page:1, limit:10000 })
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type':        'application/json',
        'Content-Disposition': `attachment; filename="feedback-${Date.now()}.json"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}