import { Request, Response } from 'express';
import { ChatSession } from '../models/ChatSession.model';
import { ChatMessage } from '../models/ChatMessage.model';
import { aiProviderService } from '../services/ai/ai-provider.service';
import { emailContextService } from '../services/ai/email-context.service';
import { actionDetectorService } from '../services/ai/action-detector.service';
import { Conversation } from '../models/Conversation.model';
import { logger } from '../config/logger';

export class ChatController {
  // Get provider status
  public async getStatus(req: Request, res: Response) {
    try {
      const status = aiProviderService.getProviderStatus();
      res.json(status);
    } catch (error) {
      logger.error('Error getting AI provider status:', error);
      res.status(500).json({ error: 'Failed to get provider status' });
    }
  }

  // Send message
  public async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.user!._id;
      const userRole = req.user!.role;
      const { sessionId, message, conversationId } = req.body;

      if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get or create session
      let session;
      if (sessionId) {
        session = await ChatSession.findOne({ _id: sessionId, user: userId.toString() });
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }
      } else {
        session = await ChatSession.create({
          user: userId,
          title: message.substring(0, 50),
          contextType: conversationId ? 'conversation' : 'general',
          contextId: conversationId,
        });
      }

      // Save user message
      await ChatMessage.create({
        session: session._id,
        user: userId,
        role: 'user',
        content: message,
        conversationContext: conversationId,
      });

      // Get conversation history
      const messageHistory = await ChatMessage.find({ session: session._id })
        .sort({ createdAt: 1 })
        .limit(20)
        .lean();

      const aiMessages = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Get email context
      const context = await emailContextService.getUserEmailContext(
        userId.toString(),
        userRole,
        conversationId,
        50
      );

      const systemPrompt = emailContextService.buildSystemPrompt(context);

      // Generate AI response
      const aiResponse = await aiProviderService.generateResponse(
        aiMessages,
        context,
        systemPrompt
      );

      // Detect if action is required
      const detectedAction = actionDetectorService.detectAction(message);

      // Save assistant message
      const assistantMessage = await ChatMessage.create({
        session: session._id,
        user: userId,
        role: 'assistant',
        content: aiResponse.content,
        provider: aiResponse.provider,
        model: aiResponse.model,
        conversationContext: conversationId,
      });

      // Build response
      const responseData: any = {
        sessionId: session._id,
        message: {
          id: assistantMessage._id,
          role: 'assistant',
          content: aiResponse.content,
          provider: aiResponse.provider,
          model: aiResponse.model,
          createdAt: assistantMessage.createdAt,
        },
      };

      // If write action detected, add it to response (requires confirmation)
      if (detectedAction && detectedAction.requiresConfirmation) {
        responseData.pendingAction = detectedAction;
      }
      // If read action detected, auto-execute it
      else if (detectedAction && !detectedAction.requiresConfirmation) {
        // Auto-execute read operations
        logger.info('Auto-executing read operation:', detectedAction.operation);
      }

      res.json(responseData);
    } catch (error: any) {
      logger.error('Error sending chat message:', error);
      res.status(500).json({ 
        error: 'Failed to process message',
        details: error.message 
      });
    }
  }

  // Get user's chat sessions
  public async getSessions(req: Request, res: Response) {
    try {
      const userId = req.user!._id;

      const sessions = await ChatSession.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean();

      // Get message count for each session
      const sessionsWithCounts = await Promise.all(
        sessions.map(async (session) => {
          const messageCount = await ChatMessage.countDocuments({ session: session._id });
          return {
            ...session,
            messageCount,
          };
        })
      );

      res.json(sessionsWithCounts);
    } catch (error) {
      logger.error('Error fetching chat sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }

  // Get messages for a session
  public async getMessages(req: Request, res: Response) {
    try {
      const userId = req.user!._id;
      const { sessionId } = req.params;

      // Verify ownership
      const session = await ChatSession.findOne({ _id: sessionId, user: userId.toString() });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const messages = await ChatMessage.find({ session: sessionId })
        .sort({ createdAt: 1 })
        .lean();

      res.json(messages);
    } catch (error) {
      logger.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  // Delete a session
  public async deleteSession(req: Request, res: Response) {
    try {
      const userId = req.user!._id;
      const { sessionId } = req.params;

      // Verify ownership
      const session = await ChatSession.findOne({ _id: sessionId, user: userId.toString() });
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Delete messages and session
      await ChatMessage.deleteMany({ session: sessionId });
      await ChatSession.deleteOne({ _id: sessionId });

      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      logger.error('Error deleting session:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }

  // Create new session
  public async createSession(req: Request, res: Response) {
    try {
      const userId = req.user!._id;
      const { title, conversationId } = req.body;

      const session = await ChatSession.create({
        user: userId,
        title: title || 'New Chat',
        contextType: conversationId ? 'conversation' : 'general',
        contextId: conversationId,
      });

      res.json(session);
    } catch (error) {
      logger.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }

  // Confirm and execute action
  public async confirmAction(req: Request, res: Response) {
    try {
      const userId = req.user!._id;
      const userRole = req.user!.role;
      const { actionId, data } = req.body;

      if (!actionId || !data) {
        return res.status(400).json({ error: 'Action ID and data are required' });
      }

      // Revalidate authorization
      if (userRole !== 'assistant') {
        return res.status(403).json({ error: 'Only assistants can execute write operations' });
      }

      // Execute the action based on operation type
      let result;
      const filter = data.filter || {};

      // Build query for conversation update
      const query: any = { user: userId };
      if (filter.classification) {
        query.classification = filter.classification;
      }
      if (typeof filter.isRead === 'boolean') {
        query.isRead = filter.isRead;
      }
      if (filter.status) {
        query.status = filter.status;
      }

      // Execute the operation
      if (data.status) {
        result = await Conversation.updateMany(query, { status: data.status });
      } else if (data.archived !== undefined) {
        result = await Conversation.updateMany(query, { isArchived: data.archived });
      } else if (data.action === 'delete') {
        result = await Conversation.deleteMany(query);
      } else if (data.isImportant !== undefined) {
        result = await Conversation.updateMany(query, { isImportant: data.isImportant });
      } else if (data.classification) {
        result = await Conversation.updateMany(query, { classification: data.classification });
      } else {
        return res.status(400).json({ error: 'Invalid action data' });
      }

      logger.info('Action executed:', { actionId, userId, result });

      // Handle different result types
      const affected = 'modifiedCount' in result 
        ? result.modifiedCount 
        : 'deletedCount' in result 
        ? result.deletedCount 
        : 0;

      res.json({
        success: true,
        message: 'Action executed successfully',
        affected,
      });
    } catch (error: any) {
      logger.error('Error confirming action:', error);
      res.status(500).json({
        error: 'Failed to execute action',
        details: error.message,
      });
    }
  }
}

export const chatController = new ChatController();
