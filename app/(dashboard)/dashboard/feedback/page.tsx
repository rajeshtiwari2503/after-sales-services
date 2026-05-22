 "use client";

import { useState, useEffect, useCallback } from "react";
import {
  Star, MessageSquare, TrendingUp, TrendingDown,
  Users, Filter, Search, RefreshCw, X, Send,
  CheckCircle, ThumbsUp, ThumbsDown, Minus,
  BarChart2, ChevronDown, Download, Eye, Reply,
  AlertCircle, Smile, Meh, Frown, Calendar
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────
interface FeedbackItem {
  _id: string;
  ticketId?: { _id: string; ticketNumber: string; title: string; status: string; category: string };
  customerId?: { _id: string; name: string; email: string };
  technicianId?: { _id: string; name: string };
  rating: number;
  npsScore?: number;
  comment?: string;
  categories: string[];
  sentiment?: { label: "positive" | "neutral" | "negative"; score: number };
  isPublic: boolean;
  response?: { content: string; respondedAt: string };
  createdAt: string;
}

interface Analytics {
  avgRating: number;
  total: number;
  npsScore: number;
  distribution: Record<number, number>;
  sentiment: { positive: number; neutral: number; negative: number };
  categoryRatings: Record<string, { avg: number; count: number }>;
  trendData: { date: string; avgRating: number; count: number }[];
  npsBreakdown: { promoters: number; passives: number; detractors: number };
  topTechnicians: { technicianId: string; name: string; avgRating: number; count: number }[];
}

// ─── Constants ─────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  service_quality: "Service Quality", response_time: "Response Time",
  technician_skill: "Technician Skill", communication: "Communication",
  pricing: "Pricing", overall_experience: "Overall Experience",
};

const SENTIMENT_CFG = {
  positive: { icon: Smile,  color: "text-green-600",  bg: "bg-green-50 border-green-100",  label: "Positive" },
  neutral:  { icon: Meh,    color: "text-amber-600",  bg: "bg-amber-50 border-amber-100",  label: "Neutral"  },
  negative: { icon: Frown,  color: "text-red-600",    bg: "bg-red-50 border-red-100",      label: "Negative" },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// ─── Star display ───────────────────────────────────────────────
function Stars({ value, size = 4 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`w-${size} h-${size} ${
          s <= value ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
        }`} />
      ))}
    </div>
  );
}

// ─── Rating donut ───────────────────────────────────────────────
function RatingDonut({ avg, total }: { avg: number; total: number }) {
  const pct = (avg / 5) * 100;
  const r = 36, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = avg >= 4 ? "#22c55e" : avg >= 3 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-black text-slate-800">{avg.toFixed(1)}</p>
        <p className="text-[9px] text-slate-400 font-semibold">{total} reviews</p>
      </div>
    </div>
  );
}

