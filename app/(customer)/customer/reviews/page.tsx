// "use client";
// import { useState, useEffect } from "react";
// import { Star, Plus, ThumbsUp, X } from "lucide-react";
// import toast from "react-hot-toast";

// interface Review {
//   _id: string;
//   rating: number;
//   title?: string;
//   content: string;
//   isVerified: boolean;
//   createdAt: string;
// }

// const StarRating = ({ value, onChange, size = 5 }: { value: number; onChange?: (v: number) => void; size?: number }) => (
//   <div className="flex items-center gap-1">
//     {Array(5).fill(0).map((_, i) => (
//       <button key={i} type="button" onClick={() => onChange?.(i + 1)}
//         className={`${onChange ? "cursor-pointer" : "cursor-default"}`}>
//         <Star className={`w-${size} h-${size} ${i < value ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
//       </button>
//     ))}
//   </div>
// );

// export default function CustomerReviewsPage() {
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showAdd, setShowAdd] = useState(false);
//   const [form, setForm] = useState({ rating: 5, title: "", content: "" });
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     fetch("/api/feedback", { credentials: "include" })
//       .then(r => r.json()).then(d => setReviews(d.data?.feedbacks ?? []))
//       .catch(() => {}).finally(() => setLoading(false));
//   }, []);

//   const handleSubmit = async () => {
//     if (!form.content.trim()) { toast.error("Please write a review"); return; }
//     setSaving(true);
//     try {
//       const res = await fetch("/api/feedback", {
//         method: "POST", credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) throw new Error();
//       toast.success("Review submitted!");
//       setShowAdd(false);
//       setForm({ rating: 5, title: "", content: "" });
//       // Refresh
//       const r = await fetch("/api/feedback", { credentials: "include" });
//       const d = await r.json();
//       setReviews(d.data?.feedbacks ?? []);
//     } catch { toast.error("Failed to submit review"); }
//     finally { setSaving(false); }
//   };

//   const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
//   const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

//   return (
//     <div className="space-y-5">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-bold text-slate-800">My Reviews</h1>
//         <button onClick={() => setShowAdd(true)}
//           className="flex items-center gap-1.5 h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium cursor-pointer">
//           <Plus className="w-4 h-4" /> Write review
//         </button>
//       </div>

