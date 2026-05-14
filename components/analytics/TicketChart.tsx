"use client";

interface Props {
  statusDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  open: "#378ADD",
  in_progress: "#EF9F27",
  resolved: "#639922",
  pending_parts: "#7F77DD",
  pending_customer: "#AFA9EC",
  closed: "#888780",
  cancelled: "#E24B4A",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open", in_progress: "In Progress", resolved: "Resolved",
  pending_parts: "Pending Parts", pending_customer: "Pending Customer",
  closed: "Closed", cancelled: "Cancelled",
};

const CAT_COLORS = ["#378ADD", "#EF9F27", "#639922", "#7F77DD", "#E24B4A", "#1D9E75", "#888780"];

function DonutChart({ data, colors, size = 100, strokeW = 14 }: {
  data: { label: string; value: number; color: string }[];
  colors: string[];
  size?: number;
  strokeW?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribution chart">
      <title>Distribution chart</title>
      {data.map((d, i) => {
        const dash = (d.value / total) * circ;
        const el = (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={strokeW}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="13" fontWeight="500" fill="var(--color-text-primary)">
        {total}
      </text>
      <text x={size / 2} y={size / 2 + 10} textAnchor="middle" fontSize="9" fill="var(--color-text-secondary)">
        total
      </text>
    </svg>
  );
}

export default function TicketChart({ statusDistribution, categoryDistribution, loading }: Props) {
  const statusData = Object.entries(statusDistribution).map(([k, v]) => ({
    label: STATUS_LABELS[k] ?? k,
    value: v,
    color: STATUS_COLORS[k] ?? "#888",
  })).sort((a, b) => b.value - a.value);

  const catEntries = Object.entries(categoryDistribution).sort((a, b) => b[1] - a[1]);
  const catData = catEntries.map(([k, v], i) => ({
    label: k.charAt(0).toUpperCase() + k.slice(1),
    value: v,
    color: CAT_COLORS[i % CAT_COLORS.length],
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-5 animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-2 pt-2">
                {Array(4).fill(0).map((_, j) => <div key={j} className="h-3 bg-slate-100 rounded" />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Status donut */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">By status</p>
          <p className="text-xs text-slate-400">Current distribution</p>
        </div>
        <div className="p-4 flex items-center gap-5">
          <DonutChart data={statusData} colors={Object.values(STATUS_COLORS)} />
          <div className="flex-1 space-y-1.5 min-w-0">
            {statusData.map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-slate-600 flex-1 truncate">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category donut */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">By category</p>
          <p className="text-xs text-slate-400">Ticket types</p>
        </div>
        <div className="p-4 flex items-center gap-5">
          <DonutChart data={catData} colors={CAT_COLORS} />
          <div className="flex-1 space-y-1.5 min-w-0">
            {catData.map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-slate-600 flex-1 truncate">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}