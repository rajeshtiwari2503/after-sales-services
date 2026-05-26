import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import { InventoryTransferService } from '@/services/inventory-transfer.service';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { id } = await context.params;
    const body = await request.json();
    const action = body.action as string;

    if (action === 'approve') {
      const transfer = await InventoryTransferService.approveAndShip(
        id,
        user.userId,
        user.role
      );
      return successResponse(transfer, 'Request approved and dispatched');
    }

    if (action === 'reject') {
      const transfer = await InventoryTransferService.rejectRequest(
        id,
        body.reason ?? 'Rejected',
        user.role
      );
      return successResponse(transfer, 'Request rejected');
    }

    if (action === 'receive') {
      const scHeader =
        user.role === 'service_center'
          ? request.headers.get('x-service-center-id') ?? undefined
          : undefined;

      if (user.role === 'service_center' && !scHeader) {
        return errorResponse('Service center not linked to account', 403);
      }

      const transfer = await InventoryTransferService.confirmReceive(
        id,
        user.userId,
        scHeader
      );
      return successResponse(transfer, 'Shipment received');
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An error occurred';
    console.error('Transfer PATCH error:', error);
    return errorResponse(msg, 400);
  }
}
