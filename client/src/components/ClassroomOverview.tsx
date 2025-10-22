import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Target,
  AlertCircle,
  CheckCircle,
  Star,
  FileText,
  MessageSquare,
  Bell,
  PlayCircle,
  PauseCircle,
  Users2,
  BookOpen,
  Activity,
  BarChart3,
  ChevronRight,
  Zap,
  Heart,
  Trophy,
  Timer,
  Eye
} from 'lucide-react';

interface Class {
  _id: string;
  name: string;
  description?: string;
  subject?: string;
  gradeLevel: string;
  joinCode: string;
  analytics: {
    totalStudents: number;
    activeStudents: number;
    totalAssignments: number;
    averageCompletion: number;
    lastActivity: Date;
  };
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

interface Student {
  _id: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  progress: {
    totalActivitiesCompleted: number;
    currentLevel: number;
    totalPoints: number;
    streakDays: number;
    lastActiveDate: Date;
  };
  status: 'online' | 'offline' | 'away';
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'active' | 'completed' | 'archived';
  schedule: {
    assignedDate: Date;
    dueDate?: Date;
  };
  analytics: {
    enrolledCount: number;
    completedCount: number;
    averageScore: number;
  };
  points: {
    total: number;
  };
  estimatedDuration: number;
}

interface ClassroomOverviewProps {
  classData: Class;
  students: Student[];
  assignments: Assignment[];
}

export const ClassroomOverview: React.FC<ClassroomOverviewProps> = ({
  classData,
  students,
  assignments
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('week');

  // Calculate overview statistics
  const stats = {
    activeStudents: students.filter(s => s.status === 'online').length,
    totalStudents: students.length,
    completedAssignments: assignments.filter(a => a.analytics.completedCount > 0).length,
    averageScore: assignments.length > 0 
      ? Math.round(assignments.reduce((sum, a) => sum + a.analytics.averageScore, 0) / assignments.length)
      : 0,
    totalActivities: students.reduce((sum, s) => sum + s.progress.totalActivitiesCompleted, 0),
    averageLevel: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.progress.currentLevel, 0) / students.length)
      : 0
  };

  // Get recent activity
  const recentActivity = [
    { type: 'completion', student: 'Alice Wonder', activity: 'Fraction Basics', time: '2 minutes ago' },
    { type: 'join', student: 'Bob Builder', activity: 'joined the class', time: '5 minutes ago' },
    { type: 'achievement', student: 'Carol Smith', activity: 'earned "Math Star" badge', time: '10 minutes ago' },
    { type: 'submission', student: 'David Wilson', activity: 'submitted Plant Life Cycle', time: '15 minutes ago' }
  ];

  // Get top performers
  const topPerformers = [...students]
    .sort((a, b) => b.progress.totalPoints - a.progress.totalPoints)
    .slice(0, 5);

  // Get upcoming deadlines
  const upcomingDeadlines = assignments
    .filter(a => a.schedule.dueDate && new Date(a.schedule.dueDate) > new Date())
    .sort((a, b) => new Date(a.schedule.dueDate!).getTime() - new Date(b.schedule.dueDate!).getTime())
    .slice(0, 3);

  // Get students needing attention
  const studentsNeedingAttention = students
    .filter(s => {
      const daysSinceLastActive = Math.floor(
        (new Date().getTime() - new Date(s.progress.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastActive > 3 || s.progress.currentLevel < 3;
    })
    .slice(0, 5);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completion': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'join': return <Users className="h-4 w-4 text-blue-600" />;
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'submission': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getScheduleText = () => {
    if (!classData.schedule) return 'No schedule set';
    
    const days = classData.schedule.days.join(', ');
    const time = `${classData.schedule.startTime} - ${classData.schedule.endTime}`;
    return `${days} at ${time}`;
  };

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{classData.name}</h2>
              {classData.description && (
                <p className="text-gray-600">{classData.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className="bg-white">
                  {classData.gradeLevel} Grade
                </Badge>
                {classData.subject && (
                  <Badge variant="outline" className="bg-white">
                    {classData.subject}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{getScheduleText()}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{classData.joinCode}</div>
              <p className="text-sm text-gray-600">Join Code</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeStudents}/{stats.totalStudents}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <Progress 
              value={(stats.activeStudents / stats.totalStudents) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assignment Completion</p>
                <p className="text-2xl font-bold text-blue-600">{classData.analytics.averageCompletion}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={classData.analytics.averageCompletion} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageScore}%</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={stats.averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Class Level</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averageLevel}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Average student level
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.student}</span>
                      {' '}
                      <span className="text-gray-600">{activity.activity}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activity
            </Button>
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
              {topPerformers.map((student, index) => (
                <div key={student._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.profile?.avatarUrl} />
                      <AvatarFallback>
                        {student.profile?.firstName?.[0]}{student.profile?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {student.profile?.firstName} {student.profile?.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>Level {student.progress.currentLevel}</span>
                      <span>•</span>
                      <span>{student.progress.totalPoints} points</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(student.status)}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((assignment) => {
                  const daysUntil = getDaysUntilDue(assignment.schedule.dueDate!);
                  const completionRate = assignment.analytics.enrolledCount > 0
                    ? Math.round((assignment.analytics.completedCount / assignment.analytics.enrolledCount) * 100)
                    : 0;
                  
                  return (
                    <div key={assignment._id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{assignment.title}</h4>
                        <Badge variant={daysUntil <= 2 ? 'destructive' : daysUntil <= 5 ? 'default' : 'secondary'}>
                          {daysUntil === 0 ? 'Due Today' : 
                           daysUntil === 1 ? 'Due Tomorrow' : 
                           `${daysUntil} days left`}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Progress value={completionRate} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{assignment.analytics.completedCount}/{assignment.analytics.enrolledCount} completed</span>
                          <span>{completionRate}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No upcoming deadlines</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students Needing Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Students Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentsNeedingAttention.length > 0 ? (
                studentsNeedingAttention.map((student) => {
                  const daysSinceActive = Math.floor(
                    (new Date().getTime() - new Date(student.progress.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={student._id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.profile?.avatarUrl} />
                        <AvatarFallback>
                          {student.profile?.firstName?.[0]}{student.profile?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="font-medium">
                          {student.profile?.firstName} {student.profile?.lastName}
                        </p>
                        <div className="text-xs text-gray-600">
                          {daysSinceActive > 3 && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Inactive for {daysSinceActive} days</span>
                            </div>
                          )}
                          {student.progress.currentLevel < 3 && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Below class average (Level {student.progress.currentLevel})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
                  <p>All students are doing well!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Create Assignment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              <span>Send Announcement</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Manage Students</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassroomOverview;