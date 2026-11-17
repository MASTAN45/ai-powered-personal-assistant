import { Activity, IActivity } from '../models/Activity.model';
import { Types } from 'mongoose';

class ActivityService {
  async logActivity(data: {
    eventType: IActivity['eventType'];
    userId: string;
    conversationId?: string;
    relatedEntityId?: string;
    details?: IActivity['details'];
    metadata?: IActivity['metadata'];
  }): Promise<IActivity> {
    const activity = await Activity.create({
      eventType: data.eventType,
      user: data.userId,
      conversation: data.conversationId,
      relatedEntity: data.relatedEntityId,
      details: data.details || {},
      metadata: data.metadata || {},
      timestamp: new Date(),
    });

    return activity;
  }

  async getActivitiesByUser(userId: string, limit: number = 50): Promise<IActivity[]> {
    return Activity.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('user', 'fullName email role')
      .populate('conversation', 'subject sender')
      .exec();
  }

  async getActivitiesByConversation(conversationId: string): Promise<IActivity[]> {
    return Activity.find({ conversation: conversationId })
      .sort({ timestamp: -1 })
      .populate('user', 'fullName email role')
      .exec();
  }

  async getRecentActivities(limit: number = 20): Promise<IActivity[]> {
    return Activity.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('user', 'fullName email role')
      .populate('conversation', 'subject sender')
      .exec();
  }

  async getActivitiesByType(
    eventType: IActivity['eventType'],
    limit: number = 50
  ): Promise<IActivity[]> {
    return Activity.find({ eventType })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('user', 'fullName email role')
      .populate('conversation', 'subject sender')
      .exec();
  }
}

export default new ActivityService();