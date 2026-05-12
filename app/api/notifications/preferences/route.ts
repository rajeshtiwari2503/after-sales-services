 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { verifyToken } from '@/lib/jwt';
import NotificationPreference from '@/models/NotificationPreference';
import connectDB from '@/lib/db';

function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.substring(7));
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    let preferences = await NotificationPreference.findOne({
      userId: user.userId,
      tenantId: user.tenantId,
    });

    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId: user.userId,
        // tenantId: user.tenantId,
      });
    }

    return successResponse(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    await connectDB();

    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId: user.userId, tenantId: user.tenantId },
      body,
      { new: true, upsert: true }
    );

    return successResponse(preferences, 'Preferences updated successfully');
  } catch (error) {
    console.error('Update preferences error:', error);
    return errorResponse('An error occurred', 500);
  }
}
