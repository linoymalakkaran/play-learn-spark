import { Router } from 'express';
import { feedbackController } from '../controllers/feedbackController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.post('/', feedbackController.createFeedback);
router.get('/public', feedbackController.getPublicFeedback);
router.get('/stats', feedbackController.getFeedbackStats);

// Admin routes (authentication required)
router.get('/admin/all', authenticateToken, feedbackController.getAllFeedback);
router.put('/admin/:id/status', authenticateToken, feedbackController.updateFeedbackStatus);

export default router;