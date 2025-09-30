import React, { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import PerformanceMonitoringService from '@/services/PerformanceMonitoringService';

// Loading component for routes
const RouteLoading: React.FC<{ routeName?: string }> = ({ routeName }) => (
  <div className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft p-4">
    <div className="max-w-6xl mx-auto">
      <Card className="w-full h-96 flex items-center justify-center">
        <CardContent className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            {routeName ? `Loading ${routeName}...` : 'Loading page...'}
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Performance-tracked lazy loading function
const createLazyRoute = (routeName: string, importFn: () => Promise<{ default: React.ComponentType<any> }>) => {
  const performanceService = PerformanceMonitoringService.getInstance();
  
  return lazy(async () => {
    const loadMeasurement = performanceService.measureBundleLoad(`route-${routeName}`);
    
    try {
      const component = await importFn();
      loadMeasurement.finish();
      return component;
    } catch (error) {
      loadMeasurement.finish();
      console.error(`Failed to load route ${routeName}:`, error);
      throw error;
    }
  });
};

// Lazy route components with performance tracking
export const LazyIndex = createLazyRoute(
  'Home',
  () => import('@/pages/Index')
);

export const LazyDashboard = createLazyRoute(
  'Dashboard',
  async () => {
    const module = await import('@/components/Dashboard');
    return { default: module.Dashboard };
  }
);

export const LazyWelcomeScreen = createLazyRoute(
  'Welcome',
  async () => {
    const module = await import('@/components/WelcomeScreen');
    return { default: module.WelcomeScreen };
  }
);

export const LazyNotFound = createLazyRoute(
  'Not Found',
  () => import('@/pages/NotFound')
);

// Language learning routes
export const LazyArabicRoute = createLazyRoute(
  'Arabic Learning',
  () => import('@/components/activities/EnhancedArabicLearning')
);

export const LazyMalayalamRoute = createLazyRoute(
  'Malayalam Learning',
  () => import('@/components/activities/EnhancedMalayalamLearning')
);

// Higher-order component for route error boundaries
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode; routeName: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Route error in ${this.props.routeName}:`, error, errorInfo);
    
    // Report to performance monitoring
    const performanceService = PerformanceMonitoringService.getInstance();
    performanceService['sendToAnalytics']('route-error', {
      route: this.props.routeName,
      error: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft p-4">
          <div className="max-w-2xl mx-auto pt-20">
            <Card className="border-destructive">
              <CardContent className="text-center space-y-6 p-8">
                <div className="text-destructive text-6xl">😵</div>
                <div>
                  <h1 className="text-2xl font-bold text-destructive mb-2">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-muted-foreground">
                    We're sorry, but something unexpected happened while loading this page.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => this.setState({ hasError: false, error: null })}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Try Again
                  </button>
                  <div>
                    <button
                      onClick={() => window.history.back()}
                      className="px-4 py-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <details className="text-left mt-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                      {this.state.error?.stack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for lazy routes
export const LazyRouteWrapper: React.FC<{
  routeName: string;
  children: React.ReactNode;
}> = ({ routeName, children }) => (
  <RouteErrorBoundary routeName={routeName}>
    <Suspense fallback={<RouteLoading routeName={routeName} />}>
      {children}
    </Suspense>
  </RouteErrorBoundary>
);

// Route preloader hook
export const useRoutePreloader = () => {
  const preloadRoute = (routeName: string) => {
    const routeImports: Record<string, () => Promise<any>> = {
      'dashboard': async () => {
        const module = await import('@/components/Dashboard');
        return { default: module.Dashboard };
      },
      'welcome': async () => {
        const module = await import('@/components/WelcomeScreen');
        return { default: module.WelcomeScreen };
      },
      'arabic': () => import('@/components/activities/EnhancedArabicLearning'),
      'malayalam': () => import('@/components/activities/EnhancedMalayalamLearning'),
      'index': () => import('@/pages/Index'),
      'notfound': () => import('@/pages/NotFound')
    };

    const importFn = routeImports[routeName.toLowerCase()];
    if (importFn) {
      // Preload but don't wait
      importFn().catch(() => {
        // Silently handle preload failures
      });
    }
  };

  return { preloadRoute };
};

export default LazyRouteWrapper;