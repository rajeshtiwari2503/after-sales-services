//  import { NextRequest } from 'next/server';
// import { successResponse, errorResponse, paginatedResponse } from '@/utils/apiResponse';
 
// import Warranty from '@/models/Warranty';
// import connectDB from '@/lib/db';

// import { getAuthUser } from '@/lib/auth-helper';

// export async function GET(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const status = searchParams.get('status');
//     const customerId = searchParams.get('customerId');
//     const expiringDays = searchParams.get('expiringDays');

//     const query: Record<string, any> = { tenantId: user.tenantId };

//     if (status) query.status = status;
//     if (customerId) query.customerId = customerId;
//     if (expiringDays) {
//       const expiryDate = new Date();
//       expiryDate.setDate(expiryDate.getDate() + parseInt(expiringDays));
//       query.warrantyEndDate = { $lte: expiryDate, $gte: new Date() };
//       query.status = 'active';
//     }

//     const skip = (page - 1) * limit;
//     const [warranties, total] = await Promise.all([
//       Warranty.find(query)
//         .populate('customerId', 'name email')
//         .sort({ warrantyEndDate: 1 })
//         .skip(skip)
//         .limit(limit),
//       Warranty.countDocuments(query),
//     ]);

//     return paginatedResponse(warranties, { page, limit, total });
//   } catch (error) {
//     console.error('Get warranties error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) {
//       return errorResponse('Unauthorized', 401);
//     }

//     const body = await request.json();

//     await connectDB();

//     const warranty = await Warranty.create({
//       ...body,
//       tenantId: user.tenantId,
//     });

//     return successResponse(warranty, 'Warranty created successfully', 201);
//   } catch (error) {
//     console.error('Create warranty error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import Warranty from '@/models/Warranty';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '20');

    const query: Record<string, any> = { tenantId: user.tenantId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { modelNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Warranty.find(query)
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Warranty.countDocuments(query),
    ]);

    return successResponse({ items, total, page, limit }, 'Warranty items fetched');
  } catch (error) {
    console.error('Get warranty error:', error);
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

    if (!body.name || !body.modelNumber) {
      return errorResponse('Product name and model number required', 400);
    }

    const warranty = await Warranty.create({
      ...body,
      tenantId: user.tenantId,
      createdBy: user.userId,
    });

    return successResponse(warranty, 'Product added', 201);
  } catch (error) {
    console.error('Create warranty error:', error);
    return errorResponse('An error occurred', 500);
  }
}