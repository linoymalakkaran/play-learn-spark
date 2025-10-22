import { Analytics, IAnalytics } from '../models/Analytics';
import { Report, IReport } from '../models/Report';
import { Assignment } from '../models/Assignment';
import { Activity } from '../models/Activity';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { EventEmitter } from 'events';
import { ObjectId } from 'mongoose';

export class AnalyticsService extends EventEmitter {
  constructor() {
    super();
  }

  // Core Analytics Generation
  async generateAnalytics(
    entityType: 'user' | 'assignment' | 'activity' | 'conversation' | 'class' | 'course' | 'system',
    entityId: ObjectId,
    periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
    dateRange: { start: Date; end: Date },
    generatedBy: ObjectId,
    options: {
      includePredictions?: boolean;
      includeComparisons?: boolean;
      includeInsights?: boolean;
      timezone?: string;
    } = {}
  ): Promise<IAnalytics> {
    try {
      this.emit('analytics:generation:started', { entityType, entityId, periodType });

      // Check if analytics already exists for this period
      const existing = await Analytics.findOne({
        entityType,
        entityId,
        'period.type': periodType,
        'period.startDate': dateRange.start,
        'period.endDate': dateRange.end
      });

      if (existing) {
        // Update existing analytics
        await this.updateAnalytics(existing._id, options);
        this.emit('analytics:generation:completed', { analyticsId: existing._id });
        return existing;
      }

      // Create new analytics document
      const analytics = new Analytics({
        entityType,
        entityId,
        period: {
          type: periodType,
          startDate: dateRange.start,
          endDate: dateRange.end,
          timezone: options.timezone || 'UTC'
        },
        metadata: {
          generatedBy,
          generationMethod: 'automatic',
          version: '1.0.0',
          sources: []
        }
      });

      // Generate metrics based on entity type
      await this.calculateMetrics(analytics, dateRange);

      // Generate trends
      await this.calculateTrends(analytics, dateRange);

      // Generate predictions if requested
      if (options.includePredictions) {
        await this.generatePredictions(analytics);
      }

      // Generate comparisons if requested
      if (options.includeComparisons) {
        await this.generateComparisons(analytics);
      }

      // Generate insights if requested
      if (options.includeInsights) {
        await this.generateInsights(analytics);
      }

      // Generate visualizations
      await this.generateVisualizations(analytics);

      await analytics.save();
      this.emit('analytics:generation:completed', { analyticsId: analytics._id });

      return analytics;
    } catch (error) {
      this.emit('analytics:generation:failed', { entityType, entityId, error });
      throw error;
    }
  }

  // Calculate comprehensive metrics
  private async calculateMetrics(analytics: IAnalytics, dateRange: { start: Date; end: Date }): Promise<void> {
    const { entityType, entityId } = analytics;

    switch (entityType) {
      case 'user':
        await this.calculateUserMetrics(analytics, dateRange);
        break;
      case 'assignment':
        await this.calculateAssignmentMetrics(analytics, dateRange);
        break;
      case 'activity':
        await this.calculateActivityMetrics(analytics, dateRange);
        break;
      case 'conversation':
        await this.calculateConversationMetrics(analytics, dateRange);
        break;
      case 'class':
        await this.calculateClassMetrics(analytics, dateRange);
        break;
      case 'course':
        await this.calculateCourseMetrics(analytics, dateRange);
        break;
      case 'system':
        await this.calculateSystemMetrics(analytics, dateRange);
        break;
    }
  }

  private async calculateUserMetrics(analytics: IAnalytics, dateRange: { start: Date; end: Date }): Promise<void> {
    const userId = analytics.entityId;

    // Engagement metrics
    const userSessions = await this.getUserSessions(userId, dateRange);
    analytics.metrics.engagement = {
      totalSessions: userSessions.length,
      averageSessionDuration: this.calculateAverageSessionDuration(userSessions),
      totalTimeSpent: this.calculateTotalTimeSpent(userSessions),
      uniqueUsers: 1,
      returningUsers: userSessions.length > 1 ? 1 : 0,
      bounceRate: this.calculateBounceRate(userSessions),
      pageViews: userSessions.reduce((sum, session) => sum + (session.pageViews || 0), 0),
      clickThroughRate: this.calculateClickThroughRate(userSessions)
    };

    // Performance metrics
    const userAssignments = await Assignment.find({
      assignedTo: userId,
      'submissions.submittedAt': { $gte: dateRange.start, $lte: dateRange.end }
    });

    const completedAssignments = userAssignments.filter(a => 
      a.submissions.some(s => s.userId.toString() === userId.toString() && s.status === 'completed')
    );

    analytics.metrics.performance = {
      completionRate: userAssignments.length > 0 ? (completedAssignments.length / userAssignments.length) * 100 : 0,
      averageScore: this.calculateAverageScore(completedAssignments, userId),
      passRate: this.calculatePassRate(completedAssignments, userId),
      improvementRate: await this.calculateImprovementRate(userId, dateRange),
      strugglingUsers: 0, // Not applicable for individual user
      excellentPerformers: 0, // Not applicable for individual user
      averageAttempts: this.calculateAverageAttempts(completedAssignments, userId),
      timeToCompletion: this.calculateAverageTimeToCompletion(completedAssignments, userId)
    };

    // Learning metrics
    analytics.metrics.learning = {
      conceptsMastered: await this.getConceptsMastered(userId, dateRange),
      skillsAcquired: await this.getSkillsAcquired(userId, dateRange),
      learningObjectivesAchieved: await this.getLearningObjectivesAchieved(userId, dateRange),
      knowledgeRetention: await this.calculateKnowledgeRetention(userId, dateRange),
      transferability: await this.calculateTransferability(userId, dateRange),
      depthOfUnderstanding: await this.calculateDepthOfUnderstanding(userId, dateRange),
      criticalThinkingScore: await this.calculateCriticalThinkingScore(userId, dateRange),
      creativityScore: await this.calculateCreativityScore(userId, dateRange)
    };

    // Collaboration metrics
    const userMessages = await Message.find({
      sender: userId,
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });

    const userConversations = await Conversation.find({
      participants: userId,
      updatedAt: { $gte: dateRange.start, $lte: dateRange.end }
    });

    analytics.metrics.collaboration = {
      messagesExchanged: userMessages.length,
      collaborativeActivities: await this.getCollaborativeActivities(userId, dateRange),
      peerInteractions: await this.getPeerInteractions(userId, dateRange),
      groupProjectsCompleted: await this.getGroupProjectsCompleted(userId, dateRange),
      helpRequestsMade: userMessages.filter(m => m.metadata?.type === 'help_request').length,
      helpOffered: userMessages.filter(m => m.metadata?.type === 'help_offered').length,
      discussionParticipation: this.calculateDiscussionParticipation(userConversations, userId),
      leadershipRoles: await this.getLeadershipRoles(userId, dateRange)
    };

    // Behavioral metrics
    analytics.metrics.behavioral = {
      loginFrequency: userSessions.length,
      procrastinationScore: await this.calculateProcrastinationScore(userId, dateRange),
      motivationLevel: await this.calculateMotivationLevel(userId, dateRange),
      persistenceScore: await this.calculatePersistenceScore(userId, dateRange),
      autonomyLevel: await this.calculateAutonomyLevel(userId, dateRange),
      riskTaking: await this.calculateRiskTaking(userId, dateRange),
      adaptability: await this.calculateAdaptability(userId, dateRange),
      timeManagement: await this.calculateTimeManagement(userId, dateRange)
    };

    // Content metrics
    analytics.metrics.content = {
      resourcesAccessed: await this.getResourcesAccessed(userId, dateRange),
      contentCreated: await this.getContentCreated(userId, dateRange),
      sharedContent: await this.getSharedContent(userId, dateRange),
      bookmarkedItems: await this.getBookmarkedItems(userId, dateRange),
      notesCreated: await this.getNotesCreated(userId, dateRange),
      annotationsMade: await this.getAnnotationsMade(userId, dateRange),
      downloadsInitiated: await this.getDownloadsInitiated(userId, dateRange),
      uploadsCompleted: await this.getUploadsCompleted(userId, dateRange)
    };
  }

