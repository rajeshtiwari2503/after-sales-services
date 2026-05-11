'use client'
import { useEffect, useState } from 'react'
import type { Feedback } from '@/types/feedback'

interface Props { feedback: Feedback; onClose: () => void }

export default function FeedbackNotification({ feedback, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
          {feedback.rating >= 4 ? '😊' : feedback.rating >= 3 ? '😐' : '😞'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">New Feedback Received</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {feedback.clientName} · {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
          </p>
          <p className="text-xs text-slate-600 mt-1 truncate">"{feedback.comment}"</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 flex-shrink-0 text-lg leading-none">×</button>
      </div>
    </div>
  )
}