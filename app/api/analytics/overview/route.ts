 import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import Ticket from '@/models/Ticket';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get('range') ?? '30');
    const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
    const { tenantId } = user;

    const [
      statusAgg,
      priorityAgg,
      categoryAgg,
      totalTickets,
      resolvedTickets,
      timelineAgg,
      techAgg,
      slaAgg,
      recentTickets,
      satisfactionAgg,
    ] = await Promise.all([

      // Status distribution
      Ticket.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Priority distribution
      Ticket.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // Category distribution
      Ticket.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),

      // Total
      Ticket.countDocuments({ tenantId }),

      // Resolved
      Ticket.countDocuments({ tenantId, status: 'resolved' }),

      // Timeline — tickets per day
      Ticket.aggregate([
        { $match: { tenantId, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            created: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Technician performance — ✅ $unwind fixed
      Ticket.aggregate([
        { $match: { tenantId, technicianId: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: '$technicianId',
            total: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
            },
          },
        },
        { $sort: { resolved: -1 } },
        { $limit: 6 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userArr',
          },
        },
        // ✅ preserveNullAndEmpty nahi hai — standard syntax
        { $unwind: { path: '$userArr', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ['$userArr.name', 'Unknown'] },
            email: '$userArr.email',
            total: 1,
            resolved: 1,
            rate: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$resolved', { $max: ['$total', 1] }] },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },
      ]),

      // SLA stats
      Ticket.aggregate([
        {
          $match: {
            tenantId,
            'sla.responseDeadline': { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            responseBreached: {
              $sum: { $cond: ['$sla.isResponseBreached', 1, 0] },
            },
            resolutionBreached: {
              $sum: { $cond: ['$sla.isResolutionBreached', 1, 0] },
            },
          },
        },
      ]),

      // Recent activity — last 10 tickets
      Ticket.find({ tenantId })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('customerId', 'name')
        .populate('technicianId', 'name')
        .select('ticketNumber title status priority updatedAt customerId technicianId')
        .lean(),

      // Customer satisfaction — mock from resolved tickets
      Ticket.aggregate([
        { $match: { tenantId, status: { $in: ['resolved', 'closed'] } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgResolutionMs: {
              $avg: {
                $subtract: [
                  { $ifNull: ['$actualCompletionDate', new Date()] },
                  '$createdAt',
                ],
              },
            },
          },
        },
      ]),
    ]);

    // ── Map results ──
    const statusMap: Record<string, number> = {};
    statusAgg.forEach((s: any) => { statusMap[s._id] = s.count; });

    const priorityMap: Record<string, number> = {};
    priorityAgg.forEach((p: any) => { priorityMap[p._id] = p.count; });

    const categoryMap: Record<string, number> = {};
    categoryAgg.forEach((c: any) => { categoryMap[c._id] = c.count; });

    const sla = slaAgg[0] ?? { total: 0, responseBreached: 0, resolutionBreached: 0 };
    const slaTotal = sla.total || 1;
    const responseMet = Math.round(((slaTotal - sla.responseBreached) / slaTotal) * 100);
    const resolutionMet = Math.round(((slaTotal - sla.resolutionBreached) / slaTotal) * 100);

    const satisfactionRaw = satisfactionAgg[0];
    const avgResolutionHours = satisfactionRaw
      ? Math.round((satisfactionRaw.avgResolutionMs / 3600000) * 10) / 10
      : 0;

    // CSAT mock — based on resolution rate + SLA compliance
    const csatScore = Math.min(
      5,
      Math.round(
        ((resolvedTickets / Math.max(totalTickets, 1)) * 0.6 + (resolutionMet / 100) * 0.4) * 50
      ) / 10
    );

    return successResponse(
      {
        kpis: {
          totalTickets,
          resolvedTickets,
          resolutionRate:
            totalTickets > 0
              ? Math.round((resolvedTickets / totalTickets) * 100)
              : 0,
          openTickets: statusMap['open'] ?? 0,
          inProgressTickets: statusMap['in_progress'] ?? 0,
          pendingTickets:
            (statusMap['pending_parts'] ?? 0) +
            (statusMap['pending_customer'] ?? 0),
          slaComplianceRate: resolutionMet,
          avgResolutionHours,
        },
        statusDistribution: statusMap,
        priorityDistribution: priorityMap,
        categoryDistribution: categoryMap,
        timeline: timelineAgg,
        technicianPerformance: techAgg,
        sla: {
          total: sla.total,
          responseBreached: sla.responseBreached,
          resolutionBreached: sla.resolutionBreached,
          responseMet,
          resolutionMet,
        },
        recentActivity: recentTickets,
        satisfaction: {
          csatScore,
          avgResolutionHours,
          totalResolved: resolvedTickets,
          resolutionRate:
            totalTickets > 0
              ? Math.round((resolvedTickets / totalTickets) * 100)
              : 0,
        },
      },
      'Analytics fetched'
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return errorResponse('An error occurred', 500);
  }
}