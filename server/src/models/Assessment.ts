import mongoose, { Schema, Document, ObjectId } from 'mongoose';

// Enums for type safety
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  NUMERICAL = 'numerical',
  CODE = 'code',
  DRAG_DROP = 'drag_drop'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum AssessmentType {
  QUIZ = 'quiz',
  TEST = 'test',
  EXAM = 'exam',
  PRACTICE = 'practice',
  ASSIGNMENT = 'assignment',
  SURVEY = 'survey'
}

export enum GradingMethod {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  HYBRID = 'hybrid',
  PEER_REVIEW = 'peer_review'
}

export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  MAXIMUM = 'maximum'
}

// Question interfaces
interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  points: number;
  difficulty: DifficultyLevel;
  timeLimit?: number; // in seconds
  required: boolean;
  tags: string[];
  metadata: {
    subject?: string;
    topic?: string;
    learningObjective?: string;
    bloomsTaxonomy?: string;
    cognitiveLoad?: number;
  };
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: QuestionType.MULTIPLE_CHOICE;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
    feedback?: string;
  }[];
  allowMultiple: boolean;
  shuffleOptions: boolean;
  showExplanations: boolean;
}

interface TrueFalseQuestion extends BaseQuestion {
  type: QuestionType.TRUE_FALSE;
  correctAnswer: boolean;
  explanation?: string;
}

interface ShortAnswerQuestion extends BaseQuestion {
  type: QuestionType.SHORT_ANSWER;
  acceptedAnswers: string[];
  caseSensitive: boolean;
  exactMatch: boolean;
  maxLength: number;
  gradingCriteria?: string;
}

interface EssayQuestion extends BaseQuestion {
  type: QuestionType.ESSAY;
  minWords?: number;
  maxWords?: number;
  rubric?: {
    criteria: {
      name: string;
      description: string;
      weight: number;
      levels: {
        score: number;
        description: string;
      }[];
    }[];
  };
  sampleAnswer?: string;
}

interface FillInBlankQuestion extends BaseQuestion {
  type: QuestionType.FILL_IN_BLANK;
  template: string; // Text with [blank] placeholders
  blanks: {
    id: string;
    acceptedAnswers: string[];
    caseSensitive: boolean;
    points: number;
  }[];
}

interface MatchingQuestion extends BaseQuestion {
  type: QuestionType.MATCHING;
  leftColumn: {
    id: string;
    text: string;
    media?: string;
  }[];
  rightColumn: {
    id: string;
    text: string;
    media?: string;
  }[];
  correctMatches: {
    leftId: string;
    rightId: string;
  }[];
  allowPartialCredit: boolean;
}

interface OrderingQuestion extends BaseQuestion {
  type: QuestionType.ORDERING;
  items: {
    id: string;
    text: string;
    correctPosition: number;
  }[];
  allowPartialCredit: boolean;
}

interface NumericalQuestion extends BaseQuestion {
  type: QuestionType.NUMERICAL;
  correctAnswer: number;
  tolerance?: number;
  unit?: string;
  acceptableUnits?: string[];
}

interface CodeQuestion extends BaseQuestion {
  type: QuestionType.CODE;
  language: string;
  starterCode?: string;
  expectedOutput?: string;
  testCases: {
    input: string;
    expectedOutput: string;
    isVisible: boolean;
    points: number;
  }[];
  timeLimit: number;
  memoryLimit?: number;
}

interface DragDropQuestion extends BaseQuestion {
  type: QuestionType.DRAG_DROP;
  dropZones: {
    id: string;
    label: string;
    acceptsMultiple: boolean;
    correctItems: string[];
  }[];
  draggableItems: {
    id: string;
    text: string;
    media?: string;
  }[];
  allowPartialCredit: boolean;
}

type Question = 
  | MultipleChoiceQuestion 
  | TrueFalseQuestion 
  | ShortAnswerQuestion 
  | EssayQuestion 
  | FillInBlankQuestion 
  | MatchingQuestion 
  | OrderingQuestion 
  | NumericalQuestion 
  | CodeQuestion 
  | DragDropQuestion;

