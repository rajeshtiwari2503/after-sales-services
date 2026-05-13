 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
 
import Invoice from '@/models/Invoice';
import connectDB from '@/lib/db';

import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalRevenue, revenueByDay, revenueByStatus] = await Promise.all([
      Invoice.aggregate([
        {
          $match: {
            tenantId: user.tenantId,
            status: 'paid',
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
      ]),
      Invoice.aggregate([
        {
          $match: {
            tenantId: user.tenantId,
            status: 'paid',
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Invoice.aggregate([
        {
          $match: {
            tenantId: user.tenantId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$status',
            total: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return successResponse({
      totalRevenue: totalRevenue[0]?.total || 0,
      invoiceCount: totalRevenue[0]?.count || 0,
      revenueByDay: revenueByDay.map((item: any) => ({
        date: item._id,
        revenue: item.revenue,
        count: item.count,
      })),
      revenueByStatus: revenueByStatus.reduce((acc: any, item: any) => {
        acc[item._id] = { total: item.total, count: item.count };
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    return errorResponse('An error occurred', 500);
  }
}
