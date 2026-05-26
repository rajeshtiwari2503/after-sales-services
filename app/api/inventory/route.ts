import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Inventory from '@/models/Inventory';
import connectDB from '@/lib/db';
import { createInventorySchema } from '@/schemas/inventory.schema';
import { Types } from 'mongoose';
import { NotificationService } from '@/services/notification.service';
import User from '@/models/User';
import { audit } from '@/lib/audit-request';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page            = parseInt(searchParams.get('page')  ?? '1');
    const limit           = parseInt(searchParams.get('limit') ?? '20');
    const category        = searchParams.get('category');
    const lowStock        = searchParams.get('lowStock') === 'true';
    const outOfStock      = searchParams.get('outOfStock') === 'true';
    const search          = searchParams.get('search');
    const serviceCenterId = searchParams.get('serviceCenterId');
    const brandId         = searchParams.get('brandId');
    const productId       = searchParams.get('productId');
    const categoryId      = searchParams.get('categoryId');

    const query: Record<string, any> = { tenantId: user.tenantId, isActive: true };

    if (category)        query.category        = category;
    if (serviceCenterId && Types.ObjectId.isValid(serviceCenterId))
      query.serviceCenterId = new Types.ObjectId(serviceCenterId);
    if (brandId && Types.ObjectId.isValid(brandId))
      query.brandId = new Types.ObjectId(brandId);
    if (productId && Types.ObjectId.isValid(productId))
      query.productId = new Types.ObjectId(productId);
    if (categoryId && Types.ObjectId.isValid(categoryId))
      query.categoryId = new Types.ObjectId(categoryId);

    if (outOfStock)      query.quantity = 0;
    else if (lowStock)   query.$expr = { $lte: ['$quantity', '$minQuantity'] };

    // RBAC: service center sees only its own inventory
    if (user.role === 'service_center') {
      const scHeader = request.headers.get('x-service-center-id');
      if (scHeader && Types.ObjectId.isValid(scHeader)) {
        query.serviceCenterId = new Types.ObjectId(scHeader);
      }
    }

    if (search) {
      query.$or = [
        { name:             { $regex: search, $options: 'i' } },
        { sku:              { $regex: search, $options: 'i' } },
        { 'supplier.name':  { $regex: search, $options: 'i' } },
        { category:         { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Inventory.find(query)
        .populate('productId',  'name modelNumber')
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Inventory.countDocuments(query),
    ]);

    const [totalCount, lowStockCount, outOfStockCount] = await Promise.all([
      Inventory.countDocuments({ tenantId: user.tenantId, isActive: true }),
      Inventory.countDocuments({ tenantId: user.tenantId, isActive: true, $expr: { $lte: ['$quantity', '$minQuantity'] } }),
      Inventory.countDocuments({ tenantId: user.tenantId, isActive: true, quantity: 0 }),
    ]);

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

    const extraFields: Record<string, any> = {};
    if (body.brandId    && Types.ObjectId.isValid(body.brandId))    extraFields.brandId    = new Types.ObjectId(body.brandId);
    if (body.productId  && Types.ObjectId.isValid(body.productId))  extraFields.productId  = new Types.ObjectId(body.productId);
    if (body.categoryId && Types.ObjectId.isValid(body.categoryId)) extraFields.categoryId = new Types.ObjectId(body.categoryId);
    if (body.serviceCenterId && Types.ObjectId.isValid(body.serviceCenterId))
      extraFields.serviceCenterId = new Types.ObjectId(body.serviceCenterId);
    else if (user.role === 'service_center') {
      const scHeader = request.headers.get('x-service-center-id');
      if (scHeader && Types.ObjectId.isValid(scHeader))
        extraFields.serviceCenterId = new Types.ObjectId(scHeader);
    }

    const item = await Inventory.create({
      ...validation.data,
      sku: body.sku.toUpperCase(),
      tenantId: user.tenantId,
      costPrice: body.costPrice ?? validation.data.unitPrice * 0.7,
      ...extraFields,
    });

    // Fire low-stock alert if quantity is already at or below min
    if (item.quantity <= item.minQuantity) {
      try {
        const admins = await User.find({ tenantId: user.tenantId, role: 'admin', isActive: true }).select('_id');
        if (admins.length > 0) {
          await NotificationService.onLowStock({
            adminUserIds: admins.map(a => a._id.toString()),
            tenantId:     user.tenantId,
            itemName:     item.name,
            quantity:     item.quantity,
            minQuantity:  item.minQuantity,
          });
        }
      } catch { /* non-critical */ }
    }

    audit(request, user, {
      action: AUDIT_ACTIONS.CREATE,
      module: AUDIT_MODULES.INVENTORY,
      entityId:   item._id.toString(),
      entityName: item.name,
      message:    `Inventory item created: ${item.sku}`,
    });

    return successResponse(item, 'Inventory item created', 201);
  } catch (error) {
    console.error('Create inventory error:', error);
    return errorResponse('An error occurred', 500);
  }
}