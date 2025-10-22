import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/authService';
import { UserMongo } from '../models/UserMongo';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/rbac';

/**
 * Register new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    logger.info('MongoDB Registration attempt started:', { email: req.body.email });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Registration validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      email,
      password,
      username,
      role = 'parent',
      firstName,
      lastName,
      age,
      grade,
      language = 'en',
      invitedBy
    } = req.body;

    const result = await authService.register({
      email,
      password,
      username,
      role,
      firstName,
      lastName,
      age,
      grade,
      language,
      invitedBy
    });

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: result.data
      });
    } else {
      return res.status(409).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    logger.info('MongoDB Login attempt started:', { email: req.body.email });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Login validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const result = await authService.login(email, password);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result.data
      });
    } else {
      const statusCode = result.error?.includes('locked') ? 423 : 401;
      return res.status(statusCode).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    });
  }
};

/**
 * Guest login
 */
export const loginAsGuest = async (req: Request, res: Response) => {
  try {
    const { name, grade } = req.body;

    const result = await authService.loginAsGuest(name, grade);

    if (result.success) {
      logger.info(`Guest user logged in: ${name} (Grade: ${grade || 'not specified'})`);
      return res.status(200).json({
        success: true,
        message: 'Guest login successful',
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    logger.error('Guest login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during guest login',
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const result = await authService.refreshToken(refreshToken);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result.data
      });
    } else {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    logger.error('Token refresh error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const result = await authService.verifyEmail(token);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    logger.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: req.user.toSafeObject()
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const result = await authService.updateProfile(req.user._id, req.body);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    logger.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password for verification
    const user = await UserMongo.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};

/**
 * Logout (for token blacklisting)
 */
export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // TODO: Implement token blacklisting in Redis or database
      logger.info(`Token blacklisted for user: ${req.user?.email || 'Unknown'}`);
    }
    
    logger.info(`User logged out: ${req.user?.email || 'Unknown'}`);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to logout',
    });
  }
};

/**
 * Get user's children (for parent accounts)
 */
export const getChildren = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (req.user.role !== 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Only parent accounts can access children data',
      });
    }

    // TODO: Implement relationship system to get actual children
    // For now, return empty array
    return res.status(200).json({
      success: true,
      message: 'Children retrieved successfully',
      data: {
        children: [],
      },
    });
  } catch (error) {
    logger.error('Get children error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve children',
    });
  }
};

/**
 * Get user permissions (from RBAC middleware)
 */
export const getUserPermissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Import here to avoid circular dependency
    const { getUserPermissions: getRBACPermissions } = await import('../middleware/rbac');
    return getRBACPermissions(req, res);
  } catch (error) {
    logger.error('Get user permissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve permissions'
    });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      success: false,
      message: 'Email is required' 
    });
  }

  try {
    // Find user by email
    const user = await UserMongo.findByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset email has been sent.'
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    
    user.security.passwordResetToken = resetToken;
    user.security.passwordResetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // TODO: Send password reset email using emailService
    logger.info('Password reset requested', { 
      userId: user._id, 
      email: user.email 
    });

    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset email has been sent.'
    });
  } catch (error) {
    logger.error('Password reset request failed', { 
      email, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to process password reset request. Please try again.' 
    });
  }
};

/**
 * Reset password using token
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Reset token and new password are required' 
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long' 
    });
  }

  try {
    const user = await UserMongo.findOne({
      'security.passwordResetToken': token,
      'security.passwordResetExpiry': { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password
    user.password = newPassword;
    user.security.passwordResetToken = undefined;
    user.security.passwordResetExpiry = undefined;
    user.security.loginAttempts = 0; // Reset login attempts
    user.security.lockedUntil = undefined;
    await user.save();

    logger.info('Password reset successful', { userId: user._id });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (error) {
    logger.error('Password reset failed', { 
      token: token.substring(0, 10) + '...', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again or request a new reset link.' 
    });
  }
};