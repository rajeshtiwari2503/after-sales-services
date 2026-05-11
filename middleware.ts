 
// import { NextRequest, NextResponse } from "next/server";

// import { getTenant } from "@/lib/tenant/getTenant";

// export function middleware(
//   req: NextRequest
// ) {
//   const host =
//     req.headers.get(
//       "host"
//     ) || "";

//   const tenant =
//     getTenant(host);

//   const response =
//     NextResponse.next();

//   response.headers.set(
//     "x-tenant",
//     tenant
//   );

//   return response;
// }

// export const config = {
//   matcher: "/dashboard/:path*",
// };

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

const publicPathPrefixes = [
  '/_next',
  '/favicon',
  '/images',
  '/fonts',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public prefixes
  if (publicPathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Check for API routes
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-tenant-id', payload.tenantId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For dashboard pages, check for auth cookie/token
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
