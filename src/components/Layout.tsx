import React, { ReactNode } from 'react';
import { ArrowLeft, Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

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