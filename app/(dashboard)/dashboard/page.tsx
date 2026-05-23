 

// "use client";

// import { useEffect } from "react";
// import Link from "next/link";
// import {
//   Ticket, BarChart2, Clock, Users, TrendingUp, TrendingDown,
//   ArrowRight, RefreshCw, AlertCircle,
// } from "lucide-react";
// import { useDashboard } from "@/hooks/useDashboard";
// import { useUser } from "@/hooks/useUser";
// import { fmtDate, timeAgo, initials } from "@/utils/format";

// const STATUS_STYLE: Record<string, string> = {
//   open: "bg-blue-50 text-blue-700 border-blue-100",
//   in_progress: "bg-amber-50 text-amber-700 border-amber-100",
//   resolved: "bg-green-50 text-green-700 border-green-100",
//   closed: "bg-slate-100 text-slate-600 border-slate-200",
//   pending_parts: "bg-violet-50 text-violet-700 border-violet-100",
//   pending_customer: "bg-violet-50 text-violet-600 border-violet-100",
// };

// const STATUS_LABEL: Record<string, string> = {
//   open: "Open", in_progress: "In Progress", resolved: "Resolved",
//   closed: "Closed", pending_parts: "Pending Parts", pending_customer: "Pending Customer",
// };

// const PRIORITY_STYLE: Record<string, string> = {
//   urgent: "bg-red-50 text-red-600 border-red-100",
//   high: "bg-orange-50 text-orange-600 border-orange-100",
//   medium: "bg-yellow-50 text-yellow-700 border-yellow-100",
//   low: "bg-slate-50 text-slate-500 border-slate-200",
// };

// function SkeletonCard() {
//   return (
//     <div className="bg-white rounded-xl border border-slate-200/80 p-5 animate-pulse">
//       <div className="flex justify-between mb-4">
//         <div className="h-3 bg-slate-200 rounded w-24" />
//         <div className="w-8 h-8 bg-slate-200 rounded-lg" />
//       </div>
//       <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
//       <div className="h-3 bg-slate-200 rounded w-20" />
//     </div>
//   );
// }

// function SkeletonRow() {
//   return (
//     <div className="flex items-center gap-3 px-5 py-3 animate-pulse">
//       <div className="w-12 h-3 bg-slate-200 rounded" />
//       <div className="flex-1 space-y-1.5">
//         <div className="h-3 bg-slate-200 rounded w-3/4" />
//         <div className="h-2.5 bg-slate-100 rounded w-1/2" />
//       </div>
//       <div className="w-14 h-5 bg-slate-200 rounded-full" />
//       <div className="w-16 h-5 bg-slate-200 rounded-full" />
//     </div>
//   );
// }

// export default function DashboardPage() {
//   const { stats, tickets, activity, loading, error, refetch } = useDashboard();
//   const { user, greeting } = useUser();

