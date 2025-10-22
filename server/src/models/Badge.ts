import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IBadge extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  category: 'academic' | 'engagement' | 'collaboration' | 'creativity' | 'leadership' | 'milestone' | 'special';
  type: 'achievement' | 'progress' | 'completion' | 'streak' | 'social' | 'custom';
  icon: {
    url: string;
    style: 'flat' | '3d' | 'minimal' | 'detailed';
    colors: string[];
    shape: 'circle' | 'shield' | 'star' | 'hexagon' | 'square' | 'diamond';
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'master';
  criteria: {
    type: 'single' | 'cumulative' | 'streak' | 'percentage' | 'complex';
    conditions: Array<{
      field: string;
      operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';
      value: any;
      weight?: number;
    }>;
    threshold: number;
    timeframe?: {
      type: 'session' | 'daily' | 'weekly' | 'monthly' | 'alltime';
      duration?: number;
    };
    prerequisites: ObjectId[];
    exclusions: ObjectId[];
  };
  levels: Array<{
    name: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    threshold: number;
    multiplier: number;
    icon: string;
    title: string;
    description: string;
    rewards: Array<{
      type: 'points' | 'experience' | 'title' | 'privilege' | 'item';
      value: any;
    }>;
  }>;
  rewards: {
    points: number;
    experience: number;
    items: ObjectId[];
    privileges: string[];
    titles: string[];
    unlocks: ObjectId[];
  };
  tracking: {
    totalEarned: number;
    uniqueRecipients: number;
    lastAwarded: Date;
    averageTimeToEarn: number; // in days
    distribution: {
      bronze: number;
      silver: number;
      gold: number;
      platinum: number;
      diamond: number;
    };
    trends: Array<{
      date: Date;
      count: number;
      level: string;
    }>;
  };
  metadata: {
    createdBy: ObjectId;
    isActive: boolean;
    isVisible: boolean;
    isFeatured: boolean;
    displayOrder: number;
    tags: string[];
    version: string;
    changelog: Array<{
      version: string;
      changes: string[];
      date: Date;
      author: ObjectId;
    }>;
  };
  localization: {
    translations: Array<{
      language: string;
      name: string;
      description: string;
      levelTitles: {
        bronze: string;
        silver: string;
        gold: string;
        platinum: string;
        diamond: string;
      };
    }>;
  };
  analytics: {
    engagementImpact: number; // how much this badge increases engagement
    motivationScore: number; // 1-10 scale
    difficultyRating: number; // actual difficulty vs intended
    completionRate: number; // percentage of eligible users who earn it
    averageAttempts: number;
    dropoffPoints: Array<{
      stage: string;
      percentage: number;
    }>;
  };
  social: {
    shareCount: number;
    reactions: Array<{
      type: 'like' | 'love' | 'wow' | 'congrats';
      count: number;
    }>;
    comments: Array<{
      userId: ObjectId;
      message: string;
      createdAt: Date;
    }>;
  };
  validation: {
    requiresVerification: boolean;
    verificationMethod: 'automatic' | 'manual' | 'peer' | 'instructor';
    verificationCriteria: string[];
    appealable: boolean;
    fraudDetection: {
      enabled: boolean;
      rules: string[];
    };
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    retiredAt?: Date;
  };
}

