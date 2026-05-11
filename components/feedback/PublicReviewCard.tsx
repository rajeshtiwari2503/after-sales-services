 'use client'
import type { Feedback } from '@/types/feedback'

export default function PublicReviewCard({ review }: { review: Feedback }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
            {review.clientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{review.clientName}</p>
            <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(s => (
            <span key={s} className={s <= review.rating ? 'text-amber-400' : 'text-slate-200'}>★</span>
          ))}
        </div>
      </div>

      {review.title && <p className="font-semibold text-slate-800 text-sm mb-1">{review.title}</p>}
      <p className="text-sm text-slate-600 leading-relaxed mb-3">"{review.comment}"</p>

      {review.response && (
        <div className="bg-indigo-50 rounded-xl p-3 border-l-4 border-indigo-400">
          <p className="text-xs font-semibold text-indigo-700 mb-1">Response from Power India Services</p>
          <p className="text-xs text-indigo-600 leading-relaxed">{review.response}</p>
        </div>
      )}

      {review.technicianName && (
        <p className="text-xs text-slate-400 mt-2">Handled by: {review.technicianName}</p>
      )}
    </div>
  )
}