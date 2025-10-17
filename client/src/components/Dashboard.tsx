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
      // Add more activities here...
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