/**
 * Mock data generators for Analytics Dashboard
 */

import {
  LearningSession,
  SkillProgress,
  EngagementMetrics,
  ParentInsight,
  LearningGoal,
  WeeklyReport,
  ChartDataPoint
} from '@/types/analytics.types';

export const generateMockEngagementMetrics = (): EngagementMetrics => {
  return {
    averageSessionDuration: 22,
    totalTimeSpent: 180,
    sessionsThisWeek: 8,
    activitiesCompleted: 15,
    challengesAttempted: 12,
    achievementsEarned: 6,
    streakDays: 5,
    favoriteActivities: ['Math Games', 'Reading Stories', 'Art & Creativity'],
    optimalLearningTimes: ['9:00 AM', '3:00 PM'],
    attentionSpanTrend: [18, 22, 20, 25, 28, 24, 26],
    frustrationIncidents: 2,
    helpRequestsCount: 4
  };
};

export const generateMockSkillProgress = (): SkillProgress[] => {
  return [
    {
      skillName: 'Addition',
      category: 'mathematics',
      currentLevel: 7,
      previousLevel: 6,
      progressThisWeek: 12,
      progressThisMonth: 45,
      activitiesPracticed: 8,
      timeSpent: 45,
      masteryPercentage: 85,
      lastPracticedAt: new Date('2024-01-18'),
      strugglingAreas: ['Double digit addition'],
      strengthAreas: ['Single digit addition', 'Mental math']
    },
    {
      skillName: 'Reading Comprehension',
      category: 'reading',
      currentLevel: 8,
      previousLevel: 7,
      progressThisWeek: 15,
      progressThisMonth: 38,
      activitiesPracticed: 12,
      timeSpent: 60,
      masteryPercentage: 92,
      lastPracticedAt: new Date('2024-01-19'),
      strugglingAreas: ['Complex sentences'],
      strengthAreas: ['Main idea identification', 'Vocabulary']
    },
    {
      skillName: 'Fine Motor Skills',
      category: 'motor',
      currentLevel: 6,
      previousLevel: 5,
      progressThisWeek: 8,
      progressThisMonth: 22,
      activitiesPracticed: 5,
      timeSpent: 30,
      masteryPercentage: 78,
      lastPracticedAt: new Date('2024-01-17'),
      strugglingAreas: ['Precise cutting'],
      strengthAreas: ['Drawing', 'Writing']
    },
    {
      skillName: 'Creative Expression',
      category: 'creativity',
      currentLevel: 9,
      previousLevel: 8,
      progressThisWeek: 20,
      progressThisMonth: 55,
      activitiesPracticed: 6,
      timeSpent: 40,
      masteryPercentage: 95,
      lastPracticedAt: new Date('2024-01-19'),
      strugglingAreas: [],
      strengthAreas: ['Color mixing', 'Storytelling', 'Imagination']
    },
    {
      skillName: 'Social Skills',
      category: 'social',
      currentLevel: 7,
      previousLevel: 6,
      progressThisWeek: 10,
      progressThisMonth: 30,
      activitiesPracticed: 4,
      timeSpent: 25,
      masteryPercentage: 82,
      lastPracticedAt: new Date('2024-01-18'),
      strugglingAreas: ['Sharing'],
      strengthAreas: ['Cooperation', 'Communication']
    },
    {
      skillName: 'Problem Solving',
      category: 'mathematics',
      currentLevel: 6,
      previousLevel: 5,
      progressThisWeek: 14,
      progressThisMonth: 40,
      activitiesPracticed: 7,
      timeSpent: 35,
      masteryPercentage: 75,
      lastPracticedAt: new Date('2024-01-19'),
      strugglingAreas: ['Multi-step problems'],
      strengthAreas: ['Logic puzzles', 'Pattern recognition']
    }
  ];
};

