import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export enum SessionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  SUBMITTED = 'submitted',
  TIMED_OUT = 'timed_out',
  TERMINATED = 'terminated',
  UNDER_REVIEW = 'under_review',
  GRADED = 'graded'
}

export enum AnswerType {
  SELECTED = 'selected',
  TEXT = 'text',
  NUMBER = 'number',
  CODE = 'code',
  FILE = 'file',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  DRAG_DROP = 'drag_drop'
}

// Answer interfaces based on question types
interface BaseAnswer {
  questionId: string;
  type: AnswerType;
  timeSpent: number;
  attempts: number;
  isSkipped: boolean;
  isMarkedForReview: boolean;
  submittedAt: Date;
}

interface SelectedAnswer extends BaseAnswer {
  type: AnswerType.SELECTED;
  selectedOptions: string[]; // Option IDs for multiple choice
  selectedValue?: boolean; // For true/false
}

interface TextAnswer extends BaseAnswer {
  type: AnswerType.TEXT;
  text: string;
  wordCount?: number;
  characterCount?: number;
}

interface NumberAnswer extends BaseAnswer {
  type: AnswerType.NUMBER;
  value: number;
  unit?: string;
}

interface CodeAnswer extends BaseAnswer {
  type: AnswerType.CODE;
  code: string;
  language: string;
  executionResults?: {
    testCaseId: string;
    passed: boolean;
    output: string;
    expectedOutput: string;
    executionTime: number;
    memoryUsed: number;
    error?: string;
  }[];
}

interface FileAnswer extends BaseAnswer {
  type: AnswerType.FILE;
  files: {
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
  }[];
}

interface MatchingAnswer extends BaseAnswer {
  type: AnswerType.MATCHING;
  matches: {
    leftId: string;
    rightId: string;
  }[];
}

interface OrderingAnswer extends BaseAnswer {
  type: AnswerType.ORDERING;
  orderedItems: {
    itemId: string;
    position: number;
  }[];
}

interface DragDropAnswer extends BaseAnswer {
  type: AnswerType.DRAG_DROP;
  placements: {
    itemId: string;
    dropZoneId: string;
  }[];
}

type Answer = 
  | SelectedAnswer 
  | TextAnswer 
  | NumberAnswer 
  | CodeAnswer 
  | FileAnswer 
  | MatchingAnswer 
  | OrderingAnswer 
  | DragDropAnswer;

// Scoring and feedback interfaces
interface QuestionScore {
  questionId: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  isCorrect: boolean;
  partialCredit: number;
  feedback?: string;
  explanation?: string;
  rubricScores?: {
    criteriaId: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
}

interface SessionScore {
  rawScore: number;
  maxScore: number;
  percentage: number;
  passingScore: number;
  isPassed: boolean;
  letterGrade?: string;
  gpa?: number;
  quartile?: number;
  percentile?: number;
}

// Security and monitoring interfaces
interface SecurityEvent {
  timestamp: Date;
  type: 'tab_switch' | 'window_blur' | 'right_click' | 'copy_paste' | 'screenshot' | 'fullscreen_exit' | 'network_change' | 'suspicious_activity';
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  flagged: boolean;
}

interface ProctoringSummary {
  webcamRecording?: string;
  screenRecording?: string;
  keystrokeLogs?: {
    timestamp: Date;
    keystrokes: string;
    questionId?: string;
  }[];
  eyeTracking?: {
    timestamp: Date;
    gazeX: number;
    gazeY: number;
    questionId?: string;
  }[];
  audioRecording?: string;
  environmentCheck: {
    timestamp: Date;
    lightingScore: number;
    noiseLevel: number;
    multiplePersons: boolean;
    prohibitedItems: string[];
  }[];
}

// Session progress tracking
interface SessionProgress {
  currentQuestionIndex: number;
  currentQuestionId: string;
  totalQuestions: number;
  questionsAnswered: number;
  questionsSkipped: number;
  questionsMarkedForReview: number;
  completionPercentage: number;
  timeRemaining: number;
  timeSpent: number;
  estimatedTimeToComplete: number;
}

// Adaptive testing state
interface AdaptiveState {
  currentDifficulty: string;
  abilityEstimate: number;
  standardError: number;
  questionCount: number;
  terminationCriteriaMet: boolean;
  nextQuestionDifficulty?: string;
  itemResponseTheory?: {
    theta: number; // Ability parameter
    sem: number;  // Standard error of measurement
    reliability: number;
  };
}

// Main Assessment Session interface
export interface IAssessmentSession extends Document {
  _id: ObjectId;
  assessmentId: ObjectId;
  userId: ObjectId;
  attemptNumber: number;
  status: SessionStatus;
  
