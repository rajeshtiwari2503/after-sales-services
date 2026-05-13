 import { NextRequest } from 'next/server';
import { successResponse, errorResponse, paginatedResponse } from '@/utils/apiResponse';
 
import Warranty from '@/models/Warranty';
import connectDB from '@/lib/db';

import { getAuthUser } from '@/lib/auth-helper';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const expiringDays = searchParams.get('expiringDays');

    const query: Record<string, any> = { tenantId: user.tenantId };

    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (expiringDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiringDays));
      query.warrantyEndDate = { $lte: expiryDate, $gte: new Date() };
      query.status = 'active';
    }

    const skip = (page - 1) * limit;
    const [warranties, total] = await Promise.all([
      Warranty.find(query)
        .populate('customerId', 'name email')
        .sort({ warrantyEndDate: 1 })
        .skip(skip)
        .limit(limit),
      Warranty.countDocuments(query),
    ]);

    return paginatedResponse(warranties, { page, limit, total });
  } catch (error) {
    console.error('Get warranties error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();

    await connectDB();

    const warranty = await Warranty.create({
      ...body,
      tenantId: user.tenantId,
    });

    return successResponse(warranty, 'Warranty created successfully', 201);
  } catch (error) {
    console.error('Create warranty error:', error);
    return errorResponse('An error occurred', 500);
  }
}
