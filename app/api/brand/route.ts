// app/api/brands/route.ts  — NEW FILE
// Super Admin creates brands (each brand = one tenant)
// Also creates the Brand Manager user automatically

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUserFull } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Brand from '@/models/Brand';
import Tenant from '@/models/Tenant';
import User from '@/models/User';
import { hashPassword } from '@/lib/hash';

// GET /api/brands
// admin   → all brands
// others  → forbidden (brands page is admin-only)
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUserFull(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (user.role !== 'admin') return errorResponse('Forbidden: Super Admin only', 403);

    await connectDB();

    const brands = await Brand.find({})
      .populate('managerId', 'name email')
      .populate('serviceCenters', 'name code isActive')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(brands, 'Brands fetched');
  } catch (error) {
    console.error('Get brands error:', error);
    return errorResponse('An error occurred', 500);
  }
}

// POST /api/brands
// Creates: Tenant record + Brand record + Brand Manager user
// Body: { name, contactEmail, contactPhone, address, categories?, managerName, managerEmail, managerPassword }
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUserFull(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (user.role !== 'admin') return errorResponse('Forbidden: Super Admin only', 403);

    await connectDB();
    const body = await request.json();

    const {
      name,
      contactEmail,
      contactPhone,
      address,
      categories,
      managerName,
      managerEmail,
      managerPassword,
    } = body;

    if (!name || !contactEmail || !managerName || !managerEmail || !managerPassword) {
      return errorResponse(
        'name, contactEmail, managerName, managerEmail, managerPassword are required',
        400
      );
    }

    // Generate tenantId from brand name: "Brand A" → "brand-a"
    const tenantId = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const existingTenant = await Tenant.findOne({ slug: tenantId });
    if (existingTenant) return errorResponse('A brand with this name already exists', 409);

    // 1. Create Tenant
    const tenant = await Tenant.create({
      name,
      slug: tenantId,
      isActive: true,
    });

    // 2. Create Brand Manager user
    const existingManager = await User.findOne({ email: managerEmail });
    if (existingManager) return errorResponse('Manager email already in use', 409);

    const hashedPw = await hashPassword(managerPassword);
    const managerUser = await User.create({
      name: managerName,
      email: managerEmail,
      password: hashedPw,
      role: 'manager',
      tenantId,
      isActive: true,
    });

    // 3. Create Brand
    const brand = await Brand.create({
      name,
      managerId: managerUser._id,
      contactEmail,
      contactPhone: contactPhone ?? '',
      address: address ?? '',
      categories: categories ?? [],
    });

    return successResponse(
      {
        brand,
        tenant: { id: tenant._id, name, slug: tenantId },
        manager: {
          id: managerUser._id,
          name: managerName,
          email: managerEmail,
          role: 'manager',
          tenantId,
        },
      },
      'Brand created successfully',
      201
    );
  } catch (error: any) {
    console.error('Create brand error:', error);
    if (error.code === 11000) return errorResponse('Brand or email already exists', 409);
    return errorResponse('An error occurred', 500);
  }
}