  // Session configuration (copied from assessment at session start)
  configuration: {
    timeLimit?: number;
    questionTimeLimit?: number;
    allowBackward: boolean;
    allowSkip: boolean;
    randomizeOrder: boolean;
    adaptive: boolean;
    securityLevel: string;
  };
  
  // Questions and answers
  questions: {
    questionId: string;
    order: number;
    presented: boolean;
    presentedAt?: Date;
  }[];
  answers: Answer[];
  
  // Progress and timing
  progress: SessionProgress;
  timing: {
    startedAt?: Date;
    pausedAt?: Date;
    resumedAt?: Date;
    submittedAt?: Date;
    totalTimeSpent: number;
    questionTimings: {
      questionId: string;
      startTime: Date;
      endTime?: Date;
      duration: number;
      pauseDurations: number[];
    }[];
  };
  
  // Adaptive testing (if enabled)
  adaptive?: AdaptiveState;
  
  // Scoring and feedback
  scoring?: {
    questionScores: QuestionScore[];
    sessionScore: SessionScore;
    gradedAt?: Date;
    gradedBy?: ObjectId;
    autoGraded: boolean;
    needsManualReview: boolean;
    reviewNotes?: string;
  };
  
  // Security and proctoring
  security: {
    ipAddress: string;
    userAgent: string;
    browserFingerprint: string;
    securityEvents: SecurityEvent[];
    violations: {
      type: string;
      timestamp: Date;
      description: string;
      severity: string;
      action: string;
    }[];
    integrityScore: number;
    flaggedForReview: boolean;
  };
  
  proctoring?: ProctoringSummary;
  
  // Metadata and tracking
  metadata: {
    sessionId: string;
    deviceInfo: {
      platform: string;
      browser: string;
      screenResolution: string;
      timezone: string;
    };
    accessCode?: string;
    instructorId?: ObjectId;
    classId?: ObjectId;
    submissionMethod: 'manual' | 'auto_timeout' | 'forced';
    lastActivity: Date;
    autoSaveFrequency: number;
    version: number;
  };
  
  // Methods
  startSession(): void;
  pauseSession(): void;
  resumeSession(): void;
  submitAnswer(questionId: string, answer: any): void;
  markForReview(questionId: string): void;
  navigateToQuestion(questionId: string): boolean;
  submitSession(): void;
  calculateScore(): SessionScore;
  addSecurityEvent(event: SecurityEvent): void;
  checkViolations(): boolean;
  generateReport(): any;
  canNavigateBack(): boolean;
  canSkipQuestion(): boolean;
  getRemainingTime(): number;
  autoSave(): void;
}

// Schema definition
const AssessmentSessionSchema = new Schema<IAssessmentSession>({
  assessmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: Object.values(SessionStatus),
    default: SessionStatus.NOT_STARTED
  },
  
  configuration: {
    timeLimit: Number,
    questionTimeLimit: Number,
    allowBackward: { type: Boolean, default: true },
    allowSkip: { type: Boolean, default: true },
    randomizeOrder: { type: Boolean, default: false },
    adaptive: { type: Boolean, default: false },
    securityLevel: { type: String, default: 'medium' }
  },
  
  questions: [{
    questionId: { type: String, required: true },
    order: { type: Number, required: true },
    presented: { type: Boolean, default: false },
    presentedAt: Date
  }],
  
  answers: [{
    questionId: { type: String, required: true },
    type: { 
      type: String, 
      enum: Object.values(AnswerType), 
      required: true 
    },
    timeSpent: { type: Number, default: 0 },
    attempts: { type: Number, default: 1 },
    isSkipped: { type: Boolean, default: false },
    isMarkedForReview: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now }
    // Additional fields stored as mixed type for flexibility
  }],
  
  progress: {
    currentQuestionIndex: { type: Number, default: 0 },
    currentQuestionId: String,
    totalQuestions: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    questionsSkipped: { type: Number, default: 0 },
    questionsMarkedForReview: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
    timeRemaining: Number,
    timeSpent: { type: Number, default: 0 },
    estimatedTimeToComplete: Number
  },
  
  timing: {
    startedAt: Date,
    pausedAt: Date,
    resumedAt: Date,
    submittedAt: Date,
    totalTimeSpent: { type: Number, default: 0 },
    questionTimings: [{
      questionId: { type: String, required: true },
      startTime: { type: Date, required: true },
      endTime: Date,
      duration: { type: Number, default: 0 },
      pauseDurations: { type: [Number], default: [] }
    }]
  },
  
