// app/api/products/route.ts  — NEW FILE

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');

    const filter: Record<string, any> =
      user.role === 'admin' ? {} : { tenantId: user.tenantId };

    if (categoryId) filter.categoryId = categoryId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { modelNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .populate('categoryId', 'name slug faults')
      .sort({ name: 1 })
      .lean();

    return successResponse(products, 'Products fetched');
  } catch (e) {
    console.error(e);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role))
      return errorResponse('Forbidden', 403);

    await connectDB();
    const body = await request.json();
    const { name, modelNumber, categoryId, description, warrantyPeriod, specifications } = body;

    if (!name || !modelNumber || !categoryId)
      return errorResponse('name, modelNumber, categoryId are required', 400);

    const tenantId = user.role === 'admin' ? (body.tenantId ?? user.tenantId) : user.tenantId;

    // Validate category belongs to same tenant
    const cat = await Category.findOne(
      user.role === 'admin' ? { _id: categoryId } : { _id: categoryId, tenantId }
    );
    if (!cat) return errorResponse('Category not found or belongs to another brand', 404);

    const existing = await Product.findOne({ tenantId, modelNumber });
    if (existing) return errorResponse('Model number already exists', 409);

    const product = await Product.create({
      name,
      modelNumber,
      categoryId,
      tenantId,
      description: description ?? '',
      warrantyPeriod: warrantyPeriod ?? 12,
      specifications: specifications ?? {},
      isActive: true,
    });

    const populated = await Product.findById(product._id)
      .populate('categoryId', 'name slug faults')
      .lean();

    return successResponse(populated, 'Product created', 201);
  } catch (e: any) {
    console.error(e);
    if (e.code === 11000) return errorResponse('Model number already exists', 409);
    return errorResponse('An error occurred', 500);
  }
}