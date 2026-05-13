//  export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved' | 'escalated'
// export type FeedbackType = 'service' | 'technician' | 'product' | 'general'
// export type SentimentLabel = 'positive' | 'neutral' | 'negative'

// export interface Feedback {
//   _id: string
//   clientId: string
//   clientName: string
//   clientEmail: string
//   clientPhone?: string
//   technicianId?: string
//   technicianName?: string
//   serviceId?: string
//   certificationId?: string
//   rating: number           // 1–5
//   npsScore?: number        // 0–10
//   title?: string
//   comment: string
//   type: FeedbackType
//   status: FeedbackStatus
//   sentiment?: SentimentLabel
//   sentimentScore?: number  // -1 to 1
//   tags?: string[]
//   isPublic: boolean
//   response?: string
//   respondedAt?: string
//   createdAt: string
//   updatedAt: string
// }

// export interface FeedbackCreateInput {
//   clientId: string
//   clientName: string
//   clientEmail: string
//   clientPhone?: string
//   technicianId?: string
//   technicianName?: string
//   serviceId?: string
//   certificationId?: string
//   rating: number
//   npsScore?: number
//   title?: string
//   comment: string
//   type: FeedbackType
//   isPublic?: boolean
// }

// export interface FeedbackUpdateInput {
//   status?: FeedbackStatus
//   response?: string
//   isPublic?: boolean
//   tags?: string[]
// }

// export interface FeedbackAnalytics {
//   totalFeedback: number
//   averageRating: number
//   npsScore: number
//   npsBreakdown: { promoters: number; passives: number; detractors: number }
//   ratingDistribution: Record<string, number>
//   sentimentBreakdown: { positive: number; neutral: number; negative: number }
//   byType: Record<string, number>
//   byStatus: Record<string, number>
//   recentTrend: { date: string; avgRating: number; count: number }[]
//   topTechnicians: { technicianId: string; name: string; avgRating: number; count: number }[]
// }

// export interface FeedbackFilter {
//   page?: number
//   limit?: number
//   status?: FeedbackStatus
//   type?: FeedbackType
//   sentiment?: SentimentLabel
//   minRating?: number
//   maxRating?: number
//   technicianId?: string
//   clientId?: string
//   startDate?: string
//   endDate?: string
//   isPublic?: boolean
//   search?: string
// }

// export interface PaginatedFeedback {
//   data: Feedback[]
//   total: number
//   page: number
//   limit: number
//   totalPages: number
// }

import { Types } from "mongoose";

export interface FeedbackFilter {
  status?: string;
  sentiment?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}
export interface Feedback {
  _id: string;
  ticketId: Types.ObjectId;
  customerId: Types.ObjectId;
  technicianId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  type?: string;
  sentiment?:  string;
  status?: string;
  
  title?: string;
   
  technicianName?: string;
  tenantId: string;
  rating: number;
  npsScore?: number;
  comment?: string;
  categories: FeedbackCategory[];
  // sentiment?: SentimentResult;
  isPublic: boolean;
  response?: FeedbackResponse;
  createdAt: Date;
  updatedAt: Date;
}

export type FeedbackCategory = 
  | 'service_quality'
  | 'response_time'
  | 'technician_skill'
  | 'communication'
  | 'pricing'
  | 'overall_experience';

export interface SentimentResult {
  score: number;
  label: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keywords: string[];
}

export interface FeedbackResponse {
  content: string;
  respondedBy: string;

  respondedAt: Date;
}

export interface FeedbackAnalytics {
  averageRating: number;
  totalFeedback: number;
  npsBreakdown: {
    promoters: number;
    passives: number;
    detractors: number;
  };
  byType: Record<
  string,
  number
>;
    distribution: Record<string, number>;  
    ratingDistribution:{}
  topTechnicians: {
    technicianId: string;
    name: string;
    avgRating: number;
    count: number;
  }[];
  recentTrend: {
    date: string;
    avgRating: number;
    count: number;
  }[];
  npsScore: number;
  byStatus:{pending:number; reviewed:number; resolved:number; escalated:number}; 
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryRatings: {
    [key in FeedbackCategory]?: number;
  };
  trendData: {
    date: string;
    rating: number;
    count: number;
  }[];
}
