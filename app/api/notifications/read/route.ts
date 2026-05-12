//  import { NextRequest, NextResponse } from 'next/server'
// import { NotificationService } from '@/services/notification.service'

// /* POST /api/notifications/read — mark specific IDs as read */
// export async function POST(req: NextRequest) {
//   try {
//     const { ids, userId } = await req.json()
//     if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
//     if (ids && Array.isArray(ids)) {
//       const count = await NotificationService.markRead(ids, userId)
//       return NextResponse.json({ updated: count })
//     }
//     // mark all
//     const count = await NotificationService.markAllRead(userId)
//     return NextResponse.json({ updated: count })
//   } catch (err) {
//     return NextResponse.json({ error: String(err) }, { status: 500 })
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from "@/services/notification.service";

/* POST /api/notifications/read */
export async function POST(req: NextRequest) {
  try {
    const { ids, userId, tenantId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId required" },
        { status: 400 }
      );
    }

    // Mark specific notifications as read
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const results = await Promise.all(
        ids.map((id: string) =>
          NotificationService.markAsRead(id, userId)
        )
      );

      return NextResponse.json({
        success: true,
        updated: results.length,
      });
    }

    // Mark all notifications as read
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId required" },
        { status: 400 }
      );
    }

    const result =
      await NotificationService.markAllAsRead(
        userId,
        tenantId
      );

    return NextResponse.json({
      success: true,
      updated: result.modifiedCount || 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}