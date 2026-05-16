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

    return successResponse(user, 'User fetched');
  } catch (error) {
    console.error('Get me error:', error);
    return errorResponse('An error occurred', 500);
  }
}