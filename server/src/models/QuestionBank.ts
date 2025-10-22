import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { QuestionType, DifficultyLevel } from './Assessment';

export enum QuestionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  UNDER_REVIEW = 'under_review'
}

export enum ValidationStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  NEEDS_REVISION = 'needs_revision'
}

// Question performance metrics
interface QuestionMetrics {
  timesUsed: number;
  totalResponses: number;
  correctResponses: number;
  incorrectResponses: number;
  skippedResponses: number;
  averageResponseTime: number;
  difficultyIndex: number; // Percentage who answered correctly
  discriminationIndex: number; // How well it distinguishes high/low performers
  distractorAnalysis?: { // For multiple choice questions
    optionId: string;
    selectedCount: number;
    percentage: number;
  }[];
  itemResponseTheory?: {
    difficulty: number; // b parameter
    discrimination: number; // a parameter
    guessing: number; // c parameter
    upperAsymptote: number; // d parameter
  };
}

// Question validation and review
interface QuestionValidation {
  status: ValidationStatus;
  validatedBy?: ObjectId;
  validatedAt?: Date;
  reviewComments: {
    reviewerId: ObjectId;
    comment: string;
    rating: number; // 1-5 scale
    category: 'content' | 'clarity' | 'difficulty' | 'technical' | 'alignment';
    timestamp: Date;
  }[];
  approvalHistory: {
    action: 'submitted' | 'approved' | 'rejected' | 'revised';
    performedBy: ObjectId;
    timestamp: Date;
    notes?: string;
  }[];
}

// Content alignment and standards
interface ContentAlignment {
  standards: {
    framework: string; // e.g., "Common Core", "NGSS", "Custom"
    standardId: string;
    description: string;
    alignment: number; // 1-5 scale
  }[];
  learningObjectives: string[];
  bloomsTaxonomy: {
    level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    description: string;
  };
  cognitiveComplexity: {
    level: 'low' | 'moderate' | 'high';
    description: string;
  };
  prerequisiteKnowledge: string[];
}

// Question accessibility and accommodations
interface AccessibilityFeatures {
  altText: string[];
  audioDescription?: string;
  captioning?: string;
  languageAlternatives: {
    language: string;
    questionText: string;
    options?: string[];
  }[];
  screenReaderCompatible: boolean;
  colorBlindFriendly: boolean;
  accommodations: {
    extendedTime: boolean;
    readAloud: boolean;
    largeText: boolean;
    highlightTools: boolean;
    calculator: boolean;
    dictionary: boolean;
  };
}

// Main Question Bank interface
export interface IQuestionBank extends Document {
  _id: ObjectId;
  
  // Basic information
  title: string;
  questionText: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  subject: string;
  grade: string;
  topic: string[];
  subtopic?: string;
  
  // Question-specific content (stored as flexible structure)
  content: {
    // For multiple choice
    options?: {
      id: string;
      text: string;
      isCorrect: boolean;
      explanation?: string;
      feedback?: string;
    }[];
    allowMultiple?: boolean;
    shuffleOptions?: boolean;
    
    // For true/false
    correctAnswer?: boolean;
    
    // For short answer
    acceptedAnswers?: string[];
    caseSensitive?: boolean;
    exactMatch?: boolean;
    maxLength?: number;
    
    // For essay
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
    
    // For fill-in-blank
    template?: string;
    blanks?: {
      id: string;
      acceptedAnswers: string[];
      caseSensitive: boolean;
      points: number;
    }[];
    
    // For matching
    leftColumn?: {
      id: string;
      text: string;
      media?: string;
    }[];
    rightColumn?: {
      id: string;
      text: string;
      media?: string;
    }[];
    correctMatches?: {
      leftId: string;
      rightId: string;
    }[];
    
    // For ordering
    items?: {
      id: string;
      text: string;
      correctPosition: number;
    }[];
    
    // For numerical
    correctValue?: number;
    tolerance?: number;
    unit?: string;
    acceptableUnits?: string[];
    
    // For code questions
    language?: string;
    starterCode?: string;
    expectedOutput?: string;
    testCases?: {
      input: string;
      expectedOutput: string;
      isVisible: boolean;
      points: number;
    }[];
    
    // Common properties
    allowPartialCredit?: boolean;
    explanation?: string;
    hints?: string[];
    keywords?: string[];
  };
  
