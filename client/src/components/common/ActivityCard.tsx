import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigationStore } from '@/stores/navigationStore';
import { Activity } from '@/types/learning';
import { soundEffects } from '@/utils/sounds';
import { 
  Play, 
  Star, 
  Clock, 
  Target, 
  Lock, 
  CheckCircle, 
  Heart,
  MoreVertical 
} from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onLaunch: (activityId: string) => void;
  onFavorite?: (activity: Activity) => void;
  isLoading?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onLaunch,
  onFavorite,
  isLoading = false,
  showProgress = true,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const { toggleFavorite, isFavorite } = useNavigationStore();
  
  const handleLaunch = async () => {
    if (activity.isLocked || isLoading) return;
    
    await soundEffects.playClick();
    onLaunch(activity.id);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const navigationItem = {
      id: activity.id,
      title: activity.title,
      path: `/activity/${activity.id}`,
      category: activity.category,
      icon: activity.icon,
      lastAccessed: Date.now()
    };
    
    toggleFavorite(navigationItem);
    onFavorite?.(activity);
    soundEffects.playMagic();
  };

  const getProgressColor = () => {
    if (activity.isCompleted) return 'bg-green-500';
    if (activity.progress && activity.progress > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-32 text-xs';
      case 'lg':
        return 'h-48 text-base';
      default:
        return 'h-40 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'p-3';
      case 'detailed':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  return (
    <Card 
      className={`
        relative overflow-hidden cursor-pointer transition-all duration-300 group
        ${activity.isLocked ? 'opacity-60' : 'hover:shadow-lg hover:scale-105'}
        ${getSizeClasses()}
        ${className}
      `}
      onClick={handleLaunch}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${activity.backgroundColor || 'bg-gradient-to-br from-purple-100 to-pink-100'} opacity-50`} />
      
      {/* Lock Overlay */}
      {activity.isLocked && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
          <div className="bg-white/90 rounded-full p-3">
            <Lock className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      )}

      <CardContent className={`relative z-10 h-full flex flex-col ${getVariantClasses()}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">{activity.icon}</div>
            {activity.isCompleted && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
            >
              <Heart 
                className={`h-3 w-3 ${
                  isFavorite(activity.id) 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400'
                }`} 
              />
            </Button>
            
            {/* More Options */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 line-clamp-2 mb-1">
              {activity.title}
            </h3>
            
            {variant !== 'compact' && (
              <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                {activity.description}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="outline" className="text-xs">
                {activity.category}
              </Badge>
              
              {activity.subcategory && (
                <Badge variant="secondary" className="text-xs">
                  {activity.subcategory}
                </Badge>
              )}

              {variant === 'detailed' && (
                <>
                  <Badge variant="outline" className="text-xs flex items-center space-x-1">
                    <Clock className="h-2 w-2" />
                    <span>{activity.estimatedDuration}min</span>
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs flex items-center space-x-1">
                    <Target className="h-2 w-2" />
                    <span>Age {activity.minAge}-{activity.maxAge}</span>
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-2">
            {/* Progress Bar */}
            {showProgress && activity.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{Math.round(activity.progress)}%</span>
                </div>
                <Progress 
                  value={activity.progress} 
                  className="h-1"
                />
              </div>
            )}

            {/* Launch Button */}
            <Button
              size="sm"
              className={`
                w-full transition-all duration-300
                ${activity.isCompleted 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }
                ${isLoading ? 'animate-pulse' : ''}
              `}
              disabled={activity.isLocked || isLoading}
              onClick={(e) => {
                e.stopPropagation();
                handleLaunch();
              }}
            >
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : activity.isCompleted ? (
                  <Star className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
                <span className="text-xs font-bold">
                  {isLoading 
                    ? 'Loading...' 
                    : activity.isCompleted 
                      ? 'Play Again' 
                      : 'Start'
                  }
                </span>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;