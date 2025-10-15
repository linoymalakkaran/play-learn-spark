import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  BookOpen, 
  Brain, 
  Gamepad2,
  Languages,
  Upload,
  Settings
} from 'lucide-react';

const FooterNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navigationItems = [
    { 
      path: '/', 
      label: 'Home', 
      icon: Home,
      description: 'Learning Activities Dashboard'
    },
    { 
      path: '/activities', 
      label: 'Activities', 
      icon: Gamepad2,
      description: 'Browse All Learning Activities'
    },
    { 
      path: '/malayalam', 
      label: 'Malayalam', 
      icon: Languages,
      description: 'Learn Malayalam Language'
    },
    { 
      path: '/arabic', 
      label: 'Arabic', 
      icon: BookOpen,
      description: 'Learn Arabic Language'
    },
    { 
      path: '/ai-homework', 
      label: 'AI Homework', 
      icon: Brain,
      description: 'Upload & Analyze Homework'
    }
  ];

  // Add content management for educators, parents, and admins
  if (isAuthenticated && user && ['admin', 'educator', 'parent'].includes(user.role)) {
    navigationItems.push({
      path: '/content-management',
      label: 'Content',
      icon: Settings,
      description: 'Manage Educational Content'
    });
  }

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <footer className="bg-white/90 backdrop-blur-sm border-t shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Main Navigation */}
        <div className="flex justify-center items-center space-x-2 mb-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 transition-all ${
                  isActive(item.path) 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'hover:bg-purple-50 hover:text-purple-700'
                }`}
                title={item.description}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Play & Learn Spark. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterNavigation;