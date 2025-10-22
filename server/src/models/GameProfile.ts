import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IGameProfile extends Document {
  _id: ObjectId;
  userId: ObjectId;
  displayName: string;
  avatar: {
    type: 'default' | 'uploaded' | 'generated';
    url: string;
    customization: {
      backgroundColor: string;
      accessories: string[];
      theme: string;
    };
  };
  level: {
    current: number;
    experience: number;
    experienceToNext: number;
    title: string;
    benefits: string[];
    unlockedAt: Date;
  };
  points: {
    total: number;
    available: number;
    lifetime: number;
    breakdown: {
      assignments: number;
      activities: number;
      collaboration: number;
      achievements: number;
      bonus: number;
      penalties: number;
    };
  };
  badges: Array<{
    badgeId: ObjectId;
    earnedAt: Date;
    level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    progress: number;
    displayed: boolean;
    category: string;
    metadata: {
      assignmentId?: ObjectId;
      activityId?: ObjectId;
      challengeId?: ObjectId;
      streakCount?: number;
      achievementValue?: number;
    };
  }>;
  achievements: Array<{
    achievementId: ObjectId;
    unlockedAt: Date;
    progress: number;
    completed: boolean;
    tier: number;
    rewards: Array<{
      type: 'points' | 'badge' | 'title' | 'privilege' | 'item';
      value: any;
      claimed: boolean;
    }>;
    milestones: Array<{
      threshold: number;
      reached: boolean;
      reachedAt?: Date;
      reward: any;
    }>;
  }>;
  streaks: {
    current: {
      type: 'daily_login' | 'assignment_completion' | 'activity_engagement' | 'collaboration';
      count: number;
      startDate: Date;
      lastUpdate: Date;
      multiplier: number;
    }[];
    records: {
      longest: number;
      longestType: string;
      longestPeriod: { start: Date; end: Date };
      total: number;
    };
  };
  challenges: {
    active: Array<{
      challengeId: ObjectId;
      joinedAt: Date;
      progress: number;
      completed: boolean;
      completedAt?: Date;
      rewards: Array<{
        type: string;
        value: any;
        claimed: boolean;
      }>;
      teamId?: ObjectId;
      rank?: number;
    }>;
    completed: Array<{
      challengeId: ObjectId;
      completedAt: Date;
      finalRank: number;
      rewards: any[];
      teamId?: ObjectId;
    }>;
  };
  leaderboards: {
    positions: Array<{
      boardId: ObjectId;
      category: string;
      currentRank: number;
      previousRank: number;
      score: number;
      percentile: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    history: Array<{
      date: Date;
      category: string;
      rank: number;
      score: number;
    }>;
  };
  inventory: {
    items: Array<{
      itemId: ObjectId;
      quantity: number;
      acquiredAt: Date;
      source: 'purchase' | 'reward' | 'achievement' | 'challenge';
      metadata: any;
    }>;
    equipped: {
      avatar: ObjectId[];
      themes: ObjectId[];
      badges: ObjectId[];
    };
  };
  preferences: {
    notifications: {
      achievements: boolean;
      levelUp: boolean;
      challenges: boolean;
      leaderboards: boolean;
      streaks: boolean;
    };
    privacy: {
      showProfile: boolean;
      showBadges: boolean;
      showAchievements: boolean;
      showRanking: boolean;
    };
    display: {
      preferredBadges: ObjectId[];
      featuredAchievement?: ObjectId;
      theme: string;
    };
  };
  statistics: {
    totalTimeSpent: number; // minutes
    activitiesCompleted: number;
    assignmentsSubmitted: number;
    collaborationScore: number;
    helpProvided: number;
    helpReceived: number;
    perfectScores: number;
    improvementRate: number;
    consistencyScore: number;
    learningVelocity: number;
  };
  motivation: {
    currentLevel: number; // 1-10 scale
    factors: {
      competition: number;
      achievement: number;
      collaboration: number;
      progress: number;
      recognition: number;
    };
    trends: Array<{
      date: Date;
      level: number;
      factors: any;
    }>;
    interventions: Array<{
      type: 'encouragement' | 'challenge' | 'reward' | 'support';
      triggered: Date;
      effectiveness: number;
      responded: boolean;
    }>;
  };
  social: {
    friends: Array<{
      userId: ObjectId;
      addedAt: Date;
      mutualChallenges: number;
      collaborationScore: number;
    }>;
    teams: Array<{
      teamId: ObjectId;
      role: 'member' | 'leader' | 'captain';
      joinedAt: Date;
      contributions: number;
    }>;
    mentoring: {
      mentees: ObjectId[];
      mentors: ObjectId[];
      sessions: number;
      rating: number;
    };
  };
  customization: {
    unlockedThemes: string[];
    unlockedAvatars: string[];
    unlockedTitles: string[];
    currentTitle: string;
    customBadges: Array<{
      name: string;
      description: string;
      icon: string;
      createdAt: Date;
    }>;
  };
  analytics: {
    engagementHistory: Array<{
      date: Date;
      pointsEarned: number;
      activitiesCompleted: number;
      timeSpent: number;
      socialInteractions: number;
    }>;
    performanceMetrics: {
      averageScore: number;
      improvementTrend: number;
      consistencyIndex: number;
      difficultyPreference: number;
    };
    behavioralInsights: {
      peakActivityHours: number[];
      preferredContentTypes: string[];
      learningStyle: string;
      motivationTriggers: string[];
    };
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    lastActive: Date;
    levelUpAt?: Date;
    lastPointsEarned?: Date;
  };
}

const GameProfileSchema = new Schema<IGameProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: {
      type: String,
      enum: ['default', 'uploaded', 'generated'],
      default: 'default'
    },
    url: { type: String, required: true },
    customization: {
      backgroundColor: { type: String, default: '#3B82F6' },
      accessories: [{ type: String }],
      theme: { type: String, default: 'default' }
    }
  },
  level: {
    current: { type: Number, default: 1, min: 1 },
    experience: { type: Number, default: 0, min: 0 },
    experienceToNext: { type: Number, default: 100 },
    title: { type: String, default: 'Novice Learner' },
    benefits: [{ type: String }],
    unlockedAt: { type: Date, default: Date.now }
  },
  points: {
    total: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0, min: 0 },
    lifetime: { type: Number, default: 0, min: 0 },
    breakdown: {
      assignments: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      collaboration: { type: Number, default: 0 },
      achievements: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      penalties: { type: Number, default: 0 }
    }
  },
  badges: [{
    badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
    earnedAt: { type: Date, default: Date.now },
    level: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    progress: { type: Number, default: 100, min: 0, max: 100 },
    displayed: { type: Boolean, default: true },
    category: { type: String, required: true },
    metadata: {
      assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
      activityId: { type: Schema.Types.ObjectId, ref: 'Activity' },
      challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge' },
      streakCount: { type: Number },
      achievementValue: { type: Number }
    }
  }],
  achievements: [{
    achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
    unlockedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    tier: { type: Number, default: 1, min: 1 },
    rewards: [{
      type: {
        type: String,
        enum: ['points', 'badge', 'title', 'privilege', 'item'],
        required: true
      },
      value: { type: Schema.Types.Mixed, required: true },
      claimed: { type: Boolean, default: false }
    }],
    milestones: [{
      threshold: { type: Number, required: true },
      reached: { type: Boolean, default: false },
      reachedAt: { type: Date },
      reward: { type: Schema.Types.Mixed }
    }]
  }],
  streaks: {
    current: [{
      type: {
        type: String,
        enum: ['daily_login', 'assignment_completion', 'activity_engagement', 'collaboration'],
        required: true
      },
      count: { type: Number, default: 0, min: 0 },
      startDate: { type: Date, default: Date.now },
      lastUpdate: { type: Date, default: Date.now },
      multiplier: { type: Number, default: 1, min: 1 }
    }],
    records: {
      longest: { type: Number, default: 0 },
      longestType: { type: String, default: '' },
      longestPeriod: {
        start: { type: Date },
        end: { type: Date }
      },
      total: { type: Number, default: 0 }
    }
  },
  challenges: {
    active: [{
      challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
      joinedAt: { type: Date, default: Date.now },
      progress: { type: Number, default: 0, min: 0, max: 100 },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
      rewards: [{
        type: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true },
        claimed: { type: Boolean, default: false }
      }],
      teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
      rank: { type: Number }
    }],
    completed: [{
      challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true },
      completedAt: { type: Date, required: true },
      finalRank: { type: Number, required: true },
      rewards: [{ type: Schema.Types.Mixed }],
      teamId: { type: Schema.Types.ObjectId, ref: 'Team' }
    }]
  },
  leaderboards: {
    positions: [{
      boardId: { type: Schema.Types.ObjectId, ref: 'Leaderboard', required: true },
      category: { type: String, required: true },
      currentRank: { type: Number, required: true },
      previousRank: { type: Number, default: 0 },
      score: { type: Number, required: true },
      percentile: { type: Number, min: 0, max: 100 },
      trend: {
        type: String,
        enum: ['up', 'down', 'stable'],
        default: 'stable'
      }
    }],
    history: [{
      date: { type: Date, required: true },
      category: { type: String, required: true },
      rank: { type: Number, required: true },
      score: { type: Number, required: true }
    }]
  },
  inventory: {
    items: [{
      itemId: { type: Schema.Types.ObjectId, ref: 'GameItem', required: true },
      quantity: { type: Number, default: 1, min: 0 },
      acquiredAt: { type: Date, default: Date.now },
      source: {
        type: String,
        enum: ['purchase', 'reward', 'achievement', 'challenge'],
        required: true
      },
      metadata: { type: Schema.Types.Mixed }
    }],
    equipped: {
      avatar: [{ type: Schema.Types.ObjectId, ref: 'GameItem' }],
      themes: [{ type: Schema.Types.ObjectId, ref: 'GameItem' }],
      badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }]
    }
  },
  preferences: {
    notifications: {
      achievements: { type: Boolean, default: true },
      levelUp: { type: Boolean, default: true },
      challenges: { type: Boolean, default: true },
      leaderboards: { type: Boolean, default: false },
      streaks: { type: Boolean, default: true }
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showBadges: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true },
      showRanking: { type: Boolean, default: false }
    },
    display: {
      preferredBadges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
      featuredAchievement: { type: Schema.Types.ObjectId, ref: 'Achievement' },
      theme: { type: String, default: 'default' }
    }
  },
  statistics: {
    totalTimeSpent: { type: Number, default: 0 },
    activitiesCompleted: { type: Number, default: 0 },
    assignmentsSubmitted: { type: Number, default: 0 },
    collaborationScore: { type: Number, default: 0 },
    helpProvided: { type: Number, default: 0 },
    helpReceived: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    improvementRate: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 50 },
    learningVelocity: { type: Number, default: 1 }
  },
  motivation: {
    currentLevel: { type: Number, default: 5, min: 1, max: 10 },
    factors: {
      competition: { type: Number, default: 5, min: 0, max: 10 },
      achievement: { type: Number, default: 5, min: 0, max: 10 },
      collaboration: { type: Number, default: 5, min: 0, max: 10 },
      progress: { type: Number, default: 5, min: 0, max: 10 },
      recognition: { type: Number, default: 5, min: 0, max: 10 }
    },
    trends: [{
      date: { type: Date, required: true },
      level: { type: Number, required: true },
      factors: { type: Schema.Types.Mixed }
    }],
    interventions: [{
      type: {
        type: String,
        enum: ['encouragement', 'challenge', 'reward', 'support'],
        required: true
      },
      triggered: { type: Date, default: Date.now },
      effectiveness: { type: Number, min: 0, max: 10 },
      responded: { type: Boolean, default: false }
    }]
  },
  social: {
    friends: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      addedAt: { type: Date, default: Date.now },
      mutualChallenges: { type: Number, default: 0 },
      collaborationScore: { type: Number, default: 0 }
    }],
    teams: [{
      teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
      role: {
        type: String,
        enum: ['member', 'leader', 'captain'],
        default: 'member'
      },
      joinedAt: { type: Date, default: Date.now },
      contributions: { type: Number, default: 0 }
    }],
    mentoring: {
      mentees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      mentors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      sessions: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 }
    }
  },
  customization: {
    unlockedThemes: [{ type: String }],
    unlockedAvatars: [{ type: String }],
    unlockedTitles: [{ type: String }],
    currentTitle: { type: String, default: 'Novice Learner' },
    customBadges: [{
      name: { type: String, required: true },
      description: { type: String, required: true },
      icon: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  analytics: {
    engagementHistory: [{
      date: { type: Date, required: true },
      pointsEarned: { type: Number, default: 0 },
      activitiesCompleted: { type: Number, default: 0 },
      timeSpent: { type: Number, default: 0 },
      socialInteractions: { type: Number, default: 0 }
    }],
    performanceMetrics: {
      averageScore: { type: Number, default: 0 },
      improvementTrend: { type: Number, default: 0 },
      consistencyIndex: { type: Number, default: 50 },
      difficultyPreference: { type: Number, default: 5 }
    },
    behavioralInsights: {
      peakActivityHours: [{ type: Number }],
      preferredContentTypes: [{ type: String }],
      learningStyle: { type: String, default: 'visual' },
      motivationTriggers: [{ type: String }]
    }
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now, index: true },
    levelUpAt: { type: Date },
    lastPointsEarned: { type: Date }
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Compound indexes for efficient queries
GameProfileSchema.index({ userId: 1, 'level.current': -1 });
GameProfileSchema.index({ 'points.total': -1, 'level.current': -1 });
GameProfileSchema.index({ 'leaderboards.positions.currentRank': 1 });
GameProfileSchema.index({ 'challenges.active.challengeId': 1 });
GameProfileSchema.index({ 'timestamps.lastActive': -1 });

// Instance methods
GameProfileSchema.methods.awardPoints = function(
  points: number,
  source: 'assignments' | 'activities' | 'collaboration' | 'achievements' | 'bonus',
  metadata?: any
): Promise<IGameProfile> {
  this.points.total += points;
  this.points.available += points;
  this.points.lifetime += points;
  this.points.breakdown[source] += points;
  
  // Track points earning
  this.timestamps.lastPointsEarned = new Date();
  
  // Add to engagement history
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntry = this.analytics.engagementHistory.find(
    (entry: any) => entry.date.getTime() === today.getTime()
  );
  
  if (todayEntry) {
    todayEntry.pointsEarned += points;
  } else {
    this.analytics.engagementHistory.push({
      date: today,
      pointsEarned: points,
      activitiesCompleted: 0,
      timeSpent: 0,
      socialInteractions: 0
    });
  }
  
  // Check for level up
  this.checkLevelUp();
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameProfileSchema.methods.spendPoints = function(points: number, reason: string): Promise<IGameProfile> {
  if (this.points.available < points) {
    throw new Error('Insufficient points');
  }
  
  this.points.available -= points;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameProfileSchema.methods.awardExperience = function(experience: number): Promise<IGameProfile> {
  this.level.experience += experience;
  this.checkLevelUp();
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameProfileSchema.methods.checkLevelUp = function(): boolean {
  let leveledUp = false;
  
  while (this.level.experience >= this.level.experienceToNext) {
    this.level.experience -= this.level.experienceToNext;
    this.level.current += 1;
    
    // Calculate next level requirements (exponential growth)
    this.level.experienceToNext = Math.floor(100 * Math.pow(1.2, this.level.current - 1));
    
    // Update title based on level
    this.level.title = this.getLevelTitle();
    
    // Award level up benefits
    this.awardLevelUpBenefits();
    
    this.timestamps.levelUpAt = new Date();
    leveledUp = true;
  }
  
  return leveledUp;
};

GameProfileSchema.methods.getLevelTitle = function(): string {
  const level = this.level.current;
  
  if (level >= 100) return 'Legendary Master';
  if (level >= 90) return 'Grand Master';
  if (level >= 80) return 'Master';
  if (level >= 70) return 'Expert';
  if (level >= 60) return 'Advanced Practitioner';
  if (level >= 50) return 'Skilled Learner';
  if (level >= 40) return 'Competent Student';
  if (level >= 30) return 'Proficient Learner';
  if (level >= 20) return 'Developing Student';
  if (level >= 10) return 'Active Learner';
  if (level >= 5) return 'Engaged Student';
  return 'Novice Learner';
};

GameProfileSchema.methods.awardLevelUpBenefits = function(): void {
  const level = this.level.current;
  
  // Award bonus points for leveling up
  const bonusPoints = level * 10;
  this.points.total += bonusPoints;
  this.points.available += bonusPoints;
  this.points.breakdown.bonus += bonusPoints;
  
  // Unlock new benefits based on level milestones
  if (level % 5 === 0) {
    this.level.benefits.push(`Level ${level} milestone reached!`);
  }
  
  if (level === 10) {
    this.customization.unlockedThemes.push('dark', 'ocean');
  }
  
  if (level === 25) {
    this.customization.unlockedAvatars.push('professional', 'casual');
  }
  
  if (level === 50) {
    this.customization.unlockedTitles.push('Dedicated Learner', 'Knowledge Seeker');
  }
};

GameProfileSchema.methods.awardBadge = function(
  badgeId: ObjectId,
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' = 'bronze',
  category: string,
  metadata?: any
): Promise<IGameProfile> {
  // Check if badge already exists
  const existingBadge = this.badges.find(
    (badge: any) => badge.badgeId.toString() === badgeId.toString()
  );
  
  if (existingBadge) {
    // Upgrade badge level if higher
    const levelOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = levelOrder.indexOf(existingBadge.level);
    const newIndex = levelOrder.indexOf(level);
    
    if (newIndex > currentIndex) {
      existingBadge.level = level;
      existingBadge.earnedAt = new Date();
      existingBadge.metadata = { ...existingBadge.metadata, ...metadata };
    }
  } else {
    // Award new badge
    this.badges.push({
      badgeId,
      earnedAt: new Date(),
      level,
      progress: 100,
      displayed: true,
      category,
      metadata: metadata || {}
    });
  }
  
  // Award points for badge
  const badgePoints = this.getBadgePoints(level);
  return this.awardPoints(badgePoints, 'achievements', { badgeId, level });
};

GameProfileSchema.methods.getBadgePoints = function(level: string): number {
  switch (level) {
    case 'bronze': return 10;
    case 'silver': return 25;
    case 'gold': return 50;
    case 'platinum': return 100;
    case 'diamond': return 200;
    default: return 10;
  }
};

GameProfileSchema.methods.updateStreak = function(
  type: 'daily_login' | 'assignment_completion' | 'activity_engagement' | 'collaboration'
): Promise<IGameProfile> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = this.streaks.current.find((s: any) => s.type === type);
  
  if (!streak) {
    // Create new streak
    streak = {
      type,
      count: 1,
      startDate: today,
      lastUpdate: today,
      multiplier: 1
    };
    this.streaks.current.push(streak);
  } else {
    const lastUpdate = new Date(streak.lastUpdate);
    lastUpdate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Continue streak
      streak.count += 1;
      streak.lastUpdate = today;
      
      // Increase multiplier every 7 days
      if (streak.count % 7 === 0) {
        streak.multiplier = Math.min(streak.multiplier + 0.1, 3.0);
      }
    } else if (daysDiff > 1) {
      // Streak broken, start new one
      streak.count = 1;
      streak.startDate = today;
      streak.lastUpdate = today;
      streak.multiplier = 1;
    }
    // If daysDiff === 0, it's the same day, no update needed
  }
  
  // Update records
  if (streak.count > this.streaks.records.longest) {
    this.streaks.records.longest = streak.count;
    this.streaks.records.longestType = type;
    this.streaks.records.longestPeriod = {
      start: streak.startDate,
      end: today
    };
  }
  
  this.streaks.records.total += 1;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameProfileSchema.methods.joinChallenge = function(challengeId: ObjectId, teamId?: ObjectId): Promise<IGameProfile> {
  // Check if already joined
  const existing = this.challenges.active.find(
    (challenge: any) => challenge.challengeId.toString() === challengeId.toString()
  );
  
  if (existing) {
    throw new Error('Already joined this challenge');
  }
  
  this.challenges.active.push({
    challengeId,
    joinedAt: new Date(),
    progress: 0,
    completed: false,
    rewards: [],
    teamId
  });
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameProfileSchema.methods.updateChallengeProgress = function(
  challengeId: ObjectId,
  progress: number,
  rank?: number
): Promise<IGameProfile> {
  const challenge = this.challenges.active.find(
    (c: any) => c.challengeId.toString() === challengeId.toString()
  );
  
  if (!challenge) {
    throw new Error('Challenge not found');
  }
  
  challenge.progress = Math.min(progress, 100);
  if (rank) challenge.rank = rank;
  
  if (challenge.progress >= 100 && !challenge.completed) {
    challenge.completed = true;
    challenge.completedAt = new Date();
  }
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameProfileSchema.methods.completeChallenge = function(
  challengeId: ObjectId,
  finalRank: number,
  rewards: any[]
): Promise<IGameProfile> {
  const activeIndex = this.challenges.active.findIndex(
    (c: any) => c.challengeId.toString() === challengeId.toString()
  );
  
  if (activeIndex === -1) {
    throw new Error('Active challenge not found');
  }
  
  const challenge = this.challenges.active[activeIndex];
  
  // Move to completed challenges
  this.challenges.completed.push({
    challengeId,
    completedAt: new Date(),
    finalRank,
    rewards,
    teamId: challenge.teamId
  });
  
  // Remove from active challenges
  this.challenges.active.splice(activeIndex, 1);
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameProfileSchema.methods.updateLeaderboardPosition = function(
  boardId: ObjectId,
  category: string,
  newRank: number,
  score: number
): Promise<IGameProfile> {
  let position = this.leaderboards.positions.find(
    (pos: any) => pos.boardId.toString() === boardId.toString() && pos.category === category
  );
  
  if (!position) {
    position = {
      boardId,
      category,
      currentRank: newRank,
      previousRank: 0,
      score,
      percentile: 50,
      trend: 'stable'
    };
    this.leaderboards.positions.push(position);
  } else {
    position.previousRank = position.currentRank;
    position.currentRank = newRank;
    position.score = score;
    
    // Determine trend
    if (newRank < position.previousRank) {
      position.trend = 'up';
    } else if (newRank > position.previousRank) {
      position.trend = 'down';
    } else {
      position.trend = 'stable';
    }
  }
  
  // Add to history
  this.leaderboards.history.push({
    date: new Date(),
    category,
    rank: newRank,
    score
  });
  
  // Keep only last 30 entries
  if (this.leaderboards.history.length > 30) {
    this.leaderboards.history = this.leaderboards.history.slice(-30);
  }
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameProfileSchema.methods.addFriend = function(friendUserId: ObjectId): Promise<IGameProfile> {
  const existing = this.social.friends.find(
    (friend: any) => friend.userId.toString() === friendUserId.toString()
  );
  
  if (existing) {
    throw new Error('Already friends with this user');
  }
  
  this.social.friends.push({
    userId: friendUserId,
    addedAt: new Date(),
    mutualChallenges: 0,
    collaborationScore: 0
  });
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameProfileSchema.methods.updateMotivation = function(factors: any): Promise<IGameProfile> {
  // Update motivation factors
  Object.assign(this.motivation.factors, factors);
  
  // Calculate overall motivation level
  const factorValues = Object.values(this.motivation.factors) as number[];
  this.motivation.currentLevel = factorValues.reduce((sum, val) => sum + val, 0) / factorValues.length;
  
  // Add to trends
  this.motivation.trends.push({
    date: new Date(),
    level: this.motivation.currentLevel,
    factors: { ...this.motivation.factors }
  });
  
  // Keep only last 30 entries
  if (this.motivation.trends.length > 30) {
    this.motivation.trends = this.motivation.trends.slice(-30);
  }
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

GameProfileSchema.methods.addActivityToHistory = function(
  activitiesCompleted: number = 0,
  timeSpent: number = 0,
  socialInteractions: number = 0
): Promise<IGameProfile> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let todayEntry = this.analytics.engagementHistory.find(
    (entry: any) => entry.date.getTime() === today.getTime()
  );
  
  if (!todayEntry) {
    todayEntry = {
      date: today,
      pointsEarned: 0,
      activitiesCompleted: 0,
      timeSpent: 0,
      socialInteractions: 0
    };
    this.analytics.engagementHistory.push(todayEntry);
  }
  
  todayEntry.activitiesCompleted += activitiesCompleted;
  todayEntry.timeSpent += timeSpent;
  todayEntry.socialInteractions += socialInteractions;
  
  // Update statistics
  this.statistics.activitiesCompleted += activitiesCompleted;
  this.statistics.totalTimeSpent += timeSpent;
  
  // Keep only last 90 entries
  if (this.analytics.engagementHistory.length > 90) {
    this.analytics.engagementHistory = this.analytics.engagementHistory.slice(-90);
  }
  
  this.timestamps.lastActive = new Date();
  this.timestamps.updatedAt = new Date();
  return this.save();
};

// Static methods
GameProfileSchema.statics.getTopPlayers = function(limit: number = 10, category: 'points' | 'level' | 'badges' = 'points') {
  let sortField;
  switch (category) {
    case 'points':
      sortField = { 'points.total': -1 };
      break;
    case 'level':
      sortField = { 'level.current': -1, 'level.experience': -1 };
      break;
    case 'badges':
      sortField = { 'badges': { $size: '$badges' } };
      break;
    default:
      sortField = { 'points.total': -1 };
  }
  
  return this.find({ 'preferences.privacy.showRanking': true })
    .sort(sortField)
    .limit(limit)
    .populate('userId', 'username firstName lastName avatar')
    .select('userId displayName level points badges statistics');
};

GameProfileSchema.statics.getActiveStreaks = function(type?: string) {
  const query: any = { 'streaks.current.count': { $gt: 0 } };
  if (type) {
    query['streaks.current.type'] = type;
  }
  
  return this.find(query)
    .populate('userId', 'username firstName lastName')
    .select('userId displayName streaks')
    .sort({ 'streaks.current.count': -1 });
};

GameProfileSchema.statics.getRecentAchievements = function(limit: number = 20) {
  return this.aggregate([
    { $unwind: '$badges' },
    { $sort: { 'badges.earnedAt': -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $lookup: {
        from: 'badges',
        localField: 'badges.badgeId',
        foreignField: '_id',
        as: 'badgeInfo'
      }
    },
    {
      $project: {
        user: { $arrayElemAt: ['$user', 0] },
        badge: { $arrayElemAt: ['$badgeInfo', 0] },
        earnedAt: '$badges.earnedAt',
        level: '$badges.level',
        displayName: 1
      }
    }
  ]);
};

// Pre-save middleware
GameProfileSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  next();
});

export const GameProfile = mongoose.model<IGameProfile>('GameProfile', GameProfileSchema);