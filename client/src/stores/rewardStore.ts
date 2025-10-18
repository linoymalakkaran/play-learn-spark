import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RewardCard, RewardRedemption, RewardRequest, Achievement, DailyChallenge } from '../types/rewards';
import { POINTS_SYSTEM, calculateLevel } from '../types/rewards';
import { ACHIEVEMENTS_CATALOG } from '../data/rewardsData';

interface RewardState {
  rewardCards: Record<string, RewardCard>; // childId -> RewardCard
  dailyChallenges: DailyChallenge[];
  completedAchievements: Record<string, string[]>; // childId -> achievement IDs
  
  // Actions
  initializeRewardCard: (childId: string) => void;
  awardPoints: (childId: string, points: number, reason: string) => void;
  awardActivityCompletion: (childId: string, activityId: string, score: number, isFirstTime: boolean, isNewCategory: boolean) => void;
  requestReward: (childId: string, rewardId: string, pointsRequired: number, message?: string) => void;
  approveRewardRequest: (childId: string, requestId: string, approved: boolean, parentResponse?: string) => void;
  redeemReward: (childId: string, rewardId: string, pointsCost: number) => void;
  checkAchievements: (childId: string) => Achievement[];
  updateStreak: (childId: string) => void;
  generateDailyChallenges: () => void;
  completeDailyChallenge: (childId: string, challengeId: string) => void;
  getRewardCard: (childId: string) => RewardCard | null;
  getAvailablePoints: (childId: string) => number;
  getCurrentLevel: (childId: string) => 'bronze' | 'silver' | 'gold' | 'platinum';
  getProgressToNextLevel: (childId: string) => { current: number; required: number; percentage: number };
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      rewardCards: {},
      dailyChallenges: [],
      completedAchievements: {},

      initializeRewardCard: (childId: string) => {
        const existingCard = get().rewardCards[childId];
        if (existingCard) return;

        const newCard: RewardCard = {
          id: `card-${childId}`,
          childId,
          totalPoints: 15, // Give 15 starter points for new users
          availablePoints: 15, // Give 15 starter points for new users
          currentLevel: 'bronze',
          achievements: [],
          redeemedRewards: [],
          pendingRequests: [],
          streakCount: 0,
          lastActivityDate: '',
        };

        set((state) => ({
          rewardCards: {
            ...state.rewardCards,
            [childId]: newCard,
          },
          completedAchievements: {
            ...state.completedAchievements,
            [childId]: [],
          },
        }));
      },

      awardPoints: (childId: string, points: number, reason: string) => {
        set((state) => {
          const card = state.rewardCards[childId];
          if (!card) return state;

          const updatedCard: RewardCard = {
            ...card,
            totalPoints: card.totalPoints + points,
            availablePoints: card.availablePoints + points,
            currentLevel: calculateLevel(card.totalPoints + points),
          };

          return {
            rewardCards: {
              ...state.rewardCards,
              [childId]: updatedCard,
            },
          };
        });

        // Check for new achievements after awarding points
        get().checkAchievements(childId);
      },

      awardActivityCompletion: (childId: string, activityId: string, score: number, isFirstTime: boolean, isNewCategory: boolean) => {
        let totalPoints = POINTS_SYSTEM.ACTIVITY_COMPLETION;

        // Score-based bonuses
        if (score >= 100) {
          totalPoints += POINTS_SYSTEM.PERFECT_SCORE;
        } else if (score >= 80) {
          totalPoints += POINTS_SYSTEM.EXCELLENT_SCORE;
        } else if (score >= 60) {
          totalPoints += POINTS_SYSTEM.GOOD_SCORE;
        }

        // First-time bonuses
        if (isFirstTime) {
          totalPoints += POINTS_SYSTEM.FIRST_TIME_ACTIVITY;
        }
        if (isNewCategory) {
          totalPoints += POINTS_SYSTEM.FIRST_TIME_CATEGORY;
        }

        // Update streak and award streak bonuses
        get().updateStreak(childId);
        const card = get().rewardCards[childId];
        if (card && card.streakCount > 1) {
          totalPoints += POINTS_SYSTEM.DAILY_STREAK_BONUS * card.streakCount;
        }

        get().awardPoints(childId, totalPoints, `Activity completion: ${activityId}`);
      },

