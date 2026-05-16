"use client";
import { useEffect, useState, useCallback } from "react";
import { BarChart2, RefreshCw, TrendingUp, Ticket, Clock, AlertCircle } from "lucide-react";
 
import RevenueChart from "@/components/analytics/RevenueChart";
import TicketChart from "@/components/analytics/TicketChart";
import SLAChart from "@/components/analytics/SLAChart";
import TechnicianPerformance from "@/components/analytics/TechnicianPerformance";
import DashboardKPI from "@/components/analytics/DashboardKPIs";

type Range = "7" | "30" | "90" | "365";

const RANGES: { label: string; value: Range }[] = [
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
  { label: "1y", value: "365" },
];

export default function BrandAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("30");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/analytics/overview?range=${range}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAnalytics(data.data ?? data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [range]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Brand Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Performance metrics for your brand</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {RANGES.map(({ label, value }) => (
              <button key={value} onClick={() => setRange(value)}
                className={`h-7 px-3 rounded-md text-xs font-medium transition cursor-pointer
                  ${range === value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={fetchAnalytics}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={fetchAnalytics} className="text-xs text-red-600 hover:underline cursor-pointer ml-auto">Retry</button>
        </div>
      )}

      <DashboardKPI kpis={analytics?.kpis ?? null} loading={loading} />
      <RevenueChart data={analytics?.timeline ?? []} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <TicketChart
          statusDistribution={analytics?.statusDistribution ?? {}}
          categoryDistribution={analytics?.categoryDistribution ?? {}}
          loading={loading}
        />
        <SLAChart sla={analytics?.sla ?? null} loading={loading} />
      </div>

      <TechnicianPerformance data={analytics?.technicianPerformance ?? []} loading={loading} />
    </div>
  );
}