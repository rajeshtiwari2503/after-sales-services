 import { NextRequest } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';

 

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

    const overview = await AnalyticsService.getOverview(user.tenantId, period);

    return successResponse(overview);
  } catch (error) {
    console.error('Get overview error:', error);
    return errorResponse('An error occurred', 500);
  }
}
