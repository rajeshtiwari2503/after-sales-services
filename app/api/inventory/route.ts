 import { NextRequest } from 'next/server';
import { createInventorySchema } from '@/schemas/inventory.schema';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/apiResponse';
 
import Inventory from '@/models/Inventory';
import connectDB from '@/lib/db';

 import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search');

    const query: Record<string, any> = { tenantId: user.tenantId };

    if (category) query.category = category;
    if (lowStock) query.$expr = { $lte: ['$quantity', '$minQuantity'] };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Inventory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Inventory.countDocuments(query),
    ]);

    return paginatedResponse(items, { page, limit, total });
  } catch (error) {
    console.error('Get inventory error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    if (!['admin', 'manager'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const validation = createInventorySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    await connectDB();

    const existingItem = await Inventory.findOne({
      tenantId: user.tenantId,
      sku: validation.data.sku.toUpperCase(),
    });

    if (existingItem) {
      return errorResponse('SKU already exists', 400);
    }

    const item = await Inventory.create({
      ...validation.data,
      sku: validation.data.sku.toUpperCase(),
      tenantId: user.tenantId,
    });

    return successResponse(item, 'Inventory item created successfully', 201);
  } catch (error) {
    console.error('Create inventory error:', error);
    return errorResponse('An error occurred', 500);
  }
}
