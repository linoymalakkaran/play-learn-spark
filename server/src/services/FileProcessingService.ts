/**
 * File Processing Service for Play & Learn Spark Backend
 * Handles processing of PDF, CSV, images with OCR capabilities
 */

import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

export interface FileProcessingRequest {
  filePath: string;
  fileType: 'pdf' | 'csv' | 'image' | 'unknown';
  processingOptions?: {
    extractText?: boolean;
    generateThumbnail?: boolean;
    ocrLanguage?: string;
    csvDelimiter?: string;
    maxFileSize?: number; // in MB
  };
}

export interface ProcessingResult {
  success: boolean;
  fileInfo: {
    originalName: string;
    size: number;
    type: string;
    processedAt: string;
  };
  extractedData: {
    text?: string;
    metadata?: Record<string, any>;
    thumbnail?: string;
    structuredData?: any[];
    ocrResult?: {
      confidence: number;
      text: string;
      language: string;
    };
  };
  error?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

class FileProcessingService {
  private static instance: FileProcessingService;
  private uploadsDir: string;
  private maxFileSizeMB: number = 50;
  private allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  private allowedDocTypes = ['pdf', 'csv', 'txt'];

  private constructor() {
    this.uploadsDir = process.env.UPLOAD_PATH || './uploads';
    this.maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '50');
  }

  static getInstance(): FileProcessingService {
    if (!FileProcessingService.instance) {
      FileProcessingService.instance = new FileProcessingService();
    }
    return FileProcessingService.instance;
  }

  async processFile(request: FileProcessingRequest): Promise<ProcessingResult> {
    try {
      logger.info(`Processing file: ${request.filePath}, type: ${request.fileType}`);

      // Validate file exists and size
      const fileStats = await fs.stat(request.filePath);
      const fileSizeMB = fileStats.size / (1024 * 1024);

      if (fileSizeMB > (request.processingOptions?.maxFileSize || this.maxFileSizeMB)) {
        throw new Error(`File size (${fileSizeMB.toFixed(2)}MB) exceeds limit`);
      }

      const result: ProcessingResult = {
        success: true,
        fileInfo: {
          originalName: path.basename(request.filePath),
          size: fileStats.size,
          type: request.fileType,
          processedAt: new Date().toISOString()
        },
        extractedData: {}
      };

      // Process based on file type
      switch (request.fileType) {
        case 'pdf':
          await this.processPDF(request, result);
          break;
        case 'csv':
          await this.processCSV(request, result);
          break;
        case 'image':
          await this.processImage(request, result);
          break;
        default:
          await this.processGenericFile(request, result);
          break;
      }

      logger.info(`File processing completed successfully: ${request.filePath}`);
      return result;

    } catch (error) {
      logger.error('File processing failed:', error);
      return {
        success: false,
        fileInfo: {
          originalName: path.basename(request.filePath),
          size: 0,
          type: request.fileType,
          processedAt: new Date().toISOString()
        },
        extractedData: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async processMultipleFiles(requests: FileProcessingRequest[]): Promise<ProcessingResult[]> {
    logger.info(`Processing ${requests.length} files`);
    
    const results = await Promise.allSettled(
      requests.map(request => this.processFile(request))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          fileInfo: {
            originalName: path.basename(requests[index].filePath),
            size: 0,
            type: requests[index].fileType,
            processedAt: new Date().toISOString()
          },
          extractedData: {},
          error: result.reason?.message || 'Processing failed'
        };
      }
    });
  }

  private async processPDF(request: FileProcessingRequest, result: ProcessingResult): Promise<void> {
    try {
      // Mock PDF processing - in production, use pdf-parse or similar
      const fileBuffer = await fs.readFile(request.filePath);
      
      // Simulate PDF text extraction
      const mockText = `Educational content extracted from PDF: ${path.basename(request.filePath)}
      
This document contains learning materials suitable for children aged 3-6.
Topics covered include: colors, shapes, numbers, and basic literacy.
      
The content has been processed and is ready for educational activity generation.`;

      result.extractedData.text = mockText;
      result.extractedData.metadata = {
        pages: Math.floor(Math.random() * 10) + 1,
        extractionMethod: 'pdf-mock-parser',
        hasImages: Math.random() > 0.5,
        wordCount: mockText.split(' ').length
      };

      if (request.processingOptions?.generateThumbnail) {
        result.extractedData.thumbnail = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      }

    } catch (error) {
      throw new Error(`PDF processing failed: ${error}`);
    }
  }

