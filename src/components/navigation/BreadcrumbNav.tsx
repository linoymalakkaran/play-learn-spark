import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, BookOpen, Users, Gamepad2, Palette } from 'lucide-react';
import { soundEffects } from '@/utils/sounds';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface BreadcrumbNavProps {
  customItems?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ 
  customItems, 
  showHome = true, 
  className = '' 
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        path: '/',
        icon: <Home className="w-4 h-4" />,
        isActive: location.pathname === '/'
      });
    }

    // Enhanced path mapping with icons and proper labels
    const pathMap: Record<string, { label: string; icon: React.ReactNode }> = {
      'dashboard': { label: 'Learning Dashboard', icon: <Gamepad2 className="w-4 h-4" /> },
      'activities': { label: 'Activities', icon: <BookOpen className="w-4 h-4" /> },
      'profile': { label: 'Profile', icon: <Users className="w-4 h-4" /> },
      'settings': { label: 'Settings', icon: <Palette className="w-4 h-4" /> },
      'arabic': { label: 'Arabic Learning', icon: <span className="text-sm">🕌</span> },
      'malayalam': { label: 'Malayalam Learning', icon: <span className="text-sm">🌴</span> },
      'english': { label: 'English Learning', icon: <span className="text-sm">📚</span> },
      'math': { label: 'Math Activities', icon: <span className="text-sm">🔢</span> },
      'science': { label: 'Science Explorer', icon: <span className="text-sm">🔬</span> },
      'creative': { label: 'Creative Arts', icon: <span className="text-sm">🎨</span> },
      'world': { label: 'World Explorer', icon: <span className="text-sm">🌍</span> },
      'languages': { label: 'Language Learning', icon: <span className="text-sm">🗣️</span> },
    };

    pathSegments.forEach((segment, index) => {
      const currentPath = '/' + pathSegments.slice(0, index + 1).join('/');
      const segmentInfo = pathMap[segment] || { 
        label: segment.charAt(0).toUpperCase() + segment.slice(1), 
        icon: <BookOpen className="w-4 h-4" /> 
      };

      breadcrumbs.push({
        label: segmentInfo.label,
        path: currentPath,
        icon: segmentInfo.icon,
        isActive: currentPath === location.pathname
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = customItems || generateBreadcrumbs();

  const handleNavigation = async (path: string) => {
    await soundEffects.playClick();
    navigate(path);
  };

  if (breadcrumbItems.length <= 1 && !customItems) {
    return null; // Don't show breadcrumbs for home page unless custom items provided
  }

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm text-muted-foreground p-3 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 ${className}`}
      aria-label="Breadcrumb navigation"
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          <Button
            variant={item.isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={() => !item.isActive && handleNavigation(item.path)}
            className={`h-8 px-2 py-1 text-xs font-medium transition-all duration-200 ${
              item.isActive 
                ? 'text-primary bg-primary/10 cursor-default' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
            }`}
            disabled={item.isActive}
            aria-current={item.isActive ? 'page' : undefined}
          >
            <span className="flex items-center gap-1.5">
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.label.split(' ')[0]}</span>
            </span>
          </Button>

          {index < breadcrumbItems.length - 1 && (
            <ChevronRight 
              className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" 
              aria-hidden="true"
            />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNav;