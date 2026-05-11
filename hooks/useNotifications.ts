// 'use client'
// import { useState, useCallback } from 'react'
// import type { Notification } from '@/types/notification'

// interface UseNotificationsReturn {
//   notifications:  Notification[]
//   unreadCount:    number
//   loading:        boolean
//   error:          string | null
//   page:           number
//   totalPages:     number
//   fetchNotifications: (userId: string, pg?: number, status?: string) => Promise<void>
//   markRead:       (ids: string[], userId: string) => Promise<void>
//   markAllRead:    (userId: string) => Promise<void>
//   deleteNotification: (id: string, userId: string) => Promise<void>
// }

// export function useNotifications(): UseNotificationsReturn {
//   const [notifications, setNotifications] = useState<Notification[]>([])
//   const [unreadCount,   setUnreadCount]   = useState(0)
//   const [loading,       setLoading]       = useState(false)
//   const [error,         setError]         = useState<string | null>(null)
//   const [page,          setPage]          = useState(1)
//   const [totalPages,    setTotalPages]    = useState(1)

//   const fetchNotifications = useCallback(async (userId: string, pg = 1, status?: string) => {
//     setLoading(true); setError(null)
//     try {
//       const params = new URLSearchParams({ userId, page: String(pg), limit: '20' })
//       if (status) params.set('status', status)
//       const res  = await fetch(`/api/notifications?${params}`)
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error)
//       setNotifications(data.data)
//       setUnreadCount(data.unread)
//       setPage(data.page)
//       setTotalPages(data.totalPages)
//     } catch (e) {
//       setError(String(e))
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   const markRead = useCallback(async (ids: string[], userId: string) => {
//     await fetch('/api/notifications/read', {
//       method:  'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body:    JSON.stringify({ ids, userId }),
//     })
//     setNotifications(prev => prev.map(n => ids.includes(n._id) ? { ...n, status: 'read' } : n))
//     setUnreadCount(prev => Math.max(0, prev - ids.length))
//   }, [])

//   const markAllRead = useCallback(async (userId: string) => {
//     await fetch('/api/notifications/read', {
//       method:  'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body:    JSON.stringify({ userId }),
//     })
//     setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })))
//     setUnreadCount(0)
//   }, [])

//   const deleteNotification = useCallback(async (id: string, userId: string) => {
//     await fetch(`/api/notifications?id=${id}&userId=${userId}`, { method: 'DELETE' })
//     setNotifications(prev => prev.filter(n => n._id !== id))
//   }, [])

//   return { notifications, unreadCount, loading, error, page, totalPages, fetchNotifications, markRead, markAllRead, deleteNotification }
// }

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export function useNotifications() {
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch('/api/notifications?limit=20', {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, isAuthenticated]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ notificationId }),
        });

        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    },
    [getAuthHeaders]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
