export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING_PARTS: 'pending_parts',
  PENDING_CUSTOMER: 'pending_customer',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const TICKET_CATEGORY = {
  HARDWARE: 'hardware',
  SOFTWARE: 'software',
  INSTALLATION: 'installation',
  MAINTENANCE: 'maintenance',
  WARRANTY: 'warranty',
  CONSULTATION: 'consultation',
  OTHER: 'other',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer',
  SUPPORT: 'support',
} as const;

export const NOTIFICATION_TYPES = {
  TICKET_CREATED: 'ticket_created',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_UPDATED: 'ticket_updated',
  TICKET_RESOLVED: 'ticket_resolved',
  SLA_WARNING: 'sla_warning',
  SLA_BREACH: 'sla_breach',
  FEEDBACK_RECEIVED: 'feedback_received',
  LOW_STOCK: 'low_stock',
  WARRANTY_EXPIRY: 'warranty_expiry',
  SYSTEM: 'system',
} as const;

export const SLA_DEFAULTS = {
  critical: { response: 1, resolution: 4 },
  high: { response: 4, resolution: 24 },
  medium: { response: 8, resolution: 48 },
  low: { response: 24, resolution: 72 },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
