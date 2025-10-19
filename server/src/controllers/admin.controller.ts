import { Request, Response } from 'express';
import User from '../models/UserSQLite';
import { validationResult } from 'express-validator';

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Don't return passwords
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: { users }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const {
      email,
      username,
      password,
      firstName,
      lastName,
      role = 'student',
      subscriptionType = 'free'
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase()
      }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Create new user with all required fields
    const newUser = await User.create({
      email: email.toLowerCase(),
      username,
      password, // Will be hashed by the model hooks (when enabled)
      firstName,
      lastName,
      role,
      subscriptionType,
      currentLevel: 1,
      totalPoints: 0,
      isGuest: false,
      language: 'english',
      difficulty: 'easy',
      topics: '[]',
      totalActivitiesCompleted: 0,
      badges: '[]',
      streakDays: 0,
      lastActiveDate: new Date(),
      features: '["basic_activities"]',
      emailVerified: true,
      lastLogin: new Date(),
      loginAttempts: 0,
      childrenIds: '[]'
    });

    // Return user without password
    const userResponse = newUser.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password; // Use separate endpoint for password reset
    delete updateData.id;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    await user.update(updateData);

    // Return updated user without password
    const userResponse = user.toJSON();
    const { password: _, ...userWithoutPassword } = userResponse;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reset user password
export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update password (will be hashed by model hooks when enabled)
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Prevent admin from deleting themselves (check using req.user from auth middleware)
    const requestUser = req.user as any;
    if (requestUser && requestUser.userId === id) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
      return;
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get admin dashboard stats
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.count();
    const totalAdmins = await User.count({ where: { role: 'admin' } });
    const totalParents = await User.count({ where: { role: 'parent' } });
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalChildren = await User.count({ where: { role: 'child' } });

    const stats = {
      totalUsers,
      usersByRole: {
        admin: totalAdmins,
        parent: totalParents,
        student: totalStudents,
        child: totalChildren
      }
    };

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};