export const generateMockParentInsights = (): ParentInsight[] => {
  return [
    {
      id: 'insight-1',
      type: 'strength',
      title: '🌟 Creative Expression is Soaring!',
      description: 'Your child shows exceptional creativity skills! They\'ve mastered 95% of creative activities and consistently score high in imagination tasks.',
      priority: 'low',
      actionable: false,
      relatedSkills: ['Creative Expression', 'Art'],
      timestamp: new Date('2024-01-19'),
      isRead: false
    },
    {
      id: 'insight-2',
      type: 'improvement',
      title: '📈 Math Skills Showing Great Progress',
      description: 'Addition skills improved by 12% this week! Consider adding more double-digit addition activities to build on this momentum.',
      priority: 'medium',
      actionable: true,
      relatedSkills: ['Addition', 'Mathematics'],
      timestamp: new Date('2024-01-18'),
      isRead: false
    },
    {
      id: 'insight-3',
      type: 'recommendation',
      title: '💡 Optimal Learning Time Discovered',
      description: 'Your child shows peak focus between 9-10 AM and 3-4 PM. Schedule challenging activities during these windows for best results.',
      priority: 'high',
      actionable: true,
      relatedSkills: ['Focus', 'Attention'],
      timestamp: new Date('2024-01-17'),
      isRead: true
    },
    {
      id: 'insight-4',
      type: 'milestone',
      title: '🏆 Reading Milestone Achieved!',
      description: 'Congratulations! Your child has reached Level 8 in Reading Comprehension - they can now understand complex story structures!',
      priority: 'high',
      actionable: false,
      relatedSkills: ['Reading Comprehension'],
      timestamp: new Date('2024-01-16'),
      isRead: false
    }
  ];
};

export const generateMockLearningGoals = (): LearningGoal[] => {
  return [
    {
      id: 'goal-1',
      title: 'Master Multiplication Tables',
      description: 'Learn multiplication tables 1-10 with 90% accuracy',
      targetSkills: ['Multiplication', 'Mental Math'],
      targetDate: new Date('2024-02-15'),
      currentProgress: 65,
      isCompleted: false,
      rewards: ['Special math certificate', 'Choice of weekend activity'],
      parentNotes: 'Focusing on tables 2, 5, and 10 first'
    },
    {
      id: 'goal-2',
      title: 'Read 20 Books This Month',
      description: 'Complete 20 age-appropriate books with comprehension quizzes',
      targetSkills: ['Reading Comprehension', 'Vocabulary'],
      targetDate: new Date('2024-01-31'),
      currentProgress: 85,
      isCompleted: false,
      rewards: ['New book series', 'Reading corner setup'],
      parentNotes: 'Really enjoying adventure stories'
    },
    {
      id: 'goal-3',
      title: 'Perfect Attendance Week',
      description: 'Complete all scheduled learning activities for one full week',
      targetSkills: ['Consistency', 'Responsibility'],
      targetDate: new Date('2024-01-25'),
      currentProgress: 100,
      isCompleted: true,
      rewards: ['Extra weekend screen time', 'Ice cream treat'],
      parentNotes: 'Achieved! Great consistency this week.'
    }
  ];
};

export const generateMockWeeklyReport = (): WeeklyReport => {
  return {
    weekStart: new Date('2024-01-15'),
    weekEnd: new Date('2024-01-21'),
    totalLearningTime: 180,
    skillsImproved: ['Addition', 'Reading Comprehension', 'Creative Expression'],
    challengesCompleted: 12,
    newAchievements: ['Math Whiz Badge', 'Story Explorer Award', 'Creative Genius Certificate'],
    recommendedFocus: ['Double-digit addition', 'Complex sentence reading', 'Fine motor precision'],
    parentFeedback: 'Excellent week! Shows great enthusiasm for learning.',
    overallProgress: 78
  };
};

export const generateMockWeeklyProgress = (): ChartDataPoint[] => {
  return [
    { date: '2024-01-15', value: 65, label: 'Great start to the week!' },
    { date: '2024-01-16', value: 72, label: 'Building momentum' },
    { date: '2024-01-17', value: 68, label: 'Steady progress' },
    { date: '2024-01-18', value: 85, label: 'Amazing breakthrough!' },
    { date: '2024-01-19', value: 90, label: 'Outstanding performance' },
    { date: '2024-01-20', value: 75, label: 'Solid weekend learning' },
    { date: '2024-01-21', value: 82, label: 'Strong week finish!' }
  ];
};