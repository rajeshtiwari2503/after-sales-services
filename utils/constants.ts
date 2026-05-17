export const SLA_DEFAULTS = {
  low:      { responseHours: 48, resolutionHours: 120 },
  medium:   { responseHours: 4,  resolutionHours: 24  },
  high:     { responseHours: 1,  resolutionHours: 8   },
  critical: { responseHours: 0.25, resolutionHours: 2 },
};

export const TICKET_STATUSES = [
  "open", "in_progress", "pending_parts",
  "pending_customer", "resolved", "closed", "cancelled",
] as const;

export const TICKET_PRIORITIES = ["low", "medium", "high", "critical"] as const;

export const TICKET_CATEGORIES = [
  "hardware", "software", "installation",
  "maintenance", "warranty", "consultation", "other",
] as const;

export const USER_ROLES = [
  "admin", "manager", "service_center", "technician", "customer", "support",
] as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Super Admin",
  manager: "Brand Manager",
  service_center: "Service Center",
  technician: "Technician",
  customer: "Customer",
  support: "Support Agent",
};

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  pending_parts: "Pending Parts",
  pending_customer: "Pending Customer",
  resolved: "Resolved",
  closed: "Closed",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low", medium: "Medium", high: "High", critical: "Critical",
};

export const PAGINATION_LIMIT = 10;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILES_PER_UPLOAD = 5;

export const ROLE_HOME_ROUTES: Record<string, string> = {
  admin: "/dashboard",
  manager: "/brand/dashboard",
  service_center: "/service-center/dashboard",
  technician: "/technician/dashboard",
  customer: "/customer/dashboard",
  support: "/dashboard",
};