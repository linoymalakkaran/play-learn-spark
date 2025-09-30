import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Loading Components for different page types
const PageLoadingSkeleton: React.FC<{ type: 'dashboard' | 'activity' | 'language' | 'simple' }> = ({ type }) => {
  switch (type) {
    case 'dashboard':
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft p-4">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header skeleton */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-12 w-32" />
              </div>
            </Card>
            
            {/* Progress skeleton */}
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="text-center space-y-2">
                    <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                    <Skeleton className="h-6 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                ))}\n              </div>
            </Card>
            
            {/* Activity grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </Card>
              ))}\n            </div>
          </div>
        </div>
      );
      
    case 'language':
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-green-50 to-blue-50 p-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="text-center space-y-6">
                <Skeleton className="h-12 w-64 mx-auto" />
                <Skeleton className="h-6 w-96 mx-auto" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-6">
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                        <Skeleton className="h-6 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      );
      
    case 'activity':
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-soft to-secondary-soft p-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-64 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading page...</p>
          </div>
        </div>
      );
  }
};

// Lazy load main pages with performance monitoring
const Index = lazy(() => {
  const start = performance.now();
  return import('@/pages/Index').then(module => {
    const end = performance.now();
    console.log(`Index page loaded in ${end - start}ms`);
    return module;
  });
});

const NotFound = lazy(() => {
  const start = performance.now();
  return import('@/pages/NotFound').then(module => {
    const end = performance.now();
    console.log(`NotFound page loaded in ${end - start}ms`);
    return module;
  });
});

// Lazy load language learning pages
const EnhancedMalayalamLearning = lazy(() => {
  const start = performance.now();
  return import('@/components/activities/EnhancedMalayalamLearning').then(module => {
    const end = performance.now();
    console.log(`Malayalam learning loaded in ${end - start}ms`);
    return { default: module.default };
  });
});

const EnhancedArabicLearning = lazy(() => {
  const start = performance.now();
  return import('@/components/activities/EnhancedArabicLearning').then(module => {
    const end = performance.now();
    console.log(`Arabic learning loaded in ${end - start}ms`);
    return { default: module.default };
  });
});

// Error Boundary for Route Loading
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode; routeName: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; routeName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error loading route ${this.props.routeName}:`, error, errorInfo);
    
    // Report to error tracking service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: `Route loading error: ${this.props.routeName}`,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Page Not Loading</h2>
              <p className="text-gray-600 mb-6">
                We're having trouble loading this page. Please try again or go back to the home page.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Go Home
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Route wrapper with error boundary and loading
const RouteWrapper: React.FC<{
  children: React.ReactNode;
  routeName: string;
  loadingType: 'dashboard' | 'activity' | 'language' | 'simple';
}> = ({ children, routeName, loadingType }) => (
  <RouteErrorBoundary routeName={routeName}>
    <Suspense fallback={<PageLoadingSkeleton type={loadingType} />}>
      {children}
    </Suspense>
  </RouteErrorBoundary>
);

// Main Router Component with Performance Optimization
const PerformantRouter: React.FC = () => {
  // Preload critical routes on mount
  React.useEffect(() => {
    const preloadCriticalRoutes = async () => {
      try {
        // Preload Index page immediately
        await Index;
        
        // Preload language learning pages after a delay
        setTimeout(() => {
          EnhancedMalayalamLearning;
          EnhancedArabicLearning;
        }, 2000);
      } catch (error) {
        console.warn('Failed to preload some routes:', error);
      }
    };

    preloadCriticalRoutes();
  }, []);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <RouteWrapper routeName="index" loadingType="dashboard">
            <Index />
          </RouteWrapper>
        } 
      />
      
      <Route 
        path="/malayalam" 
        element={
          <RouteWrapper routeName="malayalam" loadingType="language">
            <EnhancedMalayalamLearning 
              childAge={4} 
              onComplete={() => {}} 
              onBack={() => window.history.back()}
            />
          </RouteWrapper>
        } 
      />
      
      <Route 
        path="/arabic" 
        element={
          <RouteWrapper routeName="arabic" loadingType="language">
            <EnhancedArabicLearning 
              childAge={4}
              onComplete={() => {}}
              onBack={() => window.history.back()}
            />
          </RouteWrapper>
        } 
      />
      
      <Route 
        path="/404" 
        element={
          <RouteWrapper routeName="notfound" loadingType="simple">
            <NotFound />
          </RouteWrapper>
        } 
      />
      
      {/* Catch all redirect to 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

// Helper function to preload routes based on user behavior
export const preloadRoute = (routeName: string): Promise<void> => {
  switch (routeName) {
    case 'malayalam':
      return import('@/components/activities/EnhancedMalayalamLearning').then(() => {});
    case 'arabic':
      return import('@/components/activities/EnhancedArabicLearning').then(() => {});
    case 'index':
      return import('@/pages/Index').then(() => {});
    case 'notfound':
      return import('@/pages/NotFound').then(() => {});
    default:
      return Promise.resolve();
  }
};

// Hook for intelligent route preloading
export const useIntelligentPreloading = () => {
  const preloadBasedOnUserBehavior = React.useCallback(() => {
    // Check user's language preferences
    const userPrefs = localStorage.getItem('navigation-store');
    if (userPrefs) {
      try {
        const parsed = JSON.parse(userPrefs);
        const favoriteCategories = parsed.state?.analytics?.userPreferences?.favoriteCategories || [];
        
        // Preload language routes if user shows interest in languages
        if (favoriteCategories.includes('languages')) {
          setTimeout(() => {
            preloadRoute('malayalam');
            preloadRoute('arabic');
          }, 1000);
        }
      } catch (error) {
        console.warn('Failed to parse user preferences for preloading:', error);
      }
    }
  }, []);

  React.useEffect(() => {
    preloadBasedOnUserBehavior();
  }, [preloadBasedOnUserBehavior]);
};

export default PerformantRouter;