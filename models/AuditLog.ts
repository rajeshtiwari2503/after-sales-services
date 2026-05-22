 import mongoose, { Schema, Document, Model } from "mongoose";

export interface AuditLogDocument extends Document {
  // WHO
  userId:     string;
  userName:   string;
  userEmail:  string;
  userRole:   string;
  tenantId:   string;
  ipAddress?: string;
  userAgent?: string;

  // WHAT
  action:   string;   // CREATE | READ | UPDATE | DELETE | LOGIN | LOGOUT | EXPORT | ASSIGN | STATUS_CHANGE
  module:   string;   // ticket | user | brand | service_center | technician | inventory | feedback | auth | system
  entityId?:   string;
  entityName?: string;

  // RESULT
  status:  "success" | "failed" | "warning";
  message?: string;
  changes?: { field: string; oldValue: any; newValue: any }[];

  // METADATA
  metadata?:  Record<string, any>;
  duration?:  number; // ms
  createdAt:  Date;
}

const ChangeSchema = new Schema({
  field:    { type: String },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
}, { _id: false });

const AuditLogSchema = new Schema<AuditLogDocument>({
  // WHO
  userId:    { type: String, required: true, index: true },
  userName:  { type: String, default: "Unknown" },
  userEmail: { type: String, default: "" },
  userRole:  { type: String, default: "unknown" },
  tenantId:  { type: String, required: true, index: true },
  ipAddress: { type: String },
  userAgent: { type: String },

  // WHAT
  action:     { type: String, required: true, index: true },
  module:     { type: String, required: true, index: true },
  entityId:   { type: String },
  entityName: { type: String },

  // RESULT
  status:   { type: String, enum: ["success", "failed", "warning"], default: "success", index: true },
  message:  { type: String },
  changes:  [ChangeSchema],

  // META
  metadata: { type: Schema.Types.Mixed },
  duration: { type: Number },
}, {
  timestamps: true,
  // Auto-delete after 90 days
  expires: 60 * 60 * 24 * 90,
});

// Compound indexes for fast queries
AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, module: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, action: 1, status: 1 });

const AuditLog: Model<AuditLogDocument> =
  mongoose.models.AuditLog ||
  mongoose.model<AuditLogDocument>("AuditLog", AuditLogSchema);

export default AuditLog;