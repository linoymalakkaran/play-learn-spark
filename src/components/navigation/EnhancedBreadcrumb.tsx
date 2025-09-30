import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/stores/navigationStore';
import { ChevronLeft, Home, ChevronRight } from 'lucide-react';

interface EnhancedBreadcrumbProps {
  className?: string;
  showBackButton?: boolean;
  maxItems?: number;
}

const EnhancedBreadcrumb: React.FC<EnhancedBreadcrumbProps> = ({ 
  className = '', 
  showBackButton = true,
  maxItems = 4 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { breadcrumbs, canGoBack, goBack } = useNavigationStore();

  // Generate breadcrumbs from current path if none stored
  const generateBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const pathBreadcrumbs = [
      { id: 'home', title: 'Home', label: 'Home', path: '/', icon: 'home' }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format segment name
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Special cases for known routes
      if (segment === 'activities') label = 'Activities';
      else if (segment === 'languages') label = 'Languages';
      else if (segment === 'ai') label = 'AI Tools';
      else if (segment === 'personalization') label = 'Personalization';
      else if (segment === 'settings') label = 'Settings';
      else if (segment.includes('activity-')) {
        label = segment.replace('activity-', '').replace('-', ' ');
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }

      pathBreadcrumbs.push({
        id: segment,
        title: label,
        label: label,
        path: currentPath,
        icon: index === segments.length - 1 ? 'current' : 'folder'
      });
    });

    return pathBreadcrumbs;
  };

  const displayBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : generateBreadcrumbs();
  
  // Truncate breadcrumbs if too many
  const truncatedBreadcrumbs = displayBreadcrumbs.length > maxItems
    ? [
        displayBreadcrumbs[0], // Always show home
        { id: 'ellipsis', title: '...', label: '...', path: '', icon: 'ellipsis' },
        ...displayBreadcrumbs.slice(-2) // Show last 2 items
      ]
    : displayBreadcrumbs;

  const handleBreadcrumbClick = (path: string, label: string) => {
    if (path && path !== location.pathname) {
      navigate(path);
    }
  };

  return (
    <div className={`enhanced-breadcrumb flex items-center space-x-2 ${className}`}>
      {/* Back Button */}
      {showBackButton && canGoBack() && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList className="flex items-center space-x-1">
          {truncatedBreadcrumbs.map((crumb, index) => {
            const isLast = index === truncatedBreadcrumbs.length - 1;
            const isEllipsis = (crumb.label || crumb.title) === '...';
            const isHome = crumb.icon === 'home';
            const isCurrent = crumb.path === location.pathname;
            const displayLabel = crumb.label || crumb.title;

            return (
              <React.Fragment key={`${crumb.path}-${index}`}>
                <BreadcrumbItem>
                  {isEllipsis ? (
                    <span className="text-gray-400 px-2">...</span>
                  ) : isLast || isCurrent ? (
                    <BreadcrumbPage className="font-medium text-gray-800 flex items-center space-x-1">
                      {isHome && <Home className="h-3 w-3" />}
                      <span>{displayLabel}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={() => handleBreadcrumbClick(crumb.path, displayLabel)}
                      className="text-gray-600 hover:text-gray-800 cursor-pointer flex items-center space-x-1 transition-colors"
                    >
                      {isHome && <Home className="h-3 w-3" />}
                      <span>{displayLabel}</span>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                
                {!isLast && !isEllipsis && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-3 w-3 text-gray-400" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Quick Navigation Hints */}
      <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-500">
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-xs">⌘K</kbd>
        <span>Search</span>
      </div>
    </div>
  );
};

export default EnhancedBreadcrumb;