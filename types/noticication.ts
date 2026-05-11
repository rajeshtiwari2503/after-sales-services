export type NotificationType = 
  | 'ticket_created'
  | 'ticket_assigned'
  | 'ticket_updated'
  | 'ticket_resolved'
  | 'sla_warning'
  | 'sla_breach'
  | 'feedback_received'
  | 'low_stock'
  | 'warranty_expiry'
  | 'system';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'whatsapp' | 'sms';

export interface Notification {
  _id: string;
  userId: string;
  tenantId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface NotificationPreference {
  _id: string;
  userId: string;
  tenantId: string;
  email: boolean;
  push: boolean;
  whatsapp: boolean;
  sms: boolean;
  inApp: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  preferences: {
    [key in NotificationType]?: {
      enabled: boolean;
      channels: NotificationChannel[];
    };
  };
}
