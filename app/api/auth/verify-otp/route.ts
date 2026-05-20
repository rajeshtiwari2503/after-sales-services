// // app/api/auth/verify-otp/route.ts  — NEW FILE
// // Verifies the OTP entered by user, returns confirmed=true if valid

// import { NextRequest } from 'next/server';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import User from '@/models/User';
// import connectDB from '@/lib/db';
// import bcrypt from 'bcryptjs';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { token, otp } = body;

//     if (!token || !otp) {
//       return errorResponse('Token and OTP are required', 400);
//     }

//     await connectDB();

//     const user = await User.findOne({ resetPasswordToken: token })
//       .select('+resetPasswordOTP +resetPasswordToken +resetPasswordExpiry');

//     if (!user) {
//       return errorResponse('Invalid or expired reset link. Please request a new one.', 400);
//     }

//     // Check expiry
//     if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
//       // Clear expired token
//       await User.findByIdAndUpdate(user._id, {
//         $unset: { resetPasswordOTP: 1, resetPasswordToken: 1, resetPasswordExpiry: 1 },
//       });
//       return errorResponse('OTP has expired. Please request a new password reset.', 400);
//     }

//     if (!user.resetPasswordOTP) {
//       return errorResponse('No OTP found. Please request a new password reset.', 400);
//     }

//     // Verify OTP
//     const isValid = await bcrypt.compare(String(otp).trim(), user.resetPasswordOTP);
//     if (!isValid) {
//       return errorResponse('Incorrect OTP. Please try again.', 400);
//     }

//     return successResponse(
//       { verified: true, token },
//       'OTP verified successfully.'
//     );
//   } catch (error) {
//     console.error('Verify OTP error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

import { NextRequest } from "next/server";

import {
  successResponse,
  errorResponse,
} from "@/utils/apiResponse";

import User from "@/models/User";

import connectDB from "@/lib/db";

import bcrypt from "bcryptjs";

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const { token, otp } =
      body;

    if (!token || !otp) {
      return errorResponse(
        "Token and OTP are required",
        400
      );
    }

    await connectDB();

    const user =
      await User.findOne({
        resetPasswordToken:
          token,
      }).select(
        "+resetPasswordOTP +resetPasswordToken +resetPasswordExpiry"
      );

    console.log(
      "Found user:",
      user
    );

    // ======================
    // User Not Found
    // ======================

    if (!user) {
      return errorResponse(
        "Invalid or expired reset link. Please request a new one.",
        400
      );
    }

    // ======================
    // Expiry Check
    // ======================

  const expiry = new Date(
  (user as any).resetPasswordExpiry
).getTime();

console.log("Expiry:", expiry);
console.log("Current:", Date.now());

if (
  Number.isNaN(expiry) ||
  Date.now() >= expiry
) {
  await User.findByIdAndUpdate(
    user._id,
    {
      $unset: {
        resetPasswordOTP: 1,
        resetPasswordToken: 1,
        resetPasswordExpiry: 1,
      },
    }
  );

  return errorResponse(
    "OTP has expired. Please request a new password reset.",
    400
  );
}

    // ======================
    // OTP Exists
    // ======================

    if (
      !user.resetPasswordOTP
    ) {
      return errorResponse(
        "OTP not found. Please request a new password reset.",
        400
      );
    }

    // ======================
    // Verify OTP
    // ======================

    const isValid =
      await bcrypt.compare(
        String(otp).trim(),
        user.resetPasswordOTP
      );

    if (!isValid) {
      return errorResponse(
        "Incorrect OTP. Please try again.",
        400
      );
    }

    // ======================
    // Success
    // ======================

    return successResponse(
      {
        verified: true,
        token,
      },
      "OTP verified successfully."
    );
  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    return errorResponse(
      "An error occurred",
      500
    );
  }
}