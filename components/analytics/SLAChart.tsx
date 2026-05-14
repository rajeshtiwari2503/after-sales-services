"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";

interface SLAData {
  total: number;
  responseBreached: number;
  resolutionBreached: number;
  responseMet: number;
  resolutionMet: number;
}

interface Props {
  sla: SLAData | null;
  loading: boolean;
}

function RadialGauge({ value, color }: { value: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" role="img" aria-label={`${value}% compliance`}>
      <title>{value}% SLA compliance</title>
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="8" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
      />
      <text x="36" y="39" textAnchor="middle" fontSize="13" fontWeight="500" fill="var(--color-text-primary)">
        {value}%
      </text>
    </svg>
  );
}

export default function SLAChart({ sla, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-slate-200 rounded-full" />
              <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
          ))}
        </div>
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-3 bg-slate-100 rounded" />
        ))}
      </div>
    );
  }

  if (!sla || sla.total === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">SLA Overview</p>
        </div>
        <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
          No SLA data available
        </div>
      </div>
    );
  }

  const rows = [
    { label: "Total with SLA", value: sla.total, icon: null },
    { label: "Response SLA met", value: `${sla.responseMet}%`, icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" /> },
    { label: "Resolution SLA met", value: `${sla.resolutionMet}%`, icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" /> },
    { label: "Response breached", value: sla.responseBreached, icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" /> },
    { label: "Resolution breached", value: sla.resolutionBreached, icon: <AlertCircle className="w-3.5 h-3.5 text-red-500" /> },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">SLA Overview</p>
          <p className="text-xs text-slate-400">Compliance breakdown</p>
        </div>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-2 gap-4 px-5 py-4 border-b border-slate-100">
        <div className="flex flex-col items-center gap-1">
          <RadialGauge value={sla.responseMet} color="#639922" />
          <p className="text-xs text-slate-500 text-center">Response</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <RadialGauge
            value={sla.resolutionMet}
            color={sla.resolutionMet >= 85 ? "#639922" : sla.resolutionMet >= 70 ? "#EF9F27" : "#E24B4A"}
          />
          <p className="text-xs text-slate-500 text-center">Resolution</p>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {rows.map(({ label, value, icon }) => (
          <div key={label} className="flex items-center justify-between px-5 py-2.5">
            <span className="flex items-center gap-2 text-xs text-slate-500">
              {icon}
              {label}
            </span>
            <span className="text-xs font-semibold text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}