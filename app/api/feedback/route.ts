 // app/api/feedback/route.ts  — add these imports at the top
// Sabse simple permanent fix — directly is file mein sab models import karo

import { NextRequest } from 'next/server';
import { createFeedbackSchema } from '@/schemas/feedback.schema';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import { Types } from 'mongoose';

// ── Import sabhi models jo populate mein use hote hain ──────────────────────
import Feedback    from '@/models/Feedback';
import Ticket      from '@/models/Ticket';
import User        from '@/models/User';        // populate('customerId')
import Technician  from '@/models/Technician';  // populate('technicianId')
// ────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);

    const options = {
      page:         parseInt(searchParams.get('page')  || '1'),
      limit:        parseInt(searchParams.get('limit') || '10'),
      rating:       searchParams.get('rating')       ? parseInt(searchParams.get('rating')!) : undefined,
      technicianId: searchParams.get('technicianId') || undefined,
      ticketId:     searchParams.get('ticketId')     || undefined,
      startDate:    searchParams.get('startDate')    || undefined,
      endDate:      searchParams.get('endDate')      || undefined,
      ratingFilter: searchParams.get('ratingFilter') || undefined,
    };

    await connectDB();

    const query: Record<string, any> = { tenantId: user.tenantId };

    if (user.role === 'customer') {
      query.customerId = new Types.ObjectId(user.userId);
    }

    if (options.ticketId)     query.ticketId     = new Types.ObjectId(options.ticketId);
    if (options.technicianId) query.technicianId = new Types.ObjectId(options.technicianId);
    if (options.rating)       query.rating       = options.rating;
    if (options.ratingFilter) query.rating       = parseInt(options.ratingFilter);

    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) query.createdAt.$gte = new Date(options.startDate);
      if (options.endDate)   query.createdAt.$lte = new Date(options.endDate);
    }

    const skip = (options.page - 1) * options.limit;

    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .populate('customerId',   'name email phone')
        .populate('technicianId', 'name')
        .populate('ticketId',     'ticketNumber title status category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit)
        .lean(),
      Feedback.countDocuments(query),
    ]);

    const ratingDist = await Feedback.aggregate([
      { $match: { tenantId: user.tenantId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    const distribution: Record<number, number> = {};
    ratingDist.forEach((r: any) => { distribution[r._id] = r.count; });

    const avgRating = total > 0
      ? feedbacks.reduce((s, f: any) => s + (f.rating ?? 0), 0) / feedbacks.length
      : 0;

    return successResponse({
      feedbacks,
      total,
      page:         options.page,
      limit:        options.limit,
      totalPages:   Math.ceil(total / options.limit),
      avgRating:    Math.round(avgRating * 10) / 10,
      distribution,
    }, 'Feedback fetched');

  } catch (error) {
    console.error('GET feedback error:', error);
    return errorResponse('An error occurred', 500);
  }
}

// export async function POST(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse('Unauthorized', 401);

//     // Only customers can submit feedback
//     if (user.role !== 'customer' && user.role !== 'admin') {
//       return errorResponse('Only customers can submit feedback', 403);
//     }

//     const body = await request.json();

//     const validation = createFeedbackSchema.safeParse(body);
//     if (!validation.success) {
//       return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
//     }

//     await connectDB();

//     // Verify ticket exists and belongs to this customer
//     const ticket = await Ticket.findById(validation.data.ticketId)
//       .populate('technicianId', 'name')
//       .lean() as any;

//     if (!ticket) return errorResponse('Ticket not found', 404);

//     if (user.role === 'customer' &&
//         ticket.customerId?.toString() !== user.userId) {
//       return errorResponse('You can only review your own tickets', 403);
//     }

//     // Ticket must be resolved or closed to give feedback
//     if (!['resolved', 'closed'].includes(ticket.status)) {
//       return errorResponse('Feedback can only be submitted for resolved or closed tickets', 400);
//     }

//     // Check if feedback already exists for this ticket
//     const existing = await Feedback.findOne({
//       ticketId:   new Types.ObjectId(validation.data.ticketId),
//       customerId: new Types.ObjectId(user.userId),
//     });
//     if (existing) return errorResponse('You have already submitted feedback for this ticket', 400);

//     // Simple sentiment from rating
//     const sentimentLabel =
//       validation.data.rating >= 4 ? 'positive' :
//       validation.data.rating === 3 ? 'neutral' : 'negative';

//     const feedback = await Feedback.create({
//       ...validation.data,
//       customerId:   new Types.ObjectId(user.userId),
//       tenantId:     user.tenantId,
//       technicianId: ticket.technicianId?._id ?? ticket.technicianId,
//       sentiment: {
//         score:     validation.data.rating >= 4 ? 1 : validation.data.rating === 3 ? 0 : -1,
//         label:     sentimentLabel,
//         confidence: 0.8,
//         keywords:  [],
//       },
    
//     });

//     const populated = await Feedback.findById(feedback._id)
//       .populate('customerId', 'name email')
//       .populate('ticketId',   'ticketNumber title')
//       .lean();

//     return successResponse(populated, 'Feedback submitted successfully', 201);
//   } catch (error) {
//     console.error('POST feedback error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// Fix: score ko pehle variable mein store karo — TypeScript ka literal type inference avoid karta hai

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (user.role !== 'customer' && user.role !== 'admin') {
      return errorResponse('Only customers can submit feedback', 403);
    }

    const body = await request.json();

    const validation = createFeedbackSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    await connectDB();

    const ticket = await Ticket.findById(validation.data.ticketId)
      .populate('technicianId', 'name')
      .lean() as any;

    if (!ticket) return errorResponse('Ticket not found', 404);

    if (user.role === 'customer' &&
        ticket.customerId?.toString() !== user.userId) {
      return errorResponse('You can only review your own tickets', 403);
    }

    if (!['resolved', 'closed'].includes(ticket.status)) {
      return errorResponse('Feedback can only be submitted for resolved or closed tickets', 400);
    }

    const existing = await Feedback.findOne({
      ticketId:   new Types.ObjectId(validation.data.ticketId),
      customerId: new Types.ObjectId(user.userId),
    });
    if (existing) return errorResponse('You have already submitted feedback for this ticket', 400);

    // ── FIX: compute score as number explicitly ──────────────────────────────
    const rating = validation.data.rating;
    const sentimentScore: number = rating >= 4 ? 1 : rating === 3 ? 0 : -1;
    const sentimentLabel: 'positive' | 'neutral' | 'negative' =
      rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
    // ────────────────────────────────────────────────────────────────────────

    const feedback = await Feedback.create({
      ...validation.data,
      customerId:   new Types.ObjectId(user.userId),
      tenantId:     user.tenantId,
      technicianId: ticket.technicianId?._id ?? ticket.technicianId,
      sentiment: {
        score:      sentimentScore,    // ← no red line
        label:      sentimentLabel,
        confidence: 0.8,
        keywords:   [],
      },
    });

    const populated = await Feedback.findById(feedback._id)
      .populate('customerId', 'name email')
      .populate('ticketId',   'ticketNumber title')
      .lean();

    return successResponse(populated, 'Feedback submitted successfully', 201);
  } catch (error) {
    console.error('POST feedback error:', error);
    return errorResponse('An error occurred', 500);
  }
}
