'use client'
interface Trend { date: string; avgRating: number; count: number }

export default function SatisfactionChart({ trend }: { trend: Trend[] }) {
  const max   = Math.max(...trend.map(t => t.avgRating), 5)
  const h     = 120

  const pts = trend.map((t, i) => {
    const x = (i / (trend.length - 1)) * 100
    const y = h - (t.avgRating / max) * h
    return { x, y, ...t }
  })

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Satisfaction Trend (14 days)</h3>
        <span className="text-xs text-slate-400">Avg rating per day</span>
      </div>

      <svg viewBox={`0 0 100 ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 140 }}>
        {/* Grid lines */}
        {[1,2,3,4,5].map(v => {
          const y = h - (v / max) * h
          return <line key={v} x1={0} y1={y} x2={100} y2={y} stroke="#f1f5f9" strokeWidth={0.4} />
        })}

        {/* Area fill */}
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${h} ${polyline} 100,${h}`}
          fill="url(#grad)"
        />
        <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeLinejoin="round" />

        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={1.8} fill="#6366f1">
            <title>{p.date}: {p.avgRating} ({p.count} reviews)</title>
          </circle>
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
        {trend.filter((_, i) => i % 3 === 0 || i === trend.length - 1).map(t => (
          <span key={t.date}>{t.date.slice(5)}</span>
        ))}
      </div>
    </div>
  )
}