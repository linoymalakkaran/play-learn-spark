/**
 * Advanced Filtering Service for Play & Learn Spark Backend
 * Sophisticated age/grade algorithms for personalized content recommendations
 */

import { logger } from '../utils/logger';

export interface ChildProfile {
  id: string;
  age: number; // in months
  grade?: 'pre-k' | 'kindergarten' | 'first-grade';
  interests: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  skillLevels: {
    mathematics: number; // 1-10 scale
    reading: number;
    motor: number;
    social: number;
    creativity: number;
  };
  completedActivities: string[];
  strugglingConcepts: string[];
  preferredLanguages: string[];
  attentionSpan: number; // in minutes
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'activity' | 'story' | 'game' | 'video' | 'exercise';
  ageRange: {
    min: number; // in months
    max: number;
  };
  topics: string[];
  skills: string[];
  difficulty: number; // 1-10 scale
  estimatedDuration: number; // in minutes
  language: string;
  prerequisites?: string[];
  learningObjectives: string[];
  interactionType: 'passive' | 'interactive' | 'collaborative';
  mediaTypes: ('text' | 'image' | 'audio' | 'video')[];
  adaptiveSupport: boolean;
}

export interface FilterCriteria {
  ageGroup?: '3-4' | '4-5' | '5-6' | 'all';
  topics?: string[];
  skills?: string[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
  duration?: {
    min?: number;
    max?: number;
  };
  contentType?: ContentItem['type'][];
  language?: string;
  learningStyle?: ChildProfile['learningStyle'];
  excludeCompleted?: boolean;
  prioritizeStruggling?: boolean;
}

export interface RecommendationScore {
  contentId: string;
  score: number; // 0-100
  reasoning: {
    ageMatch: number;
    skillMatch: number;
    interestMatch: number;
    difficultyMatch: number;
    noveltyBonus: number;
    learningStyleMatch: number;
    totalScore: number;
  };
  adaptations?: {
    suggestedDuration: number;
    difficultyAdjustment: string;
    supportNeeded: string[];
  };
}

export interface LearningPath {
  pathId: string;
  childId: string;
  targetSkills: string[];
  estimatedWeeks: number;
  milestones: Array<{
    week: number;
    skills: string[];
    activities: string[];
    assessmentCriteria: string[];
  }>;
  adaptiveAdjustments: Array<{
    date: string;
    reason: string;
    changes: string[];
  }>;
}

class AdvancedFilteringService {
  private static instance: AdvancedFilteringService;
  
  // Age-based developmental milestones (in months)
  private developmentalMilestones = {
    36: { // 3 years
      cognitive: ['basic counting to 3', 'color recognition', 'simple patterns'],
      motor: ['holding crayons', 'basic cutting', 'jumping'],
      social: ['sharing sometimes', 'parallel play', 'following simple rules'],
      language: ['3-word sentences', 'asking questions', 'basic vocabulary 1000 words']
    },
    42: { // 3.5 years
      cognitive: ['counting to 5', 'shape recognition', 'simple sorting'],
      motor: ['better coordination', 'pedaling tricycle', 'building towers'],
      social: ['taking turns', 'expressing emotions', 'cooperative play begins'],
      language: ['4-word sentences', 'storytelling begins', 'vocabulary 1500 words']
    },
    48: { // 4 years
      cognitive: ['counting to 10', 'basic math concepts', 'memory games'],
      motor: ['better pencil control', 'catching balls', 'more precise movements'],
      social: ['friendship development', 'empathy growth', 'rule following'],
      language: ['complex sentences', 'rhyming', 'vocabulary 2000+ words']
    },
    54: { // 4.5 years
      cognitive: ['number recognition', 'pattern completion', 'problem solving'],
      motor: ['drawing people', 'skipping', 'refined hand movements'],
      social: ['conflict resolution', 'cooperation', 'leadership emergence'],
      language: ['narrative skills', 'questioning everything', 'vocabulary 3000+ words']
    },
    60: { // 5 years
      cognitive: ['basic addition', 'letter recognition', 'categorization'],
      motor: ['writing letters', 'better balance', 'complex movements'],
      social: ['sustained friendships', 'group activities', 'fairness concepts'],
      language: ['reading readiness', 'complex storytelling', 'vocabulary 4000+ words']
    },
    66: { // 5.5 years
      cognitive: ['reading simple words', 'mathematical thinking', 'logical reasoning'],
      motor: ['refined writing', 'athletic skills', 'artistic expression'],
      social: ['emotional regulation', 'peer relationships', 'responsibility'],
      language: ['beginning reading', 'writing attempts', 'vocabulary 5000+ words']
    },
    72: { // 6 years
      cognitive: ['reading sentences', 'math operations', 'abstract thinking'],
      motor: ['controlled movements', 'sports participation', 'detailed artwork'],
      social: ['complex relationships', 'moral understanding', 'independence'],
      language: ['fluent reading', 'creative writing', 'vocabulary 6000+ words']
    }
  };

