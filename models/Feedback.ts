import mongoose, { Schema, Document, Model } from 'mongoose';
import { Feedback as FeedbackType } from '@/types/feedback';

export interface FeedbackDocument extends Omit<FeedbackType, '_id'>, Document {}

const FeedbackSchema = new Schema<FeedbackDocument>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Technician',
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    npsScore: {
      type: Number,
      min: 0,
      max: 10,
    },
    comment: {
      type: String,
      maxlength: 2000,
    },
    categories: [{
      type: String,
      enum: ['service_quality', 'response_time', 'technician_skill', 'communication', 'pricing', 'overall_experience'],
    }],
    sentiment: {
      score: Number,
      label: {
        type: String,
        enum: ['positive', 'neutral', 'negative'],
      },
      confidence: Number,
      keywords: [String],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    response: {
      content: String,
      respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.index({ tenantId: 1, createdAt: -1 });
FeedbackSchema.index({ technicianId: 1, rating: 1 });

const Feedback: Model<FeedbackDocument> =
  mongoose.models.Feedback || mongoose.model<FeedbackDocument>('Feedback', FeedbackSchema);

export default Feedback;
