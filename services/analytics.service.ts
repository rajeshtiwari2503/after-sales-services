import Ticket from '@/models/Ticket';
import Feedback from '@/models/Feedback';
import connectDB from '@/lib/db';

export class AnalyticsService {
  static async getOverview(tenantId: string, period?: { start: Date; end: Date }) {
    await connectDB();

    const matchStage: Record<string, any> = { tenantId };
    if (period) {
      matchStage.createdAt = { $gte: period.start, $lte: period.end };
    }

    const [ticketStats, statusBreakdown, priorityBreakdown, categoryBreakdown] = await Promise.all([
      Ticket.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            resolved: {
              $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] },
            },
            open: {
              $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
            },
          },
        },
      ]),
      Ticket.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $match: matchStage },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([
        { $match: matchStage },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      tickets: ticketStats[0] || { total: 0, resolved: 0, open: 0, inProgress: 0 },
      byStatus: statusBreakdown.reduce((acc: Record<string, number>, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: priorityBreakdown.reduce((acc: Record<string, number>, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byCategory: categoryBreakdown.reduce((acc: Record<string, number>, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  static async getTicketTrends(tenantId: string, days = 30) {
    await connectDB();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Ticket.aggregate([
      {
        $match: {
          tenantId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          created: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return trends.map((item: any) => ({
      date: item._id,
      created: item.created,
      resolved: item.resolved,
    }));
  }

  static async getSLAMetrics(tenantId: string) {
    await connectDB();

    const slaMetrics = await Ticket.aggregate([
      { $match: { tenantId } },
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
          avgResponseTime: { $avg: '$sla.responseTime' },
          avgResolutionTime: { $avg: '$sla.resolutionTime' },
        },
      },
    ]);

    const metrics = slaMetrics[0] || {
      total: 0,
      responseBreached: 0,
      resolutionBreached: 0,
      avgResponseTime: 0,
      avgResolutionTime: 0,
    };

    return {
      ...metrics,
      responseSLACompliance: metrics.total
        ? ((metrics.total - metrics.responseBreached) / metrics.total) * 100
        : 100,
      resolutionSLACompliance: metrics.total
        ? ((metrics.total - metrics.resolutionBreached) / metrics.total) * 100
        : 100,
    };
  }

  static async getTechnicianPerformance(tenantId: string) {
    await connectDB();

    const performance = await Ticket.aggregate([
      { $match: { tenantId, technicianId: { $exists: true } } },
      {
        $group: {
          _id: '$technicianId',
          totalTickets: { $sum: 1 },
          resolvedTickets: {
            $sum: { $cond: [{ $in: ['$status', ['resolved', 'closed']] }, 1, 0] },
          },
          avgResolutionTime: { $avg: '$sla.resolutionTime' },
        },
      },
      {
        $lookup: {
          from: 'technicians',
          localField: '_id',
          foreignField: '_id',
          as: 'technician',
        },
      },
      { $unwind: '$technician' },
      {
        $lookup: {
          from: 'users',
          localField: 'technician.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          technicianId: '$_id',
          name: '$user.name',
          totalTickets: 1,
          resolvedTickets: 1,
          avgResolutionTime: 1,
          rating: '$technician.rating',
          resolutionRate: {
            $multiply: [{ $divide: ['$resolvedTickets', '$totalTickets'] }, 100],
          },
        },
      },
      { $sort: { resolvedTickets: -1 } },
    ]);

    return performance;
  }
}
