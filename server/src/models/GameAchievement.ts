import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IGameAchievement extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  type: 'milestone' | 'progressive' | 'challenge' | 'secret' | 'time-limited' | 'collaborative';
  category: 'academic' | 'engagement' | 'social' | 'creative' | 'leadership' | 'persistence' | 'excellence';
  icon: {
    url: string;
    animation?: 'none' | 'bounce' | 'pulse' | 'glow' | 'rotate';
    effects: string[];
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'legendary';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  requirements: {
    type: 'single' | 'multiple' | 'sequence' | 'any_of' | 'all_of';
    conditions: Array<{
      id: string;
      description: string;
      field: string;
      operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'between' | 'regex';
      value: any;
      timeframe?: {
        type: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
        duration: number;
        relative?: boolean; // true for "within X days of each other"
      };
      weight: number;
      optional: boolean;
    }>;
    minimumConditions?: number; // for "any_of" type
    sequence?: string[]; // order of condition IDs for "sequence" type
    dependencies: ObjectId[]; // prerequisite achievements
    exclusions: ObjectId[]; // mutually exclusive achievements
  };
  milestones: Array<{
    name: string;
    description: string;
    threshold: number;
    progressField: string;
    icon: string;
    rewards: {
      points: number;
      experience: number;
      items: ObjectId[];
      badges: ObjectId[];
      titles: string[];
      privileges: string[];
    };
    unlocks: ObjectId[];
  }>;
  rewards: {
    immediate: {
      points: number;
      experience: number;
      items: ObjectId[];
      badges: ObjectId[];
      titles: string[];
      privileges: string[];
      currency: number;
    };
    progressive: Array<{
      threshold: number;
      points: number;
      experience: number;
      items: ObjectId[];
    }>;
    special: Array<{
      type: 'streak_bonus' | 'perfect_score' | 'speed_bonus' | 'collaboration_bonus';
      multiplier: number;
      condition: string;
    }>;
  };
  visibility: {
    type: 'public' | 'hidden' | 'secret' | 'unlockable';
    unlockConditions?: Array<{
      type: 'achievement' | 'level' | 'points' | 'time_played';
      value: any;
    }>;
    hints: Array<{
      threshold: number; // progress percentage when hint is revealed
      message: string;
      revealed: boolean;
    }>;
  };
  timeConstraints: {
    availableFrom?: Date;
    availableUntil?: Date;
    cooldownPeriod?: number; // days before can be attempted again
    maxAttempts?: number;
    timeLimit?: number; // minutes to complete once started
  };
  tracking: {
    totalCompletions: number;
    uniqueCompleters: number;
    averageCompletionTime: number; // in minutes
    fastestCompletion: number; // in minutes
    slowestCompletion: number; // in minutes
    completionRate: number; // percentage of users who complete once started
    abandonmentRate: number; // percentage who start but don't complete
    retryRate: number; // percentage who attempt multiple times
    popularityScore: number; // calculated based on attempts and completions
    difficultyRating: number; // 1-10 based on actual completion data
    lastCompleted: Date;
    monthlyCompletions: Array<{
      month: string;
      count: number;
    }>;
  };
  social: {
    isCollaborative: boolean;
    minTeamSize?: number;
    maxTeamSize?: number;
    allowsSpectators: boolean;
    shareOnCompletion: boolean;
    celebrationMessage: string;
    leaderboard: {
      enabled: boolean;
      type: 'speed' | 'score' | 'creativity' | 'efficiency';
      entries: Array<{
        userId: ObjectId;
        teamId?: ObjectId;
        score: number;
        completedAt: Date;
        metadata: any;
      }>;
    };
    reactions: Array<{
      type: 'amazing' | 'inspiring' | 'challenging' | 'fun' | 'frustrating';
      count: number;
    }>;
    comments: Array<{
      userId: ObjectId;
      message: string;
      rating: number; // 1-5 stars
      helpful: number; // helpful votes
      createdAt: Date;
    }>;
  };
  progression: {
    stages: Array<{
      name: string;
      description: string;
      requirements: any[];
      order: number;
      isOptional: boolean;
      estimatedTime: number; // minutes
      hints: string[];
    }>;
    currentStage: number;
    allowSkipping: boolean;
    progressSave: boolean; // can users save progress and resume later
  };
  analytics: {
    engagementMetrics: {
      averageSessionTime: number;
      completionSessions: number;
      dropoffPoints: Array<{
        stage: string;
        percentage: number;
        commonReasons: string[];
      }>;
    };
    learningOutcomes: {
      skillsAssessed: string[];
      improvementMeasured: boolean;
      knowledgeRetention: number; // percentage
      transferability: number; // how well skills transfer to other areas
    };
    motivationalImpact: {
      engagementBoost: number; // percentage increase in engagement
      persistenceImprovement: number; // reduced quit rate
      confidenceGain: number; // self-reported confidence increase
      communityBuilding: number; // social interaction increase
    };
  };
  customization: {
    allowPersonalization: boolean;
    customizableElements: string[]; // icon, colors, name, etc.
    themes: Array<{
      name: string;
      description: string;
      assets: any;
    }>;
    variants: Array<{
      name: string;
      description: string;
      modifiedRequirements: any[];
      modifiedRewards: any;
    }>;
  };
  metadata: {
    version: string;
    createdBy: ObjectId;
    approvedBy?: ObjectId;
    isActive: boolean;
    isFeatured: boolean;
    isPremium: boolean;
    tags: string[];
    keywords: string[];
    estimatedDuration: number; // minutes
    skillLevel: string[];
    subjectAreas: string[];
    changelog: Array<{
      version: string;
      changes: string[];
      date: Date;
      author: ObjectId;
    }>;
  };
  localization: {
    defaultLanguage: string;
    supportedLanguages: string[];
    translations: Array<{
      language: string;
      name: string;
      description: string;
      hints: string[];
      celebrationMessage: string;
      stageDescriptions: string[];
    }>;
  };
  validation: {
    autoValidation: boolean;
    validationRules: string[];
    manualReview: boolean;
    reviewers: ObjectId[];
    appealProcess: boolean;
    evidenceRequired: Array<{
      type: 'screenshot' | 'video' | 'file' | 'text' | 'peer_confirmation';
      description: string;
      required: boolean;
    }>;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    lastModified: Date;
    archivedAt?: Date;
  };
}

