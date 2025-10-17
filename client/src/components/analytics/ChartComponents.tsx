/**
 * Chart Components for Analytics Dashboard
 * Kid-friendly interactive charts with colorful, animated visualizations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  PieChart, 
  LineChart,
  TrendingUp,
  Star,
  Target,
  Brain,
  Heart,
  Calendar,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartDataPoint, SkillProgress } from '@/types/analytics.types';

interface ChartComponentsProps {
  skillsData: SkillProgress[];
  attentionSpanTrend: number[];
  weeklyProgress: ChartDataPoint[];
  className?: string;
}

const SkillProgressChart: React.FC<{
  skills: SkillProgress[];
}> = ({ skills }) => {
  const skillColors = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 
    'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-orange-400'
  ];

  const skillEmojis: Record<string, string> = {
    'mathematics': '🔢',
    'reading': '📚',
    'motor': '🏃',
    'social': '👥',
    'creativity': '🎨'
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Brain className="h-6 w-6 text-blue-500" />
          My Super Skills! 🧠✨
        </CardTitle>
        <p className="text-sm text-gray-600">
          Look how your brain powers are growing! 🚀
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.slice(0, 6).map((skill, index) => (
            <div
              key={skill.skillName}
              className="p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {skillEmojis[skill.category] || '🌟'}
                  </span>
                  <span className="font-medium text-gray-800">
                    {skill.skillName}
                  </span>
                </div>
                <Badge 
                  className={cn(
                    "text-white font-bold",
                    skill.masteryPercentage >= 80 ? "bg-green-500" :
                    skill.masteryPercentage >= 60 ? "bg-yellow-500" :
                    "bg-orange-500"
                  )}
                >
                  Level {skill.currentLevel} 🏆
                </Badge>
              </div>
              
              {/* Animated Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Mastery Progress</span>
                  <span className="font-medium">{skill.masteryPercentage}% 🎯</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={skill.masteryPercentage} 
                    className="h-3 bg-gray-200"
                  />
                  {skill.masteryPercentage >= 100 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">MASTERED! 🏆</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress indicators */}
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-green-600 font-medium">
                  +{skill.progressThisWeek} this week! 📈
                </span>
                <span className="text-blue-600">
                  {skill.activitiesPracticed} activities 🎮
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AttentionSpanChart: React.FC<{
  trendData: number[];
}> = ({ trendData }) => {
  const maxValue = Math.max(...trendData);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <Card className="bg-gradient-to-br from-green-50 to-yellow-50 border-green-200 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="h-6 w-6 text-green-500" />
          Focus Power This Week! ⚡
        </CardTitle>
        <p className="text-sm text-gray-600">
          See how long you can focus each day! 🎯
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Bar Chart Visualization */}
          <div className="flex items-end justify-between h-32 bg-white rounded-lg p-4 border border-green-200">
            {trendData.map((value, index) => {
              const height = (value / maxValue) * 100;
              const isToday = index === trendData.length - 1;
              
              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="text-xs font-medium text-gray-600">
                    {value}m
                  </div>
                  <div
                    className={cn(
                      "w-8 rounded-t-lg transition-all duration-500 hover:scale-110",
                      isToday ? "bg-gradient-to-t from-yellow-400 to-orange-400 animate-pulse" :
                      value >= 20 ? "bg-gradient-to-t from-green-400 to-green-500" :
                      value >= 15 ? "bg-gradient-to-t from-yellow-400 to-yellow-500" :
                      "bg-gradient-to-t from-orange-400 to-red-400"
                    )}
                    style={{ height: `${height}%`, minHeight: '8px' }}
                  />
                  <div className="text-xs font-medium text-gray-700">
                    {days[index]}
                    {isToday && ' 🌟'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-white rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-600">
                {Math.max(...trendData)}m
              </div>
              <div className="text-xs text-gray-600">Best Day! 🏆</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-green-200">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(trendData.reduce((a, b) => a + b) / trendData.length)}m
              </div>
              <div className="text-xs text-gray-600">Average ⭐</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-green-200">
              <div className="text-lg font-bold text-purple-600">
                {trendData.reduce((a, b) => a + b)}m
              </div>
              <div className="text-xs text-gray-600">Total Time 🎯</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WeeklyProgressChart: React.FC<{
  progressData: ChartDataPoint[];
}> = ({ progressData }) => {
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(null);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-6 w-6 text-purple-500" />
          My Learning Journey! 🚀
        </CardTitle>
        <p className="text-sm text-gray-600">
          Watch your progress soar like a rocket! 🌟
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple Line Chart Visualization */}
          <div className="relative h-40 bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-end justify-between h-full">
              {progressData.map((point, index) => {
                const isSelected = selectedPoint?.date === point.date;
                const isLast = index === progressData.length - 1;
                
                return (
                  <div
                    key={point.date}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => setSelectedPoint(point)}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full transition-all duration-300 hover:scale-150",
                        isSelected ? "bg-purple-500 ring-4 ring-purple-200" :
                        isLast ? "bg-yellow-400 animate-bounce" :
                        "bg-purple-400 hover:bg-purple-500"
                      )}
                      style={{
                        marginBottom: `${(point.value / 100) * 80}px`
                      }}
                    />
                    <div className="text-xs text-gray-600 mt-2">
                      {new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Connection lines */}
            <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="0.5"
                points={progressData.map((point, index) => 
                  `${(index / (progressData.length - 1)) * 100},${100 - (point.value / 100) * 80}`
                ).join(' ')}
              />
            </svg>
          </div>

          {/* Selected Point Details */}
          {selectedPoint && (
            <div className="p-3 bg-white rounded-lg border border-purple-200 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📅</span>
                <span className="font-medium">
                  {new Date(selectedPoint.date).toLocaleDateString()}
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {selectedPoint.value}% Complete! 🎉
              </div>
              <div className="text-sm text-gray-600">
                {selectedPoint.label || 'Great progress today!'}
              </div>
            </div>
          )}

          {/* Achievement Badges */}
          <div className="flex justify-center gap-2">
            {progressData.some(p => p.value >= 90) && (
              <Badge className="bg-yellow-500 text-white animate-pulse">
                🏆 Almost Perfect!
              </Badge>
            )}
            {progressData.some(p => p.value === 100) && (
              <Badge className="bg-green-500 text-white animate-bounce">
                💯 Perfect Day!
              </Badge>
            )}
            {progressData.filter(p => p.value >= 80).length >= 3 && (
              <Badge className="bg-purple-500 text-white">
                🔥 On Fire!
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ChartComponents: React.FC<ChartComponentsProps> = ({
  skillsData,
  attentionSpanTrend,
  weeklyProgress,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          📊 My Amazing Charts! 📈
        </h3>
        <p className="text-gray-600">
          Cool graphs that show how awesome you're doing! 🌟
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillProgressChart skills={skillsData} />
        <AttentionSpanChart trendData={attentionSpanTrend} />
      </div>

      <WeeklyProgressChart progressData={weeklyProgress} />
    </div>
  );
};