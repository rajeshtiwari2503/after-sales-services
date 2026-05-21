//  "use client";

// // app/(dashboard)/dashboard/reports/page.tsx  — REPLACE existing placeholder

// import { useState, useEffect, useCallback } from "react";
// import {
//   BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
// } from "recharts";
// import {
//   Download, RefreshCw, Calendar, TrendingUp, TrendingDown,
//   Ticket, Users, Building2, Wrench, CheckCircle2, AlertTriangle,
//   Clock, Star, Zap, Package, ChevronDown,
//   CircleEllipsis,
// } from "lucide-react";
// import toast from "react-hot-toast";

// /* ─── Types ──────────────────────────────────────────────────────────────── */
// interface ReportData {
//   period: string;
//   dateRange: { start: string; end: string };
//   overview: {
//     totalTickets: number; prevTotal: number; ticketGrowth: number;
//     openTickets: number; resolvedTickets: number; closedTickets: number;
//     cancelledTickets: number; inProgressTickets: number;
//     resolutionRate: number; avgResolutionHours: number;
//   };
//   sla: { breached: number; responseBreached: number; breachRate: number };
//   breakdown: {
//     byStatus:   { status: string; count: number }[];
//     byPriority: { priority: string; count: number }[];
//     byCategory: { category: string; count: number }[];
//     priorityResolutionTime: { priority: string; avgHours: number; count: number }[];
//   };
//   trends: { date: string; created: number; resolved: number; open: number }[];
//   technicians: {
//     _id: string; name: string; employeeId: string;
//     assigned: number; resolved: number; resolutionRate: number;
//     avgResHours: number; rating: number;
//   }[];
//   serviceCenters: {
//     _id: string; name: string; code: string;
//     total: number; resolved: number; open: number; resolutionRate: number;
//   }[];
//   brands: { _id: string; total: number; resolved: number; open: number }[];
//   customers: { uniqueCustomers: number; repeatCustomers: number; avgPerCustomer: number };
//   topFaults: { _id: string; count: number }[];
// }

// /* ─── Constants ──────────────────────────────────────────────────────────── */
// const PERIODS = [
//   { label: "This Week",  value: "weekly"  },
//   { label: "This Month", value: "monthly" },
//   { label: "This Year",  value: "yearly"  },
// ];

// const PRIORITY_COLORS: Record<string, string> = {
//   low: "#22c55e", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
// };
// const STATUS_COLORS: Record<string, string> = {
//   open: "#3b82f6", in_progress: "#f59e0b", resolved: "#22c55e",
//   closed: "#64748b", cancelled: "#ef4444",
// };
// const CHART_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316"];

// const fmt = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);
// const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
// const fmtDateRange = (s: string, e: string) =>
//   `${new Date(s).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} — ${new Date(e).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}`;

// /* ─── Subcomponents ──────────────────────────────────────────────────────── */
// function StatCard({
//   label, value, sub, icon, trend, color = "indigo",
// }: {
//   label: string; value: string | number; sub?: string;
//   icon: React.ReactNode; trend?: number; color?: string;
// }) {
//   const colorMap: Record<string, string> = {
//     indigo: "bg-indigo-50 text-indigo-600",
//     green:  "bg-green-50 text-green-600",
//     amber:  "bg-amber-50 text-amber-600",
//     red:    "bg-red-50 text-red-600",
//     blue:   "bg-blue-50 text-blue-600",
//     slate:  "bg-slate-100 text-slate-600",
//   };
//   return (
//     <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//       <div className="flex items-start justify-between mb-3">
//         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
//           {icon}
//         </div>
//         {trend !== undefined && (
//           <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
//             trend >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
//           }`}>
//             {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//             {Math.abs(trend)}%
//           </span>
//         )}
//       </div>
//       <p className="text-2xl font-bold text-slate-800">{value}</p>
//       <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
//       {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
//     </div>
//   );
// }

// function SectionHeader({ title, sub }: { title: string; sub?: string }) {
//   return (
//     <div className="mb-4">
//       <h2 className="text-base font-bold text-slate-800">{title}</h2>
//       {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
//     </div>
//   );
// }

