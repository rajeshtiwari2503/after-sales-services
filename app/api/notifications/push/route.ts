// import { NextRequest, NextResponse } from 'next/server'
// import { sendPushNotification } from '@/lib/notifications/push'
// import type { PushSubscription } from '@/types/notification'

// /* POST /api/notifications/push */
// export async function POST(req: NextRequest) {
//   try {
//     const { subscription, title, message, url } = await req.json() as {
//       subscription: PushSubscription
//       title:        string
//       message:      string
//       url?:         string
//     }
//     if (!subscription || !title || !message) {
//       return NextResponse.json({ error: 'subscription, title, message required' }, { status: 400 })
//     }
//     const result = await sendPushNotification(subscription, { title, message, url })
//     return NextResponse.json(result)
//   } catch (err) {
//     return NextResponse.json({ error: String(err) }, { status: 500 })
//   }
// }

// /* GET /api/notifications/push — return VAPID public key */
// export async function GET() {
//   return NextResponse.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' })
// }

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return errorResponse('Push subscription is required', 400);
    }

    // Store push subscription
    // In production, save to database associated with user
    console.log(`Push subscription registered for user ${user.userId}`);

    return successResponse(null, 'Push notifications enabled');
  } catch (error) {
    console.error('Register push error:', error);
    return errorResponse('An error occurred', 500);
  }
}
