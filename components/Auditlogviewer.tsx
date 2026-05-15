 "use client";
import { useState, useEffect, useCallback } from "react";

interface AuditEntry {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  resourceId?: string;
  status: "success" | "failure";
  ipAddress: string;
  duration?: number;
  createdAt: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
}

const MODULE_OPTIONS = [
  "all", "tickets", "users", "brands", "inventory",
  "wallet", "commission", "settings", "analytics",
];

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  failure: "bg-red-100 text-red-800",
};

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    module: "all",
    status: "all",
    from: "",
    to: "",
    search: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.module !== "all") params.set("module", filters.module);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      params.set("page", String(filters.page));

      const res = await fetch(`/api/audit?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = filters.search
    ? logs.filter(
        (l) =>
          l.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
          l.action.toLowerCase().includes(filters.search.toLowerCase())
      )
    : logs;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search user or action..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
          />
          <select
            value={filters.module}
            onChange={(e) => setFilters((f) => ({ ...f, module: e.target.value, page: 1 }))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {MODULE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m === "all" ? "All Modules" : m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value, page: 1 }))}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value, page: 1 }))}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <span className="font-medium text-gray-800">
            Audit Logs
            <span className="ml-2 text-sm text-gray-500">
              ({pagination.total} records)
            </span>
          </span>
          <button
            onClick={fetchLogs}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading audit logs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No logs found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Module</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((log) => (
                <>
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{log.userName}</div>
                      <div className="text-xs text-gray-400">{log.userRole}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {log.action}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          STATUS_COLORS[log.status]
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {log.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {log.duration ? `${log.duration}ms` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {(log.oldValue || log.newValue) && (
                        <button
                          onClick={() =>
                            setExpanded(expanded === log.id ? null : log.id)
                          }
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {expanded === log.id ? "Hide" : "View diff"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr key={`${log.id}-expanded`}>
                      <td colSpan={8} className="px-4 py-3 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Before</p>
                            <pre className="text-xs bg-white border rounded p-2 overflow-auto max-h-40">
                              {JSON.stringify(log.oldValue, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">After</p>
                            <pre className="text-xs bg-white border rounded p-2 overflow-auto max-h-40">
                              {JSON.stringify(log.newValue, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Page {filters.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={filters.page >= pagination.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}