//       {/* Summary */}
//       {reviews.length > 0 && (
//         <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-4">
//           <div className="text-center">
//             <p className="text-4xl font-bold text-slate-800">{avgRating.toFixed(1)}</p>
//             <StarRating value={Math.round(avgRating)} size={4} />
//             <p className="text-xs text-slate-400 mt-1">{reviews.length} reviews</p>
//           </div>
//           <div className="flex-1 space-y-1.5">
//             {[5,4,3,2,1].map(star => {
//               const count = reviews.filter(r => r.rating === star).length;
//               const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
//               return (
//                 <div key={star} className="flex items-center gap-2">
//                   <span className="text-xs text-slate-500 w-3">{star}</span>
//                   <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
//                   <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                     <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
//                   </div>
//                   <span className="text-xs text-slate-400 w-4">{count}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Add review modal */}
//       {showAdd && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
//             <div className="flex items-center justify-between">
//               <h2 className="text-base font-semibold text-slate-800">Rate your experience</h2>
//               <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
//             </div>
//             <div className="flex flex-col items-center gap-2 py-2">
//               <StarRating value={form.rating} onChange={v => setForm(p => ({...p, rating: v}))} size={8} />
//               <p className="text-sm text-slate-600">{["","Poor","Fair","Good","Very good","Excellent"][form.rating]}</p>
//             </div>
//             <div className="space-y-3">
//               <input type="text" placeholder="Title (optional)"
//                 value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
//                 className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:border-amber-400" />
//               <textarea placeholder="Tell us about your experience..." rows={4}
//                 value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))}
//                 className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none" />
//             </div>
//             <div className="flex gap-2">
//               <button onClick={() => setShowAdd(false)}
//                 className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer">Cancel</button>
//               <button onClick={handleSubmit} disabled={saving}
//                 className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-sm font-medium cursor-pointer">
//                 {saving ? "Submitting..." : "Submit review"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Reviews list */}
//       <div className="space-y-3">
//         {loading ? Array(3).fill(0).map((_, i) => (
//           <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-2">
//             <div className="h-4 bg-slate-200 rounded w-1/3" />
//             <div className="h-3 bg-slate-100 rounded w-full" />
//             <div className="h-3 bg-slate-100 rounded w-3/4" />
//           </div>
//         )) : reviews.length === 0 ? (
//           <div className="bg-white rounded-xl border border-slate-200/80 py-14 text-center">
//             <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
//             <p className="text-slate-500 text-sm">No reviews yet</p>
//             <button onClick={() => setShowAdd(true)} className="text-amber-600 text-xs hover:underline mt-1">Write your first review</button>
//           </div>
//         ) : reviews.map(review => (
//           <div key={review._id} className="bg-white rounded-xl border border-slate-200/80 p-4">
//             <div className="flex items-start justify-between mb-2">
//               <div>
//                 <StarRating value={review.rating} size={4} />
//                 {review.title && <p className="text-sm font-semibold text-slate-800 mt-1">{review.title}</p>}
//               </div>
//               <span className="text-xs text-slate-400">{fmtDate(review.createdAt)}</span>
//             </div>
//             <p className="text-sm text-slate-600 leading-relaxed">{review.content}</p>
//             {review.isVerified && (
//               <div className="flex items-center gap-1 mt-2">
//                 <span className="text-[10px] text-green-600 font-medium">✓ Verified purchase</span>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle, Clock, Ticket, ChevronRight, X, Send, Shield, ThumbsUp, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────
interface TicketItem {
  _id: string;
  ticketNumber: string;
  title: string;
  status: string;
  category: string;
  technicianId?: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
  hasFeedback?: boolean;
}

interface FeedbackItem {
  _id: string;
  ticketId: { ticketNumber: string; title: string; status: string } | null;
  rating: number;
  comment?: string;
  categories: string[];
  createdAt: string;
  response?: { content: string; respondedAt: string };
}

// ─── Constants ─────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { key: "service_quality",     label: "Service Quality"   },
  { key: "response_time",       label: "Response Time"     },
  { key: "technician_skill",    label: "Technician Skill"  },
  { key: "communication",       label: "Communication"     },
  { key: "pricing",             label: "Pricing"           },
  { key: "overall_experience",  label: "Overall Experience"},
];

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ─── Star picker ───────────────────────────────────────────────
function StarPicker({ value, onChange, size = 8, readonly = false }: {
  value: number; onChange?: (v: number) => void;
  size?: number; readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}>
          <Star className={`w-${size} h-${size} transition-colors ${
            s <= active
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          }`} />
        </button>
      ))}
    </div>
  );
}

