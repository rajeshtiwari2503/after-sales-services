 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
 
import Feedback from '@/models/Feedback';
import connectDB from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const npsData = await Feedback.aggregate([
      {
        $match: {
          tenantId: user.tenantId,
          npsScore: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          promoters: {
            $sum: { $cond: [{ $gte: ['$npsScore', 9] }, 1, 0] },
          },
          passives: {
            $sum: { $cond: [{ $and: [{ $gte: ['$npsScore', 7] }, { $lt: ['$npsScore', 9] }] }, 1, 0] },
          },
          detractors: {
            $sum: { $cond: [{ $lt: ['$npsScore', 7] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ]);

    const data = npsData[0] || { promoters: 0, passives: 0, detractors: 0, total: 0 };
    const npsScore = data.total > 0
      ? ((data.promoters - data.detractors) / data.total) * 100
      : 0;

    return successResponse({
      npsScore: Math.round(npsScore),
      promoters: data.promoters,
      passives: data.passives,
      detractors: data.detractors,
      total: data.total,
      promoterPercentage: data.total > 0 ? (data.promoters / data.total) * 100 : 0,
      detractorPercentage: data.total > 0 ? (data.detractors / data.total) * 100 : 0,
    });
  } catch (error) {
    console.error('Get NPS error:', error);
    return errorResponse('An error occurred', 500);
  }
}
