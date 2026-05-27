//  // app/api/auth/reset-password/route.ts  — REPLACE existing
// // After OTP verified, user submits new password with the token

// import { NextRequest } from 'next/server';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import User from '@/models/User';
// import connectDB from '@/lib/db';
// import { hashPassword } from '@/lib/hash';
// import bcrypt from 'bcryptjs';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { token, otp, password, confirmPassword } = body;

//     if (!token || !otp || !password) {
//       return errorResponse('Token, OTP and new password are required', 400);
//     }

//     if (password.length < 8) {
//       return errorResponse('Password must be at least 8 characters', 400);
//     }

//     if (password !== confirmPassword) {
//       return errorResponse('Passwords do not match', 400);
//     }

//     await connectDB();

//     const user = await User.findOne({ resetPasswordToken: token })
//       .select('+resetPasswordOTP +resetPasswordToken +resetPasswordExpiry +password');

//     if (!user) {
//       return errorResponse('Invalid or expired reset link. Please request a new one.', 400);
//     }

//     // Check expiry
//     if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
//       await User.findByIdAndUpdate(user._id, {
//         $unset: { resetPasswordOTP: 1, resetPasswordToken: 1, resetPasswordExpiry: 1 },
//       });
//       return errorResponse('OTP has expired. Please request a new password reset.', 400);
//     }

//     // Verify OTP once more (prevent skipping verify-otp step)
//     if (!user.resetPasswordOTP) {
//       return errorResponse('No OTP found. Please request a new password reset.', 400);
//     }

//     const isOTPValid = await bcrypt.compare(String(otp).trim(), user.resetPasswordOTP);
//     if (!isOTPValid) {
//       return errorResponse('Invalid OTP. Please start the reset process again.', 400);
//     }

//     // Hash and save new password, clear reset fields
//     const hashed = await hashPassword(password);
//     await User.findByIdAndUpdate(user._id, {
//       password: hashed,
//       $unset: { resetPasswordOTP: 1, resetPasswordToken: 1, resetPasswordExpiry: 1 },
//     });

//     return successResponse(null, 'Password has been reset successfully. You can now log in.');
//   } catch (error) {
//     console.error('Reset password error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

// app/api/auth/reset-password/route.ts
 import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import { hashPassword } from "@/lib/hash";

import User from "@/models/User";
import Technician from "@/models/Technician";
import Brand from "@/models/Brand";
import ServiceCenter from "@/models/ServiceCenter";

import { successResponse, errorResponse } from "@/utils/apiResponse";

/**
 * -----------------------------------
 * ALL MODELS LIST
 * -----------------------------------
 */
const models: any[] = [
  User,
  Technician,
  Brand,
  ServiceCenter,
];

/**
 * -----------------------------------
 * FIND ACCOUNT BY TOKEN
 * -----------------------------------
 */
async function findAccount(token: string) {
  for (const Model of models) {
    const account = await Model.findOne({
      resetPasswordToken: token,
    }).select(
      "+resetPasswordOTP +resetPasswordToken +resetPasswordExpiry +password"
    );

    if (account) {
      return { account, Model };
    }
  }

  return null;
}

/**
 * -----------------------------------
 * RESET PASSWORD API
 * -----------------------------------
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      token,
      otp,
      password,
      confirmPassword,
    } = body;

    /**
     * VALIDATION
     */
    if (!token || !otp || !password || !confirmPassword) {
      return errorResponse(
        "Token, OTP, password and confirm password are required",
        400
      );
    }

    if (password.length < 8) {
      return errorResponse(
        "Password must be at least 8 characters",
        400
      );
    }

    if (password !== confirmPassword) {
      return errorResponse(
        "Passwords do not match",
        400
      );
    }

    /**
     * FIND ACCOUNT
     */
    const result = await findAccount(token);

    if (!result) {
      return errorResponse(
        "Invalid or expired reset link",
        400
      );
    }

    const { account, Model } = result;

    /**
     * CHECK EXPIRY
     */
    if (
      !account.resetPasswordExpiry ||
      new Date(account.resetPasswordExpiry) < new Date()
    ) {
      await Model.findByIdAndUpdate(account._id, {
        $unset: {
          resetPasswordOTP: 1,
          resetPasswordToken: 1,
          resetPasswordExpiry: 1,
        },
      });

      return errorResponse(
        "OTP expired. Please request password reset again.",
        400
      );
    }

    /**
     * VERIFY OTP
     */
    if (!account.resetPasswordOTP) {
      return errorResponse("OTP not found", 400);
    }

    const isValidOTP = await bcrypt.compare(
      String(otp).trim(),
      account.resetPasswordOTP
    );

    if (!isValidOTP) {
      return errorResponse("Invalid OTP", 400);
    }

    /**
     * HASH PASSWORD
     */
    const hashedPassword = await hashPassword(password);

    /**
     * UPDATE PASSWORD + CLEAN RESET FIELDS
     */
    await Model.findByIdAndUpdate(account._id, {
      password: hashedPassword,

      $unset: {
        resetPasswordOTP: 1,
        resetPasswordToken: 1,
        resetPasswordExpiry: 1,
      },
    });

    return successResponse(
      { success: true },
      "Password reset successful"
    );
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}