import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface ILeaderboard extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  type: 'global' | 'class' | 'school' | 'challenge' | 'activity' | 'subject' | 'custom';
  scope: 'all_time' | 'yearly' | 'monthly' | 'weekly' | 'daily' | 'custom_period';
  category: 'points' | 'achievements' | 'streaks' | 'collaboration' | 'creativity' | 'performance' | 'engagement';
  metrics: {
    primary: {
      field: string; // e.g., 'points.total', 'achievements.count', 'streaks.current'
      name: string;
      unit: string;
      displayFormat: 'number' | 'percentage' | 'time' | 'custom';
      aggregation: 'sum' | 'average' | 'max' | 'min' | 'count';
    };
    secondary?: Array<{
      field: string;
      name: string;
      unit: string;
      displayFormat: 'number' | 'percentage' | 'time' | 'custom';
      weight: number; // for tie-breaking
    }>;
    filters: Array<{
      field: string;
      operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';
      value: any;
      description: string;
    }>;
  };
  timeframe: {
    startDate?: Date;
    endDate?: Date;
    rolling: boolean; // true for rolling windows (e.g., last 30 days)
    duration?: {
      amount: number;
      unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
    };
    timezone: string;
    resetSchedule?: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
      dayOfWeek?: number; // 0-6 for weekly reset
      dayOfMonth?: number; // 1-31 for monthly reset
      time: string; // HH:MM format
    };
  };
  participants: {
    eligibility: {
      userTypes: Array<'student' | 'teacher' | 'admin' | 'parent' | 'guest'>;
      gradeLevel?: string[];
      subjects?: string[];
      schools?: ObjectId[];
      classes?: ObjectId[];
      minLevel?: number;
      maxLevel?: number;
      regions?: string[];
      customCriteria?: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
    };
    exclusions: {
      users: ObjectId[];
      reasons: Array<{
        userId: ObjectId;
        reason: string;
        excludedAt: Date;
        excludedBy: ObjectId;
      }>;
    };
    teams: {
      enabled: boolean;
      teamSize?: {
        min: number;
        max: number;
      };
      formation: 'automatic' | 'manual' | 'hybrid';
    };
  };
  entries: Array<{
    participantId: ObjectId;
    participantType: 'user' | 'team';
    teamId?: ObjectId;
    rank: number;
    previousRank?: number;
    rankChange?: 'up' | 'down' | 'same' | 'new';
    score: number;
    previousScore?: number;
    scoreChange?: number;
    secondaryMetrics?: Array<{
      field: string;
      value: number;
    }>;
    streak?: number;
    lastActive: Date;
    firstEntry: Date;
    metadata: {
      profile?: any;
      achievements?: number;
      badges?: number;
      completedChallenges?: number;
      collaborationScore?: number;
      consistency?: number; // how consistent their performance is
    };
    history: Array<{
      date: Date;
      rank: number;
      score: number;
      change: number;
    }>;
  }>;
  display: {
    maxEntries: number;
    showRankChange: boolean;
    showScore: boolean;
    showSecondaryMetrics: boolean;
    showAvatars: boolean;
    showBadges: boolean;
    showProgress: boolean;
    anonymizeData: boolean;
    customLabels: {
      rank: string;
      score: string;
      participant: string;
    };
    colors: {
      first: string;
      second: string;
      third: string;
      default: string;
      improvement: string;
      decline: string;
    };
    icons: {
      rankUp: string;
      rankDown: string;
      new: string;
      crown: string;
      medal: string;
    };
  };
  privacy: {
    isPublic: boolean;
    requiresAuth: boolean;
    visibleTo: Array<'participants' | 'teachers' | 'parents' | 'admins' | 'everyone'>;
    hidePersonalData: boolean;
    allowOptOut: boolean;
    showOnlyTopN?: number; // only show top N entries to non-participants
  };
  rewards: {
    enabled: boolean;
    tiers: Array<{
      name: string;
      minRank: number;
      maxRank: number;
      rewards: {
        points: number;
        badges: ObjectId[];
        titles: string[];
        privileges: string[];
        items: ObjectId[];
        certificates: string[];
      };
      recurring: boolean; // awarded every period
    }>;
    milestones: Array<{
      description: string;
      condition: {
        type: 'rank_reached' | 'score_threshold' | 'improvement' | 'consistency';
        value: number;
      };
      rewards: {
        points: number;
        badges: ObjectId[];
        titles: string[];
      };
      oneTime: boolean;
    }>;
  };
  analytics: {
    participation: {
      totalParticipants: number;
      activeParticipants: number; // participated in current period
      newParticipants: number; // first time in leaderboard
      returningParticipants: number;
      dropoutRate: number;
    };
    engagement: {
      averageTimeToFirstEntry: number; // hours
      averageActivityFrequency: number; // activities per week
      viewCount: number;
      shareCount: number;
      commentCount: number;
    };
    performance: {
      averageScore: number;
      medianScore: number;
      scoreDistribution: Array<{
        range: string;
        count: number;
        percentage: number;
      }>;
      improvementRate: number; // percentage of participants improving
      competitionIntensity: number; // how close the top ranks are
    };
    temporal: {
      peakActivityHours: number[];
      peakActivityDays: number[];
      seasonalTrends: Array<{
        period: string;
        averageParticipation: number;
        averageScore: number;
      }>;
    };
  };
  notifications: {
    enabled: boolean;
    types: Array<{
      event: 'rank_change' | 'new_leader' | 'milestone_reached' | 'period_end' | 'achievement_unlocked';
      enabled: boolean;
      recipients: Array<'participant' | 'followers' | 'teachers' | 'parents'>;
      threshold?: number; // minimum rank change to notify
      template?: string;
    }>;
    digest: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string; // HH:MM
      recipients: Array<'participants' | 'teachers' | 'parents'>;
    };
  };
  social: {
    allowComments: boolean;
    allowReactions: boolean;
    allowFollowing: boolean;
    showFollowerCount: boolean;
    comments: Array<{
      userId: ObjectId;
      message: string;
      targetRank?: number; // comment about specific rank/entry
      likes: number;
      replies: Array<{
        userId: ObjectId;
        message: string;
        createdAt: Date;
      }>;
      createdAt: Date;
    }>;
    reactions: Array<{
      type: 'like' | 'celebrate' | 'wow' | 'support';
      userId: ObjectId;
      targetRank?: number; // reaction to specific entry
      createdAt: Date;
    }>;
    followers: Array<{
      userId: ObjectId;
      followedAt: Date;
      notifications: boolean;
    }>;
  };
  automation: {
    updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    lastUpdate: Date;
    nextUpdate?: Date;
    dataSource: {
      type: 'direct' | 'computed' | 'imported';
      collections: string[]; // MongoDB collections to aggregate from
      pipeline?: any[]; // MongoDB aggregation pipeline
    };
    triggers: Array<{
      event: string; // e.g., 'user.points.updated', 'challenge.completed'
      action: 'update_entry' | 'recalculate_ranks' | 'send_notification';
      delay?: number; // minutes to wait before action
    }>;
  };
  customization: {
    theme: {
      name: string;
      colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        accent: string;
      };
      fonts: {
        primary: string;
        secondary: string;
      };
      layout: 'compact' | 'detailed' | 'cards' | 'table';
    };
    branding: {
      logo?: string;
      title?: string;
      description?: string;
      sponsorLogos?: string[];
    };
    animations: {
      enabled: boolean;
      rankChangeAnimation: boolean;
      scoreUpdateAnimation: boolean;
      newEntryAnimation: boolean;
    };
  };
  metadata: {
    version: string;
    createdBy: ObjectId;
    moderators: ObjectId[];
    isActive: boolean;
    isFeatured: boolean;
    isPremium: boolean;
    tags: string[];
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedParticipants: number;
    changelog: Array<{
      version: string;
      changes: string[];
      date: Date;
      author: ObjectId;
    }>;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    lastReset?: Date;
    nextReset?: Date;
    archivedAt?: Date;
  };
}

