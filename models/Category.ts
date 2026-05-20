// models/Category.ts  — NEW FILE
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface FaultOption {
  _id?: mongoose.Types.ObjectId;
  name: string;             // e.g. "Not Cooling"
  description?: string;     // e.g. "Device fails to cool"
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CategoryDocument extends Document {
  name: string;             // e.g. "Air Conditioner"
  slug: string;             // e.g. "air-conditioner" — used as Ticket.category value
  tenantId: string;
  description?: string;
  faults: FaultOption[];    // predefined fault list for this category
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FaultSchema = new Schema<FaultOption>({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
});

const CategorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    tenantId: { type: String, required: true, index: true },
    description: { type: String, trim: true },
    faults: { type: [FaultSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });
CategorySchema.index({ tenantId: 1, isActive: 1 });

const Category: Model<CategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<CategoryDocument>('Category', CategorySchema);

export default Category;