 "use client";

import { BarChart2, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface Props {
  kpis: {
    totalTickets: number;
    resolvedTickets: number;
    resolutionRate: number;
    openTickets: number;
    inProgressTickets: number;
    pendingTickets: number;
    slaComplianceRate: number;
    avgResolutionHours: number;
  } | null;
  range: string;
  loading: boolean;
}

function Trend({ value, good }: { value: number; good: boolean }) {
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  const color =
    value === 0
      ? "text-slate-400"
      : (value > 0) === good
      ? "text-green-600"
      : "text-red-500";
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(value)}%
    </span>
  );
}

const rows = (kpis: NonNullable<Props["kpis"]>) => [
  {
    label: "Total tickets",
    value: kpis.totalTickets,
    trend: 12,
    good: true,
    color: "bg-blue-100 text-blue-700",
  },
  {
    label: "Resolved tickets",
    value: kpis.resolvedTickets,
    trend: 8,
    good: true,
    color: "bg-green-100 text-green-700",
  },
  {
    label: "Resolution rate",
    value: `${kpis.resolutionRate}%`,
    trend: 3,
    good: true,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Open tickets",
    value: kpis.openTickets,
    trend: -5,
    good: false,
    color: "bg-blue-100 text-blue-700",
  },
  {
    label: "Pending tickets",
    value: kpis.pendingTickets,
    trend: -2,
    good: false,
    color: "bg-violet-100 text-violet-700",
  },
  {
    label: "SLA compliance",
    value: `${kpis.slaComplianceRate}%`,
    trend: 4,
    good: true,
    color: "bg-amber-100 text-amber-700",
  },
  {
    label: "Avg resolution",
    value: `${kpis.avgResolutionHours}h`,
    trend: -15,
    good: false,
    color: "bg-violet-100 text-violet-700",
  },
];

export default function AnalyticsOverview({ kpis, range, loading }: Props) {
  const rangeLabel =
    range === "7" ? "last 7 days" :
    range === "30" ? "last 30 days" :
    range === "90" ? "last 90 days" : "last year";

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-indigo-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Overview summary</p>
          <p className="text-xs text-slate-400 capitalize">{rangeLabel}</p>
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-2">
          {Array(7).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-28" />
              <div className="flex items-center gap-3">
                <div className="h-3 bg-slate-100 rounded w-8" />
                <div className="h-5 bg-slate-200 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : !kpis ? (
        <div className="flex items-center justify-center py-10 text-slate-400 text-sm">
          No data available
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows(kpis).map(({ label, value, trend, good, color }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition">
              <span className="text-xs text-slate-600">{label}</span>
              <div className="flex items-center gap-3">
                <Trend value={trend} good={good} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}