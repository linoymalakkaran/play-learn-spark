import express from 'express';
import { GamificationController } from '../controllers/gamificationController';
import { authMiddleware } from '../middleware/auth';
import { validateObjectId } from '../middleware/validation';
import { body, query, param } from 'express-validator';
import { validationMiddleware } from '../middleware/validation';

const router = express.Router();

// Validation middleware
const validatePointsTransaction = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('source')
    .notEmpty()
    .withMessage('Source is required')
    .isIn(['assignment', 'quiz', 'challenge', 'badge', 'streak', 'referral', 'daily_login', 'bonus', 'manual'])
    .withMessage('Invalid source type'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Amount must be positive'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters'),
  validationMiddleware
];

const validateExperienceTransaction = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Amount must be positive'),
  body('source')
    .notEmpty()
    .withMessage('Source is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  validationMiddleware
];

const validateStreakUpdate = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('streakType')
    .notEmpty()
    .withMessage('Streak type is required')
    .isIn(['daily_login', 'assignment_completion', 'quiz_completion', 'reading', 'practice', 'custom'])
    .withMessage('Invalid streak type'),
  body('increment')
    .optional()
    .isBoolean()
    .withMessage('Increment must be a boolean'),
  validationMiddleware
];

const validateChallengeJoin = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('challengeId')
    .isMongoId()
    .withMessage('Challenge ID must be a valid MongoDB ObjectId'),
  body('teamId')
    .optional()
    .isMongoId()
    .withMessage('Team ID must be a valid MongoDB ObjectId'),
  validationMiddleware
];

const validateChallengeCompletion = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('challengeId')
    .isMongoId()
    .withMessage('Challenge ID must be a valid MongoDB ObjectId'),
  body('score')
    .isNumeric()
    .withMessage('Score must be a number')
    .custom((value) => value >= 0)
    .withMessage('Score must be non-negative'),
  body('completionTime')
    .isNumeric()
    .withMessage('Completion time must be a number')
    .custom((value) => value > 0)
    .withMessage('Completion time must be positive'),
  validationMiddleware
];

const validateSpendPoints = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Amount must be positive'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters'),
  validationMiddleware
];

const validateLeaderboardComment = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters'),
  body('targetRank')
    .optional()
    .isNumeric()
    .withMessage('Target rank must be a number'),
  validationMiddleware
];

const validateLeaderboardAction = [
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  body('action')
    .isIn(['follow', 'unfollow'])
    .withMessage('Action must be either follow or unfollow'),
  validationMiddleware
];

const validateSearch = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  validationMiddleware
];

const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative'),
  validationMiddleware
];

// Profile routes
router.get('/profile/:userId?', 
  authMiddleware, 
  param('userId').optional().isMongoId().withMessage('Invalid user ID'),
  validationMiddleware,
  GamificationController.getUserProfile
);

// Points management routes
router.post('/points/award', 
  authMiddleware, 
  validatePointsTransaction,
  GamificationController.awardPoints
);

router.post('/points/spend', 
  authMiddleware, 
  validateSpendPoints,
  GamificationController.spendPoints
);

router.post('/experience/award', 
  authMiddleware, 
  validateExperienceTransaction,
  GamificationController.awardExperience
);

// Streak routes
router.post('/streaks/update', 
  authMiddleware, 
  validateStreakUpdate,
  GamificationController.updateStreak
);

