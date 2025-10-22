/**
 * Media Routes - File Upload and Management API
 * 
 * RESTful endpoints for media upload, processing, and management
 * with comprehensive validation and security.
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticateJWT } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import mediaController from '../controllers/mediaController.js';

const router = express.Router();

/**
 * Validation Middleware
 */

// Media upload validation
const validateMediaUpload = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('contentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid content ID format'),
  
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        return tags.length <= 20 && tags.every(tag => tag.length >= 2 && tag.length <= 50);
      }
      return Array.isArray(value) && value.length <= 20 && 
             value.every(tag => typeof tag === 'string' && tag.length >= 2 && tag.length <= 50);
    })
    .withMessage('Tags must be an array or comma-separated string with max 20 items, each 2-50 characters'),
  
  body('altText')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Alt text must be less than 200 characters'),
  
  body('quality')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Quality must be low, medium, or high'),
];

// Media update validation
const validateMediaUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        return tags.length <= 20 && tags.every(tag => tag.length >= 2 && tag.length <= 50);
      }
      return Array.isArray(value) && value.length <= 20 && 
             value.every(tag => typeof tag === 'string' && tag.length >= 2 && tag.length <= 50);
    })
    .withMessage('Tags must be an array or comma-separated string with max 20 items, each 2-50 characters'),
  
  body('altText')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Alt text must be less than 200 characters'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'organization'])
    .withMessage('Visibility must be public, private, or organization'),
];

// Bulk operations validation
const validateBulkOperations = [
  body('mediaIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('Media IDs array must contain 1-100 items'),
  
  body('mediaIds.*')
    .isMongoId()
    .withMessage('All media IDs must be valid MongoDB ObjectIds'),
  
  body('operation')
    .isIn(['updateTags', 'updateVisibility', 'delete'])
    .withMessage('Operation must be updateTags, updateVisibility, or delete'),
  
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object'),
  
  body('data.tags')
    .if(body('operation').equals('updateTags'))
    .isArray({ max: 20 })
    .withMessage('Tags array must contain max 20 items'),
  
  body('data.tags.*')
    .if(body('operation').equals('updateTags'))
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each tag must be between 2 and 50 characters'),
  
  body('data.visibility')
    .if(body('operation').equals('updateVisibility'))
    .isIn(['public', 'private', 'organization'])
    .withMessage('Visibility must be public, private, or organization'),
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

/**
 * Media Upload Routes
 */

// Upload single media file
router.post('/upload',
  authenticateJWT,
  requirePermission('media.upload', 'write'),
  validateMediaUpload,
  mediaController.uploadMedia
);

/**
 * Media CRUD Routes
 */

// Get media asset by ID
router.get('/:id',
  validateObjectId,
  mediaController.getMediaById
);

// Search and filter media assets
router.get('/',
  // Query parameter validation
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('mediaType')
    .optional()
    .isIn(['image', 'video', 'audio', 'document'])
    .withMessage('Media type must be image, video, audio, or document'),
  
  query('contentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid content ID format'),
  
  query('mimeType')
    .optional()
    .matches(/^[a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+$/)
    .withMessage('Invalid MIME type format'),
  
  query('uploadedBy')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  
  query('sortBy')
    .optional()
    .isIn(['title', 'createdAt', 'updatedAt', 'fileSize', 'mediaType'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        return tags.length <= 10 && tags.every(tag => tag.length >= 2 && tag.length <= 50);
      }
      return false;
    })
    .withMessage('Tags must be comma-separated string with max 10 items, each 2-50 characters'),
  
  mediaController.searchMedia
);

// Update media asset metadata
router.put('/:id',
  authenticateJWT,
  validateObjectId,
  validateMediaUpdate,
  mediaController.updateMediaAsset
);

// Delete media asset
router.delete('/:id',
  authenticateJWT,
  requirePermission('media.delete', 'write'),
  validateObjectId,
  mediaController.deleteMediaAsset
);

/**
 * Bulk Operations Routes
 */

// Bulk operations on media assets
router.patch('/bulk',
  authenticateJWT,
  requirePermission('media.manage', 'write'),
  validateBulkOperations,
  mediaController.bulkMediaOperations
);

/**
 * Media Processing Routes
 */

// Get media processing status
router.get('/:id/processing-status',
  authenticateJWT,
  validateObjectId,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // This would integrate with a job queue system like Bull/Agenda
      // For now, return a simple status based on the media asset
      const MediaAsset = (await import('../models/ContentModels.js')).MediaAsset;
      const media = await MediaAsset.findById(id);
      
      if (!media) {
        return res.status(404).json({ error: 'Media asset not found' });
      }
      
      const status = media.processedFiles.length > 1 ? 'completed' : 'processing';
      
      res.json({
        status,
        processingProgress: status === 'completed' ? 100 : 50,
        processedVariants: media.processedFiles.map(file => ({
          variant: file.variant,
          status: 'completed',
          url: `/uploads/${file.fileName}`
        }))
      });
      
    } catch (error) {
      console.error('Processing status error:', error);
      res.status(500).json({
        error: 'Failed to get processing status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Reprocess media (regenerate thumbnails/compressions)
router.post('/:id/reprocess',
  authenticateJWT,
  requirePermission('media.manage', 'write'),
  validateObjectId,
  
  body('quality')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Quality must be low, medium, or high'),
  
  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),
  
  body('variants.*')
    .optional()
    .isIn(['thumbnail', 'small', 'medium', 'large', 'compressed'])
    .withMessage('Invalid variant type'),
  
  async (req, res) => {
    try {
      const { id } = req.params;
      const { quality = 'medium', variants } = req.body;
      
      // This would typically queue a reprocessing job
      // For now, return a success response
      res.json({
        message: 'Media reprocessing started',
        jobId: `reprocess_${id}_${Date.now()}`,
        estimatedTime: '2-5 minutes'
      });
      
    } catch (error) {
      console.error('Reprocess media error:', error);
      res.status(500).json({
        error: 'Failed to start reprocessing',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Media Analytics Routes
 */

// Get media usage analytics
router.get('/:id/analytics',
  authenticateJWT,
  requirePermission('analytics.view', 'read'),
  validateObjectId,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // This would integrate with analytics tracking
      // For now, return placeholder analytics
      res.json({
        mediaId: id,
        analytics: {
          views: 0,
          downloads: 0,
          usageInContent: 0,
          popularityScore: 0,
          lastAccessed: null,
          topReferrers: [],
          usageByTimeOfDay: {},
          usageByDay: {}
        },
        timeRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          end: new Date()
        }
      });
      
    } catch (error) {
      console.error('Media analytics error:', error);
      res.status(500).json({
        error: 'Failed to get media analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * Media Library Organization Routes
 */

// Get media library folders/categories
router.get('/library/folders',
  authenticateJWT,
  async (req, res) => {
    try {
      // This would implement a folder/category system
      // For now, return basic categories based on media types
      res.json({
        folders: [
          { id: 'images', name: 'Images', type: 'system', count: 0 },
          { id: 'videos', name: 'Videos', type: 'system', count: 0 },
          { id: 'audio', name: 'Audio', type: 'system', count: 0 },
          { id: 'documents', name: 'Documents', type: 'system', count: 0 },
          { id: 'recent', name: 'Recently Added', type: 'smart', count: 0 },
          { id: 'unused', name: 'Unused Media', type: 'smart', count: 0 }
        ]
      });
    } catch (error) {
      console.error('Get folders error:', error);
      res.status(500).json({
        error: 'Failed to get media folders',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;