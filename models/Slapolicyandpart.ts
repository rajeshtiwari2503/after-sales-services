import mongoose, { Schema, Document } from "mongoose";

// ─── SLA POLICY ──────────────────────────────────────────────
export interface ISLAPolicy extends Document {
  brandId: mongoose.Types.ObjectId;
  name: string;
  priority: "low" | "medium" | "high" | "critical";
  responseTimeHours: number;    // first response SLA
  resolutionTimeHours: number;  // full resolution SLA
  escalationTimeHours: number;  // when to escalate
  escalateTo: mongoose.Types.ObjectId[]; // user IDs
  isActive: boolean;
  breachPenalty?: number; // INR penalty per breach
  createdAt: Date;
  updatedAt: Date;
}

const SLAPolicySchema = new Schema<ISLAPolicy>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    name: { type: String, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    responseTimeHours: { type: Number, required: true },
    resolutionTimeHours: { type: Number, required: true },
    escalationTimeHours: { type: Number, required: true },
    escalateTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    breachPenalty: Number,
  },
  { timestamps: true }
);

SLAPolicySchema.index({ brandId: 1, priority: 1 });

// ─── PART / SPARE ────────────────────────────────────────────
export interface IPart extends Document {
  serviceCenterId: mongoose.Types.ObjectId;
  brandId?: mongoose.Types.ObjectId;
  name: string;
  partNumber: string;
  description?: string;
  category: string;
  quantity: number;
  minStockLevel: number;
  unitPrice: number;
  sellingPrice: number;
  supplier?: string;
  supplierContact?: string;
  location?: string; // shelf/bin in warehouse
  isActive: boolean;
  lowStockAlert: boolean;
  usedInTickets: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PartSchema = new Schema<IPart>(
  {
    serviceCenterId: { type: Schema.Types.ObjectId, ref: "ServiceCenter", required: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    name: { type: String, required: true },
    partNumber: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    minStockLevel: { type: Number, required: true, default: 5 },
    unitPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    supplier: String,
    supplierContact: String,
    location: String,
    isActive: { type: Boolean, default: true },
    lowStockAlert: { type: Boolean, default: false },
    usedInTickets: [{ type: Schema.Types.ObjectId, ref: "Ticket" }],
  },
  { timestamps: true }
);

// Auto-flag low stock
PartSchema.pre<IPart>("save", function (next) {
  this.lowStockAlert = this.quantity <= this.minStockLevel;
  // next();
});

PartSchema.index({ serviceCenterId: 1, partNumber: 1 }, { unique: true });
PartSchema.index({ lowStockAlert: 1 });

export const SLAPolicy =
  mongoose.models.SLAPolicy ||
  mongoose.model<ISLAPolicy>("SLAPolicy", SLAPolicySchema);

export const Part =
  mongoose.models.Part || mongoose.model<IPart>("Part", PartSchema);