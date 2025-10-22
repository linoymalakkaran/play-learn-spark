import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar as CalendarIcon,
  Clock,
  Award,
  Star,
  Brain,
  BookOpen,
  Users,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  Zap,
  Trophy,
  Heart,
  ThumbsUp,
  Flag,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Grid,
  List
} from 'lucide-react';

interface ProgressTrackingProps {
  studentId?: string;
  classId?: string;
  userRole?: 'teacher' | 'parent' | 'student';
}

interface ProgressData {
  id: string;
  date: string;
  skillArea: string;
  skillLevel: number;
  activitiesCompleted: number;
  timeSpent: number;
  accuracy: number;
  engagement: number;
  milestone?: string;
}

interface SkillProgress {
  skill: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  progressPercentage: number;
  recentImprovement: number;
  activitiesCompleted: number;
  timeSpent: number;
  strengthAreas: string[];
  improvementAreas: string[];
  nextMilestone: string;
  estimatedTimeToGoal: number;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  isCompleted: boolean;
  milestones: {
    title: string;
    completed: boolean;
    completedDate?: Date;
  }[];
}

interface ActivityProgress {
  activityId: string;
  activityTitle: string;
  category: string;
  attempts: number;
  bestScore: number;
  averageScore: number;
  timeSpent: number;
  lastAttempt: Date;
  progressTrend: 'improving' | 'stable' | 'declining';
  masteryLevel: 'beginner' | 'developing' | 'proficient' | 'advanced';
}

