 import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-helper";
import { successResponse, errorResponse } from "@/utils/apiResponse";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse("Unauthorized", 401);
    // Mark notification as read (implement with real model)
    return successResponse({ id: params.id, isRead: true }, "Notification marked as read");
  } catch {
    return errorResponse("An error occurred", 500);
  }
}