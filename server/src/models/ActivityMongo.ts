import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IActivity extends Document {
  _id: ObjectId;
  title: string;
  description: string;
  category: 'alphabet' | 'numbers' | 'shapes' | 'colors' | 'animals' | 'nature' | 'music' | 'art' | 'language' | 'science' | 'social-studies' | 'physical-education' | 'creative-arts';
  subcategory?: string;
  language: 'en' | 'ar' | 'ml' | 'es' | 'fr' | 'de' | 'zh' | 'hi';
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  ageRange: {
    min: number;
    max: number;
  };
  contentType: 'interactive' | 'video' | 'audio' | 'game' | 'quiz' | 'story' | 'simulation' | 'ar' | 'vr';
  contentData: any;
  contentAssets: {
    images: Array<{
      url: string;
      alt: string;
      type: 'illustration' | 'photo' | 'icon' | 'background';
      metadata?: any;
    }>;
    audio: Array<{
      url: string;
      duration: number;
      type: 'narration' | 'sound-effect' | 'music' | 'pronunciation';
      transcript?: string;
    }>;
    videos: Array<{
      url: string;
      duration: number;
      thumbnail: string;
      quality: '720p' | '1080p' | '4k';
      subtitles?: Array<{
        language: string;
        url: string;
      }>;
    }>;
    documents: Array<{
      url: string;
      name: string;
      type: 'pdf' | 'doc' | 'worksheet' | 'guide';
      size: number;
    }>;
  };
  objectives: Array<{
    id: string;
    description: string;
    bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    measurable: boolean;
  }>;
  instructions: {
    teacher: string;
    student: string;
    parent?: string;
    setup?: string;
  };
  duration: {
    estimated: number; // in minutes
    minimum: number;
    maximum: number;
  };
  points: {
    base: number;
    bonus: number;
    completion: number;
    mastery: number;
  };
  prerequisites: Array<{
    activityId: ObjectId;
    masteryRequired: boolean;
    optional: boolean;
  }>;
  adaptiveSettings: {
    enabled: boolean;
    difficultyAdjustment: boolean;
    paceAdjustment: boolean;
    contentVariation: boolean;
  };
  accessibility: {
    visualImpairment: boolean;
    hearingImpairment: boolean;
    motorImpairment: boolean;
    cognitiveSupport: boolean;
    languageSupport: string[];
  };
  aiGenerated: {
    isAiGenerated: boolean;
    provider?: 'openai' | 'anthropic' | 'huggingface' | 'custom';
    model?: string;
    prompt?: string;
    generatedAt?: Date;
    humanReviewed: boolean;
    reviewedBy?: ObjectId;
    reviewNotes?: string;
  };
  version: {
    major: number;
    minor: number;
    patch: number;
    label?: string;
  };
  tags: string[];
  metadata: {
    popularity: number;
    rating: number;
    reviewCount: number;
    totalPlays: number;
    averageCompletionTime: number;
    successRate: number;
    engagementScore: number;
    lastPlayed: Date;
    difficulty_actual: number; // AI-calculated actual difficulty
  };
  status: 'draft' | 'review' | 'published' | 'archived' | 'deprecated';
  creator: {
    userId: ObjectId;
    type: 'ai' | 'educator' | 'admin' | 'student';
    name: string;
    collaborative: boolean;
    contributors?: Array<{
      userId: ObjectId;
      role: 'reviewer' | 'editor' | 'translator' | 'tester';
      contribution: string;
    }>;
  };
  sharing: {
    isPublic: boolean;
    isTemplate: boolean;
    allowRemix: boolean;
    allowDownload: boolean;
    license: 'creative-commons' | 'educational-use' | 'all-rights-reserved' | 'open-source';
    sharedWith: Array<{
      userId: ObjectId;
      permission: 'view' | 'edit' | 'remix';
      sharedAt: Date;
    }>;
  };
  analytics: {
    views: number;
    downloads: number;
    remixes: number;
    completions: number;
    ratings: Array<{
      userId: ObjectId;
      rating: number;
      review?: string;
      date: Date;
    }>;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    archivedAt?: Date;
  };

  // Methods
  calculateActualDifficulty(): Promise<number>;
  generateVersionString(): string;
  canUserAccess(userId: ObjectId, action: string): Promise<boolean>;
  createNewVersion(changes: any): Promise<IActivity>;
  generateTemplate(): any;
}

