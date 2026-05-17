 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Ticket from '@/models/Ticket';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { tenantId } = user;

    const [totalWithSLA, responseBreached, resolutionBreached, activeTickets] = await Promise.all([
      Ticket.countDocuments({ tenantId, 'sla.responseDeadline': { $exists: true } }),
      Ticket.countDocuments({ tenantId, 'sla.isResponseBreached': true }),
      Ticket.countDocuments({ tenantId, 'sla.isResolutionBreached': true }),
      Ticket.find({
        tenantId,
        status: { $in: ['open', 'in_progress', 'pending_parts', 'pending_customer'] },
      })
        .select('ticketNumber title status priority sla createdAt')
        .sort({ 'sla.resolutionDeadline': 1 })
        .limit(20)
        .lean(),
    ]);

    const total = totalWithSLA || 1;
    const complianceRate = Math.round(((total - resolutionBreached) / total) * 100);

    return successResponse({
      totalWithSLA,
      responseBreached,
      resolutionBreached,
      responseMet: Math.round(((total - responseBreached) / total) * 100),
      complianceRate,
      activeTickets,
    }, 'SLA analytics fetched');
  } catch (error) {
    console.error('SLA analytics error:', error);
    return errorResponse('An error occurred', 500);
  }
}