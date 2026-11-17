import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// AI provider status
router.get('/status', chatController.getStatus.bind(chatController));

// Send message (creates session if needed)
router.post('/message', chatController.sendMessage.bind(chatController));

// Session management
router.get('/sessions', chatController.getSessions.bind(chatController));
router.post('/sessions', chatController.createSession.bind(chatController));
router.get('/sessions/:sessionId/messages', chatController.getMessages.bind(chatController));
router.delete('/sessions/:sessionId', chatController.deleteSession.bind(chatController));

// Action confirmation
router.post('/action/confirm', chatController.confirmAction.bind(chatController));

export default router;