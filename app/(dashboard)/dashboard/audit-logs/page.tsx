 "use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText, Search, Download, RefreshCw, X,
  AlertCircle, CheckCircle, AlertTriangle,
  Shield, Users, Activity, BarChart2,
  Calendar, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Zap, Globe, Clock, User, TrendingUp,
  LogIn, LogOut, Plus, Edit, Trash2, ArrowRightLeft,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────
interface AuditLog {
  _id: string;
  userId:    string;
  userName:  string;
  userEmail: string;
  userRole:  string;
  tenantId:  string;
  ipAddress?: string;
  userAgent?: string;
  action:    string;
  module:    string;
  entityId?:   string;
  entityName?: string;
  status:   "success" | "failed" | "warning";
  message?: string;
  changes?: { field: string; oldValue: any; newValue: any }[];
  metadata?: Record<string, any>;
  duration?: number;
  createdAt: string;
}

interface AuditStats {
  totals: { total: number; success: number; failed: number; warning: number };
  byModule: Record<string, number>;
  byAction: Record<string, number>;
  byStatus: Record<string, number>;
  topUsers: { _id: string; userName: string; userEmail: string; userRole: string; count: number; failed: number }[];
  timeline: { _id: string; total: number; failed: number; success: number }[];
  failedLogs: AuditLog[];
}

// ─── Constants ─────────────────────────────────────────────────
const STATUS_CFG = {
  success: { icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50 border-green-100",  dot: "bg-green-500"  },
  failed:  { icon: AlertCircle,  color: "text-red-600",    bg: "bg-red-50 border-red-100",      dot: "bg-red-500"    },
  warning: { icon: AlertTriangle,color: "text-amber-600",  bg: "bg-amber-50 border-amber-100",  dot: "bg-amber-500"  },
};

const ACTION_CFG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  LOGIN:          { color: "text-green-700",  bg: "bg-green-50",   icon: LogIn         },
  LOGOUT:         { color: "text-slate-600",  bg: "bg-slate-100",  icon: LogOut        },
  REGISTER:       { color: "text-blue-700",   bg: "bg-blue-50",    icon: Plus          },
  CREATE:         { color: "text-indigo-700", bg: "bg-indigo-50",  icon: Plus          },
  READ:           { color: "text-slate-500",  bg: "bg-slate-50",   icon: Eye           },
  UPDATE:         { color: "text-blue-700",   bg: "bg-blue-50",    icon: Edit          },
  DELETE:         { color: "text-red-700",    bg: "bg-red-50",     icon: Trash2        },
  EXPORT:         { color: "text-violet-700", bg: "bg-violet-50",  icon: Download      },
  ASSIGN:         { color: "text-teal-700",   bg: "bg-teal-50",    icon: ArrowRightLeft},
  STATUS_CHANGE:  { color: "text-amber-700",  bg: "bg-amber-50",   icon: Zap           },
  PASSWORD_CHANGE:{ color: "text-orange-700", bg: "bg-orange-50",  icon: Shield        },
  TOGGLE_ACTIVE:  { color: "text-cyan-700",   bg: "bg-cyan-50",    icon: Activity      },
  SYSTEM_CONFIG:  { color: "text-rose-700",   bg: "bg-rose-50",    icon: BarChart2     },
};

const MODULE_CFG: Record<string, { label: string; color: string }> = {
  auth:           { label: "Auth",          color: "text-green-600"  },
  ticket:         { label: "Ticket",        color: "text-blue-600"   },
  user:           { label: "User",          color: "text-indigo-600" },
  brand:          { label: "Brand",         color: "text-violet-600" },
  service_center: { label: "Service Ctr",   color: "text-teal-600"   },
  technician:     { label: "Technician",    color: "text-amber-600"  },
  inventory:      { label: "Inventory",     color: "text-orange-600" },
  feedback:       { label: "Feedback",      color: "text-pink-600"   },
  analytics:      { label: "Analytics",     color: "text-cyan-600"   },
  role:           { label: "Role",          color: "text-rose-600"   },
  system:         { label: "System",        color: "text-slate-600"  },
};

