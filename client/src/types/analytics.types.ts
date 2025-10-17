/**
 * Types and interfaces for the Analytics Dashboard
 */

export interface LearningSession {
  id: string;
  childId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  activitiesCompleted: number;
  skillsExercised: string[];
  engagementScore: number; // 0-100
  strugglingMoments: number;
  achievementsUnlocked: string[];
  deviceType: 'tablet' | 'computer' | 'phone';
}

export interface SkillProgress {
  skillName: string;
  category: 'mathematics' | 'reading' | 'motor' | 'social' | 'creativity';
  currentLevel: number; // 1-10
  previousLevel: number;
  progressThisWeek: number;
  progressThisMonth: number;
  activitiesPracticed: number;
  timeSpent: number; // in minutes
  masteryPercentage: number;
  lastPracticedAt: Date;
  strugglingAreas: string[];
  strengthAreas: string[];
}

export interface EngagementMetrics {
  averageSessionDuration: number;
  totalTimeSpent: number;
  sessionsThisWeek: number;
  activitiesCompleted: number;
  challengesAttempted: number;
  achievementsEarned: number;
  streakDays: number;
  favoriteActivities: string[];
  optimalLearningTimes: string[];
  attentionSpanTrend: number[]; // last 7 days
  frustrationIncidents: number;
  helpRequestsCount: number;
}

export interface ParentInsight {
  id: string;
  type: 'strength' | 'improvement' | 'recommendation' | 'milestone';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  relatedSkills: string[];
  timestamp: Date;
  isRead: boolean;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetSkills: string[];
  targetDate: Date;
  currentProgress: number;
  isCompleted: boolean;
  rewards: string[];
  parentNotes: string;
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  totalLearningTime: number;
  skillsImproved: string[];
  challengesCompleted: number;
  newAchievements: string[];
  recommendedFocus: string[];
  parentFeedback: string;
  overallProgress: number;
}

export interface AnalyticsDashboardProps {
  childId: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  showParentView?: boolean;
  onExportReport?: () => void;
  className?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  category?: string;
  label?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export interface FilterOptions {
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  skills: string[];
  activities: string[];
  showTrends: boolean;
  showComparisons: boolean;
}