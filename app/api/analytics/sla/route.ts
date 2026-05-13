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

    const slaMetrics = await AnalyticsService.getSLAMetrics(user.tenantId);

    return successResponse(slaMetrics);
  } catch (error) {
    console.error('Get SLA metrics error:', error);
    return errorResponse('An error occurred', 500);
  }
}
