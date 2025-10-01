import React from 'react';
import { Card } from '@/components/ui/card';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...', 
  progress = 0,
  showProgress = false 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Animated spinner */}
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-primary-soft animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
        </div>
        
        {/* Sparkle effects */}
        <div className="absolute -top-1 -right-1 text-yellow-400 animate-bounce">✨</div>
        <div className="absolute -bottom-1 -left-1 text-blue-400 animate-bounce delay-300">⭐</div>
      </div>
      
      {message && (
        <p className="text-lg font-['Comic_Neue'] font-bold text-primary animate-pulse">
          {message}
        </p>
      )}
      
      {showProgress && (
        <div className="w-48 bg-primary-soft rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      )}
      
      {showProgress && (
        <span className="text-sm font-['Comic_Neue'] text-muted-foreground">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

interface FullScreenLoadingProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  children?: React.ReactNode;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({ 
  message = 'Loading Play Learn Spark...', 
  progress = 0,
  showProgress = false,
  children 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-soft via-secondary-soft to-magic-soft flex items-center justify-center z-50">
      <Card className="p-8 text-center max-w-md mx-4 bounce-in">
        <div className="mb-6">
          <img src="/logo.svg" alt="Play Learn Spark" className="w-20 h-20 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-['Fredoka_One'] text-primary mb-2">
            Play Learn Spark
          </h1>
        </div>
        
        <LoadingSpinner 
          size="lg" 
          message={message} 
          progress={progress}
          showProgress={showProgress}
        />
        
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
        
        {/* Floating animation elements */}
        <div className="absolute top-4 left-4 text-2xl animate-bounce delay-100">🌟</div>
        <div className="absolute top-8 right-6 text-xl animate-bounce delay-500">🚀</div>
        <div className="absolute bottom-6 left-6 text-lg animate-bounce delay-700">📚</div>
        <div className="absolute bottom-4 right-4 text-xl animate-bounce delay-300">🎨</div>
      </Card>
    </div>
  );
};

// Success celebration component
export const CelebrationOverlay: React.FC<{ 
  isVisible: boolean; 
  onComplete: () => void;
  message?: string;
}> = ({ isVisible, onComplete, message = "Awesome!" }) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="text-center animate-in zoom-in-50 duration-500">
        <div className="text-8xl mb-4 celebrate animate-bounce">🎉</div>
        <h2 className="text-4xl font-['Fredoka_One'] text-white mb-4 animate-pulse">
          {message}
        </h2>
        <div className="flex justify-center space-x-4 text-4xl">
          <span className="animate-bounce delay-100">⭐</span>
          <span className="animate-bounce delay-300">🌟</span>
          <span className="animate-bounce delay-500">✨</span>
        </div>
        
        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};