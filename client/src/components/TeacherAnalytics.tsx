import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Clock,
  Award,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  CheckCircle,
  AlertCircle,
  Star,
  Activity,
  BookOpen,
  Timer,
  Trophy,
  Zap
} from 'lucide-react';

interface Class {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  progress: {
    totalPoints: number;
    currentLevel: number;
    totalActivitiesCompleted: number;
    lastActiveDate: Date;
  };
  status: 'online' | 'offline' | 'away';
}

interface Assignment {
  _id: string;
  title: string;
  status: string;
  analytics: {
    enrolledCount: number;
    completedCount: number;
    averageScore: number;
  };
  schedule: {
    dueDate?: Date;
  };
}

interface TeacherAnalyticsProps {
  classData: Class;
  students: Student[];
  assignments: Assignment[];
}

export const TeacherAnalytics: React.FC<TeacherAnalyticsProps> = ({
  classData,
  students,
  assignments
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'performance' | 'progress'>('engagement');

  // Generate mock data for charts
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      students: Math.floor(Math.random() * 20) + 5,
      activitiesCompleted: Math.floor(Math.random() * 50) + 10,
      averageScore: Math.floor(Math.random() * 30) + 70,
      timeSpent: Math.floor(Math.random() * 60) + 30
    }));
  };

  const generateMonthlyData = () => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map(week => ({
      week,
      students: Math.floor(Math.random() * 25) + 15,
      activitiesCompleted: Math.floor(Math.random() * 200) + 100,
      averageScore: Math.floor(Math.random() * 20) + 75,
      timeSpent: Math.floor(Math.random() * 300) + 200
    }));
  };

  const generateAssignmentPerformance = () => {
    return assignments.slice(0, 5).map(assignment => ({
      name: assignment.title.substring(0, 15) + (assignment.title.length > 15 ? '...' : ''),
      completion: assignment.analytics.enrolledCount > 0 
        ? Math.round((assignment.analytics.completedCount / assignment.analytics.enrolledCount) * 100)
        : 0,
      averageScore: assignment.analytics.averageScore,
      enrolled: assignment.analytics.enrolledCount,
      completed: assignment.analytics.completedCount
    }));
  };

  const generateStudentDistribution = () => {
    const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return levels.map(level => ({
      level: `Level ${level}`,
      students: students.filter(s => s.progress.currentLevel === level).length,
      percentage: Math.round((students.filter(s => s.progress.currentLevel === level).length / students.length) * 100) || 0
    }));
  };

  const generateSkillsData = () => {
    const skills = ['Math', 'Reading', 'Science', 'Writing', 'Problem Solving'];
    return skills.map(skill => ({
      skill,
      mastery: Math.floor(Math.random() * 40) + 60,
      students: Math.floor(Math.random() * students.length * 0.8) + Math.floor(students.length * 0.2)
    }));
  };

  const generateEngagementData = () => {
    return [
      { name: 'Highly Engaged', value: Math.floor(students.length * 0.4), color: '#10B981' },
      { name: 'Moderately Engaged', value: Math.floor(students.length * 0.45), color: '#3B82F6' },
      { name: 'Low Engagement', value: Math.floor(students.length * 0.15), color: '#F59E0B' }
    ];
  };

  const weeklyData = generateWeeklyData();
  const monthlyData = generateMonthlyData();
  const assignmentPerformance = generateAssignmentPerformance();
  const studentDistribution = generateStudentDistribution();
  const skillsData = generateSkillsData();
  const engagementData = generateEngagementData();

  const chartData = timeRange === 'week' ? weeklyData : monthlyData;
  const xAxisKey = timeRange === 'week' ? 'day' : 'week';

  // Calculate key metrics
  const metrics = {
    totalStudents: students.length,
    activeStudents: students.filter(s => {
      const daysSinceActive = Math.floor(
        (new Date().getTime() - new Date(s.progress.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceActive <= 7;
    }).length,
    averageLevel: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.progress.currentLevel, 0) / students.length)
      : 0,
    totalActivities: students.reduce((sum, s) => sum + s.progress.totalActivitiesCompleted, 0),
    assignmentCompletion: assignments.length > 0
      ? Math.round(assignments.reduce((sum, a) => {
          return sum + (a.analytics.enrolledCount > 0 ? (a.analytics.completedCount / a.analytics.enrolledCount) * 100 : 0);
        }, 0) / assignments.length)
      : 0,
    averageScore: assignments.length > 0
      ? Math.round(assignments.reduce((sum, a) => sum + a.analytics.averageScore, 0) / assignments.length)
      : 0
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Class Analytics</h2>
          <p className="text-gray-600">Insights and performance metrics for {classData.name}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">Semester</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-2xl font-bold">{metrics.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active (7d)</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeStudents}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Level</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.averageLevel}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activities</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.totalActivities}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-teal-600">{metrics.assignmentCompletion}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-pink-600">{metrics.averageScore}%</p>
              </div>
              <Trophy className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Activity Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Student Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#3B82F6" name="Active Students" />
                    <Bar dataKey="activitiesCompleted" fill="#10B981" name="Activities Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Assignment Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Assignment Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assignmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completion" fill="#8B5CF6" name="Completion %" />
                    <Bar dataKey="averageScore" fill="#F59E0B" name="Average Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Level Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="students" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skills Mastery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills Mastery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="mastery" fill="#EF4444" name="Mastery %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Student Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Activity Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Activity Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2} name="Active Students" />
                    <Line type="monotone" dataKey="timeSpent" stroke="#10B981" strokeWidth={2} name="Time Spent (min)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {engagementData[0]?.value || 0}
                  </div>
                  <div className="text-sm text-green-700">Highly Engaged Students</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Active daily, completing assignments on time
                  </div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {engagementData[1]?.value || 0}
                  </div>
                  <div className="text-sm text-blue-700">Moderately Engaged</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Regular participation, some delays in submissions
                  </div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {engagementData[2]?.value || 0}
                  </div>
                  <div className="text-sm text-yellow-700">Need Attention</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Infrequent activity, may need support
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="averageScore" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Assignment Completion Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Assignment Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignmentPerformance.slice(0, 4).map((assignment, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{assignment.name}</span>
                        <span>{assignment.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${assignment.completion}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {assignment.completed}/{assignment.enrolled} students completed
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="activitiesCompleted" stroke="#10B981" strokeWidth={2} name="Activities Completed" />
                    <Line type="monotone" dataKey="averageScore" stroke="#3B82F6" strokeWidth={2} name="Average Score" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students
                    .sort((a, b) => b.progress.totalPoints - a.progress.totalPoints)
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">
                              {student.profile.firstName} {student.profile.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              Level {student.progress.currentLevel} • {student.progress.totalActivitiesCompleted} activities
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {student.progress.totalPoints}
                          </div>
                          <div className="text-xs text-gray-600">points</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export and Reporting */}
      <Card>
        <CardHeader>
          <CardTitle>Reports & Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Class Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Student Progress</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Performance Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Export All</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAnalytics;