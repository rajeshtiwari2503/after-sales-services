 

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const PUBLIC_ROUTES = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ✅ Dono cookie names check karo (hook 'token' set karta hai)
  const token =
    request.cookies.get('auth_token')?.value ||
    request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ verifyToken null return kar sakta hai — check karo pehle
  const payload = verifyToken(token);

  if (!payload) {
    // Token invalid ya expired — delete karke redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('token');
    return response;
  }

  // ✅ Ab safely payload use karo
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-tenant-id', payload.tenantId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|_next/data).*)'],
};


// // middleware.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { verifyToken } from '@/lib/jwt';

// const PUBLIC_ROUTES = [
//   '/login', '/register', '/forgot-password', '/reset-password',
//   '/api/auth/login', '/api/auth/register',
//   '/api/auth/forgot-password', '/api/auth/reset-password',
//   '/',
// ];

// // Role → allowed path prefixes
// const ROLE_ALLOWED: Record<string, string[]> = {
//   admin:           ['/dashboard', '/super-admin'],
//   manager:         ['/dashboard', '/brand'],
//   service_center:  ['/service-center'],
//   technician:      ['/technician'],
//   customer:        ['/customer'],
//   support:         ['/dashboard'],
// };

// // After login, where to redirect each role
// const ROLE_HOME: Record<string, string> = {
//   admin:           '/dashboard',
//   manager:         '/brand/dashboard',
//   service_center:  '/service-center/dashboard',
//   technician:      '/technician/dashboard',
//   customer:        '/customer/dashboard',
//   support:         '/dashboard',
// };

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Static / public
//   if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
//     return NextResponse.next();
//   }
//   if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
//     return NextResponse.next();
//   }

//   const token =
//     request.cookies.get('auth_token')?.value ||
//     request.cookies.get('token')?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   const payload = verifyToken(token);

//   if (!payload) {
//     const res = NextResponse.redirect(new URL('/login', request.url));
//     res.cookies.delete('auth_token');
//     res.cookies.delete('token');
//     return res;
//   }

//   const role = payload.role;
//   const allowed = ROLE_ALLOWED[role] ?? [];
//   const isAllowed = allowed.some(prefix => pathname.startsWith(prefix));

//   // API routes — inject headers, no redirect
//   if (pathname.startsWith('/api/')) {
//     const headers = new Headers(request.headers);
//     headers.set('x-user-id', payload.userId);
//     headers.set('x-user-role', role);
//     headers.set('x-tenant-id', payload.tenantId);
//     return NextResponse.next({ request: { headers } });
//   }

//   // Wrong role trying to access a protected route → redirect to their home
//   if (!isAllowed) {
//     return NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/login', request.url));
//   }

//   // Inject headers
//   const headers = new Headers(request.headers);
//   headers.set('x-user-id', payload.userId);
//   headers.set('x-user-role', role);
//   headers.set('x-tenant-id', payload.tenantId);

//   return NextResponse.next({ request: { headers } });
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
// };