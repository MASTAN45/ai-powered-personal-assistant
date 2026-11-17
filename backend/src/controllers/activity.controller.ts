import { Request, Response } from 'express';
import activityService from '../services/activity.service';

export const getMyActivities = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const activities = await activityService.getActivitiesByUser(userId, limit);

    res.status(200).json({
      data: { activities },
      message: 'Activities retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve activities',
      details: error.message,
    });
  }
};

export const getConversationActivities = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const activities = await activityService.getActivitiesByConversation(conversationId);

    res.status(200).json({
      data: { activities },
      message: 'Conversation activities retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve conversation activities',
      details: error.message,
    });
  }
};

export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const activities = await activityService.getRecentActivities(limit);

    res.status(200).json({
      data: { activities },
      message: 'Recent activities retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve recent activities',
      details: error.message,
    });
  }
};