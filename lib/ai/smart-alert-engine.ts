 



import Ticket from '@/models/Ticket'
import Feedback from '@/models/Feedback'
import Inventory from '@/models/Inventory'
import { connectDB } from '@/lib/db'
import type { Feedback as FeedbackType } from '@/types/feedback'
import type { Notification, NotificationPriority } from '@/types/notification'

/* ─── Types ──────────────────────────────────────────────────────── */

export interface SmartAlert {
  id:              string
  type:            string
  severity:        'critical' | 'high' | 'medium' | 'low'
  title:           string
  message:         string
  actionRequired:  boolean
  suggestedAction?: string
  data:            Record<string, any>
  createdAt:       Date
}

export interface AlertRuleResult {
  ruleId:       string
  ruleName:     string
  priority:     NotificationPriority
  message:      string
  feedbackId:   string
  shouldNotify: boolean
}

/* ─── Severity order helper ──────────────────────────────────────── */
const SEVERITY_ORDER: Record<SmartAlert['severity'], number> = {
  critical: 0, high: 1, medium: 2, low: 3,
}

/* ─── Simple feedback-based alert rules (stateless) ─────────────── */
interface FeedbackAlertRule {
  id:        string
  name:      string
  condition: (f: FeedbackType) => boolean
  priority:  NotificationPriority
  message:   (f: FeedbackType) => string
}

const FEEDBACK_ALERT_RULES: FeedbackAlertRule[] = [
  {
    id:        'low_rating',
    name:      'Low Rating Alert',
    condition: f => f.rating <= 2,
    priority:  'high',
    message:   f => `Low rating (${f.rating}/5) received from ${f.clientName}. Immediate follow-up required.`,
  },
  {
    id:        'negative_nps',
    name:      'NPS Detractor Alert',
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
    message:   f => `5-star public review from ${f.clientName}: "${(f.comment ?? '').slice(0, 80)}..."`,
  },
]