  private constructor() {}

  static getInstance(): AdvancedFilteringService {
    if (!AdvancedFilteringService.instance) {
      AdvancedFilteringService.instance = new AdvancedFilteringService();
    }
    return AdvancedFilteringService.instance;
  }

  // Main filtering method with sophisticated algorithms
  async filterContent(
    availableContent: ContentItem[], 
    childProfile: ChildProfile, 
    criteria: FilterCriteria = {}
  ): Promise<RecommendationScore[]> {
    try {
      logger.info(`Filtering content for child ${childProfile.id}, age ${childProfile.age} months`);

      // Apply basic filters first
      let filteredContent = this.applyBasicFilters(availableContent, childProfile, criteria);

      // Calculate recommendation scores
      const recommendations = await Promise.all(
        filteredContent.map(content => this.calculateRecommendationScore(content, childProfile))
      );

      // Sort by score and apply advanced algorithms
      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 20); // Top 20 recommendations

      // Apply diversity and learning path optimization
      const optimizedRecommendations = this.optimizeRecommendations(
        sortedRecommendations, 
        childProfile, 
        criteria
      );

      logger.info(`Generated ${optimizedRecommendations.length} personalized recommendations`);
      return optimizedRecommendations;

    } catch (error) {
      logger.error('Content filtering failed:', error);
      return [];
    }
  }

  // Generate personalized learning path
  async generateLearningPath(
    childProfile: ChildProfile, 
    targetSkills: string[], 
    durationWeeks: number = 8
  ): Promise<LearningPath> {
    try {
      logger.info(`Generating learning path for child ${childProfile.id}`);

      const currentCapabilities = this.assessCurrentCapabilities(childProfile);
      const skillGaps = this.identifySkillGaps(currentCapabilities, targetSkills);
      
      const milestones = this.planLearningMilestones(
        skillGaps, 
        childProfile, 
        durationWeeks
      );

      const learningPath: LearningPath = {
        pathId: `path_${Date.now()}_${childProfile.id}`,
        childId: childProfile.id,
        targetSkills,
        estimatedWeeks: durationWeeks,
        milestones,
        adaptiveAdjustments: []
      };

      return learningPath;

    } catch (error) {
      logger.error('Learning path generation failed:', error);
      throw error;
    }
  }

  // Age-appropriate content recommendation
  async getAgeAppropriateContent(
    ageInMonths: number, 
    availableContent: ContentItem[]
  ): Promise<ContentItem[]> {
    const developmentalStage = this.getDevelopmentalStage(ageInMonths);
    const appropriateContent = availableContent.filter(content => {
      const ageMatch = ageInMonths >= content.ageRange.min && ageInMonths <= content.ageRange.max;
      const developmentalMatch = this.matchesDevelopmentalStage(content, developmentalStage);
      return ageMatch && developmentalMatch;
    });

    return appropriateContent.sort((a, b) => 
      this.calculateDevelopmentalAlignment(b, ageInMonths) - 
      this.calculateDevelopmentalAlignment(a, ageInMonths)
    );
  }

  // Adaptive difficulty adjustment
  async adjustDifficultyBasedOnPerformance(
    childProfile: ChildProfile,
    recentPerformance: Array<{
      activityId: string;
      score: number;
      timeSpent: number;
      attemptsNeeded: number;
      frustratedMoments: number;
    }>
  ): Promise<{
    recommendedDifficulty: number;
    reasoning: string;
    supportStrategies: string[];
  }> {
    const avgScore = recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length;
    const avgFrustration = recentPerformance.reduce((sum, p) => sum + p.frustratedMoments, 0) / recentPerformance.length;
    const avgAttempts = recentPerformance.reduce((sum, p) => sum + p.attemptsNeeded, 0) / recentPerformance.length;

    let difficultyAdjustment = 0;
    let reasoning = '';
    const supportStrategies: string[] = [];

    // High performance - increase difficulty
    if (avgScore > 85 && avgFrustration < 1 && avgAttempts < 2) {
      difficultyAdjustment = 1;
      reasoning = 'Child is excelling and ready for more challenging content';
      supportStrategies.push('Introduce advanced concepts', 'Add creative extensions');
    }
    // Struggling - decrease difficulty
    else if (avgScore < 60 || avgFrustration > 3 || avgAttempts > 4) {
      difficultyAdjustment = -1;
      reasoning = 'Child needs more support and practice with current level';
      supportStrategies.push('Break down into smaller steps', 'Provide more guidance', 'Use visual aids');
    }
    // Optimal challenge zone
    else {
      reasoning = 'Child is in optimal learning zone';
      supportStrategies.push('Maintain current approach', 'Provide encouragement');
    }

    const currentDifficulty = this.getCurrentDifficultyLevel(childProfile);
    const recommendedDifficulty = Math.max(1, Math.min(10, currentDifficulty + difficultyAdjustment));

    return {
      recommendedDifficulty,
      reasoning,
      supportStrategies
    };
  }

  // Interest-based content discovery
  async discoverContentByInterests(
    interests: string[], 
    availableContent: ContentItem[],
    diversityFactor: number = 0.3
  ): Promise<ContentItem[]> {
    // Direct interest matches
    const directMatches = availableContent.filter(content =>
      content.topics.some(topic => 
        interests.some(interest => 
          topic.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(topic.toLowerCase())
        )
      )
    );

    // Related content discovery
    const relatedTopics = this.findRelatedTopics(interests);
    const relatedMatches = availableContent.filter(content =>
      content.topics.some(topic => relatedTopics.includes(topic.toLowerCase())) &&
      !directMatches.includes(content)
    );

    // Apply diversity to prevent interest tunnel vision
    const diverseContent = availableContent.filter(content =>
      !directMatches.includes(content) && 
      !relatedMatches.includes(content)
    );

    const diverseCount = Math.floor(diverseContent.length * diversityFactor);
    const selectedDiverse = diverseContent
      .sort(() => Math.random() - 0.5)
      .slice(0, diverseCount);

    return [...directMatches, ...relatedMatches, ...selectedDiverse];
  }

  // Private helper methods
  private applyBasicFilters(
    content: ContentItem[], 
    profile: ChildProfile, 
    criteria: FilterCriteria
  ): ContentItem[] {
    return content.filter(item => {
      // Age filter
      if (criteria.ageGroup && !this.matchesAgeGroup(item, criteria.ageGroup)) {
        return false;
      }

      // Duration filter
      if (criteria.duration) {
        if (criteria.duration.min && item.estimatedDuration < criteria.duration.min) return false;
        if (criteria.duration.max && item.estimatedDuration > criteria.duration.max) return false;
      }

      // Language filter
      if (criteria.language && item.language !== criteria.language) {
        return false;
      }

      // Content type filter
      if (criteria.contentType && !criteria.contentType.includes(item.type)) {
        return false;
      }

      // Exclude completed activities
      if (criteria.excludeCompleted && profile.completedActivities.includes(item.id)) {
        return false;
      }

      return true;
    });
  }

  private async calculateRecommendationScore(
    content: ContentItem, 
    profile: ChildProfile
  ): Promise<RecommendationScore> {
    // Age appropriateness (0-25 points)
    const ageMatch = this.calculateAgeMatch(content, profile.age);
    
    // Skill level alignment (0-20 points)
    const skillMatch = this.calculateSkillMatch(content, profile.skillLevels);
    
    // Interest alignment (0-20 points)
    const interestMatch = this.calculateInterestMatch(content, profile.interests);
    
    // Difficulty appropriateness (0-15 points)
    const difficultyMatch = this.calculateDifficultyMatch(content, profile);
    
    // Novelty bonus (0-10 points)
    const noveltyBonus = this.calculateNoveltyBonus(content, profile.completedActivities);
    
    // Learning style match (0-10 points)
    const learningStyleMatch = this.calculateLearningStyleMatch(content, profile.learningStyle);

    const totalScore = ageMatch + skillMatch + interestMatch + difficultyMatch + noveltyBonus + learningStyleMatch;

    return {
      contentId: content.id,
      score: Math.min(100, totalScore),
      reasoning: {
        ageMatch,
        skillMatch,
        interestMatch,
        difficultyMatch,
        noveltyBonus,
        learningStyleMatch,
        totalScore
      },
      adaptations: this.generateAdaptations(content, profile)
    };
  }

