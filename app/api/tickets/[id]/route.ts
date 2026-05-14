 import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/services/ticket.service';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
 const { id } = await params;
    const ticket = await TicketService.getTicketById(id, user.tenantId);
    if (!ticket) return errorResponse('Ticket not found', 404);

    return successResponse(ticket, 'Ticket fetched');
  } catch (error) {
    console.error('Get ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const ticket = await TicketService.updateTicket(params.id, body, user.userId, user.tenantId);
    if (!ticket) return errorResponse('Ticket not found', 404);

    return successResponse(ticket, 'Ticket updated');
  } catch (error) {
    console.error('Update ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await TicketService.deleteTicket(params.id, user.tenantId);
    return successResponse(null, 'Ticket deleted');
  } catch (error) {
    console.error('Delete ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}