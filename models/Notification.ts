 // models/Notification.ts  — NEW FILE
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
  | 'system';

export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;     // recipient
  tenantId: string;
  title: string;
  message: string;
  actionUrl: string;
  type: NotificationType;
  event: NotificationEvent;
  isRead: boolean;
  readAt?: Date;
  metadata?: {
    ticketId?: string;
    ticketNumber?: string;
    technicianId?: string;
    serviceCenterId?: string;
    fromStatus?: string;
    toStatus?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tenantId: { type: String, required: true, index: true },
    title:    { type: String, required: true },
    message:  { type: String, required: true },
    type:     { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
    event:    {
      type: String,
      enum: [
        'ticket_created', 'ticket_assigned', 'ticket_status_changed',
        'ticket_resolved', 'ticket_commented', 'ticket_escalated', 'sla_warning', 'sla_breached',
        'technician_assigned', 'sc_assigned', 'system',
      ],
      default: 'system',
    },
    isRead:   { type: Boolean, default: false, index: true },
    readAt:   { type: Date },
    actionUrl: {
  type: String,
  required: false,
  default: null,
},
    metadata: {
      ticketId:        { type: String },
      ticketNumber:    { type: String },
      technicianId:    { type: String },
      serviceCenterId: { type: String },
      fromStatus:      { type: String },
      toStatus:        { type: String },
    },
  },
  { timestamps: true }
);

// Compound indexes for fast per-user queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ tenantId: 1, createdAt: -1 });

// Auto-delete notifications older than 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

const Notification: Model<NotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>('Notification', NotificationSchema);

export default Notification;