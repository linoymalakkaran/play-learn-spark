/**
 * Advanced Filtering Controller for Play & Learn Spark Backend
 * RESTful API endpoints for sophisticated content filtering and recommendations
 */

import { Request, Response } from 'express';
import AdvancedFilteringService, { 
  ChildProfile, 
  ContentItem, 
  FilterCriteria 
} from '../services/AdvancedFilteringService';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

class AdvancedFilteringController {
  private filteringService: AdvancedFilteringService;

  constructor() {
    this.filteringService = AdvancedFilteringService.getInstance();
  }

  // GET /api/content/recommendations
  // Get personalized content recommendations
  async getRecommendations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        childId,
        ageGroup,
        topics,
        skills,
        difficulty,
        duration,
        contentType,
        language = 'en',
        learningStyle,
        excludeCompleted = true,
        prioritizeStruggling = false,
        limit = 20
      } = req.query;

      if (!childId) {
        res.status(400).json({
          success: false,
          error: 'Child ID is required'
        });
        return;
      }

      // Mock child profile - in production, fetch from database
      const childProfile: ChildProfile = await this.getChildProfile(childId as string);
      
      // Mock available content - in production, fetch from database
      const availableContent: ContentItem[] = await this.getAvailableContent();

      const filterCriteria: FilterCriteria = {
        ageGroup: ageGroup as FilterCriteria['ageGroup'],
        topics: topics ? (topics as string).split(',') : undefined,
        skills: skills ? (skills as string).split(',') : undefined,
        difficulty: difficulty as FilterCriteria['difficulty'],
        duration: duration ? {
          min: parseInt((duration as string).split('-')[0]),
          max: parseInt((duration as string).split('-')[1])
        } : undefined,
        contentType: contentType ? (contentType as string).split(',') as ContentItem['type'][] : undefined,
        language: language as string,
        learningStyle: learningStyle as ChildProfile['learningStyle'],
        excludeCompleted: excludeCompleted === 'true',
        prioritizeStruggling: prioritizeStruggling === 'true'
      };

      const recommendations = await this.filteringService.filterContent(
        availableContent,
        childProfile,
        filterCriteria
      );

      const limitedRecommendations = recommendations.slice(0, parseInt(limit as string));

      res.json({
        success: true,
        data: {
          recommendations: limitedRecommendations,
          childProfile: {
            id: childProfile.id,
            age: childProfile.age,
            grade: childProfile.grade,
            learningStyle: childProfile.learningStyle
          },
          filterCriteria,
          totalFound: recommendations.length
        }
      });

      logger.info(`Generated ${limitedRecommendations.length} recommendations for child ${childId}`);

    } catch (error) {
      logger.error('Failed to get recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate recommendations'
      });
    }
  }

  // POST /api/content/learning-path
  // Generate personalized learning path
  async generateLearningPath(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        childId,
        targetSkills,
        durationWeeks = 8,
        priorityAreas
      } = req.body;

      if (!childId || !targetSkills || !Array.isArray(targetSkills)) {
        res.status(400).json({
          success: false,
          error: 'Child ID and target skills array are required'
        });
        return;
      }

      const childProfile = await this.getChildProfile(childId);
      
      const learningPath = await this.filteringService.generateLearningPath(
        childProfile,
        targetSkills,
        durationWeeks
      );

      res.json({
        success: true,
        data: {
          learningPath,
          estimatedCompletion: new Date(Date.now() + durationWeeks * 7 * 24 * 60 * 60 * 1000),
          childProfile: {
            id: childProfile.id,
            currentSkillLevels: childProfile.skillLevels
          }
        }
      });

      logger.info(`Generated learning path ${learningPath.pathId} for child ${childId}`);

    } catch (error) {
      logger.error('Failed to generate learning path:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate learning path'
      });
    }
  }

  // GET /api/content/age-appropriate
  // Get age-appropriate content
  async getAgeAppropriateContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        age,
        limit = 50
      } = req.query;

      if (!age) {
        res.status(400).json({
          success: false,
          error: 'Age in months is required'
        });
        return;
      }

      const ageInMonths = parseInt(age as string);
      const availableContent = await this.getAvailableContent();
      
      const ageAppropriateContent = await this.filteringService.getAgeAppropriateContent(
        ageInMonths,
        availableContent
      );

      const limitedContent = ageAppropriateContent.slice(0, parseInt(limit as string));

      res.json({
        success: true,
        data: {
          content: limitedContent,
          ageInMonths,
          developmentalStage: this.getDevelopmentalStageName(ageInMonths),
          totalFound: ageAppropriateContent.length
        }
      });

      logger.info(`Found ${limitedContent.length} age-appropriate items for ${ageInMonths} months`);

    } catch (error) {
      logger.error('Failed to get age-appropriate content:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get age-appropriate content'
      });
    }
  }

  // POST /api/content/adjust-difficulty
  // Adjust difficulty based on performance
  async adjustDifficulty(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        childId,
        recentPerformance
      } = req.body;

      if (!childId || !recentPerformance || !Array.isArray(recentPerformance)) {
        res.status(400).json({
          success: false,
          error: 'Child ID and recent performance array are required'
        });
        return;
      }

      const childProfile = await this.getChildProfile(childId);
      
      const difficultyAdjustment = await this.filteringService.adjustDifficultyBasedOnPerformance(
        childProfile,
        recentPerformance
      );

      // Update child profile with new difficulty preference (in production, save to database)
      await this.updateChildDifficultyPreference(childId, difficultyAdjustment.recommendedDifficulty);

      res.json({
        success: true,
        data: {
          adjustment: difficultyAdjustment,
          childId,
          previousDifficulty: childProfile.difficultyPreference,
          performanceAnalysis: {
            totalActivities: recentPerformance.length,
            averageScore: recentPerformance.reduce((sum: number, p: any) => sum + p.score, 0) / recentPerformance.length,
            averageFrustration: recentPerformance.reduce((sum: number, p: any) => sum + p.frustratedMoments, 0) / recentPerformance.length
          }
        }
      });

      logger.info(`Adjusted difficulty for child ${childId}: ${difficultyAdjustment.reasoning}`);

    } catch (error) {
      logger.error('Failed to adjust difficulty:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to adjust difficulty'
      });
    }
  }

  // GET /api/content/discover-interests
  // Discover content based on interests
  async discoverByInterests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        interests,
        diversityFactor = 0.3,
        limit = 30
      } = req.query;

      if (!interests) {
        res.status(400).json({
          success: false,
          error: 'Interests parameter is required'
        });
        return;
      }

      const interestsList = (interests as string).split(',').map(i => i.trim());
      const availableContent = await this.getAvailableContent();
      
      const discoveredContent = await this.filteringService.discoverContentByInterests(
        interestsList,
        availableContent,
        parseFloat(diversityFactor as string)
      );

      const limitedContent = discoveredContent.slice(0, parseInt(limit as string));

      res.json({
        success: true,
        data: {
          content: limitedContent,
          interests: interestsList,
          diversityFactor: parseFloat(diversityFactor as string),
          totalFound: discoveredContent.length,
          categories: this.categorizeContent(limitedContent)
        }
      });

      logger.info(`Discovered ${limitedContent.length} items for interests: ${interestsList.join(', ')}`);

    } catch (error) {
      logger.error('Failed to discover content by interests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to discover content'
      });
    }
  }

  // GET /api/content/child-analytics
  // Get analytics for child's learning progress
  async getChildAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        childId,
        timeframe = '30d'
      } = req.query;

      if (!childId) {
        res.status(400).json({
          success: false,
          error: 'Child ID is required'
        });
        return;
      }

      const childProfile = await this.getChildProfile(childId as string);
      const analytics = await this.generateChildAnalytics(childProfile, timeframe as string);

      res.json({
        success: true,
        data: {
          analytics,
          childId,
          timeframe,
          generatedAt: new Date()
        }
      });

      logger.info(`Generated analytics for child ${childId}`);

    } catch (error) {
      logger.error('Failed to get child analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate analytics'
      });
    }
  }

  // Private helper methods
  private async getChildProfile(childId: string): Promise<ChildProfile> {
    // Mock implementation - in production, fetch from database
    return {
      id: childId,
      age: 54, // 4.5 years
      grade: 'pre-k',
      interests: ['animals', 'colors', 'music'],
      learningStyle: 'visual',
      skillLevels: {
        mathematics: 6,
        reading: 5,
        motor: 7,
        social: 6,
        creativity: 8
      },
      completedActivities: ['animal-safari-1', 'color-rainbow-2'],
      strugglingConcepts: ['counting-beyond-10'],
      preferredLanguages: ['en'],
      attentionSpan: 15,
      difficultyPreference: 'medium'
    };
  }

  private async getAvailableContent(): Promise<ContentItem[]> {
    // Mock implementation - in production, fetch from database
    return [
      {
        id: 'counting-train-basic',
        title: 'Counting Train Adventure',
        type: 'activity',
        ageRange: { min: 48, max: 66 },
        topics: ['numbers', 'transportation'],
        skills: ['counting', 'number recognition'],
        difficulty: 5,
        estimatedDuration: 10,
        language: 'en',
        learningObjectives: ['Count objects 1-10', 'Recognize numerals'],
        interactionType: 'interactive',
        mediaTypes: ['image', 'audio'],
        adaptiveSupport: true
      },
      {
        id: 'animal-safari-advanced',
        title: 'Advanced Animal Safari',
        type: 'game',
        ageRange: { min: 54, max: 72 },
        topics: ['animals', 'habitats'],
        skills: ['categorization', 'vocabulary'],
        difficulty: 7,
        estimatedDuration: 15,
        language: 'en',
        learningObjectives: ['Learn animal classifications', 'Understand habitats'],
        interactionType: 'interactive',
        mediaTypes: ['image', 'video', 'audio'],
        adaptiveSupport: true
      },
      {
        id: 'color-mixing-lab',
        title: 'Color Mixing Laboratory',
        type: 'activity',
        ageRange: { min: 42, max: 60 },
        topics: ['colors', 'science'],
        skills: ['observation', 'experimentation'],
        difficulty: 6,
        estimatedDuration: 12,
        language: 'en',
        learningObjectives: ['Understand primary colors', 'Learn color mixing'],
        interactionType: 'interactive',
        mediaTypes: ['image', 'video'],
        adaptiveSupport: true
      }
    ];
  }

  private getDevelopmentalStageName(ageInMonths: number): string {
    if (ageInMonths < 42) return 'Early Preschool';
    if (ageInMonths < 54) return 'Mid Preschool';
    if (ageInMonths < 66) return 'Late Preschool';
    return 'Kindergarten Ready';
  }

  private async updateChildDifficultyPreference(childId: string, difficulty: number): Promise<void> {
    // Mock implementation - in production, update database
    logger.info(`Updated difficulty preference for child ${childId} to ${difficulty}`);
  }

  private categorizeContent(content: ContentItem[]): Record<string, number> {
    const categories: Record<string, number> = {};
    
    content.forEach(item => {
      item.topics.forEach(topic => {
        categories[topic] = (categories[topic] || 0) + 1;
      });
    });

    return categories;
  }

  private async generateChildAnalytics(profile: ChildProfile, timeframe: string): Promise<any> {
    // Mock analytics - in production, calculate from actual data
    return {
      progressOverview: {
        activitiesCompleted: profile.completedActivities.length,
        skillImprovements: ['mathematics', 'reading'],
        strugglingAreas: profile.strugglingConcepts,
        timeSpent: '2.5 hours',
        engagementScore: 85
      },
      skillProgress: {
        mathematics: { current: profile.skillLevels.mathematics, change: +1 },
        reading: { current: profile.skillLevels.reading, change: +0.5 },
        motor: { current: profile.skillLevels.motor, change: +0.2 },
        social: { current: profile.skillLevels.social, change: +0.3 },
        creativity: { current: profile.skillLevels.creativity, change: +0.8 }
      },
      recommendations: [
        'Focus on counting activities beyond 10',
        'Introduce more reading challenges',
        'Continue with creative activities - showing strong progress'
      ],
      parentInsights: [
        'Child shows strong visual learning preference',
        'Optimal session length is 10-15 minutes',
        'Responds well to animal-themed content'
      ]
    };
  }
}

export default AdvancedFilteringController;