// Badge routes
router.get('/badges', 
  authMiddleware,
  query('category').optional().isString(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  query('rarity').optional().isIn(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  query('featured').optional().isBoolean(),
  validationMiddleware,
  GamificationController.getAvailableBadges
);

router.get('/badges/search', 
  authMiddleware,
  validateSearch,
  query('category').optional().isString(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  query('rarity').optional().isIn(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  query('type').optional().isString(),
  validationMiddleware,
  GamificationController.searchBadges
);

router.get('/badges/:badgeId/progress/:userId?', 
  authMiddleware,
  param('badgeId').isMongoId().withMessage('Invalid badge ID'),
  param('userId').optional().isMongoId().withMessage('Invalid user ID'),
  validationMiddleware,
  GamificationController.getUserBadgeProgress
);

// Achievement routes
router.get('/achievements', 
  authMiddleware,
  query('category').optional().isString(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  query('type').optional().isIn(['milestone', 'progression', 'completion', 'mastery', 'social', 'special']),
  query('featured').optional().isBoolean(),
  validationMiddleware,
  GamificationController.getAvailableAchievements
);

router.get('/achievements/search', 
  authMiddleware,
  validateSearch,
  query('category').optional().isString(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  query('type').optional().isIn(['milestone', 'progression', 'completion', 'mastery', 'social', 'special']),
  query('rarity').optional().isIn(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  validationMiddleware,
  GamificationController.searchAchievements
);

router.get('/achievements/:achievementId/progress/:userId?', 
  authMiddleware,
  param('achievementId').isMongoId().withMessage('Invalid achievement ID'),
  param('userId').optional().isMongoId().withMessage('Invalid user ID'),
  validationMiddleware,
  GamificationController.getUserAchievementProgress
);

// Challenge routes
router.get('/challenges', 
  authMiddleware,
  query('userId').optional().isMongoId().withMessage('Invalid user ID'),
  query('category').optional().isString(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  query('type').optional().isIn(['individual', 'team', 'global']),
  query('format').optional().isIn(['quiz', 'assignment', 'project', 'competition', 'creative', 'collaborative']),
  query('featured').optional().isBoolean(),
  validationMiddleware,
  GamificationController.getAvailableChallenges
);

router.get('/challenges/search', 
  authMiddleware,
  validateSearch,
  query('category').optional().isString(),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  query('type').optional().isIn(['individual', 'team', 'global']),
  query('format').optional().isIn(['quiz', 'assignment', 'project', 'competition', 'creative', 'collaborative']),
  validationMiddleware,
  GamificationController.searchChallenges
);

router.post('/challenges/join', 
  authMiddleware, 
  validateChallengeJoin,
  GamificationController.joinChallenge
);

router.post('/challenges/complete', 
  authMiddleware, 
  validateChallengeCompletion,
  GamificationController.completeChallenge
);

// Leaderboard routes
router.get('/leaderboards', 
  authMiddleware,
  query('type').optional().isIn(['points', 'level', 'badges', 'achievements', 'challenges', 'streaks', 'custom']),
  query('category').optional().isString(),
  query('scope').optional().isIn(['global', 'class', 'school', 'region', 'friends', 'team']),
  query('featured').optional().isBoolean(),
  validationMiddleware,
  GamificationController.getLeaderboards
);

router.get('/leaderboards/:leaderboardId', 
  authMiddleware,
  param('leaderboardId').isMongoId().withMessage('Invalid leaderboard ID'),
  validatePagination,
  validationMiddleware,
  GamificationController.getLeaderboard
);

router.get('/leaderboards/positions/:userId?', 
  authMiddleware,
  param('userId').optional().isMongoId().withMessage('Invalid user ID'),
  validationMiddleware,
  GamificationController.getUserLeaderboardPositions
);

router.post('/leaderboards/:leaderboardId/comments', 
  authMiddleware,
  param('leaderboardId').isMongoId().withMessage('Invalid leaderboard ID'),
  validateLeaderboardComment,
  GamificationController.addLeaderboardComment
);

router.post('/leaderboards/:leaderboardId/follow', 
  authMiddleware,
  param('leaderboardId').isMongoId().withMessage('Invalid leaderboard ID'),
  validateLeaderboardAction,
  GamificationController.toggleLeaderboardFollow
);

// Analytics routes
router.get('/analytics', 
  authMiddleware,
  query('type').optional().isIn(['overview', 'badges', 'challenges', 'leaderboards']),
  query('period').optional().isIn(['7d', '30d', '90d', '1y']),
  validationMiddleware,
  GamificationController.getAnalytics
);

export default router;