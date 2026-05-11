import mongoose, { Schema, Document, Model } from 'mongoose';

export interface TechnicianDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId: string;
  employeeId: string;
  specializations: string[];
  certifications: {
    name: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate?: Date;
  }[];
  serviceCenterId?: mongoose.Types.ObjectId;
  availability: {
    isAvailable: boolean;
    workingHours: {
      day: string;
      start: string;
      end: string;
    }[];
  };
  rating: number;
  totalTickets: number;
  completedTickets: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TechnicianSchema = new Schema<TechnicianDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    specializations: [{
      type: String,
    }],
    certifications: [{
      name: { type: String, required: true },
      issuedBy: { type: String, required: true },
      issuedDate: { type: Date, required: true },
      expiryDate: Date,
    }],
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCenter',
    },
    availability: {
      isAvailable: { type: Boolean, default: true },
      workingHours: [{
        day: String,
        start: String,
        end: String,
      }],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalTickets: {
      type: Number,
      default: 0,
    },
    completedTickets: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

TechnicianSchema.index({ tenantId: 1, employeeId: 1 }, { unique: true });

const Technician: Model<TechnicianDocument> =
  mongoose.models.Technician || mongoose.model<TechnicianDocument>('Technician', TechnicianSchema);

export default Technician;
