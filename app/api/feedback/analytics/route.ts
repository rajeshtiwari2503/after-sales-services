//  import { NextRequest } from 'next/server';
// import { FeedbackService } from '@/services/feedback.service';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper';

// export async function GET(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const { searchParams } = new URL(request.url);
//     const startDate = searchParams.get('startDate');
//     const endDate = searchParams.get('endDate');

//     const period = startDate && endDate
//       ? { start: new Date(startDate), end: new Date(endDate) }
//       : undefined;

//     const analytics = await FeedbackService.getAnalytics(user.tenantId, period);

//     return successResponse(analytics);
//   } catch (error) {
//     console.error('Get feedback analytics error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }



// ═══════════════════════════════════════════════════════════════
// FILE 3: app/api/feedback/analytics/route.ts — Enhanced
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Feedback from '@/models/Feedback';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get('range') ?? '30');
    const startDate = new Date(Date.now() - range * 86400000);

    const tenantId = user.tenantId;
    const match = { tenantId, createdAt: { $gte: startDate } };

    const [
      stats,
      ratingDist,
      sentimentBreakdown,
      categoryRatings,
      trendData,
      techPerf,
    ] = await Promise.all([
      // Overall stats
      Feedback.aggregate([
        { $match: match },
        { $group: {
          _id:           null,
          avgRating:     { $avg: '$rating' },
          total:         { $sum: 1 },
          avgNPS:        { $avg: '$npsScore' },
          totalWithNPS:  { $sum: { $cond: [{ $gt: ['$npsScore', null] }, 1, 0] } },
        }},
      ]),
      // Rating 1–5 distribution
      Feedback.aggregate([
        { $match: match },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      // Sentiment
      Feedback.aggregate([
        { $match: { ...match, 'sentiment.label': { $exists: true } } },
        { $group: { _id: '$sentiment.label', count: { $sum: 1 } } },
      ]),
      // Category ratings
      Feedback.aggregate([
        { $match: match },
        { $unwind: { path: '$categories', preserveNullAndEmptyArrays: false } },
        { $group: {
          _id:       '$categories',
          avgRating: { $avg: '$rating' },
          count:     { $sum: 1 },
        }},
      ]),
      // Trend over time
      Feedback.aggregate([
        { $match: match },
        { $group: {
          _id:       { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgRating: { $avg: '$rating' },
          count:     { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
      // Top technicians by rating
      Feedback.aggregate([
        { $match: { ...match, technicianId: { $ne: null } } },
        { $group: {
          _id:       '$technicianId',
          avgRating: { $avg: '$rating' },
          count:     { $sum: 1 },
        }},
        { $sort: { avgRating: -1 } },
        { $limit: 10 },
        { $lookup: {
          from:         'users',
          localField:   '_id',
          foreignField: '_id',
          as:           'tech',
        }},
        { $unwind: { path: '$tech', preserveNullAndEmptyArrays: true } },
        { $project: {
          technicianId: '$_id',
          name:         { $ifNull: ['$tech.name', 'Unknown'] },
          avgRating:    { $round: ['$avgRating', 1] },
          count:        1,
        }},
      ]),
    ]);

    // Format rating distribution 1–5
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDist.forEach((r: any) => { distribution[r._id] = r.count; });

    // Format sentiment
    const sentiment = { positive: 0, neutral: 0, negative: 0 };
    sentimentBreakdown.forEach((s: any) => {
      if (s._id in sentiment) sentiment[s._id as keyof typeof sentiment] = s.count;
    });

    // NPS breakdown (if npsScore available)
    const npsData = await Feedback.find({ tenantId, npsScore: { $exists: true } }, 'npsScore').lean();
    let promoters = 0, passives = 0, detractors = 0;
    npsData.forEach((f: any) => {
      const score = f.npsScore ?? 0;
      if (score >= 9) promoters++;
      else if (score >= 7) passives++;
      else detractors++;
    });
    const npsTotal = promoters + passives + detractors || 1;
    const npsScore = Math.round(((promoters - detractors) / npsTotal) * 100);

    return successResponse({
      avgRating:    Math.round((stats[0]?.avgRating ?? 0) * 10) / 10,
      total:        stats[0]?.total ?? 0,
      npsScore,
      distribution,
      sentiment,
      categoryRatings: Object.fromEntries(
        categoryRatings.map((c: any) => [c._id, { avg: Math.round(c.avgRating * 10) / 10, count: c.count }])
      ),
      trendData: trendData.map((d: any) => ({
        date:      d._id,
        avgRating: Math.round(d.avgRating * 10) / 10,
        count:     d.count,
      })),
      npsBreakdown: { promoters, passives, detractors },
      topTechnicians: techPerf,
    }, 'Feedback analytics fetched');

  } catch (error) {
    console.error('Feedback analytics error:', error);
    return errorResponse('An error occurred', 500);
  }
}