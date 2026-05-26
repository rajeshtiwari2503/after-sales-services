import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import User from '@/models/User';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return errorResponse('Unauthorized', 401);

    await connectDB();
    const user = await User.findById(authUser.userId).select('-password').lean();
    if (!user) return errorResponse('User not found', 404);

    return successResponse({ user }, 'User fetched');
  } catch (error) {
    console.error('Get me error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return errorResponse('Unauthorized', 401);

    await connectDB();
    const body = await request.json();

    // Whitelist fields that can be updated from profile pages
    const ALLOWED = [
      'name', 'phone', 'address', 'brandName', 'companyName',
      'centerName', 'licenseNumber', 'website', 'description',
      'gstNumber', 'panNumber', 'specialization', 'skills', 'experience',
    ];

    const updates: Record<string, any> = {};
    for (const key of ALLOWED) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    const user = await User.findByIdAndUpdate(
      authUser.userId,
      { $set: updates },
      { new: true }
    ).select('-password').lean();

    if (!user) return errorResponse('User not found', 404);

    return successResponse({ user }, 'Profile updated');
  } catch (error) {
    console.error('Update me error:', error);
    return errorResponse('An error occurred', 500);
  }
}