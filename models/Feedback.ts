//  import mongoose, {
//   Schema,
// } from "mongoose";

// const FeedbackSchema =
//   new Schema(
//     {
//       ticketId: {
//         type: String,
//         required: true,
//       },

//       customerId: {
//         type: String,
//         required: true,
//       },

//       customerName: {
//         type: String,
//         required: true,
//       },

//       rating: {
//         type: Number,
//         required: true,
//       },

//       serviceQuality: {
//         type: Number,
//       },

//       technicianBehavior: {
//         type: Number,
//       },

//       responseTime: {
//         type: Number,
//       },

//       recommendationLikelihood:
//         {
//           type: Number,
//         },

//       feedbackMessage: {
//         type: String,
//       },

//       suggestions: {
//         type: String,
//       },

//       resolved: {
//         type: Boolean,
//         default: false,
//       },
//     },
//     {
//       timestamps: true,
//     }
//   );

// export default mongoose.models
//   .Feedback ||
//   mongoose.model(
//     "Feedback",
//     FeedbackSchema
//   );

import mongoose, { Document, Schema } from 'mongoose'
import type { Feedback as IFeedback } from '@/types/feedback'

export interface FeedbackDocument extends Omit<IFeedback, '_id'>, Document {}

const FeedbackSchema = new Schema<FeedbackDocument>(
  {
    clientId:        { type: String, required: true, index: true },
    clientName:      { type: String, required: true },
    clientEmail:     { type: String, required: true },
    clientPhone:     { type: String },
    technicianId:    { type: String, index: true },
    technicianName:  { type: String },
    serviceId:       { type: String, index: true },
    certificationId: { type: String, index: true },
    rating:          { type: Number, required: true, min: 1, max: 5 },
    npsScore:        { type: Number, min: 0, max: 10 },
    title:           { type: String },
    comment:         { type: String, required: true },
    type:            { type: String, enum: ['service','technician','product','general'], default: 'service' },
    status:          { type: String, enum: ['pending','reviewed','resolved','escalated'], default: 'pending' },
    sentiment:       { type: String, enum: ['positive','neutral','negative'] },
    sentimentScore:  { type: Number },
    tags:            [{ type: String }],
    isPublic:        { type: Boolean, default: false },
    response:        { type: String },
    respondedAt:     { type: Date },
  },
  { timestamps: true }
)

FeedbackSchema.index({ clientId: 1, createdAt: -1 })
FeedbackSchema.index({ technicianId: 1, rating: -1 })
FeedbackSchema.index({ status: 1, createdAt: -1 })
FeedbackSchema.index({ isPublic: 1, rating: -1 })

export const FeedbackModel =
  mongoose.models.Feedback ||
  mongoose.model<FeedbackDocument>('Feedback', FeedbackSchema)