import { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Dashboard } from '@/components/Dashboard';
import { FullScreenLoading } from '@/components/common/LoadingSpinner';
import { HelpButton } from '@/components/common/HelpButton';
import { useTutorial } from '@/hooks/useTutorial';
import { useStudent } from '@/hooks/useStudent';
import { useAuth } from '@/hooks/useAuth';
import { Child } from '@/types/learning';
import { soundEffects } from '@/utils/sounds';

const Index = () => {
  const { student } = useStudent();
  const { user, isAuthenticated, isGuest } = useAuth();
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Enhanced loading simulation with progress
  useEffect(() => {
    const loadApp = async () => {
      console.log('🔄 Index page loading...', { 
        student, 
        user, 
        isAuthenticated, 
        isGuest 
      });

      let childData: Child | null = null;

      // Priority 1: Use authenticated user data (including guest)
      if (isAuthenticated && user) {
        childData = {
          id: user.id,
          name: user.profile?.firstName || user.username || 'Student',
          age: user.profile?.age || (user.profile?.grade ? Math.min(6, Math.max(3, parseInt(user.profile.grade) + 2)) : 5) as 3 | 4 | 5 | 6,
          progress: {
            totalActivitiesCompleted: user.progress?.totalActivitiesCompleted || 0,
            badges: [],
            currentStreak: user.progress?.streakDays || 0,
            englishLevel: 1,
            mathLevel: 1,
            totalScore: user.progress?.totalPoints || 0,
            averageScore: 0,
            lastActivityDate: new Date().toISOString()
          },
          preferences: {
            difficultyLevel: user.profile?.preferences?.difficulty === 'easy' ? 1 : 
                           user.profile?.preferences?.difficulty === 'medium' ? 2 : 3,
            learningStyle: 'visual',
            interests: user.profile?.preferences?.topics || []
          }
        };
      }
      // Priority 2: Fall back to student data if available
      else if (student) {
        childData = {
          id: '1',
          name: student.name,
          age: Math.min(6, Math.max(3, student.age || 5)) as 3 | 4 | 5 | 6,
          progress: {
            totalActivitiesCompleted: 0,
            badges: [],
            currentStreak: 0,
            englishLevel: 1,
            mathLevel: 1,
            totalScore: 0,
            averageScore: 0,
            lastActivityDate: new Date().toISOString()
          },
          preferences: {
            difficultyLevel: 2,
            learningStyle: 'visual',
            interests: []
          }
        };
      }

      if (childData) {
        setCurrentChild(childData);
        console.log('✅ Child data set:', childData);
      } else {
        console.log('⚠️ No child data available');
      }

      // Simulate quick loading
      setLoadingProgress(50);
      await new Promise(resolve => setTimeout(resolve, 200));
      setLoadingProgress(100);
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsLoading(false);
    };

    loadApp();
  }, [student, user, isAuthenticated, isGuest]);

  // Handle child profile updates with enhanced feedback
  const handleChildUpdate = async (child: Child) => {
    setCurrentChild(child);
    localStorage.setItem('play-learn-spark-child', JSON.stringify(child));
    if (soundEffects.playClick) {
      await soundEffects.playClick();
    }
  };

  // Reset app with confirmation
  const handleReset = async () => {
    if (soundEffects.playClick) {
      await soundEffects.playClick();
    }
    localStorage.removeItem('play-learn-spark-child');
    setCurrentChild(null);
  };

  // Show loading screen during app initialization
  if (isLoading) {
    return (
      <FullScreenLoading 
        message="Setting up your dashboard..."
        progress={loadingProgress}
        showProgress={true}
      />
    );
  }

  // Show welcome screen if no child profile (but we should have student by now)
  if (!currentChild && !student) {
    return <WelcomeScreen onChildSelected={handleChildUpdate} />;
  }

  // Show main dashboard with help
  return (
    <div className="relative">
      <Dashboard 
        child={currentChild} 
        onProgressUpdate={handleChildUpdate} 
        onReset={handleReset} 
      />
      
      {/* Floating help button */}
      <HelpButton variant="floating" />
    </div>
  );
};

export default Index;
