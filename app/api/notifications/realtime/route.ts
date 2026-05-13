//  import { NextRequest } from 'next/server'
// import { registerSSEClient, removeSSEClient } from '@/lib/notifications/realtime'

// /* GET /api/notifications/realtime?userId=xxx
//    Client connects once and receives push events via Server-Sent Events */
// export async function GET(req: NextRequest) {
//   const userId = req.nextUrl.searchParams.get('userId')
//   if (!userId) {
//     return new Response('userId required', { status: 400 })
//   }

//   let controller: ReadableStreamDefaultController
//   const stream = new ReadableStream({
//     start(ctrl) {
//       controller = ctrl
//       registerSSEClient(userId, controller)

//       // Send initial heartbeat
//       const encoder = new TextEncoder()
//       ctrl.enqueue(encoder.encode(': connected\n\n'))

//       // Heartbeat every 25s to keep connection alive
//       const heartbeat = setInterval(() => {
//         try { ctrl.enqueue(encoder.encode(': ping\n\n')) }
//         catch { clearInterval(heartbeat) }
//       }, 25_000)

//       // Clean up on close
//       req.signal.addEventListener('abort', () => {
//         clearInterval(heartbeat)
//         removeSSEClient(userId, controller)
//         try { ctrl.close() } catch { /* already closed */ }
//       })
//     },
//   })

//   return new Response(stream, {
//     headers: {
//       'Content-Type':  'text/event-stream',
//       'Cache-Control': 'no-cache, no-transform',
//       'Connection':    'keep-alive',
//       'X-Accel-Buffering': 'no',
//     },
//   })
// }

import { NextRequest } from 'next/server';
import { errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return errorResponse('Unauthorized', 401);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', userId: user.userId })}\n\n`)
      );

      // Keep connection alive
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: keepalive\n\n`));
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
