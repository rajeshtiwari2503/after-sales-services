'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Ticket, CreateTicketInput } from '@/types/ticket';

interface UseTicketsOptions {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
}

export function useTickets(options: UseTicketsOptions = {}) {
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.page) params.set('page', String(options.page));
      if (options.limit) params.set('limit', String(options.limit));
      if (options.status) params.set('status', options.status);
      if (options.priority) params.set('priority', options.priority);
      if (options.search) params.set('search', options.search);

      const response = await fetch(`/api/tickets?${params}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        setTickets(data.data);
        setTotal(data.pagination?.total || 0);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, isAuthenticated, options]);

  const createTicket = useCallback(
    async (input: CreateTicketInput) => {
      try {
        const response = await fetch('/api/tickets', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(input),
        });

        const data = await response.json();

        if (data.success) {
          await fetchTickets();
          return { success: true, ticket: data.data };
        }

        return { success: false, error: data.error };
      } catch (err) {
        return { success: false, error: 'Failed to create ticket' };
      }
    },
    [getAuthHeaders, fetchTickets]
  );

  const updateTicket = useCallback(
    async (ticketId: string, updates: Partial<Ticket>) => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (data.success) {
          setTickets((prev) =>
            prev.map((t) => (t._id === ticketId ? { ...t, ...data.data } : t))
          );
          return { success: true, ticket: data.data };
        }

        return { success: false, error: data.error };
      } catch (err) {
        return { success: false, error: 'Failed to update ticket' };
      }
    },
    [getAuthHeaders]
  );

  return {
    tickets,
    total,
    isLoading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
  };
}
