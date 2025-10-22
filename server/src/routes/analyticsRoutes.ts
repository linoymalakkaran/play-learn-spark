import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Analytics validation schemas
const generateAnalyticsValidation = [
  body('entityType')
    .isIn(['user', 'assignment', 'activity', 'conversation', 'class', 'course', 'system'])
    .withMessage('Invalid entity type'),
  body('entityId')
    .isMongoId()
    .withMessage('Invalid entity ID'),
  body('periodType')
    .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'])
    .withMessage('Invalid period type'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('includePredictions')
    .optional()
    .isBoolean()
    .withMessage('includePredictions must be boolean'),
  body('includeComparisons')
    .optional()
    .isBoolean()
    .withMessage('includeComparisons must be boolean'),
  body('includeInsights')
    .optional()
    .isBoolean()
    .withMessage('includeInsights must be boolean'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string')
];

const addInsightValidation = [
  body('type')
    .isIn(['achievement', 'concern', 'opportunity', 'recommendation', 'milestone'])
    .withMessage('Invalid insight type'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('category')
    .isIn(['engagement', 'performance', 'learning', 'collaboration', 'behavioral'])
    .withMessage('Invalid category'),
  body('title')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('impact')
    .isIn(['positive', 'negative', 'neutral'])
    .withMessage('Invalid impact type'),
  body('evidence')
    .optional()
    .isArray()
    .withMessage('Evidence must be an array'),
  body('actionItems')
    .optional()
    .isArray()
    .withMessage('Action items must be an array'),
  body('confidence')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Confidence must be between 0 and 100')
];

const updateTrendValidation = [
  body('type')
    .isIn(['engagement', 'performance', 'learning', 'usage'])
    .withMessage('Invalid trend type'),
  body('data')
    .isObject()
    .withMessage('Data must be an object'),
  body('data.date')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('data.value')
    .optional()
    .isNumeric()
    .withMessage('Value must be numeric'),
  body('data.score')
    .optional()
    .isNumeric()
    .withMessage('Score must be numeric')
];

const generateVisualizationValidation = [
  body('type')
    .isIn(['line', 'bar', 'pie', 'scatter', 'heatmap', 'radar', 'funnel'])
    .withMessage('Invalid visualization type'),
  body('category')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Category is required'),
  body('customData')
    .optional()
    .isObject()
    .withMessage('Custom data must be an object')
];

const shareAnalyticsValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
];

const bulkGenerateValidation = [
  body('entities')
    .isArray({ min: 1 })
    .withMessage('Entities array is required and must not be empty'),
  body('entities.*.type')
    .isIn(['user', 'assignment', 'activity', 'conversation', 'class', 'course'])
    .withMessage('Invalid entity type'),
  body('entities.*.id')
    .isMongoId()
    .withMessage('Invalid entity ID'),
  body('periodType')
    .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid period type'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date format')
];

// Report validation schemas
const createReportValidation = [
  body('title')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('type')
    .isIn(['dashboard', 'summary', 'detailed', 'comparative', 'predictive', 'custom'])
    .withMessage('Invalid report type'),
  body('category')
    .isIn(['academic', 'engagement', 'performance', 'behavioral', 'administrative', 'financial'])
    .withMessage('Invalid report category'),
  body('scope')
    .isObject()
    .withMessage('Scope is required'),
  body('scope.entityType')
    .isIn(['user', 'class', 'course', 'department', 'institution', 'system'])
    .withMessage('Invalid scope entity type'),
  body('scope.entityIds')
    .isArray()
    .withMessage('Entity IDs must be an array'),
  body('structure')
    .isObject()
    .withMessage('Structure is required'),
  body('structure.sections')
    .isArray({ min: 1 })
    .withMessage('At least one section is required')
];

const addCollaboratorValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .isIn(['viewer', 'editor', 'admin'])
    .withMessage('Invalid role'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
];

const addFeedbackValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Comment must be maximum 1000 characters'),
  body('helpful')
    .optional()
    .isBoolean()
    .withMessage('Helpful must be boolean'),
  body('suggestions')
    .optional()
    .isArray()
    .withMessage('Suggestions must be an array')
];

// ANALYTICS ROUTES

// Generate analytics
router.post(
  '/generate',
  auth,
  generateAnalyticsValidation,
  validateRequest,
  analyticsController.generateAnalytics
);

// Get analytics by ID
router.get(
  '/:id',
  auth,
  param('id').isMongoId().withMessage('Invalid analytics ID'),
  validateRequest,
  analyticsController.getAnalytics
);

// Get analytics for entity
router.get(
  '/entity/:entityType/:entityId',
  auth,
  param('entityType').isIn(['user', 'assignment', 'activity', 'conversation', 'class', 'course', 'system']),
  param('entityId').isMongoId(),
  query('periodType').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 }),
  validateRequest,
  analyticsController.getEntityAnalytics
);

// Update analytics
router.put(
  '/:id',
  auth,
  param('id').isMongoId().withMessage('Invalid analytics ID'),
  body('includePredictions').optional().isBoolean(),
  body('includeComparisons').optional().isBoolean(),
  body('includeInsights').optional().isBoolean(),
  validateRequest,
  analyticsController.updateAnalytics
);

// Delete analytics
router.delete(
  '/:id',
  auth,
  param('id').isMongoId().withMessage('Invalid analytics ID'),
  validateRequest,
  analyticsController.deleteAnalytics
);

