import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IAnalytics extends Document {
  _id: ObjectId;
  entityType: 'user' | 'assignment' | 'activity' | 'conversation' | 'class' | 'course' | 'system';
  entityId: ObjectId;
  period: {
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    startDate: Date;
    endDate: Date;
    timezone: string;
  };
  metrics: {
    engagement: {
      totalSessions: number;
      averageSessionDuration: number; // in minutes
      totalTimeSpent: number; // in minutes
      uniqueUsers: number;
      returningUsers: number;
      bounceRate: number; // percentage
      pageViews: number;
      clickThroughRate: number; // percentage
    };
    performance: {
      completionRate: number; // percentage
      averageScore: number;
      passRate: number; // percentage
      improvementRate: number; // percentage
      strugglingUsers: number;
      excellentPerformers: number;
      averageAttempts: number;
      timeToCompletion: number; // in minutes
    };
    learning: {
      conceptsMastered: number;
      skillsAcquired: number;
      learningObjectivesAchieved: number;
      knowledgeRetention: number; // percentage
      transferability: number; // percentage
      depthOfUnderstanding: number; // 1-10 scale
      criticalThinkingScore: number; // 1-10 scale
      creativityScore: number; // 1-10 scale
    };
    collaboration: {
      messagesExchanged: number;
      collaborativeActivities: number;
      peerInteractions: number;
      groupProjectsCompleted: number;
      helpRequestsMade: number;
      helpOffered: number;
      discussionParticipation: number; // percentage
      leadershipRoles: number;
    };
    behavioral: {
      loginFrequency: number;
      procrastinationScore: number; // 1-10 scale
      motivationLevel: number; // 1-10 scale
      persistenceScore: number; // 1-10 scale
      autonomyLevel: number; // 1-10 scale
      riskTaking: number; // 1-10 scale
      adaptability: number; // 1-10 scale
      timeManagement: number; // 1-10 scale
    };
    content: {
      resourcesAccessed: number;
      contentCreated: number;
      sharedContent: number;
      bookmarkedItems: number;
      notesCreated: number;
      annotationsMade: number;
      downloadsInitiated: number;
      uploadsCompleted: number;
    };
  };
  trends: {
    engagement: Array<{
      date: Date;
      value: number;
      change: number; // percentage change from previous period
    }>;
    performance: Array<{
      date: Date;
      score: number;
      improvement: number;
    }>;
    learning: Array<{
      date: Date;
      conceptsMastered: number;
      retentionRate: number;
    }>;
    usage: Array<{
      date: Date;
      activeUsers: number;
      sessionCount: number;
      avgDuration: number;
    }>;
  };
  predictions: {
    performance: {
      nextScore: number;
      confidence: number; // percentage
      riskFactors: string[];
      recommendations: string[];
    };
    engagement: {
      retentionProbability: number; // percentage
      churnRisk: number; // percentage
      engagementForecast: number;
      interventionNeeded: boolean;
    };
    learning: {
      masteryTimeline: Date;
      strugglingAreas: string[];
      strengthAreas: string[];
      nextConcepts: string[];
    };
  };
  comparisons: {
    cohortAverage: {
      engagement: number;
      performance: number;
      learning: number;
    };
    previousPeriod: {
      engagementChange: number; // percentage
      performanceChange: number; // percentage
      learningChange: number; // percentage
    };
    benchmarks: {
      industryAverage: number;
      topPerformers: number;
      institutionAverage: number;
    };
  };
  insights: Array<{
    type: 'achievement' | 'concern' | 'opportunity' | 'recommendation' | 'milestone';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'engagement' | 'performance' | 'learning' | 'collaboration' | 'behavioral';
    title: string;
    description: string;
    evidence: string[];
    actionItems: string[];
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number; // percentage
    generatedAt: Date;
  }>;
  visualizations: {
    charts: Array<{
      type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'radar' | 'funnel';
      title: string;
      description: string;
      data: any;
      config: any;
      category: string;
    }>;
    dashboards: Array<{
      name: string;
      description: string;
      widgets: Array<{
        type: string;
        title: string;
        data: any;
        position: { x: number; y: number; width: number; height: number };
      }>;
    }>;
  };
  metadata: {
    generatedBy: ObjectId;
    generationMethod: 'automatic' | 'manual' | 'scheduled';
    dataQuality: {
      completeness: number; // percentage
      accuracy: number; // percentage
      timeliness: number; // percentage
      consistency: number; // percentage
    };
    sources: Array<{
      type: string;
      entityId: ObjectId;
      dataPoints: number;
      lastUpdated: Date;
    }>;
    version: string;
    tags: string[];
  };
  access: {
    visibility: 'public' | 'private' | 'restricted';
    sharedWith: Array<{
      userId: ObjectId;
      permissions: string[];
      sharedAt: Date;
    }>;
    departments: string[];
    roles: string[];
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    lastCalculated: Date;
    nextUpdate: Date;
    archivedAt?: Date;
  };
}

