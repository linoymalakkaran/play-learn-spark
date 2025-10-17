/**
 * Recommendation Algorithms and Logic
 * Core recommendation engine with ML-based content suggestions and learning path generation
 */

import { 
  RecommendedContent, 
  PersonalizationProfile, 
  LearningPathSuggestion,
  RecommendationReason,
  PathMilestone,
  PerformanceMetric
} from '@/types/recommendation.types';

/**
 * Generate recommendations based on personalization profile
 */
export const generateRecommendations = (
  profile: PersonalizationProfile,
  availableContent: RecommendedContent[]
): RecommendedContent[] => {
  return availableContent.map(content => {
    const score = calculateRecommendationScore(content, profile);
    const reasons = generateRecommendationReasons(content, profile);
    
    return {
      ...content,
      recommendationScore: score,
      recommendationReasons: reasons,
      estimatedLearningGain: calculateLearningGain(content, profile),
      adaptationSuggestions: generateAdaptationSuggestions(content, profile)
    };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore);
};

/**
 * Calculate recommendation score based on multiple factors
 */
export const calculateRecommendationScore = (
  content: RecommendedContent,
  profile: PersonalizationProfile
): number => {
  let score = 0;
  
  // Age appropriateness (20% weight)
  const ageScore = calculateAgeMatch(content.ageRange, profile.age);
  score += ageScore * 0.2;
  
  // Skill level match (25% weight)
  const skillScore = calculateSkillLevelMatch(content.skills, profile.skillLevels);
  score += skillScore * 0.25;
  
  // Interest alignment (20% weight)
  const interestScore = calculateInterestMatch(content.category, content.tags, profile.interests);
  score += interestScore * 0.2;
  
  // Learning style compatibility (15% weight)
  const learningStyleScore = calculateLearningStyleMatch(content.type, profile.learningStyle);
  score += learningStyleScore * 0.15;
  
  // Difficulty appropriateness (10% weight)
  const difficultyScore = calculateDifficultyMatch(content.difficulty, profile.preferredDifficulty);
  score += difficultyScore * 0.1;
  
  // Recent performance context (10% weight)
  const performanceScore = calculatePerformanceContext(content, profile.recentPerformance);
  score += performanceScore * 0.1;
  
  return Math.round(score);
};

/**
 * Generate reasons for recommendation
 */
export const generateRecommendationReasons = (
  content: RecommendedContent,
  profile: PersonalizationProfile
): RecommendationReason[] => {
  const reasons: RecommendationReason[] = [];
  
  // Age match reason
  const ageScore = calculateAgeMatch(content.ageRange, profile.age);
  if (ageScore > 80) {
    reasons.push({
      type: 'age_match',
      explanation: `Perfect for ${Math.floor(profile.age / 12)} year old`,
      strength: ageScore,
      icon: 'calendar'
    });
  }
  
  // Skill level reason
  const skillScore = calculateSkillLevelMatch(content.skills, profile.skillLevels);
  if (skillScore > 70) {
    reasons.push({
      type: 'skill_level',
      explanation: 'Matches current skill level',
      strength: skillScore,
      icon: 'target'
    });
  }
  
  // Interest reason
  const interestScore = calculateInterestMatch(content.category, content.tags, profile.interests);
  if (interestScore > 75) {
    reasons.push({
      type: 'interest',
      explanation: 'Aligns with interests',
      strength: interestScore,
      icon: 'heart'
    });
  }
  
  // Learning style reason
  const learningStyleScore = calculateLearningStyleMatch(content.type, profile.learningStyle);
  if (learningStyleScore > 80) {
    reasons.push({
      type: 'learning_style',
      explanation: `Great for ${profile.learningStyle} learners`,
      strength: learningStyleScore,
      icon: 'brain'
    });
  }
  
  return reasons.sort((a, b) => b.strength - a.strength);
};

/**
 * Generate learning paths based on profile
 */
export const generateLearningPaths = (
  profile: PersonalizationProfile,
  recommendations: RecommendedContent[]
): LearningPathSuggestion[] => {
  const paths: LearningPathSuggestion[] = [];
  
  // Generate skill-focused paths
  Object.keys(profile.skillLevels).forEach(skill => {
    const skillLevel = profile.skillLevels[skill];
    const relatedContent = recommendations.filter(content => 
      content.skills.includes(skill) && 
      !content.isCompleted
    );
    
    if (relatedContent.length >= 3) {
      paths.push(createSkillPath(skill, skillLevel, relatedContent, profile));
    }
  });
  
  // Generate interest-based paths
  profile.interests.forEach(interest => {
    const interestContent = recommendations.filter(content =>
      content.category === interest || 
      content.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
    );
    
    if (interestContent.length >= 4) {
      paths.push(createInterestPath(interest, interestContent, profile));
    }
  });
  
  return paths.sort((a, b) => b.successPrediction - a.successPrediction);
};

// Helper functions

const calculateAgeMatch = (ageRange: string, childAge: number): number => {
  const childAgeYears = Math.floor(childAge / 12);
  
  // Parse age range (e.g., "6-8", "5+", "3-5")
  if (ageRange.includes('+')) {
    const minAge = parseInt(ageRange.replace('+', ''));
    return childAgeYears >= minAge ? 100 : Math.max(0, 100 - (minAge - childAgeYears) * 20);
  }
  
  if (ageRange.includes('-')) {
    const [minAge, maxAge] = ageRange.split('-').map(a => parseInt(a));
    if (childAgeYears >= minAge && childAgeYears <= maxAge) {
      return 100;
    }
    const distance = Math.min(Math.abs(childAgeYears - minAge), Math.abs(childAgeYears - maxAge));
    return Math.max(0, 100 - distance * 25);
  }
  
  return 70; // Default for unclear age ranges
};

const calculateSkillLevelMatch = (
  contentSkills: string[],
  profileSkills: Record<string, number>
): number => {
  if (contentSkills.length === 0) return 50;
  
  const matches = contentSkills.filter(skill => {
    const skillLevel = profileSkills[skill] || 0;
    return skillLevel > 30; // Has some proficiency
  });
  
  return (matches.length / contentSkills.length) * 100;
};

const calculateInterestMatch = (
  category: string,
  tags: string[],
  interests: string[]
): number => {
  if (interests.length === 0) return 50;
  
  let score = 0;
  
  // Direct category match
  if (interests.includes(category)) {
    score += 50;
  }
  
  // Tag matches
  const tagMatches = tags.filter(tag => 
    interests.some(interest => 
      tag.toLowerCase().includes(interest.toLowerCase()) ||
      interest.toLowerCase().includes(tag.toLowerCase())
    )
  );
  
  score += (tagMatches.length / Math.max(tags.length, 1)) * 50;
  
  return Math.min(100, score);
};

const calculateLearningStyleMatch = (
  contentType: string,
  learningStyle: string
): number => {
  const styleMapping: Record<string, string[]> = {
    visual: ['video', 'story', 'activity'],
    auditory: ['video', 'lesson', 'activity'],
    kinesthetic: ['game', 'activity'],
    mixed: ['video', 'story', 'game', 'activity', 'lesson']
  };
  
  const compatibleTypes = styleMapping[learningStyle] || [];
  return compatibleTypes.includes(contentType) ? 100 : 60;
};

const calculateDifficultyMatch = (
  contentDifficulty: string,
  preferredDifficulty: string
): number => {
  if (preferredDifficulty === 'adaptive') return 85;
  if (contentDifficulty === preferredDifficulty) return 100;
  
  const difficultyOrder = ['easy', 'medium', 'hard'];
  const contentIndex = difficultyOrder.indexOf(contentDifficulty);
  const preferredIndex = difficultyOrder.indexOf(preferredDifficulty);
  
  const distance = Math.abs(contentIndex - preferredIndex);
  return Math.max(0, 100 - distance * 30);
};

const calculatePerformanceContext = (
  content: RecommendedContent,
  recentPerformance: PerformanceMetric[]
): number => {
  if (recentPerformance.length === 0) return 70;
  
  // Find related performance data
  const relatedPerformance = recentPerformance.filter(perf =>
    content.skills.some(skill => perf.excelledAt.includes(skill)) ||
    content.category === getContentCategory(perf.contentId)
  );
  
  if (relatedPerformance.length === 0) return 70;
  
  const avgScore = relatedPerformance.reduce((sum, perf) => sum + perf.score, 0) / relatedPerformance.length;
  const avgEngagement = relatedPerformance.reduce((sum, perf) => sum + perf.engagementLevel, 0) / relatedPerformance.length;
  
  return (avgScore + avgEngagement) / 2;
};

const calculateLearningGain = (
  content: RecommendedContent,
  profile: PersonalizationProfile
): number => {
  // Calculate potential learning gain based on content and profile
  let gain = 50; // Base gain
  
  // Higher gain for skills that need improvement
  const strugglingSkills = content.skills.filter(skill => 
    profile.strugglingAreas.includes(skill)
  );
  gain += strugglingSkills.length * 15;
  
  // Lower gain for already strong skills
  const strongSkills = content.skills.filter(skill =>
    profile.strengthAreas.includes(skill)
  );
  gain -= strongSkills.length * 10;
  
  return Math.max(0, Math.min(100, gain));
};

const generateAdaptationSuggestions = (
  content: RecommendedContent,
  profile: PersonalizationProfile
): string[] => {
  const suggestions: string[] = [];
  
  if (profile.attentionSpan < content.duration) {
    suggestions.push('Break into shorter sessions');
  }
  
  if (profile.learningStyle === 'kinesthetic' && content.type === 'video') {
    suggestions.push('Add interactive elements during viewing');
  }
  
  if (profile.socialPreferences === 'collaborative') {
    suggestions.push('Consider doing with friends or family');
  }
  
  return suggestions;
};

const createSkillPath = (
  skill: string,
  currentLevel: number,
  content: RecommendedContent[],
  profile: PersonalizationProfile
): LearningPathSuggestion => {
  const sortedContent = content
    .filter(c => c.skills.includes(skill))
    .sort((a, b) => getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty));
  
  const milestones: PathMilestone[] = [];
  let week = 1;
  
  for (let i = 0; i < Math.min(4, sortedContent.length); i++) {
    milestones.push({
      id: `${skill}-milestone-${i + 1}`,
      title: `${skill} Level ${i + 1}`,
      description: `Master ${skill} through ${sortedContent[i].title}`,
      week,
      skills: [skill],
      activities: [sortedContent[i].id],
      assessmentCriteria: [`Complete ${sortedContent[i].title} with 80% score`]
    });
    week += Math.ceil(sortedContent[i].duration / profile.optimalSessionLength);
  }
  
  return {
    id: `path-${skill}-${Date.now()}`,
    title: `Master ${skill}`,
    description: `Comprehensive path to improve ${skill} skills`,
    estimatedWeeks: week - 1,
    targetSkills: [skill],
    difficulty: currentLevel < 30 ? 'beginner' : currentLevel < 70 ? 'intermediate' : 'advanced',
    prerequisites: [],
    milestones,
    recommendedContent: sortedContent.slice(0, 4).map(c => c.id),
    adaptiveAdjustments: [],
    successPrediction: Math.min(95, 60 + currentLevel * 0.3)
  };
};

const createInterestPath = (
  interest: string,
  content: RecommendedContent[],
  profile: PersonalizationProfile
): LearningPathSuggestion => {
  const bestContent = content
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 5);
  
  return {
    id: `path-${interest}-${Date.now()}`,
    title: `Explore ${interest}`,
    description: `Dive deep into ${interest} with engaging activities`,
    estimatedWeeks: Math.ceil(bestContent.length * 1.5),
    targetSkills: [...new Set(bestContent.flatMap(c => c.skills))],
    difficulty: 'intermediate',
    prerequisites: [],
    milestones: bestContent.map((c, i) => ({
      id: `${interest}-milestone-${i + 1}`,
      title: c.title,
      description: c.description,
      week: i + 1,
      skills: c.skills,
      activities: [c.id],
      assessmentCriteria: [`Complete ${c.title}`]
    })),
    recommendedContent: bestContent.map(c => c.id),
    adaptiveAdjustments: [],
    successPrediction: 80
  };
};

const getDifficultyOrder = (difficulty: string): number => {
  const order = { easy: 1, medium: 2, hard: 3 };
  return order[difficulty as keyof typeof order] || 2;
};

const getContentCategory = (contentId: string): string => {
  // This would normally fetch from a content database
  return 'general'; // Placeholder
};