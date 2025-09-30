import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

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

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email is already registered'
          : 'Username is already taken',
      });
      return;
    }

    // Create new user
    const user = new User({
      email,
      password,
      username,
      role,
      profile: {
        firstName,
        lastName,
        age,
        preferences: {
          language,
          difficulty: age && age <= 4 ? 'easy' : 'medium',
          topics: [],
        },
      },
      subscription: {
        type: 'free',
        features: ['basic_activities', 'progress_tracking'],
      },
    });

    await user.save();

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

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
          profile: user.profile,
          subscription: user.subscription,
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
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if account is locked
    if (user.security.lockedUntil && user.security.lockedUntil > new Date()) {
      const lockTimeRemaining = Math.ceil((user.security.lockedUntil.getTime() - Date.now()) / (1000 * 60));
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
    if (user.security.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.security.lastLogin = new Date();
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
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          profile: user.profile,
          subscription: user.subscription,
          progress: user.progress,
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
    const user = await User.findById(decoded.userId);
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
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          role: req.user.role,
          profile: req.user.profile,
          subscription: req.user.subscription,
          progress: req.user.progress,
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
    if (firstName) req.user.profile.firstName = firstName;
    if (lastName) req.user.profile.lastName = lastName;
    if (age !== undefined) req.user.profile.age = age;
    if (avatarUrl !== undefined) req.user.profile.avatarUrl = avatarUrl;
    
    if (preferences) {
      if (preferences.language) req.user.profile.preferences.language = preferences.language;
      if (preferences.difficulty) req.user.profile.preferences.difficulty = preferences.difficulty;
      if (preferences.topics) req.user.profile.preferences.topics = preferences.topics;
    }

    await req.user.save();

    logger.info(`Profile updated for user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          username: req.user.username,
          role: req.user.role,
          profile: req.user.profile,
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
    const user = await User.findById(req.user._id).select('+password');
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

    const children = await User.find({
      _id: { $in: req.user.children || [] },
    }).select('-password -security');

    res.status(200).json({
      success: true,
      message: 'Children retrieved successfully',
      data: {
        children,
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