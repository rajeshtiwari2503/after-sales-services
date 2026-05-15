"use client";
import { useState, useEffect } from "react";
import { Star, Plus, ThumbsUp, X } from "lucide-react";
import toast from "react-hot-toast";

interface Review {
  _id: string;
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  createdAt: string;
}

const StarRating = ({ value, onChange, size = 5 }: { value: number; onChange?: (v: number) => void; size?: number }) => (
  <div className="flex items-center gap-1">
    {Array(5).fill(0).map((_, i) => (
      <button key={i} type="button" onClick={() => onChange?.(i + 1)}
        className={`${onChange ? "cursor-pointer" : "cursor-default"}`}>
        <Star className={`w-${size} h-${size} ${i < value ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
      </button>
    ))}
  </div>
);

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", content: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/feedback", { credentials: "include" })
      .then(r => r.json()).then(d => setReviews(d.data?.feedbacks ?? []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.content.trim()) { toast.error("Please write a review"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Review submitted!");
      setShowAdd(false);
      setForm({ rating: 5, title: "", content: "" });
      // Refresh
      const r = await fetch("/api/feedback", { credentials: "include" });
      const d = await r.json();
      setReviews(d.data?.feedbacks ?? []);
    } catch { toast.error("Failed to submit review"); }
    finally { setSaving(false); }
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">My Reviews</h1>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium cursor-pointer">
          <Plus className="w-4 h-4" /> Write review
        </button>
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-slate-800">{avgRating.toFixed(1)}</p>
            <StarRating value={Math.round(avgRating)} size={4} />
            <p className="text-xs text-slate-400 mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-3">{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add review modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Rate your experience</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col items-center gap-2 py-2">
              <StarRating value={form.rating} onChange={v => setForm(p => ({...p, rating: v}))} size={8} />
              <p className="text-sm text-slate-600">{["","Poor","Fair","Good","Very good","Excellent"][form.rating]}</p>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Title (optional)"
                value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
                className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:border-amber-400" />
              <textarea placeholder="Tell us about your experience..." rows={4}
                value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 h-10 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer">Cancel</button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 h-10 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg text-sm font-medium cursor-pointer">
                {saving ? "Submitting..." : "Submit review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {loading ? Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        )) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 py-14 text-center">
            <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No reviews yet</p>
            <button onClick={() => setShowAdd(true)} className="text-amber-600 text-xs hover:underline mt-1">Write your first review</button>
          </div>
        ) : reviews.map(review => (
          <div key={review._id} className="bg-white rounded-xl border border-slate-200/80 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <StarRating value={review.rating} size={4} />
                {review.title && <p className="text-sm font-semibold text-slate-800 mt-1">{review.title}</p>}
              </div>
              <span className="text-xs text-slate-400">{fmtDate(review.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{review.content}</p>
            {review.isVerified && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] text-green-600 font-medium">✓ Verified purchase</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}