/** Maps UI role keys (dashboard) ↔ DB Role.name and UI permission keys ↔ Role.permissions */

export const UI_ROLE_TO_DB: Record<string, string> = {
  admin: 'super_admin',
  manager: 'brand_manager',
  service_center: 'service_center',
  technician: 'technician',
  customer: 'customer',
};

export const DB_ROLE_TO_UI: Record<string, string> = Object.fromEntries(
  Object.entries(UI_ROLE_TO_DB).map(([ui, db]) => [db, ui])
);

export const UI_PERM_TO_DB: Record<string, string> = {
  CREATE_TICKET: 'tickets:create',
  VIEW_TICKETS: 'tickets:read',
  EDIT_TICKET: 'tickets:update',
  DELETE_TICKET: 'tickets:delete',
  ASSIGN_TICKETS: 'tickets:assign',
  UPDATE_STATUS: 'tickets:update',
  VIEW_USERS: 'users:read',
  CREATE_USER: 'users:create',
  EDIT_USER: 'users:update',
  DELETE_USER: 'users:delete',
  MANAGE_ROLES: 'users:manage_roles',
  VIEW_SC: 'sc:read',
  MANAGE_SC: 'sc:update',
  VIEW_INVENTORY: 'inventory:read',
  MANAGE_INVENTORY: 'inventory:update',
  VIEW_WALLET: 'wallet:read',
  VIEW_ANALYTICS: 'analytics:read',
  EXPORT_REPORTS: 'analytics:export',
  VIEW_AUDIT_LOGS: 'audit:read',
  MANAGE_BRANDS: 'brands:update',
  SYSTEM_CONFIG: 'settings:update',
  MANAGE_WARRANTY: 'sla:update',
  MANAGE_SLA: 'sla:update',
};

export const DB_PERM_TO_UI: Record<string, string> = {};
for (const [ui, db] of Object.entries(UI_PERM_TO_DB)) {
  if (!DB_PERM_TO_UI[db]) DB_PERM_TO_UI[db] = ui;
}

export function uiPermsToDb(perms: string[]): string[] {
  if (perms.includes('ALL')) return ['ALL'];
  return [...new Set(perms.map(p => UI_PERM_TO_DB[p] ?? p).filter(Boolean))];
}

export function dbPermsToUi(perms: string[]): string[] {
  if (perms.length >= 20) return ['ALL'];
  return [...new Set(perms.map(p => DB_PERM_TO_UI[p] ?? p).filter(Boolean))];
}
