import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/hash";
import { registerSchema } from "@/schemas/auth.schema";
import { errorResponse, successResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 400);
    }

    const { name, email, password } = body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return errorResponse("User already exists", 400);
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return successResponse(user, "User registered successfully");
  } catch (error) {
    return errorResponse("Registration failed");
  }
}