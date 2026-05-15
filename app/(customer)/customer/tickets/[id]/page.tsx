"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Star, Clock, CheckCircle, AlertCircle, RefreshCw, Phone } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_STEPS = [
  { key: "open", label: "Request received", desc: "We've received your request" },
  { key: "in_progress", label: "Technician assigned", desc: "A technician is working on it" },
  { key: "pending_parts", label: "Parts ordered", desc: "Waiting for parts" },
  { key: "resolved", label: "Service complete", desc: "Issue has been resolved" },
];

const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";
const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-green-50 text-green-700 border-green-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  critical: "bg-red-50 text-red-700 border-red-100",
};

export default function CustomerTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`, { credentials: "include" });
      const data = await res.json();
      setTicket(data.data ?? data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const submitReview = async () => {
    if (!reviewText.trim()) { toast.error("Please write a review"); return; }
    setSubmittingReview(true);
    try {
      await fetch("/api/feedback", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content: reviewText, ticketId: id }),
      });
      toast.success("Thank you for your review!");
      setShowReview(false);
    } catch { toast.error("Failed to submit review"); }
    finally { setSubmittingReview(false); }
  };

  const currentStepIdx = ticket ? STATUS_STEPS.findIndex(s => s.key === ticket.status) : -1;
  const isResolved = ["resolved", "closed"].includes(ticket?.status ?? "");

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/2" />
        <div className="bg-white rounded-xl border border-slate-200 h-48" />
        <div className="bg-white rounded-xl border border-slate-200 h-32" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-slate-600 font-medium">Ticket not found</p>
        <Link href="/customer/tickets" className="text-indigo-600 text-sm hover:underline">Back to my requests</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/customer/tickets"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-slate-400">{ticket.ticketNumber}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${PRIORITY_BADGE[ticket.priority] ?? ""}`}>
              {ticket.priority}
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-800 truncate mt-0.5">{ticket.title}</h1>
        </div>
        <button onClick={fetchTicket} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress tracker */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Request status</p>
        <div className="relative">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-100" />
          <div className="absolute top-4 left-4 h-0.5 bg-indigo-500 transition-all"
            style={{ width: currentStepIdx >= 0 ? `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` : "0%" }} />
          <div className="relative flex justify-between">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIdx;
              const current = i === currentStepIdx;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 w-1/4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition
                    ${done ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}>
                    {done
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : <div className={`w-2 h-2 rounded-full ${current ? "bg-indigo-300" : "bg-slate-200"}`} />
                    }
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-medium leading-tight ${current ? "text-indigo-600" : done ? "text-slate-600" : "text-slate-400"}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Technician info */}
      {ticket.technicianId && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Your technician</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0">
              {ticket.technicianId.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{ticket.technicianId.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs text-slate-500">4.8 · Verified technician</span>
              </div>
            </div>
            <Link href={`/customer/chat/${id}`}
              className="flex items-center gap-1.5 h-9 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-medium cursor-pointer hover:bg-indigo-100 transition">
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </Link>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Issue description</p>
        <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full capitalize border border-slate-200">{ticket.category}</span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full border border-slate-200">
            Created: {fmtDate(ticket.createdAt)}
          </span>
        </div>
      </div>

      {/* Notes from technician */}
      {ticket.notes?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Updates</p>
          <div className="space-y-3">
            {ticket.notes.filter((n: any) => !n.isInternal).map((note: any, i: number) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {note.authorName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-700">{note.authorName}</span>
                    <span className="text-[10px] text-slate-400">{fmtDateTime(note.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review CTA */}
      {isResolved && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">How was your experience?</p>
              <p className="text-xs text-slate-500 mt-0.5">Rate the service to help us improve</p>
            </div>
            <button onClick={() => setShowReview(true)}
              className="flex items-center gap-1.5 h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-medium cursor-pointer">
              <Star className="w-3.5 h-3.5" /> Rate
            </button>
          </div>
        </div>
      )}

      {/* Review modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-800 text-center">Rate your service</h2>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className="cursor-pointer">
                  <Star className={`w-8 h-8 transition ${s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                </button>
              ))}
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
              placeholder="Tell us about your experience..." rows={3}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setShowReview(false)}
                className="flex-1 h-10 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-pointer">Cancel</button>
              <button onClick={submitReview} disabled={submittingReview}
                className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-sm font-medium cursor-pointer">
                {submittingReview ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}