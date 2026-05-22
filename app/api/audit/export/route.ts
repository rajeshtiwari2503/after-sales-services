// ═══════════════════════════════════════════════════════════════
// app/api/audit-logs/export/route.ts
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { errorResponse } from "@/utils/apiResponse";
import AuditLog from "@/models/AuditLog";
import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user)              return errorResponse("Unauthorized", 401);
    if (user.role !== "admin") return errorResponse("Forbidden", 403);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const module_   = searchParams.get("module")    ?? "";
    const action    = searchParams.get("action")    ?? "";
    const status    = searchParams.get("status")    ?? "";
    const startDate = searchParams.get("startDate") ?? "";
    const endDate   = searchParams.get("endDate")   ?? "";

    const query: Record<string, any> = { tenantId: user.tenantId };
    if (module_) query.module = module_;
    if (action)  query.action = action;
    if (status)  query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate)   query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    const rows = [
      ["Timestamp", "User", "Email", "Role", "Action", "Module", "Entity", "Status", "IP", "Message"],
      ...logs.map((l: any) => [
        new Date(l.createdAt).toISOString(),
        l.userName   ?? "—",
        l.userEmail  ?? "—",
        l.userRole   ?? "—",
        l.action     ?? "—",
        l.module     ?? "—",
        l.entityName ?? l.entityId ?? "—",
        l.status     ?? "—",
        l.ipAddress  ?? "—",
        (l.message   ?? "").replace(/,/g, ";"),
      ]),
    ];

    const csv = rows.map(r => r.join(",")).join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type":        "text/csv",
        "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export audit error:", error);
    return errorResponse("Failed to export", 500);
  }
}
