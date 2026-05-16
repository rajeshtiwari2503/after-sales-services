"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Search, RefreshCw, Eye, X, ChevronLeft, ChevronRight, Ticket } from "lucide-react";

interface TicketItem {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  customerId: { name: string } | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  open: { label: "Open", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-800 border-blue-100" },
  in_progress: { label: "In Progress", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800 border-amber-100" },
  resolved: { label: "Resolved", dot: "bg-green-500", badge: "bg-green-50 text-green-800 border-green-100" },
  closed: { label: "Closed", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" },
};

const PRIORITY_CONFIG: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

const LIMIT = 10;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function BrandTicketsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const page = parseInt(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      const res = await fetch(`/api/tickets?${params}`, { credentials: "include" });
      const data = await res.json();
      setTickets(data.data?.tickets ?? []);
      setTotal(data.data?.total ?? 0);
    } catch {} finally { setLoading(false); }
  }, [page, search, status, priority]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Brand Tickets</h1>
        <p className="text-xs text-slate-400 mt-0.5">{total} total service requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input type="text" placeholder="Search tickets..." defaultValue={search}
            onChange={e => {
              const val = e.target.value;
              if (searchTimer.current) clearTimeout(searchTimer.current);
              searchTimer.current = setTimeout(() => setParam("search", val), 400);
            }}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
        </div>
        <select value={status} onChange={e => setParam("status", e.target.value)}
          className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
          <option value="">All status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={priority} onChange={e => setParam("priority", e.target.value)}
          className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
          <option value="">All priority</option>
          {["low", "medium", "high", "critical"].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
        </select>
        {(search || status || priority) && (
          <button onClick={() => router.push(pathname)}
            className="flex items-center gap-1 h-9 px-3 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
        <button onClick={fetchTickets}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Ticket ID", "Title", "Status", "Priority", "Category", "Customer", "Created", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? Array(6).fill(0).map((_, i) => (
                <tr key={i}>{Array(8).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-3 bg-slate-200 rounded animate-pulse" /></td>
                ))}</tr>
              )) : tickets.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Ticket className="w-10 h-10 text-slate-300" />
                    <p className="text-slate-500 text-sm">No tickets found</p>
                  </div>
                </td></tr>
              ) : tickets.map(ticket => {
                const sCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
                return (
                  <tr key={ticket._id} className="hover:bg-slate-50 transition group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">{ticket.ticketNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/tickets/${ticket._id}`}
                        className="text-sm font-medium text-slate-800 hover:text-blue-600 transition line-clamp-1 block">
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border ${sCfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />{sCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border capitalize ${PRIORITY_CONFIG[ticket.priority] ?? ""}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 capitalize">{ticket.category}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{ticket.customerId?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(ticket.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/tickets/${ticket._id}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(page - 1)} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <span key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-400 text-xs px-1">…</span>}
                    <button onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium cursor-pointer transition
                        ${p === page ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {p}
                    </button>
                  </span>
                ))
              }
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrandTicketsPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />}>
      <BrandTicketsContent />
    </Suspense>
  );
}