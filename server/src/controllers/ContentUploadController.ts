/**
 * Content Upload Controller for Play & Learn Spark Backend
 * Handles file uploads, processing, and content generation
 */

import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';
import FileProcessingService from '../services/FileProcessingService';
import OpenAIService from '../services/OpenAIService';
import AnthropicService from '../services/AnthropicService';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${extension}`;
    cb(null, filename);
  }
});

// File filter for security
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'text/csv',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

// Configure multer with options
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_BYTES || '52428800'), // 50MB default
    files: 5 // Maximum 5 files per upload
  }
});

export class ContentUploadController {
  private fileProcessingService: FileProcessingService;
  private openaiService: OpenAIService;
  private anthropicService: AnthropicService;

  constructor() {
    this.fileProcessingService = FileProcessingService.getInstance();
    this.openaiService = OpenAIService.getInstance();
    this.anthropicService = AnthropicService.getInstance();
  }

  // Upload single file and process
  async uploadSingleFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      const { 
        ageGroup = '4-5', 
        language = 'English',
        generateActivity = 'true',
        extractText = 'true',
        generateThumbnail = 'true',
        aiProvider = 'openai'
      } = req.body;

      logger.info(`Processing uploaded file: ${req.file.originalname}`);

      // Validate file
      const validation = await this.fileProcessingService.validateFile(req.file.path);
      if (!validation.isValid) {
        // Clean up uploaded file
        await fs.unlink(req.file.path).catch(() => {});
        res.status(400).json({
          success: false,
          error: validation.error
        });
        return;
      }

      // Process file
      const processingResult = await this.fileProcessingService.processFile({
        filePath: req.file.path,
        fileType: validation.fileType,
        processingOptions: {
          extractText: extractText === 'true',
          generateThumbnail: generateThumbnail === 'true',
          ocrLanguage: language.toLowerCase(),
          maxFileSize: 50
        }
      });

      let generatedContent = null;
      
      // Generate educational activity if requested
      if (generateActivity === 'true' && processingResult.success && processingResult.extractedData.text) {
        try {
          const contentRequest = {
            topic: this.extractTopicFromText(processingResult.extractedData.text),
            ageGroup: ageGroup as '3-4' | '4-5' | '5-6',
            language,
            activityType: 'general' as const,
            difficulty: 'medium' as const,
            customPrompt: `Create an educational activity based on this content: ${processingResult.extractedData.text.substring(0, 500)}`
          };

          if (aiProvider === 'anthropic') {
            generatedContent = await this.anthropicService.generateContent(contentRequest);
          } else {
            generatedContent = await this.openaiService.generateContent(contentRequest);
          }
        } catch (error) {
          logger.warn('Activity generation failed:', error);
        }
      }

      // Extract educational insights
      const educationalContent = await this.fileProcessingService.extractEducationalContent(
        processingResult, 
        ageGroup
      );

      // Store file metadata (in production, save to database)
      const fileRecord = {
        id: this.generateFileId(),
        originalName: req.file.originalname,
        storedPath: req.file.path,
        processedAt: new Date().toISOString(),
        ageGroup,
        language,
        processingResult,
        educationalContent,
        generatedContent
      };

      res.json({
        success: true,
        data: {
          fileId: fileRecord.id,
          originalName: req.file.originalname,
          processing: processingResult,
          educational: educationalContent,
          generatedActivity: generatedContent,
          uploadedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('File upload error:', error);
      
      // Clean up file if it exists
      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  }

  // Upload multiple files and batch process
  async uploadMultipleFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No files uploaded'
        });
        return;
      }

      const { 
        ageGroup = '4-5', 
        language = 'English',
        generateActivities = 'true',
        aiProvider = 'openai'
      } = req.body;

      logger.info(`Processing ${files.length} uploaded files`);

      const results = [];
      const failedFiles = [];

      for (const file of files) {
        try {
          // Validate file
          const validation = await this.fileProcessingService.validateFile(file.path);
          if (!validation.isValid) {
            failedFiles.push({
              filename: file.originalname,
              error: validation.error
            });
            await fs.unlink(file.path).catch(() => {});
            continue;
          }

          // Process file
          const processingResult = await this.fileProcessingService.processFile({
            filePath: file.path,
            fileType: validation.fileType,
            processingOptions: {
              extractText: true,
              generateThumbnail: true,
              ocrLanguage: language.toLowerCase()
            }
          });

          if (processingResult.success) {
            const educationalContent = await this.fileProcessingService.extractEducationalContent(
              processingResult, 
              ageGroup
            );

            results.push({
              fileId: this.generateFileId(),
              originalName: file.originalname,
              processing: processingResult,
              educational: educationalContent
            });
          } else {
            failedFiles.push({
              filename: file.originalname,
              error: processingResult.error
            });
          }

        } catch (error) {
          failedFiles.push({
            filename: file.originalname,
            error: error instanceof Error ? error.message : 'Processing failed'
          });
          await fs.unlink(file.path).catch(() => {});
        }
      }

      // Generate batch activities if requested
      let batchActivities = null;
      if (generateActivities === 'true' && results.length > 0) {
        try {
          const combinedTopics = results
            .map(r => r.educational.topics)
            .flat()
            .slice(0, 5);

          if (combinedTopics.length > 0) {
            const contentRequest = {
              topic: combinedTopics.join(', '),
              ageGroup: ageGroup as '3-4' | '4-5' | '5-6',
              language,
              activityType: 'general' as const,
              difficulty: 'medium' as const,
              customPrompt: `Create a comprehensive educational activity covering these topics: ${combinedTopics.join(', ')}`
            };

            if (aiProvider === 'anthropic') {
              batchActivities = await this.anthropicService.generateContent(contentRequest);
            } else {
              batchActivities = await this.openaiService.generateContent(contentRequest);
            }
          }
        } catch (error) {
          logger.warn('Batch activity generation failed:', error);
        }
      }

      res.json({
        success: true,
        data: {
          processedFiles: results,
          failedFiles,
          totalProcessed: results.length,
          totalFailed: failedFiles.length,
          batchActivity: batchActivities,
          uploadedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Multiple file upload error:', error);
      
      // Clean up any uploaded files
      const files = req.files as Express.Multer.File[];
      if (files) {
        for (const file of files) {
          await fs.unlink(file.path).catch(() => {});
        }
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Batch upload failed'
      });
    }
  }

  // Generate activity from URL content
  async processUrlContent(req: Request, res: Response): Promise<void> {
    try {
      const { 
        url, 
        ageGroup = '4-5', 
        language = 'English',
        activityType = 'general',
        aiProvider = 'openai'
      } = req.body;

      if (!url) {
        res.status(400).json({
          success: false,
          error: 'URL is required'
        });
        return;
      }

      logger.info(`Processing URL content: ${url}`);

      // In production, implement web scraping with appropriate rate limiting and robots.txt respect
      // For now, return a mock response
      const mockContent = `Educational web content from ${url}
      
