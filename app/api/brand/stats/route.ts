import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Ticket from '@/models/Ticket';
import ServiceCenter from '@/models/ServiceCenter';
import Warranty from '@/models/Warranty';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { tenantId } = user;

    const [
      openTickets, resolvedTickets,
      totalTickets, serviceCenters,
      products, slaAgg,
    ] = await Promise.all([
      Ticket.countDocuments({ tenantId, status: 'open' }),
      Ticket.countDocuments({ tenantId, status: 'resolved' }),
      Ticket.countDocuments({ tenantId }),
      ServiceCenter.countDocuments({ tenantId }),
      Warranty.countDocuments({ tenantId }),
      Ticket.aggregate([
        { $match: { tenantId, 'sla.isResolutionBreached': true } },
        { $count: 'breached' },
      ]),
    ]);

    const slaBreached = slaAgg[0]?.breached ?? 0;
    const slaRate = totalTickets > 0
      ? Math.round(((totalTickets - slaBreached) / totalTickets) * 100)
      : 100;

    return successResponse({
      openTickets,
      resolvedTickets,
      totalTickets,
      serviceCenters,
      products,
      slaRate,
    }, 'Brand stats fetched');
  } catch (error) {
    console.error('Brand stats error:', error);
    return errorResponse('An error occurred', 500);
  }
}