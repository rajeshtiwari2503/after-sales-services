import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Role, { DEFAULT_ROLES } from '@/models/Role';
import { getAuthUser } from '@/lib/auth-helper';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import {
  UI_ROLE_TO_DB,
  DB_ROLE_TO_UI,
  uiPermsToDb,
  dbPermsToUi,
} from '@/lib/role-permission-map';
import { audit } from '@/lib/audit-request';
import { AUDIT_ACTIONS, AUDIT_MODULES } from '@/lib/audit';

const UI_ROLES = ['admin', 'manager', 'service_center', 'technician', 'customer'] as const;

async function ensureRolesSeeded() {
  const count = await Role.countDocuments();
  if (count === 0) {
    await Promise.all(
      DEFAULT_ROLES.map(role =>
        Role.findOneAndUpdate({ name: role.name }, { $setOnInsert: role }, { upsert: true, new: true })
      )
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);
    if (!['admin', 'manager'].includes(user.role)) return errorResponse('Forbidden', 403);

    await connectDB();
    await ensureRolesSeeded();

    const roles = await Role.find().lean();
    const permissions: Record<string, string[]> = {};

    for (const uiRole of UI_ROLES) {
      const dbName = UI_ROLE_TO_DB[uiRole];
      const role = roles.find(r => r.name === dbName);
      if (uiRole === 'admin') {
        permissions[uiRole] = ['ALL'];
      } else if (role) {
        permissions[uiRole] = dbPermsToUi(role.permissions as string[]);
      } else {
        permissions[uiRole] = [];
      }
    }

    return successResponse({ permissions, roles: roles.map(r => ({
      name: r.name,
      displayName: r.displayName,
      uiKey: DB_ROLE_TO_UI[r.name] ?? r.name,
      isSystem: r.isSystem,
    })) }, 'Permissions fetched');
  } catch (err) {
    console.error('[ROLES PERMISSIONS GET]', err);
    return errorResponse('Server error', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) return errorResponse('Unauthorized', 401);
    if (user.role !== 'admin') return errorResponse('Forbidden', 403);

    const body = await req.json();
    const { role: uiRole, permissions: uiPerms } = body as { role: string; permissions: string[] };

    if (!uiRole || !Array.isArray(uiPerms)) {
      return errorResponse('role and permissions array required', 400);
    }
    if (uiRole === 'admin') {
      return errorResponse('Admin role permissions cannot be modified', 400);
    }

    const dbName = UI_ROLE_TO_DB[uiRole];
    if (!dbName) return errorResponse('Invalid role', 400);

    await connectDB();
    await ensureRolesSeeded();

    const dbPerms = uiPermsToDb(uiPerms);
    const updated = await Role.findOneAndUpdate(
      { name: dbName },
      { $set: { permissions: dbPerms } },
      { new: true }
    );
    if (!updated) return errorResponse('Role not found', 404);

    audit(req, user, {
      action: AUDIT_ACTIONS.UPDATE,
      module: AUDIT_MODULES.ROLE,
      entityId: updated._id.toString(),
      entityName: updated.displayName,
      message: `Updated permissions for ${updated.displayName}`,
      metadata: { permissionCount: dbPerms.length },
    });

    return successResponse({
      role: uiRole,
      permissions: dbPermsToUi(updated.permissions as string[]),
    }, 'Permissions saved');
  } catch (err) {
    console.error('[ROLES PERMISSIONS PATCH]', err);
    return errorResponse('Server error', 500);
  }
}
