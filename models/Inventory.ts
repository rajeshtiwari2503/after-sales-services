import mongoose, { Schema, Document, Model } from 'mongoose';

export interface InventoryDocument extends Document {
  name: string;
  sku: string;
  tenantId: string;
  brandId?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;    // links to Product model
  categoryId?: mongoose.Types.ObjectId;   // links to Category model
  serviceCenterId?: mongoose.Types.ObjectId;
  category: string;
  description?: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  costPrice: number;
  supplier?: {
    name: string;
    contact: string;
    email: string;
  };
  location?: string;
  isActive: boolean;
  lastRestockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<InventoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      uppercase: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCenter',
    },
    category: {
      type: String,
      required: true,
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minQuantity: {
      type: Number,
      default: 5,
    },
    maxQuantity: {
      type: Number,
      default: 100,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    supplier: {
      name: String,
      contact: String,
      email: String,
    },
    location: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastRestockedAt: Date,
  },
  {
    timestamps: true,
  }
);

InventorySchema.index({ tenantId: 1, sku: 1 }, { unique: true });
InventorySchema.index({ quantity: 1, minQuantity: 1 });
InventorySchema.index({ tenantId: 1, productId: 1 });
InventorySchema.index({ tenantId: 1, categoryId: 1 });
InventorySchema.index({ tenantId: 1, serviceCenterId: 1 });

const Inventory: Model<InventoryDocument> =
  mongoose.models.Inventory || mongoose.model<InventoryDocument>('Inventory', InventorySchema);

export default Inventory;
