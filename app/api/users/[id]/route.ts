import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  successResponse,
  errorResponse,
} from "@/utils/apiResponse";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id);

    return successResponse(user);
  } catch (error) {
    return errorResponse("User not found");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      body,
      {
        new: true,
      }
    );

    return successResponse(
      updatedUser,
      "User updated successfully"
    );
  } catch (error) {
    return errorResponse("Update failed");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    await User.findByIdAndDelete(params.id);

    return successResponse(
      {},
      "User deleted successfully"
    );
  } catch (error) {
    return errorResponse("Delete failed");
  }
}