// /* ─── Main component ─────────────────────────────────────────────────────── */
// export default function ReportsPage() {
//   const [period,    setPeriod]    = useState("monthly");
//   const [data,      setData]      = useState<ReportData | null>(null);
//   const [loading,   setLoading]   = useState(true);
//   const [userRole,  setUserRole]  = useState<string>("manager");
//   const [exporting, setExporting] = useState(false);

//   /* ── Fetch role ── */
//   useEffect(() => {
//     fetch("/api/auth/me", { credentials: "include" })
//       .then(r => r.json())
//       .then(d => setUserRole(d?.data?.role ?? d?.user?.role ?? "manager"))
//       .catch(() => {});
//   }, []);

//   /* ── Fetch report ── */
//   const fetchReport = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res  = await fetch(`/api/reports?period=${period}`, { credentials: "include" });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.message ?? "Failed");
//       setData(json.data);
//     } catch (e: any) {
//       toast.error(e.message || "Failed to load report");
//     } finally {
//       setLoading(false);
//     }
//   }, [period]);

//   useEffect(() => { fetchReport(); }, [fetchReport]);

//   /* ── CSV Export ── */
//   const handleExport = async () => {
//     if (!data) return;
//     setExporting(true);
//     try {
//       // Build CSV from trend data
//       const rows = [
//         ["Date", "Created", "Resolved", "Open"],
//         ...data.trends.map(t => [t.date, t.created, t.resolved, t.open]),
//       ];
//       const csv  = rows.map(r => r.join(",")).join("\n");
//       const blob = new Blob([csv], { type: "text/csv" });
//       const url  = URL.createObjectURL(blob);
//       const a    = document.createElement("a");
//       a.href     = url;
//       a.download = `report-${period}-${new Date().toISOString().slice(0,10)}.csv`;
//       a.click();
//       URL.revokeObjectURL(url);
//       toast.success("Report exported");
//     } finally {
//       setExporting(false);
//     }
//   };

//   const o = data?.overview;

//   /* ─── Skeleton ── */
//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
//         <div className="h-16 bg-white rounded-2xl border border-slate-200" />
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           {Array(8).fill(0).map((_,i) => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />)}
//         </div>
//         <div className="h-72 bg-white rounded-2xl border border-slate-200" />
//         <div className="grid grid-cols-2 gap-4">
//           {Array(4).fill(0).map((_,i) => <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200" />)}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto space-y-6 pb-10">

//       {/* ── Header ── */}
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">Reports & Analytics</h1>
//           {data && (
//             <p className="text-xs text-slate-400 mt-0.5">
//               {fmtDateRange(data.dateRange.start, data.dateRange.end)}
//             </p>
//           )}
//         </div>
//         <div className="flex items-center gap-2 flex-wrap">
//           {/* Period picker */}
//           <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-medium bg-white">
//             {PERIODS.map(p => (
//               <button key={p.value} onClick={() => setPeriod(p.value)}
//                 className={`px-3 py-2 cursor-pointer transition ${
//                   period === p.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
//                 }`}>
//                 {p.label}
//               </button>
//             ))}
//           </div>
//           <button onClick={fetchReport}
//             className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer bg-white">
//             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
//           </button>
//           <button onClick={handleExport} disabled={exporting || !data}
//             className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium cursor-pointer disabled:opacity-60">
//             <Download className="w-3.5 h-3.5" />
//             {exporting ? "Exporting..." : "Export CSV"}
//           </button>
//         </div>
//       </div>

