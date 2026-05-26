//  import { NextRequest } from 'next/server';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import { getAuthUser } from '@/lib/auth-helper';
// import User from '@/models/User';
// import connectDB from '@/lib/db';
// import { hashPassword } from '@/lib/hash';

// export async function GET(request: NextRequest) {
//   try {
//     const user = getAuthUser(request);
//     if (!user) return errorResponse('Unauthorized', 401);

//     await connectDB();
//     const { searchParams } = new URL(request.url);
//     const role = searchParams.get('role');
//     const search = searchParams.get('search');
//     const page = parseInt(searchParams.get('page') ?? '1');
//     const limit = parseInt(searchParams.get('limit') ?? '50');

//     const query: Record<string, any> = {};

//     // Non-admin users scoped to their tenant
//     if (user.role !== 'admin') query.tenantId = user.tenantId;

//     if (role) query.role = role;
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//       ];
//     }

//     const [users, total] = await Promise.all([
//       User.find(query)
//         .select('-password')
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(limit)
//         .lean(),
//       User.countDocuments(query),
//     ]);

//     return successResponse({ users, total, page, limit }, 'Users fetched');
//   } catch (error) {
//     console.error('Get users error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }


// export async function POST(
//   request: NextRequest
// ) {
//   try {
//     const authUser =
//       await getAuthUser(request);

//     if (!authUser) {
//       return errorResponse(
//         "Unauthorized",
//         401
//       );
//     }

//     await connectDB();

//     const body =
//       await request.json();

//     const {
//       name,
//       email,
//       password,
//       phone,
//       role,
//       serviceCenterId,
//     } = body;

//     // ======================
//     // Validation
//     // ======================

//     if (
//       !name ||
//       !email ||
//       !password
//     ) {
//       return errorResponse(
//         "Name, email and password are required",
//         400
//       );
//     }

//     // ======================
//     // Existing User
//     // ======================

//     const existingUser =
//       await User.findOne({
//         email: email
//           .trim()
//           .toLowerCase(),
//         tenantId:
//           authUser.tenantId,
//       });

//     if (existingUser) {
//       return errorResponse(
//         "User already exists with this email",
//         409
//       );
//     }

//     // ======================
//     // Hash Password
//     // ======================

//     const hashedPassword =
//       await hashPassword(
//         password
//       );

//     // ======================
//     // Create User
//     // ======================

//     const user =
//       await User.create({
//         name: name.trim(),

//         email: email
//           .trim()
//           .toLowerCase(),

//         password:
//           hashedPassword,

//         phone:
//           phone?.trim() || "",

//         role:
//           role || "customer",

//         tenantId:
//           authUser.tenantId,

//         serviceCenterId:
//           serviceCenterId ||
//           null,

//         isActive: true,
//       });

//     // ======================
//     // Response
//     // ======================

//     const safeUser =
//       await User.findById(
//         user._id
//       )
//         .select("-password")
//         .lean();

//     return successResponse(
//       safeUser,
//       "User created successfully",
//       201
//     );
//   } catch (error: any) {
//     console.error(
//       "[CREATE_USER_ERROR]",
//       error
//     );

//     if (error.code === 11000) {
//       return errorResponse(
//         "Email already exists",
//         409
//       );
//     }

//     return errorResponse(
//       "Internal Server Error",
//       500
//     );
//   }
// }

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getAuthUser } from "@/lib/auth-helper";
import { audit } from "@/lib/audit-request";
import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return errorResponse("Unauthorized", 401);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role   = searchParams.get("role");
    const search = searchParams.get("search");
    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));

    // Build query — non-admin scoped to their tenant
    const query: Record<string, any> = {};
    if (authUser.role !== "admin") query.tenantId = authUser.tenantId;
    if (role)   query.role = role;
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Return users array nested under data.users so frontend can do data.users
    return successResponse(
      { users, total, page, limit },
      "Users fetched"
    );
  } catch (error) {
    console.error("GET /api/users error:", error);
    return errorResponse("Failed to fetch users", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return errorResponse("Unauthorized", 401);
    // if (authUser.role !== "admin") return errorResponse("Forbidden", 403);
    if (
  authUser.role !== "admin" &&
  authUser.role !== "brand" &&
  authUser.role !== "manager"
) {
  return errorResponse("Forbidden", 403);
}

    await connectDB();
    const body = await request.json();

    if (!body.name || !body.email) {
      return errorResponse("Name and email are required", 400);
    }

    const exists = await User.findOne({ email: body.email.toLowerCase() });
    if (exists) return errorResponse("Email already registered", 400);

    const user = await User.create({
      ...body,
      email: body.email.toLowerCase(),
      tenantId: body.tenantId ?? authUser.tenantId,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    audit(request, authUser, {
      action: AUDIT_ACTIONS.CREATE,
      module: AUDIT_MODULES.USER,
      entityId:   user._id.toString(),
      entityName: user.name,
      message:    `User created: ${user.email}`,
    });

    return successResponse(userWithoutPassword, "User created successfully", 201);
  } catch (error) {
    console.error("POST /api/users error:", error);
    return errorResponse("Failed to create user", 500);
  }
}