/**
 * Mock data generators for the Recommendation Engine
 * Replace these with actual API calls in production
 */

import {
  RecommendedContent,
  PersonalizationProfile,
  LearningPathSuggestion,
  PerformanceMetric,
  RecommendationReason
} from '@/types/recommendation.types';

export const generateMockProfile = (childId: string): PersonalizationProfile => {
  return {
    childId,
    age: 96, // 8 years old (in months)
    interests: ['Math', 'Science', 'Art', 'Reading'],
    learningStyle: 'visual',
    skillLevels: {
      'Addition': 85,
      'Subtraction': 70,
      'Reading Comprehension': 90,
      'Vocabulary': 75,
      'Problem Solving': 80,
      'Creativity': 95
    },
    attentionSpan: 25, // 25 minutes
    preferredDifficulty: 'medium',
    optimalSessionLength: 20,
    strugglingAreas: ['Multiplication', 'Grammar'],
    strengthAreas: ['Reading Comprehension', 'Creativity', 'Problem Solving'],
    completedContent: ['content-1', 'content-5', 'content-12'],
    recentPerformance: generateMockPerformance(),
    socialPreferences: 'mixed',
    parentGoals: ['Improve math skills', 'Build confidence', 'Develop creativity']
  };
};

export const generateMockPerformance = (): PerformanceMetric[] => {
  return [
    {
      contentId: 'content-1',
      score: 85,
      timeSpent: 20,
      attemptsNeeded: 2,
      engagementLevel: 90,
      completedAt: new Date('2024-01-15'),
      struggledWith: ['Complex fractions'],
      excelledAt: ['Basic arithmetic', 'Pattern recognition']
    },
    {
      contentId: 'content-5',
      score: 92,
      timeSpent: 15,
      attemptsNeeded: 1,
      engagementLevel: 95,
      completedAt: new Date('2024-01-18'),
      struggledWith: [],
      excelledAt: ['Reading comprehension', 'Vocabulary']
    }
  ];
};

export const generateMockContent = (): RecommendedContent[] => {
  const mockContent: RecommendedContent[] = [
    {
      id: 'content-math-1',
      title: 'Addition Adventures',
      description: 'Learn addition through fun interactive games and puzzles',
      type: 'game',
      category: 'Math',
      thumbnailUrl: '/images/math-adventure.jpg',
      duration: 15,
      difficulty: 'easy',
      ageRange: '6-8',
      skills: ['Addition', 'Problem Solving'],
      tags: ['interactive', 'numbers', 'fun'],
      recommendationScore: 95,
      recommendationReasons: [
        {
          type: 'skill_level',
          explanation: 'Perfect for your addition skills',
          strength: 90,
          icon: 'target'
        }
      ],
      learningObjectives: ['Master single-digit addition', 'Understand number relationships'],
      prerequisites: ['Number recognition'],
      completionRate: 0,
      userRating: 4.8,
      isBookmarked: false,
      isCompleted: false,
      estimatedLearningGain: 85,
      adaptationSuggestions: ['Use visual aids', 'Take breaks every 10 minutes']
    },
    {
      id: 'content-reading-1',
      title: 'Story Time Adventures',
      description: 'Interactive stories that build reading comprehension',
      type: 'story',
      category: 'Reading',
      thumbnailUrl: '/images/story-time.jpg',
      duration: 20,
      difficulty: 'medium',
      ageRange: '7-9',
      skills: ['Reading Comprehension', 'Vocabulary'],
      tags: ['stories', 'comprehension', 'adventure'],
      recommendationScore: 92,
      recommendationReasons: [
        {
          type: 'interest',
          explanation: 'Matches your love for reading',
          strength: 95,
          icon: 'heart'
        }
      ],
      learningObjectives: ['Improve reading speed', 'Enhance comprehension'],
      prerequisites: ['Basic reading skills'],
      completionRate: 0,
      userRating: 4.9,
      isBookmarked: true,
      isCompleted: false,
      estimatedLearningGain: 90,
      adaptationSuggestions: ['Read aloud for better engagement']
    },
    {
      id: 'content-science-1',
      title: 'Kitchen Chemistry',
      description: 'Discover science through safe kitchen experiments',
      type: 'activity',
      category: 'Science',
      thumbnailUrl: '/images/kitchen-chemistry.jpg',
      duration: 30,
      difficulty: 'medium',
      ageRange: '8-10',
      skills: ['Scientific Method', 'Critical Thinking'],
      tags: ['experiments', 'hands-on', 'discovery'],
      recommendationScore: 88,
      recommendationReasons: [
        {
          type: 'learning_style',
          explanation: 'Great for visual learners',
          strength: 85,
          icon: 'brain'
        }
      ],
      learningObjectives: ['Understand basic chemistry', 'Practice observation skills'],
      prerequisites: ['Adult supervision'],
      completionRate: 0,
      userRating: 4.7,
      isBookmarked: false,
      isCompleted: false,
      estimatedLearningGain: 80,
      adaptationSuggestions: ['Prepare materials in advance', 'Work with a partner']
    },
    {
      id: 'content-art-1',
      title: 'Digital Art Studio',
      description: 'Create beautiful digital artwork with guided tutorials',
      type: 'activity',
      category: 'Art',
      thumbnailUrl: '/images/digital-art.jpg',
      duration: 25,
      difficulty: 'easy',
      ageRange: '6-12',
      skills: ['Creativity', 'Digital Literacy'],
      tags: ['art', 'digital', 'creative'],
      recommendationScore: 94,
      recommendationReasons: [
        {
          type: 'interest',
          explanation: 'Perfect for art enthusiasts',
          strength: 90,
          icon: 'heart'
        }
      ],
      learningObjectives: ['Express creativity', 'Learn digital tools'],
      prerequisites: ['Basic computer skills'],
      completionRate: 0,
      userRating: 4.6,
      isBookmarked: false,
      isCompleted: false,
      estimatedLearningGain: 95,
      adaptationSuggestions: ['Save work frequently', 'Experiment with colors']
    },
    {
      id: 'content-completed-1',
      title: 'Counting Games',
      description: 'Fun counting activities for number recognition',
      type: 'game',
      category: 'Math',
      thumbnailUrl: '/images/counting.jpg',
      duration: 10,
      difficulty: 'easy',
      ageRange: '5-7',
      skills: ['Number Recognition', 'Counting'],
      tags: ['numbers', 'counting', 'basic'],
      recommendationScore: 70,
      recommendationReasons: [
        {
          type: 'age_match',
          explanation: 'Age appropriate content',
          strength: 85,
          icon: 'calendar'
        }
      ],
      learningObjectives: ['Count to 20', 'Recognize numbers'],
      prerequisites: [],
      completionRate: 100,
      userRating: 4.5,
      isBookmarked: false,
      isCompleted: true,
      estimatedLearningGain: 30,
      adaptationSuggestions: []
    }
  ];

  return mockContent;
};

