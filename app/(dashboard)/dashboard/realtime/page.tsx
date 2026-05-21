 "use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Activity, Ticket, Users, Clock, AlertTriangle,
  CheckCircle2, TrendingUp, TrendingDown, Zap,
  RefreshCw, Wifi, WifiOff, Circle, ArrowUpRight,
  Shield, Package, MessageSquare, Star, Filter,
  ChevronUp, ChevronDown, Minus
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
interface KPIs {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  slaComplianceRate: number;
  avgResolutionHours: number;
  resolutionRate: number;
}

interface ActivityItem {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  updatedAt: string;
  createdAt: string;
  customerId?: { name: string };
  technicianId?: { name: string };
}

interface TechPerf {
  technicianName: string;
  total: number;
  resolved: number;
  avgResolutionHours: number;
}

interface AnalyticsData {
  kpis: KPIs;
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  technicianPerformance: TechPerf[];
  recentActivity: ActivityItem[];
  sla: {
    total: number;
    responseBreached: number;
    resolutionBreached: number;
    responseMet: number;
    resolutionMet: number;
  };
}

// ─── Constants ────────────────────────────────────────────────
const POLL_INTERVAL = 15000; // 15s

const STATUS_CFG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  open:             { label: "Open",          color: "text-blue-600",   dot: "bg-blue-500",   bg: "bg-blue-50 border-blue-100" },
  in_progress:      { label: "In Progress",   color: "text-amber-600",  dot: "bg-amber-500",  bg: "bg-amber-50 border-amber-100" },
  pending_parts:    { label: "Parts Pending", color: "text-violet-600", dot: "bg-violet-500", bg: "bg-violet-50 border-violet-100" },
  pending_customer: { label: "Cust. Pending", color: "text-orange-600", dot: "bg-orange-500", bg: "bg-orange-50 border-orange-100" },
  resolved:         { label: "Resolved",      color: "text-green-600",  dot: "bg-green-500",  bg: "bg-green-50 border-green-100" },
  closed:           { label: "Closed",        color: "text-slate-500",  dot: "bg-slate-400",  bg: "bg-slate-100 border-slate-200" },
  cancelled:        { label: "Cancelled",     color: "text-red-500",    dot: "bg-red-400",    bg: "bg-red-50 border-red-100" },
};

const PRIORITY_CFG: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  low:      { label: "Low",      color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", bar: "bg-emerald-400" },
  medium:   { label: "Medium",   color: "text-amber-600",   bg: "bg-amber-50 border-amber-100",     bar: "bg-amber-400" },
  high:     { label: "High",     color: "text-orange-600",  bg: "bg-orange-50 border-orange-100",   bar: "bg-orange-400" },
  critical: { label: "Critical", color: "text-red-600",     bg: "bg-red-50 border-red-100",         bar: "bg-red-500" },
};

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const fmtTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

// ─── Sub-components ───────────────────────────────────────────

