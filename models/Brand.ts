import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
  logo?: string;
  managerId: mongoose.Types.ObjectId;
  categories: string[];
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
  slaPolicies: mongoose.Types.ObjectId[];
  serviceCenters: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    logo: String,
    managerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categories: [{ type: String }],
    contactEmail: { type: String, required: true, lowercase: true },
    contactPhone: { type: String, required: true },
    address: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    slaPolicies: [{ type: Schema.Types.ObjectId, ref: "SLAPolicy" }],
    serviceCenters: [{ type: Schema.Types.ObjectId, ref: "ServiceCenter" }],
  },
  { timestamps: true }
);

export default mongoose.models.Brand ||
  mongoose.model<IBrand>("Brand", BrandSchema);