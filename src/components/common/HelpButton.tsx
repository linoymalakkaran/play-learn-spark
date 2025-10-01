import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface HelpButtonProps {
  variant?: 'floating' | 'inline';
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ 
  variant = 'floating',
  className = '' 
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const HelpContent = () => (
    <Dialog open={showHelp} onOpenChange={setShowHelp}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">❓</span>
            Help & Tips
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 text-left">
              <div>
                <h4 className="font-semibold text-blue-600 mb-2">🎯 How to Use Play Learn Spark</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Click on activity cards to start learning</li>
                  <li>• Use the category tabs to find specific subjects</li>
                  <li>• Your progress is saved automatically</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-600 mb-2">🎵 Sound Feedback</h4>
                <p className="text-sm text-gray-600">
                  Happy sounds mean you're doing great! Gentle sounds mean try again.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-purple-600 mb-2">🌈 Visual Clues</h4>
                <p className="text-sm text-gray-600">
                  Look for animations and colors. Green usually means correct!
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-orange-600 mb-2">🏆 Your Progress</h4>
                <p className="text-sm text-gray-600">
                  Complete activities to unlock new challenges and earn achievements!
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  if (variant === 'floating') {
    return (
      <>
        <div className={`fixed bottom-6 left-6 z-40 ${className}`}>
          <Button
            onClick={() => setShowHelp(true)}
            size="lg"
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
          >
            <span className="text-2xl">❓</span>
          </Button>
        </div>
        <HelpContent />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowHelp(true)}
        variant="outline"
        size="sm"
        className={`border-blue-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 ${className}`}
      >
        ❓ Help
      </Button>
      <HelpContent />
    </>
  );
};