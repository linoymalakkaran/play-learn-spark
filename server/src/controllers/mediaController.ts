/**
 * Media Management Controller
 * 
 * Handles file uploads, media processing, storage management,
 * and CDN integration for educational content.
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import multer from 'multer';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { MediaAsset } from '../models/ContentModels.js';
import { checkPermission } from '../middleware/rbac.js';

// Extended Request interface for authenticated users
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    organizationId?: string;
  };
}

// Media processing configuration
const MEDIA_CONFIG = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    thumbnailSizes: [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'small', width: 300, height: 300 },
      { name: 'medium', width: 600, height: 600 },
      { name: 'large', width: 1200, height: 1200 }
    ]
  },
  video: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedFormats: ['mp4', 'webm', 'avi', 'mov', 'wmv'],
    thumbnailSize: { width: 640, height: 360 },
    compressionSettings: {
      'low': { videoBitrate: '500k', audioBitrate: '96k' },
      'medium': { videoBitrate: '1000k', audioBitrate: '128k' },
      'high': { videoBitrate: '2000k', audioBitrate: '192k' }
    }
  },
  audio: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedFormats: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
    compressionSettings: {
      'low': { audioBitrate: '96k' },
      'medium': { audioBitrate: '128k' },
      'high': { audioBitrate: '192k' }
    }
  },
  document: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedFormats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt']
  }
};

// Storage configuration using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadDirectory(file.mimetype);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    const fileExt = path.extname(file.originalname);
    const fileName = `${uniqueId}${fileExt}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: Math.max(
      MEDIA_CONFIG.image.maxSize,
      MEDIA_CONFIG.video.maxSize,
      MEDIA_CONFIG.audio.maxSize,
      MEDIA_CONFIG.document.maxSize
    )
  },
  fileFilter: (req, file, cb) => {
    const isAllowed = isFileTypeAllowed(file);
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  }
});

/**
 * Helper Functions
 */

function getUploadDirectory(mimetype: string): string {
  if (mimetype.startsWith('image/')) return 'uploads/images';
  if (mimetype.startsWith('video/')) return 'uploads/videos';
  if (mimetype.startsWith('audio/')) return 'uploads/audio';
  return 'uploads/documents';
}

function isFileTypeAllowed(file: Express.Multer.File): boolean {
  const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
  
  if (file.mimetype.startsWith('image/')) {
    return MEDIA_CONFIG.image.allowedFormats.includes(fileExt);
  }
  if (file.mimetype.startsWith('video/')) {
    return MEDIA_CONFIG.video.allowedFormats.includes(fileExt);
  }
  if (file.mimetype.startsWith('audio/')) {
    return MEDIA_CONFIG.audio.allowedFormats.includes(fileExt);
  }
  
  return MEDIA_CONFIG.document.allowedFormats.includes(fileExt);
}

function getMediaType(mimetype: string): string {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'document';
}

/**
 * Image Processing Functions
 */

