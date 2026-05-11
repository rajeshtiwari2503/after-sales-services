// import { connectDB } from "@/lib/db";
// import User from "@/models/User";
// import { hashPassword } from "@/lib/hash";
// import { registerSchema } from "@/schemas/auth.schema";
// import { errorResponse, successResponse } from "@/utils/apiResponse";

// export async function POST(req: Request) {
//   try {
//     await connectDB();

//     const body = await req.json();

//     const validation = registerSchema.safeParse(body);

//     if (!validation.success) {
//       return errorResponse(validation.error.errors[0].message, 400);
//     }

//     const { name, email, password } = body;

//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return errorResponse("User already exists", 400);
//     }

//     const hashedPassword = await hashPassword(password);

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     return successResponse(user, "User registered successfully");
//   } catch (error) {
//     return errorResponse("Registration failed");
//   }
// }

import { NextRequest } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { registerSchema } from '@/schemas/auth.schema';
import { successResponse, errorResponse } from '@/utils/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse('Validation failed', 400, validation.error.flatten().fieldErrors);
    }

    const tenantId = request.headers.get('x-tenant-id') || 'default';

    const result = await AuthService.register(
      {
        name: validation.data.name,
        email: validation.data.email,
        password: validation.data.password,
        role: validation.data.role,
      },
      tenantId
    );

    if (!result.success) {
      return errorResponse(result.message, 400);
    }

    return successResponse(
      { token: result.token, user: result.user },
      result.message,
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('An error occurred during registration', 500);
  }
}
