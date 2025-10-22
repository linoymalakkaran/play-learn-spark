import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Clock,
  Star,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  Activity,
  BookOpen,
  Trophy,
  Zap,
  Heart,
  PlayCircle,
  Timer,
  FileText,
  Mail,
  Phone
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
    avatarUrl?: string;
    age?: number;
    grade?: string;
    email?: string;
    parentEmail?: string;
  };
  progress: {
    totalActivitiesCompleted: number;
    currentLevel: number;
    totalPoints: number;
    streakDays: number;
    lastActiveDate: Date;
    weeklyGoal?: number;
    weeklyProgress?: number;
    badges?: string[];
    skills?: Array<{
      skillName: string;
      level: number;
      progress: number;
    }>;
  };
  status: 'online' | 'offline' | 'away';
  performance: {
    averageScore: number;
    totalTimeSpent: number; // in minutes
    assignmentsCompleted: number;
    assignmentsTotal: number;
    strengths: string[];
    needsImprovement: string[];
  };
}

interface StudentProgressTrackerProps {
  classData: Class;
  students: Student[];
  onStudentSelect: (student: Student) => void;
}

export const StudentProgressTracker: React.FC<StudentProgressTrackerProps> = ({
  classData,
  students,
  onStudentSelect
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'score' | 'activity'>('name');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'struggling' | 'excelling'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enhanced student data with performance metrics
  const enhancedStudents = students.map(student => ({
    ...student,
    performance: {
      averageScore: Math.floor(Math.random() * 40) + 60, // 60-100
      totalTimeSpent: Math.floor(Math.random() * 300) + 120, // 120-420 minutes
      assignmentsCompleted: Math.floor(Math.random() * 15) + 5,
      assignmentsTotal: Math.floor(Math.random() * 5) + 20,
      strengths: ['Problem Solving', 'Creative Thinking'].slice(0, Math.floor(Math.random() * 2) + 1),
      needsImprovement: ['Time Management', 'Attention to Detail'].slice(0, Math.floor(Math.random() * 2))
    },
    progress: {
      ...student.progress,
      weeklyGoal: 100,
      weeklyProgress: Math.floor(Math.random() * 120) + 40,
      badges: ['Math Star', 'Quick Learner', 'Consistent Student'].slice(0, Math.floor(Math.random() * 3)),
      skills: [
        { skillName: 'Mathematics', level: Math.floor(Math.random() * 5) + 1, progress: Math.floor(Math.random() * 100) },
        { skillName: 'Reading', level: Math.floor(Math.random() * 5) + 1, progress: Math.floor(Math.random() * 100) },
        { skillName: 'Science', level: Math.floor(Math.random() * 5) + 1, progress: Math.floor(Math.random() * 100) }
      ]
    }
  }));

  // Filter and sort students
  const filteredStudents = enhancedStudents
    .filter(student => {
      const matchesSearch = 
        student.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (filterBy) {
        case 'active':
          return student.status === 'online';
        case 'struggling':
          return student.performance.averageScore < 70 || student.progress.currentLevel < 3;
        case 'excelling':
          return student.performance.averageScore >= 90 && student.progress.currentLevel >= 5;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.progress.totalPoints - a.progress.totalPoints;
        case 'score':
          return b.performance.averageScore - a.performance.averageScore;
        case 'activity':
          return new Date(b.progress.lastActiveDate).getTime() - new Date(a.progress.lastActiveDate).getTime();
        default:
          return a.profile.firstName.localeCompare(b.profile.firstName);
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Needs Support', color: 'bg-red-100 text-red-800' };
  };

  const getDaysLastActive = (lastActiveDate: Date) => {
    const days = Math.floor((new Date().getTime() - new Date(lastActiveDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    onStudentSelect(student);
  };

  const classStats = {
    totalStudents: enhancedStudents.length,
    activeStudents: enhancedStudents.filter(s => s.status === 'online').length,
    averageScore: enhancedStudents.length > 0 
      ? Math.round(enhancedStudents.reduce((sum, s) => sum + s.performance.averageScore, 0) / enhancedStudents.length)
      : 0,
    strugglingStudents: enhancedStudents.filter(s => s.performance.averageScore < 70).length
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{classStats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-green-600">{classStats.activeStudents}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Class Average</p>
                <p className="text-2xl font-bold text-purple-600">{classStats.averageScore}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Need Support</p>
                <p className="text-2xl font-bold text-red-600">{classStats.strugglingStudents}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="activity">Last Active</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="active">Active Now</SelectItem>
                  <SelectItem value="struggling">Struggling</SelectItem>
                  <SelectItem value="excelling">Excelling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid/List */}
      <div className="grid grid-cols-1 gap-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => {
              const performanceBadge = getPerformanceBadge(student.performance.averageScore);
              
              return (
                <Card
                  key={student._id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedStudent?._id === student._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleStudentClick(student)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={student.profile?.avatarUrl} />
                              <AvatarFallback>
                                {student.profile?.firstName?.[0]}{student.profile?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(student.status)}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {student.profile?.firstName} {student.profile?.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">@{student.username}</p>
                          </div>
                        </div>
                        <Badge className={performanceBadge.color}>
                          {performanceBadge.label}
                        </Badge>
                      </div>

                      {/* Progress Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-bold text-blue-600">Level {student.progress.currentLevel}</div>
                          <div className="text-gray-600">Current Level</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-bold text-green-600">{student.progress.totalPoints}</div>
                          <div className="text-gray-600">Total Points</div>
                        </div>
                      </div>

                      {/* Weekly Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Weekly Goal</span>
                          <span>{student.progress.weeklyProgress}/{student.progress.weeklyGoal}</span>
                        </div>
                        <Progress 
                          value={Math.min((student.progress.weeklyProgress! / student.progress.weeklyGoal!) * 100, 100)} 
                          className="h-2"
                        />
                      </div>

                      {/* Performance Score */}
                      <div className="flex items-center justify-between text-sm">
                        <span>Average Score</span>
                        <span className={`font-bold ${getPerformanceColor(student.performance.averageScore)}`}>
                          {student.performance.averageScore}%
                        </span>
                      </div>

                      {/* Last Active */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Last Active</span>
                        <span>{getDaysLastActive(student.progress.lastActiveDate)}</span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredStudents.map((student) => {
                  const performanceBadge = getPerformanceBadge(student.performance.averageScore);
                  
                  return (
                    <div
                      key={student._id}
                      className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedStudent?._id === student._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleStudentClick(student)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={student.profile?.avatarUrl} />
                              <AvatarFallback>
                                {student.profile?.firstName?.[0]}{student.profile?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(student.status)}`} />
                          </div>
                          
                          <div>
                            <h3 className="font-semibold">
                              {student.profile?.firstName} {student.profile?.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">@{student.username}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="font-bold text-blue-600">Level {student.progress.currentLevel}</div>
                            <div className="text-xs text-gray-600">Current Level</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-bold text-green-600">{student.progress.totalPoints}</div>
                            <div className="text-xs text-gray-600">Points</div>
                          </div>
                          
                          <div className="text-center">
                            <div className={`font-bold ${getPerformanceColor(student.performance.averageScore)}`}>
                              {student.performance.averageScore}%
                            </div>
                            <div className="text-xs text-gray-600">Average</div>
                          </div>
                          
                          <div className="text-center min-w-[100px]">
                            <div className="text-sm">{getDaysLastActive(student.progress.lastActiveDate)}</div>
                            <div className="text-xs text-gray-600">Last Active</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={performanceBadge.color}>
                              {performanceBadge.label}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Student Details */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Details: {selectedStudent.profile?.firstName} {selectedStudent.profile?.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Average Score:</span>
                        <span className={`font-bold ${getPerformanceColor(selectedStudent.performance.averageScore)}`}>
                          {selectedStudent.performance.averageScore}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assignments Completed:</span>
                        <span>{selectedStudent.performance.assignmentsCompleted}/{selectedStudent.performance.assignmentsTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Spent Learning:</span>
                        <span>{Math.round(selectedStudent.performance.totalTimeSpent / 60)}h {selectedStudent.performance.totalTimeSpent % 60}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Streak:</span>
                        <span>{selectedStudent.progress.streakDays} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Strengths</h4>
                    <div className="space-y-2">
                      {selectedStudent.performance.strengths.map((strength, index) => (
                        <Badge key={index} variant="secondary" className="mr-2">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                    
                    <h4 className="font-semibold mt-4">Areas for Improvement</h4>
                    <div className="space-y-2">
                      {selectedStudent.performance.needsImprovement.map((area, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Badges Earned</h4>
                    <div className="space-y-2">
                      {selectedStudent.progress.badges?.map((badge, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{badge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="progress">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4">Weekly Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Goal: {selectedStudent.progress.weeklyGoal} points</span>
                        <span>Current: {selectedStudent.progress.weeklyProgress} points</span>
                      </div>
                      <Progress 
                        value={Math.min((selectedStudent.progress.weeklyProgress! / selectedStudent.progress.weeklyGoal!) * 100, 100)} 
                        className="h-3"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Level Progress</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedStudent.progress.currentLevel}
                        </div>
                        <div className="text-sm text-gray-600">Current Level</div>
                      </div>
                      <div className="flex-1">
                        <Progress value={75} className="h-3" />
                        <div className="text-xs text-gray-600 mt-1">
                          75% to Level {selectedStudent.progress.currentLevel + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="skills">
                <div className="space-y-4">
                  <h4 className="font-semibold">Skill Development</h4>
                  <div className="space-y-4">
                    {selectedStudent.progress.skills?.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{skill.skillName}</span>
                          <Badge variant="outline">Level {skill.level}</Badge>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                        <div className="text-xs text-gray-600">{skill.progress}% mastery</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact">
                <div className="space-y-4">
                  <h4 className="font-semibold">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Student Email</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{selectedStudent.profile?.email || 'Not provided'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Parent Email</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{selectedStudent.profile?.parentEmail || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message to Student
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Parent
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* No students state */}
      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Students Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search or filter criteria.' : 'No students have joined this class yet.'}
            </p>
            {!searchTerm && (
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Invite Students
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentProgressTracker;