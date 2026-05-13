// import type { Feedback, FeedbackAnalytics } from '@/types/feedback'
// import { calculateNPS } from './nps-calculator'

// export function computeFeedbackAnalytics(feedbacks: Feedback[]): FeedbackAnalytics {
//   const total = feedbacks.length
//   if (total === 0) {
//     return {
//       totalFeedback: 0, averageRating: 0, npsScore: 0,
//       npsBreakdown: { promoters:0, passives:0, detractors:0 },
//       ratingDistribution: { '1':0,'2':0,'3':0,'4':0,'5':0 },
//       sentimentBreakdown: { positive:0, neutral:0, negative:0 },
//       byType: {}, byStatus: {}, recentTrend: [], topTechnicians: [],
//     }
//   }

//   // Average rating
//   const avgRating = feedbacks.reduce((a, f) => a + f.rating, 0) / total

//   // Rating distribution
//   const ratingDist: Record<string, number> = { '1':0,'2':0,'3':0,'4':0,'5':0 }
//   feedbacks.forEach(f => { ratingDist[String(f.rating)] = (ratingDist[String(f.rating)] || 0) + 1 })

//   // NPS
//   const npsScores  = feedbacks.filter(f => f.npsScore != null).map(f => f.npsScore as number)
//   const npsResult  = calculateNPS(npsScores)

//   // Sentiment
//   const sentimentBreakdown = { positive:0, neutral:0, negative:0 }
//   feedbacks.forEach(f => { if (f.sentiment) sentimentBreakdown[f.sentiment]++ })

//   // By type / status
//   const byType:   Record<string, number> = {}
//   const byStatus: Record<string, number> = {}
//   feedbacks.forEach(f => {
//     byType[f.type]     = (byType[f.type]     || 0) + 1
//     byStatus[f.status] = (byStatus[f.status] || 0) + 1
//   })

//   // Recent trend (last 14 days)
//   const now   = new Date()
//   const trend: Record<string, { sum:number; count:number }> = {}
//   for (let i = 13; i >= 0; i--) {
//     const d = new Date(now)
//     d.setDate(d.getDate() - i)
//     trend[d.toISOString().slice(0,10)] = { sum:0, count:0 }
//   }
//   feedbacks.forEach(f => {
//     const day = new Date(f.createdAt).toISOString().slice(0,10)
//     if (trend[day]) { trend[day].sum += f.rating; trend[day].count++ }
//   })
//   const recentTrend = Object.entries(trend).map(([date, v]) => ({
//     date, avgRating: v.count ? Math.round((v.sum / v.count) * 10) / 10 : 0, count: v.count,
//   }))

//   // Top technicians
//   const techMap: Record<string, { name:string; sum:number; count:number }> = {}
//   feedbacks.filter(f => f.technicianId).forEach(f => {
//     if (!techMap[f.technicianId!]) techMap[f.technicianId!] = { name: f.technicianName || '', sum:0, count:0 }
//     techMap[f.technicianId!].sum   += f.rating
//     techMap[f.technicianId!].count++
//   })
//   const topTechnicians = Object.entries(techMap)
//     .map(([id, v]) => ({ technicianId:id, name:v.name, avgRating: Math.round((v.sum/v.count)*10)/10, count:v.count }))
//     .sort((a,b) => b.avgRating - a.avgRating)
//     .slice(0, 10)

//   return {
//     totalFeedback: total,
//     averageRating: Math.round(avgRating * 10) / 10,
//     npsScore:      npsResult.score,
//     npsBreakdown:  { promoters:npsResult.promoters, passives:npsResult.passives, detractors:npsResult.detractors },
//     ratingDistribution: ratingDist,
//     sentimentBreakdown,
//     byType, byStatus, recentTrend, topTechnicians,
//   }
// }

 import type {
  Feedback,
  FeedbackAnalytics,
} from "@/types/feedback";

import { calculateNPS } from "./nps-calculator";

