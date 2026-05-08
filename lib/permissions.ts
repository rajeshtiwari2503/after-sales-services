export const permissions = {
  ADMIN: [
    "ALL",
  ],

  MANAGER: [
    "VIEW_TICKETS",
    "ASSIGN_TICKETS",
  ],

  TECHNICIAN: [
    "UPDATE_STATUS",
  ],

  CUSTOMER: [
    "CREATE_TICKET",
  ],
};

export function hasPermission(
  role: string,
  permission: string
) {
  return (
    permissions[
      role as keyof typeof permissions
    ]?.includes(
      "ALL"
    ) ||
    permissions[
      role as keyof typeof permissions
    ]?.includes(
      permission
    )
  );
}