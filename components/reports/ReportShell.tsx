// "use client";

// // components/reports/ReportShell.tsx  — NEW SHARED COMPONENT
// // Used by brand, SC, and technician report pages
// // All call /api/reports?period=X — backend scopes data by JWT role automatically

// import { useState, useEffect, useCallback } from "react";
// import {
//   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Download, RefreshCw, TrendingUp, TrendingDown,
//   Ticket, CheckCircle2, AlertTriangle, Clock,
//   Star, Zap, Building2, Wrench, Users,
// } from "lucide-react";
// import toast from "react-hot-toast";

// /* ─── Types ──────────────────────────────────────────────────────────────── */
// export type ReportRole = "brand" | "service_center" | "technician";

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
//   customers: { uniqueCustomers: number; repeatCustomers: number; avgPerCustomer: number };
//   topFaults: { _id: string; count: number }[];
// }

// /* ─── Config ─────────────────────────────────────────────────────────────── */
// const PERIODS = [
//   { label: "Weekly",  value: "weekly"  },
//   { label: "Monthly", value: "monthly" },
//   { label: "Yearly",  value: "yearly"  },
// ];

// const PRIORITY_COLORS: Record<string, string> = {
//   low: "#22c55e", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
// };
// const STATUS_COLORS: Record<string, string> = {
//   open: "#3b82f6", in_progress: "#f59e0b", resolved: "#22c55e",
//   closed: "#64748b", cancelled: "#ef4444", pending_parts: "#f97316",
// };
// const CHART_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

// const fmtDate = (d: string) =>
//   new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// const fmtRange = (s: string, e: string) =>
//   `${new Date(s).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })} — ${new Date(e).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}`;

// /* ─── Sub-components ─────────────────────────────────────────────────────── */
// function KPICard({
//   label, value, sub, icon, trend, color = "indigo",
// }: {
//   label: string; value: string | number; sub?: string;
//   icon: React.ReactNode; trend?: number; color?: string;
// }) {
//   const bg: Record<string, string> = {
//     indigo: "bg-indigo-50 text-indigo-600",
//     green:  "bg-green-50 text-green-600",
//     amber:  "bg-amber-50 text-amber-600",
//     red:    "bg-red-50 text-red-600",
//     blue:   "bg-blue-50 text-blue-600",
//     teal:   "bg-teal-50 text-teal-600",
//   };
//   return (
//     <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col gap-3">
//       <div className="flex items-center justify-between">
//         <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg[color]}`}>
//           {icon}
//         </div>
//         {trend !== undefined && (
//           <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
//             trend >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
//           }`}>
//             {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//             {Math.abs(trend)}%
//           </span>
//         )}
//       </div>
//       <div>
//         <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
//         <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
//         {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
//       </div>
//     </div>
//   );
// }

// function Section({ title, sub, children }: {
//   title: string; sub?: string; children: React.ReactNode;
// }) {
//   return (
//     <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//       <div className="mb-4">
//         <h2 className="text-sm font-bold text-slate-800">{title}</h2>
//         {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
//       </div>
//       {children}
//     </div>
//   );
// }

// /* ─── Main exported component ────────────────────────────────────────────── */
// export default function ReportShell({
//   role,
//   title,
//   subtitle,
//   accentColor = "indigo",
// }: {
//   role: ReportRole;
//   title: string;
//   subtitle: string;
//   accentColor?: string;
// }) {
//   const [period,    setPeriod]    = useState("monthly");
//   const [data,      setData]      = useState<ReportData | null>(null);
//   const [loading,   setLoading]   = useState(true);
//   const [exporting, setExporting] = useState(false);

//   const fetchReport = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res  = await fetch(`/api/reports?period=${period}`, { credentials: "include" });
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.message ?? "Failed to load report");
//       setData(json.data);
//     } catch (e: any) {
//       toast.error(e.message || "Failed to load report");
//     } finally {
//       setLoading(false);
//     }
//   }, [period]);

//   useEffect(() => { fetchReport(); }, [fetchReport]);

