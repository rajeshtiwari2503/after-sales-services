//  // app/api/auth/forgot-password/route.ts  — REPLACE
// // Uses native MongoDB driver directly — bypasses Mongoose schema completely
// // so reset fields save hote hain chahe User model mein defined na hon

// import { NextRequest } from 'next/server';
// import { successResponse, errorResponse } from '@/utils/apiResponse';
// import connectDB from '@/lib/db';
// import mongoose from 'mongoose';
// import crypto from 'crypto';
// import bcrypt from 'bcryptjs';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { email } = body;

//     if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
//       return errorResponse('Valid email is required', 400);
//     }

//     await connectDB();

//     // Use native collection — completely bypasses Mongoose schema
//    const db = mongoose.connection.db;

// if (!db) {
//   throw new Error("Database connection not established");
// }

// const collection = db.collection("users");

//     const user = await collection.findOne({ email: email.toLowerCase().trim() });

//     if (!user || !user.isActive) {
//       return successResponse(
//         { token: null },
//         'If an account exists with this email, a reset OTP has been sent.'
//       );
//     }

//     // Generate OTP + token
//     const otp      = String(Math.floor(100000 + Math.random() * 900000));
//     const rawToken = crypto.randomBytes(32).toString('hex');
//     const hashed   = await bcrypt.hash(otp, 10);
//     const expiry   = new Date(Date.now() + 15 * 60 * 1000); // 15 min

//     // Save directly to MongoDB — schema fields don't matter here
//     await collection.updateOne(
//       { _id: user._id },
//       {
//         $set: {
//           resetPasswordOTP:    hashed,
//           resetPasswordToken:  rawToken,
//           resetPasswordExpiry: expiry,
//         },
//       }
//     );

//     // Verify it saved
//     const saved = await collection.findOne(
//       { _id: user._id },
//       { projection: { resetPasswordToken: 1 } }
//     );

//     if (!saved?.resetPasswordToken) {
//       console.error('Failed to save resetPasswordToken to DB');
//       return errorResponse('Failed to generate reset token. Please try again.', 500);
//     }

//     console.log(`\n🔐 OTP for ${email}: ${otp}  (expires ${expiry.toISOString()})\n`);

//     // Production: replace with real email
//     // await sendEmail({ to: email, subject: 'Reset OTP', text: `OTP: ${otp}` });

//     return successResponse(
//       {
//         token: rawToken,
//         email: user.email,
//         ...(process.env.NODE_ENV !== 'production' ? { otp } : {}),
//       },
//       'OTP sent to your email address.'
//     );
//   } catch (error) {
//     console.error('Forgot password error:', error);
//     return errorResponse('An error occurred', 500);
//   }
// }

 // app/api/auth/forgot-password/route.ts

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const COLLECTIONS = [
  {
    role: 'customer',
    collection: 'users',
    emailField: 'email',
  },
  {
    role: 'serviceCenter',
    collection: 'servicecenters',
    emailField: 'contact.email',
  },
  {
    role: 'technician',
    collection: 'technicians',
    emailField: 'email',
  },
  {
    role: 'brand',
    collection: 'brands',
    emailField: 'email',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email } = body;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return errorResponse('Valid email is required', 400);
    }

    await connectDB();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection not established');
    }

    let foundUser: any = null;
    let foundCollection: any = null;

    // Search in all collections
    for (const item of COLLECTIONS) {
      const collection = db.collection(item.collection);

      const query: any = {
        isActive: true,
      };

      query[item.emailField] = email.toLowerCase().trim();

      const user = await collection.findOne(query);

      if (user) {
        foundUser = user;
        foundCollection = item;
        break;
      }
    }

    // Prevent email enumeration
    if (!foundUser || !foundCollection) {
      return successResponse(
        { token: null },
        'If an account exists with this email, a reset OTP has been sent.'
      );
    }

    const otp = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    const rawToken = crypto.randomBytes(32).toString('hex');

    const hashedOTP = await bcrypt.hash(otp, 10);

    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    const collection = db.collection(foundCollection.collection);

    // Save reset data
    await collection.updateOne(
      { _id: foundUser._id },
      {
        $set: {
          resetPasswordOTP: hashedOTP,
          resetPasswordToken: rawToken,
          resetPasswordExpiry: expiry,
          updatedAt: new Date(),
        },
      }
    );

    console.log(`
🔐 Forgot Password OTP
Role       : ${foundCollection.role}
Collection : ${foundCollection.collection}
Email      : ${email}
OTP        : ${otp}
`);

    return successResponse(
      {
        token: rawToken,
        role: foundCollection.role,

        ...(process.env.NODE_ENV !== 'production'
          ? { otp }
          : {}),
      },
      'OTP sent successfully.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);

    return errorResponse(
      'An error occurred',
      500
    );
  }
}