import mongoose, { Document, Schema } from 'mongoose';

// Translation memory entry
export interface ITranslationMemoryEntry {
  sourceText: string;
  targetText: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  domain?: string; // e.g., 'education', 'technology', 'medical'
  confidence: number; // 0-100
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  verified: boolean;
}

// Glossary term
export interface IGlossaryTerm {
  term: string;
  language: string;
  definition: string;
  translations: Array<{
    language: string;
    term: string;
    definition?: string;
    context?: string;
    verified: boolean;
  }>;
  category: string;
  domain: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Translation quality assessment
export interface IQualityAssessment {
  assessorId: string;
  assessorType: 'human' | 'ai';
  scores: {
    accuracy: number; // 0-100
    fluency: number; // 0-100
    adequacy: number; // 0-100
    culturalAppropriateness: number; // 0-100
    terminology: number; // 0-100
    overall: number; // 0-100
  };
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    criticalIssues: Array<{
      type: 'grammar' | 'meaning' | 'cultural' | 'terminology';
      description: string;
      suggestion: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
  assessmentDate: Date;
  timeSpent: number; // minutes
}

// Main Translation interface
export interface ITranslation extends Document {
  translationId: string;
  activityContentId: string;
  sourceLanguage: string;
  targetLanguage: string;
  
  // Translation content
  sourceContent: {
    text: string;
    html?: string;
    markdown?: string;
    metadata: {
      wordCount: number;
      characterCount: number;
      complexity: 'simple' | 'medium' | 'complex';
      domain: string;
      context: string;
    };
  };
  
  translatedContent: {
    text: string;
    html?: string;
    markdown?: string;
    metadata: {
      wordCount: number;
      characterCount: number;
      translationTime: number; // minutes
      method: 'human' | 'ai' | 'hybrid';
      tools: string[]; // CAT tools, AI models used
    };
  };
  
  // Workflow management
  workflow: {
    status: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'reviewed' | 'approved' | 'rejected' | 'published';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    deadline: Date;
    estimatedHours: number;
    actualHours?: number;
    
    // Assignment details
    translator: {
      id: string;
      name: string;
      email: string;
      specializations: string[];
      certifications: string[];
      ratingAverage: number;
      assignedDate: Date;
      acceptedDate?: Date;
    };
    
    reviewer?: {
      id: string;
      name: string;
      email: string;
      assignedDate: Date;
      reviewDate?: Date;
      approved: boolean;
    };
    
    projectManager?: {
      id: string;
      name: string;
      email: string;
    };
  };
  
  // Quality and assessment
  quality: {
    assessments: IQualityAssessment[];
    finalScore: number;
    passesQA: boolean;
    requiresRevision: boolean;
    revisionNotes: string[];
    certifiedBy?: string;
    certificationDate?: Date;
  };
  
  // Translation memory and terminology
  leverageData: {
    tmMatches: Array<{
      sourceText: string;
      targetText: string;
      matchPercentage: number;
      origin: string; // TM ID or source
      context?: string;
      applied: boolean;
    }>;
    
    glossaryTerms: Array<{
      term: string;
      translation: string;
      verified: boolean;
      applied: boolean;
      context?: string;
    }>;
    
    repetitions: Array<{
      text: string;
      count: number;
      firstOccurrence: number;
      leveraged: boolean;
    }>;
    
    fuzzyMatches: Array<{
      sourceText: string;
      suggestedTranslation: string;
      confidence: number;
      applied: boolean;
    }>;
  };
  
  // Version control
  versions: Array<{
    version: string;
    content: string;
    changes: string[];
    modifiedBy: string;
    modifiedDate: Date;
    comment?: string;
    approved: boolean;
  }>;
  
  // Collaboration and communication
  communication: {
    comments: Array<{
      id: string;
      authorId: string;
      authorName: string;
      authorRole: 'translator' | 'reviewer' | 'pm' | 'client';
      content: string;
      timestamp: Date;
      resolved: boolean;
      attachments?: string[];
    }>;
    
    queries: Array<{
      id: string;
      queryText: string;
      context: string;
      askedBy: string;
      askedDate: Date;
      response?: string;
      respondedBy?: string;
      respondedDate?: Date;
      status: 'open' | 'answered' | 'resolved';
    }>;
    
    changeRequests: Array<{
      id: string;
      requestedBy: string;
      requestDate: Date;
      description: string;
      justification: string;
      status: 'pending' | 'approved' | 'rejected' | 'implemented';
      reviewedBy?: string;
      reviewDate?: Date;
      response?: string;
    }>;
  };
  
