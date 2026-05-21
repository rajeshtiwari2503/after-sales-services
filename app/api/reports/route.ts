 

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Ticket from '@/models/Ticket';
import Technician from '@/models/Technician';
import ServiceCenter from '@/models/ServiceCenter';
import User from '@/models/User';

/* ── Date range helper ─────────────────────────────────────────────────── */
function getDateRange(period: string) {
  const now   = new Date();
  const start = new Date();

  if (period === 'weekly') {
    start.setDate(now.getDate() - 7);
  } else if (period === 'monthly') {
    start.setMonth(now.getMonth() - 1);
  } else if (period === 'yearly') {
    start.setFullYear(now.getFullYear() - 1);
  } else {
    // custom: caller passes startDate/endDate
    return null;
  }
  start.setHours(0, 0, 0, 0);
  return { start, end: now };
}

/* ── Trend buckets (daily points for chart) ────────────────────────────── */
function getTrendBuckets(period: string, start: Date, end: Date) {
  if (period === 'weekly')  return { format: '%Y-%m-%d', unit: 'day'  };
  if (period === 'monthly') return { format: '%Y-%m-%d', unit: 'day'  };
  if (period === 'yearly')  return { format: '%Y-%m',    unit: 'month' };
  return { format: '%Y-%m-%d', unit: 'day' };
}

/* ── Build base match from role ─────────────────────────────────────────── */
function baseMatch(user: { role: string; tenantId: string; userId: string }, headers: Headers) {
  if (user.role === 'admin')          return {};
  if (user.role === 'manager')        return { tenantId: user.tenantId };
  if (user.role === 'service_center') {
    const scId = headers.get('x-service-center-id');
    const m: Record<string, any> = { tenantId: user.tenantId };
    if (scId && mongoose.Types.ObjectId.isValid(scId))
      m.serviceCenterId = new mongoose.Types.ObjectId(scId);
    return m;
  }
  if (user.role === 'technician') {
    return { tenantId: user.tenantId, technicianId: new mongoose.Types.ObjectId(user.userId) };
  }
  return { tenantId: user.tenantId };
}