// Assessment configuration interfaces
interface AdaptiveSettings {
  enabled: boolean;
  algorithm: 'CAT' | 'Linear' | 'Branching'; // Computer Adaptive Testing
  initialDifficulty: DifficultyLevel;
  minQuestions: number;
  maxQuestions: number;
  precisionTarget: number;
  terminationCriteria: {
    standardError?: number;
    confidence?: number;
    maxItems?: number;
  };
}

interface TimingSettings {
  timeLimit?: number; // Total time in seconds
  questionTimeLimit?: number; // Per question time limit
  showTimer: boolean;
  warningThresholds: number[]; // Warning at these time remaining percentages
  autoSubmitOnTimeout: boolean;
  allowPause: boolean;
  trackTimePerQuestion: boolean;
}

interface NavigationSettings {
  allowBackward: boolean;
  allowSkip: boolean;
  showProgress: boolean;
  randomizeOrder: boolean;
  requireSequential: boolean;
  showQuestionNumbers: boolean;
}

interface SecuritySettings {
  level: SecurityLevel;
  browserLockdown: boolean;
  disableRightClick: boolean;
  disableCopyPaste: boolean;
  fullScreen: boolean;
  webcamMonitoring: boolean;
  screenRecording: boolean;
  keystrokeLogging: boolean;
  plagiarismDetection: boolean;
  ipRestrictions: string[];
  allowedBrowsers: string[];
  minimumResolution?: {
    width: number;
    height: number;
  };
}

interface GradingSettings {
  method: GradingMethod;
  passingScore: number;
  gradingScale: {
    min: number;
    max: number;
    letter?: string;
  }[];
  allowNegativeScoring: boolean;
  penaltyPerIncorrect?: number;
  bonusPerCorrect?: number;
  partialCreditEnabled: boolean;
  roundingMethod: 'up' | 'down' | 'nearest';
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  releaseGradesAfter?: Date;
}

interface FeedbackSettings {
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  showScore: boolean;
  showDetailedResults: boolean;
  customFeedbackMessages: {
    excellent: string;
    good: string;
    average: string;
    poor: string;
    failing: string;
  };
  provideHints: boolean;
  allowRetakes: boolean;
  maxRetakes?: number;
}

// Main Assessment interface
export interface IAssessment extends Document {
  _id: ObjectId;
  title: string;
  description: string;
  instructions: string;
  type: AssessmentType;
  subject: string;
  grade: string;
  topic: string[];
  
  // Questions and structure
  questions: Question[];
  questionPools?: {
    id: string;
    name: string;
    questions: string[]; // Question IDs
    selectCount: number; // How many to select from this pool
    randomize: boolean;
  }[];
  
  // Configuration
  adaptive: AdaptiveSettings;
  timing: TimingSettings;
  navigation: NavigationSettings;
  security: SecuritySettings;
  grading: GradingSettings;
  feedback: FeedbackSettings;
  
  // Availability and access
  availability: {
    startDate?: Date;
    endDate?: Date;
    timeZone: string;
    attempts: {
      allowed: number;
      current: number;
    };
    accessCodes?: string[];
    prerequisites?: ObjectId[];
  };
  
  // Participants and restrictions
  participants: {
    type: 'all' | 'specific' | 'group';
    userIds?: ObjectId[];
    groupIds?: ObjectId[];
    excludeIds?: ObjectId[];
  };
  
  // Content and media
  media: {
    images: string[];
    videos: string[];
    audio: string[];
    documents: string[];
  };
  
  // Analytics and tracking
  analytics: {
    totalAttempts: number;
    completionRate: number;
    averageScore: number;
    averageTime: number;
    difficultyAnalysis: {
      questionId: string;
      difficulty: number;
      discrimination: number;
      responses: number;
    }[];
    itemStatistics: {
      questionId: string;
      correct: number;
      incorrect: number;
      skipped: number;
      averageTime: number;
    }[];
  };
  
