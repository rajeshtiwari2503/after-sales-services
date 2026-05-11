 'use client'
import { useState, useEffect, useRef } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import NotificationDrawer from './NotificationDrawer'
import type { Notification } from '@/types/notification'

interface Props { userId: string }

export default function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false)
  const { unreadCount, notifications, loading, fetchNotifications, markRead, markAllRead, deleteNotification } = useNotifications()
  const [incoming, setIncoming] = useState<Notification | null>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { fetchNotifications(userId) }, [userId, fetchNotifications])

  const { connected } = useRealtimeNotifications({
    userId,
    onNew: (n) => {
      setIncoming(n)
      fetchNotifications(userId)
      // Shake bell animation
      bellRef.current?.classList.add('animate-bounce')
      setTimeout(() => bellRef.current?.classList.remove('animate-bounce'), 1000)
    },
  })

  return (
    <div className="relative">
      <button ref={bellRef} onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {connected && (
          <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-green-400 border border-white" title="Live" />
        )}
      </button>

      {open && (
        <NotificationDrawer
          notifications={notifications}
          loading={loading}
          userId={userId}
          onClose={() => setOpen(false)}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onDelete={deleteNotification}
          onLoadMore={() => fetchNotifications(userId)}
        />
      )}
    </div>
  )
}