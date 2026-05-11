'use client'
import { useState, useEffect } from 'react'

interface Alert {
  ruleId:     string
  ruleName:   string
  priority:   string
  message:    string
  feedbackId: string
  feedback:   { clientName: string; rating: number; createdAt: string }
}

const PRIORITY_STYLE: Record<string, string> = {
  critical: 'border-l-4 border-red-500 bg-red-50',
  high:     'border-l-4 border-orange-400 bg-orange-50',
  medium:   'border-l-4 border-yellow-400 bg-yellow-50',
  low:      'border-l-4 border-green-400 bg-green-50',
}
const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-green-100 text-green-700',
}

export default function FeedbackAlerts() {
  const [alerts,  setAlerts]  = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res  = await fetch('/api/feedback/alerts?limit=20')
      const data = await res.json()
      setAlerts(data.alerts || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Smart Alerts</h3>
        <button onClick={load} className="text-xs text-indigo-600 hover:underline">Refresh</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No active alerts 🎉</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {alerts.map((a, i) => (
            <div key={i} className={`rounded-xl p-3 ${PRIORITY_STYLE[a.priority] || 'bg-slate-50'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{a.ruleName}</p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{a.message}</p>
                  {a.feedback && (
                    <p className="text-xs text-slate-400 mt-1">
                      {a.feedback.clientName} · {a.feedback.rating}★ · {new Date(a.feedback.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_BADGE[a.priority]}`}>
                  {a.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}