 
// import Ticket from '@/models/Ticket';
// import User from '@/models/User';
// import connectDB from '@/lib/db';
// import { Types } from 'mongoose';

// export class TicketService {
//   static async createTicket(data: any, userId: string, tenantId: string) {
//     await connectDB();

//     const count = await Ticket.countDocuments({ tenantId });
//     const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
//     const ticketId = `TID-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

//     const customerId =
//       data.customerId && Types.ObjectId.isValid(data.customerId)
//         ? new Types.ObjectId(data.customerId)
//         : new Types.ObjectId(userId);

//     const technicianId =
//       data.technicianId && Types.ObjectId.isValid(data.technicianId)
//         ? new Types.ObjectId(data.technicianId)
//         : undefined;

//     const serviceCenterId =
//       data.serviceCenterId && Types.ObjectId.isValid(data.serviceCenterId)
//         ? new Types.ObjectId(data.serviceCenterId)
//         : undefined;

//     const categoryId =
//       data.categoryId && Types.ObjectId.isValid(data.categoryId)
//         ? new Types.ObjectId(data.categoryId)
//         : undefined;

//     const productId =
//       data.productId && Types.ObjectId.isValid(data.productId)
//         ? new Types.ObjectId(data.productId)
//         : undefined;

//     const faultId =
//       data.faultId && Types.ObjectId.isValid(data.faultId)
//         ? new Types.ObjectId(data.faultId)
//         : undefined;

//     const ticket = await Ticket.create({
//       title: data.title,
//       description: data.description,
//       category: data.category || 'other',
//       categoryId,
//       productId,
//       faultId,
//       faultName: data.faultName || undefined,
//       priority: data.priority || 'medium',
//       status: serviceCenterId || technicianId ? 'in_progress' : 'open',
//       ticketNumber,
//       ticketId,
//       customerId,
//       technicianId,
//       serviceCenterId,
//       tenantId,
//       estimatedCompletionDate: data.estimatedCompletionDate || undefined,
//     });

//     return ticket;
//   }

//   static async getTickets(
//     tenantId: string,
//     options: {
//       page?: number;
//       limit?: number;
//       status?: string;
//       priority?: string;
//       category?: string;
//       categoryId?: string;
//       productId?: string;
//       technicianId?: string;
//       customerId?: string;
//       serviceCenterId?: string;
//       search?: string;
//     }
//   ) {
//     await connectDB();

//     const {
//       page = 1, limit = 10,
//       status, priority, category, categoryId, productId,
//       technicianId, customerId, serviceCenterId, search,
//     } = options;

//     const query: Record<string, any> = { tenantId };

//     if (status) query.status = status;
//     if (priority) query.priority = priority;
//     if (category) query.category = category;
//     if (categoryId && Types.ObjectId.isValid(categoryId)) query.categoryId = new Types.ObjectId(categoryId);
//     if (productId && Types.ObjectId.isValid(productId)) query.productId = new Types.ObjectId(productId);
//     if (technicianId && Types.ObjectId.isValid(technicianId)) query.technicianId = new Types.ObjectId(technicianId);
//     if (customerId && Types.ObjectId.isValid(customerId)) query.customerId = new Types.ObjectId(customerId);
//     if (serviceCenterId && Types.ObjectId.isValid(serviceCenterId)) query.serviceCenterId = new Types.ObjectId(serviceCenterId);

//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { ticketNumber: { $regex: search, $options: 'i' } },
//         { faultName: { $regex: search, $options: 'i' } },
//       ];
//     }

//     const skip = (page - 1) * limit;
//     const [tickets, total] = await Promise.all([
//       Ticket.find(query)
//         .populate('customerId', 'name email phone')
//         .populate('technicianId', 'name email')
//         .populate('serviceCenterId', 'name code')
//         .populate('categoryId', 'name slug')
//         .populate('productId', 'name modelNumber')
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),
//       Ticket.countDocuments(query),
//     ]);

//     return { tickets, total, page, limit };
//   }

