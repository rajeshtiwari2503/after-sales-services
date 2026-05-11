export type NotificationType =
  | 'feedback_received'
  | 'feedback_response'
  | 'sla_warning'
  | 'sla_breach'
  | 'certification_update'
  | 'payment_due'
  | 'payment_received'
  | 'document_uploaded'
  | 'task_assigned'
  | 'task_completed'
  | 'lead_created'
  | 'client_message'
  | 'system_alert'
  | 'low_rating_alert'
  | 'nps_alert'

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'whatsapp' | 'sms'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'
export type NotificationStatus = 'unread' | 'read' | 'archived'

export interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  channels: NotificationChannel[]
  referenceId?: string
  referenceType?: string
  actionUrl?: string
  metadata?: Record<string, unknown>
  readAt?: string
  createdAt: string
  expiresAt?: string
}

export interface NotificationPreference {
  _id: string
  userId: string
  channels: {
    in_app: boolean
    email: boolean
    push: boolean
    whatsapp: boolean
    sms: boolean
  }
  types: Record<NotificationType, {
    enabled: boolean
    channels: NotificationChannel[]
  }>
  quietHours?: {
    enabled: boolean
    start: string  // "22:00"
    end: string    // "08:00"
  }
  frequency: 'realtime' | 'digest_hourly' | 'digest_daily'
  updatedAt: string
}

export interface PushSubscription {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export interface EmailNotificationPayload {
  to: string
  subject: string
  templateId?: string
  variables?: Record<string, string>
  html?: string
}

export interface WhatsAppPayload {
  phone: string
  message: string
  templateName?: string
  variables?: string[]
}

export interface SmartAlert {
  _id: string
  userId: string
  rule: string
  condition: string
  threshold: number
  triggered: boolean
  triggeredAt?: string
  notification?: Notification
  createdAt: string
}

export interface RealtimeEvent {
  type: NotificationType
  payload: Notification
  timestamp: string
}