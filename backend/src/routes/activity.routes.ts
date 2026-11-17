import { Router } from 'express';
import { getMyActivities, getConversationActivities, getRecentActivities } from '../controllers/activity.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/my-activities', getMyActivities);
router.get('/recent', getRecentActivities);
router.get('/conversation/:conversationId', getConversationActivities);

export default router;