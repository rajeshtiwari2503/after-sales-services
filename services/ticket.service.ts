import Ticket from '@/models/Ticket';
import User from '@/models/User';
import Tenant from '@/models/Tenant';
import { CreateTicketInput, UpdateTicketInput } from '@/schemas/ticket.schema';
import { SLA_DEFAULTS } from '@/utils/constants';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

export class TicketService {
 static async createTicket(data: any, userId: string, tenantId: string) {
  await connectDB();

  // ✅ ticketNumber pehle generate karo
  const count = await Ticket.countDocuments({ tenantId });
  const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;

  const { Types } = require('mongoose');
  const customerId = data.customerId && Types.ObjectId.isValid(data.customerId)
    ? new Types.ObjectId(data.customerId)
    : new Types.ObjectId(userId);

  const technicianId = data.technicianId && Types.ObjectId.isValid(data.technicianId)
    ? new Types.ObjectId(data.technicianId)
    : undefined;

  // ✅ ticketNumber explicitly pass karo — pre('save') pe depend mat karo
  const ticket = await Ticket.create({
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority || 'medium',
    status: 'open',
    ticketNumber,          // ← yahan explicitly
    customerId,
    technicianId,
    tenantId,
    estimatedCompletionDate: data.estimatedCompletionDate || undefined,
  });

  return ticket;
}

  // static async getTickets(
  //   tenantId: string,
  //   options: {
  //     page?: number;
  //     limit?: number;
  //     status?: string;
  //     priority?: string;
  //     category?: string;
  //     technicianId?: string;
  //     customerId?: string;
  //     search?: string;
  //   }
  // ) {
  //   await connectDB();

  //   const { page = 1, limit = 10, status, priority, category, technicianId, customerId, search } = options;

  //   const query: Record<string, any> = { tenantId };

  //   if (status) query.status = status;
  //   if (priority) query.priority = priority;
  //   if (category) query.category = category;
  //   if (technicianId) query.technicianId = technicianId;
  //   if (customerId) query.customerId = customerId;
  //   if (search) {
  //     query.$or = [
  //       { title: { $regex: search, $options: 'i' } },
  //       { ticketNumber: { $regex: search, $options: 'i' } },
  //       { description: { $regex: search, $options: 'i' } },
  //     ];
  //   }

  //   const skip = (page - 1) * limit;
  //   const [tickets, total] = await Promise.all([
  //     Ticket.find(query)
  //       .populate('customerId', 'name email')
  //       .populate('technicianId', 'userId')
  //       .sort({ createdAt: -1 })
  //       .skip(skip)
  //       .limit(limit),
  //     Ticket.countDocuments(query),
  //   ]);

  //   return { tickets, total, page, limit };
  // }
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

  const { page = 1, limit = 10, status, priority, category, search } = options;

  const query: any = { tenantId };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { ticketNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const [tickets, total, statsAgg] = await Promise.all([
    Ticket.find(query)
      .populate('customerId', 'name email')
      .populate('technicianId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Ticket.countDocuments(query),
    // ✅ Stats for all statuses
    Ticket.aggregate([
      { $match: { tenantId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  // Stats map
  const statsMap: Record<string, number> = {};
  statsAgg.forEach((s: any) => { statsMap[s._id] = s.count; });

  return {
    tickets,
    page,
    limit,
    total,
    stats: {
      open: statsMap['open'] ?? 0,
      inProgress: (statsMap['in_progress'] ?? 0),
      pending: (statsMap['pending_parts'] ?? 0) + (statsMap['pending_customer'] ?? 0),
      resolved: statsMap['resolved'] ?? 0,
    },
  };
}
  static async getTicketById(ticketId: string, tenantId: string) {
    await connectDB();
    return Ticket.findOne({ _id: ticketId, tenantId })
      .populate('customerId', 'name email phone')
      .populate('technicianId');
  }

  static async updateTicket(ticketId: string, data: UpdateTicketInput, userId: string, tenantId: string) {
    await connectDB();

    const user = await User.findById(userId);
    const ticket = await Ticket.findOne({ _id: ticketId, tenantId });

    if (!ticket) return null;

    const changes: string[] = [];
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && ticket.get(key) !== value) {
        changes.push(`${key}: ${ticket.get(key)} → ${value}`);
      }
    });

    if (changes?.length > 0) {
      ticket.set('timeline', [
        ...(ticket.timeline || []),
        {
          action: 'updated',
          description: `Updated: ${changes.join(', ')}`,
          performedBy: userId,
          performedByName: user?.name || 'System',
          createdAt: new Date(),
        },
      ]);
    }
    Object.assign(ticket, data);
    await ticket.save();

    return ticket;
  }

  static async assignTicket(ticketId: string, technicianId: string, userId: string, tenantId: string) {
    await connectDB();

    const user = await User.findById(userId);
    const ticket = await Ticket.findOne({ _id: ticketId, tenantId });

    if (!ticket) return null;

    // ticket.technicianId = technicianId;
    ticket.technicianId = new Types.ObjectId(technicianId);
    ticket.status = 'in_progress';

    ticket.set('timeline', [
      ...(ticket.timeline || []),
      {
        action: 'assigned',
        description: `Assigned to technician`,
        performedBy: userId,
        performedByName: user?.name || 'System',
        metadata: { technicianId },
        createdAt: new Date(),
      },
    ]);

    await ticket.save();
    return ticket;
  }

  static async updateStatus(ticketId: string, status: string, userId: string, tenantId: string, reason?: string) {
    await connectDB();

    const user = await User.findById(userId);
    const ticket = await Ticket.findOne({ _id: ticketId, tenantId });

    if (!ticket) return null;

    const oldStatus = ticket.status as string;
    ticket.status = status as any;

    if (status === 'resolved' || status === 'closed') {
      ticket.actualCompletionDate = new Date();
    }

    ticket.set({
      timeline: [
        ...(ticket.timeline || []),
        {
          action: 'status_changed',
          description: `Status changed from ${oldStatus} to ${status}${reason ? `: ${reason}` : ''}`,
          performedBy: userId,
          performedByName: user?.name || 'System',
          metadata: { oldStatus, newStatus: status, reason },
          createdAt: new Date(),
        },
      ],
    });

    await ticket.save();
    return ticket;
  }

  static async addNote(ticketId: string, content: string, isInternal: boolean, userId: string, tenantId: string) {
    await connectDB();

    const user = await User.findById(userId);
    const ticket = await Ticket.findOne({ _id: ticketId, tenantId });

    if (!ticket) return null;

    ticket.set({
      notes: [
        ...(ticket.notes || []),
        {
          content,
          authorId: userId,
          authorName: user?.name || 'Unknown',
          isInternal,
          createdAt: new Date(),
        },
      ],
    });

    ticket.set({
      timeline: [
        ...(ticket.timeline || []),
        {
          action: 'note_added',
          description: `${isInternal ? 'Internal note' : 'Note'} added`,
          performedBy: userId,
          performedByName: user?.name || 'System',
          createdAt: new Date(),
        },
      ],
    });

    await ticket.save();
    return ticket;
  }
}