const ROLE_BADGE: Record<string, string> = {
  admin:          "bg-purple-50 text-purple-700 border-purple-100",
  manager:        "bg-blue-50 text-blue-700 border-blue-100",
  service_center: "bg-teal-50 text-teal-700 border-teal-100",
  technician:     "bg-amber-50 text-amber-700 border-amber-100",
  customer:       "bg-slate-100 text-slate-600 border-slate-200",
};

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

const initials = (name: string) =>
  (name ?? "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

// ─── Timeline mini chart ────────────────────────────────────────
function TimelineBar({ data }: {
  data: { _id: string; total: number; failed: number; success: number }[];
}) {
  if (!data.length) return <div className="h-12 flex items-center justify-center text-xs text-slate-400">No data</div>;
  const maxVal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((d, i) => {
        const h = Math.max((d.total / maxVal) * 100, 2);
        const hasFailed = d.failed > 0;
        return (
          <div key={i} className="flex-1 relative group" style={{ height: "100%" }}>
            <div className={`absolute bottom-0 w-full rounded-t-sm transition-all ${
              hasFailed ? "bg-red-400" : "bg-indigo-400"
            }`} style={{ height: `${h}%` }}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {d._id?.slice(5)}: {d.total}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Log detail drawer ──────────────────────────────────────────
function LogDrawer({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const statusCfg = STATUS_CFG[log.status];
  const actionCfg = ACTION_CFG[log.action] ?? ACTION_CFG.READ;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white w-full max-w-lg h-full rounded-2xl shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-bold text-slate-800">Log detail</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status + Action */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl border p-3 ${statusCfg.bg}`}>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Status</p>
              <div className={`flex items-center gap-1.5 ${statusCfg.color}`}>
                <statusCfg.icon className="w-4 h-4" />
                <span className="text-sm font-bold capitalize">{log.status}</span>
              </div>
            </div>
            <div className={`rounded-xl border p-3 ${actionCfg.bg} border-slate-100`}>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Action</p>
              <div className={`flex items-center gap-1.5 ${actionCfg.color}`}>
                <actionCfg.icon className="w-4 h-4" />
                <span className="text-sm font-bold">{log.action}</span>
              </div>
            </div>
          </div>

          {/* Who */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Performed by</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                {initials(log.userName)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{log.userName}</p>
                <p className="text-xs text-slate-400">{log.userEmail}</p>
              </div>
              <span className={`ml-auto text-[10px] font-semibold px-2 py-1 rounded-full border capitalize ${ROLE_BADGE[log.userRole] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                {log.userRole}
              </span>
            </div>
          </div>

          {/* What */}
          <div className="space-y-2 text-sm">
            {[
              { label: "Module",    value: MODULE_CFG[log.module]?.label ?? log.module },
              { label: "Entity",    value: log.entityName ?? log.entityId ?? "—" },
              { label: "Message",   value: log.message ?? "—" },
              { label: "Timestamp", value: fmtDateTime(log.createdAt) },
              { label: "IP Address",value: log.ipAddress ?? "—" },
              { label: "Duration",  value: log.duration ? `${log.duration}ms` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4">
                <span className="text-xs text-slate-400 w-24 shrink-0">{label}</span>
                <span className="text-xs font-medium text-slate-700 text-right break-all">{value}</span>
              </div>
            ))}
          </div>

          {/* Changes */}
          {log.changes && log.changes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Changes</p>
              <div className="space-y-2">
                {log.changes.map((c, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-[11px] font-semibold text-slate-600 mb-1.5 capitalize">{c.field}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100 line-through">
                        {String(c.oldValue ?? "—")}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">
                        {String(c.newValue ?? "—")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Metadata</p>
              <pre className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* User agent */}
          {log.userAgent && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">User agent</p>
              <p className="text-[10px] text-slate-400 bg-slate-50 rounded-lg p-2 border border-slate-200 break-all">
                {log.userAgent}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function AuditLogsPage() {
  const [logs, setLogs]         = useState<AuditLog[]>([]);
  const [stats, setStats]       = useState<AuditStats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [statsLoad, setStatsLoad] = useState(true);
  const [tab, setTab]           = useState<"logs" | "stats">("logs");
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [range, setRange]       = useState("30");

  // Filters
  const [search, setSearch]   = useState("");
  const [module_, setModule]  = useState("");
  const [action, setAction]   = useState("");
  const [status, setStatus]   = useState("");
  const [startDate, setStart] = useState("");
  const [endDate,   setEnd]   = useState("");

  const LIMIT = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page",  String(page));
      params.set("limit", String(LIMIT));
      if (module_)   params.set("module",    module_);
      if (action)    params.set("action",    action);
      if (status)    params.set("status",    status);
      if (search)    params.set("search",    search);
      if (startDate) params.set("startDate", startDate);
      if (endDate)   params.set("endDate",   endDate);

      const res  = await fetch(`/api/audit?${params}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setLogs(data.data?.logs ?? []);
      setTotal(data.data?.total ?? 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [page, module_, action, status, search, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    setStatsLoad(true);
    try {
      const res  = await fetch(`/api/audit/stats?range=${range}`, { credentials: "include" });
      const data = await res.json();
      setStats(data.data ?? null);
    } catch {}
    finally { setStatsLoad(false); }
  }, [range]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (module_)   params.set("module",    module_);
    if (action)    params.set("action",    action);
    if (status)    params.set("status",    status);
    if (startDate) params.set("startDate", startDate);
    if (endDate)   params.set("endDate",   endDate);
    const url = `/api/audit/export?${params}`;
    window.open(url, "_blank");
  };

  const clearFilters = () => {
    setSearch(""); setModule(""); setAction("");
    setStatus(""); setStart(""); setEnd(""); setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = !!(module_ || action || status || search || startDate || endDate);

  const ALL_MODULES = ["auth","ticket","user","brand","service_center","technician","inventory","feedback","analytics","role","system"];
  const ALL_ACTIONS = ["LOGIN","LOGOUT","REGISTER","CREATE","READ","UPDATE","DELETE","EXPORT","ASSIGN","STATUS_CHANGE","PASSWORD_CHANGE","TOGGLE_ACTIVE"];

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete system activity — {total.toLocaleString("en-IN")} total events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { fetchLogs(); fetchStats(); }}
            className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-white rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 h-9 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium cursor-pointer transition">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total events",  value: stats?.totals.total   ?? 0, color: "text-slate-800",   icon: Activity    },
          { label: "Successful",    value: stats?.totals.success ?? 0, color: "text-green-600",   icon: CheckCircle },
          { label: "Failed",        value: stats?.totals.failed  ?? 0, color: "text-red-600",     icon: AlertCircle },
          { label: "Warnings",      value: stats?.totals.warning ?? 0, color: "text-amber-600",   icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-4 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color} shrink-0`} />
            <div>
              {statsLoad
                ? <div className="h-6 bg-slate-200 rounded w-12 animate-pulse mb-1" />
                : <p className={`text-2xl font-black ${color}`}>{value.toLocaleString()}</p>
              }
              <p className="text-[10px] text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl w-fit">
        {[
          { key: "logs",  label: "Event log"  },
          { key: "stats", label: "Analytics"  },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`h-9 px-5 rounded-lg text-sm font-medium cursor-pointer transition
              ${tab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── LOGS TAB ── */}
      {tab === "logs" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
            {/* Search + export row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input type="text" placeholder="Search by user, entity, message..."
                  value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
                {search && <button onClick={() => { setSearch(""); setPage(1); }}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
              </div>
              {/* Date range */}
              <input type="date" value={startDate}
                onChange={e => { setStart(e.target.value); setPage(1); }}
                className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 cursor-pointer focus:outline-none" />
              <span className="text-xs text-slate-400">to</span>
              <input type="date" value={endDate}
                onChange={e => { setEnd(e.target.value); setPage(1); }}
                className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 cursor-pointer focus:outline-none" />
              {hasFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1 h-9 px-3 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Dropdown filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <select value={module_} onChange={e => { setModule(e.target.value); setPage(1); }}
                className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
                <option value="">All modules</option>
                {ALL_MODULES.map(m => <option key={m} value={m}>{MODULE_CFG[m]?.label ?? m}</option>)}
              </select>

              <select value={action} onChange={e => { setAction(e.target.value); setPage(1); }}
                className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
                <option value="">All actions</option>
                {ALL_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>

              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
                className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
                <option value="">All status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
              </select>

              {/* Active filter chips */}
              {module_ && (
                <span className="flex items-center gap-1 h-7 px-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-medium">
                  {MODULE_CFG[module_]?.label ?? module_}
                  <button onClick={() => setModule("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {action && (
                <span className="flex items-center gap-1 h-7 px-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[11px] font-medium">
                  {action}
                  <button onClick={() => setAction("")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {status && (
                <span className={`flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium border
                  ${status === "failed" ? "bg-red-50 border-red-200 text-red-700" :
                    status === "warning" ? "bg-amber-50 border-amber-200 text-amber-700" :
                    "bg-green-50 border-green-200 text-green-700"}`}>
                  {status}
                  <button onClick={() => setStatus("")}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          </div>

          {/* Log table */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Timestamp", "User", "Action", "Module", "Entity", "Status", "IP", ""].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? Array(8).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(8).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  )) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No audit logs found</p>
                        {hasFilters && (
                          <button onClick={clearFilters} className="text-indigo-600 text-xs mt-1 hover:underline cursor-pointer">
                            Clear filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : logs.map(log => {
                    const statusCfg = STATUS_CFG[log.status];
                    const actionCfg = ACTION_CFG[log.action] ?? ACTION_CFG.READ;
                    const modCfg    = MODULE_CFG[log.module] ?? { label: log.module, color: "text-slate-500" };
                    return (
                      <tr key={log._id}
                        onClick={() => setSelected(log)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          log.status === "failed" ? "bg-red-50/30" :
                          log.status === "warning" ? "bg-amber-50/20" : ""
                        }`}>
                        {/* Timestamp */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                            <span className="text-xs text-slate-500">
                              {new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              {" "}{new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </td>
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                              {initials(log.userName)}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-800 whitespace-nowrap">{log.userName}</p>
                              <p className="text-[9px] text-slate-400">{log.userRole}</p>
                            </div>
                          </div>
                        </td>
                        {/* Action */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${actionCfg.bg} ${actionCfg.color}`}>
                            <actionCfg.icon className="w-3 h-3" />
                            {log.action}
                          </span>
                        </td>
                        {/* Module */}
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold capitalize ${modCfg.color}`}>{modCfg.label}</span>
                        </td>
                        {/* Entity */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600 max-w-[120px] truncate block">
                            {log.entityName ?? log.entityId ?? "—"}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                            <statusCfg.icon className="w-3 h-3" />
                            {log.status}
                          </span>
                        </td>
                        {/* IP */}
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-mono text-slate-400">{log.ipAddress ?? "—"}</span>
                        </td>
                        {/* View */}
                        <td className="px-4 py-3">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-400">
                  {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total.toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40 cursor-pointer hover:bg-white transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg border text-xs font-medium cursor-pointer transition
                          ${p === page ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-600 hover:bg-white"}`}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40 cursor-pointer hover:bg-white transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === "stats" && (
        <div className="space-y-5">
          {/* Range selector */}
          <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5 w-fit">
            {[["7","7 days"],["30","30 days"],["90","90 days"],["365","1 year"]].map(([val, lbl]) => (
              <button key={val} onClick={() => setRange(val)}
                className={`h-8 px-4 rounded-lg text-xs font-semibold cursor-pointer transition
                  ${range === val ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {lbl}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-bold text-slate-800">Activity Timeline</p>
              <div className="flex items-center gap-3 ml-auto text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block" /> Events</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Failures</span>
              </div>
            </div>
            {statsLoad
              ? <div className="h-12 bg-slate-100 rounded animate-pulse" />
              : <TimelineBar data={stats?.timeline ?? []} />
            }
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* By module */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-violet-500" />
                <p className="text-sm font-bold text-slate-800">Events by module</p>
              </div>
              {statsLoad ? <div className="h-40 bg-slate-100 rounded-xl animate-pulse" /> : (
                <div className="space-y-2.5">
                  {Object.entries(stats?.byModule ?? {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([mod, count]) => {
                      const total_ = Object.values(stats?.byModule ?? {}).reduce((a, b) => a + b, 0) || 1;
                      const pct    = Math.round((count / total_) * 100);
                      const cfg    = MODULE_CFG[mod] ?? { label: mod, color: "text-slate-500" };
                      return (
                        <div key={mod} className="flex items-center gap-3">
                          <span className={`text-xs font-semibold w-24 shrink-0 ${cfg.color}`}>{cfg.label}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 tabular-nums w-12 text-right">{count}</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* By action */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-bold text-slate-800">Events by action</p>
              </div>
              {statsLoad ? <div className="h-40 bg-slate-100 rounded-xl animate-pulse" /> : (
                <div className="space-y-2.5">
                  {Object.entries(stats?.byAction ?? {})
                    .sort(([, a], [, b]) => b - a).slice(0, 8)
                    .map(([act, count]) => {
                      const total_ = Object.values(stats?.byAction ?? {}).reduce((a, b) => a + b, 0) || 1;
                      const pct    = Math.round((count / total_) * 100);
                      const cfg    = ACTION_CFG[act] ?? ACTION_CFG.READ;
                      return (
                        <div key={act} className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-28 shrink-0 ${cfg.bg} ${cfg.color}`}>
                            <cfg.icon className="w-2.5 h-2.5" />{act}
                          </span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 tabular-nums w-10 text-right">{count}</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Top users */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Users className="w-4 h-4 text-teal-600" />
              <p className="text-sm font-bold text-slate-800">Most active users</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["#","User","Role","Total events","Failures","Rate"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {statsLoad ? Array(5).fill(0).map((_, i) => (
                    <tr key={i}>{Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>
                    ))}</tr>
                  )) : (stats?.topUsers ?? []).map((u, i) => {
                    const failRate = u.count > 0 ? Math.round((u.failed / u.count) * 100) : 0;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-slate-400">#{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {initials(u.userName)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-800">{u.userName}</p>
                              <p className="text-[9px] text-slate-400">{u.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${ROLE_BADGE[u.userRole] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                            {u.userRole}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-800 tabular-nums">{u.count}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold tabular-nums ${u.failed > 0 ? "text-red-600" : "text-green-600"}`}>
                            {u.failed}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${failRate > 10 ? "bg-red-400" : "bg-green-400"}`}
                                style={{ width: `${failRate}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-400">{failRate}% fail</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent failures */}
          {(stats?.failedLogs?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-red-100 bg-red-50">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-bold text-red-800">Recent failures</p>
              </div>
              <div className="divide-y divide-red-50">
                {stats!.failedLogs.map(log => {
                  const actionCfg = ACTION_CFG[log.action] ?? ACTION_CFG.READ;
                  return (
                    <div key={log._id} onClick={() => setSelected(log)}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-red-50/50 cursor-pointer transition-colors">
                      <actionCfg.icon className={`w-4 h-4 ${actionCfg.color} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {log.userName} — {log.action} {log.module}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{log.message ?? "No message"}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <LogDrawer log={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}