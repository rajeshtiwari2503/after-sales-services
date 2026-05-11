 import { NextRequest, NextResponse } from 'next/server'
import { SentimentService } from '@/services/sentiment.service'

/* GET /api/feedback/sentiment?clientId=xxx  — summary */
export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId') || undefined
    const summary  = await SentimentService.getSentimentSummary(clientId)
    return NextResponse.json(summary)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* POST /api/feedback/sentiment  — analyze text on the fly */
export async function POST(req: NextRequest) {
  try {
    const { text, texts } = await req.json()
    if (texts && Array.isArray(texts)) {
      return NextResponse.json(SentimentService.analyzeBatch(texts))
    }
    if (text) {
      return NextResponse.json(SentimentService.analyze(text))
    }
    return NextResponse.json({ error: 'Provide "text" or "texts"' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* PATCH /api/feedback/sentiment  — backfill all missing sentiment */
export async function PATCH() {
  try {
    const result = await SentimentService.backfill()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}