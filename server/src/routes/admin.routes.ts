import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getAllUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  getDashboardStats
} from '../controllers/admin.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// User management routes
router.get('/users', getAllUsers);

router.post('/users', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required'),
  body('role')
    .optional()
    .isIn(['admin', 'parent', 'student', 'child'])
    .withMessage('Role must be admin, parent, student, or child'),
  body('subscriptionType')
    .optional()
    .isIn(['free', 'premium', 'family'])
    .withMessage('Subscription type must be free, premium, or family')
], createUser);

router.put('/users/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'parent', 'student', 'child'])
    .withMessage('Role must be admin, parent, student, or child'),
  body('subscriptionType')
    .optional()
    .isIn(['free', 'premium', 'family'])
    .withMessage('Subscription type must be free, premium, or family')
], updateUser);

router.post('/users/:id/reset-password', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
], resetUserPassword);

router.delete('/users/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
], deleteUser);

export default router;