async function processImage(filePath: string, originalName: string): Promise<any[]> {
  const processed = [];
  const fileDir = path.dirname(filePath);
  const fileName = path.parse(originalName).name;
  const fileExt = path.extname(filePath);

  try {
    // Generate thumbnails
    for (const size of MEDIA_CONFIG.image.thumbnailSizes) {
      const outputPath = path.join(fileDir, `${fileName}_${size.name}${fileExt}`);
      
      await sharp(filePath)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      processed.push({
        variant: size.name,
        path: outputPath,
        width: size.width,
        height: size.height
      });
    }

    // Get original image metadata
    const metadata = await sharp(filePath).metadata();
    processed.push({
      variant: 'original',
      path: filePath,
      width: metadata.width,
      height: metadata.height
    });

    return processed;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Video Processing Functions
 */

async function processVideo(filePath: string, originalName: string, quality: string = 'medium'): Promise<any[]> {
  const processed = [];
  const fileDir = path.dirname(filePath);
  const fileName = path.parse(originalName).name;

  return new Promise((resolve, reject) => {
    try {
      const outputPath = path.join(fileDir, `${fileName}_compressed.mp4`);
      const thumbnailPath = path.join(fileDir, `${fileName}_thumbnail.jpg`);
      const settings = MEDIA_CONFIG.video.compressionSettings[quality as keyof typeof MEDIA_CONFIG.video.compressionSettings];

      // Compress video
      ffmpeg(filePath)
        .videoBitrate(settings.videoBitrate)
        .audioBitrate(settings.audioBitrate)
        .format('mp4')
        .on('end', async () => {
          try {
            // Generate thumbnail
            ffmpeg(filePath)
              .screenshots({
                count: 1,
                folder: fileDir,
                filename: `${fileName}_thumbnail.jpg`,
                size: `${MEDIA_CONFIG.video.thumbnailSize.width}x${MEDIA_CONFIG.video.thumbnailSize.height}`
              })
              .on('end', () => {
                processed.push(
                  {
                    variant: 'compressed',
                    path: outputPath,
                    quality
                  },
                  {
                    variant: 'thumbnail',
                    path: thumbnailPath,
                    width: MEDIA_CONFIG.video.thumbnailSize.width,
                    height: MEDIA_CONFIG.video.thumbnailSize.height
                  },
                  {
                    variant: 'original',
                    path: filePath
                  }
                );
                resolve(processed);
              })
              .on('error', (err) => {
                console.error('Thumbnail generation error:', err);
                // Continue without thumbnail
                processed.push(
                  {
                    variant: 'compressed',
                    path: outputPath,
                    quality
                  },
                  {
                    variant: 'original',
                    path: filePath
                  }
                );
                resolve(processed);
              });
          } catch (error) {
            console.error('Video thumbnail error:', error);
            resolve(processed);
          }
        })
        .on('error', (err) => {
          console.error('Video compression error:', err);
          reject(new Error('Failed to process video'));
        })
        .save(outputPath);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Audio Processing Functions
 */

async function processAudio(filePath: string, originalName: string, quality: string = 'medium'): Promise<any[]> {
  const processed = [];
  const fileDir = path.dirname(filePath);
  const fileName = path.parse(originalName).name;

  return new Promise((resolve, reject) => {
    try {
      const outputPath = path.join(fileDir, `${fileName}_compressed.mp3`);
      const settings = MEDIA_CONFIG.audio.compressionSettings[quality as keyof typeof MEDIA_CONFIG.audio.compressionSettings];

      // Compress audio
      ffmpeg(filePath)
        .audioBitrate(settings.audioBitrate)
        .format('mp3')
        .on('end', () => {
          processed.push(
            {
              variant: 'compressed',
              path: outputPath,
              quality
            },
            {
              variant: 'original',
              path: filePath
            }
          );
          resolve(processed);
        })
        .on('error', (err) => {
          console.error('Audio compression error:', err);
          reject(new Error('Failed to process audio'));
        })
        .save(outputPath);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Media Controllers
 */

// Upload media file
export const uploadMedia = [
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasPermission = await checkPermission(req.user.userId, 'media.upload', 'write');
      if (!hasPermission) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { contentId, title, description, tags, altText } = req.body;
      const mediaType = getMediaType(req.file.mimetype);
      
      // Process the file based on type
      let processedFiles: any[] = [];
      
      try {
        switch (mediaType) {
          case 'image':
            processedFiles = await processImage(req.file.path, req.file.originalname);
            break;
          case 'video':
            processedFiles = await processVideo(req.file.path, req.file.originalname, req.body.quality);
            break;
          case 'audio':
            processedFiles = await processAudio(req.file.path, req.file.originalname, req.body.quality);
            break;
          default:
            processedFiles = [{
              variant: 'original',
              path: req.file.path
            }];
        }
      } catch (processingError) {
        console.error('File processing error:', processingError);
        // Continue with original file if processing fails
        processedFiles = [{
          variant: 'original',
          path: req.file.path
        }];
      }

      // Create media asset record
      const mediaAsset = new MediaAsset({
        contentId: contentId || null,
        title: title || req.file.originalname,
        description: description || '',
        mediaType,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        originalFileName: req.file.originalname,
        filePath: req.file.path,
        fileName: req.file.filename,
        uploadedBy: req.user.userId,
        organization: req.user.organizationId,
        tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        altText: altText || '',
        processedFiles: processedFiles.map(file => ({
          variant: file.variant,
          path: file.path,
          fileName: path.basename(file.path),
          ...(file.width && { width: file.width }),
          ...(file.height && { height: file.height }),
          ...(file.quality && { quality: file.quality })
        })),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await mediaAsset.save();

      res.status(201).json({
        message: 'Media uploaded successfully',
        mediaAsset: {
          id: mediaAsset._id,
          title: mediaAsset.title,
          mediaType: mediaAsset.mediaType,
          mimeType: mediaAsset.mimeType,
          fileSize: mediaAsset.fileSize,
          filePath: mediaAsset.filePath,
          processedFiles: mediaAsset.processedFiles,
          url: `/uploads/${path.basename(mediaAsset.filePath)}`,
          createdAt: mediaAsset.createdAt
        }
      });

    } catch (error) {
      console.error('Upload media error:', error);
      
      // Clean up uploaded file on error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', unlinkError);
        }
      }

      res.status(500).json({
        error: 'Failed to upload media',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];

// Get media asset by ID
export const getMediaById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const mediaAsset = await MediaAsset.findById(id)
      .populate('uploadedBy', 'profile.firstName profile.lastName email')
      .populate('contentId', 'title contentType');

    if (!mediaAsset) {
      return res.status(404).json({ error: 'Media asset not found' });
    }

    res.json({
      mediaAsset: {
        ...mediaAsset.toObject(),
        url: `/uploads/${path.basename(mediaAsset.filePath)}`,
        processedUrls: mediaAsset.processedFiles.map(file => ({
          ...file,
          url: `/uploads/${file.fileName}`
        }))
      }
    });

  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      error: 'Failed to retrieve media asset',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Search and filter media assets
export const searchMedia = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      mediaType,
      contentId,
      tags,
      mimeType,
      uploadedBy,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (mediaType) filter.mediaType = mediaType;
    if (contentId) filter.contentId = contentId;
    if (mimeType) filter.mimeType = new RegExp(mimeType as string, 'i');
    if (uploadedBy) filter.uploadedBy = uploadedBy;
    if (tags) {
      const tagArray = (tags as string).split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // If user is not admin, only show their org's media or public media
    if (req.user && req.user.role !== 'admin') {
      filter.$or = [
        { organization: req.user.organizationId },
        { visibility: 'public' }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    const [mediaAssets, total] = await Promise.all([
      MediaAsset.find(filter)
        .populate('uploadedBy', 'profile.firstName profile.lastName email')
        .populate('contentId', 'title contentType')
        .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limitNum),
      MediaAsset.countDocuments(filter)
    ]);

    const mediaWithUrls = mediaAssets.map(media => ({
      ...media.toObject(),
      url: `/uploads/${path.basename(media.filePath)}`,
      processedUrls: media.processedFiles.map(file => ({
        ...file,
        url: `/uploads/${file.fileName}`
      }))
    }));

    res.json({
      mediaAssets: mediaWithUrls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Search media error:', error);
    res.status(500).json({
      error: 'Failed to search media assets',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update media asset metadata
export const updateMediaAsset = async (req: AuthenticatedRequest, res: Response) => {
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
    const { title, description, tags, altText, visibility } = req.body;

    const mediaAsset = await MediaAsset.findById(id);

    if (!mediaAsset) {
      return res.status(404).json({ error: 'Media asset not found' });
    }

    // Check permission to edit
    if (mediaAsset.uploadedBy.toString() !== req.user.userId) {
      const hasPermission = await checkPermission(req.user.userId, 'media.manage', 'write');
      if (!hasPermission) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }

    // Update fields
    if (title !== undefined) mediaAsset.title = title;
    if (description !== undefined) mediaAsset.description = description;
    if (tags !== undefined) {
      mediaAsset.tags = Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim());
    }
    if (altText !== undefined) mediaAsset.altText = altText;
    if (visibility !== undefined) mediaAsset.visibility = visibility;
    
    mediaAsset.updatedAt = new Date();

    await mediaAsset.save();

    res.json({
      message: 'Media asset updated successfully',
      mediaAsset: {
        ...mediaAsset.toObject(),
        url: `/uploads/${path.basename(mediaAsset.filePath)}`
      }
    });

  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({
      error: 'Failed to update media asset',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete media asset
export const deleteMediaAsset = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const mediaAsset = await MediaAsset.findById(id);

    if (!mediaAsset) {
      return res.status(404).json({ error: 'Media asset not found' });
    }

    // Check permission to delete
    if (mediaAsset.uploadedBy.toString() !== req.user.userId) {
      const hasPermission = await checkPermission(req.user.userId, 'media.delete', 'write');
      if (!hasPermission) {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }

    // Delete physical files
    try {
      // Delete original file
      await fs.unlink(mediaAsset.filePath);
      
      // Delete processed files
      for (const processedFile of mediaAsset.processedFiles) {
        try {
          await fs.unlink(processedFile.path);
        } catch (error) {
          console.error(`Failed to delete processed file: ${processedFile.path}`, error);
        }
      }
    } catch (error) {
      console.error('Failed to delete physical files:', error);
    }

    // Delete database record
    await MediaAsset.findByIdAndDelete(id);

    res.json({ message: 'Media asset deleted successfully' });

  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({
      error: 'Failed to delete media asset',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Bulk media operations
export const bulkMediaOperations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPermission = await checkPermission(req.user.userId, 'media.manage', 'write');
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { mediaIds, operation, data } = req.body;

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({ error: 'Media IDs array is required' });
    }

    let result;

    switch (operation) {
      case 'updateTags':
        result = await MediaAsset.updateMany(
          { _id: { $in: mediaIds } },
          { 
            $set: { 
              tags: data.tags,
              updatedAt: new Date()
            }
          }
        );
        break;

      case 'updateVisibility':
        result = await MediaAsset.updateMany(
          { _id: { $in: mediaIds } },
          { 
            $set: { 
              visibility: data.visibility,
              updatedAt: new Date()
            }
          }
        );
        break;

      case 'delete':
        const mediaToDelete = await MediaAsset.find({ _id: { $in: mediaIds } });
        
        // Delete physical files
        for (const media of mediaToDelete) {
          try {
            await fs.unlink(media.filePath);
            for (const processedFile of media.processedFiles) {
              try {
                await fs.unlink(processedFile.path);
              } catch (error) {
                console.error(`Failed to delete processed file: ${processedFile.path}`);
              }
            }
          } catch (error) {
            console.error(`Failed to delete files for media ${media._id}`);
          }
        }

        result = await MediaAsset.deleteMany({ _id: { $in: mediaIds } });
        break;

      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }

    res.json({
      message: `Bulk ${operation} completed successfully`,
      modifiedCount: result.modifiedCount || result.deletedCount,
      matchedCount: result.matchedCount || mediaIds.length
    });

  } catch (error) {
    console.error('Bulk media operations error:', error);
    res.status(500).json({
      error: 'Failed to perform bulk operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export all controllers
export default {
  uploadMedia,
  getMediaById,
  searchMedia,
  updateMediaAsset,
  deleteMediaAsset,
  bulkMediaOperations
};