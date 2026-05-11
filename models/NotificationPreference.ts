 import mongoose, { Schema, Document, Model } from 'mongoose';
import { NotificationPreference as NotificationPreferenceType } from '@/types/notification';

export interface NotificationPreferenceDocument extends Omit<NotificationPreferenceType, '_id'>, Document {}

const NotificationPreferenceSchema = new Schema<NotificationPreferenceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
    },
    email: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
    whatsapp: {
      type: Boolean,
      default: false,
    },
    sms: {
      type: Boolean,
      default: false,
    },
    inApp: {
      type: Boolean,
      default: true,
    },
    quietHoursStart: String,
    quietHoursEnd: String,
    preferences: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

NotificationPreferenceSchema.index({ userId: 1, tenantId: 1 }, { unique: true });

const NotificationPreference: Model<NotificationPreferenceDocument> =
  mongoose.models.NotificationPreference ||
  mongoose.model<NotificationPreferenceDocument>('NotificationPreference', NotificationPreferenceSchema);

export default NotificationPreference;
