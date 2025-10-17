/**
 * Analytics Dashboard for Play & Learn Spark Frontend
 * Comprehensive learning progress, skill development, engagement metrics, and parental insights
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Star, 
  Brain, 
  Heart, 
  Palette, 
  Calculator,
  BookOpen,
  Users,
  Award,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LearningSession {
  id: string;
  childId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  activitiesCompleted: number;
  skillsExercised: string[];
  engagementScore: number; // 0-100
  strugglingMoments: number;
  achievementsUnlocked: string[];
  deviceType: 'tablet' | 'computer' | 'phone';
}

export interface SkillProgress {
  skillName: string;
  category: 'mathematics' | 'reading' | 'motor' | 'social' | 'creativity';
  currentLevel: number; // 1-10
  previousLevel: number;
  progressThisWeek: number;
  progressThisMonth: number;
  activitiesPracticed: number;
  timeSpent: number; // in minutes
  masteryPercentage: number;
  lastPracticedAt: Date;
  strugglingAreas: string[];
  strengthAreas: string[];
}

export interface EngagementMetrics {
  averageSessionDuration: number;
  totalTimeSpent: number;
  sessionsThisWeek: number;
  activitiesCompleted: number;
  challengesAttempted: number;
  achievementsEarned: number;
  streakDays: number;
  favoriteActivities: string[];
  optimalLearningTimes: string[];
  attentionSpanTrend: number[]; // last 7 days
  frustrationIncidents: number;
  helpRequestsCount: number;
}

export interface ParentInsight {
  id: string;
  type: 'strength' | 'improvement' | 'recommendation' | 'milestone';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  relatedSkills: string[];
  timestamp: Date;
  isRead: boolean;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetSkills: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedWeeks: number;
  currentProgress: number; // 0-100
  milestones: GoalMilestone[];
  createdAt: Date;
  targetDate: Date;
  isActive: boolean;
}

export interface GoalMilestone {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  requiredActivities: string[];
  skillRequirements: Record<string, number>;
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  totalTimeSpent: number;
  activitiesCompleted: number;
  skillsImproved: string[];
  achievements: string[];
  challengeAreas: string[];
  averageEngagement: number;
  progressHighlights: string[];
  parentRecommendations: string[];
}

interface AnalyticsDashboardProps {
  childId: string;
  className?: string;
  showParentView?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  childId,
  className,
  showParentView = true,
  timeRange = '30d'
}) => {
  const [learningData, setLearningData] = useState<{
    sessions: LearningSession[];
    skillProgress: SkillProgress[];
    engagement: EngagementMetrics;
    insights: ParentInsight[];
    goals: LearningGoal[];
    weeklyReports: WeeklyReport[];
  } | null>(null);
  
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      
      // Mock data - replace with actual API calls
      const mockData = {
        sessions: generateMockSessions(childId, selectedTimeRange),
        skillProgress: generateMockSkillProgress(),
        engagement: generateMockEngagementMetrics(),
        insights: generateMockParentInsights(),
        goals: generateMockLearningGoals(),
        weeklyReports: generateMockWeeklyReports()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLearningData(mockData);
      setIsLoading(false);
    };

    loadAnalytics();
  }, [childId, selectedTimeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const exportReport = () => {
    // Implement export functionality
    console.log('Exporting analytics report...');
  };

  if (isLoading) {
    return <AnalyticsLoadingSkeleton className={className} />;
  }

  if (!learningData) {
    return (
      <div className={cn("flex items-center justify-center h-64", className)}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Unable to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learning Analytics</h1>
          <p className="text-muted-foreground">Track progress and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </Button>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Time Spent Learning"
          value={`${Math.floor(learningData.engagement.totalTimeSpent / 60)}h ${learningData.engagement.totalTimeSpent % 60}m`}
          change={+12}
          icon={Clock}
          color="blue"
        />
        <MetricCard
          title="Activities Completed"
          value={learningData.engagement.activitiesCompleted.toString()}
          change={+8}
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Skills Improved"
          value={learningData.skillProgress.filter(s => s.progressThisWeek > 0).length.toString()}
          change={+3}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Engagement Score"
          value={`${Math.round(learningData.engagement.averageSessionDuration)}%`}
          change={+5}
          icon={Heart}
          color="pink"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Progress</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="goals">Learning Goals</TabsTrigger>
          {showParentView && <TabsTrigger value="insights">Parent Insights</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewDashboard learningData={learningData} />
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <SkillsProgressDashboard skillProgress={learningData.skillProgress} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <EngagementDashboard 
            engagement={learningData.engagement} 
            sessions={learningData.sessions} 
          />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <LearningGoalsDashboard goals={learningData.goals} />
        </TabsContent>

        {showParentView && (
          <TabsContent value="insights" className="space-y-6">
            <ParentInsightsDashboard 
              insights={learningData.insights}
              weeklyReports={learningData.weeklyReports}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'pink';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    pink: 'text-pink-600 bg-pink-100'
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center mt-1">
              {change > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={cn(
                "text-sm font-medium",
                change > 0 ? "text-green-500" : "text-red-500"
              )}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          </div>
          <div className={cn("p-3 rounded-full", colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Overview Dashboard Component
interface OverviewDashboardProps {
  learningData: NonNullable<AnalyticsDashboardProps['children']>;
}

const OverviewDashboard: React.FC<{ learningData: any }> = ({ learningData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Learning Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningData.skillProgress.slice(0, 4).map((skill: SkillProgress) => (
              <div key={skill.skillName} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{skill.skillName}</span>
                  <span className="text-muted-foreground">{skill.currentLevel}/10</span>
                </div>
                <Progress value={skill.currentLevel * 10} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{skill.activitiesPracticed} activities</span>
                  <span>{Math.floor(skill.timeSpent / 60)}h {skill.timeSpent % 60}m</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {learningData.sessions
              .flatMap((session: LearningSession) => session.achievementsUnlocked)
              .slice(0, 5)
              .map((achievement: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-muted rounded">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{achievement}</p>
                    <p className="text-xs text-muted-foreground">Earned recently</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className="text-center">
                <div className="text-xs text-muted-foreground mb-2">{day}</div>
                <div className={cn(
                  "h-12 rounded flex items-center justify-center text-xs font-medium",
                  learningData.engagement.attentionSpanTrend[idx] > 50 
                    ? "bg-green-100 text-green-700"
                    : learningData.engagement.attentionSpanTrend[idx] > 20
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-500"
                )}>
                  {learningData.engagement.attentionSpanTrend[idx]}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Learning Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div>
              <div className="text-4xl font-bold text-primary">
                {learningData.engagement.streakDays}
              </div>
              <div className="text-sm text-muted-foreground">days in a row</div>
            </div>
            <div className="flex justify-center space-x-1">
              {[...Array(7)].map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-6 h-6 rounded-full",
                    idx < learningData.engagement.streakDays 
                      ? "bg-green-500" 
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Keep learning daily to maintain your streak!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Skills Progress Dashboard Component
interface SkillsProgressDashboardProps {
  skillProgress: SkillProgress[];
}

const SkillsProgressDashboard: React.FC<SkillsProgressDashboardProps> = ({ skillProgress }) => {
  const skillCategories = {
    mathematics: { icon: Calculator, color: 'blue' },
    reading: { icon: BookOpen, color: 'green' },
    motor: { icon: Activity, color: 'orange' },
    social: { icon: Users, color: 'purple' },
    creativity: { icon: Palette, color: 'pink' }
  };

  const groupedSkills = skillProgress.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillProgress[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedSkills).map(([category, skills]) => {
        const categoryInfo = skillCategories[category as keyof typeof skillCategories];
        const Icon = categoryInfo.icon;
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 capitalize">
                <Icon className="w-5 h-5" />
                {category} Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map(skill => (
                  <SkillProgressCard key={skill.skillName} skill={skill} />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Individual Skill Progress Card
interface SkillProgressCardProps {
  skill: SkillProgress;
}

const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ skill }) => {
  const progressChange = skill.currentLevel - skill.previousLevel;
  
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{skill.skillName}</h4>
        <div className="flex items-center gap-1">
          {progressChange > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : progressChange < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-500" />
          ) : null}
          <span className="text-sm font-medium">{skill.currentLevel}/10</span>
        </div>
      </div>
      
      <Progress value={skill.masteryPercentage} className="h-2" />
      
      <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
        <div>
          <div className="font-medium">This Week</div>
          <div>+{skill.progressThisWeek.toFixed(1)} points</div>
        </div>
        <div>
          <div className="font-medium">Time Spent</div>
          <div>{Math.floor(skill.timeSpent / 60)}h {skill.timeSpent % 60}m</div>
        </div>
      </div>
      
      {skill.strugglingAreas.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-orange-600">Areas for improvement:</div>
          <div className="flex flex-wrap gap-1">
            {skill.strugglingAreas.map(area => (
              <Badge key={area} variant="outline" className="text-xs">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {skill.strengthAreas.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-green-600">Strengths:</div>
          <div className="flex flex-wrap gap-1">
            {skill.strengthAreas.map(area => (
              <Badge key={area} variant="outline" className="text-xs bg-green-50">
                {area}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Engagement Dashboard Component
interface EngagementDashboardProps {
  engagement: EngagementMetrics;
  sessions: LearningSession[];
}

const EngagementDashboard: React.FC<EngagementDashboardProps> = ({ engagement, sessions }) => {
  const recentSessions = sessions.slice(0, 10);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Engagement Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Engagement Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{engagement.averageSessionDuration}</div>
              <div className="text-sm text-muted-foreground">Avg Session (min)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{engagement.sessionsThisWeek}</div>
              <div className="text-sm text-muted-foreground">Sessions This Week</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Attention Span</span>
              <span>{Math.round(engagement.averageSessionDuration * 0.8)} min</span>
            </div>
            <Progress value={Math.min(100, engagement.averageSessionDuration * 5)} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Help Requests</span>
              <span className={cn(
                engagement.helpRequestsCount > 5 ? "text-orange-600" : "text-green-600"
              )}>
                {engagement.helpRequestsCount}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {engagement.helpRequestsCount > 5 
                ? "Consider easier activities" 
                : "Good independent learning"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Favorite Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {engagement.favoriteActivities.map((activity, idx) => (
              <div key={activity} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded text-center text-sm font-medium text-primary">
                    {idx + 1}
                  </div>
                  <span className="text-sm">{activity}</span>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-3 h-3",
                        i < (5 - idx) ? "text-yellow-400 fill-current" : "text-gray-300"
                      )} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Learning Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Session Card Component
interface SessionCardProps {
  session: LearningSession;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const duration = Math.round(session.duration);
  const engagementColor = session.engagementScore >= 80 ? 'green' : 
                         session.engagementScore >= 60 ? 'yellow' : 'red';
  
  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-sm font-medium">
            {session.startTime.toLocaleDateString()} - {duration} min
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              engagementColor === 'green' && "bg-green-50 text-green-700",
              engagementColor === 'yellow' && "bg-yellow-50 text-yellow-700",
              engagementColor === 'red' && "bg-red-50 text-red-700"
            )}
          >
            {session.engagementScore}% engaged
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {session.activitiesCompleted} activities • {session.skillsExercised.join(', ')}
          {session.achievementsUnlocked.length > 0 && (
            <span className="text-yellow-600"> • {session.achievementsUnlocked.length} achievements</span>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
};

// Learning Goals Dashboard Component
interface LearningGoalsDashboardProps {
  goals: LearningGoal[];
}

const LearningGoalsDashboard: React.FC<LearningGoalsDashboardProps> = ({ goals }) => {
  const activeGoals = goals.filter(goal => goal.isActive);
  const completedGoals = goals.filter(goal => !goal.isActive);

  return (
    <div className="space-y-6">
      {/* Active Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Active Learning Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
            {activeGoals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active learning goals</p>
                <Button className="mt-2" size="sm">Set New Goal</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Completed Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedGoals.slice(0, 3).map(goal => (
                <GoalCard key={goal.id} goal={goal} isCompleted />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Goal Card Component
interface GoalCardProps {
  goal: LearningGoal;
  isCompleted?: boolean;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, isCompleted = false }) => {
  const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
  const totalMilestones = goal.milestones.length;
  
  return (
    <div className={cn("p-4 border rounded-lg", isCompleted && "opacity-75")}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium mb-1">{goal.title}</h4>
          <p className="text-sm text-muted-foreground">{goal.description}</p>
        </div>
        <Badge variant={isCompleted ? "default" : "outline"} className="ml-2">
          {isCompleted ? "Completed" : goal.difficulty}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(goal.currentProgress)}%</span>
        </div>
        <Progress value={goal.currentProgress} />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{completedMilestones}/{totalMilestones} milestones</span>
          <span>Target: {goal.targetDate.toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-1">
        {goal.targetSkills.map(skill => (
          <Badge key={skill} variant="outline" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// Parent Insights Dashboard Component
interface ParentInsightsDashboardProps {
  insights: ParentInsight[];
  weeklyReports: WeeklyReport[];
}

const ParentInsightsDashboard: React.FC<ParentInsightsDashboardProps> = ({ insights, weeklyReports }) => {
  const unreadInsights = insights.filter(insight => !insight.isRead);
  const latestReport = weeklyReports[0];

  return (
    <div className="space-y-6">
      {/* Latest Weekly Report */}
      {latestReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Weekly Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyReportCard report={latestReport} />
          </CardContent>
        </Card>
      )}

      {/* Parent Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Parent Insights
            {unreadInsights.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadInsights.length} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.slice(0, 5).map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Weekly Report Card Component
interface WeeklyReportCardProps {
  report: WeeklyReport;
}

const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({ report }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{Math.floor(report.totalTimeSpent / 60)}h</div>
          <div className="text-sm text-muted-foreground">Time Spent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{report.activitiesCompleted}</div>
          <div className="text-sm text-muted-foreground">Activities</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{report.skillsImproved.length}</div>
          <div className="text-sm text-muted-foreground">Skills Improved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{Math.round(report.averageEngagement)}%</div>
          <div className="text-sm text-muted-foreground">Engagement</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-2">Progress Highlights</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {report.progressHighlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-2">Recommendations</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {report.parentRecommendations.map((recommendation, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Insight Card Component
interface InsightCardProps {
  insight: ParentInsight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return CheckCircle;
      case 'improvement': return AlertCircle;
      case 'recommendation': return Target;
      case 'milestone': return Award;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'text-green-600';
      case 'improvement': return 'text-orange-600';
      case 'recommendation': return 'text-blue-600';
      case 'milestone': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const Icon = getInsightIcon(insight.type);

  return (
    <div className={cn(
      "p-3 border rounded-lg",
      !insight.isRead && "bg-blue-50 border-blue-200"
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5", getInsightColor(insight.type))} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{insight.title}</h4>
            <Badge variant="outline" className="text-xs capitalize">
              {insight.type}
            </Badge>
            {insight.priority === 'high' && (
              <Badge variant="destructive" className="text-xs">High</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{insight.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {insight.relatedSkills.map(skill => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {insight.timestamp.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const AnalyticsLoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Mock data generators
const generateMockSessions = (childId: string, timeRange: string): LearningSession[] => {
  const sessions: LearningSession[] = [];
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  
  for (let i = 0; i < days * 0.7; i++) {
    const startTime = new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000);
    const duration = 10 + Math.random() * 20;
    
    sessions.push({
      id: `session-${i}`,
      childId,
      startTime,
      endTime: new Date(startTime.getTime() + duration * 60000),
      duration,
      activitiesCompleted: Math.floor(1 + Math.random() * 5),
      skillsExercised: ['counting', 'colors', 'shapes'].slice(0, Math.floor(1 + Math.random() * 3)),
      engagementScore: 60 + Math.random() * 40,
      strugglingMoments: Math.floor(Math.random() * 3),
      achievementsUnlocked: Math.random() > 0.7 ? ['Quick Learner', 'Color Master'] : [],
      deviceType: ['tablet', 'computer', 'phone'][Math.floor(Math.random() * 3)] as any
    });
  }
  
  return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

const generateMockSkillProgress = (): SkillProgress[] => {
  const skills = [
    { name: 'Counting to 10', category: 'mathematics' },
    { name: 'Letter Recognition', category: 'reading' },
    { name: 'Fine Motor Control', category: 'motor' },
    { name: 'Sharing & Turn-taking', category: 'social' },
    { name: 'Color Mixing', category: 'creativity' },
    { name: 'Basic Addition', category: 'mathematics' },
    { name: 'Phonics', category: 'reading' },
    { name: 'Gross Motor Skills', category: 'motor' }
  ];

  return skills.map(skill => ({
    skillName: skill.name,
    category: skill.category as any,
    currentLevel: 4 + Math.random() * 4,
    previousLevel: 3 + Math.random() * 3,
    progressThisWeek: Math.random() * 2,
    progressThisMonth: Math.random() * 5,
    activitiesPracticed: Math.floor(3 + Math.random() * 10),
    timeSpent: Math.floor(30 + Math.random() * 120),
    masteryPercentage: 40 + Math.random() * 50,
    lastPracticedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    strugglingAreas: Math.random() > 0.6 ? ['attention span', 'complex patterns'] : [],
    strengthAreas: ['visual learning', 'memory retention'].slice(0, Math.floor(1 + Math.random() * 2))
  }));
};

const generateMockEngagementMetrics = (): EngagementMetrics => ({
  averageSessionDuration: 12 + Math.random() * 8,
  totalTimeSpent: Math.floor(300 + Math.random() * 500),
  sessionsThisWeek: Math.floor(4 + Math.random() * 7),
  activitiesCompleted: Math.floor(15 + Math.random() * 25),
  challengesAttempted: Math.floor(5 + Math.random() * 10),
  achievementsEarned: Math.floor(3 + Math.random() * 8),
  streakDays: Math.floor(1 + Math.random() * 7),
  favoriteActivities: ['Animal Safari', 'Color Rainbow', 'Counting Train', 'Shape Detective'],
  optimalLearningTimes: ['9:00 AM', '2:00 PM', '7:00 PM'],
  attentionSpanTrend: Array.from({ length: 7 }, () => Math.floor(40 + Math.random() * 60)),
  frustrationIncidents: Math.floor(Math.random() * 5),
  helpRequestsCount: Math.floor(1 + Math.random() * 8)
});

const generateMockParentInsights = (): ParentInsight[] => [
  {
    id: '1',
    type: 'strength',
    title: 'Excellent Visual Learning',
    description: 'Your child shows strong preference and success with visual activities',
    priority: 'medium',
    actionable: true,
    relatedSkills: ['colors', 'shapes', 'patterns'],
    timestamp: new Date(),
    isRead: false
  },
  {
    id: '2',
    type: 'recommendation',
    title: 'Increase Challenge Level',
    description: 'Based on recent performance, consider introducing more challenging activities',
    priority: 'high',
    actionable: true,
    relatedSkills: ['mathematics', 'problem-solving'],
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: false
  }
];

const generateMockLearningGoals = (): LearningGoal[] => [
  {
    id: '1',
    title: 'Master Counting to 20',
    description: 'Build strong number foundation by counting reliably to 20',
    targetSkills: ['counting', 'number recognition', 'one-to-one correspondence'],
    difficulty: 'medium',
    estimatedWeeks: 4,
    currentProgress: 65,
    milestones: [
      {
        id: 'm1',
        title: 'Count to 10',
        description: 'Reliably count objects to 10',
        isCompleted: true,
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        requiredActivities: ['counting-train'],
        skillRequirements: { counting: 5 }
      },
      {
        id: 'm2',
        title: 'Count to 15',
        description: 'Extend counting to 15',
        isCompleted: false,
        requiredActivities: ['number-garden'],
        skillRequirements: { counting: 7 }
      }
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    isActive: true
  }
];

const generateMockWeeklyReports = (): WeeklyReport[] => [
  {
    weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    weekEnd: new Date(),
    totalTimeSpent: 185,
    activitiesCompleted: 12,
    skillsImproved: ['counting', 'colors', 'shapes'],
    achievements: ['Color Master', 'Quick Learner'],
    challengeAreas: ['attention span'],
    averageEngagement: 78,
    progressHighlights: [
      'Improved counting accuracy by 25%',
      'Completed all color recognition activities',
      'Showed increased independence in problem-solving'
    ],
    parentRecommendations: [
      'Continue with current learning pace',
      'Introduce more challenging counting activities',
      'Consider shorter session times for better focus'
    ]
  }
];

export default AnalyticsDashboard;