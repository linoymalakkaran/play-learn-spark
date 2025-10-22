import { ObjectId } from 'mongoose';
import { Assessment, IAssessment, QuestionType, DifficultyLevel } from '../models/Assessment';
import { AssessmentSession, IAssessmentSession, SessionStatus, AnswerType } from '../models/AssessmentSession';
import { QuestionBank, IQuestionBank, QuestionStatus, ValidationStatus } from '../models/QuestionBank';

// Type definitions for service operations
export interface CreateAssessmentData {
  title: string;
  description: string;
  instructions?: string;
  type: string;
  subject: string;
  grade: string;
  topic: string[];
  questions?: any[];
  configuration?: any;
  availability?: any;
  participants?: any;
  createdBy: ObjectId;
}

export interface SessionCreationData {
  assessmentId: ObjectId;
  userId: ObjectId;
  deviceInfo?: any;
  ipAddress: string;
  userAgent: string;
  accessCode?: string;
}

export interface SubmitAnswerData {
  sessionId: ObjectId;
  questionId: string;
  answer: any;
  timeSpent: number;
  attempts?: number;
}

export interface ScoreCalculationResult {
  questionScores: any[];
  sessionScore: any;
  needsManualReview: boolean;
  autoGraded: boolean;
}

export interface AnalyticsData {
  assessment: any;
  sessions: any[];
  questionAnalytics: any[];
  performanceMetrics: any;
}

export class AssessmentService {
  
  /**
   * Create a new assessment
   */
  static async createAssessment(data: CreateAssessmentData): Promise<IAssessment> {
    try {
      const assessment = new Assessment({
        title: data.title,
        description: data.description,
        instructions: data.instructions || '',
        type: data.type,
        subject: data.subject,
        grade: data.grade,
        topic: data.topic,
        questions: data.questions || [],
        
        // Default configuration
        adaptive: {
          enabled: false,
          algorithm: 'Linear',
          initialDifficulty: DifficultyLevel.INTERMEDIATE,
          minQuestions: 5,
          maxQuestions: 50,
          precisionTarget: 0.3
        },
        
        timing: {
          showTimer: true,
          warningThresholds: [25, 10, 5],
          autoSubmitOnTimeout: true,
          allowPause: false,
          trackTimePerQuestion: true
        },
        
        navigation: {
          allowBackward: true,
          allowSkip: true,
          showProgress: true,
          randomizeOrder: false,
          requireSequential: false,
          showQuestionNumbers: true
        },
        
        security: {
          level: 'medium',
          browserLockdown: false,
          disableRightClick: false,
          disableCopyPaste: false,
          fullScreen: false,
          webcamMonitoring: false,
          screenRecording: false,
          keystrokeLogging: false,
          plagiarismDetection: false,
          ipRestrictions: [],
          allowedBrowsers: []
        },
        
        grading: {
          method: 'automatic',
          passingScore: 70,
          gradingScale: [
            { min: 90, max: 100, letter: 'A' },
            { min: 80, max: 89, letter: 'B' },
            { min: 70, max: 79, letter: 'C' },
            { min: 60, max: 69, letter: 'D' },
            { min: 0, max: 59, letter: 'F' }
          ],
          allowNegativeScoring: false,
          partialCreditEnabled: true,
          roundingMethod: 'nearest',
          showCorrectAnswers: true,
          showScoreImmediately: true
        },
        
        feedback: {
          showCorrectAnswers: true,
          showExplanations: true,
          showScore: true,
          showDetailedResults: false,
          customFeedbackMessages: {
            excellent: 'Excellent work!',
            good: 'Good job!',
            average: 'Average performance.',
            poor: 'Needs improvement.',
            failing: 'Additional study required.'
          },
          provideHints: false,
          allowRetakes: false
        },
        
        availability: {
          timeZone: 'UTC',
          attempts: {
            allowed: 1,
            current: 0
          }
        },
        
        participants: {
          type: 'all'
        },
        
        media: {
          images: [],
          videos: [],
          audio: [],
          documents: []
        },
        
        analytics: {
          totalAttempts: 0,
          completionRate: 0,
          averageScore: 0,
          averageTime: 0,
          difficultyAnalysis: [],
          itemStatistics: []
        },
        
        metadata: {
          createdBy: data.createdBy,
          lastModifiedBy: data.createdBy,
          version: 1,
          isPublished: false,
          isDraft: true,
          tags: [],
          category: data.subject,
          difficulty: DifficultyLevel.INTERMEDIATE,
          estimatedDuration: 30,
          weight: 1,
          isActive: true
        },
        
        // Apply any custom configuration
        ...data.configuration,
        ...data.availability,
        ...data.participants
      });
      
      await assessment.save();
      return assessment;
    } catch (error: any) {
      throw new Error(`Failed to create assessment: ${error.message}`);
    }
  }
  
