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


import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Inventory from '@/models/Inventory';
import connectDB from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    await connectDB();
    const item = await Inventory.findOne({ _id: params.id, tenantId: user.tenantId });
    if (!item) return errorResponse('Item not found', 404);
    return successResponse(item, 'Item fetched');
  } catch {
    return errorResponse('An error occurred', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const body = await request.json();

    // Only allow safe field updates
    const allowed = ['quantity', 'name', 'unitPrice', 'costPrice', 'location', 'minQuantity', 'maxQuantity', 'isActive'];
    const updateData: Record<string, any> = {};
    allowed.forEach(f => { if (body[f] !== undefined) updateData[f] = body[f]; });

    if (body.quantity !== undefined) {
      updateData.lastRestockedAt = new Date();
    }

    const item = await Inventory.findOneAndUpdate(
      { _id: params.id, tenantId: user.tenantId },
      updateData,
      { new: true }
    );

    if (!item) return errorResponse('Item not found', 404);
    return successResponse(item, 'Item updated');
  } catch {
    return errorResponse('An error occurred', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    await connectDB();
    await Inventory.findOneAndDelete({ _id: params.id, tenantId: user.tenantId });
    return successResponse(null, 'Item deleted');
  } catch {
    return errorResponse('An error occurred', 500);
  }
}