const AnalyticsSchema = new Schema<IAnalytics>({
  entityType: {
    type: String,
    enum: ['user', 'assignment', 'activity', 'conversation', 'class', 'course', 'system'],
    required: true,
    index: true
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  period: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
      required: true
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    timezone: { type: String, default: 'UTC' }
  },
  metrics: {
    engagement: {
      totalSessions: { type: Number, default: 0 },
      averageSessionDuration: { type: Number, default: 0 },
      totalTimeSpent: { type: Number, default: 0 },
      uniqueUsers: { type: Number, default: 0 },
      returningUsers: { type: Number, default: 0 },
      bounceRate: { type: Number, default: 0 },
      pageViews: { type: Number, default: 0 },
      clickThroughRate: { type: Number, default: 0 }
    },
    performance: {
      completionRate: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 },
      improvementRate: { type: Number, default: 0 },
      strugglingUsers: { type: Number, default: 0 },
      excellentPerformers: { type: Number, default: 0 },
      averageAttempts: { type: Number, default: 0 },
      timeToCompletion: { type: Number, default: 0 }
    },
    learning: {
      conceptsMastered: { type: Number, default: 0 },
      skillsAcquired: { type: Number, default: 0 },
      learningObjectivesAchieved: { type: Number, default: 0 },
      knowledgeRetention: { type: Number, default: 0 },
      transferability: { type: Number, default: 0 },
      depthOfUnderstanding: { type: Number, default: 0 },
      criticalThinkingScore: { type: Number, default: 0 },
      creativityScore: { type: Number, default: 0 }
    },
    collaboration: {
      messagesExchanged: { type: Number, default: 0 },
      collaborativeActivities: { type: Number, default: 0 },
      peerInteractions: { type: Number, default: 0 },
      groupProjectsCompleted: { type: Number, default: 0 },
      helpRequestsMade: { type: Number, default: 0 },
      helpOffered: { type: Number, default: 0 },
      discussionParticipation: { type: Number, default: 0 },
      leadershipRoles: { type: Number, default: 0 }
    },
    behavioral: {
      loginFrequency: { type: Number, default: 0 },
      procrastinationScore: { type: Number, default: 5 },
      motivationLevel: { type: Number, default: 5 },
      persistenceScore: { type: Number, default: 5 },
      autonomyLevel: { type: Number, default: 5 },
      riskTaking: { type: Number, default: 5 },
      adaptability: { type: Number, default: 5 },
      timeManagement: { type: Number, default: 5 }
    },
    content: {
      resourcesAccessed: { type: Number, default: 0 },
      contentCreated: { type: Number, default: 0 },
      sharedContent: { type: Number, default: 0 },
      bookmarkedItems: { type: Number, default: 0 },
      notesCreated: { type: Number, default: 0 },
      annotationsMade: { type: Number, default: 0 },
      downloadsInitiated: { type: Number, default: 0 },
      uploadsCompleted: { type: Number, default: 0 }
    }
  },
  trends: {
    engagement: [{
      date: { type: Date, required: true },
      value: { type: Number, required: true },
      change: { type: Number, default: 0 }
    }],
    performance: [{
      date: { type: Date, required: true },
      score: { type: Number, required: true },
      improvement: { type: Number, default: 0 }
    }],
    learning: [{
      date: { type: Date, required: true },
      conceptsMastered: { type: Number, required: true },
      retentionRate: { type: Number, required: true }
    }],
    usage: [{
      date: { type: Date, required: true },
      activeUsers: { type: Number, required: true },
      sessionCount: { type: Number, required: true },
      avgDuration: { type: Number, required: true }
    }]
  },
  predictions: {
    performance: {
      nextScore: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      riskFactors: [{ type: String }],
      recommendations: [{ type: String }]
    },
    engagement: {
      retentionProbability: { type: Number, default: 0 },
      churnRisk: { type: Number, default: 0 },
      engagementForecast: { type: Number, default: 0 },
      interventionNeeded: { type: Boolean, default: false }
    },
    learning: {
      masteryTimeline: { type: Date },
      strugglingAreas: [{ type: String }],
      strengthAreas: [{ type: String }],
      nextConcepts: [{ type: String }]
    }
  },
  comparisons: {
    cohortAverage: {
      engagement: { type: Number, default: 0 },
      performance: { type: Number, default: 0 },
      learning: { type: Number, default: 0 }
    },
    previousPeriod: {
      engagementChange: { type: Number, default: 0 },
      performanceChange: { type: Number, default: 0 },
      learningChange: { type: Number, default: 0 }
    },
    benchmarks: {
      industryAverage: { type: Number, default: 0 },
      topPerformers: { type: Number, default: 0 },
      institutionAverage: { type: Number, default: 0 }
    }
  },
  insights: [{
    type: {
      type: String,
      enum: ['achievement', 'concern', 'opportunity', 'recommendation', 'milestone'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    category: {
      type: String,
      enum: ['engagement', 'performance', 'learning', 'collaboration', 'behavioral'],
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    evidence: [{ type: String }],
    actionItems: [{ type: String }],
    impact: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      required: true
    },
    confidence: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now }
  }],
  visualizations: {
    charts: [{
      type: {
        type: String,
        enum: ['line', 'bar', 'pie', 'scatter', 'heatmap', 'radar', 'funnel'],
        required: true
      },
      title: { type: String, required: true },
      description: { type: String },
      data: { type: Schema.Types.Mixed },
      config: { type: Schema.Types.Mixed },
      category: { type: String, required: true }
    }],
    dashboards: [{
      name: { type: String, required: true },
      description: { type: String },
      widgets: [{
        type: { type: String, required: true },
        title: { type: String, required: true },
        data: { type: Schema.Types.Mixed },
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
          width: { type: Number, required: true },
          height: { type: Number, required: true }
        }
      }]
    }]
  },
  metadata: {
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    generationMethod: {
      type: String,
      enum: ['automatic', 'manual', 'scheduled'],
      default: 'automatic'
    },
    dataQuality: {
      completeness: { type: Number, default: 100 },
      accuracy: { type: Number, default: 100 },
      timeliness: { type: Number, default: 100 },
      consistency: { type: Number, default: 100 }
    },
    sources: [{
      type: { type: String, required: true },
      entityId: { type: Schema.Types.ObjectId, required: true },
      dataPoints: { type: Number, required: true },
      lastUpdated: { type: Date, required: true }
    }],
    version: { type: String, default: '1.0.0' },
    tags: [{ type: String }]
  },
  access: {
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'private'
    },
    sharedWith: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      permissions: [{ type: String }],
      sharedAt: { type: Date, default: Date.now }
    }],
    departments: [{ type: String }],
    roles: [{ type: String }]
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    lastCalculated: { type: Date, default: Date.now },
    nextUpdate: { type: Date, index: true },
    archivedAt: { type: Date }
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Compound indexes for better query performance
AnalyticsSchema.index({ entityType: 1, entityId: 1, 'period.type': 1 });
AnalyticsSchema.index({ entityType: 1, 'period.startDate': 1, 'period.endDate': 1 });
AnalyticsSchema.index({ 'metadata.generatedBy': 1, 'timestamps.createdAt': -1 });
AnalyticsSchema.index({ 'access.visibility': 1, 'access.departments': 1 });
AnalyticsSchema.index({ 'insights.priority': 1, 'insights.category': 1 });

