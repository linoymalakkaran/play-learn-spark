import express from 'express';
import { assignmentController } from '../controllers/assignmentController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Validation middleware
const assignmentValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  
  body('estimatedDuration')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Estimated duration must be between 1 and 1440 minutes'),
  
  body('points.total')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total points must be between 1 and 1000'),
  
  body('activities')
    .isArray({ min: 1 })
    .withMessage('At least one activity is required'),
  
  body('activities.*.activityId')
    .notEmpty()
    .withMessage('Activity ID is required'),
  
  body('activities.*.order')
    .isInt({ min: 1 })
    .withMessage('Activity order must be a positive integer'),
  
  body('audience.type')
    .isIn(['individual', 'class', 'group', 'all'])
    .withMessage('Invalid audience type')
];

const assignmentUpdateValidation = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('estimatedDuration')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Estimated duration must be between 1 and 1440 minutes'),
  
  body('points.total')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Total points must be between 1 and 1000')
];

const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid assignment ID')
];

const studentProgressValidation = [
  param('assignmentId')
    .isMongoId()
    .withMessage('Invalid assignment ID'),
  param('studentId')
    .isMongoId()
    .withMessage('Invalid student ID')
];

// Assignment CRUD Routes
router.post('/',
  authenticateToken,
  assignmentValidation,
  assignmentController.createAssignment
);

router.get('/',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['draft', 'published', 'active', 'completed', 'archived']).withMessage('Invalid status'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format')
  ],
  assignmentController.getAssignments
);

router.get('/:id',
  authenticateToken,
  mongoIdValidation,
  [
    query('populate').optional().isBoolean().withMessage('Populate must be a boolean')
  ],
  assignmentController.getAssignment
);

router.put('/:id',
  authenticateToken,
  mongoIdValidation,
  assignmentUpdateValidation,
  assignmentController.updateAssignment
);

router.delete('/:id',
  authenticateToken,
  mongoIdValidation,
  [
    query('permanent').optional().isBoolean().withMessage('Permanent must be a boolean')
  ],
  assignmentController.deleteAssignment
);

// Assignment Management Routes
router.post('/:id/publish',
  authenticateToken,
  mongoIdValidation,
  assignmentController.publishAssignment
);

router.post('/:id/duplicate',
  authenticateToken,
  mongoIdValidation,
  [
    body('newTitle')
      .notEmpty()
      .withMessage('New title is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('New title must be between 3 and 200 characters')
  ],
  assignmentController.duplicateAssignment
);

// Student Progress Routes
router.get('/:assignmentId/progress/:studentId',
  authenticateToken,
  studentProgressValidation,
  assignmentController.getStudentProgress
);

router.put('/:assignmentId/progress/:studentId',
  authenticateToken,
  studentProgressValidation,
  [
    body('status')
      .optional()
      .isIn(['not-started', 'in-progress', 'completed', 'submitted', 'graded', 'returned'])
      .withMessage('Invalid status'),
    
    body('timing.totalTimeSpent')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Total time spent must be non-negative'),
    
    body('grading.totalScore')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Total score must be between 0 and 100')
  ],
  assignmentController.updateStudentProgress
);

router.post('/:assignmentId/progress/:studentId/activities/:activityId/interactions',
  authenticateToken,
  [
    param('assignmentId').isMongoId().withMessage('Invalid assignment ID'),
    param('studentId').isMongoId().withMessage('Invalid student ID'),
    param('activityId').isMongoId().withMessage('Invalid activity ID'),
    
    body('type')
      .notEmpty()
      .withMessage('Interaction type is required'),
    
    body('timestamp')
      .optional()
      .isISO8601()
      .withMessage('Invalid timestamp format')
  ],
  assignmentController.recordInteraction
);

router.post('/:assignmentId/progress/:studentId/activities/:activityId/submit',
  authenticateToken,
  [
    param('assignmentId').isMongoId().withMessage('Invalid assignment ID'),
    param('studentId').isMongoId().withMessage('Invalid student ID'),
    param('activityId').isMongoId().withMessage('Invalid activity ID'),
    
    body('score')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Score must be between 0 and 100'),
    
    body('responses')
      .optional()
      .isArray()
      .withMessage('Responses must be an array'),
    
    body('timeSpent')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Time spent must be non-negative')
  ],
  assignmentController.submitActivity
);

// Analytics Routes
router.get('/:id/analytics',
  authenticateToken,
  mongoIdValidation,
  [
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format')
  ],
  assignmentController.getAssignmentAnalytics
);

router.get('/:assignmentId/progress/class',
  authenticateToken,
  [
    param('assignmentId').isMongoId().withMessage('Invalid assignment ID'),
    query('classId').optional().isMongoId().withMessage('Invalid class ID')
  ],
  assignmentController.getClassProgress
);

// Template Routes
router.get('/templates/list',
  authenticateToken,
  [
    query('category').optional().isString().withMessage('Category must be a string'),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level'),
    query('subject').optional().isString().withMessage('Subject must be a string')
  ],
  assignmentController.getAssignmentTemplates
);

router.post('/templates/:templateId/create',
  authenticateToken,
  [
    param('templateId').notEmpty().withMessage('Template ID is required'),
    
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    
    body('description')
      .optional()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    
    body('category')
      .optional()
      .isString()
      .withMessage('Category must be a string'),
    
    body('estimatedDuration')
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage('Estimated duration must be between 1 and 1440 minutes'),
    
    body('points')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Points must be between 1 and 1000'),
    
    body('activities')
      .optional()
      .isArray()
      .withMessage('Activities must be an array'),
    
    body('audience.type')
      .optional()
      .isIn(['individual', 'class', 'group', 'all'])
      .withMessage('Invalid audience type')
  ],
  assignmentController.createFromTemplate
);

// Bulk Operations Routes
router.post('/bulk/publish',
  authenticateToken,
  [
    body('assignmentIds')
      .isArray({ min: 1 })
      .withMessage('Assignment IDs array is required'),
    
    body('assignmentIds.*')
      .isMongoId()
      .withMessage('Invalid assignment ID in array')
  ],
  assignmentController.bulkPublish
);

router.post('/bulk/update',
  authenticateToken,
  [
    body('assignmentIds')
      .isArray({ min: 1 })
      .withMessage('Assignment IDs array is required'),
    
    body('assignmentIds.*')
      .isMongoId()
      .withMessage('Invalid assignment ID in array'),
    
    body('updates')
      .isObject()
      .withMessage('Updates object is required')
  ],
  assignmentController.bulkUpdate
);

// Export router
export default router;