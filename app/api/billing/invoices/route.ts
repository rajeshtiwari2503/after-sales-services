import { NextRequest } from "next/server";
import Invoice from "@/models/Invoice";
import connectDB from "@/lib/db";
import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);
    if (!["admin", "manager"].includes(user.role)) {
      return errorResponse("Forbidden", 403);
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit  = parseInt(searchParams.get("limit") ?? "50");

    const query: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) query.status = status;

    const invoices = await Invoice.find(query)
      .populate("customerId", "name email")
      .populate("ticketId", "ticketNumber title")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return successResponse({ invoices }, "Invoices fetched");
  } catch (error) {
    console.error("GET invoices error:", error);
    return errorResponse("An error occurred", 500);
  }
}