// Instance methods
AnalyticsSchema.methods.addInsight = function(insight: any): Promise<IAnalytics> {
  this.insights.push({
    ...insight,
    generatedAt: new Date()
  });
  
  // Sort insights by priority and date
  this.insights.sort((a: any, b: any) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    
    if (aPriority !== bPriority) return bPriority - aPriority;
    return b.generatedAt.getTime() - a.generatedAt.getTime();
  });
  
  // Keep only the most recent 50 insights
  if (this.insights.length > 50) {
    this.insights = this.insights.slice(0, 50);
  }
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

AnalyticsSchema.methods.updateTrend = function(
  type: 'engagement' | 'performance' | 'learning' | 'usage',
  data: any
): Promise<IAnalytics> {
  const trendArray = this.trends[type];
  
  // Remove existing entry for the same date
  const existingIndex = trendArray.findIndex((item: any) => 
    item.date.toDateString() === data.date.toDateString()
  );
  
  if (existingIndex >= 0) {
    trendArray[existingIndex] = data;
  } else {
    trendArray.push(data);
  }
  
  // Sort by date and keep only last 90 days
  trendArray.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
  if (trendArray.length > 90) {
    this.trends[type] = trendArray.slice(0, 90);
  }
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

AnalyticsSchema.methods.calculateEngagementScore = function(): number {
  const metrics = this.metrics.engagement;
  const weights = {
    sessionDuration: 0.3,
    frequency: 0.25,
    clickThrough: 0.2,
    retention: 0.15,
    bounce: 0.1
  };
  
  const normalizedDuration = Math.min(metrics.averageSessionDuration / 30, 1); // 30 min = perfect
  const normalizedFrequency = Math.min(metrics.totalSessions / 20, 1); // 20 sessions = perfect
  const normalizedCTR = metrics.clickThroughRate / 100;
  const normalizedRetention = (metrics.returningUsers / Math.max(metrics.uniqueUsers, 1));
  const normalizedBounce = 1 - (metrics.bounceRate / 100);
  
  const score = (
    normalizedDuration * weights.sessionDuration +
    normalizedFrequency * weights.frequency +
    normalizedCTR * weights.clickThrough +
    normalizedRetention * weights.retention +
    normalizedBounce * weights.bounce
  ) * 100;
  
  return Math.round(score);
};

AnalyticsSchema.methods.calculatePerformanceScore = function(): number {
  const metrics = this.metrics.performance;
  const weights = {
    completion: 0.3,
    score: 0.3,
    improvement: 0.2,
    efficiency: 0.2
  };
  
  const normalizedCompletion = metrics.completionRate / 100;
  const normalizedScore = metrics.averageScore / 100;
  const normalizedImprovement = Math.min(metrics.improvementRate / 20, 1); // 20% improvement = perfect
  const normalizedEfficiency = metrics.averageAttempts > 0 ? Math.min(1 / metrics.averageAttempts, 1) : 0;
  
  const score = (
    normalizedCompletion * weights.completion +
    normalizedScore * weights.score +
    normalizedImprovement * weights.improvement +
    normalizedEfficiency * weights.efficiency
  ) * 100;
  
  return Math.round(score);
};

AnalyticsSchema.methods.generateVisualization = function(
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'radar' | 'funnel',
  category: string,
  customData?: any
): any {
  const visualization = {
    type,
    title: '',
    description: '',
    data: customData || {},
    config: {},
    category
  };
  
  switch (type) {
    case 'line':
      if (category === 'engagement') {
        visualization.title = 'Engagement Trend';
        visualization.description = 'Daily engagement metrics over time';
        visualization.data = {
          labels: this.trends.engagement.map((item: any) => item.date),
          datasets: [{
            label: 'Engagement Score',
            data: this.trends.engagement.map((item: any) => item.value),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }]
        };
      }
      break;
      
    case 'bar':
      if (category === 'performance') {
        visualization.title = 'Performance Metrics';
        visualization.description = 'Current performance indicators';
        visualization.data = {
          labels: ['Completion Rate', 'Average Score', 'Pass Rate', 'Improvement Rate'],
          datasets: [{
            label: 'Performance %',
            data: [
              this.metrics.performance.completionRate,
              this.metrics.performance.averageScore,
              this.metrics.performance.passRate,
              this.metrics.performance.improvementRate
            ],
            backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']
          }]
        };
      }
      break;
      
    case 'radar':
      if (category === 'behavioral') {
        visualization.title = 'Behavioral Profile';
        visualization.description = 'Student behavioral characteristics';
        visualization.data = {
          labels: ['Motivation', 'Persistence', 'Autonomy', 'Adaptability', 'Time Management', 'Risk Taking'],
          datasets: [{
            label: 'Score',
            data: [
              this.metrics.behavioral.motivationLevel,
              this.metrics.behavioral.persistenceScore,
              this.metrics.behavioral.autonomyLevel,
              this.metrics.behavioral.adaptability,
              this.metrics.behavioral.timeManagement,
              this.metrics.behavioral.riskTaking
            ],
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: '#6366F1'
          }]
        };
      }
      break;
  }
  
  this.visualizations.charts.push(visualization);
  return visualization;
};

AnalyticsSchema.methods.shareWithUser = function(
  userId: ObjectId,
  permissions: string[]
): Promise<IAnalytics> {
  // Remove existing share for this user
  this.access.sharedWith = this.access.sharedWith.filter(
    (share: any) => share.userId.toString() !== userId.toString()
  );
  
  // Add new share
  this.access.sharedWith.push({
    userId,
    permissions,
    sharedAt: new Date()
  });
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

// Static methods
AnalyticsSchema.statics.getByEntity = function(
  entityType: string,
  entityId: ObjectId,
  periodType?: string,
  dateRange?: { start: Date; end: Date }
) {
  const query: any = { entityType, entityId };
  
  if (periodType) {
    query['period.type'] = periodType;
  }
  
  if (dateRange) {
    query['period.startDate'] = { $gte: dateRange.start };
    query['period.endDate'] = { $lte: dateRange.end };
  }
  
  return this.find(query)
    .sort({ 'period.startDate': -1 })
    .populate('metadata.generatedBy', 'username firstName lastName');
};

AnalyticsSchema.statics.getBenchmarkData = function(
  entityType: string,
  periodType: string,
  departments?: string[]
) {
  const matchConditions: any = { entityType, 'period.type': periodType };
  
  if (departments && departments.length > 0) {
    matchConditions['access.departments'] = { $in: departments };
  }
  
  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        avgEngagement: { $avg: '$metrics.engagement.totalSessions' },
        avgPerformance: { $avg: '$metrics.performance.averageScore' },
        avgCompletion: { $avg: '$metrics.performance.completionRate' },
        avgLearning: { $avg: '$metrics.learning.conceptsMastered' },
        count: { $sum: 1 }
      }
    }
  ]);
};

