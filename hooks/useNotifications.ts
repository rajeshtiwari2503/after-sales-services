'use client'
import { useState, useCallback } from 'react'
import type { Notification } from '@/types/notification'

interface UseNotificationsReturn {
  notifications:  Notification[]
  unreadCount:    number
  loading:        boolean
  error:          string | null
  page:           number
  totalPages:     number
  fetchNotifications: (userId: string, pg?: number, status?: string) => Promise<void>
  markRead:       (ids: string[], userId: string) => Promise<void>
  markAllRead:    (userId: string) => Promise<void>
  deleteNotification: (id: string, userId: string) => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [page,          setPage]          = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)

  const fetchNotifications = useCallback(async (userId: string, pg = 1, status?: string) => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams({ userId, page: String(pg), limit: '20' })
      if (status) params.set('status', status)
      const res  = await fetch(`/api/notifications?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNotifications(data.data)
      setUnreadCount(data.unread)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  const markRead = useCallback(async (ids: string[], userId: string) => {
    await fetch('/api/notifications/read', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ids, userId }),
    })
    setNotifications(prev => prev.map(n => ids.includes(n._id) ? { ...n, status: 'read' } : n))
    setUnreadCount(prev => Math.max(0, prev - ids.length))
  }, [])

  const markAllRead = useCallback(async (userId: string) => {
    await fetch('/api/notifications/read', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId }),
    })
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })))
    setUnreadCount(0)
  }, [])

  const deleteNotification = useCallback(async (id: string, userId: string) => {
    await fetch(`/api/notifications?id=${id}&userId=${userId}`, { method: 'DELETE' })
    setNotifications(prev => prev.filter(n => n._id !== id))
  }, [])

  return { notifications, unreadCount, loading, error, page, totalPages, fetchNotifications, markRead, markAllRead, deleteNotification }
}