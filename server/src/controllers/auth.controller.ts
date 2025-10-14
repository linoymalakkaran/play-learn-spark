import { Request, Response } from 'express';
import { UserModel as User } from '../models/UserStore';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';
import * as jwt from 'jsonwebtoken';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
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
      email,
      password,
      username,
      role = 'parent',
      firstName,
      lastName,
      age,
      language = 'en',
    } = req.body;

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
      return;
    }

    // Check if user already exists by username
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      res.status(409).json({
        success: false,
        message: 'Username is already taken',
      });
      return;
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      username,
      role,
      firstName,
      lastName,
      age,
      language,
      difficulty: age && age <= 4 ? 'easy' : 'medium',
      topics: '[]', // Empty array as string
      totalActivitiesCompleted: 0,
      currentLevel: 1,
      totalPoints: 0,
      badges: '[]', // Empty array as string
      streakDays: 0,
      lastActiveDate: new Date(),
      subscriptionType: 'free',
      features: '["basic_activities", "progress_tracking"]', // Array as string
      emailVerified: false,
      lastLogin: new Date(),
      loginAttempts: 0,
      childrenIds: '[]', // Empty array as string
    });

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ where: { email } });
    if (!user) {
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
    const isPasswordValid = await user.comparePassword(password);
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
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          subscriptionType: user.subscriptionType,
          currentLevel: user.currentLevel,
          totalPoints: user.totalPoints,
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
    const user = await User.findByPk(parseInt(decoded.userId));
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new access token
    const newAccessToken = generateToken(user);

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
          id: req.user.id,
          email: req.user.email,
          username: req.user.username,
          role: req.user.role,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          age: req.user.age,
          language: req.user.language,
          difficulty: req.user.difficulty,
          subscriptionType: req.user.subscriptionType,
          currentLevel: req.user.currentLevel,
          totalPoints: req.user.totalPoints,
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
      age,
      avatarUrl,
      preferences,
    } = req.body;

    // Update profile fields
    if (firstName) req.user.firstName = firstName;
    if (lastName) req.user.lastName = lastName;
    if (age !== undefined) req.user.age = age;
    if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
    
    if (preferences) {
      if (preferences.language) req.user.language = preferences.language;
      if (preferences.difficulty) req.user.difficulty = preferences.difficulty;
      if (preferences.topics) req.user.topics = JSON.stringify(preferences.topics);
    }

    await req.user.save();

    logger.info(`Profile updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          username: req.user.username,
          role: req.user.role,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          age: req.user.age,
          language: req.user.language,
          difficulty: req.user.difficulty,
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
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

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
    // In a more advanced implementation, you would blacklist the token
    // For now, we'll just send a success response
    
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

    const childrenIds = JSON.parse(req.user.childrenIds || '[]');
    const children = await User.findAll();
    // Filter children by IDs manually since we don't have Op.in
    const filteredChildren = children.filter(child => childrenIds.includes(child.id));

    res.status(200).json({
      success: true,
      message: 'Children retrieved successfully',
      data: {
        children: filteredChildren,
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