import { Assignment, IAssignment } from '../models/Assignment';
import { StudentProgress, IStudentProgress } from '../models/StudentProgress';
import { ActivityMongo } from '../models/ActivityMongo';
import { logger } from '../utils/logger';
import { ObjectId } from 'mongoose';

export interface AssignmentCreationData {
  title: string;
  description: string;
  instructor: string;
  activities: Array<{
    activityId: string;
    order: number;
    isRequired?: boolean;
    timeLimit?: number;
    passingScore?: number;
    attempts?: number;
    weight?: number;
  }>;
  configuration?: any;
  schedule?: any;
  audience: any;
  adaptiveSettings?: any;
  progressTracking?: any;
  collaboration?: any;
  resources?: any;
  category: string;
  estimatedDuration: number;
  points: { total: number; bonus?: number };
}

export interface AssignmentFilters {
  instructor?: string;
  status?: string;
  category?: string;
  audience?: string;
  dateRange?: { start: Date; end: Date };
  tags?: string[];
  search?: string;
}

export interface AssignmentAnalytics {
  overview: {
    totalAssignments: number;
    activeAssignments: number;
    completedAssignments: number;
    averageCompletionRate: number;
    totalStudentsEnrolled: number;
  };
  performance: {
    averageScore: number;
    passRate: number;
    averageTimeSpent: number;
    strugglingStudents: number;
    topPerformers: number;
  };
  engagement: {
    averageSessionTime: number;
    totalTimeSpent: number;
    mostActiveHours: string[];
    deviceUsage: any;
  };
  trends: {
    completionTrend: any[];
    scoreTrend: any[];
    engagementTrend: any[];
  };
}

export class AssignmentService {
  // Assignment CRUD Operations
  async createAssignment(data: AssignmentCreationData): Promise<IAssignment> {
    try {
      logger.info('Creating new assignment', { title: data.title, instructor: data.instructor });

      // Validate activities exist
      const activityIds = data.activities.map(a => a.activityId);
      const existingActivities = await ActivityMongo.find({ 
        _id: { $in: activityIds } 
      }).select('_id title');

      if (existingActivities.length !== activityIds.length) {
        throw new Error('One or more activities not found');
      }

      // Set default configuration if not provided
      const defaultConfig = {
        type: 'individual',
        difficulty: 'fixed',
        randomization: false,
        allowRetakes: true,
        maxAttempts: 3,
        passingGrade: 70,
        gradingMethod: 'percentage',
        showResults: 'after-completion'
      };

      const assignmentData = {
        ...data,
        configuration: { ...defaultConfig, ...data.configuration },
        progressTracking: {
          trackTime: true,
          trackAttempts: true,
          trackInteractions: false,
          analyticsEnabled: true,
          detailedReporting: false,
          realTimeUpdates: true,
          ...data.progressTracking
        },
        status: 'draft',
        analytics: {
          enrolledCount: 0,
          startedCount: 0,
          completedCount: 0,
          averageScore: 0,
          averageTime: 0,
          completionRate: 0,
          lastUpdated: new Date()
        }
      };

      const assignment = new Assignment(assignmentData);
      const savedAssignment = await assignment.save();

      logger.info('Assignment created successfully', { 
        assignmentId: savedAssignment._id,
        title: savedAssignment.title 
      });

      return savedAssignment;
    } catch (error: any) {
      logger.error('Failed to create assignment', { 
        error: error.message,
        data: data.title 
      });
      throw error;
    }
  }

  async getAssignment(id: string, populateDetails = false): Promise<IAssignment | null> {
    try {
      let query = Assignment.findById(id);
      
      if (populateDetails) {
        query = query
          .populate('activities.activityId', 'title description difficulty estimatedDuration')
          .populate('instructor', 'username email firstName lastName')
          .populate('audience.classIds', 'name')
          .populate('audience.groupIds', 'name')
          .populate('audience.studentIds', 'username email firstName lastName');
      }

      return await query.exec();
    } catch (error: any) {
      logger.error('Failed to get assignment', { error: error.message, assignmentId: id });
      throw error;
    }
  }

