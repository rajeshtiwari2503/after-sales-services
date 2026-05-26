import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Inventory from '@/models/Inventory';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { NotificationService } from '@/services/notification.service';
import { audit } from '@/lib/audit-request';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/lib/audit';

async function maybeNotifyLowStock(
  item: { name: string; quantity: number; minQuantity: number; tenantId: string }
) {
  if (item.quantity > item.minQuantity) return;
  const admins = await User.find({
    tenantId: item.tenantId,
    role: { $in: ['admin', 'manager'] },
    isActive: true,
  }).select('_id').lean();
  const adminIds = admins.map(a => a._id.toString());
  if (!adminIds.length) return;
  await NotificationService.onLowStock({
    adminUserIds: adminIds,
    tenantId:     item.tenantId,
    itemName:     item.name,
    quantity:     item.quantity,
    minQuantity:  item.minQuantity,
  });
}

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

    const before = await Inventory.findOne({ _id: id, tenantId: user.tenantId }).lean();
    const item = await Inventory.findOneAndUpdate(
      { _id: id, tenantId: user.tenantId },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!item) return errorResponse('Item not found', 404);

    const qtyChanged = body.quantity !== undefined && before && before.quantity !== item.quantity;
    const crossedLow = item.quantity <= item.minQuantity;
    if (qtyChanged && crossedLow) {
      maybeNotifyLowStock(item).catch(e => console.error('Low stock notify:', e));
    }

    audit(request, user, {
      action: AUDIT_ACTIONS.UPDATE,
      module: AUDIT_MODULES.INVENTORY,
      entityId:   id,
      entityName: item.name,
      message:    `Inventory updated: ${item.sku}`,
    });

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

    audit(request, user, {
      action: AUDIT_ACTIONS.DELETE,
      module: AUDIT_MODULES.INVENTORY,
      entityId:   id,
      entityName: item.name,
      message:    `Inventory item removed: ${item.sku}`,
    });

    return successResponse(null, 'Item deleted');
  } catch (error) {
    return errorResponse('An error occurred', 500);
  }
}
