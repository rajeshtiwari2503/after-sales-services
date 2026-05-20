// import { NextRequest } from 'next/server';
// import { getAuthUser } from '@/lib/auth-helper';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import User from '@/models/User';
// import connectDB from '@/lib/db';

// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const authUser = getAuthUser(request);
//     if (!authUser) return errorResponse('Unauthorized', 401);
//     await connectDB();
//     const user = await User.findById(params.id).select('-password').lean();
//     if (!user) return errorResponse('User not found', 404);
//     return successResponse(user, 'User fetched');
//   } catch { return errorResponse('An error occurred', 500); }
// }

// export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const authUser = getAuthUser(request);
//     if (!authUser) return errorResponse('Unauthorized', 401);

//     // Only allow updating own profile unless admin
//     if (authUser.userId !== params.id && authUser.role !== 'admin') {
//       return errorResponse('Forbidden', 403);
//     }

//     const body = await request.json();
//     await connectDB();

//     // Only allow safe fields
//     const allowedFields = ['name', 'phone', 'avatar'];
//     const updateData: Record<string, any> = {};
//     allowedFields.forEach(f => { if (body[f] !== undefined) updateData[f] = body[f]; });

//     const user = await User.findByIdAndUpdate(
//       params.id, updateData, { new: true }
//     ).select('-password');

//     if (!user) return errorResponse('User not found', 404);
//     return successResponse(user, 'User updated');
//   } catch { return errorResponse('An error occurred', 500); }
// }

// export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const authUser = getAuthUser(request);
//     if (!authUser || authUser.role !== 'admin') return errorResponse('Forbidden', 403);
//     await connectDB();
//     await User.findByIdAndDelete(params.id);
//     return successResponse(null, 'User deleted');
//   } catch { return errorResponse('An error occurred', 500); }
// }

import { NextRequest } from "next/server";

import { getAuthUser } from "@/lib/auth-helper";

import {
  successResponse,
  errorResponse,
} from "@/utils/apiResponse";

import User from "@/models/User";

import connectDB from "@/lib/db";

// ======================
// GET USER
// ======================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser =
      await getAuthUser(request);

    if (!authUser) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    await connectDB();

    const { id } =
      await context.params;

    const user =
      await User.findById(id)
        .select("-password")
        .lean();

    if (!user) {
      return errorResponse(
        "User not found",
        404
      );
    }

    return successResponse(
      user,
      "User fetched successfully"
    );
  } catch (error) {
    console.error(
      "[GET_USER_ERROR]",
      error
    );

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}

// ======================
// UPDATE USER
// ======================

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser =
      await getAuthUser(request);

    if (!authUser) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    const { id } =
      await context.params;

    // Only own profile or admin
    if (
      authUser.userId !== id &&
      authUser.role !== "admin"
    ) {
      return errorResponse(
        "Forbidden",
        403
      );
    }

    await connectDB();

    const body =
      await request.json();

    // ======================
    // Allowed Fields
    // ======================

    const allowedFields = [
      "name",
      "phone",
      "avatar",
    ];

    const updateData: Record<
      string,
      any
    > = {};

    allowedFields.forEach(
      (field) => {
        if (
          body[field] !== undefined
        ) {
          updateData[field] =
            body[field];
        }
      }
    );

    const user =
      await User.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
        }
      ).select("-password");

    if (!user) {
      return errorResponse(
        "User not found",
        404
      );
    }

    return successResponse(
      user,
      "User updated successfully"
    );
  } catch (error) {
    console.error(
      "[PATCH_USER_ERROR]",
      error
    );

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}

// ======================
// DELETE USER
// ======================

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser =
      await getAuthUser(request);

    if (
      !authUser ||
      authUser.role !== "admin"
    ) {
      return errorResponse(
        "Forbidden",
        403
      );
    }

    await connectDB();

    const { id } =
      await context.params;

    const user =
      await User.findByIdAndDelete(
        id
      );

    if (!user) {
      return errorResponse(
        "User not found",
        404
      );
    }

    return successResponse(
      null,
      "User deleted successfully"
    );
  } catch (error) {
    console.error(
      "[DELETE_USER_ERROR]",
      error
    );

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}