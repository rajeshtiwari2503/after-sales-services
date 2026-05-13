// import { successResponse } from "@/utils/apiResponse";

// export async function POST() {
//   const response = successResponse(
//     {},
//     "Logout successful"
//   );

//   response.cookies.set("token", "", {
//     httpOnly: true,
//     expires: new Date(0),
//     path: "/",
//   });

//   return response;
// }

// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  
  response.cookies.delete('auth_token');
  response.cookies.delete('token');
  
  return response;
}