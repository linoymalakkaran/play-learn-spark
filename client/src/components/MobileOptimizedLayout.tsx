import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

import {
  Menu,
  X,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  RotateCcw,
  RefreshCw,
  Settings,
  User,
  Home,
  BookOpen,
  Activity,
  MessageSquare,
  Award,
  Calendar,
  Search,
  Filter,
  Plus,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Maximize,
  Minimize,
  ExternalLink,
  Share,
  Download,
  Upload,
  Save,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Heart,
  Star,
  Bookmark,
  Flag,
  Pin,
  Archive,
  Move,
  Layers,
  Grid,
  List,
  Map,
  BarChart3,
  PieChart,
  TrendingUp,
  Zap,
  Target,
  Brain,
  Lightbulb,
  Clock,
  Timer,
  PlayCircle,
  PauseCircle,
  Square,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Repeat,
  Shuffle,
  Mic,
  MicOff,
  Camera,
  Video,
  VideoOff,
  Image,
  File,
  Folder,
  FolderOpen,
  Link,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Route,
  Car,
  Plane,
  Ship,
  Train
} from 'lucide-react';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  currentUser?: User;
  onNavigate?: (route: string) => void;
  onModeChange?: (mode: 'light' | 'dark') => void;
}

interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  avatar?: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  notifications: NotificationPreferences;
  layout: LayoutPreferences;
}

interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  sound: boolean;
  vibration: boolean;
}

interface LayoutPreferences {
  sidebarPosition: 'left' | 'right' | 'hidden';
  compactMode: boolean;
  showLabels: boolean;
  quickActions: string[];
  pinnedItems: string[];
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  screenSize: {
    width: number;
    height: number;
  };
  pixelRatio: number;
  touchSupport: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'offline';
  batteryLevel?: number;
  isCharging?: boolean;
  performance: {
    memory: number;
    cores: number;
    bandwidth: number;
  };
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  badge?: number;
  isActive?: boolean;
  children?: NavigationItem[];
  roles: string[];
  category: 'primary' | 'secondary' | 'utility';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  category: string;
}

interface MobileLayoutState {
  isMenuOpen: boolean;
  isSearchOpen: boolean;
  isNotificationOpen: boolean;
  isProfileOpen: boolean;
  orientation: 'portrait' | 'landscape';
  keyboardVisible: boolean;
  currentRoute: string;
  breadcrumb: BreadcrumbItem[];
}

interface BreadcrumbItem {
  label: string;
  route: string;
  icon?: React.ReactNode;
}