  // Metadata
  metadata: {
    createdBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    lastModifiedBy: ObjectId;
    version: number;
    isPublished: boolean;
    isDraft: boolean;
    tags: string[];
    category: string;
    difficulty: DifficultyLevel;
    estimatedDuration: number;
    weight: number; // For grade calculation
    isActive: boolean;
    archivedAt?: Date;
  };
  
  // Methods
  addQuestion(question: Question): void;
  removeQuestion(questionId: string): void;
  updateQuestion(questionId: string, updates: Partial<Question>): void;
  validateQuestions(): { isValid: boolean; errors: string[] };
  calculateTotalPoints(): number;
  generateQuestionSet(userId?: ObjectId): Question[];
  checkEligibility(userId: ObjectId): { eligible: boolean; reason?: string };
  getAnalytics(): any;
  clone(): IAssessment;
  export(): any;
  import(data: any): void;
}

// Schema definition
const AssessmentSchema = new Schema<IAssessment>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  instructions: {
    type: String,
    maxlength: 5000
  },
  type: {
    type: String,
    enum: Object.values(AssessmentType),
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  topic: [{
    type: String,
    required: true
  }],
  
  questions: [{
    id: { type: String, required: true },
    type: { 
      type: String, 
      enum: Object.values(QuestionType), 
      required: true 
    },
    question: { type: String, required: true },
    description: String,
    points: { type: Number, required: true, min: 0 },
    difficulty: { 
      type: String, 
      enum: Object.values(DifficultyLevel), 
      required: true 
    },
    timeLimit: { type: Number, min: 0 },
    required: { type: Boolean, default: true },
    tags: [String],
    metadata: {
      subject: String,
      topic: String,
      learningObjective: String,
      bloomsTaxonomy: String,
      cognitiveLoad: Number
    }
    // Additional fields handled dynamically based on question type
  }],
  
  questionPools: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    questions: [String],
    selectCount: { type: Number, required: true, min: 1 },
    randomize: { type: Boolean, default: true }
  }],
  
  adaptive: {
    enabled: { type: Boolean, default: false },
    algorithm: { 
      type: String, 
      enum: ['CAT', 'Linear', 'Branching'], 
      default: 'Linear' 
    },
    initialDifficulty: { 
      type: String, 
      enum: Object.values(DifficultyLevel), 
      default: DifficultyLevel.INTERMEDIATE 
    },
    minQuestions: { type: Number, default: 5 },
    maxQuestions: { type: Number, default: 50 },
    precisionTarget: { type: Number, default: 0.3 },
    terminationCriteria: {
      standardError: Number,
      confidence: Number,
      maxItems: Number
    }
  },
  
  timing: {
    timeLimit: Number,
    questionTimeLimit: Number,
    showTimer: { type: Boolean, default: true },
    warningThresholds: { type: [Number], default: [25, 10, 5] },
    autoSubmitOnTimeout: { type: Boolean, default: true },
    allowPause: { type: Boolean, default: false },
    trackTimePerQuestion: { type: Boolean, default: true }
  },
  
  navigation: {
    allowBackward: { type: Boolean, default: true },
    allowSkip: { type: Boolean, default: true },
    showProgress: { type: Boolean, default: true },
    randomizeOrder: { type: Boolean, default: false },
    requireSequential: { type: Boolean, default: false },
    showQuestionNumbers: { type: Boolean, default: true }
  },
  
  security: {
    level: { 
      type: String, 
      enum: Object.values(SecurityLevel), 
      default: SecurityLevel.MEDIUM 
    },
    browserLockdown: { type: Boolean, default: false },
    disableRightClick: { type: Boolean, default: false },
    disableCopyPaste: { type: Boolean, default: false },
    fullScreen: { type: Boolean, default: false },
    webcamMonitoring: { type: Boolean, default: false },
    screenRecording: { type: Boolean, default: false },
    keystrokeLogging: { type: Boolean, default: false },
    plagiarismDetection: { type: Boolean, default: false },
    ipRestrictions: [String],
    allowedBrowsers: [String],
    minimumResolution: {
      width: Number,
      height: Number
    }
  },
  
  grading: {
    method: { 
      type: String, 
      enum: Object.values(GradingMethod), 
      default: GradingMethod.AUTOMATIC 
    },
    passingScore: { type: Number, required: true, min: 0, max: 100 },
    gradingScale: [{
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      letter: String
    }],
    allowNegativeScoring: { type: Boolean, default: false },
    penaltyPerIncorrect: Number,
    bonusPerCorrect: Number,
    partialCreditEnabled: { type: Boolean, default: true },
    roundingMethod: { 
      type: String, 
      enum: ['up', 'down', 'nearest'], 
      default: 'nearest' 
    },
    showCorrectAnswers: { type: Boolean, default: true },
    showScoreImmediately: { type: Boolean, default: true },
    releaseGradesAfter: Date
  },
  
  feedback: {
    showCorrectAnswers: { type: Boolean, default: true },
    showExplanations: { type: Boolean, default: true },
    showScore: { type: Boolean, default: true },
    showDetailedResults: { type: Boolean, default: false },
    customFeedbackMessages: {
      excellent: { type: String, default: 'Excellent work!' },
      good: { type: String, default: 'Good job!' },
      average: { type: String, default: 'Average performance.' },
      poor: { type: String, default: 'Needs improvement.' },
      failing: { type: String, default: 'Additional study required.' }
    },
    provideHints: { type: Boolean, default: false },
    allowRetakes: { type: Boolean, default: false },
    maxRetakes: Number
  },
  
  availability: {
    startDate: Date,
    endDate: Date,
    timeZone: { type: String, default: 'UTC' },
    attempts: {
      allowed: { type: Number, default: 1, min: 1 },
      current: { type: Number, default: 0 }
    },
    accessCodes: [String],
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Assessment' }]
  },
  
  participants: {
    type: { 
      type: String, 
      enum: ['all', 'specific', 'group'], 
      default: 'all' 
    },
    userIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    excludeIds: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  
  media: {
    images: [String],
    videos: [String],
    audio: [String],
    documents: [String]
  },
  
  analytics: {
    totalAttempts: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    difficultyAnalysis: [{
      questionId: { type: String, required: true },
      difficulty: { type: Number, default: 0 },
      discrimination: { type: Number, default: 0 },
      responses: { type: Number, default: 0 }
    }],
    itemStatistics: [{
      questionId: { type: String, required: true },
      correct: { type: Number, default: 0 },
      incorrect: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 }
    }]
  },
  
  metadata: {
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastModifiedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    version: { type: Number, default: 1 },
    isPublished: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: true },
    tags: [String],
    category: { type: String, required: true },
    difficulty: { 
      type: String, 
      enum: Object.values(DifficultyLevel), 
      required: true 
    },
    estimatedDuration: { type: Number, required: true }, // in minutes
    weight: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    archivedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