// ─── Trend mini chart ───────────────────────────────────────────
function TrendChart({ data }: { data: { date: string; avgRating: number; count: number }[] }) {
  if (!data.length) return <div className="h-20 flex items-center justify-center text-xs text-slate-400">No trend data</div>;
  const maxR = 5, minR = 0;
  const w = 100 / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => {
    const x = i * w;
    const y = 100 - ((d.avgRating - minR) / (maxR - minR)) * 100;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="relative">
      <svg viewBox="0 0 100 100" className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#trendGrad)"
          points={`0,100 ${points} 100,100`} />
        <polyline fill="none" stroke="#6366f1" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" points={points} />
        {data.map((d, i) => (
          <circle key={i} cx={i * w} cy={100 - ((d.avgRating - minR) / (maxR - minR)) * 100}
            r="2.5" fill="#6366f1">
            <title>{d.date}: {d.avgRating.toFixed(1)} ({d.count} reviews)</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between mt-1 text-[9px] text-slate-400">
        <span>{data[0]?.date?.slice(-5)}</span>
        <span>{data[data.length - 1]?.date?.slice(-5)}</span>
      </div>
    </div>
  );
}

// ─── NPS Gauge ──────────────────────────────────────────────────
function NPSGauge({ score, breakdown }: {
  score: number;
  breakdown: { promoters: number; passives: number; detractors: number };
}) {
  const total = breakdown.promoters + breakdown.passives + breakdown.detractors || 1;
  const color = score >= 50 ? "text-green-600" : score >= 0 ? "text-amber-600" : "text-red-500";
  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className={`text-3xl font-black ${color}`}>{score}</p>
        <p className="text-xs text-slate-400 mt-0.5">Net Promoter Score</p>
      </div>
      <div className="flex rounded-lg overflow-hidden h-3">
        <div className="bg-red-400 transition-all" style={{ width: `${(breakdown.detractors / total) * 100}%` }} title={`Detractors: ${breakdown.detractors}`} />
        <div className="bg-amber-300 transition-all" style={{ width: `${(breakdown.passives / total) * 100}%` }} title={`Passives: ${breakdown.passives}`} />
        <div className="bg-green-400 transition-all" style={{ width: `${(breakdown.promoters / total) * 100}%` }} title={`Promoters: ${breakdown.promoters}`} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Promoters",  value: breakdown.promoters,  color: "text-green-600" },
          { label: "Passives",   value: breakdown.passives,   color: "text-amber-600" },
          { label: "Detractors", value: breakdown.detractors, color: "text-red-500"   },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className={`text-lg font-black ${color}`}>{value}</p>
            <p className="text-[9px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Respond Modal ──────────────────────────────────────────────
function RespondModal({
  feedback,
  onClose,
  onDone,
}: {
  feedback: FeedbackItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const [content, setContent] = useState(feedback.response?.content ?? "");
  const [saving, setSaving]   = useState(false);

  const handleSend = async () => {
    if (!content.trim() || content.trim().length < 10) {
      toast.error("Response must be at least 10 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/feedback/${feedback._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      toast.success("Response sent to customer");
      onDone();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to send response");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Respond to feedback</h2>
            <p className="text-xs text-slate-400 mt-0.5">{feedback.customerId?.name} · {fmtDate(feedback.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original feedback */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <Stars value={feedback.rating} size={4} />
          {feedback.comment && (
            <p className="text-sm text-slate-600 mt-2 italic">"{feedback.comment}"</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Your response *
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Thank the customer and address their feedback professionally..."
            rows={5}
            maxLength={1000}
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 resize-none leading-relaxed"
          />
          <p className="text-[10px] text-slate-400 text-right mt-1">{content.length}/1000</p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 h-10 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={handleSend} disabled={saving || content.trim().length < 10}
            className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-semibold cursor-pointer transition flex items-center justify-center gap-2">
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
              : <><Send className="w-3.5 h-3.5" />Send response</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Feedback Detail Modal ──────────────────────────────────────
function DetailModal({ feedback, onClose, onRespond }: {
  feedback: FeedbackItem;
  onClose: () => void;
  onRespond: () => void;
}) {
  const sentiment = feedback.sentiment?.label;
  const sentCfg = sentiment ? SENTIMENT_CFG[sentiment] : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Feedback detail</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer & ticket */}
          <div className="grid grid-cols-2 gap-3">
            {feedback.customerId && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Customer</p>
                <p className="text-sm font-bold text-slate-800">{feedback.customerId.name}</p>
                <p className="text-xs text-slate-400">{feedback.customerId.email}</p>
              </div>
            )}
            {feedback.ticketId && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Ticket</p>
                <p className="text-xs font-mono text-slate-500">{feedback.ticketId.ticketNumber}</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{feedback.ticketId.title}</p>
              </div>
            )}
          </div>

          {/* Rating + sentiment */}
          <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4 border border-amber-100">
            <div>
              <Stars value={feedback.rating} size={6} />
              <p className="text-2xl font-black text-slate-800 mt-1">{feedback.rating}/5</p>
            </div>
            {sentCfg && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${sentCfg.bg}`}>
                <sentCfg.icon className={`w-5 h-5 ${sentCfg.color}`} />
                <span className={`text-sm font-semibold ${sentCfg.color}`}>{sentCfg.label}</span>
              </div>
            )}
          </div>

          {/* NPS */}
          {feedback.npsScore !== undefined && (
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-xs text-slate-500">NPS Score:</p>
              <span className={`text-lg font-black ${
                feedback.npsScore >= 9 ? "text-green-600" :
                feedback.npsScore >= 7 ? "text-amber-600" : "text-red-500"
              }`}>{feedback.npsScore}/10</span>
            </div>
          )}

          {/* Categories */}
          {feedback.categories?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {feedback.categories.map(c => (
                  <span key={c} className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">
                    {CATEGORY_LABELS[c] ?? c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          {feedback.comment && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Comment</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-200 leading-relaxed italic">
                "{feedback.comment}"
              </p>
            </div>
          )}

          {/* Technician */}
          {feedback.technicianId && (
            <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3 border border-teal-100">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0">
                {feedback.technicianId.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="text-[10px] text-teal-600 font-semibold">Technician</p>
                <p className="text-sm font-bold text-slate-800">{feedback.technicianId.name}</p>
              </div>
            </div>
          )}

          {/* Existing response */}
          {feedback.response?.content && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wide mb-1.5">Your response</p>
              <p className="text-sm text-slate-700 leading-relaxed">{feedback.response.content}</p>
              <p className="text-[10px] text-slate-400 mt-2">{fmtDateTime(feedback.response.respondedAt)}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose}
              className="flex-1 h-10 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-pointer hover:bg-slate-50 transition">
              Close
            </button>
            <button onClick={onRespond}
              className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold cursor-pointer transition flex items-center justify-center gap-2">
              <Reply className="w-4 h-4" />
              {feedback.response ? "Edit response" : "Respond"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks]     = useState<FeedbackItem[]>([]);
  const [analytics, setAnalytics]     = useState<Analytics | null>(null);
  const [loading, setLoading]         = useState(true);
  const [analyticsLoading, setALod]   = useState(true);
  const [tab, setTab]                 = useState<"list" | "analytics">("list");
  const [range, setRange]             = useState("30");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [search, setSearch]           = useState("");
  const [ratingFilter, setRating]     = useState("");
  const [sentimentFilter, setSentiment] = useState("");
  const [responding, setResponding]   = useState<FeedbackItem | null>(null);
  const [viewing, setViewing]         = useState<FeedbackItem | null>(null);
  const LIMIT = 10;

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      if (ratingFilter) params.set("ratingFilter", ratingFilter);
      const res  = await fetch(`/api/feedback?${params}`, { credentials: "include" });
      const data = await res.json();
      let list: FeedbackItem[] = data.data?.feedbacks ?? [];
      // Client-side search filter (name / ticket)
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(f =>
          f.customerId?.name?.toLowerCase().includes(q) ||
          f.ticketId?.ticketNumber?.toLowerCase().includes(q) ||
          f.comment?.toLowerCase().includes(q)
        );
      }
      if (sentimentFilter) {
        list = list.filter(f => f.sentiment?.label === sentimentFilter);
      }
      setFeedbacks(list);
      setTotal(data.data?.total ?? list.length);
    } catch { toast.error("Failed to load feedback"); }
    finally { setLoading(false); }
  }, [page, ratingFilter, search, sentimentFilter]);

  const fetchAnalytics = useCallback(async () => {
    setALod(true);
    try {
      const res  = await fetch(`/api/feedback/analytics?range=${range}`, { credentials: "include" });
      const data = await res.json();
      setAnalytics(data.data ?? null);
    } catch {}
    finally { setALod(false); }
  }, [range]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);
  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feedback? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Feedback deleted");
      fetchFeedbacks();
    } catch { toast.error("Failed to delete"); }
  };

  const exportCSV = () => {
    const rows = [
      ["Customer", "Ticket", "Rating", "NPS", "Sentiment", "Comment", "Responded", "Date"],
      ...feedbacks.map(f => [
        f.customerId?.name ?? "—",
        f.ticketId?.ticketNumber ?? "—",
        f.rating,
        f.npsScore ?? "—",
        f.sentiment?.label ?? "—",
        f.comment?.replace(/,/g, ";") ?? "—",
        f.response ? "Yes" : "No",
        fmtDate(f.createdAt),
      ]),
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `feedback-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const avg = analytics?.avgRating ?? 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Customer Feedback</h1>
          <p className="text-xs text-slate-400 mt-1">
            {total} reviews · Avg {avg.toFixed(1)}/5
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV}
            className="flex items-center gap-2 h-9 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium cursor-pointer transition">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={() => { fetchFeedbacks(); fetchAnalytics(); }}
            className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-white rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Quick KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Total reviews",  value: analytics?.total ?? 0,             color: "text-slate-800" },
          { label: "Avg rating",     value: `${avg.toFixed(1)} ★`,             color: "text-amber-600" },
          { label: "NPS score",      value: analytics?.npsScore ?? 0,          color: analytics?.npsScore ?? 0 >= 0 ? "text-green-600" : "text-red-500" },
          { label: "Positive",       value: analytics?.sentiment.positive ?? 0, color: "text-green-600" },
          { label: "Neutral",        value: analytics?.sentiment.neutral ?? 0,  color: "text-amber-600" },
          { label: "Negative",       value: analytics?.sentiment.negative ?? 0, color: "text-red-500"   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200/80 p-4 text-center">
            {analyticsLoading
              ? <div className="h-7 bg-slate-200 rounded w-12 mx-auto animate-pulse mb-1" />
              : <p className={`text-2xl font-black ${color}`}>{value}</p>
            }
            <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl w-fit">
        {[
          { key: "list",      label: "Feedback list" },
          { key: "analytics", label: "Analytics"     },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`h-9 px-5 rounded-lg text-sm font-medium cursor-pointer transition
              ${tab === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── LIST TAB ── */}
      {tab === "list" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] h-9 bg-slate-50 border border-slate-200 rounded-lg px-3">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input type="text" placeholder="Search by customer, ticket, comment..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400" />
              {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
            </div>

            {/* Rating filter */}
            <select value={ratingFilter} onChange={e => { setRating(e.target.value); setPage(1); }}
              className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} star{r !== 1 ? "s" : ""}</option>)}
            </select>

            {/* Sentiment filter */}
            <select value={sentimentFilter} onChange={e => { setSentiment(e.target.value); setPage(1); }}
              className="h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 bg-slate-50 focus:outline-none cursor-pointer">
              <option value="">All sentiment</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>

            {(ratingFilter || sentimentFilter || search) && (
              <button onClick={() => { setRating(""); setSentiment(""); setSearch(""); setPage(1); }}
                className="flex items-center gap-1 h-9 px-3 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {loading ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                  <div className="w-24 h-4 bg-slate-200 rounded" />
                </div>
                <div className="h-10 bg-slate-100 rounded-lg" />
              </div>
            )) : feedbacks.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/80 py-16 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No feedback found</p>
              </div>
            ) : feedbacks.map(fb => {
              const sentiment = fb.sentiment?.label;
              const sentCfg   = sentiment ? SENTIMENT_CFG[sentiment] : null;
              const initials  = fb.customerId?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

              return (
                <div key={fb._id} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">
                            {fb.customerId?.name ?? "Unknown"}
                          </p>
                          {sentCfg && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sentCfg.bg} ${sentCfg.color}`}>
                              <sentCfg.icon className="w-3 h-3" /> {sentCfg.label}
                            </span>
                          )}
                          {fb.response && (
                            <span className="text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-semibold">
                              Responded
                            </span>
                          )}
                          {fb.isPublic && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
                              Public
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                          {fb.ticketId && (
                            <span className="font-mono">{fb.ticketId.ticketNumber}</span>
                          )}
                          {fb.technicianId && (
                            <><span>·</span><span className="text-teal-600">{fb.technicianId.name}</span></>
                          )}
                          <span>·</span>
                          <span>{fmtDate(fb.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Stars value={fb.rating} size={4} />
                        {fb.npsScore !== undefined && (
                          <span className="text-[10px] text-slate-400">NPS: {fb.npsScore}</span>
                        )}
                      </div>
                    </div>

                    {/* Categories */}
                    {fb.categories?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {fb.categories.map(c => (
                          <span key={c} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {CATEGORY_LABELS[c] ?? c}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comment */}
                    {fb.comment && (
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100 leading-relaxed italic mb-3">
                        "{fb.comment}"
                      </p>
                    )}

                    {/* Admin response preview */}
                    {fb.response?.content && (
                      <div className="bg-indigo-50 rounded-xl px-3.5 py-2.5 border border-indigo-100 mb-3">
                        <p className="text-[10px] text-indigo-600 font-semibold mb-1">Your response</p>
                        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{fb.response.content}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={() => setViewing(fb)}
                        className="flex items-center gap-1.5 h-8 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 cursor-pointer transition">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button onClick={() => setResponding(fb)}
                        className="flex items-center gap-1.5 h-8 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium cursor-pointer transition">
                        <Reply className="w-3.5 h-3.5" />
                        {fb.response ? "Edit response" : "Respond"}
                      </button>
                      <button onClick={() => handleDelete(fb._id)}
                        className="ml-auto flex items-center gap-1.5 h-8 px-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg text-xs cursor-pointer transition">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="h-8 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 disabled:opacity-40 cursor-pointer hover:bg-slate-50 transition">
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg border text-xs font-medium cursor-pointer transition
                        ${p === page ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="h-8 px-3 border border-slate-200 rounded-lg text-xs text-slate-600 disabled:opacity-40 cursor-pointer hover:bg-slate-50 transition">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === "analytics" && (
        <div className="space-y-5">
          {/* Range selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
              {[["7","7 days"],["30","30 days"],["90","90 days"],["365","1 year"]].map(([val, label]) => (
                <button key={val} onClick={() => setRange(val)}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer transition
                    ${range === val ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating overview + NPS + Trend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Rating donut */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <p className="text-sm font-bold text-slate-800 mb-4">Overall Rating</p>
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-32 animate-pulse">
                  <div className="w-28 h-28 rounded-full bg-slate-200" />
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <RatingDonut avg={analytics?.avgRating ?? 0} total={analytics?.total ?? 0} />
                  </div>
                  {/* Rating bars 5→1 */}
                  <div className="space-y-1.5">
                    {[5, 4, 3, 2, 1].map(r => {
                      const count = analytics?.distribution?.[r] ?? 0;
                      const tot   = analytics?.total ?? 1;
                      const pct   = Math.round((count / tot) * 100);
                      return (
                        <div key={r} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-3">{r}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 tabular-nums w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* NPS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <p className="text-sm font-bold text-slate-800 mb-4">Net Promoter Score</p>
              {analyticsLoading ? (
                <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
              ) : analytics?.npsBreakdown ? (
                <NPSGauge score={analytics.npsScore} breakdown={analytics.npsBreakdown} />
              ) : <p className="text-sm text-slate-400 text-center py-8">No NPS data</p>}
            </div>

            {/* Sentiment */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <p className="text-sm font-bold text-slate-800 mb-4">Sentiment Breakdown</p>
              {analyticsLoading ? (
                <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <div className="space-y-4">
                  {(["positive","neutral","negative"] as const).map(key => {
                    const cfg   = SENTIMENT_CFG[key];
                    const val   = analytics?.sentiment?.[key] ?? 0;
                    const total = Object.values(analytics?.sentiment ?? {}).reduce((a, b) => a + b, 0) || 1;
                    const pct   = Math.round((val / total) * 100);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`flex items-center gap-1.5 text-sm font-semibold ${cfg.color}`}>
                            <cfg.icon className="w-4 h-4" /> {cfg.label}
                          </span>
                          <span className="text-sm font-bold text-slate-700">{val} <span className="text-xs text-slate-400">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${
                            key === "positive" ? "bg-green-400" : key === "neutral" ? "bg-amber-400" : "bg-red-400"
                          }`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Trend chart + Category ratings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <p className="text-sm font-bold text-slate-800 mb-4">Rating Trend</p>
              {analyticsLoading ? (
                <div className="h-20 bg-slate-100 rounded animate-pulse" />
              ) : (
                <TrendChart data={analytics?.trendData ?? []} />
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <p className="text-sm font-bold text-slate-800 mb-4">Category Ratings</p>
              {analyticsLoading ? (
                <div className="space-y-3">{Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />
                ))}</div>
              ) : Object.entries(analytics?.categoryRatings ?? {}).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No category data</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(analytics?.categoryRatings ?? {})
                    .sort(([, a], [, b]) => (b as any).avg - (a as any).avg)
                    .map(([cat, val]: any) => (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-600">{CATEGORY_LABELS[cat] ?? cat}</span>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {val.avg} ({val.count})
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
                            style={{ width: `${(val.avg / 5) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Top technicians */}
          {(analytics?.topTechnicians?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <Users className="w-4 h-4 text-teal-600" />
                <p className="text-sm font-bold text-slate-800">Top Rated Technicians</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["#", "Technician", "Avg Rating", "Reviews", "Score"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {analytics!.topTechnicians.map((t, i) => {
                      const init = t.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                      return (
                        <tr key={t.technicianId} className={`hover:bg-slate-50 transition-colors ${i === 0 ? "bg-amber-50/40" : ""}`}>
                          <td className="px-4 py-3 text-xs font-bold text-slate-400">{i === 0 ? "🏆" : `#${i + 1}`}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                                {init}
                              </div>
                              <span className="text-sm font-medium text-slate-800">{t.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Stars value={Math.round(t.avgRating)} size={3} />
                              <span className="text-xs font-bold text-amber-600">{t.avgRating}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 font-semibold">{t.count}</td>
                          <td className="px-4 py-3">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${(t.avgRating / 5) * 100}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {viewing && (
        <DetailModal
          feedback={viewing}
          onClose={() => setViewing(null)}
          onRespond={() => { setResponding(viewing); setViewing(null); }}
        />
      )}
      {responding && (
        <RespondModal
          feedback={responding}
          onClose={() => setResponding(null)}
          onDone={fetchFeedbacks}
        />
      )}
    </div>
  );
}