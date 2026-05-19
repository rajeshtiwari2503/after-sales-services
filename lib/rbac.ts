// lib/rbac.ts  — NEW FILE  (add to your project)
// Core RBAC helpers. Import these in any API route instead of writing manual role checks.

import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';

export type AuthUser = {
  userId: string;
  role: string;
  tenantId: string;
  serviceCenterId?: string;
};

/**
 * getAuthUserFull — same as getAuthUser but also pulls x-service-center-id
 * Use this instead of getAuthUser in routes that need SC-level isolation.
 */
export function getAuthUserFull(request: NextRequest): AuthUser | null {
  const base = getAuthUser(request);
  if (!base) return null;

  return {
    ...base,
    serviceCenterId: request.headers.get('x-service-center-id') ?? undefined,
  };
}

/**
 * Ticket assignment rules (from diagram):
 *   admin         → any ticket, any SC/tech across ALL tenants
 *   manager       → tickets in own brand → own brand's SCs or technicians
 *   service_center → tickets assigned to their SC → only their SC's technicians
 *   technician    → self-assign only
 */
export function canAssignTicket(
  assignerRole: string,
  assignerTenantId: string,
  ticketTenantId: string
): boolean {
  if (assignerRole === 'admin') return true;
  return assignerTenantId === ticketTenantId; // manager / SC / tech: same brand only
}

/**
 * Build a Mongoose query filter scoped by role:
 *   admin         → {}                   (all tenants)
 *   manager       → { tenantId }         (own brand)
 *   service_center → { tenantId, serviceCenterId } (own SC's data)
 *   technician    → { tenantId, technicianId: userId }
 *   customer      → { tenantId, customerId: userId }
 */
export function buildTenantFilter(user: AuthUser): Record<string, any> {
  if (user.role === 'admin') return {};

  if (user.role === 'manager') return { tenantId: user.tenantId };

  if (user.role === 'service_center') {
    const f: Record<string, any> = { tenantId: user.tenantId };
    if (user.serviceCenterId) f.serviceCenterId = user.serviceCenterId;
    return f;
  }

  if (user.role === 'technician') {
    return { tenantId: user.tenantId, technicianId: user.userId };
  }

  if (user.role === 'customer') {
    return { tenantId: user.tenantId, customerId: user.userId };
  }

  return { tenantId: user.tenantId };
}