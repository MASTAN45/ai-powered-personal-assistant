import mongoose from 'mongoose';
import { Conversation, IConversation } from '../models/Conversation.model';
import { Pairing } from '../models/Pairing.model';

export interface ConversationFilters {
  clientId?: string;
  classification?: 'ASSISTANT_TO_REPLY' | 'CLIENT_TO_REPLY' | 'NO_REPLY_NEEDED' | 'ALL';
  isRead?: boolean;
  isImportant?: boolean;
  isArchived?: boolean;
  search?: string;
  sortBy?: 'date' | 'sender' | 'subject';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ConversationListResult {
  conversations: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts: {
    assistantToReply: number;
    clientToReply: number;
    noReplyNeeded: number;
    total: number;
  };
}

export interface ConversationUpdateData {
  'statusFlags.isRead'?: boolean;
  'statusFlags.isImportant'?: boolean;
  'statusFlags.isArchived'?: boolean;
  'statusFlags.isCompleted'?: boolean;
  classification?: 'ASSISTANT_TO_REPLY' | 'CLIENT_TO_REPLY' | 'NO_REPLY_NEEDED';
  isManuallyClassified?: boolean;
}

export class ConversationService {
  /**
   * Get conversations with filters, search, and pagination
   */
  async getConversations(
    userId: string,
    role: 'ASSISTANT' | 'CLIENT',
    filters: ConversationFilters = {}
  ): Promise<ConversationListResult> {
    // Build query based on role
    const query = await this.buildQuery(userId, role, filters);

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    let sort: any = {};

    switch (sortField) {
      case 'date':
        sort = { lastMessageTimestamp: sortOrder };
        break;
      case 'sender':
        sort = { 'sender.name': sortOrder };
        break;
      case 'subject':
        sort = { subject: sortOrder };
        break;
      default:
        sort = { lastMessageTimestamp: -1 };
    }

    // Execute queries
    const [conversations, total, counts] = await Promise.all([
      Conversation.find(query)
        .select(
          'subject sender classification priority statusFlags messages lastMessageTimestamp classificationConfidence needsHumanReview'
        )
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean()
        .exec(),
      Conversation.countDocuments(query),
      this.getConversationCounts(userId, role),
    ]);

    // Add message count and preview to each conversation
    const conversationsWithExtras = conversations.map((conv: any) => ({
      ...conv,
      messageCount: conv.messages?.length || 0,
      preview: this.getPreview(conv),
    }));

    return {
      conversations: conversationsWithExtras,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      counts,
    };
  }

  /**
   * Get single conversation by ID with authorization check
   */
  async getConversationById(
    conversationId: string,
    userId: string,
    role: 'ASSISTANT' | 'CLIENT'
  ): Promise<IConversation> {
    const conversation = await Conversation.findById(conversationId).populate('messages').lean();

    if (!conversation) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    // Authorization check
    const hasAccess = await this.checkAccess(conversation.clientId.toString(), userId, role);
    if (!hasAccess) {
      throw new Error('FORBIDDEN');
    }

    return conversation as unknown as IConversation;
  }

  /**
   * Update conversation status or classification
   */
  async updateConversation(
    conversationId: string,
    userId: string,
    role: 'ASSISTANT' | 'CLIENT',
    updates: ConversationUpdateData
  ): Promise<IConversation> {
    // Get conversation first
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    // Authorization check
    const hasAccess = await this.checkAccess(conversation.clientId.toString(), userId, role);
    if (!hasAccess) {
      throw new Error('FORBIDDEN');
    }

    // Validate updates based on role
    this.validateUpdatesForRole(updates, role);

    // Apply updates
    const updated = await Conversation.findByIdAndUpdate(conversationId, { $set: updates }, { new: true }).lean();

    return updated as unknown as IConversation;
  }

  /**
   * Bulk update multiple conversations
   */
  async bulkUpdateConversations(
    conversationIds: string[],
    userId: string,
    role: 'ASSISTANT' | 'CLIENT',
    updates: ConversationUpdateData
  ): Promise<number> {
    // Validate updates based on role
    this.validateUpdatesForRole(updates, role);

    // Get all conversations to check access
    const conversations = await Conversation.find({
      _id: { $in: conversationIds },
    }).select('clientId');

    // Check access for all
    for (const conv of conversations) {
      const hasAccess = await this.checkAccess(conv.clientId.toString(), userId, role);
      if (!hasAccess) {
        throw new Error('FORBIDDEN');
      }
    }

    // Perform bulk update
    const result = await Conversation.updateMany(
      { _id: { $in: conversationIds } },
      { $set: updates }
    );

    return result.modifiedCount;
  }

