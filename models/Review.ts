 import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ReviewDocument extends Document {
  feedbackId: mongoose.Types.ObjectId;
  tenantId: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  isPublished: boolean;
  helpfulCount: number;
  response?: {
    content: string;
    respondedBy: mongoose.Types.ObjectId;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    feedbackId: {
      type: Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: String,
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
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

ReviewSchema.index({ tenantId: 1, isPublished: 1, createdAt: -1 });

const Review: Model<ReviewDocument> =
  mongoose.models.Review || mongoose.model<ReviewDocument>('Review', ReviewSchema);

export default Review;
