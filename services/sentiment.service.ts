import { analyzeSentiment, batchAnalyzeSentiment } from '@/lib/ai/sentiment-analysis'
import { FeedbackModel } from '@/models/Feedback'
import { connectDB } from '@/lib/db'

export class SentimentService {
  static analyze(text: string) {
    return analyzeSentiment(text)
  }

  static analyzeBatch(texts: string[]) {
    return batchAnalyzeSentiment(texts)
  }

  /** Re-run sentiment analysis on all feedback missing it */
  static async backfill(): Promise<{ updated: number }> {
    await connectDB()
    const docs = await FeedbackModel.find({ sentiment: { $exists: false } }).lean()
    let updated = 0
    for (const doc of docs) {
      const result = analyzeSentiment((doc as any).comment)
      await FeedbackModel.findByIdAndUpdate((doc as any)._id, {
        sentiment:      result.label,
        sentimentScore: result.score,
      })
      updated++
    }
    return { updated }
  }

  static async getSentimentSummary(clientId?: string) {
    await connectDB()
    const match = clientId ? { clientId } : {}
    const result = await FeedbackModel.aggregate([
      { $match: match },
      { $group: {
          _id:   '$sentiment',
          count: { $sum: 1 },
          avg:   { $avg: '$sentimentScore' },
      }},
    ])
    return result
  }
}