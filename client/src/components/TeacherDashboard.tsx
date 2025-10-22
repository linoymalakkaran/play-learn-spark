import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  Search,
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
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  Activity,
  PlayCircle,
  PauseCircle,
  Users2,
  Zap,
  Heart,
  School
} from 'lucide-react';

// Import sub-components (will be created separately)
import { ClassroomOverview } from './ClassroomOverview';
import { StudentProgressTracker } from './StudentProgressTracker';
import { AssignmentManager } from './AssignmentManager';
import { TeacherAnalytics } from './TeacherAnalytics';
import { ClassroomSettings } from './ClassroomSettings';

interface Class {
  _id: string;
  name: string;
  description?: string;
  subject?: string;
  gradeLevel: string;
  settings: {
    maxStudents: number;
    autoApproval: boolean;
    allowParentView: boolean;
    public: boolean;
  };
  joinCode: string;
  students: Array<{
    userId: {
      _id: string;
      username: string;
      profile: {
        firstName: string;
        lastName: string;
        avatarUrl?: string;
      };
    };
    enrolledAt: Date;
    status: 'active' | 'inactive' | 'pending' | 'removed';
  }>;
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

interface Student {
  _id: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    age?: number;
    grade?: string;
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

interface TeacherDashboardProps {
  teacherId: string;
  onNavigate?: (route: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacherId,
  onNavigate
}) => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadTeacherData = async () => {
      setLoading(true);
      try {
        // Simulated API calls
        const mockClasses: Class[] = [
          {
            _id: '1',
            name: 'Mathematics Grade 5',
            description: 'Elementary mathematics for 5th grade students',
            subject: 'math',
            gradeLevel: '5th',
            joinCode: 'MATH5A',
            settings: {
              maxStudents: 25,
              autoApproval: false,
              allowParentView: true,
              public: false,
            },
            students: [
              {
                userId: {
                  _id: 'student1',
                  username: 'alice_wonder',
                  profile: { firstName: 'Alice', lastName: 'Wonder' }
                },
                enrolledAt: new Date('2024-09-01'),
                status: 'active'
              },
              {
                userId: {
                  _id: 'student2',
                  username: 'bob_builder',
                  profile: { firstName: 'Bob', lastName: 'Builder' }
                },
                enrolledAt: new Date('2024-09-02'),
                status: 'active'
              }
            ],
            analytics: {
              totalStudents: 22,
              activeStudents: 20,
              totalAssignments: 15,
              averageCompletion: 85,
              lastActivity: new Date()
            },
            schedule: {
              days: ['monday', 'wednesday', 'friday'],
              startTime: '09:00',
              endTime: '10:30',
              timezone: 'America/New_York'
            }
          },
          {
            _id: '2',
            name: 'Science Explorers',
            description: 'Interactive science activities for curious minds',
            subject: 'science',
            gradeLevel: '4th',
            joinCode: 'SCI4B',
            settings: {
              maxStudents: 20,
              autoApproval: true,
              allowParentView: true,
              public: false,
            },
            students: [],
            analytics: {
              totalStudents: 18,
              activeStudents: 17,
              totalAssignments: 12,
              averageCompletion: 92,
              lastActivity: new Date()
            }
          }
        ];

        const mockAssignments: Assignment[] = [
          {
            _id: 'assign1',
            title: 'Fraction Fundamentals',
            description: 'Learn the basics of fractions with interactive activities',
            status: 'active',
            schedule: {
              assignedDate: new Date('2024-10-15'),
              dueDate: new Date('2024-10-25')
            },
            analytics: {
              enrolledCount: 22,
              completedCount: 15,
              averageScore: 88
            },
            points: { total: 100 },
            estimatedDuration: 45
          },
          {
            _id: 'assign2',
            title: 'Plant Life Cycle',
            description: 'Explore how plants grow and reproduce',
            status: 'published',
            schedule: {
              assignedDate: new Date('2024-10-20'),
              dueDate: new Date('2024-10-30')
            },
            analytics: {
              enrolledCount: 18,
              completedCount: 3,
              averageScore: 95
            },
            points: { total: 75 },
            estimatedDuration: 30
          }
        ];

        setClasses(mockClasses);
        setAssignments(mockAssignments);
        setSelectedClass(mockClasses[0]);
        
        // Set mock students from selected class
        const mockStudents: Student[] = mockClasses[0].students.map(s => ({
          _id: s.userId._id,
          username: s.userId.username,
          profile: s.userId.profile,
          progress: {
            totalActivitiesCompleted: Math.floor(Math.random() * 50) + 10,
            currentLevel: Math.floor(Math.random() * 10) + 1,
            totalPoints: Math.floor(Math.random() * 2000) + 500,
            streakDays: Math.floor(Math.random() * 30),
            lastActiveDate: new Date()
          },
          status: Math.random() > 0.3 ? 'online' : 'offline'
        }));
        setStudents(mockStudents);

      } catch (error) {
        console.error('Error loading teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, [teacherId]);

  const handleClassSelect = (classData: Class) => {
    setSelectedClass(classData);
    // Load students for the selected class
    const classStudents: Student[] = classData.students.map(s => ({
      _id: s.userId._id,
      username: s.userId.username,
      profile: s.userId.profile,
      progress: {
        totalActivitiesCompleted: Math.floor(Math.random() * 50) + 10,
        currentLevel: Math.floor(Math.random() * 10) + 1,
        totalPoints: Math.floor(Math.random() * 2000) + 500,
        streakDays: Math.floor(Math.random() * 30),
        lastActiveDate: new Date()
      },
      status: Math.random() > 0.3 ? 'online' : 'offline'
    }));
    setStudents(classStudents);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeLevelColor = (grade: string) => {
    const colors = {
      'pre-k': 'bg-pink-100 text-pink-800',
      'kindergarten': 'bg-purple-100 text-purple-800',
      '1st': 'bg-blue-100 text-blue-800',
      '2nd': 'bg-green-100 text-green-800',
      '3rd': 'bg-yellow-100 text-yellow-800',
      '4th': 'bg-orange-100 text-orange-800',
      '5th': 'bg-red-100 text-red-800',
      '6th': 'bg-indigo-100 text-indigo-800',
      'mixed': 'bg-gray-100 text-gray-800'
    };
    return colors[grade as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const quickStats = {
    totalClasses: classes.length,
    totalStudents: classes.reduce((sum, cls) => sum + cls.analytics.totalStudents, 0),
    activeAssignments: assignments.filter(a => a.status === 'active').length,
    avgCompletionRate: classes.length > 0 
      ? Math.round(classes.reduce((sum, cls) => sum + cls.analytics.averageCompletion, 0) / classes.length)
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your classrooms, track student progress, and create engaging assignments
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => onNavigate?.('/create-assignment')}>
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
          <Button variant="outline" onClick={() => onNavigate?.('/create-class')}>
            <School className="h-4 w-4 mr-2" />
            New Class
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-blue-600">{quickStats.totalClasses}</p>
              </div>
              <School className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-green-600">{quickStats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-orange-600">{quickStats.activeAssignments}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold text-purple-600">{quickStats.avgCompletionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Your Classes
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((classData) => (
              <Card
                key={classData._id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedClass?._id === classData._id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleClassSelect(classData)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{classData.name}</h3>
                      <Badge className={getGradeLevelColor(classData.gradeLevel)}>
                        {classData.gradeLevel}
                      </Badge>
                    </div>
                    
                    {classData.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {classData.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span>{classData.analytics.activeStudents}/{classData.analytics.totalStudents}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span>{classData.analytics.totalAssignments}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-purple-600">
                          {classData.analytics.averageCompletion}%
                        </p>
                        <p className="text-xs text-gray-500">completion</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Join Code: {classData.joinCode}</span>
                      </div>
                      {selectedClass?._id === classData._id && (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      {selectedClass && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ClassroomOverview 
              classData={selectedClass}
              students={students}
              assignments={assignments.filter(a => a.status === 'active')}
            />
          </TabsContent>

          <TabsContent value="students">
            <StudentProgressTracker 
              classData={selectedClass}
              students={students}
              onStudentSelect={(student) => console.log('Selected student:', student)}
            />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentManager 
              classData={selectedClass}
              assignments={assignments}
              onCreateAssignment={() => onNavigate?.('/create-assignment')}
              onEditAssignment={(id) => onNavigate?.(`/edit-assignment/${id}`)}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <TeacherAnalytics 
              classData={selectedClass}
              students={students}
              assignments={assignments}
            />
          </TabsContent>

          <TabsContent value="settings">
            <ClassroomSettings 
              classData={selectedClass}
              onUpdateClass={(updates) => {
                console.log('Update class:', updates);
                // Handle class updates
              }}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* No Class Selected State */}
      {!selectedClass && classes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <School className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Classes Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first classroom to start managing students and assignments.
            </p>
            <Button onClick={() => onNavigate?.('/create-class')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Class
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;