//   const statCards = [
//     {
//       label: "Open Tickets", value: stats?.openTickets ?? "—",
//       change: `${stats?.inProgressTickets ?? 0} in progress`,
//       up: true, icon: Ticket, color: "bg-blue-50 text-blue-600",
//     },
//     {
//       label: "Resolved", value: stats?.resolvedTickets ?? "—",
//       change: `${stats?.resolutionRate ?? 0}% rate`,
//       up: (stats?.resolutionRate ?? 0) >= 70, icon: BarChart2, color: "bg-green-50 text-green-600",
//     },
//     {
//       label: "Avg Resolution", value: stats?.avgResolutionHours ? `${stats.avgResolutionHours}h` : "—",
//       change: "Average time",
//       up: (stats?.avgResolutionHours ?? 99) < 8, icon: Clock, color: "bg-violet-50 text-violet-600",
//     },
//     {
//       label: "SLA Compliance", value: stats?.slaComplianceRate ? `${stats.slaComplianceRate}%` : "—",
//       change: `${stats?.pendingTickets ?? 0} pending`,
//       up: (stats?.slaComplianceRate ?? 0) >= 85, icon: Users, color: "bg-amber-50 text-amber-600",
//     },
//   ];

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96 gap-4">
//         <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
//           <AlertCircle className="w-6 h-6 text-red-500" />
//         </div>
//         <div className="text-center">
//           <p className="text-slate-700 font-semibold">Failed to load dashboard</p>
//           <p className="text-slate-400 text-sm mt-1">{error}</p>
//         </div>
//         <button onClick={refetch}
//           className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer">
//           <RefreshCw className="w-4 h-4" /> Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 max-w-7xl mx-auto">
//       {/* Heading */}
//       <div className="flex items-start justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
//             {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
//           </h1>
//           <p className="text-slate-500 text-sm mt-1">
//             Here&apos;s what&apos;s happening with your service operations today.
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <button onClick={refetch}
//             className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
//             <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
//           </button>
//           <Link href="/dashboard/tickets/create"
//             className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium cursor-pointer">
//             <Ticket className="w-4 h-4" /> New ticket
//           </Link>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
//         {loading
//           ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
//           : statCards.map(({ label, value, change, up, icon: Icon, color }) => (
//             <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 lg:p-5 hover:shadow-sm transition-shadow">
//               <div className="flex items-start justify-between mb-3">
//                 <p className="text-xs font-medium text-slate-500 uppercase tracking-wide leading-none">{label}</p>
//                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
//                   <Icon className="w-4 h-4" />
//                 </div>
//               </div>
//               <p className="text-2xl lg:text-3xl font-bold text-slate-800 tabular-nums">{value}</p>
//               <p className={`text-xs mt-1.5 flex items-center gap-1 ${up ? "text-emerald-600" : "text-red-500"}`}>
//                 {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//                 {change}
//               </p>
//             </div>
//           ))
//         }
//       </div>

//       {/* Tickets + Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
//         {/* Recent tickets */}
//         <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 overflow-hidden">
//           <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
//             <div>
//               <h2 className="text-sm font-semibold text-slate-800">Recent Tickets</h2>
//               {!loading && (
//                 <p className="text-xs text-slate-400 mt-0.5">{tickets.length} latest requests</p>
//               )}
//             </div>
//             <Link href="/dashboard/tickets"
//               className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
//               View all <ArrowRight className="w-3 h-3" />
//             </Link>
//           </div>
//           <div className="divide-y divide-slate-100">
//             {loading
//               ? Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
//               : tickets.length === 0
//               ? (
//                 <div className="flex flex-col items-center justify-center py-12 text-center">
//                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
//                     <Ticket className="w-5 h-5 text-slate-400" />
//                   </div>
//                   <p className="text-slate-500 text-sm font-medium">No tickets yet</p>
//                   <Link href="/dashboard/tickets/create" className="text-xs text-indigo-600 hover:underline mt-1">
//                     Create first ticket
//                   </Link>
//                 </div>
//               )
//               : tickets.map((ticket: any) => (
//                 <Link key={ticket._id} href={`/dashboard/tickets/${ticket._id}`}
//                   className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">
//                   <span className="text-xs font-mono font-semibold text-slate-400 w-20 shrink-0 truncate">
//                     {ticket.ticketNumber}
//                   </span>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm text-slate-700 truncate font-medium group-hover:text-indigo-600 transition-colors">
//                       {ticket.title}
//                     </p>
//                     <p className="text-xs text-slate-400 mt-0.5">
//                       {ticket.customerId?.name ?? "—"} · {fmtDate(ticket.createdAt)}
//                     </p>
//                   </div>
//                   <span className={`hidden sm:inline-flex text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${PRIORITY_STYLE[ticket.priority] ?? PRIORITY_STYLE.low}`}>
//                     {ticket.priority}
//                   </span>
//                   <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${STATUS_STYLE[ticket.status] ?? STATUS_STYLE.open}`}>
//                     {STATUS_LABEL[ticket.status] ?? ticket.status}
//                   </span>
//                 </Link>
//               ))
//             }
//           </div>
//         </div>

