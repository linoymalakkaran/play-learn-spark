import { Activity, Child } from '@/types/learning';
import { NavigationItem, QuickAccess } from '@/stores/navigationStore';

interface UserPreferences {
  favoriteCategories: string[];
  preferredDifficulty: number;
  avgSessionTime: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  interests: string[];
  completedActivities: string[];
  strugglingAreas: string[];
  strengths: string[];
}

interface PersonalizationContext {
  currentTime: Date;
  dayOfWeek: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  sessionLength: number;
  recentActivity: string[];
  mood?: 'energetic' | 'calm' | 'focused' | 'playful';
}

interface RecommendationScore {
  activityId: string;
  score: number;
  reasons: string[];
  category: string;
  confidence: number;
}

class PersonalizationService {
  private static instance: PersonalizationService;
  private userProfiles: Map<string, UserPreferences> = new Map();
  private contextCache: Map<string, PersonalizationContext> = new Map();
  private recommendations: Map<string, RecommendationScore[]> = new Map();

  static getInstance(): PersonalizationService {
    if (!PersonalizationService.instance) {
      PersonalizationService.instance = new PersonalizationService();
    }
    return PersonalizationService.instance;
  }

  // Initialize user profile
  initializeUserProfile(child: Child): UserPreferences {
    const profile: UserPreferences = {
      favoriteCategories: [],
      preferredDifficulty: Math.floor((child.preferences?.difficultyLevel || 3)),
      avgSessionTime: 20, // Default 20 minutes
      learningStyle: child.preferences?.learningStyle || 'mixed',
      interests: child.preferences?.interests || [],
      completedActivities: [],
      strugglingAreas: [],
      strengths: []
    };

    this.userProfiles.set(child.id, profile);
    return profile;
  }

  // Update user profile based on activity completion
  updateUserProfile(
    childId: string, 
    activityId: string, 
    performance: {
      completed: boolean;
      timeSpent: number;
      difficulty: number;
      enjoymentRating?: number;
      struggledWith?: string[];
      excelled?: string[];
    }
  ): void {
    const profile = this.userProfiles.get(childId);
    if (!profile) return;

    // Update completed activities
    if (performance.completed && !profile.completedActivities.includes(activityId)) {
      profile.completedActivities.push(activityId);
    }

    // Update average session time
    profile.avgSessionTime = Math.round(
      (profile.avgSessionTime * 0.8) + (performance.timeSpent * 0.2)
    );

    // Update preferred difficulty based on performance
    if (performance.completed) {
      if (performance.enjoymentRating && performance.enjoymentRating >= 4) {
        // If they enjoyed it, slightly increase preferred difficulty
        profile.preferredDifficulty = Math.min(5, profile.preferredDifficulty + 0.1);
      }
    } else {
      // If they didn't complete it, slightly decrease preferred difficulty
      profile.preferredDifficulty = Math.max(1, profile.preferredDifficulty - 0.2);
    }

    // Update struggling areas and strengths
    if (performance.struggledWith) {
      performance.struggledWith.forEach(area => {
        if (!profile.strugglingAreas.includes(area)) {
          profile.strugglingAreas.push(area);
        }
      });
    }

    if (performance.excelled) {
      performance.excelled.forEach(area => {
        if (!profile.strengths.includes(area)) {
          profile.strengths.push(area);
        }
      });
    }

    this.userProfiles.set(childId, profile);
  }

  // Generate personalized activity recommendations
  async generateRecommendations(
    childId: string,
    availableActivities: Activity[],
    context?: Partial<PersonalizationContext>
  ): Promise<RecommendationScore[]> {
    const profile = this.userProfiles.get(childId);
    if (!profile) return [];

    const currentContext = this.buildContext(context);
    const recommendations: RecommendationScore[] = [];

    for (const activity of availableActivities) {
      const score = this.calculateActivityScore(activity, profile, currentContext);
      
      if (score.score > 0.3) { // Only include activities with reasonable scores
        recommendations.push(score);
      }
    }

    // Sort by score and return top recommendations
    const sortedRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    this.recommendations.set(childId, sortedRecommendations);
    return sortedRecommendations;
  }