  private calculateAgeMatch(content: ContentItem, ageInMonths: number): number {
    const isInRange = ageInMonths >= content.ageRange.min && ageInMonths <= content.ageRange.max;
    if (!isInRange) return 0;

    const rangeCenter = (content.ageRange.min + content.ageRange.max) / 2;
    const distance = Math.abs(ageInMonths - rangeCenter);
    const rangeSize = content.ageRange.max - content.ageRange.min;
    
    // Closer to center = higher score
    const score = 25 * (1 - distance / (rangeSize / 2));
    return Math.max(0, score);
  }

  private calculateSkillMatch(content: ContentItem, skillLevels: ChildProfile['skillLevels']): number {
    const relevantSkills = content.skills.filter(skill => 
      Object.keys(skillLevels).some(category => skill.toLowerCase().includes(category))
    );

    if (relevantSkills.length === 0) return 10; // Neutral score for content without specific skill requirements

    let totalMatch = 0;
    for (const skill of relevantSkills) {
      const category = Object.keys(skillLevels).find(cat => skill.toLowerCase().includes(cat));
      if (category) {
        const skillLevel = skillLevels[category as keyof typeof skillLevels];
        // Content difficulty should match skill level
        const match = 20 - Math.abs(content.difficulty - skillLevel) * 2;
        totalMatch += Math.max(0, match);
      }
    }

    return Math.min(20, totalMatch / relevantSkills.length);
  }

  private calculateInterestMatch(content: ContentItem, interests: string[]): number {
    if (interests.length === 0) return 10; // Neutral score

    const matchCount = content.topics.filter(topic =>
      interests.some(interest => 
        topic.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(topic.toLowerCase())
      )
    ).length;

    return Math.min(20, (matchCount / content.topics.length) * 20);
  }

  private calculateDifficultyMatch(content: ContentItem, profile: ChildProfile): number {
    const avgSkillLevel = Object.values(profile.skillLevels).reduce((sum, level) => sum + level, 0) / 
                         Object.values(profile.skillLevels).length;
    
    const difficultyGap = Math.abs(content.difficulty - avgSkillLevel);
    
    // Optimal difficulty is slightly above current level (zone of proximal development)
    const optimalGap = 1;
    const score = 15 - Math.abs(difficultyGap - optimalGap) * 3;
    
    return Math.max(0, score);
  }

  private calculateNoveltyBonus(content: ContentItem, completedActivities: string[]): number {
    if (completedActivities.includes(content.id)) return 0;
    
    // Bonus for completely new topics
    const similarCompleted = completedActivities.length; // Simplified - in production, analyze topic similarity
    const noveltyScore = Math.max(0, 10 - similarCompleted * 0.5);
    
    return noveltyScore;
  }

  private calculateLearningStyleMatch(content: ContentItem, learningStyle: ChildProfile['learningStyle']): number {
    const styleScores = {
      visual: content.mediaTypes.includes('image') || content.mediaTypes.includes('video') ? 10 : 3,
      auditory: content.mediaTypes.includes('audio') ? 10 : 3,
      kinesthetic: content.interactionType === 'interactive' ? 10 : 3,
      mixed: 8 // Good for all content types
    };

    return styleScores[learningStyle] || 5;
  }

  private generateAdaptations(content: ContentItem, profile: ChildProfile): RecommendationScore['adaptations'] {
    const adaptations: NonNullable<RecommendationScore['adaptations']> = {
      suggestedDuration: content.estimatedDuration,
      difficultyAdjustment: 'none',
      supportNeeded: []
    };

    // Adjust duration based on attention span
    if (content.estimatedDuration > profile.attentionSpan) {
      adaptations.suggestedDuration = profile.attentionSpan;
      adaptations.supportNeeded.push('Break into shorter segments');
    }

    // Adjust difficulty based on skill levels
    const avgSkillLevel = Object.values(profile.skillLevels).reduce((sum, level) => sum + level, 0) / 
                         Object.values(profile.skillLevels).length;
    
    if (content.difficulty > avgSkillLevel + 2) {
      adaptations.difficultyAdjustment = 'simplify';
      adaptations.supportNeeded.push('Provide additional guidance', 'Break down complex steps');
    } else if (content.difficulty < avgSkillLevel - 1) {
      adaptations.difficultyAdjustment = 'extend';
      adaptations.supportNeeded.push('Add creative extensions', 'Introduce advanced concepts');
    }

    // Learning style adaptations
    if (profile.learningStyle === 'kinesthetic' && content.interactionType === 'passive') {
      adaptations.supportNeeded.push('Add hands-on elements', 'Include movement activities');
    }

    return adaptations;
  }

