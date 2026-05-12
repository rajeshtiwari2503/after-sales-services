'use client'
import { useState, useCallback } from 'react'
import type { FeedbackAnalytics } from '@/types/feedback'
import type { NPSResult } from '@/lib/analytics/nps-calculator'

interface UseFeedbackAnalyticsReturn {
  analytics:   FeedbackAnalytics | null
  nps:         (NPSResult & { label: string; color: string }) | null
  loading:     boolean
  error:       string | null
  fetchAnalytics: (params?: { startDate?: string; endDate?: string; clientId?: string }) => Promise<void>
  fetchNPS:    (params?: { startDate?: string; endDate?: string }) => Promise<void>
}

export function useFeedbackAnalytics(): UseFeedbackAnalyticsReturn {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null)
  const [nps,       setNps]       = useState<any>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (params?: { startDate?: string; endDate?: string; clientId?: string }) => {
    setLoading(true); setError(null)
    try {
      const p = new URLSearchParams()
      if (params?.startDate) p.set('startDate', params.startDate)
      if (params?.endDate)   p.set('endDate',   params.endDate)
      if (params?.clientId)  p.set('clientId',  params.clientId)
      const res  = await fetch(`/api/feedback/analytics?${p}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnalytics(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchNPS = useCallback(async (params?: { startDate?: string; endDate?: string }) => {
    try {
      const p = new URLSearchParams()
      if (params?.startDate) p.set('startDate', params.startDate)
      if (params?.endDate)   p.set('endDate',   params.endDate)
      const res  = await fetch(`/api/feedback/nps?${p}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNps(data)
    } catch (e) {
      setError(String(e))
    }
  }, [])

  return { analytics, nps, loading, error, fetchAnalytics, fetchNPS }
}


// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useAuth } from './useAuth';
// import { FeedbackAnalytics } from '@/types/feedback';

// export function useFeedbackAnalytics(startDate?: string, endDate?: string) {
//   const { getAuthHeaders, isAuthenticated } = useAuth();
//   const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchAnalytics = useCallback(async () => {
//     if (!isAuthenticated) return;

//     setIsLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams();
//       if (startDate) params.set('startDate', startDate);
//       if (endDate) params.set('endDate', endDate);

//       const response = await fetch(`/api/feedback/analytics?${params}`, {
//         headers: getAuthHeaders(),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setAnalytics(data.data);
//       } else {
//         setError(data.error);
//       }
//     } catch (err) {
//       setError('Failed to fetch analytics');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [getAuthHeaders, isAuthenticated, startDate, endDate]);

//   useEffect(() => {
//     fetchAnalytics();
//   }, [fetchAnalytics]);

//   return {
//     analytics,
//     isLoading,
//     error,
//     refresh: fetchAnalytics,
//   };
// }
