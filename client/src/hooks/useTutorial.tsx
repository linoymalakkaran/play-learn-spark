import React, { createContext, useContext, useState, useEffect } from 'react';
import { TutorialStep } from '@/components/tutorial/TutorialOverlay';

interface TutorialContextType {
  isFirstTime: boolean;
  showTutorial: boolean;
  currentStep: number;
  completedTutorials: string[];
  startTutorial: (tutorialId: string, steps: TutorialStep[]) => void;
  completeTutorial: (tutorialId: string) => void;
  skipTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  setFirstTimeComplete: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

interface TutorialProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTutorialId, setCurrentTutorialId] = useState<string>('');
  const [currentSteps, setCurrentSteps] = useState<TutorialStep[]>([]);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  // Load tutorial state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('play-learn-spark-tutorial-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setIsFirstTime(state.isFirstTime ?? true);
        setCompletedTutorials(state.completedTutorials ?? []);
      } catch (error) {
        console.error('Error loading tutorial state:', error);
      }
    }
  }, []);

  // Save tutorial state to localStorage
  const saveTutorialState = (newState: Partial<{ isFirstTime: boolean; completedTutorials: string[] }>) => {
    const currentState = {
      isFirstTime,
      completedTutorials,
      ...newState
    };
    localStorage.setItem('play-learn-spark-tutorial-state', JSON.stringify(currentState));
  };

  const startTutorial = (tutorialId: string, steps: TutorialStep[]) => {
    // Don't show if already completed (unless it's a manual trigger)
    if (completedTutorials.includes(tutorialId) && isFirstTime) {
      return;
    }

    setCurrentTutorialId(tutorialId);
    setCurrentSteps(steps);
    setCurrentStep(0);
    setShowTutorial(true);
  };

  const completeTutorial = (tutorialId: string) => {
    const newCompletedTutorials = [...completedTutorials, tutorialId];
    setCompletedTutorials(newCompletedTutorials);
    setShowTutorial(false);
    setCurrentStep(0);
    
    // Mark as no longer first time if this was the main onboarding
    if (tutorialId === 'main-onboarding') {
      setIsFirstTime(false);
      saveTutorialState({ isFirstTime: false, completedTutorials: newCompletedTutorials });
    } else {
      saveTutorialState({ completedTutorials: newCompletedTutorials });
    }
  };

  const skipTutorial = () => {
    // Mark current tutorial as completed when skipped
    if (currentTutorialId) {
      completeTutorial(currentTutorialId);
    } else {
      setShowTutorial(false);
      setCurrentStep(0);
    }
  };

  const nextStep = () => {
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial(currentTutorialId);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const setFirstTimeComplete = () => {
    setIsFirstTime(false);
    saveTutorialState({ isFirstTime: false });
  };

  const value: TutorialContextType = {
    isFirstTime,
    showTutorial,
    currentStep,
    completedTutorials,
    startTutorial,
    completeTutorial,
    skipTutorial,
    nextStep,
    previousStep,
    setFirstTimeComplete
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};