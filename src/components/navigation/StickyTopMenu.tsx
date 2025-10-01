import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  GraduationCap,
  Sparkles,
  Languages,
  Brain
} from 'lucide-react';

interface StickyTopMenuProps {
  // onTogglePlatform removed - now using navigation
}

const StickyTopMenu: React.FC<StickyTopMenuProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { 
      path: '/', 
      label: 'Home', 
      icon: Home,
      description: 'Go to main dashboard'
    },
    { 
      path: '/activities', 
      label: 'Learning Activities', 
      icon: GraduationCap,
      description: 'Browse all learning activities'
    },
    { 
      path: '/malayalam', 
      label: 'Malayalam', 
      icon: Languages,
      description: 'Learn Malayalam language'
    },
    { 
      path: '/arabic', 
      label: 'Arabic', 
      icon: BookOpen,
      description: 'Learn Arabic language'
    }
  ];

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation items */}
          <div className="flex items-center space-x-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isCurrentActive = isActive(item.path);
              
              return (
                <Button
                  key={item.path}
                  variant={isCurrentActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 transition-all ${
                    isCurrentActive
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

          {/* Right side - Try Integrated Platform */}
          <div className="flex items-center">
            <Button
              onClick={() => navigate('/integratedplatform')}
              size="sm"
              className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 transition-all"
              title="Try Integrated Platform"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">Try Integrated Platform</span>
              <span className="hidden sm:inline md:hidden">Platform</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyTopMenu;