 

// import { NextRequest } from "next/server";

// import {
//   successResponse,
//   errorResponse,
// } from "@/utils/apiResponse";

// import User from "@/models/User";

// import connectDB from "@/lib/db";

// import bcrypt from "bcryptjs";

// export async function POST(
//   request: NextRequest
// ) {
//   try {
//     const body =
//       await request.json();

//     const { token, otp } =
//       body;

//     if (!token || !otp) {
//       return errorResponse(
//         "Token and OTP are required",
//         400
//       );
//     }

//     await connectDB();

//     const user =
//       await User.findOne({
//         resetPasswordToken:
//           token,
//       }).select(
//         "+resetPasswordOTP +resetPasswordToken +resetPasswordExpiry"
//       );

//     console.log(
//       "Found user:",
//       user
//     );

//     // ======================
//     // User Not Found
//     // ======================

//     if (!user) {
//       return errorResponse(
//         "Invalid or expired reset link. Please request a new one.",
//         400
//       );
//     }

//     // ======================
//     // Expiry Check
//     // ======================

//   const expiry = new Date(
//   (user as any).resetPasswordExpiry
// ).getTime();

// console.log("Expiry:", expiry);
// console.log("Current:", Date.now());

// if (
//   Number.isNaN(expiry) ||
//   Date.now() >= expiry
// ) {
//   await User.findByIdAndUpdate(
//     user._id,
//     {
//       $unset: {
//         resetPasswordOTP: 1,
//         resetPasswordToken: 1,
//         resetPasswordExpiry: 1,
//       },
//     }
//   );

//   return errorResponse(
//     "OTP has expired. Please request a new password reset.",
//     400
//   );
// }

//     // ======================
//     // OTP Exists
//     // ======================

//     if (
//       !user.resetPasswordOTP
//     ) {
//       return errorResponse(
//         "OTP not found. Please request a new password reset.",
//         400
//       );
//     }

//     // ======================
//     // Verify OTP
//     // ======================

//     const isValid =
//       await bcrypt.compare(
//         String(otp).trim(),
//         user.resetPasswordOTP
//       );

//     if (!isValid) {
//       return errorResponse(
//         "Incorrect OTP. Please try again.",
//         400
//       );
//     }

//     // ======================
//     // Success
//     // ======================

//     return successResponse(
//       {
//         verified: true,
//         token,
//       },
//       "OTP verified successfully."
//     );
//   } catch (error) {
//     console.error(
//       "Verify OTP error:",
//       error
//     );

//     return errorResponse(
//       "An error occurred",
//       500
//     );
//   }
// }

// app/api/auth/verify-reset-otp/route.ts

import { NextRequest } from 'next/server';

import {
  successResponse,
  errorResponse,
} from '@/utils/apiResponse';

import connectDB from '@/lib/db';

import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';

const COLLECTIONS = [
  {
    role: 'customer',
    collection: 'users',
  },
  {
    role: 'serviceCenter',
    collection: 'servicecenters',
  },
  {
    role: 'technician',
    collection: 'technicians',
  },
  {
    role: 'brand',
    collection: 'brands',
  },
];

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const { token, otp } =
      body;

    // ======================
    // Validation
    // ======================

    if (!token || !otp) {
      return errorResponse(
        'Token and OTP are required',
        400
      );
    }

    await connectDB();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error(
        'Database connection not established'
      );
    }

    let foundUser: any = null;
    let foundCollection: any = null;

    // ======================
    // Find User In All Collections
    // ======================

    for (const item of COLLECTIONS) {
      const collection =
        db.collection(item.collection);

      const user =
        await collection.findOne({
          resetPasswordToken:
            token,
        });

      if (user) {
        foundUser = user;
        foundCollection = item;
        break;
      }
    }

    // ======================
    // User Not Found
    // ======================

    if (
      !foundUser ||
      !foundCollection
    ) {
      return errorResponse(
        'Invalid or expired reset token.',
        400
      );
    }

    const collection =
      db.collection(
        foundCollection.collection
      );

    // ======================
    // Expiry Check
    // ======================

    const expiry = new Date(
      foundUser.resetPasswordExpiry
    ).getTime();

    console.log(
      'Expiry:',
      expiry
    );

    console.log(
      'Current:',
      Date.now()
    );

    if (
      Number.isNaN(expiry) ||
      Date.now() >= expiry
    ) {
      // Remove expired data
      await collection.updateOne(
        { _id: foundUser._id },
        {
          $unset: {
            resetPasswordOTP: 1,
            resetPasswordToken: 1,
            resetPasswordExpiry: 1,
          },
        }
      );

      return errorResponse(
        'OTP has expired. Please request a new password reset.',
        400
      );
    }

    // ======================
    // OTP Exists
    // ======================

    if (
      !foundUser.resetPasswordOTP
    ) {
      return errorResponse(
        'OTP not found. Please request a new reset.',
        400
      );
    }

    // ======================
    // Verify OTP
    // ======================

    const isValid =
      await bcrypt.compare(
        String(otp).trim(),
        foundUser.resetPasswordOTP
      );

    if (!isValid) {
      return errorResponse(
        'Incorrect OTP. Please try again.',
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
        role:
          foundCollection.role,
      },
      'OTP verified successfully.'
    );
  } catch (error) {
    console.error(
      'Verify OTP error:',
      error
    );

    return errorResponse(
      'An error occurred',
      500
    );
  }
}