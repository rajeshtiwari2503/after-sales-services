/**
 * NPS (Net Promoter Score) Calculator
 * Promoters  : score 9–10
 * Passives   : score 7–8
 * Detractors : score 0–6
 * NPS = (% Promoters) - (% Detractors)  range: -100 to +100
 */

export interface NPSResult {
  score:      number
  promoters:  number
  passives:   number
  detractors: number
  total:      number
  promoterPct:  number
  passivePct:   number
  detractorPct: number
  category: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical'
}

export function calculateNPS(scores: number[]): NPSResult {
  const total = scores.length
  if (total === 0) {
    return { score:0, promoters:0, passives:0, detractors:0, total:0,
             promoterPct:0, passivePct:0, detractorPct:0, category:'Critical' }
  }

  let promoters  = 0
  let passives   = 0
  let detractors = 0

  for (const s of scores) {
    if (s >= 9)      promoters++
    else if (s >= 7) passives++
    else             detractors++
  }

  const promoterPct  = (promoters  / total) * 100
  const passivePct   = (passives   / total) * 100
  const detractorPct = (detractors / total) * 100
  const score        = Math.round(promoterPct - detractorPct)

  const category =
    score >= 70 ? 'Excellent' :
    score >= 30 ? 'Good' :
    score >= 0  ? 'Needs Improvement' : 'Critical'

  return {
    score, promoters, passives, detractors, total,
    promoterPct:  Math.round(promoterPct),
    passivePct:   Math.round(passivePct),
    detractorPct: Math.round(detractorPct),
    category,
  }
}

export function npsCategory(score: number) {
  if (score >= 70) return { label:'Excellent', color:'#10b981' }
  if (score >= 30) return { label:'Good',      color:'#3730a3' }
  if (score >= 0)  return { label:'Needs Improvement', color:'#f59e0b' }
  return { label:'Critical', color:'#e11d48' }
}