  // Scoring and evaluation
  scoring: {
    points: number;
    autoGradable: boolean;
    partialCreditRules?: {
      condition: string;
      points: number;
      description: string;
    }[];
    negativeScoring?: {
      enabled: boolean;
      penalty: number;
    };
    timeBonus?: {
      enabled: boolean;
      maxBonus: number;
      thresholdSeconds: number;
    };
  };
  
  // Media and resources
  media: {
    images: {
      url: string;
      caption?: string;
      altText: string;
      placement: 'question' | 'option' | 'explanation';
    }[];
    videos: {
      url: string;
      caption?: string;
      transcript?: string;
      placement: 'question' | 'explanation';
    }[];
    audio: {
      url: string;
      transcript?: string;
      placement: 'question' | 'explanation';
    }[];
    documents: {
      url: string;
      title: string;
      description?: string;
    }[];
  };
  
  // Performance and analytics
  metrics: QuestionMetrics;
  
  // Content alignment and standards
  alignment: ContentAlignment;
  
  // Accessibility
  accessibility: AccessibilityFeatures;
  
  // Validation and review
  validation: QuestionValidation;
  
  // Usage and relationships
  usage: {
    assessmentIds: ObjectId[];
    questionPools: string[];
    categories: string[];
    collections: string[];
    lastUsed?: Date;
    usageFrequency: 'low' | 'medium' | 'high';
  };
  
  // Versioning and history
  versioning: {
    version: number;
    originalId?: ObjectId; // If this is a revision
    parentId?: ObjectId; // Parent question if derived
    childIds: ObjectId[]; // Derived questions
    revisionHistory: {
      version: number;
      modifiedBy: ObjectId;
      modifiedAt: Date;
      changes: string[];
      reason: string;
    }[];
  };
  
  // Metadata
  metadata: {
    createdBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    lastModifiedBy: ObjectId;
    status: QuestionStatus;
    tags: string[];
    author: string;
    source?: string;
    copyright?: string;
    license?: string;
    estimatedTime: number; // seconds
    isPublic: boolean;
    isFeatured: boolean;
    quality: {
      rating: number; // 1-5 scale
      votes: number;
      feedback: string[];
    };
  };
  
  // Methods
  updateMetrics(responseData: any): void;
  calculateDifficulty(): number;
  calculateDiscrimination(): number;
  clone(): IQuestionBank;
  export(): any;
  validate(): { isValid: boolean; errors: string[] };
  submitForReview(): void;
  approve(): void;
  reject(reason: string): void;
  archive(): void;
  restore(): void;
}

