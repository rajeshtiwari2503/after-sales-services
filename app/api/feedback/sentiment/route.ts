 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { verifyToken } from '@/lib/jwt';
import Feedback from '@/models/Feedback';
import connectDB from '@/lib/db';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const sentimentData = await Feedback.aggregate([
      {
        $match: {
          tenantId: user.tenantId,
          'sentiment.label': { $exists: true },
        },
      },
      {
        $group: {
          _id: '$sentiment.label',
          count: { $sum: 1 },
          avgScore: { $avg: '$sentiment.score' },
          keywords: { $push: '$sentiment.keywords' },
        },
      },
    ]);

    const result = {
      positive: { count: 0, avgScore: 0, keywords: [] as string[] },
      neutral: { count: 0, avgScore: 0, keywords: [] as string[] },
      negative: { count: 0, avgScore: 0, keywords: [] as string[] },
    };

    sentimentData.forEach((item: any) => {
      const allKeywords = item.keywords.flat();
      const keywordCounts: Record<string, number> = {};
      allKeywords.forEach((kw: string) => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });

      const topKeywords = Object.entries(keywordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([kw]) => kw);

      result[item._id as keyof typeof result] = {
        count: item.count,
        avgScore: item.avgScore,
        keywords: topKeywords,
      };
    });

    return successResponse(result);
  } catch (error) {
    console.error('Get sentiment error:', error);
    return errorResponse('An error occurred', 500);
  }
}