  // Billing and cost tracking
  billing: {
    rateType: 'per_word' | 'per_hour' | 'fixed';
    rate: number;
    currency: string;
    wordCount: number;
    hourCount: number;
    totalCost: number;
    discounts?: Array<{
      type: 'tm_leverage' | 'repetition' | 'volume' | 'bulk';
      percentage: number;
      amount: number;
      description: string;
    }>;
    invoiceId?: string;
    invoiceDate?: Date;
    paymentStatus: 'pending' | 'paid' | 'overdue';
  };
  
  // Analytics and metrics
  analytics: {
    productivity: {
      wordsPerHour: number;
      timeSpentTranslating: number; // minutes
      timeSpentReviewing: number; // minutes
      revisionsCount: number;
      tmLeveragePercentage: number;
      repetitionLeveragePercentage: number;
    };
    
    quality: {
      errorRate: number; // errors per 1000 words
      clientSatisfaction?: number; // 1-5 rating
      revisionRate: number; // percentage of content requiring revision
      approvalTime: number; // hours from submission to approval
    };
    
    engagement: {
      responseTime: number; // hours to respond to queries
      collaborationScore: number; // based on communication quality
      deadlineAdherence: boolean;
      proactiveImprovements: number;
    };
  };
  
  // Metadata
  metadata: {
    domain: string; // subject matter domain
    audience: string; // target audience
    style: 'formal' | 'informal' | 'technical' | 'creative';
    tone: 'professional' | 'friendly' | 'authoritative' | 'playful';
    registerLevel: 'high' | 'medium' | 'low';
    culturalAdaptation: boolean;
    localizationRequired: boolean;
    confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';
  };
  
  // Administrative
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  archived: boolean;
  archiveReason?: string;
  tags: string[];
}

// Translation Schema
const translationSchema = new Schema<ITranslation>({
  translationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  activityContentId: {
    type: String,
    required: true,
    index: true,
    ref: 'ActivityContent'
  },
  sourceLanguage: {
    type: String,
    required: true,
    index: true
  },
  targetLanguage: {
    type: String,
    required: true,
    index: true
  },
  
  sourceContent: {
    text: { type: String, required: true },
    html: String,
    markdown: String,
    metadata: {
      wordCount: { type: Number, required: true },
      characterCount: { type: Number, required: true },
      complexity: {
        type: String,
        enum: ['simple', 'medium', 'complex'],
        default: 'medium'
      },
      domain: { type: String, required: true },
      context: String
    }
  },
  
  translatedContent: {
    text: String,
    html: String,
    markdown: String,
    metadata: {
      wordCount: Number,
      characterCount: Number,
      translationTime: Number,
      method: {
        type: String,
        enum: ['human', 'ai', 'hybrid'],
        default: 'human'
      },
      tools: [String]
    }
  },
  
  workflow: {
    status: {
      type: String,
      enum: ['requested', 'assigned', 'in_progress', 'completed', 'reviewed', 'approved', 'rejected', 'published'],
      default: 'requested',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    deadline: Date,
    estimatedHours: Number,
    actualHours: Number,
    
    translator: {
      id: { type: String, required: true },
      name: String,
      email: String,
      specializations: [String],
      certifications: [String],
      ratingAverage: { type: Number, min: 0, max: 5 },
      assignedDate: Date,
      acceptedDate: Date
    },
    
    reviewer: {
      id: String,
      name: String,
      email: String,
      assignedDate: Date,
      reviewDate: Date,
      approved: Boolean
    },
    
    projectManager: {
      id: String,
      name: String,
      email: String
    }
  },
  
  quality: {
    assessments: [{
      assessorId: String,
      assessorType: {
        type: String,
        enum: ['human', 'ai'],
        default: 'human'
      },
      scores: {
        accuracy: { type: Number, min: 0, max: 100 },
        fluency: { type: Number, min: 0, max: 100 },
        adequacy: { type: Number, min: 0, max: 100 },
        culturalAppropriateness: { type: Number, min: 0, max: 100 },
        terminology: { type: Number, min: 0, max: 100 },
        overall: { type: Number, min: 0, max: 100 }
      },
      feedback: {
        strengths: [String],
        weaknesses: [String],
        suggestions: [String],
        criticalIssues: [{
          type: {
            type: String,
            enum: ['grammar', 'meaning', 'cultural', 'terminology']
          },
          description: String,
          suggestion: String,
          severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
          }
        }]
      },
      assessmentDate: { type: Date, default: Date.now },
      timeSpent: Number
    }],
    finalScore: { type: Number, min: 0, max: 100 },
    passesQA: { type: Boolean, default: false },
    requiresRevision: { type: Boolean, default: false },
    revisionNotes: [String],
    certifiedBy: String,
    certificationDate: Date
  },
  
  leverageData: {
    tmMatches: [{
      sourceText: String,
      targetText: String,
      matchPercentage: { type: Number, min: 0, max: 100 },
      origin: String,
      context: String,
      applied: { type: Boolean, default: false }
    }],
    
    glossaryTerms: [{
      term: String,
      translation: String,
      verified: { type: Boolean, default: false },
      applied: { type: Boolean, default: false },
      context: String
    }],
    
    repetitions: [{
      text: String,
      count: Number,
      firstOccurrence: Number,
      leveraged: { type: Boolean, default: false }
    }],
    
    fuzzyMatches: [{
      sourceText: String,
      suggestedTranslation: String,
      confidence: { type: Number, min: 0, max: 100 },
      applied: { type: Boolean, default: false }
    }]
  },
  
  versions: [{
    version: String,
    content: String,
    changes: [String],
    modifiedBy: String,
    modifiedDate: { type: Date, default: Date.now },
    comment: String,
    approved: { type: Boolean, default: false }
  }],
  
  communication: {
    comments: [{
      id: String,
      authorId: String,
      authorName: String,
      authorRole: {
        type: String,
        enum: ['translator', 'reviewer', 'pm', 'client']
      },
      content: String,
      timestamp: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false },
      attachments: [String]
    }],
    
    queries: [{
      id: String,
      queryText: String,
      context: String,
      askedBy: String,
      askedDate: { type: Date, default: Date.now },
      response: String,
      respondedBy: String,
      respondedDate: Date,
      status: {
        type: String,
        enum: ['open', 'answered', 'resolved'],
        default: 'open'
      }
    }],
    
    changeRequests: [{
      id: String,
      requestedBy: String,
      requestDate: { type: Date, default: Date.now },
      description: String,
      justification: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'implemented'],
        default: 'pending'
      },
      reviewedBy: String,
      reviewDate: Date,
      response: String
    }]
  },
  