// Add insight
router.post(
  '/:id/insights',
  auth,
  param('id').isMongoId().withMessage('Invalid analytics ID'),
  addInsightValidation,
  validateRequest,
  analyticsController.addInsight
);

// Update trend
router.put(
  '/:id/trends',
  auth,
  param('id').isMongoId().withMessage('Invalid analytics ID'),
  updateTrendValidation,
  validateRequest,
  analyticsController.updateTrend
);

// Generate visualization
router.post(
  '/:id/visualizations',
  auth,
  param('id').isMongoId().withMessage('Invalid analytics ID'),
  generateVisualizationValidation,
  validateRequest,
  analyticsController.generateVisualization
);

// Share analytics
router.post(
  '/:id/share',
  auth,
  param('id').isMongoId().withMessage('Invalid analytics ID'),
  shareAnalyticsValidation,
  validateRequest,
  analyticsController.shareAnalytics
);

// Calculate engagement score
router.get(
  '/:id/scores',
  auth,
  param('id').isMongoId().withMessage('Invalid analytics ID'),
  validateRequest,
  analyticsController.calculateEngagementScore
);

// Get benchmark data
router.get(
  '/benchmarks/:entityType/:periodType',
  auth,
  param('entityType').isIn(['user', 'assignment', 'activity', 'conversation', 'class', 'course', 'system']),
  param('periodType').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  query('departments').optional().isString(),
  validateRequest,
  analyticsController.getBenchmarkData
);

// Generate system report
router.post(
  '/system/report',
  auth,
  body('startDate').isISO8601().withMessage('Invalid start date format'),
  body('endDate').isISO8601().withMessage('Invalid end date format'),
  body('departments').optional().isArray().withMessage('Departments must be an array'),
  validateRequest,
  analyticsController.generateSystemReport
);

// Bulk generate analytics
router.post(
  '/bulk/generate',
  auth,
  bulkGenerateValidation,
  validateRequest,
  analyticsController.bulkGenerateAnalytics
);

// Get dashboard data
router.get(
  '/dashboard/data',
  auth,
  query('entityType').optional().isIn(['user', 'assignment', 'activity', 'conversation', 'class', 'course', 'system']),
  query('entityId').optional().isMongoId(),
  query('periodType').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  validateRequest,
  analyticsController.getDashboardData
);

// Cleanup old analytics (admin only)
router.post(
  '/cleanup',
  auth,
  body('daysToKeep').optional().isInt({ min: 30, max: 3650 }).withMessage('Days to keep must be between 30 and 3650'),
  validateRequest,
  analyticsController.cleanupOldAnalytics
);

// REPORT ROUTES

// Create report
router.post(
  '/reports',
  auth,
  createReportValidation,
  validateRequest,
  analyticsController.createReport
);

// Get report by ID
router.get(
  '/reports/:id',
  auth,
  param('id').isMongoId().withMessage('Invalid report ID'),
  validateRequest,
  analyticsController.getReport
);

// Get user reports
router.get(
  '/reports/user/mine',
  auth,
  query('includeShared').optional().isIn(['true', 'false']),
  validateRequest,
  analyticsController.getUserReports
);

// Get reports by category
router.get(
  '/reports/category/:category',
  auth,
  param('category').isIn(['academic', 'engagement', 'performance', 'behavioral', 'administrative', 'financial']),
  query('departments').optional().isString(),
  validateRequest,
  analyticsController.getReportsByCategory
);

// Search reports
router.get(
  '/reports/search',
  auth,
  query('query').optional().isString(),
  query('type').optional().isIn(['dashboard', 'summary', 'detailed', 'comparative', 'predictive', 'custom']),
  query('category').optional().isIn(['academic', 'engagement', 'performance', 'behavioral', 'administrative', 'financial']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validateRequest,
  analyticsController.searchReports
);

// Update report
router.put(
  '/reports/:id',
  auth,
  param('id').isMongoId().withMessage('Invalid report ID'),
  validateRequest,
  analyticsController.updateReport
);

// Delete report
router.delete(
  '/reports/:id',
  auth,
  param('id').isMongoId().withMessage('Invalid report ID'),
  validateRequest,
  analyticsController.deleteReport
);

// Generate report data
router.post(
  '/reports/:id/generate',
  auth,
  param('id').isMongoId().withMessage('Invalid report ID'),
  validateRequest,
  analyticsController.generateReportData
);

// Add collaborator to report
router.post(
  '/reports/:id/collaborators',
  auth,
  param('id').isMongoId().withMessage('Invalid report ID'),
  addCollaboratorValidation,
  validateRequest,
  analyticsController.addReportCollaborator
);

// Add feedback to report
router.post(
  '/reports/:id/feedback',
  auth,
  param('id').isMongoId().withMessage('Invalid report ID'),
  addFeedbackValidation,
  validateRequest,
  analyticsController.addReportFeedback
);

// Export report
router.get(
  '/reports/:id/export',
  auth,
  param('id').isMongoId().withMessage('Invalid report ID'),
  query('format').optional().isIn(['pdf', 'excel', 'csv', 'json', 'html']),
  validateRequest,
  analyticsController.exportReport
);

// Get scheduled reports (admin only)
router.get(
  '/reports/scheduled/list',
  auth,
  analyticsController.getScheduledReports
);

// Error handling middleware
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Analytics route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in analytics routes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default router;