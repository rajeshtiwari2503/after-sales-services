// import mongoose, { Schema, Document, Model } from 'mongoose';
// import { Ticket as TicketType } from '@/types/ticket';

// export interface TicketDocument extends Omit<TicketType, '_id'>, Document {}

// const AttachmentSchema = new Schema({
//   filename: { type: String, required: true },
//   url: { type: String, required: true },
//   type: { type: String, required: true },
//   size: { type: Number, required: true },
//   uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   uploadedAt: { type: Date, default: Date.now },
// });

// const NoteSchema = new Schema({
//   content: { type: String, required: true },
//   authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   authorName: { type: String, required: true },
//   isInternal: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
// });

// const TimelineEventSchema = new Schema({
//   action: { type: String, required: true },
//   description: { type: String, required: true },
//   performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   performedByName: { type: String, required: true },
//   metadata: { type: Schema.Types.Mixed },
//   createdAt: { type: Date, default: Date.now },
// });

// const SLAInfoSchema = new Schema({
//   responseDeadline: { type: Date, required: true },
//   resolutionDeadline: { type: Date, required: true },
//   responseTime: { type: Number },
//   resolutionTime: { type: Number },
//   isResponseBreached: { type: Boolean, default: false },
//   isResolutionBreached: { type: Boolean, default: false },
// });

// const TicketSchema = new Schema<TicketDocument>(
//   {
//     ticketNumber: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//      ticketId: {
//       type: String,
     
//       // unique: true,
//     },
//     title: {
//       type: String,
//       required: [true, 'Title is required'],
//       trim: true,
//       maxlength: [200, 'Title cannot exceed 200 characters'],
//     },
//     description: {
//       type: String,
//       required: [true, 'Description is required'],
//       maxlength: [5000, 'Description cannot exceed 5000 characters'],
//     },
//     status: {
//       type: String,
//       enum: ['open', 'in_progress', 'pending_parts', 'pending_customer', 'resolved', 'closed', 'cancelled'],
//       default: 'open',
//     },
//     priority: {
//       type: String,
//       enum: ['low', 'medium', 'high', 'critical'],
//       default: 'medium',
//     },
//     category: {
//       type: String,
//       enum: ['hardware', 'software', 'installation', 'maintenance', 'warranty', 'consultation', 'other'],
//       required: true,
//     },
//     customerId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     technicianId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     serviceCenterId: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     tenantId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     attachments: [AttachmentSchema],
     
//     notes: [NoteSchema],
//     timeline: [TimelineEventSchema],
//     sla: SLAInfoSchema,
//     estimatedCompletionDate: Date,
//     actualCompletionDate: Date,
//   },
//   {
//     timestamps: true,
//   }
// );

// TicketSchema.index({ tenantId: 1, status: 1 });
// TicketSchema.index({ tenantId: 1, customerId: 1 });
// TicketSchema.index({ tenantId: 1, technicianId: 1 });
// TicketSchema.index({ createdAt: -1 });

// // models/Ticket.ts
// TicketSchema.pre('save', async function () {
//   if (this.isNew) {
//     const count = await mongoose.models.Ticket.countDocuments({
//       tenantId: this.tenantId,
//     });

//     if (!this.ticketNumber) {
//       this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
//     }

//     if (!this.ticketId) {
//       this.ticketId = `TID-${Date.now()}-${Math.floor(
//         1000 + Math.random() * 9000
//       )}`;
//     }
//   }
// });

// const Ticket: Model<TicketDocument> =
//   mongoose.models.Ticket || mongoose.model<TicketDocument>('Ticket', TicketSchema);

// export default Ticket;


// models/Ticket.ts  — REPLACE existing
// Changes: added productId, categoryId (ref to Category), faultId, faultName
// category field kept as free string (from category.slug) for backward compat

import mongoose, { Schema, Document, Model } from 'mongoose';
import { Ticket as TicketType } from '@/types/ticket';

export interface TicketDocument extends Omit<TicketType, '_id'>, Document {
  productId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  faultId?: mongoose.Types.ObjectId;
  faultName?: string;
}

const AttachmentSchema = new Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const NoteSchema = new Schema({
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  isInternal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const TimelineEventSchema = new Schema({
  action: { type: String, required: true },
  description: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  performedByName: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

const SLAInfoSchema = new Schema({
  responseDeadline: { type: Date, required: true },
  resolutionDeadline: { type: Date, required: true },
  responseTime: { type: Number },
  resolutionTime: { type: Number },
  isResponseBreached: { type: Boolean, default: false },
  isResolutionBreached: { type: Boolean, default: false },
});

const TicketSchema = new Schema<TicketDocument>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    ticketId: { type: String },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'pending_parts', 'pending_customer', 'resolved', 'closed', 'cancelled'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    // Legacy free-text category (backward compat)
    category: {
      type: String,
      default: 'other',
    },
    // ── NEW fields ──────────────────────────────────────────────────────────
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    productId:  { type: Schema.Types.ObjectId, ref: 'Product',  index: true },
    faultId:    { type: Schema.Types.ObjectId },     // fault subdoc _id from Category
    faultName:  { type: String },                    // denormalized for display
    // ────────────────────────────────────────────────────────────────────────
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    serviceCenterId: { type: Schema.Types.ObjectId, ref: 'ServiceCenter' },
    tenantId: { type: String, required: true, index: true },
    attachments: [AttachmentSchema],
    notes: [NoteSchema],
    timeline: [TimelineEventSchema],
    sla: SLAInfoSchema,
    estimatedCompletionDate: Date,
    actualCompletionDate: Date,
  },
  { timestamps: true }
);

TicketSchema.index({ tenantId: 1, status: 1 });
TicketSchema.index({ tenantId: 1, customerId: 1 });
TicketSchema.index({ tenantId: 1, technicianId: 1 });
TicketSchema.index({ tenantId: 1, categoryId: 1 });
TicketSchema.index({ createdAt: -1 });

TicketSchema.pre('save', async function () {
  if (this.isNew) {
    const count = await mongoose.models.Ticket.countDocuments({ tenantId: this.tenantId });
    if (!this.ticketNumber) {
      this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
    }
    if (!this.ticketId) {
      this.ticketId = `TID-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  }
});

const Ticket: Model<TicketDocument> =
  mongoose.models.Ticket || mongoose.model<TicketDocument>('Ticket', TicketSchema);

export default Ticket;