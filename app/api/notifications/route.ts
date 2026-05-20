 // app/api/notifications/route.ts  — REPLACE existing mock file

import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { NotificationService } from '@/services/notification.service';

/* ── GET /api/notifications ─────────────────────────────────────────────────
   Query params:
     page        (default 1)
     limit       (default 20)
     unreadOnly  (default false)
──────────────────────────────────────────────────────────────────────────── */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const page       = parseInt(searchParams.get('page')  ?? '1');
    const limit      = parseInt(searchParams.get('limit') ?? '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const result = await NotificationService.getForUser(
      user.userId,
      user.tenantId,
      { page, limit, unreadOnly }
    );

    return successResponse(
      {
        notifications: result.notifications,
        unreadCount:   result.unreadCount,
        total:         result.total,
        page:          result.page,
        limit:         result.limit,
        totalPages:    Math.ceil(result.total / result.limit),
      },
      'Notifications fetched'
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse('An error occurred', 500);
  }
}

/* ── PATCH /api/notifications ───────────────────────────────────────────────
   Body options:
     { markAllRead: true }              → mark all as read
     { notificationId: "abc123" }       → mark one as read
──────────────────────────────────────────────────────────────────────────── */
export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { markAllRead, notificationId } = body;

    if (markAllRead) {
      await NotificationService.markAllAsRead(user.userId, user.tenantId);
      return successResponse(null, 'All notifications marked as read');
    }

    if (notificationId) {
      const notif = await NotificationService.markAsRead(notificationId, user.userId);
      if (!notif) return errorResponse('Notification not found', 404);
      return successResponse(notif, 'Notification marked as read');
    }

    return errorResponse('Provide markAllRead or notificationId', 400);
  } catch (error) {
    console.error('Update notifications error:', error);
    return errorResponse('An error occurred', 500);
  }
}

/* ── DELETE /api/notifications?id=<notifId> ─────────────────────────────── */
export async function DELETE(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('Notification id is required', 400);

    await NotificationService.delete(id, user.userId);
    return successResponse(null, 'Notification deleted');
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse('An error occurred', 500);
  }
}