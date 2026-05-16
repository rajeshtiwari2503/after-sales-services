// export const permissions = {
//   ADMIN: [
//     "ALL",
//   ],

//   MANAGER: [
//     "VIEW_TICKETS",
//     "ASSIGN_TICKETS",
//   ],

//   TECHNICIAN: [
//     "UPDATE_STATUS",
//   ],

//   CUSTOMER: [
//     "CREATE_TICKET",
//   ],
// };

// export function hasPermission(
//   role: string,
//   permission: string
// ) {
//   return (
//     permissions[
//       role as keyof typeof permissions
//     ]?.includes(
//       "ALL"
//     ) ||
//     permissions[
//       role as keyof typeof permissions
//     ]?.includes(
//       permission
//     )
//   );
// }

// lib/permissions.ts — expanded
export const permissions = {
  admin: ["ALL"],
  manager: [
    "VIEW_TICKETS", "EDIT_TICKET", "ASSIGN_TICKETS",
    "VIEW_ANALYTICS", "EXPORT_REPORTS",
    "VIEW_SC", "MANAGE_WARRANTY", "MANAGE_BRANDS", "VIEW_USERS",
  ],
  service_center: [
    "VIEW_TICKETS", "ASSIGN_TICKETS", "UPDATE_STATUS",
    "VIEW_SC", "VIEW_INVENTORY", "MANAGE_INVENTORY",
    "VIEW_WALLET", "VIEW_USERS",
  ],
  technician: ["VIEW_TICKETS", "UPDATE_STATUS"],
  customer: ["CREATE_TICKET", "VIEW_TICKETS"],
  support: ["VIEW_TICKETS", "ASSIGN_TICKETS", "UPDATE_STATUS"],
};

export function hasPermission(role: string, permission: string): boolean {
  const rolePerms = permissions[role as keyof typeof permissions] ?? [];
  return rolePerms.includes("ALL") || rolePerms.includes(permission);
}

export function hasAnyPermission(role: string, perms: string[]): boolean {
  return perms.some(p => hasPermission(role, p));
}