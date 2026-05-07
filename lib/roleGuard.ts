export const roleGuard = (
  allowedRoles: string[],
  userRole: string
) => {
  return allowedRoles.includes(userRole);
};