AssessmentSchema.index({ 'metadata.createdBy': 1 });
AssessmentSchema.index({ 'metadata.isPublished': 1, 'metadata.isActive': 1 });
AssessmentSchema.index({ subject: 1, grade: 1 });
AssessmentSchema.index({ 'availability.startDate': 1, 'availability.endDate': 1 });
AssessmentSchema.index({ 'participants.userIds': 1 });
AssessmentSchema.index({ 'participants.groupIds': 1 });
AssessmentSchema.index({ 'metadata.tags': 1 });
AssessmentSchema.index({ 'metadata.category': 1 });

// Methods
AssessmentSchema.methods.addQuestion = function(question: Question) {
  this.questions.push(question);
  this.metadata.updatedAt = new Date();
};

AssessmentSchema.methods.removeQuestion = function(questionId: string) {
  this.questions = this.questions.filter(q => q.id !== questionId);
  this.metadata.updatedAt = new Date();
};

AssessmentSchema.methods.updateQuestion = function(questionId: string, updates: Partial<Question>) {
  const questionIndex = this.questions.findIndex(q => q.id === questionId);
  if (questionIndex !== -1) {
    this.questions[questionIndex] = { ...this.questions[questionIndex], ...updates };
    this.metadata.updatedAt = new Date();
  }
};

