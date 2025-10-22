import { ObjectId } from 'mongoose';
import { GameProfile, IGameProfile } from '../models/GameProfile';
import { Badge, IBadge } from '../models/Badge';
import { GameAchievement, IGameAchievement } from '../models/GameAchievement';
import { Challenge, IChallenge } from '../models/Challenge';
import { Leaderboard, ILeaderboard } from '../models/Leaderboard';

export interface PointsTransaction {
  source: 'assignment' | 'activity' | 'collaboration' | 'achievement' | 'challenge' | 'bonus' | 'penalty';
  sourceId?: ObjectId;
  amount: number;
  description: string;
  metadata?: any;
}

export interface BadgeEarningResult {
  earned: boolean;
  badge?: IBadge;
  level?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  previouslyEarned: boolean;
  progress: number;
}

export interface AchievementProgress {
  achievement: IGameAchievement;
  progress: number;
  completed: boolean;
  nextMilestone?: any;
  blockers?: string[];
}

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
  rewards: {
    points: number;
    badges: ObjectId[];
    titles: string[];
    privileges: string[];
  };
}

export class GamificationService {
  /**
   * Award points to a user
   */
  static async awardPoints(
    userId: ObjectId, 
    transaction: PointsTransaction
  ): Promise<{ profile: IGameProfile; levelUp?: LevelUpResult }> {
    const profile = await GameProfile.findOne({ userId }) || 
                   await GameProfile.create({ userId });

    // Add points transaction
    profile.points.transactions.push({
      source: transaction.source,
      sourceId: transaction.sourceId,
      amount: transaction.amount,
      description: transaction.description,
      metadata: transaction.metadata,
      timestamp: new Date()
    });

    // Update points breakdown
    const pointsKey = transaction.source;
    if (profile.points.breakdown[pointsKey] !== undefined) {
      profile.points.breakdown[pointsKey] += Math.max(0, transaction.amount);
    }

    // Update total points
    profile.points.total += transaction.amount;
    profile.points.available += transaction.amount;

    // Ensure points don't go below 0
    if (profile.points.total < 0) {
      profile.points.total = 0;
      profile.points.available = 0;
    }

    // Check for level up
    const levelUpResult = await this.checkLevelUp(profile);

    // Update last activity
    profile.activity.lastActive = new Date();

    await profile.save();

    // Update leaderboards
    await this.updateUserInLeaderboards(userId, profile);

    // Check for new achievements and badges
    await this.checkAchievementsAndBadges(userId, profile);

    return { profile, levelUp: levelUpResult };
  }

  /**
   * Check if user should level up
   */
  static async checkLevelUp(profile: IGameProfile): Promise<LevelUpResult | undefined> {
    const currentLevel = profile.level.current;
    let newLevel = currentLevel;
    let experienceNeeded = profile.level.experienceToNext;

    // Calculate new level based on experience
    while (profile.level.experience >= experienceNeeded) {
      newLevel++;
      profile.level.experience -= experienceNeeded;
      
      // Calculate experience needed for next level (exponential growth)
      experienceNeeded = Math.floor(100 * Math.pow(1.2, newLevel - 1));
    }

    if (newLevel > currentLevel) {
      // Level up!
      profile.level.current = newLevel;
      profile.level.experienceToNext = experienceNeeded - profile.level.experience;

      // Calculate level-up rewards
      const levelDifference = newLevel - currentLevel;
      const rewards = {
        points: levelDifference * 50, // 50 points per level
        badges: [], // Could award special level badges
        titles: [`Level ${newLevel} Explorer`],
        privileges: newLevel >= 10 ? ['advanced_features'] : []
      };

      // Award level-up rewards
      profile.points.total += rewards.points;
      profile.points.available += rewards.points;
      profile.points.breakdown.bonus += rewards.points;

      // Add earned titles
      for (const title of rewards.titles) {
        if (!profile.customization.earnedTitles.includes(title)) {
          profile.customization.earnedTitles.push(title);
        }
      }

      // Record level history
      profile.level.history.push({
        level: newLevel,
        achievedAt: new Date(),
        timeSpent: 0 // Could calculate actual time
      });

      return {
        leveledUp: true,
        newLevel,
        previousLevel: currentLevel,
        rewards
      };
    }

    return undefined;
  }

