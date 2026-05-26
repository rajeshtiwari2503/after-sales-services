 

// import { NextRequest } from 'next/server';
// import { TicketService } from '@/services/ticket.service';
// import { createTicketSchema } from '@/schemas/ticket.schema';
// import { successResponse, errorResponse, paginatedResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper'; // ✅ import karo

 

 
// export async function GET(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);

//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const { searchParams } = new URL(request.url);

//     const options = {
//       page: parseInt(searchParams.get('page') || '1'),
//       limit: parseInt(searchParams.get('limit') || '10'),
//       status: searchParams.get('status') || undefined,
//       priority: searchParams.get('priority') || undefined,
//       category: searchParams.get('category') || undefined,
//       technicianId: searchParams.get('technicianId') || undefined,
//       customerId: searchParams.get('customerId') || undefined,
//       search: searchParams.get('search') || undefined,
//     };

//     const result = await TicketService.getTickets(
//       user.tenantId,
//       options
//     );

//     // ✅ Stats
//     const stats = {
//       open: result.tickets.filter(
//         (t: any) => t.status === 'open'
//       ).length,

//       inProgress: result.tickets.filter(
//         (t: any) => t.status === 'in_progress'
//       ).length,

//       pending: result.tickets.filter((t: any) =>
//         ['pending_parts', 'pending_customer'].includes(t.status)
//       ).length,

//       resolved: result.tickets.filter((t: any) =>
//         ['resolved', 'closed'].includes(t.status)
//       ).length,
//     };

//     // ✅ Direct response return karo
//     return successResponse({
//       tickets: result.tickets,
//       page: result.page,
//       limit: result.limit,
//       total: result.total,
//       totalPages: Math.ceil(result.total / result.limit),
//       stats,
//     });

//   } catch (error) {
//     console.error('Get tickets error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }
//  export async function POST(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse('Unauthorized', 401);

//     // ✅ Content-Type check karke parse karo
//     const contentType = request.headers.get('content-type') || '';
//     let body: Record<string, any> = {};

//     if (contentType.includes('multipart/form-data')) {
//       const formData = await request.formData();
//       formData.forEach((value, key) => {
//         if (key !== 'attachments') body[key] = value;
//       });
//     } else {
//       body = await request.json();
//     }

//     const validation = createTicketSchema.safeParse(body);
//     if (!validation.success) {
//       return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
//     }

//     const ticket = await TicketService.createTicket(
//       validation.data,
//       user.userId,
//       user.tenantId
//     );

//     return successResponse(ticket, 'Ticket created successfully', 201);
//   } catch (error) {
//     console.error('Create ticket error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// app/api/tickets/route.ts  — REPLACE existing
// Added: NotificationService.onTicketCreated fires on new ticket creation

