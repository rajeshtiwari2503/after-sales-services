import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import Feedback from '@/models/Feedback';
import connectDB from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    // Run all aggregations in parallel
    const [sentimentAgg, overallStats, recentFeedbacks] = await Promise.all([
      // Sentiment distribution
      Feedback.aggregate([
        { $match: { tenantId: user.tenantId } },
        {
          $group: {
            _id: '$sentiment.label',
            count: { $sum: 1 },
            avgScore: { $avg: '$sentiment.score' },
            keywords: { $push: '$sentiment.keywords' },
          },
        },
      ]),
      // Overall stats
      Feedback.aggregate([
        { $match: { tenantId: user.tenantId } },
        {
          $group: {
            _id: null,
            total:     { $sum: 1 },
            avgRating: { $avg: '$rating' },
            avgNPS:    { $avg: '$npsScore' },
          },
        },
      ]),
      // Recent feedbacks for list
      Feedback.find({ tenantId: user.tenantId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('comment rating sentiment createdAt')
        .lean(),
    ]);

    // Build distribution map
    const distribution = { positive: 0, neutral: 0, negative: 0 };
    const keywordMap: Record<string, number> = {};
    let totalWithSentiment = 0;

    sentimentAgg.forEach((item: any) => {
      const label = item._id as string;
      if (!label) return;
      if (label in distribution) {
        distribution[label as keyof typeof distribution] = item.count;
        totalWithSentiment += item.count;
      }
      // Flatten keywords
      (item.keywords ?? []).flat().forEach((kw: string) => {
        if (kw) keywordMap[kw] = (keywordMap[kw] ?? 0) + 1;
      });
    });

    // Top keywords by frequency
    const topKeywords = Object.entries(keywordMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([kw]) => kw);

    // Determine overall sentiment label
    const maxLabel = Object.entries(distribution).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'neutral';

    const stats = overallStats[0] ?? { total: 0, avgRating: 0, avgNPS: 0 };

    // Convert to percentages
    const totalForPct = totalWithSentiment || stats.total || 1;
    const distPct = {
      positive: Math.round((distribution.positive / totalForPct) * 100),
      neutral:  Math.round((distribution.neutral  / totalForPct) * 100),
      negative: Math.round((distribution.negative / totalForPct) * 100),
    };

    return successResponse({
      overall: {
        label: maxLabel,
        score: distribution.positive / totalForPct,
        distribution: distPct,
      },
      avgRating:       +(stats.avgRating ?? 0).toFixed(1),
      avgNPS:          +(stats.avgNPS ?? 0).toFixed(1),
      total:           stats.total ?? 0,
      topKeywords,
      recentFeedbacks: recentFeedbacks ?? [],
    });
  } catch (error) {
    console.error('Get sentiment error:', error);
    return errorResponse('An error occurred', 500);
  }
}
