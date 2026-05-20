 // services/notification.service.ts  — NEW FILE
// Call NotificationService.create(...) from ticket routes whenever events occur.

import connectDB from '@/lib/db';
import Notification, { NotificationEvent, NotificationType } from '@/models/Notification';
import mongoose from 'mongoose';

interface CreateInput {
  userId: string | mongoose.Types.ObjectId;
  tenantId: string;
  title: string;
  message: string;
  type?: NotificationType;
  event?: NotificationEvent;
  metadata?: {
    ticketId?: string;
    ticketNumber?: string;
    technicianId?: string;
    serviceCenterId?: string;
    fromStatus?: string;
    toStatus?: string;
  };
}

export class NotificationService {
  /* ── Create one notification ─────────────────────────────────────────── */
  static async create(data: CreateInput) {
    await connectDB();
    return Notification.create({
      userId:   new mongoose.Types.ObjectId(data.userId.toString()),
      tenantId: data.tenantId,
      title:    data.title,
      message:  data.message,
      type:     data.type  ?? 'info',
      event:    data.event ?? 'system',
      metadata: data.metadata ?? {},
      isRead:   false,
    });
  }

  /* ── Create multiple notifications at once ───────────────────────────── */
  static async createMany(items: CreateInput[]) {
    if (!items.length) return;
    await connectDB();
    return Notification.insertMany(
      items.map(d => ({
        userId:   new mongoose.Types.ObjectId(d.userId.toString()),
        tenantId: d.tenantId,
        title:    d.title,
        message:  d.message,
        type:     d.type  ?? 'info',
        event:    d.event ?? 'system',
        metadata: d.metadata ?? {},
        isRead:   false,
      }))
    );
  }

  /* ── Get notifications for a user ────────────────────────────────────── */
  static async getForUser(
    userId: string,
    tenantId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ) {
    await connectDB();
    const { page = 1, limit = 20, unreadOnly = false } = options;

    const filter: Record<string, any> = {
      userId: new mongoose.Types.ObjectId(userId),
      tenantId,
    };
    if (unreadOnly) filter.isRead = false;

    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId), tenantId, isRead: false }),
    ]);

    return { notifications, total, unreadCount, page, limit };
  }

  /* ── Mark one notification as read ──────────────────────────────────── */
  static async markAsRead(notificationId: string, userId: string) {
    await connectDB();
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId: new mongoose.Types.ObjectId(userId) },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  /* ── Mark all notifications as read for a user ───────────────────────── */
  static async markAllAsRead(userId: string, tenantId: string) {
    await connectDB();
    return Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), tenantId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  /* ── Delete a notification ───────────────────────────────────────────── */
  static async delete(notificationId: string, userId: string) {
    await connectDB();
    return Notification.findOneAndDelete({
      _id: notificationId,
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  /* ── Ticket-event helpers (call these from ticket API routes) ─────────── */

  /** Called when a new ticket is created — notifies brand manager */
  static async onTicketCreated(opts: {
    managerUserIds: string[];
    tenantId: string;
    ticketId: string;
    ticketNumber: string;
    title: string;
  }) {
    return this.createMany(
      opts.managerUserIds.map(uid => ({
        userId:   uid,
        tenantId: opts.tenantId,
        title:    'New ticket created',
        message:  `${opts.ticketNumber}: ${opts.title}`,
        type:     'info' as NotificationType,
        event:    'ticket_created' as NotificationEvent,
        metadata: { ticketId: opts.ticketId, ticketNumber: opts.ticketNumber },
      }))
    );
  }

  /** Called when ticket is assigned to a technician */
  static async onTicketAssigned(opts: {
    technicianUserId: string;
    assignedByName: string;
    tenantId: string;
    ticketId: string;
    ticketNumber: string;
    title: string;
  }) {
    return this.create({
      userId:   opts.technicianUserId,
      tenantId: opts.tenantId,
      title:    'Ticket assigned to you',
      message:  `${opts.ticketNumber}: ${opts.title} — assigned by ${opts.assignedByName}`,
      type:     'info',
      event:    'ticket_assigned',
      metadata: { ticketId: opts.ticketId, ticketNumber: opts.ticketNumber },
    });
  }

  /** Called when ticket is routed to a service center */
  static async onTicketRoutedToSC(opts: {
    scOperatorUserIds: string[];
    tenantId: string;
    ticketId: string;
    ticketNumber: string;
    title: string;
    scName: string;
  }) {
    return this.createMany(
      opts.scOperatorUserIds.map(uid => ({
        userId:   uid,
        tenantId: opts.tenantId,
        title:    'New ticket routed to your service center',
        message:  `${opts.ticketNumber}: ${opts.title} → ${opts.scName}`,
        type:     'info' as NotificationType,
        event:    'sc_assigned' as NotificationEvent,
        metadata: { ticketId: opts.ticketId, ticketNumber: opts.ticketNumber },
      }))
    );
  }

  /** Called when ticket status changes */
  static async onStatusChange(opts: {
    recipientUserIds: string[];
    tenantId: string;
    ticketId: string;
    ticketNumber: string;
    fromStatus: string;
    toStatus: string;
    changedByName: string;
  }) {
    const isResolved = ['resolved', 'closed'].includes(opts.toStatus);
    return this.createMany(
      opts.recipientUserIds.map(uid => ({
        userId:   uid,
        tenantId: opts.tenantId,
        title:    isResolved ? 'Ticket resolved' : 'Ticket status updated',
        message:  `${opts.ticketNumber} status changed from ${opts.fromStatus.replace('_', ' ')} → ${opts.toStatus.replace('_', ' ')} by ${opts.changedByName}`,
        type:     (isResolved ? 'success' : 'info') as NotificationType,
        event:    (isResolved ? 'ticket_resolved' : 'ticket_status_changed') as NotificationEvent,
        metadata: {
          ticketId:     opts.ticketId,
          ticketNumber: opts.ticketNumber,
          fromStatus:   opts.fromStatus,
          toStatus:     opts.toStatus,
        },
      }))
    );
  }
}