//         {/* Activity feed */}
//         <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 overflow-hidden flex flex-col">
//           <div className="px-5 py-4 border-b border-slate-100 shrink-0">
//             <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
//             <p className="text-xs text-slate-400 mt-0.5">Live service feed</p>
//           </div>
//           <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
//             {loading
//               ? Array(5).fill(0).map((_, i) => (
//                 <div key={i} className="flex items-start gap-3 animate-pulse">
//                   <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
//                   <div className="flex-1 space-y-1.5">
//                     <div className="h-3 bg-slate-200 rounded w-full" />
//                     <div className="h-2.5 bg-slate-100 rounded w-16" />
//                   </div>
//                 </div>
//               ))
//               : activity.length === 0
//               ? (
//                 <p className="text-xs text-slate-400 text-center py-6">No recent activity</p>
//               )
//               : activity.slice(0, 8).map((item: any, i: number) => (
//                 <Link key={i} href={`/dashboard/tickets/${item._id}`}
//                   className="flex items-start gap-3 group">
//                   <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
//                     item.status === "resolved" ? "bg-green-400" :
//                     item.status === "in_progress" ? "bg-amber-400" :
//                     item.status === "open" ? "bg-blue-400" : "bg-slate-300"
//                   }`} />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs text-slate-600 leading-relaxed truncate group-hover:text-indigo-600 transition-colors">
//                       {item.title ?? item.text ?? "Ticket updated"}
//                     </p>
//                     <p className="text-[10px] text-slate-400 mt-0.5">
//                       {item.customerId?.name && `${item.customerId.name} · `}
//                       {timeAgo(item.updatedAt ?? item.createdAt)}
//                     </p>
//                   </div>
//                 </Link>
//               ))
//             }
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
// app/(dashboard)/dashboard/page.tsx  — REPLACE existing
// Super Admin dashboard: all brands, all metrics, live activity, quick actions, charts

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Ticket, BarChart2, Clock, Users, TrendingUp, TrendingDown,
  ArrowRight, RefreshCw, AlertCircle, Building2, Wrench,
  ShieldCheck, Zap, Bell, Wallet, MessageSquare, CheckCircle2,
  XCircle, Package, Tag, Mail, Globe, Plus, Eye,
  ChevronRight, AlertTriangle, Activity,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface DashStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  cancelledTickets: number;
  pendingTickets: number;
  resolutionRate: number;
  avgResolutionHours: number;
  slaComplianceRate: number;
  slaBreached: number;
}

interface BrandRow {
  tenantId: string;
  total: number;
  open: number;
  resolved: number;
}

interface Technician {
  name: string;
  employeeId: string;
  assigned: number;
  resolved: number;
  resolutionRate: number;
  avgResHours: number;
  rating: number;
}

