import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import Inventory from '@/models/Inventory';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { tenantId } = user;

    const [
      incoming, inProgress, resolved,
      technicians, inventoryItems, slaBreaches,
    ] = await Promise.all([
      Ticket.countDocuments({ tenantId, status: 'open' }),
      Ticket.countDocuments({ tenantId, status: 'in_progress' }),
      Ticket.countDocuments({ tenantId, status: 'resolved' }),
      User.countDocuments({ tenantId, role: 'technician', isActive: true }),
      Inventory.find({ tenantId }).select('quantity minQuantity').lean(),
      Ticket.countDocuments({ tenantId, 'sla.isResolutionBreached': true }),
    ]);

    const lowInventory = (inventoryItems as any[]).filter(
      (i: any) => i.quantity <= i.minQuantity
    ).length;

    const unassigned = await Ticket.countDocuments({
      tenantId, status: 'open', technicianId: null,
    });

    const partsInStock = (inventoryItems as any[]).reduce(
      (sum: number, i: any) => sum + (i.quantity ?? 0), 0
    );

    return successResponse({
      incoming,
      inProgress,
      resolved,
      technicians,
      partsInStock,
      slaBreaches,
      lowInventory,
      unassigned,
      walletBalance: 12450,
    }, 'Service center stats fetched');
  } catch (error) {
    console.error('SC stats error:', error);
    return errorResponse('An error occurred', 500);
  }
}