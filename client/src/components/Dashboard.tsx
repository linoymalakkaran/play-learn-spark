import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { HelpButton } from '@/components/common/HelpButton';
import { TutorialManager } from '@/components/tutorial/TutorialManager';
import { ActivityTransition } from '@/components/transitions/PageTransition';
import { useTutorial } from '@/hooks/useTutorial';
import { useNavigation } from '@/hooks/useNavigation';
import { useProgress } from '@/hooks/useProgress';
import { useContent } from '@/hooks/useContent';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useStudent, getRecommendedActivities, getDifficultyForGrade } from '@/hooks/useStudent';
import { useAccessibility, useAriaLive, useFocusManagement } from '@/hooks/useAccessibility';
import { useNavigationStore } from '@/stores/navigationStore';
import { Child, Activity } from '@/types/learning';
import { soundEffects } from '@/utils/sounds';
import { accessibilityService } from '@/services/AccessibilityService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useActivityPreloader } from '@/components/common/LazyLoadWrapper';
import { useRewardStore } from '../stores/rewardStore';
import { ActivityCompletionStatus } from './ActivityCompletionStatus';
import PerformanceMonitoringService from '@/services/PerformanceMonitoringService';

// Import new dashboard components
import DashboardHeader from './dashboard/DashboardHeader';
import ActivityTabs from './dashboard/ActivityTabs';
import ActivityGrid from './dashboard/ActivityGrid';
import ActivityRouter from './dashboard/ActivityRouter';

interface DashboardProps {
  child: Child;
  onProgressUpdate: (progress: any) => void;
  onReset?: () => void;
}

