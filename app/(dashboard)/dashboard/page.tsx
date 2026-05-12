"use client";
import { useEffect, useState } from "react";
import AnalyticsOverview from "@/components/analytics/AnalyticsOverview";
import NotificationBell from "@/components/notifications/NotificationBell";
import AdvancedTicketTable from "@/components/tickets/AdvancedTicketTable";
export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => {
    fetchOverview();
    fetchTickets();
  }, []);
  const fetchOverview = async () => {
    const res = await fetch("/api/analytics/overview");
    const data = await res.json();
    setOverview(data);
  };
  const fetchTickets = async () => {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data.tickets || []);
  };
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-500">Enterprise CRM Overview</p>
        </div>
        <NotificationBell />
      </div>
      <AnalyticsOverview data={overview} />
      <AdvancedTicketTable tickets={tickets} />

    </div>
  );
}