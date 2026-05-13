 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const { ticketId } = await params;

    // Get messages for ticket
    // In production, fetch from database
    return successResponse({
      ticketId,
      messages: [],
      participants: [],
    });
  } catch (error) {
    console.error('Get ticket chat error:', error);
    return errorResponse('An error occurred', 500);
  }
}