export const generateMockRecommendations = (profile: PersonalizationProfile): RecommendedContent[] => {
  // This is a simplified version - the actual algorithm is in RecommendationAlgorithms.tsx
  const content = generateMockContent();
  
  return content.map(item => ({
    ...item,
    recommendationScore: Math.floor(Math.random() * 30) + 70, // 70-100
    estimatedLearningGain: Math.floor(Math.random() * 40) + 60 // 60-100
  })).sort((a, b) => b.recommendationScore - a.recommendationScore);
};

export const generateMockLearningPaths = (profile: PersonalizationProfile): LearningPathSuggestion[] => {
  return [
    {
      id: 'path-math-mastery',
      title: 'Math Mastery Journey',
      description: 'Master fundamental math skills through engaging activities',
      estimatedWeeks: 8,
      targetSkills: ['Addition', 'Subtraction', 'Multiplication', 'Problem Solving'],
      difficulty: 'intermediate',
      prerequisites: ['Number recognition', 'Counting to 100'],
      milestones: [
        {
          id: 'milestone-1',
          title: 'Addition Basics',
          description: 'Master single and double-digit addition',
          week: 2,
          skills: ['Addition', 'Problem Solving'],
          activities: ['content-math-1'],
          assessmentCriteria: ['Complete with 80% accuracy', 'Solve 10 problems correctly']
        },
        {
          id: 'milestone-2',
          title: 'Subtraction Skills',
          description: 'Learn subtraction techniques',
          week: 4,
          skills: ['Subtraction', 'Problem Solving'],
          activities: ['content-math-2'],
          assessmentCriteria: ['Complete subtraction games', 'Understand borrowing concept']
        },
        {
          id: 'milestone-3',
          title: 'Multiplication Introduction',
          description: 'Begin multiplication concepts',
          week: 6,
          skills: ['Multiplication', 'Pattern Recognition'],
          activities: ['content-math-3'],
          assessmentCriteria: ['Memorize tables 1-5', 'Solve word problems']
        },
        {
          id: 'milestone-4',
          title: 'Problem Solving Master',
          description: 'Apply all math skills to complex problems',
          week: 8,
          skills: ['Problem Solving', 'Critical Thinking'],
          activities: ['content-math-4'],
          assessmentCriteria: ['Solve multi-step problems', 'Explain reasoning']
        }
      ],
      recommendedContent: ['content-math-1', 'content-math-2', 'content-math-3', 'content-math-4'],
      adaptiveAdjustments: [
        'Adjust difficulty based on performance',
        'Provide additional practice for struggling areas',
        'Offer bonus challenges for quick learners'
      ],
      successPrediction: 85
    },
    {
      id: 'path-reading-adventure',
      title: 'Reading Adventure Path',
      description: 'Build strong reading skills through exciting stories',
      estimatedWeeks: 6,
      targetSkills: ['Reading Comprehension', 'Vocabulary', 'Critical Thinking'],
      difficulty: 'beginner',
      prerequisites: ['Basic letter recognition', 'Simple word reading'],
      milestones: [
        {
          id: 'milestone-r1',
          title: 'Story Explorer',
          description: 'Read and understand simple stories',
          week: 2,
          skills: ['Reading Comprehension'],
          activities: ['content-reading-1'],
          assessmentCriteria: ['Read 5 short stories', 'Answer comprehension questions']
        },
        {
          id: 'milestone-r2',
          title: 'Vocabulary Builder',
          description: 'Expand word knowledge',
          week: 4,
          skills: ['Vocabulary', 'Reading Comprehension'],
          activities: ['content-reading-2'],
          assessmentCriteria: ['Learn 50 new words', 'Use words in sentences']
        },
        {
          id: 'milestone-r3',
          title: 'Critical Reader',
          description: 'Analyze stories and make connections',
          week: 6,
          skills: ['Critical Thinking', 'Reading Comprehension'],
          activities: ['content-reading-3'],
          assessmentCriteria: ['Analyze character motivations', 'Predict story outcomes']
        }
      ],
      recommendedContent: ['content-reading-1', 'content-reading-2', 'content-reading-3'],
      adaptiveAdjustments: [
        'Adjust reading level based on progress',
        'Provide audio support if needed',
        'Encourage family reading time'
      ],
      successPrediction: 92
    }
  ];
};