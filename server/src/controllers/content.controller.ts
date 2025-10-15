import { Request, Response } from 'express';
import { activityStore } from '../models/UserStore';
import { User } from '../models/UserSQLite';
import { logger } from '../utils/logger';

/**
 * Get all activities with filtering and pagination
 */
export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const {
      category,
      difficulty,
      ageRange,
      createdBy,
      isPublic,
      page = 1,
      limit = 10,
      search
    } = req.query;

    let activities = await activityStore.findAll();

    // Apply filters
    if (category) {
      activities = activities.filter(a => a.category === category);
    }
    if (difficulty) {
      activities = activities.filter(a => a.difficulty === difficulty);
    }
    if (ageRange) {
      activities = activities.filter(a => a.ageRange === ageRange);
    }
    if (createdBy) {
      activities = activities.filter(a => a.createdBy === parseInt(createdBy as string));
    }
    if (isPublic !== undefined) {
      activities = activities.filter(a => a.isPublic === (isPublic === 'true'));
    }
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      activities = activities.filter(a => 
        a.title.toLowerCase().includes(searchTerm) ||
        a.description.toLowerCase().includes(searchTerm) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Pagination
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedActivities = activities.slice(startIndex, endIndex);

    // Get creator information
    const activitiesWithCreators = await Promise.all(
      paginatedActivities.map(async (activity) => {
        const creator = await User.findByPk(activity.createdBy);
        return {
          ...activity,
          creator: creator ? {
            id: creator.id,
            username: creator.username,
            firstName: creator.firstName,
            lastName: creator.lastName
          } : null
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Activities retrieved successfully',
      data: {
        activities: activitiesWithCreators,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages: Math.ceil(activities.length / parseInt(limit as string)),
          totalItems: activities.length,
          itemsPerPage: parseInt(limit as string)
        }
      }
    });

  } catch (error) {
    logger.error('Get all activities error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve activities'
    });
  }
};

/**
 * Create a new activity
 */
export const createActivity = async (req: Request, res: Response) => {
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

    // Validation
    if (!title || !description || !content || !difficulty || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, content, difficulty, and category are required'
      });
    }

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Difficulty must be easy, medium, or hard'
      });
    }

    const activityData = {
      title: title.trim(),
      description: description.trim(),
      content: typeof content === 'string' ? content : JSON.stringify(content),
      difficulty,
      ageRange: ageRange || '6-12',
      category: category.trim(),
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      estimatedTime: estimatedTime || 15,
      aiGenerated: false,
      createdBy: req.user?.id || 1,
      isPublic: Boolean(isPublic)
    };

    const newActivity = await activityStore.create(activityData);

    logger.info('Activity created successfully', {
      activityId: newActivity.id,
      title: newActivity.title,
      createdBy: newActivity.createdBy
    });

    return res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: { activity: newActivity }
    });

  } catch (error) {
    logger.error('Create activity error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create activity'
    });
  }
};

/**
 * Update an existing activity
 */
export const updateActivity = async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id);
    
    if (!activityId) {
      return res.status(400).json({
        success: false,
        error: 'Activity ID is required'
      });
    }

    const activity = await activityStore.findByPk(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check permissions
    if (req.user?.role !== 'admin' && activity.createdBy !== req.user?.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this activity'
      });
    }

    const {
      title,
      description,
      content,
      difficulty,
      ageRange,
      category,
      tags,
      estimatedTime,
      isPublic
    } = req.body;

    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (content !== undefined) updateData.content = typeof content === 'string' ? content : JSON.stringify(content);
    if (difficulty !== undefined) {
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return res.status(400).json({
          success: false,
          error: 'Difficulty must be easy, medium, or hard'
        });
      }
      updateData.difficulty = difficulty;
    }
    if (ageRange !== undefined) updateData.ageRange = ageRange;
    if (category !== undefined) updateData.category = category.trim();
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
    if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);

    const success = await activityStore.update(activityId, updateData);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update activity'
      });
    }

    const updatedActivity = await activityStore.findByPk(activityId);

    logger.info('Activity updated successfully', {
      activityId,
      updatedBy: req.user?.id
    });

    return res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: { activity: updatedActivity }
    });

  } catch (error) {
    logger.error('Update activity error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update activity'
    });
  }
};

/**
 * Delete an activity
 */
export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id);
    
    if (!activityId) {
      return res.status(400).json({
        success: false,
        error: 'Activity ID is required'
      });
    }

    const activity = await activityStore.findByPk(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Check permissions
    if (req.user?.role !== 'admin' && activity.createdBy !== req.user?.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this activity'
      });
    }

    const success = await activityStore.delete(activityId);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete activity'
      });
    }

    logger.info('Activity deleted successfully', {
      activityId,
      deletedBy: req.user?.id
    });

    return res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    logger.error('Delete activity error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete activity'
    });
  }
};