const ProgressTracking: React.FC<ProgressTrackingProps> = ({
  studentId,
  classId,
  userRole = 'teacher'
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [selectedSkillArea, setSelectedSkillArea] = useState('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'goals'>('overview');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [activityProgress, setActivityProgress] = useState<ActivityProgress[]>([]);

  // Computed values
  const [overallProgress, setOverallProgress] = useState({
    totalSkills: 0,
    masteredSkills: 0,
    improvingSkills: 0,
    needsAttentionSkills: 0,
    overallGrowth: 0,
    weeklyGrowth: 0
  });

  // Load data
  useEffect(() => {
    loadProgressData();
  }, [selectedTimeRange, selectedSkillArea, studentId]);

  const loadProgressData = async () => {
    setIsLoading(true);
    try {
      // Mock progress data
      const mockProgressData: ProgressData[] = [
        {
          id: '1',
          date: '2024-01-15',
          skillArea: 'Reading Comprehension',
          skillLevel: 75,
          activitiesCompleted: 3,
          timeSpent: 45,
          accuracy: 82,
          engagement: 88
        },
        {
          id: '2',
          date: '2024-01-16',
          skillArea: 'Reading Comprehension',
          skillLevel: 78,
          activitiesCompleted: 2,
          timeSpent: 30,
          accuracy: 85,
          engagement: 90
        },
        {
          id: '3',
          date: '2024-01-17',
          skillArea: 'Math Operations',
          skillLevel: 68,
          activitiesCompleted: 4,
          timeSpent: 55,
          accuracy: 76,
          engagement: 85
        },
        {
          id: '4',
          date: '2024-01-18',
          skillArea: 'Math Operations',
          skillLevel: 72,
          activitiesCompleted: 3,
          timeSpent: 40,
          accuracy: 79,
          engagement: 87
        },
        {
          id: '5',
          date: '2024-01-19',
          skillArea: 'Science Concepts',
          skillLevel: 62,
          activitiesCompleted: 2,
          timeSpent: 35,
          accuracy: 73,
          engagement: 82,
          milestone: 'Basic Concepts Mastered'
        }
      ];

      // Mock skill progress
      const mockSkillProgress: SkillProgress[] = [
        {
          skill: 'Reading Comprehension',
          category: 'Language Arts',
          currentLevel: 78,
          targetLevel: 85,
          progressPercentage: 92,
          recentImprovement: 8,
          activitiesCompleted: 15,
          timeSpent: 180,
          strengthAreas: ['Main Idea Identification', 'Character Analysis'],
          improvementAreas: ['Inference Making', 'Vocabulary Context'],
          nextMilestone: 'Advanced Comprehension Skills',
          estimatedTimeToGoal: 2
        },
        {
          skill: 'Math Operations',
          category: 'Mathematics',
          currentLevel: 72,
          targetLevel: 80,
          progressPercentage: 90,
          recentImprovement: 12,
          activitiesCompleted: 18,
          timeSpent: 220,
          strengthAreas: ['Addition & Subtraction', 'Number Recognition'],
          improvementAreas: ['Word Problems', 'Multiplication Tables'],
          nextMilestone: 'Multi-step Problem Solving',
          estimatedTimeToGoal: 3
        },
        {
          skill: 'Science Concepts',
          category: 'Science',
          currentLevel: 62,
          targetLevel: 75,
          progressPercentage: 65,
          recentImprovement: 5,
          activitiesCompleted: 8,
          timeSpent: 95,
          strengthAreas: ['Basic Facts', 'Observation Skills'],
          improvementAreas: ['Scientific Method', 'Hypothesis Formation'],
          nextMilestone: 'Scientific Thinking Skills',
          estimatedTimeToGoal: 5
        },
        {
          skill: 'Creative Writing',
          category: 'Language Arts',
          currentLevel: 65,
          targetLevel: 70,
          progressPercentage: 86,
          recentImprovement: 3,
          activitiesCompleted: 6,
          timeSpent: 85,
          strengthAreas: ['Creativity', 'Story Structure'],
          improvementAreas: ['Grammar', 'Sentence Variety'],
          nextMilestone: 'Advanced Writing Techniques',
          estimatedTimeToGoal: 4
        }
      ];

      // Mock learning goals
      const mockLearningGoals: LearningGoal[] = [
        {
          id: '1',
          title: 'Master Reading Comprehension',
          description: 'Achieve proficiency in understanding and analyzing written texts',
          targetDate: new Date('2024-03-01'),
          progress: 85,
          isCompleted: false,
          milestones: [
            { title: 'Basic Reading Skills', completed: true, completedDate: new Date('2024-01-10') },
            { title: 'Main Idea Identification', completed: true, completedDate: new Date('2024-01-15') },
            { title: 'Character Analysis', completed: false },
            { title: 'Critical Thinking', completed: false }
          ]
        },
        {
          id: '2',
          title: 'Excel in Math Operations',
          description: 'Develop strong foundation in basic mathematical operations',
          targetDate: new Date('2024-02-15'),
          progress: 75,
          isCompleted: false,
          milestones: [
            { title: 'Number Recognition', completed: true, completedDate: new Date('2024-01-05') },
            { title: 'Addition & Subtraction', completed: true, completedDate: new Date('2024-01-12') },
            { title: 'Multiplication Basics', completed: false },
            { title: 'Word Problems', completed: false }
          ]
        }
      ];

      // Mock activity progress
      const mockActivityProgress: ActivityProgress[] = [
        {
          activityId: '1',
          activityTitle: 'Letter Detective Adventure',
          category: 'Reading',
          attempts: 5,
          bestScore: 92,
          averageScore: 87,
          timeSpent: 40,
          lastAttempt: new Date('2024-01-20'),
          progressTrend: 'improving',
          masteryLevel: 'proficient'
        },
        {
          activityId: '2',
          activityTitle: 'Number Safari Expedition',
          category: 'Math',
          attempts: 7,
          bestScore: 88,
          averageScore: 82,
          timeSpent: 84,
          lastAttempt: new Date('2024-01-19'),
          progressTrend: 'stable',
          masteryLevel: 'developing'
        },
        {
          activityId: '3',
          activityTitle: 'Science Lab Explorer',
          category: 'Science',
          attempts: 3,
          bestScore: 76,
          averageScore: 73,
          timeSpent: 45,
          lastAttempt: new Date('2024-01-18'),
          progressTrend: 'improving',
          masteryLevel: 'beginner'
        }
      ];

      setProgressData(mockProgressData);
      setSkillProgress(mockSkillProgress);
      setLearningGoals(mockLearningGoals);
      setActivityProgress(mockActivityProgress);

      // Calculate overall progress
      const totalSkills = mockSkillProgress.length;
      const masteredSkills = mockSkillProgress.filter(s => s.progressPercentage >= 90).length;
      const improvingSkills = mockSkillProgress.filter(s => s.recentImprovement > 0).length;
      const needsAttention = mockSkillProgress.filter(s => s.progressPercentage < 70).length;

      setOverallProgress({
        totalSkills,
        masteredSkills,
        improvingSkills,
        needsAttentionSkills: needsAttention,
        overallGrowth: 8.5,
        weeklyGrowth: 2.3
      });

    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'proficient': return 'bg-green-100 text-green-800';
      case 'developing': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading progress data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            Progress Tracking
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor learning progress and skill development over time
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="quarter">Past Quarter</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={selectedSkillArea} onValueChange={setSelectedSkillArea}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select skill area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skill Areas</SelectItem>
                <SelectItem value="reading">Reading & Language</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
                <SelectItem value="social">Social Studies</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                <Eye className="w-4 h-4 mr-1" />
                Overview
              </Button>
              <Button
                variant={viewMode === 'detailed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('detailed')}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Detailed
              </Button>
              <Button
                variant={viewMode === 'goals' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('goals')}
              >
                <Target className="w-4 h-4 mr-1" />
                Goals
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProgressMetricCard
          title="Total Skills"
          value={overallProgress.totalSkills.toString()}
          icon={<Brain className="w-6 h-6" />}
          color="blue"
        />
        <ProgressMetricCard
          title="Mastered Skills"
          value={overallProgress.masteredSkills.toString()}
          icon={<Trophy className="w-6 h-6" />}
          color="green"
          trend={`${overallProgress.masteredSkills}/${overallProgress.totalSkills}`}
        />
        <ProgressMetricCard
          title="Improving Skills"
          value={overallProgress.improvingSkills.toString()}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          trend={`+${overallProgress.overallGrowth}%`}
        />
        <ProgressMetricCard
          title="Weekly Growth"
          value={`${overallProgress.weeklyGrowth}%`}
          icon={<Zap className="w-6 h-6" />}
          color="orange"
          trend="This week"
        />
      </div>

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={setViewMode as any}>
        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5" />
                  Skill Progress Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="skillLevel" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Skill Level"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Accuracy"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skill Level Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Current vs Target Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillProgress}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Current Level"
                      dataKey="currentLevel"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Target Level"
                      dataKey="targetLevel"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.1}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Skill Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillProgress.map((skill) => (
              <SkillProgressCard key={skill.skill} skill={skill} />
            ))}
          </div>

          {/* Recent Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressData
                  .filter(p => p.milestone)
                  .map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Trophy className="w-6 h-6 text-green-600" />
                      <div>
                        <h4 className="font-medium">{achievement.milestone}</h4>
                        <p className="text-sm text-gray-600">
                          {achievement.skillArea} • {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed View */}
        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Progress Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="activitiesCompleted"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement & Time Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="timeSpent" fill="#8884d8" name="Time Spent (min)" />
                    <Bar dataKey="engagement" fill="#82ca9d" name="Engagement %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Activity Progress Table */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {activityProgress.map((activity) => (
                    <ActivityProgressCard key={activity.activityId} activity={activity} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals View */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningGoals.map((goal) => (
              <LearningGoalCard key={goal.id} goal={goal} />
            ))}
          </div>

          {/* Add New Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Set New Learning Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Goal title" />
                <Input placeholder="Target completion date" type="date" />
                <Input placeholder="Skill area" className="md:col-span-2" />
                <Button className="md:col-span-2">
                  <Target className="w-4 h-4 mr-2" />
                  Create Learning Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Progress Metric Card Component
interface ProgressMetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: string;
}

const ProgressMetricCard: React.FC<ProgressMetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  trend 
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-gray-500 mt-1">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Skill Progress Card Component
interface SkillProgressCardProps {
  skill: SkillProgress;
}

const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ skill }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">{skill.skill}</h3>
            <p className="text-sm text-gray-600">{skill.category}</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {skill.progressPercentage}% Complete
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Current: {skill.currentLevel}</span>
              <span>Target: {skill.targetLevel}</span>
            </div>
            <Progress value={skill.progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Activities:</span>
              <span className="ml-2 font-medium">{skill.activitiesCompleted}</span>
            </div>
            <div>
              <span className="text-gray-600">Time:</span>
              <span className="ml-2 font-medium">{Math.round(skill.timeSpent / 60)}h</span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium text-green-700">Strengths:</h4>
              <div className="flex flex-wrap gap-1">
                {skill.strengthAreas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-700">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-orange-700">Areas to Improve:</h4>
              <div className="flex flex-wrap gap-1">
                {skill.improvementAreas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="text-sm">
              <span className="text-gray-600">Next milestone:</span>
              <span className="ml-2 font-medium">{skill.nextMilestone}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Estimated {skill.estimatedTimeToGoal} weeks to reach goal
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Activity Progress Card Component
interface ActivityProgressCardProps {
  activity: ActivityProgress;
}

const ActivityProgressCard: React.FC<ActivityProgressCardProps> = ({ activity }) => {
  const getProgressTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'proficient': return 'bg-green-100 text-green-800';
      case 'developing': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium">{activity.activityTitle}</h4>
          <p className="text-sm text-gray-600">{activity.category}</p>
        </div>
        <div className="flex items-center gap-2">
          {getProgressTrendIcon(activity.progressTrend)}
          <Badge className={getMasteryColor(activity.masteryLevel)}>
            {activity.masteryLevel}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="font-semibold">{activity.attempts}</div>
          <div className="text-gray-600">Attempts</div>
        </div>
        <div>
          <div className="font-semibold">{activity.bestScore}%</div>
          <div className="text-gray-600">Best Score</div>
        </div>
        <div>
          <div className="font-semibold">{activity.averageScore}%</div>
          <div className="text-gray-600">Avg Score</div>
        </div>
        <div>
          <div className="font-semibold">{Math.round(activity.timeSpent)}m</div>
          <div className="text-gray-600">Time Spent</div>
        </div>
      </div>
    </div>
  );
};

// Learning Goal Card Component
interface LearningGoalCardProps {
  goal: LearningGoal;
}

const LearningGoalCard: React.FC<LearningGoalCardProps> = ({ goal }) => {
  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const totalMilestones = goal.milestones.length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">{goal.title}</h3>
            <p className="text-sm text-gray-600">{goal.description}</p>
          </div>
          {goal.isCompleted ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          ) : (
            <Badge variant="outline">
              {goal.progress}% Complete
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Milestones</span>
              <span>{completedMilestones}/{totalMilestones}</span>
            </div>
            <div className="space-y-2">
              {goal.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {milestone.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className={milestone.completed ? 'text-gray-900' : 'text-gray-500'}>
                    {milestone.title}
                  </span>
                  {milestone.completedDate && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {milestone.completedDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="w-4 h-4" />
              <span>Target: {goal.targetDate.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracking;