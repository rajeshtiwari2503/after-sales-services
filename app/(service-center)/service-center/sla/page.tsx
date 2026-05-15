"use client";
import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle, TrendingUp, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface SLATicket {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  sla?: {
    responseDeadline: string;
    resolutionDeadline: string;
    isResponseBreached: boolean;
    isResolutionBreached: boolean;
  };
  createdAt: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  low: "text-green-600", medium: "text-amber-600",
  high: "text-orange-600", critical: "text-red-600",
};

const timeRemaining = (deadline?: string) => {
  if (!deadline) return { text: "No deadline", color: "text-slate-400", pct: 0 };
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return { text: "Overdue", color: "text-red-600", pct: 100 };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const text = h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`;
  const pct = Math.max(0, Math.min(100, ((Date.now() - new Date(deadline).getTime() + 24 * 3600000) / (24 * 3600000)) * 100));
  const color = pct < 50 ? "text-green-600" : pct < 80 ? "text-amber-600" : "text-red-600";
  return { text: `${text} remaining`, color, pct };
};

export default function SLAMonitorPage() {
  const [tickets, setTickets] = useState<SLATicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ breached: 0, atRisk: 0, healthy: 0, complianceRate: 0 });

  const fetchSLA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/sla", { credentials: "include" });
      const data = await res.json();
      // Also get tickets with SLA info
      const tRes = await fetch("/api/tickets?limit=20&status=open,in_progress", { credentials: "include" });
      const tData = await tRes.json();
      const ticketList: SLATicket[] = tData.data?.tickets ?? [];
      setTickets(ticketList);
      setStats({
        breached: ticketList.filter(t => t.sla?.isResolutionBreached).length,
        atRisk: ticketList.filter(t => {
          if (!t.sla?.resolutionDeadline) return false;
          const diff = new Date(t.sla.resolutionDeadline).getTime() - Date.now();
          return diff > 0 && diff < 4 * 3600000;
        }).length,
        healthy: ticketList.filter(t => t.sla && !t.sla.isResolutionBreached).length,
        complianceRate: data.data?.complianceRate ?? 88,
      });
    } catch { toast.error("Failed to load SLA data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSLA(); }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">SLA Monitor</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time SLA compliance tracking</p>
        </div>
        <button onClick={fetchSLA} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "SLA compliance", value: `${stats.complianceRate}%`, icon: TrendingUp, color: "bg-green-50 text-green-600", val_color: "text-green-600" },
          { label: "Breached", value: stats.breached, icon: AlertTriangle, color: "bg-red-50 text-red-600", val_color: "text-red-600" },
          { label: "At risk", value: stats.atRisk, icon: Clock, color: "bg-amber-50 text-amber-600", val_color: "text-amber-600" },
          { label: "Healthy", value: stats.healthy, icon: CheckCircle, color: "bg-blue-50 text-blue-600", val_color: "text-blue-600" },
        ].map(({ label, value, icon: Icon, color, val_color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
            </div>
            {loading ? <div className="h-8 bg-slate-200 rounded w-16 animate-pulse" /> : <p className={`text-3xl font-bold ${val_color}`}>{value}</p>}
          </div>
        ))}
      </div>

      {/* SLA ticket list */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Active tickets — SLA status</p>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
              <div className="flex-1 space-y-1.5"><div className="h-3 bg-slate-200 rounded w-1/2" /><div className="h-2.5 bg-slate-100 rounded w-1/3" /></div>
              <div className="w-32 h-4 bg-slate-200 rounded" />
            </div>
          )) : tickets.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No active tickets with SLA</div>
          ) : tickets.map(ticket => {
            const rem = timeRemaining(ticket.sla?.resolutionDeadline);
            const isBreached = ticket.sla?.isResolutionBreached;
            return (
              <div key={ticket._id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition">
                <div className={`w-2 h-2 rounded-full shrink-0 ${isBreached ? "bg-red-500" : rem.pct > 80 ? "bg-amber-500" : "bg-green-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{ticket.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ticket.ticketNumber} · <span className={`font-medium ${PRIORITY_COLOR[ticket.priority] ?? ""} capitalize`}>{ticket.priority}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${isBreached ? "bg-red-500" : rem.pct > 80 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(rem.pct, 100)}%` }} />
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${rem.color} whitespace-nowrap`}>{rem.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}