const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  currentUser,
  onNavigate,
  onModeChange
}) => {
  // Device and layout state
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [layoutState, setLayoutState] = useState<MobileLayoutState>({
    isMenuOpen: false,
    isSearchOpen: false,
    isNotificationOpen: false,
    isProfileOpen: false,
    orientation: 'portrait',
    keyboardVisible: false,
    currentRoute: 'dashboard',
    breadcrumb: []
  });
  
  // UI state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isOffline, setIsOffline] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for gesture handling
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Navigation items based on user role
  const getNavigationItems = useCallback((): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <Home className="w-5 h-5" />,
        route: '/dashboard',
        isActive: layoutState.currentRoute === 'dashboard',
        roles: ['student', 'teacher', 'parent', 'admin'],
        category: 'primary'
      },
      {
        id: 'learning',
        label: 'Learning',
        icon: <BookOpen className="w-5 h-5" />,
        route: '/learning',
        isActive: layoutState.currentRoute === 'learning',
        roles: ['student', 'teacher'],
        category: 'primary',
        children: [
          {
            id: 'activities',
            label: 'Activities',
            icon: <PlayCircle className="w-4 h-4" />,
            route: '/learning/activities',
            roles: ['student', 'teacher'],
            category: 'secondary'
          },
          {
            id: 'assignments',
            label: 'Assignments',
            icon: <File className="w-4 h-4" />,
            route: '/learning/assignments',
            roles: ['student', 'teacher'],
            category: 'secondary'
          },
          {
            id: 'assessments',
            label: 'Assessments',
            icon: <Target className="w-4 h-4" />,
            route: '/learning/assessments',
            roles: ['student', 'teacher'],
            category: 'secondary'
          }
        ]
      },
      {
        id: 'progress',
        label: 'Progress',
        icon: <Activity className="w-5 h-5" />,
        route: '/progress',
        isActive: layoutState.currentRoute === 'progress',
        roles: ['student', 'teacher', 'parent'],
        category: 'primary'
      },
      {
        id: 'communication',
        label: 'Messages',
        icon: <MessageSquare className="w-5 h-5" />,
        route: '/communication',
        badge: 3,
        isActive: layoutState.currentRoute === 'communication',
        roles: ['student', 'teacher', 'parent'],
        category: 'primary'
      },
      {
        id: 'achievements',
        label: 'Achievements',
        icon: <Award className="w-5 h-5" />,
        route: '/achievements',
        isActive: layoutState.currentRoute === 'achievements',
        roles: ['student', 'parent'],
        category: 'secondary'
      },
      {
        id: 'calendar',
        label: 'Calendar',
        icon: <Calendar className="w-5 h-5" />,
        route: '/calendar',
        isActive: layoutState.currentRoute === 'calendar',
        roles: ['student', 'teacher', 'parent'],
        category: 'secondary'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings className="w-5 h-5" />,
        route: '/settings',
        isActive: layoutState.currentRoute === 'settings',
        roles: ['student', 'teacher', 'parent', 'admin'],
        category: 'utility'
      }
    ];

    return baseItems.filter(item => 
      currentUser ? item.roles.includes(currentUser.role) : true
    );
  }, [currentUser, layoutState.currentRoute]);

  // Quick actions based on context
  const getQuickActions = useCallback((): QuickAction[] => {
    return [
      {
        id: 'new-activity',
        label: 'Start Activity',
        icon: <PlayCircle className="w-5 h-5" />,
        action: () => onNavigate?.('/learning/activities/new'),
        color: 'bg-blue-500',
        category: 'learning'
      },
      {
        id: 'quick-message',
        label: 'Quick Message',
        icon: <MessageSquare className="w-5 h-5" />,
        action: () => setLayoutState(prev => ({ ...prev, isNotificationOpen: true })),
        color: 'bg-green-500',
        category: 'communication'
      },
      {
        id: 'progress-check',
        label: 'Check Progress',
        icon: <BarChart3 className="w-5 h-5" />,
        action: () => onNavigate?.('/progress'),
        color: 'bg-purple-500',
        category: 'analytics'
      },
      {
        id: 'voice-note',
        label: 'Voice Note',
        icon: <Mic className="w-5 h-5" />,
        action: () => {/* Start voice recording */},
        color: 'bg-orange-500',
        category: 'utility'
      }
    ];
  }, [onNavigate]);

  // Device detection and responsive behavior
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      const touchSupport = 'ontouchstart' in window;
      
      let type: DeviceInfo['type'] = 'desktop';
      if (width <= 768) type = 'mobile';
      else if (width <= 1024) type = 'tablet';
      
      const orientation = width > height ? 'landscape' : 'portrait';
      
      setDeviceInfo({
        type,
        orientation,
        screenSize: { width, height },
        pixelRatio,
        touchSupport,
        connectionType: navigator.onLine ? 'wifi' : 'offline',
        performance: {
          memory: (navigator as any).deviceMemory || 4,
          cores: navigator.hardwareConcurrency || 4,
          bandwidth: (navigator as any).connection?.downlink || 10
        }
      });
      
      setLayoutState(prev => ({ ...prev, orientation }));
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);
    
    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keyboard detection for mobile
  useEffect(() => {
    const handleResize = () => {
      if (deviceInfo?.type === 'mobile') {
        const heightDiff = window.screen.height - window.innerHeight;
        const keyboardVisible = heightDiff > 150;
        setLayoutState(prev => ({ ...prev, keyboardVisible }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [deviceInfo]);

  // Touch gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Swipe detection
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;
    
    if (deltaTime < maxSwipeTime) {
      if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        // Horizontal swipe
        if (deltaX > 0) {
          // Swipe right - open menu
          setLayoutState(prev => ({ ...prev, isMenuOpen: true }));
        } else {
          // Swipe left - close menu
          setLayoutState(prev => ({ ...prev, isMenuOpen: false }));
        }
      }
    }
    
    touchStartRef.current = null;
  }, []);

  // Navigation handler
  const handleNavigate = useCallback((route: string) => {
    setLayoutState(prev => ({
      ...prev,
      currentRoute: route.replace('/', ''),
      isMenuOpen: false,
      isSearchOpen: false
    }));
    
    if (onNavigate) {
      onNavigate(route);
    }
  }, [onNavigate]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (onModeChange) {
      onModeChange(newTheme);
    }
  }, [theme, onModeChange]);

  // Close overlays on outside click
  const closeOverlays = useCallback(() => {
    setLayoutState(prev => ({
      ...prev,
      isMenuOpen: false,
      isSearchOpen: false,
      isNotificationOpen: false,
      isProfileOpen: false
    }));
  }, []);

  if (!deviceInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isMobile = deviceInfo.type === 'mobile';
  const isTablet = deviceInfo.type === 'tablet';
  const navigationItems = getNavigationItems();
  const quickActions = getQuickActions();

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen bg-gray-50 ${theme === 'dark' ? 'dark' : ''} ${layoutState.keyboardVisible ? 'keyboard-visible' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader
          user={currentUser}
          isOffline={isOffline}
          onMenuToggle={() => setLayoutState(prev => ({ ...prev, isMenuOpen: !prev.isMenuOpen }))}
          onSearchToggle={() => setLayoutState(prev => ({ ...prev, isSearchOpen: !prev.isSearchOpen }))}
          onNotificationToggle={() => setLayoutState(prev => ({ ...prev, isNotificationOpen: !prev.isNotificationOpen }))}
          onProfileToggle={() => setLayoutState(prev => ({ ...prev, isProfileOpen: !prev.isProfileOpen }))}
          notificationCount={notifications.length}
          currentRoute={layoutState.currentRoute}
        />
      )}

      {/* Tablet/Desktop Header */}
      {!isMobile && (
        <DesktopHeader
          user={currentUser}
          isOffline={isOffline}
          navigationItems={navigationItems}
          onNavigate={handleNavigate}
          onThemeToggle={toggleTheme}
          theme={theme}
          deviceInfo={deviceInfo}
        />
      )}

      {/* Mobile Side Menu */}
      {isMobile && (
        <MobileSideMenu
          isOpen={layoutState.isMenuOpen}
          onClose={() => setLayoutState(prev => ({ ...prev, isMenuOpen: false }))}
          navigationItems={navigationItems}
          onNavigate={handleNavigate}
          user={currentUser}
          quickActions={quickActions}
        />
      )}

      {/* Search Overlay */}
      {layoutState.isSearchOpen && (
        <SearchOverlay
          onClose={() => setLayoutState(prev => ({ ...prev, isSearchOpen: false }))}
          isMobile={isMobile}
        />
      )}

      {/* Main Content Area */}
      <main className={`
        ${isMobile ? 'pt-16 pb-20' : isTablet ? 'pt-16' : 'pt-20'} 
        ${!isMobile ? 'pl-64' : ''} 
        transition-all duration-300 ease-in-out
        ${layoutState.keyboardVisible ? 'pb-0' : ''}
      `}>
        <div className="container mx-auto px-4 py-6">
          {/* Offline Banner */}
          {isOffline && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <WifiOff className="w-4 h-4" />
              <AlertTitle>You're offline</AlertTitle>
              <AlertDescription>
                Some features may be limited. We'll sync your data when you're back online.
              </AlertDescription>
            </Alert>
          )}

          {/* Breadcrumb Navigation */}
          {layoutState.breadcrumb.length > 0 && (
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              {layoutState.breadcrumb.map((item, index) => (
                <React.Fragment key={item.route}>
                  {index > 0 && <ChevronRight className="w-4 h-4" />}
                  <button
                    onClick={() => handleNavigate(item.route)}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Main Content */}
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNavigation
          navigationItems={navigationItems.filter(item => item.category === 'primary').slice(0, 5)}
          onNavigate={handleNavigate}
          quickActions={quickActions}
        />
      )}

      {/* Floating Action Button (Mobile) */}
      {isMobile && !layoutState.keyboardVisible && (
        <FloatingActionButton
          quickActions={quickActions}
          position="bottom-right"
        />
      )}

      {/* Notification Panel */}
      {layoutState.isNotificationOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setLayoutState(prev => ({ ...prev, isNotificationOpen: false }))}
          isMobile={isMobile}
        />
      )}

      {/* Profile Panel */}
      {layoutState.isProfileOpen && currentUser && (
        <ProfilePanel
          user={currentUser}
          onClose={() => setLayoutState(prev => ({ ...prev, isProfileOpen: false }))}
          isMobile={isMobile}
          onThemeToggle={toggleTheme}
          theme={theme}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile Header Component
interface MobileHeaderProps {
  user?: User;
  isOffline: boolean;
  onMenuToggle: () => void;
  onSearchToggle: () => void;
  onNotificationToggle: () => void;
  onProfileToggle: () => void;
  notificationCount: number;
  currentRoute: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  user,
  isOffline,
  onMenuToggle,
  onSearchToggle,
  onNotificationToggle,
  onProfileToggle,
  notificationCount,
  currentRoute
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onMenuToggle}>
          <Menu className="w-5 h-5" />
        </Button>
        
        <div>
          <h1 className="font-semibold text-gray-900 capitalize">
            {currentRoute.replace('-', ' ')}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {isOffline ? (
              <WifiOff className="w-3 h-3" />
            ) : (
              <Wifi className="w-3 h-3" />
            )}
            <span>{isOffline ? 'Offline' : 'Online'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onSearchToggle}>
          <Search className="w-5 h-5" />
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onNotificationToggle} className="relative">
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onProfileToggle}>
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
        </Button>
      </div>
    </header>
  );
};

