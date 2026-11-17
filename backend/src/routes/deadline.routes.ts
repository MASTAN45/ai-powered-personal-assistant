import { Router } from 'express';
import {
  extractDeadlines,
  getUpcomingDeadlines,
  getOverdueDeadlines,
  getAllDeadlines,
  updateDeadlineStatus,
  confirmDeadline,
  deleteDeadline,
} from '../controllers/deadline.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/extract', extractDeadlines);
router.get('/upcoming', getUpcomingDeadlines);
router.get('/overdue', getOverdueDeadlines);
router.get('/all', getAllDeadlines);
router.patch('/:deadlineId/status', updateDeadlineStatus);
router.patch('/:deadlineId/confirm', confirmDeadline);
router.delete('/:deadlineId', deleteDeadline);

export default router;