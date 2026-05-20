 
// models/User.ts  — REPLACE your existing file
// Change: added optional serviceCenterId field for SC operators & technicians

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'service_center' | 'technician' | 'customer' | 'support';
  tenantId: string;
  serviceCenterId?: string;   // ← NEW: ObjectId string of ServiceCenter
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
    // ── Password reset fields ──
  resetPasswordOTP?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date; 
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      // unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'service_center', 'technician', 'customer', 'support'],
      default: 'customer',
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    // NEW — which service center this SC operator / technician belongs to
    serviceCenterId: {
      type: String,
      default: null,
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
     // ── Password reset fields ──────────────────────────────────────────
    resetPasswordOTP: {
      type: String,
      select: false,   // never returned in normal queries
    },
    resetPasswordToken: {
      type: String,
      select: false,
      index: true,     // fast lookup by token
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
    
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ tenantId: 1, serviceCenterId: 1 });
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });

const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default User;