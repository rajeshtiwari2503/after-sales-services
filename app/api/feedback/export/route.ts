 import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/utils/apiResponse';
import { verifyToken } from '@/lib/jwt';
import Feedback from '@/models/Feedback';
import connectDB from '@/lib/db';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    if (!['admin', 'manager'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, any> = { tenantId: user.tenantId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const feedback = await Feedback.find(query)
      .populate('customerId', 'name email')
      .populate('ticketId', 'ticketNumber')
      .lean();

    if (format === 'csv') {
      const headers = ['Date', 'Ticket', 'Customer', 'Rating', 'NPS', 'Comment', 'Sentiment'];
      const rows = feedback.map((f: any) => [
        new Date(f.createdAt).toISOString(),
        f.ticketId?.ticketNumber || '',
        f.customerId?.name || '',
        f.rating,
        f.npsScore || '',
        `"${(f.comment || '').replace(/"/g, '""')}"`,
        f.sentiment?.label || '',
      ]);

      const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="feedback-export-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Export feedback error:', error);
    return errorResponse('An error occurred', 500);
  }
}
