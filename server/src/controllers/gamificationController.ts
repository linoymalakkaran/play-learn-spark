import { Request, Response } from 'express';
import { ObjectId } from 'mongoose';
import GamificationService, { PointsTransaction } from '../services/gamificationService';
import { GameProfile } from '../models/GameProfile';
import { Badge } from '../models/Badge';
import { GameAchievement } from '../models/GameAchievement';
import { Challenge } from '../models/Challenge';
import { Leaderboard } from '../models/Leaderboard';

export class GamificationController {
  /**
   * Get user's gamification profile
   */
  static async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.id;
      
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const statistics = await GamificationService.getUserStatistics(new ObjectId(userId));
      
      if (!statistics) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }

      res.json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to get user profile', 
        details: error.message 
      });
    }
  }

  /**
   * Award points to a user
   */
  static async awardPoints(req: Request, res: Response): Promise<void> {
    try {
      const { userId, source, sourceId, amount, description, metadata } = req.body;

      if (!userId || !source || amount === undefined || !description) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const transaction: PointsTransaction = {
        source,
        sourceId: sourceId ? new ObjectId(sourceId) : undefined,
        amount: Number(amount),
        description,
        metadata
      };

      const result = await GamificationService.awardPoints(new ObjectId(userId), transaction);

      res.json({
        success: true,
        data: {
          profile: result.profile,
          levelUp: result.levelUp,
          newTotal: result.profile.points.total
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to award points', 
        details: error.message 
      });
    }
  }

  /**
   * Award experience points
   */
  static async awardExperience(req: Request, res: Response): Promise<void> {
    try {
      const { userId, amount, source, description } = req.body;

      if (!userId || amount === undefined || !source || !description) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const result = await GamificationService.awardExperience(
        new ObjectId(userId),
        Number(amount),
        source,
        description
      );

      res.json({
        success: true,
        data: {
          profile: result.profile,
          levelUp: result.levelUp,
          newExperience: result.profile.level.experience
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to award experience', 
        details: error.message 
      });
    }
  }

  /**
   * Update user streak
   */
  static async updateStreak(req: Request, res: Response): Promise<void> {
    try {
      const { userId, streakType, increment = true } = req.body;

      if (!userId || !streakType) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const profile = await GamificationService.updateStreak(
        new ObjectId(userId),
        streakType,
        Boolean(increment)
      );

      res.json({
        success: true,
        data: {
          streaks: profile.streaks,
          updatedStreak: profile.streaks.find(s => s.type === streakType)
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to update streak', 
        details: error.message 
      });
    }
  }

  /**
   * Get available badges
   */
  static async getAvailableBadges(req: Request, res: Response): Promise<void> {
    try {
      const { category, difficulty, rarity, featured } = req.query;
      let query: any = { 'metadata.isActive': true, 'metadata.isVisible': true };

      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (rarity) query.rarity = rarity;
      if (featured === 'true') query['metadata.isFeatured'] = true;

      const badges = await Badge.find(query)
        .sort({ 'metadata.displayOrder': 1, 'tracking.totalEarned': -1 })
        .populate('metadata.createdBy', 'username firstName lastName');

      res.json({
        success: true,
        data: badges
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to get badges', 
        details: error.message 
      });
    }
  }

  /**
   * Get user's badge progress
   */
  static async getUserBadgeProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.id;
      const badgeId = req.params.badgeId;

      if (!userId || !badgeId) {
        res.status(400).json({ error: 'User ID and Badge ID are required' });
        return;
      }

      const profile = await GamificationService.getUserProfile(new ObjectId(userId));
      const badge = await Badge.findById(badgeId);

      if (!profile || !badge) {
        res.status(404).json({ error: 'Profile or badge not found' });
        return;
      }

      const eligibility = badge.checkEligibility(profile);

      res.json({
        success: true,
        data: {
          badge,
          progress: eligibility.progress,
          eligible: eligibility.eligible,
          reason: eligibility.reason,
          earned: profile.badges.some(b => b.badgeId.toString() === badgeId)
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to get badge progress', 
        details: error.message 
      });
    }
  }

  /**
   * Get available achievements
   */
  static async getAvailableAchievements(req: Request, res: Response): Promise<void> {
    try {
      const { category, difficulty, type, featured } = req.query;
      let query: any = { 'metadata.isActive': true };

      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (type) query.type = type;
      if (featured === 'true') query['metadata.isFeatured'] = true;

      const achievements = await GameAchievement.find(query)
        .sort({ 'tracking.popularityScore': -1 })
        .populate('metadata.createdBy', 'username firstName lastName');

      res.json({
        success: true,
        data: achievements
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to get achievements', 
        details: error.message 
      });
    }
  }

  /**
   * Get user's achievement progress
   */
  static async getUserAchievementProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.id;
      const achievementId = req.params.achievementId;

      if (!userId || !achievementId) {
        res.status(400).json({ error: 'User ID and Achievement ID are required' });
        return;
      }

      const progress = await GamificationService.getAchievementProgress(
        new ObjectId(userId),
        new ObjectId(achievementId)
      );

      if (!progress) {
        res.status(404).json({ error: 'Achievement progress not found' });
        return;
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to get achievement progress', 
        details: error.message 
      });
    }
  }

  /**
   * Get available challenges
   */
  static async getAvailableChallenges(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId || req.user?.id;
      const { category, difficulty, type, format, featured } = req.query;

      let challenges;
      
      if (userId) {
        challenges = await GamificationService.getAvailableChallenges(new ObjectId(userId));
      } else {
        let query: any = { 
          'metadata.isActive': true,
          'metadata.isPublic': true,
          'schedule.startDate': { $lte: new Date() },
          'schedule.endDate': { $gte: new Date() }
        };

        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (type) query.type = type;
        if (format) query.format = format;
        if (featured === 'true') query['metadata.isFeatured'] = true;

        challenges = await Challenge.find(query)
          .sort({ 'tracking.popularityScore': -1 })
          .populate('metadata.createdBy', 'username firstName lastName');
      }

      res.json({
        success: true,
        data: challenges
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to get challenges', 
        details: error.message 
      });
    }
  }

  /**
   * Join a challenge
   */
  static async joinChallenge(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.user?.id;
      const { challengeId, teamId } = req.body;

      if (!userId || !challengeId) {
        res.status(400).json({ error: 'User ID and Challenge ID are required' });
        return;
      }

      const result = await GamificationService.joinChallenge(
        new ObjectId(userId),
        new ObjectId(challengeId),
        teamId ? new ObjectId(teamId) : undefined
      );

      if (!result.success) {
        res.status(400).json({ error: result.message });
        return;
      }

      res.json({
        success: true,
        message: result.message,
        data: result.challenge
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to join challenge', 
        details: error.message 
      });
    }
  }

  /**
   * Complete a challenge
   */
  static async completeChallenge(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.user?.id;
      const { challengeId, score, completionTime, metadata = {} } = req.body;

      if (!userId || !challengeId || score === undefined || completionTime === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const result = await GamificationService.completeChallenge(
        new ObjectId(userId),
        new ObjectId(challengeId),
        Number(score),
        Number(completionTime),
        metadata
      );

      if (!result.success) {
        res.status(400).json({ error: 'Failed to complete challenge' });
        return;
      }

      res.json({
        success: true,
        data: {
          rewards: result.rewards,
          challenge: result.challenge
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to complete challenge', 
        details: error.message 
      });
    }
  }

  /**
   * Get leaderboards
   */
  static async getLeaderboards(req: Request, res: Response): Promise<void> {
    try {
      const { type, category, scope, featured } = req.query;
      let query: any = { 
        'metadata.isActive': true,
        'privacy.isPublic': true
      };

      if (type) query.type = type;
      if (category) query.category = category;
      if (scope) query.scope = scope;
      if (featured === 'true') query['metadata.isFeatured'] = true;

      const leaderboards = await Leaderboard.find(query)
        .sort({ 'analytics.engagement.viewCount': -1 })
        .populate('metadata.createdBy', 'username firstName lastName');

      res.json({
        success: true,
        data: leaderboards
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to get leaderboards', 
        details: error.message 
      });
    }
  }

  /**
   * Get specific leaderboard with entries
   */
  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const leaderboardId = req.params.leaderboardId;
      const { limit = 50, offset = 0 } = req.query;

      if (!leaderboardId) {
        res.status(400).json({ error: 'Leaderboard ID is required' });
        return;
      }

      const leaderboard = await Leaderboard.findById(leaderboardId)
        .populate('metadata.createdBy', 'username firstName lastName')
        .populate('entries.participantId', 'username firstName lastName avatar');

      if (!leaderboard) {
        res.status(404).json({ error: 'Leaderboard not found' });
        return;
      }

      // Increment view count
      await leaderboard.incrementViews();

      // Paginate entries
      const startIndex = Number(offset);
      const endIndex = startIndex + Number(limit);
      const paginatedEntries = leaderboard.entries.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          ...leaderboard.toObject(),
          entries: paginatedEntries,
          pagination: {
            total: leaderboard.entries.length,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: endIndex < leaderboard.entries.length
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to get leaderboard', 
        details: error.message 
      });
    }
  }

  /**
   * Get user's leaderboard positions
   */
  static async getUserLeaderboardPositions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?.id;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const positions = await GamificationService.getUserLeaderboardPositions(new ObjectId(userId));

      res.json({
        success: true,
        data: positions
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to get leaderboard positions', 
        details: error.message 
      });
    }
  }

  /**
   * Spend points
   */
  static async spendPoints(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.user?.id;
      const { amount, description, metadata = {} } = req.body;

      if (!userId || amount === undefined || !description) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const result = await GamificationService.spendPoints(
        new ObjectId(userId),
        Number(amount),
        description,
        metadata
      );

      if (!result.success) {
        res.status(400).json({ 
          error: 'Insufficient points',
          availableBalance: result.newBalance
        });
        return;
      }

      res.json({
        success: true,
        data: {
          newBalance: result.newBalance,
          spent: Number(amount),
          profile: result.profile
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to spend points', 
        details: error.message 
      });
    }
  }

  /**
   * Search badges
   */
  static async searchBadges(req: Request, res: Response): Promise<void> {
    try {
      const { q: searchTerm = '', category, difficulty, rarity, type } = req.query;

      if (!searchTerm) {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }

      const badges = await Badge.searchBadges(searchTerm as string, {
        category,
        difficulty,
        rarity,
        type
      });

      res.json({
        success: true,
        data: badges
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to search badges', 
        details: error.message 
      });
    }
  }

  /**
   * Search achievements
   */
  static async searchAchievements(req: Request, res: Response): Promise<void> {
    try {
      const { q: searchTerm = '', category, difficulty, type, rarity } = req.query;

      if (!searchTerm) {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }

      const achievements = await GameAchievement.searchAchievements(searchTerm as string, {
        category,
        difficulty,
        type,
        rarity
      });

      res.json({
        success: true,
        data: achievements
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to search achievements', 
        details: error.message 
      });
    }
  }

  /**
   * Search challenges
   */
  static async searchChallenges(req: Request, res: Response): Promise<void> {
    try {
      const { q: searchTerm = '', category, difficulty, type, format } = req.query;

      if (!searchTerm) {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }

      const challenges = await Challenge.searchChallenges(searchTerm as string, {
        category,
        difficulty,
        type,
        format
      });

      res.json({
        success: true,
        data: challenges
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to search challenges', 
        details: error.message 
      });
    }
  }

  /**
   * Get gamification analytics
   */
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { type = 'overview', period = '30d' } = req.query;

      let analytics: any = {};

      switch (type) {
        case 'badges':
          analytics = await Badge.getBadgeStatistics();
          break;
        case 'challenges':
          // Get challenge analytics
          analytics = await Challenge.aggregate([
            { $match: { 'metadata.isActive': true } },
            {
              $group: {
                _id: null,
                totalChallenges: { $sum: 1 },
                totalParticipants: { $sum: '$tracking.totalParticipants' },
                averageCompletion: { $avg: '$tracking.completedParticipants' }
              }
            }
          ]);
          break;
        case 'leaderboards':
          // Get leaderboard analytics
          analytics = await Leaderboard.aggregate([
            { $match: { 'metadata.isActive': true } },
            {
              $group: {
                _id: null,
                totalLeaderboards: { $sum: 1 },
                totalViews: { $sum: '$analytics.engagement.viewCount' },
                averageParticipants: { $avg: '$analytics.participation.totalParticipants' }
              }
            }
          ]);
          break;
        default:
          // Overview analytics
          const [badgeStats, challengeStats, leaderboardStats] = await Promise.all([
            Badge.getBadgeStatistics(),
            Challenge.aggregate([
              { $match: { 'metadata.isActive': true } },
              {
                $group: {
                  _id: null,
                  totalChallenges: { $sum: 1 },
                  totalParticipants: { $sum: '$tracking.totalParticipants' }
                }
              }
            ]),
            Leaderboard.aggregate([
              { $match: { 'metadata.isActive': true } },
              {
                $group: {
                  _id: null,
                  totalLeaderboards: { $sum: 1 },
                  totalViews: { $sum: '$analytics.engagement.viewCount' }
                }
              }
            ])
          ]);

          analytics = {
            badges: badgeStats[0] || {},
            challenges: challengeStats[0] || {},
            leaderboards: leaderboardStats[0] || {}
          };
      }

      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to get analytics', 
        details: error.message 
      });
    }
  }

  /**
   * Add comment to leaderboard
   */
  static async addLeaderboardComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.user?.id;
      const leaderboardId = req.params.leaderboardId;
      const { message, targetRank } = req.body;

      if (!userId || !leaderboardId || !message) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const leaderboard = await Leaderboard.findById(leaderboardId);
      if (!leaderboard) {
        res.status(404).json({ error: 'Leaderboard not found' });
        return;
      }

      await leaderboard.addComment(new ObjectId(userId), message, targetRank);

      res.json({
        success: true,
        message: 'Comment added successfully'
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to add comment', 
        details: error.message 
      });
    }
  }

  /**
   * Follow/unfollow leaderboard
   */
  static async toggleLeaderboardFollow(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId || req.user?.id;
      const leaderboardId = req.params.leaderboardId;
      const { action } = req.body; // 'follow' or 'unfollow'

      if (!userId || !leaderboardId || !action) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const leaderboard = await Leaderboard.findById(leaderboardId);
      if (!leaderboard) {
        res.status(404).json({ error: 'Leaderboard not found' });
        return;
      }

      if (action === 'follow') {
        await leaderboard.follow(new ObjectId(userId));
      } else {
        await leaderboard.unfollow(new ObjectId(userId));
      }

      res.json({
        success: true,
        message: `Successfully ${action}ed leaderboard`
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: `Failed to ${req.body.action} leaderboard`, 
        details: error.message 
      });
    }
  }
}

export default GamificationController;