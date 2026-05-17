 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import ServiceCenter from '@/models/ServiceCenter';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const query: Record<string, any> = {};
    // Admin sees all, others see only their tenant
    if (user.role !== 'admin') query.tenantId = user.tenantId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    const centers = await ServiceCenter.find(query).sort({ createdAt: -1 }).lean();
    return successResponse(centers, 'Service centers fetched');
  } catch {
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) return errorResponse('Forbidden', 403);

    await connectDB();
    const body = await request.json();

    if (!body.name || !body.code) return errorResponse('Name and code required', 400);

    const existing = await ServiceCenter.findOne({ code: body.code.toUpperCase() });
    if (existing) return errorResponse('Service center code already exists', 400);

    const center = await ServiceCenter.create({
      ...body,
      code: body.code.toUpperCase(),
      tenantId: body.tenantId ?? user.tenantId,
    });

    return successResponse(center, 'Service center created', 201);
  } catch (error) {
    console.error('Create SC error:', error);
    return errorResponse('An error occurred', 500);
  }
}