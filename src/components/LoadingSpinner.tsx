import React from 'react';
import { Loader2, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'educational' | 'simple';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  message,
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerSizes = {
    sm: 'gap-2 text-sm',
    md: 'gap-3 text-base',
    lg: 'gap-4 text-lg'
  };

  if (variant === 'educational') {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center',
        containerSizes[size],
        className
      )}>
        <div className="relative">
          <BookOpen className={cn(sizeClasses[size], 'text-blue-500 animate-pulse')} />
          <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
        </div>
        {message && (
          <p className="text-gray-600 font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'simple') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <Loader2 className={cn(sizeClasses[size], 'animate-spin text-blue-600')} />
        {message && <span className="text-gray-600">{message}</span>}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      containerSizes[size],
      className
    )}>
      <div className="relative">
        <div className={cn(
          'rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin',
          size === 'sm' ? 'w-8 h-8 border-2' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16 border-4'
        )} />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 animate-pulse" />
      </div>
      {message && (
        <p className="text-gray-600 font-medium mt-2 animate-pulse text-center">
          {message}
        </p>
      )}
    </div>
  );
};

// Full-screen loading component
interface FullScreenLoadingProps {
  message?: string;
  variant?: 'default' | 'educational';
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  message = "Loading your learning adventure...",
  variant = 'educational'
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center z-50">
      <div className="text-center p-8">
        <LoadingSpinner 
          size="lg" 
          variant={variant}
          message={message}
          className="mb-4"
        />
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

// Page loading component
interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = "Preparing your lesson..."
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <LoadingSpinner 
        size="lg" 
        variant="educational"
        message={message}
      />
    </div>
  );
};

export default LoadingSpinner;