      updateStreak: (childId: string) => {
        const today = new Date().toISOString().split('T')[0];
        
        set((state) => {
          const card = state.rewardCards[childId];
          if (!card) return state;

          const lastActivityDate = card.lastActivityDate.split('T')[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          let newStreakCount = 1;
          
          if (lastActivityDate === yesterdayStr) {
            // Consecutive day
            newStreakCount = card.streakCount + 1;
          } else if (lastActivityDate === today) {
            // Same day, maintain streak
            newStreakCount = card.streakCount;
          }
          // If more than one day gap, streak resets to 1

          // Award weekly streak bonus
          if (newStreakCount === 7) {
            setTimeout(() => {
              get().awardPoints(childId, POINTS_SYSTEM.WEEKLY_STREAK_BONUS, '7-day streak bonus!');
            }, 100);
          }

          const updatedCard: RewardCard = {
            ...card,
            streakCount: newStreakCount,
            lastActivityDate: new Date().toISOString(),
          };

          return {
            rewardCards: {
              ...state.rewardCards,
              [childId]: updatedCard,
            },
          };
        });
      },

      requestReward: (childId: string, rewardId: string, pointsRequired: number, message?: string) => {
        set((state) => {
          const card = state.rewardCards[childId];
          if (!card || card.availablePoints < pointsRequired) return state;

          const newRequest: RewardRequest = {
            id: `request-${Date.now()}`,
            rewardId,
            pointsRequired,
            requestedAt: new Date().toISOString(),
            status: 'pending',
            childMessage: message,
          };

          const updatedCard: RewardCard = {
            ...card,
            pendingRequests: [...card.pendingRequests, newRequest],
          };

          return {
            rewardCards: {
              ...state.rewardCards,
              [childId]: updatedCard,
            },
          };
        });
      },

      approveRewardRequest: (childId: string, requestId: string, approved: boolean, parentResponse?: string) => {
        set((state) => {
          const card = state.rewardCards[childId];
          if (!card) return state;

          const updatedRequests = card.pendingRequests.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  status: (approved ? 'approved' : 'denied') as 'approved' | 'denied' | 'pending',
                  parentResponse,
                }
              : request
          );

          // If approved, create redemption record and deduct points
          let updatedCard: RewardCard = { ...card, pendingRequests: updatedRequests };
          
          if (approved) {
            const request = card.pendingRequests.find(r => r.id === requestId);
            if (request) {
              const redemption: RewardRedemption = {
                id: `redemption-${Date.now()}`,
                rewardId: request.rewardId,
                pointsUsed: request.pointsRequired,
                redeemedAt: new Date().toISOString(),
                status: 'approved',
                parentNotes: parentResponse,
              };

              updatedCard = {
                ...updatedCard,
                availablePoints: updatedCard.availablePoints - request.pointsRequired,
                redeemedRewards: [...updatedCard.redeemedRewards, redemption],
              };
            }
          }

          return {
            rewardCards: {
              ...state.rewardCards,
              [childId]: updatedCard,
            },
          };
        });
      },

      redeemReward: (childId: string, rewardId: string, pointsCost: number) => {
        set((state) => {
          const card = state.rewardCards[childId];
          if (!card || card.availablePoints < pointsCost) return state;

          const redemption: RewardRedemption = {
            id: `redemption-${Date.now()}`,
            rewardId,
            pointsUsed: pointsCost,
            redeemedAt: new Date().toISOString(),
            status: 'approved', // Auto-approve for non-parent-required rewards
          };

          const updatedCard: RewardCard = {
            ...card,
            availablePoints: card.availablePoints - pointsCost,
            redeemedRewards: [...card.redeemedRewards, redemption],
          };

          return {
            rewardCards: {
              ...state.rewardCards,
              [childId]: updatedCard,
            },
          };
        });
      },

      checkAchievements: (childId: string) => {
        const card = get().rewardCards[childId];
        const completedIds = get().completedAchievements[childId] || [];
        
        if (!card) return [];

        const newAchievements: Achievement[] = [];

        ACHIEVEMENTS_CATALOG.forEach((achievement) => {
          if (completedIds.includes(achievement.id)) return;

          let earned = false;

          switch (achievement.criteria.type) {
            case 'streak':
              earned = card.streakCount >= achievement.criteria.value;
              break;
            case 'points_earned':
              earned = card.totalPoints >= achievement.criteria.value;
              break;
            case 'activity_count':
              // This would need activity tracking - simplified for now
              earned = card.redeemedRewards.length >= achievement.criteria.value / 10;
              break;
            // Add other criteria checks as needed
          }

          if (earned) {
            newAchievements.push(achievement);
            
            // Award achievement points
            setTimeout(() => {
              const pointsMap = {
                bronze: POINTS_SYSTEM.ACHIEVEMENT_BRONZE,
                silver: POINTS_SYSTEM.ACHIEVEMENT_SILVER,
                gold: POINTS_SYSTEM.ACHIEVEMENT_GOLD,
                platinum: POINTS_SYSTEM.ACHIEVEMENT_PLATINUM,
              };
              
              get().awardPoints(childId, pointsMap[achievement.badgeLevel], `Achievement: ${achievement.name}`);
            }, 100);

            // Update completed achievements
            set((state) => ({
              completedAchievements: {
                ...state.completedAchievements,
                [childId]: [...(state.completedAchievements[childId] || []), achievement.id],
              },
            }));
          }
        });

        return newAchievements;
      },

      generateDailyChallenges: () => {
        const today = new Date().toISOString().split('T')[0];
        const existingChallenges = get().dailyChallenges;
        
        // Check if we already have challenges for today
        if (existingChallenges.some(c => c.date === today)) return;

        const challengeTemplates = [
          {
            name: 'Perfect Day',
            description: 'Get perfect scores on 3 activities today!',
            icon: '💯',
            criteria: { type: 'perfect_scores' as const, value: 3 },
            bonusPoints: 50,
          },
          {
            name: 'Explorer',
            description: 'Try 2 activities from different categories!',
            icon: '🌟',
            criteria: { type: 'try_new_category' as const, value: 2 },
            bonusPoints: 40,
          },
          {
            name: 'Study Marathon',
            description: 'Complete 5 activities today!',
            icon: '🏃‍♂️',
            criteria: { type: 'complete_activities' as const, value: 5 },
            bonusPoints: 60,
          },
        ];

        const newChallenges: DailyChallenge[] = challengeTemplates.map((template, index) => ({
          id: `challenge-${today}-${index}`,
          date: today,
          completed: false,
          ...template,
        }));

        set((state) => ({
          dailyChallenges: [...state.dailyChallenges.filter(c => c.date !== today), ...newChallenges],
        }));
      },

      completeDailyChallenge: (childId: string, challengeId: string) => {
        const challenge = get().dailyChallenges.find(c => c.id === challengeId);
        if (!challenge || challenge.completed) return;

        get().awardPoints(childId, challenge.bonusPoints, `Daily Challenge: ${challenge.name}`);

        set((state) => ({
          dailyChallenges: state.dailyChallenges.map(c =>
            c.id === challengeId ? { ...c, completed: true } : c
          ),
        }));
      },

      // Getter functions
      getRewardCard: (childId: string) => {
        return get().rewardCards[childId] || null;
      },

      getAvailablePoints: (childId: string) => {
        const card = get().rewardCards[childId];
        return card ? card.availablePoints : 0;
      },

      getCurrentLevel: (childId: string) => {
        const card = get().rewardCards[childId];
        return card ? card.currentLevel : 'bronze';
      },

      getProgressToNextLevel: (childId: string) => {
        const card = get().rewardCards[childId];
        if (!card) return { current: 0, required: 500, percentage: 0 };

        const levelThresholds = { bronze: 0, silver: 500, gold: 1500, platinum: 3000 };
        const currentLevel = card.currentLevel;
        const currentPoints = card.totalPoints;

        let nextThreshold = 3000; // platinum is max
        if (currentLevel === 'bronze') nextThreshold = levelThresholds.silver;
        else if (currentLevel === 'silver') nextThreshold = levelThresholds.gold;
        else if (currentLevel === 'gold') nextThreshold = levelThresholds.platinum;

        const currentThreshold = levelThresholds[currentLevel];
        const progressInLevel = currentPoints - currentThreshold;
        const pointsNeededForNext = nextThreshold - currentThreshold;
        const percentage = Math.min((progressInLevel / pointsNeededForNext) * 100, 100);

        return {
          current: progressInLevel,
          required: pointsNeededForNext,
          percentage,
        };
      },
    }),
    {
      name: 'reward-store',
      partialize: (state) => ({
        rewardCards: state.rewardCards,
        completedAchievements: state.completedAchievements,
        dailyChallenges: state.dailyChallenges,
      }),
    }
  )
);