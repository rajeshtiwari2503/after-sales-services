"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Clock, CheckCircle, AlertCircle, ArrowRight, Star, MapPin, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  technicianId?: { name: string };
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string; icon: React.ReactNode }> = {
  open: { label: "Awaiting", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-100", icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: "In Progress", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-100", icon: <Clock className="w-3 h-3" /> },
  pending_parts: { label: "Parts pending", dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700 border-violet-100", icon: <AlertCircle className="w-3 h-3" /> },
  pending_customer: { label: "Your action needed", dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-100", icon: <AlertCircle className="w-3 h-3" /> },
  resolved: { label: "Resolved", dot: "bg-green-500", badge: "bg-green-50 text-green-700 border-green-100", icon: <CheckCircle className="w-3 h-3" /> },
  closed: { label: "Closed", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200", icon: <CheckCircle className="w-3 h-3" /> },
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    fetch("/api/tickets?limit=10", { credentials: "include" })
      .then(r => r.json())
      .then(d => setTickets(d.data?.tickets ?? []))
      .catch(() => toast.error("Failed to load tickets"))
      .finally(() => setLoading(false));
  }, []);

  const active = tickets.filter(t => !["resolved", "closed", "cancelled"].includes(t.status));
  const resolved = tickets.filter(t => ["resolved", "closed"].includes(t.status));
  const needsAction = tickets.filter(t => t.status === "pending_customer");

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Hi, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your service requests</p>
        </div>
        <Link href="/customer/tickets/new"
          className="flex items-center gap-1.5 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition cursor-pointer">
          <Plus className="w-4 h-4" /> New request
        </Link>
      </div>

      {/* Action needed banner */}
      {needsAction.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Your action is needed</p>
              <p className="text-xs text-slate-500">{needsAction[0].title}</p>
            </div>
            <Link href={`/customer/tickets/${needsAction[0]._id}`}
              className="text-xs text-orange-600 font-medium flex items-center gap-1">
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{active.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{resolved.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Resolved</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{tickets.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Total</p>
        </div>
      </div>

      {/* Tickets list */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">My requests</p>
          <Link href="/customer/tickets" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
            All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="px-4 py-4 animate-pulse flex gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          )) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-slate-500 text-sm">No service requests yet</p>
              <Link href="/customer/tickets/new" className="text-indigo-600 text-xs hover:underline">
                Raise your first request →
              </Link>
            </div>
          ) : tickets.slice(0, 6).map((ticket) => {
            const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
            return (
              <Link key={ticket._id} href={`/customer/tickets/${ticket._id}`}
                className="flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition group">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition">
                    {ticket.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-slate-400">{ticket.ticketNumber}</span>
                    {ticket.technicianId && (
                      <>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span className="text-[10px] text-slate-400">{ticket.technicianId.name}</span>
                      </>
                    )}
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] text-slate-400">{fmtDate(ticket.createdAt)}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${cfg.badge}`}>
                  {cfg.icon} {cfg.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Track live", href: "/customer/track", icon: MapPin, color: "bg-blue-50 text-blue-600" },
          { label: "Chat", href: "/customer/chat", icon: MessageSquare, color: "bg-indigo-50 text-indigo-600" },
          { label: "Rate service", href: "/customer/reviews", icon: Star, color: "bg-amber-50 text-amber-600" },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-200 transition text-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
            <span className="text-xs font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}