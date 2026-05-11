 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { verifyToken } from '@/lib/jwt';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

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
