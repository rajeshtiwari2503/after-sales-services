 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) return errorResponse('Query too short', 400);

    await connectDB();
    const { tenantId } = user;
    const regex = { $regex: q, $options: 'i' };

    const [tickets, users] = await Promise.all([
      Ticket.find({
        tenantId,
        $or: [{ title: regex }, { ticketNumber: regex }, { description: regex }],
      })
        .select('ticketNumber title status priority createdAt')
        .limit(5).lean(),

      // Only admin/manager can search users
      ['admin', 'manager'].includes(user.role)
        ? User.find({
            tenantId,
            $or: [{ name: regex }, { email: regex }],
          }).select('name email role').limit(5).lean()
        : Promise.resolve([]),
    ]);

    return successResponse({
      tickets: tickets.map((t: any) => ({
        ...t,
        type: 'ticket',
        subtitle: `${t.ticketNumber} · ${t.status}`,
        href: `/dashboard/tickets/${t._id}`,
      })),
      users: (users as any[]).map((u: any) => ({
        ...u,
        type: 'user',
        title: u.name,
        subtitle: u.email,
        href: `/dashboard/users`,
      })),
    }, 'Search results');
  } catch (error) {
    console.error('Search error:', error);
    return errorResponse('An error occurred', 500);
  }
}