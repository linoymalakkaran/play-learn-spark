/**
 * Mock Data Service for Static Mode
 * Provides fallback data when backend is not available
 */

export interface MockLearningData {
  activities: any[];
  progress: any;
  recommendations: any[];
  analytics: any;
  videos: any[];
}

// Mock data for when backend is not available
export const mockLearningData: MockLearningData = {
  activities: [
    {
      id: 'activity-1',
      title: 'Count the Animals',
      description: 'Learn counting with cute animals',
      type: 'counting',
      ageGroup: '3-5',
      difficulty: 'easy',
      estimatedTime: 10,
      skills: ['counting', 'numbers', 'animals'],
      thumbnail: '/placeholder.svg',
      completed: false
    },
    {
      id: 'activity-2',
      title: 'Color Rainbow',
      description: 'Explore colors and create beautiful rainbows',
      type: 'creativity',
      ageGroup: '3-5',
      difficulty: 'easy',
      estimatedTime: 15,
      skills: ['colors', 'creativity', 'art'],
      thumbnail: '/placeholder.svg',
      completed: true
    },
    {
      id: 'activity-3',
      title: 'Shape Detective',
      description: 'Find and identify different shapes',
      type: 'shapes',
      ageGroup: '4-6',
      difficulty: 'medium',
      estimatedTime: 12,
      skills: ['shapes', 'recognition', 'problem-solving'],
      thumbnail: '/placeholder.svg',
      completed: false
    }
  ],

  progress: {
    totalActivities: 15,
    completedActivities: 8,
    skillsLearned: 12,
    timeSpent: 240, // minutes
    currentStreak: 5,
    level: 3,
    points: 350,
    badges: [
      { id: 'first-activity', name: 'First Steps', description: 'Completed your first activity!' },
      { id: 'counting-master', name: 'Counting Master', description: 'Completed 5 counting activities' },
      { id: 'creative-artist', name: 'Creative Artist', description: 'Completed 3 art activities' }
    ],
    recentAchievements: [
      { id: 'badge-earned', type: 'badge', message: 'Earned Creative Artist badge!', timestamp: Date.now() - 3600000 },
      { id: 'level-up', type: 'level', message: 'Reached Level 3!', timestamp: Date.now() - 7200000 }
    ]
  },

  recommendations: [
    {
      id: 'rec-1',
      title: 'Pizza Fractions',
      description: 'Learn fractions by making pizza!',
      type: 'math',
      ageGroup: '5-7',
      difficulty: 'medium',
      reason: 'Great for learning math concepts',
      thumbnail: '/placeholder.svg',
      rating: 4.8
    },
    {
      id: 'rec-2',
      title: 'Weather Station',
      description: 'Explore weather patterns and seasons',
      type: 'science',
      ageGroup: '4-6',
      difficulty: 'medium',
      reason: 'Perfect for curious minds',
      thumbnail: '/placeholder.svg',
      rating: 4.6
    },
    {
      id: 'rec-3',
      title: 'Family Tree',
      description: 'Learn about family relationships',
      type: 'social',
      ageGroup: '3-5',
      difficulty: 'easy',
      reason: 'Builds social awareness',
      thumbnail: '/placeholder.svg',
      rating: 4.7
    }
  ],

  analytics: {
    dailyProgress: [
      { date: '2025-09-24', activities: 2, timeSpent: 25 },
      { date: '2025-09-25', activities: 3, timeSpent: 40 },
      { date: '2025-09-26', activities: 1, timeSpent: 15 },
      { date: '2025-09-27', activities: 4, timeSpent: 50 },
      { date: '2025-09-28', activities: 2, timeSpent: 30 },
      { date: '2025-09-29', activities: 3, timeSpent: 35 },
      { date: '2025-09-30', activities: 1, timeSpent: 12 }
    ],
    skillProgress: [
      { skill: 'Counting', level: 85, activities: 8 },
      { skill: 'Colors', level: 95, activities: 6 },
      { skill: 'Shapes', level: 70, activities: 5 },
      { skill: 'Letters', level: 60, activities: 4 },
      { skill: 'Problem Solving', level: 75, activities: 7 }
    ],
    weeklyEngagement: {
      totalTime: 207, // minutes
      averageSessionTime: 18,
      activeDays: 6,
      completionRate: 0.85
    },
    learningGoals: [
      { goal: 'Complete 10 counting activities', progress: 8, target: 10, dueDate: '2025-10-15' },
      { goal: 'Learn all basic shapes', progress: 7, target: 10, dueDate: '2025-10-30' },
      { goal: 'Spend 300 minutes learning', progress: 240, target: 300, dueDate: '2025-10-31' }
    ]
  },

  videos: [
    {
      id: 'video-1',
      title: 'Introduction to Numbers',
      description: 'Learn numbers 1-10 with fun songs',
      duration: 180, // seconds
      ageGroup: '3-5',
      category: 'math',
      thumbnail: '/placeholder.svg',
      watchTime: 120,
      completed: false,
      chapters: [
        { id: 'ch1', title: 'Numbers 1-5', startTime: 0 },
        { id: 'ch2', title: 'Numbers 6-10', startTime: 90 }
      ]
    },
    {
      id: 'video-2',
      title: 'Rainbow Colors Song',
      description: 'Sing along and learn all the colors',
      duration: 150,
      ageGroup: '3-5',
      category: 'creativity',
      thumbnail: '/placeholder.svg',
      watchTime: 150,
      completed: true,
      chapters: [
        { id: 'ch1', title: 'Primary Colors', startTime: 0 },
        { id: 'ch2', title: 'Rainbow Song', startTime: 75 }
      ]
    },
    {
      id: 'video-3',
      title: 'Animal Sounds Adventure',
      description: 'Discover different animals and their sounds',
      duration: 200,
      ageGroup: '2-4',
      category: 'nature',
      thumbnail: '/placeholder.svg',
      watchTime: 0,
      completed: false,
      chapters: [
        { id: 'ch1', title: 'Farm Animals', startTime: 0 },
        { id: 'ch2', title: 'Wild Animals', startTime: 100 }
      ]
    }
  ]
};