  /**
   * Get conversation statistics by classification
   */
  async getConversationStats(
    userId: string,
    role: 'ASSISTANT' | 'CLIENT'
  ): Promise<{
    assistantToReply: number;
    clientToReply: number;
    noReplyNeeded: number;
    unread: number;
    important: number;
    total: number;
  }> {
    const clientIds = await this.getAccessibleClientIds(userId, role);

    const baseQuery = {
      clientId: { $in: clientIds },
      'statusFlags.isArchived': false,
    };

    // Get counts
    const [assistantToReply, clientToReply, noReplyNeeded, unread, important, total] = await Promise.all([
      Conversation.countDocuments({ ...baseQuery, classification: 'ASSISTANT_TO_REPLY' }),
      Conversation.countDocuments({ ...baseQuery, classification: 'CLIENT_TO_REPLY' }),
      Conversation.countDocuments({ ...baseQuery, classification: 'NO_REPLY_NEEDED' }),
      Conversation.countDocuments({ ...baseQuery, 'statusFlags.isRead': false }),
      Conversation.countDocuments({ ...baseQuery, 'statusFlags.isImportant': true }),
      Conversation.countDocuments(baseQuery),
    ]);

    return {
      assistantToReply,
      clientToReply,
      noReplyNeeded,
      unread,
      important,
      total,
    };
  }

  /**
   * Build query based on user role and filters
   */
  private async buildQuery(userId: string, role: 'ASSISTANT' | 'CLIENT', filters: ConversationFilters): Promise<any> {
    const query: any = {};

    // Get accessible client IDs based on role
    const clientIds = await this.getAccessibleClientIds(userId, role);
    query.clientId = { $in: clientIds };

    // Classification filter
    if (filters.classification && filters.classification !== 'ALL') {
      query.classification = filters.classification;
    } else if (role === 'CLIENT' && !filters.classification) {
      // Clients see URGENT and IMPORTANT by default
      query.classification = { $in: ['CLIENT_TO_REPLY', 'ASSISTANT_TO_REPLY'] };
    }

    // Status filters
    if (filters.isRead !== undefined) {
      query['statusFlags.isRead'] = filters.isRead;
    }

    if (filters.isImportant !== undefined) {
      query['statusFlags.isImportant'] = filters.isImportant;
    }

    if (filters.isArchived !== undefined) {
      query['statusFlags.isArchived'] = filters.isArchived;
    } else {
      // Default: hide archived
      query['statusFlags.isArchived'] = false;
    }

    // Search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    return query;
  }

  /**
   * Get client IDs accessible by the user
   */
  private async getAccessibleClientIds(userId: string, role: 'ASSISTANT' | 'CLIENT'): Promise<mongoose.Types.ObjectId[]> {
    if (role === 'CLIENT') {
      // Clients only see their own conversations
      return [new mongoose.Types.ObjectId(userId)];
    } else {
      // Assistants see conversations of all paired clients
      const pairings = await Pairing.find({
        assistant: userId,
        status: 'ACCEPTED',
      }).select('client');

      return pairings.map((p) => p.client);
    }
  }

  /**
   * Check if user has access to a specific client's conversations
   */
  private async checkAccess(clientId: string, userId: string, role: 'ASSISTANT' | 'CLIENT'): Promise<boolean> {
    if (role === 'CLIENT') {
      // Clients can only access their own conversations
      return clientId === userId;
    } else {
      // Assistants can access paired clients' conversations
      const pairing = await Pairing.findOne({
        assistant: userId,
        client: clientId,
        status: 'ACCEPTED',
      });

      return !!pairing;
    }
  }

  /**
   * Validate updates based on user role
   */
  private validateUpdatesForRole(updates: ConversationUpdateData, role: 'ASSISTANT' | 'CLIENT'): void {
    if (role === 'CLIENT') {
      // Clients can only update isRead and isImportant
      const allowedFields = ['statusFlags.isRead', 'statusFlags.isImportant'];
      const requestedFields = Object.keys(updates);
      const invalidFields = requestedFields.filter((f) => !allowedFields.includes(f));

      if (invalidFields.length > 0) {
        throw new Error('FORBIDDEN_UPDATE');
      }
    }
  }

  /**
   * Get conversation counts by classification
   */
  private async getConversationCounts(
    userId: string,
    role: 'ASSISTANT' | 'CLIENT'
  ): Promise<{
    assistantToReply: number;
    clientToReply: number;
    noReplyNeeded: number;
    total: number;
  }> {
    const clientIds = await this.getAccessibleClientIds(userId, role);

    const baseQuery = {
      clientId: { $in: clientIds },
      'statusFlags.isArchived': false,
    };

    const [assistantToReply, clientToReply, noReplyNeeded, total] = await Promise.all([
      Conversation.countDocuments({ ...baseQuery, classification: 'ASSISTANT_TO_REPLY' }),
      Conversation.countDocuments({ ...baseQuery, classification: 'CLIENT_TO_REPLY' }),
      Conversation.countDocuments({ ...baseQuery, classification: 'NO_REPLY_NEEDED' }),
      Conversation.countDocuments(baseQuery),
    ]);

    return {
      assistantToReply,
      clientToReply,
      noReplyNeeded,
      total,
    };
  }

  /**
   * Get preview text from conversation
   */
  private getPreview(conversation: any): string {
    if (!conversation.messages || conversation.messages.length === 0) {
      return '';
    }

    const latestMessage = conversation.messages[conversation.messages.length - 1];
    const text = latestMessage.body?.text || '';
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  }
}

export const conversationService = new ConversationService();