const GameAchievementSchema = new Schema<IGameAchievement>({
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
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['milestone', 'progressive', 'challenge', 'secret', 'time-limited', 'collaborative'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['academic', 'engagement', 'social', 'creative', 'leadership', 'persistence', 'excellence'],
    required: true,
    index: true
  },
  icon: {
    url: { type: String, required: true },
    animation: {
      type: String,
      enum: ['none', 'bounce', 'pulse', 'glow', 'rotate'],
      default: 'none'
    },
    effects: [{ type: String }]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert', 'legendary'],
    required: true,
    index: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'],
    required: true,
    index: true
  },
  requirements: {
    type: {
      type: String,
      enum: ['single', 'multiple', 'sequence', 'any_of', 'all_of'],
      required: true
    },
    conditions: [{
      id: { type: String, required: true },
      description: { type: String, required: true },
      field: { type: String, required: true },
      operator: {
        type: String,
        enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'contains', 'between', 'regex'],
        required: true
      },
      value: { type: Schema.Types.Mixed, required: true },
      timeframe: {
        type: {
          type: String,
          enum: ['minutes', 'hours', 'days', 'weeks', 'months']
        },
        duration: { type: Number },
        relative: { type: Boolean, default: false }
      },
      weight: { type: Number, default: 1 },
      optional: { type: Boolean, default: false }
    }],
    minimumConditions: { type: Number },
    sequence: [{ type: String }],
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'GameAchievement' }],
    exclusions: [{ type: Schema.Types.ObjectId, ref: 'GameAchievement' }]
  },
  milestones: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    threshold: { type: Number, required: true },
    progressField: { type: String, required: true },
    icon: { type: String, required: true },
    rewards: {
      points: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      items: [{ type: Schema.Types.ObjectId, ref: 'GameItem' }],
      badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
      titles: [{ type: String }],
      privileges: [{ type: String }]
    },
    unlocks: [{ type: Schema.Types.ObjectId, ref: 'GameAchievement' }]
  }],
  rewards: {
    immediate: {
      points: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      items: [{ type: Schema.Types.ObjectId, ref: 'GameItem' }],
      badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
      titles: [{ type: String }],
      privileges: [{ type: String }],
      currency: { type: Number, default: 0 }
    },
    progressive: [{
      threshold: { type: Number, required: true },
      points: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      items: [{ type: Schema.Types.ObjectId, ref: 'GameItem' }]
    }],
    special: [{
      type: {
        type: String,
        enum: ['streak_bonus', 'perfect_score', 'speed_bonus', 'collaboration_bonus'],
        required: true
      },
      multiplier: { type: Number, required: true },
      condition: { type: String, required: true }
    }]
  },
  visibility: {
    type: {
      type: String,
      enum: ['public', 'hidden', 'secret', 'unlockable'],
      default: 'public',
      index: true
    },
    unlockConditions: [{
      type: {
        type: String,
        enum: ['achievement', 'level', 'points', 'time_played'],
        required: true
      },
      value: { type: Schema.Types.Mixed, required: true }
    }],
    hints: [{
      threshold: { type: Number, required: true },
      message: { type: String, required: true },
      revealed: { type: Boolean, default: false }
    }]
  },
  timeConstraints: {
    availableFrom: { type: Date },
    availableUntil: { type: Date },
    cooldownPeriod: { type: Number }, // days
    maxAttempts: { type: Number },
    timeLimit: { type: Number } // minutes
  },
  tracking: {
    totalCompletions: { type: Number, default: 0 },
    uniqueCompleters: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 },
    fastestCompletion: { type: Number, default: 0 },
    slowestCompletion: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    abandonmentRate: { type: Number, default: 0 },
    retryRate: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
    difficultyRating: { type: Number, default: 5 },
    lastCompleted: { type: Date },
    monthlyCompletions: [{
      month: { type: String, required: true },
      count: { type: Number, required: true }
    }]
  },
  social: {
    isCollaborative: { type: Boolean, default: false },
    minTeamSize: { type: Number },
    maxTeamSize: { type: Number },
    allowsSpectators: { type: Boolean, default: false },
    shareOnCompletion: { type: Boolean, default: true },
    celebrationMessage: { type: String, default: 'Congratulations on your achievement!' },
    leaderboard: {
      enabled: { type: Boolean, default: false },
      type: {
        type: String,
        enum: ['speed', 'score', 'creativity', 'efficiency'],
        default: 'score'
      },
      entries: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
        score: { type: Number, required: true },
        completedAt: { type: Date, required: true },
        metadata: { type: Schema.Types.Mixed }
      }]
    },
    reactions: [{
      type: {
        type: String,
        enum: ['amazing', 'inspiring', 'challenging', 'fun', 'frustrating'],
        required: true
      },
      count: { type: Number, default: 0 }
    }],
    comments: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      message: { type: String, required: true, maxlength: 1000 },
      rating: { type: Number, min: 1, max: 5 },
      helpful: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  progression: {
    stages: [{
      name: { type: String, required: true },
      description: { type: String, required: true },
      requirements: [{ type: Schema.Types.Mixed }],
      order: { type: Number, required: true },
      isOptional: { type: Boolean, default: false },
      estimatedTime: { type: Number, default: 0 },
      hints: [{ type: String }]
    }],
    currentStage: { type: Number, default: 0 },
    allowSkipping: { type: Boolean, default: false },
    progressSave: { type: Boolean, default: true }
  },
  analytics: {
    engagementMetrics: {
      averageSessionTime: { type: Number, default: 0 },
      completionSessions: { type: Number, default: 0 },
      dropoffPoints: [{
        stage: { type: String, required: true },
        percentage: { type: Number, required: true },
        commonReasons: [{ type: String }]
      }]
    },
    learningOutcomes: {
      skillsAssessed: [{ type: String }],
      improvementMeasured: { type: Boolean, default: false },
      knowledgeRetention: { type: Number, default: 0 },
      transferability: { type: Number, default: 0 }
    },
    motivationalImpact: {
      engagementBoost: { type: Number, default: 0 },
      persistenceImprovement: { type: Number, default: 0 },
      confidenceGain: { type: Number, default: 0 },
      communityBuilding: { type: Number, default: 0 }
    }
  },
  customization: {
    allowPersonalization: { type: Boolean, default: false },
    customizableElements: [{ type: String }],
    themes: [{
      name: { type: String, required: true },
      description: { type: String, required: true },
      assets: { type: Schema.Types.Mixed }
    }],
    variants: [{
      name: { type: String, required: true },
      description: { type: String, required: true },
      modifiedRequirements: [{ type: Schema.Types.Mixed }],
      modifiedRewards: { type: Schema.Types.Mixed }
    }]
  },
  metadata: {
    version: { type: String, default: '1.0.0' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPremium: { type: Boolean, default: false },
    tags: [{ type: String, index: true }],
    keywords: [{ type: String }],
    estimatedDuration: { type: Number, default: 0 },
    skillLevel: [{ type: String }],
    subjectAreas: [{ type: String }],
    changelog: [{
      version: { type: String, required: true },
      changes: [{ type: String }],
      date: { type: Date, default: Date.now },
      author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }]
  },
  localization: {
    defaultLanguage: { type: String, default: 'en' },
    supportedLanguages: [{ type: String }],
    translations: [{
      language: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      hints: [{ type: String }],
      celebrationMessage: { type: String, required: true },
      stageDescriptions: [{ type: String }]
    }]
  },
  validation: {
    autoValidation: { type: Boolean, default: true },
    validationRules: [{ type: String }],
    manualReview: { type: Boolean, default: false },
    reviewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    appealProcess: { type: Boolean, default: true },
    evidenceRequired: [{
      type: {
        type: String,
        enum: ['screenshot', 'video', 'file', 'text', 'peer_confirmation'],
        required: true
      },
      description: { type: String, required: true },
      required: { type: Boolean, default: false }
    }]
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date },
    lastModified: { type: Date, default: Date.now },
    archivedAt: { type: Date }
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Indexes for efficient queries
GameAchievementSchema.index({ type: 1, category: 1 });
GameAchievementSchema.index({ difficulty: 1, rarity: 1 });
GameAchievementSchema.index({ 'metadata.isActive': 1, 'visibility.type': 1 });
GameAchievementSchema.index({ 'tracking.popularityScore': -1 });
GameAchievementSchema.index({ 'tracking.totalCompletions': -1 });
GameAchievementSchema.index({ 'metadata.tags': 1 });
GameAchievementSchema.index({ 'timeConstraints.availableFrom': 1, 'timeConstraints.availableUntil': 1 });

// Instance methods
GameAchievementSchema.methods.checkEligibility = function(gameProfile: any, currentTime: Date = new Date()): { 
  eligible: boolean; 
  progress: number; 
  reason?: string;
  blockers?: string[];
  nextMilestone?: any;
} {
  const blockers: string[] = [];

  // Check if achievement is active
  if (!this.metadata.isActive) {
    return { eligible: false, progress: 0, reason: 'Achievement is not active', blockers: ['inactive'] };
  }

  // Check time constraints
  if (this.timeConstraints.availableFrom && currentTime < this.timeConstraints.availableFrom) {
    blockers.push('not_yet_available');
  }
  
  if (this.timeConstraints.availableUntil && currentTime > this.timeConstraints.availableUntil) {
    blockers.push('expired');
  }

  // Check if already completed
  const existingAchievement = gameProfile.achievements.find(
    (achievement: any) => achievement.achievementId.toString() === this._id.toString() && achievement.completed
  );
  
  if (existingAchievement) {
    return { eligible: false, progress: 100, reason: 'Already completed', blockers: ['completed'] };
  }

  // Check cooldown period
  const lastAttempt = gameProfile.achievements.find(
    (achievement: any) => achievement.achievementId.toString() === this._id.toString()
  );
  
  if (lastAttempt && this.timeConstraints.cooldownPeriod) {
    const cooldownEnd = new Date(lastAttempt.lastAttemptDate);
    cooldownEnd.setDate(cooldownEnd.getDate() + this.timeConstraints.cooldownPeriod);
    
    if (currentTime < cooldownEnd) {
      blockers.push('cooldown_active');
    }
  }

  // Check max attempts
  if (this.timeConstraints.maxAttempts && lastAttempt && lastAttempt.attempts >= this.timeConstraints.maxAttempts) {
    blockers.push('max_attempts_reached');
  }

  // Check dependencies
  for (const depId of this.requirements.dependencies) {
    const hasDependency = gameProfile.achievements.some(
      (achievement: any) => achievement.achievementId.toString() === depId.toString() && achievement.completed
    );
    if (!hasDependency) {
      blockers.push('missing_dependencies');
    }
  }

  // Check exclusions
  for (const exclusionId of this.requirements.exclusions) {
    const hasExclusion = gameProfile.achievements.some(
      (achievement: any) => achievement.achievementId.toString() === exclusionId.toString() && achievement.completed
    );
    if (hasExclusion) {
      blockers.push('exclusionary_achievement_completed');
    }
  }

  // Check visibility unlock conditions
  if (this.visibility.type === 'unlockable' && this.visibility.unlockConditions) {
    for (const condition of this.visibility.unlockConditions) {
      if (!this.checkUnlockCondition(gameProfile, condition)) {
        blockers.push('visibility_locked');
      }
    }
  }

  if (blockers.length > 0) {
    return { eligible: false, progress: 0, reason: 'Requirements not met', blockers };
  }

  // Calculate progress
  const { progress, nextMilestone } = this.calculateProgress(gameProfile);
  
  return { 
    eligible: progress >= 100, 
    progress: Math.min(progress, 100),
    nextMilestone
  };
};

GameAchievementSchema.methods.calculateProgress = function(gameProfile: any): { progress: number; nextMilestone?: any } {
  let totalProgress = 0;
  let completedConditions = 0;
  let totalWeight = 0;
  let weightedProgress = 0;

  for (const condition of this.requirements.conditions) {
    const weight = condition.weight || 1;
    totalWeight += weight;

    const conditionProgress = this.evaluateCondition(gameProfile, condition);
    
    if (conditionProgress >= 100) {
      completedConditions++;
      weightedProgress += weight;
    } else if (!condition.optional) {
      // Partial credit for required conditions
      weightedProgress += (weight * conditionProgress / 100);
    }
  }

  switch (this.requirements.type) {
    case 'single':
      totalProgress = this.requirements.conditions.length > 0 ? 
        this.evaluateCondition(gameProfile, this.requirements.conditions[0]) : 0;
      break;
      
    case 'all_of':
      totalProgress = totalWeight > 0 ? (weightedProgress / totalWeight) * 100 : 0;
      break;
      
    case 'any_of':
      const minRequired = this.requirements.minimumConditions || 1;
      totalProgress = Math.min((completedConditions / minRequired) * 100, 100);
      break;
      
    case 'sequence':
      totalProgress = this.calculateSequenceProgress(gameProfile);
      break;
      
    case 'multiple':
      const requiredConditions = this.requirements.conditions.filter(c => !c.optional).length;
      const optionalConditions = this.requirements.conditions.filter(c => c.optional).length;
      const completedRequired = this.requirements.conditions.filter(c => 
        !c.optional && this.evaluateCondition(gameProfile, c) >= 100
      ).length;
      
      if (requiredConditions > 0) {
        totalProgress = (completedRequired / requiredConditions) * 80; // 80% for required
        // Add bonus for optional conditions
        const completedOptional = completedConditions - completedRequired;
        if (optionalConditions > 0) {
          totalProgress += (completedOptional / optionalConditions) * 20; // 20% for optional
        }
      }
      break;
  }

  // Find next milestone
  const currentProgressValue = this.getProgressValue(gameProfile);
  const nextMilestone = this.milestones
    .filter(m => currentProgressValue < m.threshold)
    .sort((a, b) => a.threshold - b.threshold)[0];

  return { progress: Math.min(totalProgress, 100), nextMilestone };
};

GameAchievementSchema.methods.evaluateCondition = function(gameProfile: any, condition: any): number {
  const fieldValue = this.getFieldValue(gameProfile, condition.field);
  let progress = 0;

  switch (condition.operator) {
    case 'eq':
      progress = fieldValue === condition.value ? 100 : 0;
      break;
    case 'ne':
      progress = fieldValue !== condition.value ? 100 : 0;
      break;
    case 'gt':
      progress = fieldValue > condition.value ? 100 : Math.min((fieldValue / condition.value) * 100, 99);
      break;
    case 'gte':
      progress = fieldValue >= condition.value ? 100 : (fieldValue / condition.value) * 100;
      break;
    case 'lt':
      progress = fieldValue < condition.value ? 100 : 0;
      break;
    case 'lte':
      progress = fieldValue <= condition.value ? 100 : 0;
      break;
    case 'in':
      progress = Array.isArray(condition.value) && condition.value.includes(fieldValue) ? 100 : 0;
      break;
    case 'contains':
      if (Array.isArray(fieldValue)) {
        const matches = condition.value.filter((v: any) => fieldValue.includes(v));
        progress = (matches.length / condition.value.length) * 100;
      } else {
        progress = fieldValue.toString().includes(condition.value.toString()) ? 100 : 0;
      }
      break;
    case 'between':
      if (Array.isArray(condition.value) && condition.value.length === 2) {
        if (fieldValue >= condition.value[0] && fieldValue <= condition.value[1]) {
          progress = 100;
        } else if (fieldValue < condition.value[0]) {
          progress = (fieldValue / condition.value[0]) * 50;
        } else {
          progress = 50 + ((condition.value[1] - fieldValue) / (condition.value[1] - condition.value[0])) * 50;
        }
      }
      break;
    case 'regex':
      const regex = new RegExp(condition.value);
      progress = regex.test(fieldValue.toString()) ? 100 : 0;
      break;
  }

  return Math.max(0, Math.min(progress, 100));
};

GameAchievementSchema.methods.calculateSequenceProgress = function(gameProfile: any): number {
  if (!this.requirements.sequence || this.requirements.sequence.length === 0) {
    return 0;
  }

  let completedInSequence = 0;
  
  for (let i = 0; i < this.requirements.sequence.length; i++) {
    const conditionId = this.requirements.sequence[i];
    const condition = this.requirements.conditions.find(c => c.id === conditionId);
    
    if (condition && this.evaluateCondition(gameProfile, condition) >= 100) {
      completedInSequence = i + 1;
    } else {
      break; // Sequence broken
    }
  }

  return (completedInSequence / this.requirements.sequence.length) * 100;
};

GameAchievementSchema.methods.getFieldValue = function(gameProfile: any, fieldPath: string): any {
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

GameAchievementSchema.methods.getProgressValue = function(gameProfile: any): number {
  // Get the primary progress field value
  const primaryCondition = this.requirements.conditions[0];
  if (primaryCondition) {
    return this.getFieldValue(gameProfile, primaryCondition.field);
  }
  return 0;
};

GameAchievementSchema.methods.checkUnlockCondition = function(gameProfile: any, condition: any): boolean {
  switch (condition.type) {
    case 'achievement':
      return gameProfile.achievements.some(
        (ach: any) => ach.achievementId.toString() === condition.value.toString() && ach.completed
      );
    case 'level':
      return gameProfile.level.current >= condition.value;
    case 'points':
      return gameProfile.points.total >= condition.value;
    case 'time_played':
      return gameProfile.statistics.timeSpent.total >= condition.value;
    default:
      return false;
  }
};

GameAchievementSchema.methods.recordCompletion = function(userId: ObjectId, completionData: any = {}): Promise<IGameAchievement> {
  this.tracking.totalCompletions += 1;
  this.tracking.lastCompleted = new Date();

  // Update completion time statistics
  if (completionData.completionTime) {
    const currentAvg = this.tracking.averageCompletionTime;
    const totalCompletions = this.tracking.totalCompletions;
    
    this.tracking.averageCompletionTime = 
      ((currentAvg * (totalCompletions - 1)) + completionData.completionTime) / totalCompletions;

    if (this.tracking.fastestCompletion === 0 || completionData.completionTime < this.tracking.fastestCompletion) {
      this.tracking.fastestCompletion = completionData.completionTime;
    }

    if (completionData.completionTime > this.tracking.slowestCompletion) {
      this.tracking.slowestCompletion = completionData.completionTime;
    }
  }

  // Update leaderboard if enabled
  if (this.social.leaderboard.enabled && completionData.score !== undefined) {
    this.social.leaderboard.entries.push({
      userId,
      teamId: completionData.teamId,
      score: completionData.score,
      completedAt: new Date(),
      metadata: completionData.metadata || {}
    });

    // Keep only top 100 entries
    this.social.leaderboard.entries.sort((a, b) => b.score - a.score);
    if (this.social.leaderboard.entries.length > 100) {
      this.social.leaderboard.entries = this.social.leaderboard.entries.slice(0, 100);
    }
  }

  // Update monthly completions
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  let monthlyCompletion = this.tracking.monthlyCompletions.find(mc => mc.month === currentMonth);
  
  if (!monthlyCompletion) {
    monthlyCompletion = { month: currentMonth, count: 0 };
    this.tracking.monthlyCompletions.push(monthlyCompletion);
  }
  
  monthlyCompletion.count += 1;

  // Keep only last 12 months
  if (this.tracking.monthlyCompletions.length > 12) {
    this.tracking.monthlyCompletions.sort((a, b) => a.month.localeCompare(b.month));
    this.tracking.monthlyCompletions = this.tracking.monthlyCompletions.slice(-12);
  }

  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameAchievementSchema.methods.addComment = function(userId: ObjectId, message: string, rating?: number): Promise<IGameAchievement> {
  this.social.comments.push({
    userId,
    message,
    rating: rating || 0,
    helpful: 0,
    createdAt: new Date()
  });

  // Keep only last 100 comments
  if (this.social.comments.length > 100) {
    this.social.comments = this.social.comments.slice(-100);
  }

  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameAchievementSchema.methods.addReaction = function(type: string): Promise<IGameAchievement> {
  let reaction = this.social.reactions.find((r: any) => r.type === type);
  
  if (!reaction) {
    reaction = { type, count: 0 };
    this.social.reactions.push(reaction);
  }
  
  reaction.count += 1;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameAchievementSchema.methods.updateAnalytics = function(analyticsData: any): Promise<IGameAchievement> {
  Object.assign(this.analytics, analyticsData);
  this.timestamps.updatedAt = new Date();
  return this.save();
};

// Static methods
GameAchievementSchema.statics.getByCategory = function(category: string, includeInactive: boolean = false) {
  const query: any = { category };
  
  if (!includeInactive) {
    query['metadata.isActive'] = true;
  }
  
  return this.find(query)
    .sort({ 'tracking.popularityScore': -1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

GameAchievementSchema.statics.getFeatured = function() {
  return this.find({ 
    'metadata.isFeatured': true, 
    'metadata.isActive': true,
    'visibility.type': { $in: ['public', 'unlockable'] }
  })
    .sort({ 'tracking.popularityScore': -1 })
    .limit(10)
    .populate('metadata.createdBy', 'username firstName lastName');
};

GameAchievementSchema.statics.getAvailableAchievements = function(gameProfile: any) {
  const currentTime = new Date();
  
  return this.find({ 
    'metadata.isActive': true,
    'visibility.type': { $in: ['public', 'unlockable'] },
    $or: [
      { 'timeConstraints.availableFrom': { $exists: false } },
      { 'timeConstraints.availableFrom': { $lte: currentTime } }
    ],
    $or: [
      { 'timeConstraints.availableUntil': { $exists: false } },
      { 'timeConstraints.availableUntil': { $gte: currentTime } }
    ]
  }).then((achievements: IGameAchievement[]) => {
    return achievements.filter(achievement => {
      const eligibility = achievement.checkEligibility(gameProfile, currentTime);
      return eligibility.eligible || eligibility.progress > 0;
    });
  });
};

GameAchievementSchema.statics.searchAchievements = function(searchTerm: string, filters: any = {}) {
  const query: any = {
    'metadata.isActive': true,
    'visibility.type': { $in: ['public', 'unlockable'] },
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { 'metadata.tags': { $regex: searchTerm, $options: 'i' } },
      { 'metadata.keywords': { $regex: searchTerm, $options: 'i' } }
    ]
  };

  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.rarity) query.rarity = filters.rarity;
  if (filters.type) query.type = filters.type;

  return this.find(query)
    .sort({ 'tracking.popularityScore': -1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

// Pre-save middleware
GameAchievementSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  this.timestamps.lastModified = new Date();
  
  // Sort milestones by threshold
  this.milestones.sort((a: any, b: any) => a.threshold - b.threshold);
  
  // Sort progression stages by order
  this.progression.stages.sort((a: any, b: any) => a.order - b.order);
  
  next();
});

export const GameAchievement = mongoose.model<IGameAchievement>('GameAchievement', GameAchievementSchema);