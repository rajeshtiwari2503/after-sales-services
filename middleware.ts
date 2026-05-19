 

// import { NextRequest, NextResponse } from 'next/server';
// import { verifyToken } from '@/lib/jwt';

// const PUBLIC_ROUTES = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/'];

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
//     return NextResponse.next();
//   }

//   // ✅ Dono cookie names check karo (hook 'token' set karta hai)
//   const token =
//     request.cookies.get('auth_token')?.value ||
//     request.cookies.get('token')?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // ✅ verifyToken null return kar sakta hai — check karo pehle
//   const payload = verifyToken(token);

//   if (!payload) {
//     // Token invalid ya expired — delete karke redirect
//     const response = NextResponse.redirect(new URL('/login', request.url));
//     response.cookies.delete('auth_token');
//     response.cookies.delete('token');
//     return response;
//   }

//   // ✅ Ab safely payload use karo
//   const requestHeaders = new Headers(request.headers);
//   requestHeaders.set('x-user-id', payload.userId);
//   requestHeaders.set('x-user-role', payload.role);
//   requestHeaders.set('x-tenant-id', payload.tenantId);

//   return NextResponse.next({ request: { headers: requestHeaders } });
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|_next/data).*)'],
// };

 
// middleware.ts  — REPLACE your existing file
// Change: now reads serviceCenterId from JWT and injects x-service-center-id header

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without auth
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get('auth_token')?.value ||
    request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('token');
    return response;
  }

  // Inject user identity into request headers for all API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-tenant-id', payload.tenantId);

  // ← NEW: inject serviceCenterId for SC operators
  if (payload.serviceCenterId) {
    requestHeaders.set('x-service-center-id', payload.serviceCenterId);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|_next/data).*)'],
};