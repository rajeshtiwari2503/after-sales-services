// //    Public — scan QR → get product info (no auth needed)
// // ═══════════════════════════════════════════════════════════════
 
// import { NextRequest } from "next/server";
// import { successResponse, errorResponse } from "@/utils/apiResponse";
// import WarrantySticker from "@/models/WarrantySticker";
// import connectDB from "@/lib/db";
 
// export async function GET(
//   request: NextRequest,
//   { params }: { params: { token: string } }
// ) {
//   try {
//     await connectDB();
//     const sticker = await WarrantySticker.findOne({ token: params.token })
//       .populate("activatedBy", "name")
//       .populate("warrantyId", "warrantyStartDate warrantyEndDate status")
//       .lean() as any;
 
//     if (!sticker) return errorResponse("Invalid QR code — sticker not found", 404);
 
//     // Track scan
//     await WarrantySticker.updateOne(
//       { token: params.token },
//       { $inc: { scannedCount: 1 }, $set: { lastScannedAt: new Date() } }
//     );
 
//     // Return safe public info
//     return successResponse({
//       token:          sticker.token,
//       productName:    sticker.productName,
//       modelNumber:    sticker.modelNumber,
//       categoryName:   sticker.categoryName,
//       warrantyPeriod: sticker.warrantyPeriod,
//       status:         sticker.status,
//       activatedAt:    sticker.activatedAt,
//       expiresAt:      sticker.expiresAt,
//       // If already activated — show warranty info
//       warranty:       sticker.status === "activated" ? {
//         startDate: sticker.warrantyId?.warrantyStartDate,
//         endDate:   sticker.warrantyId?.warrantyEndDate,
//         status:    sticker.warrantyId?.status,
//       } : null,
//     }, "Sticker info fetched");
 
//   } catch (error) {
//     console.error("GET sticker token error:", error);
//     return errorResponse("An error occurred", 500);
//   }
// }
 

// Public — scan QR → get product info (no auth needed)

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import WarrantySticker from "@/models/WarrantySticker";
import connectDB from "@/lib/db";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    await connectDB();

    // ✅ Await params
    const { token } = await context.params;

    const sticker = await WarrantySticker.findOne({ token })
      .populate("activatedBy", "name")
      .populate("warrantyId", "warrantyStartDate warrantyEndDate status")
      .lean() as any;

    if (!sticker) {
      return errorResponse(
        "Invalid QR code — sticker not found",
        404
      );
    }

    // Track scan
    await WarrantySticker.updateOne(
      { token },
      {
        $inc: { scannedCount: 1 },
        $set: { lastScannedAt: new Date() },
      }
    );

    return successResponse(
      {
        token: sticker.token,
        productName: sticker.productName,
        modelNumber: sticker.modelNumber,
        categoryName: sticker.categoryName,
        warrantyPeriod: sticker.warrantyPeriod,
        status: sticker.status,
        activatedAt: sticker.activatedAt,
        expiresAt: sticker.expiresAt,

        warranty:
          sticker.status === "activated"
            ? {
                startDate:
                  sticker.warrantyId?.warrantyStartDate,
                endDate:
                  sticker.warrantyId?.warrantyEndDate,
                status: sticker.warrantyId?.status,
              }
            : null,
      },
      "Sticker info fetched"
    );
  } catch (error) {
    console.error("GET sticker token error:", error);

    return errorResponse(
      "An error occurred",
      500
    );
  }
}