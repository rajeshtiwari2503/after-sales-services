import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Ticket from '@/models/Ticket';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const ticketNumber = searchParams.get('ticketNumber')?.trim();
    const ticketId = searchParams.get('id');

    if (!ticketNumber && !ticketId) return errorResponse('Ticket number or ID required', 400);

    await connectDB();

    const query: Record<string, any> = {};
    if (ticketNumber) query.ticketNumber = { $regex: ticketNumber, $options: 'i' };
    if (ticketId) query._id = ticketId;

    // Customer can only track their own — others can track any in tenantId
    if (user.role === 'customer') query.customerId = user.userId;
    else query.tenantId = user.tenantId;

    const ticket = await Ticket.findOne(query)
      .populate('customerId', 'name email phone')
      .populate('technicianId', 'name')
      .select('ticketNumber title status priority category sla timeline createdAt updatedAt estimatedCompletionDate technicianId customerId')
      .lean();

    if (!ticket) return errorResponse('Ticket not found', 404);

    return successResponse(ticket, 'Ticket found');
  } catch (error) {
    console.error('Tracking error:', error);
    return errorResponse('An error occurred', 500);
  }
}