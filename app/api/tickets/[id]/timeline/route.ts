 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { verifyToken } from '@/lib/jwt';
import Ticket from '@/models/Ticket';
import connectDB from '@/lib/db';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();
    const { id } = await params;

    const ticket = await Ticket.findOne(
      { _id: id, tenantId: user.tenantId },
      { timeline: 1 }
    );

    if (!ticket) {
      return errorResponse('Ticket not found', 404);
    }

    return successResponse(ticket.timeline);
  } catch (error) {
    console.error('Get timeline error:', error);
    return errorResponse('An error occurred', 500);
  }
}
