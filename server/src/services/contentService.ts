/**
 * Content Service - Business Logic Layer
 * 
 * Handles all content-related operations including CRUD, versioning,
 * search, analytics, and media management for educational content.
 */

import { Types } from 'mongoose';
import { 
  ContentItem, 
  Lesson, 
  Activity, 
  MediaAsset, 
  ContentCollection,
  IContentItem,
  ILesson,
  IActivity,
  IMediaAsset,
  IContentCollection
} from '../models/ContentModels.js';
import { UserMongo } from '../models/UserMongo.js';

export interface ContentCreateData {
  title: string;
  description: string;
  contentType: string;
  subject: string;
  gradeLevel: string[];
  difficulty: string;
  language?: string;
  content: {
    body: string;
    objectives?: string[];
    prerequisites?: string[];
    estimatedDuration?: number;
    instructions?: string;
  };
  tags?: string[];
  categories?: string[];
  keywords?: string[];
  ageRange?: { min: number; max: number };
  standards?: Array<{ framework: string; alignments: string[] }>;
  visibility?: string;
  accessLevel?: string;
}

export interface ContentSearchFilters {
  subject?: string;
  gradeLevel?: string[];
  difficulty?: string;
  contentType?: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  status?: string;
  language?: string;
  ageRange?: { min?: number; max?: number };
  rating?: { min?: number; max?: number };
  dateRange?: { start?: Date; end?: Date };
  searchTerm?: string;
}

export interface ContentSearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeAnalytics?: boolean;
  includeAuthor?: boolean;
}

export interface ContentAnalytics {
  totalViews: number;
  uniqueUsers: number;
  averageTimeSpent: number;
  completionRate: number;
  engagementScore: number;
  popularContent: any[];
  trendingTopics: string[];
  userFeedback: {
    averageRating: number;
    totalRatings: number;
    reviews: any[];
  };
}

export class ContentService {
  
