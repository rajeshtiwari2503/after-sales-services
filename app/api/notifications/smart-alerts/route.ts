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
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const now = new Date();
    const alerts: any[] = [];

    // SLA Warnings
    const slaWarnings = await Ticket.find({
      tenantId: user.tenantId,
      status: { $nin: ['resolved', 'closed', 'cancelled'] },
      $or: [
        { 'sla.responseDeadline': { $lte: new Date(now.getTime() + 2 * 60 * 60 * 1000) } },
        { 'sla.resolutionDeadline': { $lte: new Date(now.getTime() + 4 * 60 * 60 * 1000) } },
      ],
    }).limit(10);

    slaWarnings.forEach((ticket: any) => {
      alerts.push({
        type: 'sla_warning',
        severity: 'high',
        title: 'SLA Warning',
        message: `Ticket ${ticket.ticketNumber} is approaching SLA deadline`,
        data: { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
      });
    });

    // Low Stock Alerts
    const lowStock = await Inventory.find({
      tenantId: user.tenantId,
      $expr: { $lte: ['$quantity', '$minQuantity'] },
    }).limit(10);

    lowStock.forEach((item: any) => {
      alerts.push({
        type: 'low_stock',
        severity: 'medium',
        title: 'Low Stock Alert',
        message: `${item.name} (${item.sku}) is below minimum quantity`,
        data: { itemId: item._id, sku: item.sku, quantity: item.quantity },
      });
    });

    // Expiring Warranties
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringWarranties = await Warranty.find({
      tenantId: user.tenantId,
      status: 'active',
      warrantyEndDate: { $lte: thirtyDaysLater, $gte: now },
    }).limit(10);

    expiringWarranties.forEach((warranty: any) => {
      alerts.push({
        type: 'warranty_expiry',
        severity: 'low',
        title: 'Warranty Expiring',
        message: `Warranty for ${warranty.productName} expires soon`,
        data: { warrantyId: warranty._id, expiryDate: warranty.warrantyEndDate },
      });
    });

    // Negative Feedback
    const negativeFeedback = await Feedback.find({
      tenantId: user.tenantId,
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      $or: [{ rating: { $lte: 2 } }, { 'sentiment.label': 'negative' }],
    })
      .populate('ticketId', 'ticketNumber')
      .limit(5);

    negativeFeedback.forEach((feedback: any) => {
      alerts.push({
        type: 'negative_feedback',
        severity: 'high',
        title: 'Negative Feedback Received',
        message: `Low rating on ticket ${feedback.ticketId?.ticketNumber || 'Unknown'}`,
        data: { feedbackId: feedback._id, rating: feedback.rating },
      });
    });

    // Sort by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]);

    return successResponse(alerts);
  } catch (error) {
    console.error('Get smart alerts error:', error);
    return errorResponse('An error occurred', 500);
  }
}
