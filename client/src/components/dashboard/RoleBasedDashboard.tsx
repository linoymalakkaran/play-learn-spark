import React from 'react';
import { useAuth } from '../../contexts/AuthContextEnhanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Users,
  User,
  GraduationCap,
  Shield,
  Coffee,
  BookOpen,
  Trophy,
  Calendar,
  Bell,
  TrendingUp,
  Heart,
  Star,
  Clock,
  Target,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  UserPlus,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  value?: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  action?: {
    label: string;
    path: string;
  };
  roles: string[];
  permissions?: string[];
}

const dashboardCards: DashboardCard[] = [
  // Admin Cards
  {
    id: 'total-users',
    title: 'Total Users',
    description: 'Active platform users',
    icon: Users,
    value: '1,234',
    change: '+12%',
    trend: 'up',
    action: { label: 'Manage Users', path: '/users' },
    roles: ['admin'],
    permissions: ['users.view']
  },
  {
    id: 'content-items',
    title: 'Content Items',
    description: 'Learning materials created',
    icon: FileText,
    value: '567',
    change: '+8%',
    trend: 'up',
    action: { label: 'View Content', path: '/content' },
    roles: ['admin', 'educator'],
    permissions: ['content.view']
  },
  {
    id: 'system-health',
    title: 'System Health',
    description: 'Platform performance metrics',
    icon: Activity,
    value: '98.5%',
    change: '+0.2%',
    trend: 'up',
    action: { label: 'View Analytics', path: '/analytics' },
    roles: ['admin'],
    permissions: ['system.monitor']
  },

  // Educator Cards
  {
    id: 'my-students',
    title: 'My Students',
    description: 'Students in your classes',
    icon: Users,
    value: '24',
    change: '+3',
    trend: 'up',
    action: { label: 'View Students', path: '/students/my-students' },
    roles: ['educator']
  },
  {
    id: 'active-lessons',
    title: 'Active Lessons',
    description: 'Ongoing learning sessions',
    icon: BookOpen,
    value: '8',
    change: 'New today',
    trend: 'neutral',
    action: { label: 'View Lessons', path: '/lessons' },
    roles: ['educator']
  },
  {
    id: 'completion-rate',
    title: 'Completion Rate',
    description: 'Average assignment completion',
    icon: Target,
    value: '87%',
    change: '+5%',
    trend: 'up',
    action: { label: 'View Reports', path: '/analytics' },
    roles: ['educator'],
    permissions: ['analytics.view']
  },

  // Parent Cards
  {
    id: 'my-children',
    title: 'My Children',
    description: 'Children enrolled in platform',
    icon: Heart,
    value: '2',
    change: 'Active learners',
    trend: 'neutral',
    action: { label: 'View Progress', path: '/students/my-children' },
    roles: ['parent']
  },
  {
    id: 'learning-time',
    title: 'Learning Time',
    description: 'Total time spent this week',
    icon: Clock,
    value: '12h 30m',
    change: '+2h',
    trend: 'up',
    action: { label: 'View Details', path: '/learning/progress' },
    roles: ['parent', 'child']
  },
  {
    id: 'achievements',
    title: 'Achievements',
    description: 'Badges earned this month',
    icon: Trophy,
    value: '15',
    change: '+5',
    trend: 'up',
    action: { label: 'View All', path: '/achievements' },
    roles: ['parent', 'child']
  },

  // Child Cards
  {
    id: 'current-level',
    title: 'Current Level',
    description: 'Your learning progress',
    icon: Star,
    value: 'Level 8',
    change: '85% to next',
    trend: 'up',
    action: { label: 'Continue Learning', path: '/learning/activities' },
    roles: ['child']
  },
  {
    id: 'daily-streak',
    title: 'Daily Streak',
    description: 'Consecutive learning days',
    icon: TrendingUp,
    value: '7 days',
    change: 'Keep it up!',
    trend: 'up',
    action: { label: 'View Progress', path: '/learning/progress' },
    roles: ['child']
  },
  {
    id: 'next-activity',
    title: 'Next Activity',
    description: 'Recommended for you',
    icon: BookOpen,
    value: 'Math Quest',
    change: 'Ready to start',
    trend: 'neutral',
    action: { label: 'Start Activity', path: '/learning/activities/math-quest' },
    roles: ['child']
  },

  // Guest Cards
  {
    id: 'explore-activities',
    title: 'Explore Activities',
    description: 'Try our learning activities',
    icon: BookOpen,
    value: '50+',
    change: 'Free activities',
    trend: 'neutral',
    action: { label: 'Browse Activities', path: '/learning/activities' },
    roles: ['guest']
  },
  {
    id: 'sample-content',
    title: 'Sample Content',
    description: 'Preview our educational materials',
    icon: Star,
    value: '10+',
    change: 'Demo lessons',
    trend: 'neutral',
    action: { label: 'View Samples', path: '/samples' },
    roles: ['guest']
  },
  {
    id: 'create-account',
    title: 'Create Account',
    description: 'Unlock full features',
    icon: UserPlus,
    value: 'Sign Up',
    change: 'Get started',
    trend: 'up',
    action: { label: 'Register Now', path: '/register' },
    roles: ['guest']
  }
];

