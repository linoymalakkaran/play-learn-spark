/**
 * Content Controllers - API Request Handlers
 * 
 * RESTful API controllers for content management with RBAC integration,
 * validation, error handling, and comprehensive CRUD operations.
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import ContentService, { ContentCreateData, ContentSearchFilters, ContentSearchOptions } from '../services/contentService.js';
import { ContentItem, Lesson, Activity, MediaAsset, ContentCollection } from '../models/ContentModels.js';
import { checkPermission } from '../middleware/rbac.js';

// Initialize content service
const contentService = new ContentService();

// Extended Request interface for authenticated users
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    organizationId?: string;
  };
}

/**
 * Content CRUD Controllers
 */

// Create new content
export const createContent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Check permissions
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPermission = await checkPermission(req.user.userId, 'content.create', 'write');
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const contentData: ContentCreateData = req.body;
    const content = await contentService.createContent(
      req.user.userId,
      contentData,
      req.user.organizationId
    );

    res.status(201).json({
      message: 'Content created successfully',
      content
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      error: 'Failed to create content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get content by ID
export const getContentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { includeAnalytics } = req.query;

    const content = await contentService.getContentById(
      id,
      req.user?.userId,
      includeAnalytics === 'true'
    );

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ content });
  } catch (error) {
    console.error('Get content error:', error);
    
    if (error instanceof Error && error.message === 'Access denied to this content') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.status(500).json({
      error: 'Failed to retrieve content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Search and filter content
export const searchContent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filters: ContentSearchFilters = {
      subject: req.query.subject as string,
      gradeLevel: req.query.gradeLevel ? (req.query.gradeLevel as string).split(',') : undefined,
      difficulty: req.query.difficulty as string,
      contentType: req.query.contentType as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      categories: req.query.categories ? (req.query.categories as string).split(',') : undefined,
      author: req.query.author as string,
      status: req.query.status as string,
      language: req.query.language as string,
      searchTerm: req.query.q as string
    };

    // Parse complex filters
    if (req.query.ageRange) {
      try {
        filters.ageRange = JSON.parse(req.query.ageRange as string);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid ageRange format' });
      }
    }

    if (req.query.rating) {
      try {
        filters.rating = JSON.parse(req.query.rating as string);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid rating format' });
      }
    }

    if (req.query.dateRange) {
      try {
        const dateRange = JSON.parse(req.query.dateRange as string);
        filters.dateRange = {
          start: dateRange.start ? new Date(dateRange.start) : undefined,
          end: dateRange.end ? new Date(dateRange.end) : undefined
        };
      } catch (e) {
        return res.status(400).json({ error: 'Invalid dateRange format' });
      }
    }

    const options: ContentSearchOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 20, 100), // Max 100 items
      sortBy: req.query.sortBy as string || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      includeAnalytics: req.query.includeAnalytics === 'true',
      includeAuthor: req.query.includeAuthor === 'true'
    };

    const result = await contentService.searchContent(filters, options, req.user?.userId);

    res.json(result);
  } catch (error) {
    console.error('Search content error:', error);
    res.status(500).json({
      error: 'Failed to search content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update content
export const updateContent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { createNewVersion } = req.query;
    const updateData = req.body;

    const content = await contentService.updateContent(
      id,
      updateData,
      req.user.userId,
      createNewVersion === 'true'
    );

    res.json({
      message: 'Content updated successfully',
      content
    });
  } catch (error) {
    console.error('Update content error:', error);
    
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    if (error instanceof Error && error.message === 'Content not found') {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.status(500).json({
      error: 'Failed to update content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete content
export const deleteContent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const success = await contentService.deleteContent(id, req.user.userId);

    if (success) {
      res.json({ message: 'Content deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete content' });
    }
  } catch (error) {
    console.error('Delete content error:', error);
    
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    if (error instanceof Error && error.message === 'Content not found') {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.status(500).json({
      error: 'Failed to delete content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Publish content
export const publishContent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const content = await contentService.publishContent(id, req.user.userId);

    res.json({
      message: 'Content published successfully',
      content
    });
  } catch (error) {
    console.error('Publish content error:', error);
    
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    if (error instanceof Error && error.message === 'Content not found') {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.status(500).json({
      error: 'Failed to publish content',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Lesson-specific Controllers
 */

// Get lesson structure
export const getLessonStructure = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findOne({ contentId: id }).populate('contentId');

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      error: 'Failed to retrieve lesson',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update lesson structure
export const updateLessonStructure = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const lesson = await Lesson.findOneAndUpdate(
      { contentId: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      error: 'Failed to update lesson',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Activity-specific Controllers
 */

// Get activity configuration
export const getActivityConfiguration = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const activity = await Activity.findOne({ contentId: id }).populate('contentId');

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ activity });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      error: 'Failed to retrieve activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update activity configuration
export const updateActivityConfiguration = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const activity = await Activity.findOneAndUpdate(
      { contentId: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({
      message: 'Activity updated successfully',
      activity
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      error: 'Failed to update activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Content Collection Controllers
 */

// Create content collection (course, playlist, etc.)
export const createContentCollection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPermission = await checkPermission(req.user.userId, 'content.create', 'write');
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const collectionData = {
      ...req.body,
      author: req.user.userId,
      organization: req.user.organizationId
    };

    const collection = new ContentCollection(collectionData);
    await collection.save();

    res.status(201).json({
      message: 'Content collection created successfully',
      collection
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({
      error: 'Failed to create content collection',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get content collection by ID
export const getContentCollectionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const collection = await ContentCollection.findById(id)
      .populate('items.contentId', 'title description contentType difficulty estimatedDuration')
      .populate('author', 'profile.firstName profile.lastName email');

    if (!collection) {
      return res.status(404).json({ error: 'Content collection not found' });
    }

    res.json({ collection });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({
      error: 'Failed to retrieve content collection',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Add content to collection
export const addContentToCollection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { contentId, order, required = true, estimatedTime } = req.body;

    const collection = await ContentCollection.findById(id);
    if (!collection) {
      return res.status(404).json({ error: 'Content collection not found' });
    }

    // Check if user can edit this collection
    if (collection.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Add content to collection
    collection.items.push({
      contentId,
      order: order || collection.items.length + 1,
      required,
      estimatedTime
    });

    await collection.save();

    res.json({
      message: 'Content added to collection successfully',
      collection
    });
  } catch (error) {
    console.error('Add content to collection error:', error);
    res.status(500).json({
      error: 'Failed to add content to collection',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Analytics Controllers
 */

// Get content analytics
export const getContentAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPermission = await checkPermission(req.user.userId, 'analytics.view', 'read');
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { contentId } = req.params;
    const timeRange = req.query.timeRange ? JSON.parse(req.query.timeRange as string) : undefined;

    const analytics = await contentService.getContentAnalytics(
      contentId,
      timeRange ? {
        start: new Date(timeRange.start),
        end: new Date(timeRange.end)
      } : undefined,
      req.user.userId
    );

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Bulk Operations Controllers
 */

// Bulk update content status
export const bulkUpdateContentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPermission = await checkPermission(req.user.userId, 'content.manage', 'write');
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { contentIds, status } = req.body;

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({ error: 'Content IDs array is required' });
    }

    const validStatuses = ['draft', 'review', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update only content owned by the user
    const result = await ContentItem.updateMany(
      { 
        _id: { $in: contentIds },
        author: req.user.userId
      },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          ...(status === 'published' ? { publishedAt: new Date() } : {})
        }
      }
    );

    res.json({
      message: `Bulk status update completed`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      error: 'Failed to perform bulk update',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export all controllers
export default {
  createContent,
  getContentById,
  searchContent,
  updateContent,
  deleteContent,
  publishContent,
  getLessonStructure,
  updateLessonStructure,
  getActivityConfiguration,
  updateActivityConfiguration,
  createContentCollection,
  getContentCollectionById,
  addContentToCollection,
  getContentAnalytics,
  bulkUpdateContentStatus
};