  /**
   * Update an existing assessment
   */
  static async updateAssessment(assessmentId: ObjectId, updates: any, userId: ObjectId): Promise<IAssessment> {
    try {
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }
      
      // Check permissions (creator or admin)
      if (assessment.metadata.createdBy.toString() !== userId.toString()) {
        throw new Error('Unauthorized to update this assessment');
      }
      
      // Update fields
      Object.assign(assessment, updates);
      assessment.metadata.lastModifiedBy = userId;
      assessment.metadata.updatedAt = new Date();
      assessment.metadata.version += 1;
      
      await assessment.save();
      return assessment;
    } catch (error: any) {
      throw new Error(`Failed to update assessment: ${error.message}`);
    }
  }
  
  /**
   * Publish an assessment
   */
  static async publishAssessment(assessmentId: ObjectId, userId: ObjectId): Promise<IAssessment> {
    try {
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }
      
      // Validate assessment before publishing
      const validation = assessment.validateQuestions();
      if (!validation.isValid) {
        throw new Error(`Cannot publish assessment: ${validation.errors.join(', ')}`);
      }
      
      assessment.metadata.isPublished = true;
      assessment.metadata.isDraft = false;
      assessment.metadata.lastModifiedBy = userId;
      
      await assessment.save();
      return assessment;
    } catch (error: any) {
      throw new Error(`Failed to publish assessment: ${error.message}`);
    }
  }
  
  /**
   * Create a new assessment session
   */
  static async createSession(data: SessionCreationData): Promise<IAssessmentSession> {
    try {
      const assessment = await Assessment.findById(data.assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }
      
      // Check eligibility
      const eligibility = assessment.checkEligibility(data.userId);
      if (!eligibility.eligible) {
        throw new Error(eligibility.reason || 'Not eligible to take this assessment');
      }
      
      // Check for existing active session
      const existingSession = await AssessmentSession.findActiveSession(data.userId, data.assessmentId);
      if (existingSession) {
        throw new Error('You already have an active session for this assessment');
      }
      
      // Get current attempt number
      const previousSessions = await AssessmentSession.find({
        userId: data.userId,
        assessmentId: data.assessmentId
      }).sort({ attemptNumber: -1 }).limit(1);
      
      const attemptNumber = previousSessions.length > 0 ? previousSessions[0].attemptNumber + 1 : 1;
      
      // Check attempt limits
      if (attemptNumber > assessment.availability.attempts.allowed) {
        throw new Error('Maximum number of attempts exceeded');
      }
      
      // Generate question set
      const questionSet = assessment.generateQuestionSet(data.userId);
      
      // Create session
      const session = new AssessmentSession({
        assessmentId: data.assessmentId,
        userId: data.userId,
        attemptNumber,
        status: SessionStatus.NOT_STARTED,
        
        configuration: {
          timeLimit: assessment.timing.timeLimit,
          questionTimeLimit: assessment.timing.questionTimeLimit,
          allowBackward: assessment.navigation.allowBackward,
          allowSkip: assessment.navigation.allowSkip,
          randomizeOrder: assessment.navigation.randomizeOrder,
          adaptive: assessment.adaptive.enabled,
          securityLevel: assessment.security.level
        },
        
        questions: questionSet.map((q, index) => ({
          questionId: q.id,
          order: index,
          presented: false
        })),
        
        answers: [],
        
        progress: {
          currentQuestionIndex: 0,
          currentQuestionId: questionSet.length > 0 ? questionSet[0].id : '',
          totalQuestions: questionSet.length,
          questionsAnswered: 0,
          questionsSkipped: 0,
          questionsMarkedForReview: 0,
          completionPercentage: 0,
          timeRemaining: assessment.timing.timeLimit,
          timeSpent: 0,
          estimatedTimeToComplete: assessment.metadata.estimatedDuration * 60
        },
        
        timing: {
          totalTimeSpent: 0,
          questionTimings: []
        },
        
        security: {
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          browserFingerprint: '', // Would be generated client-side
          securityEvents: [],
          violations: [],
          integrityScore: 100,
          flaggedForReview: false
        },
        
        metadata: {
          deviceInfo: data.deviceInfo || {},
          accessCode: data.accessCode,
          submissionMethod: 'manual',
          lastActivity: new Date(),
          autoSaveFrequency: 30,
          version: 1
        }
      });
      
      if (assessment.adaptive.enabled) {
        session.adaptive = {
          currentDifficulty: assessment.adaptive.initialDifficulty,
          abilityEstimate: 0,
          standardError: 1,
          questionCount: 0,
          terminationCriteriaMet: false,
          itemResponseTheory: {
            theta: 0,
            sem: 1,
            reliability: 0
          }
        };
      }
      
      await session.save();
      return session;
    } catch (error: any) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }
  
  /**
   * Start an assessment session
   */
  static async startSession(sessionId: ObjectId): Promise<IAssessmentSession> {
    try {
      const session = await AssessmentSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      if (session.status !== SessionStatus.NOT_STARTED) {
        throw new Error('Session has already been started');
      }
      
      session.startSession();
      await session.save();
      
      return session;
    } catch (error: any) {
      throw new Error(`Failed to start session: ${error.message}`);
    }
  }
  
  /**
   * Submit an answer for a question
   */
  static async submitAnswer(data: SubmitAnswerData): Promise<IAssessmentSession> {
    try {
      const session = await AssessmentSession.findById(data.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      if (session.status !== SessionStatus.IN_PROGRESS) {
        throw new Error('Session is not in progress');
      }
      
      // Create answer object based on question type
      const answer = {
        questionId: data.questionId,
        type: this.determineAnswerType(data.answer),
        timeSpent: data.timeSpent,
        attempts: data.attempts || 1,
        isSkipped: data.answer === null || data.answer === undefined,
        isMarkedForReview: false,
        submittedAt: new Date(),
        ...data.answer
      };
      
      session.submitAnswer(data.questionId, answer);
      
      // Auto-save
      await session.save();
      
      // Update question metrics in question bank if available
      await this.updateQuestionMetrics(data.questionId, {
        isCorrect: false, // Will be calculated during scoring
        timeSpent: data.timeSpent,
        selectedOption: data.answer.selectedOptions?.[0]
      });
      
      return session;
    } catch (error: any) {
      throw new Error(`Failed to submit answer: ${error.message}`);
    }
  }
  
  /**
   * Navigate to a specific question
   */
  static async navigateToQuestion(sessionId: ObjectId, questionId: string): Promise<IAssessmentSession> {
    try {
      const session = await AssessmentSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      const success = session.navigateToQuestion(questionId);
      if (!success) {
        throw new Error('Cannot navigate to this question');
      }
      
      await session.save();
      return session;
    } catch (error: any) {
      throw new Error(`Failed to navigate to question: ${error.message}`);
    }
  }
  
  /**
   * Pause an assessment session
   */
  static async pauseSession(sessionId: ObjectId): Promise<IAssessmentSession> {
    try {
      const session = await AssessmentSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      session.pauseSession();
      await session.save();
      
      return session;
    } catch (error: any) {
      throw new Error(`Failed to pause session: ${error.message}`);
    }
  }
  
  /**
   * Resume an assessment session
   */
  static async resumeSession(sessionId: ObjectId): Promise<IAssessmentSession> {
    try {
      const session = await AssessmentSession.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      session.resumeSession();
      await session.save();
      
      return session;
    } catch (error: any) {
      throw new Error(`Failed to resume session: ${error.message}`);
    }
  }
  
  /**
   * Submit/complete an assessment session
   */
  static async submitSession(sessionId: ObjectId): Promise<IAssessmentSession> {
    try {
      const session = await AssessmentSession.findById(sessionId)
        .populate('assessmentId');
      
      if (!session) {
        throw new Error('Session not found');
      }
      
      session.submitSession();
      
      // Calculate scores
      const scoreResult = await this.calculateScore(session);
      session.scoring = {
        questionScores: scoreResult.questionScores,
        sessionScore: scoreResult.sessionScore,
        gradedAt: new Date(),
        autoGraded: scoreResult.autoGraded,
        needsManualReview: scoreResult.needsManualReview
      };
      
      session.status = scoreResult.needsManualReview ? 
        SessionStatus.UNDER_REVIEW : 
        SessionStatus.GRADED;
      
      await session.save();
      
      // Update assessment analytics
      await this.updateAssessmentAnalytics(session.assessmentId);
      
      return session;
    } catch (error: any) {
      throw new Error(`Failed to submit session: ${error.message}`);
    }
  }
  
  /**
   * Calculate scores for a session
   */
  static async calculateScore(session: IAssessmentSession): Promise<ScoreCalculationResult> {
    try {
      const assessment = await Assessment.findById(session.assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found for scoring');
      }
      
      const questionScores = [];
      let totalRawScore = 0;
      let totalMaxScore = 0;
      let needsManualReview = false;
      
      for (const question of assessment.questions) {
        const answer = session.answers.find(a => a.questionId === question.id);
        
        let questionScore = {
          questionId: question.id,
          rawScore: 0,
          maxScore: question.points,
          percentage: 0,
          isCorrect: false,
          partialCredit: 0,
          feedback: '',
          explanation: question.explanation || ''
        };
        
        if (answer && !answer.isSkipped) {
          switch (question.type) {
            case QuestionType.MULTIPLE_CHOICE:
              questionScore = this.scoreMultipleChoice(question, answer);
              break;
            case QuestionType.TRUE_FALSE:
              questionScore = this.scoreTrueFalse(question, answer);
              break;
            case QuestionType.SHORT_ANSWER:
              questionScore = this.scoreShortAnswer(question, answer);
              break;
            case QuestionType.NUMERICAL:
              questionScore = this.scoreNumerical(question, answer);
              break;
            case QuestionType.ESSAY:
              questionScore = this.scoreEssay(question, answer);
              needsManualReview = true;
              break;
            case QuestionType.CODE:
              questionScore = await this.scoreCode(question, answer);
              break;
            default:
              questionScore.feedback = 'Question type not supported for auto-grading';
              needsManualReview = true;
          }
        }
        
        questionScores.push(questionScore);
        totalRawScore += questionScore.rawScore;
        totalMaxScore += questionScore.maxScore;
      }
      
      const percentage = totalMaxScore > 0 ? Math.round((totalRawScore / totalMaxScore) * 100) : 0;
      
      const sessionScore = {
        rawScore: totalRawScore,
        maxScore: totalMaxScore,
        percentage,
        passingScore: assessment.grading.passingScore,
        isPassed: percentage >= assessment.grading.passingScore,
        letterGrade: this.calculateLetterGrade(percentage, assessment.grading.gradingScale),
        percentile: 0, // Would be calculated based on other students' scores
        quartile: 0
      };
      
      return {
        questionScores,
        sessionScore,
        needsManualReview,
        autoGraded: !needsManualReview
      };
    } catch (error: any) {
      throw new Error(`Failed to calculate score: ${error.message}`);
    }
  }
  
  /**
   * Get assessment analytics
   */
  static async getAssessmentAnalytics(assessmentId: ObjectId): Promise<AnalyticsData> {
    try {
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }
      
      const sessions = await AssessmentSession.find({
        assessmentId,
        status: { $in: [SessionStatus.COMPLETED, SessionStatus.GRADED] }
      });
      
      const analytics = assessment.getAnalytics();
      const sessionStats = await AssessmentSession.getSessionStatistics(assessmentId);
      
      return {
        assessment: analytics,
        sessions: sessions.map(s => s.generateReport()),
        questionAnalytics: this.calculateQuestionAnalytics(assessment, sessions),
        performanceMetrics: sessionStats[0] || {}
      };
    } catch (error: any) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }
  
  /**
   * Search assessments
   */
  static async searchAssessments(searchTerm: string, filters: any = {}, userId?: ObjectId): Promise<IAssessment[]> {
    try {
      let query: any = {};
      
      if (searchTerm) {
        query.$or = [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { 'metadata.tags': { $in: [new RegExp(searchTerm, 'i')] } }
        ];
      }
      
      // Apply filters
      if (filters.subject) query.subject = filters.subject;
      if (filters.grade) query.grade = filters.grade;
      if (filters.type) query.type = filters.type;
      if (filters.difficulty) query['metadata.difficulty'] = filters.difficulty;
      if (filters.category) query['metadata.category'] = filters.category;
      if (filters.published !== undefined) query['metadata.isPublished'] = filters.published;
      
      // User-specific filters
      if (userId) {
        if (filters.myAssessments) {
          query['metadata.createdBy'] = userId;
        } else {
          // Only show published assessments or ones user created
          query.$or = [
            { 'metadata.isPublished': true, 'metadata.isActive': true },
            { 'metadata.createdBy': userId }
          ];
        }
      } else {
        // Public access - only published assessments
        query['metadata.isPublished'] = true;
        query['metadata.isActive'] = true;
      }
      
      const assessments = await Assessment.find(query)
        .sort({ 'metadata.createdAt': -1 })
        .populate('metadata.createdBy', 'username firstName lastName')
        .limit(filters.limit || 50);
      
      return assessments;
    } catch (error: any) {
      throw new Error(`Failed to search assessments: ${error.message}`);
    }
  }
  
  /**
   * Get user's assessment sessions
   */
  static async getUserSessions(userId: ObjectId, filters: any = {}): Promise<IAssessmentSession[]> {
    try {
      const sessions = await AssessmentSession.findUserSessions(userId, filters)
        .populate('assessmentId', 'title type subject grade')
        .limit(filters.limit || 20);
      
      return sessions;
    } catch (error: any) {
      throw new Error(`Failed to get user sessions: ${error.message}`);
    }
  }
  
  // Helper methods
  
  private static determineAnswerType(answer: any): AnswerType {
    if (answer.selectedOptions || answer.selectedValue !== undefined) return AnswerType.SELECTED;
    if (answer.text !== undefined) return AnswerType.TEXT;
    if (answer.value !== undefined) return AnswerType.NUMBER;
    if (answer.code !== undefined) return AnswerType.CODE;
    if (answer.files !== undefined) return AnswerType.FILE;
    if (answer.matches !== undefined) return AnswerType.MATCHING;
    if (answer.orderedItems !== undefined) return AnswerType.ORDERING;
    if (answer.placements !== undefined) return AnswerType.DRAG_DROP;
    return AnswerType.TEXT;
  }
  
  private static scoreMultipleChoice(question: any, answer: any): any {
    const selectedOptions = answer.selectedOptions || [];
    const correctOptions = question.options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id);
    
    let score = 0;
    let isCorrect = false;
    
    if (question.allowMultiple) {
      // Partial credit for multiple selection
      const correctSelections = selectedOptions.filter((id: string) => correctOptions.includes(id)).length;
      const incorrectSelections = selectedOptions.filter((id: string) => !correctOptions.includes(id)).length;
      
      if (correctSelections === correctOptions.length && incorrectSelections === 0) {
        score = question.points;
        isCorrect = true;
      } else if (correctSelections > 0) {
        score = (correctSelections / correctOptions.length) * question.points;
        if (incorrectSelections > 0) {
          score *= 0.5; // Penalty for incorrect selections
        }
      }
    } else {
      // Single selection
      if (selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0])) {
        score = question.points;
        isCorrect = true;
      }
    }
    
    return {
      questionId: question.id,
      rawScore: Math.max(0, score),
      maxScore: question.points,
      percentage: Math.round((score / question.points) * 100),
      isCorrect,
      partialCredit: score < question.points ? score : 0,
      feedback: isCorrect ? 'Correct!' : 'Incorrect',
      explanation: question.explanation
    };
  }
  
  private static scoreTrueFalse(question: any, answer: any): any {
    const isCorrect = answer.selectedValue === question.correctAnswer;
    const score = isCorrect ? question.points : 0;
    
    return {
      questionId: question.id,
      rawScore: score,
      maxScore: question.points,
      percentage: Math.round((score / question.points) * 100),
      isCorrect,
      partialCredit: 0,
      feedback: isCorrect ? 'Correct!' : 'Incorrect',
      explanation: question.explanation
    };
  }
  
  private static scoreShortAnswer(question: any, answer: any): any {
    const userAnswer = answer.text?.trim() || '';
    const acceptedAnswers = question.acceptedAnswers || [];
    
    let isCorrect = false;
    
    for (const accepted of acceptedAnswers) {
      if (question.exactMatch) {
        if (question.caseSensitive) {
          isCorrect = userAnswer === accepted;
        } else {
          isCorrect = userAnswer.toLowerCase() === accepted.toLowerCase();
        }
      } else {
        if (question.caseSensitive) {
          isCorrect = userAnswer.includes(accepted);
        } else {
          isCorrect = userAnswer.toLowerCase().includes(accepted.toLowerCase());
        }
      }
      
      if (isCorrect) break;
    }
    
    const score = isCorrect ? question.points : 0;
    
    return {
      questionId: question.id,
      rawScore: score,
      maxScore: question.points,
      percentage: Math.round((score / question.points) * 100),
      isCorrect,
      partialCredit: 0,
      feedback: isCorrect ? 'Correct!' : 'Incorrect',
      explanation: question.explanation
    };
  }
  
  private static scoreNumerical(question: any, answer: any): any {
    const userValue = parseFloat(answer.value);
    const correctValue = question.correctAnswer;
    const tolerance = question.tolerance || 0;
    
    const isCorrect = Math.abs(userValue - correctValue) <= tolerance;
    const score = isCorrect ? question.points : 0;
    
    return {
      questionId: question.id,
      rawScore: score,
      maxScore: question.points,
      percentage: Math.round((score / question.points) * 100),
      isCorrect,
      partialCredit: 0,
      feedback: isCorrect ? 'Correct!' : `Incorrect. Expected: ${correctValue}`,
      explanation: question.explanation
    };
  }
  
  private static scoreEssay(question: any, answer: any): any {
    // Essay questions require manual grading
    return {
      questionId: question.id,
      rawScore: 0,
      maxScore: question.points,
      percentage: 0,
      isCorrect: false,
      partialCredit: 0,
      feedback: 'This answer requires manual grading',
      explanation: question.explanation
    };
  }
  
  private static async scoreCode(question: any, answer: any): Promise<any> {
    // Simplified code scoring - in production, would use code execution service
    const testCases = question.testCases || [];
    let passedTests = 0;
    
    // Mock test case execution results
    for (const testCase of testCases) {
      // In production, execute the code with test case input
      // For now, assume all visible test cases pass
      if (testCase.isVisible) {
        passedTests++;
      }
    }
    
    const score = (passedTests / testCases.length) * question.points;
    const isCorrect = passedTests === testCases.length;
    
    return {
      questionId: question.id,
      rawScore: score,
      maxScore: question.points,
      percentage: Math.round((score / question.points) * 100),
      isCorrect,
      partialCredit: score < question.points ? score : 0,
      feedback: `Passed ${passedTests}/${testCases.length} test cases`,
      explanation: question.explanation
    };
  }
  
  private static calculateLetterGrade(percentage: number, gradingScale: any[]): string {
    for (const grade of gradingScale) {
      if (percentage >= grade.min && percentage <= grade.max) {
        return grade.letter || '';
      }
    }
    return 'F';
  }
  
  private static async updateQuestionMetrics(questionId: string, responseData: any): Promise<void> {
    try {
      const question = await QuestionBank.findOne({
        'content.id': questionId,
        'metadata.status': QuestionStatus.ACTIVE
      });
      
      if (question) {
        question.updateMetrics(responseData);
        await question.save();
      }
    } catch (error) {
      // Silent fail - metrics update shouldn't break the main flow
      console.error('Failed to update question metrics:', error);
    }
  }
  
  private static async updateAssessmentAnalytics(assessmentId: ObjectId): Promise<void> {
    try {
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) return;
      
      const sessions = await AssessmentSession.find({
        assessmentId,
        status: { $in: [SessionStatus.COMPLETED, SessionStatus.GRADED] }
      });
      
      if (sessions.length === 0) return;
      
      // Update assessment analytics
      assessment.analytics.totalAttempts = sessions.length;
      assessment.analytics.completionRate = (sessions.filter(s => s.status === SessionStatus.COMPLETED).length / sessions.length) * 100;
      
      const scoredSessions = sessions.filter(s => s.scoring?.sessionScore);
      if (scoredSessions.length > 0) {
        assessment.analytics.averageScore = scoredSessions.reduce((sum, s) => sum + s.scoring!.sessionScore.percentage, 0) / scoredSessions.length;
        assessment.analytics.averageTime = sessions.reduce((sum, s) => sum + s.timing.totalTimeSpent, 0) / sessions.length;
      }
      
      await assessment.save();
    } catch (error) {
      console.error('Failed to update assessment analytics:', error);
    }
  }
  
  private static calculateQuestionAnalytics(assessment: IAssessment, sessions: IAssessmentSession[]): any[] {
    const questionAnalytics = [];
    
    for (const question of assessment.questions) {
      const questionResponses = sessions.flatMap(s => 
        s.answers.filter(a => a.questionId === question.id)
      );
      
      const correctResponses = questionResponses.filter(r => {
        // Would need to check scoring results
        return false; // Simplified
      });
      
      questionAnalytics.push({
        questionId: question.id,
        questionText: question.question,
        type: question.type,
        difficulty: question.difficulty,
        totalResponses: questionResponses.length,
        correctResponses: correctResponses.length,
        averageTime: questionResponses.reduce((sum, r) => sum + r.timeSpent, 0) / questionResponses.length || 0,
        difficultyIndex: questionResponses.length > 0 ? (correctResponses.length / questionResponses.length) * 100 : 0
      });
    }
    
    return questionAnalytics;
  }
}

export default AssessmentService;