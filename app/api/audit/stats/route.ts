// ═══════════════════════════════════════════════════════════════
// app/api/audit-logs/stats/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import AuditLog from "@/models/AuditLog";
import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user)              return errorResponse("Unauthorized", 401);
    if (user.role !== "admin") return errorResponse("Forbidden", 403);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range") ?? "30");
    const since = new Date(Date.now() - range * 86400000);
    const match = { tenantId: user.tenantId, createdAt: { $gte: since } };

    const [
      totals,
      byModule,
      byAction,
      byStatus,
      byUser,
      timeline,
      failedLogs,
    ] = await Promise.all([
      // Overall counts
      AuditLog.aggregate([
        { $match: match },
        { $group: {
          _id:     null,
          total:   { $sum: 1 },
          failed:  { $sum: { $cond: [{ $eq: ["$status", "failed"]  }, 1, 0] } },
          warning: { $sum: { $cond: [{ $eq: ["$status", "warning"] }, 1, 0] } },
          success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
        }},
      ]),

      // By module
      AuditLog.aggregate([
        { $match: match },
        { $group: { _id: "$module", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // By action
      AuditLog.aggregate([
        { $match: match },
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // By status
      AuditLog.aggregate([
        { $match: match },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Top users by activity
      AuditLog.aggregate([
        { $match: match },
        { $group: {
          _id:       "$userId",
          userName:  { $first: "$userName" },
          userEmail: { $first: "$userEmail" },
          userRole:  { $first: "$userRole" },
          count:     { $sum: 1 },
          failed:    { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        }},
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Timeline — daily activity
      AuditLog.aggregate([
        { $match: match },
        { $group: {
          _id:     { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total:   { $sum: 1 },
          failed:  { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
        }},
        { $sort: { _id: 1 } },
      ]),

      // Recent failed logs
      AuditLog.find({ tenantId: user.tenantId, status: "failed" })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return successResponse({
      totals:     totals[0] ?? { total: 0, failed: 0, warning: 0, success: 0 },
      byModule:   Object.fromEntries(byModule.map((m: any) => [m._id, m.count])),
      byAction:   Object.fromEntries(byAction.map((a: any) => [a._id, a.count])),
      byStatus:   Object.fromEntries(byStatus.map((s: any) => [s._id, s.count])),
      topUsers:   byUser,
      timeline,
      failedLogs,
    }, "Audit stats fetched");

  } catch (error) {
    console.error("GET audit-stats error:", error);
    return errorResponse("Failed to fetch audit stats", 500);
  }
}
