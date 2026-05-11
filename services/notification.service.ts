import { NotificationModel } from '@/models/Notification'
import { NotificationPreferenceModel } from '@/models/NotificationPreference'
import type { Notification, NotificationPreference, NotificationType, NotificationChannel } from '@/types/notification'
import { sendEmail, buildFeedbackEmailHtml } from '@/lib/notifications/email'
import { sendWhatsApp, buildFeedbackWhatsAppMessage } from '@/lib/notifications/whatsapp'
import { pushSSENotification } from '@/lib/notifications/realtime'
import { connectDB } from '@/lib/db'

export class NotificationService {
  /* ── CREATE ── */
  static async create(data: Omit<Notification, '_id' | 'createdAt'>): Promise<Notification> {
    await connectDB()
    const doc = await NotificationModel.create(data)
    // Push realtime SSE
    pushSSENotification(data.userId, doc.toObject() as Notification)
    return doc.toObject()
  }

  /* ── LIST ── */
  static async list(userId: string, page = 1, limit = 20, status?: string) {
    await connectDB()
    const query: Record<string, unknown> = { userId }
    if (status) query.status = status
    const [data, total, unread] = await Promise.all([
      NotificationModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      NotificationModel.countDocuments(query),
      NotificationModel.countDocuments({ userId, status: 'unread' }),
    ])
    return { data: data as Notification[], total, unread, page, limit, totalPages: Math.ceil(total / limit) }
  }

  /* ── MARK READ ── */
  static async markRead(ids: string[], userId: string): Promise<number> {
    await connectDB()
    const res = await NotificationModel.updateMany(
      { _id: { $in: ids }, userId },
      { status: 'read', readAt: new Date() }
    )
    return res.modifiedCount
  }

  static async markAllRead(userId: string): Promise<number> {
    await connectDB()
    const res = await NotificationModel.updateMany(
      { userId, status: 'unread' },
      { status: 'read', readAt: new Date() }
    )
    return res.modifiedCount
  }

  /* ── DELETE ── */
  static async delete(id: string, userId: string): Promise<boolean> {
    await connectDB()
    const res = await NotificationModel.findOneAndDelete({ _id: id, userId })
    return !!res
  }

  /* ── PREFERENCES ── */
  static async getPreferences(userId: string): Promise<NotificationPreference | null> {
    await connectDB()
    return NotificationPreferenceModel.findOne({ userId }).lean() as Promise<NotificationPreference | null>
  }

  static async upsertPreferences(userId: string, prefs: Partial<NotificationPreference>): Promise<NotificationPreference> {
    await connectDB()
    const doc = await NotificationPreferenceModel.findOneAndUpdate(
      { userId },
      { ...prefs, userId },
      { new: true, upsert: true }
    ).lean()
    return doc as NotificationPreference
  }

  /* ── MULTI-CHANNEL DISPATCH ── */
  static async dispatch(params: {
    userId:        string
    userEmail?:    string
    userPhone?:    string
    title:         string
    message:       string
    type:          NotificationType
    channels:      NotificationChannel[]
    referenceId?:  string
    referenceType?: string
    actionUrl?:    string
    metadata?:     Record<string, unknown>
  }): Promise<void> {
    const { userId, userEmail, userPhone, title, message, type, channels, referenceId, referenceType, actionUrl, metadata } = params

    // 1. Save in-app notification
    if (channels.includes('in_app')) {
      await this.create({ userId, title, message, type, priority: 'medium', status: 'unread', channels, referenceId, referenceType, actionUrl, metadata })
    }

    // 2. Email
    if (channels.includes('email') && userEmail) {
      await sendEmail({
        to:      userEmail,
        subject: title,
        html:    buildFeedbackEmailHtml({ clientName: metadata?.clientName as string || '', rating: metadata?.rating as number || 0, comment: message, dashboardUrl: actionUrl }),
      })
    }

    // 3. WhatsApp
    if (channels.includes('whatsapp') && userPhone) {
      await sendWhatsApp({
        phone:   userPhone,
        message: buildFeedbackWhatsAppMessage({ clientName: metadata?.clientName as string || '', rating: metadata?.rating as number || 0, comment: message }),
      })
    }
  }
}