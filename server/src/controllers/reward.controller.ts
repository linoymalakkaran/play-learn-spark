import { Request, Response } from 'express';
import { RewardCard, RewardItem, RewardRedemption, Achievement, User, Progress } from '../models';
import { Op } from 'sequelize';

export class RewardController {
  // Initialize reward card for a user
  public static async initializeRewardCard(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check if reward card already exists
      let rewardCard = await RewardCard.findOne({ where: { userId } });
      
      if (!rewardCard) {
        // Create new reward card
        rewardCard = await RewardCard.create({
          userId: parseInt(userId),
          totalPoints: 0,
          availablePoints: 0,
          currentLevel: 'bronze',
          achievements: '[]',
          streakCount: 0,
          lastActivityDate: new Date(),
        });
      }

      res.json(rewardCard);
    } catch (error) {
      console.error('Error initializing reward card:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get reward card for a user
  public static async getRewardCard(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      const rewardCard = await RewardCard.findOne({ where: { userId } });
      
      if (!rewardCard) {
        res.status(404).json({ error: 'Reward card not found' });
        return;
      }

      res.json(rewardCard);
    } catch (error) {
      console.error('Error getting reward card:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Award points for activity completion
  public static async awardActivityCompletion(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { activityId, score, isFirstTime = false, isNewCategory = false } = req.body;

      if (!activityId || typeof score !== 'number') {
        res.status(400).json({ error: 'Activity ID and score are required' });
        return;
      }

      // Initialize reward card if it doesn't exist
      let rewardCard = await RewardCard.findOne({ where: { userId } });
      if (!rewardCard) {
        rewardCard = await RewardCard.create({
          userId: parseInt(userId),
          totalPoints: 0,
          availablePoints: 0,
          currentLevel: 'bronze',
          achievements: '[]',
          streakCount: 0,
          lastActivityDate: new Date(),
        });
      }

      // Calculate points earned
      let pointsEarned = 10; // Base points
      
      if (score === 100) {
        pointsEarned += 5; // Perfect score bonus
      }
      
      if (isFirstTime) {
        pointsEarned += 3; // First time completion bonus
      }
      
      if (isNewCategory) {
        pointsEarned += 5; // New category exploration bonus
      }

      // Update streak
      const today = new Date();
      const lastActivityDate = rewardCard.lastActivityDate ? new Date(rewardCard.lastActivityDate) : null;
      
      if (lastActivityDate) {
        const daysSinceLastActivity = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastActivity === 1) {
          // Consecutive day - increase streak
          rewardCard.streakCount += 1;
          
          // Streak bonus points
          if (rewardCard.streakCount >= 7) {
            pointsEarned += 10; // Weekly streak bonus
          } else if (rewardCard.streakCount >= 3) {
            pointsEarned += 5; // 3-day streak bonus
          }
        } else if (daysSinceLastActivity > 1) {
          // Streak broken
          rewardCard.streakCount = 1;
        }
        // Same day = maintain streak
      } else {
        // First activity ever
        rewardCard.streakCount = 1;
      }

      // Update points and level
      rewardCard.totalPoints += pointsEarned;
      rewardCard.availablePoints += pointsEarned;
      rewardCard.lastActivityDate = today;
      rewardCard.updateLevel();

      await rewardCard.save();

      // Check for new achievements
      await RewardController.checkAchievements(parseInt(userId));

      res.json({
        pointsEarned,
        totalPoints: rewardCard.totalPoints,
        availablePoints: rewardCard.availablePoints,
        currentLevel: rewardCard.currentLevel,
        streakCount: rewardCard.streakCount,
      });
    } catch (error) {
      console.error('Error awarding activity completion:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Check and award achievements
  public static async checkAchievements(userId: number): Promise<void> {
    try {
      const rewardCard = await RewardCard.findOne({ where: { userId } });
      if (!rewardCard) return;

      const achievements = await Achievement.findAll({ where: { isActive: true } });
      const currentAchievements = rewardCard.getAchievements();

      for (const achievement of achievements) {
        if (currentAchievements.includes(achievement.id.toString())) {
          continue; // Already earned
        }

        const criteria = achievement.getCriteria();
        let earned = false;

        switch (criteria.type) {
          case 'streak':
            earned = rewardCard.streakCount >= criteria.value;
            break;
          
          case 'points_earned':
            earned = rewardCard.totalPoints >= criteria.value;
            break;
          
          case 'activity_count':
            const activityCount = await Progress.count({
              where: { userId },
              distinct: true,
              col: 'activityId'
            });
            earned = activityCount >= criteria.value;
            break;
          
          case 'perfect_score':
            const perfectScores = await Progress.count({
              where: { 
                userId,
                bestScore: 100
              }
            });
            earned = perfectScores >= criteria.value;
            break;
          
          case 'category_complete':
            if (criteria.category) {
              // This would require more complex logic to check category completion
              // For now, we'll skip this type
            }
            break;
        }

        if (earned) {
          rewardCard.addAchievement(achievement.id.toString());
          rewardCard.totalPoints += achievement.pointsReward;
          rewardCard.availablePoints += achievement.pointsReward;
          rewardCard.updateLevel();
        }
      }

      await rewardCard.save();
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  // Get available rewards for a user
  public static async getAvailableRewards(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { age } = req.query;

      // Get user's reward card
      const rewardCard = await RewardCard.findOne({ where: { userId } });
      if (!rewardCard) {
        res.status(404).json({ error: 'Reward card not found' });
        return;
      }

      // Get all active rewards
      let whereClause: any = { isActive: true };
      
      // Filter by age if provided
      if (age) {
        const userAge = parseInt(age as string);
        const rewards = await RewardItem.findAll({ where: whereClause });
        const ageAppropriateRewards = rewards.filter(reward => 
          reward.isAppropriateForAge(userAge)
        );
        res.json({
          availablePoints: rewardCard.availablePoints,
          rewards: ageAppropriateRewards,
        });
        return;
      }

      const rewards = await RewardItem.findAll({ where: whereClause });
      res.json({
        availablePoints: rewardCard.availablePoints,
        rewards,
      });
    } catch (error) {
      console.error('Error getting available rewards:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Request a reward redemption
  public static async requestReward(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { rewardItemId, childMessage } = req.body;

      if (!rewardItemId) {
        res.status(400).json({ error: 'Reward item ID is required' });
        return;
      }

      // Get reward item
      const rewardItem = await RewardItem.findByPk(rewardItemId);
      if (!rewardItem) {
        res.status(404).json({ error: 'Reward item not found' });
        return;
      }

      // Get user's reward card
      const rewardCard = await RewardCard.findOne({ where: { userId } });
      if (!rewardCard) {
        res.status(404).json({ error: 'Reward card not found' });
        return;
      }

      // Check if user has enough points
      if (rewardCard.availablePoints < rewardItem.pointsCost) {
        res.status(400).json({ error: 'Insufficient points' });
        return;
      }

      // Create redemption request
      const redemption = await RewardRedemption.create({
        userId: parseInt(userId),
        rewardItemId: rewardItem.id,
        pointsUsed: rewardItem.pointsCost,
        status: rewardItem.parentApprovalRequired ? 'pending' : 'approved',
        requestedAt: new Date(),
        childMessage: childMessage || null,
      });

      // If auto-approved (no parent approval required), deduct points immediately
      if (!rewardItem.parentApprovalRequired) {
        rewardCard.availablePoints -= rewardItem.pointsCost;
        await rewardCard.save();
        redemption.processedAt = new Date();
        await redemption.save();
      }

      res.json(redemption);
    } catch (error) {
      console.error('Error requesting reward:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get pending reward requests (for parents)
  public static async getPendingRequests(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const pendingRequests = await RewardRedemption.findAll({
        where: {
          userId,
          status: 'pending'
        },
        order: [['requestedAt', 'DESC']]
      });

      // Manually fetch reward items
      const requestsWithItems = await Promise.all(
        pendingRequests.map(async (request) => {
          const rewardItem = await RewardItem.findByPk(request.rewardItemId);
          return {
            ...request.toJSON(),
            rewardItem: rewardItem?.toJSON()
          };
        })
      );

      res.json(requestsWithItems);
    } catch (error) {
      console.error('Error getting pending requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve or deny a reward request (for parents)
  public static async processRewardRequest(req: Request, res: Response): Promise<void> {
    try {
      const { redemptionId } = req.params;
      const { approved, parentResponse, parentNotes } = req.body;

      if (typeof approved !== 'boolean') {
        res.status(400).json({ error: 'Approved status is required' });
        return;
      }

      const redemption = await RewardRedemption.findByPk(redemptionId);
      if (!redemption) {
        res.status(404).json({ error: 'Redemption not found' });
        return;
      }

      if (redemption.status !== 'pending') {
        res.status(400).json({ error: 'Redemption already processed' });
        return;
      }

      if (approved) {
        // Approve and deduct points
        const rewardCard = await RewardCard.findOne({ where: { userId: redemption.userId } });
        if (rewardCard) {
          rewardCard.availablePoints -= redemption.pointsUsed;
          await rewardCard.save();
        }
        redemption.approve(parentResponse, parentNotes);
      } else {
        // Deny the request
        redemption.deny(parentResponse);
      }

      await redemption.save();
      res.json(redemption);
    } catch (error) {
      console.error('Error processing reward request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get redemption history
  public static async getRedemptionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const redemptions = await RewardRedemption.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      // Manually fetch reward items
      const redemptionsWithItems = await Promise.all(
        redemptions.map(async (redemption) => {
          const rewardItem = await RewardItem.findByPk(redemption.rewardItemId);
          return {
            ...redemption.toJSON(),
            rewardItem: rewardItem?.toJSON()
          };
        })
      );

      res.json(redemptionsWithItems);
    } catch (error) {
      console.error('Error getting redemption history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get achievements
  public static async getAchievements(req: Request, res: Response): Promise<void> {
    try {
      const achievements = await Achievement.findAll({
        where: { isActive: true },
        order: [['pointsReward', 'ASC']]
      });

      res.json(achievements);
    } catch (error) {
      console.error('Error getting achievements:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's earned achievements
  public static async getUserAchievements(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const rewardCard = await RewardCard.findOne({ where: { userId } });
      if (!rewardCard) {
        res.status(404).json({ error: 'Reward card not found' });
        return;
      }

      const earnedAchievementIds = rewardCard.getAchievements();
      const achievements = await Achievement.findAll({
        where: {
          id: { [Op.in]: earnedAchievementIds },
          isActive: true
        }
      });

      res.json(achievements);
    } catch (error) {
      console.error('Error getting user achievements:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}