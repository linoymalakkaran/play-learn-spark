import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IActivityTemplate extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  templateType: 'basic' | 'advanced' | 'interactive' | 'ai-generated';
  structure: {
    sections: Array<{
      id: string;
      name: string;
      type: 'intro' | 'instruction' | 'activity' | 'assessment' | 'conclusion';
      required: boolean;
      content: any;
      customizable: boolean;
    }>;
    variables: Array<{
      name: string;
      type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'image' | 'audio' | 'video';
      required: boolean;
      defaultValue?: any;
      options?: any[];
      validation?: any;
      description: string;
    }>;
    styling: {
      theme: string;
      colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
      };
      fonts: {
        header: string;
        body: string;
      };
      customizable: boolean;
    };
  };
  contentTypes: string[];
  ageRanges: Array<{
    min: number;
    max: number;
    label: string;
  }>;
  difficultyLevels: string[];
  languages: string[];
  features: {
    adaptiveContent: boolean;
    multiLanguage: boolean;
    accessibility: boolean;
    analytics: boolean;
    collaboration: boolean;
    aiIntegration: boolean;
  };
  usage: {
    timesUsed: number;
    averageRating: number;
    reviews: Array<{
      userId: ObjectId;
      rating: number;
      comment: string;
      date: Date;
    }>;
    tags: string[];
  };
  creator: {
    userId: ObjectId;
    name: string;
    verified: boolean;
  };
  license: {
    type: 'free' | 'premium' | 'custom';
    price?: number;
    restrictions?: string[];
  };
  metadata: {
    version: string;
    isPublic: boolean;
    featured: boolean;
    status: 'draft' | 'published' | 'deprecated';
    createdAt: Date;
    updatedAt: Date;
  };

  // Methods
  generateActivity(variables: any): Promise<any>;
  validateVariables(variables: any): boolean;
  getUsageStats(): any;
}

const activityTemplateSchema = new Schema<IActivityTemplate>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: 'text'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    index: 'text'
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    index: true
  },
  templateType: {
    type: String,
    required: true,
    enum: ['basic', 'advanced', 'interactive', 'ai-generated'],
    index: true
  },
  structure: {
    sections: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      type: {
        type: String,
        enum: ['intro', 'instruction', 'activity', 'assessment', 'conclusion'],
        required: true
      },
      required: { type: Boolean, default: true },
      content: Schema.Types.Mixed,
      customizable: { type: Boolean, default: true }
    }],
    variables: [{
      name: { type: String, required: true },
      type: {
        type: String,
        enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'image', 'audio', 'video'],
        required: true
      },
      required: { type: Boolean, default: false },
      defaultValue: Schema.Types.Mixed,
      options: [Schema.Types.Mixed],
      validation: Schema.Types.Mixed,
      description: { type: String, required: true }
    }],
    styling: {
      theme: { type: String, default: 'default' },
      colors: {
        primary: { type: String, default: '#007bff' },
        secondary: { type: String, default: '#6c757d' },
        background: { type: String, default: '#ffffff' },
        text: { type: String, default: '#333333' }
      },
      fonts: {
        header: { type: String, default: 'Inter' },
        body: { type: String, default: 'Inter' }
      },
      customizable: { type: Boolean, default: true }
    }
  },
  contentTypes: {
    type: [String],
    required: true,
    index: true
  },
  ageRanges: [{
    min: { type: Number, required: true, min: 3, max: 18 },
    max: { type: Number, required: true, min: 3, max: 18 },
    label: { type: String, required: true }
  }],
  difficultyLevels: {
    type: [String],
    required: true,
    enum: ['beginner', 'easy', 'medium', 'hard', 'expert']
  },
  languages: {
    type: [String],
    required: true,
    enum: ['en', 'ar', 'ml', 'es', 'fr', 'de', 'zh', 'hi']
  },
  features: {
    adaptiveContent: { type: Boolean, default: false },
    multiLanguage: { type: Boolean, default: false },
    accessibility: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true },
    collaboration: { type: Boolean, default: false },
    aiIntegration: { type: Boolean, default: false }
  },
  usage: {
    timesUsed: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, maxlength: 500 },
      date: { type: Date, default: Date.now }
    }],
    tags: [String]
  },
  creator: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  license: {
    type: {
      type: String,
      enum: ['free', 'premium', 'custom'],
      default: 'free'
    },
    price: { type: Number, min: 0 },
    restrictions: [String]
  },
  metadata: {
    version: { type: String, default: '1.0.0' },
    isPublic: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'deprecated'],
      default: 'draft'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: false
});

// Indexes
activityTemplateSchema.index({ category: 1, templateType: 1 });
activityTemplateSchema.index({ 'usage.averageRating': -1, 'usage.timesUsed': -1 });
activityTemplateSchema.index({ 'metadata.featured': 1, 'metadata.status': 1 });
activityTemplateSchema.index({ 'creator.userId': 1, 'metadata.status': 1 });

// Text search
activityTemplateSchema.index({
  name: 'text',
  description: 'text',
  'usage.tags': 'text'
});

// Instance methods
activityTemplateSchema.methods.generateActivity = async function(variables: any): Promise<any> {
  // Validate variables first
  if (!this.validateVariables(variables)) {
    throw new Error('Invalid variables provided');
  }

  // Generate activity from template
  const activity = {
    title: this.interpolateText(this.name, variables),
    description: this.interpolateText(this.description, variables),
    category: this.category,
    subcategory: this.subcategory,
    contentType: variables.contentType || this.contentTypes[0],
    difficulty: variables.difficulty || this.difficultyLevels[0],
    language: variables.language || this.languages[0],
    ageRange: variables.ageRange || this.ageRanges[0],
    contentData: this.generateContentData(variables),
    instructions: this.generateInstructions(variables),
    objectives: this.generateObjectives(variables),
    duration: this.calculateDuration(variables),
    points: this.calculatePoints(variables),
    sharing: {
      isTemplate: false,
      allowRemix: true,
      isPublic: variables.isPublic || false
    },
    metadata: {
      generatedFromTemplate: this._id,
      templateVersion: this.metadata.version
    }
  };

  // Increment usage counter
  this.usage.timesUsed += 1;
  await this.save();

  return activity;
};

