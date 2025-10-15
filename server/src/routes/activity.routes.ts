import { Router } from 'express';
import {
  getActivities,
  getActivityById,
  createActivity,
  completeActivity,
  getUserProgress,
  resetUserProgress
} from '../controllers/activity.controller';
import { authenticateToken as requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/', getActivities);
router.get('/:id', getActivityById);

// Protected routes (authentication required)
router.post('/', requireAuth, createActivity);
router.post('/:id/complete', requireAuth, completeActivity);

// User progress routes
router.get('/user/progress', requireAuth, getUserProgress);
router.post('/user/reset-progress', requireAuth, resetUserProgress);

export default router;