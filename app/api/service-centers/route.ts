//  import { NextRequest } from 'next/server';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper';
// import ServiceCenter from '@/models/ServiceCenter';
// import connectDB from '@/lib/db';

// export async function GET(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse('Unauthorized', 401);
//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     const search = searchParams.get('search');

//     const query: Record<string, any> = {};
//     // Admin sees all, others see only their tenant
//     if (user.role !== 'admin') query.tenantId = user.tenantId;
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { code: { $regex: search, $options: 'i' } },
//         { 'address.city': { $regex: search, $options: 'i' } },
//       ];
//     }

//     const centers = await ServiceCenter.find(query).sort({ createdAt: -1 }).lean();
//     return successResponse(centers, 'Service centers fetched');
//   } catch {
//     return errorResponse('An error occurred', 500);
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse('Unauthorized', 401);
//     if (!['admin', 'manager'].includes(user.role)) return errorResponse('Forbidden', 403);

//     await connectDB();
//     const body = await request.json();

//     if (!body.name || !body.code) return errorResponse('Name and code required', 400);

//     const existing = await ServiceCenter.findOne({ code: body.code.toUpperCase() });
//     if (existing) return errorResponse('Service center code already exists', 400);

//     const center = await ServiceCenter.create({
//       ...body,
//       code: body.code.toUpperCase(),
//       tenantId: body.tenantId ?? user.tenantId,
//     });

//     return successResponse(center, 'Service center created', 201);
//   } catch (error) {
//     console.error('Create SC error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// app/api/service-centers/route.ts  — REPLACE your existing file
//
// GET:
//   admin         → all SCs across all brands
//   manager       → only their brand's SCs
//   service_center → only their own SC
//
// POST:
//   admin         → can create SC for any brand (pass tenantId in body)
//   manager       → can only create SCs under their own brand

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUserFull } from '@/lib/rbac';
import ServiceCenter from '@/models/ServiceCenter';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUserFull(request);
    if (!user) return errorResponse('Unauthorized', 401);

    // Only these roles can access service centers
    if (!['admin', 'manager', 'service_center', 'support'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Role-scoped base filter
    const filter: Record<string, any> = {};

    if (user.role === 'admin') {
      // No filter — admin sees everything
    } else if (user.role === 'manager') {
      // Manager sees only their brand's SCs
      filter.tenantId = user.tenantId;
    } else if (user.role === 'service_center') {
      // SC operator sees ONLY their own SC
      filter.tenantId = user.tenantId;
      if (user.serviceCenterId) filter._id = user.serviceCenterId;
    } else {
      filter.tenantId = user.tenantId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    const centers = await ServiceCenter.find(filter)
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(centers, 'Service centers fetched');
  } catch (error) {
    console.error('Get SCs error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUserFull(request);
    if (!user) return errorResponse('Unauthorized', 401);

    // Only admin or brand manager can create service centers
    if (!['admin', 'manager'].includes(user.role)) {
      return errorResponse('Forbidden: only Super Admin or Brand Manager can create service centers', 403);
    }

    await connectDB();
    const body = await request.json();

    if (!body.name || !body.code) {
      return errorResponse('name and code are required', 400);
    }

    // manager: forced to their own brand — cannot create under another brand
    const tenantId =
      user.role === 'admin' ? (body.tenantId ?? user.tenantId) : user.tenantId;

    // Code must be unique within the brand
    const existing = await ServiceCenter.findOne({
      code: body.code.toUpperCase(),
      tenantId,
    });
    if (existing) {
      return errorResponse('Service center code already exists for this brand', 400);
    }

    const center = await ServiceCenter.create({
      ...body,
      code: body.code.toUpperCase(),
      tenantId,
    });

    return successResponse(center, 'Service center created', 201);
  } catch (error) {
    console.error('Create SC error:', error);
    return errorResponse('An error occurred', 500);
  }
}