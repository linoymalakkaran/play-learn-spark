import { Request, Response } from 'express';
import { ActivityMongo } from '../models/ActivityMongo';
import { ActivityTemplate } from '../models/ActivityTemplate';
import { ActivityVersion } from '../models/ActivityVersion';
import { enhancedActivityService } from '../services/enhancedActivityService';
import { aiContentService } from '../services/aiContentService';
import { fileProcessingService } from '../services/fileProcessingService';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

export class ActivityController {
  // Enhanced activity creation with AI support
  async createActivity(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { useAI, templateId, aiParameters, ...activityData } = req.body;
      const userId = req.user?.id;

      let createdActivity;

      if (useAI && aiParameters) {
        // AI-assisted creation
        logger.info('Creating activity with AI assistance', { userId, aiParameters });
        
        const aiRequest = {
          type: 'activity' as const,
          prompt: aiParameters.prompt || 'Create an educational activity',
          parameters: {
            category: activityData.category || 'general',
            difficulty: activityData.difficulty || 'medium',
            ageRange: activityData.ageRange || { min: 6, max: 12 },
            language: activityData.language || 'en',
            contentType: activityData.contentType || 'text',
            duration: activityData.duration?.estimated || 15,
            objectives: activityData.objectives?.map((obj: any) => obj.description) || [],
            customRequirements: aiParameters.customRequirements
          },
          preferences: {
            provider: aiParameters.provider || 'openai',
            model: aiParameters.model,
            creativity: aiParameters.creativity || 0.7,
            formatStructured: true,
            includeImages: aiParameters.includeImages || false,
            includeAudio: aiParameters.includeAudio || false
          }
        };

        const aiResponse = await aiContentService.generateActivity(aiRequest);
        
        if (!aiResponse.success) {
          res.status(500).json({ 
            error: 'AI content generation failed', 
            details: aiResponse.error 
          });
          return;
        }

        // Merge AI content with user-provided data
        const mergedData = {
          ...aiResponse.content,
          ...activityData,
          createdBy: userId,
          aiGenerated: {
            isAiGenerated: true,
            humanReviewed: false,
            generatedAt: new Date(),
            provider: aiResponse.metadata.provider,
            model: aiResponse.metadata.model,
            confidence: aiResponse.metadata.confidence,
            tokensUsed: aiResponse.metadata.tokensUsed
          }
        };

        createdActivity = await enhancedActivityService.createActivity(mergedData);

      } else if (templateId) {
        // Template-based creation
        logger.info('Creating activity from template', { userId, templateId });
        
        const template = await ActivityTemplate.findById(templateId);
        if (!template) {
          res.status(404).json({ error: 'Template not found' });
          return;
        }

        const templateVariables = req.body.templateVariables || {};
        const generatedActivity = await template.generateActivity(templateVariables);
        
        const mergedData = {
          ...generatedActivity,
          ...activityData,
          createdBy: userId,
          metadata: {
            ...generatedActivity.metadata,
            templateId,
            templateVariables,
            createdFromTemplate: true
          }
        };

        createdActivity = await enhancedActivityService.createActivity(mergedData);

      } else {
        // Standard creation
        logger.info('Creating standard activity', { userId });
        createdActivity = await enhancedActivityService.createActivity({
          ...activityData,
          createdBy: userId
        });
      }

      res.status(201).json({
        success: true,
        activity: createdActivity,
        message: 'Activity created successfully'
      });

    } catch (error: any) {
      logger.error('Activity creation failed', { error: error.message, userId: req.user?.id });
      res.status(500).json({ 
        error: 'Failed to create activity', 
        details: error.message 
      });
    }
  }

  // Get enhanced activities with advanced filtering
  async getActivities(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        difficulty,
        ageMin,
        ageMax,
        language,
        contentType,
        tags,
        search,
        aiGenerated,
        hasAttachments,
        status,
        createdBy,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
        includeVersions = false
      } = req.query;

      const filters: any = {};

      // Build filter object
      if (category) filters.category = category;
      if (difficulty) filters.difficulty = difficulty;
      if (language) filters.language = language;
      if (contentType) filters.contentType = contentType;
      if (status) filters.status = status;
      if (createdBy) filters.createdBy = createdBy;
      
      if (ageMin || ageMax) {
        filters.ageRange = {};
        if (ageMin) filters.ageRange.min = { $gte: parseInt(ageMin as string) };
        if (ageMax) filters.ageRange.max = { $lte: parseInt(ageMax as string) };
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        filters.tags = { $in: tagArray };
      }

      if (search) {
        filters.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { 'objectives.description': { $regex: search, $options: 'i' } }
        ];
      }

      if (aiGenerated !== undefined) {
        filters['aiGenerated.isAiGenerated'] = aiGenerated === 'true';
      }

      if (hasAttachments !== undefined) {
        if (hasAttachments === 'true') {
          filters.attachments = { $exists: true, $not: { $size: 0 } };
        } else {
          filters.$or = [
            { attachments: { $exists: false } },
            { attachments: { $size: 0 } }
          ];
        }
      }

      // Pagination
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      // Sort
      const sortObj: any = {};
      sortObj[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      // Query
      let query = ActivityMongo.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'username email');

      if (includeVersions === 'true') {
        query = query.populate('versions');
      }

      const activities = await query.exec();
      const total = await ActivityMongo.countDocuments(filters);

      res.json({
        success: true,
        activities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      });

    } catch (error: any) {
      logger.error('Failed to fetch activities', { error: error.message });
      res.status(500).json({ 
        error: 'Failed to fetch activities', 
        details: error.message 
      });
    }
  }

  // Get single activity with full details
  async getActivity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { includeVersions = false, includeAnalytics = false } = req.query;

      let query = ActivityMongo.findById(id)
        .populate('createdBy', 'username email')
        .populate('sharedWith.user', 'username email');

      if (includeVersions === 'true') {
        query = query.populate('versions');
      }

      const activity = await query.exec();

      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }

      let analytics = null;
      if (includeAnalytics === 'true') {
        analytics = await enhancedActivityService.getActivityAnalytics(id);
      }

      res.json({
        success: true,
        activity,
        analytics
      });

    } catch (error: any) {
      logger.error('Failed to fetch activity', { error: error.message, activityId: req.params.id });
      res.status(500).json({ 
        error: 'Failed to fetch activity', 
        details: error.message 
      });
    }
  }

  // Update activity with version control
  async updateActivity(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { id } = req.params;
      const { createVersion = true, versionNotes, ...updateData } = req.body;
      const userId = req.user?.id;

      const activity = await ActivityMongo.findById(id);
      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }

      // Check permissions
      if (activity.createdBy.toString() !== userId) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      let updatedActivity;

      if (createVersion === true) {
        // Create new version using the schema method
        updatedActivity = await activity.createNewVersion(updateData);
      } else {
        // Update current version using service
        updatedActivity = await enhancedActivityService.updateActivity(id, updateData, userId);
      }

      res.json({
        success: true,
        activity: updatedActivity,
        message: createVersion ? 'New version created' : 'Activity updated'
      });

    } catch (error: any) {
      logger.error('Failed to update activity', { 
        error: error.message, 
        activityId: req.params.id,
        userId: req.user?.id
      });
      res.status(500).json({ 
        error: 'Failed to update activity', 
        details: error.message 
      });
    }
  }

  // Delete activity
  async deleteActivity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { permanent = false } = req.query;
      const userId = req.user?.id;

      const activity = await ActivityMongo.findById(id);
      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }

      // Check permissions
      if (activity.createdBy.toString() !== userId) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      await enhancedActivityService.deleteActivity(id, userId, permanent === 'true');

      res.json({
        success: true,
        message: permanent === 'true' ? 'Activity permanently deleted' : 'Activity archived'
      });

    } catch (error: any) {
      logger.error('Failed to delete activity', { 
        error: error.message, 
        activityId: req.params.id,
        userId: req.user?.id
      });
      res.status(500).json({ 
        error: 'Failed to delete activity', 
        details: error.message 
      });
    }
  }

  // Share activity
  async shareActivity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userIds, permission = 'view', message } = req.body;
      const userId = req.user?.id;

      const activity = await ActivityMongo.findById(id);
      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }

      // Check permissions
      if (activity.createdBy.toString() !== userId) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      await enhancedActivityService.shareActivity(id, userIds, permission, message);

      res.json({
        success: true,
        message: 'Activity shared successfully'
      });

    } catch (error: any) {
      logger.error('Failed to share activity', { 
        error: error.message, 
        activityId: req.params.id,
        userId: req.user?.id
      });
      res.status(500).json({ 
        error: 'Failed to share activity', 
        details: error.message 
      });
    }
  }

  // Duplicate activity
  async duplicateActivity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, includeVersions = false } = req.body;
      const userId = req.user?.id;

      const activity = await ActivityMongo.findById(id);
      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }

      // Check view permissions - basic permission check
      if (activity.createdBy.toString() !== userId && !activity.sharing?.isPublic) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      const duplicatedActivity = await enhancedActivityService.duplicateActivity(id, title, userId);

      res.status(201).json({
        success: true,
        activity: duplicatedActivity,
        message: 'Activity duplicated successfully'
      });

    } catch (error: any) {
      logger.error('Failed to duplicate activity', { 
        error: error.message, 
        activityId: req.params.id,
        userId: req.user?.id
      });
      res.status(500).json({ 
        error: 'Failed to duplicate activity', 
        details: error.message 
      });
    }
  }

  // File upload handler
  async uploadFiles(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const processedFiles = [];

      for (const file of files) {
        if ('fieldname' in file && 'originalname' in file) { // Express.Multer.File
          const processedFile = await fileProcessingService.processUploadedFile(file);
          processedFiles.push(processedFile);
        }
      }

      res.json({
        success: true,
        files: processedFiles,
        message: `${processedFiles.length} files uploaded successfully`
      });

    } catch (error: any) {
      logger.error('File upload failed', { error: error.message, userId: req.user?.id });
      res.status(500).json({ 
        error: 'File upload failed', 
        details: error.message 
      });
    }
  }

  // Bulk import activities from files
  async bulkImport(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        res.status(400).json({ error: 'No files uploaded for import' });
        return;
      }

      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const validFiles = files.filter(file => 'fieldname' in file && 'originalname' in file) as Express.Multer.File[];
      const userId = req.user?.id;

      if (validFiles.length === 0) {
        res.status(400).json({ error: 'No valid files for import' });
        return;
      }

      const result = await fileProcessingService.bulkImportActivities(validFiles, userId);

      const statusCode = result.success ? 200 : 207; // 207 = Multi-Status

      res.status(statusCode).json({
        success: result.success,
        result,
        message: `Import completed: ${result.processed} activities created, ${result.failed} failed`
      });

    } catch (error: any) {
      logger.error('Bulk import failed', { error: error.message, userId: req.user?.id });
      res.status(500).json({ 
        error: 'Bulk import failed', 
        details: error.message 
      });
    }
  }

  // AI content generation
  async generateAIContent(req: Request, res: Response): Promise<void> {
    try {
      const aiRequest = req.body;
      const userId = req.user?.id;

      logger.info('AI content generation requested', { userId, type: aiRequest.type });

      const result = await aiContentService.generateActivity(aiRequest);

      res.json({
        success: result.success,
        content: result.content,
        metadata: result.metadata,
        suggestions: result.suggestions,
        error: result.error
      });

    } catch (error: any) {
      logger.error('AI content generation failed', { error: error.message, userId: req.user?.id });
      res.status(500).json({ 
        error: 'AI content generation failed', 
        details: error.message 
      });
    }
  }

  // Enhance existing activity with AI
  async enhanceWithAI(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { enhancementType } = req.body;
      const userId = req.user?.id;

      const activity = await ActivityMongo.findById(id);
      if (!activity) {
        res.status(404).json({ error: 'Activity not found' });
        return;
      }

      if (activity.createdBy.toString() !== userId) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      const result = await aiContentService.enhanceExistingActivity(id, enhancementType);

      res.json({
        success: result.success,
        enhanced: result.content,
        metadata: result.metadata,
        suggestions: result.suggestions,
        error: result.error
      });

    } catch (error: any) {
      logger.error('AI enhancement failed', { 
        error: error.message, 
        activityId: req.params.id,
        userId: req.user?.id
      });
      res.status(500).json({ 
        error: 'AI enhancement failed', 
        details: error.message 
      });
    }
  }

  // Get activity analytics
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { dateRange = '30d' } = req.query;

      const analytics = await enhancedActivityService.getActivityAnalytics(id, dateRange as string);

      res.json({
        success: true,
        analytics
      });

    } catch (error: any) {
      logger.error('Failed to fetch analytics', { 
        error: error.message, 
        activityId: req.params.id
      });
      res.status(500).json({ 
        error: 'Failed to fetch analytics', 
        details: error.message 
      });
    }
  }
}

export const activityController = new ActivityController();