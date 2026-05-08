 import DashboardKPIs from "@/components/analytics/DashboardKPIs";

import TicketTrendChart from "@/components/analytics/TicketTrendChart";

import SLAChart from "@/components/analytics/SLAChart";

import TechnicianPerformance from "@/components/analytics/TechnicianPerformance";

import RevenueChart from "@/components/analytics/RevenueChart";

import CustomerSatisfaction from "@/components/analytics/CustomerSatisfaction";

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <DashboardKPIs />

      <div className="grid xl:grid-cols-2 gap-6">
        <TicketTrendChart />

        <SLAChart />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <TechnicianPerformance />

        <RevenueChart />
      </div>

      <CustomerSatisfaction />
    </div>
  );
}