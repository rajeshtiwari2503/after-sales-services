// 5. app/api/warranty-stickers/void/route.ts  — Admin voids sticker
// ═══════════════════════════════════════════════════════════════
 
import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import WarrantySticker from "@/models/WarrantySticker";
import connectDB from "@/lib/db";
 
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);
    if (!["admin","manager"].includes(user.role)) return errorResponse("Forbidden", 403);
 
    await connectDB();
    const { token, reason } = await request.json();
    if (!token) return errorResponse("Token required", 400);
 
    const sticker = await WarrantySticker.findOne({ token, tenantId: user.tenantId });
    if (!sticker) return errorResponse("Sticker not found", 404);
    if (sticker.status === "activated") return errorResponse("Cannot void an already activated sticker", 400);
 
    await WarrantySticker.findByIdAndUpdate(sticker._id, {
      status:   "voided",
      metadata: { voidReason: reason, voidedBy: user.userId, voidedAt: new Date() },
    });
 
    return successResponse(null, "Sticker voided");
  } catch { return errorResponse("An error occurred", 500); }
}
 