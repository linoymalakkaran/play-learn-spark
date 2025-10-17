import { Router } from 'express';
import { RewardController } from '../controllers/reward.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Reward Card Routes
router.post('/cards/:userId/initialize', RewardController.initializeRewardCard);
router.get('/cards/:userId', RewardController.getRewardCard);

// Points and Activity Completion
router.post('/cards/:userId/award-completion', RewardController.awardActivityCompletion);

// Reward Items and Redemption
router.get('/items/:userId/available', RewardController.getAvailableRewards);
router.post('/redemptions/:userId/request', RewardController.requestReward);
router.get('/redemptions/:userId/pending', RewardController.getPendingRequests);
router.put('/redemptions/:redemptionId/process', RewardController.processRewardRequest);
router.get('/redemptions/:userId/history', RewardController.getRedemptionHistory);

// Achievements
router.get('/achievements', RewardController.getAchievements);
router.get('/achievements/:userId/earned', RewardController.getUserAchievements);

export default router;