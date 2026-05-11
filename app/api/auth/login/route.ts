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

import { NextRequest } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { loginSchema } from '@/schemas/auth.schema';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    // Get tenant from header or subdomain
    const tenantId = request.headers.get('x-tenant-id') || 'default';

    const result = await AuthService.login(validation.data, tenantId);

    if (!result.success) {
      return errorResponse(result.message, 401);
    }

    return successResponse(
      { token: result.token, user: result.user },
      result.message
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('An error occurred during login', 500);
  }
}
