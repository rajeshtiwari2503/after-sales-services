import { NextRequest } from 'next/server';
import { writeAuditLog, getClientIP, type AuditParams } from '@/lib/audit';

type AuthUser = { userId: string; role: string; tenantId: string; name?: string; email?: string };

export function auditBase(request: NextRequest, user: AuthUser) {
  return {
    userId:    user.userId,
    userRole:  user.role,
    tenantId:  user.tenantId,
    userName:  user.name,
    userEmail: user.email,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') ?? undefined,
  };
}

/** Fire-and-forget audit from an API route */
export function audit(
  request: NextRequest,
  user: AuthUser,
  partial: Omit<AuditParams, 'userId' | 'userRole' | 'tenantId' | 'ipAddress' | 'userAgent'>
) {
  writeAuditLog({ ...auditBase(request, user), ...partial }).catch(() => {});
}
