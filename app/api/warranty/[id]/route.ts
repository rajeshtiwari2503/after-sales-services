 

// import { NextRequest } from 'next/server';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper';
// import Warranty from '@/models/Warranty';
// import connectDB from '@/lib/db';

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse('Unauthorized', 401);
//     await connectDB();
//     const body = await request.json();
//     const item = await Warranty.findOneAndUpdate(
//       { _id: params.id, tenantId: user.tenantId },
//       body, { new: true }
//     );
//     if (!item) return errorResponse('Item not found', 404);
//     return successResponse(item, 'Updated');
//   } catch {
//     return errorResponse('An error occurred', 500);
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse('Unauthorized', 401);
//     await connectDB();
//     await Warranty.findOneAndDelete({ _id: params.id, tenantId: user.tenantId });
//     return successResponse(null, 'Deleted');
//   } catch {
//     return errorResponse('An error occurred', 500);
//   }
// }

import { NextRequest } from "next/server";

import {
  successResponse,
  errorResponse,
} from "@/utils/apiResponse";

import { getAuthUser } from "@/lib/auth-helper";

import Warranty from "@/models/Warranty";

import connectDB from "@/lib/db";

// ======================
// UPDATE WARRANTY
// ======================

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    await connectDB();

    const { id } =
      await context.params;

    const body =
      await request.json();

    const item =
      await Warranty.findOneAndUpdate(
        {
          _id: id,
          tenantId: user.tenantId,
        },
        body,
        {
          new: true,
        }
      );

    if (!item) {
      return errorResponse(
        "Item not found",
        404
      );
    }

    return successResponse(
      item,
      "Warranty updated successfully"
    );
  } catch (error) {
    console.error(
      "[PATCH_WARRANTY_ERROR]",
      error
    );

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}

// ======================
// DELETE WARRANTY
// ======================

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    await connectDB();

    const { id } =
      await context.params;

    const item =
      await Warranty.findOneAndDelete(
        {
          _id: id,
          tenantId: user.tenantId,
        }
      );

    if (!item) {
      return errorResponse(
        "Item not found",
        404
      );
    }

    return successResponse(
      null,
      "Warranty deleted successfully"
    );
  } catch (error) {
    console.error(
      "[DELETE_WARRANTY_ERROR]",
      error
    );

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}