  /**
   * Create new educational content
   */
  async createContent(
    authorId: string,
    contentData: ContentCreateData,
    organizationId?: string
  ): Promise<IContentItem> {
    try {
      // Validate author exists and has permissions
      const author = await UserMongo.findById(authorId);
      if (!author) {
        throw new Error('Author not found');
      }

      // Create base content item
      const contentItem = new ContentItem({
        ...contentData,
        author: new Types.ObjectId(authorId),
        organization: organizationId ? new Types.ObjectId(organizationId) : undefined,
        status: 'draft',
        version: { major: 1, minor: 0, patch: 0, versionString: '1.0.0' },
        analytics: {
          views: 0,
          likes: 0,
          downloads: 0,
          completions: 0,
          averageRating: 0,
          totalRatings: 0,
          engagementScore: 0
        },
        aiGenerated: false,
        collaborative: {
          allowComments: true,
          allowSuggestions: false,
          collaborators: [],
          reviewers: []
        }
      });

      const savedContent = await contentItem.save();

      // Create type-specific content if needed
      if (contentData.contentType === 'lesson') {
        await this.createLessonStructure(savedContent._id as Types.ObjectId);
      } else if (contentData.contentType === 'activity') {
        await this.createActivityStructure(savedContent._id as Types.ObjectId, {
          activityType: 'quiz', // Default
          interactionType: 'multiple-choice' // Default
        });
      }

      return savedContent;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  }

  /**
   * Get content by ID with populated fields
   */
  async getContentById(
    contentId: string,
    userId?: string,
    includeAnalytics = false
  ): Promise<IContentItem | null> {
    try {
      let query = ContentItem.findById(contentId);
      
      if (includeAnalytics) {
        query = query.populate('author', 'profile.firstName profile.lastName email role');
      }

      const content = await query.exec();
      
      if (!content) {
        return null;
      }

      // Check visibility permissions
      if (!this.canUserViewContent(content, userId)) {
        throw new Error('Access denied to this content');
      }

      // Increment view count if user is viewing
      if (userId) {
        await ContentItem.findByIdAndUpdate(
          contentId,
          { $inc: { 'analytics.views': 1 } }
        );
      }

      return content;
    } catch (error) {
      console.error('Error getting content:', error);
      throw error;
    }
  }

  /**
   * Search and filter content
   */
  async searchContent(
    filters: ContentSearchFilters,
    options: ContentSearchOptions = {},
    userId?: string
  ): Promise<{
    content: IContentItem[];
    totalCount: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeAnalytics = false,
        includeAuthor = false
      } = options;

      // Build search query
      const query: any = {};

      // Basic filters
      if (filters.subject) query.subject = new RegExp(filters.subject, 'i');
      if (filters.gradeLevel?.length) query.gradeLevel = { $in: filters.gradeLevel };
      if (filters.difficulty) query.difficulty = filters.difficulty;
      if (filters.contentType) query.contentType = filters.contentType;
      if (filters.language) query.language = filters.language;
      if (filters.status) query.status = filters.status;
      if (filters.author) query.author = new Types.ObjectId(filters.author);

      // Array filters
      if (filters.tags?.length) query.tags = { $in: filters.tags };
      if (filters.categories?.length) query.categories = { $in: filters.categories };

      // Range filters
      if (filters.ageRange) {
        if (filters.ageRange.min) query['ageRange.min'] = { $gte: filters.ageRange.min };
        if (filters.ageRange.max) query['ageRange.max'] = { $lte: filters.ageRange.max };
      }

      if (filters.rating) {
        if (filters.rating.min) query['analytics.averageRating'] = { $gte: filters.rating.min };
        if (filters.rating.max) {
          query['analytics.averageRating'] = { 
            ...query['analytics.averageRating'], 
            $lte: filters.rating.max 
          };
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const dateQuery: any = {};
        if (filters.dateRange.start) dateQuery.$gte = filters.dateRange.start;
        if (filters.dateRange.end) dateQuery.$lte = filters.dateRange.end;
        if (Object.keys(dateQuery).length) query.createdAt = dateQuery;
      }

      // Text search
      if (filters.searchTerm) {
        query.$or = [
          { title: new RegExp(filters.searchTerm, 'i') },
          { description: new RegExp(filters.searchTerm, 'i') },
          { tags: new RegExp(filters.searchTerm, 'i') },
          { keywords: new RegExp(filters.searchTerm, 'i') },
          { 'content.body': new RegExp(filters.searchTerm, 'i') }
        ];
      }

      // Visibility filter based on user permissions
      query.visibility = { $in: await this.getVisibleContentTypes(userId) };

      // Build aggregation pipeline
      const pipeline: any[] = [
        { $match: query },
        {
          $addFields: {
            relevanceScore: {
              $add: [
                { $multiply: ['$analytics.views', 0.3] },
                { $multiply: ['$analytics.likes', 0.4] },
                { $multiply: ['$analytics.averageRating', 20] },
                { $multiply: ['$analytics.engagementScore', 0.3] }
              ]
            }
          }
        }
      ];

      // Add author population if requested
      if (includeAuthor) {
        pipeline.push({
          $lookup: {
            from: 'usermongos',
            localField: 'author',
            foreignField: '_id',
            as: 'authorDetails',
            pipeline: [
              {
                $project: {
                  'profile.firstName': 1,
                  'profile.lastName': 1,
                  email: 1,
                  role: 1
                }
              }
            ]
          }
        });
        pipeline.push({
          $addFields: {
            author: { $arrayElemAt: ['$authorDetails', 0] }
          }
        });
      }

      // Sort
      const sortOptions: any = {};
      if (sortBy === 'relevance') {
        sortOptions.relevanceScore = sortOrder === 'asc' ? 1 : -1;
      } else {
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }
      pipeline.push({ $sort: sortOptions });

      // Count total documents
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await ContentItem.aggregate(countPipeline);
      const totalCount = countResult[0]?.total || 0;

      // Pagination
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });

