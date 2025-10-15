/**
 * Simple Content Upload Controller for Play & Learn Spark Backend
 * Handles basic file uploads without complex processing
 */

import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/content/';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, cleanName + '-' + uniqueSuffix);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/csv',
    'application/vnd.ms-excel'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
});

export class ContentUploadController {
  constructor() {
    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir('uploads/content/', { recursive: true });
    } catch (error) {
      logger.error('Failed to create upload directory:', error);
    }
  }

  uploadSingleFile = (req: Request, res: Response) => {
    const uploadSingle = upload.single('file');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        logger.error('File upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      try {
        logger.info(`File uploaded: ${req.file.originalname}`);
        
        return res.json({
          success: true,
          message: 'File uploaded successfully',
          data: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
          }
        });

      } catch (error: any) {
        logger.error('File processing error:', error);
        return res.status(500).json({
          success: false,
          message: 'File processing failed',
          error: error.message
        });
      }
    });
  };

  uploadMultipleFiles = (req: Request, res: Response) => {
    const uploadMultiple = upload.array('files', 5);
    
    uploadMultiple(req, res, async (err) => {
      if (err) {
        logger.error('Multiple file upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      try {
        logger.info(`${req.files.length} files uploaded`);
        
        const results = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        }));

        return res.json({
          success: true,
          message: `${req.files.length} files uploaded successfully`,
          data: {
            files: results,
            totalCount: results.length
          }
        });

      } catch (error: any) {
        logger.error('Multiple file processing error:', error);
        return res.status(500).json({
          success: false,
          message: 'File processing failed',
          error: error.message
        });
      }
    });
  };

  getFileInfo = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Filename parameter is required'
        });
      }

      const filePath = path.join('uploads/content/', filename);
      
      try {
        const stats = await fs.stat(filePath);
        const fileExtension = path.extname(filename).substring(1).toLowerCase();
        
        return res.json({
          success: true,
          data: {
            filename,
            path: filePath,
            size: stats.size,
            type: fileExtension,
            created: stats.birthtime,
            modified: stats.mtime
          }
        });
      } catch {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

    } catch (error: any) {
      logger.error('Get file info error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get file information',
        error: error.message
      });
    }
  };

  deleteFile = async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Filename parameter is required'
        });
      }

      const filePath = path.join('uploads/content/', filename);
      
      try {
        await fs.unlink(filePath);
        return res.json({
          success: true,
          message: 'File deleted successfully'
        });
      } catch {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

    } catch (error: any) {
      logger.error('Delete file error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error.message
      });
    }
  };
}

export const contentUploadController = new ContentUploadController();