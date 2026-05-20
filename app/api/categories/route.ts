// app/api/categories/route.ts  — NEW FILE
// Brand manager creates/manages their own categories + fault list per category
// GET: admin=all, manager=own brand
// POST: admin or manager only

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    const filter: Record<string, any> =
      user.role === 'admin' ? {} : { tenantId: user.tenantId };

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const categories = await Category.find(filter).sort({ name: 1 }).lean();
    return successResponse(categories, 'Categories fetched');
  } catch (e) {
    console.error(e);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role))
      return errorResponse('Forbidden', 403);

    await connectDB();
    const body = await request.json();
    const { name, description, faults } = body;

    if (!name) return errorResponse('Category name is required', 400);

    const tenantId = user.role === 'admin' ? (body.tenantId ?? user.tenantId) : user.tenantId;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existing = await Category.findOne({ tenantId, slug });
    if (existing) return errorResponse('Category already exists', 409);

    const category = await Category.create({
      name,
      slug,
      tenantId,
      description: description ?? '',
      faults: (faults ?? []).map((f: any) => ({
        name: f.name,
        description: f.description ?? '',
        severity: f.severity ?? 'medium',
      })),
      isActive: true,
    });

    return successResponse(category, 'Category created', 201);
  } catch (e: any) {
    console.error(e);
    if (e.code === 11000) return errorResponse('Category already exists', 409);
    return errorResponse('An error occurred', 500);
  }
}