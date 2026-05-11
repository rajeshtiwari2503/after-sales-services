 'use client'
import { useEffect, useRef } from 'react'
import type { Notification } from '@/types/notification'
import NotificationItem from './NotificationItem'

interface Props {
  notifications: Notification[]
  loading:       boolean
  userId:        string
  onClose:       () => void
  onMarkRead:    (ids: string[], userId: string) => void
  onMarkAllRead: (userId: string) => void
  onDelete:      (id: string, userId: string) => void
  onLoadMore:    () => void
}

export default function NotificationDrawer({ notifications, loading, userId, onClose, onMarkRead, onMarkAllRead, onDelete, onLoadMore }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  const unread = notifications.filter(n => n.status === 'unread')

  return (
    <div ref={ref}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800">Notifications</h3>
          {unread.length > 0 && <p className="text-xs text-slate-400">{unread.length} unread</p>}
        </div>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <button onClick={() => onMarkAllRead(userId)}
              className="text-xs text-indigo-600 hover:underline">Mark all read</button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-6 h-6 rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">🔔</p>
            <p className="text-sm text-slate-400">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <NotificationItem key={n._id} notification={n}
              onRead={() => onMarkRead([n._id], userId)}
              onDelete={() => onDelete(n._id, userId)} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-4 py-2.5 flex justify-between items-center">
        <button onClick={onLoadMore} className="text-xs text-slate-400 hover:text-slate-600">Load more</button>
        <a href="/dashboard/notifications" className="text-xs text-indigo-600 hover:underline">View all →</a>
      </div>
    </div>
  )
}