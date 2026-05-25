"use client";

import { useState } from "react";
import { AlertTriangle, X, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  ticketId: string;
  ticketNumber: string;
  status: string;
  onEscalated?: () => void;
}

export default function TicketEscalateButton({ ticketId, ticketNumber, status, onEscalated }: Props) {
  const [open, setOpen]       = useState(false);
  const [reason, setReason]   = useState("");
  const [loading, setLoading] = useState(false);

  const blocked = ["resolved", "closed", "cancelled"].includes(status);

  const handleEscalate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/escalate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || "SLA at risk — manual escalation" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Escalation failed");
      toast.success(`Ticket ${ticketNumber} escalated`);
      setOpen(false);
      setReason("");
      onEscalated?.();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Escalation failed");
    } finally {
      setLoading(false);
    }
  };

  if (blocked) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-8 px-3 border border-amber-200 bg-amber-50 rounded-lg text-xs text-amber-800 hover:bg-amber-100 transition cursor-pointer"
      >
        <AlertTriangle className="w-3.5 h-3.5" /> Escalate
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Escalate {ticketNumber}
              </h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500">
                Supervisors will be notified. Priority will be raised if below critical.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for escalation (optional)"
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setOpen(false)} className="h-9 px-4 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                disabled={loading}
                className="flex items-center gap-2 h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium cursor-pointer disabled:opacity-60"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Confirm escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