// Static mode service class
export class StaticModeService {
  private static instance: StaticModeService;

  static getInstance(): StaticModeService {
    if (!StaticModeService.instance) {
      StaticModeService.instance = new StaticModeService();
    }
    return StaticModeService.instance;
  }

  // Get all activities
  getActivities(filters?: any): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let activities = [...mockLearningData.activities];
        
        // Apply filters if provided
        if (filters?.type) {
          activities = activities.filter(a => a.type === filters.type);
        }
        if (filters?.ageGroup) {
          activities = activities.filter(a => a.ageGroup === filters.ageGroup);
        }
        if (filters?.difficulty) {
          activities = activities.filter(a => a.difficulty === filters.difficulty);
        }
        
        resolve(activities);
      }, 300); // Simulate network delay
    });
  }

  // Get user progress
  getProgress(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockLearningData.progress);
      }, 200);
    });
  }

  // Get recommendations
  getRecommendations(params?: any): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockLearningData.recommendations);
      }, 250);
    });
  }

  // Get analytics
  getAnalytics(timeframe?: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockLearningData.analytics);
      }, 300);
    });
  }

  // Get videos
  getVideos(category?: string): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let videos = [...mockLearningData.videos];
        
        if (category) {
          videos = videos.filter(v => v.category === category);
        }
        
        resolve(videos);
      }, 200);
    });
  }

  // Update activity completion
  completeActivity(activityId: string): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const activity = mockLearningData.activities.find(a => a.id === activityId);
        if (activity) {
          activity.completed = true;
          mockLearningData.progress.completedActivities += 1;
          mockLearningData.progress.points += 25;
        }
        resolve({ success: true, activity });
      }, 100);
    });
  }

  // Update video progress
  updateVideoProgress(videoId: string, watchTime: number): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const video = mockLearningData.videos.find(v => v.id === videoId);
        if (video) {
          video.watchTime = watchTime;
          video.completed = watchTime >= video.duration * 0.9; // 90% completion
        }
        resolve({ success: true, video });
      }, 100);
    });
  }

  // Search content
  searchContent(query: string): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const searchTerm = query.toLowerCase();
        const results = [
          ...mockLearningData.activities.filter(a => 
            a.title.toLowerCase().includes(searchTerm) || 
            a.description.toLowerCase().includes(searchTerm) ||
            a.skills.some(s => s.toLowerCase().includes(searchTerm))
          ),
          ...mockLearningData.videos.filter(v => 
            v.title.toLowerCase().includes(searchTerm) || 
            v.description.toLowerCase().includes(searchTerm)
          )
        ];
        resolve(results);
      }, 200);
    });
  }

  // Generate static notification
  getNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notifications = [
          {
            id: 'notif-1',
            type: 'achievement',
            title: 'Great Progress!',
            message: "You've completed 8 activities this week!",
            timestamp: Date.now() - 1800000, // 30 minutes ago
            read: false
          },
          {
            id: 'notif-2',
            type: 'reminder',
            title: 'Learning Time',
            message: 'Ready for your daily learning adventure?',
            timestamp: Date.now() - 3600000, // 1 hour ago
            read: true
          }
        ];
        resolve(notifications);
      }, 150);
    });
  }
}

export const staticModeService = StaticModeService.getInstance();