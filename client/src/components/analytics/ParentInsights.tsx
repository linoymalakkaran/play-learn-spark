/**
 * Parent Insights Component
 * Provides actionable insights and recommendations for parents with kid-friendly presentation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
  Star,
  Heart,
  Brain,
  Calendar,
  Clock,
  Award,
  Users,
  BookOpen,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParentInsight, LearningGoal, WeeklyReport } from '@/types/analytics.types';

interface ParentInsightsProps {
  insights: ParentInsight[];
  goals: LearningGoal[];
  weeklyReport: WeeklyReport;
  onMarkAsRead?: (insightId: string) => void;
  className?: string;
}

const getInsightIcon = (type: string) => {
  const icons = {
    strength: <Star className="h-5 w-5 text-yellow-500" />,
    improvement: <TrendingUp className="h-5 w-5 text-blue-500" />,
    recommendation: <Lightbulb className="h-5 w-5 text-purple-500" />,
    milestone: <Award className="h-5 w-5 text-green-500" />
  };
  return icons[type as keyof typeof icons] || <Star className="h-5 w-5" />;
};

const getPriorityColor = (priority: string) => {
  const colors = {
    high: 'bg-red-100 border-red-300 text-red-800',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    low: 'bg-green-100 border-green-300 text-green-800'
  };
  return colors[priority as keyof typeof colors] || colors.medium;
};

const InsightCard: React.FC<{
  insight: ParentInsight;
  onMarkAsRead?: (id: string) => void;
}> = ({ insight, onMarkAsRead }) => {
  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      !insight.isRead && "ring-2 ring-blue-200 bg-blue-50/50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getInsightIcon(insight.type)}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-gray-900 leading-tight">
                {insight.title}
              </h4>
              <Badge className={cn("text-xs", getPriorityColor(insight.priority))}>
                {insight.priority}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              {insight.description}
            </p>
            
            {insight.relatedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {insight.relatedSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-500">
                {insight.timestamp.toLocaleDateString()}
              </span>
              
              {!insight.isRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkAsRead?.(insight.id)}
                  className="text-xs h-auto p-1"
                >
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const GoalCard: React.FC<{
  goal: LearningGoal;
}> = ({ goal }) => {
  const daysLeft = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isCompleted = goal.isCompleted;

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      isCompleted && "bg-green-50 border-green-200",
      isOverdue && !isCompleted && "bg-red-50 border-red-200"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              {goal.title}
              {isCompleted && <span className="text-green-500">✅</span>}
            </h4>
            <Badge className={cn(
              "text-xs",
              isCompleted ? "bg-green-100 text-green-800" :
              isOverdue ? "bg-red-100 text-red-800" :
              daysLeft <= 7 ? "bg-yellow-100 text-yellow-800" :
              "bg-blue-100 text-blue-800"
            )}>
              {isCompleted ? 'Completed!' :
               isOverdue ? `${Math.abs(daysLeft)} days overdue` :
               `${daysLeft} days left`}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600">
            {goal.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progress</span>
              <span>{goal.currentProgress}%</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    isCompleted ? "bg-green-500" :
                    goal.currentProgress >= 75 ? "bg-blue-500" :
                    goal.currentProgress >= 50 ? "bg-yellow-500" :
                    "bg-orange-500"
                  )}
                  style={{ width: `${goal.currentProgress}%` }}
                />
              </div>
              {isCompleted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">🏆 ACHIEVED!</span>
                </div>
              )}
            </div>
          </div>
          
          {goal.targetSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {goal.targetSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
          
          {goal.rewards.length > 0 && (
            <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-xs font-medium text-yellow-800 mb-1">
                🎁 Rewards when completed:
              </div>
              <div className="text-xs text-yellow-700">
                {goal.rewards.join(', ')}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const WeeklyReportCard: React.FC<{
  report: WeeklyReport;
}> = ({ report }) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-6 w-6 text-blue-500" />
          Weekly Report 📊
        </CardTitle>
        <p className="text-sm text-gray-600">
          {report.weekStart.toLocaleDateString()} - {report.weekEnd.toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {report.totalLearningTime}m
            </div>
            <div className="text-sm text-gray-600">Learning Time ⏰</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-green-600">
              {report.challengesCompleted}
            </div>
            <div className="text-sm text-gray-600">Challenges 🎯</div>
          </div>
        </div>

        {/* Skills Improved */}
        {report.skillsImproved.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
              <Brain className="h-4 w-4 text-purple-500" />
              Skills Improved This Week 🧠
            </h4>
            <div className="flex flex-wrap gap-1">
              {report.skillsImproved.map((skill, index) => (
                <Badge key={index} className="bg-purple-100 text-purple-800">
                  {skill} ⭐
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* New Achievements */}
        {report.newAchievements.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
              <Award className="h-4 w-4 text-yellow-500" />
              New Achievements 🏆
            </h4>
            <div className="space-y-1">
              {report.newAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-500">🏆</span>
                  <span>{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Focus */}
        {report.recommendedFocus.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
              <Target className="h-4 w-4 text-orange-500" />
              Focus Areas for Next Week 🎯
            </h4>
            <div className="space-y-1">
              {report.recommendedFocus.map((focus, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-orange-500">🎯</span>
                  <span>{focus}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="font-medium">{report.overallProgress}% 🌟</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${report.overallProgress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ParentInsights: React.FC<ParentInsightsProps> = ({
  insights,
  goals,
  weeklyReport,
  onMarkAsRead,
  className
}) => {
  const [activeTab, setActiveTab] = useState('insights');
  const unreadInsights = insights.filter(insight => !insight.isRead);
  const completedGoals = goals.filter(goal => goal.isCompleted);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          📈 Learning Insights & Goals 🎯
        </h3>
        <p className="text-gray-600">
          Track progress, set goals, and get personalized recommendations! 🌟
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="insights" className="data-[state=active]:bg-white">
            💡 Insights {unreadInsights.length > 0 && (
              <Badge className="ml-1 bg-red-500 text-white text-xs">
                {unreadInsights.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-white">
            🎯 Goals ({goals.length})
          </TabsTrigger>
          <TabsTrigger value="report" className="data-[state=active]:bg-white">
            📊 Weekly Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card className="text-center p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h4 className="text-lg font-semibold mb-2">All caught up!</h4>
              <p className="text-gray-600">No new insights right now. Keep learning for more updates!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-sm text-gray-600">
              {completedGoals.length} of {goals.length} goals completed! Amazing work! 🎉
            </p>
          </div>
          
          {goals.length === 0 ? (
            <Card className="text-center p-8">
              <div className="text-6xl mb-4">🎯</div>
              <h4 className="text-lg font-semibold mb-2">Ready to set some goals?</h4>
              <p className="text-gray-600">Goals help track progress and celebrate achievements!</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="report">
          <WeeklyReportCard report={weeklyReport} />
        </TabsContent>
      </Tabs>
    </div>
  );
};