  /**
   * Check for eligible badges and achievements
   */
  static async checkAchievementsAndBadges(userId: ObjectId, profile: IGameProfile): Promise<{
    newBadges: BadgeEarningResult[];
    newAchievements: AchievementProgress[];
  }> {
    const newBadges: BadgeEarningResult[] = [];
    const newAchievements: AchievementProgress[] = [];

    // Check badges
    const eligibleBadges = await Badge.find({ 
      'metadata.isActive': true,
      'metadata.isVisible': true 
    });

    for (const badge of eligibleBadges) {
      const eligibility = badge.checkEligibility(profile);
      
      if (eligibility.eligible) {
        const existingBadge = profile.badges.find(
          b => b.badgeId.toString() === badge._id.toString()
        );

        if (!existingBadge) {
          // Award new badge
          const level = badge.determineBadgeLevel(eligibility.progress);
          const levelInfo = badge.getLevelInfo(level);

          profile.badges.push({
            badgeId: badge._id,
            level,
            earnedAt: new Date(),
            progress: eligibility.progress,
            milestones: [],
            metadata: {}
          });

          // Award badge rewards
          if (levelInfo) {
            for (const reward of levelInfo.rewards) {
              if (reward.type === 'points') {
                profile.points.total += reward.value;
                profile.points.available += reward.value;
                profile.points.breakdown.achievements += reward.value;
              }
            }
          }

          // Record badge earning
          await badge.recordEarning(level);

          newBadges.push({
            earned: true,
            badge,
            level,
            previouslyEarned: false,
            progress: eligibility.progress
          });
        } else {
          // Check for badge level upgrade
          const currentLevel = existingBadge.level;
          const newLevel = badge.determineBadgeLevel(eligibility.progress);
          
          if (this.isBadgeLevelHigher(newLevel, currentLevel)) {
            existingBadge.level = newLevel;
            existingBadge.earnedAt = new Date();
            existingBadge.progress = eligibility.progress;

            newBadges.push({
              earned: true,
              badge,
              level: newLevel,
              previouslyEarned: true,
              progress: eligibility.progress
            });
          }
        }
      }
    }

    // Check achievements
    const eligibleAchievements = await GameAchievement.find({ 
      'metadata.isActive': true 
    });

    for (const achievement of eligibleAchievements) {
      const eligibility = achievement.checkEligibility(profile);
      
      if (eligibility.eligible) {
        const existingAchievement = profile.achievements.find(
          a => a.achievementId.toString() === achievement._id.toString()
        );

        if (!existingAchievement || !existingAchievement.completed) {
          // Complete achievement
          if (existingAchievement) {
            existingAchievement.completed = true;
            existingAchievement.completedAt = new Date();
            existingAchievement.progress = eligibility.progress;
          } else {
            profile.achievements.push({
              achievementId: achievement._id,
              progress: eligibility.progress,
              completed: true,
              completedAt: new Date(),
              startedAt: new Date(),
              attempts: 1,
              milestones: [],
              metadata: {}
            });
          }

          // Award achievement rewards
          const rewards = achievement.rewards.immediate;
          profile.points.total += rewards.points;
          profile.points.available += rewards.points;
          profile.points.breakdown.achievements += rewards.points;

          // Record achievement completion
          await achievement.recordCompletion(userId);

          newAchievements.push({
            achievement,
            progress: eligibility.progress,
            completed: true
          });
        }
      } else if (eligibility.progress > 0) {
        // Update progress for incomplete achievements
        let existingAchievement = profile.achievements.find(
          a => a.achievementId.toString() === achievement._id.toString()
        );

        if (!existingAchievement) {
          existingAchievement = {
            achievementId: achievement._id,
            progress: eligibility.progress,
            completed: false,
            startedAt: new Date(),
            attempts: 1,
            milestones: [],
            metadata: {}
          };
          profile.achievements.push(existingAchievement);
        } else {
          existingAchievement.progress = Math.max(existingAchievement.progress, eligibility.progress);
        }

        newAchievements.push({
          achievement,
          progress: eligibility.progress,
          completed: false,
          nextMilestone: eligibility.nextMilestone,
          blockers: eligibility.blockers
        });
      }
    }

    await profile.save();

    return { newBadges, newAchievements };
  }

  /**
   * Check if a badge level is higher than another
   */
  static isBadgeLevelHigher(
    newLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond',
    currentLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  ): boolean {
    const levelOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    return levelOrder.indexOf(newLevel) > levelOrder.indexOf(currentLevel);
  }

  /**
   * Update user's position in all relevant leaderboards
   */
  static async updateUserInLeaderboards(userId: ObjectId, profile: IGameProfile): Promise<void> {
    const leaderboards = await Leaderboard.find({
      'metadata.isActive': true,
      'participants.eligibility.userTypes': { $in: ['student'] } // Assuming user is student
    });

    for (const leaderboard of leaderboards) {
      // Extract primary metric value
      const primaryField = leaderboard.metrics.primary.field;
      const primaryValue = this.extractFieldValue(profile, primaryField);

      // Extract secondary metrics
      const secondaryMetrics = (leaderboard.metrics.secondary || []).map(metric => ({
        field: metric.field,
        value: this.extractFieldValue(profile, metric.field)
      }));

      await leaderboard.updateEntry(userId, primaryValue, secondaryMetrics);
    }
  }