  async updateAssignment(id: string, updates: any, userId: string): Promise<IAssignment | null> {
    try {
      const assignment = await Assignment.findById(id);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Check permissions
      if (assignment.instructor.toString() !== userId) {
        throw new Error('Permission denied');
      }

      // Prevent updates to published assignments (except specific fields)
      if (assignment.status === 'published' || assignment.status === 'active') {
        const allowedFields = ['description', 'resources', 'schedule.dueDate', 'tags'];
        const updateKeys = Object.keys(updates);
        const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
        
        if (invalidFields.length > 0) {
          throw new Error(`Cannot update fields ${invalidFields.join(', ')} on published assignment`);
        }
      }

      Object.assign(assignment, updates);
      assignment.modifiedBy = new ObjectId(userId);
      assignment.timestamps.updatedAt = new Date();

      const updatedAssignment = await assignment.save();
      
      logger.info('Assignment updated', { 
        assignmentId: id,
        updatedBy: userId,
        fields: Object.keys(updates)
      });

      return updatedAssignment;
    } catch (error: any) {
      logger.error('Failed to update assignment', { 
        error: error.message,
        assignmentId: id,
        userId
      });
      throw error;
    }
  }

  async deleteAssignment(id: string, userId: string, permanent = false): Promise<void> {
    try {
      const assignment = await Assignment.findById(id);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      if (assignment.instructor.toString() !== userId) {
        throw new Error('Permission denied');
      }

      if (permanent) {
        // Delete all related student progress
        await StudentProgress.deleteMany({ assignmentId: id });
        await Assignment.findByIdAndDelete(id);
        
        logger.info('Assignment permanently deleted', { assignmentId: id, deletedBy: userId });
      } else {
        assignment.status = 'archived';
        assignment.timestamps.archivedAt = new Date();
        await assignment.save();
        
        logger.info('Assignment archived', { assignmentId: id, archivedBy: userId });
      }
    } catch (error: any) {
      logger.error('Failed to delete assignment', { 
        error: error.message,
        assignmentId: id,
        userId
      });
      throw error;
    }
  }

  // Assignment Distribution and Enrollment
  async publishAssignment(id: string, userId: string): Promise<IAssignment> {
    try {
      const assignment = await Assignment.findById(id);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      if (assignment.instructor.toString() !== userId) {
        throw new Error('Permission denied');
      }

      // Validate assignment is ready for publishing
      const validation = await this.validateAssignment(assignment);
      if (!validation.isValid) {
        throw new Error(`Assignment validation failed: ${validation.errors.join(', ')}`);
      }

      const publishedAssignment = await assignment.publish();

      // Enroll eligible students
      await this.enrollStudents(publishedAssignment);

      logger.info('Assignment published', { 
        assignmentId: id,
        publishedBy: userId,
        enrolledStudents: publishedAssignment.analytics.enrolledCount
      });

      return publishedAssignment;
    } catch (error: any) {
      logger.error('Failed to publish assignment', { 
        error: error.message,
        assignmentId: id,
        userId
      });
      throw error;
    }
  }

