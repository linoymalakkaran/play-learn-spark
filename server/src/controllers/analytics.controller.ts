import { Request, Response } from 'express';
import { activityStore, activityCompletionStore, progressStore } from '../models/UserStore';
import { User } from '../models/UserSQLite';
import { logger } from '../utils/logger';

/**
 * Get comprehensive progress analytics for a user
 */
export const getProgressAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId) || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get all user's activity completions
    const completions = activityCompletionStore.findByUserId(userId);
    const activities = await activityStore.findAll();
    const progress = progressStore.findByUserId(userId);

    // Calculate analytics
    const analytics = calculateProgressAnalytics(user, completions, activities, progress);

    return res.status(200).json({
      success: true,
      message: 'Progress analytics retrieved successfully',
      data: analytics
    });

  } catch (error) {
    logger.error('Get progress analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve progress analytics'
    });
  }
};

/**
 * Get learning trends and patterns for a user
 */
export const getLearningTrends = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId) || req.user?.id;
    const timeframe = req.query.timeframe as string || 'week'; // week, month, year
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const completions = activityCompletionStore.findByUserId(userId);
    const trends = calculateLearningTrends(completions, timeframe);

    return res.status(200).json({
      success: true,
      message: 'Learning trends retrieved successfully',
      data: trends
    });

  } catch (error) {
    logger.error('Get learning trends error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve learning trends'
    });
  }
};

/**
 * Get performance insights and recommendations
 */
export const getPerformanceInsights = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId) || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const user = await User.findByPk(userId);
    const completions = activityCompletionStore.findByUserId(userId);
    const activities = await activityStore.findAll();

    const insights = generatePerformanceInsights(user!, completions, activities);

    return res.status(200).json({
      success: true,
      message: 'Performance insights retrieved successfully',
      data: insights
    });

  } catch (error) {
    logger.error('Get performance insights error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve performance insights'
    });
  }
};

/**
 * Get detailed progress reports for educators/parents
 */
export const getDetailedProgressReport = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId) || req.user?.id;
    const childId = req.query.childId ? parseInt(req.query.childId as string) : null;
    
    // Check if user is authorized to view the report
    if (childId && req.user?.role === 'parent') {
      const parent = await User.findByPk(req.user.id);
      const childrenIds = JSON.parse(parent?.childrenIds || '[]');
      if (!childrenIds.includes(childId)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this child\'s progress'
        });
      }
    }

    const targetUserId = childId || userId!;
    const user = await User.findByPk(targetUserId);
    const completions = activityCompletionStore.findByUserId(targetUserId);
    const activities = await activityStore.findAll();
    const progress = progressStore.findByUserId(targetUserId);

    const report = generateDetailedProgressReport(user!, completions, activities, progress);

    return res.status(200).json({
      success: true,
      message: 'Detailed progress report retrieved successfully',
      data: report
    });

  } catch (error) {
    logger.error('Get detailed progress report error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve detailed progress report'
    });
  }
};

// Helper functions for analytics calculations