  adaptive: {
    currentDifficulty: String,
    abilityEstimate: { type: Number, default: 0 },
    standardError: { type: Number, default: 1 },
    questionCount: { type: Number, default: 0 },
    terminationCriteriaMet: { type: Boolean, default: false },
    nextQuestionDifficulty: String,
    itemResponseTheory: {
      theta: { type: Number, default: 0 },
      sem: { type: Number, default: 1 },
      reliability: { type: Number, default: 0 }
    }
  },
  
  scoring: {
    questionScores: [{
      questionId: { type: String, required: true },
      rawScore: { type: Number, required: true },
      maxScore: { type: Number, required: true },
      percentage: { type: Number, required: true },
      isCorrect: { type: Boolean, required: true },
      partialCredit: { type: Number, default: 0 },
      feedback: String,
      explanation: String,
      rubricScores: [{
        criteriaId: { type: String, required: true },
        score: { type: Number, required: true },
        maxScore: { type: Number, required: true },
        feedback: String
      }]
    }],
    sessionScore: {
      rawScore: { type: Number, default: 0 },
      maxScore: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      passingScore: { type: Number, default: 0 },
      isPassed: { type: Boolean, default: false },
      letterGrade: String,
      gpa: Number,
      quartile: Number,
      percentile: Number
    },
    gradedAt: Date,
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    autoGraded: { type: Boolean, default: true },
    needsManualReview: { type: Boolean, default: false },
    reviewNotes: String
  },
  
  security: {
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    browserFingerprint: String,
    securityEvents: [{
      timestamp: { type: Date, default: Date.now },
      type: { 
        type: String, 
        enum: ['tab_switch', 'window_blur', 'right_click', 'copy_paste', 'screenshot', 'fullscreen_exit', 'network_change', 'suspicious_activity'],
        required: true 
      },
      details: Schema.Types.Mixed,
      severity: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'critical'], 
        default: 'low' 
      },
      flagged: { type: Boolean, default: false }
    }],
    violations: [{
      type: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      description: { type: String, required: true },
      severity: { type: String, required: true },
      action: { type: String, required: true }
    }],
    integrityScore: { type: Number, default: 100, min: 0, max: 100 },
    flaggedForReview: { type: Boolean, default: false }
  },
  
  proctoring: {
    webcamRecording: String,
    screenRecording: String,
    keystrokeLogs: [{
      timestamp: { type: Date, required: true },
      keystrokes: { type: String, required: true },
      questionId: String
    }],
    eyeTracking: [{
      timestamp: { type: Date, required: true },
      gazeX: { type: Number, required: true },
      gazeY: { type: Number, required: true },
      questionId: String
    }],
    audioRecording: String,
    environmentCheck: [{
      timestamp: { type: Date, required: true },
      lightingScore: { type: Number, min: 0, max: 100 },
      noiseLevel: { type: Number, min: 0, max: 100 },
      multiplePersons: { type: Boolean, default: false },
      prohibitedItems: [String]
    }]
  },
  
  metadata: {
    sessionId: { 
      type: String, 
      required: true, 
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    deviceInfo: {
      platform: String,
      browser: String,
      screenResolution: String,
      timezone: String
    },
    accessCode: String,
    instructorId: { type: Schema.Types.ObjectId, ref: 'User' },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    submissionMethod: { 
      type: String, 
      enum: ['manual', 'auto_timeout', 'forced'], 
      default: 'manual' 
    },
    lastActivity: { type: Date, default: Date.now },
    autoSaveFrequency: { type: Number, default: 30 }, // seconds
    version: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});

// Indexes for performance
AssessmentSessionSchema.index({ assessmentId: 1, userId: 1, attemptNumber: 1 }, { unique: true });
AssessmentSessionSchema.index({ userId: 1, status: 1 });
AssessmentSessionSchema.index({ assessmentId: 1, status: 1 });
AssessmentSessionSchema.index({ 'metadata.sessionId': 1 });
AssessmentSessionSchema.index({ 'timing.startedAt': 1 });
AssessmentSessionSchema.index({ 'security.flaggedForReview': 1 });

// Methods
AssessmentSessionSchema.methods.startSession = function() {
  this.status = SessionStatus.IN_PROGRESS;
  this.timing.startedAt = new Date();
  this.metadata.lastActivity = new Date();
  
  if (this.questions.length > 0) {
    this.progress.currentQuestionId = this.questions[0].questionId;
    this.progress.currentQuestionIndex = 0;
  }
};

