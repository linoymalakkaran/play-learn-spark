import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Session } from '../models/Session';
import { PasswordReset } from '../models/PasswordReset';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';
import { emailService } from '../services/emailService';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { tokenBlacklist } from '../utils/tokenBlacklist';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Registration attempt started:', { email: req.body.email });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Registration validation errors:', errors.array());
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
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
    } = req.body;

    // Check if user already exists by email
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
      return;
    }

    // Check if user already exists by username
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      res.status(409).json({
        success: false,
        message: 'Username is already taken',
      });
      return;
    }

    // Create new user
    const user = await User.createUser({
      email,
      password,
      username,
      role,
      firstName,
      lastName,
      age,
      grade,
      isGuest: false,
      language,
      difficulty: age && age <= 4 ? 'easy' : 'medium',
      topics: [], // Empty array
      totalActivitiesCompleted: 0,
      currentLevel: 1,
      totalPoints: 0,
      badges: [], // Empty array
      streakDays: 0,
      lastActiveDate: new Date(),
      subscriptionType: 'free',
      features: ['basic_activities', 'progress_tracking'], // Array
      emailVerified: false,
      lastLogin: new Date(),
      loginAttempts: 0,
      childrenIds: [], // Empty array
    });

    // Generate tokens
    const accessToken = generateToken(user as IUser);
    const refreshToken = generateRefreshToken(user as IUser);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          subscriptionType: user.subscriptionType,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Login attempt started:', { email: req.body.email });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Login validation errors:', errors.array());
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;
    logger.info('Looking for user with email:', email);

    // Find user and include password for comparison
    const user = await User.findOne({ email });
    logger.info('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      logger.warn('User not found for email:', email);
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const lockTimeRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
      res.status(423).json({
        success: false,
        message: `Account is locked. Please try again in ${lockTimeRemaining} minutes.`,
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Generate tokens
    const accessToken = generateToken(user as IUser);
    const refreshToken = generateRefreshToken(user as IUser);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          profile: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            grade: user.grade || '',
            age: user.age || null,
            avatarUrl: user.avatarUrl || null,
            preferences: {
              language: user.language || 'en',
              difficulty: user.difficulty || 'medium',
              topics: user.topics || []
            }
          },
          subscription: {
            type: user.subscriptionType || 'free',
            features: user.features || []
          },
          progress: {
            totalActivitiesCompleted: user.totalActivitiesCompleted || 0,
            currentLevel: user.currentLevel || 1,
            totalPoints: user.totalPoints || 0,
            streakDays: user.streakDays || 0
          },
          createdAt: user.createdAt
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    });
  }
};

