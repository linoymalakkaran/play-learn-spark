/**
 * Types and interfaces for the Recommendation Engine
 */

export interface RecommendedContent {
  id: string;
  title: string;
  description: string;
  type: 'activity' | 'story' | 'game' | 'video' | 'lesson';
  category: string;
  thumbnailUrl: string;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  ageRange: string;
  skills: string[];
  tags: string[];
  recommendationScore: number; // 0-100
  recommendationReasons: RecommendationReason[];
  learningObjectives: string[];
  prerequisites?: string[];
  completionRate: number;
  userRating: number;
  isBookmarked: boolean;
  isCompleted: boolean;
  estimatedLearningGain: number;
  adaptationSuggestions: string[];
}

export interface RecommendationReason {
  type: 'age_match' | 'skill_level' | 'interest' | 'learning_style' | 'difficulty' | 'social' | 'trending';
  explanation: string;
  strength: number; // 0-100
  icon: string;
}

export interface LearningPathSuggestion {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  targetSkills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  milestones: PathMilestone[];
  recommendedContent: string[]; // content IDs
  adaptiveAdjustments: string[];
  successPrediction: number; // 0-100
}

export interface PathMilestone {
  id: string;
  title: string;
  description: string;
  week: number;
  skills: string[];
  activities: string[];
  assessmentCriteria: string[];
}

export interface PersonalizationProfile {
  childId: string;
  age: number; // in months
  interests: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  skillLevels: Record<string, number>;
  attentionSpan: number; // in minutes
  preferredDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  optimalSessionLength: number;
  strugglingAreas: string[];
  strengthAreas: string[];
  completedContent: string[];
  recentPerformance: PerformanceMetric[];
  socialPreferences: 'solo' | 'collaborative' | 'mixed';
  parentGoals: string[];
}

export interface PerformanceMetric {
  contentId: string;
  score: number;
  timeSpent: number;
  attemptsNeeded: number;
  engagementLevel: number;
  completedAt: Date;
  struggledWith: string[];
  excelledAt: string[];
}

export interface FilterOptions {
  categories: string[];
  skills: string[];
  difficulty: string[];
  duration: { min: number; max: number };
  contentTypes: string[];
  ageRange: string;
  onlyNewContent: boolean;
  includeCompleted: boolean;
  socialMode: string;
}

export interface RecommendationEngineProps {
  childId: string;
  className?: string;
  onContentSelect?: (content: RecommendedContent) => void;
  onPathSelect?: (path: LearningPathSuggestion) => void;
  showAdvancedFilters?: boolean;
}