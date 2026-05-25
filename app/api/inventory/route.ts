import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Inventory from '@/models/Inventory';
import connectDB from '@/lib/db';
import { createInventorySchema } from '@/schemas/inventory.schema';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page       = parseInt(searchParams.get('page')  ?? '1');
    const limit      = parseInt(searchParams.get('limit') ?? '20');
    const category   = searchParams.get('category');
    const lowStock   = searchParams.get('lowStock') === 'true';
    const outOfStock = searchParams.get('outOfStock') === 'true';
    const search     = searchParams.get('search');
    const serviceCenterId = searchParams.get('serviceCenterId');

    const query: Record<string, any> = { tenantId: user.tenantId, isActive: true };

    if (category)        query.category = category;
    if (serviceCenterId) query.serviceCenterId = serviceCenterId;
    if (outOfStock)      query.quantity = 0;
    else if (lowStock)   query.$expr = { $lte: ['$quantity', '$minQuantity'] };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku:  { $regex: search, $options: 'i' } },
        { 'supplier.name': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Inventory.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Inventory.countDocuments(query),
    ]);

    // Stats for dashboard
    const [totalCount, lowStockCount, outOfStockCount] = await Promise.all([
      Inventory.countDocuments({ tenantId: user.tenantId, isActive: true }),
      Inventory.countDocuments({ tenantId: user.tenantId, isActive: true, $expr: { $lte: ['$quantity', '$minQuantity'] } }),
      Inventory.countDocuments({ tenantId: user.tenantId, isActive: true, quantity: 0 }),
    ]);

    // Total inventory value
    const valueAgg = await Inventory.aggregate([
      { $match: { tenantId: user.tenantId, isActive: true } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } } } },
    ]);
    const totalValue = valueAgg[0]?.totalValue ?? 0;

    return successResponse({
      inventory: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: { totalItems: totalCount, lowStockItems: lowStockCount, outOfStockItems: outOfStockCount, totalValue },
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager', 'service_center'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();
    const body = await request.json();

    const validation = createInventorySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    const existing = await Inventory.findOne({
      sku: body.sku.toUpperCase(),
      tenantId: user.tenantId,
    });
    if (existing) return errorResponse('SKU already exists in your inventory', 400);

    const item = await Inventory.create({
      ...validation.data,
      sku: body.sku.toUpperCase(),
      tenantId: user.tenantId,
    });

    return successResponse(item, 'Inventory item created', 201);
  } catch (error) {
    console.error('Create inventory error:', error);
    return errorResponse('An error occurred', 500);
  }
}