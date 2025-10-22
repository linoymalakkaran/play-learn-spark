import { Request, Response } from 'express';
import { assignmentService } from '../services/assignmentService';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

export class AssignmentController {
  // Assignment CRUD Operations
  async createAssignment(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const assignmentData = {
        ...req.body,
        instructor: userId.toString()
      };

      const assignment = await assignmentService.createAssignment(assignmentData);

      logger.info('Assignment created via API', {
        assignmentId: assignment._id,
        userId,
        title: assignment.title
      });

      res.status(201).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment
      });
    } catch (error: any) {
      logger.error('Assignment creation failed', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create assignment',
        error: error.message
      });
    }
  }

  async getAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const populateDetails = req.query.populate === 'true';

      const assignment = await assignmentService.getAssignment(id, populateDetails);

      if (!assignment) {
        res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
        return;
      }

      res.json({
        success: true,
        data: assignment
      });
    } catch (error: any) {
      logger.error('Failed to get assignment', {
        error: error.message,
        assignmentId: req.params.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get assignment',
        error: error.message
      });
    }
  }

  async updateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const assignment = await assignmentService.updateAssignment(id, req.body, userId.toString());

      if (!assignment) {
        res.status(404).json({
          success: false,
          message: 'Assignment not found or permission denied'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Assignment updated successfully',
        data: assignment
      });
    } catch (error: any) {
      logger.error('Assignment update failed', {
        error: error.message,
        assignmentId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('Permission denied') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const permanent = req.query.permanent === 'true';

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      await assignmentService.deleteAssignment(id, userId.toString(), permanent);

      res.json({
        success: true,
        message: permanent ? 'Assignment permanently deleted' : 'Assignment archived'
      });
    } catch (error: any) {
      logger.error('Assignment deletion failed', {
        error: error.message,
        assignmentId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('Permission denied') ? 403 : 
                        error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async duplicateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newTitle } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!newTitle) {
        res.status(400).json({
          success: false,
          message: 'New title is required'
        });
        return;
      }

      const duplicate = await assignmentService.duplicateAssignment(id, newTitle, userId.toString());

      res.status(201).json({
        success: true,
        message: 'Assignment duplicated successfully',
        data: duplicate
      });
    } catch (error: any) {
      logger.error('Assignment duplication failed', {
        error: error.message,
        assignmentId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to duplicate assignment',
        error: error.message
      });
    }
  }

  // Assignment Management
  async publishAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const assignment = await assignmentService.publishAssignment(id, userId.toString());

      res.json({
        success: true,
        message: 'Assignment published successfully',
        data: {
          assignment,
          enrolledStudents: assignment.analytics.enrolledCount
        }
      });
    } catch (error: any) {
      logger.error('Assignment publishing failed', {
        error: error.message,
        assignmentId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('Permission denied') ? 403 : 
                        error.message.includes('not found') ? 404 : 
                        error.message.includes('validation failed') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAssignments(req: Request, res: Response): Promise<void> {
    try {
      const {
        instructor,
        status,
        category,
        audience,
        startDate,
        endDate,
        tags,
        search,
        page = '1',
        limit = '20'
      } = req.query;

      const filters: any = {};
      
      if (instructor) filters.instructor = instructor;
      if (status) filters.status = status;
      if (category) filters.category = category;
      if (audience) filters.audience = audience;
      if (tags) filters.tags = (tags as string).split(',');
      if (search) filters.search = search;

      if (startDate && endDate) {
        filters.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }

      const result = await assignmentService.getAssignments(
        filters, 
        parseInt(page as string), 
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result.assignments,
        pagination: {
          current: parseInt(page as string),
          total: result.pages,
          count: result.total,
          limit: parseInt(limit as string)
        }
      });
    } catch (error: any) {
      logger.error('Failed to get assignments', {
        error: error.message,
        query: req.query,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get assignments',
        error: error.message
      });
    }
  }

  // Student Progress Tracking
  async getStudentProgress(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentId, studentId } = req.params;

      const progress = await assignmentService.getStudentProgress(assignmentId, studentId);

      if (!progress) {
        res.status(404).json({
          success: false,
          message: 'Progress record not found'
        });
        return;
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error: any) {
      logger.error('Failed to get student progress', {
        error: error.message,
        assignmentId: req.params.assignmentId,
        studentId: req.params.studentId,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get student progress',
        error: error.message
      });
    }
  }

  async updateStudentProgress(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentId, studentId } = req.params;
      const updates = req.body;

      const progress = await assignmentService.updateStudentProgress(assignmentId, studentId, updates);

      if (!progress) {
        res.status(404).json({
          success: false,
          message: 'Progress record not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Progress updated successfully',
        data: progress
      });
    } catch (error: any) {
      logger.error('Failed to update student progress', {
        error: error.message,
        assignmentId: req.params.assignmentId,
        studentId: req.params.studentId,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update progress',
        error: error.message
      });
    }
  }

  async recordInteraction(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentId, studentId, activityId } = req.params;
      const interaction = req.body;

      await assignmentService.recordActivityInteraction(assignmentId, studentId, activityId, interaction);

      res.json({
        success: true,
        message: 'Interaction recorded successfully'
      });
    } catch (error: any) {
      logger.error('Failed to record interaction', {
        error: error.message,
        assignmentId: req.params.assignmentId,
        studentId: req.params.studentId,
        activityId: req.params.activityId,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to record interaction',
        error: error.message
      });
    }
  }

  async submitActivity(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentId, studentId, activityId } = req.params;
      const submission = req.body;

      await assignmentService.submitActivity(assignmentId, studentId, activityId, submission);

      res.json({
        success: true,
        message: 'Activity submitted successfully'
      });
    } catch (error: any) {
      logger.error('Failed to submit activity', {
        error: error.message,
        assignmentId: req.params.assignmentId,
        studentId: req.params.studentId,
        activityId: req.params.activityId,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to submit activity',
        error: error.message
      });
    }
  }

  // Analytics and Reporting
  async getAssignmentAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }

      const analytics = await assignmentService.getAssignmentAnalytics(id, dateRange);

      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      logger.error('Failed to get assignment analytics', {
        error: error.message,
        assignmentId: req.params.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get analytics',
        error: error.message
      });
    }
  }

  async getClassProgress(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentId } = req.params;
      const { classId } = req.query;

      // This would be implemented based on your class management system
      // For now, returning a placeholder response
      res.json({
        success: true,
        message: 'Class progress endpoint - to be implemented based on class management system',
        data: {
          assignmentId,
          classId,
          placeholder: true
        }
      });
    } catch (error: any) {
      logger.error('Failed to get class progress', {
        error: error.message,
        assignmentId: req.params.assignmentId,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get class progress',
        error: error.message
      });
    }
  }

  // Assignment Templates and Presets
  async getAssignmentTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { category, difficulty, subject } = req.query;

      // This would query a templates collection or predefined templates
      // For now, returning sample templates
      const templates = [
        {
          id: 'reading-comprehension-basic',
          title: 'Basic Reading Comprehension',
          description: 'Template for creating reading comprehension assignments',
          category: 'language-arts',
          difficulty: 'beginner',
          estimatedDuration: 30,
          activities: [
            { type: 'reading', order: 1, required: true },
            { type: 'multiple-choice', order: 2, required: true },
            { type: 'short-answer', order: 3, required: false }
          ]
        },
        {
          id: 'math-problem-solving',
          title: 'Math Problem Solving',
          description: 'Template for math problem solving assignments',
          category: 'mathematics',
          difficulty: 'intermediate',
          estimatedDuration: 45,
          activities: [
            { type: 'guided-practice', order: 1, required: true },
            { type: 'problem-solving', order: 2, required: true },
            { type: 'reflection', order: 3, required: false }
          ]
        }
      ];

      let filteredTemplates = templates;

      if (category) {
        filteredTemplates = filteredTemplates.filter(t => t.category === category);
      }
      if (difficulty) {
        filteredTemplates = filteredTemplates.filter(t => t.difficulty === difficulty);
      }

      res.json({
        success: true,
        data: filteredTemplates
      });
    } catch (error: any) {
      logger.error('Failed to get assignment templates', {
        error: error.message,
        query: req.query,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get templates',
        error: error.message
      });
    }
  }

  async createFromTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const customizations = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // This would load the template and apply customizations
      // For now, creating a basic assignment structure
      const assignmentData = {
        title: customizations.title || 'Assignment from Template',
        description: customizations.description || 'Created from template',
        instructor: userId.toString(),
        category: customizations.category || 'general',
        estimatedDuration: customizations.estimatedDuration || 30,
        points: { total: customizations.points || 100 },
        activities: customizations.activities || [],
        configuration: {
          type: 'individual',
          difficulty: 'fixed',
          ...customizations.configuration
        },
        audience: customizations.audience || {
          type: 'class',
          classIds: []
        }
      };

      const assignment = await assignmentService.createAssignment(assignmentData);

      res.status(201).json({
        success: true,
        message: 'Assignment created from template',
        data: assignment
      });
    } catch (error: any) {
      logger.error('Failed to create assignment from template', {
        error: error.message,
        templateId: req.params.templateId,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create assignment from template',
        error: error.message
      });
    }
  }

  // Bulk Operations
  async bulkPublish(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentIds } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!Array.isArray(assignmentIds) || assignmentIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Assignment IDs array is required'
        });
        return;
      }

      const results = [];
      for (const assignmentId of assignmentIds) {
        try {
          const assignment = await assignmentService.publishAssignment(assignmentId, userId.toString());
          results.push({
            assignmentId,
            status: 'success',
            enrolledStudents: assignment.analytics.enrolledCount
          });
        } catch (error: any) {
          results.push({
            assignmentId,
            status: 'error',
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      res.json({
        success: true,
        message: `Bulk publish completed: ${successCount} successful, ${errorCount} failed`,
        data: {
          results,
          summary: { successful: successCount, failed: errorCount }
        }
      });
    } catch (error: any) {
      logger.error('Bulk publish failed', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Bulk publish operation failed',
        error: error.message
      });
    }
  }

  async bulkUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { assignmentIds, updates } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!Array.isArray(assignmentIds) || assignmentIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Assignment IDs array is required'
        });
        return;
      }

      const results = [];
      for (const assignmentId of assignmentIds) {
        try {
          const assignment = await assignmentService.updateAssignment(assignmentId, updates, userId.toString());
          results.push({
            assignmentId,
            status: 'success',
            updated: !!assignment
          });
        } catch (error: any) {
          results.push({
            assignmentId,
            status: 'error',
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      res.json({
        success: true,
        message: `Bulk update completed: ${successCount} successful, ${errorCount} failed`,
        data: {
          results,
          summary: { successful: successCount, failed: errorCount }
        }
      });
    } catch (error: any) {
      logger.error('Bulk update failed', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Bulk update operation failed',
        error: error.message
      });
    }
  }
}

export const assignmentController = new AssignmentController();