 import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import Ticket from "@/models/Ticket";
import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { tenantId } = user;

    const [statsAgg, slaAgg] = await Promise.all([
      Ticket.aggregate([
        { $match: { tenantId } },
        { $group: {
          _id: "$status",
          count: { $sum: 1 },
        }},
      ]),
      Ticket.aggregate([
        { $match: { tenantId, "sla.isResolutionBreached": true } },
        { $count: "breached" },
      ]),
    ]);

    const map: Record<string, number> = {};
    statsAgg.forEach((s: any) => { map[s._id] = s.count; });

    const total = Object.values(map).reduce((a, b) => a + b, 0);
    const resolved = map["resolved"] ?? 0;

    return successResponse({
      open: map["open"] ?? 0,
      inProgress: map["in_progress"] ?? 0,
      pending: (map["pending_parts"] ?? 0) + (map["pending_customer"] ?? 0),
      resolved,
      closed: map["closed"] ?? 0,
      unassigned: await Ticket.countDocuments({ tenantId, technicianId: null, status: "open" }),
      slaBreaches: slaAgg[0]?.breached ?? 0,
      slaRate: total > 0 ? Math.round((1 - (slaAgg[0]?.breached ?? 0) / total) * 100) : 100,
    }, "Stats fetched");
  } catch (error) {
    console.error("Ticket stats error:", error);
    return errorResponse("An error occurred", 500);
  }
}