  private optimizeRecommendations(
    recommendations: RecommendationScore[], 
    profile: ChildProfile, 
    criteria: FilterCriteria
  ): RecommendationScore[] {
    // Implement diversity and learning path optimization
    // For now, return top recommendations with some diversity injection
    const topScoring = recommendations.slice(0, 10);
    const diverse = recommendations.slice(10, 20);
    
    // Interleave top scoring with diverse content
    const optimized: RecommendationScore[] = [];
    for (let i = 0; i < Math.max(topScoring.length, diverse.length); i++) {
      if (topScoring[i]) optimized.push(topScoring[i]);
      if (diverse[i] && optimized.length < 15) optimized.push(diverse[i]);
    }

    return optimized;
  }

  private getDevelopmentalStage(ageInMonths: number): any {
    const stageKeys = Object.keys(this.developmentalMilestones)
      .map(Number)
      .sort((a, b) => a - b);
    
    const stageKey = stageKeys.find(key => ageInMonths <= key) || stageKeys[stageKeys.length - 1];
    return this.developmentalMilestones[stageKey as keyof typeof this.developmentalMilestones];
  }

  private matchesDevelopmentalStage(content: ContentItem, stage: any): boolean {
    // Simplified matching - in production, implement more sophisticated algorithm
    return true;
  }

  private calculateDevelopmentalAlignment(content: ContentItem, ageInMonths: number): number {
    // Simplified calculation
    const ageCenter = (content.ageRange.min + content.ageRange.max) / 2;
    return 100 - Math.abs(ageInMonths - ageCenter);
  }

  private matchesAgeGroup(content: ContentItem, ageGroup: string): boolean {
    const ageRanges = {
      '3-4': { min: 36, max: 48 },
      '4-5': { min: 48, max: 60 },
      '5-6': { min: 60, max: 72 },
      'all': { min: 36, max: 72 }
    };

    const range = ageRanges[ageGroup as keyof typeof ageRanges];
    if (!range) return true;

    return content.ageRange.min <= range.max && content.ageRange.max >= range.min;
  }

  private findRelatedTopics(interests: string[]): string[] {
    const topicRelations: Record<string, string[]> = {
      'animals': ['pets', 'zoo', 'farm', 'wildlife', 'birds', 'insects'],
      'colors': ['art', 'painting', 'drawing', 'rainbow', 'crayons'],
      'numbers': ['counting', 'math', 'shapes', 'patterns', 'measurement'],
      'letters': ['reading', 'writing', 'alphabet', 'words', 'stories'],
      'vehicles': ['transportation', 'cars', 'trains', 'planes', 'travel']
    };

    const related: string[] = [];
    for (const interest of interests) {
      const relatedTopics = topicRelations[interest.toLowerCase()] || [];
      related.push(...relatedTopics);
    }

    return [...new Set(related)];
  }

  private assessCurrentCapabilities(profile: ChildProfile): Record<string, number> {
    // Convert skill levels to capabilities assessment
    return {
      cognitive: (profile.skillLevels.mathematics + profile.skillLevels.reading) / 2,
      physical: profile.skillLevels.motor,
      social: profile.skillLevels.social,
      creative: profile.skillLevels.creativity
    };
  }

  private identifySkillGaps(current: Record<string, number>, targets: string[]): string[] {
    // Simplified gap identification
    return targets.filter(skill => 
      Math.random() > 0.5 // Mock implementation
    );
  }

  private planLearningMilestones(
    skillGaps: string[], 
    profile: ChildProfile, 
    weeks: number
  ): LearningPath['milestones'] {
    const milestones: LearningPath['milestones'] = [];
    
    for (let week = 1; week <= weeks; week++) {
      milestones.push({
        week,
        skills: skillGaps.slice(0, Math.min(3, skillGaps.length)),
        activities: [`week-${week}-activity-1`, `week-${week}-activity-2`],
        assessmentCriteria: ['engagement', 'understanding', 'application']
      });
    }

    return milestones;
  }

  private getCurrentDifficultyLevel(profile: ChildProfile): number {
    return Object.values(profile.skillLevels).reduce((sum, level) => sum + level, 0) / 
           Object.values(profile.skillLevels).length;
  }
}

export default AdvancedFilteringService;