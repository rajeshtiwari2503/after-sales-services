 // lib/audit.ts — Call this from any API route to log actions

import AuditLog from "@/models/AuditLog";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { NotificationService } from "@/services/notification.service";

export interface AuditParams {
  userId:     string;
  userName?:  string;
  userEmail?: string;
  userRole:   string;
  tenantId:   string;
  ipAddress?: string;
  userAgent?: string;
  action:     string;
  module:     string;
  entityId?:  string;
  entityName?:string;
  status?:    "success" | "failed" | "warning";
  message?:   string;
  changes?:   { field: string; oldValue: any; newValue: any }[];
  metadata?:  Record<string, any>;
  duration?:  number;
}

/**
 * Fire-and-forget audit log writer.
 * Never throws — audit failure must not break the main flow.
 */
export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      userId:     params.userId,
      userName:   params.userName  ?? "Unknown",
      userEmail:  params.userEmail ?? "",
      userRole:   params.userRole,
      tenantId:   params.tenantId,
      ipAddress:  params.ipAddress,
      userAgent:  params.userAgent,
      action:     params.action.toUpperCase(),
      module:     params.module.toLowerCase(),
      entityId:   params.entityId,
      entityName: params.entityName,
      status:     params.status    ?? "success",
      message:    params.message,
      changes:    params.changes,
      metadata:   params.metadata,
      duration:   params.duration,
    });

    const status = params.status ?? "success";
    if (status !== "success") {
      const admins = await User.find({
        tenantId: params.tenantId,
        role: { $in: ["admin", "manager"] },
        isActive: true,
      }).select("_id").lean();
      const adminIds = admins.map(a => a._id.toString());
      if (adminIds.length) {
        NotificationService.onAuditLog({
          adminUserIds: adminIds,
          tenantId:     params.tenantId,
          action:       params.action,
          module:       params.module,
          status,
          message:      params.message,
          entityName:   params.entityName,
        }).catch(() => {});
      }
    }
  } catch (err) {
    // Silent — never break main flow
    console.error("[AuditLog] Write failed:", err);
  }
}

/**
 * Helper — extract client IP from NextRequest
 */
export function getClientIP(request: Request): string {
  const fwd  = (request as any).headers?.get?.("x-forwarded-for");
  const real = (request as any).headers?.get?.("x-real-ip");
  return (fwd?.split(",")[0] ?? real ?? "unknown").trim();
}

/**
 * Pre-defined module constants
 */
export const AUDIT_MODULES = {
  AUTH:           "auth",
  TICKET:         "ticket",
  USER:           "user",
  BRAND:          "brand",
  SERVICE_CENTER: "service_center",
  TECHNICIAN:     "technician",
  INVENTORY:      "inventory",
  FEEDBACK:       "feedback",
  ANALYTICS:      "analytics",
  SYSTEM:         "system",
  ROLE:           "role",
} as const;

export const AUDIT_ACTIONS = {
  LOGIN:          "LOGIN",
  LOGOUT:         "LOGOUT",
  REGISTER:       "REGISTER",
  CREATE:         "CREATE",
  READ:           "READ",
  UPDATE:         "UPDATE",
  DELETE:         "DELETE",
  EXPORT:         "EXPORT",
  ASSIGN:         "ASSIGN",
  STATUS_CHANGE:  "STATUS_CHANGE",
  RESPOND:        "RESPOND",
  PASSWORD_CHANGE:"PASSWORD_CHANGE",
  TOGGLE_ACTIVE:  "TOGGLE_ACTIVE",
  BULK_DELETE:    "BULK_DELETE",
  SYSTEM_CONFIG:  "SYSTEM_CONFIG",
} as const;