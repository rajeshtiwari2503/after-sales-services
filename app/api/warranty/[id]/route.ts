 import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
 
import Warranty from '@/models/Warranty';
import connectDB from '@/lib/db';

import { getAuthUser } from '@/lib/auth-helper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();
    const { id } = await params;

    const warranty = await Warranty.findOne({ _id: id, tenantId: user.tenantId })
      .populate('customerId', 'name email phone');

    if (!warranty) {
      return errorResponse('Warranty not found', 404);
    }

    return successResponse(warranty);
  } catch (error) {
    console.error('Get warranty error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    await connectDB();
    const { id } = await params;

    const warranty = await Warranty.findOneAndUpdate(
      { _id: id, tenantId: user.tenantId },
      body,
      { new: true }
    );

    if (!warranty) {
      return errorResponse('Warranty not found', 404);
    }

    return successResponse(warranty, 'Warranty updated successfully');
  } catch (error) {
    console.error('Update warranty error:', error);
    return errorResponse('An error occurred', 500);
  }
}
