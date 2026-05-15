"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Plus, Search, Ticket, ArrowRight, X } from "lucide-react";

interface CustomerTicket {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  technicianId?: { name: string };
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  open: { label: "Open", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-100" },
  in_progress: { label: "In Progress", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-100" },
  pending_parts: { label: "Parts pending", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700 border-violet-100" },
  pending_customer: { label: "Action needed", dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-100" },
  resolved: { label: "Resolved", dot: "bg-green-500", badge: "bg-green-50 text-green-700 border-green-100" },
  closed: { label: "Closed", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200" },
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function TicketListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const statusFilter = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";

  const setParam = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(key, val); else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "20");
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    fetch(`/api/tickets?${params}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setTickets(d.data?.tickets ?? []))
      .catch(() => {}).finally(() => setLoading(false));
  }, [statusFilter, search]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 h-10 bg-white border border-slate-200 rounded-xl px-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search your requests..." defaultValue={search}
          onChange={e => { clearTimeout((window as any).__st); (window as any).__st = setTimeout(() => setParam("search", e.target.value), 400); }}
          className="flex-1 text-sm outline-none placeholder:text-slate-400 text-slate-800" />
        {search && <button onClick={() => setParam("search", "")}><X className="w-4 h-4 text-slate-400" /></button>}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ key: "", label: "All" }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(({ key, label }) => (
          <button key={key} onClick={() => setParam("status", key)}
            className={`shrink-0 h-8 px-3 rounded-full border text-xs font-medium cursor-pointer transition
              ${statusFilter === key ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? Array(4).fill(0).map((_, i) => (
            <div key={i} className="px-4 py-4 animate-pulse flex gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
              <div className="flex-1 space-y-2"><div className="h-3 bg-slate-200 rounded w-3/4" /><div className="h-2.5 bg-slate-100 rounded w-1/2" /></div>
            </div>
          )) : tickets.length === 0 ? (
            <div className="py-14 text-center">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No service requests found</p>
              <Link href="/customer/tickets/new" className="text-indigo-600 text-xs hover:underline mt-1 block">
                Create one →
              </Link>
            </div>
          ) : tickets.map(ticket => {
            const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
            return (
              <Link key={ticket._id} href={`/customer/tickets/${ticket._id}`}
                className="flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition group">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition">{ticket.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ticket.ticketNumber} · {ticket.category} · {fmtDate(ticket.createdAt)}
                    {ticket.technicianId && ` · ${ticket.technicianId.name}`}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${cfg.badge}`}>{cfg.label}</span>
                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CustomerTicketsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">My Requests</h1>
        <Link href="/customer/tickets/new"
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer">
          <Plus className="w-4 h-4" /> New
        </Link>
      </div>
      <Suspense fallback={<div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />}>
        <TicketListContent />
      </Suspense>
    </div>
  );
}