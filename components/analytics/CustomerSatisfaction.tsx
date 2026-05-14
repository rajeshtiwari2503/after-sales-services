"use client";

import { Star, TrendingUp, Users, Clock, CheckCircle } from "lucide-react";

interface SatisfactionData {
  csatScore: number;
  avgResolutionHours: number;
  totalResolved: number;
  resolutionRate: number;
}

interface Props {
  data: SatisfactionData | null;
  loading: boolean;
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-5 h-5 ${
            s <= Math.round(score)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200 fill-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function ScoreRing({ score, max = 5 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = score >= 4 ? "#639922" : score >= 3 ? "#EF9F27" : "#E24B4A";

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" role="img" aria-label={`CSAT score ${score} out of ${max}`}>
      <title>Customer satisfaction score</title>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
      />
      <text x="50" y="44" textAnchor="middle" fontSize="20" fontWeight="500" fill="var(--color-text-primary)">
        {score.toFixed(1)}
      </text>
      <text x="50" y="58" textAnchor="middle" fontSize="10" fill="var(--color-text-secondary)">
        / {max}.0
      </text>
    </svg>
  );
}

export default function CustomerSatisfaction({ data, loading }: Props) {
  const metrics = data ? [
    {
      label: "Tickets resolved",
      value: data.totalResolved,
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      color: "text-green-600",
    },
    {
      label: "Resolution rate",
      value: `${data.resolutionRate}%`,
      icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
      color: "text-blue-600",
    },
    {
      label: "Avg resolution time",
      value: `${data.avgResolutionHours}h`,
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      color: "text-amber-600",
    },
  ] : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Star className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Customer satisfaction</p>
          <p className="text-xs text-slate-400">Based on resolution performance</p>
        </div>
      </div>

      {loading ? (
        <div className="p-5 space-y-4 animate-pulse">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-28" />
              <div className="h-3 bg-slate-100 rounded w-20" />
              <div className="h-3 bg-slate-100 rounded w-32" />
            </div>
          </div>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg" />
          ))}
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center py-10 text-slate-400 text-sm">
          No satisfaction data
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Score display */}
          <div className="flex items-center gap-5">
            <ScoreRing score={data.csatScore} />
            <div>
              <p className="text-lg font-bold text-slate-800 mb-1">
                {data.csatScore >= 4.5 ? "Excellent" :
                 data.csatScore >= 4 ? "Very good" :
                 data.csatScore >= 3 ? "Good" :
                 data.csatScore >= 2 ? "Fair" : "Needs improvement"}
              </p>
              <StarRating score={data.csatScore} />
              <p className="text-xs text-slate-400 mt-1.5">
                Based on {data.totalResolved} resolved tickets
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-2.5">
            {metrics.map(({ label, value, icon, color }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  {icon}
                  {label}
                </div>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Overall performance</span>
              <span className="font-medium">{Math.round((data.csatScore / 5) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  data.csatScore >= 4 ? "bg-green-500" :
                  data.csatScore >= 3 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${(data.csatScore / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}