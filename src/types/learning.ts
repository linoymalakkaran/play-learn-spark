export interface Child {
  id: string;
  name: string;
  age: 3 | 4 | 5 | 6;
  progress: ChildProgress;
  preferences?: {
    difficultyLevel?: number;
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    interests?: string[];
  };
}

export interface ChildProgress {
  totalActivitiesCompleted: number;
  badges: Badge[];
  currentStreak: number;
  englishLevel: number;
  mathLevel: number;
  totalScore: number;
  averageScore: number;
  lastActivityDate?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateEarned: string;
  category: 'english' | 'math' | 'milestone';
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'english' | 'math' | 'science' | 'habits' | 'art' | 'social' | 'problem' | 'physical' | 'world' | 'languages';
  subcategory: string;
  minAge: number;
  maxAge: number;
  estimatedDuration: number; // in minutes
  difficultyLevel: number; // 1-5 scale
  icon: string;
  backgroundColor: string;
  isLocked: boolean;
  isCompleted: boolean;
}

export interface ActivityResult {
  activityId: string;
  score: number;
  timeSpent: number; // in seconds
  completedAt: string;
  mistakes: number;
  hintsUsed: number;
}