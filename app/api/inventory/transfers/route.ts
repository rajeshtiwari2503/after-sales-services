import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import InventoryTransfer from '@/models/InventoryTransfer';
import { InventoryTransferService } from '@/services/inventory-transfer.service';
import { Types } from 'mongoose';
import { z } from 'zod';

const lineSchema = z.object({
  inventoryId: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0).optional(),
});

const createSchema = z.object({
  kind: z.enum(['dispatch', 'request']),
  serviceCenterId: z.string().min(1),
  items: z.array(lineSchema).min(1),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const kind = searchParams.get('kind');
    const serviceCenterId = searchParams.get('serviceCenterId');

    const query: Record<string, unknown> = { tenantId: user.tenantId };

    if (status) query.status = status;
    if (kind) query.kind = kind;

    if (user.role === 'service_center') {
      const scHeader = request.headers.get('x-service-center-id');
      if (scHeader && Types.ObjectId.isValid(scHeader)) {
        query.serviceCenterId = new Types.ObjectId(scHeader);
      }
    } else if (serviceCenterId && Types.ObjectId.isValid(serviceCenterId)) {
      query.serviceCenterId = new Types.ObjectId(serviceCenterId);
    }

    if (user.role === 'manager' || user.role === 'admin') {
      // all tenant transfers
    } else if (user.role !== 'service_center') {
      return errorResponse('Forbidden', 403);
    }

    const transfers = await InventoryTransfer.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return successResponse({ transfers });
  } catch (error) {
    console.error('List transfers error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const User = (await import('@/models/User')).default;
    const creator = await User.findById(user.userId).select('name').lean();
    const userName = creator?.name ?? 'User';

    const { kind, serviceCenterId, items, notes } = parsed.data;

    if (kind === 'dispatch') {
      if (!['admin', 'manager'].includes(user.role)) {
        return errorResponse('Only admin or brand can dispatch stock', 403);
      }
      const transfer = await InventoryTransferService.createDispatch({
        tenantId: user.tenantId,
        serviceCenterId,
        items,
        notes,
        userId: user.userId,
        userName,
        userRole: user.role,
      });
      return successResponse(transfer, 'Parts dispatched to service center', 201);
    }

    if (user.role !== 'service_center') {
      return errorResponse('Only service centers can create part requests', 403);
    }

    const scHeader = request.headers.get('x-service-center-id');
    if (!scHeader || scHeader !== serviceCenterId) {
      return errorResponse('Invalid service center', 403);
    }

    const transfer = await InventoryTransferService.createRequest({
      tenantId: user.tenantId,
      serviceCenterId,
      items,
      notes,
      userId: user.userId,
      userName,
      userRole: user.role,
    });

    return successResponse(transfer, 'Parts request submitted', 201);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An error occurred';
    console.error('Create transfer error:', error);
    return errorResponse(msg, 400);
  }
}
