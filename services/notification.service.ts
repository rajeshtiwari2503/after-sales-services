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
  link?: string;
  metadata?: Record<string, any>;
}

interface CreateBulkInput {
  userIds: string[];
  tenantId: string;
  title: string;
  message: string;
  type?: NotificationType;
  event?: NotificationEvent;
  link?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  static async create(data: CreateInput) {
    await connectDB();
    return Notification.create({
      userId:   new mongoose.Types.ObjectId(data.userId.toString()),
      tenantId: data.tenantId,
      title:    data.title,
      message:  data.message,
      type:     data.type  ?? 'info',
      event:    data.event ?? 'system',
      link:     data.link ?? undefined,
      metadata: data.metadata ?? {},
      isRead:   false,
    });
  }

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
        link:     d.link ?? undefined,
        metadata: d.metadata ?? {},
        isRead:   false,
      }))
    );
  }

  static async createBulk(data: CreateBulkInput) {
    if (!data.userIds.length) return;
    return this.createMany(
      data.userIds.map(uid => ({
        userId:   uid,
        tenantId: data.tenantId,
        title:    data.title,
        message:  data.message,
        type:     data.type,
        event:    data.event,
        link:     data.link,
        metadata: data.metadata,
      }))
    );
  }

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
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId), tenantId, isRead: false }),
    ]);
    return { notifications, total, unreadCount, page, limit };
  }

  static async markAsRead(notificationId: string, userId: string) {
    await connectDB();
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId: new mongoose.Types.ObjectId(userId) },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string, tenantId: string) {
    await connectDB();
    return Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), tenantId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  static async delete(notificationId: string, userId: string) {
    await connectDB();
    return Notification.findOneAndDelete({
      _id: notificationId,
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  /* ── Ticket event helpers ── */
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
        title:    'New Ticket Created',
        message:  `${opts.ticketNumber}: ${opts.title}`,
        type:     'info' as NotificationType,
        event:    'ticket_created' as NotificationEvent,
        link:     `/dashboard/tickets/${opts.ticketId}`,
        metadata: { ticketId: opts.ticketId, ticketNumber: opts.ticketNumber },
      }))
    );
  }

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
      title:    'Ticket Assigned to You',
      message:  `${opts.ticketNumber}: ${opts.title} — assigned by ${opts.assignedByName}`,
      type:     'info',
      event:    'ticket_assigned',
      link:     `/technician/jobs`,
      metadata: { ticketId: opts.ticketId, ticketNumber: opts.ticketNumber },
    });
  }

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
        title:    'New Ticket Routed to Your Service Center',
        message:  `${opts.ticketNumber}: ${opts.title} → ${opts.scName}`,
        type:     'info' as NotificationType,
        event:    'sc_assigned' as NotificationEvent,
        link:     `/service-center/tickets`,
        metadata: { ticketId: opts.ticketId, ticketNumber: opts.ticketNumber },
      }))
    );
  }

  static async onStatusChange(opts: {
    recipientUserIds: string[];
    tenantId: string;
    ticketId: string;
    ticketNumber: string;
    fromStatus: string;
    toStatus: string;
    changedByName: string;
    customerRole?: boolean;   // true → link to customer portal
  }) {
    const isResolved = ['resolved', 'closed'].includes(opts.toStatus);
    const link = opts.customerRole
      ? `/customer/tickets/${opts.ticketId}`
      : `/dashboard/tickets/${opts.ticketId}`;

    return this.createMany(
      opts.recipientUserIds.map(uid => ({
        userId:   uid,
        tenantId: opts.tenantId,
        title:    isResolved ? 'Ticket Resolved ✓' : 'Ticket Status Updated',
        message:  `${opts.ticketNumber} changed: ${opts.fromStatus.replace(/_/g, ' ')} → ${opts.toStatus.replace(/_/g, ' ')} by ${opts.changedByName}`,
        type:     (isResolved ? 'success' : 'info') as NotificationType,
        event:    (isResolved ? 'ticket_resolved' : 'ticket_status_changed') as NotificationEvent,
        link,
        metadata: {
          ticketId:     opts.ticketId,
          ticketNumber: opts.ticketNumber,
          fromStatus:   opts.fromStatus,
          toStatus:     opts.toStatus,
        },
      }))
    );
  }

  /** Low stock alert — notify admins */
  static async onLowStock(opts: {
    adminUserIds: string[];
    tenantId: string;
    itemName: string;
    quantity: number;
    minQuantity: number;
  }) {
    return this.createMany(
      opts.adminUserIds.map(uid => ({
        userId:   uid,
        tenantId: opts.tenantId,
        title:    'Low Stock Alert',
        message:  `${opts.itemName} is low: ${opts.quantity} remaining (min: ${opts.minQuantity})`,
        type:     'warning' as NotificationType,
        event:    'low_stock' as NotificationEvent,
        link:     '/dashboard/inventory',
        metadata: { itemName: opts.itemName, quantity: opts.quantity },
      }))
    );
  }

  /** Audit log — notify admins on failed/warning actions */
  static async onAuditLog(opts: {
    adminUserIds: string[];
    tenantId: string;
    action: string;
    module: string;
    status: 'success' | 'failed' | 'warning';
    message?: string;
    entityName?: string;
  }) {
    if (opts.status === 'success') return;
    const type = opts.status === 'failed' ? 'error' : 'warning';
    return this.createMany(
      opts.adminUserIds.map(uid => ({
        userId:   uid,
        tenantId: opts.tenantId,
        title:    `Audit: ${opts.action}`,
        message:  opts.message ?? `${opts.module} — ${opts.entityName ?? opts.action}`,
        type:     type as NotificationType,
        event:    'audit_log' as NotificationEvent,
        link:     '/dashboard/audit-logs',
        metadata: { action: opts.action, module: opts.module, status: opts.status },
      }))
    );
  }

  /** Invoice generated — notify customer */
  static async onInvoiceGenerated(opts: {
    customerUserId: string;
    tenantId: string;
    invoiceNumber: string;
    invoiceId: string;
    total: number;
  }) {
    return this.create({
      userId:   opts.customerUserId,
      tenantId: opts.tenantId,
      title:    'Invoice Generated',
      message:  `Invoice ${opts.invoiceNumber} for ₹${opts.total.toLocaleString('en-IN')} is ready`,
      type:     'success',
      event:    'invoice_generated',
      link:     `/customer/invoices`,
      metadata: { invoiceId: opts.invoiceId, invoiceNumber: opts.invoiceNumber },
    });
  }
}