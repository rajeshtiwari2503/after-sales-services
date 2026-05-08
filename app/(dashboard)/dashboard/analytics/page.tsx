"use client";

import AnalyticsOverview from "@/components/analytics/AnalyticsOverview";

import RevenueChart from "@/components/analytics/RevenueChart";

import TicketChart from "@/components/analytics/TicketChart";

import SLAChart from "@/components/analytics/SLAChart";

import TechnicianPerformance from "@/components/analytics/TechnicianPerformance";

export default function AnalyticsPage() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      <AnalyticsOverview />

      <div className="grid xl:grid-cols-2 gap-6">
        <RevenueChart />

        <TicketChart />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <SLAChart />

        <TechnicianPerformance />
      </div>
    </div>
  );
}