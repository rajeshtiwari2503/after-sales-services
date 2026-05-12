"use client";
import { useEffect, useState } from "react";
import RevenueChart from "@/components/analytics/RevenueChart";
import TicketChart from "@/components/analytics/TicketChart";
import SLAChart from "@/components/analytics/SLAChart";
import TechnicianPerformance from "@/components/analytics/TechnicianPerformance";
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  useEffect(() => {
    fetchAnalytics();
  }, []);
  const fetchAnalytics = async () => {
    const res = await fetch("/api/analytics/overview");
    const data = await res.json();
    setAnalytics(data);
  };
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <RevenueChart data={analytics?.revenue} />
        <TicketChart data={analytics?.tickets} />
        <SLAChart data={analytics?.sla} />
        <TechnicianPerformance data={analytics?.technicians} />
      </div>
    </div>
  );
}