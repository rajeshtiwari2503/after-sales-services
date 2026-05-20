// models/Product.ts  — NEW FILE
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ProductDocument extends Document {
  name: string;             // e.g. "Split AC 1.5 Ton"
  modelNumber: string;      // e.g. "AC-1500-PRO"
  categoryId: mongoose.Types.ObjectId;  // → Category
  tenantId: string;
  description?: string;
  specifications?: Record<string, string>;  // key-value specs
  warrantyPeriod: number;   // months
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    modelNumber: { type: String, required: true, trim: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    tenantId: { type: String, required: true, index: true },
    description: { type: String, trim: true },
    specifications: { type: Map, of: String },
    warrantyPeriod: { type: Number, default: 12, min: 0 },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ tenantId: 1, modelNumber: 1 }, { unique: true });
ProductSchema.index({ tenantId: 1, categoryId: 1 });

const Product: Model<ProductDocument> =
  mongoose.models.Product ||
  mongoose.model<ProductDocument>('Product', ProductSchema);

export default Product;