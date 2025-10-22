import express from 'express';
import { AssessmentController } from '../controllers/assessmentController';
import { authenticateToken } from '../middleware/auth';
import { body, query, param } from 'express-validator';
import { validationMiddleware } from '../middleware/validation';

const router = express.Router();

// Validation middleware
const validateAssessmentCreation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('type')
    .isIn(['quiz', 'test', 'exam', 'practice', 'assignment', 'survey'])
    .withMessage('Invalid assessment type'),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required'),
  body('grade')
    .notEmpty()
    .withMessage('Grade is required'),
  body('topic')
    .isArray({ min: 1 })
    .withMessage('At least one topic is required'),
  validationMiddleware
];

const validateAssessmentUpdate = [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('type')
    .optional()
    .isIn(['quiz', 'test', 'exam', 'practice', 'assignment', 'survey'])
    .withMessage('Invalid assessment type'),
  validationMiddleware
];

const validateSessionCreation = [
  body('deviceInfo')
    .optional()
    .isObject()
    .withMessage('Device info must be an object'),
  body('accessCode')
    .optional()
    .isString()
    .withMessage('Access code must be a string'),
  validationMiddleware
];

const validateAnswerSubmission = [
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required'),
  body('timeSpent')
    .isNumeric()
    .withMessage('Time spent must be a number')
    .custom((value) => value >= 0)
    .withMessage('Time spent must be non-negative'),
  body('attempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Attempts must be a positive integer'),
  validationMiddleware
];

const validateNavigation = [
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required'),
  validationMiddleware
];

const validateSecurityEvent = [
  body('type')
    .isIn(['tab_switch', 'window_blur', 'right_click', 'copy_paste', 'screenshot', 'fullscreen_exit', 'network_change', 'suspicious_activity'])
    .withMessage('Invalid security event type'),
  body('details')
    .optional()
    .isObject()
    .withMessage('Details must be an object'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  validationMiddleware
];

const validateSearch = [
  query('q')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),
  query('subject')
    .optional()
    .isString()
    .withMessage('Subject filter must be a string'),
  query('grade')
    .optional()
    .isString()
    .withMessage('Grade filter must be a string'),
  query('type')
    .optional()
    .isIn(['quiz', 'test', 'exam', 'practice', 'assignment', 'survey'])
    .withMessage('Invalid type filter'),
  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty filter'),
  query('category')
    .optional()
    .isString()
    .withMessage('Category filter must be a string'),
  query('published')
    .optional()
    .isBoolean()
    .withMessage('Published filter must be a boolean'),
  query('myAssessments')
    .optional()
    .isBoolean()
    .withMessage('MyAssessments filter must be a boolean'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
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

const validateObjectId = [
  param('assessmentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid assessment ID'),
  param('sessionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid session ID'),
  param('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  validationMiddleware
];

// Assessment management routes
router.post('/', 
  authenticateToken, 
  validateAssessmentCreation,
  AssessmentController.createAssessment
);

router.get('/search', 
  authenticateToken,
  validateSearch,
  AssessmentController.searchAssessments
);

router.get('/user/:userId?', 
  authenticateToken,
  validateObjectId,
  validatePagination,
  query('status').optional().isIn(['published', 'draft']).withMessage('Invalid status filter'),
  validationMiddleware,
  AssessmentController.getUserAssessments
);

router.get('/:assessmentId', 
  authenticateToken,
  validateObjectId,
  AssessmentController.getAssessment
);

router.put('/:assessmentId', 
  authenticateToken,
  validateObjectId,
  validateAssessmentUpdate,
  AssessmentController.updateAssessment
);

router.delete('/:assessmentId', 
  authenticateToken,
  validateObjectId,
  AssessmentController.deleteAssessment
);

router.post('/:assessmentId/publish', 
  authenticateToken,
  validateObjectId,
  AssessmentController.publishAssessment
);

router.post('/:assessmentId/clone', 
  authenticateToken,
  validateObjectId,
  AssessmentController.cloneAssessment
);

router.get('/:assessmentId/export', 
  authenticateToken,
  validateObjectId,
  AssessmentController.exportAssessment
);

router.post('/import', 
  authenticateToken,
  body('title').notEmpty().withMessage('Title is required in import data'),
  body('type').isIn(['quiz', 'test', 'exam', 'practice', 'assignment', 'survey']).withMessage('Invalid type in import data'),
  validationMiddleware,
  AssessmentController.importAssessment
);

// Session management routes
router.post('/:assessmentId/sessions', 
  authenticateToken,
  validateObjectId,
  validateSessionCreation,
  AssessmentController.createSession
);

router.post('/sessions/:sessionId/start', 
  authenticateToken,
  validateObjectId,
  AssessmentController.startSession
);

router.get('/sessions/:sessionId', 
  authenticateToken,
  validateObjectId,
  AssessmentController.getSession
);

router.post('/sessions/:sessionId/answers', 
  authenticateToken,
  validateObjectId,
  validateAnswerSubmission,
  AssessmentController.submitAnswer
);

router.post('/sessions/:sessionId/navigate', 
  authenticateToken,
  validateObjectId,
  validateNavigation,
  AssessmentController.navigateToQuestion
);

router.post('/sessions/:sessionId/pause', 
  authenticateToken,
  validateObjectId,
  AssessmentController.pauseSession
);

router.post('/sessions/:sessionId/resume', 
  authenticateToken,
  validateObjectId,
  AssessmentController.resumeSession
);

router.post('/sessions/:sessionId/submit', 
  authenticateToken,
  validateObjectId,
  AssessmentController.submitSession
);

router.get('/sessions/:sessionId/results', 
  authenticateToken,
  validateObjectId,
  AssessmentController.getSessionResults
);

router.post('/sessions/:sessionId/security-events', 
  authenticateToken,
  validateObjectId,
  validateSecurityEvent,
  AssessmentController.addSecurityEvent
);

// User sessions routes
router.get('/users/:userId/sessions', 
  authenticateToken,
  validateObjectId,
  validatePagination,
  query('status').optional().isIn(['not_started', 'in_progress', 'paused', 'completed', 'submitted', 'timed_out', 'terminated', 'under_review', 'graded']).withMessage('Invalid status filter'),
  query('assessmentId').optional().isMongoId().withMessage('Invalid assessment ID'),
  validationMiddleware,
  AssessmentController.getUserSessions
);

// Analytics routes
router.get('/:assessmentId/analytics', 
  authenticateToken,
  validateObjectId,
  AssessmentController.getAssessmentAnalytics
);

export default router;