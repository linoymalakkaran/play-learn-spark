import mongoose, { Document, Schema } from 'mongoose';

// Supported languages with detailed metadata
export interface ILanguageInfo {
  code: string; // ISO 639-1 (en, ar, es, etc.)
  name: string; // English name
  nativeName: string; // Native name
  isRTL: boolean; // Right-to-left language
  region: string; // Geographic region
  fontFamily?: string; // Preferred font family
  textDirection: 'ltr' | 'rtl';
  culturalContext: {
    dateFormat: string;
    numberFormat: string;
    currencySymbol?: string;
    timeFormat: '12h' | '24h';
  };
}

// Content variation for different contexts
export interface IContentVariation {
  context: 'formal' | 'informal' | 'educational' | 'playful';
  ageGroup: 'preschool' | 'elementary' | 'middle' | 'high';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  text: string;
  audio?: string; // Audio file URL
  pronunciation?: string; // Phonetic pronunciation
}

// Localized content structure
export interface ILocalizedContent {
  language: string; // Language code
  title: string;
  description?: string;
  instructions?: string;
  content: {
    text?: string;
    html?: string;
    markdown?: string;
    variations?: IContentVariation[];
  };
  media: {
    images?: Array<{
      url: string;
      alt: string;
      caption?: string;
      culturallyAppropriate: boolean;
    }>;
    audio?: Array<{
      url: string;
      transcript?: string;
      speaker?: string; // Native speaker info
      accent?: string; // Regional accent
      speed?: 'slow' | 'normal' | 'fast';
    }>;
    video?: Array<{
      url: string;
      subtitles?: Array<{
        language: string;
        url: string;
        format: 'srt' | 'vtt' | 'ass';
      }>;
      dubbing?: Array<{
        language: string;
        url: string;
        voice: string;
      }>;
    }>;
  };
  metadata: {
    translatedBy?: string; // Translator ID or name
    reviewedBy?: string; // Reviewer ID or name
    translationDate: Date;
    reviewDate?: Date;
    translationMethod: 'human' | 'ai' | 'hybrid';
    qualityScore?: number; // 0-100
    culturalAdaptation: boolean;
    sourceVersion: string; // Version of source content
    notes?: string;
  };
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'deprecated';
  version: string;
}

// Main ActivityContent interface
export interface IActivityContent extends Document {
  activityId: string;
  baseLanguage: string; // Primary language (usually 'en')
  supportedLanguages: string[];
  category: string;
  type: 'lesson' | 'exercise' | 'game' | 'assessment' | 'story';
  difficulty: 'easy' | 'medium' | 'hard';
  ageRange: {
    min: number;
    max: number;
  };
  
  // Source content (base language)
  sourceContent: ILocalizedContent;
  
  // Localized versions
  localizations: Map<string, ILocalizedContent>;
  
  // Content structure and metadata
  structure: {
    sections?: Array<{
      id: string;
      title: string;
      type: 'text' | 'interactive' | 'media' | 'assessment';
      required: boolean;
      order: number;
    }>;
    dependencies?: string[]; // Other activities this depends on
    prerequisites?: string[]; // Required knowledge
  };
  
  // Translation workflow
  translationWorkflow: {
    status: 'source_only' | 'translation_requested' | 'in_progress' | 'review' | 'completed';
    requestedLanguages: string[];
    assignedTranslators: Array<{
      language: string;
      translatorId: string;
      assignedDate: Date;
      deadline?: Date;
      status: 'assigned' | 'in_progress' | 'submitted' | 'approved';
    }>;
    reviewers: Array<{
      language: string;
      reviewerId: string;
      assignedDate: Date;
      reviewDate?: Date;
      status: 'pending' | 'in_progress' | 'completed';
      feedback?: string;
    }>;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours: number;
    actualHours?: number;
  };
  
  // Quality assurance
  qualityMetrics: {
    overallScore: number; // Average across all languages
    languageScores: Map<string, number>;
    lastQualityCheck: Date;
    checks: Array<{
      type: 'grammar' | 'cultural' | 'technical' | 'educational';
      language: string;
      score: number;
      issues: Array<{
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        suggestion?: string;
        resolved: boolean;
      }>;
      checkedBy: string;
      checkDate: Date;
    }>;
  };
  
  // Publication and versioning
  publication: {
    isPublished: boolean;
    publishedLanguages: string[];
    publishDate?: Date;
    lastModified: Date;
    version: string;
    versionHistory: Array<{
      version: string;
      changes: string[];
      modifiedBy: string;
      modifiedDate: Date;
      affectedLanguages: string[];
    }>;
  };
  
