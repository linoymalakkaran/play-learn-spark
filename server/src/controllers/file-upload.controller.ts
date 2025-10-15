import { Request, Response } from 'express';
import { uploadSingle, uploadMultiple, getFileInfo, UPLOAD_PATHS } from '../config/multer';
import csv from 'csv-parser';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class FileUploadController {

  /**
   * Upload single file
   */
  uploadSingle = (req: AuthenticatedRequest, res: Response) => {
    uploadSingle(req, res, async (err) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      try {
        const fileInfo = getFileInfo(req.file);
        let processedData = null;

        // Process file based on type
        if (req.file.mimetype === 'text/csv') {
          processedData = await this.processCSV(req.file.path);
        } else if (req.file.mimetype.startsWith('image/')) {
          processedData = await this.processImage(req.file.path);
        }

        res.json({
          success: true,
          message: 'File uploaded successfully',
          data: {
            file: fileInfo,
            processedData
          }
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: 'File processing failed',
          error: error.message
        });
      }
    });
  };

  /**
   * Upload multiple files
   */
  uploadMultiple = (req: AuthenticatedRequest, res: Response) => {
    uploadMultiple(req, res, async (err) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        });
        return;
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
        return;
      }

      try {
        const processedFiles = [];

        for (const file of req.files) {
          const fileInfo = getFileInfo(file);
          let processedData = null;

          // Process file based on type
          if (file.mimetype === 'text/csv') {
            processedData = await this.processCSV(file.path);
          } else if (file.mimetype.startsWith('image/')) {
            processedData = await this.processImage(file.path);
          }

          processedFiles.push({
            file: fileInfo,
            processedData
          });
        }

        res.json({
          success: true,
          message: `${req.files.length} files uploaded successfully`,
          data: {
            files: processedFiles
          }
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: 'File processing failed',
          error: error.message
        });
      }
    });
  };

  /**
   * Get file information
   */
  getFileInfo = (req: AuthenticatedRequest, res: Response) => {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        res.status(400).json({
          success: false,
          message: 'Filename is required'
        });
        return;
      }

      // Search for file in all upload directories
      const searchPaths = [
        path.join(UPLOAD_PATHS.IMAGES, filename),
        path.join(UPLOAD_PATHS.DOCUMENTS, filename),
        path.join(UPLOAD_PATHS.CSV, filename)
      ];

      let filePath = null;
      for (const searchPath of searchPaths) {
        if (fs.existsSync(searchPath)) {
          filePath = searchPath;
          break;
        }
      }

      if (!filePath) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
        return;
      }

      const stats = fs.statSync(filePath);
      
      res.json({
        success: true,
        data: {
          filename,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get file info',
        error: error.message
      });
    }
  };

  /**
   * Delete file
   */
  deleteFile = (req: AuthenticatedRequest, res: Response) => {
    try {
      const { filename } = req.params;
      
      if (!filename) {
        res.status(400).json({
          success: false,
          message: 'Filename is required'
        });
        return;
      }

      // Search for file in all upload directories
      const searchPaths = [
        path.join(UPLOAD_PATHS.IMAGES, filename),
        path.join(UPLOAD_PATHS.DOCUMENTS, filename),
        path.join(UPLOAD_PATHS.CSV, filename)
      ];

      let filePath = null;
      for (const searchPath of searchPaths) {
        if (fs.existsSync(searchPath)) {
          filePath = searchPath;
          break;
        }
      }

      if (!filePath) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
        return;
      }

      // Delete the main file
      fs.unlinkSync(filePath);

      // Also delete related files (thumbnails, optimized versions)
      const fileDir = path.dirname(filePath);
      const fileName = path.basename(filePath, path.extname(filePath));
      
      const relatedFiles = [
        path.join(fileDir, `${fileName}_thumb.webp`),
        path.join(fileDir, `${fileName}_optimized.webp`)
      ];

      relatedFiles.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error.message
      });
    }
  };

  /**
   * Process CSV file
   */
  private async processCSV(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      let headers: string[] = [];
      let isFirstRow = true;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          if (isFirstRow) {
            headers = Object.keys(data);
            isFirstRow = false;
          }
          results.push(data);
        })
        .on('end', () => {
          resolve({
            type: 'csv',
            headers,
            rows: results,
            totalRows: results.length,
            suggestedMapping: this.suggestCSVMapping(headers)
          });
        })
        .on('error', reject);
    });
  }

  /**
   * Process image file
   */
  private async processImage(filePath: string): Promise<any> {
    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      const fileDir = path.dirname(filePath);
      const fileName = path.basename(filePath, path.extname(filePath));
      
      // Create thumbnail (200x200)
      const thumbnailPath = path.join(fileDir, `${fileName}_thumb.webp`);
      await image
        .resize(200, 200, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);

      // Create optimized version (max 1200px width)
      const optimizedPath = path.join(fileDir, `${fileName}_optimized.webp`);
      await image
        .resize(1200, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 85 })
        .toFile(optimizedPath);

      return {
        type: 'image',
        dimensions: {
          width: metadata.width || 0,
          height: metadata.height || 0
        },
        format: metadata.format || 'unknown',
        thumbnailPath: path.basename(thumbnailPath),
        optimizedPath: path.basename(optimizedPath)
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error}`);
    }
  }

  /**
   * Suggest CSV field mapping
   */
  private suggestCSVMapping(headers: string[]): any {
    const mapping: any = {};
    
    headers.forEach(header => {
      const normalized = header.toLowerCase().trim();
      
      if (normalized.includes('title') || normalized.includes('name')) {
        mapping.title = header;
      } else if (normalized.includes('description') || normalized.includes('desc')) {
        mapping.description = header;
      } else if (normalized.includes('category') || normalized.includes('subject')) {
        mapping.category = header;
      } else if (normalized.includes('difficulty') || normalized.includes('level')) {
        mapping.difficulty = header;
      } else if (normalized.includes('tag') || normalized.includes('keyword')) {
        mapping.tags = header;
      }
    });

    return Object.keys(mapping).length > 0 ? mapping : null;
  }
}

export const fileUploadController = new FileUploadController();