// // import { NextRequest } from 'next/server';
// // import { getAuthUser } from '@/lib/auth-helper';
// // import { successResponse, errorResponse } from '@/utils/apiResponse';
// // import User from '@/models/User';
// // import connectDB from '@/lib/db';

// // export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
// //   try {
// //     const authUser = getAuthUser(request);
// //     if (!authUser) return errorResponse('Unauthorized', 401);
// //     await connectDB();
// //     const user = await User.findById(params.id).select('-password').lean();
// //     if (!user) return errorResponse('User not found', 404);
// //     return successResponse(user, 'User fetched');
// //   } catch { return errorResponse('An error occurred', 500); }
// // }

// // export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
// //   try {
// //     const authUser = getAuthUser(request);
// //     if (!authUser) return errorResponse('Unauthorized', 401);

// //     // Only allow updating own profile unless admin
// //     if (authUser.userId !== params.id && authUser.role !== 'admin') {
// //       return errorResponse('Forbidden', 403);
// //     }

// //     const body = await request.json();
// //     await connectDB();

// //     // Only allow safe fields
// //     const allowedFields = ['name', 'phone', 'avatar'];
// //     const updateData: Record<string, any> = {};
// //     allowedFields.forEach(f => { if (body[f] !== undefined) updateData[f] = body[f]; });

// //     const user = await User.findByIdAndUpdate(
// //       params.id, updateData, { new: true }
// //     ).select('-password');

// //     if (!user) return errorResponse('User not found', 404);
// //     return successResponse(user, 'User updated');
// //   } catch { return errorResponse('An error occurred', 500); }
// // }

// // export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
// //   try {
// //     const authUser = getAuthUser(request);
// //     if (!authUser || authUser.role !== 'admin') return errorResponse('Forbidden', 403);
// //     await connectDB();
// //     await User.findByIdAndDelete(params.id);
// //     return successResponse(null, 'User deleted');
// //   } catch { return errorResponse('An error occurred', 500); }
// // }

// import { NextRequest } from "next/server";

// import { getAuthUser } from "@/lib/auth-helper";

// import {
//   successResponse,
//   errorResponse,
// } from "@/utils/apiResponse";

// import User from "@/models/User";

// import connectDB from "@/lib/db";

// // ======================
// // GET USER
// // ======================

// export async function GET(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
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

//     const { id } =
//       await context.params;

//     const user =
//       await User.findById(id)
//         .select("-password")
//         .lean();

//     if (!user) {
//       return errorResponse(
//         "User not found",
//         404
//       );
//     }

//     return successResponse(
//       user,
//       "User fetched successfully"
//     );
//   } catch (error) {
//     console.error(
//       "[GET_USER_ERROR]",
//       error
//     );

//     return errorResponse(
//       "Internal Server Error",
//       500
//     );
//   }
// }

// // ======================
// // UPDATE USER
// // ======================

// export async function PATCH(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
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

//     const { id } =
//       await context.params;

//     // Only own profile or admin
//     if (
//       authUser.userId !== id &&
//       authUser.role !== "admin"
//     ) {
//       return errorResponse(
//         "Forbidden",
//         403
//       );
//     }

//     await connectDB();

//     const body =
//       await request.json();

//     // ======================
//     // Allowed Fields
//     // ======================

//     const allowedFields = [
//       "name",
//       "phone",
//       "avatar",
//     ];

//     const updateData: Record<
//       string,
//       any
//     > = {};

//     allowedFields.forEach(
//       (field) => {
//         if (
//           body[field] !== undefined
//         ) {
//           updateData[field] =
//             body[field];
//         }
//       }
//     );

//     const user =
//       await User.findByIdAndUpdate(
//         id,
//         updateData,
//         {
//           new: true,
//         }
//       ).select("-password");

//     if (!user) {
//       return errorResponse(
//         "User not found",
//         404
//       );
//     }

//     return successResponse(
//       user,
//       "User updated successfully"
//     );
//   } catch (error) {
//     console.error(
//       "[PATCH_USER_ERROR]",
//       error
//     );