//       {data && (
//         <>
//           {/* ══ SECTION 1: OVERVIEW STATS ══ */}
//           <div>
//             <SectionHeader title="Overview" sub="Key metrics for the selected period" />
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//               <StatCard label="Total Tickets"     value={fmt(o!.totalTickets)}
//                 icon={<Ticket className="w-5 h-5"/>}         trend={o!.ticketGrowth}   color="indigo" />
//               <StatCard label="Open"              value={fmt(o!.openTickets)}
//                 icon={<Zap className="w-5 h-5"/>}            color="blue" />
//               <StatCard label="In Progress"       value={fmt(o!.inProgressTickets)}
//                 icon={<Clock className="w-5 h-5"/>}          color="amber" />
//               <StatCard label="Resolved"          value={fmt(o!.resolvedTickets)}
//                 icon={<CheckCircle2 className="w-5 h-5"/>}   color="green" />
//               <StatCard label="Resolution Rate"   value={`${o!.resolutionRate}%`}
//                 icon={<TrendingUp className="w-5 h-5"/>}     color="green"
//                 sub={`${o!.resolvedTickets + o!.closedTickets} of ${o!.totalTickets} tickets`} />
//               <StatCard label="Avg Resolution"    value={`${o!.avgResolutionHours}h`}
//                 icon={<Clock className="w-5 h-5"/>}          color="indigo" />
//               <StatCard label="SLA Breached"      value={data.sla.breached}
//                 icon={<AlertTriangle className="w-5 h-5"/>}  color="red"
//                 sub={`${data.sla.breachRate}% breach rate`} />
//               <StatCard label="Unique Customers"  value={fmt(data.customers.uniqueCustomers)}
//                 icon={<Users className="w-5 h-5"/>}          color="blue"
//                 sub={`${data.customers.repeatCustomers} repeat customers`} />
//             </div>
//           </div>

//           {/* ══ SECTION 2: TREND LINE CHART ══ */}
//           <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//             <SectionHeader title="Ticket Trends" sub="Created vs resolved over time" />
//             {data.trends.length === 0 ? (
//               <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No trend data</div>
//             ) : (
//               <ResponsiveContainer width="100%" height={260}>
//                 <LineChart data={data.trends} margin={{ top:4, right:16, bottom:0, left:0 }}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                   <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }}
//                     tickFormatter={d => period === "yearly" ? d : fmtDate(d)} />
//                   <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
//                   <Tooltip
//                     contentStyle={{ borderRadius:12, border:"1px solid #e2e8f0", fontSize:11 }}
//                     labelFormatter={d => period === "yearly" ? d : fmtDate(d)}
//                   />
//                   <Legend wrapperStyle={{ fontSize:11 }} />
//                   <Line type="monotone" dataKey="created"  name="Created"  stroke="#6366f1" strokeWidth={2} dot={false} />
//                   <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" strokeWidth={2} dot={false} />
//                   <Line type="monotone" dataKey="open"     name="Open"     stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           {/* ══ SECTION 3: BREAKDOWN CHARTS ══ */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