  // Analytics and usage
  analytics: {
    views: Map<string, number>; // Views per language
    completions: Map<string, number>; // Completions per language
    ratings: Map<string, Array<{
      userId: string;
      rating: number;
      feedback?: string;
      date: Date;
    }>>;
    averageRating: Map<string, number>;
    popularityScore: number;
  };
  
  // Administrative fields
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isActive: boolean;
}

// ActivityContent Schema
const activityContentSchema = new Schema<IActivityContent>({
  activityId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  baseLanguage: {
    type: String,
    required: true,
    default: 'en'
  },
  supportedLanguages: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['lesson', 'exercise', 'game', 'assessment', 'story'],
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    index: true
  },
  ageRange: {
    min: { type: Number, required: true, min: 3, max: 18 },
    max: { type: Number, required: true, min: 3, max: 18 }
  },
  
  sourceContent: {
    language: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    instructions: String,
    content: {
      text: String,
      html: String,
      markdown: String,
      variations: [{
        context: {
          type: String,
          enum: ['formal', 'informal', 'educational', 'playful']
        },
        ageGroup: {
          type: String,
          enum: ['preschool', 'elementary', 'middle', 'high']
        },
        difficulty: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced']
        },
        text: String,
        audio: String,
        pronunciation: String
      }]
    },
    media: {
      images: [{
        url: String,
        alt: String,
        caption: String,
        culturallyAppropriate: { type: Boolean, default: true }
      }],
      audio: [{
        url: String,
        transcript: String,
        speaker: String,
        accent: String,
        speed: {
          type: String,
          enum: ['slow', 'normal', 'fast'],
          default: 'normal'
        }
      }],
      video: [{
        url: String,
        subtitles: [{
          language: String,
          url: String,
          format: {
            type: String,
            enum: ['srt', 'vtt', 'ass'],
            default: 'srt'
          }
        }],
        dubbing: [{
          language: String,
          url: String,
          voice: String
        }]
      }]
    },
    metadata: {
      translatedBy: String,
      reviewedBy: String,
      translationDate: { type: Date, default: Date.now },
      reviewDate: Date,
      translationMethod: {
        type: String,
        enum: ['human', 'ai', 'hybrid'],
        default: 'human'
      },
      qualityScore: { type: Number, min: 0, max: 100 },
      culturalAdaptation: { type: Boolean, default: false },
      sourceVersion: String,
      notes: String
    },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'published', 'deprecated'],
      default: 'draft'
    },
    version: { type: String, default: '1.0.0' }
  },
  
  localizations: {
    type: Map,
    of: {
      language: String,
      title: String,
      description: String,
      instructions: String,
      content: {
        text: String,
        html: String,
        markdown: String,
        variations: [{
          context: String,
          ageGroup: String,
          difficulty: String,
          text: String,
          audio: String,
          pronunciation: String
        }]
      },
      media: {
        images: [{
          url: String,
          alt: String,
          caption: String,
          culturallyAppropriate: Boolean
        }],
        audio: [{
          url: String,
          transcript: String,
          speaker: String,
          accent: String,
          speed: String
        }],
        video: [{
          url: String,
          subtitles: [{
            language: String,
            url: String,
            format: String
          }],
          dubbing: [{
            language: String,
            url: String,
            voice: String
          }]
        }]
      },
      metadata: {
        translatedBy: String,
        reviewedBy: String,
        translationDate: Date,
        reviewDate: Date,
        translationMethod: String,
        qualityScore: Number,
        culturalAdaptation: Boolean,
        sourceVersion: String,
        notes: String
      },
      status: String,
      version: String
    }
  },
  
  structure: {
    sections: [{
      id: String,
      title: String,
      type: {
        type: String,
        enum: ['text', 'interactive', 'media', 'assessment']
      },
      required: { type: Boolean, default: true },
      order: Number
    }],
    dependencies: [String],
    prerequisites: [String]
  },
  
  translationWorkflow: {
    status: {
      type: String,
      enum: ['source_only', 'translation_requested', 'in_progress', 'review', 'completed'],
      default: 'source_only'
    },
    requestedLanguages: [String],
    assignedTranslators: [{
      language: String,
      translatorId: String,
      assignedDate: Date,
      deadline: Date,
      status: {
        type: String,
        enum: ['assigned', 'in_progress', 'submitted', 'approved'],
        default: 'assigned'
      }
    }],
    reviewers: [{
      language: String,
      reviewerId: String,
      assignedDate: Date,
      reviewDate: Date,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      },
      feedback: String
    }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    estimatedHours: { type: Number, default: 0 },
    actualHours: Number
  },
  
  qualityMetrics: {
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
    languageScores: {
      type: Map,
      of: Number
    },
    lastQualityCheck: Date,
    checks: [{
      type: {
        type: String,
        enum: ['grammar', 'cultural', 'technical', 'educational'],
        required: true
      },
      language: { type: String, required: true },
      score: { type: Number, min: 0, max: 100 },
      issues: [{
        severity: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
          required: true
        },
        description: { type: String, required: true },
        suggestion: String,
        resolved: { type: Boolean, default: false }
      }],
      checkedBy: String,
      checkDate: { type: Date, default: Date.now }
    }]
  },
  
  publication: {
    isPublished: { type: Boolean, default: false },
    publishedLanguages: [String],
    publishDate: Date,
    lastModified: { type: Date, default: Date.now },
    version: { type: String, default: '1.0.0' },
    versionHistory: [{
      version: String,
      changes: [String],
      modifiedBy: String,
      modifiedDate: Date,
      affectedLanguages: [String]
    }]
  },
  
  analytics: {
    views: {
      type: Map,
      of: Number,
      default: new Map()
    },
    completions: {
      type: Map,
      of: Number,
      default: new Map()
    },
    ratings: {
      type: Map,
      of: [{
        userId: String,
        rating: { type: Number, min: 1, max: 5 },
        feedback: String,
        date: { type: Date, default: Date.now }
      }]
    },
    averageRating: {
      type: Map,
      of: Number,
      default: new Map()
    },
    popularityScore: { type: Number, default: 0 }
  },
  
  createdBy: { type: String, required: true },
  tags: [String],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'activity_content'
});

