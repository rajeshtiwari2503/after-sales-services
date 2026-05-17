// 'use client';

// import { useState, useCallback } from 'react';
// import { useAuth } from './useAuth';
// import { Ticket, CreateTicketInput } from '@/types/ticket';

// interface UseTicketsOptions {
//   page?: number;
//   limit?: number;
//   status?: string;
//   priority?: string;
//   search?: string;
// }

// export function useTickets(options: UseTicketsOptions = {}) {
//   const { getAuthHeaders, isAuthenticated } = useAuth();
//   const [tickets, setTickets] = useState<Ticket[]>([]);
//   const [total, setTotal] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchTickets = useCallback(async () => {
//     if (!isAuthenticated) return;

//     setIsLoading(true);
//     setError(null);

//     try {
//       const params = new URLSearchParams();
//       if (options.page) params.set('page', String(options.page));
//       if (options.limit) params.set('limit', String(options.limit));
//       if (options.status) params.set('status', options.status);
//       if (options.priority) params.set('priority', options.priority);
//       if (options.search) params.set('search', options.search);

//       const response = await fetch(`/api/tickets?${params}`, {
//         headers: getAuthHeaders(),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setTickets(data.data);
//         setTotal(data.pagination?.total || 0);
//       } else {
//         setError(data.error);
//       }
//     } catch (err) {
//       setError('Failed to fetch tickets');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [getAuthHeaders, isAuthenticated, options]);

//   const createTicket = useCallback(
//     async (input: CreateTicketInput) => {
//       try {
//         const response = await fetch('/api/tickets', {
//           method: 'POST',
//           headers: getAuthHeaders(),
//           body: JSON.stringify(input),
//         });

//         const data = await response.json();

//         if (data.success) {
//           await fetchTickets();
//           return { success: true, ticket: data.data };
//         }

//         return { success: false, error: data.error };
//       } catch (err) {
//         return { success: false, error: 'Failed to create ticket' };
//       }
//     },
//     [getAuthHeaders, fetchTickets]
//   );

//   const updateTicket = useCallback(
//     async (ticketId: string, updates: Partial<Ticket>) => {
//       try {
//         const response = await fetch(`/api/tickets/${ticketId}`, {
//           method: 'PATCH',
//           headers: getAuthHeaders(),
//           body: JSON.stringify(updates),
//         });

//         const data = await response.json();

//         if (data.success) {
//           setTickets((prev) =>
//             prev.map((t) => (t._id === ticketId ? { ...t, ...data.data } : t))
//           );
//           return { success: true, ticket: data.data };
//         }

//         return { success: false, error: data.error };
//       } catch (err) {
//         return { success: false, error: 'Failed to update ticket' };
//       }
//     },
//     [getAuthHeaders]
//   );

//   return {
//     tickets,
//     total,
//     isLoading,
//     error,
//     fetchTickets,
//     createTicket,
//     updateTicket,
//   };
// }

"use client";

import { useState, useCallback, useEffect } from "react";

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  customerId: { _id: string; name: string; email: string } | null;
  technicianId: { _id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseTicketsOptions {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  technicianId?: string;
  customerId?: string;
  autoFetch?: boolean;
}

export function useTickets(options: UseTicketsOptions = {}) {
  const { autoFetch = true, ...filters } = options;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ open: 0, inProgress: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (overrides?: Partial<UseTicketsOptions>) => {
    setLoading(true);
    setError(null);
    try {
      const opts = { ...filters, ...overrides };
      const params = new URLSearchParams();
      if (opts.page) params.set("page", String(opts.page));
      if (opts.limit) params.set("limit", String(opts.limit ?? 10));
      if (opts.status) params.set("status", opts.status);
      if (opts.priority) params.set("priority", opts.priority);
      if (opts.category) params.set("category", opts.category);
      if (opts.search) params.set("search", opts.search);
      if (opts.technicianId) params.set("technicianId", opts.technicianId);
      if (opts.customerId) params.set("customerId", opts.customerId);

      const res = await fetch(`/api/tickets?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();

      setTickets(data.data?.tickets ?? []);
      setMeta({
        page: data.data?.page ?? 1,
        limit: data.data?.limit ?? 10,
        total: data.data?.total ?? 0,
        totalPages: Math.ceil((data.data?.total ?? 0) / (data.data?.limit ?? 10)),
      });
      if (data.data?.stats) setStats(data.data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  const createTicket = useCallback(async (input: Record<string, any>) => {
    try {
      const res = await fetch("/api/tickets", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create ticket");
      return { success: true, ticket: data.data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: string, updates: Record<string, any>) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update ticket");
      setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, ...data.data } : t));
      return { success: true, ticket: data.data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const changeStatus = useCallback(async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change status");
      setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status } : t));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete ticket");
      setTickets(prev => prev.filter(t => t._id !== ticketId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchTickets();
  }, [fetchTickets, autoFetch]);

  return {
    tickets, meta, stats, loading, error,
    fetchTickets, createTicket, updateTicket,
    changeStatus, deleteTicket,
  };
}