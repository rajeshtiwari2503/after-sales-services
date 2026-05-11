// import type { Feedback } from '@/types/feedback'
// import type { Notification, NotificationPriority } from '@/types/notification'

// interface AlertRule {
//   id:        string
//   name:      string
//   condition: (f: Feedback) => boolean
//   priority:  NotificationPriority
//   message:   (f: Feedback) => string
// }

// const ALERT_RULES: AlertRule[] = [
//   {
//     id:        'low_rating',
//     name:      'Low Rating Alert',
//     condition: f => f.rating <= 2,
//     priority:  'high',
//     message:   f => `Low rating (${f.rating}/5) received from ${f.clientName}. Immediate follow-up required.`,
//   },
//   {
//     id:        'negative_nps',
//     name:      'Detractor NPS Alert',
//     condition: f => (f.npsScore ?? 10) <= 6,
//     priority:  'high',
//     message:   f => `NPS Detractor detected (score ${f.npsScore}). Client: ${f.clientName}. Action needed.`,
//   },
//   {
//     id:        'negative_sentiment',
//     name:      'Negative Sentiment Alert',
//     condition: f => f.sentiment === 'negative' && f.rating <= 3,
//     priority:  'critical',
//     message:   f => `Critical: Negative sentiment feedback from ${f.clientName} with ${f.rating}/5 rating.`,
//   },
//   {
//     id:        'escalation_needed',
//     name:      'Escalation Alert',
//     condition: f => f.status === 'escalated',
//     priority:  'critical',
//     message:   f => `Feedback escalated by ${f.clientName}. Immediate management review required.`,
//   },
//   {
//     id:        'positive_highlight',
//     name:      'Positive Review Alert',
//     condition: f => f.rating === 5 && f.isPublic,
//     priority:  'low',
//     message:   f => `5-star public review from ${f.clientName}: "${f.comment.slice(0,80)}..."`,
//   },
// ]

// export interface SmartAlertResult {
//   ruleId:       string
//   ruleName:     string
//   priority:     NotificationPriority
//   message:      string
//   feedbackId:   string
//   shouldNotify: boolean
// }

// export function runSmartAlerts(feedback: Feedback): SmartAlertResult[] {
//   return ALERT_RULES
//     .filter(rule => rule.condition(feedback))
//     .map(rule => ({
//       ruleId:       rule.id,
//       ruleName:     rule.name,
//       priority:     rule.priority,
//       message:      rule.message(feedback),
//       feedbackId:   feedback._id,
//       shouldNotify: true,
//     }))
// }

// export function buildNotificationFromAlert(
//   alert: SmartAlertResult,
//   userId: string
// ): Omit<Notification, '_id' | 'createdAt'> {
//   return {
//     userId,
//     title:         alert.ruleName,
//     message:       alert.message,
//     type:          alert.priority === 'critical' ? 'sla_breach' : 'low_rating_alert',
//     priority:      alert.priority,
//     status:        'unread',
//     channels:      alert.priority === 'critical' ? ['in_app','email','whatsapp'] : ['in_app'],
//     referenceId:   alert.feedbackId,
//     referenceType: 'feedback',
//     actionUrl:     `/dashboard/feedback?id=${alert.feedbackId}`,
//   }
// }

import Ticket from '@/models/Ticket';
import Feedback from '@/models/Feedback';
import Inventory from '@/models/Inventory';
import connectDB from '@/lib/db';

export interface SmartAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionRequired: boolean;
  suggestedAction?: string;
  data: Record<string, any>;
  createdAt: Date;
}

export class SmartAlertEngine {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async generateAlerts(): Promise<SmartAlert[]> {
    await connectDB();
    const alerts: SmartAlert[] = [];

    await Promise.all([
      this.checkSLABreaches(alerts),
      this.checkNegativeFeedbackSpike(alerts),
      this.checkLowInventory(alerts),
      this.checkUnassignedTickets(alerts),
      this.checkTechnicianOverload(alerts),
    ]);

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private async checkSLABreaches(alerts: SmartAlert[]): Promise<void> {
    const now = new Date();

    // Already breached
    const breached = await Ticket.find({
      tenantId: this.tenantId,
      status: { $nin: ['resolved', 'closed', 'cancelled'] },
      $or: [
        { 'sla.isResponseBreached': true },
        { 'sla.isResolutionBreached': true },
      ],
    }).limit(10);

    breached.forEach((ticket) => {
      alerts.push({
        id: `sla-breach-${ticket._id}`,
        type: 'sla_breach',
        severity: 'critical',
        title: 'SLA Breach',
        message: `Ticket ${ticket.ticketNumber} has breached SLA`,
        actionRequired: true,
        suggestedAction: 'Escalate to supervisor immediately',
        data: {
          ticketId: ticket._id,
          ticketNumber: ticket.ticketNumber,
        },
        createdAt: new Date(),
      });
    });

    // About to breach (within 2 hours)
    const aboutToBreach = await Ticket.find({
      tenantId: this.tenantId,
      status: { $nin: ['resolved', 'closed', 'cancelled'] },
      'sla.isResponseBreached': false,
      'sla.isResolutionBreached': false,
      $or: [
        { 'sla.responseDeadline': { $lte: new Date(now.getTime() + 2 * 60 * 60 * 1000), $gt: now } },
        { 'sla.resolutionDeadline': { $lte: new Date(now.getTime() + 4 * 60 * 60 * 1000), $gt: now } },
      ],
    }).limit(10);

    aboutToBreach.forEach((ticket) => {
      alerts.push({
        id: `sla-warning-${ticket._id}`,
        type: 'sla_warning',
        severity: 'high',
        title: 'SLA Warning',
        message: `Ticket ${ticket.ticketNumber} is approaching SLA deadline`,
        actionRequired: true,
        suggestedAction: 'Prioritize this ticket to avoid SLA breach',
        data: {
          ticketId: ticket._id,
          ticketNumber: ticket.ticketNumber,
          deadline: ticket.sla.resolutionDeadline,
        },
        createdAt: new Date(),
      });
    });
  }

  private async checkNegativeFeedbackSpike(alerts: SmartAlert[]): Promise<void> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const previous24Hours = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const [recentNegative, previousNegative] = await Promise.all([
      Feedback.countDocuments({
        tenantId: this.tenantId,
        createdAt: { $gte: last24Hours },
        $or: [{ rating: { $lte: 2 } }, { 'sentiment.label': 'negative' }],
      }),
      Feedback.countDocuments({
        tenantId: this.tenantId,
        createdAt: { $gte: previous24Hours, $lt: last24Hours },
        $or: [{ rating: { $lte: 2 } }, { 'sentiment.label': 'negative' }],
      }),
    ]);

    if (recentNegative > previousNegative * 1.5 && recentNegative >= 3) {
      alerts.push({
        id: `feedback-spike-${Date.now()}`,
        type: 'feedback_spike',
        severity: 'high',
        title: 'Negative Feedback Spike',
        message: `${recentNegative} negative feedback received in last 24 hours (${Math.round(((recentNegative - previousNegative) / Math.max(previousNegative, 1)) * 100)}% increase)`,
        actionRequired: true,
        suggestedAction: 'Review recent
