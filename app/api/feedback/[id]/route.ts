 
 // ═══════════════════════════════════════════════════════════════
 // FILE 2: app/api/feedback/[id]/route.ts  — GET + respond (PATCH)
 // ═══════════════════════════════════════════════════════════════
 
 import { NextRequest } from 'next/server';
 import { successResponse, errorResponse } from '@/utils/apiResponse';
 import { getAuthUser } from '@/lib/auth-helper';
 import Feedback from '@/models/Feedback';
 import connectDB from '@/lib/db';
 import { Types } from 'mongoose';
 
 interface RouteCtx { params: Promise<{ id: string }> }
 
 export async function GET(request: NextRequest, context: RouteCtx) {
   try {
     const user = getAuthUser(request);
     if (!user) return errorResponse('Unauthorized', 401);
     await connectDB();
     const { id } = await context.params;
 
     const feedback = await Feedback.findOne({ _id: id, tenantId: user.tenantId })
       .populate('customerId',   'name email phone')
       .populate('technicianId', 'name')
       .populate('ticketId',     'ticketNumber title status category')
       .lean();
 
     if (!feedback) return errorResponse('Feedback not found', 404);
     return successResponse(feedback, 'Feedback fetched');
   } catch { return errorResponse('An error occurred', 500); }
 }
 
 // Admin responds to feedback
 export async function PATCH(request: NextRequest, context: RouteCtx) {
   try {
     const user = getAuthUser(request);
     if (!user) return errorResponse('Unauthorized', 401);
     if (!['admin', 'manager'].includes(user.role)) return errorResponse('Forbidden', 403);
 
     await connectDB();
     const { id } = await context.params;
     const { content } = await request.json();
     if (!content?.trim()) return errorResponse('Response content required', 400);
 
     const feedback = await Feedback.findOneAndUpdate(
       { _id: id, tenantId: user.tenantId },
       {
         response: {
           content:      content.trim(),
           respondedBy:  new Types.ObjectId(user.userId),
           respondedAt:  new Date(),
         },
       },
       { new: true }
     ).populate('customerId', 'name email')
      .populate('ticketId', 'ticketNumber title')
      .lean();
 
     if (!feedback) return errorResponse('Feedback not found', 404);
     return successResponse(feedback, 'Response submitted');
   } catch { return errorResponse('An error occurred', 500); }
 }
 
 export async function DELETE(request: NextRequest, context: RouteCtx) {
   try {
     const user = getAuthUser(request);
     if (!user) return errorResponse('Unauthorized', 401);
     if (user.role !== 'admin') return errorResponse('Forbidden', 403);
     await connectDB();
     const { id } = await context.params;
     await Feedback.findOneAndDelete({ _id: id, tenantId: user.tenantId });
     return successResponse(null, 'Feedback deleted');
   } catch { return errorResponse('An error occurred', 500); }
 }
 