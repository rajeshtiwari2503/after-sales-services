"use client";
import { useState, useEffect } from "react";
import { FileText, Search, RefreshCw, Filter, X, AlertCircle, CheckCircle, Info } from "lucide-react";

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: { name: string; email: string } | string;
  tenantId: string;
  details?: string;
  ipAddress?: string;
  status: "success" | "failed" | "warning";
  createdAt: string;
}

const STATUS_CONFIG = {
  success: { icon: <CheckCircle className="w-3.5 h-3.5" />, badge: "bg-green-50 text-green-700 border-green-100" },
  failed: { icon: <AlertCircle className="w-3.5 h-3.5" />, badge: "bg-red-50 text-red-700 border-red-100" },
  warning: { icon: <Info className="w-3.5 h-3.5" />, badge: "bg-amber-50 text-amber-700 border-amber-100" },
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-green-600 bg-green-50",
  UPDATE: "text-blue-600 bg-blue-50",
  DELETE: "text-red-600 bg-red-50",
  LOGIN: "text-indigo-600 bg-indigo-50",
  LOGOUT: "text-slate-600 bg-slate-100",
  VIEW: "text-slate-500 bg-slate-50",
};

const fmtDateTime = (d: string) => new Date(d).toLocaleString("en-IN", {
  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
});

// Mock audit logs since no audit API exists yet
const MOCK_LOGS: AuditLog[] = [
  { _id: "1", action: "LOGIN", resource: "auth", userId: { name: "Rahul Sharma", email: "rahul@test.com" }, tenantId: "default", status: "success", ipAddress: "192.168.1.1", createdAt: new Date().toISOString() },
  { _id: "2", action: "CREATE", resource: "ticket", resourceId: "TKT-000042", userId: { name: "Priya S.", email: "priya@test.com" }, tenantId: "default", status: "success", createdAt: new Date(Date.now() - 300000).toISOString() },
  { _id: "3", action: "UPDATE", resource: "user", resourceId: "usr_001", userId: { name: "Admin", email: "admin@test.com" }, tenantId: "default", status: "success", details: "Role changed to technician", createdAt: new Date(Date.now() - 600000).toISOString() },
  { _id: "4", action: "DELETE", resource: "ticket", resourceId: "TKT-000038", userId: { name: "Admin", email: "admin@test.com" }, tenantId: "default", status: "success", createdAt: new Date(Date.now() - 900000).toISOString() },
  { _id: "5", action: "LOGIN", resource: "auth", userId: { name: "Unknown", email: "hacker@test.com" }, tenantId: "default", status: "failed", ipAddress: "203.0.113.1", details: "Invalid credentials", createdAt: new Date(Date.now() - 1200000).toISOString() },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    // Use mock data — replace with real API when available
    setTimeout(() => { setLogs(MOCK_LOGS); setLoading(false); }, 600);
  }, []);

  const filtered = logs.filter(l => {
    const userName = typeof l.userId === "object" ? l.userId.name : l.userId;
    const matchSearch = !search || userName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase());
    const matchAction = !actionFilter || l.action === actionFilter;
    const matchStatus = !statusFilter || l.status === statusFilter;
    return matchSearch && matchAction && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">System activity and security events</p>
        </div>
        <button onClick={() => { setLoading(true); setTimeout(() => { setLogs(MOCK_LOGS); setLoading(false); }, 500); }}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total events", value: logs.length, color: "text-slate-800" },
          { label: "Successful", value: logs.filter(l => l.status === "success").length, color: "text-green-600" },
          { label: "Failed", value: logs.filter(l => l.status === "failed").length, color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Search logs..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
        </div>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
          className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
          <option value="">All actions</option>
          {["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW"].map(a => <option key={a}>{a}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
          <option value="">All status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="warning">Warning</option>
        </select>
        {(actionFilter || statusFilter) && (
          <button onClick={() => { setActionFilter(""); setStatusFilter(""); }}
            className="flex items-center gap-1 h-9 px-3 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Timestamp", "User", "Action", "Resource", "Status", "IP address", "Details"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? Array(6).fill(0).map((_, i) => (
                <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>)}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400 text-sm">No logs found</td></tr>
              ) : filtered.map(log => {
                const statusCfg = STATUS_CONFIG[log.status] ?? STATUS_CONFIG.success;
                const actionColor = ACTION_COLORS[log.action] ?? "text-slate-600 bg-slate-50";
                const userName = typeof log.userId === "object" ? log.userId.name : log.userId;
                const userEmail = typeof log.userId === "object" ? log.userId.email : "";
                return (
                  <tr key={log._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-slate-800">{userName}</p>
                      {userEmail && <p className="text-[10px] text-slate-400">{userEmail}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${actionColor}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 capitalize">
                      {log.resource}{log.resourceId && <span className="text-slate-400 ml-1 font-mono">#{log.resourceId}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${statusCfg.badge}`}>
                        {statusCfg.icon} {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{log.ipAddress ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">{log.details ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}