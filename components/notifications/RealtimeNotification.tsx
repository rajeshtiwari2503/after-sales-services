'use client'
import { useState, useCallback } from 'react'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import type { Notification } from '@/types/notification'

interface ToastNotif extends Notification { toastId: string }

export default function RealtimeNotification({ userId }: { userId: string }) {
  const [toasts, setToasts] = useState<ToastNotif[]>([])

  const onNew = useCallback((n: Notification) => {
    const toastId = `${n._id}-${Date.now()}`
    setToasts(prev => [...prev, { ...n, toastId }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.toastId !== toastId))
    }, 5000)
  }, [])

  useRealtimeNotifications({ userId, onNew })

  const dismiss = (toastId: string) => setToasts(prev => prev.filter(t => t.toastId !== toastId))

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => (
        <div key={t.toastId}
          className={`bg-white rounded-2xl shadow-2xl border p-4 flex gap-3 animate-slide-up
            ${t.priority === 'critical' ? 'border-red-300' : t.priority === 'high' ? 'border-orange-300' : 'border-slate-200'}`}>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
            {t.priority === 'critical' ? '🚨' : t.priority === 'high' ? '⚠️' : '🔔'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 leading-snug">{t.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{t.message}</p>
          </div>
          <button onClick={() => dismiss(t.toastId)} className="text-slate-400 hover:text-slate-600 text-xl leading-none flex-shrink-0">×</button>
        </div>
      ))}
    </div>
  )
}