//             {/* By Status — Pie */}
//             <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//               <SectionHeader title="By Status" />
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie data={data.breakdown.byStatus} dataKey="count" nameKey="status"
//                     cx="50%" cy="50%" outerRadius={70} label={({ status, percent }) =>
//                       `${status.replace("_"," ")} ${(percent*100).toFixed(0)}%`}
//                     labelLine={false} style={{ fontSize:9 }}>
//                     {data.breakdown.byStatus.map((entry, i) => (
//                       <CircleEllipsis key={i} fill={STATUS_COLORS[entry.status] ?? CHART_COLORS[i % CHART_COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }}
//                     formatter={(v:any, name:any) => [v, String(name).replace("_"," ")]} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="grid grid-cols-2 gap-1 mt-2">
//                 {data.breakdown.byStatus.map(s => (
//                   <div key={s.status} className="flex items-center gap-1.5 text-[10px] text-slate-600">
//                     <span className="w-2 h-2 rounded-full shrink-0"
//                       style={{ background: STATUS_COLORS[s.status] ?? "#64748b" }} />
//                     <span className="capitalize">{s.status.replace("_"," ")}</span>
//                     <span className="ml-auto font-semibold">{s.count}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* By Priority — Bar */}
//             <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//               <SectionHeader title="By Priority" />
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart data={data.breakdown.byPriority} barSize={28}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                   <XAxis dataKey="priority" tick={{ fontSize:10, fill:"#94a3b8" }} />
//                   <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} />
//                   <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }} />
//                   <Bar dataKey="count" name="Tickets" radius={[6,6,0,0]}>
//                     {data.breakdown.byPriority.map((entry, i) => (
//                       <Cell key={i} fill={PRIORITY_COLORS[entry.priority] ?? CHART_COLORS[i]} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             {/* By Category — Horizontal Bar */}
//             <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//               <SectionHeader title="By Category" />
//               {data.breakdown.byCategory.length === 0 ? (
//                 <p className="text-xs text-slate-400 mt-6">No category data</p>
//               ) : (
//                 <div className="space-y-2.5 mt-1">
//                   {data.breakdown.byCategory.slice(0,8).map((c, i) => {
//                     const max = data.breakdown.byCategory[0]?.count || 1;
//                     return (
//                       <div key={c.category}>
//                         <div className="flex items-center justify-between text-xs mb-1">
//                           <span className="text-slate-700 truncate capitalize">{c.category}</span>
//                           <span className="font-semibold text-slate-800 ml-2">{c.count}</span>
//                         </div>
//                         <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                           <div className="h-full rounded-full transition-all"
//                             style={{
//                               width: `${(c.count/max)*100}%`,
//                               background: CHART_COLORS[i % CHART_COLORS.length],
//                             }} />
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ══ SECTION 4: PRIORITY RESOLUTION TIME ══ */}
//           <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//             <SectionHeader title="Priority Resolution Time" sub="Average hours to resolve tickets by priority" />
//             {data.breakdown.priorityResolutionTime.length === 0 ? (
//               <p className="text-xs text-slate-400">No data available</p>
//             ) : (
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart data={data.breakdown.priorityResolutionTime} barSize={40}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                   <XAxis dataKey="priority" tick={{ fontSize:10, fill:"#94a3b8" }} />
//                   <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} unit="h" />
//                   <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }}
//                     formatter={(v:any) => [`${v}h`, "Avg resolution"]} />
//                   <Bar dataKey="avgHours" name="Avg Hours" radius={[6,6,0,0]}>
//                     {data.breakdown.priorityResolutionTime.map((e, i) => (
//                       <Cell key={i} fill={PRIORITY_COLORS[e.priority] ?? CHART_COLORS[i]} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           {/* ══ SECTION 5: TECHNICIAN PERFORMANCE ══ */}
//           {data.technicians.length > 0 && (
//             <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
//               <div className="px-5 pt-5 pb-3">
//                 <SectionHeader title="Technician Performance" sub="Ranked by tickets resolved" />
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="bg-slate-50 border-y border-slate-100">
//                       {["#","Technician","Assigned","Resolved","Resolution Rate","Avg Time","Rating"].map(h => (
//                         <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100">
//                     {data.technicians.map((t, i) => (
//                       <tr key={t._id} className="hover:bg-slate-50 transition">
//                         <td className="px-4 py-3 text-xs font-bold text-slate-400">#{i+1}</td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
//                               {t.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
//                             </div>
//                             <div>
//                               <p className="text-sm font-semibold text-slate-800">{t.name}</p>
//                               <p className="text-[10px] text-slate-400">{t.employeeId}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-sm font-semibold text-slate-700">{t.assigned}</td>
//                         <td className="px-4 py-3 text-sm font-semibold text-green-600">{t.resolved}</td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="flex-1 h-1.5 bg-slate-200 rounded-full max-w-[80px]">
//                               <div className="h-full bg-green-500 rounded-full"
//                                 style={{ width: `${Math.min(t.resolutionRate,100)}%` }} />
//                             </div>
//                             <span className="text-xs font-semibold text-slate-700">
//                               {Math.round(t.resolutionRate)}%
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-xs text-slate-600">{t.avgResHours}h</td>
//                         <td className="px-4 py-3">
//                           <span className="flex items-center gap-1 text-xs font-semibold">
//                             <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
//                             {t.rating?.toFixed(1) ?? "—"}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* ══ SECTION 6: SERVICE CENTER PERFORMANCE ══ */}
//           {data.serviceCenters.length > 0 && (
//             <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
//               <div className="px-5 pt-5 pb-3">
//                 <SectionHeader title="Service Center Performance" sub="Ranked by total tickets handled" />
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="bg-slate-50 border-y border-slate-100">
//                       {["#","Service Center","Total","Resolved","Open","Resolution Rate"].map(h => (
//                         <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100">
//                     {data.serviceCenters.map((sc, i) => (
//                       <tr key={sc._id} className="hover:bg-slate-50 transition">
//                         <td className="px-4 py-3 text-xs font-bold text-slate-400">#{i+1}</td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
//                               <Building2 className="w-4 h-4" />
//                             </div>
//                             <div>
//                               <p className="text-sm font-semibold text-slate-800">{sc.name}</p>
//                               <p className="text-[10px] font-mono text-slate-400">{sc.code}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-sm font-semibold text-slate-700">{sc.total}</td>
//                         <td className="px-4 py-3 text-sm font-semibold text-green-600">{sc.resolved}</td>
//                         <td className="px-4 py-3 text-sm font-semibold text-blue-600">{sc.open}</td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="flex-1 h-1.5 bg-slate-200 rounded-full max-w-[80px]">
//                               <div className="h-full bg-teal-500 rounded-full"
//                                 style={{ width: `${Math.min(sc.resolutionRate,100)}%` }} />
//                             </div>
//                             <span className="text-xs font-semibold text-slate-700">{sc.resolutionRate}%</span>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* ══ SECTION 7: BRAND BREAKDOWN (admin only) ══ */}
//           {data.brands.length > 0 && (
//             <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//               <SectionHeader title="Brand Breakdown" sub="Ticket distribution across all brands" />
//               <ResponsiveContainer width="100%" height={240}>
//                 <BarChart data={data.brands} barSize={32}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                   <XAxis dataKey="_id" tick={{ fontSize:10, fill:"#94a3b8" }} />
//                   <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} />
//                   <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }} />
//                   <Legend wrapperStyle={{ fontSize:11 }} />
//                   <Bar dataKey="total"    name="Total"    fill="#6366f1" radius={[4,4,0,0]} />
//                   <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[4,4,0,0]} />
//                   <Bar dataKey="open"     name="Open"     fill="#f59e0b" radius={[4,4,0,0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           )}

