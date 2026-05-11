 
     
//    import mongoose, {
//   Schema,
// } from "mongoose";

// const NotificationSchema =
//   new Schema(
//     {
//       userId: {
//         type: String,
//         required: true,
//       },

//       title: {
//         type: String,
//         required: true,
//       },

//       message: {
//         type: String,
//         required: true,
//       },

//       type: {
//         type: String,
//         enum: [
//           "ticket",
//           "chat",
//           "sla",
//           "system",
//           "inventory",
//           "billing",
//              "SUCCESS",
//         "WARNING",
//         "ERROR",
//         "INFO",
//         ],
//         default: "system",
//       },

//       isRead: {
//         type: Boolean,
//         default: false,
//       },

//       actionUrl: {
//         type: String,
//       },

//       metadata: {
//         type: Object,
//       },
//     },
//     {
//       timestamps: true,
//     }
//   );

// export default mongoose.models
//   .Notification ||
//   mongoose.model(
//     "Notification",
//     NotificationSchema
//   );


import mongoose, { Document, Schema } from 'mongoose'
import type { Notification as INotification } from '@/types/notification'

export interface NotificationDocument extends Omit<INotification, '_id'>, Document {}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId:         { type: String, required: true, index: true },
    title:          { type: String, required: true },
    message:        { type: String, required: true },
    type:           { type: String, required: true },
    priority:       { type: String, enum: ['low','medium','high','critical'], default: 'medium' },
    status:         { type: String, enum: ['unread','read','archived'], default: 'unread' },
    channels:       [{ type: String }],
    referenceId:    { type: String },
    referenceType:  { type: String },
    actionUrl:      { type: String },
    metadata:       { type: Schema.Types.Mixed },
    readAt:         { type: Date },
    expiresAt:      { type: Date },
  },
  { timestamps: true }
)

NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 })
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>('Notification', NotificationSchema)