  billing: {
    rateType: {
      type: String,
      enum: ['per_word', 'per_hour', 'fixed'],
      default: 'per_word'
    },
    rate: Number,
    currency: { type: String, default: 'USD' },
    wordCount: Number,
    hourCount: Number,
    totalCost: Number,
    discounts: [{
      type: {
        type: String,
        enum: ['tm_leverage', 'repetition', 'volume', 'bulk']
      },
      percentage: Number,
      amount: Number,
      description: String
    }],
    invoiceId: String,
    invoiceDate: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    }
  },
  
  analytics: {
    productivity: {
      wordsPerHour: Number,
      timeSpentTranslating: Number,
      timeSpentReviewing: Number,
      revisionsCount: { type: Number, default: 0 },
      tmLeveragePercentage: Number,
      repetitionLeveragePercentage: Number
    },
    
    quality: {
      errorRate: Number,
      clientSatisfaction: { type: Number, min: 1, max: 5 },
      revisionRate: Number,
      approvalTime: Number
    },
    
    engagement: {
      responseTime: Number,
      collaborationScore: Number,
      deadlineAdherence: Boolean,
      proactiveImprovements: { type: Number, default: 0 }
    }
  },
  
  metadata: {
    domain: String,
    audience: String,
    style: {
      type: String,
      enum: ['formal', 'informal', 'technical', 'creative']
    },
    tone: {
      type: String,
      enum: ['professional', 'friendly', 'authoritative', 'playful']
    },
    registerLevel: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    culturalAdaptation: { type: Boolean, default: false },
    localizationRequired: { type: Boolean, default: false },
    confidentiality: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted'],
      default: 'internal'
    }
  },
  
  createdBy: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  archived: { type: Boolean, default: false },
  archiveReason: String,
  tags: [String]
}, {
  timestamps: true,
  collection: 'translations'
});

// Indexes
translationSchema.index({ translationId: 1 });
translationSchema.index({ activityContentId: 1 });
translationSchema.index({ sourceLanguage: 1, targetLanguage: 1 });
translationSchema.index({ 'workflow.status': 1 });
translationSchema.index({ 'workflow.priority': 1 });
translationSchema.index({ 'workflow.deadline': 1 });
translationSchema.index({ 'workflow.translator.id': 1 });
translationSchema.index({ 'workflow.reviewer.id': 1 });
translationSchema.index({ createdAt: -1 });
translationSchema.index({ 'quality.finalScore': -1 });

