 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
 
import Ticket from '@/models/Ticket';
import connectDB from '@/lib/db';

 import { getAuthUser } from '@/lib/auth-helper';
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