      // Execute search
      const content = await ContentItem.aggregate(pipeline);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        content,
        totalCount,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  }

  /**
   * Update content
   */
  async updateContent(
    contentId: string,
    updateData: Partial<ContentCreateData>,
    userId: string,
    createNewVersion = false
  ): Promise<IContentItem> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Check edit permissions
      if (!this.canUserEditContent(content, userId)) {
        throw new Error('Permission denied to edit this content');
      }

      if (createNewVersion) {
        // Create new version
        return await this.createContentVersion(content, updateData, userId);
      } else {
        // Update existing content
        Object.assign(content, updateData);
        content.updatedAt = new Date();
        
        return await content.save();
      }
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  /**
   * Delete content (soft delete)
   */
  async deleteContent(contentId: string, userId: string): Promise<boolean> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Check delete permissions
      if (!this.canUserDeleteContent(content, userId)) {
        throw new Error('Permission denied to delete this content');
      }

      // Soft delete by changing status to archived
      content.status = 'archived';
      await content.save();

      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  }

  /**
   * Publish content
   */
  async publishContent(contentId: string, userId: string): Promise<IContentItem> {
    try {
      const content = await ContentItem.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      // Check publish permissions
      if (!this.canUserPublishContent(content, userId)) {
        throw new Error('Permission denied to publish this content');
      }

      content.status = 'published';
      content.publishedAt = new Date();
      
      return await content.save();
    } catch (error) {
      console.error('Error publishing content:', error);
      throw error;
    }
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(
    contentId?: string,
    timeRange?: { start: Date; end: Date },
    userId?: string
  ): Promise<ContentAnalytics> {
    try {
      const matchStage: any = {};
      
      if (contentId) {
        matchStage._id = new Types.ObjectId(contentId);
      }
      
      if (timeRange) {
        matchStage.createdAt = {
          $gte: timeRange.start,
          $lte: timeRange.end
        };
      }

      // Add visibility filters based on user permissions
      if (userId) {
        matchStage.visibility = { $in: await this.getVisibleContentTypes(userId) };
      }

      const analytics = await ContentItem.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$analytics.views' },
            totalContent: { $sum: 1 },
            averageRating: { $avg: '$analytics.averageRating' },
            totalRatings: { $sum: '$analytics.totalRatings' },
            totalLikes: { $sum: '$analytics.likes' },
            totalCompletions: { $sum: '$analytics.completions' },
            avgEngagementScore: { $avg: '$analytics.engagementScore' }
          }
        }
      ]);

      // Get popular content
      const popularContent = await ContentItem.find(matchStage)
        .sort({ 'analytics.views': -1 })
        .limit(10)
        .select('title analytics.views analytics.likes analytics.averageRating')
        .populate('author', 'profile.firstName profile.lastName');

      // Get trending topics (most used tags)
      const trendingTopics = await ContentItem.aggregate([
        { $match: matchStage },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
        { $project: { _id: 0, topic: '$_id', count: 1 } }
      ]);

      const result = analytics[0] || {
        totalViews: 0,
        totalContent: 0,
        averageRating: 0,
        totalRatings: 0,
        totalLikes: 0,
        totalCompletions: 0,
        avgEngagementScore: 0
      };

      return {
        totalViews: result.totalViews,
        uniqueUsers: 0, // Would need user tracking for this
        averageTimeSpent: 0, // Would need time tracking for this
        completionRate: result.totalContent > 0 ? (result.totalCompletions / result.totalContent) * 100 : 0,
        engagementScore: result.avgEngagementScore,
        popularContent,
        trendingTopics: trendingTopics.map(t => t.topic),
        userFeedback: {
          averageRating: result.averageRating,
          totalRatings: result.totalRatings,
          reviews: [] // Would need separate reviews collection
        }
      };
    } catch (error) {
      console.error('Error getting content analytics:', error);
      throw error;
    }
  }

  /**
   * Create lesson structure for lesson content type
   */
  private async createLessonStructure(contentId: Types.ObjectId): Promise<ILesson> {
    const lesson = new Lesson({
      contentId,
      structure: {
        sections: [
          {
            id: 'intro',
            title: 'Introduction',
            type: 'introduction',
            content: '',
            media: [],
            duration: 5,
            interactive: false
          }
        ],
        totalDuration: 5,
        sequenceOrder: 0
      },
      learningObjectives: {
        primary: [],
        secondary: [],
        skillsTargeted: [],
        bloomsLevel: 'understand'
      },
      adaptiveContent: {
        difficultyVariants: [],
        personalizedPaths: []
      }
    });

    return await lesson.save();
  }

  /**
   * Create activity structure for activity content type
   */
  private async createActivityStructure(
    contentId: Types.ObjectId,
    config: { activityType: string; interactionType: string }
  ): Promise<IActivity> {
    const activity = new Activity({
      contentId,
      activityType: config.activityType,
      interactionType: config.interactionType,
      configuration: {
        questions: [],
        tools: [],
        materials: []
      },
      assessment: {
        maxScore: 100,
        passingScore: 70,
        attempts: 3,
        instantFeedback: true,
        showCorrectAnswers: true
      },
      completionCriteria: {
        scoreThreshold: 70
      }
    });

    return await activity.save();
  }

  /**
   * Create new version of content
   */
  private async createContentVersion(
    originalContent: IContentItem,
    updateData: Partial<ContentCreateData>,
    userId: string
  ): Promise<IContentItem> {
    // Create new version with incremented version number
    const newVersion = new ContentItem({
      ...originalContent.toObject(),
      ...updateData,
      _id: undefined,
      version: {
        major: originalContent.version.major,
        minor: originalContent.version.minor + 1,
        patch: 0,
        versionString: `${originalContent.version.major}.${originalContent.version.minor + 1}.0`
      },
      previousVersions: [...originalContent.previousVersions, originalContent._id],
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: undefined,
      analytics: {
        views: 0,
        likes: 0,
        downloads: 0,
        completions: 0,
        averageRating: 0,
        totalRatings: 0,
        engagementScore: 0
      }
    });

    return await newVersion.save();
  }

  /**
   * Check if user can view content based on visibility and permissions
   */
  private canUserViewContent(content: IContentItem, userId?: string): boolean {
    if (content.visibility === 'public') return true;
    if (!userId) return false;

    // Author and contributors can always view
    if (content.author.toString() === userId) return true;
    if (content.contributors.some(c => c.toString() === userId)) return true;

    // Organization members can view organization content
    if (content.visibility === 'organization' && content.organization) {
      // Would need to check user's organization membership
      return true;
    }

    return false;
  }

  /**
   * Check if user can edit content
   */
  private canUserEditContent(content: IContentItem, userId: string): boolean {
    // Author can always edit
    if (content.author.toString() === userId) return true;
    
    // Contributors can edit if allowed
    if (content.contributors.some(c => c.toString() === userId)) return true;
    
    // Collaborators can edit if allowed
    if (content.collaborative.collaborators.some(c => c.toString() === userId)) return true;

    return false;
  }

  /**
   * Check if user can delete content
   */
  private canUserDeleteContent(content: IContentItem, userId: string): boolean {
    // Only author can delete
    return content.author.toString() === userId;
  }

  /**
   * Check if user can publish content
   */
  private canUserPublishContent(content: IContentItem, userId: string): boolean {
    // Author can publish
    if (content.author.toString() === userId) return true;
    
    // Reviewers can publish if in review status
    if (content.status === 'review' && 
        content.collaborative.reviewers.some(r => r.toString() === userId)) {
      return true;
    }

    return false;
  }

  /**
   * Get content types visible to user based on role and permissions
   */
  private async getVisibleContentTypes(userId?: string): Promise<string[]> {
    if (!userId) return ['public'];
    
    // Would need to check user role and permissions
    // For now, return all types except private
    return ['public', 'organization', 'class-specific'];
  }
}

export default ContentService;