const activitySchema = new Schema<IActivity>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
    index: 'text'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
    index: 'text'
  },
  category: {
    type: String,
    required: true,
    enum: ['alphabet', 'numbers', 'shapes', 'colors', 'animals', 'nature', 'music', 'art', 'language', 'science', 'social-studies', 'physical-education', 'creative-arts'],
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 100
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'ar', 'ml', 'es', 'fr', 'de', 'zh', 'hi'],
    default: 'en',
    index: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'easy', 'medium', 'hard', 'expert'],
    index: true
  },
  ageRange: {
    min: {
      type: Number,
      required: true,
      min: 3,
      max: 18
    },
    max: {
      type: Number,
      required: true,
      min: 3,
      max: 18
    }
  },
  contentType: {
    type: String,
    required: true,
    enum: ['interactive', 'video', 'audio', 'game', 'quiz', 'story', 'simulation', 'ar', 'vr'],
    index: true
  },
  contentData: {
    type: Schema.Types.Mixed,
    required: true
  },
  contentAssets: {
    images: [{
      url: { type: String, required: true },
      alt: { type: String, required: true },
      type: { 
        type: String, 
        enum: ['illustration', 'photo', 'icon', 'background'],
        default: 'illustration'
      },
      metadata: Schema.Types.Mixed
    }],
    audio: [{
      url: { type: String, required: true },
      duration: { type: Number, required: true },
      type: { 
        type: String, 
        enum: ['narration', 'sound-effect', 'music', 'pronunciation'],
        default: 'narration'
      },
      transcript: String
    }],
    videos: [{
      url: { type: String, required: true },
      duration: { type: Number, required: true },
      thumbnail: { type: String, required: true },
      quality: { 
        type: String, 
        enum: ['720p', '1080p', '4k'],
        default: '720p'
      },
      subtitles: [{
        language: String,
        url: String
      }]
    }],
    documents: [{
      url: { type: String, required: true },
      name: { type: String, required: true },
      type: { 
        type: String, 
        enum: ['pdf', 'doc', 'worksheet', 'guide'],
        default: 'pdf'
      },
      size: Number
    }]
  },
  objectives: [{
    id: { type: String, required: true },
    description: { type: String, required: true },
    bloomLevel: {
      type: String,
      enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'],
      default: 'understand'
    },
    measurable: { type: Boolean, default: true }
  }],
  instructions: {
    teacher: { type: String, required: true },
    student: { type: String, required: true },
    parent: String,
    setup: String
  },
  duration: {
    estimated: { type: Number, required: true, min: 1, max: 180 },
    minimum: { type: Number, required: true, min: 1 },
    maximum: { type: Number, required: true, max: 240 }
  },
  points: {
    base: { type: Number, required: true, min: 1, max: 100 },
    bonus: { type: Number, default: 0, min: 0, max: 50 },
    completion: { type: Number, default: 10, min: 1, max: 50 },
    mastery: { type: Number, default: 20, min: 1, max: 100 }
  },
  prerequisites: [{
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity' },
    masteryRequired: { type: Boolean, default: false },
    optional: { type: Boolean, default: false }
  }],
  adaptiveSettings: {
    enabled: { type: Boolean, default: false },
    difficultyAdjustment: { type: Boolean, default: false },
    paceAdjustment: { type: Boolean, default: false },
    contentVariation: { type: Boolean, default: false }
  },
  accessibility: {
    visualImpairment: { type: Boolean, default: false },
    hearingImpairment: { type: Boolean, default: false },
    motorImpairment: { type: Boolean, default: false },
    cognitiveSupport: { type: Boolean, default: false },
    languageSupport: [String]
  },
  aiGenerated: {
    isAiGenerated: { type: Boolean, default: false },
    provider: {
      type: String,
      enum: ['openai', 'anthropic', 'huggingface', 'custom']
    },
    model: String,
    prompt: String,
    generatedAt: Date,
    humanReviewed: { type: Boolean, default: false },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: String
  },
  version: {
    major: { type: Number, default: 1 },
    minor: { type: Number, default: 0 },
    patch: { type: Number, default: 0 },
    label: String
  },
  tags: {
    type: [String],
    index: true
  },
  metadata: {
    popularity: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalPlays: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 },
    successRate: { type: Number, default: 0, min: 0, max: 100 },
    engagementScore: { type: Number, default: 0, min: 0, max: 100 },
    lastPlayed: { type: Date, default: Date.now },
    difficulty_actual: { type: Number, default: 0, min: 0, max: 100 }
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'review', 'published', 'archived', 'deprecated'],
    default: 'draft',
    index: true
  },
  creator: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      required: true,
      enum: ['ai', 'educator', 'admin', 'student']
    },
    name: { type: String, required: true },
    collaborative: { type: Boolean, default: false },
    contributors: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      role: {
        type: String,
        enum: ['reviewer', 'editor', 'translator', 'tester']
      },
      contribution: String
    }]
  },
  sharing: {
    isPublic: { type: Boolean, default: false },
    isTemplate: { type: Boolean, default: false },
    allowRemix: { type: Boolean, default: true },
    allowDownload: { type: Boolean, default: false },
    license: {
      type: String,
      enum: ['creative-commons', 'educational-use', 'all-rights-reserved', 'open-source'],
      default: 'educational-use'
    },
    sharedWith: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      permission: {
        type: String,
        enum: ['view', 'edit', 'remix'],
        default: 'view'
      },
      sharedAt: { type: Date, default: Date.now }
    }]
  },
  analytics: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    remixes: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    ratings: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      date: { type: Date, default: Date.now }
    }]
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: Date,
    archivedAt: Date
  }
}, {
  timestamps: false // We're managing timestamps manually
});

