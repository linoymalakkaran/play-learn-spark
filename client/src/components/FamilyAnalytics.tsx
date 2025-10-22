import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Trophy, 
  Clock, 
  Target,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Award,
  Heart,
  Star
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FamilyAnalyticsProps {
  children: any[];
}

interface AnalyticsData {
  weeklyProgress: any[];
  activityDistribution: any[];
  childComparison: any[];
  timeSpent: any[];
  achievements: any[];
  subjects: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const FamilyAnalytics: React.FC<FamilyAnalyticsProps> = ({ children }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [selectedChild, setSelectedChild] = useState('all');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateAnalyticsData();
  }, [children, selectedPeriod, selectedChild]);

  const generateAnalyticsData = () => {
    if (!children.length) return;

    setIsLoading(true);

    // Generate sample data based on children
    const weeklyProgress = [
      { day: 'Mon', activities: 12, points: 450, timeSpent: 180 },
      { day: 'Tue', activities: 15, points: 520, timeSpent: 200 },
      { day: 'Wed', activities: 8, points: 380, timeSpent: 150 },
      { day: 'Thu', activities: 18, points: 600, timeSpent: 240 },
      { day: 'Fri', activities: 14, points: 480, timeSpent: 190 },
      { day: 'Sat', activities: 22, points: 720, timeSpent: 280 },
      { day: 'Sun', activities: 16, points: 550, timeSpent: 220 }
    ];

    const activityDistribution = [
      { subject: 'Math', count: 45, percentage: 30 },
      { subject: 'Reading', count: 38, percentage: 25 },
      { subject: 'Science', count: 32, percentage: 21 },
      { subject: 'Art', count: 20, percentage: 13 },
      { subject: 'Music', count: 15, percentage: 11 }
    ];

    const childComparison = children.map((child, index) => ({
      name: child.profile?.firstName || child.username,
      activities: Math.floor(Math.random() * 50) + 20,
      points: Math.floor(Math.random() * 1000) + 500,
      level: Math.floor(Math.random() * 10) + 1,
      streak: Math.floor(Math.random() * 30) + 1,
      badges: Math.floor(Math.random() * 15) + 5
    }));

    const timeSpent = [
      { hour: '9AM', minutes: 25 },
      { hour: '10AM', minutes: 45 },
      { hour: '11AM', minutes: 60 },
      { hour: '2PM', minutes: 55 },
      { hour: '3PM', minutes: 70 },
      { hour: '4PM', minutes: 50 },
      { hour: '5PM', minutes: 35 }
    ];

    const achievements = [
      { child: 'Emma', achievement: 'Math Master', date: '2024-10-20', points: 100 },
      { child: 'Alex', achievement: 'Reading Champion', date: '2024-10-19', points: 150 },
      { child: 'Emma', achievement: 'Science Explorer', date: '2024-10-18', points: 120 },
      { child: 'Alex', achievement: 'Creative Writer', date: '2024-10-17', points: 90 }
    ];

    const subjects = [
      { name: 'Math', value: 30, color: '#0088FE' },
      { name: 'Reading', value: 25, color: '#00C49F' },
      { name: 'Science', value: 20, color: '#FFBB28' },
      { name: 'Art', value: 15, color: '#FF8042' },
      { name: 'Music', value: 10, color: '#8884D8' }
    ];

    setAnalyticsData({
      weeklyProgress,
      activityDistribution,
      childComparison,
      timeSpent,
      achievements,
      subjects
    });

    setIsLoading(false);
  };

  const exportData = () => {
    if (!analyticsData) return;

    const dataToExport = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      children: selectedChild,
      ...analyticsData
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Analytics data exported successfully'
    });
  };

  const calculateFamilyInsights = () => {
    if (!analyticsData || !children.length) return null;

    const totalActivities = analyticsData.weeklyProgress.reduce((sum, day) => sum + day.activities, 0);
    const totalPoints = analyticsData.weeklyProgress.reduce((sum, day) => sum + day.points, 0);
    const averageTimePerChild = analyticsData.timeSpent.reduce((sum, hour) => sum + hour.minutes, 0) / children.length;
    
    const mostActiveChild = analyticsData.childComparison.reduce((prev, current) => 
      prev.activities > current.activities ? prev : current
    );

    const topSubject = analyticsData.subjects.reduce((prev, current) => 
      prev.value > current.value ? prev : current
    );

    return {
      totalActivities,
      totalPoints,
      averageTimePerChild: Math.round(averageTimePerChild),
      mostActiveChild: mostActiveChild.name,
      topSubject: topSubject.name,
      familyStreak: Math.max(...analyticsData.childComparison.map(c => c.streak))
    };
  };

  const insights = calculateFamilyInsights();

  if (!children.length) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-gray-600">Add children to view family analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Children</SelectItem>
              {children.map((child) => (
                <SelectItem key={child._id} value={child._id}>
                  {child.profile?.firstName || child.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="pie">Pie</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" onClick={exportData} className="ml-auto">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Key Insights */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-bold">{insights.totalActivities}</div>
              <div className="text-xs text-gray-600">Total Activities</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-xl font-bold">{insights.totalPoints}</div>
              <div className="text-xs text-gray-600">Total Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-xl font-bold">{insights.averageTimePerChild}m</div>
              <div className="text-xs text-gray-600">Avg Time/Child</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-xl font-bold">{insights.mostActiveChild}</div>
              <div className="text-xs text-gray-600">Most Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-xl font-bold">{insights.topSubject}</div>
              <div className="text-xs text-gray-600">Top Subject</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-pink-500" />
              <div className="text-xl font-bold">{insights.familyStreak}</div>
              <div className="text-xs text-gray-600">Family Streak</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'bar' ? (
                  <BarChart data={analyticsData.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activities" fill="#0088FE" />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={analyticsData.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="activities" stroke="#0088FE" strokeWidth={2} />
                  </LineChart>
                ) : (
                  <AreaChart data={analyticsData.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="activities" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Child Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Child Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.childComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="activities" fill="#00C49F" />
                  <Bar dataKey="points" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Subject Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.subjects}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.subjects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Time Spent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Time Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.timeSpent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="minutes" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Achievements */}
      {analyticsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Family Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <div>
                      <div className="font-semibold">{achievement.child}</div>
                      <div className="text-sm text-gray-600">{achievement.achievement}</div>
                      <div className="text-xs text-gray-500">{achievement.date}</div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    +{achievement.points} points
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyAnalytics;