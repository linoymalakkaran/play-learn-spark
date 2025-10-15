import { Router } from 'express';
import {
  getProgressAnalytics,
  getLearningTrends,
  getPerformanceInsights,
  getDetailedProgressReport
} from '../controllers/analytics.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Progress analytics routes
router.get('/progress/:userId?', getProgressAnalytics);
router.get('/trends/:userId?', getLearningTrends);
router.get('/insights/:userId?', getPerformanceInsights);
router.get('/report/:userId?', getDetailedProgressReport);

// Parent-specific routes for viewing children's analytics
router.get('/children/:childId/progress', authorizeRoles('parent'), getProgressAnalytics);
router.get('/children/:childId/trends', authorizeRoles('parent'), getLearningTrends);
router.get('/children/:childId/insights', authorizeRoles('parent'), getPerformanceInsights);
router.get('/children/:childId/report', authorizeRoles('parent'), getDetailedProgressReport);

// Admin routes for all users analytics
router.get('/admin/users/:userId/progress', authorizeRoles('admin'), getProgressAnalytics);
router.get('/admin/users/:userId/trends', authorizeRoles('admin'), getLearningTrends);
router.get('/admin/users/:userId/insights', authorizeRoles('admin'), getPerformanceInsights);
router.get('/admin/users/:userId/report', authorizeRoles('admin'), getDetailedProgressReport);

export default router;