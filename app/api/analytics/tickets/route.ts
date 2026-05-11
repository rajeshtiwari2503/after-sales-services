 import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
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
    const days = parseInt(searchParams.get('days') || '30');

    const trends = await AnalyticsService.getTicketTrends(user.tenantId, days);

    return successResponse(trends);
  } catch (error) {
    console.error('Get ticket trends error:', error);
    return errorResponse('An error occurred', 500);
  }
}