//           {/* ══ SECTION 8: TOP FAULTS ══ */}
//           {data.topFaults.length > 0 && (
//             <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//               <SectionHeader title="Top Reported Faults" sub="Most common fault types in this period" />
//               <div className="space-y-3">
//                 {data.topFaults.map((f, i) => {
//                   const max = data.topFaults[0]?.count || 1;
//                   return (
//                     <div key={f._id} className="flex items-center gap-3">
//                       <span className="text-xs font-bold text-slate-400 w-5 text-right">#{i+1}</span>
//                       <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center justify-between text-xs mb-1">
//                           <span className="text-slate-700 font-medium truncate">{f._id}</span>
//                           <span className="ml-2 font-bold text-slate-800 shrink-0">{f.count}</span>
//                         </div>
//                         <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                           <div className="h-full rounded-full bg-amber-400 transition-all"
//                             style={{ width: `${(f.count/max)*100}%` }} />
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* ══ SECTION 9: SLA DETAIL ══ */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//               <div className="flex items-center gap-2 mb-3">
//                 <AlertTriangle className="w-4 h-4 text-red-500" />
//                 <p className="text-sm font-semibold text-slate-800">SLA Breaches</p>
//               </div>
//               <p className="text-3xl font-bold text-red-600">{data.sla.breached}</p>
//               <p className="text-xs text-slate-400 mt-1">Resolution SLA breached</p>
//               <p className="text-[10px] text-red-400 mt-0.5">{data.sla.breachRate}% breach rate</p>
//             </div>
//             <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//               <div className="flex items-center gap-2 mb-3">
//                 <Clock className="w-4 h-4 text-amber-500" />
//                 <p className="text-sm font-semibold text-slate-800">Response Breaches</p>
//               </div>
//               <p className="text-3xl font-bold text-amber-600">{data.sla.responseBreached}</p>
//               <p className="text-xs text-slate-400 mt-1">Response SLA breached</p>
//             </div>
//             <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//               <div className="flex items-center gap-2 mb-3">
//                 <Users className="w-4 h-4 text-blue-500" />
//                 <p className="text-sm font-semibold text-slate-800">Repeat Customers</p>
//               </div>
//               <p className="text-3xl font-bold text-blue-600">{data.customers.repeatCustomers}</p>
//               <p className="text-xs text-slate-400 mt-1">
//                 Avg {data.customers.avgPerCustomer?.toFixed(1)} tickets/customer
//               </p>
//             </div>
//           </div>