AssessmentSessionSchema.methods.pauseSession = function() {
  if (this.status === SessionStatus.IN_PROGRESS) {
    this.status = SessionStatus.PAUSED;
    this.timing.pausedAt = new Date();
    
    // Update timing for current question
    const currentTiming = this.timing.questionTimings.find(
      qt => qt.questionId === this.progress.currentQuestionId && !qt.endTime
    );
    if (currentTiming) {
      currentTiming.endTime = new Date();
      currentTiming.duration += currentTiming.endTime.getTime() - currentTiming.startTime.getTime();
    }
  }
};

AssessmentSessionSchema.methods.resumeSession = function() {
  if (this.status === SessionStatus.PAUSED) {
    this.status = SessionStatus.IN_PROGRESS;
    this.timing.resumedAt = new Date();
    this.metadata.lastActivity = new Date();
    
    // Start timing for current question again
    const newTiming = {
      questionId: this.progress.currentQuestionId,
      startTime: new Date(),
      duration: 0,
      pauseDurations: []
    };
    this.timing.questionTimings.push(newTiming);
  }
};

AssessmentSessionSchema.methods.submitAnswer = function(questionId: string, answer: any) {
  // Remove existing answer for this question
  this.answers = this.answers.filter(a => a.questionId !== questionId);
  
  // Add new answer
  this.answers.push({
    ...answer,
    questionId,
    submittedAt: new Date()
  });
  
  // Update progress
  const questionIndex = this.questions.findIndex(q => q.questionId === questionId);
  if (questionIndex !== -1) {
    this.questions[questionIndex].presented = true;
    this.questions[questionIndex].presentedAt = new Date();
  }
  
  this.progress.questionsAnswered = this.answers.filter(a => !a.isSkipped).length;
  this.progress.questionsSkipped = this.answers.filter(a => a.isSkipped).length;
  this.progress.completionPercentage = Math.round((this.progress.questionsAnswered / this.progress.totalQuestions) * 100);
  
  this.metadata.lastActivity = new Date();
};

AssessmentSessionSchema.methods.markForReview = function(questionId: string) {
  const answer = this.answers.find(a => a.questionId === questionId);
  if (answer) {
    answer.isMarkedForReview = !answer.isMarkedForReview;
    this.progress.questionsMarkedForReview = this.answers.filter(a => a.isMarkedForReview).length;
  }
};

AssessmentSessionSchema.methods.navigateToQuestion = function(questionId: string): boolean {
  const questionIndex = this.questions.findIndex(q => q.questionId === questionId);
  
  if (questionIndex === -1) return false;
  
  // Check if backward navigation is allowed
  if (questionIndex < this.progress.currentQuestionIndex && !this.configuration.allowBackward) {
    return false;
  }
  
  // End timing for current question
  const currentTiming = this.timing.questionTimings.find(
    qt => qt.questionId === this.progress.currentQuestionId && !qt.endTime
  );
  if (currentTiming) {
    currentTiming.endTime = new Date();
    currentTiming.duration += currentTiming.endTime.getTime() - currentTiming.startTime.getTime();
  }
  
  // Start timing for new question
  const newTiming = {
    questionId,
    startTime: new Date(),
    duration: 0,
    pauseDurations: []
  };
  this.timing.questionTimings.push(newTiming);
  
  this.progress.currentQuestionIndex = questionIndex;
  this.progress.currentQuestionId = questionId;
  this.metadata.lastActivity = new Date();
  
  return true;
};

AssessmentSessionSchema.methods.submitSession = function() {
  this.status = SessionStatus.SUBMITTED;
  this.timing.submittedAt = new Date();
  this.timing.totalTimeSpent = this.timing.submittedAt.getTime() - this.timing.startedAt!.getTime();
  
  // End timing for current question if still active
  const currentTiming = this.timing.questionTimings.find(
    qt => qt.questionId === this.progress.currentQuestionId && !qt.endTime
  );
  if (currentTiming) {
    currentTiming.endTime = new Date();
    currentTiming.duration += currentTiming.endTime.getTime() - currentTiming.startTime.getTime();
  }
  
  this.metadata.lastActivity = new Date();
};

AssessmentSessionSchema.methods.calculateScore = function(): SessionScore {
  if (!this.scoring) return {
    rawScore: 0,
    maxScore: 0,
    percentage: 0,
    passingScore: 0,
    isPassed: false
  };
  
  const totalRawScore = this.scoring.questionScores.reduce((sum, qs) => sum + qs.rawScore, 0);
  const totalMaxScore = this.scoring.questionScores.reduce((sum, qs) => sum + qs.maxScore, 0);
  const percentage = totalMaxScore > 0 ? Math.round((totalRawScore / totalMaxScore) * 100) : 0;
  
  return {
    rawScore: totalRawScore,
    maxScore: totalMaxScore,
    percentage,
    passingScore: this.scoring.sessionScore.passingScore,
    isPassed: percentage >= this.scoring.sessionScore.passingScore
  };
};

