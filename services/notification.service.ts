 import Notification from '@/models/Notification';
import NotificationPreference from '@/models/NotificationPreference';
import { NotificationType, NotificationChannel } from '@/types/notification';
import connectDB from '@/lib/db';

export class NotificationService {
  static async create(
    userId: string,
    tenantId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
    await connectDB();

    const preference = await NotificationPreference.findOne({ userId, tenantId });
    const channels: NotificationChannel[] = ['in_app'];

    if (preference) {
      if (preference.email) channels.push('email');
      if (preference.push) channels.push('push');
      if (preference.whatsapp) channels.push('whatsapp');
    }

    const notification = await Notification.create({
      userId,
      tenantId,
      type,
      title,
      message,
      data,
      channels,
    });

    // Trigger external notifications
    if (channels.includes('email')) {
      await this.sendEmail(userId, title, message);
    }
    if (channels.includes('push')) {
      await this.sendPush(userId, title, message);
    }

    return notification;
  }

  static async getNotifications(userId: string, tenantId: string, options: { page?: number; limit?: number; unreadOnly?: boolean }) {
    await connectDB();

    const { page = 1, limit = 20, unreadOnly = false } = options;
    const query: Record<string, any> = { userId, tenantId };

    if (unreadOnly) {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, tenantId, isRead: false }),
    ]);

    return { notifications, total, unreadCount, page, limit };
  }

  static async markAsRead(notificationId: string, userId: string) {
    await connectDB();
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string, tenantId: string) {
    await connectDB();
    return Notification.updateMany(
      { userId, tenantId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  private static async sendEmail(userId: string, title: string, message: string) {
    // Implement email sending logic
    console.log(`Sending email to user ${userId}: ${title}`);
  }

  private static async sendPush(userId: string, title: string, message: string) {
    // Implement push notification logic
    console.log(`Sending push to user ${userId}: ${title}`);
  }
}
