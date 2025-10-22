/**
 * Content Routes - RESTful API Endpoints
 * 
 * Comprehensive routing configuration for content management
 * with validation, authentication, and RBAC integration.
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateJWT } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import contentController from '../controllers/contentController.js';

const router = express.Router();

/**
 * Validation Middleware
 */

// Content creation validation
const validateContentCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('contentType')
    .isIn(['lesson', 'activity', 'assessment', 'video', 'article', 'interactive', 'quiz', 'game'])
    .withMessage('Invalid content type'),
  
  body('subject')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject must be between 2 and 100 characters'),
  
  body('gradeLevel')
    .isArray({ min: 1 })
    .withMessage('At least one grade level is required'),
  
  body('gradeLevel.*')
    .isIn(['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Higher Education'])
    .withMessage('Invalid grade level'),
  
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  body('ageRange.min')
    .optional()
    .isInt({ min: 3, max: 25 })
    .withMessage('Minimum age must be between 3 and 25'),
  
  body('ageRange.max')
    .optional()
    .isInt({ min: 3, max: 25 })
    .withMessage('Maximum age must be between 3 and 25'),
  
  body('estimatedDuration')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Estimated duration must be between 1 and 300 minutes'),
  
  body('language')
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage('Language code must be between 2 and 10 characters'),
  
  body('tags')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 tags allowed'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each tag must be between 2 and 50 characters'),
  
  body('categories')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 categories allowed'),
  
  body('categories.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Each category must be between 2 and 100 characters'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'organization', 'restricted'])
    .withMessage('Invalid visibility setting'),
  
  body('allowComments')
    .optional()
    .isBoolean()
    .withMessage('Allow comments must be a boolean'),
  
  body('allowSharing')
    .optional()
    .isBoolean()
    .withMessage('Allow sharing must be a boolean'),
  
  body('prerequisites')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 prerequisites allowed'),
];

// Content update validation (similar to creation but all fields optional)
const validateContentUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('contentType')
    .optional()
    .isIn(['lesson', 'activity', 'assessment', 'video', 'article', 'interactive', 'quiz', 'game'])
    .withMessage('Invalid content type'),
  
  body('subject')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject must be between 2 and 100 characters'),
  
  body('gradeLevel')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one grade level is required'),
  
  body('gradeLevel.*')
    .optional()
    .isIn(['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Higher Education'])
    .withMessage('Invalid grade level'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  body('status')
    .optional()
    .isIn(['draft', 'review', 'published', 'archived'])
    .withMessage('Invalid status'),
];

// Collection validation
const validateCollectionCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('type')
    .isIn(['course', 'curriculum', 'playlist', 'assessment_series', 'learning_path'])
    .withMessage('Invalid collection type'),
  
  body('subject')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject must be between 2 and 100 characters'),
  
  body('gradeLevel')
    .optional()
    .isArray()
    .withMessage('Grade level must be an array'),
  
  body('estimatedDuration')
    .optional()
    .isInt({ min: 1, max: 10080 })
    .withMessage('Estimated duration must be between 1 and 10080 minutes (1 week)'),
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

const validateContentId = [
  param('contentId')
    .isMongoId()
    .withMessage('Invalid content ID format'),
];

/**
 * Content CRUD Routes
 */

// Create new content
router.post('/',
  authenticateJWT,
  requirePermission('content.create', 'write'),
  validateContentCreation,
  contentController.createContent
);

// Get content by ID
router.get('/:id',
  validateObjectId,
  contentController.getContentById
);

// Search content with filters
router.get('/',
  // Query parameter validation
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['title', 'createdAt', 'updatedAt', 'publishedAt', 'rating', 'views'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('gradeLevel')
    .optional()
    .custom((value) => {
      if (value) {
        const levels = value.split(',');
        const validLevels = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Higher Education'];
        return levels.every((level: string) => validLevels.includes(level.trim()));
      }
      return true;
    })
    .withMessage('Invalid grade level values'),
  
  query('contentType')
    .optional()
    .isIn(['lesson', 'activity', 'assessment', 'video', 'article', 'interactive', 'quiz', 'game'])
    .withMessage('Invalid content type'),
  
  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  query('status')
    .optional()
    .isIn(['draft', 'review', 'published', 'archived'])
    .withMessage('Invalid status'),
  
  contentController.searchContent
);

// Update content
router.put('/:id',
  authenticateJWT,
  validateObjectId,
  validateContentUpdate,
  contentController.updateContent
);

// Delete content
router.delete('/:id',
  authenticateJWT,
  requirePermission('content.delete', 'write'),
  validateObjectId,
  contentController.deleteContent
);

// Publish content
router.post('/:id/publish',
  authenticateJWT,
  requirePermission('content.publish', 'write'),
  validateObjectId,
  contentController.publishContent
);

/**
 * Lesson-specific Routes
 */

// Get lesson structure
router.get('/:id/lesson',
  validateObjectId,
  contentController.getLessonStructure
);

// Update lesson structure
router.put('/:id/lesson',
  authenticateJWT,
  requirePermission('content.edit', 'write'),
  validateObjectId,
  
  // Lesson structure validation
  body('structure.learningObjectives')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 learning objectives allowed'),
  
  body('structure.sections')
    .optional()
    .isArray({ max: 50 })
    .withMessage('Maximum 50 sections allowed'),
  
  body('structure.sections.*.title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Section title must be between 3 and 200 characters'),
  
  body('structure.sections.*.type')
    .optional()
    .isIn(['text', 'video', 'interactive', 'quiz', 'activity', 'discussion'])
    .withMessage('Invalid section type'),
  
  body('adaptiveSettings.enabled')
    .optional()
    .isBoolean()
    .withMessage('Adaptive enabled must be a boolean'),
  
  contentController.updateLessonStructure
);

/**
 * Activity-specific Routes
 */

// Get activity configuration
router.get('/:id/activity',
  validateObjectId,
  contentController.getActivityConfiguration
);

// Update activity configuration
router.put('/:id/activity',
  authenticateJWT,
  requirePermission('content.edit', 'write'),
  validateObjectId,
  
  // Activity configuration validation
  body('activityType')
    .optional()
    .isIn(['quiz', 'puzzle', 'simulation', 'game', 'exercise', 'experiment', 'survey'])
    .withMessage('Invalid activity type'),
  
  body('gameSettings.gameType')
    .optional()
    .isIn(['memory', 'matching', 'sorting', 'puzzle', 'adventure', 'trivia', 'strategy'])
    .withMessage('Invalid game type'),
  
  body('assessmentSettings.gradingType')
    .optional()
    .isIn(['automatic', 'manual', 'peer', 'self'])
    .withMessage('Invalid grading type'),
  
  body('assessmentSettings.maxAttempts')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Max attempts must be between 1 and 10'),
  
  contentController.updateActivityConfiguration
);

/**
 * Content Collection Routes
 */

// Create content collection
router.post('/collections',
  authenticateJWT,
  requirePermission('content.create', 'write'),
  validateCollectionCreation,
  contentController.createContentCollection
);

// Get content collection by ID
router.get('/collections/:id',
  validateObjectId,
  contentController.getContentCollectionById
);

// Add content to collection
router.post('/collections/:id/items',
  authenticateJWT,
  requirePermission('content.edit', 'write'),
  validateObjectId,
  
  body('contentId')
    .isMongoId()
    .withMessage('Invalid content ID'),
  
  body('order')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Order must be between 1 and 1000'),
  
  body('required')
    .optional()
    .isBoolean()
    .withMessage('Required must be a boolean'),
  
  body('estimatedTime')
    .optional()
    .isInt({ min: 1, max: 600 })
    .withMessage('Estimated time must be between 1 and 600 minutes'),
  
  contentController.addContentToCollection
);

/**
 * Analytics Routes
 */

// Get content analytics
router.get('/:contentId/analytics',
  authenticateJWT,
  requirePermission('analytics.view', 'read'),
  validateContentId,
  
  query('timeRange')
    .optional()
    .custom((value) => {
      if (value) {
        try {
          const parsed = JSON.parse(value);
          return parsed.start && parsed.end && 
                 new Date(parsed.start).getTime() < new Date(parsed.end).getTime();
        } catch {
          return false;
        }
      }
      return true;
    })
    .withMessage('Invalid time range format'),
  
  contentController.getContentAnalytics
);

/**
 * Bulk Operations Routes
 */

// Bulk update content status
router.patch('/bulk/status',
  authenticateJWT,
  requirePermission('content.manage', 'write'),
  
  body('contentIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('Content IDs array must contain 1-100 items'),
  
  body('contentIds.*')
    .isMongoId()
    .withMessage('All content IDs must be valid MongoDB ObjectIds'),
  
  body('status')
    .isIn(['draft', 'review', 'published', 'archived'])
    .withMessage('Invalid status'),
  
  contentController.bulkUpdateContentStatus
);

// Export router
export default router;