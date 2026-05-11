/**
 * Realtime notifications using Server-Sent Events (SSE).
 * Each connected client subscribes via GET /api/notifications/realtime
 * Server pushes events when new notifications arrive.
 */

import type { Notification } from '@/types/notification'

// In-memory client registry (works for single-process / single-server)
// For multi-server, replace with Redis Pub/Sub.
type SSEClient = { userId: string; controller: ReadableStreamDefaultController }

const clients = new Map<string, SSEClient[]>()

export function registerSSEClient(userId: string, controller: ReadableStreamDefaultController) {
  const existing = clients.get(userId) || []
  clients.set(userId, [...existing, { userId, controller }])
}

export function removeSSEClient(userId: string, controller: ReadableStreamDefaultController) {
  const existing = clients.get(userId) || []
  clients.set(userId, existing.filter(c => c.controller !== controller))
}

export function pushSSENotification(userId: string, notification: Notification) {
  const userClients = clients.get(userId) || []
  const event       = `data: ${JSON.stringify({ type: 'notification', payload: notification, timestamp: new Date().toISOString() })}\n\n`
  const encoder     = new TextEncoder()

  for (const client of userClients) {
    try {
      client.controller.enqueue(encoder.encode(event))
    } catch {
      // Client disconnected
    }
  }
}

export function broadcastSSE(notification: Notification) {
  for (const [userId] of clients) {
    pushSSENotification(userId, notification)
  }
}

export function getConnectedClientCount(): number {
  return [...clients.values()].reduce((acc, arr) => acc + arr.length, 0)
}