 import mongoose, { Schema, Document, Model } from 'mongoose';
import { Notification as NotificationType } from '@/types/notification';

export interface NotificationDocument extends Omit<NotificationType, '_id'>, Document {}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'ticket_created',
        'ticket_assigned',
        'ticket_updated',
        'ticket_resolved',
        'sla_warning',
        'sla_breach',
        'feedback_received',
        'low_stock',
        'warranty_expiry',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    channels: [{
      type: String,
      enum: ['in_app', 'email', 'push', 'whatsapp', 'sms'],
    }],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<NotificationDocument> =
  mongoose.models.Notification || mongoose.model<NotificationDocument>('Notification', NotificationSchema);

export default Notification;
