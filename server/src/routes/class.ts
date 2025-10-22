import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createClass,
  joinClass,
  getMyClasses,
  getClassById,
  updateClass,
  addStudentToClass,
  approveStudent,
  removeStudentFromClass,
  regenerateJoinCode,
  archiveClass,
  createGroup,
  getClassGroups,
  addMemberToGroup,
  removeMemberFromGroup,
  updateGroup,
  deleteGroup,
  getUserGroups,
  previewClass
} from '../controllers/classController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation middleware for class creation
const createClassValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Class name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('subject')
    .optional()
    .isIn(['math', 'science', 'english', 'history', 'art', 'music', 'physical-education', 'other'])
    .withMessage('Invalid subject'),
  body('gradeLevel')
    .isIn(['pre-k', 'kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', 'mixed'])
    .withMessage('Invalid grade level'),
  body('settings.maxStudents')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max students must be between 1 and 100'),
  body('settings.autoApproval')
    .optional()
    .isBoolean()
    .withMessage('Auto approval must be a boolean'),
  body('settings.allowParentView')
    .optional()
    .isBoolean()
    .withMessage('Allow parent view must be a boolean'),
  body('settings.public')
    .optional()
    .isBoolean()
    .withMessage('Public setting must be a boolean'),
  body('settings.allowLateJoin')
    .optional()
    .isBoolean()
    .withMessage('Allow late join must be a boolean'),
  body('settings.requireApproval')
    .optional()
    .isBoolean()
    .withMessage('Require approval must be a boolean'),
  body('schedule.days')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Schedule days must be a non-empty array'),
  body('schedule.days.*')
    .optional()
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day of week'),
  body('schedule.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('schedule.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('schedule.timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string'),
  body('schedule.recurring')
    .optional()
    .isBoolean()
    .withMessage('Recurring must be a boolean')
];

// Validation middleware for joining class
const joinClassValidation = [
  body('joinCode')
    .trim()
    .isLength({ min: 6, max: 8 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Join code must be 6-8 uppercase alphanumeric characters')
];

// Validation middleware for updating class
const updateClassValidation = [
  param('classId').isMongoId().withMessage('Invalid class ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Class name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('subject')
    .optional()
    .isIn(['math', 'science', 'english', 'history', 'art', 'music', 'physical-education', 'other'])
    .withMessage('Invalid subject'),
  body('gradeLevel')
    .optional()
    .isIn(['pre-k', 'kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', 'mixed'])
    .withMessage('Invalid grade level')
];

// Validation middleware for adding student to class
const addStudentValidation = [
  param('classId').isMongoId().withMessage('Invalid class ID'),
  body('studentId').isMongoId().withMessage('Invalid student ID')
];

// Validation middleware for MongoDB ObjectId parameters
const mongoIdValidation = [
  param('classId').isMongoId().withMessage('Invalid class ID')
];

const studentIdValidation = [
  param('classId').isMongoId().withMessage('Invalid class ID'),
  param('studentId').isMongoId().withMessage('Invalid student ID')
];

// Validation middleware for group creation
const createGroupValidation = [
  param('classId').isMongoId().withMessage('Invalid class ID'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Group name must be between 1 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters'),
  body('type')
    .isIn(['study-group', 'project-team', 'reading-circle', 'skill-level', 'custom'])
    .withMessage('Invalid group type'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array'),
  body('members.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid member ID'),
  body('settings.maxMembers')
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage('Max members must be between 2 and 20'),
  body('settings.allowSelfJoin')
    .optional()
    .isBoolean()
    .withMessage('Allow self join must be a boolean'),
  body('settings.requireApproval')
    .optional()
    .isBoolean()
    .withMessage('Require approval must be a boolean'),
  body('settings.isPrivate')
    .optional()
    .isBoolean()
    .withMessage('Is private must be a boolean'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color code')
];

// Validation middleware for group operations
const groupIdValidation = [
  param('groupId').isMongoId().withMessage('Invalid group ID')
];

const groupMemberValidation = [
  param('groupId').isMongoId().withMessage('Invalid group ID'),
  param('userId').isMongoId().withMessage('Invalid user ID')
];

const addGroupMemberValidation = [
  param('groupId').isMongoId().withMessage('Invalid group ID'),
  body('userId').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['member', 'leader', 'helper'])
    .withMessage('Invalid role')
];

// Class Routes
router.post('/', authenticateToken, createClassValidation, createClass as any);
router.post('/join', authenticateToken, joinClassValidation, joinClass as any);
router.post('/preview', authenticateToken, [
  body('joinCode')
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Join code must be between 6 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Join code should only contain uppercase letters and numbers')
], previewClass as any);
router.get('/my-classes', authenticateToken, getMyClasses as any);
router.get('/:classId', authenticateToken, mongoIdValidation, getClassById as any);
router.put('/:classId', authenticateToken, updateClassValidation, updateClass as any);
router.post('/:classId/students', authenticateToken, addStudentValidation, addStudentToClass as any);
router.put('/:classId/students/:studentId/approve', authenticateToken, studentIdValidation, approveStudent as any);
router.delete('/:classId/students/:studentId', authenticateToken, studentIdValidation, removeStudentFromClass as any);
router.post('/:classId/regenerate-code', authenticateToken, mongoIdValidation, regenerateJoinCode as any);
router.post('/:classId/archive', authenticateToken, mongoIdValidation, archiveClass as any);

// Group Routes
router.post('/:classId/groups', authenticateToken, createGroupValidation, createGroup as any);
router.get('/:classId/groups', authenticateToken, mongoIdValidation, getClassGroups as any);
router.post('/groups/:groupId/members', authenticateToken, addGroupMemberValidation, addMemberToGroup as any);
router.delete('/groups/:groupId/members/:userId', authenticateToken, groupMemberValidation, removeMemberFromGroup as any);
router.put('/groups/:groupId', authenticateToken, groupIdValidation, updateGroup as any);
router.delete('/groups/:groupId', authenticateToken, groupIdValidation, deleteGroup as any);
router.get('/my-groups', authenticateToken, getUserGroups as any);

export default router;