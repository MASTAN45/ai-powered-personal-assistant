import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as conversationController from '../controllers/conversation.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get conversations with filters
router.get('/', conversationController.getConversations);

// Get conversation statistics
router.get('/stats', conversationController.getConversationStats);

// Bulk update conversations
router.post('/bulk-update', conversationController.bulkUpdateConversations);

// Get single conversation
router.get('/:id', conversationController.getConversationById);

// Update conversation
router.patch('/:id', conversationController.updateConversation);

export default router;