function calculateProgressAnalytics(user: any, completions: any[], activities: any[], progress: any | null) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Basic stats
  const totalActivities = activities.length;
  const completedActivities = completions.filter(c => c.completed).length;
  const completionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  // Time-based stats
  const weeklyCompletions = completions.filter(c => 
    c.completed && new Date(c.completedAt) >= oneWeekAgo
  ).length;
  
  const monthlyCompletions = completions.filter(c => 
    c.completed && new Date(c.completedAt) >= oneMonthAgo
  ).length;

  // Performance stats
  const completedCompletions = completions.filter(c => c.completed);
  const averageScore = completedCompletions.length > 0 
    ? completedCompletions.reduce((sum, c) => sum + c.score, 0) / completedCompletions.length 
    : 0;
  
  const totalTimeSpent = completions.reduce((sum, c) => sum + c.timeSpent, 0);
  const averageTimePerActivity = completedActivities > 0 ? totalTimeSpent / completedActivities : 0;

  // Category breakdown
  const categoryStats = activities.reduce((stats: any, activity) => {
    const completion = completions.find(c => c.activityId === activity.id && c.completed);
    if (!stats[activity.category]) {
      stats[activity.category] = { total: 0, completed: 0, averageScore: 0, totalScore: 0 };
    }
    stats[activity.category].total++;
    if (completion) {
      stats[activity.category].completed++;
      stats[activity.category].totalScore += completion.score;
    }
    return stats;
  }, {});

  // Calculate average scores for categories
  Object.keys(categoryStats).forEach(category => {
    const stat = categoryStats[category];
    stat.averageScore = stat.completed > 0 ? stat.totalScore / stat.completed : 0;
    stat.completionRate = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
    delete stat.totalScore; // Remove internal calculation field
  });

  // Current level and progress to next level
  const currentLevel = user.currentLevel || 1;
  const currentPoints = user.totalPoints || 0;
  const pointsForNextLevel = currentLevel * 100; // 100 points per level
  const pointsToNextLevel = Math.max(0, pointsForNextLevel - currentPoints);
  const progressToNextLevel = pointsForNextLevel > 0 ? ((currentPoints % 100) / 100) * 100 : 100;

  // Badges and achievements
  const badges = JSON.parse(user.badges || '[]');
  const achievements = {
    badges: badges,
    totalBadges: badges.length,
    streakDays: user.streakDays || 0,
    longestStreak: user.longestStreak || user.streakDays || 0
  };

  return {
    overview: {
      totalActivities,
      completedActivities,
      completionRate: Math.round(completionRate * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      totalTimeSpent: Math.round(totalTimeSpent),
      averageTimePerActivity: Math.round(averageTimePerActivity)
    },
    recentActivity: {
      weeklyCompletions,
      monthlyCompletions,
      lastActive: user.lastActiveDate
    },
    levelProgress: {
      currentLevel,
      currentPoints,
      pointsToNextLevel,
      progressToNextLevel: Math.round(progressToNextLevel * 100) / 100
    },
    categoryBreakdown: categoryStats,
    achievements,
    learningVelocity: {
      activitiesPerWeek: weeklyCompletions,
      activitiesPerMonth: monthlyCompletions,
      improvementTrend: calculateImprovementTrend(completions)
    }
  };
}

function calculateLearningTrends(completions: any[], timeframe: string) {
  const now = new Date();
  let periodStart: Date;
  let groupBy: string;

  switch (timeframe) {
    case 'week':
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
      break;
    case 'month':
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
      break;
    case 'year':
      periodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      groupBy = 'month';
      break;
    default:
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = 'day';
  }

  const filteredCompletions = completions.filter(c => 
    c.completed && new Date(c.completedAt) >= periodStart
  );

  // Group completions by time period
  const groupedData = filteredCompletions.reduce((groups: any, completion) => {
    const date = new Date(completion.completedAt);
    let key: string;

    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    }

    if (!groups[key]) {
      groups[key] = {
        date: key,
        completions: 0,
        totalScore: 0,
        totalTime: 0,
        activities: []
      };
    }

    groups[key].completions++;
    groups[key].totalScore += completion.score;
    groups[key].totalTime += completion.timeSpent;
    groups[key].activities.push(completion.activityId);

    return groups;
  }, {});

  // Convert to array and calculate averages
  const trends = Object.values(groupedData).map((group: any) => ({
    date: group.date,
    completions: group.completions,
    averageScore: group.completions > 0 ? Math.round((group.totalScore / group.completions) * 100) / 100 : 0,
    totalTimeSpent: Math.round(group.totalTime),
    uniqueActivities: [...new Set(group.activities)].length
  }));

  return {
    timeframe,
    period: { start: periodStart.toISOString(), end: now.toISOString() },
    data: trends.sort((a, b) => a.date.localeCompare(b.date))
  };
}

