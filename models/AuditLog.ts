 

// import mongoose from "mongoose";

// const schema =
//   new mongoose.Schema(
//     {
//       action: String,

//       entity: String,

//       entityId: String,

//       userId: String,

//       payload: Object,
//     },
//     {
//       timestamps: true,
//     }
//   );

// export default
//   mongoose.models
//     .AuditLog ||
//   mongoose.model(
//     "AuditLog",
//     schema
//   );

import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  resourceId?: string;
  resourceType?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failure";
  errorMessage?: string;
  duration?: number; // ms
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    action: { type: String, required: true }, // e.g. CREATE_TICKET, UPDATE_USER
    module: { type: String, required: true }, // e.g. tickets, users, inventory
    resourceId: String,
    resourceType: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    status: { type: String, enum: ["success", "failure"], default: "success" },
    errorMessage: String,
    duration: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ module: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);