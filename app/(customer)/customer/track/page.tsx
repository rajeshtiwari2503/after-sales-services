"use client";
import { useState } from "react";
import { Search, MapPin, Clock, CheckCircle, User, Phone, Star, AlertCircle } from "lucide-react";

const STATUS_STEPS = [
  { key: "open", label: "Request received", icon: "📋" },
  { key: "in_progress", label: "Technician assigned", icon: "👨‍🔧" },
  { key: "pending_parts", label: "Parts ordered", icon: "📦" },
  { key: "resolved", label: "Service completed", icon: "✅" },
];

export default function TrackPage() {
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!ticketId.trim()) return;
    setLoading(true); setError(""); setTicket(null);
    try {
      // Search by ticket number
      const res = await fetch(`/api/tickets?search=${ticketId}`, { credentials: "include" });
      const data = await res.json();
      const found = data.data?.tickets?.[0];
      if (!found) { setError("Ticket not found. Please check the ticket number."); return; }
      setTicket(found);
    } catch { setError("Failed to track ticket. Please try again."); }
    finally { setLoading(false); }
  };

  const currentStepIdx = ticket ? STATUS_STEPS.findIndex(s => s.key === ticket.status) : -1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Track your request</h1>
        <p className="text-xs text-slate-400 mt-0.5">Enter your ticket number to track live status</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 h-12 bg-white border border-slate-200 rounded-xl px-4">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input type="text" placeholder="e.g. TKT-000042" value={ticketId}
            onChange={e => setTicketId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="flex-1 text-sm outline-none placeholder:text-slate-400 text-slate-800" />
        </div>
        <button onClick={handleSearch} disabled={loading || !ticketId.trim()}
          className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-medium cursor-pointer transition">
          {loading ? "Searching..." : "Track"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {ticket && (
        <div className="space-y-4">
          {/* Ticket info */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="font-mono text-xs text-slate-400">{ticket.ticketNumber}</span>
                <h2 className="text-base font-semibold text-slate-800 mt-0.5">{ticket.title}</h2>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border capitalize ${
                ticket.priority === "critical" ? "bg-red-50 text-red-700 border-red-100" :
                ticket.priority === "high" ? "bg-orange-50 text-orange-700 border-orange-100" :
                "bg-amber-50 text-amber-700 border-amber-100"
              }`}>{ticket.priority}</span>
            </div>

            {/* Progress steps */}
            <div className="mt-4">
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= currentStepIdx;
                  const current = i === currentStepIdx;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-0.5 ${done && i < currentStepIdx ? "bg-indigo-500" : "bg-slate-200"}`} />
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 border-2 transition
                        ${done ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}>
                        {done ? <CheckCircle className="w-4 h-4 text-white" /> : <span className="text-base">{step.icon}</span>}
                      </div>
                      <p className={`text-[10px] mt-1.5 text-center leading-tight ${current ? "text-indigo-600 font-semibold" : done ? "text-slate-600" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Technician info */}
          {ticket.technicianId && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Assigned technician</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">
                  {ticket.technicianId.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{ticket.technicianId.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-500">4.8 rating</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}