import React, { ReactNode, useState } from 'react';
import { ArrowLeft, Home, Settings, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showSettingsButton?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBackButton = true,
  showHomeButton = true,
  showSettingsButton = false,
  className,
  headerClassName,
  contentClassName
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isHomePage = location.pathname === '/';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleSettings = () => {
    // TODO: Implement settings page
    console.log('Settings clicked - to be implemented');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfile = () => {
    // TODO: Navigate to profile page
    console.log('Profile clicked - to be implemented');
  };

  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
      className
    )}>
      {/* Header */}
      {(title || showBackButton || showHomeButton || showSettingsButton) && (
        <header className={cn(
          'sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm',
          headerClassName
        )}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left side - Back button and title */}
              <div className="flex items-center gap-3">
                {showBackButton && !isHomePage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="p-2 hover:bg-blue-100 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-blue-600" />
                  </Button>
                )}
                
                {title && (
                  <h1 className="text-xl font-bold text-gray-800 truncate">
                    {title}
                  </h1>
                )}
              </div>

              {/* Right side - Action buttons */}
              <div className="flex items-center gap-2">
                {showHomeButton && !isHomePage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleHome}
                    className="p-2 hover:bg-blue-100 transition-colors"
                  >
                    <Home className="w-5 h-5 text-blue-600" />
                  </Button>
                )}
                
                {showSettingsButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSettings}
                    className="p-2 hover:bg-blue-100 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-blue-600" />
                  </Button>
                )}

                {/* User Menu */}
                {isAuthenticated && user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-blue-100 transition-colors"
                        disabled={isLoading}
                      >
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">
                          {user.profile.firstName || user.username}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">
                          {user.profile.firstName} {user.profile.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        disabled={isLoggingOut}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={cn(
        'container mx-auto px-4 py-6',
        contentClassName
      )}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-white/20 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium text-blue-600">Play Learn Spark</p>
            <p>Making learning fun for children aged 3-6</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Specialized layout for learning pages
interface LearningLayoutProps {
  children: ReactNode;
  title: string;
  language?: string;
  progress?: number;
  onProgressUpdate?: (progress: number) => void;
}

export const LearningLayout: React.FC<LearningLayoutProps> = ({
  children,
  title,
  language,
  progress,
  onProgressUpdate
}) => {
  return (
    <Layout
      title={`${title}${language ? ` - ${language}` : ''}`}
      showBackButton={true}
      showHomeButton={true}
      className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50"
      headerClassName="bg-green-50/80"
    >
      {/* Progress bar */}
      {typeof progress === 'number' && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      {children}
    </Layout>
  );
};

export default Layout;