const BadgeSchema = new Schema<IBadge>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['academic', 'engagement', 'collaboration', 'creativity', 'leadership', 'milestone', 'special'],
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['achievement', 'progress', 'completion', 'streak', 'social', 'custom'],
    required: true,
    index: true
  },
  icon: {
    url: { type: String, required: true },
    style: {
      type: String,
      enum: ['flat', '3d', 'minimal', 'detailed'],
      default: 'flat'
    },
    colors: [{ type: String }],
    shape: {
      type: String,
      enum: ['circle', 'shield', 'star', 'hexagon', 'square', 'diamond'],
      default: 'circle'
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert', 'master'],
    required: true,
    index: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['single', 'cumulative', 'streak', 'percentage', 'complex'],
      required: true
    },
    conditions: [{
      field: { type: String, required: true },
      operator: {
        type: String,
        enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'between'],
        required: true
      },
      value: { type: Schema.Types.Mixed, required: true },
      weight: { type: Number, default: 1 }
    }],
    threshold: { type: Number, required: true },
    timeframe: {
      type: {
        type: String,
        enum: ['session', 'daily', 'weekly', 'monthly', 'alltime'],
        default: 'alltime'
      },
      duration: { type: Number } // in specified timeframe units
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
    exclusions: [{ type: Schema.Types.ObjectId, ref: 'Badge' }]
  },
  levels: [{
    name: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      required: true
    },
    threshold: { type: Number, required: true },
    multiplier: { type: Number, default: 1 },
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    rewards: [{
      type: {
        type: String,
        enum: ['points', 'experience', 'title', 'privilege', 'item'],
        required: true
      },
      value: { type: Schema.Types.Mixed, required: true }
    }]
  }],
  rewards: {
    points: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    items: [{ type: Schema.Types.ObjectId, ref: 'GameItem' }],
    privileges: [{ type: String }],
    titles: [{ type: String }],
    unlocks: [{ type: Schema.Types.ObjectId, ref: 'Badge' }]
  },
  tracking: {
    totalEarned: { type: Number, default: 0 },
    uniqueRecipients: { type: Number, default: 0 },
    lastAwarded: { type: Date },
    averageTimeToEarn: { type: Number, default: 0 },
    distribution: {
      bronze: { type: Number, default: 0 },
      silver: { type: Number, default: 0 },
      gold: { type: Number, default: 0 },
      platinum: { type: Number, default: 0 },
      diamond: { type: Number, default: 0 }
    },
    trends: [{
      date: { type: Date, required: true },
      count: { type: Number, required: true },
      level: { type: String, required: true }
    }]
  },
  metadata: {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true, index: true },
    isVisible: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0 },
    tags: [{ type: String }],
    version: { type: String, default: '1.0.0' },
    changelog: [{
      version: { type: String, required: true },
      changes: [{ type: String }],
      date: { type: Date, default: Date.now },
      author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }]
  },
  localization: {
    translations: [{
      language: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      levelTitles: {
        bronze: { type: String, required: true },
        silver: { type: String, required: true },
        gold: { type: String, required: true },
        platinum: { type: String, required: true },
        diamond: { type: String, required: true }
      }
    }]
  },
  analytics: {
    engagementImpact: { type: Number, default: 0 },
    motivationScore: { type: Number, default: 5, min: 1, max: 10 },
    difficultyRating: { type: Number, default: 5, min: 1, max: 10 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 },
    averageAttempts: { type: Number, default: 1 },
    dropoffPoints: [{
      stage: { type: String, required: true },
      percentage: { type: Number, required: true }
    }]
  },
  social: {
    shareCount: { type: Number, default: 0 },
    reactions: [{
      type: {
        type: String,
        enum: ['like', 'love', 'wow', 'congrats'],
        required: true
      },
      count: { type: Number, default: 0 }
    }],
    comments: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      message: { type: String, required: true, maxlength: 500 },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  validation: {
    requiresVerification: { type: Boolean, default: false },
    verificationMethod: {
      type: String,
      enum: ['automatic', 'manual', 'peer', 'instructor'],
      default: 'automatic'
    },
    verificationCriteria: [{ type: String }],
    appealable: { type: Boolean, default: true },
    fraudDetection: {
      enabled: { type: Boolean, default: false },
      rules: [{ type: String }]
    }
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date },
    retiredAt: { type: Date }
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Indexes for efficient queries
BadgeSchema.index({ category: 1, difficulty: 1 });
BadgeSchema.index({ rarity: 1, 'metadata.isFeatured': 1 });
BadgeSchema.index({ 'metadata.isActive': 1, 'metadata.isVisible': 1 });
BadgeSchema.index({ 'tracking.totalEarned': -1 });
BadgeSchema.index({ 'metadata.tags': 1 });

// Instance methods
BadgeSchema.methods.checkEligibility = function(gameProfile: any): { eligible: boolean; progress: number; reason?: string } {
  // Check if already earned at maximum level
  const existingBadge = gameProfile.badges.find(
    (badge: any) => badge.badgeId.toString() === this._id.toString() && badge.level === 'diamond'
  );
  
  if (existingBadge) {
    return { eligible: false, progress: 100, reason: 'Already earned at maximum level' };
  }

  // Check prerequisites
  for (const prereqId of this.criteria.prerequisites) {
    const hasPrereq = gameProfile.badges.some(
      (badge: any) => badge.badgeId.toString() === prereqId.toString()
    );
    if (!hasPrereq) {
      return { eligible: false, progress: 0, reason: 'Missing prerequisite badges' };
    }
  }

  // Check exclusions
  for (const exclusionId of this.criteria.exclusions) {
    const hasExclusion = gameProfile.badges.some(
      (badge: any) => badge.badgeId.toString() === exclusionId.toString()
    );
    if (hasExclusion) {
      return { eligible: false, progress: 0, reason: 'Has exclusionary badge' };
    }
  }

  // Calculate progress based on criteria
  const progress = this.calculateProgress(gameProfile);
  
  return { 
    eligible: progress >= this.criteria.threshold, 
    progress: Math.min(progress, 100) 
  };
};

BadgeSchema.methods.calculateProgress = function(gameProfile: any): number {
  let totalScore = 0;
  let maxScore = 0;

  for (const condition of this.criteria.conditions) {
    const weight = condition.weight || 1;
    maxScore += weight;

    let conditionMet = false;
    let fieldValue = this.getFieldValue(gameProfile, condition.field);

    switch (condition.operator) {
      case 'eq':
        conditionMet = fieldValue === condition.value;
        break;
      case 'ne':
        conditionMet = fieldValue !== condition.value;
        break;
      case 'gt':
        conditionMet = fieldValue > condition.value;
        break;
      case 'gte':
        conditionMet = fieldValue >= condition.value;
        break;
      case 'lt':
        conditionMet = fieldValue < condition.value;
        break;
      case 'lte':
        conditionMet = fieldValue <= condition.value;
        break;
      case 'in':
        conditionMet = Array.isArray(condition.value) && condition.value.includes(fieldValue);
        break;
      case 'between':
        conditionMet = Array.isArray(condition.value) && 
                     fieldValue >= condition.value[0] && 
                     fieldValue <= condition.value[1];
        break;
    }

    if (conditionMet) {
      totalScore += weight;
    } else if (condition.operator === 'gte' || condition.operator === 'gt') {
      // Partial credit for progress towards numeric goals
      const progressRatio = Math.min(fieldValue / condition.value, 1);
      totalScore += weight * progressRatio;
    }
  }

  return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
};

BadgeSchema.methods.getFieldValue = function(gameProfile: any, fieldPath: string): any {
  const paths = fieldPath.split('.');
  let value = gameProfile;

  for (const path of paths) {
    if (value && typeof value === 'object' && path in value) {
      value = value[path];
    } else {
      return 0; // Default value for missing fields
    }
  }

  return value;
};

BadgeSchema.methods.determineBadgeLevel = function(progress: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
  // Sort levels by threshold in descending order
  const sortedLevels = [...this.levels].sort((a, b) => b.threshold - a.threshold);
  
  for (const level of sortedLevels) {
    if (progress >= level.threshold) {
      return level.name;
    }
  }
  
  return 'bronze'; // Default to bronze if no thresholds met
};

BadgeSchema.methods.getLevelInfo = function(level: string): any {
  return this.levels.find((l: any) => l.name === level);
};

BadgeSchema.methods.recordEarning = function(level: string = 'bronze'): Promise<IBadge> {
  this.tracking.totalEarned += 1;
  this.tracking.lastAwarded = new Date();
  this.tracking.distribution[level as keyof typeof this.tracking.distribution] += 1;

  // Add to trends
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTrend = this.tracking.trends.find(
    (trend: any) => trend.date.getTime() === today.getTime() && trend.level === level
  );
  
  if (todayTrend) {
    todayTrend.count += 1;
  } else {
    this.tracking.trends.push({
      date: today,
      count: 1,
      level
    });
  }

  // Keep only last 90 days of trends
  if (this.tracking.trends.length > 90) {
    this.tracking.trends = this.tracking.trends.slice(-90);
  }

  this.timestamps.updatedAt = new Date();
  return this.save();
};

BadgeSchema.methods.addComment = function(userId: ObjectId, message: string): Promise<IBadge> {
  this.social.comments.push({
    userId,
    message,
    createdAt: new Date()
  });

  // Keep only last 50 comments
  if (this.social.comments.length > 50) {
    this.social.comments = this.social.comments.slice(-50);
  }

  this.timestamps.updatedAt = new Date();
  return this.save();
};

BadgeSchema.methods.addReaction = function(type: 'like' | 'love' | 'wow' | 'congrats'): Promise<IBadge> {
  let reaction = this.social.reactions.find((r: any) => r.type === type);
  
  if (!reaction) {
    reaction = { type, count: 0 };
    this.social.reactions.push(reaction);
  }
  
  reaction.count += 1;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

BadgeSchema.methods.updateAnalytics = function(analyticsData: any): Promise<IBadge> {
  Object.assign(this.analytics, analyticsData);
  this.timestamps.updatedAt = new Date();
  return this.save();
};

BadgeSchema.methods.retire = function(): Promise<IBadge> {
  this.metadata.isActive = false;
  this.timestamps.retiredAt = new Date();
  this.timestamps.updatedAt = new Date();
  return this.save();
};

BadgeSchema.methods.createVersion = function(changes: string[], author: ObjectId): Promise<IBadge> {
  const versionParts = this.metadata.version.split('.');
  const patch = parseInt(versionParts[2]) + 1;
  const newVersion = `${versionParts[0]}.${versionParts[1]}.${patch}`;

  this.metadata.changelog.push({
    version: newVersion,
    changes,
    date: new Date(),
    author
  });

  this.metadata.version = newVersion;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

// Static methods
BadgeSchema.statics.getByCategory = function(category: string, includeInactive: boolean = false) {
  const query: any = { category };
  
  if (!includeInactive) {
    query['metadata.isActive'] = true;
    query['metadata.isVisible'] = true;
  }
  
  return this.find(query)
    .sort({ 'metadata.displayOrder': 1, 'tracking.totalEarned': -1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

BadgeSchema.statics.getFeatured = function() {
  return this.find({ 
    'metadata.isFeatured': true, 
    'metadata.isActive': true,
    'metadata.isVisible': true 
  })
    .sort({ 'metadata.displayOrder': 1 })
    .limit(10)
    .populate('metadata.createdBy', 'username firstName lastName');
};

BadgeSchema.statics.getMostPopular = function(limit: number = 10) {
  return this.find({ 
    'metadata.isActive': true,
    'metadata.isVisible': true 
  })
    .sort({ 'tracking.totalEarned': -1 })
    .limit(limit)
    .populate('metadata.createdBy', 'username firstName lastName');
};

BadgeSchema.statics.searchBadges = function(searchTerm: string, filters: any = {}) {
  const query: any = {
    'metadata.isActive': true,
    'metadata.isVisible': true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { 'metadata.tags': { $regex: searchTerm, $options: 'i' } }
    ]
  };

  if (filters.category) query.category = filters.category;
  if (filters.rarity) query.rarity = filters.rarity;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.type) query.type = filters.type;

  return this.find(query)
    .sort({ 'tracking.totalEarned': -1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

BadgeSchema.statics.getEligibleBadges = function(gameProfile: any) {
  return this.find({ 
    'metadata.isActive': true,
    'metadata.isVisible': true 
  }).then((badges: IBadge[]) => {
    return badges.filter(badge => {
      const eligibility = badge.checkEligibility(gameProfile);
      return eligibility.eligible;
    });
  });
};

BadgeSchema.statics.getBadgesByRarity = function(rarity: string) {
  return this.find({ 
    rarity,
    'metadata.isActive': true,
    'metadata.isVisible': true 
  })
    .sort({ 'metadata.displayOrder': 1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

BadgeSchema.statics.getRecentlyEarned = function(limit: number = 20) {
  return this.find({ 
    'metadata.isActive': true,
    'tracking.lastAwarded': { $exists: true }
  })
    .sort({ 'tracking.lastAwarded': -1 })
    .limit(limit)
    .populate('metadata.createdBy', 'username firstName lastName');
};

BadgeSchema.statics.getBadgeStatistics = function() {
  return this.aggregate([
    {
      $match: { 'metadata.isActive': true }
    },
    {
      $group: {
        _id: null,
        totalBadges: { $sum: 1 },
        totalAwarded: { $sum: '$tracking.totalEarned' },
        byCategory: {
          $push: {
            category: '$category',
            count: '$tracking.totalEarned'
          }
        },
        byRarity: {
          $push: {
            rarity: '$rarity',
            count: '$tracking.totalEarned'
          }
        },
        byDifficulty: {
          $push: {
            difficulty: '$difficulty',
            count: '$tracking.totalEarned'
          }
        }
      }
    }
  ]);
};

// Pre-save middleware
BadgeSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  
  // Ensure levels are sorted by threshold
  this.levels.sort((a: any, b: any) => a.threshold - b.threshold);
  
  next();
});

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);