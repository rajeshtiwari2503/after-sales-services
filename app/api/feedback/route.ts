// import { NextResponse } from "next/server";

// import { connectDB } from "@/lib/db";

// import Feedback from "@/models/Feedback";

// export async function GET() {
//   try {
//     await connectDB();

//     const feedbacks =
//       await Feedback.find()
//         .sort({
//           createdAt: -1,
//         });

//     return NextResponse.json({
//       success: true,
//       data: feedbacks,
//     });
//   } catch (error: any) {
//     console.log(
//       "FEEDBACK FETCH ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Failed to fetch feedback",
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

//     const feedback =
//       await Feedback.create({
//         ticketId:
//           body.ticketId,

//         customerId:
//           body.customerId,

//         customerName:
//           body.customerName,

//         rating:
//           body.rating,

//         serviceQuality:
//           body.serviceQuality,

//         technicianBehavior:
//           body.technicianBehavior,

//         responseTime:
//           body.responseTime,

//         recommendationLikelihood:
//           body.recommendationLikelihood,

//         feedbackMessage:
//           body.feedbackMessage,

//         suggestions:
//           body.suggestions,
//       });

//     return NextResponse.json(
//       {
//         success: true,
//         data: feedback,
//       },
//       { status: 201 }
//     );
//   } catch (error: any) {
//     console.log(
//       "FEEDBACK CREATE ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           "Failed to submit feedback",
//       },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server'
import { FeedbackService } from '@/services/feedback.service'
import { NotificationService } from '@/services/notification.service'
import { runSmartAlerts, buildNotificationFromAlert } from '@/lib/ai/smart-alert-engine'
import type { FeedbackCreateInput, FeedbackFilter } from '@/types/feedback'

/* GET /api/feedback — list with filters */
export async function GET(req: NextRequest) {
  try {
    const p      = req.nextUrl.searchParams
    const filter: FeedbackFilter = {
      page:         Number(p.get('page')  || 1),
      limit:        Number(p.get('limit') || 20),
      status:       p.get('status')       as any,
      type:         p.get('type')         as any,
      sentiment:    p.get('sentiment')    as any,
      technicianId: p.get('technicianId') || undefined,
      clientId:     p.get('clientId')     || undefined,
      minRating:    p.get('minRating')    ? Number(p.get('minRating')) : undefined,
      maxRating:    p.get('maxRating')    ? Number(p.get('maxRating')) : undefined,
      startDate:    p.get('startDate')    || undefined,
      endDate:      p.get('endDate')      || undefined,
      isPublic:     p.get('isPublic')     ? p.get('isPublic') === 'true' : undefined,
      search:       p.get('search')       || undefined,
    }
    const result = await FeedbackService.list(filter)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* POST /api/feedback — create new feedback */
export async function POST(req: NextRequest) {
  try {
    const body: FeedbackCreateInput = await req.json()

    // Validate
    if (!body.clientId || !body.clientName || !body.comment || !body.rating) {
      return NextResponse.json({ error: 'clientId, clientName, comment and rating are required' }, { status: 400 })
    }
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'rating must be between 1 and 5' }, { status: 400 })
    }

    const feedback = await FeedbackService.create(body)

    // Run smart alerts and dispatch notifications
    const adminUserId = process.env.ADMIN_USER_ID || 'admin'
    const alerts      = runSmartAlerts(feedback)
    for (const alert of alerts) {
      const notifData = buildNotificationFromAlert(alert, adminUserId)
      await NotificationService.create(notifData as any)
    }

    return NextResponse.json(feedback, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* PATCH /api/feedback?id=xxx — update */
export async function PATCH(req: NextRequest) {
  try {
    const id   = req.nextUrl.searchParams.get('id')
    if (!id)   return NextResponse.json({ error: 'id required' }, { status: 400 })
    const body = await req.json()
    const doc  = await FeedbackService.update(id, body)
    if (!doc)  return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(doc)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

/* DELETE /api/feedback?id=xxx */
export async function DELETE(req: NextRequest) {
  try {
    const id   = req.nextUrl.searchParams.get('id')
    if (!id)   return NextResponse.json({ error: 'id required' }, { status: 400 })
    const done = await FeedbackService.delete(id)
    if (!done) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}