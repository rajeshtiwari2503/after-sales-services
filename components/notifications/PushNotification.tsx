'use client'
import { useState, useEffect } from 'react'

export default function PushNotification({ userId }: { userId: string }) {
  const [supported,    setSupported]    = useState(false)
  const [subscribed,   setSubscribed]   = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window)
    setPermissionState(Notification.permission)
    checkExistingSubscription()
  }, [])

  async function checkExistingSubscription() {
    if (!('serviceWorker' in navigator)) return
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    setSubscribed(!!sub)
  }

  async function subscribe() {
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setPermissionState(perm)
      if (perm !== 'granted') return

      // Get VAPID public key from server
      const keyRes    = await fetch('/api/notifications/push')
      const { publicKey } = await keyRes.json()
      if (!publicKey) throw new Error('VAPID public key not configured')

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // Send subscription to server
      await fetch('/api/notifications/push', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription: sub.toJSON(), userId, title: 'Push Enabled', message: 'You will now receive push notifications.' }),
      })

      setSubscribed(true)
    } catch (err) {
      console.error('[push] subscribe error', err)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      await sub?.unsubscribe()
      setSubscribed(false)
    } finally { setLoading(false) }
  }

  if (!supported) return (
    <p className="text-xs text-slate-400">Push notifications not supported in this browser.</p>
  )

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <div>
        <p className="text-sm font-semibold text-slate-800">Push Notifications</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {permissionState === 'denied' ? '🚫 Blocked in browser settings' :
           subscribed ? '✅ Active — receiving alerts' : 'Get alerts even when tab is closed'}
        </p>
      </div>
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading || permissionState === 'denied'}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50
          ${subscribed ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
        {loading ? '…' : subscribed ? 'Disable' : 'Enable'}
      </button>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding   = '='.repeat((4 - base64String.length % 4) % 4)
  const base64    = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData   = window.atob(base64)
  const outputArr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArr[i] = rawData.charCodeAt(i)
  return outputArr
}