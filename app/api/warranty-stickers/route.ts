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
    const search  = searchParams.get("search") ?? "";
 
    const query: Record<string, any> = { tenantId: user.tenantId };
    if (status)    query.status    = status;
    if (batchId)   query.batchId   = batchId;
    if (productId) query.productId = productId;
    if (search) {
      query.$or = [
        { token:       { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { modelNumber: { $regex: search, $options: 'i' } },
      ];
    }
 
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
 
    const productName   = body.productName;
    const modelNumber   = body.modelNumber ?? productName;
    const warrantyYears = Number(body.warrantyYears ?? body.warrantyPeriod ?? 1);
    const warrantyType  = body.warrantyType ?? "standard";
    const quantity      = Number(body.count ?? body.quantity ?? 1);
 
    if (!productName) return errorResponse("Product name is required", 400);
    if (quantity < 1 || quantity > 500) return errorResponse("Quantity must be 1–500", 400);
 
    const brand = await Brand.findOne({ tenantId: user.tenantId }).lean() as any;
 
    const batchId   = `BATCH-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 2 * 365 * 86400000);
 
    const stickers = Array.from({ length: quantity }, (_, i) => {
      const token = generateToken();
      return {
        token,
        activationUrl: `${BASE_URL}/customer/warranty/activate/${token}`,
        tenantId:      user.tenantId,
        brandId:       brand?._id,
        productId:     body.productId ?? undefined,
        productName,
        modelNumber,
        categoryId:    body.categoryId ?? undefined,
        categoryName:  body.categoryName ?? undefined,
        warrantyYears,
        warrantyType,
        warrantyPeriod: warrantyYears * 12,
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
      created:  created.length,
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

export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);
    if (!["admin", "manager"].includes(user.role)) return errorResponse("Forbidden", 403);

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return errorResponse("id query param required", 400);

    await connectDB();
    const mongoose = await import("mongoose");
    const filter: Record<string, unknown> = { tenantId: user.tenantId, status: "unactivated" };
    if (mongoose.Types.ObjectId.isValid(id)) {
      filter._id = id;
    } else {
      filter.token = id;
    }

    const sticker = await WarrantySticker.findOneAndUpdate(
      filter,
      { $set: { status: "voided" } },
      { new: true }
    );
    if (!sticker) return errorResponse("Sticker not found or already activated", 404);

    return successResponse(null, "Sticker voided");
  } catch (error) {
    console.error("DELETE stickers error:", error);
    return errorResponse("An error occurred", 500);
  }
}