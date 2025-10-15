import { Request, Response } from 'express';
import { activityStore, activityCompletionStore, progressStore, Activity } from '../models/UserStore';
import { logger } from '../utils/logger';

// Get all activities
export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, difficulty, limit, offset } = req.query;
    
    const options: any = {};
    if (category || difficulty) {
      options.where = {};
      if (category) options.where.category = category as string;
      if (difficulty) options.where.difficulty = difficulty as string;
    }
    
    if (limit) options.limit = parseInt(limit as string);
    if (offset) options.offset = parseInt(offset as string);
    
    const activities = await activityStore.findAll(options);
    
    res.status(200).json({
      success: true,
      message: 'Activities retrieved successfully',
      data: {
        activities,
        total: activities.length
      }
    });
  } catch (error) {
    logger.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activities'
    });
  }
};

// Get activity by ID
export const getActivityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const activity = await activityStore.findByPk(parseInt(id));
    
    if (!activity) {
      res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Activity retrieved successfully',
      data: { activity }
    });
  } catch (error) {
    logger.error('Get activity by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity'
    });
  }
};

// Create new activity
export const createActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      content,
      difficulty,
      ageRange,
      category,
      tags,
      estimatedTime,
      isPublic = true
    } = req.body;
    
    const activity = await activityStore.create({
      title,
      description,
      content: typeof content === 'string' ? content : JSON.stringify(content),
      difficulty,
      ageRange,
      category,
      tags: Array.isArray(tags) ? tags : [],
      estimatedTime: parseInt(estimatedTime) || 15,
      aiGenerated: false,
      createdBy: req.user?.id || 1,
      isPublic
    });
    
    logger.info(`Activity created: ${activity.title} by user ${req.user?.id}`);
    
    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: { activity }
    });
  } catch (error) {
    logger.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity'
    });
  }
};

// Complete an activity
export const completeActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { score, timeSpent, answers } = req.body;
    const userId = req.user!.id;
    
    const activity = await activityStore.findByPk(parseInt(id));
    if (!activity) {
      res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
      return;
    }
    
    // Check if user has already completed this activity
    const existingCompletion = await activityCompletionStore.findOne({
      where: { userId, activityId: parseInt(id) }
    });
    
    const attempts = existingCompletion ? existingCompletion.attempts + 1 : 1;
    const finalScore = Math.max(0, Math.min(100, score || 0));
    const finalTimeSpent = Math.max(0, timeSpent || 0);
    
    // Update or create completion record
    const completion = await activityCompletionStore.upsert({
      userId,
      activityId: parseInt(id),
      score: finalScore,
      completed: true,
      timeSpent: finalTimeSpent,
      attempts,
      completedAt: new Date()
    });
    
    // Update user progress
    await progressStore.updateActivityCompletion(userId, finalScore, finalTimeSpent);
    
    logger.info(`Activity ${id} completed by user ${userId} with score ${finalScore}`);
    
    res.status(200).json({
      success: true,
      message: 'Activity completed successfully',
      data: { 
        completion,
        score: finalScore,
        attempts
      }
    });
  } catch (error) {
    logger.error('Complete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete activity'
    });
  }
};

// Get user's activity progress
export const getUserProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Get overall progress
    const progress = await progressStore.findByUserId(userId);
    
    // Get completed activities
    const completions = await activityCompletionStore.findAll({
      where: { userId }
    });
    
    res.status(200).json({
      success: true,
      message: 'User progress retrieved successfully',
      data: {
        progress: progress || {
          totalActivitiesCompleted: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          level: 1,
          experience: 0,
          badges: []
        },
        completions
      }
    });
  } catch (error) {
    logger.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user progress'
    });
  }
};

// Reset user progress
export const resetUserProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    // Reset progress
    await progressStore.resetProgress(userId);
    
    logger.info(`Progress reset for user ${userId}`);
    
    res.status(200).json({
      success: true,
      message: 'User progress reset successfully'
    });
  } catch (error) {
    logger.error('Reset user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset user progress'
    });
  }
};