//    Customer activates warranty by scanning QR
// ═══════════════════════════════════════════════════════════════
 
import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import WarrantySticker from "@/models/WarrantySticker";
import Warranty from "@/models/Warranty";
import connectDB from "@/lib/db";
import { Types } from "mongoose";
 
export async function POST(request: NextRequest) {
  try {
    // Must be logged in to activate
    const user = getAuthUser(request);
    if (!user) return errorResponse("Please login to activate warranty", 401);
    if (user.role !== "customer" && user.role !== "admin") {
      return errorResponse("Only customers can activate warranties", 403);
    }
 
    await connectDB();
    const body = await request.json();
    const { token, serialNumber, purchaseDate, purchaseLocation } = body;
 
    if (!token)        return errorResponse("Token required", 400);
    if (!serialNumber) return errorResponse("Serial number required", 400);
    if (!purchaseDate) return errorResponse("Purchase date required", 400);
 
    // Find sticker
    const sticker = await WarrantySticker.findOne({ token }).lean() as any;
    if (!sticker) return errorResponse("Invalid QR code — sticker not found", 404);
 
    // Validations
    if (sticker.status === "activated") {
      return errorResponse("This warranty has already been activated", 400);
    }
    if (sticker.status === "voided") {
      return errorResponse("This sticker has been voided", 400);
    }
    if (sticker.expiresAt && new Date() > new Date(sticker.expiresAt)) {
      return errorResponse("This sticker has expired — contact support", 400);
    }
 
    // Check duplicate serial number for same product
    const dupSerial = await Warranty.findOne({
      tenantId:     sticker.tenantId,
      serialNumber: serialNumber.trim().toUpperCase(),
    });
    if (dupSerial) {
      return errorResponse("This serial number is already registered", 400);
    }
 
    // Calculate warranty dates
    const purchaseDateObj  = new Date(purchaseDate);
    const warrantyStart    = new Date(purchaseDateObj);
    const warrantyEnd      = new Date(purchaseDateObj);
    warrantyEnd.setMonth(warrantyEnd.getMonth() + sticker.warrantyPeriod);
 
    // Create Warranty record
    const warranty = await Warranty.create({
      productName:       sticker.productName,
      serialNumber:      serialNumber.trim().toUpperCase(),
      tenantId:          sticker.tenantId,
      customerId:        new Types.ObjectId(user.userId),
      purchaseDate:      purchaseDateObj,
      warrantyStartDate: warrantyStart,
      warrantyEndDate:   warrantyEnd,
      warrantyType:      "standard",
      coverage:          ["Manufacturing defects", "Parts & labour"],
      status:            "active",
      claims:            [],
      documents:         [],
      // Extra fields
      productId:         sticker.productId,
      categoryId:        sticker.categoryId,
      stickerId:         sticker._id,
    });
 
    // Update sticker
    await WarrantySticker.findByIdAndUpdate(sticker._id, {
      status:           "activated",
      warrantyId:       warranty._id,
      activatedBy:      new Types.ObjectId(user.userId),
      activatedAt:      new Date(),
      serialNumber:     serialNumber.trim().toUpperCase(),
      purchaseDate:     purchaseDateObj,
      purchaseLocation: purchaseLocation?.trim(),
    });
 
    return successResponse({
      warranty: {
        _id:               warranty._id,
        productName:       warranty.productName,
        serialNumber:      warranty.serialNumber,
        warrantyStartDate: warranty.warrantyStartDate,
        warrantyEndDate:   warranty.warrantyEndDate,
        status:            warranty.status,
        warrantyPeriod:    sticker.warrantyPeriod,
      },
      message: `Warranty activated successfully! Valid until ${warrantyEnd.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    }, "Warranty activated!", 201);
 
  } catch (error) {
    console.error("Activate warranty error:", error);
    return errorResponse("An error occurred", 500);
  }
}
 