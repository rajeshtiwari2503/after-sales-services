import mongoose, { Document, Schema } from 'mongoose'

export interface ReviewDocument extends Document {
  feedbackId:   string
  clientId:     string
  clientName:   string
  rating:       number
  title:        string
  body:         string
  isVerified:   boolean
  isApproved:   boolean
  helpfulVotes: number
  service?:     string
  createdAt:    Date
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    feedbackId:   { type: String, required: true, unique: true },
    clientId:     { type: String, required: true },
    clientName:   { type: String, required: true },
    rating:       { type: Number, required: true, min: 1, max: 5 },
    title:        { type: String, required: true },
    body:         { type: String, required: true },
    isVerified:   { type: Boolean, default: false },
    isApproved:   { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    service:      { type: String },
  },
  { timestamps: true }
)

ReviewSchema.index({ isApproved: 1, rating: -1 })

export const ReviewModel =
  mongoose.models.Review ||
  mongoose.model<ReviewDocument>('Review', ReviewSchema)