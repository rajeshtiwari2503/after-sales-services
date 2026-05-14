"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
    Plus, Search, RefreshCw, Eye, Edit, Trash2,
    ChevronLeft, ChevronRight, LayoutList, LayoutGrid,
    AlertCircle, Ticket, Filter, X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
interface TicketItem {
    _id: string;
    ticketNumber: string;
    title: string;
    status: "open" | "in_progress" | "pending_parts" | "pending_customer" | "resolved" | "closed" | "cancelled";
    priority: "low" | "medium" | "high" | "critical";
    category: string;
    customerId: { _id: string; name: string; email: string } | null;
    technicianId: { _id: string; name: string } | null;
    createdAt: string;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ─── Constants ───────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
    open: { label: "Open", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-800 border-blue-100" },
    in_progress: { label: "In Progress", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800 border-amber-100" },
    pending_parts: { label: "Pending Parts", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-800 border-violet-100" },
    pending_customer: { label: "Pending Customer", dot: "bg-violet-400", badge: "bg-violet-50 text-violet-700 border-violet-100" },
    resolved: { label: "Resolved", dot: "bg-green-500", badge: "bg-green-50 text-green-800 border-green-100" },
    closed: { label: "Closed", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" },
    cancelled: { label: "Cancelled", dot: "bg-red-400", badge: "bg-red-50 text-red-700 border-red-100" },
};

const PRIORITY_CONFIG: Record<string, { label: string; badge: string }> = {
    low: { label: "Low", badge: "bg-green-50 text-green-700 border-green-100" },
    medium: { label: "Medium", badge: "bg-amber-50 text-amber-700 border-amber-100" },
    high: { label: "High", badge: "bg-orange-50 text-orange-700 border-orange-100" },
    critical: { label: "Critical", badge: "bg-red-50 text-red-700 border-red-100" },
};

const LIMIT = 10;

// ─── Helpers ─────────────────────────────────────────────
const initials = (name?: string) =>
    (name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ─── Skeleton ────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr>
            {Array(8).fill(0).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-3 bg-slate-200 rounded animate-pulse" style={{ width: i === 2 ? "80%" : "60%" }} />
                </td>
            ))}
        </tr>
    );
}

// ─── Badge components ────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;
    return (
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.badge}`}>
            {cfg.label}
        </span>
    );
}

// ─── Main Page ───────────────────────────────────────────
export default function TicketsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [tickets, setTickets] = useState<TicketItem[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });
    const [stats, setStats] = useState({ open: 0, inProgress: 0, pending: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [view, setView] = useState<"table" | "grid">("table");
    const [deleting, setDeleting] = useState<string | null>(null);

    // Filters from URL
    const page = parseInt(searchParams.get("page") ?? "1");
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const priority = searchParams.get("priority") ?? "";
    const category = searchParams.get("category") ?? "";

    //   const searchTimer = useRef<NodeJS.Timeout>();
    const searchTimer = useRef<NodeJS.Timeout | null>(null);

    // ── Update URL params ──
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

    // ── Fetch tickets ──
    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set("page", String(page));
            params.set("limit", String(LIMIT));
            if (search) params.set("search", search);
            if (status) params.set("status", status);
            if (priority) params.set("priority", priority);
            if (category) params.set("category", category);

            const res = await fetch(`/api/tickets?${params.toString()}`, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch tickets");
            const data = await res.json();
            // console.log("dhghghd,data",data );

            setTickets(data.data ?? data.data ?? []);
            setMeta({
                page: data.data?.page ?? page,
                limit: data.data?.limit ?? LIMIT,
                total: data.data?.total ?? 0,
                totalPages: Math.ceil((data.data?.total ?? 0) / LIMIT),
            });

            // Stats from same response or separate
            setStats({
                open: data.data?.stats?.open ?? 0,
                inProgress: data.data?.stats?.inProgress ?? 0,
                pending: data.data?.stats?.pending ?? 0,
                resolved: data.data?.stats?.resolved ?? 0,
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, search, status, priority, category]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    // ── Delete ──
    const handleDelete = async (id: string) => {
        if (!confirm("Delete this ticket?")) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/tickets/${id}`, { method: "DELETE", credentials: "include" });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Ticket deleted");
            fetchTickets();
        } catch {
            toast.error("Failed to delete ticket");
        } finally {
            setDeleting(null);
        }
    };

    // ── Select ──
    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === tickets.length) setSelected(new Set());
        else setSelected(new Set(tickets.map((t) => t._id)));
    };

    const clearFilters = () => router.push(pathname);

    const hasFilters = search || status || priority || category;

    // ── Pagination buttons ──
    const paginationPages = () => {
        const pages: (number | "...")[] = [];
        for (let i = 1; i <= meta.totalPages; i++) {
            if (i === 1 || i === meta.totalPages || Math.abs(i - page) <= 1) pages.push(i);
            else if (Math.abs(i - page) === 2) pages.push("...");
        }
        return [...new Set(pages)];
    };

    const statCards = [
        { label: "Open", value: stats.open, sub: "+3 today", color: "text-blue-600" },
        { label: "In Progress", value: stats.inProgress, sub: "Active", color: "text-amber-600" },
        { label: "Pending", value: stats.pending, sub: "Awaiting", color: "text-violet-600" },
        { label: "Resolved", value: stats.resolved, sub: "This month", color: "text-green-600" },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-5">

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Tickets</h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {loading ? "Loading..." : `${meta.total} total service requests`}
                    </p>
                </div>
                <Link
                    href="/dashboard/tickets/create"
                    className="inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    New ticket
                </Link>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map(({ label, value, sub, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4">
                        <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
                        <p className={`text-2xl font-bold ${color}`}>{loading ? "—" : value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="flex items-center gap-2 flex-1 min-w-[180px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search tickets, ID, customer..."
                        defaultValue={search}
                        // onChange={(e) => {
                        //   clearTimeout(searchTimer.current);
                        //   searchTimer.current = setTimeout(() => setParam("search", e.target.value), 400);
                        // }}
                        onChange={(e) => {
                            if (searchTimer.current) {
                                clearTimeout(searchTimer.current);
                            }

                            searchTimer.current = setTimeout(() => {
                                // search logic
                            }, 500);
                        }}
                        className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                    />
                </div>

                {/* Status filter */}
                <select
                    value={status}
                    onChange={(e) => setParam("status", e.target.value)}
                    className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer"
                >
                    <option value="">All status</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>

                {/* Priority filter */}
                <select
                    value={priority}
                    onChange={(e) => setParam("priority", e.target.value)}
                    className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer"
                >
                    <option value="">All priority</option>
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                    ))}
                </select>

                {/* Category filter */}
                <select
                    value={category}
                    onChange={(e) => setParam("category", e.target.value)}
                    className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer"
                >
                    <option value="">All category</option>
                    {["hardware", "software", "installation", "maintenance", "warranty", "consultation", "other"].map((c) => (
                        <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                </select>

                {/* Clear filters */}
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 h-9 px-3 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" /> Clear
                    </button>
                )}

                <div className="w-px h-5 bg-slate-200 mx-0.5" />

                {/* Refresh */}
                <button
                    onClick={fetchTickets}
                    className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                    aria-label="Refresh"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>

                {/* View toggle */}
                <div className="flex gap-1">
                    {(["table", "grid"] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition cursor-pointer
                ${view === v ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                            aria-label={`${v} view`}
                        >
                            {v === "table" ? <LayoutList className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Bulk action bar ── */}
            {selected.size > 0 && (
                <div className="flex items-center gap-3 bg-indigo-600 text-white rounded-lg px-4 py-2.5">
                    <span className="text-sm flex-1">{selected.size} ticket{selected.size > 1 ? "s" : ""} selected</span>
                    <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition cursor-pointer">Assign</button>
                    <button className="text-xs px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition cursor-pointer">Change status</button>
                    <button className="text-xs px-3 py-1.5 bg-red-400/40 rounded-lg hover:bg-red-400/60 transition cursor-pointer">Delete</button>
                    <button onClick={() => setSelected(new Set())} className="ml-1 text-white/60 hover:text-white cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ── Error ── */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <button onClick={fetchTickets} className="text-xs text-red-600 hover:underline cursor-pointer">Retry</button>
                </div>
            )}

            {/* ── Table view ── */}
            {view === "table" && (
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
                            <colgroup>
                                <col style={{ width: 40 }} />
                                <col style={{ width: 110 }} />
                                <col />
                                <col style={{ width: 130 }} />
                                <col style={{ width: 90 }} />
                                <col style={{ width: 100 }} />
                                <col style={{ width: 130 }} />
                                <col style={{ width: 100 }} />
                                <col style={{ width: 80 }} />
                            </colgroup>
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={tickets.length > 0 && selected.size === tickets.length}
                                            onChange={toggleAll}
                                            className="cursor-pointer"
                                        />
                                    </th>
                                    {["Ticket ID", "Title", "Status", "Priority", "Category", "Customer", "Created", ""].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading
                                    ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
                                    : tickets.length === 0
                                        ? (
                                            <tr>
                                                <td colSpan={9}>
                                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                            <Ticket className="w-6 h-6 text-slate-400" />
                                                        </div>
                                                        <p className="text-slate-600 font-medium text-sm">No tickets found</p>
                                                        <p className="text-slate-400 text-xs">
                                                            {hasFilters ? "Try adjusting your filters" : "Create your first service ticket"}
                                                        </p>
                                                        {hasFilters && (
                                                            <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline cursor-pointer">
                                                                Clear filters
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                        : tickets.map((ticket) => (
                                            <tr key={ticket._id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.has(ticket._id)}
                                                        onChange={() => toggleSelect(ticket._id)}
                                                        className="cursor-pointer"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs text-slate-500">{ticket.ticketNumber}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={`/dashboard/tickets/${ticket._id}`}
                                                        className="text-sm font-medium text-slate-800 hover:text-indigo-600 transition-colors line-clamp-1 block"
                                                    >
                                                        {ticket.title}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                                                <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-500 capitalize">{ticket.category}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                            {initials(ticket.customerId?.name)}
                                                        </div>
                                                        <span className="text-xs text-slate-600 truncate">{ticket.customerId?.name ?? "—"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-slate-500">{fmtDate(ticket.createdAt)}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            href={`/dashboard/tickets/${ticket._id}`}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <Link
                                                            href={`/dashboard/tickets/${ticket._id}/edit`}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(ticket._id)}
                                                            disabled={deleting === ticket._id}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition cursor-pointer"
                                                        >
                                                            {deleting === ticket._id
                                                                ? <span className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                                                : <Trash2 className="w-3.5 h-3.5" />
                                                            }
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                }
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {!loading && meta.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                            <p className="text-xs text-slate-500">
                                Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, meta.total)} of {meta.total}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {paginationPages().map((p, i) =>
                                    p === "..." ? (
                                        <span key={`dots-${i}`} className="w-8 text-center text-xs text-slate-400">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition cursor-pointer
                        ${p === page
                                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === meta.totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Grid view ── */}
            {view === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading
                        ? Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
                                <div className="h-3 bg-slate-200 rounded w-3/4" />
                                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                                <div className="flex gap-2 mt-3">
                                    <div className="h-5 bg-slate-200 rounded-full w-16" />
                                    <div className="h-5 bg-slate-200 rounded-full w-14" />
                                </div>
                            </div>
                        ))
                        : tickets.length === 0
                            ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
                                    <Ticket className="w-10 h-10 text-slate-300" />
                                    <p className="text-slate-500 font-medium">No tickets found</p>
                                </div>
                            )
                            : tickets.map((ticket) => (
                                <div key={ticket._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-indigo-200 transition-colors group">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="font-mono text-xs text-slate-400">{ticket.ticketNumber}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/dashboard/tickets/${ticket._id}`}
                                                className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-indigo-600 cursor-pointer">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                            <Link href={`/dashboard/tickets/${ticket._id}/edit`}
                                                className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-indigo-600 cursor-pointer">
                                                <Edit className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>

                                    <Link href={`/dashboard/tickets/${ticket._id}`}>
                                        <h3 className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2 mb-3">
                                            {ticket.title}
                                        </h3>
                                    </Link>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        <StatusBadge status={ticket.status} />
                                        <PriorityBadge priority={ticket.priority} />
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                                                {initials(ticket.customerId?.name)}
                                            </div>
                                            <span className="text-xs text-slate-500 truncate max-w-[100px]">{ticket.customerId?.name ?? "—"}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">{fmtDate(ticket.createdAt)}</span>
                                    </div>
                                </div>
                            ))
                    }
                </div>
            )}
        </div>
    );
}