AnalyticsSchema.statics.generateSystemReport = function(
  startDate: Date,
  endDate: Date,
  departments?: string[]
) {
  const matchConditions: any = {
    'period.startDate': { $gte: startDate },
    'period.endDate': { $lte: endDate }
  };
  
  if (departments && departments.length > 0) {
    matchConditions['access.departments'] = { $in: departments };
  }
  
  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: '$entityType',
        totalEntities: { $sum: 1 },
        avgEngagement: { $avg: '$metrics.engagement.totalSessions' },
        avgPerformance: { $avg: '$metrics.performance.averageScore' },
        totalUsers: { $sum: '$metrics.engagement.uniqueUsers' },
        totalSessions: { $sum: '$metrics.engagement.totalSessions' },
        totalTimeSpent: { $sum: '$metrics.engagement.totalTimeSpent' },
        criticalInsights: {
          $sum: {
            $size: {
              $filter: {
                input: '$insights',
                cond: { $eq: ['$$this.priority', 'critical'] }
              }
            }
          }
        }
      }
    },
    {
      $sort: { totalUsers: -1 }
    }
  ]);
};

AnalyticsSchema.statics.cleanupOldAnalytics = function(daysToKeep: number = 365) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  return this.deleteMany({
    'timestamps.createdAt': { $lt: cutoffDate },
    'period.type': { $in: ['daily', 'weekly'] } // Keep monthly and yearly data longer
  });
};

// Pre-save middleware
AnalyticsSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  
  // Schedule next update based on period type
  const now = new Date();
  switch (this.period.type) {
    case 'daily':
      this.timestamps.nextUpdate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'weekly':
      this.timestamps.nextUpdate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      this.timestamps.nextUpdate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    default:
      this.timestamps.nextUpdate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
  
  next();
});

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);