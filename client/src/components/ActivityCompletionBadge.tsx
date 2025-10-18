import React from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityCompletionBadgeProps {
  isCompleted: boolean;
  pointsEarned?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showPoints?: boolean;
}

export const ActivityCompletionBadge: React.FC<ActivityCompletionBadgeProps> = ({
  isCompleted,
  pointsEarned = 50,
  className,
  size = 'md',
  showPoints = true,
}) => {
  if (!isCompleted) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base',
  };

  const containerClasses = {
    sm: 'px-1.5 py-0.5 gap-1',
    md: 'px-2 py-1 gap-1.5',
    lg: 'px-2.5 py-1.5 gap-2',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-green-100 text-green-800 font-medium',
        containerClasses[size],
        className
      )}
    >
      <CheckCircle2 className={sizeClasses[size]} />
      {showPoints && (
        <>
          <Star className={sizeClasses[size]} />
          <span>{pointsEarned}</span>
        </>
      )}
    </div>
  );
};