  async enrollStudents(assignment: IAssignment): Promise<void> {
    try {
      const eligibleStudents = await assignment.getEligibleStudents();
      
      for (const studentId of eligibleStudents) {
        // Check if student is already enrolled
        const existingProgress = await StudentProgress.findOne({
          assignmentId: assignment._id,
          studentId
        });

        if (!existingProgress) {
          // Create initial progress record
          const progressData = {
            assignmentId: assignment._id,
            studentId,
            status: 'not-started',
            attempts: {
              current: 1,
              total: 0,
              allowed: assignment.configuration.maxAttempts
            },
            timing: {
              totalTimeSpent: 0,
              averageSessionTime: 0,
              longestSession: 0,
              sessionCount: 0
            },
            activityProgress: assignment.activities.map(activity => ({
              activityId: activity.activityId,
              order: activity.order,
              status: 'not-started',
              attempts: 0,
              timeSpent: 0,
              passed: false,
              interactions: [],
              responses: []
            })),
            grading: {
              totalScore: 0,
              maxPossibleScore: 100,
              weightedScore: 0,
              passed: false,
              breakdown: []
            },
            feedback: {
              instructorComments: '',
              autoGeneratedFeedback: ''
            },
            analytics: {
              learningPatterns: {
                averageSessionLength: 0,
                procrastinationScore: 0,
                consistencyScore: 0,
                focusScore: 0
              },
              cognitiveLoad: {
                estimatedLoad: 0,
                strugglingIndicators: [],
                flowStateIndicators: [],
                confusionPoints: []
              },
              skillDevelopment: [],
              motivationFactors: {
                intrinsicMotivation: 0.5,
                extrinsicMotivation: 0.5,
                challengePreference: 'moderate',
                feedbackPreference: 'immediate'
              }
            },
            notifications: {
              remindersSent: [],
              preferences: {
                enabled: true,
                methods: ['email', 'in-app'],
                frequency: 'daily'
              }
            },
            qualityMetrics: {
              dataCompleteness: 1,
              anomaliesDetected: [],
              validationErrors: []
            }
          };

          const progress = new StudentProgress(progressData);
          await progress.save();
        }
      }

      // Update assignment analytics
      assignment.analytics.enrolledCount = eligibleStudents.length;
      assignment.analytics.lastUpdated = new Date();
      await assignment.save();

      logger.info('Students enrolled in assignment', {
        assignmentId: assignment._id,
        enrolledCount: eligibleStudents.length
      });
    } catch (error: any) {
      logger.error('Failed to enroll students', { 
        error: error.message,
        assignmentId: assignment._id
      });
      throw error;
    }
  }

  // Progress Tracking and Analytics
  async getStudentProgress(assignmentId: string, studentId: string): Promise<IStudentProgress | null> {
    try {
      return await StudentProgress.findOne({ assignmentId, studentId })
        .populate('assignmentId', 'title configuration schedule')
        .populate('activityProgress.activityId', 'title description difficulty');
    } catch (error: any) {
      logger.error('Failed to get student progress', { 
        error: error.message,
        assignmentId,
        studentId
      });
      throw error;
    }
  }

  async updateStudentProgress(
    assignmentId: string, 
    studentId: string, 
    updates: any
  ): Promise<IStudentProgress | null> {
    try {
      const progress = await StudentProgress.findOne({ assignmentId, studentId });
      if (!progress) {
        throw new Error('Progress record not found');
      }

      Object.assign(progress, updates);
      const updatedProgress = await progress.save();

      // Update assignment analytics
      await this.updateAssignmentAnalytics(assignmentId);

      return updatedProgress;
    } catch (error: any) {
      logger.error('Failed to update student progress', { 
        error: error.message,
        assignmentId,
        studentId
      });
      throw error;
    }
  }

  async recordActivityInteraction(
    assignmentId: string,
    studentId: string,
    activityId: string,
    interaction: any
  ): Promise<void> {
    try {
      const progress = await StudentProgress.findOne({ assignmentId, studentId });
      if (!progress) {
        throw new Error('Progress record not found');
      }

      await progress.addInteraction(new ObjectId(activityId), interaction);

      logger.debug('Activity interaction recorded', {
        assignmentId,
        studentId,
        activityId,
        interactionType: interaction.type
      });
    } catch (error: any) {
      logger.error('Failed to record activity interaction', { 
        error: error.message,
        assignmentId,
        studentId,
        activityId
      });
      throw error;
    }
  }

  async submitActivity(
    assignmentId: string,
    studentId: string,
    activityId: string,
    submission: any
  ): Promise<void> {
    try {
      const progress = await StudentProgress.findOne({ assignmentId, studentId });
      if (!progress) {
        throw new Error('Progress record not found');
      }

      const activityIndex = progress.activityProgress.findIndex(
        activity => activity.activityId.toString() === activityId
      );

      if (activityIndex < 0) {
        throw new Error('Activity not found in assignment');
      }

      // Update activity progress
      const updates = {
        status: 'completed',
        completedAt: new Date(),
        score: submission.score || 0,
        passed: (submission.score || 0) >= (submission.passingScore || 70),
        ...submission
      };

      await progress.updateActivityProgress(new ObjectId(activityId), updates);

      // Check if assignment is complete
      const allCompleted = progress.activityProgress.every(
        activity => activity.status === 'completed' || activity.status === 'skipped'
      );

      if (allCompleted) {
        await progress.completeAssignment();
      }

      logger.info('Activity submitted', {
        assignmentId,
        studentId,
        activityId,
        score: submission.score
      });
    } catch (error: any) {
      logger.error('Failed to submit activity', { 
        error: error.message,
        assignmentId,
        studentId,
        activityId
      });
      throw error;
    }
  }

