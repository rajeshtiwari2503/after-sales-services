import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import Ticket from '@/models/Ticket';
import Inventory from '@/models/Inventory';
import Warranty from '@/models/Warranty';
import Feedback from '@/models/Feedback';
import connectDB from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    const now = new Date();
    const alerts: any[] = [];

    // 1. SLA breaches (already breached)
    const [slaBreached, slaWarning] = await Promise.all([
      Ticket.countDocuments({
        tenantId: user.tenantId,
        status: { $nin: ['resolved', 'closed', 'cancelled'] },
        $or: [
          { 'sla.isResolutionBreached': true },
          { 'sla.isResponseBreached': true },
        ],
      }),
      Ticket.countDocuments({
        tenantId: user.tenantId,
        status: { $nin: ['resolved', 'closed', 'cancelled'] },
        'sla.resolutionDeadline': { $lte: new Date(now.getTime() + 2 * 60 * 60 * 1000), $gt: now },
      }),
    ]);

    if (slaBreached > 0) {
      alerts.push({
        type: 'sla_breach', severity: 'critical',
        title: `${slaBreached} SLA Breach${slaBreached > 1 ? 'es' : ''}`,
        message: `${slaBreached} active ticket${slaBreached > 1 ? 's have' : ' has'} breached SLA. Immediate action required.`,
        count: slaBreached, link: '/dashboard/tickets?status=open',
        createdAt: now.toISOString(),
      });
    }
    if (slaWarning > 0) {
      alerts.push({
        type: 'sla_breach', severity: 'warning',
        title: `${slaWarning} Ticket${slaWarning > 1 ? 's' : ''} Near SLA Deadline`,
        message: `${slaWarning} ticket${slaWarning > 1 ? 's are' : ' is'} due to breach SLA in less than 2 hours.`,
        count: slaWarning, link: '/dashboard/tickets',
        createdAt: now.toISOString(),
      });
    }

    // 2. Low stock
    const lowStockCount = await Inventory.countDocuments({
      tenantId: user.tenantId,
      isActive: true,
      $expr: { $lte: ['$quantity', '$minQuantity'] },
    });
    if (lowStockCount > 0) {
      alerts.push({
        type: 'low_stock', severity: lowStockCount > 5 ? 'warning' : 'info',
        title: `${lowStockCount} Low Stock Item${lowStockCount > 1 ? 's' : ''}`,
        message: `${lowStockCount} inventory item${lowStockCount > 1 ? 's are' : ' is'} at or below minimum stock level.`,
        count: lowStockCount, link: '/dashboard/inventory',
        createdAt: now.toISOString(),
      });
    }

    // 3. High volume — open tickets in last 24h
    const newTickets24h = await Ticket.countDocuments({
      tenantId: user.tenantId,
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    });
    if (newTickets24h > 20) {
      alerts.push({
        type: 'high_volume', severity: 'warning',
        title: 'High Ticket Volume',
        message: `${newTickets24h} new tickets in the last 24 hours. Consider allocating more technicians.`,
        count: newTickets24h, link: '/dashboard/tickets',
        createdAt: now.toISOString(),
      });
    }

    // 4. Negative feedback in last 24h
    const negativeFeedback = await Feedback.countDocuments({
      tenantId: user.tenantId,
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      $or: [{ rating: { $lte: 2 } }, { 'sentiment.label': 'negative' }],
    });
    if (negativeFeedback > 0) {
      alerts.push({
        type: 'new_feedback', severity: negativeFeedback > 3 ? 'warning' : 'info',
        title: `${negativeFeedback} Negative Feedback${negativeFeedback > 1 ? 's' : ''} Today`,
        message: `${negativeFeedback} customer${negativeFeedback > 1 ? 's' : ''} left negative reviews in the last 24 hours.`,
        count: negativeFeedback, link: '/dashboard/feedback',
        createdAt: now.toISOString(),
      });
    }

    // 5. Unassigned open tickets
    const unassigned = await Ticket.countDocuments({
      tenantId: user.tenantId,
      status: 'open',
      technicianId: null,
    });
    if (unassigned > 5) {
      alerts.push({
        type: 'high_volume', severity: 'info',
        title: `${unassigned} Unassigned Open Tickets`,
        message: `${unassigned} tickets are open but have no technician assigned.`,
        count: unassigned, link: '/dashboard/tickets?status=open',
        createdAt: now.toISOString(),
      });
    }

    // Sort: critical first
    const ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => (ORDER[a.severity] ?? 3) - (ORDER[b.severity] ?? 3));

    return successResponse({ alerts, generatedAt: now.toISOString() });
  } catch (error) {
    console.error('Smart alerts error:', error);
    return errorResponse('An error occurred', 500);
  }
}
