//  import { NextRequest } from 'next/server';
// import { FeedbackService } from '@/services/feedback.service';
// import { createFeedbackSchema } from '@/schemas/feedback.schema';
// import { successResponse, errorResponse, paginatedResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper';

// export async function GET(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const { searchParams } = new URL(request.url);
//     const options = {
//       page: parseInt(searchParams.get('page') || '1'),
//       limit: parseInt(searchParams.get('limit') || '10'),
//       rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
//       technicianId: searchParams.get('technicianId') || undefined,
//       startDate: searchParams.get('startDate') || undefined,
//       endDate: searchParams.get('endDate') || undefined,
//     };

//     const result = await FeedbackService.getFeedback(user.tenantId, options);

//     return paginatedResponse(result.feedback, {
//       page: result.page,
//       limit: result.limit,
//       total: result.total,
//     });
//   } catch (error) {
//     console.error('Get feedback error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const body = await request.json();

//     const validation = createFeedbackSchema.safeParse(body);
//     if (!validation.success) {
//       return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
//     }

//     const feedback = await FeedbackService.createFeedback(
//       validation.data,
//       user.userId,
//       user.tenantId
//     );

//     return successResponse(feedback, 'Feedback submitted successfully', 201);
//   } catch (error) {
//     console.error('Create feedback error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }


import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Feedback from '@/models/Feedback';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');

    const query: Record<string, any> = { tenantId: user.tenantId };
    // Customers only see their own feedback
    if (user.role === 'customer') query.customerId = user.userId;
    if (ticketId) query.ticketId = ticketId;

    const feedbacks = await Feedback.find(query)
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average rating
    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((s: number, f: any) => s + (f.rating ?? 0), 0) / feedbacks.length
      : 0;

    return successResponse({ feedbacks, avgRating: Math.round(avgRating * 10) / 10 }, 'Feedback fetched');
  } catch (error) {
    console.error('Get feedback error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const body = await request.json();

    if (!body.content?.trim()) return errorResponse('Review content required', 400);
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return errorResponse('Rating must be between 1 and 5', 400);
    }

    const feedback = await Feedback.create({
      customerId: user.userId,
      ticketId: body.ticketId,
      tenantId: user.tenantId,
      rating: body.rating,
      title: body.title,
      // content: body.content,
      // isVerified: true,
    });

    return successResponse(feedback, 'Review submitted', 201);
  } catch (error) {
    console.error('Create feedback error:', error);
    return errorResponse('An error occurred', 500);
  }
}