export function computeFeedbackAnalytics(
  feedbacks: Feedback[]
): FeedbackAnalytics {
  const total =
    feedbacks.length;

  // EMPTY STATE
  // if (total === 0) {
  //   return {
  //     totalFeedback: 0,

  //     averageRating: 0,

  //     npsScore: 0,

  //     npsBreakdown: {
  //       promoters: 0,
  //       passives: 0,
  //       detractors: 0,
  //     },

  //     ratingDistribution:
  //       {
  //         "1": 0,
  //         "2": 0,
  //         "3": 0,
  //         "4": 0,
  //         "5": 0,
  //       },

  //     sentimentBreakdown:
  //       {
  //         positive: 0,
  //         neutral: 0,
  //         negative: 0,
  //       },

  //     byType: {},

  //     byStatus: {
  //       pending: 0,
  //       reviewed: 0,
  //       resolved: 0,
  //       escalated: 0,
  //     },

  //     recentTrend: [],

  //     topTechnicians: [],
  //   } as FeedbackAnalytics;
  // }

  // AVERAGE RATING
  const avgRating =
    feedbacks.reduce(
      (a, f) =>
        a +
        Number(
          f.rating || 0
        ),
      0
    ) / total;

  // RATING DISTRIBUTION
  const ratingDist: Record<
    string,
    number
  > = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };

  feedbacks.forEach(
    f => {
      const key =
        String(f.rating);

      if (
        ratingDist[key] !==
        undefined
      ) {
        ratingDist[key]++;
      }
    }
  );

  // NPS
  const npsScores =
    feedbacks
      .filter(
        f =>
          f.npsScore !=
          null
      )
      .map(
        f =>
          Number(
            f.npsScore
          )
      );

  const npsResult =
    calculateNPS(
      npsScores
    );

  // SENTIMENT
  const sentimentBreakdown =
    {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

  feedbacks.forEach(
    f => {
      if (
        f.sentiment &&
        f.sentiment in
          sentimentBreakdown
      ) {
        sentimentBreakdown[
          f.sentiment as keyof typeof sentimentBreakdown
        ]++;
      }
    }
  );

  // TYPE + STATUS
  const byType: Record<
    string,
    number
  > = {};

  const byStatus: Record<
    string,
    number
  > = {
    pending: 0,
    reviewed: 0,
    resolved: 0,
    escalated: 0,
  };

  feedbacks.forEach(
    f => {
      if (f.type) {
        byType[f.type] =
          (byType[
            f.type
          ] || 0) + 1;
      }

      if (f.status) {
        byStatus[
          f.status
        ] =
          (byStatus[
            f.status
          ] || 0) + 1;
      }
    }
  );

  // RECENT TREND
  const now =
    new Date();

  const trend: Record<
    string,
    {
      sum: number;
      count: number;
    }
  > = {};

  for (
    let i = 13;
    i >= 0;
    i--
  ) {
    const d =
      new Date(now);

    d.setDate(
      d.getDate() - i
    );

    trend[
      d
        .toISOString()
        .slice(0, 10)
    ] = {
      sum: 0,
      count: 0,
    };
  }

  feedbacks.forEach(
    f => {
      if (!f.createdAt)
        return;

      const day =
        new Date(
          f.createdAt
        )
          .toISOString()
          .slice(0, 10);

      if (trend[day]) {
        trend[day].sum +=
          Number(
            f.rating || 0
          );

        trend[
          day
        ].count++;
      }
    }
  );

  const recentTrend =
    Object.entries(
      trend
    ).map(
      ([date, v]) => ({
        date,

        avgRating:
          v.count
            ? Math.round(
                (v.sum /
                  v.count) *
                  10
              ) / 10
            : 0,

        count: v.count,
      })
    );

  // TOP TECHNICIANS
  const techMap: Record<
    string,
    {
      name: string;
      sum: number;
      count: number;
    }
  > = {};

  feedbacks
    .filter(
      f =>
        f.technicianId
    )
    .forEach(f => {
      const techId =
        String(
          f.technicianId
        );

      if (
        !techMap[techId]
      ) {
        techMap[techId] =
          {
            name:
              f.technicianName ||
              "Unknown",

            sum: 0,

            count: 0,
          };
      }

      techMap[
        techId
      ].sum += Number(
        f.rating || 0
      );

      techMap[
        techId
      ].count++;
    });

  const topTechnicians =
    Object.entries(
      techMap
    )
      .map(
        ([id, v]) => ({
          technicianId:
            id,

          name: v.name,

          avgRating:
            Math.round(
              (v.sum /
                v.count) *
                10
            ) / 10,

          count: v.count,
        })
      )
      .sort(
        (a, b) =>
          b.avgRating -
          a.avgRating
      )
      .slice(0, 10);

  return {
    totalFeedback:
      total,

    averageRating:
      Math.round(
        avgRating * 10
      ) / 10,

    npsScore:
      Number(
        npsResult.score || 0
      ),

    npsBreakdown: {
      promoters:
        Number(
          npsResult.promoters ||
            0
        ),

      passives:
        Number(
          npsResult.passives ||
            0
        ),

      detractors:
        Number(
          npsResult.detractors ||
            0
        ),
    },

    ratingDistribution:
      ratingDist,

    sentimentBreakdown,

    byType,

    byStatus,

    recentTrend,

    topTechnicians,
  } as FeedbackAnalytics;
}