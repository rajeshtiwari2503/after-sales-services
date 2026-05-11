'use client'
import { useEffect } from 'react'
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics'
import NPSScoreCard from './NPSScoreCard'
import RatingAnalytics from './RatingAnalytics'
import SentimentAnalysis from './SentimentAnalysis'
import SatisfactionChart from './SatisfactionChart'
import TechnicianRanking from './TechnicianRanking'
import FeedbackAlerts from './FeedbackAlerts'

export default function FeedbackDashboard() {
  const { analytics, nps, loading, error, fetchAnalytics, fetchNPS } = useFeedbackAnalytics()

  useEffect(() => {
    fetchAnalytics()
    fetchNPS()
  }, [fetchAnalytics, fetchNPS])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  )
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Feedback Dashboard</h1>
        <button onClick={() => { fetchAnalytics(); fetchNPS() }}
          className="text-sm text-indigo-600 hover:underline">Refresh</button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Feedback',   value: analytics?.totalFeedback   ?? 0,  suffix: '' },
          { label: 'Average Rating',   value: analytics?.averageRating   ?? 0,  suffix: '/5' },
          { label: 'NPS Score',        value: nps?.score                 ?? 0,  suffix: '' },
          { label: 'Pending Reviews',  value: analytics?.byStatus?.pending ?? 0, suffix: '' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">{k.label}</p>
            <p className="text-3xl font-bold text-indigo-700">{k.value}{k.suffix}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {nps       && <NPSScoreCard nps={nps} />}
        {analytics && <RatingAnalytics distribution={analytics.ratingDistribution} average={analytics.averageRating} />}
        {analytics && <SentimentAnalysis breakdown={analytics.sentimentBreakdown} />}
      </div>

      {/* Trend Chart */}
      {analytics && <SatisfactionChart trend={analytics.recentTrend} />}

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {analytics && <TechnicianRanking technicians={analytics.topTechnicians} />}
        <FeedbackAlerts />
      </div>
    </div>
  )
}