 import { NextRequest } from 'next/server'
import { registerSSEClient, removeSSEClient } from '@/lib/notifications/realtime'

/* GET /api/notifications/realtime?userId=xxx
   Client connects once and receives push events via Server-Sent Events */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) {
    return new Response('userId required', { status: 400 })
  }

  let controller: ReadableStreamDefaultController
  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl
      registerSSEClient(userId, controller)

      // Send initial heartbeat
      const encoder = new TextEncoder()
      ctrl.enqueue(encoder.encode(': connected\n\n'))

      // Heartbeat every 25s to keep connection alive
      const heartbeat = setInterval(() => {
        try { ctrl.enqueue(encoder.encode(': ping\n\n')) }
        catch { clearInterval(heartbeat) }
      }, 25_000)

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        removeSSEClient(userId, controller)
        try { ctrl.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}