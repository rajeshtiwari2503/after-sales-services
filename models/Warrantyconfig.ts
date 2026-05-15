import mongoose, { Schema, Document } from "mongoose";

export interface IWarrantyConfig extends Document {
  brandId: mongoose.Types.ObjectId;
  productCategory: string;
  modelName?: string;
  modelNumber?: string;
  durationMonths: number;
  coverageType: "comprehensive" | "limited" | "extended" | "on_site";
  coveredParts: string[];
  excludedParts: string[];
  coveredLabor: boolean;
  termsAndConditions: string;
  registrationRequired: boolean;
  registrationWindowDays: number; // days after purchase to register
  maxClaimsAllowed: number;
  isTransferable: boolean;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WarrantyConfigSchema = new Schema<IWarrantyConfig>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    productCategory: { type: String, required: true },
    modelName: String,
    modelNumber: String,
    durationMonths: { type: Number, required: true, min: 1 },
    coverageType: {
      type: String,
      enum: ["comprehensive", "limited", "extended", "on_site"],
      required: true,
    },
    coveredParts: [{ type: String }],
    excludedParts: [{ type: String }],
    coveredLabor: { type: Boolean, default: true },
    termsAndConditions: { type: String, required: true },
    registrationRequired: { type: Boolean, default: false },
    registrationWindowDays: { type: Number, default: 30 },
    maxClaimsAllowed: { type: Number, default: 3 },
    isTransferable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

WarrantyConfigSchema.index({ brandId: 1, productCategory: 1 });

export default mongoose.models.WarrantyConfig ||
  mongoose.model<IWarrantyConfig>("WarrantyConfig", WarrantyConfigSchema);