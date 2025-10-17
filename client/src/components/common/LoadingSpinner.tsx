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

  // Fun loading messages that rotate
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  const funMessages = [
    '🚀 Getting ready for adventure...',
    '✨ Preparing magical learning...',
    '🎯 Loading awesome activities...',
    '🌟 Almost there, superstar...',
    '🎨 Creating colorful fun...',
    '📚 Opening books of knowledge...',
    '🦁 Gathering animal friends...',
    '🌈 Painting rainbows...'
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % funMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const displayMessage = message === 'Loading...' ? funMessages[currentMessageIndex] : message;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Enhanced animated spinner with multiple rings */}
        <div className={`${sizeClasses[size]} relative`}>
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
          {/* Middle spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin"></div>
          {/* Inner ring */}
          <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-blue-400 border-l-green-400 animate-spin" style={{ animationDirection: 'reverse' }}></div>
          {/* Center dot */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse"></div>
        </div>
        
        {/* Enhanced sparkle effects */}
        <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce text-xl">✨</div>
        <div className="absolute -bottom-2 -left-2 text-blue-400 animate-bounce delay-300 text-lg">⭐</div>
        <div className="absolute -top-2 -left-2 text-green-400 animate-bounce delay-500 text-sm">💫</div>
        <div className="absolute -bottom-2 -right-2 text-pink-400 animate-bounce delay-700 text-base">🌟</div>
      </div>
      
      {displayMessage && (
        <div className="text-center space-y-2">
          <p className="text-lg font-['Comic_Neue'] font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
            {displayMessage}
          </p>
          {/* Fun loading dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      )}
      
      {showProgress && (
        <div className="w-48 bg-purple-100 rounded-full h-4 overflow-hidden border-2 border-purple-200">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-300 ease-out rounded-full relative overflow-hidden"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      )}
      
      {showProgress && (
        <span className="text-sm font-['Comic_Neue'] font-bold text-purple-600">
          {Math.round(progress)}% Complete! 🎯
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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center z-50 relative overflow-hidden">
      {/* Enhanced background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl opacity-30 animate-bounce">🌟</div>
        <div className="absolute top-20 right-20 text-5xl opacity-30 animate-pulse">🚀</div>
        <div className="absolute bottom-20 left-20 text-4xl opacity-30 animate-bounce delay-300">🎯</div>
        <div className="absolute bottom-10 right-10 text-5xl opacity-30 animate-pulse delay-500">✨</div>
        <div className="absolute top-1/2 left-1/4 text-3xl opacity-30 animate-bounce delay-700">🦁</div>
        <div className="absolute top-1/3 right-1/3 text-4xl opacity-30 animate-pulse delay-200">🌈</div>
        <div className="absolute top-3/4 left-1/3 text-3xl opacity-30 animate-bounce delay-400">📚</div>
        <div className="absolute top-1/4 left-3/4 text-4xl opacity-30 animate-pulse delay-600">🎨</div>
      </div>

      <Card className="p-8 text-center max-w-md mx-4 bounce-in bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl relative z-10">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
            <div className="text-3xl">🎓</div>
          </div>
          <h1 className="text-3xl font-['Fredoka_One'] bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Play Learn Spark
          </h1>
          <p className="text-purple-600 font-['Comic_Neue'] font-bold">
            Where Learning Becomes an Adventure! ✨
          </p>
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
        
        {/* Fun facts while loading */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-xl">
          <p className="text-sm font-['Comic_Neue'] font-bold text-purple-700">
            💡 Did you know? Learning is like building a castle - 
            each new thing you learn adds another awesome brick! 🏰
          </p>
        </div>
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