import { NextRequest } from 'next/server';
import { TicketService } from '@/services/ticket.service';
import { createTicketSchema } from '@/schemas/ticket.schema';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import { NotificationService } from '@/services/notification.service';
import User from '@/models/User';
import PlatformSettings from '@/models/PlatformSettings';
import connectDB from '@/lib/db';
import { audit } from '@/lib/audit-request';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/lib/audit';
import "@/models/Category";
import "@/models/User";
import "@/models/Product";
import "@/models/ServiceCenter";
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);

    const options = {
      page:      parseInt(searchParams.get('page')  ?? '1'),
      limit:     parseInt(searchParams.get('limit') ?? '10'),
      status:    searchParams.get('status')      ?? undefined,
      priority:  searchParams.get('priority')    ?? undefined,
      category:  searchParams.get('category')    ?? undefined,
      categoryId:searchParams.get('categoryId')  ?? undefined,
      productId: searchParams.get('productId')   ?? undefined,
      technicianId: searchParams.get('technicianId') ?? undefined,
      customerId:   searchParams.get('customerId')    ?? undefined,
      serviceCenterId: searchParams.get('serviceCenterId') ?? undefined,
      search:    searchParams.get('search')      ?? undefined,
    };

    // RBAC: SC operators only see their SC's tickets
    if (user.role === 'service_center') {
      const scId = request.headers.get('x-service-center-id');
      if (scId) options.serviceCenterId = scId;
    }

    // Technician: only their assigned tickets
    if (user.role === 'technician') {
      options.technicianId = user.userId;
    }

    const result = await TicketService.getTickets(user.tenantId, options);

    const stats = {
      open:       result.tickets.filter((t: any) => t.status === 'open').length,
      inProgress: result.tickets.filter((t: any) => t.status === 'in_progress').length,
      pending:    result.tickets.filter((t: any) => ['pending_parts', 'pending_customer'].includes(t.status)).length,
      resolved:   result.tickets.filter((t: any) => ['resolved', 'closed'].includes(t.status)).length,
    };

    return successResponse({
      tickets:    result.tickets,
      page:       result.page,
      limit:      result.limit,
      total:      result.total,
      totalPages: Math.ceil(result.total / result.limit),
      stats,
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const contentType = request.headers.get('content-type') ?? '';
    let body: Record<string, any> = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        if (key !== 'attachments') body[key] = value;
      });
      if (typeof body.serviceAddress === 'string') {
        try {
          body.serviceAddress = JSON.parse(body.serviceAddress);
        } catch {
          /* ignore */
        }
      }
    } else {
      body = await request.json();
    }

    const validation = createTicketSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    await connectDB();
    const platform = await PlatformSettings.findOne({ tenantId: user.tenantId }).lean();
    if (platform?.maintenanceMode && user.role === 'customer') {
      return errorResponse('New tickets are temporarily disabled for maintenance', 503);
    }

    const ticket = await TicketService.createTicket(validation.data, user.userId, user.tenantId);

    audit(request, user, {
      action: AUDIT_ACTIONS.CREATE,
      module: AUDIT_MODULES.TICKET,
      entityId:   (ticket as { _id: { toString(): string } })._id?.toString?.(),
      entityName: (ticket as { ticketNumber?: string }).ticketNumber,
      message:    `Ticket created: ${(ticket as { title?: string }).title}`,
    });

    // Notify brand managers when a new ticket is created
    try {
      await connectDB();
      const managers = await User.find({
        tenantId: user.tenantId,
        role: 'manager',
        isActive: true,
      }).select('_id');

      if (managers.length > 0) {
        await NotificationService.onTicketCreated({
          managerUserIds: managers.map(m => m._id.toString()),
          tenantId:       user.tenantId,
          ticketId:       (ticket as any)._id.toString(),
          ticketNumber:   (ticket as any).ticketNumber,
          title:          (ticket as any).title,
        });
      }

      const scId = (ticket as { serviceCenterId?: { toString(): string } }).serviceCenterId?.toString?.()
        ?? (ticket as { serviceCenterId?: string }).serviceCenterId;

      if (scId) {
        const scUsers = await User.find({
          tenantId: user.tenantId,
          role: 'service_center',
          serviceCenterId: scId,
          isActive: true,
        }).select('_id');

        const ServiceCenter = (await import('@/models/ServiceCenter')).default;
        const sc = await ServiceCenter.findById(scId).select('name').lean();

        if (scUsers.length > 0) {
          await NotificationService.onTicketRoutedToSC({
            scOperatorUserIds: scUsers.map((u) => u._id.toString()),
            tenantId: user.tenantId,
            ticketId: (ticket as { _id: { toString(): string } })._id.toString(),
            ticketNumber: (ticket as { ticketNumber: string }).ticketNumber,
            title: (ticket as { title: string }).title,
            scName: sc?.name ?? 'Service center',
          });
        }
      }
    } catch (notifErr) {
      // Non-critical — don't fail ticket creation if notification fails
      console.error('Notification error (non-critical):', notifErr);
    }

    return successResponse(ticket, 'Ticket created successfully', 201);
  } catch (error) {
    console.error('Create ticket error:', error);
    return errorResponse('An error occurred', 500);
  }
}