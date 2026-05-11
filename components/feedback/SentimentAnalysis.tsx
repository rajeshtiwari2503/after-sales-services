 'use client'
interface Props { breakdown: { positive: number; neutral: number; negative: number } }

const ITEMS = [
  { key: 'positive' as const, label: 'Positive', color: '#10b981', bg: 'bg-emerald-100', text: 'text-emerald-700', emoji: '😊' },
  { key: 'neutral'  as const, label: 'Neutral',  color: '#94a3b8', bg: 'bg-slate-100',   text: 'text-slate-600',   emoji: '😐' },
  { key: 'negative' as const, label: 'Negative', color: '#e11d48', bg: 'bg-red-100',     text: 'text-red-600',     emoji: '😞' },
]

export default function SentimentAnalysis({ breakdown }: Props) {
  const total = breakdown.positive + breakdown.neutral + breakdown.negative || 1

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Sentiment Analysis</h3>
      <div className="space-y-3">
        {ITEMS.map(item => {
          const count = breakdown[item.key]
          const pct   = Math.round((count / total) * 100)
          return (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  {item.emoji} {item.label}
                </span>
                <span className={`font-semibold ${item.text}`}>{pct}% ({count})</span>
              </div>
              <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: item.color }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex gap-2">
        {ITEMS.map(item => (
          <div key={item.key} className={`flex-1 ${item.bg} rounded-xl p-3 text-center`}>
            <p className={`text-xl font-black ${item.text}`}>{breakdown[item.key]}</p>
            <p className={`text-xs ${item.text} opacity-80`}>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}