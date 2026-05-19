//  import { NextRequest } from "next/server";
// import { getAuthUser } from "@/lib/auth-helper";
// import { successResponse, errorResponse } from "@/utils/apiResponse";
// import connectDB from "@/lib/db";
// import mongoose from "mongoose";

// export async function GET(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse("Unauthorized", 401);

//     await connectDB();

//     // Try Technician model first, fallback to Users with technician role
//     let technicians: any[] = [];
//     try {
//       const Technician = mongoose.models.Technician;
//       if (Technician) {
//         technicians = await Technician
//           .find({ tenantId: user.tenantId })
//           .populate("userId", "name email phone")
//           .lean();
//       }
//     } catch {}

//     if (!technicians.length) {
//       // Fallback: get users with technician role
//       const User = mongoose.models.User;
//       const techUsers = await User
//         .find({ tenantId: user.tenantId, role: "technician" })
//         .select("name email phone isActive createdAt")
//         .lean();
//       technicians = techUsers.map((u: any) => ({
//         _id: u._id, userId: u,
//         employeeId: `EMP-${u._id.toString().slice(-4).toUpperCase()}`,
//         specializations: [],
//         rating: 4.5,
//         totalTickets: 0,
//         completedTickets: 0,
//         availability: { isAvailable: u.isActive },
//         isActive: u.isActive,
//       }));
//     }

//     return successResponse(technicians, "Technicians fetched");
//   } catch (error) {
//     console.error("Technicians error:", error);
//     return errorResponse("An error occurred", 500);
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse("Unauthorized", 401);

//     await connectDB();
//     const body = await request.json();

//     // Create user with technician role first
//     const { hashPassword } = await import("@/lib/hash");
//     const { signToken } = await import("@/lib/jwt");
//     const User = mongoose.models.User;

//     const existing = await User.findOne({ email: body.email, tenantId: user.tenantId });
//     if (existing) return errorResponse("Email already registered", 400);

//     const hashedPassword = await hashPassword("TechPass123!");
//     const newUser = await User.create({
//       name: body.name, email: body.email,
//       password: hashedPassword, role: "technician",
//       tenantId: user.tenantId, phone: body.phone,
//     });

//     // Try to create Technician record
//     try {
//       const Technician = mongoose.models.Technician;
//       if (Technician) {
//         const tech = await Technician.create({
//           userId: newUser._id,
//           serviceCenterId: body.serviceCenterId,
//           employeeId: body.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
//           specializations: body.specializations ?? [],
//           tenantId: user.tenantId,
//         });
//         return successResponse(tech, "Technician created", 201);
//       }
//     } catch {}

//     return successResponse(
//       { userId: newUser._id, name: newUser.name, email: newUser.email },
//       "Technician created",
//       201
//     );
//   } catch (error) {
//     console.error("Create technician error:", error);
//     return errorResponse("An error occurred", 500);
//   }
// }

// app/api/technicians/route.ts  — REPLACE your existing file
//
// GET:
//   admin         → all technicians across all tenants
//   manager       → all technicians in their brand (all SCs)
//   service_center → only their own SC's technicians
//   technician    → only themselves
//
// POST:
//   admin         → create tech for any brand + any SC
//   manager       → create tech in their brand; SC must belong to their brand
//   service_center → create tech only in their own SC

import { NextRequest } from 'next/server';
import { getAuthUserFull } from '@/lib/rbac';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import connectDB from '@/lib/db';
import Technician from '@/models/Technician';
import User from '@/models/User';
import ServiceCenter from '@/models/ServiceCenter';
import mongoose from 'mongoose';
import { hashPassword } from '@/lib/hash';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUserFull(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    const filter: Record<string, any> = {};

    if (user.role === 'admin') {
      // No filter — all tenants
    } else if (user.role === 'manager') {
      // All technicians across all SCs of this brand
      filter.tenantId = user.tenantId;
    } else if (user.role === 'service_center') {
      // ONLY technicians belonging to this SC
      filter.tenantId = user.tenantId;
      if (user.serviceCenterId && mongoose.Types.ObjectId.isValid(user.serviceCenterId)) {
        filter.serviceCenterId = new mongoose.Types.ObjectId(user.serviceCenterId);
      }
    } else if (user.role === 'technician') {
      // Only themselves
      filter.userId = new mongoose.Types.ObjectId(user.userId);
    } else {
      return errorResponse('Forbidden', 403);
    }

    const technicians = await Technician.find(filter)
      .populate('userId', 'name email phone isActive')
      .populate('serviceCenterId', 'name code')
      .lean();

    return successResponse(technicians, 'Technicians fetched');
  } catch (error) {
    console.error('Technicians error:', error);
    return errorResponse('An error occurred', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUserFull(request);
    if (!user) return errorResponse('Unauthorized', 401);

    if (!['admin', 'manager', 'service_center'].includes(user.role)) {
      return errorResponse('Forbidden', 403);
    }

    await connectDB();
    const body = await request.json();

    const { name, email, phone, employeeId, specializations, serviceCenterId } = body;

    if (!name || !email || !serviceCenterId) {
      return errorResponse('name, email and serviceCenterId are required', 400);
    }

    // Determine which brand this tech will belong to
    const tenantId =
      user.role === 'admin' ? (body.tenantId ?? user.tenantId) : user.tenantId;

    // Validate the service center exists and belongs to the correct brand
    const sc = await ServiceCenter.findById(serviceCenterId);
    if (!sc) return errorResponse('Service center not found', 404);

    if (user.role !== 'admin' && sc.tenantId !== tenantId) {
      return errorResponse('Forbidden: service center does not belong to your brand', 403);
    }

    // SC operator can only add technicians to their own SC
    if (user.role === 'service_center' && user.serviceCenterId) {
      if (serviceCenterId !== user.serviceCenterId && serviceCenterId !== sc._id.toString()) {
        return errorResponse('Forbidden: you can only add technicians to your own service center', 403);
      }
    }

    // Check email uniqueness within this brand
    const existingUser = await User.findOne({ email, tenantId });
    if (existingUser) return errorResponse('Email already registered in this brand', 409);

    // Create User record (role: technician)
    const defaultPassword = body.password || 'TechPass123!';
    const hashedPw = await hashPassword(defaultPassword);

    const newUser = await User.create({
      name,
      email,
      password: hashedPw,
      role: 'technician',
      tenantId,
      serviceCenterId: sc._id.toString(),
      phone: phone ?? null,
      isActive: true,
    });

    // Create Technician profile
    const empId = employeeId || `EMP-${newUser._id.toString().slice(-4).toUpperCase()}`;

    const tech = await Technician.create({
      userId: newUser._id,
      tenantId,
      serviceCenterId: sc._id,
      employeeId: empId,
      specializations: specializations ?? [],
      isActive: true,
    });

    const result = await Technician.findById(tech._id)
      .populate('userId', 'name email phone')
      .populate('serviceCenterId', 'name code');

    return successResponse(result, 'Technician created successfully', 201);
  } catch (error: any) {
    console.error('Create technician error:', error);
    if (error.code === 11000) return errorResponse('Email already exists', 409);
    return errorResponse('An error occurred', 500);
  }
}