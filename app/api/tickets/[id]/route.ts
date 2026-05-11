 import { NextRequest } from 'next/server';
import { TicketService } from '@/services/ticket.service';
import { updateTicketSchema } from '@/schemas/ticket.schema';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { verifyToken } from '@/lib/jwt';

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

    const { id } = await params;
    const ticket = await TicketService.getTicketById(id, user.tenantId);

    if (!ticket) {
      return errorResponse('Ticket not found', 404);
    }

    return successResponse(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const validation = updateTicketSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    const { id } = await params;
    const ticket = await TicketService.updateTicket(
      id,
      validation.data,
      user.userId,
      user.tenantId
    );

    if (!ticket) {
      return errorResponse('Ticket not found', 404);
    }

    return successResponse(ticket, 'Ticket updated successfully');
  } catch (error) {
    console.error('Update ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    if (!['admin', 'manager'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    const { id } = await params;
    const result = await TicketService.updateStatus(
      id,
      'cancelled',
      user.userId,
      user.tenantId,
      'Ticket deleted by admin'
    );

    if (!result) {
      return errorResponse('Ticket not found', 404);
    }

    return successResponse(null, 'Ticket deleted successfully');
  } catch (error) {
    console.error('Delete ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}
