import { Request, Response } from 'express';
import { ActivityContent } from '../models/ActivityContent.js';
import { Translation } from '../models/Translation.js';
import { LanguageResource } from '../models/LanguageResource.js';
import { TranslationService } from '../services/TranslationService.js';
import { TranslationWorkflowManager } from '../services/TranslationWorkflowManager.js';
import { AITranslationEngine } from '../services/AITranslationEngine.js';

export class LanguageManagementController {
  private translationService: TranslationService;
  private workflowManager: TranslationWorkflowManager;
  private aiEngine: AITranslationEngine;
  
  constructor() {
    this.translationService = new TranslationService();
    this.workflowManager = new TranslationWorkflowManager();
    this.aiEngine = new AITranslationEngine();
  }
  
  // Get dashboard overview statistics
  async getDashboardOverview(req: Request, res: Response): Promise<void> {
    try {
      const { timeRange = '30d' } = req.query;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }
      
      // Get translation statistics
      const [
        totalActivities,
        totalTranslations,
        pendingTranslations,
        completedTranslations,
        activeTranslators,
        supportedLanguages,
        recentActivity
      ] = await Promise.all([
        ActivityContent.countDocuments({ isActive: true }),
        Translation.countDocuments({ 
          isActive: true,
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Translation.countDocuments({ 
          'workflow.status': { $in: ['requested', 'assigned', 'in_progress'] },
          isActive: true
        }),
        Translation.countDocuments({ 
          'workflow.status': { $in: ['approved', 'published'] },
          isActive: true,
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Translation.distinct('workflow.translator.id', { 
          'workflow.status': { $in: ['assigned', 'in_progress', 'completed'] },
          isActive: true,
          updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }),
        ActivityContent.distinct('supportedLanguages'),
        Translation.find({
          isActive: true,
          updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).sort({ updatedAt: -1 }).limit(10).populate('activityContentId', 'sourceContent.title')
      ]);
      
      // Calculate quality metrics
      const qualityStats = await Translation.aggregate([
        {
          $match: {
            'workflow.status': { $in: ['approved', 'published'] },
            'quality.finalScore': { $gt: 0 },
            isActive: true,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            avgQuality: { $avg: '$quality.finalScore' },
            minQuality: { $min: '$quality.finalScore' },
            maxQuality: { $max: '$quality.finalScore' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Calculate productivity metrics
      const productivityStats = await Translation.aggregate([
        {
          $match: {
            'workflow.status': { $in: ['approved', 'published'] },
            'analytics.productivity.wordsPerHour': { $gt: 0 },
            isActive: true,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            avgProductivity: { $avg: '$analytics.productivity.wordsPerHour' },
            totalWords: { $sum: '$sourceContent.metadata.wordCount' },
            totalHours: { $sum: '$workflow.actualHours' }
          }
        }
      ]);
      
      // Language distribution
      const languageDistribution = await Translation.aggregate([
        {
          $match: {
            isActive: true,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$targetLanguage',
            count: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [
                  { $in: ['$workflow.status', ['approved', 'published']] },
                  1,
                  0
                ]
              }
            },
            avgQuality: { $avg: '$quality.finalScore' }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      const overview = {
        summary: {
          totalActivities,
          totalTranslations,
          pendingTranslations,
          completedTranslations,
          activeTranslators: activeTranslators.length,
          supportedLanguages: supportedLanguages.length,
          completionRate: totalTranslations > 0 ? (completedTranslations / totalTranslations) * 100 : 0
        },
        quality: {
          averageScore: qualityStats[0]?.avgQuality || 0,
          minScore: qualityStats[0]?.minQuality || 0,
          maxScore: qualityStats[0]?.maxQuality || 0,
          assessedCount: qualityStats[0]?.count || 0
        },
        productivity: {
          averageWordsPerHour: productivityStats[0]?.avgProductivity || 0,
          totalWordsTranslated: productivityStats[0]?.totalWords || 0,
          totalHoursSpent: productivityStats[0]?.totalHours || 0
        },
        languageDistribution,
        recentActivity: recentActivity.map(t => ({
          id: t.translationId,
          title: t.activityContentId?.sourceContent?.title || 'Unknown',
          language: t.targetLanguage,
          status: t.workflow.status,
          translator: t.workflow.translator.name,
          updatedAt: t.updatedAt
        }))
      };
      
      res.json(overview);
    } catch (error) {
      console.error('Error getting dashboard overview:', error);
      res.status(500).json({ error: 'Failed to get dashboard overview' });
    }
  }
  
  // Get translation progress for specific activities
  async getTranslationProgress(req: Request, res: Response): Promise<void> {
    try {
      const { activityIds, languages, status, page = 1, limit = 20 } = req.query;
      
      const query: any = { isActive: true };
      
      if (activityIds) {
        const ids = Array.isArray(activityIds) ? activityIds : [activityIds];
        query.activityContentId = { $in: ids };
      }
      
      if (languages) {
        const langs = Array.isArray(languages) ? languages : [languages];
        query.targetLanguage = { $in: langs };
      }
      
      if (status) {
        const statuses = Array.isArray(status) ? status : [status];
        query['workflow.status'] = { $in: statuses };
      }
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [translations, total] = await Promise.all([
        Translation.find(query)
          .populate('activityContentId', 'sourceContent.title category type difficulty')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        Translation.countDocuments(query)
      ]);
      
      const progressData = translations.map(t => ({
        translationId: t.translationId,
        activity: {
          id: t.activityContentId?.activityId,
          title: t.activityContentId?.sourceContent?.title,
          category: t.activityContentId?.category,
          type: t.activityContentId?.type,
          difficulty: t.activityContentId?.difficulty
        },
        sourceLanguage: t.sourceLanguage,
        targetLanguage: t.targetLanguage,
        status: t.workflow.status,
        priority: t.workflow.priority,
        progress: this.calculateProgress(t.workflow.status),
        translator: {
          id: t.workflow.translator.id,
          name: t.workflow.translator.name,
          rating: t.workflow.translator.ratingAverage
        },
        timeline: {
          createdAt: t.createdAt,
          assignedDate: t.workflow.translator.assignedDate,
          deadline: t.workflow.deadline,
          completedDate: t.workflow.status === 'completed' ? t.updatedAt : null
        },
        quality: {
          score: t.quality.finalScore,
          assessmentCount: t.quality.assessments.length,
          passesQA: t.quality.passesQA
        },
        wordCount: t.sourceContent.metadata.wordCount,
        estimatedHours: t.workflow.estimatedHours,
        actualHours: t.workflow.actualHours
      }));
      
      res.json({
        translations: progressData,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting translation progress:', error);
      res.status(500).json({ error: 'Failed to get translation progress' });
    }
  }
  
  // Assign translator to translation
  async assignTranslator(req: Request, res: Response): Promise<void> {
    try {
      const { translationId } = req.params;
      const { translatorId, translatorInfo } = req.body;
      
      if (!translatorId || !translatorInfo) {
        res.status(400).json({ error: 'Translator ID and info are required' });
        return;
      }
      
      const translation = await this.translationService.assignTranslator(
        translationId,
        translatorId,
        translatorInfo
      );
      
      res.json({
        message: 'Translator assigned successfully',
        translation: {
          id: translation.translationId,
          status: translation.workflow.status,
          translator: translation.workflow.translator
        }
      });
    } catch (error) {
      console.error('Error assigning translator:', error);
      res.status(500).json({ error: error.message || 'Failed to assign translator' });
    }
  }
  
  // Bulk assign translations
  async bulkAssignTranslations(req: Request, res: Response): Promise<void> {
    try {
      const { criteria } = req.body;
      
      const result = await this.workflowManager.autoAssignTranslations(criteria);
      
      res.json({
        message: 'Bulk assignment completed',
        result
      });
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      res.status(500).json({ error: 'Failed to perform bulk assignment' });
    }
  }
  
  // Get translator performance metrics
  async getTranslatorMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { translatorId } = req.params;
      const { startDate, endDate } = req.query;
      
      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }
      
      const metrics = await this.translationService.getTranslatorMetrics(translatorId, dateRange);
      
      res.json(metrics);
    } catch (error) {
      console.error('Error getting translator metrics:', error);
      res.status(500).json({ error: 'Failed to get translator metrics' });
    }
  }
  
  // Submit quality review
  async submitQualityReview(req: Request, res: Response): Promise<void> {
    try {
      const { translationId } = req.params;
      const { reviewerId, reviewerInfo, decision, feedback, qualityScore } = req.body;
      
      const translation = await this.translationService.reviewTranslation(
        translationId,
        reviewerId,
        reviewerInfo,
        decision,
        feedback,
        qualityScore
      );
      
      res.json({
        message: 'Quality review submitted successfully',
        translation: {
          id: translation.translationId,
          status: translation.workflow.status,
          qualityScore: translation.quality.finalScore
        }
      });
    } catch (error) {
      console.error('Error submitting quality review:', error);
      res.status(500).json({ error: error.message || 'Failed to submit quality review' });
    }
  }
  
  // Get workflow analytics
  async getWorkflowAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      const dateRange = {
        start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate as string) : new Date()
      };
      
      const analytics = await this.workflowManager.generateWorkflowAnalytics(dateRange);
      
      res.json(analytics);
    } catch (error) {
      console.error('Error getting workflow analytics:', error);
      res.status(500).json({ error: 'Failed to get workflow analytics' });
    }
  }
  
  // Monitor workflows and get alerts
  async getWorkflowAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await this.workflowManager.monitorWorkflows();
      
      res.json(alerts);
    } catch (error) {
      console.error('Error getting workflow alerts:', error);
      res.status(500).json({ error: 'Failed to get workflow alerts' });
    }
  }
  
  // Get language resources
  async getLanguageResources(req: Request, res: Response): Promise<void> {
    try {
      const { language, resourceType, page = 1, limit = 20 } = req.query;
      
      const query: any = { isActive: true };
      
      if (language) {
        query.language = language;
      }
      
      if (resourceType) {
        query.resourceType = resourceType;
      }
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [resources, total] = await Promise.all([
        LanguageResource.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        LanguageResource.countDocuments(query)
      ]);
      
      res.json({
        resources,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting language resources:', error);
      res.status(500).json({ error: 'Failed to get language resources' });
    }
  }
  
  // Search glossary terms
  async searchGlossary(req: Request, res: Response): Promise<void> {
    try {
      const { term, languages, domain, page = 1, limit = 20 } = req.query;
      
      if (!term) {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }
      
      const searchLanguages = languages ? 
        (Array.isArray(languages) ? languages : [languages]) : 
        undefined;
      
      const results = await LanguageResource.searchGlossary(term as string, searchLanguages as string[]);
      
      // Apply pagination
      const skip = (Number(page) - 1) * Number(limit);
      const paginatedResults = results.slice(skip, skip + Number(limit));
      
      res.json({
        terms: paginatedResults,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: results.length,
          pages: Math.ceil(results.length / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error searching glossary:', error);
      res.status(500).json({ error: 'Failed to search glossary' });
    }
  }
  
  // Get translation memory matches
  async getTranslationMemoryMatches(req: Request, res: Response): Promise<void> {
    try {
      const { sourceText, sourceLanguage, targetLanguage, threshold = 70 } = req.query;
      
      if (!sourceText || !sourceLanguage || !targetLanguage) {
        res.status(400).json({ error: 'Source text, source language, and target language are required' });
        return;
      }
      
      // This would typically query a translation memory database
      // For now, we'll simulate the response
      const matches = [
        {
          sourceText: sourceText,
          targetText: `[Translated] ${sourceText}`,
          similarity: 100,
          context: 'education',
          lastUsed: new Date(),
          usageCount: 5
        }
      ];
      
      const filteredMatches = matches.filter(m => m.similarity >= Number(threshold));
      
      res.json({
        matches: filteredMatches,
        searchCriteria: {
          sourceText,
          sourceLanguage,
          targetLanguage,
          threshold: Number(threshold)
        }
      });
    } catch (error) {
      console.error('Error getting TM matches:', error);
      res.status(500).json({ error: 'Failed to get translation memory matches' });
    }
  }
  
  // Export translation data
  async exportTranslationData(req: Request, res: Response): Promise<void> {
    try {
      const { format = 'json', filters = {} } = req.body;
      
      const query = { isActive: true, ...filters };
      const translations = await Translation.find(query)
        .populate('activityContentId', 'sourceContent.title category')
        .sort({ createdAt: -1 });
      
      const exportData = translations.map(t => ({
        translationId: t.translationId,
        activityTitle: t.activityContentId?.sourceContent?.title,
        sourceLanguage: t.sourceLanguage,
        targetLanguage: t.targetLanguage,
        status: t.workflow.status,
        priority: t.workflow.priority,
        translator: t.workflow.translator.name,
        qualityScore: t.quality.finalScore,
        wordCount: t.sourceContent.metadata.wordCount,
        createdAt: t.createdAt,
        completedAt: t.updatedAt
      }));
      
      if (format === 'csv') {
        const csv = this.convertToCSV(exportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=translations.csv');
        res.send(csv);
      } else {
        res.json(exportData);
      }
    } catch (error) {
      console.error('Error exporting translation data:', error);
      res.status(500).json({ error: 'Failed to export translation data' });
    }
  }
  
  // Helper methods
  private calculateProgress(status: string): number {
    const statusWeights: Record<string, number> = {
      'requested': 0,
      'assigned': 10,
      'in_progress': 50,
      'completed': 80,
      'reviewed': 90,
      'approved': 95,
      'rejected': 0,
      'published': 100
    };
    
    return statusWeights[status] || 0;
  }
  
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }
}