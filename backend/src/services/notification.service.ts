import { Notification, INotification } from '../models/Notification.model';

class NotificationService {
  async createNotification(data: {
    userId: string;
    type: INotification['type'];
    title: string;
    message: string;
    relatedConversationId?: string;
    relatedDeadlineId?: string;
  }): Promise<INotification> {
    const notification = await Notification.create({
      user: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedConversation: data.relatedConversationId,
      relatedDeadline: data.relatedDeadlineId,
      isRead: false,
    });

    return notification;
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<INotification[]> {
    return Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('relatedConversation', 'subject sender')
      .populate('relatedDeadline', 'title dueDate')
      .exec();
  }

  async getUnreadNotifications(userId: string): Promise<INotification[]> {
    return Notification.find({ user: userId, isRead: false })
      .sort({ createdAt: -1 })
      .populate('relatedConversation', 'subject sender')
      .populate('relatedDeadline', 'title dueDate')
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ user: userId, isRead: false });
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return result.modifiedCount;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    const result = await Notification.deleteOne({ _id: notificationId });
    return result.deletedCount > 0;
  }
}

export default new NotificationService();