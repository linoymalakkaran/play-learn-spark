import React from 'react';
import { Button } from '@/components/ui/button';
import { TutorialTrigger } from '@/components/tutorial/TutorialManager';

interface HelpButtonProps {
  variant?: 'floating' | 'inline';
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ 
  variant = 'floating',
  className = '' 
}) => {
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 left-6 z-40 ${className}`}>
        <TutorialTrigger type="help">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-gradient-to-r from-magic to-purple-600 hover:from-magic/90 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 help-button-pulse"
          >
            <span className="text-2xl">❓</span>
          </Button>
        </TutorialTrigger>
      </div>
    );
  }

  return (
    <TutorialTrigger type="help" className={className}>
      <Button
        variant="outline"
        size="sm"
        className="border-magic/30 hover:border-magic hover:bg-magic hover:text-white transition-all duration-300"
      >
        ❓ Help
      </Button>
    </TutorialTrigger>
  );
};