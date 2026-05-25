import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import KnowledgeBase from '@/models/KnowledgeBase';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page      = parseInt(searchParams.get('page')  ?? '1');
    const limit     = parseInt(searchParams.get('limit') ?? '20');
    const category  = searchParams.get('category');
    const published = searchParams.get('published');
    const featured  = searchParams.get('featured');
    const search    = searchParams.get('search');

    const query: Record<string, any> = { tenantId: user.tenantId };
    if (category)  query.category  = category;
    if (published !== null && published !== undefined && published !== '') {
      query.published = published === 'true';
    }
    if (featured === 'true') query.featured = true;

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      KnowledgeBase.find(query)
        .sort(search ? { score: { $meta: 'textScore' } } : { featured: -1, viewCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content'), // exclude heavy content in list view
      KnowledgeBase.countDocuments(query),
    ]);

    // Category counts for sidebar
    const categories = await KnowledgeBase.aggregate([
      { $match: { tenantId: user.tenantId, published: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return successResponse({
      articles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      categories,
    });
  } catch (error) {
    console.error('Get KB error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();
    const body = await request.json();
    const { title, content, category, tags, published, featured, excerpt } = body;

    if (!title || !content) {
      return errorResponse('Title and content are required', 400);
    }

    // Generate unique slug
    let slug = slugify(title);
    const existing = await KnowledgeBase.findOne({ tenantId: user.tenantId, slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const article = await KnowledgeBase.create({
      tenantId:   user.tenantId,
      title,
      slug,
      content,
      excerpt:    excerpt ?? content.substring(0, 200),
      category:   category ?? 'general',
      tags:       tags ?? [],
      published:  published ?? false,
      featured:   featured ?? false,
      authorId:   user.userId,
      authorName: body.authorName ?? 'Admin',
    });

    return successResponse(article, 'Article created', 201);
  } catch (error) {
    console.error('Create KB error:', error);
    return errorResponse('An error occurred', 500);
  }
}
