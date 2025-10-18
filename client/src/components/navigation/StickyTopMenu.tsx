import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  BookOpen, 
  GraduationCap,
  Languages,
  Brain,
  LogOut,
  User,
  MessageSquare,
  Gamepad2,
  ChevronDown
} from 'lucide-react';

interface StickyTopMenuProps {
  // onTogglePlatform removed - now using navigation
}

const StickyTopMenu: React.FC<StickyTopMenuProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const languageOptions = [
    { 
      path: '/english-learning', 
      label: 'English', 
      flag: '🇺🇸',
      description: 'Learn English alphabet and phonics'
    },
    { 
      path: '/hindi-learning', 
      label: 'Hindi', 
      flag: '🇮🇳',
      description: 'Learn Hindi and Devanagari script'
    },
    { 
      path: '/malayalam', 
      label: 'Malayalam', 
      flag: '🌴',
      description: 'Learn Malayalam language'
    },
    { 
      path: '/arabic', 
      label: 'Arabic', 
      flag: '🇸🇦',
      description: 'Learn Arabic language'
    },
    { 
      path: '/spanish', 
      label: 'Spanish', 
      flag: '🇪🇸',
      description: 'Learn Spanish language - ¡Aventura de Español!'
    }
  ];

  const isLanguagePage = languageOptions.some(lang => isActive(lang.path));
  const currentLanguage = languageOptions.find(lang => isActive(lang.path));

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
      path: '/rewards', 
      label: 'Rewards', 
      icon: Brain,
      description: 'View your rewards and achievements'
    },
    { 
      path: '/games', 
      label: 'Games', 
      icon: Gamepad2,
      description: 'Play fun games and earn points!'
    },
    { 
      path: '/feedback', 
      label: 'Feedback', 
      icon: MessageSquare,
      description: 'Share your feedback and read reviews'
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

            {/* Language Learning Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isLanguagePage ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 transition-all ${
                    isLanguagePage
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'hover:bg-purple-50 hover:text-purple-700'
                  }`}
                  title="Select Language to Learn"
                >
                  <Languages className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {currentLanguage ? `${currentLanguage.flag} ${currentLanguage.label}` : 'Languages'}
                  </span>
                  <span className="inline sm:hidden">
                    {currentLanguage ? currentLanguage.flag : 'Lang'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {languageOptions.map((language) => (
                  <DropdownMenuItem
                    key={language.path}
                    onClick={() => navigate(language.path)}
                    className={`flex items-center gap-3 cursor-pointer ${
                      isActive(language.path) ? 'bg-purple-50 text-purple-700' : ''
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{language.label}</div>
                      <div className="text-xs text-gray-500">{language.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side - Auth-aware actions */}
          <div className="flex items-center space-x-2">
            {/* Try Integrated Platform - always visible */}
            <Button
              onClick={() => navigate('/integratedplatform')}
              size="sm"
              className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 transition-all"
              title="Try Integrated Platform"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden md:inline">Try Integrated Platform</span>
              <span className="hidden sm:inline md:hidden">Platform</span>
            </Button>

            {/* Authentication-based buttons */}
            {isAuthenticated && user ? (
              <>
                {/* User Profile Button */}
                <Button
                  onClick={() => navigate('/profile')}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-blue-50 transition-all"
                  title="Go to Profile"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.profile.firstName || user.username}</span>
                </Button>
                
                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 transition-all"
                  disabled={isLoggingOut}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </span>
                </Button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Button
                  onClick={() => navigate('/login')}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 transition-all"
                  title="Login"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyTopMenu;