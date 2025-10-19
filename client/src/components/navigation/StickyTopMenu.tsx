import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
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
  ChevronDown,
  Sun,
  Moon,
  Settings
} from 'lucide-react';

interface StickyTopMenuProps {
  // onTogglePlatform removed - now using navigation
}

const StickyTopMenu: React.FC<StickyTopMenuProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleIntegratedPlatform = () => {
    if (!isAuthenticated) {
      const userConfirmed = window.confirm('Only logged-in users can access this page. Please log in to continue.');
      if (userConfirmed) {
        navigate('/');
      }
      return;
    }
    navigate('/integratedplatform');
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
      path: '/ai-homework', 
      label: 'AI Homework', 
      icon: BookOpen,
      description: 'Get AI-powered homework help and practice'
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
              onClick={handleIntegratedPlatform}
              size="sm"
              className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 transition-all"
              title="Try Integrated Platform"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden md:inline">Try Integrated Platform</span>
              <span className="hidden sm:inline md:hidden">Platform</span>
            </Button>

            {/* User Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-blue-50 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isAuthenticated && user ? (user.profile?.firstName || user.username) : 'Menu'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Theme Toggle */}
                <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-2">
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-4 h-4" />
                      Switch to Dark
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4" />
                      Switch to Light
                    </>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Authentication-based menu items */}
                {isAuthenticated && user ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isLoggingOut}
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/login')} className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Login
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyTopMenu;