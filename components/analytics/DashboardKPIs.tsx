"use client";

import {
  Ticket, CheckCircle, Clock, TrendingUp,
  TrendingDown, AlertTriangle, RefreshCw,
} from "lucide-react";

interface KPIs {
  totalTickets: number;
  resolvedTickets: number;
  resolutionRate: number;
  openTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  slaComplianceRate: number;
  avgResolutionHours: number;
}

interface Props {
  kpis: KPIs | null;
  loading: boolean;
}

function KPICard({
  label, value, sub, icon, up, color, loading,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  up?: boolean;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 lg:p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide leading-none">
          {label}
        </p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-8 bg-slate-200 rounded w-20 animate-pulse mb-2" />
      ) : (
        <p className="text-2xl lg:text-3xl font-bold text-slate-800 tabular-nums leading-none mb-1.5">
          {value}
        </p>
      )}
      <p className={`text-xs flex items-center gap-1 ${
        up === undefined
          ? "text-slate-400"
          : up ? "text-green-600" : "text-red-500"
      }`}>
        {up !== undefined && (
          up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
        )}
        {loading ? <span className="w-24 h-2.5 bg-slate-100 rounded animate-pulse" /> : sub}
      </p>
    </div>
  );
}

export default function DashboardKPI({ kpis, loading }: Props) {
  const cards = [
    {
      label: "Total tickets",
      value: kpis?.totalTickets ?? "—",
      sub: `${kpis?.openTickets ?? 0} open · ${kpis?.inProgressTickets ?? 0} in progress`,
      icon: <Ticket className="w-4 h-4" />,
      color: "bg-blue-50 text-blue-600",
      up: undefined,
    },
    {
      label: "Resolved",
      value: kpis?.resolvedTickets ?? "—",
      sub: `${kpis?.resolutionRate ?? 0}% resolution rate`,
      icon: <CheckCircle className="w-4 h-4" />,
      color: "bg-green-50 text-green-600",
      up: (kpis?.resolutionRate ?? 0) >= 70,
    },
    {
      label: "Avg resolution",
      value: kpis ? `${kpis.avgResolutionHours}h` : "—",
      sub: "Average time to resolve",
      icon: <Clock className="w-4 h-4" />,
      color: "bg-violet-50 text-violet-600",
      up: (kpis?.avgResolutionHours ?? 99) < 8,
    },
    {
      label: "SLA compliance",
      value: kpis ? `${kpis.slaComplianceRate}%` : "—",
      sub: `${kpis?.pendingTickets ?? 0} tickets pending`,
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "bg-amber-50 text-amber-600",
      up: (kpis?.slaComplianceRate ?? 0) >= 85,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((c) => (
        <KPICard key={c.label} {...c} loading={loading} />
      ))}
    </div>
  );
}