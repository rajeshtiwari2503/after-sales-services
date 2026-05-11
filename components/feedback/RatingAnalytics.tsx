'use client'
interface Props { distribution: Record<string, number>; average: number }

export default function RatingAnalytics({ distribution, average }: Props) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0)
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-semibold text-slate-800 mb-1">Rating Distribution</h3>
      <p className="text-3xl font-bold text-indigo-700 mb-4">
        {average} <span className="text-base font-normal text-slate-400">/ 5 avg</span>
      </p>
      <div className="space-y-2">
        {[5,4,3,2,1].map(star => {
          const count = distribution[String(star)] || 0
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-5 text-amber-500 font-semibold">{star}★</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }} />
              </div>
              <span className="w-10 text-right text-slate-500">{pct}%</span>
              <span className="w-8 text-right text-slate-400 text-xs">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}