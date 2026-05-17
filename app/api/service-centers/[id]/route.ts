import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import ServiceCenter from '@/models/ServiceCenter';
import connectDB from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    await connectDB();
    const center = await ServiceCenter.findById(params.id).lean();
    if (!center) return errorResponse('Service center not found', 404);
    return successResponse(center, 'Service center fetched');
  } catch {
    return errorResponse('An error occurred', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) return errorResponse('Forbidden', 403);

    await connectDB();
    const body = await request.json();
    const center = await ServiceCenter.findByIdAndUpdate(params.id, body, { new: true });
    if (!center) return errorResponse('Service center not found', 404);
    return successResponse(center, 'Service center updated');
  } catch {
    return errorResponse('An error occurred', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (user.role !== 'admin') return errorResponse('Forbidden', 403);
    await connectDB();
    await ServiceCenter.findByIdAndDelete(params.id);
    return successResponse(null, 'Service center deleted');
  } catch {
    return errorResponse('An error occurred', 500);
  }
}