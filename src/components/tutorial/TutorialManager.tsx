import React, { useEffect } from 'react';
import { TutorialOverlay } from './TutorialOverlay';
import { useTutorial } from '@/hooks/useTutorial';
import { 
  mainOnboardingSteps, 
  activityTutorialSteps, 
  dashboardTutorialSteps,
  helpTutorialSteps,
  parentTutorialSteps 
} from './TutorialSteps';

interface TutorialManagerProps {
  currentPage: 'dashboard' | 'activity' | 'welcome';
  isFirstTimeUser?: boolean;
  showParentMode?: boolean;
}

export const TutorialManager: React.FC<TutorialManagerProps> = ({
  currentPage,
  isFirstTimeUser = false,
  showParentMode = false
}) => {
  const {
    isFirstTime,
    showTutorial,
    currentStep,
    startTutorial,
    completeTutorial,
    skipTutorial
  } = useTutorial();

  // Auto-start tutorials based on conditions
  useEffect(() => {
    // Start main onboarding for first-time users on dashboard
    if (isFirstTime && currentPage === 'dashboard' && isFirstTimeUser) {
      setTimeout(() => {
        startTutorial('main-onboarding', mainOnboardingSteps);
      }, 1000); // Small delay to let the page load
    }
  }, [isFirstTime, currentPage, isFirstTimeUser, startTutorial]);

  // Get current tutorial steps based on context
  const getCurrentSteps = () => {
    if (showParentMode) return parentTutorialSteps;
    
    switch (currentPage) {
      case 'dashboard':
        return isFirstTime ? mainOnboardingSteps : dashboardTutorialSteps;
      case 'activity':
        return activityTutorialSteps;
      case 'welcome':
        return helpTutorialSteps;
      default:
        return mainOnboardingSteps;
    }
  };

  const handleComplete = () => {
    const tutorialId = isFirstTime ? 'main-onboarding' : `${currentPage}-tutorial`;
    completeTutorial(tutorialId);
  };

  return (
    <TutorialOverlay
      steps={getCurrentSteps()}
      isVisible={showTutorial}
      onComplete={handleComplete}
      onSkip={skipTutorial}
      currentStep={currentStep}
    />
  );
};

// Tutorial trigger buttons for manual tutorial access
interface TutorialTriggerProps {
  type: 'help' | 'dashboard' | 'activity' | 'parent';
  children: React.ReactNode;
  className?: string;
}

export const TutorialTrigger: React.FC<TutorialTriggerProps> = ({
  type,
  children,
  className = ''
}) => {
  const { startTutorial } = useTutorial();

  const handleTrigger = () => {
    const stepMap = {
      help: helpTutorialSteps,
      dashboard: dashboardTutorialSteps,
      activity: activityTutorialSteps,
      parent: parentTutorialSteps
    };

    startTutorial(`manual-${type}`, stepMap[type]);
  };

  return (
    <div onClick={handleTrigger} className={`cursor-pointer ${className}`}>
      {children}
    </div>
  );
};