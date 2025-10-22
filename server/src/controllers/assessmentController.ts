import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';
import AssessmentService, { CreateAssessmentData, SessionCreationData, SubmitAnswerData } from '../services/assessmentService';
import { Assessment } from '../models/Assessment';
import { AssessmentSession, SessionStatus } from '../models/AssessmentSession';
import { QuestionBank, QuestionStatus } from '../models/QuestionBank';

export class AssessmentController {
  
  /**
   * Create a new assessment
   */
  static async createAssessment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const assessmentData: CreateAssessmentData = {
        ...req.body,
        createdBy: new ObjectId(userId)
      };
      
      const assessment = await AssessmentService.createAssessment(assessmentData);
      
      res.status(201).json({
        success: true,
        data: assessment,
        message: 'Assessment created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to create assessment',
        details: error.message
      });
    }
  }
  
  /**
   * Get assessment by ID
   */
  static async getAssessment(req: Request, res: Response): Promise<void> {
    try {
      const assessmentId = req.params.assessmentId;
      const userId = req.user?.id;
      
      const assessment = await Assessment.findById(assessmentId)
        .populate('metadata.createdBy', 'username firstName lastName')
        .populate('availability.prerequisites', 'title');
      
      if (!assessment) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }
      
      // Check if user can view this assessment
      if (!assessment.metadata.isPublished && 
          assessment.metadata.createdBy._id.toString() !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      
      // Check eligibility if user is provided
      let eligibility = null;
      if (userId) {
        eligibility = assessment.checkEligibility(new ObjectId(userId));
      }
      
      res.json({
        success: true,
        data: {
          assessment,
          eligibility,
          analytics: assessment.getAnalytics()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get assessment',
        details: error.message
      });
    }
  }
  
  /**
   * Update assessment
   */
  static async updateAssessment(req: Request, res: Response): Promise<void> {
    try {
      const assessmentId = req.params.assessmentId;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const assessment = await AssessmentService.updateAssessment(
        new ObjectId(assessmentId),
        req.body,
        new ObjectId(userId)
      );
      
      res.json({
        success: true,
        data: assessment,
        message: 'Assessment updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to update assessment',
        details: error.message
      });
    }
  }
  
  /**
   * Delete assessment
   */
  static async deleteAssessment(req: Request, res: Response): Promise<void> {
    try {
      const assessmentId = req.params.assessmentId;
      const userId = req.user?.id;
      
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }
      
      // Check permissions
      if (assessment.metadata.createdBy.toString() !== userId) {
        res.status(403).json({ error: 'Unauthorized to delete this assessment' });
        return;
      }
      
      // Soft delete - archive instead of actual deletion
      assessment.metadata.isActive = false;
      assessment.metadata.archivedAt = new Date();
      await assessment.save();
      
      res.json({
        success: true,
        message: 'Assessment archived successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to delete assessment',
        details: error.message
      });
    }
  }
  
  /**
   * Publish assessment
   */
  static async publishAssessment(req: Request, res: Response): Promise<void> {
    try {
      const assessmentId = req.params.assessmentId;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const assessment = await AssessmentService.publishAssessment(
        new ObjectId(assessmentId),
        new ObjectId(userId)
      );
      
      res.json({
        success: true,
        data: assessment,
        message: 'Assessment published successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to publish assessment',
        details: error.message
      });
    }
  }
  
  /**
   * Clone assessment
   */
  static async cloneAssessment(req: Request, res: Response): Promise<void> {
    try {
      const assessmentId = req.params.assessmentId;
      const userId = req.user?.id;
      
      const originalAssessment = await Assessment.findById(assessmentId);
      if (!originalAssessment) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }
      
      const clonedAssessment = originalAssessment.clone();
      clonedAssessment.metadata.createdBy = new ObjectId(userId);
      clonedAssessment.metadata.lastModifiedBy = new ObjectId(userId);
      
      await clonedAssessment.save();
      
      res.status(201).json({
        success: true,
        data: clonedAssessment,
        message: 'Assessment cloned successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to clone assessment',
        details: error.message
      });
    }
  }
  
  /**
   * Search assessments
   */
  static async searchAssessments(req: Request, res: Response): Promise<void> {
    try {
      const { q: searchTerm = '', ...filters } = req.query;
      const userId = req.user?.id;
      
      const assessments = await AssessmentService.searchAssessments(
        searchTerm as string,
        filters,
        userId ? new ObjectId(userId) : undefined
      );
      
      res.json({
        success: true,
        data: assessments,
        count: assessments.length
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to search assessments',
        details: error.message
      });
    }
  }
  
  /**
   * Get user's assessments
   */
  static async getUserAssessments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.params.userId;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID required' });
        return;
      }
      
      const { status, limit = 20, offset = 0 } = req.query;
      
      let query: any = { 'metadata.createdBy': new ObjectId(userId) };
      if (status) query['metadata.isPublished'] = status === 'published';
      
      const assessments = await Assessment.find(query)
        .sort({ 'metadata.createdAt': -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .populate('metadata.createdBy', 'username firstName lastName');
      
      const total = await Assessment.countDocuments(query);
      
      res.json({
        success: true,
        data: assessments,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + assessments.length < total
        }
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get user assessments',
        details: error.message
      });
    }
  }
  
  /**
   * Create assessment session
   */
  static async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const assessmentId = req.params.assessmentId;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const sessionData: SessionCreationData = {
        assessmentId: new ObjectId(assessmentId),
        userId: new ObjectId(userId),
        ipAddress: req.ip || req.connection.remoteAddress || '',
        userAgent: req.get('User-Agent') || '',
        deviceInfo: req.body.deviceInfo,
        accessCode: req.body.accessCode
      };
      
      const session = await AssessmentService.createSession(sessionData);
      
      res.status(201).json({
        success: true,
        data: session,
        message: 'Assessment session created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to create session',
        details: error.message
      });
    }
  }
  
  /**
   * Start assessment session
   */
  static async startSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      
      const session = await AssessmentService.startSession(new ObjectId(sessionId));
      
      res.json({
        success: true,
        data: session,
        message: 'Assessment session started'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to start session',
        details: error.message
      });
    }
  }
  
  /**
   * Get session details
   */
  static async getSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      const userId = req.user?.id;
      
      const session = await AssessmentSession.findById(sessionId)
        .populate('assessmentId', 'title questions timing navigation security grading feedback')
        .populate('userId', 'username firstName lastName');
      
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      
      // Check permissions
      if (session.userId._id.toString() !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      
      res.json({
        success: true,
        data: {
          session,
          currentQuestion: session.questions[session.progress.currentQuestionIndex],
          remainingTime: session.getRemainingTime(),
          canNavigateBack: session.canNavigateBack(),
          canSkip: session.canSkipQuestion()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get session',
        details: error.message
      });
    }
  }
  
  /**
   * Submit answer
   */
  static async submitAnswer(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      const { questionId, answer, timeSpent, attempts } = req.body;
      
      const submitData: SubmitAnswerData = {
        sessionId: new ObjectId(sessionId),
        questionId,
        answer,
        timeSpent: Number(timeSpent),
        attempts: attempts || 1
      };
      
      const session = await AssessmentService.submitAnswer(submitData);
      
      res.json({
        success: true,
        data: {
          progress: session.progress,
          answered: true
        },
        message: 'Answer submitted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to submit answer',
        details: error.message
      });
    }
  }
  
  /**
   * Navigate to question
   */
  static async navigateToQuestion(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      const { questionId } = req.body;
      
      const session = await AssessmentService.navigateToQuestion(
        new ObjectId(sessionId),
        questionId
      );
      
      res.json({
        success: true,
        data: {
          progress: session.progress,
          currentQuestion: session.questions[session.progress.currentQuestionIndex]
        },
        message: 'Navigation successful'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to navigate',
        details: error.message
      });
    }
  }
  
  /**
   * Pause session
   */
  static async pauseSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      
      const session = await AssessmentService.pauseSession(new ObjectId(sessionId));
      
      res.json({
        success: true,
        data: { status: session.status },
        message: 'Session paused'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to pause session',
        details: error.message
      });
    }
  }
  
  /**
   * Resume session
   */
  static async resumeSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      
      const session = await AssessmentService.resumeSession(new ObjectId(sessionId));
      
      res.json({
        success: true,
        data: { 
          status: session.status,
          remainingTime: session.getRemainingTime()
        },
        message: 'Session resumed'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to resume session',
        details: error.message
      });
    }
  }
  
  /**
   * Submit/complete session
   */
  static async submitSession(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      
      const session = await AssessmentService.submitSession(new ObjectId(sessionId));
      
      res.json({
        success: true,
        data: {
          session: session.generateReport(),
          score: session.scoring?.sessionScore,
          needsManualReview: session.scoring?.needsManualReview
        },
        message: 'Assessment submitted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to submit session',
        details: error.message
      });
    }
  }
  
  /**
   * Get session results
   */
  static async getSessionResults(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      const userId = req.user?.id;
      
      const session = await AssessmentSession.findById(sessionId)
        .populate('assessmentId', 'title feedback grading');
      
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      
      // Check permissions
      if (session.userId.toString() !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      
      // Check if results should be shown
      if (session.status !== SessionStatus.GRADED && session.status !== SessionStatus.COMPLETED) {
        res.status(400).json({ error: 'Results not available yet' });
        return;
      }
      
      const assessment = session.assessmentId as any;
      const showResults = assessment.feedback.showScore || assessment.grading.showScoreImmediately;
      
      if (!showResults && assessment.grading.releaseGradesAfter && 
          new Date() < assessment.grading.releaseGradesAfter) {
        res.status(400).json({ error: 'Results not released yet' });
        return;
      }
      
      res.json({
        success: true,
        data: {
          sessionReport: session.generateReport(),
          score: session.scoring?.sessionScore,
          questionScores: session.scoring?.questionScores,
          feedback: this.generateFeedback(session.scoring?.sessionScore, assessment.feedback),
          showCorrectAnswers: assessment.feedback.showCorrectAnswers,
          showExplanations: assessment.feedback.showExplanations
        }
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get session results',
        details: error.message
      });
    }
  }
  
  /**
   * Get user sessions
   */
  static async getUserSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.params.userId;
      const { status, assessmentId, limit = 20, offset = 0 } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status;
      if (assessmentId) filters.assessmentId = new ObjectId(assessmentId as string);
      if (limit) filters.limit = Number(limit);
      
      const sessions = await AssessmentService.getUserSessions(
        new ObjectId(userId),
        filters
      );
      
      res.json({
        success: true,
        data: sessions.map(s => s.generateReport()),
        count: sessions.length
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get user sessions',
        details: error.message
      });
    }
  }
  
  /**
   * Get assessment analytics
   */
  static async getAssessmentAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const assessmentId = req.params.assessmentId;
      const userId = req.user?.id;
      
      // Check if user can view analytics (creator or admin)
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }
      
      if (assessment.metadata.createdBy.toString() !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      
      const analytics = await AssessmentService.getAssessmentAnalytics(
        new ObjectId(assessmentId)
      );
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to get analytics',
        details: error.message
      });
    }
  }
  
  /**
   * Add security event
   */
  static async addSecurityEvent(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.params.sessionId;
      const { type, details, severity = 'low' } = req.body;
      
      const session = await AssessmentSession.findById(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      
      const securityEvent = {
        timestamp: new Date(),
        type,
        details,
        severity,
        flagged: severity === 'critical' || severity === 'high'
      };
      
      session.addSecurityEvent(securityEvent);
      await session.save();
      
      res.json({
        success: true,
        data: {
          integrityScore: session.security.integrityScore,
          flagged: session.security.flaggedForReview
        },
        message: 'Security event recorded'
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to add security event',
        details: error.message
      });
    }
  }
  
  /**
   * Export assessment
   */
  static async exportAssessment(req: Request, res: Response): Promise<void> {
    try {
      const assessmentId = req.params.assessmentId;
      const userId = req.user?.id;
      
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }
      
      // Check permissions
      if (assessment.metadata.createdBy.toString() !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }
      
      const exportData = assessment.export();
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${assessment.title}.json"`);
      res.json(exportData);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to export assessment',
        details: error.message
      });
    }
  }
  
  /**
   * Import assessment
   */
  static async importAssessment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const importData = req.body;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const assessmentData: CreateAssessmentData = {
        ...importData,
        createdBy: new ObjectId(userId)
      };
      
      const assessment = await AssessmentService.createAssessment(assessmentData);
      
      res.status(201).json({
        success: true,
        data: assessment,
        message: 'Assessment imported successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        error: 'Failed to import assessment',
        details: error.message
      });
    }
  }
  
  // Helper methods
  
  private static generateFeedback(score: any, feedbackConfig: any): string {
    if (!score) return '';
    
    const percentage = score.percentage;
    
    if (percentage >= 90) return feedbackConfig.customFeedbackMessages.excellent;
    if (percentage >= 80) return feedbackConfig.customFeedbackMessages.good;
    if (percentage >= 70) return feedbackConfig.customFeedbackMessages.average;
    if (percentage >= 60) return feedbackConfig.customFeedbackMessages.poor;
    return feedbackConfig.customFeedbackMessages.failing;
  }
}

export default AssessmentController;