// Desktop Header Component
interface DesktopHeaderProps {
  user?: User;
  isOffline: boolean;
  navigationItems: NavigationItem[];
  onNavigate: (route: string) => void;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
  deviceInfo: DeviceInfo;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  user,
  isOffline,
  navigationItems,
  onNavigate,
  onThemeToggle,
  theme,
  deviceInfo
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Play Learn Spark</h1>
          </div>
          
          <nav className="flex items-center gap-6">
            {navigationItems.filter(item => item.category === 'primary').map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.route)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  item.isActive 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge className="ml-1">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isOffline ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            <span>{deviceInfo.type}</span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onThemeToggle}>
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
          
          <Button variant="ghost" size="sm">
            <Search className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>
          
          {user && (
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Mobile Side Menu Component
interface MobileSideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  onNavigate: (route: string) => void;
  user?: User;
  quickActions: QuickAction[];
}

const MobileSideMenu: React.FC<MobileSideMenuProps> = ({
  isOpen,
  onClose,
  navigationItems,
  onNavigate,
  user,
  quickActions
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b">
            {user && (
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-left">{user.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                </div>
              </div>
            )}
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.route);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      item.isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                  
                  {item.children && item.isActive && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            onNavigate(child.route);
                            onClose();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                          {child.icon}
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            
            <Separator className="my-6" />
            
            <div>
              <Label className="text-sm font-medium text-gray-500 mb-3 block">Quick Actions</Label>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.slice(0, 4).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action();
                      onClose();
                    }}
                    className={`p-3 rounded-lg ${action.color} text-white text-center`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {action.icon}
                      <span className="text-xs font-medium">{action.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Mobile Bottom Navigation Component
interface MobileBottomNavigationProps {
  navigationItems: NavigationItem[];
  onNavigate: (route: string) => void;
  quickActions: QuickAction[];
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  navigationItems,
  onNavigate,
  quickActions
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-2 py-2">
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.route)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              item.isActive 
                ? 'text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge && (
                <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0 flex items-center justify-center text-xs">
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// Floating Action Button Component
interface FloatingActionButtonProps {
  quickActions: QuickAction[];
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  quickActions,
  position = 'bottom-right'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const positionClasses = {
    'bottom-right': 'bottom-24 right-4',
    'bottom-left': 'bottom-24 left-4',
    'top-right': 'top-24 right-4',
    'top-left': 'top-24 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-30`}>
      {isExpanded && (
        <div className="mb-4 space-y-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.action();
                setIsExpanded(false);
              }}
              className={`w-12 h-12 rounded-full ${action.color} text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center`}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 bg-blue-600 rounded-full text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

// Search Overlay Component
interface SearchOverlayProps {
  onClose: () => void;
  isMobile: boolean;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose, isMobile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className={`bg-white rounded-lg shadow-xl ${isMobile ? 'w-11/12 max-w-lg' : 'w-full max-w-2xl'} mx-4`}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities, content, messages..."
              className="border-0 focus:ring-0 text-lg"
              autoFocus
            />
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          {searchQuery ? (
            <div className="space-y-3">
              {/* Search results would go here */}
              <div className="text-center text-gray-500 py-8">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Start typing to search...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500 mb-2 block">Recent Searches</Label>
                <div className="space-y-2">
                  {['Fraction activities', 'Math progress', 'Assignment feedback'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setSearchQuery(item)}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{item}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-500 mb-2 block">Quick Access</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Activities', icon: <PlayCircle className="w-4 h-4" /> },
                    { label: 'Progress', icon: <BarChart3 className="w-4 h-4" /> },
                    { label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
                    { label: 'Calendar', icon: <Calendar className="w-4 h-4" /> }
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
                    >
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Notification Panel Component
interface NotificationPanelProps {
  notifications: any[];
  onClose: () => void;
  isMobile: boolean;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, isMobile }) => {
  if (isMobile) {
    return (
      <Drawer open={true} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notifications</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <div className="text-center text-gray-500 py-8">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No new notifications</p>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-xl border z-40">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-4">
        <div className="text-center text-gray-500 py-8">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No new notifications</p>
        </div>
      </div>
    </div>
  );
};

// Profile Panel Component
interface ProfilePanelProps {
  user: User;
  onClose: () => void;
  isMobile: boolean;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ user, onClose, isMobile, onThemeToggle, theme }) => {
  const content = (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
        )}
        <div>
          <div className="font-semibold">{user.name}</div>
          <div className="text-sm text-gray-500 capitalize">{user.role}</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <Switch checked={theme === 'dark'} onCheckedChange={onThemeToggle} />
        </div>
        
        <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        
        <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg">
          <User className="w-5 h-5" />
          <span>Profile</span>
        </button>
        
        <Separator />
        
        <button className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={true} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Profile</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-xl border z-40">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Profile</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-4">
        {content}
      </div>
    </div>
  );
};

export default MobileOptimizedLayout;