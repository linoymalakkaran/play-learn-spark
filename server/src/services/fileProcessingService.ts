import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { ActivityMongo } from '../models/ActivityMongo';
import { logger } from '../utils/logger';

// Optional dependencies - will be loaded if available
let sharp: any = null;
let ffmpeg: any = null;

// Try to load optional dependencies
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('Sharp not available - image processing disabled');
}

try {
  ffmpeg = require('fluent-ffmpeg');
} catch (e) {
  console.warn('FFmpeg not available - video processing disabled');
}

export interface FileUploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadPath: string;
  processingOptions?: {
    generateThumbnails?: boolean;
    compressImages?: boolean;
    extractText?: boolean;
    validateContent?: boolean;
  };
}

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
    encoding?: string;
    thumbnails?: string[];
    extractedText?: string;
    rows?: number;
    columns?: number;
    sample?: any[];
    lines?: number;
    characters?: number;
  };
  processed: boolean;
  errors?: string[];
}

export interface BulkImportResult {
  success: boolean;
  totalFiles: number;
  processed: number;
  failed: number;
  activities: string[]; // Array of created activity IDs
  errors: { file: string; error: string }[];
  warnings: string[];
}

export class FileProcessingService {
  private config: FileUploadConfig;
  private uploadStorage!: multer.StorageEngine;

  constructor() {
    this.config = {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/csv', 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'application/json'
      ],
      uploadPath: path.join(process.cwd(), 'uploads'),
      processingOptions: {
        generateThumbnails: true,
        compressImages: true,
        extractText: true,
        validateContent: true
      }
    };

