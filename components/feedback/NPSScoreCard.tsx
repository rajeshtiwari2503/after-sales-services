'use client'
interface NPSProps {
  nps: { score: number; promoters: number; passives: number; detractors: number; total: number; label?: string; color?: string }
}

export default function NPSScoreCard({ nps }: NPSProps) {
  const promoterPct  = nps.total > 0 ? Math.round((nps.promoters  / nps.total) * 100) : 0
  const passivePct   = nps.total > 0 ? Math.round((nps.passives   / nps.total) * 100) : 0
  const detractorPct = nps.total > 0 ? Math.round((nps.detractors / nps.total) * 100) : 0

  const scoreColor =
    nps.score >= 70 ? '#10b981' :
    nps.score >= 30 ? '#3730a3' :
    nps.score >= 0  ? '#f59e0b' : '#e11d48'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-semibold text-slate-800 mb-1">NPS Score</h3>
      <div className="flex items-end gap-3 mb-4">
        <span className="text-4xl font-black" style={{ color: scoreColor }}>{nps.score}</span>
        {nps.label && (
          <span className="mb-1 text-sm font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ background: scoreColor }}>{nps.label}</span>
        )}
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-3">
        <div className="bg-green-500 transition-all" style={{ width: `${promoterPct}%` }} title={`Promoters ${promoterPct}%`} />
        <div className="bg-slate-300 transition-all" style={{ width: `${passivePct}%` }}  title={`Passives ${passivePct}%`} />
        <div className="bg-red-400 transition-all"   style={{ width: `${detractorPct}%` }} title={`Detractors ${detractorPct}%`} />
      </div>

      <div className="grid grid-cols-3 text-center text-xs gap-1">
        <div><p className="text-green-600 font-bold">{nps.promoters}</p><p className="text-slate-400">Promoters</p></div>
        <div><p className="text-slate-500 font-bold">{nps.passives}</p><p className="text-slate-400">Passives</p></div>
        <div><p className="text-red-500  font-bold">{nps.detractors}</p><p className="text-slate-400">Detractors</p></div>
      </div>
    </div>
  )
}