/**
 * Metrics Overview Component
 * Displays key performance indicators and learning metrics with kid-friendly design
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Star, 
  Brain, 
  Heart, 
  Trophy,
  Zap,
  Flame,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard, EngagementMetrics } from '@/types/analytics.types';

interface MetricsOverviewProps {
  metrics: EngagementMetrics;
  className?: string;
}

const getMetricIcon = (iconName: string) => {
  const icons = {
    clock: <Clock className="h-5 w-5" />,
    target: <Target className="h-5 w-5" />,
    star: <Star className="h-5 w-5" />,
    brain: <Brain className="h-5 w-5" />,
    heart: <Heart className="h-5 w-5" />,
    trophy: <Trophy className="h-5 w-5" />,
    zap: <Zap className="h-5 w-5" />,
    flame: <Flame className="h-5 w-5" />,
    check: <CheckCircle className="h-5 w-5" />
  };
  return icons[iconName as keyof typeof icons] || <Star className="h-5 w-5" />;
};

const MetricCardComponent: React.FC<{
  metric: MetricCard;
  isAnimated?: boolean;
}> = ({ metric, isAnimated = true }) => {
  const isPositive = metric.trend === 'up';
  const isNegative = metric.trend === 'down';

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105",
      isAnimated && "animate-bounce-in",
      metric.color
    )}>
      {/* Fun background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-2 text-6xl">✨</div>
        <div className="absolute bottom-2 left-2 text-4xl">🌟</div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={cn(
            "p-2 rounded-full",
            metric.color.includes('blue') && "bg-blue-100 text-blue-600",
            metric.color.includes('green') && "bg-green-100 text-green-600",
            metric.color.includes('purple') && "bg-purple-100 text-purple-600",
            metric.color.includes('orange') && "bg-orange-100 text-orange-600",
            metric.color.includes('pink') && "bg-pink-100 text-pink-600"
          )}>
            {getMetricIcon(metric.icon)}
          </div>
          
          {metric.trend !== 'neutral' && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive && "text-green-600",
              isNegative && "text-red-500"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(metric.change)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-gray-900">
            {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
          </p>
          <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const StreakDisplay: React.FC<{ streakDays: number }> = ({ streakDays }) => {
  const streakEmojis = ['🔥', '⚡', '🌟', '💫', '✨'];
  const getStreakEmoji = (days: number) => {
    if (days >= 30) return '👑';
    if (days >= 21) return '🏆';
    if (days >= 14) return '💎';
    if (days >= 7) return '🔥';
    return '⭐';
  };

  return (
    <Card className="bg-gradient-to-br from-orange-100 to-red-100 border-orange-200 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="text-center space-y-2">
          <div className="text-4xl animate-pulse">
            {getStreakEmoji(streakDays)}
          </div>
          <div className="text-2xl font-bold text-orange-800">
            {streakDays} Days
          </div>
          <div className="text-sm text-orange-600 font-medium">
            Learning Streak! 🎉
          </div>
          
          {/* Streak visualization */}
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: Math.min(streakDays, 7) }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FavoriteActivitiesDisplay: React.FC<{ 
  activities: string[];
}> = ({ activities }) => {
  const activityEmojis: Record<string, string> = {
    'Math Games': '🔢',
    'Reading Stories': '📚',
    'Art & Creativity': '🎨',
    'Science Experiments': '🔬',
    'Music & Songs': '🎵',
    'Puzzle Solving': '🧩',
    'Memory Games': '🧠',
    'Drawing': '✏️'
  };

  return (
    <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          Favorite Activities 💖
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.slice(0, 3).map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
            >
              <span className="text-2xl">
                {activityEmojis[activity] || '🌟'}
              </span>
              <span className="text-sm font-medium text-purple-800">
                {activity}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metrics,
  className
}) => {
  const keyMetrics: MetricCard[] = [
    {
      title: 'Learning Time Today',
      value: `${Math.round(metrics.averageSessionDuration)} min`,
      change: 15,
      trend: 'up',
      icon: 'clock',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Activities Completed',
      value: metrics.activitiesCompleted,
      change: 8,
      trend: 'up',
      icon: 'check',
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'Skills Practiced',
      value: metrics.sessionsThisWeek,
      change: 5,
      trend: 'up',
      icon: 'brain',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Achievements Earned',
      value: metrics.achievementsEarned,
      change: 12,
      trend: 'up',
      icon: 'trophy',
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🌟 Your Learning Journey! 🌟
        </h2>
        <p className="text-gray-600">
          Look how amazing you're doing! Keep up the fantastic work! 🎉
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <MetricCardComponent
            key={index}
            metric={metric}
            isAnimated={true}
          />
        ))}
      </div>

      {/* Special Displays Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StreakDisplay streakDays={metrics.streakDays} />
        <FavoriteActivitiesDisplay activities={metrics.favoriteActivities} />
      </div>

      {/* Weekly Progress Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-6 w-6 text-yellow-500" />
            This Week's Progress ⚡
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                {metrics.totalTimeSpent}m
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.challengesAttempted}
              </div>
              <div className="text-sm text-gray-600">Challenges</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.sessionsThisWeek}
              </div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">
                {metrics.helpRequestsCount}
              </div>
              <div className="text-sm text-gray-600">Help Asked</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Weekly Goal Progress</span>
              <span className="font-medium">
                {Math.round((metrics.totalTimeSpent / 300) * 100)}% 🎯
              </span>
            </div>
            <Progress 
              value={(metrics.totalTimeSpent / 300) * 100} 
              className="h-3 bg-gray-200"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};