// Guest login - login with the default guest user and update name/grade
export const loginAsGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Guest login attempt started:', req.body);
    const { name, grade } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Name is required for guest access',
      });
      return;
    }

    logger.info('Looking for existing guest user...');
    // Find the default guest user
    let guestUser: any = await User.findOne({ 
      email: 'guest@playlearnspark.com',
      isGuest: true 
    });

    logger.info('Guest user found:', guestUser ? 'Yes' : 'No');

    if (!guestUser) {
      // If no guest user exists, create one
      try {
        guestUser = new User({
          email: 'guest@playlearnspark.com',
          password: 'guest123',
          username: 'guest_user',
          role: 'guest',
          firstName: name.trim(),
          lastName: 'Guest',
          isGuest: true,
          grade: grade || '',
          language: 'en',
          difficulty: 'easy',
          topics: ['all'],
          emailVerified: false,
          subscriptionType: 'free',
          features: ['basic_activities'],
          totalActivitiesCompleted: 0,
          currentLevel: 1,
          totalPoints: 0,
          badges: [],
          streakDays: 0,
          lastActiveDate: new Date(),
          lastLogin: new Date(),
          loginAttempts: 0,
          childrenIds: [],
        });
        await guestUser.save();
      } catch (createError) {
        logger.error('Failed to create guest user:', createError);
        res.status(500).json({
          success: false,
          message: 'Failed to create guest user',
        });
        return;
      }
    } else {
      // Update the guest user with new name and grade
      try {
        const updatedUser = await User.findByIdAndUpdate(guestUser._id, {
          firstName: name.trim(),
          grade: grade || '',
          lastActiveDate: new Date(),
          lastLogin: new Date(),
        }, { new: true });

        if (!updatedUser) {
          res.status(500).json({
            success: false,
            message: 'Failed to update guest user',
          });
          return;
        }
        guestUser = updatedUser;
      } catch (updateError) {
        logger.error('Failed to update guest user:', updateError);
        res.status(500).json({
          success: false,
          message: 'Failed to update guest user',
        });
        return;
      }
    }

    // Ensure guestUser is not null at this point
    if (!guestUser) {
      res.status(500).json({
        success: false,
        message: 'Failed to initialize guest user',
      });
      return;
    }

    // Generate tokens for the guest user
    const accessToken = generateToken(guestUser as IUser);
    const refreshToken = generateRefreshToken(guestUser as IUser);

    logger.info(`Guest user logged in: ${name} (Grade: ${grade || 'not specified'})`);

    res.status(200).json({
      success: true,
      message: 'Guest login successful',
      data: {
        user: {
          id: guestUser._id,
          email: guestUser.email,
          username: guestUser.username,
          role: guestUser.role,
          isGuest: guestUser.isGuest,
          profile: {
            firstName: guestUser.firstName || '',
            lastName: guestUser.lastName || '',
            grade: guestUser.grade || '',
            age: guestUser.age || null,
            avatarUrl: guestUser.avatarUrl || null,
            preferences: {
              language: guestUser.language || 'en',
              difficulty: guestUser.difficulty || 'medium',
              topics: guestUser.topics || []
            }
          },
          subscription: {
            type: guestUser.subscriptionType || 'free',
            features: guestUser.features || []
          },
          progress: {
            totalActivitiesCompleted: guestUser.totalActivitiesCompleted || 0,
            currentLevel: guestUser.currentLevel || 1,
            totalPoints: guestUser.totalPoints || 0,
            streakDays: guestUser.streakDays || 0
          },
          createdAt: guestUser.createdAt
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    logger.error('Guest login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during guest login',
    });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'play-learn-spark-refresh-secret'
    ) as any;

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new access token
    const newAccessToken = generateToken(user as IUser);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          role: req.user.role,
          profile: {
            firstName: req.user.firstName || '',
            lastName: req.user.lastName || '',
            grade: req.user.grade || '',
            age: req.user.age || null,
            avatarUrl: req.user.avatarUrl || null,
            preferences: {
              language: req.user.language || 'en',
              difficulty: req.user.difficulty || 'medium',
              topics: req.user.topics || []
            }
          },
          subscription: {
            type: req.user.subscriptionType || 'free',
            features: req.user.features || []
          },
          progress: {
            totalActivitiesCompleted: req.user.totalActivitiesCompleted || 0,
            currentLevel: req.user.currentLevel || 1,
            totalPoints: req.user.totalPoints || 0,
            streakDays: req.user.streakDays || 0
          },
          createdAt: req.user.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const {
      firstName,
      lastName,
      grade,
      age,
      avatarUrl,
      preferences,
    } = req.body;

    // Update the user in the database
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (grade !== undefined) updateData.grade = grade;
    if (age !== undefined) updateData.age = age;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    
    if (preferences) {
      if (preferences.language) updateData.language = preferences.language;
      if (preferences.difficulty) updateData.difficulty = preferences.difficulty;
      if (preferences.topics) updateData.topics = preferences.topics;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    logger.info(`Profile updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          role: updatedUser.role,
          profile: {
            firstName: updatedUser.firstName || '',
            lastName: updatedUser.lastName || '',
            grade: updatedUser.grade || '',
            age: updatedUser.age || null,
            avatarUrl: updatedUser.avatarUrl || null,
            preferences: {
              language: updatedUser.language || 'en',
              difficulty: updatedUser.difficulty || 'medium',
              topics: updatedUser.topics || []
            }
          },
          subscription: {
            type: updatedUser.subscriptionType || 'free',
            features: updatedUser.features || []
          },
          progress: {
            totalActivitiesCompleted: updatedUser.totalActivitiesCompleted || 0,
            currentLevel: updatedUser.currentLevel || 1,
            totalPoints: updatedUser.totalPoints || 0,
            streakDays: updatedUser.streakDays || 0
          },
          createdAt: updatedUser.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password - hash it first
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};

// Logout (for token blacklisting in future)
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token) {
      // Add token to blacklist
      tokenBlacklist.add(token);
      logger.info(`Token blacklisted for user: ${req.user?.email || 'Unknown'}`);
    }
    
    logger.info(`User logged out: ${req.user?.email || 'Unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
    });
  }
};

// Get user's children (for parent accounts)
export const getChildren = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'parent') {
      res.status(403).json({
        success: false,
        message: 'Only parent accounts can access children data',
      });
      return;
    }

    const childrenIds = req.user.childrenIds || [];
    const children = await User.find({ _id: { $in: childrenIds } });

    res.status(200).json({
      success: true,
      message: 'Children retrieved successfully',
      data: {
        children: children,
      },
    });
  } catch (error) {
    logger.error('Get children error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve children',
    });
  }
};

/**
 * Request password reset - generates reset token and sends email
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ 
      error: 'Email is required' 
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset email has been sent.'
      });
    }

    // Generate reset token
    const resetToken = await PasswordReset.createPasswordResetToken(String(user._id));
    
    if (!resetToken) {
      logger.error('Failed to generate reset token for user', { userId: user._id });
      return res.status(500).json({ 
        error: 'Failed to generate reset token. Please try again.' 
      });
    }

    // Send password reset email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:8081'}/reset-password?token=${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName || user.username);

    logger.info('Password reset requested', { 
      userId: user._id, 
      email: user.email 
    });

    return res.status(200).json({ 
      message: 'If an account with that email exists, a password reset email has been sent.'
    });
  } catch (error) {
    logger.error('Password reset request failed', { 
      email, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return res.status(500).json({ 
      error: 'Failed to process password reset request. Please try again.' 
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
      error: 'Reset token and new password are required' 
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long' 
    });
  }

  try {
    // Reset password using token
    const success = await PasswordReset.resetPassword(token, newPassword);
    
    if (!success) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    logger.info('Password reset successful', { token: token.substring(0, 10) + '...' });

    return res.status(200).json({ 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
  } catch (error) {
    logger.error('Password reset failed', { 
      token: token.substring(0, 10) + '...', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return res.status(500).json({ 
      error: 'Failed to reset password. Please try again or request a new reset link.' 
    });
  }
};