//  import { NextRequest } from 'next/server';
// import { NotificationService } from '@/services/notification.service';
// import { successResponse, errorResponse, paginatedResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper';

// export async function GET(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const { searchParams } = new URL(request.url);
//     const options = {
//       page: parseInt(searchParams.get('page') || '1'),
//       limit: parseInt(searchParams.get('limit') || '20'),
//       unreadOnly: searchParams.get('unreadOnly') === 'true',
//     };

//     const result = await NotificationService.getNotifications(
//       user.userId,
//       user.tenantId,
//       options
//     );

//     return paginatedResponse(result.notifications, {
//       page: result.page,
//       limit: result.limit,
//       total: result.total,
//     });
//   } catch (error) {
//     console.error('Get notifications error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// export async function PATCH(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const body = await request.json();
//     const { notificationId, markAllRead } = body;

//     if (markAllRead) {
//       await NotificationService.markAllAsRead(user.userId, user.tenantId);
//       return successResponse(null, 'All notifications marked as read');
//     }

//     if (notificationId) {
//       const notification = await NotificationService.markAsRead(notificationId, user.userId);
//       if (!notification) {
//         return errorResponse('Notification not found', 404);
//       }
//       return successResponse(notification, 'Notification marked as read');
//     }

//     return errorResponse('Invalid request', 400);
//   } catch (error) {
//     console.error('Update notifications error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }


import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import connectDB from "@/lib/db";

// Simple notification model (add to models/Notification.ts if needed)
// For now returns mock data
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);

    // Return mock notifications — replace with real model when ready
    const notifications = [
      {
        _id: "1", title: "New ticket assigned",
        message: "Ticket TKT-000042 has been assigned to you",
        type: "info", isRead: false,
        createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
      },
      {
        _id: "2", title: "SLA warning",
        message: "TKT-000038 response deadline approaching",
        type: "warning", isRead: false,
        createdAt: new Date(Date.now() - 28 * 60000).toISOString(),
      },
      {
        _id: "3", title: "Ticket resolved",
        message: "TKT-000035 was marked as resolved",
        type: "success", isRead: true,
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
    ];

    return successResponse({ notifications }, "Notifications fetched");
  } catch {
    return errorResponse("An error occurred", 500);
  }
}