// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import { comparePassword } from "@/lib/hash";
// import { loginSchema } from "@/schemas/auth.schema";
// import { generateToken } from "@/lib/jwt";
// import { errorResponse, successResponse } from "@/utils/apiResponse";

// export async function POST(req: Request) {
//     try {
//         await connectDB();

//         const body = await req.json();

//         const validation = loginSchema.safeParse(body);

//         if (!validation.success) {
//             return errorResponse(validation.error.errors[0].message, 400);
//         }

//         const { email, password } = body;

//         const user = await User.findOne({ email });

//         if (!user) {
//             return errorResponse("Invalid credentials", 400);
//         }

//         const isPasswordValid = await comparePassword(
//             password,
//             user.password
//         );

//         if (!isPasswordValid) {
//             return errorResponse("Invalid credentials", 400);
//         }

//         const token = generateToken({
//             id: user._id,
//             role: user.role,
//         });

//         const response = successResponse(
//             {
//                 token,
//                 user,
//             },
//             "Login successful"
//         );
//         // response.cookies.set("token", token, {
//         //     httpOnly: true,
//         //     secure: process.env.NODE_ENV === "production",
//         //     sameSite: "strict",
//         //     maxAge: 60 * 60 * 24 * 7,
//         //     path: "/",
//         // });
//         return response;
//     } catch (error) {
//         return errorResponse("Login failed");
//     }
// }

// // import { connectDB } from "@/lib/db";

// // import User from "@/models/User";

// // import { comparePassword } from "@/lib/hash";

// // import { loginSchema } from "@/schemas/auth.schema";

// // import { generateToken } from "@/lib/jwt";

// // import {
// //     errorResponse,
// //     successResponse,
// // } from "@/utils/apiResponse";

// // export async function POST(
// //     req: Request
// // ) {
// //     try {
// //         await connectDB();

// //         const body =
// //             await req.json();

// //         const validation =
// //             loginSchema.safeParse(
// //                 body
// //             );

// //         if (
// //             !validation.success
// //         ) {
// //             return errorResponse(
// //                 validation.error
// //                     .errors[0]
// //                     .message,
// //                 400
// //             );
// //         }

// //         const {
// //             email,
// //             password,
// //         } = validation.data;

// //         const user =
// //             await User.findOne({
// //                 email,
// //             });

// //         if (!user) {
// //             return errorResponse(
// //                 "Invalid credentials",
// //                 400
// //             );
// //         }

// //         if (!user.password) {
// //             return errorResponse(
// //                 "Password missing in database",
// //                 500
// //             );
// //         }

// //         const isPasswordValid =
// //             await comparePassword(
// //                 password,
// //                 user.password
// //             );

// //         if (
// //             !isPasswordValid
// //         ) {
// //             return errorResponse(
// //                 "Invalid credentials",
// //                 400
// //             );
// //         }

// //         const token =
// //             generateToken({
// //                 id: user._id,

// //                 role:
// //                     user.role,
// //             });

// //         const response =
// //             successResponse(
// //                 {
// //                     token,
// //                     user,
// //                 },
// //                 "Login successful"
// //             );

// //         response.cookies.set(
// //             "token",
// //             token,
// //             {
// //                 httpOnly: true,

// //                 secure:
// //                     process.env
// //                         .NODE_ENV ===
// //                     "production",

// //                 sameSite:
// //                     "strict",

// //                 path: "/",

// //                 maxAge:
// //                     60 *
// //                     60 *
// //                     24 *
// //                     7,
// //             }
// //         );

// //         return response;
// //     } catch (error: any) {
// //         console.log(
// //             "LOGIN ERROR:",
// //             error
// //         );

// //         return errorResponse(
// //             error.message ||
// //                 "Login failed",
// //             500
// //         );
// //     }
// // }
 
 // app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { loginSchema } from '@/schemas/auth.schema';
import { errorResponse } from '@/utils/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('\n========== LOGIN DEBUG START ==========');
    console.log('📨 Request body:', JSON.stringify(body));

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.error.flatten().fieldErrors);
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    console.log('✅ Validation passed');
    console.log('📧 Email:', validation.data.email);
    console.log('🔑 Password length:', validation.data.password?.length);

    const tenantId = request.headers.get('x-tenant-id') || 'default';
    console.log('🏢 TenantId:', tenantId);

    let result;
    try {
      result = await AuthService.login(validation.data, tenantId);
      console.log('🔐 AuthService result:', JSON.stringify({
        success: result.success,
        message: result.message,
        hasToken: !!result.token,
        user: result.user,
      }));
    } catch (serviceError) {
      console.error('💥 AuthService threw error:', serviceError);
      return errorResponse('Auth service error', 500);
    }

    if (!result.success) {
      console.log('❌ Login failed — reason:', result.message);
      console.log('========== LOGIN DEBUG END ==========\n');
      return errorResponse(result.message || 'Invalid credentials', 401);
    }

    console.log('✅ Login successful for:', result.user?.email);
    console.log('========== LOGIN DEBUG END ==========\n');

    const response = NextResponse.json(
      { success: true, message: result.message, data: { user: result.user } },
      { status: 200 }
    );

    response.cookies.set('auth_token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('tenant_id', tenantId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return errorResponse('An error occurred during login', 500);
  }
}