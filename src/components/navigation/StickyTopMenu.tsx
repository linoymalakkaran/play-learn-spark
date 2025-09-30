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
  onTogglePlatform?: () => void;
}

const StickyTopMenu: React.FC<StickyTopMenuProps> = ({ onTogglePlatform }) => {
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
      path: '/malayalam', 
      label: 'Language Learning Adventures', 
      icon: Languages,
      description: 'Learn Malayalam and Arabic'
    }
  ];

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation items */}
          <div className="flex items-center space-x-2">
            {/* Home */}
            <Button
              variant={isActive('/') ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 transition-all ${
                isActive('/') 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'hover:bg-purple-50 hover:text-purple-700'
              }`}
              title="Go to Home"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>

            {/* Language Learning Adventures */}
            <Button
              variant={isActive('/malayalam') || isActive('/arabic') ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate('/malayalam')}
              className={`flex items-center gap-2 transition-all ${
                isActive('/malayalam') || isActive('/arabic')
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'hover:bg-orange-50 hover:text-orange-700'
              }`}
              title="Language Learning Adventures"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden md:inline">Language Learning Adventures</span>
              <span className="hidden sm:inline md:hidden">Languages</span>
            </Button>

            {/* Learning Activities by Subject - Navigate to home with scroll */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (location.pathname !== '/') {
                  navigate('/');
                } else {
                  // Scroll to activities section
                  setTimeout(() => {
                    const activitiesSection = document.querySelector('.category-tabs');
                    if (activitiesSection) {
                      activitiesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }
              }}
              className="flex items-center gap-2 hover:bg-green-50 hover:text-green-700 transition-all"
              title="Learning Activities by Subject"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden lg:inline">Learning Activities by Subject</span>
              <span className="hidden md:inline lg:hidden">Activities</span>
              <span className="hidden sm:inline md:hidden">Learn</span>
            </Button>
          </div>

          {/* Right side - Try Integrated Platform */}
          <div className="flex items-center">
            {onTogglePlatform && (
              <Button
                onClick={onTogglePlatform}
                size="sm"
                className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 transition-all"
                title="Try Integrated Platform"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden md:inline">Try Integrated Platform</span>
                <span className="hidden sm:inline md:hidden">Platform</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyTopMenu;