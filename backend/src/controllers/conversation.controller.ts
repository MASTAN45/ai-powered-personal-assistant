import { Request, Response, NextFunction } from 'express';
import { conversationService, ConversationFilters } from '../services/conversation.service';

/**
 * GET /api/conversations
 * Get conversations with filters
 */
export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id.toString();
    const role = req.user!.role;

    const filters: ConversationFilters = {
      clientId: req.query.clientId as string,
      classification: req.query.classification as any,
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      isImportant: req.query.isImportant === 'true' ? true : req.query.isImportant === 'false' ? false : undefined,
      isArchived: req.query.isArchived === 'true' ? true : req.query.isArchived === 'false' ? false : undefined,
      search: req.query.search as string,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 25,
    };

    const result = await conversationService.getConversations(userId, role, filters);

    res.status(200).json({
      data: result,
      message: 'Conversations retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/conversations/:id
 * Get single conversation by ID
 */
export const getConversationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id.toString();
    const role = req.user!.role;
    const conversationId = req.params.id;

    const conversation = await conversationService.getConversationById(conversationId, userId, role);

    res.status(200).json({
      data: { conversation },
      message: 'Conversation retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/conversations/:id
 * Update conversation status or classification
 */
export const updateConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id.toString();
    const role = req.user!.role;
    const conversationId = req.params.id;
    const updates = req.body;

    const conversation = await conversationService.updateConversation(conversationId, userId, role, updates);

    res.status(200).json({
      data: { conversation },
      message: 'Conversation updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/conversations/bulk-update
 * Bulk update multiple conversations
 */
export const bulkUpdateConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id.toString();
    const role = req.user!.role;
    const { conversationIds, updates } = req.body;

    if (!conversationIds || !Array.isArray(conversationIds) || conversationIds.length === 0) {
      res.status(400).json({
        error: 'conversationIds array is required',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    if (!updates || Object.keys(updates).length === 0) {
      res.status(400).json({
        error: 'updates object is required',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const updatedCount = await conversationService.bulkUpdateConversations(conversationIds, userId, role, updates);

    res.status(200).json({
      data: { updatedCount },
      message: `${updatedCount} conversations updated successfully`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/conversations/stats
 * Get conversation statistics
 */
export const getConversationStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id.toString();
    const role = req.user!.role;

    const stats = await conversationService.getConversationStats(userId, role);

    res.status(200).json({
      data: stats,
      message: 'Statistics retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};