// ─── Feedback Form Modal ───────────────────────────────────────
function FeedbackModal({
  ticket,
  onClose,
  onSubmitted,
}: {
  ticket: TicketItem;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating]         = useState(0);
  const [npsScore, setNpsScore]     = useState<number | null>(null);
  const [comment, setComment]       = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isPublic, setIsPublic]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const toggleCat = (key: string) =>
    setCategories(p => p.includes(key) ? p.filter(c => c !== key) : [...p, key]);

  const handleSubmit = async () => {
    if (!rating) { toast.error("Please select a rating"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId:   ticket._id,
          rating,
          npsScore:   npsScore ?? undefined,
          comment:    comment.trim() || undefined,
          categories: categories.length ? categories : undefined,
          isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
      setTimeout(() => { onSubmitted(); onClose(); }, 2000);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Thank you!</h2>
            <p className="text-slate-500 text-sm mt-2">Your feedback has been submitted.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Rate your service</h2>
                <p className="text-xs text-slate-400 mt-0.5">{ticket.ticketNumber} · {ticket.title}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer transition shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Technician info */}
              {ticket.technicianId && (
                <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3.5 border border-teal-100">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {ticket.technicianId.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs text-teal-600 font-medium">Your technician</p>
                    <p className="text-sm font-bold text-slate-800">{ticket.technicianId.name}</p>
                  </div>
                </div>
              )}

              {/* Star rating */}
              <div className="text-center space-y-3">
                <p className="text-sm font-semibold text-slate-700">How was your overall experience?</p>
                <div className="flex justify-center">
                  <StarPicker value={rating} onChange={setRating} size={10} />
                </div>
                {rating > 0 && (
                  <p className={`text-sm font-bold ${
                    rating >= 4 ? "text-green-600" : rating === 3 ? "text-amber-600" : "text-red-500"
                  }`}>
                    {STAR_LABELS[rating]}
                  </p>
                )}
              </div>

              {/* Categories */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2.5">What went well? <span className="font-normal text-slate-400">(optional)</span></p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map(({ key, label }) => (
                    <button key={key} type="button" onClick={() => toggleCat(key)}
                      className={`h-8 px-3 rounded-full border text-xs font-medium cursor-pointer transition
                        ${categories.includes(key)
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Your feedback <span className="font-normal text-slate-400">(optional)</span></p>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell us about your experience — what was great or what could be improved..."
                  rows={4}
                  maxLength={2000}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 resize-none leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 text-right mt-1">{comment.length}/2000</p>
              </div>

              {/* NPS */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2.5">
                  How likely are you to recommend us? <span className="font-normal text-slate-400">(0–10)</span>
                </p>
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button key={i} type="button" onClick={() => setNpsScore(npsScore === i ? null : i)}
                      className={`w-9 h-9 rounded-lg border text-xs font-bold cursor-pointer transition
                        ${npsScore === i
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : i >= 9 ? "border-green-200 text-green-600 hover:bg-green-50"
                          : i >= 7 ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                          : "border-red-200 text-red-600 hover:bg-red-50"
                        }`}>
                      {i}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                  <span>Not likely</span><span>Very likely</span>
                </div>
              </div>

              {/* Public toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isPublic}
                  onChange={e => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Make feedback public</p>
                  <p className="text-xs text-slate-400">Others can see your review</p>
                </div>
              </label>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={onClose}
                className="flex-1 h-11 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting || !rating}
                className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-semibold cursor-pointer transition flex items-center justify-center gap-2">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                  : <><Send className="w-4 h-4" />Submit feedback</>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Customer Reviews Page ────────────────────────────────
export default function CustomerReviewsPage() {
  const [tab, setTab]                 = useState<"pending" | "submitted">("pending");
  const [resolvedTickets, setResolved] = useState<TicketItem[]>([]);
  const [feedbacks, setFeedbacks]     = useState<FeedbackItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedTicket, setSelected] = useState<TicketItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketRes, feedbackRes] = await Promise.all([
        fetch("/api/tickets?status=resolved,closed&limit=50", { credentials: "include" }),
        fetch("/api/feedback?limit=50", { credentials: "include" }),
      ]);

      const [ticketData, feedbackData] = await Promise.all([
        ticketRes.json(), feedbackRes.json(),
      ]);

      const allTickets: TicketItem[] = ticketData.data?.tickets ?? [];
      const allFeedbacks: FeedbackItem[] = feedbackData.data?.feedbacks ?? [];

      // Mark tickets that already have feedback
      const feedbackTicketIds = new Set(
        allFeedbacks.map((f: any) => f.ticketId?._id?.toString() ?? f.ticketId?.toString())
      );

      const ticketsWithStatus = allTickets.map(t => ({
        ...t,
        hasFeedback: feedbackTicketIds.has(t._id.toString()),
      }));

      setResolved(ticketsWithStatus);
      setFeedbacks(allFeedbacks);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pendingTickets  = resolvedTickets.filter(t => !t.hasFeedback);
  const reviewedTickets = resolvedTickets.filter(t => t.hasFeedback);

  const avgRating = feedbacks.length
    ? feedbacks.reduce((s, f) => s + (f.rating ?? 0), 0) / feedbacks.length
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Reviews</h1>
          <p className="text-xs text-slate-400 mt-0.5">Rate your service experiences</p>
        </div>
        {feedbacks.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <StarPicker value={Math.round(avgRating)} readonly size={4} />
            <span className="text-sm font-bold text-amber-700">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-slate-500">avg · {feedbacks.length} reviews</span>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending review",  value: pendingTickets.length,  color: "text-amber-600",  bg: "bg-amber-50",  icon: Clock },
          { label: "Reviewed",        value: reviewedTickets.length, color: "text-green-600",  bg: "bg-green-50",  icon: CheckCircle },
          { label: "Total resolved",  value: resolvedTickets.length, color: "text-indigo-600", bg: "bg-indigo-50", icon: Ticket },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl w-fit">
        {([
          { key: "pending",   label: `Pending review (${pendingTickets.length})`  },
          { key: "submitted", label: `Submitted (${feedbacks.length})` },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`h-9 px-4 rounded-lg text-sm font-medium cursor-pointer transition
              ${tab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Pending review tab */}
      {tab === "pending" && (
        <div className="space-y-3">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse flex gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="w-28 h-9 bg-slate-200 rounded-xl" />
            </div>
          )) : pendingTickets.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 py-14 text-center">
              <CheckCircle className="w-10 h-10 text-green-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No pending reviews</p>
            </div>
          ) : pendingTickets.map(ticket => (
            <div key={ticket._id} className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-amber-200 transition">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Ticket className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{ticket.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-slate-400">
                    <span className="font-mono">{ticket.ticketNumber}</span>
                    <span>·</span>
                    <span className="capitalize">{ticket.category}</span>
                    <span>·</span>
                    <span>{fmtDate(ticket.updatedAt)}</span>
                  </div>
                  {ticket.technicianId && (
                    <p className="text-xs text-teal-600 mt-1 font-medium">
                      Technician: {ticket.technicianId.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelected(ticket)}
                  className="flex items-center gap-1.5 h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold cursor-pointer transition shrink-0">
                  <Star className="w-3.5 h-3.5" /> Rate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submitted reviews tab */}
      {tab === "submitted" && (
        <div className="space-y-3">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          )) : feedbacks.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 py-14 text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No reviews submitted yet</p>
              <p className="text-xs text-slate-400 mt-1">Rate your resolved tickets from the Pending tab</p>
            </div>
          ) : feedbacks.map(fb => (
            <div key={fb._id} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-slate-400">
                      {fb.ticketId?.ticketNumber ?? "—"}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                      {fb.ticketId?.title ?? "Ticket"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StarPicker value={fb.rating} readonly size={4} />
                    <span className="text-[10px] text-slate-400">{fmtDate(fb.createdAt)}</span>
                  </div>
                </div>

                {/* Categories */}
                {fb.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {fb.categories.map(c => (
                      <span key={c} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
                        {CATEGORY_OPTIONS.find(o => o.key === c)?.label ?? c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comment */}
                {fb.comment && (
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">
                    "{fb.comment}"
                  </p>
                )}
              </div>

              {/* Admin response */}
              {fb.response?.content && (
                <div className="bg-indigo-50 border-t border-indigo-100 px-4 py-3">
                  <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                    Response from team
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">{fb.response.content}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{fmtDate(fb.response.respondedAt)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Feedback modal */}
      {selectedTicket && (
        <FeedbackModal
          ticket={selectedTicket}
          onClose={() => setSelected(null)}
          onSubmitted={fetchData}
        />
      )}
    </div>
  );
}