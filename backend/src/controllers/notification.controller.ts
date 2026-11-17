import { Request, Response } from 'express';
import notificationService from '../services/notification.service';

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const notifications = await notificationService.getUserNotifications(userId, limit);

    res.status(200).json({
      data: { notifications },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve notifications',
      details: error.message,
    });
  }
};

export const getUnreadNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const notifications = await notificationService.getUnreadNotifications(userId);

    res.status(200).json({
      data: { notifications },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve unread notifications',
      details: error.message,
    });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      data: { count },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to get unread count',
      details: error.message,
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    const notification = await notificationService.markAsRead(notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({
      data: { notification },
      message: 'Notification marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to mark notification as read',
      details: error.message,
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const count = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      data: { count },
      message: `Marked ${count} notification(s) as read`,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to mark all as read',
      details: error.message,
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    const success = await notificationService.deleteNotification(notificationId);

    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({
      message: 'Notification deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to delete notification',
      details: error.message,
    });
  }
};