// Schema definition
const QuestionBankSchema = new Schema<IQuestionBank>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  questionText: {
    type: String,
    required: true,
    maxlength: 5000
  },
  type: {
    type: String,
    enum: Object.values(QuestionType),
    required: true
  },
  difficulty: {
    type: String,
    enum: Object.values(DifficultyLevel),
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
  subtopic: String,
  
  content: {
    type: Schema.Types.Mixed,
    required: true
  },
  
  scoring: {
    points: {
      type: Number,
      required: true,
      min: 0
    },
    autoGradable: {
      type: Boolean,
      default: true
    },
    partialCreditRules: [{
      condition: { type: String, required: true },
      points: { type: Number, required: true },
      description: { type: String, required: true }
    }],
    negativeScoring: {
      enabled: { type: Boolean, default: false },
      penalty: { type: Number, default: 0 }
    },
    timeBonus: {
      enabled: { type: Boolean, default: false },
      maxBonus: { type: Number, default: 0 },
      thresholdSeconds: { type: Number, default: 60 }
    }
  },
  
  media: {
    images: [{
      url: { type: String, required: true },
      caption: String,
      altText: { type: String, required: true },
      placement: { 
        type: String, 
        enum: ['question', 'option', 'explanation'], 
        default: 'question' 
      }
    }],
    videos: [{
      url: { type: String, required: true },
      caption: String,
      transcript: String,
      placement: { 
        type: String, 
        enum: ['question', 'explanation'], 
        default: 'question' 
      }
    }],
    audio: [{
      url: { type: String, required: true },
      transcript: String,
      placement: { 
        type: String, 
        enum: ['question', 'explanation'], 
        default: 'question' 
      }
    }],
    documents: [{
      url: { type: String, required: true },
      title: { type: String, required: true },
      description: String
    }]
  },
  
  metrics: {
    timesUsed: { type: Number, default: 0 },
    totalResponses: { type: Number, default: 0 },
    correctResponses: { type: Number, default: 0 },
    incorrectResponses: { type: Number, default: 0 },
    skippedResponses: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    difficultyIndex: { type: Number, default: 0 },
    discriminationIndex: { type: Number, default: 0 },
    distractorAnalysis: [{
      optionId: { type: String, required: true },
      selectedCount: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    }],
    itemResponseTheory: {
      difficulty: { type: Number, default: 0 },
      discrimination: { type: Number, default: 1 },
      guessing: { type: Number, default: 0 },
      upperAsymptote: { type: Number, default: 1 }
    }
  },
  
  alignment: {
    standards: [{
      framework: { type: String, required: true },
      standardId: { type: String, required: true },
      description: { type: String, required: true },
      alignment: { type: Number, min: 1, max: 5, default: 3 }
    }],
    learningObjectives: [String],
    bloomsTaxonomy: {
      level: { 
        type: String, 
        enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
        required: true
      },
      description: { type: String, required: true }
    },
    cognitiveComplexity: {
      level: { 
        type: String, 
        enum: ['low', 'moderate', 'high'],
        required: true
      },
      description: { type: String, required: true }
    },
    prerequisiteKnowledge: [String]
  },
  
  accessibility: {
    altText: [String],
    audioDescription: String,
    captioning: String,
    languageAlternatives: [{
      language: { type: String, required: true },
      questionText: { type: String, required: true },
      options: [String]
    }],
    screenReaderCompatible: { type: Boolean, default: true },
    colorBlindFriendly: { type: Boolean, default: true },
    accommodations: {
      extendedTime: { type: Boolean, default: false },
      readAloud: { type: Boolean, default: false },
      largeText: { type: Boolean, default: false },
      highlightTools: { type: Boolean, default: false },
      calculator: { type: Boolean, default: false },
      dictionary: { type: Boolean, default: false }
    }
  },
  
  validation: {
    status: {
      type: String,
      enum: Object.values(ValidationStatus),
      default: ValidationStatus.PENDING
    },
    validatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    validatedAt: Date,
    reviewComments: [{
      reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      comment: { type: String, required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      category: { 
        type: String, 
        enum: ['content', 'clarity', 'difficulty', 'technical', 'alignment'],
        required: true
      },
      timestamp: { type: Date, default: Date.now }
    }],
    approvalHistory: [{
      action: { 
        type: String, 
        enum: ['submitted', 'approved', 'rejected', 'revised'],
        required: true
      },
      performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      timestamp: { type: Date, default: Date.now },
      notes: String
    }]
  },
  
  usage: {
    assessmentIds: [{ type: Schema.Types.ObjectId, ref: 'Assessment' }],
    questionPools: [String],
    categories: [String],
    collections: [String],
    lastUsed: Date,
    usageFrequency: { 
      type: String, 
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  },
  
  versioning: {
    version: { type: Number, default: 1 },
    originalId: { type: Schema.Types.ObjectId, ref: 'QuestionBank' },
    parentId: { type: Schema.Types.ObjectId, ref: 'QuestionBank' },
    childIds: [{ type: Schema.Types.ObjectId, ref: 'QuestionBank' }],
    revisionHistory: [{
      version: { type: Number, required: true },
      modifiedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      modifiedAt: { type: Date, default: Date.now },
      changes: [String],
      reason: { type: String, required: true }
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
    status: {
      type: String,
      enum: Object.values(QuestionStatus),
      default: QuestionStatus.DRAFT
    },
    tags: [String],
    author: { type: String, required: true },
    source: String,
    copyright: String,
    license: String,
    estimatedTime: { type: Number, default: 60 }, // seconds
    isPublic: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    quality: {
      rating: { type: Number, min: 1, max: 5, default: 3 },
      votes: { type: Number, default: 0 },
      feedback: [String]
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
QuestionBankSchema.index({ subject: 1, grade: 1, topic: 1 });
QuestionBankSchema.index({ type: 1, difficulty: 1 });
QuestionBankSchema.index({ 'metadata.status': 1, 'metadata.isPublic': 1 });
QuestionBankSchema.index({ 'metadata.createdBy': 1 });
QuestionBankSchema.index({ 'metadata.tags': 1 });
QuestionBankSchema.index({ 'validation.status': 1 });
QuestionBankSchema.index({ 'metrics.difficultyIndex': 1 });
QuestionBankSchema.index({ 'metrics.discriminationIndex': 1 });
QuestionBankSchema.index({ 'usage.lastUsed': 1 });
QuestionBankSchema.index({ 'alignment.bloomsTaxonomy.level': 1 });

// Methods
QuestionBankSchema.methods.updateMetrics = function(responseData: any) {
  this.metrics.totalResponses += 1;
  
  if (responseData.isCorrect) {
    this.metrics.correctResponses += 1;
  } else if (responseData.isSkipped) {
    this.metrics.skippedResponses += 1;
  } else {
    this.metrics.incorrectResponses += 1;
  }
  
  // Update average response time
  this.metrics.averageResponseTime = (
    (this.metrics.averageResponseTime * (this.metrics.totalResponses - 1)) + 
    responseData.timeSpent
  ) / this.metrics.totalResponses;
  
  // Update difficulty index (percentage who got it correct)
  this.metrics.difficultyIndex = (this.metrics.correctResponses / this.metrics.totalResponses) * 100;
  
  // Update distractor analysis for multiple choice
  if (this.type === QuestionType.MULTIPLE_CHOICE && responseData.selectedOption) {
    let distractor = this.metrics.distractorAnalysis?.find(d => d.optionId === responseData.selectedOption);
    if (distractor) {
      distractor.selectedCount += 1;
      distractor.percentage = (distractor.selectedCount / this.metrics.totalResponses) * 100;
    } else {
      this.metrics.distractorAnalysis = this.metrics.distractorAnalysis || [];
      this.metrics.distractorAnalysis.push({
        optionId: responseData.selectedOption,
        selectedCount: 1,
        percentage: (1 / this.metrics.totalResponses) * 100
      });
    }
  }
  
  this.metadata.updatedAt = new Date();
};

QuestionBankSchema.methods.calculateDifficulty = function(): number {
  if (this.metrics.totalResponses === 0) return 0.5; // Default difficulty
  return 1 - (this.metrics.correctResponses / this.metrics.totalResponses);
};

QuestionBankSchema.methods.calculateDiscrimination = function(): number {
  // Simplified discrimination calculation
  // In practice, this would use point-biserial correlation or similar
  if (this.metrics.totalResponses < 10) return 0;
  
  const difficulty = this.calculateDifficulty();
  const variance = difficulty * (1 - difficulty);
  
  return Math.sqrt(variance); // Simplified calculation
};

QuestionBankSchema.methods.clone = function(): IQuestionBank {
  const cloned = this.toObject();
  delete cloned._id;
  cloned.title = `${cloned.title} (Copy)`;
  cloned.metadata.status = QuestionStatus.DRAFT;
  cloned.metadata.createdAt = new Date();
  cloned.metadata.updatedAt = new Date();
  cloned.versioning.version = 1;
  cloned.versioning.parentId = this._id;
  cloned.metrics = {
    timesUsed: 0,
    totalResponses: 0,
    correctResponses: 0,
    incorrectResponses: 0,
    skippedResponses: 0,
    averageResponseTime: 0,
    difficultyIndex: 0,
    discriminationIndex: 0
  };
  
  return new QuestionBank(cloned);
};

QuestionBankSchema.methods.export = function() {
  return {
    title: this.title,
    questionText: this.questionText,
    type: this.type,
    difficulty: this.difficulty,
    subject: this.subject,
    grade: this.grade,
    topic: this.topic,
    content: this.content,
    scoring: this.scoring,
    media: this.media,
    alignment: this.alignment,
    accessibility: this.accessibility,
    metadata: {
      author: this.metadata.author,
      tags: this.metadata.tags,
      estimatedTime: this.metadata.estimatedTime
    }
  };
};

QuestionBankSchema.methods.validate = function(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!this.questionText.trim()) {
    errors.push('Question text is required');
  }
  
  if (this.scoring.points <= 0) {
    errors.push('Points must be greater than 0');
  }
  
  // Type-specific validation
  switch (this.type) {
    case QuestionType.MULTIPLE_CHOICE:
      if (!this.content.options || this.content.options.length < 2) {
        errors.push('Multiple choice questions must have at least 2 options');
      }
      const correctCount = this.content.options?.filter((opt: any) => opt.isCorrect).length || 0;
      if (correctCount === 0) {
        errors.push('Multiple choice questions must have at least one correct answer');
      }
      break;
      
    case QuestionType.SHORT_ANSWER:
      if (!this.content.acceptedAnswers || this.content.acceptedAnswers.length === 0) {
        errors.push('Short answer questions must have at least one accepted answer');
      }
      break;
      
    case QuestionType.CODE:
      if (!this.content.language) {
        errors.push('Code questions must specify a programming language');
      }
      if (!this.content.testCases || this.content.testCases.length === 0) {
        errors.push('Code questions must have at least one test case');
      }
      break;
  }
  
  return { isValid: errors.length === 0, errors };
};

QuestionBankSchema.methods.submitForReview = function() {
  this.metadata.status = QuestionStatus.UNDER_REVIEW;
  this.validation.status = ValidationStatus.PENDING;
  this.validation.approvalHistory.push({
    action: 'submitted',
    performedBy: this.metadata.lastModifiedBy,
    timestamp: new Date()
  });
};

QuestionBankSchema.methods.approve = function() {
  this.metadata.status = QuestionStatus.ACTIVE;
  this.validation.status = ValidationStatus.VALIDATED;
  this.validation.validatedAt = new Date();
  this.validation.approvalHistory.push({
    action: 'approved',
    performedBy: this.metadata.lastModifiedBy,
    timestamp: new Date()
  });
};

QuestionBankSchema.methods.reject = function(reason: string) {
  this.metadata.status = QuestionStatus.DRAFT;
  this.validation.status = ValidationStatus.REJECTED;
  this.validation.approvalHistory.push({
    action: 'rejected',
    performedBy: this.metadata.lastModifiedBy,
    timestamp: new Date(),
    notes: reason
  });
};

QuestionBankSchema.methods.archive = function() {
  this.metadata.status = QuestionStatus.ARCHIVED;
  this.metadata.updatedAt = new Date();
};

QuestionBankSchema.methods.restore = function() {
  this.metadata.status = QuestionStatus.ACTIVE;
  this.metadata.updatedAt = new Date();
};

// Pre-save middleware
QuestionBankSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  
  // Update usage frequency based on metrics
  if (this.metrics.timesUsed > 50) {
    this.usage.usageFrequency = 'high';
  } else if (this.metrics.timesUsed > 10) {
    this.usage.usageFrequency = 'medium';
  } else {
    this.usage.usageFrequency = 'low';
  }
  
  next();
});

// Static methods
QuestionBankSchema.statics.findBySubjectAndGrade = function(subject: string, grade: string) {
  return this.find({
    subject,
    grade,
    'metadata.status': QuestionStatus.ACTIVE,
    'metadata.isPublic': true
  });
};

QuestionBankSchema.statics.searchQuestions = function(searchTerm: string, filters: any = {}) {
  const query: any = {
    'metadata.status': QuestionStatus.ACTIVE,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { questionText: { $regex: searchTerm, $options: 'i' } },
      { 'metadata.tags': { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };
  
  if (filters.subject) query.subject = filters.subject;
  if (filters.grade) query.grade = filters.grade;
  if (filters.type) query.type = filters.type;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.topic) query.topic = { $in: filters.topic };
  
  return this.find(query);
};

QuestionBankSchema.statics.getQuestionStatistics = function() {
  return this.aggregate([
    { $match: { 'metadata.status': QuestionStatus.ACTIVE } },
    {
      $group: {
        _id: null,
        totalQuestions: { $sum: 1 },
        byType: {
          $push: {
            type: '$type',
            count: 1
          }
        },
        byDifficulty: {
          $push: {
            difficulty: '$difficulty',
            count: 1
          }
        },
        averageDifficulty: { $avg: '$metrics.difficultyIndex' },
        averageDiscrimination: { $avg: '$metrics.discriminationIndex' },
        totalUsage: { $sum: '$metrics.timesUsed' }
      }
    }
  ]);
};

export const QuestionBank = mongoose.model<IQuestionBank>('QuestionBank', QuestionBankSchema);