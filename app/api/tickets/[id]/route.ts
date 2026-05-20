 // app/api/tickets/[id]/route.ts  — REPLACE existing
// Fix: static imports at top (no dynamic import() inside functions)
// Added: NotificationService.onStatusChange fires when status changes

import { NextRequest } from 'next/server';
import { TicketService } from '@/services/ticket.service';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import { NotificationService } from '@/services/notification.service';
import Ticket from '@/models/Ticket';
import Technician from '@/models/Technician';
import User from '@/models/User';
import connectDB from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    // Capture old status BEFORE update (for notification)
    const existing = await Ticket.findOne({ _id: id, tenantId: user.tenantId })
      .select('status technicianId customerId tenantId ticketNumber title')
      .lean();
    const oldStatus = existing?.status;

    // Run the update via TicketService
    const ticket = await TicketService.updateTicket(id, body, user.userId, user.tenantId);
    if (!ticket) return errorResponse('Ticket not found', 404);

    const newStatus = (ticket as any).status;

    // Fire notification only if status actually changed
    if (body.status && oldStatus && oldStatus !== newStatus && existing) {
      const recipientIds: string[] = [];

      // Find the user behind the technician record
      if (existing.technicianId) {
        const techDoc = await Technician.findById(existing.technicianId).select('userId').lean();
        if (techDoc?.userId) recipientIds.push(techDoc.userId.toString());
      }

      // Always notify the customer
      if (existing.customerId) {
        recipientIds.push(existing.customerId.toString());
      }

      if (recipientIds.length > 0) {
        const performer = await User.findById(user.userId).select('name').lean();
        const performerName = performer?.name ?? 'System';

        // Fire and forget — don't block response
        NotificationService.onStatusChange({
          recipientUserIds: recipientIds,
          tenantId:         existing.tenantId,
          ticketId:         id,
          ticketNumber:     existing.ticketNumber,
          fromStatus:       oldStatus,
          toStatus:         newStatus,
          changedByName:    performerName,
        }).catch(e => console.error('Notification error:', e));
      }
    }

    return successResponse(ticket, 'Ticket updated');
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
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    const { id } = await params;
    const deleted = await TicketService.deleteTicket(id, user.tenantId);
    if (!deleted) return errorResponse('Ticket not found', 404);

    return successResponse(null, 'Ticket deleted');
  } catch (error) {
    console.error('Delete ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}