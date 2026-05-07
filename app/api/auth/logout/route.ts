import { successResponse } from "@/utils/apiResponse";

export async function POST() {
  const response = successResponse(
    {},
    "Logout successful"
  );

  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}