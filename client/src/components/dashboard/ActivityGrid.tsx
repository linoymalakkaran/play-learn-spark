import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity } from '@/types/learning';

interface ActivityGridProps {
  activities: Activity[];
  onActivityClick: (activityId: string) => void;
  onActivityPreload?: (activityId: string) => void;
  getActivityProgress: (activityId: string) => number;
  getActivityState: (activityId: string) => any;
}

export const ActivityGrid: React.FC<ActivityGridProps> = ({ 
  activities, 
  onActivityClick, 
  onActivityPreload,
  getActivityProgress,
  getActivityState 
}) => {
  const formatActivityTitle = (title: string) => {
    return title.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {activities.map((activity) => {
        const progress = getActivityProgress(activity.id);
        const state = getActivityState(activity.id);
        const isCompleted = state?.completed || false;
        const score = state?.score || 0;
        
        return (
          <Card 
            key={activity.id}
            className={`
              group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer
              ${isCompleted 
                ? 'bg-gradient-to-br from-success/20 via-primary/10 to-magic/20 border-success/30' 
                : 'bg-gradient-to-br from-background via-primary/5 to-secondary/10 hover:bg-primary/10 border-primary/20'
              }
              hover:border-primary/40 hover:shadow-primary/20
            `}
            onClick={() => onActivityClick(activity.id)}
            onMouseEnter={() => onActivityPreload?.(activity.id)}
          >
            {/* Completion Badge */}
            {isCompleted && (
              <div className="absolute top-2 right-2 z-10">
                <Badge className="bg-success text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg">
                  ✓ {score}%
                </Badge>
              </div>
            )}

            {/* Difficulty Badge */}
            <div className="absolute top-2 left-2 z-10">
              <Badge 
                variant="outline" 
                className={`
                  font-bold text-xs px-2 py-1 rounded-full shadow-sm
                  ${activity.difficultyLevel <= 2 ? 'bg-green-100 text-green-800 border-green-200' :
                    activity.difficultyLevel <= 4 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                    'bg-red-100 text-red-800 border-red-200'}
                `}
              >
                {activity.difficultyLevel <= 2 ? 'EASY' : activity.difficultyLevel <= 4 ? 'MEDIUM' : 'HARD'}
              </Badge>
            </div>

            <div className="p-4 sm:p-6">
              {/* Activity Icon */}
              <div className="text-center mb-4">
                <div className="text-4xl sm:text-6xl mb-2 group-hover:animate-bounce">
                  {activity.icon}
                </div>
                <div className="h-1 bg-gradient-to-r from-primary via-magic to-success rounded-full opacity-30 group-hover:opacity-60 transition-opacity"></div>
              </div>

              {/* Activity Info */}
              <div className="text-center">
                <h3 className="font-['Comic_Neue'] font-bold text-sm sm:text-base text-foreground mb-2 group-hover:text-primary transition-colors">
                  {formatActivityTitle(activity.title)}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2">
                  {activity.description}
                </p>

                {/* Progress Bar */}
                {progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2 bg-muted"
                    />
                  </div>
                )}

                {/* Play Button */}
                <Button
                  className={`
                    w-full rounded-full font-['Comic_Neue'] font-bold text-xs sm:text-sm py-2 sm:py-3 transition-all transform group-hover:scale-105
                    ${isCompleted
                      ? 'bg-gradient-to-r from-success via-primary to-magic text-white shadow-lg'
                      : 'bg-gradient-to-r from-primary via-magic to-secondary text-white shadow-md hover:shadow-lg'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    onActivityClick(activity.id);
                  }}
                >
                  {isCompleted ? '🔄 Play Again' : '▶️ Start Adventure'}
                </Button>
              </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        );
      })}
    </div>
  );
};

export default ActivityGrid;