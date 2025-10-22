import { Types } from 'mongoose';
import { ActivityMongo } from '../models/ActivityMongo';
import { ActivityTemplate } from '../models/ActivityTemplate';
import { ActivityVersion } from '../models/ActivityVersion';
import { logger } from '../utils/logger';

export interface ActivityCreationData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  ageRange: { min: number; max: number };
  language: string;
  contentType: string;
  duration: { estimated: number; minimum: number; maximum: number };
  objectives: any[];
  contentData: any;
  createdBy: string;
  tags?: string[];
  multimedia?: any;
  materials?: string[];
  assessment?: any;
  adaptations?: any;
  aiGenerated?: any;
  metadata?: any;
}

export interface ActivityUpdateData extends Partial<ActivityCreationData> {
  id?: string;
}

export interface ActivityAnalytics {
  totalViews: number;
  totalCompletions: number;
  averageRating: number;
  completionRate: number;
  averageTimeSpent: number;
  difficultyFeedback: {
    tooEasy: number;
    justRight: number;
    tooHard: number;
  };
  popularTags: { tag: string; count: number }[];
  usageByAge: { age: number; count: number }[];
  dailyStats: { date: string; views: number; completions: number }[];
}

export class EnhancedActivityService {
  async createActivity(data: ActivityCreationData): Promise<any> {
    try {
      logger.info('Creating enhanced activity', { title: data.title, createdBy: data.createdBy });

      // Validate required fields
      this.validateActivityData(data);

      // Set default values
      const activityData = {
        ...data,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        analytics: {
          views: 0,
          completions: 0,
          ratings: [],
          timeSpent: [],
          difficulty: {
            tooEasy: 0,
            justRight: 0,
            tooHard: 0
          }
        },
        sharing: {
          isPublic: false,
          allowComments: true,
          allowRating: true,
          sharedWith: []
        }
      };

      // Calculate AI difficulty if not provided
      if (data.aiGenerated?.isAiGenerated && !data.difficulty) {
        activityData.difficulty = this.calculateAIDifficulty(data);
      }

      // Generate tags from content if not provided
      if (!data.tags || data.tags.length === 0) {
        activityData.tags = this.generateTags(data);
      }

      const activity = new ActivityMongo(activityData);
      const savedActivity = await activity.save();

      logger.info('Activity created successfully', { activityId: savedActivity._id });
      return savedActivity;

    } catch (error: any) {
      logger.error('Failed to create activity', { error: error.message, data });
      throw error;
    }
  }

  async updateActivity(id: string, data: ActivityUpdateData, userId: string): Promise<any> {
    try {
      const activity = await ActivityMongo.findById(id);
      if (!activity) {
        throw new Error('Activity not found');
      }

      // Check permissions (basic implementation)
      if (activity.createdBy.toString() !== userId) {
        throw new Error('Permission denied');
      }

      // Update fields
      Object.assign(activity, data);
      activity.updatedAt = new Date();

      const updatedActivity = await activity.save();
      logger.info('Activity updated successfully', { activityId: id });
      
      return updatedActivity;
    } catch (error: any) {
      logger.error('Failed to update activity', { error: error.message, activityId: id });
      throw error;
    }
  }

  async deleteActivity(id: string, userId: string, permanent: boolean = false): Promise<void> {
    try {
      const activity = await ActivityMongo.findById(id);
      if (!activity) {
        throw new Error('Activity not found');
      }

      // Check permissions
      if (activity.createdBy.toString() !== userId) {
        throw new Error('Permission denied');
      }

      if (permanent) {
        await ActivityMongo.findByIdAndDelete(id);
        await ActivityVersion.deleteMany({ activityId: id });
        logger.info('Activity permanently deleted', { activityId: id });
      } else {
        activity.status = 'archived';
        activity.updatedAt = new Date();
        await activity.save();
        logger.info('Activity archived', { activityId: id });
      }

    } catch (error: any) {
      logger.error('Failed to delete activity', { error: error.message, activityId: id });
      throw error;
    }
  }

  async duplicateActivity(id: string, newTitle: string, userId: string): Promise<any> {
    try {
      const originalActivity = await ActivityMongo.findById(id);
      if (!originalActivity) {
        throw new Error('Activity not found');
      }

      // Create duplicate data
      const duplicateData = originalActivity.toObject();
      delete duplicateData._id;
      delete duplicateData.__v;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      delete duplicateData.analytics;
      delete duplicateData.versions;

      // Update with new details
      duplicateData.title = newTitle || `${duplicateData.title} (Copy)`;
      duplicateData.createdBy = userId;
      duplicateData.status = 'draft';
      duplicateData.version = '1.0.0';

      // Create the duplicate
      const duplicateActivity = await this.createActivity(duplicateData);
      
      logger.info('Activity duplicated successfully', { 
        originalId: id, 
        duplicateId: duplicateActivity._id 
      });
      
      return duplicateActivity;
    } catch (error: any) {
      logger.error('Failed to duplicate activity', { error: error.message, activityId: id });
      throw error;
    }
  }

  async shareActivity(id: string, userIds: string[], permission: string, message?: string): Promise<void> {
    try {
      const activity = await ActivityMongo.findById(id);
      if (!activity) {
        throw new Error('Activity not found');
      }

      // Add users to shared list
      for (const userId of userIds) {
        const existingShare = activity.sharing.sharedWith.find(
          (share: any) => share.user.toString() === userId
        );

        if (!existingShare) {
          activity.sharing.sharedWith.push({
            user: new Types.ObjectId(userId),
            permission,
            sharedAt: new Date(),
            message
          });
        } else {
          existingShare.permission = permission;
          existingShare.sharedAt = new Date();
          if (message) existingShare.message = message;
        }
      }

      await activity.save();
      logger.info('Activity shared successfully', { activityId: id, userIds });

    } catch (error: any) {
      logger.error('Failed to share activity', { error: error.message, activityId: id });
      throw error;
    }
  }