// Compound indexes for performance
activitySchema.index({ category: 1, language: 1, difficulty: 1 });
activitySchema.index({ 'ageRange.min': 1, 'ageRange.max': 1 });
activitySchema.index({ status: 1, 'timestamps.publishedAt': -1 });
activitySchema.index({ 'creator.userId': 1, status: 1 });
activitySchema.index({ 'sharing.isPublic': 1, 'metadata.popularity': -1 });
activitySchema.index({ 'aiGenerated.isAiGenerated': 1, 'aiGenerated.humanReviewed': 1 });
activitySchema.index({ 'sharing.isTemplate': 1, category: 1 });

// Text search index
activitySchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    description: 5,
    tags: 1
  }
});

// Instance methods
activitySchema.methods.calculateActualDifficulty = async function(): Promise<number> {
  // AI-powered difficulty calculation based on user performance
  const completions = this.analytics.completions;
  const successRate = this.metadata.successRate;
  const avgCompletionTime = this.metadata.averageCompletionTime;
  const estimatedTime = this.duration.estimated;
  
  if (completions < 10) {
    // Not enough data, return estimated difficulty
    const difficultyMap = { beginner: 10, easy: 25, medium: 50, hard: 75, expert: 90 };
    return difficultyMap[this.difficulty] || 50;
  }
  
  // Calculate based on actual performance
  let difficulty = 50; // baseline
  
  // Adjust based on success rate
  if (successRate < 30) difficulty += 30;
  else if (successRate < 50) difficulty += 15;
  else if (successRate > 90) difficulty -= 20;
  else if (successRate > 80) difficulty -= 10;
  
  // Adjust based on completion time vs estimated
  const timeRatio = avgCompletionTime / estimatedTime;
  if (timeRatio > 1.5) difficulty += 15;
  else if (timeRatio > 1.2) difficulty += 5;
  else if (timeRatio < 0.8) difficulty -= 10;
  
  this.metadata.difficulty_actual = Math.max(0, Math.min(100, difficulty));
  await this.save();
  
  return this.metadata.difficulty_actual;
};