export const Dashboard = ({ child, onProgressUpdate, onReset }: DashboardProps) => {
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'english' | 'math' | 'science' | 'habits' | 'art' | 'social' | 'problem' | 'physical' | 'world' | 'languages'>('english');
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  
  // Student context
  const { student, clearStudent } = useStudent();
  
  // Performance monitoring and activity preloading
  const [performanceService] = useState(() => PerformanceMonitoringService.getInstance());
  const { preloadActivityOnHover } = useActivityPreloader();
  
  const { isFirstTime } = useTutorial();
  const { navigate: navNavigate } = useNavigation();
  const { updateActivityState, getActivityState, currentChild, saveProgress } = useProgress();
  const { isCreatorMode, getRecommendations } = useContent();
  const { getProfile, createProfile } = usePersonalization();
  const { 
    setAvailableActivities, 
    addRecentlyAccessed, 
    getRecommendedContent,
    setCurrentSection 
  } = useNavigationStore();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Reward system
  const { awardActivityCompletion } = useRewardStore();

  // Initialize personalization profile if needed
  useEffect(() => {
    if (child) {
      let profile = getProfile(child.id);
      if (!profile) {
        profile = createProfile(child);
      }
      
      // Set current section for navigation
      setCurrentSection('dashboard');
    }
  }, [child, getProfile, createProfile, setCurrentSection]);

  // Load/save progress when child changes
  useEffect(() => {
    if (child && currentChild?.name !== child.name) {
      saveProgress(child.name, { currentChild: child });
    }
  }, [child, currentChild, saveProgress]);

  // Accessibility hooks
  const { elementRef: dashboardRef, announce } = useAccessibility({
    announceOnMount: `Welcome to ${child?.name}'s dashboard`,
    navigationGroup: 'dashboard',
    ariaLabel: 'Learning Activities Dashboard'
  });
  
  const { announceSuccess, announceError, announceLoading } = useAriaLive();
  const { focusFirst } = useFocusManagement();

  // Initialize accessibility service
  useEffect(() => {
    accessibilityService.initialize();
  }, []);

  // Redirect authenticated users to their profile
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/profile');
    }
  }, [isAuthenticated, user, navigate]);

  // Announce tab changes
  useEffect(() => {
    if (activeTab !== 'all') {
      announce(`Switched to ${activeTab} activities`);
    }
  }, [activeTab, announce]);

  // Generate activities based on child's age and grade
  const generateActivities = (): Activity[] => {
    const difficulty = student?.grade ? getDifficultyForGrade(student.grade) : child.age - 2;
    
    // Base activities for all categories
    const baseActivities: Activity[] = [
      // English Activities
      {
        id: 'animal-safari',
        title: 'Animal Safari',
        description: 'Learn about different animals and their sounds in this exciting safari adventure!',
        category: 'english',
        subcategory: 'vocabulary',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 10,
        difficultyLevel: 1,
        icon: '🦁',
        backgroundColor: '#FFE4B5',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'alphabet-adventure',
        title: 'Alphabet Adventure',
        description: 'Explore letters and sounds in a magical alphabet journey!',
        category: 'english',
        subcategory: 'alphabet',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 15,
        difficultyLevel: 1,
        icon: '📝',
        backgroundColor: '#E6F3FF',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'story-time',
        title: 'Story Time',
        description: 'Listen to exciting stories and answer fun questions!',
        category: 'english',
        subcategory: 'reading',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 20,
        difficultyLevel: 2,
        icon: '📖',
        backgroundColor: '#F0E6FF',
        isLocked: false,
        isCompleted: false
      },

      // Math Activities
      {
        id: 'number-counting',
        title: 'Number Counting',
        description: 'Count objects and learn numbers from 1 to 10!',
        category: 'math',
        subcategory: 'counting',
        minAge: 3,
        maxAge: 5,
        estimatedDuration: 10,
        difficultyLevel: 1,
        icon: '🔢',
        backgroundColor: '#FFE6E6',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'shape-explorer',
        title: 'Shape Explorer',
        description: 'Discover circles, squares, triangles and more shapes!',
        category: 'math',
        subcategory: 'geometry',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 12,
        difficultyLevel: 1,
        icon: '🔺',
        backgroundColor: '#E6FFE6',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'addition-fun',
        title: 'Addition Fun',
        description: 'Learn to add numbers with colorful objects and animations!',
        category: 'math',
        subcategory: 'arithmetic',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 15,
        difficultyLevel: 2,
        icon: '➕',
        backgroundColor: '#FFFACD',
        isLocked: false,
        isCompleted: false
      },

      // Science Activities
      {
        id: 'nature-explorer',
        title: 'Nature Explorer',
        description: 'Discover plants, flowers, and trees in our beautiful world!',
        category: 'science',
        subcategory: 'biology',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 15,
        difficultyLevel: 1,
        icon: '🌱',
        backgroundColor: '#F0FFF0',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'weather-wonders',
        title: 'Weather Wonders',
        description: 'Learn about sun, rain, snow and different weather patterns!',
        category: 'science',
        subcategory: 'meteorology',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 12,
        difficultyLevel: 1,
        icon: '🌦️',
        backgroundColor: '#E0F6FF',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'space-adventure',
        title: 'Space Adventure',
        description: 'Blast off to explore planets, stars, and the solar system!',
        category: 'science',
        subcategory: 'astronomy',
        minAge: 5,
        maxAge: 6,
        estimatedDuration: 20,
        difficultyLevel: 2,
        icon: '🚀',
        backgroundColor: '#1a1a2e',
        isLocked: false,
        isCompleted: false
      },

      // Habits Activities
      {
        id: 'daily-routine',
        title: 'Daily Routine',
        description: 'Learn about morning, afternoon, and evening activities!',
        category: 'habits',
        subcategory: 'routine',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 10,
        difficultyLevel: 1,
        icon: '🌅',
        backgroundColor: '#FFF8DC',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'healthy-eating',
        title: 'Healthy Eating',
        description: 'Discover nutritious foods and build healthy eating habits!',
        category: 'habits',
        subcategory: 'nutrition',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 12,
        difficultyLevel: 1,
        icon: '🥕',
        backgroundColor: '#FFE4E1',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'hygiene-heroes',
        title: 'Hygiene Heroes',
        description: 'Learn about brushing teeth, washing hands, and staying clean!',
        category: 'habits',
        subcategory: 'hygiene',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 8,
        difficultyLevel: 1,
        icon: '🧼',
        backgroundColor: '#F0FFFF',
        isLocked: false,
        isCompleted: false
      },

      // Art Activities
      {
        id: 'color-mixing',
        title: 'Color Mixing',
        description: 'Mix colors to create beautiful new shades and patterns!',
        category: 'art',
        subcategory: 'painting',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 15,
        difficultyLevel: 1,
        icon: '🎨',
        backgroundColor: '#FFB6C1',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'drawing-fun',
        title: 'Drawing Fun',
        description: 'Learn to draw simple shapes, animals, and objects!',
        category: 'art',
        subcategory: 'drawing',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 20,
        difficultyLevel: 1,
        icon: '✏️',
        backgroundColor: '#FFEFD5',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'music-maker',
        title: 'Music Maker',
        description: 'Create music with virtual instruments and learn about sounds!',
        category: 'art',
        subcategory: 'music',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 12,
        difficultyLevel: 1,
        icon: '🎵',
        backgroundColor: '#E6E6FA',
        isLocked: false,
        isCompleted: false
      },

      // Social Activities
      {
        id: 'family-friends',
        title: 'Family & Friends',
        description: 'Learn about relationships, emotions, and social interactions!',
        category: 'social',
        subcategory: 'relationships',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 10,
        difficultyLevel: 1,
        icon: '👨‍👩‍👧‍👦',
        backgroundColor: '#FFEFD5',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'community-helpers',
        title: 'Community Helpers',
        description: 'Meet doctors, firefighters, teachers and other helpful people!',
        category: 'social',
        subcategory: 'community',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 15,
        difficultyLevel: 1,
        icon: '👮‍♂️',
        backgroundColor: '#F0E68C',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'sharing-caring',
        title: 'Sharing & Caring',
        description: 'Learn about kindness, sharing, and helping others!',
        category: 'social',
        subcategory: 'values',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 12,
        difficultyLevel: 1,
        icon: '💝',
        backgroundColor: '#FFB6C1',
        isLocked: false,
        isCompleted: false
      },

      // Problem Solving Activities
      {
        id: 'puzzle-master',
        title: 'Puzzle Master',
        description: 'Solve fun jigsaw puzzles and brain teasers!',
        category: 'problem',
        subcategory: 'puzzles',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 15,
        difficultyLevel: 2,
        icon: '🧩',
        backgroundColor: '#DDA0DD',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'pattern-detective',
        title: 'Pattern Detective',
        description: 'Find and complete patterns with colors, shapes, and objects!',
        category: 'problem',
        subcategory: 'patterns',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 12,
        difficultyLevel: 1,
        icon: '🔍',
        backgroundColor: '#98FB98',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'logic-games',
        title: 'Logic Games',
        description: 'Use thinking skills to solve logic puzzles and challenges!',
        category: 'problem',
        subcategory: 'logic',
        minAge: 5,
        maxAge: 6,
        estimatedDuration: 18,
        difficultyLevel: 2,
        icon: '🧠',
        backgroundColor: '#FFE4E1',
        isLocked: false,
        isCompleted: false
      },

      // Physical Activities
      {
        id: 'yoga-kids',
        title: 'Yoga for Kids',
        description: 'Learn simple yoga poses and breathing exercises!',
        category: 'physical',
        subcategory: 'exercise',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 10,
        difficultyLevel: 1,
        icon: '🧘‍♀️',
        backgroundColor: '#F0FFFF',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'dance-party',
        title: 'Dance Party',
        description: 'Move and groove with fun dance moves and music!',
        category: 'physical',
        subcategory: 'dance',
        minAge: 3,
        maxAge: 6,
        estimatedDuration: 8,
        difficultyLevel: 1,
        icon: '💃',
        backgroundColor: '#FFB6C1',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'sports-fun',
        title: 'Sports Fun',
        description: 'Learn about different sports and practice coordination!',
        category: 'physical',
        subcategory: 'sports',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 12,
        difficultyLevel: 1,
        icon: '⚽',
        backgroundColor: '#90EE90',
        isLocked: false,
        isCompleted: false
      },

      // World Activities
      {
        id: 'world-cultures',
        title: 'World Cultures',
        description: 'Explore different countries, cultures, and traditions!',
        category: 'world',
        subcategory: 'cultures',
        minAge: 5,
        maxAge: 6,
        estimatedDuration: 20,
        difficultyLevel: 2,
        icon: '🌍',
        backgroundColor: '#E0FFFF',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'geography-explorer',
        title: 'Geography Explorer',
        description: 'Learn about continents, oceans, and famous landmarks!',
        category: 'world',
        subcategory: 'geography',
        minAge: 5,
        maxAge: 6,
        estimatedDuration: 18,
        difficultyLevel: 2,
        icon: '🗺️',
        backgroundColor: '#F5DEB3',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'animal-habitats',
        title: 'Animal Habitats',
        description: 'Discover where different animals live around the world!',
        category: 'world',
        subcategory: 'nature',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 15,
        difficultyLevel: 1,
        icon: '🐾',
        backgroundColor: '#F0E68C',
        isLocked: false,
        isCompleted: false
      },

      // Languages Activities
      {
        id: 'malayalam-learning',
        title: 'Malayalam Learning',
        description: 'Learn Malayalam letters, words, and cultural stories!',
        category: 'languages',
        subcategory: 'malayalam',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 25,
        difficultyLevel: 2,
        icon: '🇮🇳',
        backgroundColor: '#E6FFE6',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'arabic-learning',
        title: 'Arabic Learning',
        description: 'Explore Arabic alphabet, words, and cultural traditions!',
        category: 'languages',
        subcategory: 'arabic',
        minAge: 4,
        maxAge: 6,
        estimatedDuration: 25,
        difficultyLevel: 2,
        icon: '🌙',
        backgroundColor: '#E6E6FA',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 'spanish-basics',
        title: 'Spanish Basics',
        description: 'Learn basic Spanish words and phrases through fun games!',
        category: 'languages',
        subcategory: 'spanish',
        minAge: 5,
        maxAge: 6,
        estimatedDuration: 20,
        difficultyLevel: 2,
        icon: '🇪🇸',
        backgroundColor: '#FFEFD5',
        isLocked: false,
        isCompleted: false
      },
    ];

    return baseActivities;
  };

  const activities = generateActivities();

  // Filter activities based on selected tab
  const getFilteredActivities = (category: string): Activity[] => {
    if (category === 'all') {
      return activities;
    }
    return activities.filter(activity => activity.category === category);
  };

  const filteredActivities = getFilteredActivities(activeTab);

  // Activity handlers
  const trackActivityStart = (activityId: string) => {
    updateActivityState(activityId, {
      status: 'in-progress',
      lastAccessed: Date.now()
    });
    
    // Update navigation store
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      addRecentlyAccessed({
        id: activity.id,
        title: activity.title,
        path: `/activity/${activity.id}`,
        category: activity.category,
        icon: activity.icon,
        lastAccessed: Date.now()
      });
    }
  };

  const handleActivityClick = (activityId: string) => {
    if (isLoadingActivity) return;
    
    // Handle special language learning activities with dedicated pages
    if (activityId === 'malayalam-learning') {
      soundEffects.playClick();
      window.location.href = 'http://localhost:8080/malayalam';
      return;
    }
    
    if (activityId === 'arabic-learning') {
      soundEffects.playClick();
      window.location.href = 'http://localhost:8080/arabic';
      return;
    }
    
    if (activityId === 'spanish-basics') {
      soundEffects.playClick();
      window.location.href = 'http://localhost:8080/spanish';
      return;
    }
    
    setIsLoadingActivity(true);
    announceLoading(`Loading ${activityId} activity`);
    
    try {
      trackActivityStart(activityId);
      soundEffects.playClick();
      setCurrentActivity(activityId);
    } catch (error) {
      console.error('Failed to start activity:', error);
      announceError('Failed to load activity');
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleActivityComplete = (activityId: string, score: number) => {
    const previousState = getActivityState(activityId);
    const isFirstTime = !previousState?.completed;
    const isNewCategory = !activities.some(a => 
      a.category === activities.find(act => act.id === activityId)?.category && 
      getActivityState(a.id)?.completed
    );

    updateActivityState(activityId, {
      status: 'completed',
      score: score,
      attempts: (previousState?.attempts || 0) + 1
    });

    // Award completion
    awardActivityCompletion(child.id, activityId, score, isFirstTime, isNewCategory);

    // Update child progress
    const updatedProgress = {
      ...child.progress,
      totalActivitiesCompleted: child.progress.totalActivitiesCompleted + 1,
      totalScore: child.progress.totalScore + score,
      averageScore: Math.round(((child.progress.totalScore + score) / (child.progress.totalActivitiesCompleted + 1)) * 100) / 100
    };

    onProgressUpdate(updatedProgress);
    
    // Play success sound and announce
    soundEffects.playSuccess();
    announceSuccess(`Great job! You completed ${activityId} with a score of ${score}%`);
    
    setCurrentActivity(null);
  };

  const getActivityProgress = (activityId: string): number => {
    const state = getActivityState(activityId);
    return state?.score || 0;
  };

  // If an activity is selected, render it
  if (currentActivity) {
    return (
      <ActivityRouter
        currentActivity={currentActivity}
        child={child}
        activities={activities}
        onActivityComplete={handleActivityComplete}
        onBack={() => setCurrentActivity(null)}
      />
    );
  }

  return (
    <div 
      ref={dashboardRef}
      className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft p-3 sm:p-4"
      role="main"
      aria-label="Learning Activities Dashboard"
      data-nav-group="dashboard"
    >
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header */}
        <DashboardHeader child={child} student={student} />

        {/* Activity Category Tabs */}
        <ActivityTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Activities Grid */}
        <ActivityGrid
          activities={filteredActivities}
          onActivityClick={handleActivityClick}
          onActivityPreload={preloadActivityOnHover}
          getActivityProgress={getActivityProgress}
          getActivityState={getActivityState}
        />

        {/* Loading indicator */}
        {isLoadingActivity && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <LoadingSpinner size="lg" message="Loading activity..." />
          </div>
        )}

        {/* Tutorial Manager */}
        {isFirstTime && (
          <TutorialManager currentPage="dashboard" />
        )}

        {/* Help Button */}
        <div className="fixed bottom-4 right-4 z-40">
          <HelpButton />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;