//   /* ── CSV export ── */
//   const handleExport = () => {
//     if (!data) return;
//     setExporting(true);
//     try {
//       const rows = [
//         ["Date","Created","Resolved","Open"],
//         ...data.trends.map(t => [t.date, t.created, t.resolved, t.open]),
//       ];
//       const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
//       const a    = Object.assign(document.createElement("a"), {
//         href:     URL.createObjectURL(blob),
//         download: `${role}-report-${period}-${new Date().toISOString().slice(0,10)}.csv`,
//       });
//       a.click();
//       URL.revokeObjectURL(a.href);
//       toast.success("Report exported");
//     } finally {
//       setExporting(false);
//     }
//   };

//   const o = data?.overview;

//   /* ── Skeleton ── */
//   if (loading) {
//     return (
//       <div className="space-y-5 animate-pulse">
//         <div className="h-14 bg-white rounded-2xl border border-slate-200" />
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           {Array(8).fill(0).map((_,i) => (
//             <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
//           ))}
//         </div>
//         <div className="h-64 bg-white rounded-2xl border border-slate-200" />
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//           {Array(4).fill(0).map((_,i) => (
//             <div key={i} className="h-52 bg-white rounded-2xl border border-slate-200" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-5 pb-10">

//       {/* ── Header ── */}
//       <div className="flex items-center justify-between flex-wrap gap-3">
//         <div>
//           <h1 className="text-xl font-bold text-slate-800">{title}</h1>
//           <p className="text-xs text-slate-400 mt-0.5">
//             {data ? fmtRange(data.dateRange.start, data.dateRange.end) : subtitle}
//           </p>
//         </div>
//         <div className="flex items-center gap-2 flex-wrap">
//           {/* Period tabs */}
//           <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white text-xs font-medium">
//             {PERIODS.map(p => (
//               <button key={p.value} onClick={() => setPeriod(p.value)}
//                 className={`px-3 py-2 cursor-pointer transition ${
//                   period === p.value
//                     ? `bg-${accentColor}-600 text-white`
//                     : "text-slate-600 hover:bg-slate-50"
//                 } ${period === p.value ? "bg-indigo-600" : ""}`}
//                 style={period === p.value ? { backgroundColor: "#4f46e5" } : {}}>
//                 {p.label}
//               </button>
//             ))}
//           </div>
//           <button onClick={fetchReport}
//             className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer bg-white">
//             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
//           </button>
//           <button onClick={handleExport} disabled={!data || exporting}
//             className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium cursor-pointer disabled:opacity-60 transition">
//             <Download className="w-3.5 h-3.5" />
//             {exporting ? "Exporting..." : "Export CSV"}
//           </button>
//         </div>
//       </div>

//       {data && (
//         <>
//           {/* ══ KPI GRID ══ */}
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//             <KPICard label="Total Tickets"   value={o!.totalTickets}
//               icon={<Ticket className="w-4 h-4"/>}      trend={o!.ticketGrowth}  color="indigo" />
//             <KPICard label="Open"            value={o!.openTickets}
//               icon={<Zap className="w-4 h-4"/>}         color="blue" />
//             <KPICard label="In Progress"     value={o!.inProgressTickets}
//               icon={<Clock className="w-4 h-4"/>}       color="amber" />
//             <KPICard label="Resolved"        value={o!.resolvedTickets}
//               icon={<CheckCircle2 className="w-4 h-4"/>}color="green" />
//             <KPICard label="Resolution Rate" value={`${o!.resolutionRate}%`}
//               icon={<TrendingUp className="w-4 h-4"/>}  color="green"
//               sub={`${o!.resolvedTickets + o!.closedTickets} closed of ${o!.totalTickets}`} />
//             <KPICard label="Avg Resolution"  value={`${o!.avgResolutionHours}h`}
//               icon={<Clock className="w-4 h-4"/>}       color="indigo" />
//             <KPICard label="SLA Breached"    value={data.sla.breached}
//               icon={<AlertTriangle className="w-4 h-4"/>} color="red"
//               sub={`${data.sla.breachRate}% breach rate`} />
//             <KPICard label="Cancelled"       value={o!.cancelledTickets}
//               icon={<AlertTriangle className="w-4 h-4"/>} color="amber" />
//           </div>

//           {/* ══ TREND CHART ══ */}
//           <Section title="Ticket Trends" sub="Created vs resolved over selected period">
//             {data.trends.length === 0 ? (
//               <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
//                 No trend data for this period
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height={240}>
//                 <LineChart data={data.trends} margin={{ top:4, right:16, bottom:0, left:0 }}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                   <XAxis dataKey="date" tick={{ fontSize:10, fill:"#94a3b8" }}
//                     tickFormatter={d => period === "yearly" ? d : fmtDate(d)} />
//                   <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} />
//                   <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #e2e8f0", fontSize:11 }}
//                     labelFormatter={d => period === "yearly" ? d : fmtDate(d)} />
//                   <Legend wrapperStyle={{ fontSize:11 }} />
//                   <Line type="monotone" dataKey="created"  name="Created"  stroke="#6366f1" strokeWidth={2} dot={false} />
//                   <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" strokeWidth={2} dot={false} />
//                   <Line type="monotone" dataKey="open"     name="Open"     stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </Section>

//           {/* ══ BREAKDOWN ROW ══ */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

//             {/* By Status */}
//             <Section title="By Status">
//               <div className="space-y-2">
//                 {data.breakdown.byStatus.map(s => {
//                   const total = data.overview.totalTickets || 1;
//                   const pct   = Math.round((s.count / total) * 100);
//                   return (
//                     <div key={s.status}>
//                       <div className="flex items-center justify-between text-xs mb-1">
//                         <span className="capitalize text-slate-600">{s.status.replace(/_/g," ")}</span>
//                         <span className="font-semibold text-slate-800">{s.count} <span className="text-slate-400">({pct}%)</span></span>
//                       </div>
//                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
//                         <div className="h-full rounded-full transition-all"
//                           style={{ width: `${pct}%`, background: STATUS_COLORS[s.status] ?? "#64748b" }} />
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </Section>

//             {/* By Priority */}
//             <Section title="By Priority">
//               <ResponsiveContainer width="100%" height={180}>
//                 <BarChart data={data.breakdown.byPriority} barSize={32}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                   <XAxis dataKey="priority" tick={{ fontSize:10, fill:"#94a3b8" }} />
//                   <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} />
//                   <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }} />
//                   <Bar dataKey="count" name="Tickets" radius={[6,6,0,0]}>
//                     {data.breakdown.byPriority.map((e,i) => (
//                       <Cell key={i} fill={PRIORITY_COLORS[e.priority] ?? CHART_COLORS[i]} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </Section>

//             {/* By Category */}
//             <Section title="By Category">
//               {data.breakdown.byCategory.length === 0 ? (
//                 <p className="text-xs text-slate-400 mt-4">No category data</p>
//               ) : (
//                 <div className="space-y-2.5">
//                   {data.breakdown.byCategory.slice(0,7).map((c,i) => {
//                     const max = data.breakdown.byCategory[0]?.count || 1;
//                     return (
//                       <div key={c.category}>
//                         <div className="flex items-center justify-between text-xs mb-1">
//                           <span className="text-slate-600 truncate capitalize">{c.category}</span>
//                           <span className="font-semibold text-slate-800 ml-2">{c.count}</span>
//                         </div>
//                         <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                           <div className="h-full rounded-full transition-all"
//                             style={{ width:`${(c.count/max)*100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </Section>
//           </div>

//           {/* ══ PRIORITY RESOLUTION TIME ══ */}
//           {data.breakdown.priorityResolutionTime.length > 0 && (
//             <Section title="Resolution Time by Priority" sub="Average hours to close a ticket per priority level">
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart data={data.breakdown.priorityResolutionTime} barSize={40}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//                   <XAxis dataKey="priority" tick={{ fontSize:10, fill:"#94a3b8" }} />
//                   <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} unit="h" />
//                   <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }}
//                     formatter={(v:any) => [`${v}h`, "Avg resolution"]} />
//                   <Bar dataKey="avgHours" radius={[6,6,0,0]}>
//                     {data.breakdown.priorityResolutionTime.map((e,i) => (
//                       <Cell key={i} fill={PRIORITY_COLORS[e.priority] ?? CHART_COLORS[i]} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </Section>
//           )}

//           {/* ══ TECHNICIAN TABLE (brand + SC) ══ */}
//           {role !== "technician" && data.technicians.length > 0 && (
//             <Section title="Technician Performance" sub="Ranked by tickets resolved">
//               <div className="overflow-x-auto -mx-5">
//                 <table className="w-full border-collapse min-w-[600px]">
//                   <thead>
//                     <tr className="bg-slate-50 border-y border-slate-100">
//                       {["#","Name","Assigned","Resolved","Rate","Avg Time","Rating"].map(h => (
//                         <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100">
//                     {data.technicians.map((t,i) => (
//                       <tr key={t._id} className="hover:bg-slate-50 transition">
//                         <td className="px-4 py-3 text-xs font-bold text-slate-400">#{i+1}</td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
//                               {t.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
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
//                             <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
//                               <div className="h-full bg-green-500 rounded-full"
//                                 style={{ width:`${Math.min(t.resolutionRate,100)}%` }} />
//                             </div>
//                             <span className="text-xs font-semibold text-slate-700">{Math.round(t.resolutionRate)}%</span>
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
//             </Section>
//           )}

//           {/* ══ SERVICE CENTER TABLE (brand only) ══ */}
//           {role === "brand" && data.serviceCenters.length > 0 && (
//             <Section title="Service Center Performance" sub="All SCs in your brand">
//               <div className="overflow-x-auto -mx-5">
//                 <table className="w-full border-collapse min-w-[500px]">
//                   <thead>
//                     <tr className="bg-slate-50 border-y border-slate-100">
//                       {["#","Service Center","Total","Resolved","Open","Rate"].map(h => (
//                         <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100">
//                     {data.serviceCenters.map((sc,i) => (
//                       <tr key={sc._id} className="hover:bg-slate-50 transition">
//                         <td className="px-4 py-3 text-xs font-bold text-slate-400">#{i+1}</td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <div className="w-7 h-7 rounded-xl bg-teal-100 flex items-center justify-center">
//                               <Building2 className="w-3.5 h-3.5 text-teal-600" />
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
//                             <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
//                               <div className="h-full bg-teal-500 rounded-full"
//                                 style={{ width:`${Math.min(sc.resolutionRate,100)}%` }} />
//                             </div>
//                             <span className="text-xs font-semibold text-slate-700">{sc.resolutionRate}%</span>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </Section>
//           )}

//           {/* ══ TECHNICIAN SELF VIEW (technician role only) ══ */}
//           {role === "technician" && (
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//                 <div className="flex items-center gap-2 mb-3">
//                   <Wrench className="w-4 h-4 text-indigo-500" />
//                   <p className="text-sm font-semibold text-slate-800">My Jobs</p>
//                 </div>
//                 <p className="text-3xl font-bold text-indigo-600">{o!.totalTickets}</p>
//                 <p className="text-xs text-slate-400 mt-1">Assigned this period</p>
//               </div>
//               <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//                 <div className="flex items-center gap-2 mb-3">
//                   <CheckCircle2 className="w-4 h-4 text-green-500" />
//                   <p className="text-sm font-semibold text-slate-800">Completed</p>
//                 </div>
//                 <p className="text-3xl font-bold text-green-600">{o!.resolvedTickets + o!.closedTickets}</p>
//                 <p className="text-xs text-slate-400 mt-1">{o!.resolutionRate}% resolution rate</p>
//               </div>
//               <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
//                 <div className="flex items-center gap-2 mb-3">
//                   <Clock className="w-4 h-4 text-amber-500" />
//                   <p className="text-sm font-semibold text-slate-800">Avg Time</p>
//                 </div>
//                 <p className="text-3xl font-bold text-amber-600">{o!.avgResolutionHours}h</p>
//                 <p className="text-xs text-slate-400 mt-1">Per ticket resolution</p>
//               </div>
//             </div>
//           )}

//           {/* ══ TOP FAULTS ══ */}
//           {data.topFaults.length > 0 && (
//             <Section title="Top Reported Faults" sub="Most common issues in this period">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {data.topFaults.slice(0,8).map((f,i) => {
//                   const max = data.topFaults[0]?.count || 1;
//                   return (
//                     <div key={f._id} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
//                       <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">#{i+1}</span>
//                       <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
//                       <div className="flex-1 min-w-0">
//                         <p className="text-xs font-semibold text-slate-700 truncate">{f._id}</p>
//                         <div className="h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
//                           <div className="h-full bg-amber-400 rounded-full"
//                             style={{ width:`${(f.count/max)*100}%` }} />
//                         </div>
//                       </div>
//                       <span className="text-xs font-bold text-slate-700 shrink-0">{f.count}</span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </Section>
//           )}

//           {/* ══ SLA + CUSTOMERS ══ */}
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//             <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
//               <p className="text-xs text-slate-500 mb-1">SLA Breaches</p>
//               <p className="text-2xl font-bold text-red-600">{data.sla.breached}</p>
//               <p className="text-[10px] text-slate-400">{data.sla.breachRate}% breach rate</p>
//             </div>
//             <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
//               <p className="text-xs text-slate-500 mb-1">Response Breaches</p>
//               <p className="text-2xl font-bold text-amber-600">{data.sla.responseBreached}</p>
//               <p className="text-[10px] text-slate-400">First response SLA</p>
//             </div>
//             {role !== "technician" && (
//               <>
//                 <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
//                   <p className="text-xs text-slate-500 mb-1">Unique Customers</p>
//                   <p className="text-2xl font-bold text-blue-600">{data.customers.uniqueCustomers}</p>
//                   <p className="text-[10px] text-slate-400">This period</p>
//                 </div>
//                 <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
//                   <p className="text-xs text-slate-500 mb-1">Repeat Customers</p>
//                   <p className="text-2xl font-bold text-indigo-600">{data.customers.repeatCustomers}</p>
//                   <p className="text-[10px] text-slate-400">Avg {data.customers.avgPerCustomer?.toFixed(1)} tickets each</p>
//                 </div>
//               </>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

"use client";

// components/reports/ReportShell.tsx  — NEW SHARED COMPONENT
// Used by brand, SC, and technician report pages
// All call /api/reports?period=X — backend scopes data by JWT role automatically

import { useState, useEffect, useCallback } from "react";
import TicketExportTable from "@/components/reports/TicketExportTable";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download, RefreshCw, TrendingUp, TrendingDown,
  Ticket, CheckCircle2, AlertTriangle, Clock,
  Star, Zap, Building2, Wrench, Users,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export type ReportRole = "brand" | "service_center" | "technician";

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
    byStatus:   { status: string; count: number }[];
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
  customers: { uniqueCustomers: number; repeatCustomers: number; avgPerCustomer: number };
  topFaults: { _id: string; count: number }[];
}

/* ─── Config ─────────────────────────────────────────────────────────────── */
const PERIODS = [
  { label: "Weekly",  value: "weekly"  },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly",  value: "yearly"  },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "#22c55e", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};
const STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6", in_progress: "#f59e0b", resolved: "#22c55e",
  closed: "#64748b", cancelled: "#ef4444", pending_parts: "#f97316",
};
const CHART_COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const fmtRange = (s: string, e: string) =>
  `${new Date(s).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })} — ${new Date(e).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}`;

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function KPICard({
  label, value, sub, icon, trend, color = "indigo",
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; trend?: number; color?: string;
}) {
  const bg: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    green:  "bg-green-50 text-green-600",
    amber:  "bg-amber-50 text-amber-600",
    red:    "bg-red-50 text-red-600",
    blue:   "bg-blue-50 text-blue-600",
    teal:   "bg-teal-50 text-teal-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg[color]}`}>
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
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Section({ title, sub, children }: {
  title: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

/* ─── Main exported component ────────────────────────────────────────────── */
export default function ReportShell({
  role,
  title,
  subtitle,
  accentColor = "indigo",
}: {
  role: ReportRole;
  title: string;
  subtitle: string;
  accentColor?: string;
}) {
  const [period,    setPeriod]    = useState("monthly");
  const [data,      setData]      = useState<ReportData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/reports?period=${period}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to load report");
      setData(json.data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  /* ── CSV export ── */
  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    try {
      const rows = [
        ["Date","Created","Resolved","Open"],
        ...data.trends.map(t => [t.date, t.created, t.resolved, t.open]),
      ];
      const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
      const a    = Object.assign(document.createElement("a"), {
        href:     URL.createObjectURL(blob),
        download: `${role}-report-${period}-${new Date().toISOString().slice(0,10)}.csv`,
      });
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Report exported");
    } finally {
      setExporting(false);
    }
  };

  const o = data?.overview;

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-14 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_,i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_,i) => (
            <div key={i} className="h-52 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {data ? fmtRange(data.dateRange.start, data.dateRange.end) : subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period tabs */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-white text-xs font-medium">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-3 py-2 cursor-pointer transition ${
                  period === p.value
                    ? `bg-${accentColor}-600 text-white`
                    : "text-slate-600 hover:bg-slate-50"
                } ${period === p.value ? "bg-indigo-600" : ""}`}
                style={period === p.value ? { backgroundColor: "#4f46e5" } : {}}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={fetchReport}
            className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer bg-white">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={handleExport} disabled={!data || exporting}
            className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium cursor-pointer disabled:opacity-60 transition">
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* ══ KPI GRID ══ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <KPICard label="Total Tickets"   value={o!.totalTickets}
              icon={<Ticket className="w-4 h-4"/>}      trend={o!.ticketGrowth}  color="indigo" />
            <KPICard label="Open"            value={o!.openTickets}
              icon={<Zap className="w-4 h-4"/>}         color="blue" />
            <KPICard label="In Progress"     value={o!.inProgressTickets}
              icon={<Clock className="w-4 h-4"/>}       color="amber" />
            <KPICard label="Resolved"        value={o!.resolvedTickets}
              icon={<CheckCircle2 className="w-4 h-4"/>}color="green" />
            <KPICard label="Resolution Rate" value={`${o!.resolutionRate}%`}
              icon={<TrendingUp className="w-4 h-4"/>}  color="green"
              sub={`${o!.resolvedTickets + o!.closedTickets} closed of ${o!.totalTickets}`} />
            <KPICard label="Avg Resolution"  value={`${o!.avgResolutionHours}h`}
              icon={<Clock className="w-4 h-4"/>}       color="indigo" />
            <KPICard label="SLA Breached"    value={data.sla.breached}
              icon={<AlertTriangle className="w-4 h-4"/>} color="red"
              sub={`${data.sla.breachRate}% breach rate`} />
            <KPICard label="Cancelled"       value={o!.cancelledTickets}
              icon={<AlertTriangle className="w-4 h-4"/>} color="amber" />
          </div>

          {/* ══ TREND CHART ══ */}
          <Section title="Ticket Trends" sub="Created vs resolved over selected period">
            {data.trends.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                No trend data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.trends} margin={{ top:4, right:16, bottom:0, left:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize:10, fill:"#94a3b8" }}
                    tickFormatter={d => period === "yearly" ? d : fmtDate(d)} />
                  <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #e2e8f0", fontSize:11 }}
                    labelFormatter={d => period === "yearly" ? d : fmtDate(d)} />
                  <Legend wrapperStyle={{ fontSize:11 }} />
                  <Line type="monotone" dataKey="created"  name="Created"  stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="open"     name="Open"     stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Section>

          {/* ══ BREAKDOWN ROW ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* By Status */}
            <Section title="By Status">
              <div className="space-y-2">
                {data.breakdown.byStatus.map(s => {
                  const total = data.overview.totalTickets || 1;
                  const pct   = Math.round((s.count / total) * 100);
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="capitalize text-slate-600">{s.status.replace(/_/g," ")}</span>
                        <span className="font-semibold text-slate-800">{s.count} <span className="text-slate-400">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: STATUS_COLORS[s.status] ?? "#64748b" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* By Priority */}
            <Section title="By Priority">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.breakdown.byPriority} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="priority" tick={{ fontSize:10, fill:"#94a3b8" }} />
                  <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }} />
                  <Bar dataKey="count" name="Tickets" radius={[6,6,0,0]}>
                    {data.breakdown.byPriority.map((e,i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[e.priority] ?? CHART_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Section>

            {/* By Category */}
            <Section title="By Category">
              {data.breakdown.byCategory.length === 0 ? (
                <p className="text-xs text-slate-400 mt-4">No category data</p>
              ) : (
                <div className="space-y-2.5">
                  {data.breakdown.byCategory.slice(0,7).map((c,i) => {
                    const max = data.breakdown.byCategory[0]?.count || 1;
                    return (
                      <div key={c.category}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-600 truncate capitalize">{c.category}</span>
                          <span className="font-semibold text-slate-800 ml-2">{c.count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width:`${(c.count/max)*100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          </div>

          {/* ══ PRIORITY RESOLUTION TIME ══ */}
          {data.breakdown.priorityResolutionTime.length > 0 && (
            <Section title="Resolution Time by Priority" sub="Average hours to close a ticket per priority level">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.breakdown.priorityResolutionTime} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="priority" tick={{ fontSize:10, fill:"#94a3b8" }} />
                  <YAxis tick={{ fontSize:10, fill:"#94a3b8" }} unit="h" />
                  <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }}
                    formatter={(v:any) => [`${v}h`, "Avg resolution"]} />
                  <Bar dataKey="avgHours" radius={[6,6,0,0]}>
                    {data.breakdown.priorityResolutionTime.map((e,i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[e.priority] ?? CHART_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Section>
          )}

          {/* ══ TECHNICIAN TABLE (brand + SC) ══ */}
          {role !== "technician" && data.technicians.length > 0 && (
            <Section title="Technician Performance" sub="Ranked by tickets resolved">
              <div className="overflow-x-auto -mx-5">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      {["#","Name","Assigned","Resolved","Rate","Avg Time","Rating"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.technicians.map((t,i) => (
                      <tr key={t._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-xs font-bold text-slate-400">#{i+1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {t.name.split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
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
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full"
                                style={{ width:`${Math.min(t.resolutionRate,100)}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{Math.round(t.resolutionRate)}%</span>
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
            </Section>
          )}

          {/* ══ SERVICE CENTER TABLE (brand only) ══ */}
          {role === "brand" && data.serviceCenters.length > 0 && (
            <Section title="Service Center Performance" sub="All SCs in your brand">
              <div className="overflow-x-auto -mx-5">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100">
                      {["#","Service Center","Total","Resolved","Open","Rate"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.serviceCenters.map((sc,i) => (
                      <tr key={sc._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-xs font-bold text-slate-400">#{i+1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-teal-100 flex items-center justify-center">
                              <Building2 className="w-3.5 h-3.5 text-teal-600" />
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
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full"
                                style={{ width:`${Math.min(sc.resolutionRate,100)}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{sc.resolutionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ══ TECHNICIAN SELF VIEW (technician role only) ══ */}
          {role === "technician" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-4 h-4 text-indigo-500" />
                  <p className="text-sm font-semibold text-slate-800">My Jobs</p>
                </div>
                <p className="text-3xl font-bold text-indigo-600">{o!.totalTickets}</p>
                <p className="text-xs text-slate-400 mt-1">Assigned this period</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-semibold text-slate-800">Completed</p>
                </div>
                <p className="text-3xl font-bold text-green-600">{o!.resolvedTickets + o!.closedTickets}</p>
                <p className="text-xs text-slate-400 mt-1">{o!.resolutionRate}% resolution rate</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <p className="text-sm font-semibold text-slate-800">Avg Time</p>
                </div>
                <p className="text-3xl font-bold text-amber-600">{o!.avgResolutionHours}h</p>
                <p className="text-xs text-slate-400 mt-1">Per ticket resolution</p>
              </div>
            </div>
          )}

          {/* ══ TOP FAULTS ══ */}
          {data.topFaults.length > 0 && (
            <Section title="Top Reported Faults" sub="Most common issues in this period">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.topFaults.slice(0,8).map((f,i) => {
                  const max = data.topFaults[0]?.count || 1;
                  return (
                    <div key={f._id} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">#{i+1}</span>
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{f._id}</p>
                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-amber-400 rounded-full"
                            style={{ width:`${(f.count/max)*100}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 shrink-0">{f.count}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ══ SLA + CUSTOMERS ══ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
              <p className="text-xs text-slate-500 mb-1">SLA Breaches</p>
              <p className="text-2xl font-bold text-red-600">{data.sla.breached}</p>
              <p className="text-[10px] text-slate-400">{data.sla.breachRate}% breach rate</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
              <p className="text-xs text-slate-500 mb-1">Response Breaches</p>
              <p className="text-2xl font-bold text-amber-600">{data.sla.responseBreached}</p>
              <p className="text-[10px] text-slate-400">First response SLA</p>
            </div>
            {role !== "technician" && (
              <>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                  <p className="text-xs text-slate-500 mb-1">Unique Customers</p>
                  <p className="text-2xl font-bold text-blue-600">{data.customers.uniqueCustomers}</p>
                  <p className="text-[10px] text-slate-400">This period</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
                  <p className="text-xs text-slate-500 mb-1">Repeat Customers</p>
                  <p className="text-2xl font-bold text-indigo-600">{data.customers.repeatCustomers}</p>
                  <p className="text-[10px] text-slate-400">Avg {data.customers.avgPerCustomer?.toFixed(1)} tickets each</p>
                </div>
              </>
            )}
          </div>

          {/* ══ TICKET DETAIL TABLE + CSV EXPORT ══ */}
          <TicketExportTable period={period} />
        </>
      )}
    </div>
  );
}