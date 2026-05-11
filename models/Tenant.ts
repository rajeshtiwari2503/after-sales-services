 import mongoose, { Schema, Document, Model } from 'mongoose';

export interface TenantDocument extends Document {
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    slaConfig: {
      critical: { response: number; resolution: number };
      high: { response: number; resolution: number };
      medium: { response: number; resolution: number };
      low: { response: number; resolution: number };
    };
  };
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'past_due';
    startDate: Date;
    endDate?: Date;
  };
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<TenantDocument>(
  {
    name: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    domain: {
      type: String,
      unique: true,
      sparse: true,
    },
    logo: String,
    settings: {
      timezone: { type: String, default: 'UTC' },
      currency: { type: String, default: 'USD' },
      dateFormat: { type: String, default: 'YYYY-MM-DD' },
      slaConfig: {
        critical: { response: { type: Number, default: 1 }, resolution: { type: Number, default: 4 } },
        high: { response: { type: Number, default: 4 }, resolution: { type: Number, default: 24 } },
        medium: { response: { type: Number, default: 8 }, resolution: { type: Number, default: 48 } },
        low: { response: { type: Number, default: 24 }, resolution: { type: Number, default: 72 } },
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'starter', 'professional', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'past_due'],
        default: 'active',
      },
      startDate: { type: Date, default: Date.now },
      endDate: Date,
    },
    features: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Tenant: Model<TenantDocument> =
  mongoose.models.Tenant || mongoose.model<TenantDocument>('Tenant', TenantSchema);

export default Tenant;
