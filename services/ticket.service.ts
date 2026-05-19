// import Ticket from '@/models/Ticket';
// import User from '@/models/User';
// import Tenant from '@/models/Tenant';
// import { CreateTicketInput, UpdateTicketInput } from '@/schemas/ticket.schema';
// import { SLA_DEFAULTS } from '@/utils/constants';
// import connectDB from '@/lib/db';
// import { Types } from 'mongoose';

// export class TicketService {
//  static async createTicket(data: any, userId: string, tenantId: string) {
//   await connectDB();

//   // ✅ ticketNumber pehle generate karo
//   const count = await Ticket.countDocuments({ tenantId });
//   const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
 
 

// const ticketId = `TID-${Date.now()}-${Math.floor(
//   1000 + Math.random() * 9000
// )}`;
//   const { Types } = require('mongoose');
//   const customerId = data.customerId && Types.ObjectId.isValid(data.customerId)
//     ? new Types.ObjectId(data.customerId)
//     : new Types.ObjectId(userId);

//   const technicianId = data.technicianId && Types.ObjectId.isValid(data.technicianId)
//     ? new Types.ObjectId(data.technicianId)
//     : undefined;

//   // ✅ ticketNumber explicitly pass karo — pre('save') pe depend mat karo
//   const ticket = await Ticket.create({
//     title: data.title,
//     description: data.description,
//     category: data.category,
//     priority: data.priority || 'medium',
//     status: 'open',
//     ticketNumber,          // ← yahan explicitly
//     ticketId,
//     customerId,
//     technicianId,
//     tenantId,
//     estimatedCompletionDate: data.estimatedCompletionDate || undefined,
//   });

//   return ticket;
// }

//   // static async getTickets(
//   //   tenantId: string,
//   //   options: {
//   //     page?: number;
//   //     limit?: number;
//   //     status?: string;
//   //     priority?: string;
//   //     category?: string;
//   //     technicianId?: string;
//   //     customerId?: string;
//   //     search?: string;
//   //   }
//   // ) {
//   //   await connectDB();

//   //   const { page = 1, limit = 10, status, priority, category, technicianId, customerId, search } = options;

//   //   const query: Record<string, any> = { tenantId };

//   //   if (status) query.status = status;
//   //   if (priority) query.priority = priority;
//   //   if (category) query.category = category;
//   //   if (technicianId) query.technicianId = technicianId;
//   //   if (customerId) query.customerId = customerId;
//   //   if (search) {
//   //     query.$or = [
//   //       { title: { $regex: search, $options: 'i' } },
//   //       { ticketNumber: { $regex: search, $options: 'i' } },
//   //       { description: { $regex: search, $options: 'i' } },
//   //     ];
//   //   }

//   //   const skip = (page - 1) * limit;
//   //   const [tickets, total] = await Promise.all([
//   //     Ticket.find(query)
//   //       .populate('customerId', 'name email')
//   //       .populate('technicianId', 'userId')
//   //       .sort({ createdAt: -1 })
//   //       .skip(skip)
//   //       .limit(limit),
//   //     Ticket.countDocuments(query),
//   //   ]);

//   //   return { tickets, total, page, limit };
//   // }
// static async getTickets(tenantId: string, options: {
//   page?: number;
//   limit?: number;
//   status?: string;
//   priority?: string;
//   category?: string;
//   search?: string;
//   technicianId?: string;
//   customerId?: string;
// }) {
//   await connectDB();

//   const { page = 1, limit = 10, status, priority, category, search } = options;

//   const query: any = { tenantId };
//   if (status) query.status = status;
//   if (priority) query.priority = priority;
//   if (category) query.category = category;
//   if (search) {
//     query.$or = [
//       { title: { $regex: search, $options: 'i' } },
//       { ticketNumber: { $regex: search, $options: 'i' } },
//     ];
//   }

//   const [tickets, total, statsAgg] = await Promise.all([
//     Ticket.find(query)
//       .populate('customerId', 'name email')
//       .populate('technicianId', 'name')
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean(),
//     Ticket.countDocuments(query),
//     // ✅ Stats for all statuses
//     Ticket.aggregate([
//       { $match: { tenantId } },
//       { $group: { _id: '$status', count: { $sum: 1 } } },
//     ]),
//   ]);