/**
 * Get activity categories with stats
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const activities = await activityStore.findAll();
    
    const categoryStats = activities.reduce((stats: any, activity) => {
      if (!stats[activity.category]) {
        stats[activity.category] = {
          name: activity.category,
          totalActivities: 0,
          difficulties: { easy: 0, medium: 0, hard: 0 },
          averageTime: 0,
          totalTime: 0,
          publicActivities: 0
        };
      }
      
      stats[activity.category].totalActivities++;
      stats[activity.category].difficulties[activity.difficulty]++;
      stats[activity.category].totalTime += activity.estimatedTime;
      if (activity.isPublic) {
        stats[activity.category].publicActivities++;
      }
      
      return stats;
    }, {});

    // Calculate average times
    Object.values(categoryStats).forEach((category: any) => {
      category.averageTime = category.totalActivities > 0 
        ? Math.round(category.totalTime / category.totalActivities) 
        : 0;
      delete category.totalTime; // Remove internal calculation field
    });

    const categories = Object.values(categoryStats);

    return res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories }
    });

  } catch (error) {
    logger.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve categories'
    });
  }
};

/**
 * Clone/duplicate an activity
 */
export const cloneActivity = async (req: Request, res: Response) => {
  try {
    const activityId = parseInt(req.params.id);
    
    if (!activityId) {
      return res.status(400).json({
        success: false,
        error: 'Activity ID is required'
      });
    }

    const originalActivity = await activityStore.findByPk(activityId);
    if (!originalActivity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    // Create new activity based on original
    const clonedActivityData = {
      title: `${originalActivity.title} (Copy)`,
      description: originalActivity.description,
      content: originalActivity.content,
      difficulty: originalActivity.difficulty,
      ageRange: originalActivity.ageRange,
      category: originalActivity.category,
      tags: [...originalActivity.tags],
      estimatedTime: originalActivity.estimatedTime,
      aiGenerated: originalActivity.aiGenerated,
      sourceContent: `Cloned from activity ID: ${originalActivity.id}`,
      createdBy: req.user?.id || 1,
      isPublic: false // New cloned activities are private by default
    };

    const clonedActivity = await activityStore.create(clonedActivityData);

    logger.info('Activity cloned successfully', {
      originalId: activityId,
      clonedId: clonedActivity.id,
      clonedBy: req.user?.id
    });

    return res.status(201).json({
      success: true,
      message: 'Activity cloned successfully',
      data: { activity: clonedActivity }
    });

  } catch (error) {
    logger.error('Clone activity error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clone activity'
    });
  }
};

/**
 * Bulk operations for activities
 */
export const bulkOperations = async (req: Request, res: Response) => {
  try {
    const { operation, activityIds, updateData } = req.body;

    if (!operation || !Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Operation and activity IDs are required'
      });
    }

    // Check permissions for all activities
    const activities = await Promise.all(
      activityIds.map(id => activityStore.findByPk(id))
    );

    const unauthorizedActivities = activities.filter(activity => 
      activity && req.user?.role !== 'admin' && activity.createdBy !== req.user?.id
    );

    if (unauthorizedActivities.length > 0) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to perform operations on some activities'
      });
    }

    let results = [];

    switch (operation) {
      case 'delete':
        for (const id of activityIds) {
          const success = await activityStore.delete(id);
          results.push({ id, success });
        }
        break;

      case 'update':
        if (!updateData) {
          return res.status(400).json({
            success: false,
            error: 'Update data is required for bulk update'
          });
        }
        for (const id of activityIds) {
          const success = await activityStore.update(id, updateData);
          results.push({ id, success });
        }
        break;

      case 'publish':
        for (const id of activityIds) {
          const success = await activityStore.update(id, { isPublic: true });
          results.push({ id, success });
        }
        break;

      case 'unpublish':
        for (const id of activityIds) {
          const success = await activityStore.update(id, { isPublic: false });
          results.push({ id, success });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid operation. Supported: delete, update, publish, unpublish'
        });
    }

    const successCount = results.filter(r => r.success).length;

    logger.info('Bulk operation completed', {
      operation,
      totalActivities: activityIds.length,
      successCount,
      performedBy: req.user?.id
    });

    return res.status(200).json({
      success: true,
      message: `Bulk ${operation} completed`,
      data: {
        totalProcessed: activityIds.length,
        successful: successCount,
        failed: activityIds.length - successCount,
        results
      }
    });

  } catch (error) {
    logger.error('Bulk operations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to perform bulk operation'
    });
  }
};