  // Calculate personalized score for an activity
  private calculateActivityScore(
    activity: Activity,
    profile: UserPreferences,
    context: PersonalizationContext
  ): RecommendationScore {
    let score = 0;
    const reasons: string[] = [];

    // Base score
    score += 0.5;

    // Category preference (40% weight)
    if (profile.favoriteCategories.includes(activity.category)) {
      score += 0.4;
      reasons.push(`Favorite category: ${activity.category}`);
    } else if (profile.favoriteCategories.length === 0) {
      // No preferences yet, neutral score
      score += 0.2;
    }

    // Difficulty matching (25% weight)
    const difficultyDiff = Math.abs(activity.difficultyLevel - profile.preferredDifficulty);
    const difficultyScore = Math.max(0, 0.25 - (difficultyDiff * 0.05));
    score += difficultyScore;
    
    if (difficultyDiff <= 0.5) {
      reasons.push('Perfect difficulty match');
    } else if (difficultyDiff <= 1) {
      reasons.push('Good difficulty match');
    }

    // Learning style matching (15% weight)
    if (this.matchesLearningStyle(activity, profile.learningStyle)) {
      score += 0.15;
      reasons.push(`Matches ${profile.learningStyle} learning style`);
    }

    // Interest matching (10% weight)
    const interestMatch = profile.interests.some(interest => 
      activity.title.toLowerCase().includes(interest.toLowerCase()) ||
      activity.description.toLowerCase().includes(interest.toLowerCase()) ||
      activity.subcategory?.toLowerCase().includes(interest.toLowerCase())
    );
    
    if (interestMatch) {
      score += 0.1;
      reasons.push('Matches personal interests');
    }

    // Avoid recently completed (negative weight)
    if (profile.completedActivities.includes(activity.id)) {
      const completionRecency = this.getCompletionRecency(activity.id, profile);
      if (completionRecency < 7) { // Within last week
        score -= 0.3;
        reasons.push('Recently completed');
      } else if (completionRecency < 30) { // Within last month
        score -= 0.1;
        reasons.push('Completed recently');
      }
    }

    // Time of day considerations (5% weight)
    const timeBonus = this.getTimeOfDayBonus(activity, context.timeOfDay);
    score += timeBonus;
    
    if (timeBonus > 0) {
      reasons.push(`Good for ${context.timeOfDay} time`);
    }

    // Session length matching (5% weight)
    const estimatedDuration = activity.estimatedDuration || 15;
    if (Math.abs(estimatedDuration - profile.avgSessionTime) <= 5) {
      score += 0.05;
      reasons.push('Perfect session length');
    }

    // Struggling areas support
    const supportsStruggling = profile.strugglingAreas.some(area =>
      activity.category.includes(area) || 
      activity.subcategory?.includes(area)
    );
    
    if (supportsStruggling) {
      score += 0.1;
      reasons.push('Helps with challenging areas');
    }

    // Confidence calculation
    const confidence = Math.min(1, 
      (profile.completedActivities.length / 20) + // More data = higher confidence
      (profile.favoriteCategories.length / 5) +
      0.3 // Base confidence
    );

    return {
      activityId: activity.id,
      score: Math.max(0, Math.min(1, score)),
      reasons,
      category: activity.category,
      confidence
    };
  }

  // Check if activity matches learning style
  private matchesLearningStyle(activity: Activity, learningStyle: string): boolean {
    const visualActivities = ['art', 'visual', 'colors', 'shapes', 'reading'];
    const auditoryActivities = ['music', 'sounds', 'language', 'phonics'];
    const kinestheticActivities = ['physical', 'movement', 'hands-on', 'building'];

    const activityType = activity.category.toLowerCase();
    const activityDesc = activity.description.toLowerCase();

    switch (learningStyle) {
      case 'visual':
        return visualActivities.some(type => 
          activityType.includes(type) || activityDesc.includes(type)
        );
      case 'auditory':
        return auditoryActivities.some(type => 
          activityType.includes(type) || activityDesc.includes(type)
        );
      case 'kinesthetic':
        return kinestheticActivities.some(type => 
          activityType.includes(type) || activityDesc.includes(type)
        );
      case 'mixed':
        return true; // Mixed learners benefit from all types
      default:
        return true;
    }
  }

  // Get time-of-day bonus for activities
  private getTimeOfDayBonus(activity: Activity, timeOfDay: string): number {
    const morningActivities = ['math', 'problem', 'focus'];
    const afternoonActivities = ['science', 'world', 'learning'];
    const eveningActivities = ['art', 'creative', 'calm', 'reading'];

    const activityType = activity.category.toLowerCase();

    switch (timeOfDay) {
      case 'morning':
        return morningActivities.some(type => activityType.includes(type)) ? 0.05 : 0;
      case 'afternoon':
        return afternoonActivities.some(type => activityType.includes(type)) ? 0.05 : 0;
      case 'evening':
        return eveningActivities.some(type => activityType.includes(type)) ? 0.05 : 0;
      default:
        return 0;
    }
  }

  // Get how recently an activity was completed (in days)
  private getCompletionRecency(activityId: string, profile: UserPreferences): number {
    // This would typically check completion timestamps
    // For now, return a mock value
    return 30; // Assume completed 30 days ago
  }