This webpage contains valuable learning materials about various topics suitable for children.
The content includes interactive elements, images, and text that can be adapted for educational activities.`;

      const contentRequest = {
        topic: this.extractTopicFromText(mockContent),
        ageGroup: ageGroup as '3-4' | '4-5' | '5-6',
        language,
        activityType: activityType as any,
        difficulty: 'medium' as const,
        customPrompt: `Create an educational activity based on this web content: ${mockContent}`
      };

      let generatedContent;
      if (aiProvider === 'anthropic') {
        generatedContent = await this.anthropicService.generateContent(contentRequest);
      } else {
        generatedContent = await this.openaiService.generateContent(contentRequest);
      }

      res.json({
        success: true,
        data: {
          sourceUrl: url,
          extractedContent: mockContent,
          generatedActivity: generatedContent,
          processedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('URL content processing error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'URL processing failed'
      });
    }
  }

  // Get file processing status
  async getFileStatus(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json({
          success: false,
          error: 'File ID is required'
        });
        return;
      }

      // In production, retrieve from database
      // For now, return mock status
      res.json({
        success: true,
        data: {
          fileId,
          status: 'completed',
          progress: 100,
          processedAt: new Date().toISOString(),
          message: 'File processing completed successfully'
        }
      });

    } catch (error) {
      logger.error('File status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get file status'
      });
    }
  }

  // Delete uploaded file
  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json({
          success: false,
          error: 'File ID is required'
        });
        return;
      }

      // In production, retrieve file path from database and delete
      logger.info(`Deleting file: ${fileId}`);

      res.json({
        success: true,
        data: {
          fileId,
          deleted: true,
          deletedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('File deletion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete file'
      });
    }
  }

  // Get upload statistics
  async getUploadStats(req: Request, res: Response): Promise<void> {
    try {
      const uploadDir = process.env.UPLOAD_PATH || './uploads';
      
      try {
        const files = await fs.readdir(uploadDir);
        const fileStats = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(uploadDir, file);
            const stats = await fs.stat(filePath);
            return {
              name: file,
              size: stats.size,
              modified: stats.mtime
            };
          })
        );

        const totalSize = fileStats.reduce((sum, file) => sum + file.size, 0);
        const totalSizeMB = totalSize / (1024 * 1024);

        res.json({
          success: true,
          data: {
            totalFiles: files.length,
            totalSizeMB: Math.round(totalSizeMB * 100) / 100,
            files: fileStats.slice(0, 10), // Return latest 10 files
            lastUpdated: new Date().toISOString()
          }
        });

      } catch (dirError) {
        res.json({
          success: true,
          data: {
            totalFiles: 0,
            totalSizeMB: 0,
            files: [],
            lastUpdated: new Date().toISOString()
          }
        });
      }

    } catch (error) {
      logger.error('Upload stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get upload statistics'
      });
    }
  }

  // Helper methods
  private extractTopicFromText(text: string): string {
    // Simple topic extraction
    const words = text.toLowerCase().split(/\s+/);
    const commonTopics = [
      'colors', 'shapes', 'numbers', 'animals', 'letters', 'family',
      'food', 'vehicles', 'weather', 'emotions', 'body', 'nature'
    ];

    const foundTopic = commonTopics.find(topic => 
      words.some(word => word.includes(topic.substring(0, 4)))
    );

    return foundTopic || 'learning';
  }

  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

export default ContentUploadController;