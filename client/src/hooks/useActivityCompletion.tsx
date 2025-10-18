import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useRewardStore } from '../stores/rewardStore';
import { activityCompletionService } from '../services/activityCompletionService';

export interface ActivityCompletion {
  activityId: string;
  languagePage: string; // 'hindi' | 'english' | 'malayalam' | 'arabic' | 'spanish'
  completedAt: string;
  score?: number;
  timeSpent?: number;
  pointsEarned: number;
  isFirstTime?: boolean;
  isNewCategory?: boolean;
}

interface ActivityCompletionState {
  completedActivities: Set<string>;
  isLoading: boolean;
  error: string | null;
}

interface UseActivityCompletionReturn extends ActivityCompletionState {
  completeActivity: (
    activityId: string,
    languagePage: string,
    score?: number,
    timeSpent?: number
  ) => Promise<{ success: boolean; pointsEarned: number; error?: string }>;
  isActivityCompleted: (activityId: string) => boolean;
  getCompletedActivities: () => string[];
  getTotalPointsEarned: () => number;
  resetProgress: () => Promise<void>;
}

const POINTS_PER_ACTIVITY = 50;
const PERFECT_SCORE_BONUS = 25;
const FIRST_TIME_BONUS = 10;
const NEW_CATEGORY_BONUS = 15;

export const useActivityCompletion = (
  initialLanguagePage?: string
): UseActivityCompletionReturn => {
  const { user, isAuthenticated, isGuest } = useAuth();
  const {
    initializeRewardCard,
    awardActivityCompletion,
    getRewardCard,
  } = useRewardStore();

  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get child ID for reward system
  const getChildId = useCallback(() => {
    if (user) {
      return user.id.toString();
    }
    return 'guest-user';
  }, [user]);

  // Initialize completion data on mount
  useEffect(() => {
    const loadCompletionData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const childId = getChildId();
        
        // Initialize reward card if needed
        initializeRewardCard(childId);
        
        // Load completed activities
        let completedActivityIds: string[] = [];
        
        if (isAuthenticated && !isGuest) {
          // Load from backend for authenticated users
          try {
            const response = await activityCompletionService.getCompletedActivities(user!.id);
            if (response.success && response.data) {
              completedActivityIds = response.data.map((completion: ActivityCompletion) => completion.activityId);
            }
          } catch (apiError) {
            console.warn('Failed to load from backend, falling back to localStorage:', apiError);
            completedActivityIds = activityCompletionService.getLocalCompletedActivities(childId);
          }
        } else {
          // Load from localStorage for guest users
          completedActivityIds = activityCompletionService.getLocalCompletedActivities(childId);
        }
        
        setCompletedActivities(new Set(completedActivityIds));
      } catch (err) {
        console.error('Failed to load completion data:', err);
        setError('Failed to load progress data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletionData();
  }, [user, isAuthenticated, isGuest, initializeRewardCard, getChildId]);

  const completeActivity = useCallback(async (
    activityId: string,
    languagePage: string,
    score: number = 100,
    timeSpent: number = 0
  ): Promise<{ success: boolean; pointsEarned: number; error?: string }> => {
    // Check if activity is already completed
    if (completedActivities.has(activityId)) {
      return {
        success: false,
        pointsEarned: 0,
        error: 'Activity already completed'
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const childId = getChildId();
      
      // Calculate points earned
      let pointsEarned = POINTS_PER_ACTIVITY;
      
      // Score-based bonuses
      if (score >= 100) {
        pointsEarned += PERFECT_SCORE_BONUS;
      }
      
      // Check if this is first time completing an activity
      const isFirstTime = completedActivities.size === 0;
      if (isFirstTime) {
        pointsEarned += FIRST_TIME_BONUS;
      }
      
      // Check if this is a new category (simplified - could be enhanced)
      const completedLanguages = new Set(
        Array.from(completedActivities).map(id => id.split('-')[0])
      );
      const isNewCategory = !completedLanguages.has(languagePage);
      if (isNewCategory) {
        pointsEarned += NEW_CATEGORY_BONUS;
      }

      const completion: ActivityCompletion = {
        activityId,
        languagePage,
        completedAt: new Date().toISOString(),
        score,
        timeSpent,
        pointsEarned,
        isFirstTime,
        isNewCategory,
      };

      let success = false;

      // Try to save to backend for authenticated users
      if (isAuthenticated && !isGuest && user) {
        try {
          const response = await activityCompletionService.completeActivity(
            user.id,
            completion
          );
          success = response.success;
          
          if (!success) {
            throw new Error(response.error || 'Backend save failed');
          }
        } catch (apiError) {
          console.warn('Backend save failed, falling back to localStorage:', apiError);
          // Fall back to localStorage
          activityCompletionService.saveLocalCompletion(childId, completion);
          success = true;
        }
      } else {
        // Save to localStorage for guest users
        activityCompletionService.saveLocalCompletion(childId, completion);
        success = true;
      }

      if (success) {
        // Update local state
        setCompletedActivities(prev => new Set([...prev, activityId]));
        
        // Award points through reward system
        awardActivityCompletion(
          childId,
          activityId,
          score,
          isFirstTime,
          isNewCategory
        );

        return {
          success: true,
          pointsEarned,
        };
      } else {
        throw new Error('Failed to save activity completion');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Failed to complete activity:', err);
      setError(errorMessage);
      
      return {
        success: false,
        pointsEarned: 0,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [
    completedActivities,
    isAuthenticated,
    isGuest,
    user,
    getChildId,
    awardActivityCompletion,
  ]);

  const isActivityCompleted = useCallback((activityId: string): boolean => {
    return completedActivities.has(activityId);
  }, [completedActivities]);

  const getCompletedActivities = useCallback((): string[] => {
    return Array.from(completedActivities);
  }, [completedActivities]);

  const getTotalPointsEarned = useCallback((): number => {
    const childId = getChildId();
    const rewardCard = getRewardCard(childId);
    return rewardCard ? rewardCard.totalPoints : 0;
  }, [getChildId, getRewardCard]);

  const resetProgress = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const childId = getChildId();
      
      // Clear completed activities
      setCompletedActivities(new Set());
      
      // Clear local storage
      activityCompletionService.clearLocalData(childId);
      
      // Reset reward card
      initializeRewardCard(childId);
      
      // If authenticated, could also reset backend data
      if (isAuthenticated && !isGuest && user) {
        try {
          await activityCompletionService.resetUserProgress(user.id);
        } catch (error) {
          console.warn('Failed to reset backend progress:', error);
        }
      }
    } catch (err) {
      console.error('Failed to reset progress:', err);
      setError('Failed to reset progress');
    } finally {
      setIsLoading(false);
    }
  }, [getChildId, isAuthenticated, isGuest, user, initializeRewardCard]);

  return {
    completedActivities,
    isLoading,
    error,
    completeActivity,
    isActivityCompleted,
    getCompletedActivities,
    getTotalPointsEarned,
    resetProgress,
  };
};