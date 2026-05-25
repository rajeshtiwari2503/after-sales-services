"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Brain, RefreshCw, AlertTriangle, TrendingUp, TrendingDown,
  Minus, Smile, Frown, Meh, Zap, BarChart2, Bell, MessageSquare, Star,
} from "lucide-react";

interface SentimentData {
  overall: { score: number; label: "positive" | "neutral" | "negative"; distribution: { positive: number; neutral: number; negative: number } };
  avgNPS: number;
  avgRating: number;
  topKeywords: string[];
  recentFeedbacks: {
    _id: string; comment?: string; rating: number;
    sentiment?: { score: number; label: string }; createdAt: string;
  }[];
  total: number;
}

interface SmartAlert {
  type: "sla_breach" | "low_stock" | "high_volume" | "new_feedback";
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  count?: number;
  link?: string;
  createdAt: string;
}

const SENTIMENT_COLOR: Record<string, string> = {
  positive: "text-green-600 bg-green-50 border-green-100",
  neutral:  "text-amber-600 bg-amber-50  border-amber-100",
  negative: "text-red-600   bg-red-50    border-red-100",
};
const SENTIMENT_ICON: Record<string, any> = {
  positive: Smile, neutral: Meh, negative: Frown,
};
const ALERT_COLOR: Record<string, string> = {
  critical: "border-red-100 bg-red-50 text-red-700",
  warning:  "border-amber-100 bg-amber-50 text-amber-700",
  info:     "border-blue-100 bg-blue-50 text-blue-700",
};

export default function AIPage() {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [alerts,    setAlerts]    = useState<SmartAlert[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sentRes, alertRes] = await Promise.all([
        fetch("/api/feedback/sentiment", { credentials: "include" }),
        fetch("/api/notifications/smart-alerts", { credentials: "include" }),
      ]);
      const [sentData, alertData] = await Promise.all([sentRes.json(), alertRes.json()]);
      setSentiment(sentData.data ?? null);
      setAlerts(alertData.data?.alerts ?? alertData.alerts ?? []);
    } catch (e: any) {
      setError(e.message ?? "Failed to load AI dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fmtScore = (n: number) => `${Math.round(n * 100)}%`;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 p-6">
        <AlertTriangle className="w-10 h-10 text-amber-400" />
        <p className="text-slate-600 font-semibold">{error}</p>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm cursor-pointer">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-600" /> AI Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Sentiment analysis, smart alerts, and service insights</p>
        </div>
        <button onClick={fetchAll} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 bg-white cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Smart Alerts ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-bold text-slate-800">Smart Alerts</h2>
          {alerts.filter(a => a.severity === "critical").length > 0 && (
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {alerts.filter(a => a.severity === "critical").length} critical
            </span>
          )}
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-20" />
            All clear! No alerts at this time.
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const Icon = alert.severity === "critical" ? AlertTriangle : alert.severity === "warning" ? Zap : Bell;
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${ALERT_COLOR[alert.severity]}`}>
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{alert.title}</p>
                    <p className="text-xs mt-0.5 opacity-80">{alert.message}</p>
                  </div>
                  {alert.count && (
                    <span className="text-lg font-bold tabular-nums">{alert.count}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Sentiment Overview ── */}
      {!loading && sentiment && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Avg Rating",  value: `${sentiment.avgRating.toFixed(1)} ★`, icon: <Star className="w-4 h-4" />, color: "bg-amber-50 text-amber-600" },
              { label: "Avg NPS",     value: sentiment.avgNPS.toFixed(1), icon: <TrendingUp className="w-4 h-4" />, color: "bg-indigo-50 text-indigo-600" },
              { label: "Total Reviews", value: sentiment.total, icon: <MessageSquare className="w-4 h-4" />, color: "bg-violet-50 text-violet-600" },
              { label: "Positive %",   value: `${Math.round((sentiment.overall.distribution.positive / (sentiment.total || 1)) * 100)}%`, icon: <Smile className="w-4 h-4" />, color: "bg-green-50 text-green-600" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-600" /> Sentiment Distribution
              </h3>
              {[
                { key: "positive", label: "Positive", color: "bg-green-500", pct: sentiment.overall.distribution.positive },
                { key: "neutral",  label: "Neutral",  color: "bg-amber-400", pct: sentiment.overall.distribution.neutral },
                { key: "negative", label: "Negative", color: "bg-red-500",   pct: sentiment.overall.distribution.negative },
              ].map(item => (
                <div key={item.key} className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="text-slate-400">{Math.round(item.pct)}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}

              {/* Top keywords */}
              {sentiment.topKeywords?.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Top Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {sentiment.topKeywords.map(kw => (
                      <span key={kw} className="text-[11px] font-medium px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full border border-violet-100">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent feedback with sentiment */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" /> Recent Feedback
              </h3>
              <div className="space-y-3">
                {(sentiment.recentFeedbacks ?? []).slice(0, 5).map(fb => {
                  const label  = fb.sentiment?.label ?? "neutral";
                  const Icon   = SENTIMENT_ICON[label] ?? Meh;
                  return (
                    <div key={fb._id} className={`flex items-start gap-3 p-3 rounded-xl border ${SENTIMENT_COLOR[label]}`}>
                      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed line-clamp-2">{fb.comment ?? "No comment"}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] opacity-70">
                          <span>{"★".repeat(fb.rating)} ({fb.rating}/5)</span>
                          <span className="capitalize">{label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!sentiment.recentFeedbacks?.length && (
                  <p className="text-slate-400 text-sm text-center py-4">No feedback data yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {loading && !sentiment && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse h-28" />
          ))}
        </div>
      )}
    </div>
  );
}
