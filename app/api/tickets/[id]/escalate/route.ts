import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { NotificationService } from '@/services/notification.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager', 'service_center'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { reason, escalateTo } = body; // escalateTo: userId[]

    const ticket = await Ticket.findOne({ _id: id, tenantId: user.tenantId })
      .populate('customerId', 'name email')
      .populate('technicianId', 'name email');

    if (!ticket) return errorResponse('Ticket not found', 404);

    if (['resolved', 'closed', 'cancelled'].includes((ticket as any).status)) {
      return errorResponse('Cannot escalate a resolved/closed ticket', 400);
    }

    // Add escalation timeline event
    (ticket as any).timeline.push({
      action:          'escalated',
      description:     `Ticket escalated. Reason: ${reason ?? 'SLA at risk'}`,
      performedBy:     user.userId,
      performedByName: 'Manager',
      metadata:        { reason, escalateTo },
      createdAt:       new Date(),
    });

    // Change priority to critical if it's lower
    if ((ticket as any).priority !== 'critical') {
      (ticket as any).priority = 'high';
    }

    await ticket.save();

    // Notify escalation targets
    try {
      const targets = escalateTo?.length
        ? escalateTo
        : await User.find({ tenantId: user.tenantId, role: { $in: ['admin', 'manager'] }, isActive: true })
            .select('_id').then(us => us.map(u => u._id.toString()));

      if (targets?.length) {
        await NotificationService.createBulk({
          userIds: targets,
          tenantId: user.tenantId,
          type: 'ticket_escalated',
          title: `🚨 Ticket Escalated: ${(ticket as any).ticketNumber}`,
          message: `Ticket "${(ticket as any).title}" has been escalated. Reason: ${reason ?? 'SLA at risk'}`,
          link: `/dashboard/tickets/${id}`,
          metadata: { ticketId: id, ticketNumber: (ticket as any).ticketNumber },
        });
      }
    } catch (notifErr) {
      console.error('Escalation notification error:', notifErr);
    }

    return successResponse({ ticket }, 'Ticket escalated successfully');
  } catch (error) {
    console.error('Escalate ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}
