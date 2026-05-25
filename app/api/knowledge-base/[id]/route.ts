import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import KnowledgeBase from '@/models/KnowledgeBase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    await connectDB();
    const { id } = await params;

    // Allow fetch by ID or slug
    const article = await KnowledgeBase.findOne({
      $or: [{ _id: id.length === 24 ? id : undefined }, { slug: id }],
      tenantId: user.tenantId,
    });
    if (!article) return errorResponse('Article not found', 404);

    // Increment view count (fire-and-forget)
    KnowledgeBase.findByIdAndUpdate(article._id, { $inc: { viewCount: 1 } }).exec();

    return successResponse(article);
  } catch (error) {
    return errorResponse('An error occurred', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) return errorResponse('Forbidden', 403);
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    delete body.tenantId;
    delete body.slug; // slug is immutable

    const article = await KnowledgeBase.findOneAndUpdate(
      { _id: id, tenantId: user.tenantId },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!article) return errorResponse('Article not found', 404);
    return successResponse(article, 'Article updated');
  } catch (error) {
    return errorResponse('An error occurred', 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) return errorResponse('Forbidden', 403);
    await connectDB();
    const { id } = await params;
    const article = await KnowledgeBase.findOneAndDelete({ _id: id, tenantId: user.tenantId });
    if (!article) return errorResponse('Article not found', 404);
    return successResponse(null, 'Article deleted');
  } catch (error) {
    return errorResponse('An error occurred', 500);
  }
}

// PATCH /api/knowledge-base/[id]/helpful — vote helpful/not-helpful
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const field = body.helpful ? 'helpfulCount' : 'notHelpfulCount';
    const article = await KnowledgeBase.findByIdAndUpdate(
      id,
      { $inc: { [field]: 1 } },
      { new: true }
    );
    if (!article) return errorResponse('Article not found', 404);
    return successResponse({ helpfulCount: article.helpfulCount, notHelpfulCount: article.notHelpfulCount });
  } catch (error) {
    return errorResponse('An error occurred', 500);
  }
}
