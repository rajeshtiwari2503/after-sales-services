// app/api/categories/[id]/route.ts  — NEW FILE

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    await connectDB();
    const { id } = await params;
    const filter: Record<string, any> = { _id: id };
    if (user.role !== 'admin') filter.tenantId = user.tenantId;
    const category = await Category.findOne(filter).lean();
    if (!category) return errorResponse('Category not found', 404);
    return successResponse(category, 'Category fetched');
  } catch (e) {
    return errorResponse('An error occurred', 500);
  }
}

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
    if (body.name !== undefined) {
      update.name = body.name;
      update.slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    if (body.description !== undefined) update.description = body.description;
    if (body.isActive !== undefined) update.isActive = body.isActive;
    if (body.faults !== undefined) update.faults = body.faults;

    const category = await Category.findOneAndUpdate(filter, update, { new: true });
    if (!category) return errorResponse('Category not found', 404);
    return successResponse(category, 'Category updated');
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

    const deleted = await Category.findOneAndDelete(filter);
    if (!deleted) return errorResponse('Category not found', 404);
    return successResponse(null, 'Category deleted');
  } catch (e) {
    return errorResponse('An error occurred', 500);
  }
}