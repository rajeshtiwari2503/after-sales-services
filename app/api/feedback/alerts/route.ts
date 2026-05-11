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