/* ════════════════════════════════════════════════════════════════════════ */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period    = searchParams.get('period')    ?? 'monthly';   // weekly|monthly|yearly
    const startDate = searchParams.get('startDate') ?? '';
    const endDate   = searchParams.get('endDate')   ?? '';

    /* ── Date range ── */
    let dateRange = getDateRange(period);
    if (!dateRange && startDate && endDate) {
      dateRange = { start: new Date(startDate), end: new Date(endDate) };
    }
    if (!dateRange) return errorResponse('Invalid period', 400);

    const { start, end } = dateRange;
    const dateFilter = { createdAt: { $gte: start, $lte: end } };

    /* ── Previous period (for % change) ── */
    const diff = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - diff);
    const prevEnd   = new Date(start.getTime() - 1);
    const prevDateFilter = { createdAt: { $gte: prevStart, $lte: prevEnd } };

    const match     = baseMatch(user as any, request.headers);
    const curMatch  = { ...match, ...dateFilter };
    const prevMatch = { ...match, ...prevDateFilter };

    /* ══════════════════════════════════════════════════════════════════
       1. OVERVIEW STATS
    ══════════════════════════════════════════════════════════════════ */
    const [
      totalTickets,     prevTotal,
      openTickets,      resolvedTickets,
      closedTickets,    cancelledTickets,
      inProgressTickets,
    ] = await Promise.all([
      Ticket.countDocuments(curMatch),
      Ticket.countDocuments(prevMatch),
      Ticket.countDocuments({ ...curMatch, status: 'open' }),
      Ticket.countDocuments({ ...curMatch, status: 'resolved' }),
      Ticket.countDocuments({ ...curMatch, status: 'closed' }),
      Ticket.countDocuments({ ...curMatch, status: 'cancelled' }),
      Ticket.countDocuments({ ...curMatch, status: 'in_progress' }),
    ]);

    const resolutionRate = totalTickets > 0
      ? Math.round(((resolvedTickets + closedTickets) / totalTickets) * 100)
      : 0;

    const ticketGrowth = prevTotal > 0
      ? Math.round(((totalTickets - prevTotal) / prevTotal) * 100)
      : 0;

    /* ── Avg resolution time (hours) ── */
    const resTimePipeline = await Ticket.aggregate([
      { $match: { ...curMatch, status: { $in: ['resolved', 'closed'] }, actualCompletionDate: { $exists: true } } },
      { $project: { diff: { $subtract: ['$actualCompletionDate', '$createdAt'] } } },
      { $group: { _id: null, avg: { $avg: '$diff' } } },
    ]);
    const avgResolutionHours = resTimePipeline[0]
      ? Math.round(resTimePipeline[0].avg / 3600000)
      : 0;

    /* ══════════════════════════════════════════════════════════════════
       2. TICKET BREAKDOWN
    ══════════════════════════════════════════════════════════════════ */

    /* By priority */
    const byPriority = await Ticket.aggregate([
      { $match: curMatch },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    /* By category */
    const byCategory = await Ticket.aggregate([
      { $match: curMatch },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    /* By status */
    const byStatus = [
      { status: 'open',             count: openTickets       },
      { status: 'in_progress',      count: inProgressTickets },
      { status: 'resolved',         count: resolvedTickets   },
      { status: 'closed',           count: closedTickets     },
      { status: 'cancelled',        count: cancelledTickets  },
    ];

    /* ══════════════════════════════════════════════════════════════════
       3. TREND (daily / monthly data points)
    ══════════════════════════════════════════════════════════════════ */
    const { format } = getTrendBuckets(period, start, end);

    const trendPipeline = await Ticket.aggregate([
      { $match: curMatch },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          created:  { $sum: 1 },
          resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } },
          open:     { $sum: { $cond: [{ $eq:  ['$status', 'open']  }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ══════════════════════════════════════════════════════════════════
       4. TECHNICIAN PERFORMANCE
    ══════════════════════════════════════════════════════════════════ */
    const techPerfPipeline = await Ticket.aggregate([
      { $match: { ...curMatch, technicianId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id:       '$technicianId',
          assigned:  { $sum: 1 },
          resolved:  { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } },
          avgResMs:  {
            $avg: {
              $cond: [
                { $and: [
                  { $in: ['$status', ['resolved', 'closed']] },
                  { $ifNull: ['$actualCompletionDate', false] },
                ]},
                { $subtract: ['$actualCompletionDate', '$createdAt'] },
                null,
              ],
            },
          },
        },
      },
      { $sort: { resolved: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from:         'technicians',
          localField:   '_id',
          foreignField: '_id',
          as:           'techDoc',
        },
      },
      { $unwind: { path: '$techDoc', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from:         'users',
          localField:   'techDoc.userId',
          foreignField: '_id',
          as:           'userDoc',
        },
      },
      { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name:          { $ifNull: ['$userDoc.name', 'Unknown'] },
          employeeId:    '$techDoc.employeeId',
          assigned:      1,
          resolved:      1,
          resolutionRate:{
            $cond: [
              { $gt: ['$assigned', 0] },
              { $multiply: [{ $divide: ['$resolved', '$assigned'] }, 100] },
              0,
            ],
          },
          avgResHours: { $round: [{ $divide: [{ $ifNull: ['$avgResMs', 0] }, 3600000] }, 1] },
          rating:      { $ifNull: ['$techDoc.rating', 0] },
        },
      },
    ]);

    /* ══════════════════════════════════════════════════════════════════
       5. SERVICE CENTER PERFORMANCE  (skip for technician role)
    ══════════════════════════════════════════════════════════════════ */
    let scPerformance: any[] = [];
    if (!['technician', 'service_center'].includes(user.role)) {
      scPerformance = await Ticket.aggregate([
        { $match: { ...curMatch, serviceCenterId: { $exists: true, $ne: null } } },
        {
          $group: {
            _id:      '$serviceCenterId',
            total:    { $sum: 1 },
            resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } },
            open:     { $sum: { $cond: [{ $eq:  ['$status', 'open']  }, 1, 0] } },
          },
        },
        { $sort: { total: -1 } },
        {
          $lookup: {
            from:         'servicecenters',
            localField:   '_id',
            foreignField: '_id',
            as:           'sc',
          },
        },
        { $unwind: { path: '$sc', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name:    { $ifNull: ['$sc.name', 'Unknown SC'] },
            code:    { $ifNull: ['$sc.code', '—']          },
            total:   1,
            resolved:1,
            open:    1,
            resolutionRate: {
              $cond: [
                { $gt: ['$total', 0] },
                { $round: [{ $multiply: [{ $divide: ['$resolved', '$total'] }, 100] }, 1] },
                0,
              ],
            },
          },
        },
      ]);
    }

    /* ══════════════════════════════════════════════════════════════════
       6. BRAND / TENANT OVERVIEW  (admin only)
    ══════════════════════════════════════════════════════════════════ */
    let brandBreakdown: any[] = [];
    if (user.role === 'admin') {
      brandBreakdown = await Ticket.aggregate([
        { $match: { ...dateFilter } },
        {
          $group: {
            _id:      '$tenantId',
            total:    { $sum: 1 },
            resolved: { $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] } },
            open:     { $sum: { $cond: [{ $eq:  ['$status', 'open']  }, 1, 0] } },
          },
        },
        { $sort: { total: -1 } },
      ]);
    }

    /* ══════════════════════════════════════════════════════════════════
       7. SLA METRICS
    ══════════════════════════════════════════════════════════════════ */
    const [slaBreach, slaWarning] = await Promise.all([
      Ticket.countDocuments({ ...curMatch, 'sla.isResolutionBreached': true }),
      Ticket.countDocuments({ ...curMatch, 'sla.isResponseBreached':   true }),
    ]);

    const slaBreachRate = totalTickets > 0
      ? Math.round((slaBreach / totalTickets) * 100)
      : 0;

    /* ══════════════════════════════════════════════════════════════════
       8. PRIORITY RESPONSE TIME
    ══════════════════════════════════════════════════════════════════ */
    const priorityResTime = await Ticket.aggregate([
      {
        $match: {
          ...curMatch,
          status: { $in: ['resolved', 'closed'] },
          actualCompletionDate: { $exists: true },
        },
      },
      {
        $group: {
          _id: '$priority',
          avgHours: {
            $avg: { $divide: [{ $subtract: ['$actualCompletionDate', '$createdAt'] }, 3600000] },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    /* ══════════════════════════════════════════════════════════════════
       9. CUSTOMER STATS  (tickets per customer, repeat customers)
    ══════════════════════════════════════════════════════════════════ */
    const customerStats = await Ticket.aggregate([
      { $match: curMatch },
      { $group: { _id: '$customerId', count: { $sum: 1 } } },
      {
        $group: {
          _id:            null,
          uniqueCustomers:{ $sum: 1 },
          repeatCustomers:{ $sum: { $cond: [{ $gt: ['$count', 1] }, 1, 0] } },
          avgPerCustomer: { $avg: '$count' },
        },
      },
    ]);

    /* ══════════════════════════════════════════════════════════════════
       10. TOP FAULTS
    ══════════════════════════════════════════════════════════════════ */
    const topFaults = await Ticket.aggregate([
      { $match: { ...curMatch, faultName: { $exists: true, $nin: [null, ''] } } },
      { $group: { _id: '$faultName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    /* ══════════════════════════════════════════════════════════════════
       ASSEMBLE RESPONSE
    ══════════════════════════════════════════════════════════════════ */
    return successResponse(
      {
        period,
        dateRange: { start: start.toISOString(), end: end.toISOString() },

        overview: {
          totalTickets,
          prevTotal,
          ticketGrowth,
          openTickets,
          resolvedTickets,
          closedTickets,
          cancelledTickets,
          inProgressTickets,
          resolutionRate,
          avgResolutionHours,
        },

        sla: {
          breached:      slaBreach,
          responseBreached: slaWarning,
          breachRate:    slaBreachRate,
        },

        breakdown: {
          byStatus,
          byPriority:   byPriority.map(x => ({ priority: x._id,  count: x.count })),
          byCategory:   byCategory.map(x => ({ category: x._id,  count: x.count })),
          priorityResolutionTime: priorityResTime.map(x => ({
            priority: x._id,
            avgHours: Math.round(x.avgHours),
            count:    x.count,
          })),
        },

        trends: trendPipeline.map(x => ({
          date:     x._id,
          created:  x.created,
          resolved: x.resolved,
          open:     x.open,
        })),

        technicians: techPerfPipeline,

        serviceCenters: scPerformance,

        brands: brandBreakdown,

        customers: customerStats[0] ?? {
          uniqueCustomers: 0,
          repeatCustomers: 0,
          avgPerCustomer:  0,
        },

        topFaults,
      },
      'Report generated'
    );
  } catch (error) {
    console.error('Reports error:', error);
    return errorResponse('An error occurred', 500);
  }
}