  async getActivityAnalytics(id: string, dateRange: string = '30d'): Promise<ActivityAnalytics> {
    try {
      const activity = await ActivityMongo.findById(id);
      if (!activity) {
        throw new Error('Activity not found');
      }

      // Basic analytics implementation
      // In a real system, this would aggregate from a separate analytics collection
      const analytics: ActivityAnalytics = {
        totalViews: activity.analytics?.views || 0,
        totalCompletions: activity.analytics?.completions || 0,
        averageRating: this.calculateAverageRating(activity.analytics?.ratings || []),
        completionRate: this.calculateCompletionRate(
          activity.analytics?.views || 0,
          activity.analytics?.completions || 0
        ),
        averageTimeSpent: this.calculateAverageTimeSpent(activity.analytics?.timeSpent || []),
        difficultyFeedback: {
          tooEasy: activity.analytics?.difficulty?.tooEasy || 0,
          justRight: activity.analytics?.difficulty?.justRight || 0,
          tooHard: activity.analytics?.difficulty?.tooHard || 0
        },
        popularTags: this.getPopularTags(activity.tags || []),
        usageByAge: this.getUsageByAge(activity.ageRange),
        dailyStats: this.generateDailyStats(dateRange)
      };

      return analytics;
    } catch (error: any) {
      logger.error('Failed to get activity analytics', { error: error.message, activityId: id });
      throw error;
    }
  }

  async createFromTemplate(templateId: string, variables: any, userId: string): Promise<any> {
    try {
      const template = await ActivityTemplate.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const generatedActivity = await template.generateActivity(variables);
      
      const activityData = {
        ...generatedActivity,
        createdBy: userId,
        metadata: {
          ...generatedActivity.metadata,
          templateId,
          templateVariables: variables,
          createdFromTemplate: true
        }
      };

      return await this.createActivity(activityData);
    } catch (error: any) {
      logger.error('Failed to create activity from template', { 
        error: error.message, 
        templateId 
      });
      throw error;
    }
  }

  // Validation methods
  private validateActivityData(data: ActivityCreationData): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Description is required');
    }

    if (!data.category) {
      throw new Error('Category is required');
    }

    if (!data.createdBy) {
      throw new Error('Creator ID is required');
    }

    if (!data.ageRange || !data.ageRange.min || !data.ageRange.max) {
      throw new Error('Age range is required');
    }

    if (data.ageRange.min > data.ageRange.max) {
      throw new Error('Invalid age range: minimum age cannot be greater than maximum age');
    }
  }

  private calculateAIDifficulty(data: ActivityCreationData): string {
    // Simple AI difficulty calculation based on content complexity
    const content = JSON.stringify(data.contentData).toLowerCase();
    let complexity = 0;

    // Check for complex vocabulary
    const complexWords = ['analyze', 'evaluate', 'synthesize', 'compare', 'contrast'];
    complexWords.forEach(word => {
      if (content.includes(word)) complexity += 2;
    });

    // Check for length
    if (content.length > 1000) complexity += 1;
    if (content.length > 2000) complexity += 2;

    // Check age range
    const ageSpan = data.ageRange.max - data.ageRange.min;
    if (ageSpan > 5) complexity += 1;

    if (complexity <= 2) return 'easy';
    if (complexity <= 5) return 'medium';
    return 'hard';
  }

  private generateTags(data: ActivityCreationData): string[] {
    const tags = [data.category, data.difficulty, data.contentType];
    
    // Add age-based tags
    if (data.ageRange.min <= 6) tags.push('early-childhood');
    if (data.ageRange.max >= 12) tags.push('middle-school');
    
    // Add content-based tags
    const content = JSON.stringify(data.contentData).toLowerCase();
    if (content.includes('read')) tags.push('reading');
    if (content.includes('math') || content.includes('number')) tags.push('mathematics');
    if (content.includes('write')) tags.push('writing');
    if (content.includes('science')) tags.push('science');
    
    return [...new Set(tags)]; // Remove duplicates
  }

  // Analytics calculation methods
  private calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  private calculateCompletionRate(views: number, completions: number): number {
    if (views === 0) return 0;
    return (completions / views) * 100;
  }

  private calculateAverageTimeSpent(timeSpent: number[]): number {
    if (timeSpent.length === 0) return 0;
    return timeSpent.reduce((sum, time) => sum + time, 0) / timeSpent.length;
  }

  private getPopularTags(tags: string[]): { tag: string; count: number }[] {
    const tagCounts: { [key: string]: number } = {};
    tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getUsageByAge(ageRange: { min: number; max: number }): { age: number; count: number }[] {
    // Mock data - in real implementation, this would come from user activity logs
    const usage = [];
    for (let age = ageRange.min; age <= ageRange.max; age++) {
      usage.push({ age, count: Math.floor(Math.random() * 50) + 1 });
    }
    return usage;
  }

  private generateDailyStats(dateRange: string): { date: string; views: number; completions: number }[] {
    // Mock data - in real implementation, this would come from analytics database
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const stats = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      stats.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 100),
        completions: Math.floor(Math.random() * 50)
      });
    }
    
    return stats;
  }
}

export const enhancedActivityService = new EnhancedActivityService();