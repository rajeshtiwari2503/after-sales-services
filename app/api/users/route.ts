import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find().sort({
      createdAt: -1,
    });

    return successResponse(users);
  } catch (error) {
    return errorResponse("Failed to fetch users");
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const user = await User.create(body);

    return successResponse(
      user,
      "User created successfully"
    );
  } catch (error) {
    return errorResponse("Failed to create user");
  }
}