activitySchema.methods.generateVersionString = function(): string {
  const { major, minor, patch, label } = this.version;
  let versionString = `${major}.${minor}.${patch}`;
  if (label) {
    versionString += `-${label}`;
  }
  return versionString;
};

activitySchema.methods.canUserAccess = async function(userId: ObjectId, action: string): Promise<boolean> {
  // Check if user can perform the action on this activity
  if (this.creator.userId.toString() === userId.toString()) {
    return true; // Creator has full access
  }
  
  if (this.status === 'published' && this.sharing.isPublic && action === 'view') {
    return true; // Public activities can be viewed by anyone
  }
  
  // Check if user is in shared list
  const sharedAccess = this.sharing.sharedWith.find(
    share => share.userId.toString() === userId.toString()
  );
  
  if (sharedAccess) {
    const permissionMap = {
      view: ['view'],
      edit: ['view', 'edit'],
      remix: ['view', 'edit', 'remix']
    };
    return permissionMap[sharedAccess.permission]?.includes(action) || false;
  }
  
  return false;
};

activitySchema.methods.createNewVersion = async function(changes: any): Promise<IActivity> {
  // Create a new version of this activity
  const newActivity = new ActivityMongo({
    ...this.toObject(),
    _id: undefined,
    version: {
      major: changes.majorUpdate ? this.version.major + 1 : this.version.major,
      minor: changes.majorUpdate ? 0 : this.version.minor + 1,
      patch: 0,
      label: changes.label
    },
    status: 'draft',
    timestamps: {
      createdAt: new Date(),
      updatedAt: new Date()
    },
    analytics: {
      views: 0,
      downloads: 0,
      remixes: 0,
      completions: 0,
      ratings: []
    },
    metadata: {
      ...this.metadata,
      popularity: 0,
      rating: 0,
      reviewCount: 0,
      totalPlays: 0
    }
  });
  
  // Apply changes
  Object.assign(newActivity, changes);
  
  return await newActivity.save();
};

activitySchema.methods.generateTemplate = function(): any {
  // Generate a template object from this activity
  const template = {
    title: `${this.title} (Template)`,
    description: this.description,
    category: this.category,
    subcategory: this.subcategory,
    contentType: this.contentType,
    difficulty: this.difficulty,
    ageRange: this.ageRange,
    objectives: this.objectives,
    instructions: this.instructions,
    duration: this.duration,
    points: this.points,
    contentStructure: this.contentData,
    accessibility: this.accessibility,
    tags: [...this.tags, 'template'],
    sharing: {
      ...this.sharing,
      isTemplate: true,
      allowRemix: true
    }
  };
  
  return template;
};

// Static methods
activitySchema.statics.findByCreator = function(userId: ObjectId, status?: string) {
  const query: any = { 'creator.userId': userId };
  if (status) query.status = status;
  return this.find(query).sort({ 'timestamps.updatedAt': -1 });
};

activitySchema.statics.findPublicActivities = function(filters: any = {}) {
  const query = {
    status: 'published',
    'sharing.isPublic': true,
    ...filters
  };
  return this.find(query).sort({ 'metadata.popularity': -1 });
};

activitySchema.statics.findTemplates = function(category?: string) {
  const query: any = {
    status: 'published',
    'sharing.isTemplate': true
  };
  if (category) query.category = category;
  return this.find(query).sort({ 'metadata.rating': -1 });
};

activitySchema.statics.searchActivities = function(searchQuery: string, filters: any = {}) {
  const query = {
    $text: { $search: searchQuery },
    status: 'published',
    'sharing.isPublic': true,
    ...filters
  };
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Pre-save middleware
activitySchema.pre('save', function(next) {
  if (this.ageRange.max < this.ageRange.min) {
    next(new Error('Maximum age must be greater than or equal to minimum age'));
    return;
  }
  
  this.timestamps.updatedAt = new Date();
  
  // Auto-calculate points based on difficulty if not set
  if (!this.points.base) {
    const pointsMap = { beginner: 5, easy: 10, medium: 20, hard: 30, expert: 50 };
    this.points.base = pointsMap[this.difficulty] || 10;
  }
  
  next();
});

export const ActivityMongo = model<IActivity>('Activity', activitySchema);