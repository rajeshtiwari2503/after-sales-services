/**
 * Web Push Notifications using the Web Push Protocol (RFC 8030).
 * Requires: web-push package  →  npm install web-push
 * Set env vars: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
 */

import type { PushSubscription } from '@/types/notification'

interface PushResult { success: boolean; error?: string }

export async function sendPushNotification(
  subscription: PushSubscription,
  payload:       { title: string; message: string; url?: string; icon?: string }
): Promise<PushResult> {
  if (!process.env.VAPID_PRIVATE_KEY) {
    console.warn('[push] VAPID keys not configured.')
    return { success: false, error: 'VAPID keys not configured' }
  }

  try {
    const webpush = await import('web-push')
    webpush.default.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:anand@powerindiaservices.com',
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )
    await webpush.default.sendNotification(
      subscription as PushSubscriptionJSON,
      JSON.stringify({
        title:   payload.title,
        body:    payload.message,
        icon:    payload.icon || '/icon-192.png',
        badge:   '/badge.png',
        data:    { url: payload.url || '/dashboard/notifications' },
      })
    )
    return { success: true }
  } catch (err: unknown) {
    const e = err as { statusCode?: number }
    // 410 = subscription expired
    if (e.statusCode === 410) return { success: false, error: 'subscription_expired' }
    console.error('[push]', err)
    return { success: false, error: String(err) }
  }
}

export function generateVapidKeys() {
  // Run once during setup: npx web-push generate-vapid-keys
  console.log('Run: npx web-push generate-vapid-keys')
}