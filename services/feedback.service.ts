//  import Feedback from '@/models/Feedback';
import { CreateFeedbackInput } from '@/schemas/feedback.schema';
import { SentimentService } from './sentiment.service';
import connectDB from '@/lib/db';

export class FeedbackService {
  static async createFeedback(data: CreateFeedbackInput, customerId: string, tenantId: string) {
    await connectDB();

    let sentiment;
    if (data.comment) {
      sentiment = await SentimentService.analyze(data.comment);
    }

    const feedback = await Feedback.create({
      ...data,
      customerId,
      tenantId,
      sentiment,
    });

    return feedback;
  }

  static async getFeedback(tenantId: string, options: {
    page?: number;
    limit?: number;
    rating?: number;
    technicianId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    await connectDB();

    const { page = 1, limit = 10, rating, technicianId, startDate, endDate } = options;
    const query: Record<string, any> = { tenantId };

    if (rating) query.rating = rating;
    if (technicianId) query.technicianId = technicianId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [feedback, total] = await Promise.all([
      Feedback.find(query)
        .populate('customerId', 'name email')
        .populate('ticketId', 'ticketNumber title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Feedback.countDocuments(query),
    ]);

    return { feedback, total, page, limit };
  }

  static async getAnalytics(tenantId: string, period?: { start: Date; end: Date }) {
    await connectDB();

    const matchStage: Record<string, any> = { tenantId };
    if (period) {
      matchStage.createdAt = { $gte: period.start, $lte: period.end };
    }

    const [stats, sentimentBreakdown, trendData] = await Promise.all([
      Feedback.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalFeedback: { $sum: 1 },
            averageNPS: { $avg: '$npsScore' },
          },
        },
      ]),
      Feedback.aggregate([
        { $match: { ...matchStage, 'sentiment.label': { $exists: true } } },
        {
          $group: {
            _id: '$sentiment.label',
            count: { $sum: 1 },
          },
        },
      ]),
      Feedback.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            rating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    const sentiment = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    sentimentBreakdown.forEach((item: any) => {
      sentiment[item._id as keyof typeof sentiment] = item.count;
    });

    return {
      averageRating: stats[0]?.averageRating || 0,
      totalFeedback: stats[0]?.totalFeedback || 0,
      npsScore: stats[0]?.averageNPS || 0,
      sentimentBreakdown: sentiment,
      trendData: trendData.map((item: any) => ({
        date: item._id,
        rating: item.rating,
        count: item.count,
      })),
    };
  }

  static async respondToFeedback(feedbackId: string, content: string, respondedBy: string, tenantId: string) {
    await connectDB();

    return Feedback.findOneAndUpdate(
      { _id: feedbackId, tenantId },
      {
        response: {
          content,
          respondedBy,
          respondedAt: new Date(),
        },
      },
      { new: true }
    );
  }
}
