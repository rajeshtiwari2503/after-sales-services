// import { NextRequest } from 'next/server';
// import { getAuthUser } from '@/lib/auth-helper';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import User from '@/models/User';
// import { comparePassword, hashPassword } from '@/lib/hash';
// import connectDB from '@/lib/db';

// export async function POST(request: NextRequest) {
//   try {
//     const authUser = getAuthUser(request);
//     if (!authUser) return errorResponse('Unauthorized', 401);

//     const { currentPassword, newPassword } = await request.json();
//     if (!currentPassword || !newPassword) {
//       return errorResponse('Both current and new password required', 400);
//     }
//     if (newPassword.length < 8) {
//       return errorResponse('New password must be at least 8 characters', 400);
//     }

//     await connectDB();
//     const user = await User.findById(authUser.userId).select('+password');
//     if (!user) return errorResponse('User not found', 404);

//     const isValid = await comparePassword(currentPassword, user?.password);
//     if (!isValid) return errorResponse('Current password is incorrect', 400);

//     user.password = await hashPassword(newPassword);
//     await user.save();

//     return successResponse(null, 'Password changed successfully');
//   } catch (error) {
//     console.error('Change password error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import {
  successResponse,
  errorResponse,
} from '@/utils/apiResponse';

import User, {
  UserDocument,
} from '@/models/User';

import {
  comparePassword,
  hashPassword,
} from '@/lib/hash';

import connectDB from '@/lib/db';

export async function POST(
  request: NextRequest
) {
  try {
    const authUser =
      getAuthUser(request);

    if (!authUser) {
      return errorResponse(
        'Unauthorized',
        401
      );
    }

    const {
      currentPassword,
      newPassword,
    } = await request.json();

    if (
      !currentPassword ||
      !newPassword
    ) {
      return errorResponse(
        'Both current and new password required',
        400
      );
    }

    if (newPassword.length < 8) {
      return errorResponse(
        'New password must be at least 8 characters',
        400
      );
    }

    await connectDB();

    const user =
      await User.findById(
        authUser.userId
      )
        .select('+password')
        .lean<UserDocument>();

    if (!user) {
      return errorResponse(
        'User not found',
        404
      );
    }

    if (!user.password) {
      return errorResponse(
        'Password not found',
        400
      );
    }

    const isValid =
      await comparePassword(
        currentPassword,
        user.password
      );

    if (!isValid) {
      return errorResponse(
        'Current password is incorrect',
        400
      );
    }

    const hashedPassword =
      await hashPassword(
        newPassword
      );

    await User.findByIdAndUpdate(
      authUser.userId,
      {
        password:
          hashedPassword,
      }
    );

    return successResponse(
      null,
      'Password changed successfully'
    );
  } catch (error) {
    console.error(
      'Change password error:',
      error
    );

    return errorResponse(
      'An error occurred',
      500
    );
  }
}