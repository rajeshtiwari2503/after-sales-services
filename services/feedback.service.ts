 import { FeedbackModel } from '@/models/Feedback'
import type { FeedbackCreateInput, FeedbackUpdateInput, FeedbackFilter, PaginatedFeedback, Feedback } from '@/types/feedback'
import { analyzeSentiment } from '@/lib/ai/sentiment-analysis'
import { connectDB } from '@/lib/db'

export class FeedbackService {
  static async create(input: FeedbackCreateInput): Promise<Feedback> {
    await connectDB()
    const sentiment = analyzeSentiment(input.comment)
    const doc = await FeedbackModel.create({
      ...input,
      sentiment:      sentiment.label,
      sentimentScore: sentiment.score,
      isPublic:       input.isPublic ?? false,
    })
    return doc.toObject()
  }

  static async findById(id: string): Promise<Feedback | null> {
    await connectDB()
    const doc = await FeedbackModel.findById(id).lean()
    return doc as Feedback | null
  }

  static async list(filter: FeedbackFilter): Promise<PaginatedFeedback> {
    await connectDB()
    const {
      page = 1, limit = 20, status, type, sentiment,
      minRating, maxRating, technicianId, clientId,
      startDate, endDate, isPublic, search,
    } = filter

    const query: Record<string, unknown> = {}
    if (status)       query.status       = status
    if (type)         query.type         = type
    if (sentiment)    query.sentiment    = sentiment
    if (technicianId) query.technicianId = technicianId
    if (clientId)     query.clientId     = clientId
    if (isPublic !== undefined) query.isPublic = isPublic
    if (minRating || maxRating) {
      query.rating = {}
      if (minRating) (query.rating as any).$gte = minRating
      if (maxRating) (query.rating as any).$lte = maxRating
    }
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) (query.createdAt as any).$gte = new Date(startDate)
      if (endDate)   (query.createdAt as any).$lte = new Date(endDate)
    }
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { comment:    { $regex: search, $options: 'i' } },
        { technicianName: { $regex: search, $options: 'i' } },
      ]
    }

    const [data, total] = await Promise.all([
      FeedbackModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      FeedbackModel.countDocuments(query),
    ])

    return { data: data as Feedback[], total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  static async update(id: string, input: FeedbackUpdateInput): Promise<Feedback | null> {
    await connectDB()
    const update: Record<string, unknown> = { ...input }
    if (input.response) update.respondedAt = new Date()
    const doc = await FeedbackModel.findByIdAndUpdate(id, update, { new: true }).lean()
    return doc as Feedback | null
  }

  static async delete(id: string): Promise<boolean> {
    await connectDB()
    const res = await FeedbackModel.findByIdAndDelete(id)
    return !!res
  }

  static async getAll(): Promise<Feedback[]> {
    await connectDB()
    return FeedbackModel.find().lean() as Promise<Feedback[]>
  }

  static async getPublicReviews(limit = 10): Promise<Feedback[]> {
    await connectDB()
    return FeedbackModel.find({ isPublic: true, status: { $ne: 'escalated' } })
      .sort({ rating: -1, createdAt: -1 }).limit(limit).lean() as Promise<Feedback[]>
  }

  static async exportCSV(filter: FeedbackFilter): Promise<string> {
    const { data } = await this.list({ ...filter, limit: 10000, page: 1 })
    const headers  = ['ID','Client','Email','Rating','NPS','Type','Status','Sentiment','Comment','Technician','Created']
    const rows     = data.map(f => [
      f._id, f.clientName, f.clientEmail, f.rating, f.npsScore ?? '',
      f.type, f.status, f.sentiment ?? '', `"${f.comment.replace(/"/g, '""')}"`,
      f.technicianName ?? '', new Date(f.createdAt).toLocaleDateString(),
    ])
    return [headers, ...rows].map(r => r.join(',')).join('\n')
  }
}