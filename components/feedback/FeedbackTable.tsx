'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Feedback, FeedbackFilter } from '@/types/feedback'
import ExportFeedbackButton from './ExportFeedbackButton'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  reviewed:  'bg-blue-100 text-blue-700',
  resolved:  'bg-green-100 text-green-700',
  escalated: 'bg-red-100 text-red-700',
}
const SENTIMENT_COLOR: Record<string, string> = {
  positive: 'text-green-600',
  neutral:  'text-slate-500',
  negative: 'text-red-500',
}

interface FeedbackTableProps {
  feedbacks?: Feedback[];
}

export default function FeedbackTable({
  feedbacks = [],
}: FeedbackTableProps) {
  const [data,    setData]    = useState<Feedback[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [filter,  setFilter]  = useState<FeedbackFilter>({})
  const [search,  setSearch]  = useState('')

  const load = useCallback(async (pg = 1) => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page: String(pg), limit: '20' })
      if (filter.status)    p.set('status',    filter.status)
      if (filter.sentiment) p.set('sentiment', filter.sentiment)
      if (filter.type)      p.set('type',      filter.type)
      if (search)           p.set('search',    search)
      const res  = await fetch(`/api/feedback?${p}`)
      const json = await res.json()
      setData(json.data); setTotal(json.total); setPage(pg)
    } finally { setLoading(false) }
  }, [filter, search])

  useEffect(() => { load(1) }, [load])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/feedback?id=${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    load(page)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(1)}
          placeholder="Search client, comment…"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-indigo-300" />

        {(['status','sentiment','type'] as const).map(key => (
          <select key={key} value={(filter as any)[key] || ''}
            onChange={e => setFilter(f => ({ ...f, [key]: e.target.value || undefined }))}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 capitalize">
            <option value="">All {key}</option>
            {key === 'status'    && ['pending','reviewed','resolved','escalated'].map(v => <option key={v}>{v}</option>)}
            {key === 'sentiment' && ['positive','neutral','negative'].map(v => <option key={v}>{v}</option>)}
            {key === 'type'      && ['service','technician','product','general'].map(v => <option key={v}>{v}</option>)}
          </select>
        ))}

        <ExportFeedbackButton filter={filter} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {['Client','Rating','Comment','Type','Status','Sentiment','Date','Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-400">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-400">No feedback found</td></tr>
            ) : data.map(f => (
              <tr key={f._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{f.clientName}</p>
                  <p className="text-xs text-slate-400">{f.clientEmail}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-amber-500">{f.rating}</span>
                    <span className="text-amber-400">{'★'.repeat(f.rating)}{'☆'.repeat(5-f.rating)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="truncate text-slate-600">{f.comment}</p>
                </td>
                <td className="px-4 py-3 capitalize text-slate-600">{f.type}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLOR[f.status|| 'neutral']}`}>
                    {f.status}
                  </span>
                </td>
                <td className={`px-4 py-3 capitalize font-medium ${SENTIMENT_COLOR[f.sentiment || 'neutral']}`}>
                  {f.sentiment || '—'}
                </td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {new Date(f.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <select value={f.status} onChange={e => updateStatus(f._id, e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {['pending','reviewed','resolved','escalated'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
        <span>Showing {data.length} of {total}</span>
        <div className="flex gap-2">
          <button onClick={() => load(page - 1)} disabled={page <= 1}
            className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">← Prev</button>
          <span className="px-3 py-1">Page {page}</span>
          <button onClick={() => load(page + 1)} disabled={data.length < 20}
            className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next →</button>
        </div>
      </div>
    </div>
  )
}