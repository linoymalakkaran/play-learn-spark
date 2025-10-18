import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  loginAsGuest,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getChildren,
  requestPasswordReset,
  resetPassword,
} from '../controllers/auth.controller';
import {
  authenticateToken,
  authorizeRoles,
  authRateLimit,
} from '../middleware/auth';

const router = Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters long'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('role')
    .optional()
    .isIn(['parent', 'child', 'educator'])
    .withMessage('Role must be parent, child, or educator'),
  body('grade')
    .optional()
    .isString()
    .withMessage('Grade must be a string'),
  body('language')
    .optional()
    .isIn(['en', 'ar', 'ml', 'es', 'fr'])
    .withMessage('Language must be one of: en, ar, ml, es, fr'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const guestLoginValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('grade')
    .optional()
    .isString()
    .withMessage('Grade must be a string'),
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('age')
    .optional()
    .isInt({ min: 3, max: 12 })
    .withMessage('Age must be between 3 and 12'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  body('preferences.language')
    .optional()
    .isIn(['en', 'ar', 'ml', 'es', 'fr'])
    .withMessage('Language must be one of: en, ar, ml, es, fr'),
  body('preferences.difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('preferences.topics')
    .optional()
    .isArray()
    .withMessage('Topics must be an array'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const passwordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// Public routes (no authentication required)
router.post('/register', authRateLimit(5, 15 * 60 * 1000), registerValidation, register);
router.post('/login', authRateLimit(5, 15 * 60 * 1000), loginValidation, login);
router.post('/guest-login', authRateLimit(10, 15 * 60 * 1000), guestLoginValidation, loginAsGuest);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authRateLimit(3, 15 * 60 * 1000), passwordResetValidation, requestPasswordReset);
router.post('/reset-password', authRateLimit(3, 15 * 60 * 1000), resetPasswordValidation, resetPassword);

// Protected routes (authentication required)
router.use(authenticateToken); // Apply authentication to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.post('/change-password', changePasswordValidation, changePassword);
router.post('/logout', logout);

// Parent-only routes
router.get('/children', authorizeRoles('parent'), getChildren);

// Admin-only routes
router.get('/users', authorizeRoles('admin'), async (req, res) => {
  // TODO: Implement admin user management
  res.status(501).json({
    success: false,
    message: 'Admin user management not yet implemented',
  });
});

export default router;