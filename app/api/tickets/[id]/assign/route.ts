 import { NextRequest } from 'next/server';
import { TicketService } from '@/services/ticket.service';
import { assignTicketSchema } from '@/schemas/ticket.schema';
import { successResponse, errorResponse } from '@/utils/apiResponse';
 
 import { getAuthUser } from '@/lib/auth-helper';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    if (!['admin', 'manager', 'support'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const validation = assignTicketSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    const { id } = await params;
    const ticket = await TicketService.assignTicket(
      id,
      validation.data.technicianId,
      user.userId,
      user.tenantId
    );

    if (!ticket) {
      return errorResponse('Ticket not found', 404);
    }

    return successResponse(ticket, 'Ticket assigned successfully');
  } catch (error) {
    console.error('Assign ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}