AssessmentSessionSchema.methods.addSecurityEvent = function(event: SecurityEvent) {
  this.security.securityEvents.push(event);
  
  // Update integrity score based on event severity
  let deduction = 0;
  switch (event.severity) {
    case 'low': deduction = 1; break;
    case 'medium': deduction = 5; break;
    case 'high': deduction = 15; break;
    case 'critical': deduction = 30; break;
  }
  
  this.security.integrityScore = Math.max(0, this.security.integrityScore - deduction);
  
  // Flag for review if integrity score drops below threshold
  if (this.security.integrityScore < 70) {
    this.security.flaggedForReview = true;
  }
  
  this.metadata.lastActivity = new Date();
};

AssessmentSessionSchema.methods.checkViolations = function(): boolean {
  const criticalViolations = this.security.securityEvents.filter(
    event => event.severity === 'critical' || event.flagged
  );
  
  return criticalViolations.length > 0 || this.security.integrityScore < 50;
};

AssessmentSessionSchema.methods.generateReport = function() {
  const score = this.calculateScore();
  
  return {
    session: {
      id: this.metadata.sessionId,
      assessmentId: this.assessmentId,
      userId: this.userId,
      attemptNumber: this.attemptNumber,
      status: this.status
    },
    timing: {
      startedAt: this.timing.startedAt,
      submittedAt: this.timing.submittedAt,
      totalTimeSpent: this.timing.totalTimeSpent,
      timeSpentPerQuestion: this.timing.questionTimings
    },
    progress: this.progress,
    score,
    answers: this.answers.length,
    security: {
      integrityScore: this.security.integrityScore,
      violations: this.security.violations.length,
      flaggedForReview: this.security.flaggedForReview,
      events: this.security.securityEvents.length
    },
    questionScores: this.scoring?.questionScores || []
  };
};

AssessmentSessionSchema.methods.canNavigateBack = function(): boolean {
  return this.configuration.allowBackward;
};

AssessmentSessionSchema.methods.canSkipQuestion = function(): boolean {
  return this.configuration.allowSkip;
};

AssessmentSessionSchema.methods.getRemainingTime = function(): number {
  if (!this.configuration.timeLimit || !this.timing.startedAt) return -1;
  
  const elapsed = Date.now() - this.timing.startedAt.getTime();
  const remaining = (this.configuration.timeLimit * 1000) - elapsed;
  
  return Math.max(0, remaining);
};

AssessmentSessionSchema.methods.autoSave = function() {
  this.metadata.lastActivity = new Date();
  this.metadata.version += 1;
  this.save();
};

// Pre-save middleware
AssessmentSessionSchema.pre('save', function(next) {
  this.metadata.lastActivity = new Date();
  next();
});

// Static methods
AssessmentSessionSchema.statics.findActiveSession = function(userId: ObjectId, assessmentId: ObjectId) {
  return this.findOne({
    userId,
    assessmentId,
    status: { $in: [SessionStatus.IN_PROGRESS, SessionStatus.PAUSED] }
  });
};

AssessmentSessionSchema.statics.findUserSessions = function(userId: ObjectId, filters: any = {}) {
  const query = { userId, ...filters };
  return this.find(query).sort({ createdAt: -1 });
};

AssessmentSessionSchema.statics.getSessionStatistics = function(assessmentId: ObjectId) {
  return this.aggregate([
    { $match: { assessmentId, status: SessionStatus.COMPLETED } },
    {
      $group: {
        _id: '$assessmentId',
        totalSessions: { $sum: 1 },
        averageScore: { $avg: '$scoring.sessionScore.percentage' },
        averageTime: { $avg: '$timing.totalTimeSpent' },
        completionRate: { 
          $avg: { 
            $cond: [
              { $eq: ['$status', SessionStatus.COMPLETED] }, 
              1, 
              0
            ] 
          } 
        },
        flaggedSessions: { 
          $sum: { 
            $cond: [
              '$security.flaggedForReview', 
              1, 
              0
            ] 
          } 
        }
      }
    }
  ]);
};

export const AssessmentSession = mongoose.model<IAssessmentSession>('AssessmentSession', AssessmentSessionSchema);