  private async calculateAssignmentMetrics(analytics: IAnalytics, dateRange: { start: Date; end: Date }): Promise<void> {
    const assignmentId = analytics.entityId;
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) return;

    const submissions = assignment.submissions.filter(s => 
      s.submittedAt && s.submittedAt >= dateRange.start && s.submittedAt <= dateRange.end
    );

    // Engagement metrics
    analytics.metrics.engagement = {
      totalSessions: submissions.length,
      averageSessionDuration: this.calculateAverageSubmissionTime(submissions),
      totalTimeSpent: submissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0),
      uniqueUsers: new Set(submissions.map(s => s.userId.toString())).size,
      returningUsers: this.calculateReturningUsers(submissions),
      bounceRate: this.calculateAssignmentBounceRate(submissions),
      pageViews: submissions.reduce((sum, s) => sum + (s.views || 1), 0),
      clickThroughRate: this.calculateAssignmentCTR(assignment, submissions)
    };

    // Performance metrics
    const completedSubmissions = submissions.filter(s => s.status === 'completed');
    analytics.metrics.performance = {
      completionRate: submissions.length > 0 ? (completedSubmissions.length / submissions.length) * 100 : 0,
      averageScore: completedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / Math.max(completedSubmissions.length, 1),
      passRate: this.calculateSubmissionPassRate(completedSubmissions),
      improvementRate: this.calculateSubmissionImprovementRate(submissions),
      strugglingUsers: this.identifyStrugglingUsers(submissions).length,
      excellentPerformers: this.identifyExcellentPerformers(submissions).length,
      averageAttempts: submissions.reduce((sum, s) => sum + (s.attempts || 1), 0) / Math.max(submissions.length, 1),
      timeToCompletion: this.calculateAverageCompletionTime(completedSubmissions)
    };

    // Add data source
    analytics.metadata.sources.push({
      type: 'assignment',
      entityId: assignmentId,
      dataPoints: submissions.length,
      lastUpdated: new Date()
    });
  }

  private async calculateActivityMetrics(analytics: IAnalytics, dateRange: { start: Date; end: Date }): Promise<void> {
    const activityId = analytics.entityId;
    const activity = await Activity.findById(activityId);

    if (!activity) return;

    // Mock activity interaction data - in real implementation, this would come from activity logs
    const interactions = await this.getActivityInteractions(activityId, dateRange);

    analytics.metrics.engagement = {
      totalSessions: interactions.length,
      averageSessionDuration: interactions.reduce((sum, i) => sum + (i.duration || 0), 0) / Math.max(interactions.length, 1),
      totalTimeSpent: interactions.reduce((sum, i) => sum + (i.duration || 0), 0),
      uniqueUsers: new Set(interactions.map(i => i.userId.toString())).size,
      returningUsers: this.calculateActivityReturningUsers(interactions),
      bounceRate: this.calculateActivityBounceRate(interactions),
      pageViews: interactions.reduce((sum, i) => sum + (i.views || 1), 0),
      clickThroughRate: this.calculateActivityCTR(interactions)
    };

    analytics.metadata.sources.push({
      type: 'activity',
      entityId: activityId,
      dataPoints: interactions.length,
      lastUpdated: new Date()
    });
  }

  private async calculateConversationMetrics(analytics: IAnalytics, dateRange: { start: Date; end: Date }): Promise<void> {
    const conversationId = analytics.entityId;
    const conversation = await Conversation.findById(conversationId).populate('messages');

    if (!conversation) return;

    const messages = await Message.find({
      conversationId,
      createdAt: { $gte: dateRange.start, $lte: dateRange.end }
    });

    analytics.metrics.engagement = {
      totalSessions: messages.length,
      averageSessionDuration: 0, // Not applicable for conversations
      totalTimeSpent: 0, // Not applicable for conversations
      uniqueUsers: new Set(messages.map(m => m.sender.toString())).size,
      returningUsers: this.calculateConversationReturningUsers(messages),
      bounceRate: 0, // Not applicable for conversations
      pageViews: messages.reduce((sum, m) => sum + (m.readBy?.length || 0), 0),
      clickThroughRate: this.calculateConversationCTR(messages)
    };

    analytics.metrics.collaboration = {
      messagesExchanged: messages.length,
      collaborativeActivities: messages.filter(m => m.type === 'activity_share').length,
      peerInteractions: new Set(messages.map(m => m.sender.toString())).size,
      groupProjectsCompleted: 0, // Would need additional data
      helpRequestsMade: messages.filter(m => m.metadata?.type === 'help_request').length,
      helpOffered: messages.filter(m => m.metadata?.type === 'help_offered').length,
      discussionParticipation: (messages.length / Math.max(conversation.participants.length, 1)) * 100,
      leadershipRoles: 0 // Would need additional data
    };

    analytics.metadata.sources.push({
      type: 'conversation',
      entityId: conversationId,
      dataPoints: messages.length,
      lastUpdated: new Date()
    });
  }

  private async calculateClassMetrics(analytics: IAnalytics, dateRange: { start: Date; end: Date }): Promise<void> {
    // Aggregate metrics from all users in the class
    // This would require additional class membership data
    const classId = analytics.entityId;
    
    // Mock implementation - in real system, would aggregate from class members
    analytics.metrics.engagement = {
      totalSessions: 450,
      averageSessionDuration: 25.5,
      totalTimeSpent: 11475,
      uniqueUsers: 25,
      returningUsers: 22,
      bounceRate: 12.5,
      pageViews: 2800,
      clickThroughRate: 68.2
    };

    analytics.metadata.sources.push({
      type: 'class',
      entityId: classId,
      dataPoints: 25, // Number of students
      lastUpdated: new Date()
    });
  }

  private async calculateCourseMetrics(analytics: IAnalytics, dateRange: { start: Date; end: Date }): Promise<void> {
    // Aggregate metrics from all classes in the course
    const courseId = analytics.entityId;
    
    // Mock implementation
    analytics.metrics.engagement = {
      totalSessions: 1250,
      averageSessionDuration: 28.2,
      totalTimeSpent: 35250,
      uniqueUsers: 75,
      returningUsers: 68,
      bounceRate: 15.2,
      pageViews: 8500,
      clickThroughRate: 72.1
    };

    analytics.metadata.sources.push({
      type: 'course',
      entityId: courseId,
      dataPoints: 75, // Number of students
      lastUpdated: new Date()
    });
  }

  private async calculateSystemMetrics(analytics: IAnalytics, dateRange: { start: Date; end: Date }): Promise<void> {
    // System-wide metrics aggregation
    const allAnalytics = await Analytics.find({
      'period.startDate': { $gte: dateRange.start },
      'period.endDate': { $lte: dateRange.end },
      entityType: { $ne: 'system' }
    });

    if (allAnalytics.length === 0) return;

    // Aggregate engagement metrics
    analytics.metrics.engagement = {
      totalSessions: allAnalytics.reduce((sum, a) => sum + a.metrics.engagement.totalSessions, 0),
      averageSessionDuration: allAnalytics.reduce((sum, a) => sum + a.metrics.engagement.averageSessionDuration, 0) / allAnalytics.length,
      totalTimeSpent: allAnalytics.reduce((sum, a) => sum + a.metrics.engagement.totalTimeSpent, 0),
      uniqueUsers: allAnalytics.reduce((sum, a) => sum + a.metrics.engagement.uniqueUsers, 0),
      returningUsers: allAnalytics.reduce((sum, a) => sum + a.metrics.engagement.returningUsers, 0),
      bounceRate: allAnalytics.reduce((sum, a) => sum + a.metrics.engagement.bounceRate, 0) / allAnalytics.length,
      pageViews: allAnalytics.reduce((sum, a) => sum + a.metrics.engagement.pageViews, 0),
      clickThroughRate: allAnalytics.reduce((sum, a) => sum + a.metrics.engagement.clickThroughRate, 0) / allAnalytics.length
    };

    // Aggregate performance metrics
    analytics.metrics.performance = {
      completionRate: allAnalytics.reduce((sum, a) => sum + a.metrics.performance.completionRate, 0) / allAnalytics.length,
      averageScore: allAnalytics.reduce((sum, a) => sum + a.metrics.performance.averageScore, 0) / allAnalytics.length,
      passRate: allAnalytics.reduce((sum, a) => sum + a.metrics.performance.passRate, 0) / allAnalytics.length,
      improvementRate: allAnalytics.reduce((sum, a) => sum + a.metrics.performance.improvementRate, 0) / allAnalytics.length,
      strugglingUsers: allAnalytics.reduce((sum, a) => sum + a.metrics.performance.strugglingUsers, 0),
      excellentPerformers: allAnalytics.reduce((sum, a) => sum + a.metrics.performance.excellentPerformers, 0),
      averageAttempts: allAnalytics.reduce((sum, a) => sum + a.metrics.performance.averageAttempts, 0) / allAnalytics.length,
      timeToCompletion: allAnalytics.reduce((sum, a) => sum + a.metrics.performance.timeToCompletion, 0) / allAnalytics.length
    };

    analytics.metadata.sources.push({
      type: 'system',
      entityId: analytics.entityId,
      dataPoints: allAnalytics.length,
      lastUpdated: new Date()
    });
  }

  // Calculate trends over time
  private async calculateTrends(analytics: IAnalytics, dateRange: { start: Date; end: Date }): Promise<void> {
    const { entityType, entityId } = analytics;
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate daily trend data
    for (let i = 0; i < Math.min(days, 30); i++) {
      const trendDate = new Date(dateRange.start.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Engagement trend
      const engagementValue = this.generateTrendValue(analytics.metrics.engagement.totalSessions, i, days);
      analytics.trends.engagement.push({
        date: trendDate,
        value: engagementValue,
        change: i > 0 ? ((engagementValue - analytics.trends.engagement[i-1].value) / analytics.trends.engagement[i-1].value) * 100 : 0
      });

      // Performance trend
      const performanceScore = this.generateTrendValue(analytics.metrics.performance.averageScore, i, days);
      analytics.trends.performance.push({
        date: trendDate,
        score: performanceScore,
        improvement: i > 0 ? performanceScore - analytics.trends.performance[i-1].score : 0
      });

      // Learning trend
      const conceptsMastered = this.generateTrendValue(analytics.metrics.learning.conceptsMastered, i, days);
      const retentionRate = this.generateTrendValue(analytics.metrics.learning.knowledgeRetention, i, days);
      analytics.trends.learning.push({
        date: trendDate,
        conceptsMastered,
        retentionRate
      });

      // Usage trend
      const activeUsers = this.generateTrendValue(analytics.metrics.engagement.uniqueUsers, i, days);
      const sessionCount = this.generateTrendValue(analytics.metrics.engagement.totalSessions, i, days);
      const avgDuration = this.generateTrendValue(analytics.metrics.engagement.averageSessionDuration, i, days);
      analytics.trends.usage.push({
        date: trendDate,
        activeUsers,
        sessionCount,
        avgDuration
      });
    }
  }

  // Generate predictions using basic trend analysis
  private async generatePredictions(analytics: IAnalytics): Promise<void> {
    // Performance predictions
    const performanceTrend = analytics.trends.performance.slice(-7); // Last 7 days
    const avgImprovement = performanceTrend.reduce((sum, t) => sum + t.improvement, 0) / performanceTrend.length;
    const currentScore = analytics.metrics.performance.averageScore;

    analytics.predictions.performance = {
      nextScore: Math.max(0, Math.min(100, currentScore + avgImprovement * 7)), // 7 days ahead
      confidence: this.calculatePredictionConfidence(performanceTrend),
      riskFactors: this.identifyRiskFactors(analytics),
      recommendations: this.generatePerformanceRecommendations(analytics)
    };

    // Engagement predictions
    const engagementTrend = analytics.trends.engagement.slice(-7);
    const avgEngagementChange = engagementTrend.reduce((sum, t) => sum + t.change, 0) / engagementTrend.length;

    analytics.predictions.engagement = {
      retentionProbability: Math.max(0, Math.min(100, 75 + avgEngagementChange)), // Base 75% retention
      churnRisk: Math.max(0, Math.min(100, 25 - avgEngagementChange)),
      engagementForecast: Math.max(0, analytics.metrics.engagement.totalSessions * (1 + avgEngagementChange / 100)),
      interventionNeeded: avgEngagementChange < -10 || analytics.metrics.engagement.bounceRate > 30
    };

    // Learning predictions
    const learningTrend = analytics.trends.learning.slice(-7);
    const avgConceptsPerDay = learningTrend.reduce((sum, t) => sum + t.conceptsMastered, 0) / learningTrend.length;
    const currentConcepts = analytics.metrics.learning.conceptsMastered;

    const daysToMastery = currentConcepts > 0 ? Math.ceil((100 - currentConcepts) / Math.max(avgConceptsPerDay, 0.1)) : 365;
    const masteryDate = new Date(Date.now() + daysToMastery * 24 * 60 * 60 * 1000);

    analytics.predictions.learning = {
      masteryTimeline: masteryDate,
      strugglingAreas: this.identifyStrugglingAreas(analytics),
      strengthAreas: this.identifyStrengthAreas(analytics),
      nextConcepts: this.suggestNextConcepts(analytics)
    };
  }

  // Generate comparisons with benchmarks and previous periods
  private async generateComparisons(analytics: IAnalytics): Promise<void> {
    // Get cohort average (same entity type)
    const cohortData = await Analytics.getBenchmarkData(analytics.entityType, analytics.period.type);
    
    if (cohortData && cohortData.length > 0) {
      analytics.comparisons.cohortAverage = {
        engagement: cohortData[0].avgEngagement || 0,
        performance: cohortData[0].avgPerformance || 0,
        learning: cohortData[0].avgLearning || 0
      };
    }

    // Get previous period data
    const previousPeriodStart = new Date(analytics.period.startDate);
    const previousPeriodEnd = new Date(analytics.period.endDate);
    
    switch (analytics.period.type) {
      case 'daily':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
        break;
      case 'weekly':
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 7);
        break;
      case 'monthly':
        previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
        previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1);
        break;
    }

    const previousAnalytics = await Analytics.findOne({
      entityType: analytics.entityType,
      entityId: analytics.entityId,
      'period.type': analytics.period.type,
      'period.startDate': previousPeriodStart,
      'period.endDate': previousPeriodEnd
    });

    if (previousAnalytics) {
      const currentEngagement = analytics.calculateEngagementScore();
      const previousEngagement = previousAnalytics.calculateEngagementScore();
      const currentPerformance = analytics.calculatePerformanceScore();
      const previousPerformance = previousAnalytics.calculatePerformanceScore();

      analytics.comparisons.previousPeriod = {
        engagementChange: previousEngagement > 0 ? ((currentEngagement - previousEngagement) / previousEngagement) * 100 : 0,
        performanceChange: previousPerformance > 0 ? ((currentPerformance - previousPerformance) / previousPerformance) * 100 : 0,
        learningChange: 0 // Would need more specific learning metrics
      };
    }

    // Set benchmark data (would be configured per institution)
    analytics.comparisons.benchmarks = {
      industryAverage: 75,
      topPerformers: 90,
      institutionAverage: 78
    };
  }

  // Generate actionable insights
  private async generateInsights(analytics: IAnalytics): Promise<void> {
    const insights: any[] = [];

    // Engagement insights
    const engagementScore = analytics.calculateEngagementScore();
    if (engagementScore > 85) {
      insights.push({
        type: 'achievement',
        priority: 'medium',
        category: 'engagement',
        title: 'Excellent Engagement',
        description: `Engagement score of ${engagementScore}% is well above average`,
        evidence: [`${analytics.metrics.engagement.totalSessions} total sessions`, `${analytics.metrics.engagement.averageSessionDuration} min average duration`],
        actionItems: ['Maintain current engagement strategies', 'Share successful practices with others'],
        impact: 'positive',
        confidence: 85
      });
    } else if (engagementScore < 50) {
      insights.push({
        type: 'concern',
        priority: 'high',
        category: 'engagement',
        title: 'Low Engagement Detected',
        description: `Engagement score of ${engagementScore}% requires immediate attention`,
        evidence: [`High bounce rate: ${analytics.metrics.engagement.bounceRate}%`, `Low session duration: ${analytics.metrics.engagement.averageSessionDuration} min`],
        actionItems: ['Review content relevance', 'Implement engagement strategies', 'Provide additional support'],
        impact: 'negative',
        confidence: 90
      });
    }

    // Performance insights
    const performanceScore = analytics.calculatePerformanceScore();
    if (analytics.metrics.performance.improvementRate > 15) {
      insights.push({
        type: 'achievement',
        priority: 'medium',
        category: 'performance',
        title: 'Strong Performance Improvement',
        description: `${analytics.metrics.performance.improvementRate}% improvement in performance`,
        evidence: [`Completion rate: ${analytics.metrics.performance.completionRate}%`, `Average score: ${analytics.metrics.performance.averageScore}%`],
        actionItems: ['Continue current learning path', 'Challenge with advanced content'],
        impact: 'positive',
        confidence: 88
      });
    }

    // Learning insights
    if (analytics.metrics.learning.knowledgeRetention < 70) {
      insights.push({
        type: 'concern',
        priority: 'high',
        category: 'learning',
        title: 'Knowledge Retention Issue',
        description: `Knowledge retention at ${analytics.metrics.learning.knowledgeRetention}% is below optimal`,
        evidence: [`Low retention rate`, `${analytics.metrics.learning.conceptsMastered} concepts mastered`],
        actionItems: ['Implement spaced repetition', 'Add practice sessions', 'Review learning methodology'],
        impact: 'negative',
        confidence: 82
      });
    }

    // Collaboration insights
    if (analytics.metrics.collaboration.discussionParticipation > 80) {
      insights.push({
        type: 'achievement',
        priority: 'low',
        category: 'collaboration',
        title: 'Active Collaborator',
        description: `High discussion participation at ${analytics.metrics.collaboration.discussionParticipation}%`,
        evidence: [`${analytics.metrics.collaboration.messagesExchanged} messages exchanged`, `${analytics.metrics.collaboration.peerInteractions} peer interactions`],
        actionItems: ['Consider peer mentoring role', 'Lead group activities'],
        impact: 'positive',
        confidence: 75
      });
    }

    // Behavioral insights
    if (analytics.metrics.behavioral.procrastinationScore > 7) {
      insights.push({
        type: 'concern',
        priority: 'medium',
        category: 'behavioral',
        title: 'Procrastination Pattern Detected',
        description: `High procrastination score of ${analytics.metrics.behavioral.procrastinationScore}/10`,
        evidence: [`Late submissions pattern`, `Irregular login frequency`],
        actionItems: ['Set smaller goals', 'Implement time management tools', 'Provide deadline reminders'],
        impact: 'negative',
        confidence: 78
      });
    }

    // Add insights to analytics
    insights.forEach(insight => analytics.addInsight(insight));
  }

  // Generate visualizations
  private async generateVisualizations(analytics: IAnalytics): Promise<void> {
    // Engagement trend line chart
    analytics.generateVisualization('line', 'engagement');

    // Performance metrics bar chart
    analytics.generateVisualization('bar', 'performance');

    // Behavioral radar chart
    analytics.generateVisualization('radar', 'behavioral');

    // Learning progress gauge chart
    analytics.visualizations.charts.push({
      type: 'gauge',
      title: 'Learning Progress',
      description: 'Overall learning advancement',
      data: {
        value: analytics.metrics.learning.conceptsMastered,
        max: 100,
        thresholds: [30, 60, 85]
      },
      config: {
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
        size: 200
      },
      category: 'learning'
    });

    // Create a comprehensive dashboard
    analytics.visualizations.dashboards.push({
      name: 'Overview Dashboard',
      description: 'Comprehensive analytics overview',
      widgets: [
        {
          type: 'metric',
          title: 'Engagement Score',
          data: { value: analytics.calculateEngagementScore(), unit: '%' },
          position: { x: 0, y: 0, width: 3, height: 2 }
        },
        {
          type: 'metric',
          title: 'Performance Score',
          data: { value: analytics.calculatePerformanceScore(), unit: '%' },
          position: { x: 3, y: 0, width: 3, height: 2 }
        },
        {
          type: 'chart',
          title: 'Engagement Trend',
          data: analytics.visualizations.charts.find(c => c.category === 'engagement'),
          position: { x: 0, y: 2, width: 6, height: 4 }
        },
        {
          type: 'insights',
          title: 'Key Insights',
          data: analytics.insights.slice(0, 5),
          position: { x: 6, y: 0, width: 6, height: 6 }
        }
      ]
    });
  }

  // Report Generation
  async generateReport(
    title: string,
    description: string,
    type: 'dashboard' | 'summary' | 'detailed' | 'comparative' | 'predictive' | 'custom',
    category: 'academic' | 'engagement' | 'performance' | 'behavioral' | 'administrative' | 'financial',
    scope: any,
    structure: any,
    owner: ObjectId
  ): Promise<IReport> {
    try {
      this.emit('report:generation:started', { title, type, category });

      const report = new Report({
        title,
        description,
        type,
        category,
        scope,
        structure,
        access: {
          owner,
          visibility: 'private'
        },
        generation: {
          frequency: 'on-demand',
          processing: {
            status: 'pending'
          }
        },
        metadata: {
          source: {
            system: 'learning-platform',
            version: '1.0.0'
          }
        }
      });

      await report.save();
      
      // Generate report data asynchronously
      await report.generateData();

      this.emit('report:generation:completed', { reportId: report._id });
      return report;
    } catch (error) {
      this.emit('report:generation:failed', { title, error });
      throw error;
    }
  }

  // Update existing analytics
  async updateAnalytics(analyticsId: ObjectId, options: any = {}): Promise<IAnalytics> {
    const analytics = await Analytics.findById(analyticsId);
    if (!analytics) {
      throw new Error('Analytics not found');
    }

    const dateRange = {
      start: analytics.period.startDate,
      end: analytics.period.endDate
    };

    // Recalculate metrics
    await this.calculateMetrics(analytics, dateRange);

    // Update trends
    await this.calculateTrends(analytics, dateRange);

    if (options.includePredictions) {
      await this.generatePredictions(analytics);
    }

    if (options.includeComparisons) {
      await this.generateComparisons(analytics);
    }

    if (options.includeInsights) {
      await this.generateInsights(analytics);
    }

    analytics.timestamps.lastCalculated = new Date();
    await analytics.save();

    this.emit('analytics:updated', { analyticsId });
    return analytics;
  }

  // Bulk analytics generation
  async generateBulkAnalytics(
    entities: Array<{ type: string; id: ObjectId }>,
    periodType: string,
    dateRange: { start: Date; end: Date },
    generatedBy: ObjectId
  ): Promise<IAnalytics[]> {
    const results: IAnalytics[] = [];
    
    for (const entity of entities) {
      try {
        const analytics = await this.generateAnalytics(
          entity.type as any,
          entity.id,
          periodType as any,
          dateRange,
          generatedBy,
          {
            includePredictions: true,
            includeComparisons: true,
            includeInsights: true
          }
        );
        results.push(analytics);
      } catch (error) {
        console.error(`Failed to generate analytics for ${entity.type}:${entity.id}`, error);
      }
    }

    this.emit('analytics:bulk:completed', { count: results.length });
    return results;
  }

  // Helper methods for metric calculations
  private getUserSessions(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<any[]> {
    // Mock implementation - would integrate with session tracking
    return Promise.resolve([
      { userId, startTime: dateRange.start, endTime: new Date(dateRange.start.getTime() + 30 * 60 * 1000), pageViews: 5 },
      { userId, startTime: new Date(dateRange.start.getTime() + 24 * 60 * 60 * 1000), endTime: new Date(dateRange.start.getTime() + 24 * 60 * 60 * 1000 + 45 * 60 * 1000), pageViews: 8 }
    ]);
  }

  private calculateAverageSessionDuration(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    const totalDuration = sessions.reduce((sum, session) => {
      const duration = session.endTime.getTime() - session.startTime.getTime();
      return sum + (duration / (1000 * 60)); // Convert to minutes
    }, 0);
    return totalDuration / sessions.length;
  }

  private calculateTotalTimeSpent(sessions: any[]): number {
    return sessions.reduce((sum, session) => {
      const duration = session.endTime.getTime() - session.startTime.getTime();
      return sum + (duration / (1000 * 60)); // Convert to minutes
    }, 0);
  }

  private calculateBounceRate(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    const bounced = sessions.filter(session => session.pageViews <= 1).length;
    return (bounced / sessions.length) * 100;
  }

  private calculateClickThroughRate(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    const totalClicks = sessions.reduce((sum, session) => sum + (session.clicks || 0), 0);
    const totalViews = sessions.reduce((sum, session) => sum + (session.pageViews || 0), 0);
    return totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  }

  private calculateAverageScore(assignments: any[], userId: ObjectId): number {
    const userSubmissions = assignments.flatMap(a => 
      a.submissions.filter((s: any) => s.userId.toString() === userId.toString() && s.score !== undefined)
    );
    
    if (userSubmissions.length === 0) return 0;
    return userSubmissions.reduce((sum: number, s: any) => sum + s.score, 0) / userSubmissions.length;
  }

  private calculatePassRate(assignments: any[], userId: ObjectId): number {
    const userSubmissions = assignments.flatMap(a => 
      a.submissions.filter((s: any) => s.userId.toString() === userId.toString() && s.score !== undefined)
    );
    
    if (userSubmissions.length === 0) return 0;
    const passed = userSubmissions.filter((s: any) => s.score >= (s.passingScore || 70)).length;
    return (passed / userSubmissions.length) * 100;
  }

  private async calculateImprovementRate(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    // Mock implementation - would compare with previous period
    return Math.random() * 20 - 5; // Random improvement between -5% and 15%
  }

  private calculateAverageAttempts(assignments: any[], userId: ObjectId): number {
    const userSubmissions = assignments.flatMap(a => 
      a.submissions.filter((s: any) => s.userId.toString() === userId.toString())
    );
    
    if (userSubmissions.length === 0) return 0;
    return userSubmissions.reduce((sum: number, s: any) => sum + (s.attempts || 1), 0) / userSubmissions.length;
  }

  private calculateAverageTimeToCompletion(assignments: any[], userId: ObjectId): number {
    const userSubmissions = assignments.flatMap(a => 
      a.submissions.filter((s: any) => s.userId.toString() === userId.toString() && s.timeSpent)
    );
    
    if (userSubmissions.length === 0) return 0;
    return userSubmissions.reduce((sum: number, s: any) => sum + s.timeSpent, 0) / userSubmissions.length;
  }

  // Mock methods for various calculations (would be implemented with real data sources)
  private async getConceptsMastered(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 20) + 5;
  }

  private async getSkillsAcquired(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 10) + 2;
  }

  private async getLearningObjectivesAchieved(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 15) + 3;
  }

  private async calculateKnowledgeRetention(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.random() * 30 + 70; // 70-100%
  }

  private async calculateTransferability(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.random() * 40 + 60; // 60-100%
  }

  private async calculateDepthOfUnderstanding(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.random() * 4 + 6; // 6-10 scale
  }

  private async calculateCriticalThinkingScore(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.random() * 3 + 7; // 7-10 scale
  }

  private async calculateCreativityScore(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.random() * 4 + 6; // 6-10 scale
  }

  private async getCollaborativeActivities(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 8) + 2;
  }

  private async getPeerInteractions(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 15) + 5;
  }

  private async getGroupProjectsCompleted(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 3) + 1;
  }

  private calculateDiscussionParticipation(conversations: any[], userId: ObjectId): number {
    const userMessages = conversations.reduce((sum, conv) => 
      sum + (conv.messages?.filter((m: any) => m.sender.toString() === userId.toString()).length || 0), 0
    );
    const totalMessages = conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0);
    return totalMessages > 0 ? (userMessages / totalMessages) * 100 : 0;
  }

  private async getLeadershipRoles(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 3);
  }

  private async calculateProcrastinationScore(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 6) + 2; // 2-8 scale
  }

  private async calculateMotivationLevel(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 4) + 6; // 6-10 scale
  }

  private async calculatePersistenceScore(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 4) + 6; // 6-10 scale
  }

  private async calculateAutonomyLevel(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 5) + 5; // 5-10 scale
  }

  private async calculateRiskTaking(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 6) + 4; // 4-10 scale
  }

  private async calculateAdaptability(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 4) + 6; // 6-10 scale
  }

  private async calculateTimeManagement(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 5) + 5; // 5-10 scale
  }

  private async getResourcesAccessed(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 25) + 10;
  }

  private async getContentCreated(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 8) + 2;
  }

  private async getSharedContent(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 5) + 1;
  }

  private async getBookmarkedItems(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 12) + 3;
  }

  private async getNotesCreated(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 15) + 5;
  }

  private async getAnnotationsMade(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 20) + 8;
  }

  private async getDownloadsInitiated(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 10) + 2;
  }

  private async getUploadsCompleted(userId: ObjectId, dateRange: { start: Date; end: Date }): Promise<number> {
    return Math.floor(Math.random() * 6) + 1;
  }

  private generateTrendValue(baseValue: number, dayIndex: number, totalDays: number): number {
    // Generate realistic trend variations
    const randomVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
    const trendFactor = 1 + (dayIndex / totalDays) * 0.1; // Slight upward trend
    return Math.max(0, Math.round(baseValue * trendFactor * (1 + randomVariation)));
  }

  private calculatePredictionConfidence(trendData: any[]): number {
    if (trendData.length < 3) return 50;
    
    // Calculate consistency of trend
    const changes = trendData.slice(1).map((item, index) => 
      item.improvement - trendData[index].improvement
    );
    
    const variance = changes.reduce((sum, change) => sum + Math.pow(change, 2), 0) / changes.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher confidence
    return Math.max(60, Math.min(95, 95 - standardDeviation * 10));
  }

  private identifyRiskFactors(analytics: IAnalytics): string[] {
    const factors: string[] = [];
    
    if (analytics.metrics.engagement.bounceRate > 30) {
      factors.push('High bounce rate indicates engagement issues');
    }
    
    if (analytics.metrics.performance.completionRate < 70) {
      factors.push('Low completion rate may affect learning outcomes');
    }
    
    if (analytics.metrics.behavioral.procrastinationScore > 7) {
      factors.push('High procrastination score may impact progress');
    }
    
    if (analytics.metrics.learning.knowledgeRetention < 70) {
      factors.push('Low retention rate indicates learning difficulties');
    }
    
    return factors;
  }

  private generatePerformanceRecommendations(analytics: IAnalytics): string[] {
    const recommendations: string[] = [];
    
    if (analytics.metrics.performance.averageScore < 70) {
      recommendations.push('Provide additional practice materials');
      recommendations.push('Offer one-on-one tutoring sessions');
    }
    
    if (analytics.metrics.engagement.averageSessionDuration < 15) {
      recommendations.push('Break content into smaller, manageable chunks');
      recommendations.push('Add interactive elements to maintain engagement');
    }
    
    if (analytics.metrics.behavioral.motivationLevel < 6) {
      recommendations.push('Implement gamification elements');
      recommendations.push('Set achievable short-term goals');
    }
    
    return recommendations;
  }

  private identifyStrugglingAreas(analytics: IAnalytics): string[] {
    const areas: string[] = [];
    
    if (analytics.metrics.learning.criticalThinkingScore < 6) {
      areas.push('Critical thinking');
    }
    
    if (analytics.metrics.learning.creativityScore < 6) {
      areas.push('Creative problem solving');
    }
    
    if (analytics.metrics.performance.averageScore < 70) {
      areas.push('Core subject mastery');
    }
    
    return areas;
  }

  private identifyStrengthAreas(analytics: IAnalytics): string[] {
    const areas: string[] = [];
    
    if (analytics.metrics.learning.criticalThinkingScore > 8) {
      areas.push('Critical thinking');
    }
    
    if (analytics.metrics.collaboration.discussionParticipation > 80) {
      areas.push('Collaboration and communication');
    }
    
    if (analytics.metrics.behavioral.persistenceScore > 8) {
      areas.push('Persistence and determination');
    }
    
    return areas;
  }

  private suggestNextConcepts(analytics: IAnalytics): string[] {
    // Mock implementation - would be based on learning path algorithms
    return [
      'Advanced problem solving techniques',
      'Creative thinking methodologies',
      'Collaborative learning strategies',
      'Self-directed learning skills'
    ];
  }

  // Additional helper methods for assignment metrics
  private calculateAverageSubmissionTime(submissions: any[]): number {
    if (submissions.length === 0) return 0;
    return submissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / submissions.length;
  }

  private calculateReturningUsers(submissions: any[]): number {
    const userCounts = new Map();
    submissions.forEach(s => {
      const userId = s.userId.toString();
      userCounts.set(userId, (userCounts.get(userId) || 0) + 1);
    });
    
    let returningUsers = 0;
    userCounts.forEach(count => {
      if (count > 1) returningUsers++;
    });
    
    return returningUsers;
  }

  private calculateAssignmentBounceRate(submissions: any[]): number {
    if (submissions.length === 0) return 0;
    const quickExits = submissions.filter(s => (s.timeSpent || 0) < 2).length; // Less than 2 minutes
    return (quickExits / submissions.length) * 100;
  }

  private calculateAssignmentCTR(assignment: any, submissions: any[]): number {
    const totalViews = assignment.views || submissions.length;
    const totalInteractions = submissions.filter(s => s.status !== 'draft').length;
    return totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;
  }

  private calculateSubmissionPassRate(submissions: any[]): number {
    if (submissions.length === 0) return 0;
    const passed = submissions.filter(s => (s.score || 0) >= 70).length;
    return (passed / submissions.length) * 100;
  }

  private calculateSubmissionImprovementRate(submissions: any[]): number {
    // Group by user and calculate improvement
    const userSubmissions = new Map();
    submissions.forEach(s => {
      const userId = s.userId.toString();
      if (!userSubmissions.has(userId)) {
        userSubmissions.set(userId, []);
      }
      userSubmissions.get(userId).push(s);
    });

    let totalImprovement = 0;
    let userCount = 0;

    userSubmissions.forEach(userSubs => {
      if (userSubs.length > 1) {
        userSubs.sort((a: any, b: any) => a.submittedAt.getTime() - b.submittedAt.getTime());
        const firstScore = userSubs[0].score || 0;
        const lastScore = userSubs[userSubs.length - 1].score || 0;
        if (firstScore > 0) {
          totalImprovement += ((lastScore - firstScore) / firstScore) * 100;
          userCount++;
        }
      }
    });

    return userCount > 0 ? totalImprovement / userCount : 0;
  }

  private identifyStrugglingUsers(submissions: any[]): any[] {
    return submissions.filter(s => (s.score || 0) < 60 || (s.attempts || 1) > 3);
  }

  private identifyExcellentPerformers(submissions: any[]): any[] {
    return submissions.filter(s => (s.score || 0) >= 90 && (s.attempts || 1) <= 2);
  }

  private calculateAverageCompletionTime(submissions: any[]): number {
    if (submissions.length === 0) return 0;
    const timesToCompletion = submissions
      .filter(s => s.completedAt && s.startedAt)
      .map(s => (s.completedAt.getTime() - s.startedAt.getTime()) / (1000 * 60)); // minutes
    
    return timesToCompletion.length > 0 ? 
      timesToCompletion.reduce((sum, time) => sum + time, 0) / timesToCompletion.length : 0;
  }

  // Activity-specific helper methods
  private async getActivityInteractions(activityId: ObjectId, dateRange: { start: Date; end: Date }): Promise<any[]> {
    // Mock implementation - would integrate with activity tracking
    return [
      { userId: new ObjectId(), duration: 25, views: 3, completed: true },
      { userId: new ObjectId(), duration: 18, views: 2, completed: false },
      { userId: new ObjectId(), duration: 32, views: 4, completed: true }
    ];
  }

  private calculateActivityReturningUsers(interactions: any[]): number {
    const userCounts = new Map();
    interactions.forEach(i => {
      const userId = i.userId.toString();
      userCounts.set(userId, (userCounts.get(userId) || 0) + 1);
    });
    
    let returningUsers = 0;
    userCounts.forEach(count => {
      if (count > 1) returningUsers++;
    });
    
    return returningUsers;
  }

  private calculateActivityBounceRate(interactions: any[]): number {
    if (interactions.length === 0) return 0;
    const quickExits = interactions.filter(i => i.duration < 5).length; // Less than 5 minutes
    return (quickExits / interactions.length) * 100;
  }

  private calculateActivityCTR(interactions: any[]): number {
    const totalViews = interactions.reduce((sum, i) => sum + (i.views || 1), 0);
    const totalInteractions = interactions.filter(i => i.completed).length;
    return totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;
  }

  // Conversation-specific helper methods
  private calculateConversationReturningUsers(messages: any[]): number {
    const userCounts = new Map();
    messages.forEach(m => {
      const userId = m.sender.toString();
      userCounts.set(userId, (userCounts.get(userId) || 0) + 1);
    });
    
    let returningUsers = 0;
    userCounts.forEach(count => {
      if (count > 1) returningUsers++;
    });
    
    return returningUsers;
  }

  private calculateConversationCTR(messages: any[]): number {
    const totalMessages = messages.length;
    const reactedMessages = messages.filter(m => m.reactions && m.reactions.length > 0).length;
    return totalMessages > 0 ? (reactedMessages / totalMessages) * 100 : 0;
  }

  // Cleanup and maintenance
  async cleanupOldAnalytics(daysToKeep: number = 365): Promise<void> {
    await Analytics.cleanupOldAnalytics(daysToKeep);
    this.emit('analytics:cleanup:completed', { daysToKeep });
  }

  async generateScheduledReports(): Promise<void> {
    const reports = await Report.getScheduledReports();
    
    for (const report of reports) {
      try {
        await report.generateData();
        this.emit('report:scheduled:completed', { reportId: report._id });
      } catch (error) {
        this.emit('report:scheduled:failed', { reportId: report._id, error });
      }
    }
  }
}

export const analyticsService = new AnalyticsService();