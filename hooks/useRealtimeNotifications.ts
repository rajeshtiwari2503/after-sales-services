// 'use client'
// import { useEffect, useRef, useCallback, useState } from 'react'
// import type { Notification } from '@/types/notification'
// import { playSound, isSoundEnabled } from '@/lib/notifications/sound'

// interface UseRealtimeOptions {
//   userId:    string
//   onNew?:    (n: Notification) => void
//   enabled?:  boolean
// }

// export function useRealtimeNotifications({ userId, onNew, enabled = true }: UseRealtimeOptions) {
//   const esRef        = useRef<EventSource | null>(null)
//   const [connected,  setConnected]  = useState(false)
//   const [lastEvent,  setLastEvent]  = useState<Notification | null>(null)
//   const retryCount   = useRef(0)
//   const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

//   const connect = useCallback(() => {
//     if (!userId || !enabled || typeof window === 'undefined') return
//     if (esRef.current) esRef.current.close()

//     const es = new EventSource(`/api/notifications/realtime?userId=${userId}`)
//     esRef.current = es

//     es.onopen = () => { setConnected(true); retryCount.current = 0 }

//     es.onmessage = (e) => {
//       try {
//         const parsed = JSON.parse(e.data)
//         if (parsed.type === 'notification' && parsed.payload) {
//           const notif = parsed.payload as Notification
//           setLastEvent(notif)
//           onNew?.(notif)
//           if (isSoundEnabled()) {
//             const sound =
//               notif.priority === 'critical' ? 'critical' :
//               notif.priority === 'high'     ? 'warning'  : 'default'
//             playSound(sound)
//           }
//         }
//       } catch { /* ignore parse errors */ }
//     }

//     es.onerror = () => {
//       setConnected(false)
//       es.close()
//       esRef.current = null
//       // Exponential back-off: 2s, 4s, 8s … max 30s
//       const delay = Math.min(2000 * Math.pow(2, retryCount.current), 30_000)
//       retryCount.current++
//       retryTimeout.current = setTimeout(connect, delay)
//     }
//   }, [userId, enabled, onNew])

//   useEffect(() => {
//     connect()
//     return () => {
//       esRef.current?.close()
//       if (retryTimeout.current) clearTimeout(retryTimeout.current)
//     }
//   }, [connect])

//   return { connected, lastEvent }
// }

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

interface RealtimeNotification {
  type: string;
  data: any;
  timestamp: string;
}

export function useRealtimeNotifications(onNotification?: (notification: RealtimeNotification) => void) {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<RealtimeNotification | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) return;

    const eventSource = new EventSource(`/api/notifications/realtime?token=${token}`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        setLastNotification(notification);
        onNotification?.(notification);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();

      // Reconnect after delay
      setTimeout(connect, 5000);
    };

    eventSourceRef.current = eventSource;
  }, [isAuthenticated, token, onNotification]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected,
    lastNotification,
    reconnect: connect,
    disconnect,
  };
}
