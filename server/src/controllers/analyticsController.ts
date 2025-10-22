import { Request, Response } from 'express';
import { Analytics } from '../models/Analytics';
import { Report } from '../models/Report';
import { analyticsService } from '../services/analyticsService';
import { ObjectId } from 'mongoose';

export class AnalyticsController {
  // Generate analytics for an entity
  async generateAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { 
        entityType, 
        entityId, 
        periodType, 
        startDate, 
        endDate,
        includePredictions = true,
        includeComparisons = true,
        includeInsights = true,
        timezone = 'UTC'
      } = req.body;

      const dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };

      const analytics = await analyticsService.generateAnalytics(
        entityType,
        new ObjectId(entityId),
        periodType,
        dateRange,
        req.user.id,
        {
          includePredictions,
          includeComparisons,
          includeInsights,
          timezone
        }
      );

      res.status(201).json({
        success: true,
        data: analytics,
        message: 'Analytics generated successfully'
      });
    } catch (error) {
      console.error('Generate analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate analytics',
        error: (error as Error).message
      });
    }
  }

  // Get analytics by ID
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const analytics = await Analytics.findById(id)
        .populate('metadata.generatedBy', 'username firstName lastName');

      if (!analytics) {
        res.status(404).json({
          success: false,
          message: 'Analytics not found'
        });
        return;
      }

      // Check access permissions
      const hasAccess = this.checkAnalyticsAccess(analytics, req.user);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics',
        error: (error as Error).message
      });
    }
  }

  // Get analytics for multiple entities
  async getEntityAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.params;
      const { 
        periodType,
        startDate,
        endDate,
        limit = 10,
        page = 1
      } = req.query;

      const query: any = {
        entityType,
        entityId: new ObjectId(entityId as string)
      };

      if (periodType) {
        query['period.type'] = periodType;
      }

      if (startDate && endDate) {
        query['period.startDate'] = { $gte: new Date(startDate as string) };
        query['period.endDate'] = { $lte: new Date(endDate as string) };
      }

      const skip = (Number(page) - 1) * Number(limit);

      const analytics = await Analytics.find(query)
        .sort({ 'period.startDate': -1 })
        .limit(Number(limit))
        .skip(skip)
        .populate('metadata.generatedBy', 'username firstName lastName');

      const total = await Analytics.countDocuments(query);

      res.json({
        success: true,
        data: analytics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Get entity analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve entity analytics',
        error: (error as Error).message
      });
    }
  }

  // Update analytics
  async updateAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { 
        includePredictions = false,
        includeComparisons = false,
        includeInsights = false
      } = req.body;

      const analytics = await analyticsService.updateAnalytics(
        new ObjectId(id),
        {
          includePredictions,
          includeComparisons,
          includeInsights
        }
      );

      res.json({
        success: true,
        data: analytics,
        message: 'Analytics updated successfully'
      });
    } catch (error) {
      console.error('Update analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update analytics',
        error: (error as Error).message
      });
    }
  }

  // Delete analytics
  async deleteAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const analytics = await Analytics.findById(id);
      if (!analytics) {
        res.status(404).json({
          success: false,
          message: 'Analytics not found'
        });
        return;
      }

      // Check if user has permission to delete
      if (analytics.metadata.generatedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      await Analytics.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Analytics deleted successfully'
      });
    } catch (error) {
      console.error('Delete analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete analytics',
        error: (error as Error).message
      });
    }
  }

  // Add insight to analytics
  async addInsight(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { type, priority, category, title, description, evidence, actionItems, impact, confidence } = req.body;

      const analytics = await Analytics.findById(id);
      if (!analytics) {
        res.status(404).json({
          success: false,
          message: 'Analytics not found'
        });
        return;
      }

      await analytics.addInsight({
        type,
        priority,
        category,
        title,
        description,
        evidence: evidence || [],
        actionItems: actionItems || [],
        impact,
        confidence: confidence || 75
      });

      res.json({
        success: true,
        data: analytics,
        message: 'Insight added successfully'
      });
    } catch (error) {
      console.error('Add insight error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add insight',
        error: (error as Error).message
      });
    }
  }

  // Update trend data
  async updateTrend(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { type, data } = req.body;

      const analytics = await Analytics.findById(id);
      if (!analytics) {
        res.status(404).json({
          success: false,
          message: 'Analytics not found'
        });
        return;
      }

      await analytics.updateTrend(type, data);

      res.json({
        success: true,
        data: analytics,
        message: 'Trend updated successfully'
      });
    } catch (error) {
      console.error('Update trend error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update trend',
        error: (error as Error).message
      });
    }
  }

  // Generate visualization
  async generateVisualization(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { type, category, customData } = req.body;

      const analytics = await Analytics.findById(id);
      if (!analytics) {
        res.status(404).json({
          success: false,
          message: 'Analytics not found'
        });
        return;
      }

      const visualization = analytics.generateVisualization(type, category, customData);
      await analytics.save();

      res.json({
        success: true,
        data: visualization,
        message: 'Visualization generated successfully'
      });
    } catch (error) {
      console.error('Generate visualization error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate visualization',
        error: (error as Error).message
      });
    }
  }

  // Share analytics
  async shareAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, permissions } = req.body;

      const analytics = await Analytics.findById(id);
      if (!analytics) {
        res.status(404).json({
          success: false,
          message: 'Analytics not found'
        });
        return;
      }

      // Check if current user has permission to share
      if (analytics.metadata.generatedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      await analytics.shareWithUser(new ObjectId(userId), permissions || ['view']);

      res.json({
        success: true,
        data: analytics,
        message: 'Analytics shared successfully'
      });
    } catch (error) {
      console.error('Share analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share analytics',
        error: (error as Error).message
      });
    }
  }

  // Get benchmark data
  async getBenchmarkData(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, periodType } = req.params;
      const { departments } = req.query;

      const departmentList = departments ? (departments as string).split(',') : undefined;

      const benchmarkData = await Analytics.getBenchmarkData(
        entityType,
        periodType,
        departmentList
      );

      res.json({
        success: true,
        data: benchmarkData
      });
    } catch (error) {
      console.error('Get benchmark data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve benchmark data',
        error: (error as Error).message
      });
    }
  }

  // Generate system report
  async generateSystemReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, departments } = req.body;

      const departmentList = departments && Array.isArray(departments) ? departments : undefined;

      const reportData = await Analytics.generateSystemReport(
        new Date(startDate),
        new Date(endDate),
        departmentList
      );

      res.json({
        success: true,
        data: reportData
      });
    } catch (error) {
      console.error('Generate system report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate system report',
        error: (error as Error).message
      });
    }
  }

  // Bulk generate analytics
  async bulkGenerateAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { entities, periodType, startDate, endDate } = req.body;

      const dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };

      const results = await analyticsService.generateBulkAnalytics(
        entities,
        periodType,
        dateRange,
        req.user.id
      );

      res.json({
        success: true,
        data: results,
        message: `Generated analytics for ${results.length} entities`
      });
    } catch (error) {
      console.error('Bulk generate analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate bulk analytics',
        error: (error as Error).message
      });
    }
  }

  // Calculate engagement score
  async calculateEngagementScore(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const analytics = await Analytics.findById(id);
      if (!analytics) {
        res.status(404).json({
          success: false,
          message: 'Analytics not found'
        });
        return;
      }

      const engagementScore = analytics.calculateEngagementScore();
      const performanceScore = analytics.calculatePerformanceScore();

      res.json({
        success: true,
        data: {
          engagementScore,
          performanceScore,
          overall: Math.round((engagementScore + performanceScore) / 2)
        }
      });
    } catch (error) {
      console.error('Calculate engagement score error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate engagement score',
        error: (error as Error).message
      });
    }
  }

  // REPORT ENDPOINTS

  // Create report
  async createReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        type,
        category,
        scope,
        structure
      } = req.body;

      const report = await analyticsService.generateReport(
        title,
        description,
        type,
        category,
        scope,
        structure,
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: report,
        message: 'Report created successfully'
      });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create report',
        error: (error as Error).message
      });
    }
  }

  // Get report by ID
  async getReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const report = await Report.findById(id)
        .populate('access.owner', 'username firstName lastName')
        .populate('access.collaborators.userId', 'username firstName lastName');

      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found'
        });
        return;
      }

      // Check access permissions
      const hasAccess = this.checkReportAccess(report, req.user);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      // Increment view count
      if (report.access.sharing.enabled) {
        report.access.sharing.viewCount += 1;
        await report.save();
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve report',
        error: (error as Error).message
      });
    }
  }

  // Get user reports
  async getUserReports(req: Request, res: Response): Promise<void> {
    try {
      const { includeShared = 'true' } = req.query;

      const reports = await Report.getUserReports(
        req.user.id,
        includeShared === 'true'
      );

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Get user reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user reports',
        error: (error as Error).message
      });
    }
  }

  // Get reports by category
  async getReportsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const { departments } = req.query;

      const departmentList = departments ? (departments as string).split(',') : undefined;

      const reports = await Report.getByCategory(
        category,
        req.user.id,
        departmentList
      );

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Get reports by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve reports by category',
        error: (error as Error).message
      });
    }
  }

  // Search reports
  async searchReports(req: Request, res: Response): Promise<void> {
    try {
      const { query, type, category, startDate, endDate } = req.query;

      const filters: any = {};
      if (type) filters.type = type;
      if (category) filters.category = category;
      if (startDate && endDate) {
        filters.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }

      const reports = await Report.searchReports(
        query as string || '',
        filters,
        req.user.id
      );

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Search reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search reports',
        error: (error as Error).message
      });
    }
  }

  // Update report
  async updateReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const report = await Report.findById(id);
      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found'
        });
        return;
      }

      // Check if user has permission to update
      const canEdit = this.checkReportEditAccess(report, req.user);
      if (!canEdit) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      // Track changes for versioning
      const changes: string[] = [];
      Object.keys(updates).forEach(key => {
        if (key !== 'timestamps') {
          changes.push(`Updated ${key}`);
        }
      });

      // Update report
      Object.assign(report, updates);
      await report.save();

      // Create version if significant changes
      if (changes.length > 0) {
        await report.createVersion(changes, req.user.id);
      }

      res.json({
        success: true,
        data: report,
        message: 'Report updated successfully'
      });
    } catch (error) {
      console.error('Update report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update report',
        error: (error as Error).message
      });
    }
  }

  // Delete report
  async deleteReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const report = await Report.findById(id);
      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found'
        });
        return;
      }

      // Check if user has permission to delete
      if (report.access.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      await Report.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete report',
        error: (error as Error).message
      });
    }
  }

  // Generate report data
  async generateReportData(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const report = await Report.findById(id);
      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found'
        });
        return;
      }

      await report.generateData();

      res.json({
        success: true,
        data: report,
        message: 'Report data generated successfully'
      });
    } catch (error) {
      console.error('Generate report data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate report data',
        error: (error as Error).message
      });
    }
  }

  // Add collaborator to report
  async addReportCollaborator(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, role, permissions } = req.body;

      const report = await Report.findById(id);
      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found'
        });
        return;
      }

      // Check if user has permission to add collaborators
      if (report.access.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      await report.addCollaborator(
        new ObjectId(userId),
        role,
        req.user.id,
        permissions || []
      );

      res.json({
        success: true,
        data: report,
        message: 'Collaborator added successfully'
      });
    } catch (error) {
      console.error('Add report collaborator error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add collaborator',
        error: (error as Error).message
      });
    }
  }

  // Add feedback to report
  async addReportFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rating, comment, helpful, suggestions } = req.body;

      const report = await Report.findById(id);
      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found'
        });
        return;
      }

      await report.addFeedback(
        req.user.id,
        rating,
        comment || '',
        helpful || false,
        suggestions || []
      );

      res.json({
        success: true,
        data: report,
        message: 'Feedback added successfully'
      });
    } catch (error) {
      console.error('Add report feedback error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add feedback',
        error: (error as Error).message
      });
    }
  }

  // Export report
  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { format = 'json' } = req.query;

      const report = await Report.findById(id);
      if (!report) {
        res.status(404).json({
          success: false,
          message: 'Report not found'
        });
        return;
      }

      // Check access permissions
      const hasAccess = this.checkReportAccess(report, req.user);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      const exportData = report.exportData(format as any);

      // Set appropriate headers based on format
      switch (format) {
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${report.title}.csv"`);
          break;
        case 'html':
          res.setHeader('Content-Type', 'text/html');
          break;
        case 'json':
        default:
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="${report.title}.json"`);
          break;
      }

      res.send(exportData);
    } catch (error) {
      console.error('Export report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
        error: (error as Error).message
      });
    }
  }

  // Get scheduled reports
  async getScheduledReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = await Report.getScheduledReports();

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Get scheduled reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve scheduled reports',
        error: (error as Error).message
      });
    }
  }

  // UTILITY METHODS

  private checkAnalyticsAccess(analytics: any, user: any): boolean {
    // Check if user is the generator
    if (analytics.metadata.generatedBy.toString() === user.id) {
      return true;
    }

    // Check if analytics is shared with user
    const sharedWith = analytics.access.sharedWith.find(
      (share: any) => share.userId.toString() === user.id
    );
    if (sharedWith) {
      return true;
    }

    // Check visibility and department access
    if (analytics.access.visibility === 'public') {
      return true;
    }

    if (analytics.access.visibility === 'restricted') {
      return analytics.access.departments.includes(user.department) ||
             analytics.access.roles.includes(user.role);
    }

    // Admin access
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }

    return false;
  }

  private checkReportAccess(report: any, user: any): boolean {
    // Check if user is the owner
    if (report.access.owner.toString() === user.id) {
      return true;
    }

    // Check if user is a collaborator
    const collaborator = report.access.collaborators.find(
      (collab: any) => collab.userId.toString() === user.id
    );
    if (collaborator) {
      return true;
    }

    // Check visibility and access rules
    if (report.access.visibility === 'public') {
      return true;
    }

    if (report.access.visibility === 'restricted') {
      return report.access.departments.includes(user.department) ||
             report.access.roles.includes(user.role);
    }

    // Admin access
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }

    return false;
  }

  private checkReportEditAccess(report: any, user: any): boolean {
    // Check if user is the owner
    if (report.access.owner.toString() === user.id) {
      return true;
    }

    // Check if user is a collaborator with edit permissions
    const collaborator = report.access.collaborators.find(
      (collab: any) => collab.userId.toString() === user.id
    );
    if (collaborator && (collaborator.role === 'editor' || collaborator.role === 'admin')) {
      return true;
    }

    // Admin access
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }

    return false;
  }

  // Cleanup old analytics
  async cleanupOldAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { daysToKeep = 365 } = req.body;

      // Only admins can perform cleanup
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      await analyticsService.cleanupOldAnalytics(daysToKeep);

      res.json({
        success: true,
        message: `Old analytics cleaned up (keeping ${daysToKeep} days)`
      });
    } catch (error) {
      console.error('Cleanup old analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup old analytics',
        error: (error as Error).message
      });
    }
  }

  // Get analytics dashboard data
  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId, periodType = 'monthly' } = req.query;

      const endDate = new Date();
      const startDate = new Date();
      
      switch (periodType) {
        case 'daily':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'weekly':
          startDate.setDate(endDate.getDate() - 12 * 7);
          break;
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 12);
          break;
        case 'quarterly':
          startDate.setMonth(endDate.getMonth() - 4 * 3);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 6);
      }

      const query: any = {
        'period.startDate': { $gte: startDate },
        'period.endDate': { $lte: endDate }
      };

      if (entityType) query.entityType = entityType;
      if (entityId) query.entityId = new ObjectId(entityId as string);

      const analytics = await Analytics.find(query)
        .sort({ 'period.startDate': -1 })
        .limit(50)
        .populate('metadata.generatedBy', 'username firstName lastName');

      // Aggregate dashboard data
      const dashboardData = {
        summary: {
          totalAnalytics: analytics.length,
          avgEngagementScore: analytics.length > 0 ? 
            analytics.reduce((sum, a) => sum + a.calculateEngagementScore(), 0) / analytics.length : 0,
          avgPerformanceScore: analytics.length > 0 ? 
            analytics.reduce((sum, a) => sum + a.calculatePerformanceScore(), 0) / analytics.length : 0,
          totalInsights: analytics.reduce((sum, a) => sum + a.insights.length, 0)
        },
        trends: {
          engagement: analytics.map(a => ({
            date: a.period.startDate,
            value: a.calculateEngagementScore()
          })).sort((a, b) => a.date.getTime() - b.date.getTime()),
          performance: analytics.map(a => ({
            date: a.period.startDate,
            value: a.calculatePerformanceScore()
          })).sort((a, b) => a.date.getTime() - b.date.getTime())
        },
        insights: analytics.flatMap(a => a.insights)
          .sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                   (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
          })
          .slice(0, 10),
        recentActivity: analytics.slice(0, 5).map(a => ({
          id: a._id,
          entityType: a.entityType,
          periodType: a.period.type,
          generatedAt: a.timestamps.createdAt,
          generatedBy: a.metadata.generatedBy
        }))
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Get dashboard data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard data',
        error: (error as Error).message
      });
    }
  }
}

export const analyticsController = new AnalyticsController();