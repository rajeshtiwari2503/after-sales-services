import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransferKind = 'dispatch' | 'request';
export type TransferStatus =
  | 'pending'
  | 'approved'
  | 'in_transit'
  | 'received'
  | 'rejected'
  | 'cancelled';

export interface TransferLine {
  inventoryId?: mongoose.Types.ObjectId | string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice?: number;
}

export interface InventoryTransferDocument extends Document {
  transferNumber: string;
  tenantId: string;
  kind: TransferKind;
  status: TransferStatus;
  serviceCenterId: mongoose.Types.ObjectId;
  serviceCenterName?: string;
  items: TransferLine[];
  notes?: string;
  rejectionReason?: string;
  createdBy: mongoose.Types.ObjectId;
  createdByName?: string;
  createdByRole: string;
  approvedBy?: mongoose.Types.ObjectId;
  receivedBy?: mongoose.Types.ObjectId;
  receivedAt?: Date;
  shippedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransferLineSchema = new Schema<TransferLine>(
  {
    inventoryId: { type: Schema.Types.ObjectId, ref: 'Inventory' },
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, uppercase: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, min: 0 },
  },
  { _id: false }
);

const InventoryTransferSchema = new Schema<InventoryTransferDocument>(
  {
    transferNumber: { type: String, required: true, unique: true },
    tenantId: { type: String, required: true, index: true },
    kind: { type: String, enum: ['dispatch', 'request'], required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'in_transit', 'received', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCenter',
      required: true,
      index: true,
    },
    serviceCenterName: String,
    items: { type: [TransferLineSchema], required: true, validate: [(v: TransferLine[]) => v.length > 0, 'At least one item'] },
    notes: String,
    rejectionReason: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdByName: String,
    createdByRole: { type: String, required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    receivedAt: Date,
    shippedAt: Date,
  },
  { timestamps: true }
);

InventoryTransferSchema.index({ tenantId: 1, status: 1 });
InventoryTransferSchema.index({ tenantId: 1, serviceCenterId: 1 });

const InventoryTransfer: Model<InventoryTransferDocument> =
  mongoose.models.InventoryTransfer ||
  mongoose.model<InventoryTransferDocument>('InventoryTransfer', InventoryTransferSchema);

export default InventoryTransfer;
