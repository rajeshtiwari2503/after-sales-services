//  import { NextRequest } from 'next/server';
// import { updateInventorySchema } from '@/schemas/inventory.schema';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
 
// import Inventory from '@/models/Inventory';
// import connectDB from '@/lib/db';

// import { getAuthUser } from '@/lib/auth-helper';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     await connectDB();
//     const { id } = await params;

//     const item = await Inventory.findOne({ _id: id, tenantId: user.tenantId });

//     if (!item) {
//       return errorResponse('Item not found', 404);
//     }

//     return successResponse(item);
//   } catch (error) {
//     console.error('Get inventory item error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     if (!['admin', 'manager'].includes(user.role)) {
//       return errorResponse('Forbidden', 403);
//     }

//     const body = await request.json();
//     const validation = updateInventorySchema.safeParse(body);
//     if (!validation.success) {
//       return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
//     }

//     await connectDB();
//     const { id } = await params;

//     const item = await Inventory.findOneAndUpdate(
//       { _id: id, tenantId: user.tenantId },
//       validation.data,
//       { new: true }
//     );

//     if (!item) {
//       return errorResponse('Item not found', 404);
//     }

//     return successResponse(item, 'Item updated successfully');
//   } catch (error) {
//     console.error('Update inventory error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     if (!['admin', 'manager'].includes(user.role)) {
//       return errorResponse('Forbidden', 403);
//     }

//     await connectDB();
//     const { id } = await params;

//     const item = await Inventory.findOneAndDelete({ _id: id, tenantId: user.tenantId });

//     if (!item) {
//       return errorResponse('Item not found', 404);
//     }

//     return successResponse(null, 'Item deleted successfully');
//   } catch (error) {
//     console.error('Delete inventory error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

 import { NextRequest } from "next/server";

import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getAuthUser } from "@/lib/auth-helper";

import Inventory from "@/models/Inventory";
import connectDB from "@/lib/db";

// ======================
// GET INVENTORY ITEM
// ======================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const { id } = await context.params;

    const item = await Inventory.findOne({
      _id: id,
      tenantId: user.tenantId,
    });

    if (!item) {
      return errorResponse("Item not found", 404);
    }

    return successResponse(
      item,
      "Item fetched successfully"
    );
  } catch (error) {
    console.error("[INVENTORY_GET_ERROR]", error);

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}

// ======================
// UPDATE INVENTORY ITEM
// ======================

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const { id } = await context.params;

    const body = await request.json();

    // ======================
    // Allowed Fields
    // ======================

    const allowedFields = [
      "quantity",
      "name",
      "unitPrice",
      "costPrice",
      "location",
      "minQuantity",
      "maxQuantity",
      "isActive",
    ];

    const updateData: Record<string, any> = {};

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (body.quantity !== undefined) {
      updateData.lastRestockedAt = new Date();
    }

    const item = await Inventory.findOneAndUpdate(
      {
        _id: id,
        tenantId: user.tenantId,
      },
      updateData,
      {
        new: true,
      }
    );

    if (!item) {
      return errorResponse("Item not found", 404);
    }

    return successResponse(
      item,
      "Item updated successfully"
    );
  } catch (error) {
    console.error("[INVENTORY_PATCH_ERROR]", error);

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}

// ======================
// DELETE INVENTORY ITEM
// ======================

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    const { id } = await context.params;

    const item = await Inventory.findOneAndDelete({
      _id: id,
      tenantId: user.tenantId,
    });

    if (!item) {
      return errorResponse("Item not found", 404);
    }

    return successResponse(
      null,
      "Item deleted successfully"
    );
  } catch (error) {
    console.error("[INVENTORY_DELETE_ERROR]", error);

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}