// import type { SentimentLabel } from '@/types/feedback'

// interface SentimentResult {
//   label:  SentimentLabel
//   score:  number   // -1 (negative) to +1 (positive)
//   keywords: string[]
// }

// /* ---------- simple keyword lexicon ---------- */
// const POSITIVE_WORDS = [
//   'excellent','outstanding','amazing','great','good','fantastic','wonderful',
//   'helpful','professional','efficient','fast','quick','satisfied','happy',
//   'impressed','recommend','best','perfect','smooth','easy','on time',
//   'hassle-free','transparent','reliable','knowledgeable','responsive',
// ]
// const NEGATIVE_WORDS = [
//   'bad','poor','terrible','awful','horrible','worst','slow','delayed',
//   'unprofessional','rude','unhelpful','disappointed','frustrating','wrong',
//   'incorrect','missing','lost','broken','error','failed','issue','problem',
//   'expensive','overcharged','late','never','useless','waste',
// ]

// /**
//  * Lightweight rule-based sentiment analysis.
//  * For production, replace with OpenAI / Hugging Face API call.
//  */
// export function analyzeSentiment(text: string): SentimentResult {
//   const lower = text.toLowerCase()
//   const words = lower.split(/\W+/)

//   let posCount = 0
//   let negCount = 0
//   const keywords: string[] = []

//   for (const w of POSITIVE_WORDS) {
//     if (lower.includes(w)) { posCount++; keywords.push(w) }
//   }
//   for (const w of NEGATIVE_WORDS) {
//     if (lower.includes(w)) { negCount++; keywords.push(w) }
//   }

//   const total = posCount + negCount
//   let score   = total === 0 ? 0 : (posCount - negCount) / total
//   // clamp
//   score = Math.max(-1, Math.min(1, score))

//   const label: SentimentLabel =
//     score > 0.15  ? 'positive' :
//     score < -0.15 ? 'negative' : 'neutral'

//   return { label, score: Math.round(score * 100) / 100, keywords }
// }

// /**
//  * Batch sentiment analysis.
//  */
// export function batchAnalyzeSentiment(texts: string[]): SentimentResult[] {
//   return texts.map(analyzeSentiment)
// }

// /**
//  * OpenAI-based sentiment (optional — requires OPENAI_API_KEY env).
//  * Uncomment and use in production.
//  */
// // export async function analyzeSentimentAI(text: string): Promise<SentimentResult> {
// //   const res = await fetch('https://api.openai.com/v1/chat/completions', {
// //     method: 'POST',
// //     headers: { 'Content-Type':'application/json', Authorization:`Bearer ${process.env.OPENAI_API_KEY}` },
// //     body: JSON.stringify({
// //       model: 'gpt-4o-mini',
// //       messages: [
// //         { role:'system', content:'Classify the sentiment of customer feedback as positive, neutral, or negative. Return JSON: {label, score (-1 to 1), keywords[]}' },
// //         { role:'user',   content: text },
// //       ],
// //       response_format: { type:'json_object' },
// //     }),
// //   })
// //   const data = await res.json()
// //   return JSON.parse(data.choices[0].message.content)
// // }


import { SentimentResult } from '@/types/feedback';

// Enhanced sentiment analysis with more sophisticated scoring
const sentimentLexicon = {
  positive: {
    'excellent': 2,
    'amazing': 2,
    'fantastic': 2,
    'outstanding': 2,
    'perfect': 2,
    'great': 1.5,
    'good': 1,
    'nice': 1,
    'helpful': 1.5,
    'professional': 1.5,
    'efficient': 1.5,
    'quick': 1,
    'friendly': 1,
    'satisfied': 1.5,
    'happy': 1.5,
    'recommend': 1.5,
    'impressed': 1.5,
    'love': 2,
    'thank': 1,
    'best': 2,
    'wonderful': 2,
  },
  negative: {
    'terrible': -2,
    'horrible': -2,
    'awful': -2,
    'worst': -2,
    'bad': -1.5,
    'poor': -1.5,
    'slow': -1,
    'rude': -1.5,
    'unprofessional': -2,
    'disappointed': -1.5,
    'frustrated': -1.5,
    'angry': -1.5,
    'waste': -1.5,
    'useless': -2,
    'incompetent': -2,
    'never': -1,
    'problem': -1,
    'issue': -1,
    'complaint': -1,
    'hate': -2,
  },
  intensifiers: {
    'very': 1.5,
    'really': 1.5,
    'extremely': 2,
    'absolutely': 2,
    'completely': 1.5,
    'totally': 1.5,
  },
  negators: ['not', "n't", 'no', 'never', 'neither', 'nobody', 'nothing'],
};

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  let wordCount = 0;
  const keywords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^a-z]/g, '');
    if (!word) continue;

    // Check for negation in previous words
    let negated = false;
    for (let j = Math.max(0, i - 3); j < i; j++) {
      if (sentimentLexicon.negators.some((neg) => words[j].includes(neg))) {
        negated = true;
        break;
      }
    }

    // Check for intensifiers
    let intensifier = 1;
    if (i > 0) {
      const prevWord = words[i - 1].replace(/[^a-z]/g, '');
      if (sentimentLexicon.intensifiers[prevWord as keyof typeof sentimentLexicon.intensifiers]) {
        intensifier = sentimentLexicon.intensifiers[prevWord as keyof typeof sentimentLexicon.intensifiers];
      }
    }

    // Calculate sentiment score
    if (sentimentLexicon.positive[word as keyof typeof sentimentLexicon.positive]) {
      const wordScore = sentimentLexicon.positive[word as keyof typeof sentimentLexicon.positive] * intensifier;
      score += negated ? -wordScore : wordScore;
      keywords.push(word);
      wordCount++;
    } else if (sentimentLexicon.negative[word as keyof typeof sentimentLexicon.negative]) {
      const wordScore = sentimentLexicon.negative[word as keyof typeof sentimentLexicon.negative] * intensifier;
      score += negated ? -wordScore : wordScore;
      keywords.push(word);
      wordCount++;
    }
  }

  // Normalize score
  const normalizedScore = wordCount > 0 ? score / (wordCount * 2) : 0;

  // Determine label
  let label: 'positive' | 'neutral' | 'negative';
  if (normalizedScore > 0.15) {
    label = 'positive';
  } else if (normalizedScore < -0.15) {
    label = 'negative';
  } else {
    label = 'neutral';
  }

  // Calculate confidence
  const confidence = Math.min(0.4 + wordCount * 0.1 + Math.abs(normalizedScore) * 0.3, 0.95);

  return {
    score: normalizedScore,
    label,
    confidence,
    keywords: [...new Set(keywords)].slice(0, 10),
  };
}