  private async processCSV(request: FileProcessingRequest, result: ProcessingResult): Promise<void> {
    try {
      const fileContent = await fs.readFile(request.filePath, 'utf-8');
      const delimiter = request.processingOptions?.csvDelimiter || ',';
      
      // Basic CSV parsing
      const lines = fileContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
      
      const data = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      result.extractedData.structuredData = data;
      result.extractedData.metadata = {
        rowCount: data.length,
        columnCount: headers.length,
        headers,
        delimiter,
        extractionMethod: 'csv-parser'
      };

      // Generate text summary
      result.extractedData.text = `CSV Data Summary:
- Total rows: ${data.length}
- Columns: ${headers.join(', ')}
- Sample data available for educational content generation`;

    } catch (error) {
      throw new Error(`CSV processing failed: ${error}`);
    }
  }

  private async processImage(request: FileProcessingRequest, result: ProcessingResult): Promise<void> {
    try {
      const fileBuffer = await fs.readFile(request.filePath);
      
      // Mock OCR processing - in production, use Tesseract.js or cloud OCR
      if (request.processingOptions?.extractText) {
        const ocrResult = await this.performOCR(fileBuffer, request.processingOptions.ocrLanguage);
        result.extractedData.ocrResult = ocrResult;
        result.extractedData.text = ocrResult.text;
      }

      // Generate thumbnail
      if (request.processingOptions?.generateThumbnail) {
        result.extractedData.thumbnail = await this.generateThumbnail(fileBuffer);
      }

      result.extractedData.metadata = {
        imageType: path.extname(request.filePath).substring(1),
        size: fileBuffer.length,
        extractionMethod: 'image-processor',
        hasOCR: !!request.processingOptions?.extractText
      };

    } catch (error) {
      throw new Error(`Image processing failed: ${error}`);
    }
  }

  private async processGenericFile(request: FileProcessingRequest, result: ProcessingResult): Promise<void> {
    try {
      const fileBuffer = await fs.readFile(request.filePath);
      const extension = path.extname(request.filePath).substring(1).toLowerCase();

      if (extension === 'txt') {
        result.extractedData.text = fileBuffer.toString('utf-8');
        result.extractedData.metadata = {
          encoding: 'utf-8',
          lineCount: result.extractedData.text.split('\n').length,
          wordCount: result.extractedData.text.split(' ').length
        };
      } else {
        result.extractedData.metadata = {
          fileType: extension,
          size: fileBuffer.length,
          extractionMethod: 'generic-processor'
        };
        result.extractedData.text = `File processed: ${path.basename(request.filePath)}`;
      }

    } catch (error) {
      throw new Error(`Generic file processing failed: ${error}`);
    }
  }

  private async performOCR(imageBuffer: Buffer, language?: string): Promise<OCRResult> {
    // Mock OCR implementation - in production, integrate with Tesseract.js
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time

    const mockText = `Learning Activity
    
Count the objects:
🐻 🐻 🐻
🎨 🎨
📚

How many bears do you see?
A) 2  B) 3  C) 4

Educational content suitable for ages 3-6.`;

    return {
      text: mockText,
      confidence: 0.85,
      language: language || 'en',
      words: [
        { text: 'Learning', confidence: 0.9, bbox: { x0: 10, y0: 10, x1: 80, y1: 30 } },
        { text: 'Activity', confidence: 0.8, bbox: { x0: 90, y0: 10, x1: 150, y1: 30 } },
        { text: 'Count', confidence: 0.95, bbox: { x0: 10, y0: 50, x1: 60, y1: 70 } }
      ]
    };
  }

