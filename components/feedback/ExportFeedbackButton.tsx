'use client'
import { useState } from 'react'
import type { FeedbackFilter } from '@/types/feedback'

export default function ExportFeedbackButton({ filter }: { filter: FeedbackFilter }) {
  const [loading, setLoading] = useState(false)

  async function doExport(format: 'csv' | 'json') {
    setLoading(true)
    try {
      const p = new URLSearchParams({ format })
      if (filter.status)    p.set('status',    filter.status)
      if (filter.sentiment) p.set('sentiment', filter.sentiment)
      if (filter.type)      p.set('type',      filter.type)
      if (filter.startDate) p.set('startDate', filter.startDate)
      if (filter.endDate)   p.set('endDate',   filter.endDate)

      const res  = await fetch(`/api/feedback/export?${p}`)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `feedback-${Date.now()}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } finally { setLoading(false) }
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => doExport('csv')} disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
        {loading ? '…' : '⬇'} CSV
      </button>
      <button onClick={() => doExport('json')} disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
        {loading ? '…' : '⬇'} JSON
      </button>
    </div>
  )
}