//     return errorResponse(
//       "Internal Server Error",
//       500
//     );
//   }
// }

// // ======================
// // DELETE USER
// // ======================

// export async function DELETE(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const authUser =
//       await getAuthUser(request);

//     if (
//       !authUser ||
//       authUser.role !== "admin"
//     ) {
//       return errorResponse(
//         "Forbidden",
//         403
//       );
//     }

//     await connectDB();

//     const { id } =
//       await context.params;

//     const user =
//       await User.findByIdAndDelete(
//         id
//       );

//     if (!user) {
//       return errorResponse(
//         "User not found",
//         404
//       );
//     }

//     return successResponse(
//       null,
//       "User deleted successfully"
//     );
//   } catch (error) {
//     console.error(
//       "[DELETE_USER_ERROR]",
//       error
//     );

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
import bcrypt from "bcryptjs";
import { audit } from "@/lib/audit-request";
import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ─── GET single user ──────────────────────────────────────────
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { id } = await context.params;

    const user = await User.findById(id).select("-password").lean();
    if (!user) return errorResponse("User not found", 404);

    // Non-admin can only fetch their own profile
    if (authUser.role !== "admin" && authUser.userId !== id) {
      return errorResponse("Forbidden", 403);
    }

    return successResponse(user, "User fetched");
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return errorResponse("Failed to fetch user", 500);
  }
}

// ─── PUT update user ──────────────────────────────────────────
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { id } = await context.params;
    const body = await request.json();

    const isSelf  = authUser.userId === id;
    const isAdmin = authUser.role   === "admin";

    // Only admin or self can update
    if (!isSelf && !isAdmin) {
      return errorResponse("Forbidden", 403);
    }

    // Build safe update — start with fields anyone can update on self
    const updateData: Record<string, any> = {};
    if (body.name  !== undefined && body.name.trim())  updateData.name  = body.name.trim();
    if (body.phone !== undefined)                       updateData.phone = body.phone;

    // Admin-only fields
    if (isAdmin) {
      if (body.role     !== undefined) updateData.role     = body.role;
      if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
      if (body.tenantId !== undefined) updateData.tenantId = body.tenantId;
    }

    // Password change — require min 8 chars, hash it
    if (body.password && body.password.trim().length >= 8) {
      updateData.password = await bcrypt.hash(body.password.trim(), 12);
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse("No valid fields to update", 400);
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password").lean();

    if (!updated) return errorResponse("User not found", 404);

    audit(request, authUser, {
      action: body.isActive === false ? AUDIT_ACTIONS.TOGGLE_ACTIVE : AUDIT_ACTIONS.UPDATE,
      module: AUDIT_MODULES.USER,
      entityId:   id,
      entityName: updated.name,
      message:    `User updated: ${updated.email}`,
    });

    return successResponse(updated, "User updated successfully");
  } catch (error: any) {
    console.error("PUT /api/users/[id] error:", error);
    if (error.code === 11000) return errorResponse("Email already in use", 400);
    return errorResponse("Failed to update user", 500);
  }
}

// ─── PATCH — same as PUT (alias for frontend flexibility) ─────
export async function PATCH(request: NextRequest, context: RouteContext) {
  return PUT(request, context);
}

// ─── DELETE user ──────────────────────────────────────────────
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return errorResponse("Unauthorized", 401);
    if (authUser.role !== "admin") return errorResponse("Forbidden — admin only", 403);

    await connectDB();
    const { id } = await context.params;

    // Prevent self-delete
    if (authUser.userId === id) {
      return errorResponse("You cannot delete your own account", 400);
    }

    const deleted = await User.findByIdAndDelete(id).select("-password").lean();
    if (!deleted) return errorResponse("User not found", 404);

    audit(request, authUser, {
      action: AUDIT_ACTIONS.DELETE,
      module: AUDIT_MODULES.USER,
      entityId:   id,
      entityName: deleted.name,
      message:    `User deleted: ${deleted.email}`,
    });

    return successResponse({ id }, "User deleted successfully");
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return errorResponse("Failed to delete user", 500);
  }
}