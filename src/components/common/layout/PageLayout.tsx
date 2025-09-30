import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { HelpButton } from '@/components/common/HelpButton';
import EnhancedBreadcrumb from '@/components/navigation/EnhancedBreadcrumb';
import { ArrowLeft } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showBreadcrumbs?: boolean;
  showHelp?: boolean;
  headerActions?: React.ReactNode;
  sidebar?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'centered' | 'fullwidth';
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  description,
  showBackButton = false,
  onBack,
  showBreadcrumbs = true,
  showHelp = true,
  headerActions,
  sidebar,
  isLoading = false,
  className = '',
  contentClassName = '',
  variant = 'default'
}) => {
  const getLayoutClasses = () => {
    switch (variant) {
      case 'centered':
        return 'max-w-4xl mx-auto';
      case 'fullwidth':
        return 'w-full';
      default:
        return 'max-w-6xl mx-auto';
    }
  };

  const getContentClasses = () => {
    const baseClasses = 'space-y-6';
    
    if (sidebar) {
      return `${baseClasses} lg:grid lg:grid-cols-4 lg:gap-8 lg:space-y-0`;
    }
    
    return baseClasses;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-primary-soft/20 to-secondary-soft/20 ${className}`}>
      <div className={`p-4 ${getLayoutClasses()}`}>
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="mb-6">
            <EnhancedBreadcrumb 
              showBackButton={showBackButton}
              className="bg-white/50 backdrop-blur-sm rounded-lg p-3"
            />
          </div>
        )}

        {/* Page Header */}
        {(title || subtitle || description || headerActions || showBackButton) && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Back Button & Title Row */}
                  <div className="flex items-center space-x-4 mb-2">
                    {showBackButton && onBack && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onBack}
                        className="flex items-center space-x-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </Button>
                    )}
                    
                    {title && (
                      <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {title}
                      </CardTitle>
                    )}
                  </div>

                  {/* Subtitle */}
                  {subtitle && (
                    <h2 className="text-lg md:text-xl text-gray-600 mb-2">
                      {subtitle}
                    </h2>
                  )}

                  {/* Description */}
                  {description && (
                    <p className="text-gray-600 max-w-3xl">
                      {description}
                    </p>
                  )}
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-2">
                  {headerActions}
                  {showHelp && <HelpButton variant="inline" />}
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </CardContent>
          </Card>
        ) : (
          /* Main Content */
          <div className={getContentClasses()}>
            {/* Sidebar */}
            {sidebar && (
              <div className="lg:col-span-1 mb-6 lg:mb-0">
                <div className="sticky top-6 space-y-4">
                  {sidebar}
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className={`${sidebar ? 'lg:col-span-3' : ''} ${contentClassName}`}>
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayout;