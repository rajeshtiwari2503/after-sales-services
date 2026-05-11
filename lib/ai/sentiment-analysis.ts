import type { SentimentLabel } from '@/types/feedback'

interface SentimentResult {
  label:  SentimentLabel
  score:  number   // -1 (negative) to +1 (positive)
  keywords: string[]
}

/* ---------- simple keyword lexicon ---------- */
const POSITIVE_WORDS = [
  'excellent','outstanding','amazing','great','good','fantastic','wonderful',
  'helpful','professional','efficient','fast','quick','satisfied','happy',
  'impressed','recommend','best','perfect','smooth','easy','on time',
  'hassle-free','transparent','reliable','knowledgeable','responsive',
]
const NEGATIVE_WORDS = [
  'bad','poor','terrible','awful','horrible','worst','slow','delayed',
  'unprofessional','rude','unhelpful','disappointed','frustrating','wrong',
  'incorrect','missing','lost','broken','error','failed','issue','problem',
  'expensive','overcharged','late','never','useless','waste',
]

/**
 * Lightweight rule-based sentiment analysis.
 * For production, replace with OpenAI / Hugging Face API call.
 */
export function analyzeSentiment(text: string): SentimentResult {
  const lower = text.toLowerCase()
  const words = lower.split(/\W+/)

  let posCount = 0
  let negCount = 0
  const keywords: string[] = []

  for (const w of POSITIVE_WORDS) {
    if (lower.includes(w)) { posCount++; keywords.push(w) }
  }
  for (const w of NEGATIVE_WORDS) {
    if (lower.includes(w)) { negCount++; keywords.push(w) }
  }

  const total = posCount + negCount
  let score   = total === 0 ? 0 : (posCount - negCount) / total
  // clamp
  score = Math.max(-1, Math.min(1, score))

  const label: SentimentLabel =
    score > 0.15  ? 'positive' :
    score < -0.15 ? 'negative' : 'neutral'

  return { label, score: Math.round(score * 100) / 100, keywords }
}

/**
 * Batch sentiment analysis.
 */
export function batchAnalyzeSentiment(texts: string[]): SentimentResult[] {
  return texts.map(analyzeSentiment)
}

/**
 * OpenAI-based sentiment (optional — requires OPENAI_API_KEY env).
 * Uncomment and use in production.
 */
// export async function analyzeSentimentAI(text: string): Promise<SentimentResult> {
//   const res = await fetch('https://api.openai.com/v1/chat/completions', {
//     method: 'POST',
//     headers: { 'Content-Type':'application/json', Authorization:`Bearer ${process.env.OPENAI_API_KEY}` },
//     body: JSON.stringify({
//       model: 'gpt-4o-mini',
//       messages: [
//         { role:'system', content:'Classify the sentiment of customer feedback as positive, neutral, or negative. Return JSON: {label, score (-1 to 1), keywords[]}' },
//         { role:'user',   content: text },
//       ],
//       response_format: { type:'json_object' },
//     }),
//   })
//   const data = await res.json()
//   return JSON.parse(data.choices[0].message.content)
// }