  /**
   * Extract field value from profile using dot notation
   */
  static extractFieldValue(profile: any, fieldPath: string): number {
    const paths = fieldPath.split('.');
    let value = profile;

    for (const path of paths) {
      if (value && typeof value === 'object' && path in value) {
        value = value[path];
      } else {
        return 0;
      }
    }

    return typeof value === 'number' ? value : 0;
  }

  /**
   * Get user's gamification profile
   */
  static async getUserProfile(userId: ObjectId): Promise<IGameProfile | null> {
    return await GameProfile.findOne({ userId })
      .populate('badges.badgeId')
      .populate('achievements.achievementId');
  }

  /**
   * Get user's progress on specific achievement
   */
  static async getAchievementProgress(
    userId: ObjectId, 
    achievementId: ObjectId
  ): Promise<AchievementProgress | null> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return null;

    const achievement = await GameAchievement.findById(achievementId);
    if (!achievement) return null;

    const eligibility = achievement.checkEligibility(profile);
    
    return {
      achievement,
      progress: eligibility.progress,
      completed: eligibility.eligible && eligibility.progress >= 100,
      nextMilestone: eligibility.nextMilestone,
      blockers: eligibility.blockers
    };
  }

  /**
   * Get available challenges for user
   */
  static async getAvailableChallenges(userId: ObjectId): Promise<IChallenge[]> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return [];

    const challenges = await Challenge.find({
      'metadata.isActive': true,
      'metadata.isPublic': true,
      'schedule.startDate': { $lte: new Date() },
      'schedule.endDate': { $gte: new Date() }
    });

    return challenges.filter(challenge => {
      const eligibility = challenge.canParticipate(userId, profile);
      return eligibility.canParticipate;
    });
  }

  /**
   * Join a challenge
   */
  static async joinChallenge(
    userId: ObjectId, 
    challengeId: ObjectId,
    teamId?: ObjectId
  ): Promise<{ success: boolean; message: string; challenge?: IChallenge }> {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      return { success: false, message: 'User profile not found' };
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return { success: false, message: 'Challenge not found' };
    }

    const eligibility = challenge.canParticipate(userId, profile);
    if (!eligibility.canParticipate) {
      return { 
        success: false, 
        message: eligibility.reason || 'Cannot participate in this challenge' 
      };
    }

    // Add participant to challenge
    await challenge.addParticipant(userId, teamId);

    // Update user's profile
    profile.challenges.active.push({
      challengeId,
      joinedAt: new Date(),
      status: 'active',
      progress: 0,
      lastActivity: new Date(),
      teamId,
      metadata: {}
    });

    await profile.save();

    return { success: true, message: 'Successfully joined challenge', challenge };
  }

  /**
   * Complete a challenge
   */
  static async completeChallenge(
    userId: ObjectId,
    challengeId: ObjectId,
    score: number,
    completionTime: number, // in minutes
    metadata: any = {}
  ): Promise<{ success: boolean; rewards: any; challenge?: IChallenge }> {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      return { success: false, rewards: null };
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return { success: false, rewards: null };
    }

    // Update challenge participation
    await challenge.recordCompletion(userId, score, completionTime);

    // Update leaderboard
    await challenge.updateLeaderboard(
      userId, 
      metadata.teamId, 
      score, 
      completionTime, 
      metadata.accuracy
    );

    // Update user's profile
    const activeChallenge = profile.challenges.active.find(
      c => c.challengeId.toString() === challengeId.toString()
    );

    if (activeChallenge) {
      // Move to completed challenges
      profile.challenges.completed.push({
        challengeId,
        completedAt: new Date(),
        score,
        rank: 0, // Will be updated based on leaderboard
        rewards: {
          points: 0,
          badges: [],
          achievements: [],
          items: []
        },
        metadata: {
          completionTime,
          ...metadata
        }
      });

      // Remove from active challenges
      profile.challenges.active = profile.challenges.active.filter(
        c => c.challengeId.toString() !== challengeId.toString()
      );
    }

    // Calculate and award rewards
    const rewards = await this.calculateChallengeRewards(challenge, score, completionTime);
    
    // Award points
    if (rewards.points > 0) {
      await this.awardPoints(userId, {
        source: 'challenge',
        sourceId: challengeId,
        amount: rewards.points,
        description: `Completed challenge: ${challenge.title}`,
        metadata: { score, completionTime }
      });
    }

    await profile.save();

    return { success: true, rewards, challenge };
  }

  /**
   * Calculate rewards for challenge completion
   */
  static async calculateChallengeRewards(
    challenge: IChallenge,
    score: number,
    completionTime: number
  ): Promise<any> {
    let totalPoints = challenge.rewards.completion.points;

    // Bonus points for high score
    const scorePercentage = (score / challenge.scoring.maxPoints) * 100;
    if (scorePercentage >= 90) {
      totalPoints += 50; // Excellent performance bonus
    } else if (scorePercentage >= 75) {
      totalPoints += 25; // Good performance bonus
    }

    // Speed bonus
    const estimatedTime = challenge.duration.value;
    const timeUnit = challenge.duration.type;
    let estimatedMinutes = estimatedTime;

    switch (timeUnit) {
      case 'hours':
        estimatedMinutes *= 60;
        break;
      case 'days':
        estimatedMinutes *= 24 * 60;
        break;
      case 'weeks':
        estimatedMinutes *= 7 * 24 * 60;
        break;
    }

    if (completionTime < estimatedMinutes * 0.75) {
      totalPoints += Math.floor(totalPoints * 0.25); // 25% speed bonus
    }

    return {
      points: totalPoints,
      badges: challenge.rewards.completion.badges,
      achievements: [],
      certificates: challenge.rewards.completion.certificates
    };
  }

  /**
   * Get user's leaderboard positions
   */
  static async getUserLeaderboardPositions(userId: ObjectId): Promise<Array<{
    leaderboard: ILeaderboard;
    position: number;
    score: number;
    rankChange?: 'up' | 'down' | 'same' | 'new';
  }>> {
    const leaderboards = await Leaderboard.find({
      'metadata.isActive': true,
      'entries.participantId': userId
    });

    return leaderboards.map(leaderboard => {
      const entry = leaderboard.entries.find(
        e => e.participantId.toString() === userId.toString()
      );

      return {
        leaderboard,
        position: entry?.rank || 0,
        score: entry?.score || 0,
        rankChange: entry?.rankChange
      };
    });
  }

  /**
   * Award experience points (separate from regular points)
   */
  static async awardExperience(
    userId: ObjectId,
    amount: number,
    source: string,
    description: string
  ): Promise<{ profile: IGameProfile; levelUp?: LevelUpResult }> {
    const profile = await GameProfile.findOne({ userId }) || 
                   await GameProfile.create({ userId });

    profile.level.experience += amount;

    // Check for level up
    const levelUpResult = await this.checkLevelUp(profile);

    await profile.save();

    return { profile, levelUp: levelUpResult };
  }

  /**
   * Update user streak
   */
  static async updateStreak(
    userId: ObjectId,
    streakType: 'daily_login' | 'weekly_goal' | 'monthly_challenge' | 'assignment_completion',
    increment: boolean = true
  ): Promise<IGameProfile> {
    const profile = await GameProfile.findOne({ userId }) || 
                   await GameProfile.create({ userId });

    const streak = profile.streaks.find(s => s.type === streakType);
    
    if (streak) {
      if (increment) {
        streak.current += 1;
        streak.longest = Math.max(streak.longest, streak.current);
        streak.lastUpdated = new Date();
      } else {
        streak.current = 0;
        streak.lastUpdated = new Date();
      }
    } else {
      profile.streaks.push({
        type: streakType,
        current: increment ? 1 : 0,
        longest: increment ? 1 : 0,
        lastUpdated: new Date()
      });
    }

    await profile.save();

    // Check for streak-based achievements
    await this.checkAchievementsAndBadges(userId, profile);

    return profile;
  }

  /**
   * Get comprehensive user statistics
   */
  static async getUserStatistics(userId: ObjectId): Promise<any> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return null;

    const leaderboardPositions = await this.getUserLeaderboardPositions(userId);
    
    return {
      profile,
      leaderboardPositions,
      summary: {
        totalPoints: profile.points.total,
        level: profile.level.current,
        badgesCount: profile.badges.length,
        achievementsCount: profile.achievements.filter(a => a.completed).length,
        activeChallenges: profile.challenges.active.length,
        completedChallenges: profile.challenges.completed.length,
        longestStreak: Math.max(...profile.streaks.map(s => s.longest)),
        currentStreaks: profile.streaks.filter(s => s.current > 0).length
      }
    };
  }

  /**
   * Spend points on items or rewards
   */
  static async spendPoints(
    userId: ObjectId,
    amount: number,
    description: string,
    metadata: any = {}
  ): Promise<{ success: boolean; newBalance: number; profile?: IGameProfile }> {
    const profile = await GameProfile.findOne({ userId });
    if (!profile) {
      return { success: false, newBalance: 0 };
    }

    if (profile.points.available < amount) {
      return { success: false, newBalance: profile.points.available };
    }

    // Deduct points
    profile.points.available -= amount;
    profile.points.spent += amount;

    // Record transaction
    profile.points.transactions.push({
      source: 'penalty',
      amount: -amount,
      description,
      metadata,
      timestamp: new Date()
    });

    await profile.save();

    return { 
      success: true, 
      newBalance: profile.points.available,
      profile 
    };
  }
}

export default GamificationService;