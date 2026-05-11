 import { NextRequest } from 'next/server';
import { FeedbackService } from '@/services/feedback.service';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { verifyToken } from '@/lib/jwt';

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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const period = startDate && endDate
      ? { start: new Date(startDate), end: new Date(endDate) }
      : undefined;

    const analytics = await FeedbackService.getAnalytics(user.tenantId, period);

    return successResponse(analytics);
  } catch (error) {
    console.error('Get feedback analytics error:', error);
    return errorResponse('An error occurred', 500);
  }
}
