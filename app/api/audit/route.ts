 // ═══════════════════════════════════════════════════════════════
// app/api/audit-logs/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import AuditLog from "@/models/AuditLog";
import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);
    // Only admin can view audit logs
    if (user.role !== "admin") return errorResponse("Forbidden", 403);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page      = Math.max(1, parseInt(searchParams.get("page")   ?? "1"));
    const limit     = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
    const module_   = searchParams.get("module")  ?? "";
    const action    = searchParams.get("action")  ?? "";
    const status    = searchParams.get("status")  ?? "";
    const userId    = searchParams.get("userId")  ?? "";
    const search    = searchParams.get("search")  ?? "";
    const startDate = searchParams.get("startDate") ?? "";
    const endDate   = searchParams.get("endDate")   ?? "";

    // Build query
    const query: Record<string, any> = { tenantId: user.tenantId };
    if (module_) query.module = module_;
    if (action)  query.action = action;
    if (status)  query.status = status;
    if (userId)  query.userId = userId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate)   query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    if (search) {
      query.$or = [
        { userName:   { $regex: search, $options: "i" } },
        { userEmail:  { $regex: search, $options: "i" } },
        { entityName: { $regex: search, $options: "i" } },
        { message:    { $regex: search, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return successResponse({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, "Audit logs fetched");

  } catch (error) {
    console.error("GET audit-logs error:", error);
    return errorResponse("Failed to fetch audit logs", 500);
  }
}






// ═══════════════════════════════════════════════════════════════
// HOW TO USE writeAuditLog in other routes:
// ═══════════════════════════════════════════════════════════════
/*
// In app/api/auth/login/route.ts — after successful login:
import { writeAuditLog, getClientIP, AUDIT_MODULES, AUDIT_ACTIONS } from "@/lib/audit";

await writeAuditLog({
  userId:    user._id.toString(),
  userName:  user.name,
  userEmail: user.email,
  userRole:  user.role,
  tenantId:  user.tenantId,
  ipAddress: getClientIP(request),
  userAgent: request.headers.get("user-agent") ?? undefined,
  action:    AUDIT_ACTIONS.LOGIN,
  module:    AUDIT_MODULES.AUTH,
  status:    "success",
  message:   `User ${user.email} logged in`,
});

// In app/api/tickets/[id]/status/route.ts:
await writeAuditLog({
  userId, userRole, tenantId,
  action:     AUDIT_ACTIONS.STATUS_CHANGE,
  module:     AUDIT_MODULES.TICKET,
  entityId:   ticketId,
  entityName: ticket.ticketNumber,
  status:     "success",
  changes:    [{ field: "status", oldValue: ticket.status, newValue: newStatus }],
  metadata:   { ticketId, newStatus },
});

// In app/api/users/[id]/route.ts — DELETE:
await writeAuditLog({
  userId, userRole, tenantId,
  action:     AUDIT_ACTIONS.DELETE,
  module:     AUDIT_MODULES.USER,
  entityId:   id,
  entityName: deletedUser.name,
  status:     "success",
  message:    `User ${deletedUser.email} deleted`,
});
*/