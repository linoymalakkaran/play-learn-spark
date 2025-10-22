import request from 'supertest';
import { ObjectId } from 'mongoose';
import app from '../../server';
import { GameProfile } from '../../models/GameProfile';
import { Badge } from '../../models/Badge';
import { GameAchievement } from '../../models/GameAchievement';
import { Challenge } from '../../models/Challenge';
import { Leaderboard } from '../../models/Leaderboard';
import GamificationService from '../../services/gamificationService';

describe('Gamification API', () => {
  let authToken: string;
  let testUserId: ObjectId;
  let testBadgeId: ObjectId;
  let testAchievementId: ObjectId;
  let testChallengeId: ObjectId;
  let testLeaderboardId: ObjectId;

  beforeAll(async () => {
    // Set up test data
    testUserId = new ObjectId();
    
    // Create test badge
    const testBadge = new Badge({
      name: 'Test Badge',
      description: 'A test badge',
      category: 'test',
      criteria: {
        type: 'points',
        threshold: 100,
        operator: 'gte'
      },
      rewards: {
        points: 50,
        experience: 25
      },
      rarity: 'common',
      difficulty: 'beginner'
    });
    await testBadge.save();
    testBadgeId = testBadge._id;

    // Create test achievement
    const testAchievement = new GameAchievement({
      name: 'Test Achievement',
      description: 'A test achievement',
      category: 'test',
      type: 'milestone',
      requirements: [{
        type: 'points',
        threshold: 500,
        operator: 'gte'
      }],
      rewards: {
        points: 100,
        experience: 50
      },
      difficulty: 'beginner'
    });
    await testAchievement.save();
    testAchievementId = testAchievement._id;

    // Create test challenge
    const testChallenge = new Challenge({
      name: 'Test Challenge',
      description: 'A test challenge',
      category: 'test',
      type: 'individual',
      format: 'quiz',
      difficulty: 'beginner',
      schedule: {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      scoring: {
        maxScore: 100,
        passingScore: 70
      },
      rewards: {
        points: 200,
        experience: 100
      }
    });
    await testChallenge.save();
    testChallengeId = testChallenge._id;

    // Create test leaderboard
    const testLeaderboard = new Leaderboard({
      name: 'Test Leaderboard',
      description: 'A test leaderboard',
      type: 'points',
      category: 'test',
      scope: 'global',
      configuration: {
        updateFrequency: 'hourly',
        maxEntries: 100
      }
    });
    await testLeaderboard.save();
    testLeaderboardId = testLeaderboard._id;

    // Mock authentication token
    authToken = 'test-token';
  });

  afterAll(async () => {
    // Clean up test data
    await GameProfile.deleteMany({});
    await Badge.deleteMany({ category: 'test' });
    await GameAchievement.deleteMany({ category: 'test' });
    await Challenge.deleteMany({ category: 'test' });
    await Leaderboard.deleteMany({ category: 'test' });
  });

  describe('Profile Management', () => {
    test('GET /api/gamification/profile/:userId - should get user profile', async () => {
      // First create a profile
      await GamificationService.getUserProfile(testUserId);

      const response = await request(app)
        .get(`/api/gamification/profile/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('profile');
      expect(response.body.data.profile.userId).toBe(testUserId.toString());
    });

    test('GET /api/gamification/profile/:userId - should return 404 for non-existent user', async () => {
      const nonExistentUserId = new ObjectId();
      
      const response = await request(app)
        .get(`/api/gamification/profile/${nonExistentUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('Points Management', () => {
    test('POST /api/gamification/points/award - should award points successfully', async () => {
      const pointsData = {
        userId: testUserId,
        source: 'assignment',
        amount: 100,
        description: 'Completed assignment successfully',
        metadata: { assignmentId: new ObjectId() }
      };

      const response = await request(app)
        .post('/api/gamification/points/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pointsData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.newTotal).toBeGreaterThan(0);
      expect(response.body.data.profile).toHaveProperty('points');
    });

    test('POST /api/gamification/points/award - should validate required fields', async () => {
      const invalidData = {
        userId: testUserId,
        source: 'assignment'
        // missing amount and description
      };

      const response = await request(app)
        .post('/api/gamification/points/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('Missing required fields');
    });

    test('POST /api/gamification/points/spend - should spend points successfully', async () => {
      // First award some points
      await GamificationService.awardPoints(testUserId, {
        source: 'manual',
        amount: 200,
        description: 'Test points for spending'
      });

      const spendData = {
        userId: testUserId,
        amount: 50,
        description: 'Purchased virtual item',
        metadata: { itemId: 'virtual-item-123' }
      };

      const response = await request(app)
        .post('/api/gamification/points/spend')
        .set('Authorization', `Bearer ${authToken}`)
        .send(spendData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.spent).toBe(50);
      expect(response.body.data.newBalance).toBeGreaterThanOrEqual(0);
    });

    test('POST /api/gamification/points/spend - should reject insufficient points', async () => {
      const spendData = {
        userId: testUserId,
        amount: 10000, // Very large amount
        description: 'Expensive item'
      };

      const response = await request(app)
        .post('/api/gamification/points/spend')
        .set('Authorization', `Bearer ${authToken}`)
        .send(spendData)
        .expect(400);

      expect(response.body.error).toContain('Insufficient points');
    });
  });

  describe('Experience Management', () => {
    test('POST /api/gamification/experience/award - should award experience successfully', async () => {
      const experienceData = {
        userId: testUserId,
        amount: 75,
        source: 'quiz_completion',
        description: 'Completed advanced quiz'
      };

      const response = await request(app)
        .post('/api/gamification/experience/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send(experienceData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.newExperience).toBeGreaterThan(0);
      expect(response.body.data.profile).toHaveProperty('level');
    });
  });

  describe('Streak Management', () => {
    test('POST /api/gamification/streaks/update - should update streak successfully', async () => {
      const streakData = {
        userId: testUserId,
        streakType: 'daily_login',
        increment: true
      };

      const response = await request(app)
        .post('/api/gamification/streaks/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streakData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.streaks).toBeInstanceOf(Array);
      expect(response.body.data.updatedStreak).toHaveProperty('type', 'daily_login');
    });
  });

  describe('Badge Management', () => {
    test('GET /api/gamification/badges - should get available badges', async () => {
      const response = await request(app)
        .get('/api/gamification/badges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('GET /api/gamification/badges with filters - should filter badges correctly', async () => {
      const response = await request(app)
        .get('/api/gamification/badges?category=test&difficulty=beginner')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((badge: any) => {
        expect(badge.category).toBe('test');
        expect(badge.difficulty).toBe('beginner');
      });
    });

    test('GET /api/gamification/badges/:badgeId/progress/:userId - should get badge progress', async () => {
      const response = await request(app)
        .get(`/api/gamification/badges/${testBadgeId}/progress/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('badge');
      expect(response.body.data).toHaveProperty('progress');
      expect(response.body.data).toHaveProperty('eligible');
    });

    test('GET /api/gamification/badges/search - should search badges', async () => {
      const response = await request(app)
        .get('/api/gamification/badges/search?q=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Achievement Management', () => {
    test('GET /api/gamification/achievements - should get available achievements', async () => {
      const response = await request(app)
        .get('/api/gamification/achievements')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('GET /api/gamification/achievements/:achievementId/progress/:userId - should get achievement progress', async () => {
      const response = await request(app)
        .get(`/api/gamification/achievements/${testAchievementId}/progress/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('achievement');
      expect(response.body.data).toHaveProperty('progress');
    });
  });

  describe('Challenge Management', () => {
    test('GET /api/gamification/challenges - should get available challenges', async () => {
      const response = await request(app)
        .get('/api/gamification/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('POST /api/gamification/challenges/join - should join challenge successfully', async () => {
      const joinData = {
        userId: testUserId,
        challengeId: testChallengeId
      };

      const response = await request(app)
        .post('/api/gamification/challenges/join')
        .set('Authorization', `Bearer ${authToken}`)
        .send(joinData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('joined');
    });

    test('POST /api/gamification/challenges/complete - should complete challenge successfully', async () => {
      const completeData = {
        userId: testUserId,
        challengeId: testChallengeId,
        score: 85,
        completionTime: 1200, // 20 minutes in seconds
        metadata: { answers: ['a', 'b', 'c'] }
      };

      const response = await request(app)
        .post('/api/gamification/challenges/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send(completeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('rewards');
    });
  });

  describe('Leaderboard Management', () => {
    test('GET /api/gamification/leaderboards - should get available leaderboards', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('GET /api/gamification/leaderboards/:leaderboardId - should get specific leaderboard', async () => {
      const response = await request(app)
        .get(`/api/gamification/leaderboards/${testLeaderboardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('entries');
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('GET /api/gamification/leaderboards/positions/:userId - should get user leaderboard positions', async () => {
      const response = await request(app)
        .get(`/api/gamification/leaderboards/positions/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('POST /api/gamification/leaderboards/:leaderboardId/comments - should add comment to leaderboard', async () => {
      const commentData = {
        userId: testUserId,
        message: 'Great competition!',
        targetRank: 5
      };

      const response = await request(app)
        .post(`/api/gamification/leaderboards/${testLeaderboardId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Comment added');
    });

    test('POST /api/gamification/leaderboards/:leaderboardId/follow - should follow/unfollow leaderboard', async () => {
      const followData = {
        userId: testUserId,
        action: 'follow'
      };

      const response = await request(app)
        .post(`/api/gamification/leaderboards/${testLeaderboardId}/follow`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(followData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('follow');
    });
  });

  describe('Analytics', () => {
    test('GET /api/gamification/analytics - should get overview analytics', async () => {
      const response = await request(app)
        .get('/api/gamification/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('badges');
      expect(response.body.data).toHaveProperty('challenges');
      expect(response.body.data).toHaveProperty('leaderboards');
    });

    test('GET /api/gamification/analytics?type=badges - should get badge-specific analytics', async () => {
      const response = await request(app)
        .get('/api/gamification/analytics?type=badges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Search Functionality', () => {
    test('GET /api/gamification/badges/search - should require search term', async () => {
      const response = await request(app)
        .get('/api/gamification/badges/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toContain('Search term is required');
    });

    test('GET /api/gamification/achievements/search - should search achievements', async () => {
      const response = await request(app)
        .get('/api/gamification/achievements/search?q=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('GET /api/gamification/challenges/search - should search challenges', async () => {
      const response = await request(app)
        .get('/api/gamification/challenges/search?q=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Validation', () => {
    test('Should validate ObjectId parameters', async () => {
      const response = await request(app)
        .get('/api/gamification/profile/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('Should validate required fields in points award', async () => {
      const invalidData = {
        userId: testUserId
        // missing required fields
      };

      const response = await request(app)
        .post('/api/gamification/points/award')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('Should validate streak type', async () => {
      const invalidData = {
        userId: testUserId,
        streakType: 'invalid_type'
      };

      const response = await request(app)
        .post('/api/gamification/streaks/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('Should handle server errors gracefully', async () => {
      // Mock a service method to throw an error
      jest.spyOn(GamificationService, 'getUserStatistics').mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get(`/api/gamification/profile/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error).toContain('Failed to get user profile');
      expect(response.body.details).toContain('Database error');

      // Restore original implementation
      jest.restoreAllMocks();
    });

    test('Should handle missing authentication', async () => {
      const response = await request(app)
        .get('/api/gamification/profile/123')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });
});

// Integration tests for gamification service
describe('Gamification Service Integration', () => {
  let testUserId: ObjectId;

  beforeEach(() => {
    testUserId = new ObjectId();
  });

  test('Should award points and check for level up', async () => {
    const transaction = {
      source: 'assignment' as const,
      amount: 1000,
      description: 'Completed major assignment'
    };

    const result = await GamificationService.awardPoints(testUserId, transaction);
    
    expect(result.profile.points.total).toBe(1000);
    expect(result.profile.level.experience).toBeGreaterThan(0);
  });

  test('Should handle badge eligibility and awarding', async () => {
    // Create a simple badge
    const badge = new Badge({
      name: 'Test Badge',
      description: 'Test badge',
      category: 'test',
      criteria: {
        type: 'points',
        threshold: 50,
        operator: 'gte'
      },
      rewards: {
        points: 25,
        experience: 10
      },
      rarity: 'common',
      difficulty: 'beginner'
    });
    await badge.save();

    // Award points to make user eligible
    await GamificationService.awardPoints(testUserId, {
      source: 'manual',
      amount: 100,
      description: 'Test points'
    });

    // Check eligibility
    const profile = await GamificationService.getUserProfile(testUserId);
    const eligibility = badge.checkEligibility(profile);
    
    expect(eligibility.eligible).toBe(true);

    // Clean up
    await Badge.findByIdAndDelete(badge._id);
  });

  test('Should update leaderboard positions correctly', async () => {
    // Create test leaderboard
    const leaderboard = new Leaderboard({
      name: 'Test Points Leaderboard',
      description: 'Test leaderboard',
      type: 'points',
      category: 'test',
      scope: 'global',
      configuration: {
        updateFrequency: 'hourly',
        maxEntries: 100
      }
    });
    await leaderboard.save();

    // Award points to user
    await GamificationService.awardPoints(testUserId, {
      source: 'manual',
      amount: 500,
      description: 'Test points for leaderboard'
    });

    // Update leaderboard positions
    await GamificationService.updateLeaderboardPosition(testUserId, leaderboard._id, 500);

    // Check leaderboard entry
    const updatedLeaderboard = await Leaderboard.findById(leaderboard._id);
    const userEntry = updatedLeaderboard?.entries.find(e => e.participantId.toString() === testUserId.toString());
    
    expect(userEntry).toBeDefined();
    expect(userEntry?.score).toBe(500);

    // Clean up
    await Leaderboard.findByIdAndDelete(leaderboard._id);
  });
});