// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("token")?.value;

//   const isAuthPage =
//     request.nextUrl.pathname.startsWith("/login") ||
//     request.nextUrl.pathname.startsWith("/register");

//   if (!token && !isAuthPage) {
//     return NextResponse.redirect(
//       new URL("/login", request.url)
//     );
//   }

//   if (token && isAuthPage) {
//     return NextResponse.redirect(
//       new URL("/dashboard", request.url)
//     );
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/login",
//     "/register",
//   ],
// };

import { NextRequest, NextResponse } from "next/server";

import { getTenant } from "@/lib/tenant/getTenant";

export function middleware(
  req: NextRequest
) {
  const host =
    req.headers.get(
      "host"
    ) || "";

  const tenant =
    getTenant(host);

  const response =
    NextResponse.next();

  response.headers.set(
    "x-tenant",
    tenant
  );

  return response;
}

export const config = {
  matcher: "/dashboard/:path*",
};