const LeaderboardSchema = new Schema<ILeaderboard>({
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
  type: {
    type: String,
    enum: ['global', 'class', 'school', 'challenge', 'activity', 'subject', 'custom'],
    required: true,
    index: true
  },
  scope: {
    type: String,
    enum: ['all_time', 'yearly', 'monthly', 'weekly', 'daily', 'custom_period'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['points', 'achievements', 'streaks', 'collaboration', 'creativity', 'performance', 'engagement'],
    required: true,
    index: true
  },
  metrics: {
    primary: {
      field: { type: String, required: true },
      name: { type: String, required: true },
      unit: { type: String, required: true },
      displayFormat: {
        type: String,
        enum: ['number', 'percentage', 'time', 'custom'],
        default: 'number'
      },
      aggregation: {
        type: String,
        enum: ['sum', 'average', 'max', 'min', 'count'],
        default: 'sum'
      }
    },
    secondary: [{
      field: { type: String, required: true },
      name: { type: String, required: true },
      unit: { type: String, required: true },
      displayFormat: {
        type: String,
        enum: ['number', 'percentage', 'time', 'custom'],
        default: 'number'
      },
      weight: { type: Number, default: 1 }
    }],
    filters: [{
      field: { type: String, required: true },
      operator: {
        type: String,
        enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'between'],
        required: true
      },
      value: { type: Schema.Types.Mixed, required: true },
      description: { type: String, required: true }
    }]
  },
  timeframe: {
    startDate: { type: Date },
    endDate: { type: Date },
    rolling: { type: Boolean, default: false },
    duration: {
      amount: { type: Number },
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days', 'weeks', 'months', 'years']
      }
    },
    timezone: { type: String, default: 'UTC' },
    resetSchedule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
      },
      dayOfWeek: { type: Number, min: 0, max: 6 },
      dayOfMonth: { type: Number, min: 1, max: 31 },
      time: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
    }
  },
  participants: {
    eligibility: {
      userTypes: [{
        type: String,
        enum: ['student', 'teacher', 'admin', 'parent', 'guest']
      }],
      gradeLevel: [{ type: String }],
      subjects: [{ type: String }],
      schools: [{ type: Schema.Types.ObjectId, ref: 'School' }],
      classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
      minLevel: { type: Number },
      maxLevel: { type: Number },
      regions: [{ type: String }],
      customCriteria: [{
        field: { type: String, required: true },
        operator: { type: String, required: true },
        value: { type: Schema.Types.Mixed, required: true }
      }]
    },
    exclusions: {
      users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      reasons: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, required: true },
        excludedAt: { type: Date, default: Date.now },
        excludedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
      }]
    },
    teams: {
      enabled: { type: Boolean, default: false },
      teamSize: {
        min: { type: Number, default: 2 },
        max: { type: Number, default: 6 }
      },
      formation: {
        type: String,
        enum: ['automatic', 'manual', 'hybrid'],
        default: 'manual'
      }
    }
  },
  entries: [{
    participantId: { type: Schema.Types.ObjectId, required: true },
    participantType: {
      type: String,
      enum: ['user', 'team'],
      required: true
    },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    rank: { type: Number, required: true, index: true },
    previousRank: { type: Number },
    rankChange: {
      type: String,
      enum: ['up', 'down', 'same', 'new']
    },
    score: { type: Number, required: true, index: true },
    previousScore: { type: Number },
    scoreChange: { type: Number },
    secondaryMetrics: [{
      field: { type: String, required: true },
      value: { type: Number, required: true }
    }],
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    firstEntry: { type: Date, default: Date.now },
    metadata: {
      profile: { type: Schema.Types.Mixed },
      achievements: { type: Number, default: 0 },
      badges: { type: Number, default: 0 },
      completedChallenges: { type: Number, default: 0 },
      collaborationScore: { type: Number, default: 0 },
      consistency: { type: Number, default: 0 }
    },
    history: [{
      date: { type: Date, required: true },
      rank: { type: Number, required: true },
      score: { type: Number, required: true },
      change: { type: Number, required: true }
    }]
  }],
  display: {
    maxEntries: { type: Number, default: 100 },
    showRankChange: { type: Boolean, default: true },
    showScore: { type: Boolean, default: true },
    showSecondaryMetrics: { type: Boolean, default: false },
    showAvatars: { type: Boolean, default: true },
    showBadges: { type: Boolean, default: true },
    showProgress: { type: Boolean, default: false },
    anonymizeData: { type: Boolean, default: false },
    customLabels: {
      rank: { type: String, default: 'Rank' },
      score: { type: String, default: 'Score' },
      participant: { type: String, default: 'Participant' }
    },
    colors: {
      first: { type: String, default: '#FFD700' },
      second: { type: String, default: '#C0C0C0' },
      third: { type: String, default: '#CD7F32' },
      default: { type: String, default: '#000000' },
      improvement: { type: String, default: '#28a745' },
      decline: { type: String, default: '#dc3545' }
    },
    icons: {
      rankUp: { type: String, default: '↗️' },
      rankDown: { type: String, default: '↘️' },
      new: { type: String, default: '✨' },
      crown: { type: String, default: '👑' },
      medal: { type: String, default: '🏅' }
    }
  },
  privacy: {
    isPublic: { type: Boolean, default: true, index: true },
    requiresAuth: { type: Boolean, default: false },
    visibleTo: [{
      type: String,
      enum: ['participants', 'teachers', 'parents', 'admins', 'everyone']
    }],
    hidePersonalData: { type: Boolean, default: false },
    allowOptOut: { type: Boolean, default: true },
    showOnlyTopN: { type: Number }
  },
  rewards: {
    enabled: { type: Boolean, default: false },
    tiers: [{
      name: { type: String, required: true },
      minRank: { type: Number, required: true },
      maxRank: { type: Number, required: true },
      rewards: {
        points: { type: Number, default: 0 },
        badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
        titles: [{ type: String }],
        privileges: [{ type: String }],
        items: [{ type: Schema.Types.ObjectId, ref: 'GameItem' }],
        certificates: [{ type: String }]
      },
      recurring: { type: Boolean, default: false }
    }],
    milestones: [{
      description: { type: String, required: true },
      condition: {
        type: {
          type: String,
          enum: ['rank_reached', 'score_threshold', 'improvement', 'consistency'],
          required: true
        },
        value: { type: Number, required: true }
      },
      rewards: {
        points: { type: Number, default: 0 },
        badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
        titles: [{ type: String }]
      },
      oneTime: { type: Boolean, default: true }
    }]
  },
  analytics: {
    participation: {
      totalParticipants: { type: Number, default: 0 },
      activeParticipants: { type: Number, default: 0 },
      newParticipants: { type: Number, default: 0 },
      returningParticipants: { type: Number, default: 0 },
      dropoutRate: { type: Number, default: 0 }
    },
    engagement: {
      averageTimeToFirstEntry: { type: Number, default: 0 },
      averageActivityFrequency: { type: Number, default: 0 },
      viewCount: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
      commentCount: { type: Number, default: 0 }
    },
    performance: {
      averageScore: { type: Number, default: 0 },
      medianScore: { type: Number, default: 0 },
      scoreDistribution: [{
        range: { type: String, required: true },
        count: { type: Number, required: true },
        percentage: { type: Number, required: true }
      }],
      improvementRate: { type: Number, default: 0 },
      competitionIntensity: { type: Number, default: 0 }
    },
    temporal: {
      peakActivityHours: [{ type: Number }],
      peakActivityDays: [{ type: Number }],
      seasonalTrends: [{
        period: { type: String, required: true },
        averageParticipation: { type: Number, required: true },
        averageScore: { type: Number, required: true }
      }]
    }
  },
  notifications: {
    enabled: { type: Boolean, default: true },
    types: [{
      event: {
        type: String,
        enum: ['rank_change', 'new_leader', 'milestone_reached', 'period_end', 'achievement_unlocked'],
        required: true
      },
      enabled: { type: Boolean, default: true },
      recipients: [{
        type: String,
        enum: ['participant', 'followers', 'teachers', 'parents']
      }],
      threshold: { type: Number },
      template: { type: String }
    }],
    digest: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      time: { type: String, default: '09:00' },
      recipients: [{
        type: String,
        enum: ['participants', 'teachers', 'parents']
      }]
    }
  },
  social: {
    allowComments: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true },
    allowFollowing: { type: Boolean, default: true },
    showFollowerCount: { type: Boolean, default: true },
    comments: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      message: { type: String, required: true, maxlength: 1000 },
      targetRank: { type: Number },
      likes: { type: Number, default: 0 },
      replies: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now }
      }],
      createdAt: { type: Date, default: Date.now }
    }],
    reactions: [{
      type: {
        type: String,
        enum: ['like', 'celebrate', 'wow', 'support'],
        required: true
      },
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      targetRank: { type: Number },
      createdAt: { type: Date, default: Date.now }
    }],
    followers: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      followedAt: { type: Date, default: Date.now },
      notifications: { type: Boolean, default: true }
    }]
  },
  automation: {
    updateFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily', 'weekly'],
      default: 'hourly'
    },
    lastUpdate: { type: Date, default: Date.now },
    nextUpdate: { type: Date },
    dataSource: {
      type: {
        type: String,
        enum: ['direct', 'computed', 'imported'],
        default: 'computed'
      },
      collections: [{ type: String }],
      pipeline: [{ type: Schema.Types.Mixed }]
    },
    triggers: [{
      event: { type: String, required: true },
      action: {
        type: String,
        enum: ['update_entry', 'recalculate_ranks', 'send_notification'],
        required: true
      },
      delay: { type: Number, default: 0 }
    }]
  },
  customization: {
    theme: {
      name: { type: String, default: 'default' },
      colors: {
        primary: { type: String, default: '#007bff' },
        secondary: { type: String, default: '#6c757d' },
        background: { type: String, default: '#ffffff' },
        text: { type: String, default: '#212529' },
        accent: { type: String, default: '#28a745' }
      },
      fonts: {
        primary: { type: String, default: 'Arial, sans-serif' },
        secondary: { type: String, default: 'Georgia, serif' }
      },
      layout: {
        type: String,
        enum: ['compact', 'detailed', 'cards', 'table'],
        default: 'detailed'
      }
    },
    branding: {
      logo: { type: String },
      title: { type: String },
      description: { type: String },
      sponsorLogos: [{ type: String }]
    },
    animations: {
      enabled: { type: Boolean, default: true },
      rankChangeAnimation: { type: Boolean, default: true },
      scoreUpdateAnimation: { type: Boolean, default: true },
      newEntryAnimation: { type: Boolean, default: true }
    }
  },
  metadata: {
    version: { type: String, default: '1.0.0' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPremium: { type: Boolean, default: false },
    tags: [{ type: String, index: true }],
    category: { type: String },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    estimatedParticipants: { type: Number, default: 0 },
    changelog: [{
      version: { type: String, required: true },
      changes: [{ type: String }],
      date: { type: Date, default: Date.now },
      author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }]
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date },
    lastReset: { type: Date },
    nextReset: { type: Date },
    archivedAt: { type: Date }
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Indexes for efficient queries
LeaderboardSchema.index({ type: 1, category: 1 });
LeaderboardSchema.index({ scope: 1, 'timeframe.startDate': 1, 'timeframe.endDate': 1 });
LeaderboardSchema.index({ 'entries.rank': 1 });
LeaderboardSchema.index({ 'entries.score': -1 });
LeaderboardSchema.index({ 'entries.participantId': 1 });
LeaderboardSchema.index({ 'metadata.isActive': 1, 'privacy.isPublic': 1 });
LeaderboardSchema.index({ 'metadata.tags': 1 });

// Instance methods
LeaderboardSchema.methods.updateEntry = function(participantId: ObjectId, newScore: number, secondaryMetrics: any[] = []): Promise<ILeaderboard> {
  let entry = this.entries.find((e: any) => e.participantId.toString() === participantId.toString());
  
  if (!entry) {
    // Create new entry
    entry = {
      participantId,
      participantType: 'user',
      rank: this.entries.length + 1,
      score: newScore,
      secondaryMetrics,
      streak: 1,
      lastActive: new Date(),
      firstEntry: new Date(),
      metadata: {
        achievements: 0,
        badges: 0,
        completedChallenges: 0,
        collaborationScore: 0,
        consistency: 0
      },
      history: [{
        date: new Date(),
        rank: this.entries.length + 1,
        score: newScore,
        change: newScore
      }]
    };
    this.entries.push(entry);
  } else {
    // Update existing entry
    entry.previousScore = entry.score;
    entry.scoreChange = newScore - entry.score;
    entry.score = newScore;
    entry.secondaryMetrics = secondaryMetrics;
    entry.lastActive = new Date();
    
    // Update history
    entry.history.push({
      date: new Date(),
      rank: entry.rank,
      score: newScore,
      change: entry.scoreChange
    });
    
    // Keep only last 30 days of history
    if (entry.history.length > 30) {
      entry.history = entry.history.slice(-30);
    }
  }
  
  return this.recalculateRanks();
};

LeaderboardSchema.methods.recalculateRanks = function(): Promise<ILeaderboard> {
  // Sort entries by score (descending) and secondary metrics
  this.entries.sort((a: any, b: any) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    
    // Use secondary metrics for tie-breaking
    for (const metric of this.metrics.secondary || []) {
      const aValue = a.secondaryMetrics?.find((m: any) => m.field === metric.field)?.value || 0;
      const bValue = b.secondaryMetrics?.find((m: any) => m.field === metric.field)?.value || 0;
      
      if (aValue !== bValue) {
        return (bValue - aValue) * metric.weight;
      }
    }
    
    return 0;
  });
  
  // Update ranks and rank changes
  this.entries.forEach((entry: any, index: number) => {
    entry.previousRank = entry.rank;
    entry.rank = index + 1;
    
    if (entry.previousRank) {
      if (entry.rank < entry.previousRank) {
        entry.rankChange = 'up';
      } else if (entry.rank > entry.previousRank) {
        entry.rankChange = 'down';
      } else {
        entry.rankChange = 'same';
      }
    } else {
      entry.rankChange = 'new';
    }
  });
  
  // Trim to max entries
  if (this.entries.length > this.display.maxEntries) {
    this.entries = this.entries.slice(0, this.display.maxEntries);
  }
  
  this.automation.lastUpdate = new Date();
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

LeaderboardSchema.methods.addComment = function(userId: ObjectId, message: string, targetRank?: number): Promise<ILeaderboard> {
  this.social.comments.push({
    userId,
    message,
    targetRank,
    likes: 0,
    replies: [],
    createdAt: new Date()
  });
  
  // Keep only last 500 comments
  if (this.social.comments.length > 500) {
    this.social.comments = this.social.comments.slice(-500);
  }
  
  this.analytics.engagement.commentCount += 1;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

LeaderboardSchema.methods.addReaction = function(userId: ObjectId, type: string, targetRank?: number): Promise<ILeaderboard> {
  // Remove existing reaction from same user for same target
  this.social.reactions = this.social.reactions.filter(
    (reaction: any) => !(reaction.userId.toString() === userId.toString() && reaction.targetRank === targetRank)
  );
  
  this.social.reactions.push({
    type,
    userId,
    targetRank,
    createdAt: new Date()
  });
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

LeaderboardSchema.methods.follow = function(userId: ObjectId): Promise<ILeaderboard> {
  const existingFollower = this.social.followers.find(
    (follower: any) => follower.userId.toString() === userId.toString()
  );
  
  if (!existingFollower) {
    this.social.followers.push({
      userId,
      followedAt: new Date(),
      notifications: true
    });
  }
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

LeaderboardSchema.methods.unfollow = function(userId: ObjectId): Promise<ILeaderboard> {
  this.social.followers = this.social.followers.filter(
    (follower: any) => follower.userId.toString() !== userId.toString()
  );
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

LeaderboardSchema.methods.incrementViews = function(): Promise<ILeaderboard> {
  this.analytics.engagement.viewCount += 1;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

LeaderboardSchema.methods.incrementShares = function(): Promise<ILeaderboard> {
  this.analytics.engagement.shareCount += 1;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

LeaderboardSchema.methods.reset = function(): Promise<ILeaderboard> {
  // Archive current entries if needed
  const archiveData = {
    period: this.scope,
    resetDate: new Date(),
    entries: [...this.entries]
  };
  
  // Clear entries
  this.entries = [];
  
  // Reset analytics
  this.analytics.participation = {
    totalParticipants: 0,
    activeParticipants: 0,
    newParticipants: 0,
    returningParticipants: 0,
    dropoutRate: 0
  };
  
  this.timestamps.lastReset = new Date();
  this.timestamps.updatedAt = new Date();
  
  // Calculate next reset if recurring
  if (this.timeframe.resetSchedule) {
    this.timestamps.nextReset = this.calculateNextReset();
  }
  
  return this.save();
};

LeaderboardSchema.methods.calculateNextReset = function(): Date {
  if (!this.timeframe.resetSchedule) return new Date();
  
  const now = new Date();
  const schedule = this.timeframe.resetSchedule;
  const timeParts = schedule.time.split(':');
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);
  
  let nextReset = new Date(now);
  nextReset.setHours(hour, minute, 0, 0);
  
  switch (schedule.frequency) {
    case 'daily':
      if (nextReset <= now) {
        nextReset.setDate(nextReset.getDate() + 1);
      }
      break;
      
    case 'weekly':
      const targetDay = schedule.dayOfWeek || 0;
      const currentDay = nextReset.getDay();
      const daysToAdd = (targetDay - currentDay + 7) % 7;
      nextReset.setDate(nextReset.getDate() + daysToAdd);
      
      if (nextReset <= now) {
        nextReset.setDate(nextReset.getDate() + 7);
      }
      break;
      
    case 'monthly':
      const targetDate = schedule.dayOfMonth || 1;
      nextReset.setDate(targetDate);
      
      if (nextReset <= now) {
        nextReset.setMonth(nextReset.getMonth() + 1);
      }
      break;
      
    case 'yearly':
      nextReset.setFullYear(nextReset.getFullYear() + 1);
      nextReset.setMonth(0, 1); // January 1st
      break;
  }
  
  return nextReset;
};

LeaderboardSchema.methods.updateAnalytics = function(): Promise<ILeaderboard> {
  const now = new Date();
  
  // Calculate performance metrics
  const scores = this.entries.map((entry: any) => entry.score);
  this.analytics.performance.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length || 0;
  this.analytics.performance.medianScore = this.calculateMedian(scores);
  
  // Calculate score distribution
  this.analytics.performance.scoreDistribution = this.calculateScoreDistribution(scores);
  
  // Calculate improvement rate
  const improvingParticipants = this.entries.filter(
    (entry: any) => entry.scoreChange && entry.scoreChange > 0
  ).length;
  this.analytics.performance.improvementRate = (improvingParticipants / this.entries.length) * 100 || 0;
  
  // Calculate competition intensity (how close the top ranks are)
  if (this.entries.length >= 3) {
    const topThreeScores = this.entries.slice(0, 3).map((entry: any) => entry.score);
    const scoreRange = Math.max(...topThreeScores) - Math.min(...topThreeScores);
    const maxScore = Math.max(...topThreeScores);
    this.analytics.performance.competitionIntensity = maxScore > 0 ? (1 - (scoreRange / maxScore)) * 100 : 0;
  }
  
  // Update participation metrics
  this.analytics.participation.totalParticipants = this.entries.length;
  this.analytics.participation.activeParticipants = this.entries.filter(
    (entry: any) => {
      const daysSinceActive = (now.getTime() - entry.lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 7; // Active within last week
    }
  ).length;
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

LeaderboardSchema.methods.calculateMedian = function(scores: number[]): number {
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
};

LeaderboardSchema.methods.calculateScoreDistribution = function(scores: number[]): Array<{range: string; count: number; percentage: number}> {
  if (scores.length === 0) return [];
  
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const range = max - min;
  const bucketSize = range / 5; // 5 buckets
  
  const buckets = [
    { range: `${min}-${Math.round(min + bucketSize)}`, count: 0, percentage: 0 },
    { range: `${Math.round(min + bucketSize)}-${Math.round(min + 2 * bucketSize)}`, count: 0, percentage: 0 },
    { range: `${Math.round(min + 2 * bucketSize)}-${Math.round(min + 3 * bucketSize)}`, count: 0, percentage: 0 },
    { range: `${Math.round(min + 3 * bucketSize)}-${Math.round(min + 4 * bucketSize)}`, count: 0, percentage: 0 },
    { range: `${Math.round(min + 4 * bucketSize)}-${max}`, count: 0, percentage: 0 }
  ];
  
  scores.forEach(score => {
    const bucketIndex = Math.min(Math.floor((score - min) / bucketSize), 4);
    buckets[bucketIndex].count++;
  });
  
  buckets.forEach(bucket => {
    bucket.percentage = (bucket.count / scores.length) * 100;
  });
  
  return buckets;
};

// Static methods
LeaderboardSchema.statics.getPublic = function() {
  return this.find({ 
    'metadata.isActive': true,
    'privacy.isPublic': true
  })
    .sort({ 'analytics.engagement.viewCount': -1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

LeaderboardSchema.statics.getFeatured = function() {
  return this.find({ 
    'metadata.isFeatured': true, 
    'metadata.isActive': true,
    'privacy.isPublic': true
  })
    .sort({ 'analytics.engagement.viewCount': -1 })
    .limit(10)
    .populate('metadata.createdBy', 'username firstName lastName');
};

LeaderboardSchema.statics.getByCategory = function(category: string) {
  return this.find({ 
    category,
    'metadata.isActive': true,
    'privacy.isPublic': true
  })
    .sort({ 'analytics.engagement.viewCount': -1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

LeaderboardSchema.statics.searchLeaderboards = function(searchTerm: string, filters: any = {}) {
  const query: any = {
    'metadata.isActive': true,
    'privacy.isPublic': true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { 'metadata.tags': { $regex: searchTerm, $options: 'i' } }
    ]
  };

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.scope) query.scope = filters.scope;

  return this.find(query)
    .sort({ 'analytics.engagement.viewCount': -1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

// Pre-save middleware
LeaderboardSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  
  // Calculate next update time
  if (this.automation.updateFrequency !== 'realtime') {
    const now = new Date();
    const nextUpdate = new Date(now);
    
    switch (this.automation.updateFrequency) {
      case 'hourly':
        nextUpdate.setHours(nextUpdate.getHours() + 1);
        break;
      case 'daily':
        nextUpdate.setDate(nextUpdate.getDate() + 1);
        break;
      case 'weekly':
        nextUpdate.setDate(nextUpdate.getDate() + 7);
        break;
    }
    
    this.automation.nextUpdate = nextUpdate;
  }
  
  next();
});

export const Leaderboard = mongoose.model<ILeaderboard>('Leaderboard', LeaderboardSchema);