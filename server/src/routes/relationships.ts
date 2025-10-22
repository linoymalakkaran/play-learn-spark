import { Router } from 'express';
import { body, param } from 'express-validator';
import relationshipController from '../controllers/relationshipController';
import { authenticateToken } from '../middleware/auth';
import { checkPermission } from '../middleware/permissionCheck';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route   POST /api/relationships/invite
 * @desc    Create a new relationship invitation
 * @access  Private
 */
router.post('/invite',
  [
    body('recipientEmail')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('relationshipType')
      .isIn(['parent-child', 'teacher-student', 'guardian-child', 'sibling', 'peer'])
      .withMessage('Invalid relationship type'),
    body('message')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Message must be less than 500 characters'),
    body('expiresInHours')
      .optional()
      .isInt({ min: 1, max: 720 })
      .withMessage('Expiration must be between 1 and 720 hours (30 days)')
  ],
  checkPermission('create_invitation'),
  relationshipController.createInvitation
);

/**
 * @route   POST /api/relationships/accept/:invitationCode
 * @desc    Accept a relationship invitation
 * @access  Private
 */
router.post('/accept/:invitationCode',
  [
    param('invitationCode')
      .isLength({ min: 8, max: 8 })
      .withMessage('Invalid invitation code format')
  ],
  checkPermission('accept_invitation'),
  relationshipController.acceptInvitation
);

/**
 * @route   POST /api/relationships/decline/:invitationCode
 * @desc    Decline a relationship invitation
 * @access  Private
 */
router.post('/decline/:invitationCode',
  [
    param('invitationCode')
      .isLength({ min: 8, max: 8 })
      .withMessage('Invalid invitation code format'),
    body('reason')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Reason must be less than 200 characters')
  ],
  checkPermission('accept_invitation'),
  relationshipController.declineInvitation
);

/**
 * @route   GET /api/relationships
 * @desc    Get user's relationships
 * @access  Private
 */
router.get('/',
  checkPermission('view_own_relationships'),
  relationshipController.getUserRelationships
);

/**
 * @route   GET /api/relationships/pending
 * @desc    Get pending invitations for user
 * @access  Private
 */
router.get('/pending',
  checkPermission('view_own_relationships'),
  relationshipController.getPendingInvitations
);

/**
 * @route   GET /api/relationships/invitation/:invitationCode
 * @desc    Get invitation details by code
 * @access  Public (for invitation preview)
 */
router.get('/invitation/:invitationCode',
  [
    param('invitationCode')
      .isLength({ min: 8, max: 8 })
      .withMessage('Invalid invitation code format')
  ],
  relationshipController.getInvitationDetails
);

/**
 * @route   PUT /api/relationships/:relationshipId/permissions
 * @desc    Update relationship permissions
 * @access  Private
 */
router.put('/:relationshipId/permissions',
  [
    param('relationshipId')
      .isMongoId()
      .withMessage('Invalid relationship ID'),
    body('permissions')
      .isObject()
      .withMessage('Permissions must be an object'),
    body('permissions.viewProgress')
      .optional()
      .isBoolean()
      .withMessage('viewProgress must be boolean'),
    body('permissions.viewActivities')
      .optional()
      .isBoolean()
      .withMessage('viewActivities must be boolean'),
    body('permissions.manageActivities')
      .optional()
      .isBoolean()
      .withMessage('manageActivities must be boolean'),
    body('permissions.receiveNotifications')
      .optional()
      .isBoolean()
      .withMessage('receiveNotifications must be boolean'),
    body('permissions.communicateDirectly')
      .optional()
      .isBoolean()
      .withMessage('communicateDirectly must be boolean'),
    body('permissions.viewReports')
      .optional()
      .isBoolean()
      .withMessage('viewReports must be boolean'),
    body('permissions.approveRewards')
      .optional()
      .isBoolean()
      .withMessage('approveRewards must be boolean'),
    body('permissions.setTimeRestrictions')
      .optional()
      .isBoolean()
      .withMessage('setTimeRestrictions must be boolean')
  ],
  checkPermission('manage_own_relationships'),
  relationshipController.updatePermissions
);

/**
 * @route   DELETE /api/relationships/:relationshipId
 * @desc    Remove a relationship
 * @access  Private
 */
router.delete('/:relationshipId',
  [
    param('relationshipId')
      .isMongoId()
      .withMessage('Invalid relationship ID'),
    body('reason')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Reason must be less than 200 characters')
  ],
  checkPermission('manage_own_relationships'),
  relationshipController.removeRelationship
);

/**
 * @route   GET /api/relationships/parent/children
 * @desc    Get parent's children
 * @access  Private (Parents only)
 */
router.get('/parent/children',
  checkPermission('view_child_progress'),
  relationshipController.getParentChildren
);

/**
 * @route   GET /api/relationships/teacher/students
 * @desc    Get teacher's students
 * @access  Private (Teachers only)
 */
router.get('/teacher/students',
  checkPermission('view_student_progress'),
  relationshipController.getTeacherStudents
);

/**
 * @route   GET /api/relationships/stats
 * @desc    Get relationship statistics
 * @access  Private
 */
router.get('/stats',
  checkPermission('view_own_relationships'),
  relationshipController.getRelationshipStats
);

export default router;