// Instance methods
translationSchema.methods.calculateProgress = function() {
  const statusWeights = {
    'requested': 0,
    'assigned': 10,
    'in_progress': 50,
    'completed': 80,
    'reviewed': 90,
    'approved': 95,
    'rejected': 0,
    'published': 100
  };
  return statusWeights[this.workflow.status] || 0;
};

translationSchema.methods.calculateCost = function() {
  let baseCost = 0;
  
  if (this.billing.rateType === 'per_word') {
    baseCost = this.billing.wordCount * this.billing.rate;
  } else if (this.billing.rateType === 'per_hour') {
    baseCost = this.billing.hourCount * this.billing.rate;
  } else {
    baseCost = this.billing.rate;
  }
  
  // Apply discounts
  let totalDiscount = 0;
  this.billing.discounts?.forEach(discount => {
    totalDiscount += discount.amount;
  });
  
  this.billing.totalCost = Math.max(0, baseCost - totalDiscount);
  return this.billing.totalCost;
};

translationSchema.methods.addComment = function(authorId: string, authorName: string, authorRole: string, content: string) {
  this.communication.comments.push({
    id: new mongoose.Types.ObjectId().toString(),
    authorId,
    authorName,
    authorRole,
    content,
    timestamp: new Date(),
    resolved: false
  });
};

translationSchema.methods.addQualityAssessment = function(assessment: IQualityAssessment) {
  this.quality.assessments.push(assessment);
  
  // Update final score (average of all assessments)
  const totalScore = this.quality.assessments.reduce((sum, a) => sum + a.scores.overall, 0);
  this.quality.finalScore = totalScore / this.quality.assessments.length;
  
  // Update QA pass status
  this.quality.passesQA = this.quality.finalScore >= 80; // Configurable threshold
};

translationSchema.methods.updateVersion = function(content: string, changes: string[], modifiedBy: string, comment?: string) {
  const currentVersion = this.versions.length > 0 ? this.versions[this.versions.length - 1].version : '1.0.0';
  const versionParts = currentVersion.split('.').map(Number);
  versionParts[2]++; // Increment patch version
  const newVersion = versionParts.join('.');
  
  this.versions.push({
    version: newVersion,
    content,
    changes,
    modifiedBy,
    modifiedDate: new Date(),
    comment,
    approved: false
  });
  
  this.translatedContent.text = content;
};

// Static methods
translationSchema.statics.findByTranslator = function(translatorId: string) {
  return this.find({ 'workflow.translator.id': translatorId, isActive: true });
};

translationSchema.statics.findByStatus = function(status: string) {
  return this.find({ 'workflow.status': status, isActive: true });
};

translationSchema.statics.findOverdue = function() {
  return this.find({
    'workflow.deadline': { $lt: new Date() },
    'workflow.status': { $nin: ['approved', 'published', 'rejected'] },
    isActive: true
  });
};

translationSchema.statics.getProductivityStats = function(translatorId?: string) {
  const matchStage = translatorId 
    ? { $match: { 'workflow.translator.id': translatorId, isActive: true } }
    : { $match: { isActive: true } };
    
  return this.aggregate([
    matchStage,
    {
      $group: {
        _id: '$workflow.translator.id',
        totalTranslations: { $sum: 1 },
        averageScore: { $avg: '$quality.finalScore' },
        totalWords: { $sum: '$sourceContent.metadata.wordCount' },
        averageWordsPerHour: { $avg: '$analytics.productivity.wordsPerHour' },
        onTimeDeliveries: {
          $sum: {
            $cond: [{ $lt: ['$updatedAt', '$workflow.deadline'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Pre-save middleware
translationSchema.pre('save', function(next) {
  // Calculate word count if not set
  if (this.sourceContent.text && !this.sourceContent.metadata.wordCount) {
    this.sourceContent.metadata.wordCount = this.sourceContent.text.split(/\s+/).length;
  }
  
  if (this.translatedContent.text && !this.translatedContent.metadata.wordCount) {
    this.translatedContent.metadata.wordCount = this.translatedContent.text.split(/\s+/).length;
  }
  
  // Calculate character count
  if (this.sourceContent.text && !this.sourceContent.metadata.characterCount) {
    this.sourceContent.metadata.characterCount = this.sourceContent.text.length;
  }
  
  if (this.translatedContent.text && !this.translatedContent.metadata.characterCount) {
    this.translatedContent.metadata.characterCount = this.translatedContent.text.length;
  }
  
  next();
});

export const Translation = mongoose.model<ITranslation>('Translation', translationSchema);