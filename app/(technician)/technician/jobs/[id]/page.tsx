"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Play, Pause, CheckCircle, Camera, MessageSquare,
  Clock, User, MapPin, Phone, Package, AlertTriangle, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import TicketParts from "@/components/tickets/TicketParts";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Not started", color: "text-blue-600", bg: "bg-blue-50" },
  in_progress: { label: "In progress", color: "text-amber-600", bg: "bg-amber-50" },
  pending_parts: { label: "Waiting for parts", color: "text-violet-600", bg: "bg-violet-50" },
  pending_customer: { label: "Waiting for customer", color: "text-orange-600", bg: "bg-orange-50" },
  resolved: { label: "Completed", color: "text-green-600", bg: "bg-green-50" },
  closed: { label: "Closed", color: "text-slate-600", bg: "bg-slate-100" },
};

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";
const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`, { credentials: "include" });
      const data = await res.json();
      setTicket(data.data ?? data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchJob(); }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated");
      fetchJob();
    } catch { toast.error("Failed to update status"); }
    finally { setUpdating(false); }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/tickets/${id}/notes`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: note, isInternal: false }),
      });
      if (!res.ok) throw new Error();
      toast.success("Update sent to customer");
      setNote("");
      fetchJob();
    } catch { toast.error("Failed to add note"); }
    finally { setAddingNote(false); }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/2" />
        <div className="bg-white rounded-xl border border-slate-200 h-48" />
        <div className="bg-white rounded-xl border border-slate-200 h-36" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-slate-600">Job not found</p>
        <Link href="/technician/jobs" className="text-indigo-600 text-sm hover:underline mt-2 block">Back to jobs</Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
  const isActive = !["resolved", "closed", "cancelled"].includes(ticket.status);
  const canStart = ticket.status === "open";
  const canPause = ticket.status === "in_progress";
  const canResume = ticket.status === "pending_customer";
  const canComplete = ticket.status === "in_progress";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/technician/jobs"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-slate-400">{ticket.ticketNumber}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
            {ticket.sla?.isResolutionBreached && (
              <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-semibold">
                SLA Breached
              </span>
            )}
          </div>
          <h1 className="text-base font-bold text-slate-800 truncate mt-0.5">{ticket.title}</h1>
        </div>
        <button onClick={fetchJob}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action buttons */}
      {isActive && (
        <div className="flex items-center gap-2 flex-wrap">
          {canStart && (
            <button onClick={() => updateStatus("in_progress")} disabled={updating}
              className="flex items-center gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium cursor-pointer transition">
              {updating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
              Start job
            </button>
          )}
          {canPause && (
            <button onClick={() => updateStatus("pending_customer")} disabled={updating}
              className="flex items-center gap-2 h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium cursor-pointer transition">
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}
          {canResume && (
            <button onClick={() => updateStatus("in_progress")} disabled={updating}
              className="flex items-center gap-2 h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium cursor-pointer transition">
              <Play className="w-4 h-4" /> Resume
            </button>
          )}
          {canComplete && (
            <button onClick={() => updateStatus("resolved")} disabled={updating}
              className="flex items-center gap-2 h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium cursor-pointer transition">
              <CheckCircle className="w-4 h-4" /> Mark complete
            </button>
          )}
          <button onClick={() => updateStatus("pending_parts")} disabled={updating}
            className="flex items-center gap-2 h-10 px-4 border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-xl text-sm font-medium cursor-pointer transition">
            <Package className="w-4 h-4" /> Needs parts
          </button>
          <Link href={`/technician/chat/${id}`}
            className="flex items-center gap-2 h-10 px-4 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium cursor-pointer transition">
            <MessageSquare className="w-4 h-4" /> Chat
          </Link>
          <Link href={`/technician/photos/${id}`}
            className="flex items-center gap-2 h-10 px-4 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium cursor-pointer transition">
            <Camera className="w-4 h-4" /> Photos ({ticket.attachments?.filter((a: any) => a.type?.startsWith("image/")).length ?? 0})
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        {/* Left */}
        <div className="space-y-4">
          {/* Issue details */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Issue description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full capitalize border border-slate-200">{ticket.category}</span>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border capitalize ${
                ticket.priority === "critical" ? "bg-red-50 text-red-700 border-red-100" :
                ticket.priority === "high" ? "bg-orange-50 text-orange-700 border-orange-100" :
                ticket.priority === "medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
                "bg-green-50 text-green-700 border-green-100"
              }`}>{ticket.priority} priority</span>
            </div>
          </div>

          {/* Parts used */}
          <TicketParts ticketId={id} />

          {/* Add update */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800">Send update to customer</p>
            </div>
            <div className="p-4 space-y-3">
              <textarea
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="e.g. Inspected the unit. Compressor needs replacement. Ordering parts — ETA 2 days."
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
              />
              <button onClick={addNote} disabled={addingNote || !note.trim()}
                className="flex items-center gap-2 h-9 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-sm font-medium cursor-pointer transition">
                {addingNote
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                  : "Send update"
                }
              </button>
            </div>
          </div>

          {/* Timeline */}
          {ticket.timeline?.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Timeline ({ticket.timeline.length})</p>
              </div>
              <div className="p-4 space-y-4">
                {[...ticket.timeline].reverse().map((event: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">{event.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{fmtDateTime(event.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Customer info */}
          {ticket.customerId && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Customer</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                  {ticket.customerId.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{ticket.customerId.name}</p>
                  <p className="text-xs text-slate-400">{ticket.customerId.email}</p>
                </div>
              </div>
              {ticket.customerId.phone && (
                <a href={`tel:${ticket.customerId.phone}`}
                  className="flex items-center gap-2 w-full h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition">
                  <Phone className="w-4 h-4 text-green-600" />
                  {ticket.customerId.phone}
                </a>
              )}
            </div>
          )}

          {/* Job details */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Job details</p>
            <div className="space-y-2.5 text-xs">
              {[
                { label: "Created", value: fmtDate(ticket.createdAt) },
                { label: "Updated", value: fmtDate(ticket.updatedAt) },
                { label: "Est. completion", value: fmtDate(ticket.estimatedCompletionDate) },
                { label: "Category", value: ticket.category, capitalize: true },
                { label: "Tenant", value: ticket.tenantId },
              ].map(({ label, value, capitalize }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className={`font-medium text-slate-700 ${capitalize ? "capitalize" : ""}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SLA */}
          {ticket.sla && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">SLA Status</p>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Response</span>
                  <span className={`font-medium ${ticket.sla.isResponseBreached ? "text-red-600" : "text-green-600"}`}>
                    {ticket.sla.isResponseBreached ? "⚠ Breached" : "✓ Met"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Resolution</span>
                  <span className={`font-medium ${ticket.sla.isResolutionBreached ? "text-red-600" : "text-green-600"}`}>
                    {ticket.sla.isResolutionBreached ? "⚠ Breached" : "✓ On track"}
                  </span>
                </div>
                {ticket.sla.resolutionDeadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Deadline</span>
                    <span className="font-medium text-slate-700">{fmtDateTime(ticket.sla.resolutionDeadline)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes from others */}
          {ticket.notes?.filter((n: any) => !n.isInternal).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Customer messages</p>
              </div>
              <div className="divide-y divide-slate-100">
                {ticket.notes.filter((n: any) => !n.isInternal).slice(-3).map((note: any, i: number) => (
                  <div key={i} className="px-4 py-3">
                    <p className="text-xs font-semibold text-slate-700">{note.authorName}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{note.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{fmtDateTime(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}