//   static async getTicketById(ticketId: string, tenantId: string) {
//     await connectDB();
//     return Ticket.findOne({ _id: ticketId, tenantId })
//       .populate('customerId', 'name email phone')
//       .populate('technicianId', 'name email')
//       .populate('serviceCenterId', 'name code address')
//       .populate('categoryId', 'name slug faults')
//       .populate('productId', 'name modelNumber warrantyPeriod')
//       .lean();
//   }
// }

// services/ticket.service.ts  — REPLACE existing

import Ticket from '@/models/Ticket';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

export class TicketService {
  static async createTicket(data: any, userId: string, tenantId: string) {
    await connectDB();

    const count = await Ticket.countDocuments({ tenantId });
    const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
    const ticketId = `TID-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const customerId =
      data.customerId && Types.ObjectId.isValid(data.customerId)
        ? new Types.ObjectId(data.customerId)
        : new Types.ObjectId(userId);

    const technicianId =
      data.technicianId && Types.ObjectId.isValid(data.technicianId)
        ? new Types.ObjectId(data.technicianId)
        : undefined;

    const serviceCenterId =
      data.serviceCenterId && Types.ObjectId.isValid(data.serviceCenterId)
        ? new Types.ObjectId(data.serviceCenterId)
        : undefined;

    const categoryId =
      data.categoryId && Types.ObjectId.isValid(data.categoryId)
        ? new Types.ObjectId(data.categoryId)
        : undefined;

    const productId =
      data.productId && Types.ObjectId.isValid(data.productId)
        ? new Types.ObjectId(data.productId)
        : undefined;

    const faultId =
      data.faultId && Types.ObjectId.isValid(data.faultId)
        ? new Types.ObjectId(data.faultId)
        : undefined;

    const ticket = await Ticket.create({
      title: data.title,
      description: data.description,
      category: data.category || 'other',
      categoryId,
      productId,
      faultId,
      faultName: data.faultName || undefined,
      priority: data.priority || 'medium',
      status: serviceCenterId || technicianId ? 'in_progress' : 'open',
      ticketNumber,
      ticketId,
      customerId,
      technicianId,
      serviceCenterId,
      tenantId,
      estimatedCompletionDate: data.estimatedCompletionDate || undefined,
    });

    return ticket;
  }

  static async getTickets(
    tenantId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      priority?: string;
      category?: string;
      categoryId?: string;
      productId?: string;
      technicianId?: string;
      customerId?: string;
      serviceCenterId?: string;
      search?: string;
    }
  ) {
    await connectDB();

    const {
      page = 1, limit = 10,
      status, priority, category, categoryId, productId,
      technicianId, customerId, serviceCenterId, search,
    } = options;

    const query: Record<string, any> = { tenantId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (categoryId && Types.ObjectId.isValid(categoryId)) query.categoryId = new Types.ObjectId(categoryId);
    if (productId && Types.ObjectId.isValid(productId)) query.productId = new Types.ObjectId(productId);
    if (technicianId && Types.ObjectId.isValid(technicianId)) query.technicianId = new Types.ObjectId(technicianId);
    if (customerId && Types.ObjectId.isValid(customerId)) query.customerId = new Types.ObjectId(customerId);
    if (serviceCenterId && Types.ObjectId.isValid(serviceCenterId)) query.serviceCenterId = new Types.ObjectId(serviceCenterId);

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
        { faultName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('customerId', 'name email phone')
        .populate('technicianId', 'name email')
        .populate('serviceCenterId', 'name code')
        .populate('categoryId', 'name slug')
        .populate('productId', 'name modelNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(query),
    ]);

    return { tickets, total, page, limit };
  }

  static async getTicketById(ticketId: string, tenantId: string) {
    await connectDB();
    return Ticket.findOne({ _id: ticketId, tenantId })
      .populate('customerId', 'name email phone')
      .populate('technicianId', 'name email')
      .populate('serviceCenterId', 'name code address')
      .populate('categoryId', 'name slug faults')
      .populate('productId', 'name modelNumber warrantyPeriod')
      .lean();
  }

  // ── NEW: updateTicket ─────────────────────────────────────────────────────
  static async updateTicket(
    id: string,
    data: Record<string, any>,
    userId: string,
    tenantId: string
  ) {
    await connectDB();

    const user = await User.findById(userId).select('name').lean();
    const performerName = (user as any)?.name ?? 'System';

    // Fields allowed to be updated
    const allowed = [
      'title', 'description', 'priority', 'status',
      'category', 'categoryId', 'productId', 'faultId', 'faultName',
      'technicianId', 'serviceCenterId', 'estimatedCompletionDate',
    ];

    const updateFields: Record<string, any> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        // Convert ObjectId fields
        if (['categoryId', 'productId', 'faultId', 'technicianId', 'serviceCenterId'].includes(key)) {
          updateFields[key] =
            data[key] && Types.ObjectId.isValid(data[key])
              ? new Types.ObjectId(data[key])
              : undefined;
        } else {
          updateFields[key] = data[key];
        }
      }
    }

    // Auto-set actualCompletionDate when resolved
    if (data.status === 'resolved' || data.status === 'closed') {
      updateFields.actualCompletionDate = new Date();
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, tenantId },
      {
        $set: updateFields,
        $push: {
          timeline: {
            action: 'ticket_updated',
            description: data.status
              ? `Status changed to ${data.status.replace(/_/g, ' ')}`
              : 'Ticket details updated',
            performedBy: new Types.ObjectId(userId),
            performedByName: performerName,
            metadata: data.status ? { status: data.status } : {},
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate('customerId', 'name email phone')
      .populate('technicianId', 'name email')
      .populate('serviceCenterId', 'name code')
      .populate('categoryId', 'name slug')
      .populate('productId', 'name modelNumber');

    return ticket;
  }

  // ── NEW: deleteTicket ─────────────────────────────────────────────────────
  static async deleteTicket(id: string, tenantId: string) {
    await connectDB();
    return Ticket.findOneAndDelete({ _id: id, tenantId });
  }

  // ── Kept for backward compat (old assign route uses this) ─────────────────
  static async assignTicket(
    ticketId: string,
    technicianId: string,
    userId: string,
    tenantId: string
  ) {
    await connectDB();

    const user = await User.findById(userId).select('name').lean();
    const ticket = await Ticket.findOne({ _id: ticketId, tenantId });
    if (!ticket) return null;

    ticket.technicianId = new Types.ObjectId(technicianId);
    ticket.status = 'in_progress';

    (ticket.timeline as any[]).push({
      action: 'assigned',
      description: 'Assigned to technician',
      performedBy: new Types.ObjectId(userId),
      performedByName: (user as any)?.name ?? 'System',
      metadata: { technicianId },
      createdAt: new Date(),
    });

    await ticket.save();
    return ticket;
  }

  static async changeStatus(
    id: string,
    status: string,
    userId: string,
    tenantId: string
  ) {
    await connectDB();
    const user = await User.findById(userId).select('name').lean();

    const statusLabels: Record<string, string> = {
      open: 'Open', in_progress: 'In Progress',
      pending_parts: 'Pending Parts', pending_customer: 'Pending Customer',
      resolved: 'Resolved', closed: 'Closed', cancelled: 'Cancelled',
    };

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, tenantId },
      {
        status,
        ...(status === 'resolved' ? { actualCompletionDate: new Date() } : {}),
        $push: {
          timeline: {
            action: 'status_changed',
            description: `Status changed to ${statusLabels[status] ?? status}`,
            performedBy: new Types.ObjectId(userId),
            performedByName: (user as any)?.name ?? 'System',
            metadata: { status },
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate('customerId', 'name email')
      .populate('technicianId', 'name');

    return ticket;
  }

  static async addNote(
    id: string,
    note: { content: string; isInternal: boolean },
    userId: string,
    tenantId: string
  ) {
    await connectDB();
    const user = await User.findById(userId).select('name').lean();

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, tenantId },
      {
        $push: {
          notes: {
            content: note.content,
            authorId: new Types.ObjectId(userId),
            authorName: (user as any)?.name ?? 'Unknown',
            isInternal: note.isInternal,
            createdAt: new Date(),
          },
          timeline: {
            action: 'note_added',
            description: note.isInternal ? 'Internal note added' : 'Note added',
            performedBy: new Types.ObjectId(userId),
            performedByName: (user as any)?.name ?? 'Unknown',
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate('customerId', 'name email')
      .populate('technicianId', 'name');

    return ticket;
  }
}