//  import { NextRequest } from 'next/server';
// import { TicketService } from '@/services/ticket.service';
// import { assignTicketSchema } from '@/schemas/ticket.schema';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
 
//  import { getAuthUser } from '@/lib/auth-helper';

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     if (!['admin', 'manager', 'support'].includes(user.role)) {
//       return errorResponse('Forbidden', 403);
//     }

//     const body = await request.json();
//     const validation = assignTicketSchema.safeParse(body);
//     if (!validation.success) {
//       return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
//     }

//     const { id } = await params;
//     const ticket = await TicketService.assignTicket(
//       id,
//       validation.data.technicianId,
//       user.userId,
//       user.tenantId
//     );

//     if (!ticket) {
//       return errorResponse('Ticket not found', 404);
//     }

//     return successResponse(ticket, 'Ticket assigned successfully');
//   } catch (error) {
//     console.error('Assign ticket error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }


// app/api/tickets/[id]/assign/route.ts  — REPLACE your existing file
//
// Assignment matrix (exact match with diagram):
//
//   Super Admin (admin)
//     → can assign any ticket to any SC or any technician across all brands
//
//   Brand Manager (manager)
//     → can assign ticket (own brand) to:
//         a) a service center in their brand   → ticket gets serviceCenterId set
//         b) a technician directly in their brand (independent assignment)
//
//   Service Center (service_center)
//     → can assign ticket (that was routed to their SC) to:
//         their own SC's technicians ONLY
//
//   Technician
//     → cannot assign — they only receive (handled separately)

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUserFull, canAssignTicket } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';
import Technician from '@/models/Technician';
import ServiceCenter from '@/models/ServiceCenter';
import User from '@/models/User';
import mongoose, { Types } from 'mongoose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUserFull(request);
    if (!user) return errorResponse('Unauthorized', 401);

    // Only these roles can assign tickets
    if (!['admin', 'manager', 'service_center'].includes(user.role)) {
      return errorResponse('Forbidden: your role cannot assign tickets', 403);
    }

    const { id: ticketId } = await params;
    await connectDB();

    // Fetch the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return errorResponse('Ticket not found', 404);

    // Check cross-tenant assignment
    if (!canAssignTicket(user.role, user.tenantId, ticket.tenantId)) {
      return errorResponse('Forbidden: ticket belongs to a different brand', 403);
    }

    const body = await request.json();
    const { technicianId, serviceCenterId } = body;

    if (!technicianId && !serviceCenterId) {
      return errorResponse('Provide technicianId or serviceCenterId', 400);
    }

    const performerUser = await User.findById(user.userId).select('name');
    const performerName = performerUser?.name ?? 'System';

    // ─────────────────────────────────────────────────────────────────────────
    // CASE 1: Assign to a Service Center (manager or admin)
    //   → sets serviceCenterId on ticket, status = in_progress
    //   → SC operator will then assign to a specific technician
    // ─────────────────────────────────────────────────────────────────────────
    if (serviceCenterId && !technicianId) {
      if (user.role === 'service_center') {
        return errorResponse('Service center operators must assign to a specific technician, not a SC', 400);
      }

      const sc = await ServiceCenter.findById(serviceCenterId);
      if (!sc) return errorResponse('Service center not found', 404);

      // Manager can only assign to their own brand's SCs
      if (user.role === 'manager' && sc.tenantId !== user.tenantId) {
        return errorResponse('Forbidden: service center belongs to a different brand', 403);
      }

      ticket.serviceCenterId = new Types.ObjectId(serviceCenterId);
      ticket.status = 'in_progress';
      (ticket.timeline as any[]).push({
        action: 'assigned_to_sc',
        description: `Ticket assigned to Service Center: ${sc.name}`,
        performedBy: new Types.ObjectId(user.userId),
        performedByName: performerName,
        metadata: { serviceCenterId },
        createdAt: new Date(),
      });

      await ticket.save();
      return successResponse(
        await ticket.populate(['customerId', 'technicianId', 'serviceCenterId']),
        'Ticket assigned to service center'
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CASE 2: Assign directly to a Technician
    // ─────────────────────────────────────────────────────────────────────────
    const tech = await Technician.findById(technicianId)
      .populate('userId', 'name')
      .populate('serviceCenterId', 'name code');

    if (!tech) return errorResponse('Technician not found', 404);

    // Technician must belong to the same brand as the ticket
    if (tech.tenantId !== ticket.tenantId) {
      return errorResponse('Forbidden: technician belongs to a different brand', 403);
    }

    // SC operator: can ONLY assign to technicians within their own SC
    if (user.role === 'service_center') {
      if (!user.serviceCenterId) {
        return errorResponse('Your account is not linked to a service center', 400);
      }
      if (tech.serviceCenterId._id.toString() !== user.serviceCenterId) {
        return errorResponse(
          'Forbidden: you can only assign to technicians within your own service center',
          403
        );
      }
      // Also verify this ticket was actually routed to their SC
      if (
        ticket.serviceCenterId &&
        ticket.serviceCenterId.toString() !== user.serviceCenterId
      ) {
        return errorResponse(
          'Forbidden: this ticket was not routed to your service center',
          403
        );
      }
    }

    // Manager: if also passing serviceCenterId, validate it's their brand
    if (serviceCenterId) {
      const sc = await ServiceCenter.findById(serviceCenterId);
      if (sc && user.role === 'manager' && sc.tenantId !== user.tenantId) {
        return errorResponse('Forbidden: service center belongs to a different brand', 403);
      }
      if (sc) ticket.serviceCenterId = sc._id as Types.ObjectId;
    } else if (tech.serviceCenterId) {
      // Auto-set serviceCenterId from the technician's SC
      ticket.serviceCenterId = tech.serviceCenterId._id as Types.ObjectId;
    }

    const techUserName = (tech.userId as any)?.name ?? 'Technician';
    const scName = (tech.serviceCenterId as any)?.name ?? '';

    ticket.technicianId = tech._id as Types.ObjectId;
    ticket.status = 'in_progress';
    (ticket.timeline as any[]).push({
      action: 'assigned_to_technician',
      description: `Ticket assigned to ${techUserName}${scName ? ` (${scName})` : ''}`,
      performedBy: new Types.ObjectId(user.userId),
      performedByName: performerName,
      metadata: { technicianId, serviceCenterId: tech.serviceCenterId?._id },
      createdAt: new Date(),
    });

    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate('customerId', 'name email')
      .populate('technicianId', 'name email')
      .populate('serviceCenterId', 'name code');

    return successResponse(populated, 'Ticket assigned to technician');
  } catch (error) {
    console.error('Assign ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}