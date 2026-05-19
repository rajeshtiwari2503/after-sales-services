import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Ticket from '@/models/Ticket';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const status = searchParams.get('status');

    const query: any = {
      technicianId: new Types.ObjectId(user.userId),
      tenantId: user.tenantId,
    };
    if (status) query.status = { $in: status.split(',') };

    const jobs = await Ticket.find(query)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return successResponse({ jobs, total: jobs.length }, 'Jobs fetched');
  } catch (error) {
    console.error('Technician jobs error:', error);
    return errorResponse('An error occurred', 500);
  }
}