  private async generateThumbnail(imageBuffer: Buffer): Promise<string> {
    // Mock thumbnail generation - in production, use sharp or similar
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a small placeholder image as base64
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  async validateFile(filePath: string): Promise<{
    isValid: boolean;
    fileType: 'pdf' | 'csv' | 'image' | 'unknown';
    error?: string;
  }> {
    try {
      const stats = await fs.stat(filePath);
      const extension = path.extname(filePath).substring(1).toLowerCase();
      
      // Check file size
      const sizeMB = stats.size / (1024 * 1024);
      if (sizeMB > this.maxFileSizeMB) {
        return {
          isValid: false,
          fileType: 'unknown',
          error: `File too large: ${sizeMB.toFixed(2)}MB (max: ${this.maxFileSizeMB}MB)`
        };
      }

      // Determine file type
      let fileType: 'pdf' | 'csv' | 'image' | 'unknown' = 'unknown';
      
      if (extension === 'pdf') {
        fileType = 'pdf';
      } else if (extension === 'csv') {
        fileType = 'csv';
      } else if (this.allowedImageTypes.includes(extension)) {
        fileType = 'image';
      } else if (!this.allowedDocTypes.includes(extension)) {
        return {
          isValid: false,
          fileType: 'unknown',
          error: `Unsupported file type: ${extension}`
        };
      }

      return {
        isValid: true,
        fileType
      };

    } catch (error) {
      return {
        isValid: false,
        fileType: 'unknown',
        error: `File validation failed: ${error}`
      };
    }
  }

  async cleanupOldFiles(maxAgeDays: number = 7): Promise<{
    deletedCount: number;
    freedSpaceMB: number;
  }> {
    try {
      const files = await fs.readdir(this.uploadsDir);
      const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
      
      let deletedCount = 0;
      let freedSpaceMB = 0;

      for (const file of files) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          freedSpaceMB += stats.size / (1024 * 1024);
          await fs.unlink(filePath);
          deletedCount++;
        }
      }

      logger.info(`Cleanup completed: ${deletedCount} files deleted, ${freedSpaceMB.toFixed(2)}MB freed`);
      
      return { deletedCount, freedSpaceMB };

    } catch (error) {
      logger.error('File cleanup failed:', error);
      return { deletedCount: 0, freedSpaceMB: 0 };
    }
  }

  // Helper method to extract educational content from processed files
  async extractEducationalContent(
    result: ProcessingResult, 
    targetAge: string
  ): Promise<{
    topics: string[];
    concepts: string[];
    suggestedActivities: string[];
    readabilityScore: number;
  }> {
    const text = result.extractedData.text || '';
    
    // Simple keyword extraction for educational content
    const educationalKeywords = [
      'color', 'colors', 'shape', 'shapes', 'number', 'numbers', 'count', 'counting',
      'letter', 'letters', 'animal', 'animals', 'family', 'friend', 'friends',
      'learn', 'learning', 'practice', 'exercise', 'activity', 'fun'
    ];

    const foundTopics = educationalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );

    return {
      topics: foundTopics.slice(0, 5),
      concepts: [
        'Basic Recognition',
        'Pattern Identification', 
        'Vocabulary Building',
        'Visual Learning'
      ],
      suggestedActivities: [
        'Matching Game',
        'Counting Exercise',
        'Color Recognition',
        'Story Reading'
      ],
      readabilityScore: this.calculateReadabilityScore(text, targetAge)
    };
  }

  private calculateReadabilityScore(text: string, targetAge: string): number {
    // Simple readability calculation based on sentence and word length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Age-based scoring (simplified)
    const ageMultiplier = targetAge.includes('3-4') ? 0.5 : 
                         targetAge.includes('4-5') ? 0.7 : 0.9;
    
    // Lower scores are better for young children
    const complexity = (avgWordsPerSentence * 0.5) + (avgCharsPerWord * 0.3);
    const readabilityScore = Math.max(0, Math.min(10, 10 - (complexity * ageMultiplier)));
    
    return Math.round(readabilityScore * 10) / 10;
  }
}

export default FileProcessingService;