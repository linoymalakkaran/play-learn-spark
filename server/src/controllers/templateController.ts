import { Request, Response } from 'express';
import { ActivityTemplate } from '../models/ActivityTemplate';
import { aiContentService } from '../services/aiContentService';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

export class TemplateController {
  // Create new template
  async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const userId = req.user?.id;
      const templateData = {
        ...req.body,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const template = new ActivityTemplate(templateData);
      const savedTemplate = await template.save();

      logger.info('Template created successfully', { templateId: savedTemplate._id, userId });

      res.status(201).json({
        success: true,
        template: savedTemplate,
        message: 'Template created successfully'
      });

    } catch (error: any) {
      logger.error('Template creation failed', { error: error.message, userId: req.user?.id });
      res.status(500).json({ 
        error: 'Failed to create template', 
        details: error.message 
      });
    }
  }

  // Get templates with filtering
  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        difficulty,
        ageMin,
        ageMax,
        language,
        isPublic,
        search,
        createdBy,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = req.query;

      const filters: any = {};

      // Build filter object
      if (category) filters.category = category;
      if (difficulty) filters.difficulty = difficulty;
      if (language) filters.language = language;
      if (createdBy) filters.createdBy = createdBy;
      if (isPublic !== undefined) filters.isPublic = isPublic === 'true';

      if (ageMin || ageMax) {
        filters.ageRange = {};
        if (ageMin) filters.ageRange.min = { $gte: parseInt(ageMin as string) };
        if (ageMax) filters.ageRange.max = { $lte: parseInt(ageMax as string) };
      }

      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } }
        ];
      }

      // Pagination
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      // Sort
      const sortObj: any = {};
      sortObj[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      // Query
      const templates = await ActivityTemplate.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'username email');

      const total = await ActivityTemplate.countDocuments(filters);

      res.json({
        success: true,
        templates,
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
      logger.error('Failed to fetch templates', { error: error.message });
      res.status(500).json({ 
        error: 'Failed to fetch templates', 
        details: error.message 
      });
    }
  }

  // Get single template
  async getTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { includeUsage = false } = req.query;

      let query = ActivityTemplate.findById(id)
        .populate('createdBy', 'username email');

      const template = await query.exec();

      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      let usageStats = null;
      if (includeUsage === 'true') {
        usageStats = await this.getTemplateUsageStats(id);
      }

      res.json({
        success: true,
        template,
        usageStats
      });

    } catch (error: any) {
      logger.error('Failed to fetch template', { error: error.message, templateId: req.params.id });
      res.status(500).json({ 
        error: 'Failed to fetch template', 
        details: error.message 
      });
    }
  }

  // Update template
  async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;

      const template = await ActivityTemplate.findById(id);
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      // Check permissions
      if (template.createdBy.toString() !== userId) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      // Update template
      Object.assign(template, req.body);
      template.updatedAt = new Date();
      
      const updatedTemplate = await template.save();

      res.json({
        success: true,
        template: updatedTemplate,
        message: 'Template updated successfully'
      });

    } catch (error: any) {
      logger.error('Failed to update template', { 
        error: error.message, 
        templateId: req.params.id,
        userId: req.user?.id
      });
      res.status(500).json({ 
        error: 'Failed to update template', 
        details: error.message 
      });
    }
  }

  // Delete template
  async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const template = await ActivityTemplate.findById(id);
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      // Check permissions
      if (template.createdBy.toString() !== userId) {
        res.status(403).json({ error: 'Permission denied' });
        return;
      }

      await ActivityTemplate.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });

    } catch (error: any) {
      logger.error('Failed to delete template', { 
        error: error.message, 
        templateId: req.params.id,
        userId: req.user?.id
      });
      res.status(500).json({ 
        error: 'Failed to delete template', 
        details: error.message 
      });
    }
  }

  // Generate activity from template
  async generateFromTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { variables = {} } = req.body;

      const template = await ActivityTemplate.findById(id);
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      // Generate activity using the template
      const generatedActivity = await template.generateActivity(variables);

      res.json({
        success: true,
        activity: generatedActivity,
        message: 'Activity generated from template'
      });

    } catch (error: any) {
      logger.error('Failed to generate from template', { 
        error: error.message, 
        templateId: req.params.id
      });
      res.status(500).json({ 
        error: 'Failed to generate from template', 
        details: error.message 
      });
    }
  }

  // Validate template variables
  async validateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { variables = {} } = req.body;

      const template = await ActivityTemplate.findById(id);
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      const validation = await template.validateVariables(variables);

      res.json({
        success: true,
        validation
      });

    } catch (error: any) {
      logger.error('Template validation failed', { 
        error: error.message, 
        templateId: req.params.id
      });
      res.status(500).json({ 
        error: 'Template validation failed', 
        details: error.message 
      });
    }
  }

  // Duplicate template
  async duplicateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const userId = req.user?.id;

      const originalTemplate = await ActivityTemplate.findById(id);
      if (!originalTemplate) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      // Create duplicate
      const duplicateData = originalTemplate.toObject();
      delete duplicateData._id;
      delete duplicateData.__v;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      delete duplicateData.usageStats;

      duplicateData.name = name || `${duplicateData.name} (Copy)`;
      duplicateData.createdBy = userId;
      duplicateData.isPublic = false; // Make copy private by default

      const duplicateTemplate = new ActivityTemplate(duplicateData);
      const savedTemplate = await duplicateTemplate.save();

      res.status(201).json({
        success: true,
        template: savedTemplate,
        message: 'Template duplicated successfully'
      });

    } catch (error: any) {
      logger.error('Failed to duplicate template', { 
        error: error.message, 
        templateId: req.params.id,
        userId: req.user?.id
      });
      res.status(500).json({ 
        error: 'Failed to duplicate template', 
        details: error.message 
      });
    }
  }

  // Generate template with AI
  async generateAITemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const {
        name,
        description,
        category,
        difficulty,
        ageRange,
        language,
        aiPrompt,
        aiParameters = {}
      } = req.body;

      logger.info('Generating AI template', { userId, category, difficulty });

      // Prepare AI request for template generation
      const aiRequest = {
        type: 'template' as const,
        prompt: aiPrompt || `Create a reusable template for ${category} activities`,
        parameters: {
          category,
          difficulty,
          ageRange,
          language: language || 'en',
          contentType: 'interactive',
          customRequirements: `Template should be flexible and reusable for various ${category} topics`
        },
        preferences: {
          provider: aiParameters.provider || 'openai',
          creativity: aiParameters.creativity || 0.7,
          formatStructured: true
        }
      };

      const aiResponse = await aiContentService.generateActivity(aiRequest);

      if (!aiResponse.success) {
        res.status(500).json({ 
          error: 'AI template generation failed', 
          details: aiResponse.error 
        });
        return;
      }

      // Create template with AI-generated content
      const templateData = {
        name: name || `AI Generated ${category} Template`,
        description: description || aiResponse.content.description,
        category,
        difficulty,
        ageRange,
        language: language || 'en',
        variables: this.extractTemplateVariables(aiResponse.content),
        structure: aiResponse.content,
        createdBy: userId,
        tags: [category, difficulty, 'ai-generated'],
        aiGenerated: {
          isAiGenerated: true,
          provider: aiResponse.metadata.provider,
          model: aiResponse.metadata.model,
          confidence: aiResponse.metadata.confidence,
          generatedAt: new Date()
        }
      };

      const template = new ActivityTemplate(templateData);
      const savedTemplate = await template.save();

      res.status(201).json({
        success: true,
        template: savedTemplate,
        aiMetadata: aiResponse.metadata,
        suggestions: aiResponse.suggestions,
        message: 'AI template generated successfully'
      });

    } catch (error: any) {
      logger.error('AI template generation failed', { error: error.message, userId: req.user?.id });
      res.status(500).json({ 
        error: 'AI template generation failed', 
        details: error.message 
      });
    }
  }

  // Get template categories
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await ActivityTemplate.distinct('category');
      const categoriesWithCounts = await ActivityTemplate.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        categories: categories.sort(),
        categoriesWithCounts
      });

    } catch (error: any) {
      logger.error('Failed to fetch template categories', { error: error.message });
      res.status(500).json({ 
        error: 'Failed to fetch categories', 
        details: error.message 
      });
    }
  }

  // Private helper methods
  private async getTemplateUsageStats(templateId: string): Promise<any> {
    // This would typically query an analytics collection
    // For now, return mock data
    return {
      totalUses: Math.floor(Math.random() * 100),
      recentUses: Math.floor(Math.random() * 20),
      averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
      popularVariables: [
        { name: 'topic', frequency: 85 },
        { name: 'difficulty_level', frequency: 72 },
        { name: 'duration', frequency: 68 }
      ]
    };
  }

  private extractTemplateVariables(aiContent: any): any[] {
    // Extract potential template variables from AI-generated content
    const variables = [];
    
    // Look for common variable patterns
    const contentStr = JSON.stringify(aiContent);
    const patterns = [
      /\{\{(\w+)\}\}/g,  // {{variable}}
      /\$\{(\w+)\}/g,    // ${variable}
      /<(\w+)>/g         // <variable>
    ];

    const foundVars = new Set<string>();
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(contentStr)) !== null) {
        foundVars.add(match[1]);
      }
    });

    // Convert to variable definitions
    foundVars.forEach(varName => {
      variables.push({
        name: varName,
        type: 'string',
        required: true,
        description: `Variable for ${varName}`,
        defaultValue: '',
        options: []
      });
    });

    // Add common template variables if none found
    if (variables.length === 0) {
      variables.push(
        {
          name: 'topic',
          type: 'string',
          required: true,
          description: 'The main topic of the activity',
          defaultValue: '',
          options: []
        },
        {
          name: 'difficulty_level',
          type: 'select',
          required: false,
          description: 'Difficulty adjustment',
          defaultValue: 'medium',
          options: ['easy', 'medium', 'hard']
        }
      );
    }

    return variables;
  }
}

export const templateController = new TemplateController();