  // Analytics and Reporting
  async getAssignmentAnalytics(id: string, dateRange?: { start: Date; end: Date }): Promise<AssignmentAnalytics> {
    try {
      const assignment = await Assignment.findById(id);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Get all student progress for this assignment
      const progressRecords = await StudentProgress.find({ assignmentId: id });

      // Calculate overview metrics
      const overview = {
        totalAssignments: 1,
        activeAssignments: assignment.status === 'active' ? 1 : 0,
        completedAssignments: assignment.status === 'completed' ? 1 : 0,
        averageCompletionRate: assignment.analytics.completionRate,
        totalStudentsEnrolled: assignment.analytics.enrolledCount
      };

      // Calculate performance metrics
      const completedStudents = progressRecords.filter(p => p.status === 'completed');
      const performance = {
        averageScore: assignment.analytics.averageScore,
        passRate: completedStudents.length > 0 ? 
          (completedStudents.filter(p => p.grading.passed).length / completedStudents.length) * 100 : 0,
        averageTimeSpent: assignment.analytics.averageTime,
        strugglingStudents: progressRecords.filter(p => p.grading.totalScore < 60).length,
        topPerformers: progressRecords.filter(p => p.grading.totalScore >= 90).length
      };

      // Calculate engagement metrics
      const totalTimeSpent = progressRecords.reduce((sum, p) => sum + p.timing.totalTimeSpent, 0);
      const averageSessionTime = progressRecords.length > 0 ? 
        progressRecords.reduce((sum, p) => sum + p.timing.averageSessionTime, 0) / progressRecords.length : 0;

      const engagement = {
        averageSessionTime,
        totalTimeSpent,
        mostActiveHours: this.calculateMostActiveHours(progressRecords),
        deviceUsage: this.calculateDeviceUsage(progressRecords)
      };

      // Generate trends (would be more sophisticated with historical data)
      const trends = {
        completionTrend: this.generateCompletionTrend(progressRecords),
        scoreTrend: this.generateScoreTrend(progressRecords),
        engagementTrend: this.generateEngagementTrend(progressRecords)
      };

      return {
        overview,
        performance,
        engagement,
        trends
      };
    } catch (error: any) {
      logger.error('Failed to get assignment analytics', { 
        error: error.message,
        assignmentId: id
      });
      throw error;
    }
  }

  async updateAssignmentAnalytics(assignmentId: string): Promise<void> {
    try {
      const progressRecords = await StudentProgress.find({ assignmentId });
      
      const analytics = {
        enrolledCount: progressRecords.length,
        startedCount: progressRecords.filter(p => p.status !== 'not-started').length,
        completedCount: progressRecords.filter(p => p.status === 'completed' || p.status === 'submitted').length,
        averageScore: 0,
        averageTime: 0,
        completionRate: 0,
        lastUpdated: new Date()
      };

      if (progressRecords.length > 0) {
        const completedRecords = progressRecords.filter(p => p.grading.totalScore > 0);
        
        if (completedRecords.length > 0) {
          analytics.averageScore = completedRecords.reduce((sum, p) => sum + p.grading.totalScore, 0) / completedRecords.length;
        }
        
        analytics.averageTime = progressRecords.reduce((sum, p) => sum + p.timing.totalTimeSpent, 0) / progressRecords.length;
        analytics.completionRate = (analytics.completedCount / analytics.enrolledCount) * 100;
      }

      await Assignment.findByIdAndUpdate(assignmentId, { analytics });
      
      logger.debug('Assignment analytics updated', { assignmentId });
    } catch (error: any) {
      logger.error('Failed to update assignment analytics', { 
        error: error.message,
        assignmentId
      });
      throw error;
    }
  }

