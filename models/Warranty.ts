import mongoose, { Schema, Document, Model } from 'mongoose';

export interface WarrantyDocument extends Document {
  productName: string;
  serialNumber: string;
  tenantId: string;
  customerId: mongoose.Types.ObjectId;
  purchaseDate: Date;
  warrantyStartDate: Date;
  warrantyEndDate: Date;
  warrantyType: 'standard' | 'extended' | 'premium';
  coverage: string[];
  terms?: string;
  status: 'active' | 'expired' | 'claimed' | 'voided';
  claims: {
    ticketId: mongoose.Types.ObjectId;
    claimDate: Date;
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    resolution?: string;
  }[];
  documents: {
    name: string;
    url: string;
    uploadedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const WarrantySchema = new Schema<WarrantyDocument>(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    serialNumber: {
      type: String,
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
    purchaseDate: {
      type: Date,
      required: true,
    },
    warrantyStartDate: {
      type: Date,
      required: true,
    },
    warrantyEndDate: {
      type: Date,
      required: true,
    },
    warrantyType: {
      type: String,
      enum: ['standard', 'extended', 'premium'],
      default: 'standard',
    },
    coverage: [{ type: String }],
    terms: String,
    status: {
      type: String,
      enum: ['active', 'expired', 'claimed', 'voided'],
      default: 'active',
    },
    claims: [{
      ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' },
      claimDate: { type: Date, default: Date.now },
      description: { type: String, required: true },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      resolution: String,
    }],
    documents: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
  }
);

WarrantySchema.index({ tenantId: 1, serialNumber: 1 }, { unique: true });
WarrantySchema.index({ warrantyEndDate: 1, status: 1 });

const Warranty: Model<WarrantyDocument> =
  mongoose.models.Warranty || mongoose.model<WarrantyDocument>('Warranty', WarrantySchema);

export default Warranty;
