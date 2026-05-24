
import mongoose, { Schema, Document, Model } from "mongoose";
 
export interface WarrantyStickerDocument extends Document {
  // Sticker identity
  token:         string;  // Unique activation token — encoded in QR
  activationUrl: string;  // Full URL user scans
 
  // Product info (filled by brand when generating)
  tenantId:       string;
  brandId:        mongoose.Types.ObjectId;
  productId?:     mongoose.Types.ObjectId;
  productName:    string;
  modelNumber:    string;
  categoryId?:    mongoose.Types.ObjectId;
  categoryName?:  string;
  warrantyPeriod: number; // months
 
  // Status
  status: "unactivated" | "activated" | "expired" | "voided";
 
  // After activation
  warrantyId?:        mongoose.Types.ObjectId; // Created Warranty doc
  activatedBy?:       mongoose.Types.ObjectId; // Customer userId
  activatedAt?:       Date;
  serialNumber?:      string; // Customer fills on activation
  purchaseDate?:      Date;
  purchaseLocation?:  string;
 
  // Batch info (for printing multiple stickers)
  batchId?:     string;
  batchIndex?:  number;
 
  // Tracking
  scannedCount: number;
  lastScannedAt?: Date;
 
  createdBy:  string;
  expiresAt?: Date; // Token validity (not warranty) — e.g. 2 years to activate
  createdAt:  Date;
  updatedAt:  Date;
}
 
const WarrantyStickerSchema = new Schema<WarrantyStickerDocument>({
  // Identity
  token:         { type: String, required: true, unique: true, index: true },
  activationUrl: { type: String, required: true },
 
  // Product
  tenantId:      { type: String, required: true, index: true },
  brandId:       { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  productId:     { type: Schema.Types.ObjectId, ref: "Product" },
  productName:   { type: String, required: true },
  modelNumber:   { type: String, required: true },
  categoryId:    { type: Schema.Types.ObjectId, ref: "Category" },
  categoryName:  { type: String },
  warrantyPeriod:{ type: Number, required: true, default: 12 },
 
  // Status
  status: {
    type: String,
    enum: ["unactivated", "activated", "expired", "voided"],
    default: "unactivated",
    index: true,
  },
 
  // After activation
  warrantyId:       { type: Schema.Types.ObjectId, ref: "Warranty" },
  activatedBy:      { type: Schema.Types.ObjectId, ref: "User" },
  activatedAt:      { type: Date },
  serialNumber:     { type: String },
  purchaseDate:     { type: Date },
  purchaseLocation: { type: String },
 
  // Batch
  batchId:    { type: String, index: true },
  batchIndex: { type: Number },
 
  // Tracking
  scannedCount:  { type: Number, default: 0 },
  lastScannedAt: { type: Date },
 
  createdBy: { type: String, required: true },
  expiresAt: { type: Date },
}, { timestamps: true });
 
WarrantyStickerSchema.index({ tenantId: 1, status: 1 });
WarrantyStickerSchema.index({ tenantId: 1, batchId: 1 });
WarrantyStickerSchema.index({ token: 1 }, { unique: true });
 
const WarrantySticker: Model<WarrantyStickerDocument> =
  mongoose.models.WarrantySticker ||
  mongoose.model<WarrantyStickerDocument>("WarrantySticker", WarrantyStickerSchema);
 
export default WarrantySticker;
 