import React from 'react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface ActivityCompletionStatusProps {
  activityId: string;
  completedActivities: string[];
  activityScores: Record<string, number>;
  bestScores?: Record<string, number>;
  attempts?: Record<string, number>;
}

export const ActivityCompletionStatus: React.FC<ActivityCompletionStatusProps> = ({
  activityId,
  completedActivities,
  activityScores,
  bestScores = {},
  attempts = {},
}) => {
  const isCompleted = completedActivities.includes(activityId);
  const currentScore = activityScores[activityId] || 0;
  const bestScore = bestScores[activityId] || currentScore;
  const attemptCount = attempts[activityId] || 0;

  if (!isCompleted) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-400">○</span>
        </div>
        <span className="text-xs text-gray-400 font-['Comic_Neue']">Not started</span>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score === 100) return '🏆';
    if (score >= 90) return '⭐';
    if (score >= 70) return '👍';
    if (score >= 50) return '😊';
    return '💪';
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Completion Status with Tick */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
        <span className="text-sm font-bold text-green-600 font-['Comic_Neue']">
          Completed!
        </span>
      </div>

      {/* Score Display */}
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={`font-['Comic_Neue'] font-bold ${getScoreColor(bestScore)}`}
        >
          {getScoreIcon(bestScore)} {bestScore}%
        </Badge>
        
        {bestScore === 100 && (
          <Badge 
            variant="outline" 
            className="font-['Comic_Neue'] font-bold text-yellow-600 bg-yellow-50 border-yellow-200"
          >
            Perfect!
          </Badge>
        )}
        
        {attemptCount > 1 && (
          <Badge 
            variant="outline" 
            className="font-['Comic_Neue'] text-xs text-gray-500 bg-gray-50 border-gray-200"
          >
            Try #{attemptCount}
          </Badge>
        )}
      </div>

      {/* Progress Bar for Score */}
      <div className="w-full">
        <Progress 
          value={bestScore} 
          className="h-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1 font-['Comic_Neue']">
          <span>0%</span>
          <span className="font-bold">Best: {bestScore}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Improvement Indicator */}
      {currentScore > 0 && currentScore !== bestScore && (
        <div className="text-xs text-blue-600 font-['Comic_Neue']">
          📈 Previous: {currentScore}% → Best: {bestScore}%
        </div>
      )}
    </div>
  );
};

export default ActivityCompletionStatus;