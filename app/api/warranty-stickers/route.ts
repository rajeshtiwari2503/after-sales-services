//    Brand generates stickers in batches
// ═══════════════════════════════════════════════════════════════
 
import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import WarrantySticker from "@/models/WarrantySticker";
import Brand from "@/models/Brand";
import connectDB from "@/lib/db";
import crypto from "crypto";
 
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
 
function generateToken(): string {
  // e.g. WRN-A1B2C3D4E5
  const rand = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `WRN-${rand}`;
}
 
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);
    if (!["admin","manager"].includes(user.role)) return errorResponse("Forbidden", 403);
 
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page    = parseInt(searchParams.get("page")  ?? "1");
    const limit   = parseInt(searchParams.get("limit") ?? "20");
    const status  = searchParams.get("status") ?? "";
    const batchId = searchParams.get("batchId") ?? "";
    const productId = searchParams.get("productId") ?? "";
 
    const query: Record<string, any> = { tenantId: user.tenantId };
    if (status)    query.status    = status;
    if (batchId)   query.batchId   = batchId;
    if (productId) query.productId = productId;
 
    const [stickers, total] = await Promise.all([
      WarrantySticker.find(query)
        .populate("activatedBy", "name email")
        .populate("warrantyId", "warrantyStartDate warrantyEndDate")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      WarrantySticker.countDocuments(query),
    ]);
 
    // Batch stats
    const batchStats = await WarrantySticker.aggregate([
      { $match: { tenantId: user.tenantId } },
      { $group: {
        _id: "$batchId",
        total:       { $sum: 1 },
        activated:   { $sum: { $cond: [{ $eq: ["$status", "activated"] }, 1, 0] } },
        unactivated: { $sum: { $cond: [{ $eq: ["$status", "unactivated"] }, 1, 0] } },
        productName: { $first: "$productName" },
        createdAt:   { $first: "$createdAt" },
      }},
      { $sort: { createdAt: -1 } },
    ]);
 
    return successResponse({ stickers, total, page, limit, batchStats }, "Stickers fetched");
  } catch (error) {
    console.error("GET stickers error:", error);
    return errorResponse("An error occurred", 500);
  }
}
 
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);
    if (!["admin","manager"].includes(user.role)) return errorResponse("Forbidden", 403);
 
    await connectDB();
    const body = await request.json();
 
    const { productName, modelNumber, categoryName, warrantyPeriod, quantity, productId, categoryId } = body;
 
    if (!productName || !modelNumber) return errorResponse("Product name and model number required", 400);
    if (!quantity || quantity < 1 || quantity > 500) return errorResponse("Quantity must be 1–500", 400);
 
    const brand = await Brand.findOne({ tenantId: user.tenantId }).lean() as any;
 
    // Generate a batch ID
    const batchId    = `BATCH-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const expiresAt  = new Date(Date.now() + 2 * 365 * 86400000); // 2 years to activate
 
    const stickers = Array.from({ length: quantity }, (_, i) => {
      const token = generateToken();
      return {
        token,
        activationUrl: `${BASE_URL}/activate-warranty?token=${token}`,
        tenantId:      user.tenantId,
        brandId:       brand?._id,
        productId:     productId ?? undefined,
        productName,
        modelNumber,
        categoryId:    categoryId ?? undefined,
        categoryName:  categoryName ?? undefined,
        warrantyPeriod: warrantyPeriod ?? 12,
        status:        "unactivated",
        batchId,
        batchIndex:    i + 1,
        createdBy:     user.userId,
        expiresAt,
        scannedCount:  0,
      };
    });
 
    const created = await WarrantySticker.insertMany(stickers, { ordered: false });
 
    return successResponse({
      batchId,
      count:    created.length,
      stickers: created.map(s => ({
        _id:           s._id,
        token:         s.token,
        activationUrl: s.activationUrl,
        batchIndex:    s.batchIndex,
      })),
    }, `${created.length} stickers generated`, 201);
 
  } catch (error) {
    console.error("POST stickers error:", error);
    return errorResponse("An error occurred", 500);
  }
}