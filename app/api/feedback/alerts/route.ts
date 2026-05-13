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

    const alerts = await Feedback.find({
      tenantId: user.tenantId,
      $or: [
        { rating: { $lte: 2 } },
        { 'sentiment.label': 'negative' },
        { npsScore: { $lt: 5 } },
      ],
    })
      .populate('customerId', 'name email')
      .populate('ticketId', 'ticketNumber title')
      .sort({ createdAt: -1 })
      .limit(20);

    return successResponse(alerts);
  } catch (error) {
    console.error('Get feedback alerts error:', error);
    return errorResponse('An error occurred', 500);
  }
}
