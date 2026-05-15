import mongoose, { Schema, Document } from "mongoose";

export const ALL_PERMISSIONS = [
  // Tickets
  "tickets:create", "tickets:read", "tickets:update", "tickets:delete",
  "tickets:assign", "tickets:close", "tickets:export",
  // Users
  "users:create", "users:read", "users:update", "users:delete",
  "users:manage_roles",
  // Brands
  "brands:create", "brands:read", "brands:update", "brands:delete",
  // Service Centers
  "sc:create", "sc:read", "sc:update", "sc:delete",
  "sc:assign_technician",
  // Inventory / Parts
  "inventory:create", "inventory:read", "inventory:update", "inventory:delete",
  // Wallet / Commission
  "wallet:read", "wallet:withdraw", "wallet:approve_withdrawal",
  "commission:read", "commission:approve",
  // Analytics
  "analytics:read", "analytics:export",
  // Audit Logs
  "audit:read",
  // Settings
  "settings:read", "settings:update",
  // Chat
  "chat:read", "chat:send",
  // Notifications
  "notifications:send", "notifications:manage",
  // SLA
  "sla:create", "sla:read", "sla:update",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export interface IRole extends Document {
  name: string;
  displayName: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean; // system roles cannot be deleted
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, lowercase: true },
    displayName: { type: String, required: true },
    description: String,
    permissions: [{ type: String, enum: ALL_PERMISSIONS }],
    isSystem: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Seed default roles
export const DEFAULT_ROLES: Partial<IRole>[] = [
  {
    name: "super_admin",
    displayName: "Super Admin",
    description: "Full platform control",
    permissions: [...ALL_PERMISSIONS],
    isSystem: true,
  },
  {
    name: "brand_manager",
    displayName: "Brand Manager",
    description: "Manage brand, products, and service centers",
    permissions: [
      "tickets:read", "tickets:assign", "tickets:export",
      "brands:read", "brands:update",
      "sc:read", "sc:assign_technician",
      "analytics:read", "sla:create", "sla:read", "sla:update",
      "inventory:read", "notifications:send",
    ],
    isSystem: true,
  },
  {
    name: "service_center",
    displayName: "Service Center",
    description: "Manage tickets, technicians, and inventory",
    permissions: [
      "tickets:read", "tickets:update", "tickets:assign", "tickets:close",
      "sc:read", "sc:assign_technician",
      "inventory:create", "inventory:read", "inventory:update",
      "wallet:read", "commission:read",
      "chat:read", "chat:send", "notifications:send",
      "analytics:read",
    ],
    isSystem: true,
  },
  {
    name: "technician",
    displayName: "Technician",
    description: "Handle assigned jobs",
    permissions: [
      "tickets:read", "tickets:update",
      "inventory:read",
      "wallet:read",
      "chat:read", "chat:send",
    ],
    isSystem: true,
  },
  {
    name: "customer",
    displayName: "Customer",
    description: "Raise and track service requests",
    permissions: [
      "tickets:create", "tickets:read",
      "chat:read", "chat:send",
    ],
    isSystem: true,
  },
];

export default mongoose.models.Role ||
  mongoose.model<IRole>("Role", RoleSchema);