/* Stateless helpers (used by FeedbackService / API routes) */
export function runSmartAlerts(feedback: FeedbackType): AlertRuleResult[] {
  return FEEDBACK_ALERT_RULES
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

// export function buildNotificationFromAlert(
//   alert: AlertRuleResult,
//   userId: string
// ): Omit<Notification, '_id' | 'createdAt'> {
//   return {
//     userId,
//     title:         alert.ruleName,
//     message:       alert.message,
//     type:          alert.priority === 'critical' ? 'sla_breach' : 'low_rating_alert',
//     priority:      alert.priority,
//     status:        'unread',
//     channels:      alert.priority === 'critical' ? ['in_app', 'email', 'whatsapp'] : ['in_app'],
//     referenceId:   alert.feedbackId,
//     referenceType: 'feedback',
//     actionUrl:     `/dashboard/feedback?id=${alert.feedbackId}`,
//   }
// }

/* ─── Full SmartAlertEngine (tenant-aware, DB-driven) ────────────── */

export class SmartAlertEngine {
  private tenantId: string

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  /* Main entry — runs all checks and returns sorted alerts */
  async generateAlerts(): Promise<SmartAlert[]> {
    await connectDB()
    const alerts: SmartAlert[] = []

    await Promise.all([
      this.checkSLABreaches(alerts),
      this.checkNegativeFeedbackSpike(alerts),
      this.checkLowInventory(alerts),
      this.checkUnassignedTickets(alerts),
      this.checkTechnicianOverload(alerts),
      this.checkPendingFeedbackAlerts(alerts),
      this.checkRepeatComplaints(alerts),
      this.checkNPSDrop(alerts),
    ])

    return alerts.sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    )
  }

  /* ── 1. SLA Breaches ─────────────────────────────────────────── */
  private async checkSLABreaches(alerts: SmartAlert[]): Promise<void> {
    try {
      const now = new Date()

      // Already breached
      const breached = await Ticket.find({
        tenantId: this.tenantId,
        status: { $nin: ['resolved', 'closed', 'cancelled'] },
        $or: [
          { 'sla.isResponseBreached': true },
          { 'sla.isResolutionBreached': true },
        ],
      }).limit(20).lean()

      for (const ticket of breached) {
        alerts.push({
          id:             `sla-breach-${ticket._id}`,
          type:           'sla_breach',
          severity:       'critical',
          title:          'SLA Breach Detected',
          message:        `Ticket #${ticket.ticketNumber} has breached its SLA. Client is waiting.`,
          actionRequired: true,
          suggestedAction:'Escalate to supervisor immediately and contact the client.',
          data: {
            ticketId:     String(ticket._id),
            ticketNumber: ticket.ticketNumber,
            clientName:     (ticket as any).clientName,
            assignedTo:   (ticket as any).assignedTo,
            breachedAt:   ticket.sla?.resolutionDeadline,
          },
          createdAt: new Date(),
        })
      }

      // About to breach — response within 2 h, resolution within 4 h
      const aboutToBreach = await Ticket.find({
        tenantId: this.tenantId,
        status: { $nin: ['resolved', 'closed', 'cancelled'] },
        'sla.isResponseBreached':   false,
        'sla.isResolutionBreached': false,
        $or: [
          { 'sla.responseDeadline':   { $lte: new Date(now.getTime() + 2 * 3_600_000), $gt: now } },
          { 'sla.resolutionDeadline': { $lte: new Date(now.getTime() + 4 * 3_600_000), $gt: now } },
        ],
      }).limit(20).lean()

      for (const ticket of aboutToBreach) {
        const deadline   = ticket.sla?.resolutionDeadline ?? ticket.sla?.responseDeadline
        const minsLeft   = deadline ? Math.round((new Date(deadline).getTime() - now.getTime()) / 60_000) : null
        const timeLabel  = minsLeft !== null ? `${minsLeft} min` : 'soon'

        alerts.push({
          id:             `sla-warning-${ticket._id}`,
          type:           'sla_warning',
          severity:       'high',
          title:          'SLA Deadline Approaching',
          message:        `Ticket #${ticket.ticketNumber} will breach SLA in ${timeLabel}.`,
          actionRequired: true,
          suggestedAction:'Prioritize this ticket to prevent SLA breach.',
          data: {
            ticketId:     String(ticket._id),
            ticketNumber: ticket.ticketNumber,
            deadline,
            minutesLeft:  minsLeft,
          },
          createdAt: new Date(),
        })
      }
    } catch (err) {
      console.error('[SmartAlert] checkSLABreaches error:', err)
    }
  }

  /* ── 2. Negative Feedback Spike ──────────────────────────────── */
  private async checkNegativeFeedbackSpike(alerts: SmartAlert[]): Promise<void> {
    try {
      const now              = Date.now()
      const last24Hours      = new Date(now - 24 * 3_600_000)
      const previous24Hours  = new Date(now - 48 * 3_600_000)

      // const [recentNegative, previousNegative, recentTotal] = await Promise.all([
      //   Feedback.countDocuments({
      //     tenantId:  this.tenantId,
      //     createdAt: { $gte: last24Hours },
      //     $or: [{ rating: { $lte: 2 } }, { sentiment: 'negative' }],
      //   }),
      //   Feedback.countDocuments({
      //     tenantId:  this.tenantId,
      //     createdAt: { $gte: previous24Hours, $lt: last24Hours },
      //     $or: [{ rating: { $lte: 2 } }, { sentiment: 'negative' }],
      //   }),
      //   Feedback.countDocuments({
      //     tenantId:  this.tenantId,
      //     createdAt: { $gte: last24Hours },
      //   }),
      // ])
const [recentNegative, previousNegative, recentTotal] =
  await Promise.all([
    Feedback.countDocuments({
      tenantId: this.tenantId,
      createdAt: { $gte: last24Hours },

      $or: [
        { rating: { $lte: 2 } },
        { 'sentiment.label': 'negative' },
      ],
    }),

    Feedback.countDocuments({
      tenantId: this.tenantId,
      createdAt: {
        $gte: previous24Hours,
        $lt: last24Hours,
      },

      $or: [
        { rating: { $lte: 2 } },
        { 'sentiment.label': 'negative' },
      ],
    }),

    Feedback.countDocuments({
      tenantId: this.tenantId,
      createdAt: { $gte: last24Hours },
    }),
  ]);
      const increasePct = previousNegative > 0
        ? Math.round(((recentNegative - previousNegative) / previousNegative) * 100)
        : recentNegative > 0 ? 100 : 0

      // Spike: 50 %+ increase AND at least 3 negative reviews
      if (recentNegative > previousNegative * 1.5 && recentNegative >= 3) {
        alerts.push({
          id:             `feedback-spike-${now}`,
          type:           'feedback_spike',
          severity:       'high',
          title:          'Negative Feedback Spike',
          message:        `${recentNegative} negative feedback(s) in the last 24 h (${increasePct}% increase vs previous period).`,
          actionRequired: true,
          suggestedAction:'Review recent feedback immediately and identify root cause.',
          data: {
            recentNegative,
            previousNegative,
            increasePct,
            recentTotal,
          },
          createdAt: new Date(),
        })
      }

      // Overall low avg rating today
      const avgResult = await Feedback.aggregate([
        { $match: { tenantId: this.tenantId, createdAt: { $gte: last24Hours } } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ])
      const avg   = avgResult[0]?.avg ?? 5
      const count = avgResult[0]?.count ?? 0

      if (count >= 5 && avg < 3.0) {
        alerts.push({
          id:             `low-avg-rating-${now}`,
          type:           'low_avg_rating',
          severity:       'high',
          title:          'Low Average Rating Today',
          message:        `Today's average rating is ${avg.toFixed(1)}/5 across ${count} feedback(s).`,
          actionRequired: true,
          suggestedAction:'Identify common complaints and brief the team.',
          data:           { avg: avg.toFixed(2), count },
          createdAt:      new Date(),
        })
      }
    } catch (err) {
      console.error('[SmartAlert] checkNegativeFeedbackSpike error:', err)
    }
  }

  /* ── 3. Low Inventory ────────────────────────────────────────── */
  private async checkLowInventory(alerts: SmartAlert[]): Promise<void> {
    try {
      const lowStock = await Inventory.find({
        tenantId:  this.tenantId,
        isActive:  true,
        $expr: { $lte: ['$currentStock', '$reorderPoint'] },
      }).limit(20).lean() as unknown as Array<{
        _id: any
        name: string
        sku: string
        currentStock: number
        reorderPoint: number
        reorderQuantity?: number
        pendingOrders?: number
        lastOrderDate?: Date
      }>

      for (const item of lowStock) {
        const isOut       = item.currentStock <= 0
        const severity: SmartAlert['severity'] = isOut ? 'critical' : 'medium'

        alerts.push({
          id:             `inventory-${item._id}`,
          type:           isOut ? 'out_of_stock' : 'low_stock',
          severity,
          title:          isOut ? 'Out of Stock' : 'Low Stock Alert',
          message:        isOut
            ? `${item.name} is out of stock. ${item.pendingOrders ?? 0} pending order(s) affected.`
            : `${item.name} has only ${item.currentStock} unit(s) left (reorder point: ${item.reorderPoint}).`,
          actionRequired: true,
          suggestedAction: isOut
            ? `Place emergency order immediately. Notify affected jobs.`
            : `Place reorder for ${item.reorderQuantity ?? 'standard'} unit(s).`,
          data: {
            itemId:         String(item._id),
            itemName:       item.name,
            sku:            item.sku,
            currentStock:   item.currentStock,
            reorderPoint:   item.reorderPoint,
            reorderQuantity: item.reorderQuantity,
            lastOrderDate:  item.lastOrderDate,
          },
          createdAt: new Date(),
        })
      }
    } catch (err) {
      console.error('[SmartAlert] checkLowInventory error:', err)
    }
  }

  /* ── 4. Unassigned Tickets ───────────────────────────────────── */
  private async checkUnassignedTickets(alerts: SmartAlert[]): Promise<void> {
    try {
      const thresholdMinutes = 30
      const cutoff           = new Date(Date.now() - thresholdMinutes * 60_000)

      const [unassignedCount, urgentUnassigned] = await Promise.all([
        Ticket.countDocuments({
          tenantId:    this.tenantId,
          status:      'open',
          assignedTo:  { $exists: false },
          createdAt:   { $lte: cutoff },
        }),
        Ticket.find({
          tenantId:    this.tenantId,
          status:      'open',
          assignedTo:  { $exists: false },
          priority:    { $in: ['critical', 'high'] },
          createdAt:   { $lte: cutoff },
        }).limit(5).lean(),
      ])

      if (unassignedCount > 0) {
        alerts.push({
          id:             `unassigned-tickets-${Date.now()}`,
          type:           'unassigned_tickets',
          severity:       urgentUnassigned.length > 0 ? 'high' : 'medium',
          title:          'Unassigned Tickets',
          message:        `${unassignedCount} ticket(s) have been unassigned for over ${thresholdMinutes} minutes.`,
          actionRequired: true,
          suggestedAction:'Assign tickets to available technicians immediately.',
          data: {
            count:           unassignedCount,
            urgentCount:     urgentUnassigned.length,
            urgentTickets:   urgentUnassigned.map(t => ({
              id:     String(t._id),
              number: t.ticketNumber,
              priority: t.priority,
            })),
            thresholdMinutes,
          },
          createdAt: new Date(),
        })
      }

      // High/urgent unassigned — individual critical alerts
      for (const ticket of urgentUnassigned) {
        alerts.push({
          id:             `unassigned-urgent-${ticket._id}`,
          type:           'unassigned_urgent_ticket',
          severity:       'critical',
          title:          'Urgent Ticket Unassigned',
          message:        `Ticket #${ticket.ticketNumber} (${ticket.priority}) has no assignee.`,
          actionRequired: true,
          suggestedAction:'Assign to available senior technician immediately.',
          data:           { ticketId: String(ticket._id), ticketNumber: ticket.ticketNumber, priority: ticket.priority },
          createdAt:      new Date(),
        })
      }
    } catch (err) {
      console.error('[SmartAlert] checkUnassignedTickets error:', err)
    }
  }

  /* ── 5. Technician Overload ──────────────────────────────────── */
  private async checkTechnicianOverload(alerts: SmartAlert[]): Promise<void> {
    try {
      const OVERLOAD_THRESHOLD = 8

      const technicianLoad = await Ticket.aggregate([
        {
          $match: {
            tenantId:  this.tenantId,
            status:    { $in: ['open', 'in_progress', 'assigned'] },
            assignedTo: { $exists: true },
          },
        },
        { $group: { _id: '$assignedTo', count: { $sum: 1 }, technicianName: { $first: '$assignedToName' } } },
        { $match: { count: { $gte: OVERLOAD_THRESHOLD } } },
        { $sort:  { count: -1 } },
        { $limit: 10 },
      ])

      for (const tech of technicianLoad) {
        alerts.push({
          id:             `overload-${tech._id}`,
          type:           'technician_overload',
          severity:       tech.count >= OVERLOAD_THRESHOLD * 1.5 ? 'high' : 'medium',
          title:          'Technician Overloaded',
          message:        `${tech.technicianName || tech._id} has ${tech.count} active tickets (threshold: ${OVERLOAD_THRESHOLD}).`,
          actionRequired: true,
          suggestedAction:'Redistribute some tickets to other available technicians.',
          data: {
            technicianId:   String(tech._id),
            technicianName: tech.technicianName,
            activeTickets:  tech.count,
            threshold:      OVERLOAD_THRESHOLD,
          },
          createdAt: new Date(),
        })
      }

      // No technician available at all
      const [openCount, activeTechs] = await Promise.all([
        Ticket.countDocuments({ tenantId: this.tenantId, status: 'open', assignedTo: { $exists: false } }),
        Ticket.distinct('assignedTo', { tenantId: this.tenantId, status: { $in: ['open','in_progress'] } }),
      ])
      if (openCount > 5 && activeTechs.length === 0) {
        alerts.push({
          id:             `no-technicians-${Date.now()}`,
          type:           'no_technicians_available',
          severity:       'critical',
          title:          'No Technicians Available',
          message:        `${openCount} open ticket(s) with no technician assigned.`,
          actionRequired: true,
          suggestedAction:'Check technician availability and schedule immediately.',
          data:           { openCount },
          createdAt:      new Date(),
        })
      }
    } catch (err) {
      console.error('[SmartAlert] checkTechnicianOverload error:', err)
    }
  }

  /* ── 6. Pending Feedback Alerts (from DB feedback data) ──────── */
  private async checkPendingFeedbackAlerts(alerts: SmartAlert[]): Promise<void> {
    try {
      // Escalated feedback not responded to in 24h
      const escalatedNoResponse = await Feedback.find({
        tenantId:  this.tenantId,
        status:    'escalated',
        response:  { $exists: false },
        createdAt: { $lte: new Date(Date.now() - 24 * 3_600_000) },
      }).limit(10).lean()

      for (const fb of escalatedNoResponse) {
        alerts.push({
          id:             `escalated-no-response-${fb._id}`,
          type:           'escalated_feedback_no_response',
          severity:       'critical',
          title:          'Escalated Feedback — No Response',
          message:        `Feedback from ${(fb as any).clientName} has been escalated for over 24h with no response.`,
          actionRequired: true,
          suggestedAction:'Management must respond to this escalated feedback immediately.',
          data:           { feedbackId: String(fb._id), clientName: (fb as any).clientName, rating: (fb as any).rating },
          createdAt:      new Date(),
        })
      }

      // Pending feedback older than 48h
      const stalePending = await Feedback.countDocuments({
        tenantId:  this.tenantId,
        status:    'pending',
        createdAt: { $lte: new Date(Date.now() - 48 * 3_600_000) },
      })

      if (stalePending >= 5) {
        alerts.push({
          id:             `stale-pending-${Date.now()}`,
          type:           'stale_pending_feedback',
          severity:       'medium',
          title:          'Pending Feedback Backlog',
          message:        `${stalePending} feedback item(s) have been pending review for over 48 hours.`,
          actionRequired: true,
          suggestedAction:'Review and update status of pending feedback.',
          data:           { count: stalePending },
          createdAt:      new Date(),
        })
      }
    } catch (err) {
      console.error('[SmartAlert] checkPendingFeedbackAlerts error:', err)
    }
  }

  /* ── 7. Repeat Complaints (same client, multiple negatives) ──── */
  private async checkRepeatComplaints(alerts: SmartAlert[]): Promise<void> {
    try {
      const since = new Date(Date.now() - 7 * 24 * 3_600_000) // last 7 days

      const repeatComplainters = await Feedback.aggregate([
        {
          $match: {
            tenantId:  this.tenantId,
            createdAt: { $gte: since },
            $or: [{ rating: { $lte: 2 } }, { sentiment: 'negative' }],
          },
        },
        { $group: { _id: '$clientId', count: { $sum: 1 }, clientName: { $first: '$clientName' }, emails: { $addToSet: '$clientEmail' } } },
        { $match: { count: { $gte: 2 } } },
        { $sort:  { count: -1 } },
        { $limit: 5 },
      ])

      for (const client of repeatComplainters) {
        alerts.push({
          id:             `repeat-complaint-${client._id}`,
          type:           'repeat_complaint',
          severity:       client.count >= 3 ? 'high' : 'medium',
          title:          'Repeat Complaint Client',
          message:        `${client.clientName} has submitted ${client.count} negative feedback(s) in the last 7 days.`,
          actionRequired: true,
          suggestedAction:'Assign a senior account manager to personally follow up with this client.',
          data: {
            clientId:   String(client._id),
            clientName: client.clientName,
            email:      client.emails?.[0],
            count:      client.count,
          },
          createdAt: new Date(),
        })
      }
    } catch (err) {
      console.error('[SmartAlert] checkRepeatComplaints error:', err)
    }
  }

  /* ── 8. NPS Drop ─────────────────────────────────────────────── */
  private async checkNPSDrop(alerts: SmartAlert[]): Promise<void> {
    try {
      const now      = Date.now()
      const last7d   = new Date(now - 7  * 24 * 3_600_000)
      const prev7d   = new Date(now - 14 * 24 * 3_600_000)

      const [recentScores, prevScores] = await Promise.all([
        Feedback.find({ tenantId: this.tenantId, createdAt: { $gte: last7d }, npsScore: { $exists: true } })
          .select('npsScore').lean(),
        Feedback.find({ tenantId: this.tenantId, createdAt: { $gte: prev7d, $lt: last7d }, npsScore: { $exists: true } })
          .select('npsScore').lean(),
      ])

      if (recentScores.length < 3 || prevScores.length < 3) return

      const calcNPS = (scores: any[]) => {
        const promoters  = scores.filter(s => s.npsScore >= 9).length
        const detractors = scores.filter(s => s.npsScore <= 6).length
        return Math.round(((promoters - detractors) / scores.length) * 100)
      }

      const recentNPS = calcNPS(recentScores)
      const prevNPS   = calcNPS(prevScores)
      const drop      = prevNPS - recentNPS

      if (drop >= 15) {
        alerts.push({
          id:             `nps-drop-${now}`,
          type:           'nps_drop',
          severity:       drop >= 25 ? 'critical' : 'high',
          title:          'NPS Score Drop',
          message:        `NPS dropped from ${prevNPS} to ${recentNPS} (−${drop} points) in the last 7 days.`,
          actionRequired: true,
          suggestedAction:'Identify detractor patterns and initiate client recovery calls.',
          data: {
            currentNPS:  recentNPS,
            previousNPS: prevNPS,
            drop,
            sampleSize:  recentScores.length,
          },
          createdAt: new Date(),
        })
      }
    } catch (err) {
      console.error('[SmartAlert] checkNPSDrop error:', err)
    }
  }

  /* ── Utility: Count active alerts by severity ────────────────── */
  async getAlertSummary(): Promise<Record<SmartAlert['severity'], number>> {
    const alerts = await this.generateAlerts()
    return alerts.reduce(
      (acc, a) => { acc[a.severity]++; return acc },
      { critical: 0, high: 0, medium: 0, low: 0 }
    )
  }

  /* ── Utility: Filter by type ─────────────────────────────────── */
  async getAlertsByType(type: string): Promise<SmartAlert[]> {
    const alerts = await this.generateAlerts()
    return alerts.filter(a => a.type === type)
  }
}

/* Default export for convenience */
export default SmartAlertEngine