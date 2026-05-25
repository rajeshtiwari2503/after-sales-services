// import { NextRequest } from 'next/server';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper';
// import connectDB from '@/lib/db';
// import WarrantySticker from '@/models/WarrantySticker';
// import Warranty from '@/models/Warranty';

// export async function POST(
//   request: NextRequest,
//   { params }: { params: Promise<{ token: string }> }
// ) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse('Unauthorized', 401);

//     await connectDB();
//     const { token } = await params;
//     const body = await request.json().catch(() => ({}));

//     // Find the sticker by token
//     const sticker = await WarrantySticker.findOne({ token, tenantId: user.tenantId });
//     if (!sticker) return errorResponse('Invalid or expired warranty token', 404);

//     if (sticker.status === 'activated') {
//       return errorResponse('This warranty sticker has already been activated', 400);
//     }
//     if (sticker.status === 'expired') {
//       return errorResponse('This warranty sticker has expired and cannot be activated', 400);
//     }

//     // Activate the sticker
//     sticker.status = 'activated';
//     sticker.activatedAt = new Date();
//     sticker.activatedBy = user.userId;
//     if (body.serialNumber)   sticker.serialNumber   = body.serialNumber;
//     if (body.purchaseDate)   sticker.purchaseDate   = new Date(body.purchaseDate);
//     if (body.customerName)   sticker.customerName   = body.customerName;
//     if (body.customerEmail)  sticker.customerEmail  = body.customerEmail;
//     if (body.customerPhone)  sticker.customerPhone  = body.customerPhone;
//     await sticker.save();

//     // Create a Warranty record linked to this customer
//     const warrantyStartDate = new Date();
//     const warrantyEndDate   = new Date();
//     warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + (sticker.warrantyYears ?? 1));

//     const warranty = await Warranty.create({
//       tenantId:      user.tenantId,
//       customerId:    user.userId,
//       productId:     sticker.productId,
//       productName:   sticker.productName ?? 'Product',
//       serialNumber:  body.serialNumber ?? sticker.serialNumber,
//       purchaseDate:  body.purchaseDate  ? new Date(body.purchaseDate) : warrantyStartDate,
//       warrantyStartDate,
//       warrantyEndDate,
//       warrantyType:  sticker.warrantyType ?? 'standard',
//       status:        'active',
//       stickerId:     sticker._id,
//       notes:         `Activated via QR code on ${warrantyStartDate.toLocaleDateString('en-IN')}`,
//     }).catch(() => null); // non-blocking if Warranty model differs

//     return successResponse({
//       sticker: {
//         token:          sticker.token,
//         status:         sticker.status,
//         activatedAt:    sticker.activatedAt,
//         productName:    sticker.productName,
//         warrantyYears:  sticker.warrantyYears,
//       },
//       warranty: warranty ? {
//         _id:              warranty._id,
//         warrantyEndDate:  warrantyEndDate,
//         warrantyType:     sticker.warrantyType ?? 'standard',
//       } : null,
//     }, 'Warranty activated successfully!', 201);
//   } catch (error) {
//     console.error('Warranty activation error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ token: string }> }
// ) {
//   try {
//     await connectDB();
//     const { token } = await params;

//     // Allow unauthenticated GET to check status before activating
//     const sticker = await WarrantySticker.findOne({ token }).select('-__v');
//     if (!sticker) return errorResponse('Invalid warranty token', 404);

//     return successResponse({
//       token:         sticker.token,
//       status:        sticker.status,
//       productName:   sticker.productName,
//       brandName:     sticker.brandName,
//       warrantyYears: sticker.warrantyYears,
//       warrantyType:  sticker.warrantyType,
//       activatedAt:   sticker.activatedAt,
//     });
//   } catch (error) {
//     return errorResponse('An error occurred', 500);
//   }
// }



import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import WarrantySticker from '@/models/WarrantySticker';
import Warranty from '@/models/Warranty';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const user = getAuthUser(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const { token } = await context.params;

    const body = await request.json().catch(() => ({}));

    const sticker: any = await WarrantySticker.findOne({
      token,
      tenantId: user.tenantId,
    });

    if (!sticker) {
      return errorResponse(
        "Invalid or expired warranty token",
        404
      );
    }

    // your remaining logic...
  } catch (error) {
    console.error(error);

    return errorResponse("An error occurred", 500);
  }
}

 export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();

    const { token } = await context.params;

    const sticker: any = await WarrantySticker.findOne({
      token,
    }).select("-__v");

    if (!sticker) {
      return errorResponse("Invalid warranty token", 404);
    }

    return successResponse({
      token: sticker.token,
      status: sticker.status,
      productName: sticker.productName,
      brandName: sticker.brandName,
      warrantyYears: sticker.warrantyYears,
      warrantyType: sticker.warrantyType,
      activatedAt: sticker.activatedAt,
    });
  } catch (error) {
    console.error(error);

    return errorResponse("An error occurred", 500);
  }
}