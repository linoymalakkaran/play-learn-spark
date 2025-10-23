import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Clock, 
  MessageSquare, 
  Plus,
  Baby,
  Calendar,
  Heart,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const children = [
    {
      id: 1,
      name: 'Emma',
      age: 5,
      grade: 'Kindergarten',
      progress: 78,
      lastActivity: '2 hours ago',
      weeklyGoal: 85,
      achievements: 12,
      avatar: '👧'
    },
    {
      id: 2,
      name: 'Alex',
      age: 7,
      grade: 'Grade 2',
      progress: 92,
      lastActivity: '1 hour ago',
      weeklyGoal: 90,
      achievements: 18,
      avatar: '👦'
    }
  ];

  const quickActions = [
    {
      title: 'Add Child',
      description: 'Connect a new child account',
      icon: Plus,
      action: () => navigate('/parent/add-child'),
      color: 'bg-blue-500'
    },
    {
      title: 'View Progress',
      description: 'Check detailed learning progress',
      icon: BookOpen,
      action: () => navigate('/parent/progress'),
      color: 'bg-green-500'
    },
    {
      title: 'Contact Teachers',
      description: 'Communicate with educators',
      icon: MessageSquare,
      action: () => navigate('/parent/messages'),
      color: 'bg-purple-500'
    },
    {
      title: 'Safety Settings',
      description: 'Manage privacy and safety',
      icon: Shield,
      action: () => navigate('/parent/safety'),
      color: 'bg-orange-500'
    }
  ];

  const recentActivities = [
    { id: 1, child: 'Emma', activity: 'Alphabet Learning', score: 95, time: '15 min', date: 'Today' },
    { id: 2, child: 'Alex', activity: 'Math Addition', score: 88, time: '20 min', date: 'Today' },
    { id: 3, child: 'Emma', activity: 'Color Recognition', score: 100, time: '10 min', date: 'Yesterday' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your children's learning journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            Parent
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

      {/* Children Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{child.avatar}</span>
                <div>
                  <h3 className="text-lg">{child.name}</h3>
                  <p className="text-sm text-gray-600">{child.grade} • Age {child.age}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Weekly Progress</span>
                  <span className="text-sm text-gray-600">{child.progress}% of {child.weeklyGoal}%</span>
                </div>
                <Progress value={child.progress} className="h-2" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-semibold">{child.achievements}</p>
                  <p className="text-xs text-gray-600">Achievements</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Clock className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-sm font-semibold">{child.lastActivity}</p>
                  <p className="text-xs text-gray-600">Last Activity</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => navigate(`/parent/child/${child.id}`)}
                >
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => navigate(`/parent/child/${child.id}/progress`)}
                >
                  Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Recent Activities
          </CardTitle>
          <CardDescription>
            Latest learning activities across all children
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{activity.activity}</h4>
                    <p className="text-sm text-gray-600">{activity.child} • {activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={activity.score >= 90 ? 'default' : activity.score >= 70 ? 'secondary' : 'destructive'}>
                    {activity.score}%
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/parent/activities')}>
            View All Activities
          </Button>
        </CardContent>
      </Card>

      {/* Family Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-gray-900">{children.length}</p>
              </div>
              <Baby className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(children.reduce((acc, child) => acc + child.progress, 0) / children.length)}%
                </p>
              </div>
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Achievements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {children.reduce((acc, child) => acc + child.achievements, 0)}
                </p>
              </div>
              <Heart className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;