 // app/api/auth/reset-password/route.ts  — REPLACE existing
// After OTP verified, user submits new password with the token

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import User from '@/models/User';
import connectDB from '@/lib/db';
import { hashPassword } from '@/lib/hash';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, otp, password, confirmPassword } = body;

    if (!token || !otp || !password) {
      return errorResponse('Token, OTP and new password are required', 400);
    }

    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    if (password !== confirmPassword) {
      return errorResponse('Passwords do not match', 400);
    }

    await connectDB();

    const user = await User.findOne({ resetPasswordToken: token })
      .select('+resetPasswordOTP +resetPasswordToken +resetPasswordExpiry +password');

    if (!user) {
      return errorResponse('Invalid or expired reset link. Please request a new one.', 400);
    }

    // Check expiry
    if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
      await User.findByIdAndUpdate(user._id, {
        $unset: { resetPasswordOTP: 1, resetPasswordToken: 1, resetPasswordExpiry: 1 },
      });
      return errorResponse('OTP has expired. Please request a new password reset.', 400);
    }

    // Verify OTP once more (prevent skipping verify-otp step)
    if (!user.resetPasswordOTP) {
      return errorResponse('No OTP found. Please request a new password reset.', 400);
    }

    const isOTPValid = await bcrypt.compare(String(otp).trim(), user.resetPasswordOTP);
    if (!isOTPValid) {
      return errorResponse('Invalid OTP. Please start the reset process again.', 400);
    }

    // Hash and save new password, clear reset fields
    const hashed = await hashPassword(password);
    await User.findByIdAndUpdate(user._id, {
      password: hashed,
      $unset: { resetPasswordOTP: 1, resetPasswordToken: 1, resetPasswordExpiry: 1 },
    });

    return successResponse(null, 'Password has been reset successfully. You can now log in.');
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse('An error occurred', 500);
  }
}