//   // Stats map
//   const statsMap: Record<string, number> = {};
//   statsAgg.forEach((s: any) => { statsMap[s._id] = s.count; });

//   return {
//     tickets,
//     page,
//     limit,
//     total,
//     stats: {
//       open: statsMap['open'] ?? 0,
//       inProgress: (statsMap['in_progress'] ?? 0),
//       pending: (statsMap['pending_parts'] ?? 0) + (statsMap['pending_customer'] ?? 0),
//       resolved: statsMap['resolved'] ?? 0,
//     },
//   };
// }
 

  

//   static async assignTicket(ticketId: string, technicianId: string, userId: string, tenantId: string) {
//     await connectDB();

//     const user = await User.findById(userId);
//     const ticket = await Ticket.findOne({ _id: ticketId, tenantId });

//     if (!ticket) return null;

//     // ticket.technicianId = technicianId;
//     ticket.technicianId = new Types.ObjectId(technicianId);
//     ticket.status = 'in_progress';

//     ticket.set('timeline', [
//       ...(ticket.timeline || []),
//       {
//         action: 'assigned',
//         description: `Assigned to technician`,
//         performedBy: userId,
//         performedByName: user?.name || 'System',
//         metadata: { technicianId },
//         createdAt: new Date(),
//       },
//     ]);

//     await ticket.save();
//     return ticket;
//   }

//  static async getTicketById(id: string, tenantId: string) {
//   await connectDB();
//   return Ticket.findOne({ _id: id, tenantId })
//     .populate('customerId', 'name email phone')
//     .populate('technicianId', 'name email')
//     .lean();
// }

// static async updateTicket(id: string, data: any, userId: string, tenantId: string) {
//   await connectDB();
//   const user = await User.findById(userId).select('name');

//   const ticket = await Ticket.findOneAndUpdate(
//     { _id: id, tenantId },
//     {
//       ...data,
//       $push: {
//         timeline: {
//           action: 'ticket_updated',
//           description: 'Ticket details updated',
//           performedBy: userId,
//           performedByName: user?.name ?? 'System',
//         },
//       },
//     },
//     { new: true }
//   ).populate('customerId', 'name email').populate('technicianId', 'name');

//   return ticket;
// }

// static async changeStatus(id: string, status: string, userId: string, tenantId: string) {
//   await connectDB();
//   const user = await User.findById(userId).select('name');

//   const statusLabels: Record<string, string> = {
//     open: 'Open', in_progress: 'In Progress',
//     pending_parts: 'Pending Parts', pending_customer: 'Pending Customer',
//     resolved: 'Resolved', closed: 'Closed', cancelled: 'Cancelled',
//   };

//   const ticket = await Ticket.findOneAndUpdate(
//     { _id: id, tenantId },
//     {
//       status,
//       ...(status === 'resolved' ? { actualCompletionDate: new Date() } : {}),
//       $push: {
//         timeline: {
//           action: 'status_changed',
//           description: `Status changed to ${statusLabels[status] ?? status}`,
//           performedBy: userId,
//           performedByName: user?.name ?? 'System',
//           metadata: { status },
//         },
//       },
//     },
//     { new: true }
//   ).populate('customerId', 'name email').populate('technicianId', 'name');

//   return ticket;
// }

// static async addNote(id: string, note: { content: string; isInternal: boolean }, userId: string, tenantId: string) {
//   await connectDB();
//   const user = await User.findById(userId).select('name');

//   const ticket = await Ticket.findOneAndUpdate(
//     { _id: id, tenantId },
//     {
//       $push: {
//         notes: {
//           content: note.content,
//           authorId: userId,
//           authorName: user?.name ?? 'Unknown',
//           isInternal: note.isInternal,
//           createdAt: new Date(),
//         },
//         timeline: {
//           action: 'note_added',
//           description: note.isInternal ? 'Internal note added' : 'Note added',
//           performedBy: userId,
//           performedByName: user?.name ?? 'Unknown',
//         },
//       },
//     },
//     { new: true }
//   ).populate('customerId', 'name email').populate('technicianId', 'name');

