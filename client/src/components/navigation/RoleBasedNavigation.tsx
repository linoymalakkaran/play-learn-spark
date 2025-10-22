import React from 'react';
import { useAuth } from '../../contexts/AuthContextEnhanced';
import { 
  Home, 
  User, 
  Users, 
  GraduationCap, 
  Shield, 
  Settings, 
  BookOpen,
  Trophy,
  PieChart,
  Bell,
  Heart,
  Star,
  Calendar,
  FileText,
  UserPlus,
  Coffee,
  HelpCircle,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
  roles: string[];
  permissions?: string[];
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['admin', 'educator', 'parent', 'child', 'guest']
  },
  {
    id: 'learning',
    label: 'Learning',
    icon: BookOpen,
    path: '/learning',
    roles: ['child', 'parent', 'educator', 'guest'],
    children: [
      {
        id: 'activities',
        label: 'Activities',
        icon: Star,
        path: '/learning/activities',
        roles: ['child', 'parent', 'educator', 'guest']
      },
      {
        id: 'courses',
        label: 'Courses',
        icon: BookOpen,
        path: '/learning/courses',
        roles: ['child', 'parent', 'educator']
      },
      {
        id: 'progress',
        label: 'Progress',
        icon: Trophy,
        path: '/learning/progress',
        roles: ['child', 'parent', 'educator']
      }
    ]
  },
  {
    id: 'content',
    label: 'Content Management',
    icon: FileText,
    path: '/content',
    roles: ['admin', 'educator'],
    permissions: ['content.create', 'content.manage']
  },
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    path: '/students',
    roles: ['educator', 'parent'],
    children: [
      {
        id: 'my-students',
        label: 'My Students',
        icon: Users,
        path: '/students/my-students',
        roles: ['educator']
      },
      {
        id: 'my-children',
        label: 'My Children',
        icon: Heart,
        path: '/students/my-children',
        roles: ['parent']
      },
      {
        id: 'student-progress',
        label: 'Progress Reports',
        icon: PieChart,
        path: '/students/progress',
        roles: ['educator', 'parent']
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: PieChart,
    path: '/analytics',
    roles: ['admin', 'educator', 'parent'],
    permissions: ['analytics.view']
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    path: '/calendar',
    roles: ['educator', 'parent', 'child']
  },
  {
    id: 'users',
    label: 'User Management',
    icon: UserPlus,
    path: '/users',
    roles: ['admin'],
    permissions: ['users.manage']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['admin', 'educator', 'parent', 'child']
  }
];

const roleColors = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  educator: 'bg-blue-100 text-blue-800 border-blue-200',
  parent: 'bg-green-100 text-green-800 border-green-200',
  child: 'bg-purple-100 text-purple-800 border-purple-200',
  guest: 'bg-gray-100 text-gray-800 border-gray-200'
};

const roleIcons = {
  admin: Shield,
  educator: GraduationCap,
  parent: Users,
  child: User,
  guest: Coffee
};

export const RoleBasedNavigation: React.FC = () => {
  const { user, hasPermission, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const filterNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      // Check role access
      const hasRoleAccess = item.roles.includes(user.role);
      
      // Check permission access if specified
      const hasPermissionAccess = item.permissions 
        ? item.permissions.some(permission => hasPermission(permission, 'read'))
        : true;

      if (!hasRoleAccess || !hasPermissionAccess) {
        return false;
      }

      // Recursively filter children
      if (item.children) {
        item.children = filterNavigationItems(item.children);
      }

      return true;
    });
  };

  const filteredNavItems = filterNavigationItems(navigationItems);
  const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || User;
  const roleColorClass = roleColors[user.role as keyof typeof roleColors] || roleColors.guest;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const Icon = item.icon;
    const isActive = isActivePath(item.path);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start ${level > 0 ? 'ml-4' : ''}`}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
              <ChevronDown className="ml-auto h-4 w-4" />
              {item.badge && (
                <Badge variant="secondary" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {item.children.map(child => (
              <DropdownMenuItem key={child.id} asChild>
                <Link to={child.path} className="flex items-center">
                  <child.icon className="mr-2 h-4 w-4" />
                  {child.label}
                  {child.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {child.badge}
                    </Badge>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link key={item.id} to={item.path}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={`w-full justify-start ${level > 0 ? 'ml-4' : ''}`}
        >
          <Icon className="mr-2 h-4 w-4" />
          {item.label}
          {item.badge && (
            <Badge variant="secondary" className="ml-2">
              {item.badge}
            </Badge>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profile?.avatarUrl} alt={user.profile?.firstName} />
            <AvatarFallback className={roleColorClass}>
              <RoleIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.profile?.firstName} {user.profile?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        </div>
        <div className="mt-2">
          <Badge className={`${roleColorClass} border text-xs`}>
            {user.role.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map(item => renderNavigationItem(item))}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link to="/help">
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
        </Link>
        
        {hasPermission('notifications.view', 'read') && (
          <Link to="/notifications">
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              {/* Add notification badge here if needed */}
            </Button>
          </Link>
        )}

        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default RoleBasedNavigation;