interface RecentTicket {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  faultName?: string;
  customerId: { name: string } | null;
  technicianId: { name: string } | null;
  serviceCenterId: { name: string; code: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface TopFault {
  _id: string;
  count: number;
}

/* ─── Config ─────────────────────────────────────────────────────────────── */
const STATUS_STYLE: Record<string, string> = {
  open:             "bg-blue-50 text-blue-700 border-blue-100",
  in_progress:      "bg-amber-50 text-amber-700 border-amber-100",
  pending_parts:    "bg-orange-50 text-orange-700 border-orange-100",
  pending_customer: "bg-orange-50 text-orange-600 border-orange-100",
  resolved:         "bg-green-50 text-green-700 border-green-100",
  closed:           "bg-slate-100 text-slate-600 border-slate-200",
  cancelled:        "bg-red-50 text-red-600 border-red-100",
};
const STATUS_DOT: Record<string, string> = {
  open: "bg-blue-500", in_progress: "bg-amber-500",
  resolved: "bg-green-500", closed: "bg-slate-400",
  pending_parts: "bg-orange-500", cancelled: "bg-red-400",
};
const PRIORITY_STYLE: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-100",
  high:     "bg-orange-50 text-orange-600 border-orange-100",
  medium:   "bg-amber-50 text-amber-700 border-amber-100",
  low:      "bg-slate-50 text-slate-500 border-slate-200",
};

const fmtAmt  = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", hour12:false });
const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/* ─── Mini bar chart ─────────────────────────────────────────────────────── */
function MiniBar({ value, max, color = "bg-indigo-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-3 bg-slate-200 rounded w-24" />
        <div className="w-9 h-9 bg-slate-200 rounded-xl" />
      </div>
      <div className="h-8 bg-slate-200 rounded w-20" />
      <div className="h-2.5 bg-slate-100 rounded w-28" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3 animate-pulse">
      <div className="w-20 h-3 bg-slate-200 rounded" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-2.5 bg-slate-100 rounded w-1/2" />
      </div>
      <div className="w-14 h-5 bg-slate-200 rounded-full" />
      <div className="w-16 h-5 bg-slate-200 rounded-full" />
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon, color, trend, href,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; trend?: number; href?: string;
}) {
  const content = (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-slate-300 transition group ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            trend >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>;
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useUser();
  const [stats,        setStats]        = useState<DashStats | null>(null);
  const [tickets,      setTickets]      = useState<RecentTicket[]>([]);
  const [brands,       setBrands]       = useState<BrandRow[]>([]);
  const [technicians,  setTechnicians]  = useState<Technician[]>([]);
  const [topFaults,    setTopFaults]    = useState<TopFault[]>([]);
  const [trendData,    setTrendData]    = useState<any[]>([]);
  const [walletSummary,setWalletSummary]= useState<any>(null);
  const [newContacts,  setNewContacts]  = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [reportRes, ticketRes, walletRes, contactRes] = await Promise.all([
        fetch("/api/reports?period=monthly", { credentials: "include" }),
        fetch("/api/tickets?limit=8&page=1",  { credentials: "include" }),
        fetch("/api/wallet/admin",             { credentials: "include" }),
        fetch("/api/contact?limit=1&status=new", { credentials: "include" }),
      ]);

      const [reportData, ticketData, walletData, contactData] = await Promise.all([
        reportRes.json(), ticketRes.json(), walletRes.json(), contactRes.json(),
      ]);

      /* ── Stats from report ── */
      if (reportData.data?.overview) {
        setStats(reportData.data.overview);
      }
      setBrands(reportData.data?.brands ?? []);
      setTechnicians(reportData.data?.technicians?.slice(0, 5) ?? []);
      setTopFaults(reportData.data?.topFaults?.slice(0, 5) ?? []);
      setTrendData(reportData.data?.trends ?? []);

      /* ── Recent tickets ── */
      setTickets(ticketData.data?.tickets ?? []);

      /* ── Wallet summary ── */
      if (walletData.data?.summary) setWalletSummary(walletData.data.summary);

      /* ── New contacts ── */
      setNewContacts(contactData.data?.newCount ?? 0);

      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Auto-refresh every 60s ── */
  useEffect(() => {
    const t = setInterval(fetchAll, 60000);
    return () => clearInterval(t);
  }, [fetchAll]);

  const s = stats;

  /* ─────────────────────────────────────────────── */
  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-slate-800 font-semibold">Failed to load dashboard</p>
          <p className="text-slate-400 text-sm mt-1">{error}</p>
        </div>
        <button onClick={fetchAll}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-indigo-700 transition">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const maxBrandTotal = Math.max(...brands.map(b => b.total), 1);
  const maxTechAssigned = Math.max(...technicians.map(t => t.assigned), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
            {greeting()}, {user?.name?.split(" ")[0] ?? "Admin"} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            Super Admin · All brands · Full access
            {lastUpdated && (
              <span className="text-slate-300">· Updated {timeAgo(lastUpdated.toISOString())}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {newContacts > 0 && (
            <Link href="/dashboard/contact"
              className="flex items-center gap-2 h-9 px-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition cursor-pointer">
              <Mail className="w-3.5 h-3.5" /> {newContacts} new contact{newContacts > 1 ? "s" : ""}
            </Link>
          )}
          {walletSummary?.pendingWithdrawals > 0 && (
            <Link href="/dashboard/wallet"
              className="flex items-center gap-2 h-9 px-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 transition cursor-pointer">
              <Wallet className="w-3.5 h-3.5" /> {walletSummary.pendingWithdrawals} withdrawal{walletSummary.pendingWithdrawals > 1 ? "s" : ""} pending
            </Link>
          )}
          <button onClick={fetchAll}
            className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer bg-white transition">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link href="/dashboard/tickets"
            className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition">
            <Ticket className="w-4 h-4" /> View tickets
          </Link>
        </div>
      </div>

      {/* ── KPI Row 1 — Ticket metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {loading ? Array(6).fill(0).map((_,i) => <SkeletonCard key={i} />) : [
          { label:"Total Tickets",   value: s?.totalTickets    ?? 0, icon:<Ticket      className="w-4 h-4"/>, color:"bg-indigo-50 text-indigo-600", href:"/dashboard/tickets" },
          { label:"Open",            value: s?.openTickets     ?? 0, icon:<Zap         className="w-4 h-4"/>, color:"bg-blue-50 text-blue-600",    href:"/dashboard/tickets?status=open" },
          { label:"In Progress",     value: s?.inProgressTickets?? 0,icon:<RefreshCw   className="w-4 h-4"/>, color:"bg-amber-50 text-amber-600",  href:"/dashboard/tickets?status=in_progress" },
          { label:"Resolved",        value: s?.resolvedTickets ?? 0, icon:<CheckCircle2 className="w-4 h-4"/>,color:"bg-green-50 text-green-600",  href:"/dashboard/tickets?status=resolved" },
          { label:"SLA Breached",    value: s?.slaBreached     ?? 0, icon:<AlertTriangle className="w-4 h-4"/>,color:"bg-red-50 text-red-500",    href:"/dashboard/tickets" },
          { label:"Cancelled",       value: s?.cancelledTickets?? 0, icon:<XCircle      className="w-4 h-4"/>, color:"bg-slate-100 text-slate-500",href:"/dashboard/tickets" },
        ].map(c => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* ── KPI Row 2 — Performance ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />) : [
          {
            label:"Resolution Rate", value:`${s?.resolutionRate ?? 0}%`,
            sub:`${s?.resolvedTickets ?? 0} of ${s?.totalTickets ?? 0} tickets`,
            icon:<BarChart2 className="w-4 h-4"/>, color:"bg-green-50 text-green-600",
            trend:(s?.resolutionRate ?? 0) >= 80 ? 5 : -3,
          },
          {
            label:"Avg Resolution",  value:`${s?.avgResolutionHours ?? 0}h`,
            sub:"Per ticket average",
            icon:<Clock className="w-4 h-4"/>, color:"bg-violet-50 text-violet-600",
          },
          {
            label:"SLA Compliance",  value:`${s?.slaComplianceRate ?? 0}%`,
            sub:`${s?.slaBreached ?? 0} SLA breaches this month`,
            icon:<ShieldCheck className="w-4 h-4"/>, color:"bg-teal-50 text-teal-600",
            trend:(s?.slaComplianceRate ?? 0) >= 90 ? 2 : -5,
          },
          {
            label:"Total Wallet",    value: walletSummary ? fmtAmt(walletSummary.totalBalance) : "—",
            sub: walletSummary ? `${walletSummary.pendingWithdrawals} pending withdrawals` : "Loading...",
            icon:<Wallet className="w-4 h-4"/>, color:"bg-amber-50 text-amber-600",
            href:"/dashboard/wallet",
          },
        ].map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* ── Trend chart (visual bar graph) ── */}
      {trendData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Ticket Volume Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Created vs resolved — last 30 days</p>
            </div>
            <Link href="/dashboard/reports" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
              Full report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-end gap-1 h-24">
            {trendData.slice(-20).map((d, i) => {
              const maxVal = Math.max(...trendData.map(x => x.created), 1);
              const h1 = Math.round((d.created  / maxVal) * 100);
              const h2 = Math.round((d.resolved / maxVal) * 100);
              return (
                <div key={i} className="flex-1 flex gap-0.5 items-end group cursor-default" title={`${d.date}: ${d.created} created, ${d.resolved} resolved`}>
                  <div className="flex-1 bg-indigo-500/70 group-hover:bg-indigo-600 rounded-t transition-all" style={{ height: `${h1}%` }} />
                  <div className="flex-1 bg-green-400/70 group-hover:bg-green-500 rounded-t transition-all" style={{ height: `${h2}%` }} />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-indigo-500 rounded" /> Created</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-green-400 rounded" /> Resolved</span>
          </div>
        </div>
      )}

      {/* ── 3-column row: Tickets + Brand breakdown + Quick actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent tickets */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Recent Tickets</h2>
              {!loading && <p className="text-xs text-slate-400 mt-0.5">{tickets.length} latest across all brands</p>}
            </div>
            <Link href="/dashboard/tickets"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading
              ? Array(6).fill(0).map((_,i) => <SkeletonRow key={i} />)
              : tickets.length === 0
              ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
                  <Ticket className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No tickets yet</p>
                </div>
              )
              : tickets.map(t => (
                <Link key={t._id} href={`/dashboard/tickets/${t._id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">{t.ticketNumber}</span>
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{t.title}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      {t.customerId?.name && <span>{t.customerId.name}</span>}
                      {t.faultName && <span className="text-amber-600">· {t.faultName}</span>}
                      {t.serviceCenterId && <span>· {t.serviceCenterId.name}</span>}
                      <span>· {timeAgo(t.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 capitalize ${PRIORITY_STYLE[t.priority] ?? ""}`}>
                    {t.priority}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${STATUS_STYLE[t.status] ?? ""}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[t.status] ?? "bg-slate-400"}`} />
                    {t.status.replace(/_/g, " ")}
                  </span>
                </Link>
              ))
            }
          </div>
        </div>

        {/* Quick actions + Brand summary */}
        <div className="flex flex-col gap-4">

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label:"New brand",     icon:<Plus    className="w-4 h-4"/>, color:"bg-indigo-50 text-indigo-600 hover:bg-indigo-100", href:"/dashboard/brand"             },
                { label:"Add SC",        icon:<Building2 className="w-4 h-4"/>, color:"bg-teal-50 text-teal-600 hover:bg-teal-100",     href:"/dashboard/service-centers"  },
                { label:"Technicians",   icon:<Wrench  className="w-4 h-4"/>, color:"bg-amber-50 text-amber-600 hover:bg-amber-100",   href:"/dashboard/technicians"       },
                { label:"Reports",       icon:<BarChart2 className="w-4 h-4"/>,color:"bg-violet-50 text-violet-600 hover:bg-violet-100",href:"/dashboard/reports"          },
                { label:"Wallet",        icon:<Wallet  className="w-4 h-4"/>, color:"bg-green-50 text-green-600 hover:bg-green-100",   href:"/dashboard/wallet"            },
                { label:"Users",         icon:<Users   className="w-4 h-4"/>, color:"bg-blue-50 text-blue-600 hover:bg-blue-100",      href:"/dashboard/users"             },
                { label:"Contacts",      icon:<Mail    className="w-4 h-4"/>, color:"bg-pink-50 text-pink-600 hover:bg-pink-100",      href:"/dashboard/contact",
                  badge: newContacts > 0 ? newContacts : undefined },
                { label:"Settings",      icon:<ShieldCheck className="w-4 h-4"/>, color:"bg-slate-50 text-slate-600 hover:bg-slate-100", href:"/dashboard/settings"      },
              ].map(({ label, icon, color, href, badge }: any) => (
                <Link key={label} href={href}
                  className={`relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-transparent transition cursor-pointer text-center ${color}`}>
                  {icon}
                  <span className="text-[11px] font-semibold">{label}</span>
                  {badge && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{badge}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Brand breakdown */}
          {brands.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800">Brand Breakdown</h2>
                <Link href="/dashboard/brand" className="text-xs text-indigo-600 flex items-center gap-0.5">
                  All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {brands.slice(0,5).map(b => (
                  <div key={b.tenantId}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700 font-mono">{b.tenantId}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="text-blue-600">{b.open} open</span>
                        <span className="text-green-600">{b.resolved} resolved</span>
                        <span className="font-semibold text-slate-700">{b.total} total</span>
                      </div>
                    </div>
                    <MiniBar value={b.total} max={maxBrandTotal} color="bg-indigo-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row: Technician table + Top faults + Wallet ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top technicians */}
        {technicians.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Top Technicians</h2>
                <p className="text-xs text-slate-400 mt-0.5">Ranked by tickets resolved this month</p>
              </div>
              <Link href="/dashboard/technicians" className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["#","Technician","Assigned","Resolved","Rate","Avg Time","Rating"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {technicians.map((t, i) => (
                    <tr key={t.employeeId ?? i} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-2.5 text-xs font-bold text-slate-300">#{i+1}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {t.name?.split(" ").map((n:string) => n[0]).join("").slice(0,2).toUpperCase() ?? "??"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{t.name}</p>
                            <p className="text-[10px] text-slate-400">{t.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">{t.assigned}</td>
                      <td className="px-4 py-2.5 text-xs font-semibold text-green-600">{t.resolved}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width:`${Math.min(t.resolutionRate,100)}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-600">{Math.round(t.resolutionRate)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">{t.avgResHours}h</td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs font-semibold text-amber-600">★ {t.rating?.toFixed(1) ?? "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Right column: Top faults + Wallet snapshot */}
        <div className="flex flex-col gap-4">

          {/* Top faults */}
          {topFaults.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Top Reported Faults</h2>
              <div className="space-y-3">
                {topFaults.map((f, i) => {
                  const max = topFaults[0]?.count || 1;
                  return (
                    <div key={f._id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-700 flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-bold">#{i+1}</span>
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span className="truncate max-w-[140px]">{f._id}</span>
                        </span>
                        <span className="text-xs font-bold text-slate-700">{f.count}</span>
                      </div>
                      <MiniBar value={f.count} max={max} color="bg-amber-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wallet snapshot */}
          {walletSummary && (
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 opacity-80" />
                  <span className="text-sm font-bold">Platform Wallet</span>
                </div>
                <Link href="/dashboard/wallet" className="text-[10px] text-white/60 hover:text-white flex items-center gap-0.5 transition">
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-3xl font-black tracking-tight mb-1">{fmtAmt(walletSummary.totalBalance)}</p>
              <p className="text-xs text-white/60 mb-4">Total balance across all wallets</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:"Total Earned",    value: fmtAmt(walletSummary.totalEarned)    },
                  { label:"Total Withdrawn", value: fmtAmt(walletSummary.totalWithdrawn) },
                  { label:"Pending Amount",  value: fmtAmt(walletSummary.pendingAmount)  },
                  { label:"Wallets",         value: walletSummary.totalWallets           },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 rounded-xl p-3">
                    <p className="text-xs text-white/60">{label}</p>
                    <p className="text-sm font-bold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              {walletSummary.pendingWithdrawals > 0 && (
                <Link href="/dashboard/wallet"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold transition cursor-pointer">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {walletSummary.pendingWithdrawals} withdrawal{walletSummary.pendingWithdrawals > 1 ? "s" : ""} need approval
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}