function generatePerformanceInsights(user: any, completions: any[], activities: any[]) {
  const completedCompletions = completions.filter(c => c.completed);
  
  // Performance metrics
  const averageScore = completedCompletions.length > 0 
    ? completedCompletions.reduce((sum, c) => sum + c.score, 0) / completedCompletions.length 
    : 0;

  // Identify strengths and improvement areas
  const categoryPerformance = activities.reduce((performance: any, activity) => {
    const completion = completions.find(c => c.activityId === activity.id && c.completed);
    if (!performance[activity.category]) {
      performance[activity.category] = { scores: [], count: 0 };
    }
    if (completion) {
      performance[activity.category].scores.push(completion.score);
      performance[activity.category].count++;
    }
    return performance;
  }, {});

  const categoryAverages = Object.keys(categoryPerformance).map(category => {
    const scores = categoryPerformance[category].scores;
    const average = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;
    return { category, average, count: scores.length };
  }).filter(c => c.count > 0);

  const strengths = categoryAverages
    .filter(c => c.average >= 80)
    .sort((a, b) => b.average - a.average)
    .slice(0, 3);

  const improvementAreas = categoryAverages
    .filter(c => c.average < 70)
    .sort((a, b) => a.average - b.average)
    .slice(0, 3);

  // Learning patterns
  const recentCompletions = completedCompletions
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 10);

  const recentScores = recentCompletions.map(c => c.score);
  const trend = calculateTrend(recentScores);

  // Recommendations
  const recommendations = generateRecommendations(user, categoryAverages, trend, completions);

  return {
    overall: {
      averageScore: Math.round(averageScore * 100) / 100,
      totalActivitiesCompleted: completedCompletions.length,
      currentStreak: user.streakDays || 0,
      performanceTrend: trend
    },
    strengths: strengths.map(s => ({
      category: s.category,
      score: Math.round(s.average * 100) / 100,
      activitiesCompleted: s.count
    })),
    improvementAreas: improvementAreas.map(s => ({
      category: s.category,
      score: Math.round(s.average * 100) / 100,
      activitiesCompleted: s.count
    })),
    recommendations
  };
}

function generateDetailedProgressReport(user: any, completions: any[], activities: any[], progress: any | null) {
  const analytics = calculateProgressAnalytics(user, completions, activities, progress);
  
  // Additional report-specific data
  const activityHistory = completions
    .filter(c => c.completed)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 20)
    .map(completion => {
      const activity = activities.find(a => a.id === completion.activityId);
      return {
        activityTitle: activity?.title || 'Unknown Activity',
        category: activity?.category || 'Unknown',
        difficulty: activity?.difficulty || 'Unknown',
        score: completion.score,
        timeSpent: completion.timeSpent,
        completedAt: completion.completedAt,
        attempts: completion.attempts || 1
      };
    });

  const skillProgression = progress ? [{
    skill: 'Overall Progress',
    currentLevel: progress.level || 1,
    progress: ((progress.experience || 0) % 100),
    lastUpdated: progress.updatedAt
  }] : [];

  return {
    studentInfo: {
      name: `${user.firstName} ${user.lastName}`,
      username: user.username,
      age: user.age,
      currentLevel: user.currentLevel,
      joinDate: user.createdAt
    },
    analytics,
    activityHistory,
    skillProgression,
    reportGenerated: new Date().toISOString()
  };
}

// Utility functions

function calculateImprovementTrend(completions: any[]): string {
  const recentCompletions = completions
    .filter(c => c.completed)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 10);

  if (recentCompletions.length < 3) return 'insufficient_data';

  const recentScores = recentCompletions.map(c => c.score);
  const firstHalf = recentScores.slice(recentScores.length / 2);
  const secondHalf = recentScores.slice(0, recentScores.length / 2);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const difference = secondAvg - firstAvg;
  
  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

function calculateTrend(scores: number[]): string {
  if (scores.length < 3) return 'insufficient_data';
  
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 3) return 'improving';
  if (difference < -3) return 'declining';
  return 'stable';
}

function generateRecommendations(user: any, categoryAverages: any[], trend: string, completions: any[]): string[] {
  const recommendations: string[] = [];
  
  // Performance-based recommendations
  if (trend === 'declining') {
    recommendations.push('Consider taking breaks between activities to avoid fatigue');
    recommendations.push('Review previous activities to reinforce learning');
  } else if (trend === 'improving') {
    recommendations.push('Great progress! Consider trying more challenging activities');
  }
  
  // Category-specific recommendations
  const weakCategories = categoryAverages.filter(c => c.average < 70);
  if (weakCategories.length > 0) {
    recommendations.push(`Focus on ${weakCategories[0].category} activities to improve understanding`);
  }
  
  // Activity frequency recommendations
  const recentCompletions = completions.filter(c => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return c.completed && new Date(c.completedAt) >= weekAgo;
  });
  
  if (recentCompletions.length < 3) {
    recommendations.push('Try to complete at least 3-5 activities per week for optimal learning');
  }
  
  // Streak recommendations
  if (user.streakDays === 0) {
    recommendations.push('Start building a learning streak by completing one activity daily');
  } else if (user.streakDays >= 7) {
    recommendations.push('Excellent streak! Keep up the daily learning habit');
  }
  
  return recommendations;
}