AssessmentSchema.methods.validateQuestions = function(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  this.questions.forEach((question, index) => {
    if (!question.question.trim()) {
      errors.push(`Question ${index + 1}: Question text is required`);
    }
    
    if (question.points <= 0) {
      errors.push(`Question ${index + 1}: Points must be greater than 0`);
    }
    
    // Type-specific validation
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        const mcq = question as MultipleChoiceQuestion;
        if (!mcq.options || mcq.options.length < 2) {
          errors.push(`Question ${index + 1}: Multiple choice questions must have at least 2 options`);
        }
        const correctCount = mcq.options.filter(opt => opt.isCorrect).length;
        if (correctCount === 0) {
          errors.push(`Question ${index + 1}: Multiple choice questions must have at least one correct answer`);
        }
        if (!mcq.allowMultiple && correctCount > 1) {
          errors.push(`Question ${index + 1}: Single-answer questions cannot have multiple correct answers`);
        }
        break;
        
      case QuestionType.SHORT_ANSWER:
        const saq = question as ShortAnswerQuestion;
        if (!saq.acceptedAnswers || saq.acceptedAnswers.length === 0) {
          errors.push(`Question ${index + 1}: Short answer questions must have at least one accepted answer`);
        }
        break;
        
      case QuestionType.FILL_IN_BLANK:
        const fibq = question as FillInBlankQuestion;
        if (!fibq.template.includes('[blank]')) {
          errors.push(`Question ${index + 1}: Fill-in-blank questions must include [blank] placeholders`);
        }
        break;
        
      case QuestionType.MATCHING:
        const mq = question as MatchingQuestion;
        if (!mq.leftColumn || !mq.rightColumn || mq.leftColumn.length === 0 || mq.rightColumn.length === 0) {
          errors.push(`Question ${index + 1}: Matching questions must have items in both columns`);
        }
        break;
        
      case QuestionType.CODE:
        const cq = question as CodeQuestion;
        if (!cq.language) {
          errors.push(`Question ${index + 1}: Code questions must specify a programming language`);
        }
        if (!cq.testCases || cq.testCases.length === 0) {
          errors.push(`Question ${index + 1}: Code questions must have at least one test case`);
        }
        break;
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

AssessmentSchema.methods.calculateTotalPoints = function(): number {
  return this.questions.reduce((total, question) => total + question.points, 0);
};

AssessmentSchema.methods.generateQuestionSet = function(userId?: ObjectId): Question[] {
  if (this.adaptive.enabled) {
    // Implement adaptive question selection logic
    return this.generateAdaptiveQuestionSet(userId);
  }
  
  let selectedQuestions = [...this.questions];
  
  // Handle question pools
  if (this.questionPools && this.questionPools.length > 0) {
    selectedQuestions = [];
    
    this.questionPools.forEach(pool => {
      const poolQuestions = this.questions.filter(q => pool.questions.includes(q.id));
      
      if (pool.randomize) {
        // Shuffle and select
        const shuffled = poolQuestions.sort(() => Math.random() - 0.5);
        selectedQuestions.push(...shuffled.slice(0, pool.selectCount));
      } else {
        selectedQuestions.push(...poolQuestions.slice(0, pool.selectCount));
      }
    });
  }
  
  // Apply navigation settings
  if (this.navigation.randomizeOrder) {
    selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
  }
  
  return selectedQuestions;
};

AssessmentSchema.methods.generateAdaptiveQuestionSet = function(userId?: ObjectId): Question[] {
  // Simplified adaptive algorithm - in production, implement full CAT algorithm
  const startingDifficulty = this.adaptive.initialDifficulty;
  const questionsOfDifficulty = this.questions.filter(q => q.difficulty === startingDifficulty);
  
  // Start with questions of initial difficulty
  let selectedQuestions = questionsOfDifficulty
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(this.adaptive.minQuestions, questionsOfDifficulty.length));
  
  return selectedQuestions;
};

AssessmentSchema.methods.checkEligibility = function(userId: ObjectId): { eligible: boolean; reason?: string } {
  const now = new Date();
  
  // Check availability dates
  if (this.availability.startDate && now < this.availability.startDate) {
    return { eligible: false, reason: 'Assessment not yet available' };
  }
  
  if (this.availability.endDate && now > this.availability.endDate) {
    return { eligible: false, reason: 'Assessment deadline has passed' };
  }
  
  // Check if assessment is active and published
  if (!this.metadata.isActive || !this.metadata.isPublished) {
    return { eligible: false, reason: 'Assessment is not available' };
  }
  
  // Check participant restrictions
  if (this.participants.type === 'specific') {
    if (!this.participants.userIds?.includes(userId)) {
      return { eligible: false, reason: 'You are not authorized to take this assessment' };
    }
  }
  
  if (this.participants.excludeIds?.includes(userId)) {
    return { eligible: false, reason: 'You are not authorized to take this assessment' };
  }
  
  return { eligible: true };
};

AssessmentSchema.methods.getAnalytics = function() {
  return {
    overview: {
      totalQuestions: this.questions.length,
      totalPoints: this.calculateTotalPoints(),
      estimatedDuration: this.metadata.estimatedDuration,
      totalAttempts: this.analytics.totalAttempts,
      completionRate: this.analytics.completionRate,
      averageScore: this.analytics.averageScore,
      averageTime: this.analytics.averageTime
    },
    questionTypes: this.questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    difficultyDistribution: this.questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    itemStatistics: this.analytics.itemStatistics,
    difficultyAnalysis: this.analytics.difficultyAnalysis
  };
};

AssessmentSchema.methods.clone = function(): IAssessment {
  const cloned = this.toObject();
  delete cloned._id;
  cloned.title = `${cloned.title} (Copy)`;
  cloned.metadata.isDraft = true;
  cloned.metadata.isPublished = false;
  cloned.metadata.createdAt = new Date();
  cloned.metadata.updatedAt = new Date();
  cloned.metadata.version = 1;
  
  return new Assessment(cloned);
};

AssessmentSchema.methods.export = function() {
  return {
    title: this.title,
    description: this.description,
    instructions: this.instructions,
    type: this.type,
    subject: this.subject,
    grade: this.grade,
    topic: this.topic,
    questions: this.questions,
    questionPools: this.questionPools,
    configuration: {
      adaptive: this.adaptive,
      timing: this.timing,
      navigation: this.navigation,
      grading: this.grading,
      feedback: this.feedback
    },
    metadata: {
      category: this.metadata.category,
      difficulty: this.metadata.difficulty,
      estimatedDuration: this.metadata.estimatedDuration,
      tags: this.metadata.tags
    }
  };
};

AssessmentSchema.methods.import = function(data: any) {
  Object.assign(this, data);
  this.metadata.updatedAt = new Date();
  this.metadata.version += 1;
};

// Pre-save middleware
AssessmentSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  
  if (this.isModified('questions')) {
    // Recalculate analytics when questions change
    this.analytics.itemStatistics = this.questions.map(q => ({
      questionId: q.id,
      correct: 0,
      incorrect: 0,
      skipped: 0,
      averageTime: 0
    }));
  }
  
  next();
});

// Static methods
AssessmentSchema.statics.findBySubjectAndGrade = function(subject: string, grade: string) {
  return this.find({
    subject,
    grade,
    'metadata.isPublished': true,
    'metadata.isActive': true
  });
};

AssessmentSchema.statics.searchAssessments = function(searchTerm: string, filters: any = {}) {
  const query: any = {
    'metadata.isPublished': true,
    'metadata.isActive': true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { 'metadata.tags': { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };
  
  if (filters.subject) query.subject = filters.subject;
  if (filters.grade) query.grade = filters.grade;
  if (filters.type) query.type = filters.type;
  if (filters.difficulty) query['metadata.difficulty'] = filters.difficulty;
  if (filters.category) query['metadata.category'] = filters.category;
  
  return this.find(query);
};

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);