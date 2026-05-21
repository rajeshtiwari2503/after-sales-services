"use client";

// components/reports/TicketExportTable.tsx  — NEW FILE
// Drop this anywhere in any report page (admin, brand, SC, technician)
// Shows full ticket data in an Excel-like scrollable table
// Has its own CSV export button that calls /api/reports/tickets

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download, Search, X, RefreshCw, FileText,
  ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface TicketRow {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  faultName?: string;
  tenantId: string;
  customerId:      { name: string; email: string; phone?: string } | null;
  technicianId:    { name: string; email: string } | null;
  serviceCenterId: { name: string; code: string } | null;
  categoryId:      { name: string } | null;
  productId:       { name: string; modelNumber: string; warrantyPeriod: number } | null;
  sla?: {
    responseDeadline?: string;
    resolutionDeadline?: string;
    isResponseBreached?: boolean;
    isResolutionBreached?: boolean;
    responseTime?: number;
    resolutionTime?: number;
  };
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  notes: any[];
  attachments: any[];
  timeline: any[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── Config ─────────────────────────────────────────────────── */
const STATUS_BADGE: Record<string, string> = {
  open:             "bg-blue-50 text-blue-700 border-blue-100",
  in_progress:      "bg-amber-50 text-amber-700 border-amber-100",
  pending_parts:    "bg-orange-50 text-orange-700 border-orange-100",
  pending_customer: "bg-orange-50 text-orange-700 border-orange-100",
  resolved:         "bg-green-50 text-green-700 border-green-100",
  closed:           "bg-slate-100 text-slate-600 border-slate-200",
  cancelled:        "bg-red-50 text-red-600 border-red-100",
};
const PRIORITY_BADGE: Record<string, string> = {
  low:      "bg-green-50 text-green-700 border-green-100",
  medium:   "bg-amber-50 text-amber-700 border-amber-100",
  high:     "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";
const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", hour12: false }) : "—";

const PAGE_SIZE = 20;

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function TicketExportTable({ period }: { period: string }) {
  const [tickets,    setTickets]    = useState<TicketRow[]>([]);
  const [filtered,   setFiltered]   = useState<TicketRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [exporting,  setExporting]  = useState(false);
  const [search,     setSearch]     = useState("");
  const [statusFilter,   setStatusFilter]   = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page,       setPage]       = useState(1);
  const [showFilters,setShowFilters]= useState(false);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  /* ── Fetch tickets (JSON) ── */
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(
        `/api/reports/tickets?period=${period}&format=json`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed");
      setTickets(data.data ?? []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  /* ── Client-side filter ── */
  useEffect(() => {
    let result = tickets;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.ticketNumber?.toLowerCase().includes(q) ||
        t.title?.toLowerCase().includes(q) ||
        t.customerId?.name?.toLowerCase().includes(q) ||
        t.customerId?.email?.toLowerCase().includes(q) ||
        t.technicianId?.name?.toLowerCase().includes(q) ||
        t.serviceCenterId?.name?.toLowerCase().includes(q) ||
        t.faultName?.toLowerCase().includes(q) ||
        t.productId?.name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter)   result = result.filter(t => t.status   === statusFilter);
    if (priorityFilter) result = result.filter(t => t.priority === priorityFilter);
    setFiltered(result);
    setPage(1);
  }, [tickets, search, statusFilter, priorityFilter]);

  /* ── CSV Export via API ── */
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await fetch(
        `/api/reports/tickets?period=${period}&format=csv`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Export failed");
      const blob     = await res.blob();
      const filename = `tickets-${period}-${new Date().toISOString().slice(0,10)}.csv`;
      const url      = URL.createObjectURL(blob);
      const a        = Object.assign(document.createElement("a"), { href: url, download: filename });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${tickets.length} tickets`);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  /* ── Pagination ── */
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Render ── */
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Ticket Detail Report
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {loading ? "Loading..." : `${filtered.length} of ${tickets.length} tickets`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium cursor-pointer transition ${
              showFilters || statusFilter || priorityFilter
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters
            {(statusFilter || priorityFilter) && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">
                {[statusFilter, priorityFilter].filter(Boolean).length}
              </span>
            )}
          </button>
          <button onClick={fetchTickets}
            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={exporting || loading || tickets.length === 0}
            className="flex items-center gap-2 h-8 px-3 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exporting..." : `Export CSV (${tickets.length})`}
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="px-5 py-3 border-b border-slate-100 space-y-2">
        <div className="flex items-center gap-2 h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 focus-within:border-indigo-400 transition">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by ticket #, title, customer, technician, product, fault..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-8 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-white focus:outline-none cursor-pointer">
              <option value="">All status</option>
              {["open","in_progress","pending_parts","pending_customer","resolved","closed","cancelled"].map(s => (
                <option key={s} value={s}>{s.replace(/_/g," ")}</option>
              ))}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
              className="h-8 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-white focus:outline-none cursor-pointer">
              <option value="">All priority</option>
              {["low","medium","high","critical"].map(p => (
                <option key={p} value={p} className="capitalize">{p}</option>
              ))}
            </select>
            {(statusFilter || priorityFilter) && (
              <button onClick={() => { setStatusFilter(""); setPriorityFilter(""); }}
                className="flex items-center gap-1 h-8 px-2.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse" style={{ minWidth: "1800px", width: "100%" }}>
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {[
                { label: "Ticket #",         w: "120px"  },
                { label: "Title",            w: "220px"  },
                { label: "Status",           w: "110px"  },
                { label: "Priority",         w: "90px"   },
                { label: "Category",         w: "120px"  },
                { label: "Fault",            w: "140px"  },
                { label: "Product",          w: "150px"  },
                { label: "Model",            w: "120px"  },
                { label: "Customer",         w: "160px"  },
                { label: "Customer Email",   w: "180px"  },
                { label: "Customer Phone",   w: "120px"  },
                { label: "Technician",       w: "140px"  },
                { label: "Service Center",   w: "150px"  },
                { label: "SC Code",          w: "80px"   },
                { label: "Brand",            w: "100px"  },
                { label: "SLA Response",     w: "130px"  },
                { label: "SLA Breached",     w: "100px"  },
                { label: "Res Breached",     w: "100px"  },
                { label: "Res Time",         w: "90px"   },
                { label: "Est. Completion",  w: "130px"  },
                { label: "Actual Completion",w: "130px"  },
                { label: "Notes",            w: "60px"   },
                { label: "Attachments",      w: "80px"   },
                { label: "Created",          w: "130px"  },
                { label: "Updated",          w: "130px"  },
              ].map(({ label, w }) => (
                <th key={label}
                  className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap sticky top-0 bg-slate-50"
                  style={{ minWidth: w }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(25).fill(0).map((_, j) => (
                    <td key={j} className="px-3 py-2.5">
                      <div className="h-3 bg-slate-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={25}>
                  <div className="flex flex-col items-center justify-center py-16 gap-2">
                    <FileText className="w-10 h-10 text-slate-300" />
                    <p className="text-sm text-slate-400">No tickets found</p>
                  </div>
                </td>
              </tr>
            ) : paginated.map(t => {
              const resHrs = t.sla?.resolutionTime
                ? Math.round(t.sla.resolutionTime / 3600000) + "h"
                : "—";
              return (
                <tr key={t._id} className="hover:bg-slate-50/60 transition group">
                  {/* Ticket # */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-indigo-600">{t.ticketNumber}</span>
                  </td>
                  {/* Title */}
                  <td className="px-3 py-2.5">
                    <p className="text-xs font-medium text-slate-800 max-w-[210px] truncate" title={t.title}>{t.title}</p>
                  </td>
                  {/* Status */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_BADGE[t.status] ?? ""}`}>
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  {/* Priority */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${PRIORITY_BADGE[t.priority] ?? ""}`}>
                      {t.priority}
                    </span>
                  </td>
                  {/* Category */}
                  <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap capitalize">
                    {t.categoryId?.name ?? t.category ?? "—"}
                  </td>
                  {/* Fault */}
                  <td className="px-3 py-2.5 text-xs text-amber-700 whitespace-nowrap">
                    {t.faultName ?? "—"}
                  </td>
                  {/* Product */}
                  <td className="px-3 py-2.5 text-xs text-slate-700 whitespace-nowrap">
                    {t.productId?.name ?? "—"}
                  </td>
                  {/* Model */}
                  <td className="px-3 py-2.5 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {t.productId?.modelNumber ?? "—"}
                  </td>
                  {/* Customer */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <p className="text-xs font-medium text-slate-800">{t.customerId?.name ?? "—"}</p>
                  </td>
                  {/* Customer email */}
                  <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                    {t.customerId?.email ?? "—"}
                  </td>
                  {/* Customer phone */}
                  <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                    {t.customerId?.phone ?? "—"}
                  </td>
                  {/* Technician */}
                  <td className="px-3 py-2.5 text-xs text-slate-700 whitespace-nowrap">
                    {t.technicianId?.name ?? <span className="text-slate-400">Unassigned</span>}
                  </td>
                  {/* Service Center */}
                  <td className="px-3 py-2.5 text-xs text-slate-700 whitespace-nowrap">
                    {t.serviceCenterId?.name ?? "—"}
                  </td>
                  {/* SC Code */}
                  <td className="px-3 py-2.5 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {t.serviceCenterId?.code ?? "—"}
                  </td>
                  {/* Brand */}
                  <td className="px-3 py-2.5 text-xs font-mono text-slate-500 whitespace-nowrap">
                    {t.tenantId}
                  </td>
                  {/* SLA Response deadline */}
                  <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                    {fmtDateTime(t.sla?.responseDeadline)}
                  </td>
                  {/* SLA Response breached */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {t.sla?.isResponseBreached
                      ? <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-semibold">Yes</span>
                      : <span className="text-[10px] text-green-600">No</span>}
                  </td>
                  {/* Resolution breached */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {t.sla?.isResolutionBreached
                      ? <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-semibold">Yes</span>
                      : <span className="text-[10px] text-green-600">No</span>}
                  </td>
                  {/* Resolution time */}
                  <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 whitespace-nowrap">
                    {resHrs}
                  </td>
                  {/* Est completion */}
                  <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                    {fmtDate(t.estimatedCompletionDate)}
                  </td>
                  {/* Actual completion */}
                  <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                    {fmtDate(t.actualCompletionDate)}
                  </td>
                  {/* Notes count */}
                  <td className="px-3 py-2.5 text-xs text-center font-semibold text-slate-700">
                    {t.notes?.length ?? 0}
                  </td>
                  {/* Attachments count */}
                  <td className="px-3 py-2.5 text-xs text-center font-semibold text-slate-700">
                    {t.attachments?.length ?? 0}
                  </td>
                  {/* Created */}
                  <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                    {fmtDateTime(t.createdAt)}
                  </td>
                  {/* Updated */}
                  <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                    {fmtDateTime(t.updatedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Showing {((page-1)*PAGE_SIZE)+1}–{Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 7) {
                if (page <= 4)         p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else p = page - 3 + i;
              }
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium cursor-pointer transition ${
                    p === page ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}