    this.initializeStorage();
    this.ensureUploadDirectories();
  }

  private initializeStorage(): void {
    this.uploadStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        const subfolder = this.getSubfolderByType(file.mimetype);
        const uploadPath = path.join(this.config.uploadPath, subfolder);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });
  }

  private getSubfolderByType(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'images';
    if (mimetype.startsWith('video/')) return 'videos';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('pdf')) return 'documents';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'documents';
    if (mimetype.includes('csv') || mimetype.includes('excel') || mimetype.includes('sheet')) return 'csv';
    return 'content';
  }

  private async ensureUploadDirectories(): Promise<void> {
    const directories = ['images', 'videos', 'audio', 'documents', 'csv', 'content', 'thumbnails'];
    
    for (const dir of directories) {
      const dirPath = path.join(this.config.uploadPath, dir);
      try {
        await fs.access(dirPath);
      } catch {
        await fs.mkdir(dirPath, { recursive: true });
      }
    }
  }

  getMulterUpload() {
    return multer({
      storage: this.uploadStorage,
      limits: {
        fileSize: this.config.maxFileSize,
        files: 10 // Maximum 10 files per upload
      },
      fileFilter: (req, file, cb) => {
        if (this.config.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${file.mimetype} not allowed`));
        }
      }
    });
  }

  async processUploadedFile(file: Express.Multer.File): Promise<UploadedFile> {
    const uploadedFile: UploadedFile = {
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${this.getSubfolderByType(file.mimetype)}/${file.filename}`,
      processed: false,
      errors: []
    };

    try {
      logger.info('Processing uploaded file', { file: uploadedFile });

      // Process based on file type
      if (file.mimetype.startsWith('image/')) {
        uploadedFile.metadata = await this.processImage(file.path);
      } else if (file.mimetype.startsWith('video/')) {
        uploadedFile.metadata = await this.processVideo(file.path);
      } else if (file.mimetype.startsWith('audio/')) {
        uploadedFile.metadata = await this.processAudio(file.path);
      } else if (file.mimetype.includes('pdf')) {
        uploadedFile.metadata = await this.processPDF(file.path);
      } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
        uploadedFile.metadata = await this.processDocument(file.path);
      } else if (file.mimetype.includes('csv') || file.mimetype.includes('excel')) {
        uploadedFile.metadata = await this.processSpreadsheet(file.path);
      } else if (file.mimetype === 'text/plain') {
        uploadedFile.metadata = await this.processTextFile(file.path);
      }

      uploadedFile.processed = true;
      logger.info('File processed successfully', { fileId: uploadedFile.id });

    } catch (error: any) {
      logger.error('File processing failed', { error: error.message, file: uploadedFile });
      uploadedFile.errors?.push(error.message);
    }

    return uploadedFile;
  }

  private async processImage(filePath: string): Promise<any> {
    const metadata: any = {};

    try {
      // Get image metadata
      const imageInfo = await sharp(filePath).metadata();
      metadata.width = imageInfo.width;
      metadata.height = imageInfo.height;

      // Generate thumbnail if enabled
      if (this.config.processingOptions?.generateThumbnails) {
        const thumbnailPath = await this.generateImageThumbnail(filePath);
        metadata.thumbnails = [thumbnailPath];
      }

      // Compress image if enabled and large
      if (this.config.processingOptions?.compressImages && metadata.width > 1920) {
        await this.compressImage(filePath);
      }

    } catch (error: any) {
      logger.error('Image processing failed', { error: error.message, filePath });
    }

    return metadata;
  }

  private async generateImageThumbnail(filePath: string): Promise<string> {
    const filename = path.basename(filePath, path.extname(filePath));
    const thumbnailPath = path.join(this.config.uploadPath, 'thumbnails', `${filename}_thumb.jpg`);

    await sharp(filePath)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return `/uploads/thumbnails/${path.basename(thumbnailPath)}`;
  }

  private async compressImage(filePath: string): Promise<void> {
    const tempPath = `${filePath}.compressed`;

    await sharp(filePath)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(tempPath);

    // Replace original with compressed version
    await fs.rename(tempPath, filePath);
  }

  private async processVideo(filePath: string): Promise<any> {
    if (!ffmpeg) {
      return { error: 'Video processing not available' };
    }

    return new Promise((resolve, reject) => {
      const metadata: any = {};

      ffmpeg.ffprobe(filePath, (err: any, data: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (data.format) {
          metadata.duration = data.format.duration;
        }

        if (data.streams) {
          const videoStream = data.streams.find((s: any) => s.codec_type === 'video');
          if (videoStream) {
            metadata.width = videoStream.width;
            metadata.height = videoStream.height;
          }
        }

        // Generate video thumbnail
        if (this.config.processingOptions?.generateThumbnails) {
          this.generateVideoThumbnail(filePath)
            .then(thumbnailPath => {
              metadata.thumbnails = [thumbnailPath];
              resolve(metadata);
            })
            .catch(() => resolve(metadata));
        } else {
          resolve(metadata);
        }
      });
    });
  }

  private async generateVideoThumbnail(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const filename = path.basename(filePath, path.extname(filePath));
      const thumbnailPath = path.join(this.config.uploadPath, 'thumbnails', `${filename}_thumb.jpg`);

      ffmpeg(filePath)
        .screenshots({
          timestamps: ['10%'],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '300x300'
        })
        .on('end', () => {
          resolve(`/uploads/thumbnails/${path.basename(thumbnailPath)}`);
        })
        .on('error', reject);
    });
  }

  private async processAudio(filePath: string): Promise<any> {
    if (!ffmpeg) {
      return { error: 'Audio processing not available' };
    }

    return new Promise((resolve, reject) => {
      const metadata: any = {};

      ffmpeg.ffprobe(filePath, (err: any, data: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (data.format) {
          metadata.duration = data.format.duration;
        }

        resolve(metadata);
      });
    });
  }

  private async processPDF(filePath: string): Promise<any> {
    const metadata: any = {};

    try {
      // Basic PDF processing without external dependencies
      const fileBuffer = await fs.readFile(filePath);
      const pageMatches = fileBuffer.toString('latin1').match(/\/Type\s*\/Page[^s]/g);
      metadata.pages = pageMatches ? pageMatches.length : 1;

      // Note: Thumbnail generation would require pdf2pic library
      metadata.info = 'PDF processing available - thumbnail generation requires additional setup';

    } catch (error: any) {
      logger.error('PDF processing failed', { error: error.message, filePath });
    }

    return metadata;
  }

  private async processDocument(filePath: string): Promise<any> {
    const metadata: any = {};

    try {
      // Basic document processing - would need mammoth for full text extraction
      const stats = await fs.stat(filePath);
      metadata.size = stats.size;
      metadata.info = 'Document processing available - text extraction requires additional setup';
      
    } catch (error: any) {
      logger.error('Document processing failed', { error: error.message, filePath });
    }

    return metadata;
  }

  private async processSpreadsheet(filePath: string): Promise<any> {
    const metadata: any = {};

    try {
      // Basic CSV processing without external library
      if (path.extname(filePath).toLowerCase() === '.csv') {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          metadata.rows = lines.length - 1; // Exclude header
          metadata.columns = headers.length;
          
          // Create sample data (first few rows)
          const sampleData = [];
          for (let i = 1; i < Math.min(6, lines.length); i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            sampleData.push(row);
          }
          metadata.sample = sampleData;
        }
      } else {
        metadata.info = 'Excel file processing requires additional setup';
      }
      
    } catch (error: any) {
      logger.error('Spreadsheet processing failed', { error: error.message, filePath });
    }

    return metadata;
  }

  private async processTextFile(filePath: string): Promise<any> {
    const metadata: any = {};

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      metadata.encoding = 'utf-8';
      metadata.lines = content.split('\n').length;
      metadata.characters = content.length;
      
      if (this.config.processingOptions?.extractText) {
        metadata.extractedText = content.substring(0, 5000);
      }
    } catch (error: any) {
      logger.error('Text file processing failed', { error: error.message, filePath });
    }

    return metadata;
  }

  async bulkImportActivities(files: Express.Multer.File[], userId: string): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      success: false,
      totalFiles: files.length,
      processed: 0,
      failed: 0,
      activities: [],
      errors: [],
      warnings: []
    };

    try {
      logger.info('Starting bulk import', { totalFiles: files.length, userId });

      for (const file of files) {
        try {
          const processedFile = await this.processUploadedFile(file);
          
          // Try to create activity from file
          const activity = await this.createActivityFromFile(processedFile, userId);
          
          if (activity) {
            result.activities.push(activity.id);
            result.processed++;
          } else {
            result.warnings.push(`Could not create activity from ${file.originalname}`);
          }

        } catch (error: any) {
          logger.error('Failed to process file in bulk import', { 
            error: error.message, 
            file: file.originalname 
          });
          
          result.errors.push({
            file: file.originalname,
            error: error.message
          });
          result.failed++;
        }
      }

      result.success = result.processed > 0;
      logger.info('Bulk import completed', result);

    } catch (error: any) {
      logger.error('Bulk import failed', { error: error.message });
      result.errors.push({
        file: 'bulk_import',
        error: error.message
      });
    }

    return result;
  }

  private async createActivityFromFile(file: UploadedFile, userId: string): Promise<any> {
    let activityData: any = null;

    // Try to extract activity data based on file type
    if (file.mimetype.includes('csv') && file.metadata?.sample && file.metadata.sample.length > 0) {
      activityData = await this.parseActivityFromCSV(file);
    } else if (file.mimetype.includes('json')) {
      activityData = await this.parseActivityFromJSON(file);
    } else if (file.metadata?.extractedText) {
      activityData = await this.parseActivityFromText(file);
    } else if (file.mimetype.startsWith('image/')) {
      activityData = await this.createImageBasedActivity(file);
    }

    if (!activityData) {
      return null;
    }

    // Create the activity
    const activity = new ActivityMongo({
      ...activityData,
      createdBy: userId,
      attachments: [{
        fileId: file.id,
        filename: file.originalName,
        mimetype: file.mimetype,
        url: file.url,
        size: file.size
      }],
      metadata: {
        importedFromFile: true,
        originalFilename: file.originalName,
        importedAt: new Date()
      }
    });

    return await activity.save();
  }

  private async parseActivityFromCSV(file: UploadedFile): Promise<any | null> {
    try {
      if (!file.metadata?.sample || file.metadata.sample.length === 0) {
        return null;
      }

      const sample = file.metadata.sample[0];
      
      // Look for common activity fields in CSV headers
      const titleField = this.findCSVField(sample, ['title', 'name', 'activity_name']);
      const descriptionField = this.findCSVField(sample, ['description', 'desc', 'summary']);
      const categoryField = this.findCSVField(sample, ['category', 'subject', 'type']);
      const difficultyField = this.findCSVField(sample, ['difficulty', 'level', 'grade']);

      if (!titleField) {
        return null; // Cannot create activity without title
      }

      return {
        title: sample[titleField],
        description: sample[descriptionField] || 'Imported from CSV file',
        category: sample[categoryField] || 'general',
        difficulty: sample[difficultyField] || 'medium',
        contentType: 'text',
        language: 'en',
        ageRange: { min: 6, max: 12 },
        duration: { estimated: 15, minimum: 10, maximum: 30 },
        objectives: [{
          id: 'obj_1',
          description: 'Complete the imported activity',
          bloomLevel: 'understand',
          measurable: true
        }],
        contentData: {
          introduction: sample[descriptionField] || 'Activity imported from file',
          mainActivity: 'Follow the activity instructions',
          assessment: 'Complete the activity tasks',
          conclusion: 'Review what was learned'
        }
      };
    } catch (error: any) {
      logger.error('Failed to parse activity from CSV', { error: error.message });
      return null;
    }
  }

  private findCSVField(row: any, possibleNames: string[]): string | null {
    const keys = Object.keys(row).map(k => k.toLowerCase());
    
    for (const name of possibleNames) {
      const found = keys.find(key => key.includes(name.toLowerCase()));
      if (found) {
        // Return original case key
        return Object.keys(row).find(k => k.toLowerCase() === found) || null;
      }
    }
    
    return null;
  }

  private async parseActivityFromJSON(file: UploadedFile): Promise<any | null> {
    try {
      const content = await fs.readFile(file.path, 'utf-8');
      const data = JSON.parse(content);

      // Validate that it looks like an activity
      if (data.title || data.name) {
        return {
          title: data.title || data.name,
          description: data.description || 'Imported from JSON file',
          category: data.category || data.subject || 'general',
          difficulty: data.difficulty || data.level || 'medium',
          contentType: data.contentType || 'text',
          language: data.language || 'en',
          ageRange: data.ageRange || { min: 6, max: 12 },
          duration: data.duration || { estimated: 15, minimum: 10, maximum: 30 },
          objectives: data.objectives || [{
            id: 'obj_1',
            description: 'Complete the imported activity',
            bloomLevel: 'understand',
            measurable: true
          }],
          contentData: data.contentData || data.content || {
            introduction: data.description || 'Activity imported from file',
            mainActivity: data.instructions || 'Follow the activity instructions',
            assessment: 'Complete the activity tasks',
            conclusion: 'Review what was learned'
          }
        };
      }
      
      return null;
    } catch (error: any) {
      logger.error('Failed to parse activity from JSON', { error: error.message });
      return null;
    }
  }

  private async parseActivityFromText(file: UploadedFile): Promise<any | null> {
    try {
      if (!file.metadata?.extractedText) {
        return null;
      }

      const text = file.metadata.extractedText;
      const lines = text.split('\n').filter(line => line.trim());

      // Try to extract title (first non-empty line)
      const title = lines[0]?.trim() || file.originalName.replace(/\.[^/.]+$/, '');

      return {
        title,
        description: 'Activity imported from text file',
        category: 'reading',
        difficulty: 'medium',
        contentType: 'text',
        language: 'en',
        ageRange: { min: 8, max: 14 },
        duration: { estimated: 20, minimum: 15, maximum: 30 },
        objectives: [{
          id: 'obj_1',
          description: 'Read and understand the text content',
          bloomLevel: 'understand',
          measurable: true
        }],
        contentData: {
          introduction: 'Read through the following text content',
          mainActivity: text.substring(0, 2000), // Limit content size
          assessment: 'Answer questions about the text',
          conclusion: 'Discuss what was learned from the reading'
        }
      };
    } catch (error: any) {
      logger.error('Failed to parse activity from text', { error: error.message });
      return null;
    }
  }

  private async createImageBasedActivity(file: UploadedFile): Promise<any | null> {
    try {
      const title = file.originalName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

      return {
        title: `Image Activity: ${title}`,
        description: 'Activity based on uploaded image',
        category: 'visual',
        difficulty: 'easy',
        contentType: 'image',
        language: 'en',
        ageRange: { min: 5, max: 10 },
        duration: { estimated: 10, minimum: 5, maximum: 20 },
        objectives: [{
          id: 'obj_1',
          description: 'Observe and describe the image',
          bloomLevel: 'understand',
          measurable: true
        }],
        contentData: {
          introduction: 'Look carefully at the image',
          mainActivity: 'Describe what you see in the image and answer questions about it',
          assessment: 'Share your observations with others',
          conclusion: 'Reflect on what you learned from the image'
        },
        multimedia: {
          images: [file.url],
          thumbnails: file.metadata?.thumbnails || []
        }
      };
    } catch (error: any) {
      logger.error('Failed to create image-based activity', { error: error.message });
      return null;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      
      // Also delete thumbnails if they exist
      const filename = path.basename(filePath, path.extname(filePath));
      const thumbnailPath = path.join(this.config.uploadPath, 'thumbnails', `${filename}_thumb.jpg`);
      
      try {
        await fs.unlink(thumbnailPath);
      } catch {
        // Thumbnail might not exist, ignore error
      }
      
    } catch (error: any) {
      logger.error('Failed to delete file', { error: error.message, filePath });
      throw error;
    }
  }

  async cleanupOldFiles(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const directories = ['images', 'videos', 'audio', 'documents', 'csv', 'content', 'thumbnails'];
      
      for (const dir of directories) {
        const dirPath = path.join(this.config.uploadPath, dir);
        
        try {
          const files = await fs.readdir(dirPath);
          
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = await fs.stat(filePath);
            
            if (stats.mtime < cutoffDate) {
              await fs.unlink(filePath);
              logger.info('Deleted old file', { filePath });
            }
          }
        } catch (error: any) {
          logger.error('Failed to cleanup directory', { error: error.message, directory: dir });
        }
      }
    } catch (error: any) {
      logger.error('Failed to cleanup old files', { error: error.message });
    }
  }
}

export const fileProcessingService = new FileProcessingService();