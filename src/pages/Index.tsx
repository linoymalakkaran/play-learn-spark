import { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Dashboard } from '@/components/Dashboard';
import { FullScreenLoading } from '@/components/common/LoadingSpinner';
import { HelpButton } from '@/components/common/HelpButton';
import { useTutorial } from '@/hooks/useTutorial';
import { Child } from '@/types/learning';
import { soundEffects } from '@/utils/sounds';

const Index = () => {
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Enhanced loading simulation with progress
  useEffect(() => {
    const loadApp = async () => {
      // Simulate app initialization steps
      const steps = [
        { message: 'Loading Play Learn Spark...', duration: 500 },
        { message: 'Initializing sound system...', duration: 300 },
        { message: 'Loading activities...', duration: 400 },
        { message: 'Checking saved progress...', duration: 300 },
        { message: 'Preparing your learning adventure...', duration: 200 }
      ];

      let totalProgress = 0;
      const stepProgress = 100 / steps.length;

      for (let i = 0; i < steps.length; i++) {
        setLoadingProgress(totalProgress);
        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
        totalProgress += stepProgress;
      }

      // Load saved child data
      const savedChild = localStorage.getItem('play-learn-spark-child');
      if (savedChild) {
        try {
          const child = JSON.parse(savedChild);
          setCurrentChild(child);
          await soundEffects.playSuccess();
        } catch (error) {
          console.error('Error loading saved child data:', error);
          localStorage.removeItem('play-learn-spark-child');
          await soundEffects.playError();
        }
      }

      setLoadingProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsLoading(false);
    };

    loadApp();
  }, []);

  // Handle child profile updates with enhanced feedback
  const handleChildUpdate = async (child: Child) => {
    setCurrentChild(child);
    localStorage.setItem('play-learn-spark-child', JSON.stringify(child));
    await soundEffects.playPop();
  };

  // Reset app with confirmation
  const handleReset = async () => {
    await soundEffects.playClick();
    localStorage.removeItem('play-learn-spark-child');
    setCurrentChild(null);
  };

  // Show loading screen during app initialization
  if (isLoading) {
    return (
      <FullScreenLoading 
        message="Loading your learning adventure..."
        progress={loadingProgress}
        showProgress={true}
      />
    );
  }

  // Show welcome screen if no child profile
  if (!currentChild) {
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
