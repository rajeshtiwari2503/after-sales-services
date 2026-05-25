import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Inventory from '@/models/Inventory';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    await connectDB();
    const { id } = await params;
    const item = await Inventory.findOne({ _id: id, tenantId: user.tenantId });
    if (!item) return errorResponse('Item not found', 404);
    return successResponse(item);
  } catch (error) {
    return errorResponse('An error occurred', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager', 'service_center'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    delete body.tenantId;

    const item = await Inventory.findOneAndUpdate(
      { _id: id, tenantId: user.tenantId },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!item) return errorResponse('Item not found', 404);
    return successResponse(item, 'Item updated');
  } catch (error) {
    return errorResponse('An error occurred', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }
    await connectDB();
    const { id } = await params;
    const item = await Inventory.findOneAndUpdate(
      { _id: id, tenantId: user.tenantId },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!item) return errorResponse('Item not found', 404);
    return successResponse(null, 'Item deleted');
  } catch (error) {
    return errorResponse('An error occurred', 500);
  }
}