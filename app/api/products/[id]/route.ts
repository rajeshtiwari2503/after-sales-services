// app/api/products/[id]/route.ts  — NEW FILE

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) return errorResponse('Forbidden', 403);

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const filter: Record<string, any> = { _id: id };
    if (user.role !== 'admin') filter.tenantId = user.tenantId;

    const update: Record<string, any> = {};
    const allowed = ['name', 'modelNumber', 'categoryId', 'description', 'warrantyPeriod', 'specifications', 'isActive', 'imageUrl'];
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const product = await Product.findOneAndUpdate(filter, update, { new: true })
      .populate('categoryId', 'name slug faults');
    if (!product) return errorResponse('Product not found', 404);
    return successResponse(product, 'Product updated');
  } catch (e) {
    return errorResponse('An error occurred', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) return errorResponse('Forbidden', 403);

    await connectDB();
    const { id } = await params;
    const filter: Record<string, any> = { _id: id };
    if (user.role !== 'admin') filter.tenantId = user.tenantId;

    const deleted = await Product.findOneAndDelete(filter);
    if (!deleted) return errorResponse('Product not found', 404);
    return successResponse(null, 'Product deleted');
  } catch (e) {
    return errorResponse('An error occurred', 500);
  }
}