//   return ticket;
// }

// static async deleteTicket(id: string, tenantId: string) {
//   await connectDB();
//   return Ticket.findOneAndDelete({ _id: id, tenantId });
// }
// }

import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { SLA_DEFAULTS } from '@/utils/constants';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

export class TicketService {
  static async createTicket(data: any, userId: string, tenantId: string) {
    await connectDB();

    const count = await Ticket.countDocuments({ tenantId });
    const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
    const ticketId = `TID-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const customerId = data.customerId && Types.ObjectId.isValid(data.customerId)
      ? new Types.ObjectId(data.customerId)
      : new Types.ObjectId(userId);

    const technicianId = data.technicianId && Types.ObjectId.isValid(data.technicianId)
      ? new Types.ObjectId(data.technicianId)
      : undefined;

    // ✅ SLA auto-calculate
    const priority = data.priority ?? 'medium';
    const slaConfig = SLA_DEFAULTS[priority as keyof typeof SLA_DEFAULTS] ?? SLA_DEFAULTS.medium;
    const now = new Date();
    const sla = {
      responseDeadline: new Date(now.getTime() + slaConfig.responseHours * 3600000),
      resolutionDeadline: new Date(now.getTime() + slaConfig.resolutionHours * 3600000),
      isResponseBreached: false,
      isResolutionBreached: false,
    };

    // ✅ Timeline — first event
    const creatorUser = await User.findById(userId).select('name').lean() as any;
    const timeline = [{
      action: 'ticket_created',
      description: 'Ticket created',
      performedBy: new Types.ObjectId(userId),
      performedByName: creatorUser?.name ?? 'System',
      createdAt: now,
    }];

    const ticket = await Ticket.create({
      ticketNumber,
      ticketId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority,
      status: 'open',
      customerId,
      technicianId,
      serviceCenterId: data.serviceCenterId && Types.ObjectId.isValid(data.serviceCenterId)
        ? new Types.ObjectId(data.serviceCenterId)
        : undefined,
      tenantId,
      sla,
      // timeline,
      estimatedCompletionDate: data.estimatedCompletionDate || undefined,
    });

    return ticket;
  }

  static async getTickets(tenantId: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    technicianId?: string;
    customerId?: string;
  }) {
    await connectDB();

    const { page = 1, limit = 10, status, priority, category, search, technicianId, customerId } = options;

    const query: any = { tenantId };
    if (status) query.status = { $in: status.split(',') };
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (technicianId && technicianId !== 'me' && Types.ObjectId.isValid(technicianId)) {
      query.technicianId = new Types.ObjectId(technicianId);
    }
    if (customerId && Types.ObjectId.isValid(customerId)) {
      query.customerId = new Types.ObjectId(customerId);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [tickets, total, statsAgg] = await Promise.all([
      Ticket.find(query)
        .populate('customerId', 'name email phone')
        .populate('technicianId', 'name email')
        .populate('serviceCenterId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(query),
      Ticket.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statsMap: Record<string, number> = {};
    statsAgg.forEach((s: any) => { statsMap[s._id] = s.count; });

    return {
      tickets,
      page,
      limit,
      total,
      stats: {
        open: statsMap['open'] ?? 0,
        inProgress: statsMap['in_progress'] ?? 0,
        pending: (statsMap['pending_parts'] ?? 0) + (statsMap['pending_customer'] ?? 0),
        resolved: statsMap['resolved'] ?? 0,
      },
    };
  }

  static async getTicketById(id: string, tenantId: string) {
    await connectDB();
    return Ticket.findOne({ _id: id, tenantId })
      .populate('customerId', 'name email phone')
      .populate('technicianId', 'name email')
      .populate('serviceCenterId', 'name address')
      .lean();
  }

  static async updateTicket(id: string, data: any, userId: string, tenantId: string) {
    await connectDB();
    const user = await User.findById(userId).select('name').lean() as any;

    // Build timeline event
    const changes: string[] = [];
    if (data.title) changes.push('title');
    if (data.priority) changes.push('priority');
    if (data.category) changes.push('category');
    if (data.technicianId) changes.push('technician');
    if (data.serviceCenterId) changes.push('service center');

    // Convert IDs
    if (data.customerId && Types.ObjectId.isValid(data.customerId)) {
      data.customerId = new Types.ObjectId(data.customerId);
    }
    if (data.technicianId && Types.ObjectId.isValid(data.technicianId)) {
      data.technicianId = new Types.ObjectId(data.technicianId);
    } else if (data.technicianId === '') {
      data.technicianId = undefined;
    }
    if (data.serviceCenterId && Types.ObjectId.isValid(data.serviceCenterId)) {
      data.serviceCenterId = new Types.ObjectId(data.serviceCenterId);
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, tenantId },
      {
        ...data,
        $push: {
          timeline: {
            action: 'ticket_updated',
            description: changes.length > 0
              ? `Updated: ${changes.join(', ')}`
              : 'Ticket details updated',
            performedBy: new Types.ObjectId(userId),
            performedByName: user?.name ?? 'System',
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )
      .populate('customerId', 'name email phone')
      .populate('technicianId', 'name email')
      .populate('serviceCenterId', 'name');

    return ticket;
  }

  static async changeStatus(id: string, status: string, userId: string, tenantId: string) {
    await connectDB();
    const user = await User.findById(userId).select('name').lean() as any;

    const statusLabels: Record<string, string> = {
      open: 'Open', in_progress: 'In Progress',
      pending_parts: 'Pending Parts', pending_customer: 'Pending Customer',
      resolved: 'Resolved', closed: 'Closed', cancelled: 'Cancelled',
    };

    const updateData: any = {
      status,
      $push: {
        timeline: {
          action: 'status_changed',
          description: `Status changed to ${statusLabels[status] ?? status}`,
          performedBy: new Types.ObjectId(userId),
          performedByName: user?.name ?? 'System',
          metadata: { newStatus: status },
          createdAt: new Date(),
        },
      },
    };

    // Set completion date when resolved
    if (status === 'resolved') {
      updateData.actualCompletionDate = new Date();
    }

    // Check SLA breach
    const existing = await Ticket.findOne({ _id: id, tenantId }).select('sla').lean() as any;
    if (existing?.sla) {
      const now = new Date();
      if (!existing.sla.isResponseBreached && now > new Date(existing.sla.responseDeadline)) {
        updateData['sla.isResponseBreached'] = true;
      }
      if (!existing.sla.isResolutionBreached && now > new Date(existing.sla.resolutionDeadline)) {
        updateData['sla.isResolutionBreached'] = true;
      }
    }

    const ticket = await Ticket.findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true })
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
    const user = await User.findById(userId).select('name').lean() as any;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, tenantId },
      {
        $push: {
          notes: {
            content: note.content,
            authorId: new Types.ObjectId(userId),
            authorName: user?.name ?? 'Unknown',
            isInternal: note.isInternal,
            createdAt: new Date(),
          },
          timeline: {
            action: 'note_added',
            description: note.isInternal ? 'Internal note added' : 'Note added by ' + (user?.name ?? 'team'),
            performedBy: new Types.ObjectId(userId),
            performedByName: user?.name ?? 'Unknown',
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

  static async assignTicket(
    ticketId: string,
    technicianId: string,
    userId: string,
    tenantId: string
  ) {
    await connectDB();
    const [user, technician] = await Promise.all([
      User.findById(userId).select('name').lean() as any,
      User.findById(technicianId).select('name').lean() as any,
    ]);

    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, tenantId },
      {
        technicianId: new Types.ObjectId(technicianId),
        status: 'in_progress',
        $push: {
          timeline: {
            action: 'assigned',
            description: `Assigned to ${technician?.name ?? 'technician'}`,
            performedBy: new Types.ObjectId(userId),
            performedByName: user?.name ?? 'System',
            metadata: { technicianId, technicianName: technician?.name },
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

  static async deleteTicket(id: string, tenantId: string) {
    await connectDB();
    return Ticket.findOneAndDelete({ _id: id, tenantId });
  }

  static async getUserById(userId: string) {
    await connectDB();
    return User.findById(userId).select('-password');
  }
}