//         </>
//       )}
//     </div>
//   );
// }


"use client";

// app/(dashboard)/dashboard/reports/page.tsx  — REPLACE existing placeholder

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Download, RefreshCw, Calendar, TrendingUp, TrendingDown,
  Ticket, Users, Building2, Wrench, CheckCircle2, AlertTriangle,
  Clock, Star, Zap, Package, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import TicketExportTable from "@/components/reports/TicketExportTable";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface ReportData {
  period: string;
  dateRange: { start: string; end: string };
  overview: {
    totalTickets: number; prevTotal: number; ticketGrowth: number;
    openTickets: number; resolvedTickets: number; closedTickets: number;
    cancelledTickets: number; inProgressTickets: number;
    resolutionRate: number; avgResolutionHours: number;
  };
  sla: { breached: number; responseBreached: number; breachRate: number };
  breakdown: {
    byStatus: { status: string; count: number }[];
    byPriority: { priority: string; count: number }[];
    byCategory: { category: string; count: number }[];
    priorityResolutionTime: { priority: string; avgHours: number; count: number }[];
  };
  trends: { date: string; created: number; resolved: number; open: number }[];
  technicians: {
    _id: string; name: string; employeeId: string;
    assigned: number; resolved: number; resolutionRate: number;
    avgResHours: number; rating: number;
  }[];
  serviceCenters: {
    _id: string; name: string; code: string;
    total: number; resolved: number; open: number; resolutionRate: number;
  }[];
  brands: { _id: string; total: number; resolved: number; open: number }[];
  customers: { uniqueCustomers: number; repeatCustomers: number; avgPerCustomer: number };
  topFaults: { _id: string; count: number }[];
}

/* ─── Constants ──────────────────────────────────────────────────────────── */
const PERIODS = [
  { label: "This Week", value: "weekly" },
  { label: "This Month", value: "monthly" },
  { label: "This Year", value: "yearly" },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "#22c55e", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};
const STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6", in_progress: "#f59e0b", resolved: "#22c55e",
  closed: "#64748b", cancelled: "#ef4444",
};
const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const fmtDateRange = (s: string, e: string) =>
  `${new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} — ${new Date(e).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

/* ─── Subcomponents ──────────────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon, trend, color = "indigo",
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; trend?: number; color?: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("manager");
  const [exporting, setExporting] = useState(false);

  /* ── Fetch role ── */
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(d => setUserRole(d?.data?.role ?? d?.user?.role ?? "manager"))
      .catch(() => { });
  }, []);

  /* ── Fetch report ── */
  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?period=${period}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed");
      setData(json.data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  /* ── CSV Export ── */
  const handleExport = async () => {
    if (!data) return;
    setExporting(true);
    try {
      // Build CSV from trend data
      const rows = [
        ["Date", "Created", "Resolved", "Open"],
        ...data.trends.map(t => [t.date, t.created, t.resolved, t.open]),
      ];
      const csv = rows.map(r => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported");
    } finally {
      setExporting(false);
    }
  };

  const o = data?.overview;

  /* ─── Skeleton ── */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-16 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />)}
        </div>
        <div className="h-72 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports & Analytics</h1>
          {data && (
            <p className="text-xs text-slate-400 mt-0.5">
              {fmtDateRange(data.dateRange.start, data.dateRange.end)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period picker */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-medium bg-white">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-3 py-2 cursor-pointer transition ${period === p.value ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={fetchReport}
            className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer bg-white">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={handleExport} disabled={exporting || !data}
            className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium cursor-pointer disabled:opacity-60">
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* ══ SECTION 1: OVERVIEW STATS ══ */}
          <div>
            <SectionHeader title="Overview" sub="Key metrics for the selected period" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard label="Total Tickets" value={fmt(o!.totalTickets)}
                icon={<Ticket className="w-5 h-5" />} trend={o!.ticketGrowth} color="indigo" />
              <StatCard label="Open" value={fmt(o!.openTickets)}
                icon={<Zap className="w-5 h-5" />} color="blue" />
              <StatCard label="In Progress" value={fmt(o!.inProgressTickets)}
                icon={<Clock className="w-5 h-5" />} color="amber" />
              <StatCard label="Resolved" value={fmt(o!.resolvedTickets)}
                icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
              <StatCard label="Resolution Rate" value={`${o!.resolutionRate}%`}
                icon={<TrendingUp className="w-5 h-5" />} color="green"
                sub={`${o!.resolvedTickets + o!.closedTickets} of ${o!.totalTickets} tickets`} />
              <StatCard label="Avg Resolution" value={`${o!.avgResolutionHours}h`}
                icon={<Clock className="w-5 h-5" />} color="indigo" />
              <StatCard label="SLA Breached" value={data.sla.breached}
                icon={<AlertTriangle className="w-5 h-5" />} color="red"
                sub={`${data.sla.breachRate}% breach rate`} />
              <StatCard label="Unique Customers" value={fmt(data.customers.uniqueCustomers)}
                icon={<Users className="w-5 h-5" />} color="blue"
                sub={`${data.customers.repeatCustomers} repeat customers`} />
            </div>
          </div>
          <div>
            <TicketExportTable period={period} />
          </div>
          {/* ══ SECTION 2: TREND LINE CHART ══ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <SectionHeader title="Ticket Trends" sub="Created vs resolved over time" />
            {data.trends.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No trend data</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.trends} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={d => period === "yearly" ? d : fmtDate(d)} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 11 }}
                    labelFormatter={d => period === "yearly" ? d : fmtDate(d)}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="created" name="Created" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="open" name="Open" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ══ SECTION 3: BREAKDOWN CHARTS ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* By Status — Pie */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <SectionHeader title="By Status" />
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.breakdown.byStatus.filter(s => s.count > 0)}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    label={false}
                    labelLine={false}
                  >
                    {data.breakdown.byStatus
                      .filter(s => s.count > 0)
                      .map((entry, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={STATUS_COLORS[entry.status] ?? CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 10, fontSize: 11 }}
                    formatter={(value: any, name: any) => [
                      value,
                      String(name).replace(/_/g, " "),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {data.breakdown.byStatus.map(s => (
                  <div key={s.status} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                    <span className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: STATUS_COLORS[s.status] ?? "#64748b" }} />
                    <span className="capitalize">{s.status.replace("_", " ")}</span>
                    <span className="ml-auto font-semibold">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Priority — Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <SectionHeader title="By Priority" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.breakdown.byPriority} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="priority" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                  <Bar dataKey="count" name="Tickets" radius={[6, 6, 0, 0]}>
                    {data.breakdown.byPriority.map((entry, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[entry.priority] ?? CHART_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* By Category — Horizontal Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <SectionHeader title="By Category" />
              {data.breakdown.byCategory.length === 0 ? (
                <p className="text-xs text-slate-400 mt-6">No category data</p>
              ) : (
                <div className="space-y-2.5 mt-1">
                  {data.breakdown.byCategory.slice(0, 8).map((c, i) => {
                    const max = data.breakdown.byCategory[0]?.count || 1;
                    return (
                      <div key={c.category}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-700 truncate capitalize">{c.category}</span>
                          <span className="font-semibold text-slate-800 ml-2">{c.count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${(c.count / max) * 100}%`,
                              background: CHART_COLORS[i % CHART_COLORS.length],
                            }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ══ SECTION 4: PRIORITY RESOLUTION TIME ══ */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <SectionHeader title="Priority Resolution Time" sub="Average hours to resolve tickets by priority" />
            {data.breakdown.priorityResolutionTime.length === 0 ? (
              <p className="text-xs text-slate-400">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.breakdown.priorityResolutionTime} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="priority" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} unit="h" />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }}
                    formatter={(v: any) => [`${v}h`, "Avg resolution"]} />
                  <Bar dataKey="avgHours" name="Avg Hours" radius={[6, 6, 0, 0]}>
                    {data.breakdown.priorityResolutionTime.map((e, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[e.priority] ?? CHART_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ══ SECTION 5: TECHNICIAN PERFORMANCE ══ */}
          {data.technicians.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <SectionHeader title="Technician Performance" sub="Ranked by tickets resolved" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      {["#", "Technician", "Assigned", "Resolved", "Resolution Rate", "Avg Time", "Rating"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.technicians.map((t, i) => (
                      <tr key={t._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-xs font-bold text-slate-400">#{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {t.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                              <p className="text-[10px] text-slate-400">{t.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">{t.assigned}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">{t.resolved}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full max-w-[80px]">
                              <div className="h-full bg-green-500 rounded-full"
                                style={{ width: `${Math.min(t.resolutionRate, 100)}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">
                              {Math.round(t.resolutionRate)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">{t.avgResHours}h</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            {t.rating?.toFixed(1) ?? "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ SECTION 6: SERVICE CENTER PERFORMANCE ══ */}
          {data.serviceCenters.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <SectionHeader title="Service Center Performance" sub="Ranked by total tickets handled" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      {["#", "Service Center", "Total", "Resolved", "Open", "Resolution Rate"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.serviceCenters.map((sc, i) => (
                      <tr key={sc._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-xs font-bold text-slate-400">#{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{sc.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{sc.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">{sc.total}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">{sc.resolved}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-blue-600">{sc.open}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full max-w-[80px]">
                              <div className="h-full bg-teal-500 rounded-full"
                                style={{ width: `${Math.min(sc.resolutionRate, 100)}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{sc.resolutionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ SECTION 7: BRAND BREAKDOWN (admin only) ══ */}
          {data.brands.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <SectionHeader title="Brand Breakdown" sub="Ticket distribution across all brands" />
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.brands} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="open" name="Open" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ══ SECTION 8: TOP FAULTS ══ */}
          {data.topFaults.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <SectionHeader title="Top Reported Faults" sub="Most common fault types in this period" />
              <div className="space-y-3">
                {data.topFaults.map((f, i) => {
                  const max = data.topFaults[0]?.count || 1;
                  return (
                    <div key={f._id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-5 text-right">#{i + 1}</span>
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-700 font-medium truncate">{f._id}</span>
                          <span className="ml-2 font-bold text-slate-800 shrink-0">{f.count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400 transition-all"
                            style={{ width: `${(f.count / max) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ SECTION 9: SLA DETAIL ══ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-slate-800">SLA Breaches</p>
              </div>
              <p className="text-3xl font-bold text-red-600">{data.sla.breached}</p>
              <p className="text-xs text-slate-400 mt-1">Resolution SLA breached</p>
              <p className="text-[10px] text-red-400 mt-0.5">{data.sla.breachRate}% breach rate</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-semibold text-slate-800">Response Breaches</p>
              </div>
              <p className="text-3xl font-bold text-amber-600">{data.sla.responseBreached}</p>
              <p className="text-xs text-slate-400 mt-1">Response SLA breached</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-semibold text-slate-800">Repeat Customers</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{data.customers.repeatCustomers}</p>
              <p className="text-xs text-slate-400 mt-1">
                Avg {data.customers.avgPerCustomer?.toFixed(1)} tickets/customer
              </p>
            </div>
          </div>

        </>
      )}
    </div>
  );
}