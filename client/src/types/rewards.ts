export interface RewardItem {
  id: string;
  name: string;
  description: string;
  category: 'treats' | 'gifts' | 'experiences' | 'food' | 'digital' | 'recognition';
  pointsCost: number;
  icon: string;
  imageUrl?: string;
  ageAppropriate: number[]; // Ages this reward is suitable for
  parentApprovalRequired: boolean;
  availability: 'always' | 'seasonal' | 'limited';
  seasonalPeriod?: string; // e.g., "halloween", "christmas"
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'streak' | 'perfect_score' | 'activity_count' | 'category_complete' | 'points_earned';
    value: number;
    category?: string;
  };
  pointsReward: number;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface RewardCard {
  id: string;
  childId: string;
  totalPoints: number;
  availablePoints: number; // Points not yet spent
  currentLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  achievements: string[]; // Achievement IDs earned
  redeemedRewards: RewardRedemption[];
  pendingRequests: RewardRequest[];
  streakCount: number;
  lastActivityDate: string;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  pointsUsed: number;
  redeemedAt: string;
  status: 'pending' | 'approved' | 'denied' | 'fulfilled';
  parentNotes?: string;
  fulfilledAt?: string;
}

export interface RewardRequest {
  id: string;
  rewardId: string;
  pointsRequired: number;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  childMessage?: string;
  parentResponse?: string;
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  date: string;
  criteria: {
    type: 'complete_activities' | 'perfect_scores' | 'try_new_category' | 'study_time';
    value: number;
    category?: string;
  };
  bonusPoints: number;
  completed: boolean;
}

// Points earning system
export const POINTS_SYSTEM = {
  // Base points for completion
  ACTIVITY_COMPLETION: 10,
  
  // Bonus points for performance
  PERFECT_SCORE: 20, // 100% score
  EXCELLENT_SCORE: 15, // 80-99% score
  GOOD_SCORE: 10, // 60-79% score
  
  // Streak bonuses
  DAILY_STREAK_BONUS: 5, // Per day in streak
  WEEKLY_STREAK_BONUS: 50, // Complete 7 days
  
  // Challenge completion
  DAILY_CHALLENGE: 25,
  WEEKLY_CHALLENGE: 100,
  
  // First time bonuses
  FIRST_TIME_ACTIVITY: 15,
  FIRST_TIME_CATEGORY: 25,
  
  // Achievement bonuses (defined per achievement)
  ACHIEVEMENT_BRONZE: 50,
  ACHIEVEMENT_SILVER: 100,
  ACHIEVEMENT_GOLD: 200,
  ACHIEVEMENT_PLATINUM: 500,
};

// Level thresholds
export const LEVEL_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
};

export const calculateLevel = (totalPoints: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
  if (totalPoints >= LEVEL_THRESHOLDS.platinum) return 'platinum';
  if (totalPoints >= LEVEL_THRESHOLDS.gold) return 'gold';
  if (totalPoints >= LEVEL_THRESHOLDS.silver) return 'silver';
  return 'bronze';
};