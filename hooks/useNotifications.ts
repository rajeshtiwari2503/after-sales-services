 

// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useAuth } from './useAuth';

// interface Notification {
//   _id: string;
//   type: string;
//   title: string;
//   message: string;
//   isRead: boolean;
//   createdAt: string;
//   data?: Record<string, any>;
// }

// export function useNotifications() {
//   const { getAuthHeaders, isAuthenticated } = useAuth();
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchNotifications = useCallback(async () => {
//     if (!isAuthenticated) return;

//     try {
//       const response = await fetch('/api/notifications?limit=20', {
//         headers: getAuthHeaders(),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setNotifications(data.data);
//         setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
//       }
//     } catch (error) {
//       console.error('Failed to fetch notifications:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [getAuthHeaders, isAuthenticated]);

//   const markAsRead = useCallback(
//     async (notificationId: string) => {
//       try {
//         await fetch('/api/notifications', {
//           method: 'PATCH',
//           headers: getAuthHeaders(),
//           body: JSON.stringify({ notificationId }),
//         });

//         setNotifications((prev) =>
//           prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
//         );
//         setUnreadCount((prev) => Math.max(0, prev - 1));
//       } catch (error) {
//         console.error('Failed to mark as read:', error);
//       }
//     },
//     [getAuthHeaders]
//   );

//   const markAllAsRead = useCallback(async () => {
//     try {
//       await fetch('/api/notifications', {
//         method: 'PATCH',
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ markAllRead: true }),
//       });

//       setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
//       setUnreadCount(0);
//     } catch (error) {
//       console.error('Failed to mark all as read:', error);
//     }
//   }, [getAuthHeaders]);

//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 60000);
//     return () => clearInterval(interval);
//   }, [fetchNotifications]);

//   return {
//     notifications,
//     unreadCount,
//     isLoading,
//     markAsRead,
//     markAllAsRead,
//     refresh: fetchNotifications,
//   };
// }


"use client";

import { useState, useEffect, useCallback } from "react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  isRead: boolean;
  ticketId?: string;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.data?.notifications ?? data.data ?? []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH", credentials: "include",
      });
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "PATCH", credentials: "include",
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications, unreadCount, loading,
    fetchNotifications, markRead, markAllRead,
  };
}