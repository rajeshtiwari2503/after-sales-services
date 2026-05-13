 
import { NextRequest } from 'next/server';
 
import { verifyToken } from '@/lib/jwt';

export function getAuthUser(request: NextRequest) {
  // ✅ 1. Middleware ke headers se (sabse fast)
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const tenantId = request.headers.get('x-tenant-id');

  if (userId && role && tenantId) {
    return { userId, role, tenantId };
  }

  // ✅ 2. Cookie se token verify karo
  const token =
    request.cookies.get('auth_token')?.value ||
    request.cookies.get('token')?.value;

  if (token) {
    const payload = verifyToken(token);
    if (payload) return payload;
  }

  // ✅ 3. Fallback — Bearer header (optional, purana code support ke liye)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    return verifyToken(bearerToken);
  }

  return null;
}

 