function PulsingDot({ color = "bg-green-500" }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`} />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}

function KPICard({
  label, value, sub, icon: Icon, color, trend, loading
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: "up" | "down" | "neutral"; loading?: boolean;
}) {
  const trendIcon = trend === "up" ? <ChevronUp className="w-3.5 h-3.5" /> :
                    trend === "down" ? <ChevronDown className="w-3.5 h-3.5" /> :
                    <Minus className="w-3.5 h-3.5" />;
  const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-slate-400";

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/80 p-5 overflow-hidden hover:shadow-md transition-shadow group">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.06] -translate-y-8 translate-x-8 ${color}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
            {trendIcon}
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-20" />
          <div className="h-3 bg-slate-100 rounded w-28" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-black text-slate-800 tabular-nums">{value}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
          {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </>
      )}
    </div>
  );
}

function MiniSparkline({ values, color = "#6366f1" }: { values: number[]; color?: string }) {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const w = 80, h = 30;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function ActivityFeed({ items, loading }: { items: ActivityItem[]; loading: boolean }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? items : items.filter(i => i.status === filter || i.priority === filter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col" style={{ height: 480 }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <PulsingDot />
          <p className="text-sm font-bold text-slate-800">Live Activity Feed</p>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="h-7 border border-slate-200 rounded-lg px-2 text-[11px] text-slate-600 bg-slate-50 cursor-pointer focus:outline-none"
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {loading ? Array(6).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-200 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        )) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">No activity</div>
        ) : filtered.map((item, i) => {
          const sCfg = STATUS_CFG[item.status] ?? STATUS_CFG.open;
          const pCfg = PRIORITY_CFG[item.priority] ?? PRIORITY_CFG.medium;
          return (
            <div key={item._id + i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
              <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${sCfg.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="font-mono text-[10px] text-slate-400">{item.ticketNumber}</span>
                  {item.customerId?.name && <span className="text-[10px] text-slate-400">{item.customerId.name}</span>}
                  {item.technicianId?.name && <span className="text-[10px] text-indigo-500">{item.technicianId.name}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${sCfg.bg} ${sCfg.color}`}>
                  {sCfg.label}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${pCfg.bg} ${pCfg.color}`}>
                  {pCfg.label}
                </span>
                <span className="text-[9px] text-slate-400">{timeAgo(item.updatedAt || item.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusDonut({ distribution, loading }: { distribution: Record<string, number>; loading: boolean }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(distribution).filter(([, v]) => v > 0);
  const colors = ["#3b82f6","#f59e0b","#8b5cf6","#f97316","#22c55e","#94a3b8","#ef4444"];

  let cumulative = 0;
  const segments = entries.map(([key, val], i) => {
    const pct = (val / total) * 100;
    const offset = cumulative;
    cumulative += pct;
    const strokeDasharray = `${pct} ${100 - pct}`;
    const strokeDashoffset = 25 - offset;
    return { key, val, pct, strokeDasharray, strokeDashoffset, color: colors[i % colors.length] };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <p className="text-sm font-bold text-slate-800 mb-4">Status Distribution</p>
      {loading ? (
        <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />
      ) : (
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <svg width="120" height="120" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              {segments.map(seg => (
                <circle key={seg.key} cx="21" cy="21" r="15.9" fill="none"
                  stroke={seg.color} strokeWidth="4"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.5s ease", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-black text-slate-800">{total}</p>
              <p className="text-[9px] text-slate-400 font-medium">TOTAL</p>
            </div>
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            {segments.map(seg => {
              const cfg = STATUS_CFG[seg.key];
              return (
                <div key={seg.key} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
                  <span className="text-xs text-slate-600 flex-1 truncate">{cfg?.label ?? seg.key}</span>
                  <span className="text-xs font-bold text-slate-800">{seg.val}</span>
                  <span className="text-[10px] text-slate-400 w-8 text-right">{seg.pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PriorityBars({ distribution, loading }: { distribution: Record<string, number>; loading: boolean }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
  const order = ["critical", "high", "medium", "low"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <p className="text-sm font-bold text-slate-800 mb-4">Priority Breakdown</p>
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-8 bg-slate-100 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {order.map(key => {
            const val = distribution[key] ?? 0;
            const pct = Math.round((val / total) * 100);
            const cfg = PRIORITY_CFG[key];
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-xs text-slate-500">{val} <span className="text-slate-400">({pct}%)</span></span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SLAMonitor({ sla, loading }: { sla: AnalyticsData["sla"] | null; loading: boolean }) {
  const items = [
    { label: "Response SLA Met", value: sla?.responseMet ?? 0, inverse: false },
    { label: "Resolution SLA Met", value: sla?.resolutionMet ?? 0, inverse: false },
    { label: "Response Breached", value: sla?.responseBreached ?? 0, total: sla?.total, inverse: true },
    { label: "Resolution Breached", value: sla?.resolutionBreached ?? 0, total: sla?.total, inverse: true },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-indigo-500" />
        <p className="text-sm font-bold text-slate-800">SLA Monitor</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map(({ label, value, total, inverse }) => {
            const isGood = inverse ? value === 0 : value >= 85;
            const isMedium = inverse ? value > 0 && value <= 2 : value >= 70 && value < 85;
            const colorClass = isGood ? "text-green-600 bg-green-50 border-green-100" :
                               isMedium ? "text-amber-600 bg-amber-50 border-amber-100" :
                               "text-red-600 bg-red-50 border-red-100";
            const display = total !== undefined ? value : `${value}%`;
            return (
              <div key={label} className={`rounded-xl border p-3 ${colorClass}`}>
                <p className="text-xl font-black">{display}</p>
                <p className="text-[10px] font-medium mt-0.5 leading-tight">{label}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TechnicianTable({ data, loading }: { data: TechPerf[]; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <Users className="w-4 h-4 text-teal-600" />
        <p className="text-sm font-bold text-slate-800">Technician Performance</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Technician", "Assigned", "Resolved", "Rate", "Avg Time"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? Array(4).fill(0).map((_, i) => (
              <tr key={i}>
                {Array(5).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>
                ))}
              </tr>
            )) : data.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">No technician data</td></tr>
            ) : data.slice(0, 8).map((t, i) => {
              const rate = t.total > 0 ? Math.round((t.resolved / t.total) * 100) : 0;
              const initials = t.technicianName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
              return (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 text-[11px] font-bold flex items-center justify-center shrink-0">{initials}</div>
                      <span className="text-sm font-medium text-slate-800 truncate max-w-[120px]">{t.technicianName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-semibold">{t.total}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-semibold">{t.resolved}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${rate >= 80 ? "bg-green-400" : rate >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${rate}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{rate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{t.avgResolutionHours?.toFixed(1) ?? "—"}h</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryChart({ distribution, loading }: { distribution: Record<string, number>; loading: boolean }) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(distribution).sort(([, a], [, b]) => b - a).slice(0, 6);
  const maxVal = entries[0]?.[1] ?? 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-violet-500" />
        <p className="text-sm font-bold text-slate-800">Category Volume</p>
      </div>
      {loading ? (
        <div className="space-y-3 animate-pulse">{Array(5).fill(0).map((_, i) => <div key={i} className="h-6 bg-slate-100 rounded" />)}</div>
      ) : (
        <div className="space-y-3">
          {entries.map(([cat, val]) => {
            const pct = Math.round((val / total) * 100);
            const barPct = Math.round((val / maxVal) * 100);
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 capitalize w-24 shrink-0 truncate">{cat}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-400 rounded-full transition-all duration-700" style={{ width: `${barPct}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-12 text-right">{val} <span className="text-slate-400">({pct}%)</span></span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function RealtimePage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(fmtTime());
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
 
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/overview?range=1", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json.data ?? json);
      setConnected(true);
      setLastUpdated(fmtTime());
      setUpdateCount(p => p + 1);
      setError(null);
    } catch (e: any) {
      setConnected(false);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    pollRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchData]);

  const kpis = data?.kpis;
  const kpiCards = [
    { label: "Open Tickets",    value: kpis?.openTickets ?? 0,        sub: "Awaiting action",          icon: Ticket,    color: "bg-blue-500 text-blue-600",    trend: "neutral" as const },
    { label: "In Progress",     value: kpis?.inProgressTickets ?? 0,  sub: "Being worked on",          icon: Activity,  color: "bg-amber-500 text-amber-600",   trend: "up" as const },
    { label: "Resolved Today",  value: kpis?.resolvedTickets ?? 0,    sub: `${kpis?.resolutionRate ?? 0}% resolution rate`, icon: CheckCircle2, color: "bg-green-500 text-green-600", trend: "up" as const },
    { label: "SLA Compliance",  value: `${kpis?.slaComplianceRate ?? 0}%`, sub: "Resolution SLA met",  icon: Shield,    color: "bg-indigo-500 text-indigo-600", trend: (kpis?.slaComplianceRate ?? 0) >= 85 ? "up" as const : "down" as const },
    { label: "Avg Resolution",  value: `${kpis?.avgResolutionHours ?? 0}h`, sub: "Mean resolution time", icon: Clock,   color: "bg-violet-500 text-violet-600", trend: "neutral" as const },
    { label: "Pending",         value: kpis?.pendingTickets ?? 0,     sub: "Parts or customer wait",   icon: AlertTriangle, color: "bg-orange-500 text-orange-600", trend: "neutral" as const },
    { label: "Total Tickets",   value: kpis?.totalTickets ?? 0,       sub: "All time",                 icon: Zap,       color: "bg-pink-500 text-pink-600",     trend: "up" as const },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-5 lg:p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Realtime Monitoring</h1>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${connected ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
              {connected ? <PulsingDot /> : <WifiOff className="w-3 h-3" />}
              {connected ? "LIVE" : "OFFLINE"}
            </div>
          </div>
          <p className="text-xs text-slate-400">
            {connected ? `Auto-refreshes every ${POLL_INTERVAL / 1000}s · Last updated: ${lastUpdated} · ${updateCount} updates` : "Connection lost — retrying..."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-3 py-2 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> {error}
            </div>
          )}
          <button onClick={fetchData}
            className="flex items-center gap-2 h-9 px-4 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-600 cursor-pointer transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3 mb-6">
        {kpiCards.map(card => (
          <KPICard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Activity feed — 1 col */}
        <div className="lg:col-span-1">
          <ActivityFeed items={data?.recentActivity ?? []} loading={loading} />
        </div>

        {/* Charts — 2 cols */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatusDonut distribution={data?.statusDistribution ?? {}} loading={loading} />
          <PriorityBars distribution={data?.priorityDistribution ?? {}} loading={loading} />
          <SLAMonitor sla={data?.sla ?? null} loading={loading} />
          <CategoryChart distribution={data?.categoryDistribution ?? {}} loading={loading} />
        </div>
      </div>

      {/* Technician table */}
      <TechnicianTable data={data?.technicianPerformance ?? []} loading={loading} />

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between text-[11px] text-slate-400">
        <span>SaaS Techify · Realtime dashboard · Polling every {POLL_INTERVAL / 1000}s</span>
        <span>Last sync: {lastUpdated}</span>
      </div>
    </div>
  );
}