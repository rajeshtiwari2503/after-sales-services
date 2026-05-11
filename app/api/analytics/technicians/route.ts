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

    const performance = await AnalyticsService.getTechnicianPerformance(user.tenantId);

    return successResponse(performance);
  } catch (error) {
    console.error('Get technician performance error:', error);
    return errorResponse('An error occurred', 500);
  }
}