const quickActions = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['admin', 'educator', 'parent', 'child']
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/notifications',
    roles: ['admin', 'educator', 'parent', 'child'],
    permissions: ['notifications.view']
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    path: '/calendar',
    roles: ['educator', 'parent', 'child']
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    roles: ['admin', 'educator', 'parent'],
    permissions: ['analytics.view']
  }
];

const roleIcons = {
  admin: Shield,
  educator: GraduationCap,
  parent: Users,
  child: User,
  guest: Coffee
};

const roleColors = {
  admin: 'from-red-500 to-red-600',
  educator: 'from-blue-500 to-blue-600',
  parent: 'from-green-500 to-green-600',
  child: 'from-purple-500 to-purple-600',
  guest: 'from-gray-500 to-gray-600'
};

const welcomeMessages = {
  admin: 'Welcome back, Administrator! Here\'s your platform overview.',
  educator: 'Welcome back! Check on your students and manage your classes.',
  parent: 'Welcome back! See how your children are progressing.',
  child: 'Welcome back! Ready to continue your learning adventure?',
  guest: 'Welcome! Explore our platform and see what we have to offer.'
};

export const RoleBasedDashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your dashboard.</p>
      </div>
    );
  }

  const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || User;
  const roleGradient = roleColors[user.role as keyof typeof roleColors] || roleColors.guest;
  const welcomeMessage = welcomeMessages[user.role as keyof typeof welcomeMessages] || welcomeMessages.guest;

  const filterItems = (items: any[]) => {
    return items.filter(item => {
      const hasRoleAccess = item.roles.includes(user.role);
      const hasPermissionAccess = item.permissions 
        ? item.permissions.some((permission: string) => hasPermission(permission, 'read'))
        : true;
      return hasRoleAccess && hasPermissionAccess;
    });
  };

  const filteredCards = filterItems(dashboardCards);
  const filteredActions = filterItems(quickActions);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className={`bg-gradient-to-r ${roleGradient} text-white rounded-lg p-6`}>
        <div className="flex items-center space-x-4">
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <RoleIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user.profile?.firstName || user.username}!
            </h1>
            <p className="text-white text-opacity-90 mt-1">
              {welcomeMessage}
            </p>
            <Badge variant="secondary" className="mt-2 bg-white bg-opacity-20 text-white border-white border-opacity-30">
              {user.role.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {filteredActions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link key={action.id} to={action.path}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <ActionIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Dashboard Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => {
            const CardIcon = card.icon;
            return (
              <Card key={card.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <CardIcon className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(card.trend)}
                    <p className={`text-xs ${getTrendColor(card.trend)}`}>
                      {card.change}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {card.description}
                  </p>
                  {card.action && (
                    <Link to={card.action.path}>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        {card.action.label}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>Your latest platform activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.role === 'child' && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Trophy className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Completed Math Quiz Level 3</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Earned "Reading Champion" badge</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
              </>
            )}
            {user.role === 'parent' && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Heart className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Child completed daily learning goal</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New progress report available</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
              </>
            )}
            {user.role === 'educator' && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New student enrolled in your class</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created new assignment "Science Experiment"</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </>
            )}
            {user.role === 'guest' && (
              <div className="text-center py-4">
                <Coffee className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  You're browsing as a guest. Create an account to track your activities!
                </p>
                <Link to="/register">
                  <Button variant="outline" size="sm">
                    Sign Up Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleBasedDashboard;