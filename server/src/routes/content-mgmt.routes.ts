import { Router } from 'express';
import { body, query, param } from 'express-validator';
import {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getCategories,
  cloneActivity,
  bulkOperations
} from '../controllers/content.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/', getAllActivities);
router.get('/activities', getAllActivities);
router.get('/categories', getCategories);

// All other routes require authentication
router.use(authenticateToken);

// Validation middleware
const createActivityValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('ageRange')
    .optional()
    .matches(/^\d+-\d+$/)
    .withMessage('Age range must be in format "min-max" (e.g., "6-12")'),
  body('estimatedTime')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Estimated time must be between 1 and 180 minutes'),
  body('tags')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string' && tag.length <= 30);
      }
      return typeof value === 'string' && value.length <= 30;
    })
    .withMessage('Tags must be strings with max 30 characters each'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const updateActivityValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Activity ID must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('estimatedTime')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Estimated time must be between 1 and 180 minutes')
];

const bulkOperationValidation = [
  body('operation')
    .isIn(['delete', 'update', 'publish', 'unpublish'])
    .withMessage('Operation must be delete, update, publish, or unpublish'),
  body('activityIds')
    .isArray({ min: 1 })
    .withMessage('Activity IDs must be a non-empty array'),
  body('activityIds.*')
    .isInt({ min: 1 })
    .withMessage('All activity IDs must be positive integers')
];

// Content creation routes (educators, parents, admin)
router.post('/activities', 
  authorizeRoles('admin', 'educator', 'parent'), 
  createActivityValidation, 
  createActivity
);

router.post('/activities/:id/clone', 
  authorizeRoles('admin', 'educator', 'parent'),
  param('id').isInt({ min: 1 }).withMessage('Activity ID must be a positive integer'),
  cloneActivity
);

// Content editing routes (creator or admin only - enforced in controller)
router.put('/activities/:id', updateActivityValidation, updateActivity);
router.delete('/activities/:id', 
  param('id').isInt({ min: 1 }).withMessage('Activity ID must be a positive integer'),
  deleteActivity
);

// Bulk operations (admin and content creators)
router.post('/activities/bulk', 
  authorizeRoles('admin', 'educator', 'parent'),
  bulkOperationValidation,
  bulkOperations
);

// Admin-only routes
router.get('/admin/activities', 
  authorizeRoles('admin'), 
  getAllActivities
);

router.post('/admin/activities/bulk-approve', 
  authorizeRoles('admin'),
  body('activityIds').isArray({ min: 1 }).withMessage('Activity IDs required'),
  async (req, res) => {
    // Auto-approve activities for publishing
    req.body.operation = 'publish';
    return bulkOperations(req, res);
  }
);

// Content moderation routes
router.get('/moderation/pending', 
  authorizeRoles('admin', 'educator'),
  async (req, res) => {
    // Get activities pending review
    req.query.isPublic = 'false';
    return getAllActivities(req, res);
  }
);

export default router;