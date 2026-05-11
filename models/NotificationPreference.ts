import mongoose, { Document, Schema } from 'mongoose'
import type { NotificationPreference as IPref } from '@/types/notification'

export interface NotificationPreferenceDocument extends Omit<IPref, '_id'>, Document {}

const PreferenceSchema = new Schema<NotificationPreferenceDocument>(
  {
    userId: { type: String, required: true, unique: true },
    channels: {
      in_app:   { type: Boolean, default: true },
      email:    { type: Boolean, default: true },
      push:     { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
      sms:      { type: Boolean, default: false },
    },
    types: { type: Schema.Types.Mixed, default: {} },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start:   { type: String, default: '22:00' },
      end:     { type: String, default: '08:00' },
    },
    frequency: { type: String, enum: ['realtime','digest_hourly','digest_daily'], default: 'realtime' },
  },
  { timestamps: true }
)

export const NotificationPreferenceModel =
  mongoose.models.NotificationPreference ||
  mongoose.model<NotificationPreferenceDocument>('NotificationPreference', PreferenceSchema)