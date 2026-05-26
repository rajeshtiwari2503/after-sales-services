import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';
export type NotificationEvent =
  | 'ticket_created'
  | 'ticket_assigned'
  | 'ticket_status_changed'
  | 'ticket_resolved'
  | 'ticket_commented'
  | 'ticket_escalated'
  | 'sla_warning'
  | 'sla_breached'
  | 'technician_assigned'
  | 'sc_assigned'
  | 'low_stock'
  | 'warranty_expiry'
  | 'invoice_generated'
  | 'audit_log'
  | 'new_feedback'
  | 'high_volume'
  | 'inventory_transfer'
  | 'system';

export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId: string;
  title: string;
  message: string;
  link?: string;
  type: NotificationType;
  event: NotificationEvent;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    title:    { type: String, required: true },
    message:  { type: String, required: true },
    link:     { type: String, default: null },
    type:     { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
    event:    {
      type: String,
      enum: [
        'ticket_created', 'ticket_assigned', 'ticket_status_changed',
        'ticket_resolved', 'ticket_commented', 'ticket_escalated',
        'sla_warning', 'sla_breached', 'technician_assigned', 'sc_assigned',
        'low_stock', 'warranty_expiry', 'invoice_generated', 'audit_log',
        'new_feedback', 'high_volume', 'inventory_transfer', 'system',
      ],
      default: 'system',
    },
    isRead:   { type: Boolean, default: false, index: true },
    readAt:   { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ tenantId: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

const Notification: Model<NotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>('Notification', NotificationSchema);

export default Notification;