  // Build context for recommendations
  private buildContext(context?: Partial<PersonalizationContext>): PersonalizationContext {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening';
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 18) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    return {
      currentTime: now,
      dayOfWeek: now.getDay(),
      timeOfDay,
      sessionLength: 20,
      recentActivity: [],
      mood: 'focused',
      ...context
    };
  }

  // Generate personalized quick access items
  async generateQuickAccess(
    childId: string,
    availableActivities: Activity[]
  ): Promise<QuickAccess[]> {
    const profile = this.userProfiles.get(childId);
    if (!profile) return [];

    const recommendations = await this.generateRecommendations(childId, availableActivities);
    const quickAccess: QuickAccess[] = [];

    // Add top recommendations
    recommendations.slice(0, 3).forEach((rec, index) => {
      const activity = availableActivities.find(a => a.id === rec.activityId);
      if (activity) {
        quickAccess.push({
          type: 'activity',
          id: activity.id,
          title: activity.title,
          icon: activity.icon || '🎯',
          path: `/activity/${activity.id}`,
          priority: 10 - index,
          lastUsed: Date.now()
        });
      }
    });

    // Add favorite categories
    profile.favoriteCategories.slice(0, 2).forEach((category, index) => {
      quickAccess.push({
        type: 'category',
        id: `category-${category}`,
        title: `${category.charAt(0).toUpperCase()}${category.slice(1)} Activities`,
        icon: this.getCategoryIcon(category),
        path: `/activities?category=${category}`,
        priority: 7 - index,
        lastUsed: Date.now()
      });
    });

    return quickAccess.sort((a, b) => b.priority - a.priority);
  }

  // Get icon for category
  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      math: '🔢',
      english: '📚',
      science: '🔬',
      art: '🎨',
      physical: '🏃',
      music: '🎵',
      social: '👥',
      habits: '✅',
      problem: '🧩',
      world: '🌍',
      languages: '🗣️'
    };
    
    return icons[category] || '📖';
  }

  // Get user preferences for a child
  getUserPreferences(childId: string): UserPreferences | undefined {
    return this.userProfiles.get(childId);
  }

  // Update favorite categories based on usage
  updateFavoriteCategories(childId: string, category: string): void {
    const profile = this.userProfiles.get(childId);
    if (!profile) return;

    if (!profile.favoriteCategories.includes(category)) {
      profile.favoriteCategories.push(category);
      
      // Keep only top 5 favorite categories
      if (profile.favoriteCategories.length > 5) {
        profile.favoriteCategories.shift();
      }
    }

    this.userProfiles.set(childId, profile);
  }

  // Generate contextual navigation suggestions
  generateNavigationSuggestions(
    childId: string,
    currentPath: string,
    availableActivities: Activity[]
  ): NavigationItem[] {
    const profile = this.userProfiles.get(childId);
    if (!profile) return [];

    const suggestions: NavigationItem[] = [];

    // If on an activity page, suggest related activities
    if (currentPath.includes('/activity/')) {
      const currentActivityId = currentPath.split('/').pop();
      const currentActivity = availableActivities.find(a => a.id === currentActivityId);
      
      if (currentActivity) {
        // Suggest activities in the same category
        const relatedActivities = availableActivities
          .filter(a => 
            a.category === currentActivity.category && 
            a.id !== currentActivity.id &&
            !profile.completedActivities.includes(a.id)
          )
          .slice(0, 3);

        relatedActivities.forEach(activity => {
          suggestions.push({
            id: `suggestion-${activity.id}`,
            title: activity.title,
            path: `/activity/${activity.id}`,
            icon: activity.icon,
            tags: ['suggested', 'related']
          });
        });
      }
    }

    // Suggest next logical steps based on completed activities
    if (profile.completedActivities.length > 0) {
      const lastCompleted = profile.completedActivities[profile.completedActivities.length - 1];
      const lastActivity = availableActivities.find(a => a.id === lastCompleted);
      
      if (lastActivity) {
        // Suggest slightly harder activities in the same category
        const nextLevel = availableActivities
          .filter(a => 
            a.category === lastActivity.category &&
            a.difficultyLevel > lastActivity.difficultyLevel &&
            a.difficultyLevel <= lastActivity.difficultyLevel + 1 &&
            !profile.completedActivities.includes(a.id)
          )
          .slice(0, 2);

        nextLevel.forEach(activity => {
          suggestions.push({
            id: `next-${activity.id}`,
            title: `Next: ${activity.title}`,
            path: `/activity/${activity.id}`,
            icon: '⬆️',
            tags: ['progression', 'next-level']
          });
        });
      }
    }

    return suggestions;
  }
}

export default PersonalizationService;