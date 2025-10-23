import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Plus,
  GraduationCap,
  Calendar,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Create Activity',
      description: 'Design new learning activities',
      icon: Plus,
      action: () => navigate('/teacher/create-activity'),
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Classes',
      description: 'View and organize your classes',
      icon: Users,
      action: () => navigate('/teacher/classes'),
      color: 'bg-green-500'
    },
    {
      title: 'View Analytics',
      description: 'Check student progress',
      icon: BarChart3,
      action: () => navigate('/teacher/analytics'),
      color: 'bg-purple-500'
    },
    {
      title: 'Assignment Center',
      description: 'Create and manage assignments',
      icon: FileText,
      action: () => navigate('/teacher/assignments'),
      color: 'bg-orange-500'
    }
  ];

  const recentClasses = [
    { id: 1, name: 'Grade 3A', students: 25, activities: 12, completion: 85 },
    { id: 2, name: 'Grade 3B', students: 23, activities: 10, completion: 78 },
    { id: 3, name: 'Grade 4A', students: 28, activities: 15, completion: 92 }
  ];

  const pendingReviews = [
    { id: 1, student: 'Sarah Johnson', activity: 'Math Addition', submitted: '2 hours ago' },
    { id: 2, student: 'Mike Chen', activity: 'English Reading', submitted: '4 hours ago' },
    { id: 3, student: 'Emma Davis', activity: 'Science Quiz', submitted: '1 day ago' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your classes and track student progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4" />
            Educator
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Classes
            </CardTitle>
            <CardDescription>
              Overview of your current classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-semibold">{classItem.name}</h4>
                    <p className="text-sm text-gray-600">
                      {classItem.students} students • {classItem.activities} activities
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={classItem.completion >= 80 ? 'default' : 'secondary'}>
                      {classItem.completion}% completion
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/teacher/classes')}>
              View All Classes
            </Button>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pending Reviews
            </CardTitle>
            <CardDescription>
              Student submissions waiting for your review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-semibold">{review.student}</h4>
                    <p className="text-sm text-gray-600">{review.activity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{review.submitted}</p>
                    <Button size="sm" className="mt-1">Review</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/teacher/reviews')}>
              View All Reviews
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">76</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;