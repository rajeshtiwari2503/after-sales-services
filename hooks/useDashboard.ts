"use client";

import { useState, useEffect } from "react";
export const dynamic = 'force-dynamic';
interface DashboardStats {
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: string;
  satisfaction: number;
}

interface Ticket {
  _id: string;
  ticketId: string;
  title: string;
  customerName: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
}

interface Activity {
  text: string;
  time: string;
  type: "ticket" | "customer" | "technician" | "system";
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [statsRes, ticketsRes] = await Promise.all([
          fetch("/api/analytics/overview", { credentials: "include" }),
          fetch("/api/tickets?limit=5&page=1", { credentials: "include" }),
        ]);

        if (!statsRes.ok || !ticketsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const [statsData, ticketsData] = await Promise.all([
          statsRes.json(),
          ticketsRes.json(),
        ]);
console.log("statsData, ticketsData",statsData, ticketsData);

        setStats(statsData?.data || {} );
        setTickets(ticketsData?.data   || []);

        // Activity from tickets ya alag endpoint se
        setActivity([
          { text: "Ticket assigned to technician", time: "2m ago", type: "ticket" },
          { text: "New customer registered", time: "15m ago", type: "customer" },
          { text: "Ticket marked resolved", time: "1h ago", type: "ticket" },
          { text: "New technician onboarded", time: "3h ago", type: "technician" },
          { text: "SLA breach warning triggered", time: "5h ago", type: "system" },
        ]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { stats, tickets, activity, loading, error };
}