// Indexes for performance
activityContentSchema.index({ activityId: 1 });
activityContentSchema.index({ category: 1, type: 1 });
activityContentSchema.index({ difficulty: 1, 'ageRange.min': 1, 'ageRange.max': 1 });
activityContentSchema.index({ supportedLanguages: 1 });
activityContentSchema.index({ 'translationWorkflow.status': 1 });
activityContentSchema.index({ 'publication.isPublished': 1, 'publication.publishedLanguages': 1 });
activityContentSchema.index({ tags: 1 });
activityContentSchema.index({ createdAt: -1 });
activityContentSchema.index({ 'analytics.popularityScore': -1 });

// Instance methods
activityContentSchema.methods.getLocalizedContent = function(language: string) {
  if (language === this.baseLanguage) {
    return this.sourceContent;
  }
  return this.localizations.get(language);
};

activityContentSchema.methods.addLocalization = function(language: string, content: ILocalizedContent) {
  this.localizations.set(language, content);
  if (!this.supportedLanguages.includes(language)) {
    this.supportedLanguages.push(language);
  }
};

activityContentSchema.methods.getTranslationProgress = function() {
  const requestedCount = this.translationWorkflow.requestedLanguages.length;
  const completedCount = this.translationWorkflow.assignedTranslators.filter(
    t => t.status === 'approved'
  ).length;
  return requestedCount > 0 ? (completedCount / requestedCount) * 100 : 0;
};

activityContentSchema.methods.calculateQualityScore = function() {
  const languageScores = Array.from(this.qualityMetrics.languageScores.values());
  if (languageScores.length === 0) return 0;
  return languageScores.reduce((sum, score) => sum + score, 0) / languageScores.length;
};

activityContentSchema.methods.isTranslationComplete = function(language: string) {
  const localization = this.localizations.get(language);
  return localization && localization.status === 'published';
};

activityContentSchema.methods.generateVersion = function() {
  const currentVersion = this.publication.version.split('.').map(Number);
  currentVersion[2]++; // Increment patch version
  return currentVersion.join('.');
};

// Static methods
activityContentSchema.statics.findByLanguage = function(language: string) {
  return this.find({
    $or: [
      { baseLanguage: language },
      { supportedLanguages: language }
    ],
    isActive: true
  });
};

activityContentSchema.statics.findPendingTranslations = function(language?: string) {
  const query: any = {
    'translationWorkflow.status': { $in: ['translation_requested', 'in_progress'] }
  };
  
  if (language) {
    query['translationWorkflow.requestedLanguages'] = language;
  }
  
  return this.find(query);
};

activityContentSchema.statics.getTranslationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$translationWorkflow.status',
        count: { $sum: 1 },
        languages: { $addToSet: '$translationWorkflow.requestedLanguages' }
      }
    }
  ]);
};

// Pre-save middleware
activityContentSchema.pre('save', function(next) {
  // Update overall quality score
  this.qualityMetrics.overallScore = this.calculateQualityScore();
  
  // Update last modified date
  this.publication.lastModified = new Date();
  
  next();
});

export const ActivityContent = mongoose.model<IActivityContent>('ActivityContent', activityContentSchema);