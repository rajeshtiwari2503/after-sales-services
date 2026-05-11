import type { Feedback } from '@/types/feedback'
import type { Notification, NotificationPriority } from '@/types/notification'

interface AlertRule {
  id:        string
  name:      string
  condition: (f: Feedback) => boolean
  priority:  NotificationPriority
  message:   (f: Feedback) => string
}

const ALERT_RULES: AlertRule[] = [
  {
    id:        'low_rating',
    name:      'Low Rating Alert',
    condition: f => f.rating <= 2,
    priority:  'high',
    message:   f => `Low rating (${f.rating}/5) received from ${f.clientName}. Immediate follow-up required.`,
  },
  {
    id:        'negative_nps',
    name:      'Detractor NPS Alert',
    condition: f => (f.npsScore ?? 10) <= 6,
    priority:  'high',
    message:   f => `NPS Detractor detected (score ${f.npsScore}). Client: ${f.clientName}. Action needed.`,
  },
  {
    id:        'negative_sentiment',
    name:      'Negative Sentiment Alert',
    condition: f => f.sentiment === 'negative' && f.rating <= 3,
    priority:  'critical',
    message:   f => `Critical: Negative sentiment feedback from ${f.clientName} with ${f.rating}/5 rating.`,
  },
  {
    id:        'escalation_needed',
    name:      'Escalation Alert',
    condition: f => f.status === 'escalated',
    priority:  'critical',
    message:   f => `Feedback escalated by ${f.clientName}. Immediate management review required.`,
  },
  {
    id:        'positive_highlight',
    name:      'Positive Review Alert',
    condition: f => f.rating === 5 && f.isPublic,
    priority:  'low',
    message:   f => `5-star public review from ${f.clientName}: "${f.comment.slice(0,80)}..."`,
  },
]

export interface SmartAlertResult {
  ruleId:       string
  ruleName:     string
  priority:     NotificationPriority
  message:      string
  feedbackId:   string
  shouldNotify: boolean
}

export function runSmartAlerts(feedback: Feedback): SmartAlertResult[] {
  return ALERT_RULES
    .filter(rule => rule.condition(feedback))
    .map(rule => ({
      ruleId:       rule.id,
      ruleName:     rule.name,
      priority:     rule.priority,
      message:      rule.message(feedback),
      feedbackId:   feedback._id,
      shouldNotify: true,
    }))
}

export function buildNotificationFromAlert(
  alert: SmartAlertResult,
  userId: string
): Omit<Notification, '_id' | 'createdAt'> {
  return {
    userId,
    title:         alert.ruleName,
    message:       alert.message,
    type:          alert.priority === 'critical' ? 'sla_breach' : 'low_rating_alert',
    priority:      alert.priority,
    status:        'unread',
    channels:      alert.priority === 'critical' ? ['in_app','email','whatsapp'] : ['in_app'],
    referenceId:   alert.feedbackId,
    referenceType: 'feedback',
    actionUrl:     `/dashboard/feedback?id=${alert.feedbackId}`,
  }
}