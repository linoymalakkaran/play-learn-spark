import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { soundEffects } from '@/utils/sounds';
import './tutorial.css';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'wait';
  duration?: number;
  illustration?: string;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  currentStep?: number;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  steps,
  isVisible,
  onComplete,
  onSkip,
  currentStep = 0
}) => {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentTutorialStep = steps[activeStep];

  useEffect(() => {
    if (isVisible && activeStep === 0) {
      soundEffects.playMagic();
    }
  }, [isVisible, activeStep]);

  const handleNext = async () => {
    setIsAnimating(true);
    await soundEffects.playClick();
    
    setTimeout(() => {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
      } else {
        onComplete();
      }
      setIsAnimating(false);
    }, 200);
  };

  const handlePrevious = async () => {
    if (activeStep > 0) {
      await soundEffects.playClick();
      setActiveStep(activeStep - 1);
    }
  };

  const handleSkip = async () => {
    await soundEffects.playPop();
    onSkip();
  };

  if (!isVisible || !currentTutorialStep) return null;

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Spotlight effect for target element */}
      {currentTutorialStep.targetElement && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute bg-white/20 rounded-xl animate-pulse"
            style={{
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            }}
          />
        </div>
      )}

      {/* Tutorial Card */}
      <div className={`
        absolute transform transition-all duration-300 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
        ${currentTutorialStep.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
        ${currentTutorialStep.position === 'top' ? 'top-4 left-1/2 -translate-x-1/2' : ''}
        ${currentTutorialStep.position === 'bottom' ? 'bottom-4 left-1/2 -translate-x-1/2' : ''}
        ${currentTutorialStep.position === 'left' ? 'left-4 top-1/2 -translate-y-1/2' : ''}
        ${currentTutorialStep.position === 'right' ? 'right-4 top-1/2 -translate-y-1/2' : ''}
      `}>
        <Card className="p-6 max-w-md mx-4 bg-gradient-to-br from-white via-blue-50 to-purple-50 border-2 border-primary/20 shadow-2xl">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-['Comic_Neue'] text-muted-foreground">
                Step {activeStep + 1} of {steps.length}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSkip}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Skip Tutorial
              </Button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-magic h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Illustration */}
          {currentTutorialStep.illustration && (
            <div className="text-center text-6xl mb-4 animate-bounce">
              {currentTutorialStep.illustration}
            </div>
          )}

          {/* Content */}
          <div className="text-center">
            <h3 className="text-xl font-['Fredoka_One'] text-primary mb-3">
              {currentTutorialStep.title}
            </h3>
            <p className="text-sm font-['Comic_Neue'] text-foreground mb-6 leading-relaxed">
              {currentTutorialStep.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={activeStep === 0}
              className="font-['Comic_Neue'] font-bold"
            >
              ← Previous
            </Button>

            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeStep ? 'bg-primary' : 
                    index < activeStep ? 'bg-success' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="font-['Comic_Neue'] font-bold bg-gradient-to-r from-primary to-magic hover:from-primary/90 hover:to-magic/90"
            >
              {activeStep === steps.length - 1 ? 'Finish! 🎉' : 'Next →'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Tooltip component for inline help
interface TutorialTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isVisible: boolean;
  targetRef: React.RefObject<HTMLElement>;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  content,
  position = 'top',
  isVisible,
  targetRef
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top + scrollTop - 60;
          left = rect.left + scrollLeft + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + scrollTop + 10;
          left = rect.left + scrollLeft + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollTop + rect.height / 2;
          left = rect.left + scrollLeft - 200;
          break;
        case 'right':
          top = rect.top + scrollTop + rect.height / 2;
          left = rect.right + scrollLeft + 10;
          break;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position, targetRef]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-40 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs transform -translate-x-1/2 animate-fade-in"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
      }}
    >
      {content}
      <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
        position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
        position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
        position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
        'left-[-4px] top-1/2 -translate-y-1/2'
      }`} />
    </div>
  );
};