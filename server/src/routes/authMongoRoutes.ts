import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  loginAsGuest,
  refreshToken,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getChildren,
  getUserPermissions,
  requestPasswordReset,
  resetPassword
} from '../controllers/authMongoController';
import { authenticateTokenMongo, checkPermission } from '../middleware/rbac';

const router = Router();

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('username')
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
  body('role')
    .optional()
    .isIn(['parent', 'child', 'educator', 'admin'])
    .withMessage('Invalid role'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be under 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be under 50 characters'),
  body('age')
    .optional()
    .isInt({ min: 1, max: 150 })
    .withMessage('Age must be between 1 and 150'),
  body('grade')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Grade must be a string under 20 characters'),
  body('language')
    .optional()
    .isIn(['en', 'ar', 'ml', 'es', 'fr'])
    .withMessage('Invalid language')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .notEmpty()
    .withMessage('Password required')
];

const guestLoginValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name is required and must be under 50 characters'),
  body('grade')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Grade must be a string under 20 characters')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be under 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be under 50 characters'),
  body('age')
    .optional()
    .isInt({ min: 1, max: 150 })
    .withMessage('Age must be between 1 and 150'),
  body('grade')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Grade must be a string under 20 characters'),
  body('bio')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be under 500 characters'),
  body('language')
    .optional()
    .isIn(['en', 'ar', 'ml', 'es', 'fr'])
    .withMessage('Invalid language'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  body('topics')
    .optional()
    .isArray()
    .withMessage('Topics must be an array')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const passwordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Public routes (no authentication required)
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/guest-login', guestLoginValidation, loginAsGuest);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', body('token').notEmpty(), verifyEmail);
router.post('/request-password-reset', passwordResetValidation, requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Protected routes (authentication required)
router.get('/profile', authenticateTokenMongo, getProfile);
router.put('/profile', authenticateTokenMongo, updateProfileValidation, updateProfile);
router.post('/change-password', authenticateTokenMongo, changePasswordValidation, changePassword);
router.post('/logout', authenticateTokenMongo, logout);

// Permission-based routes
router.get('/permissions', authenticateTokenMongo, getUserPermissions);

// Parent-specific routes
router.get('/children', 
  authenticateTokenMongo, 
  checkPermission('progress', 'view_child'), 
  getChildren
);

// Role-based routes examples (for future use)
router.get('/admin/users', 
  authenticateTokenMongo, 
  checkPermission('user', 'view_all'),
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Admin user management not yet implemented'
    });
  }
);

router.post('/educator/classes', 
  authenticateTokenMongo, 
  checkPermission('class', 'create'),
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Class creation not yet implemented'
    });
  }
);

export default router;