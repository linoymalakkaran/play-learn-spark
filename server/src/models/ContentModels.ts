/**
 * Educational Content Models - MongoDB Schema
 * 
 * Comprehensive content management system supporting various educational content types
 * including activities, lessons, assessments, and multimedia resources.
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

// ===================== INTERFACES =====================

export interface IContentItem extends Document {
  title: string;
  description: string;
  contentType: 'lesson' | 'activity' | 'assessment' | 'resource' | 'game' | 'video' | 'audio' | 'document';
  subject: string;
  gradeLevel: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'en' | 'ar' | 'ml' | 'es' | 'fr';
  
  // Content structure
  content: {
    body: string; // Rich text content
    objectives: string[];
    prerequisites: string[];
    estimatedDuration: number; // in minutes
    instructions: string;
  };
  
  // Media and resources
  media: {
    thumbnail?: string;
    images: string[];
    videos: string[];
    audio: string[];
    documents: string[];
    interactiveElements: any[];
  };
  
  // Categorization and discovery
  tags: string[];
  categories: string[];
  keywords: string[];
  ageRange: {
    min: number;
    max: number;
  };
  
  // Educational standards and alignment
  standards: {
    framework: string; // e.g., 'CCSS', 'NGSS', 'UAE-MOE'
    alignments: string[];
  }[];
  
  // Publishing and access control
  status: 'draft' | 'review' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'organization' | 'class-specific';
  accessLevel: 'free' | 'premium' | 'subscription';
  
  // Authoring information
  author: Types.ObjectId; // Reference to UserMongo
  contributors: Types.ObjectId[];
  organization?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Version control
  version: {
    major: number;
    minor: number;
    patch: number;
    versionString: string;
  };
  previousVersions: Types.ObjectId[];
  
  // Analytics and engagement
  analytics: {
    views: number;
    likes: number;
    downloads: number;
    completions: number;
    averageRating: number;
    totalRatings: number;
    engagementScore: number;
  };
  
  // AI and personalization
  aiGenerated: boolean;
  aiTags: string[];
  personalizations: {
    adaptiveDifficulty: boolean;
    multipleFormats: boolean;
    languageVariants: string[];
  };
  
  // SEO and metadata
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    socialImage?: string;
  };
  
  // Collaboration
  collaborative: {
    allowComments: boolean;
    allowSuggestions: boolean;
    collaborators: Types.ObjectId[];
    reviewers: Types.ObjectId[];
  };
}

export interface ILesson extends Document {
  contentId: Types.ObjectId; // Reference to ContentItem
  
  // Lesson-specific structure
  structure: {
    sections: {
      id: string;
      title: string;
      type: 'introduction' | 'content' | 'activity' | 'assessment' | 'conclusion';
      content: string;
      media: string[];
      duration: number;
      interactive: boolean;
    }[];
    totalDuration: number;
    sequenceOrder: number;
  };
  
  // Learning objectives and outcomes
  learningObjectives: {
    primary: string[];
    secondary: string[];
    skillsTargeted: string[];
    bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  };
  
  // Course integration
  courseId?: Types.ObjectId;
  unitId?: Types.ObjectId;
  prerequisiteLessons: Types.ObjectId[];
  nextLessons: Types.ObjectId[];
  
  // Adaptive learning
  adaptiveContent: {
    difficultyVariants: {
      level: 'easy' | 'medium' | 'hard';
      contentVariations: any;
    }[];
    personalizedPaths: any[];
  };
}

export interface IActivity extends Document {
  contentId: Types.ObjectId; // Reference to ContentItem
  
  // Activity-specific properties
  activityType: 'quiz' | 'game' | 'simulation' | 'creative' | 'collaborative' | 'practical' | 'research';
  interactionType: 'drag-drop' | 'multiple-choice' | 'fill-blank' | 'matching' | 'drawing' | 'recording' | 'typing';
  
  // Activity configuration
  configuration: {
    questions?: {
      id: string;
      type: string;
      question: string;
      options?: string[];
      correctAnswer: any;
      explanation: string;
      points: number;
      timeLimit?: number;
    }[];
    gameSettings?: {
      rules: string;
      scoring: any;
      levels: any[];
      powerUps: any[];
    };
    tools?: string[];
    materials?: string[];
  };
  
  // Scoring and assessment
  assessment: {
    maxScore: number;
    passingScore: number;
    attempts: number;
    timeLimit?: number;
    instantFeedback: boolean;
    showCorrectAnswers: boolean;
  };
  
  // Completion tracking
  completionCriteria: {
    scoreThreshold?: number;
    timeSpent?: number;
    tasksCompleted?: string[];
    customCriteria?: any;
  };
}

export interface IMediaAsset extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  cloudinaryId?: string;
  
  // Media metadata
  metadata: {
    dimensions?: { width: number; height: number };
    duration?: number; // for video/audio
    resolution?: string;
    bitrate?: number;
    codec?: string;
    subtitle?: boolean;
  };
  
  // Processing status
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    formats: {
      format: string;
      url: string;
      size: number;
    }[];
    thumbnails: string[];
    captions?: string[];
  };
  
  // Usage and references
  usedIn: Types.ObjectId[]; // ContentItem IDs
  downloads: number;
  views: number;
  
  // Access control
  uploadedBy: Types.ObjectId;
  organization?: Types.ObjectId;
  accessLevel: 'public' | 'private' | 'organization';
  
  // AI analysis
  aiAnalysis?: {
    description: string;
    tags: string[];
    appropriatenessScore: number;
    educationalValue: number;
    readabilityScore?: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentCollection extends Document {
  name: string;
  description: string;
  type: 'course' | 'curriculum' | 'playlist' | 'unit' | 'pathway';
  
  // Collection structure
  items: {
    contentId: Types.ObjectId;
    order: number;
    required: boolean;
    estimatedTime: number;
  }[];
  
  // Collection metadata
  totalDuration: number;
  itemCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subject: string;
  gradeLevel: string[];
  
  // Organization
  author: Types.ObjectId;
  organization?: Types.ObjectId;
  tags: string[];
  categories: string[];
  
  // Enrollment and access
  enrollments: {
    userId: Types.ObjectId;
    enrolledAt: Date;
    progress: number;
    completed: boolean;
    completedAt?: Date;
  }[];
  
  // Collection settings
  settings: {
    autoEnroll: boolean;
    certificateEnabled: boolean;
    discussionEnabled: boolean;
    progressTracking: boolean;
    sequentialAccess: boolean;
  };
  
  // Analytics
  analytics: {
    totalEnrollments: number;
    completionRate: number;
    averageRating: number;
    engagementScore: number;
  };
  
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// ===================== SCHEMAS =====================

const ContentItemSchema = new Schema<IContentItem>({
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 1000 },
  contentType: { 
    type: String, 
    required: true,
    enum: ['lesson', 'activity', 'assessment', 'resource', 'game', 'video', 'audio', 'document']
  },
  subject: { type: String, required: true, index: true },
  gradeLevel: [{ type: String, required: true }],
  difficulty: { 
    type: String, 
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  language: { 
    type: String, 
    required: true,
    enum: ['en', 'ar', 'ml', 'es', 'fr'],
    default: 'en'
  },
  
  content: {
    body: { type: String, required: true },
    objectives: [String],
    prerequisites: [String],
    estimatedDuration: { type: Number, min: 1, max: 600 }, // 1-600 minutes
    instructions: String
  },
  
  media: {
    thumbnail: String,
    images: [String],
    videos: [String],
    audio: [String],
    documents: [String],
    interactiveElements: [Schema.Types.Mixed]
  },
  
  tags: [{ type: String, index: true }],
  categories: [{ type: String, index: true }],
  keywords: [String],
  ageRange: {
    min: { type: Number, min: 3, max: 18 },
    max: { type: Number, min: 3, max: 18 }
  },
  
  standards: [{
    framework: String,
    alignments: [String]
  }],
  
  status: { 
    type: String, 
    required: true,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  visibility: { 
    type: String, 
    required: true,
    enum: ['public', 'private', 'organization', 'class-specific'],
    default: 'private'
  },
  accessLevel: { 
    type: String, 
    required: true,
    enum: ['free', 'premium', 'subscription'],
    default: 'free'
  },
  
  author: { type: Schema.Types.ObjectId, ref: 'UserMongo', required: true, index: true },
  contributors: [{ type: Schema.Types.ObjectId, ref: 'UserMongo' }],
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  publishedAt: Date,
  
  version: {
    major: { type: Number, default: 1 },
    minor: { type: Number, default: 0 },
    patch: { type: Number, default: 0 },
    versionString: { type: String, default: '1.0.0' }
  },
  previousVersions: [{ type: Schema.Types.ObjectId, ref: 'ContentItem' }],
  
  analytics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0, min: 0, max: 100 }
  },
  
  aiGenerated: { type: Boolean, default: false },
  aiTags: [String],
  personalizations: {
    adaptiveDifficulty: { type: Boolean, default: false },
    multipleFormats: { type: Boolean, default: false },
    languageVariants: [String]
  },
  
  seo: {
    metaTitle: String,
    metaDescription: String,
    canonicalUrl: String,
    socialImage: String
  },
  
  collaborative: {
    allowComments: { type: Boolean, default: true },
    allowSuggestions: { type: Boolean, default: false },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'UserMongo' }],
    reviewers: [{ type: Schema.Types.ObjectId, ref: 'UserMongo' }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const LessonSchema = new Schema<ILesson>({
  contentId: { type: Schema.Types.ObjectId, ref: 'ContentItem', required: true },
  
  structure: {
    sections: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      type: { 
        type: String, 
        required: true,
        enum: ['introduction', 'content', 'activity', 'assessment', 'conclusion']
      },
      content: { type: String, required: true },
      media: [String],
      duration: { type: Number, min: 1 },
      interactive: { type: Boolean, default: false }
    }],
    totalDuration: { type: Number, min: 1 },
    sequenceOrder: { type: Number, default: 0 }
  },
  
  learningObjectives: {
    primary: [String],
    secondary: [String],
    skillsTargeted: [String],
    bloomsLevel: { 
      type: String,
      enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']
    }
  },
  
  courseId: { type: Schema.Types.ObjectId, ref: 'ContentCollection' },
  unitId: { type: Schema.Types.ObjectId, ref: 'ContentCollection' },
  prerequisiteLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  nextLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  
  adaptiveContent: {
    difficultyVariants: [{
      level: { type: String, enum: ['easy', 'medium', 'hard'] },
      contentVariations: Schema.Types.Mixed
    }],
    personalizedPaths: [Schema.Types.Mixed]
  }
}, {
  timestamps: true
});

const ActivitySchema = new Schema<IActivity>({
  contentId: { type: Schema.Types.ObjectId, ref: 'ContentItem', required: true },
  
  activityType: { 
    type: String, 
    required: true,
    enum: ['quiz', 'game', 'simulation', 'creative', 'collaborative', 'practical', 'research']
  },
  interactionType: { 
    type: String, 
    required: true,
    enum: ['drag-drop', 'multiple-choice', 'fill-blank', 'matching', 'drawing', 'recording', 'typing']
  },
  
  configuration: {
    questions: [{
      id: String,
      type: String,
      question: String,
      options: [String],
      correctAnswer: Schema.Types.Mixed,
      explanation: String,
      points: { type: Number, default: 1 },
      timeLimit: Number
    }],
    gameSettings: {
      rules: String,
      scoring: Schema.Types.Mixed,
      levels: [Schema.Types.Mixed],
      powerUps: [Schema.Types.Mixed]
    },
    tools: [String],
    materials: [String]
  },
  
  assessment: {
    maxScore: { type: Number, required: true, min: 1 },
    passingScore: { type: Number, required: true, min: 0 },
    attempts: { type: Number, default: 3, min: 1 },
    timeLimit: Number,
    instantFeedback: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: true }
  },
  
  completionCriteria: {
    scoreThreshold: Number,
    timeSpent: Number,
    tasksCompleted: [String],
    customCriteria: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const MediaAssetSchema = new Schema<IMediaAsset>({
  filename: { type: String, required: true, unique: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  cloudinaryId: String,
  
  metadata: {
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number,
    resolution: String,
    bitrate: Number,
    codec: String,
    subtitle: Boolean
  },
  
  processing: {
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    formats: [{
      format: String,
      url: String,
      size: Number
    }],
    thumbnails: [String],
    captions: [String]
  },
  
  usedIn: [{ type: Schema.Types.ObjectId, ref: 'ContentItem' }],
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'UserMongo', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  accessLevel: { 
    type: String, 
    enum: ['public', 'private', 'organization'],
    default: 'private'
  },
  
  aiAnalysis: {
    description: String,
    tags: [String],
    appropriatenessScore: { type: Number, min: 0, max: 100 },
    educationalValue: { type: Number, min: 0, max: 100 },
    readabilityScore: { type: Number, min: 0, max: 100 }
  }
}, {
  timestamps: true
});

const ContentCollectionSchema = new Schema<IContentCollection>({
  name: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 1000 },
  type: { 
    type: String, 
    required: true,
    enum: ['course', 'curriculum', 'playlist', 'unit', 'pathway']
  },
  
  items: [{
    contentId: { type: Schema.Types.ObjectId, ref: 'ContentItem', required: true },
    order: { type: Number, required: true },
    required: { type: Boolean, default: true },
    estimatedTime: { type: Number, min: 1 }
  }],
  
  totalDuration: { type: Number, default: 0 },
  itemCount: { type: Number, default: 0 },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced']
  },
  subject: { type: String, required: true },
  gradeLevel: [String],
  
  author: { type: Schema.Types.ObjectId, ref: 'UserMongo', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  tags: [String],
  categories: [String],
  
  enrollments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'UserMongo', required: true },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  
  settings: {
    autoEnroll: { type: Boolean, default: false },
    certificateEnabled: { type: Boolean, default: false },
    discussionEnabled: { type: Boolean, default: true },
    progressTracking: { type: Boolean, default: true },
    sequentialAccess: { type: Boolean, default: false }
  },
  
  analytics: {
    totalEnrollments: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    engagementScore: { type: Number, default: 0, min: 0, max: 100 }
  },
  
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// ===================== INDEXES =====================

// ContentItem indexes
ContentItemSchema.index({ subject: 1, gradeLevel: 1 });
ContentItemSchema.index({ tags: 1 });
ContentItemSchema.index({ categories: 1 });
ContentItemSchema.index({ status: 1, visibility: 1 });
ContentItemSchema.index({ 'analytics.views': -1 });
ContentItemSchema.index({ 'analytics.averageRating': -1 });
ContentItemSchema.index({ createdAt: -1 });
ContentItemSchema.index({ author: 1, status: 1 });

// MediaAsset indexes
MediaAssetSchema.index({ uploadedBy: 1 });
MediaAssetSchema.index({ mimeType: 1 });
MediaAssetSchema.index({ 'processing.status': 1 });

// ContentCollection indexes
ContentCollectionSchema.index({ subject: 1, gradeLevel: 1 });
ContentCollectionSchema.index({ type: 1, status: 1 });
ContentCollectionSchema.index({ author: 1 });

// ===================== VIRTUALS =====================

ContentItemSchema.virtual('authorPopulated', {
  ref: 'UserMongo',
  localField: 'author',
  foreignField: '_id',
  justOne: true
});

ContentItemSchema.virtual('versionDisplay').get(function() {
  return `${this.version.major}.${this.version.minor}.${this.version.patch}`;
});

// ===================== MIDDLEWARE =====================

ContentItemSchema.pre('save', function(next) {
  if (this.isModified('version')) {
    this.version.versionString = `${this.version.major}.${this.version.minor}.${this.version.patch}`;
  }
  next();
});

ContentCollectionSchema.pre('save', function(next) {
  this.itemCount = this.items.length;
  this.totalDuration = this.items.reduce((total, item) => total + (item.estimatedTime || 0), 0);
  next();
});

// ===================== MODELS =====================

export const ContentItem = mongoose.model<IContentItem>('ContentItem', ContentItemSchema);
export const Lesson = mongoose.model<ILesson>('Lesson', LessonSchema);
export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
export const MediaAsset = mongoose.model<IMediaAsset>('MediaAsset', MediaAssetSchema);
export const ContentCollection = mongoose.model<IContentCollection>('ContentCollection', ContentCollectionSchema);

export default {
  ContentItem,
  Lesson,
  Activity,
  MediaAsset,
  ContentCollection
};