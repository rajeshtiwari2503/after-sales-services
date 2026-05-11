// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";

// import Notification from "@/models/Notification";

// export async function GET(
//   req: Request
// ) {
//   try {
//     await connectDB();

//     const { searchParams } =
//       new URL(req.url);

//     const userId =
//       searchParams.get(
//         "userId"
//       );

//     const notifications =
//       await Notification.find(
//         userId
//           ? { userId }
//           : {}
//       ).sort({
//         createdAt: -1,
//       });

//     return NextResponse.json({
//       success: true,
//       data: notifications,
//     });
//   } catch (error: any) {
//     console.log(
//       "NOTIFICATION FETCH ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Failed to fetch notifications",
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(
//   req: Request
// ) {
//   try {
//     await connectDB();

//     const body =
//       await req.json();

//     const notification =
//       await Notification.create({
//         userId:
//           body.userId,

//         title:
//           body.title,

//         message:
//           body.message,

//         type:
//           body.type,

//         actionUrl:
//           body.actionUrl,

//         metadata:
//           body.metadata,
//       });

//     return NextResponse.json(
//       {
//         success: true,
//         data: notification,
//       },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.log(
//       "NOTIFICATION CREATE ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Failed to create notification",
//       },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/services/notification.service'

/* GET /api/notifications?userId=xxx&page=1&status=unread */
export async function GET(req: NextRequest) {
  try {
    const p      = req.nextUrl.searchParams
    const userId = p.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const page   = Number(p.get('page')  || 1)
    const limit  = Number(p.get('limit') || 20)
    const status = p.get('status') || undefined
    const result = await NotificationService.list(userId, page, limit, status)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* POST /api/notifications — create notification */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.userId || !body.title || !body.message || !body.type) {
      return NextResponse.json({ error: 'userId, title, message, type required' }, { status: 400 })
    }
    const notif = await NotificationService.create(body)
    return NextResponse.json(notif, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* DELETE /api/notifications?id=xxx&userId=xxx */
export async function DELETE(req: NextRequest) {
  try {
    const id     = req.nextUrl.searchParams.get('id')
    const userId = req.nextUrl.searchParams.get('userId')
    if (!id || !userId) return NextResponse.json({ error: 'id and userId required' }, { status: 400 })
    const done = await NotificationService.delete(id, userId)
    if (!done)  return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}