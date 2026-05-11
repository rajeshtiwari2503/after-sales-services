 'use client'
import type { Notification } from '@/types/notification'

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-indigo-400',
  low:      'bg-slate-300',
}
const TYPE_ICON: Partial<Record<string, string>> = {
  feedback_received:   '💬',
  feedback_response:   '✉️',
  low_rating_alert:    '⚠️',
  sla_breach:          '🚨',
  sla_warning:         '⏰',
  certification_update:'📋',
  payment_due:         '💰',
  payment_received:    '✅',
  task_assigned:       '📌',
  task_completed:      '🎉',
  system_alert:        '🔧',
}

interface Props { notification: Notification; onRead: () => void; onDelete: () => void }

export default function NotificationItem({ notification: n, onRead, onDelete }: Props) {
  const isUnread = n.status === 'unread'

  return (
    <div className={`flex gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors group ${isUnread ? 'bg-indigo-50/50' : ''}`}>
      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-base flex-shrink-0 relative">
        {TYPE_ICON[n.type] || '🔔'}
        <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${PRIORITY_DOT[n.priority]}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
          {n.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
        <p className="text-[10px] text-slate-400 mt-1">
          {new Date(n.createdAt).toLocaleString('en-IN', { hour:'2-digit', minute:'2-digit', day:'numeric', month:'short' })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUnread && (
          <button onClick={onRead} title="Mark read"
            className="w-5 h-5 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
          </button>
        )}
        <button onClick={onDelete} title="Delete"
          className="w-5 h-5 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 text-xs font-bold">
          ×
        </button>
      </div>
    </div>
  )
}