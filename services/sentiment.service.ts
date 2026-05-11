 import { SentimentResult } from '@/types/feedback';

export class SentimentService {
  static async analyze(text: string): Promise<SentimentResult> {
    // Simple keyword-based sentiment analysis
    // In production, integrate with AI services like OpenAI, AWS Comprehend, etc.

    const positiveWords = [
      'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'good',
      'happy', 'satisfied', 'helpful', 'professional', 'quick', 'efficient',
      'recommend', 'best', 'perfect', 'love', 'thank', 'awesome',
    ];

    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'poor', 'slow', 'rude',
      'unprofessional', 'disappointed', 'frustrated', 'worst', 'never',
      'waste', 'useless', 'incompetent', 'angry', 'hate', 'problem',
    ];

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    let positiveCount = 0;
    let negativeCount = 0;
    const foundKeywords: string[] = [];

    words.forEach((word) => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (positiveWords.includes(cleanWord)) {
        positiveCount++;
        foundKeywords.push(cleanWord);
      }
      if (negativeWords.includes(cleanWord)) {
        negativeCount++;
        foundKeywords.push(cleanWord);
      }
    });

    const totalSentimentWords = positiveCount + negativeCount;
    let score = 0;
    let label: 'positive' | 'neutral' | 'negative' = 'neutral';
    let confidence = 0.5;

    if (totalSentimentWords > 0) {
      score = (positiveCount - negativeCount) / totalSentimentWords;
      confidence = Math.min(0.5 + totalSentimentWords * 0.1, 0.95);

      if (score > 0.2) {
        label = 'positive';
      } else if (score < -0.2) {
        label = 'negative';
      }
    }

    return {
      score,
      label,
      confidence,
      keywords: [...new Set(foundKeywords)].slice(0, 10),
    };
  }
}