  // Utility Methods
  async validateAssignment(assignment: IAssignment): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!assignment.title.trim()) {
      errors.push('Title is required');
    }

    if (!assignment.description.trim()) {
      errors.push('Description is required');
    }

    if (assignment.activities.length === 0) {
      errors.push('At least one activity is required');
    }

    if (!assignment.audience.type) {
      errors.push('Audience type is required');
    }

    if (assignment.audience.type === 'individual' && !assignment.audience.studentIds?.length) {
      errors.push('Student IDs required for individual assignment');
    }

    if (assignment.schedule.dueDate && assignment.schedule.dueDate <= new Date()) {
      errors.push('Due date must be in the future');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async duplicateAssignment(id: string, newTitle: string, userId: string): Promise<IAssignment> {
    try {
      const original = await Assignment.findById(id);
      if (!original) {
        throw new Error('Assignment not found');
      }

      const duplicate = await original.duplicate(newTitle);
      duplicate.instructor = new ObjectId(userId);
      duplicate.createdBy = new ObjectId(userId);
      
      return await duplicate.save();
    } catch (error: any) {
      logger.error('Failed to duplicate assignment', { 
        error: error.message,
        originalId: id,
        userId
      });
      throw error;
    }
  }

  async getAssignments(filters: AssignmentFilters, page = 1, limit = 20): Promise<{
    assignments: IAssignment[];
    total: number;
    pages: number;
  }> {
    try {
      const query: any = {};

      if (filters.instructor) query.instructor = filters.instructor;
      if (filters.status) query.status = filters.status;
      if (filters.category) query.category = filters.category;
      if (filters.tags?.length) query.tags = { $in: filters.tags };

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      if (filters.dateRange) {
        query['schedule.assignedDate'] = {
          $gte: filters.dateRange.start,
          $lte: filters.dateRange.end
        };
      }

      const skip = (page - 1) * limit;
      
      const assignments = await Assignment.find(query)
        .sort({ 'timestamps.updatedAt': -1 })
        .skip(skip)
        .limit(limit)
        .populate('instructor', 'username email firstName lastName');

      const total = await Assignment.countDocuments(query);

      return {
        assignments,
        total,
        pages: Math.ceil(total / limit)
      };
    } catch (error: any) {
      logger.error('Failed to get assignments', { error: error.message, filters });
      throw error;
    }
  }

  // Private helper methods
  private calculateMostActiveHours(progressRecords: IStudentProgress[]): string[] {
    // Simplified implementation - would analyze actual session times
    return ['10:00', '14:00', '19:00']; // Mock data
  }

  private calculateDeviceUsage(progressRecords: IStudentProgress[]): any {
    const deviceCounts = { desktop: 0, tablet: 0, mobile: 0 };
    
    progressRecords.forEach(record => {
      const deviceType = record.metadata?.deviceInfo?.type || 'desktop';
      deviceCounts[deviceType as keyof typeof deviceCounts]++;
    });

    return deviceCounts;
  }

  private generateCompletionTrend(progressRecords: IStudentProgress[]): any[] {
    // Simplified trend generation - would use historical data
    return progressRecords.map((record, index) => ({
      date: new Date(Date.now() - (progressRecords.length - index) * 24 * 60 * 60 * 1000),
      completed: record.status === 'completed' ? 1 : 0
    }));
  }

  private generateScoreTrend(progressRecords: IStudentProgress[]): any[] {
    return progressRecords.map((record, index) => ({
      date: new Date(Date.now() - (progressRecords.length - index) * 24 * 60 * 60 * 1000),
      score: record.grading.totalScore
    }));
  }

  private generateEngagementTrend(progressRecords: IStudentProgress[]): any[] {
    return progressRecords.map((record, index) => ({
      date: new Date(Date.now() - (progressRecords.length - index) * 24 * 60 * 60 * 1000),
      timeSpent: record.timing.totalTimeSpent
    }));
  }
}

export const assignmentService = new AssignmentService();