activityTemplateSchema.methods.validateVariables = function(variables: any): boolean {
  for (const variable of this.structure.variables) {
    if (variable.required && !variables[variable.name]) {
      return false;
    }

    if (variables[variable.name] && variable.validation) {
      // Perform validation based on type and rules
      if (!this.validateValue(variables[variable.name], variable)) {
        return false;
      }
    }
  }
  return true;
};

activityTemplateSchema.methods.validateValue = function(value: any, variable: any): boolean {
  switch (variable.type) {
    case 'text':
      return typeof value === 'string' && 
             (!variable.validation?.minLength || value.length >= variable.validation.minLength) &&
             (!variable.validation?.maxLength || value.length <= variable.validation.maxLength);
    
    case 'number':
      return typeof value === 'number' &&
             (!variable.validation?.min || value >= variable.validation.min) &&
             (!variable.validation?.max || value <= variable.validation.max);
    
    case 'select':
      return variable.options?.includes(value);
    
    case 'multiselect':
      return Array.isArray(value) && value.every(v => variable.options?.includes(v));
    
    default:
      return true;
  }
};

activityTemplateSchema.methods.interpolateText = function(text: string, variables: any): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] || match;
  });
};

activityTemplateSchema.methods.generateContentData = function(variables: any): any {
  const contentData: any = {};
  
  for (const section of this.structure.sections) {
    if (section.customizable) {
      contentData[section.id] = this.interpolateContent(section.content, variables);
    } else {
      contentData[section.id] = section.content;
    }
  }
  
  return contentData;
};

activityTemplateSchema.methods.interpolateContent = function(content: any, variables: any): any {
  if (typeof content === 'string') {
    return this.interpolateText(content, variables);
  } else if (Array.isArray(content)) {
    return content.map(item => this.interpolateContent(item, variables));
  } else if (typeof content === 'object' && content !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(content)) {
      result[key] = this.interpolateContent(value, variables);
    }
    return result;
  }
  return content;
};

activityTemplateSchema.methods.generateInstructions = function(variables: any): any {
  return {
    teacher: this.interpolateText(variables.teacherInstructions || 'Guide students through the activity', variables),
    student: this.interpolateText(variables.studentInstructions || 'Follow the activity steps carefully', variables),
    parent: this.interpolateText(variables.parentInstructions || 'Support your child during the activity', variables)
  };
};

activityTemplateSchema.methods.generateObjectives = function(variables: any): any[] {
  const baseObjectives = variables.objectives || [];
  return baseObjectives.map((obj: any, index: number) => ({
    id: `obj_${index + 1}`,
    description: this.interpolateText(obj.description, variables),
    bloomLevel: obj.bloomLevel || 'understand',
    measurable: obj.measurable !== false
  }));
};

activityTemplateSchema.methods.calculateDuration = function(variables: any): any {
  const baseDuration = variables.duration || 15;
  return {
    estimated: baseDuration,
    minimum: Math.floor(baseDuration * 0.7),
    maximum: Math.ceil(baseDuration * 1.5)
  };
};

activityTemplateSchema.methods.calculatePoints = function(variables: any): any {
  const difficultyMultiplier: any = {
    beginner: 0.5,
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 2.5
  };
  
  const basePoints = variables.basePoints || 10;
  const multiplier = difficultyMultiplier[variables.difficulty] || 1;
  
  return {
    base: Math.floor(basePoints * multiplier),
    bonus: Math.floor(basePoints * multiplier * 0.5),
    completion: Math.floor(basePoints * 0.5),
    mastery: Math.floor(basePoints * multiplier * 1.5)
  };
};

activityTemplateSchema.methods.getUsageStats = function(): any {
  return {
    timesUsed: this.usage.timesUsed,
    averageRating: this.usage.averageRating,
    totalReviews: this.usage.reviews.length,
    popularityScore: this.usage.timesUsed * this.usage.averageRating,
    lastUsed: this.usage.reviews.length > 0 ? 
      this.usage.reviews[this.usage.reviews.length - 1].date : null
  };
};

// Static methods
activityTemplateSchema.statics.findByCategory = function(category: string, featured?: boolean) {
  const query: any = { 
    category,
    'metadata.status': 'published',
    'metadata.isPublic': true
  };
  if (featured !== undefined) {
    query['metadata.featured'] = featured;
  }
  return this.find(query).sort({ 'usage.averageRating': -1, 'usage.timesUsed': -1 });
};

activityTemplateSchema.statics.findPopular = function(limit: number = 10) {
  return this.find({
    'metadata.status': 'published',
    'metadata.isPublic': true
  })
  .sort({ 'usage.timesUsed': -1, 'usage.averageRating': -1 })
  .limit(limit);
};

activityTemplateSchema.statics.searchTemplates = function(query: string, filters: any = {}) {
  const searchQuery = {
    $text: { $search: query },
    'metadata.status': 'published',
    'metadata.isPublic': true,
    ...filters
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

// Pre-save middleware
activityTemplateSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  
  // Calculate average rating
  if (this.usage.reviews.length > 0) {
    const totalRating = this.usage.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.usage.averageRating = totalRating / this.usage.reviews.length;
  }
  
  next();
});

export const ActivityTemplate = model<IActivityTemplate>('ActivityTemplate', activityTemplateSchema);