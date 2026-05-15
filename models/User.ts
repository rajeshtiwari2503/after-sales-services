import mongoose, { Schema, Document, Model } from 'mongoose';
import { User as UserType, UserRole } from '@/types/auth';

export interface UserDocument extends Omit<UserType, '_id'>, Document { }

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
      unique: true,
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
    // role: {
    //   type: String,
    //   enum: ['admin', 'manager', 'technician', 'customer', 'support'],
    //   default: 'customer',
    // },
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
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });

const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default User;
