import React, { Suspense, lazy, ComponentType } from 'react';
import { Activity } from '@/types/learning';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface LazyActivityWrapperProps {
  activityId: string;
  activity: Activity;
  onComplete: (activityId: string, score: number) => void;
  onProgressUpdate?: (progress: any) => void;
}

// Activity Loading Component
const ActivityLoadingSkeleton: React.FC = () => (
  <Card className="w-full h-[500px] border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
    <CardContent className="p-8 flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center space-y-6">
        {/* Icon skeleton */}
        <Skeleton className="w-16 h-16 rounded-full" />
        
        {/* Title skeleton */}
        <Skeleton className="h-8 w-48" />
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-52" />
        </div>
        
        {/* Loading spinner */}
        <LoadingSpinner size="lg" />
        
        {/* Progress text */}
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading activity...
        </p>
      </div>
    </CardContent>
  </Card>
);

// Error Boundary for Activity Loading
class ActivityErrorBoundary extends React.Component<
  { children: React.ReactNode; activityId: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; activityId: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error loading activity ${this.props.activityId}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full h-[500px] border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-8 flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-xl font-bold text-red-600">Oops! Something went wrong</h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                We couldn't load this activity right now. Please try again later or choose a different activity.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Lazy Activity Components Map
const lazyActivityComponents = new Map<string, React.LazyExoticComponent<ComponentType<any>>>([
  // English Activities
  ['animal-safari', lazy(() => import('@/components/activities/AnimalSafari').then(module => ({ default: module.AnimalSafari })))],
  ['color-rainbow', lazy(() => import('@/components/activities/ColorRainbow').then(module => ({ default: module.ColorRainbow })))],
  ['family-tree', lazy(() => import('@/components/activities/FamilyTree').then(module => ({ default: module.FamilyTree })))],
  ['body-parts', lazy(() => import('@/components/activities/BodyParts').then(module => ({ default: module.BodyParts })))],
  ['weather-station', lazy(() => import('@/components/activities/WeatherStation').then(module => ({ default: module.WeatherStation })))],
  ['transportation', lazy(() => import('@/components/activities/Transportation').then(module => ({ default: module.Transportation })))],
  ['emotion-faces', lazy(() => import('@/components/activities/EmotionFaces').then(module => ({ default: module.EmotionFaces })))],
  ['pet-parade', lazy(() => import('@/components/activities/PetParade').then(module => ({ default: module.PetParade })))],
  
  // Math Activities
  ['number-garden', lazy(() => import('@/components/activities/NumberGarden').then(module => ({ default: module.NumberGarden })))],
  ['shape-detective', lazy(() => import('@/components/activities/ShapeDetective').then(module => ({ default: module.ShapeDetective })))],
  ['counting-train', lazy(() => import('@/components/activities/CountingTrain').then(module => ({ default: module.CountingTrain })))],
  ['size-sorter', lazy(() => import('@/components/activities/SizeSorter').then(module => ({ default: module.SizeSorter })))],
  ['pizza-fractions', lazy(() => import('@/components/activities/PizzaFractions').then(module => ({ default: module.PizzaFractions })))],
  
  // Language Activities
  ['enhanced-malayalam-learning', lazy(() => import('@/components/activities/EnhancedMalayalamLearning'))],
  ['enhanced-arabic-learning', lazy(() => import('@/components/activities/EnhancedArabicLearning'))],
  
  // Fallback for unknown activities
  ['placeholder', lazy(() => import('@/components/activities/PlaceholderActivity').then(module => ({ default: module.PlaceholderActivity })))]
]);

// Type declarations for global objects
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Performance monitoring hook
const useActivityPerformance = (activityId: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log performance metrics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'activity_load_time', {
          event_category: 'Performance',
          event_label: activityId,
          value: Math.round(loadTime)
        });
      }
      
      // Store in performance API if available
      if ('performance' in window && 'measure' in window.performance) {
        try {
          performance.mark(`activity-${activityId}-end`);
          performance.measure(
            `activity-${activityId}-load`,
            `activity-${activityId}-start`,
            `activity-${activityId}-end`
          );
        } catch (e) {
          // Silently fail if marks don't exist
        }
      }
    };
  }, [activityId]);
  
  React.useEffect(() => {
    // Mark the start of activity loading
    if ('performance' in window && 'mark' in window.performance) {
      performance.mark(`activity-${activityId}-start`);
    }
  }, [activityId]);
};

const LazyActivityWrapper: React.FC<LazyActivityWrapperProps> = ({
  activityId,
  activity,
  onComplete,
  onProgressUpdate
}) => {
  useActivityPerformance(activityId);
  
  // Get the lazy component for this activity
  const LazyComponent = lazyActivityComponents.get(activityId) || 
                       lazyActivityComponents.get('placeholder')!;
  
  return (
    <ActivityErrorBoundary activityId={activityId}>
      <Suspense fallback={<ActivityLoadingSkeleton />}>
        <LazyComponent
          onComplete={(score: number) => onComplete(activityId, score)}
          onProgressUpdate={onProgressUpdate}
          activity={activity}
        />
      </Suspense>
    </ActivityErrorBoundary>
  );
};

// Helper function to preload activity components
export const preloadActivity = (activityId: string): Promise<void> => {
  const LazyComponent = lazyActivityComponents.get(activityId);
  if (LazyComponent) {
    // Preload the component by triggering the lazy import
    return (LazyComponent as any)._payload?._result || 
           import('@/components/activities/PlaceholderActivity').then(() => {});
  }
  return Promise.resolve();
};

// Helper function to preload multiple activities
export const preloadActivities = (activityIds: string[]): Promise<void[]> => {
  return Promise.all(activityIds.map(preloadActivity));
};

// Helper function to get activity loading priority
export const getActivityLoadingPriority = (activityId: string, userPreferences?: any): 'high' | 'medium' | 'low' => {
  // High priority for activities the user frequently accesses
  if (userPreferences?.favorites?.includes(activityId)) {
    return 'high';
  }
  
  // Medium priority for activities in the user's preferred categories
  if (userPreferences?.favoriteCategories?.some((cat: string) => activityId.includes(cat))) {
    return 'medium';
  }
  
  return 'low';
};

export default LazyActivityWrapper;