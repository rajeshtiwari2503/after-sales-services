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
    const techId = new Types.ObjectId(user.userId);

    const [assigned, inProgress, completed] = await Promise.all([
      Ticket.countDocuments({ technicianId: techId, status: 'open' }),
      Ticket.countDocuments({ technicianId: techId, status: 'in_progress' }),
      Ticket.countDocuments({ technicianId: techId, status: { $in: ['resolved', 'closed'] } }),
    ]);

    return successResponse({
      assigned,
      inProgress,
      completed,
      total: assigned + inProgress + completed,
    }, 'Technician stats fetched');
  } catch (error) {
    console.error('Technician stats error:', error);
    return errorResponse('An error occurred', 500);
  }
}