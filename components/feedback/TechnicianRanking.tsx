 'use client'
interface Technician { technicianId: string; name: string; avgRating: number; count: number }

export default function TechnicianRanking({ technicians }: { technicians: Technician[] }) {
  const max = Math.max(...technicians.map(t => t.avgRating), 5)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Technician Ranking</h3>
      {technicians.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No technician data yet</p>
      ) : (
        <div className="space-y-3">
          {technicians.slice(0, 8).map((t, i) => (
            <div key={t.technicianId} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-white' : i === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{t.name || 'Unknown'}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-amber-500 text-xs font-bold">{t.avgRating}★</span>
                    <span className="text-xs text-slate-400">({t.count})</span>
                  </div>
                </div>
                <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${(t.avgRating / max) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}