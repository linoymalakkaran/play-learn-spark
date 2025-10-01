import React, { Suspense, ComponentType, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import PerformanceMonitoringService from '@/services/PerformanceMonitoringService';

interface LazyLoadWrapperProps {
  componentName: string;
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  children: React.ReactNode;
}

interface ActivityLoadingProps {
  activityName?: string;
}

// Default loading component for activities
const ActivityLoading: React.FC<ActivityLoadingProps> = ({ activityName }) => (
  <Card className="w-full h-96 flex items-center justify-center">
    <CardContent className="text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-48 mx-auto" />
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
      <p className="text-sm text-muted-foreground">
        {activityName ? `Loading ${activityName}...` : 'Loading activity...'}
      </p>
    </CardContent>
  </Card>
);

// Error boundary component for lazy-loaded components
class LazyLoadErrorBoundary extends React.Component<
  { 
    children: React.ReactNode; 
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
    componentName: string;
  },
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
    console.error(`Error loading component ${this.props.componentName}:`, error, errorInfo);
    
    // Report to performance monitoring
    const performanceService = PerformanceMonitoringService.getInstance();
    performanceService['sendToAnalytics']('component-load-error', {
      component: this.props.componentName,
      error: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error!} retry={this.retry} />;
      }

      // Default error fallback
      return (
        <Card className="w-full h-96 flex items-center justify-center border-destructive">
          <CardContent className="text-center space-y-4">
            <div className="text-destructive text-4xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-destructive">
                Failed to load {this.props.componentName}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>
            <button
              onClick={this.retry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Main lazy load wrapper component
const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  componentName,
  fallback: CustomFallback,
  errorFallback,
  children
}) => {
  const FallbackComponent = CustomFallback || (() => <ActivityLoading activityName={componentName} />);

  return (
    <LazyLoadErrorBoundary 
      componentName={componentName}
      fallback={errorFallback}
    >
      <Suspense fallback={<FallbackComponent />}>
        {children}
      </Suspense>
    </LazyLoadErrorBoundary>
  );
};

// Hook for lazy loading activities with performance tracking
export const useLazyActivity = (activityName: string, importFn: () => Promise<{ default: ComponentType<any> }>) => {
  const performanceService = PerformanceMonitoringService.getInstance();
  
  const LazyComponent = lazy(async () => {
    const loadMeasurement = performanceService.measureBundleLoad(`activity-${activityName}`);
    
    try {
      const component = await importFn();
      loadMeasurement.finish();
      return component;
    } catch (error) {
      loadMeasurement.finish();
      throw error;
    }
  });

  return LazyComponent;
};

// Preload function for activities
export const preloadActivity = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  // Start loading the component but don't wait for it
  importFn().catch(() => {
    // Silently handle preload failures
  });
};

// Activity-specific lazy wrappers
export const createLazyActivity = (
  activityName: string,
  importFn: () => Promise<{ default: ComponentType<any> }>
) => {
  const LazyActivity = useLazyActivity(activityName, importFn);
  
  return (props: any) => (
    <LazyLoadWrapper componentName={activityName}>
      <LazyActivity {...props} />
    </LazyLoadWrapper>
  );
};

// Predefined lazy activity components
export const LazyAnimalSafari = createLazyActivity(
  'Animal Safari',
  async () => {
    const module = await import('@/components/activities/AnimalSafari');
    return { default: module.AnimalSafari };
  }
);

export const LazyNumberGarden = createLazyActivity(
  'Number Garden',
  async () => {
    const module = await import('@/components/activities/NumberGarden');
    return { default: module.NumberGarden };
  }
);

export const LazyShapeDetective = createLazyActivity(
  'Shape Detective',
  async () => {
    const module = await import('@/components/activities/ShapeDetective');
    return { default: module.ShapeDetective };
  }
);

export const LazyColorRainbow = createLazyActivity(
  'Color Rainbow',
  async () => {
    const module = await import('@/components/activities/ColorRainbow');
    return { default: module.ColorRainbow };
  }
);

export const LazyFamilyTree = createLazyActivity(
  'Family Tree',
  async () => {
    const module = await import('@/components/activities/FamilyTree');
    return { default: module.FamilyTree };
  }
);

export const LazyBodyParts = createLazyActivity(
  'Body Parts',
  async () => {
    const module = await import('@/components/activities/BodyParts');
    return { default: module.BodyParts };
  }
);

export const LazyWeatherStation = createLazyActivity(
  'Weather Station',
  async () => {
    const module = await import('@/components/activities/WeatherStation');
    return { default: module.WeatherStation };
  }
);

export const LazyCountingTrain = createLazyActivity(
  'Counting Train',
  async () => {
    const module = await import('@/components/activities/CountingTrain');
    return { default: module.CountingTrain };
  }
);

export const LazySizeSorter = createLazyActivity(
  'Size Sorter',
  async () => {
    const module = await import('@/components/activities/SizeSorter');
    return { default: module.SizeSorter };
  }
);

export const LazyTransportation = createLazyActivity(
  'Transportation',
  async () => {
    const module = await import('@/components/activities/Transportation');
    return { default: module.Transportation };
  }
);

export const LazyEmotionFaces = createLazyActivity(
  'Emotion Faces',
  async () => {
    const module = await import('@/components/activities/EmotionFaces');
    return { default: module.EmotionFaces };
  }
);

export const LazyPizzaFractions = createLazyActivity(
  'Pizza Fractions',
  async () => {
    const module = await import('@/components/activities/PizzaFractions');
    return { default: module.PizzaFractions };
  }
);

export const LazyPetParade = createLazyActivity(
  'Pet Parade',
  async () => {
    const module = await import('@/components/activities/PetParade');
    return { default: module.PetParade };
  }
);

// Language learning components
export const LazyArabicLearning = createLazyActivity(
  'Arabic Learning',
  () => import('@/components/activities/EnhancedArabicLearning')
);

export const LazyMalayalamLearning = createLazyActivity(
  'Malayalam Learning',
  () => import('@/components/activities/EnhancedMalayalamLearning')
);

// Hook for preloading activities on user interaction
export const useActivityPreloader = () => {
  const preloadActivityOnHover = (activityId: string) => {
    const activityImports: Record<string, () => Promise<any>> = {
      'animal-safari': () => import('@/components/activities/AnimalSafari'),
      'number-garden': () => import('@/components/activities/NumberGarden'),
      'shape-detective': () => import('@/components/activities/ShapeDetective'),
      'color-rainbow': () => import('@/components/activities/ColorRainbow'),
      'family-tree': () => import('@/components/activities/FamilyTree'),
      'body-parts': () => import('@/components/activities/BodyParts'),
      'weather-station': () => import('@/components/activities/WeatherStation'),
      'counting-train': () => import('@/components/activities/CountingTrain'),
      'size-sorter': () => import('@/components/activities/SizeSorter'),
      'transportation': () => import('@/components/activities/Transportation'),
      'emotion-faces': () => import('@/components/activities/EmotionFaces'),
      'pizza-fractions': () => import('@/components/activities/PizzaFractions'),
      'pet-parade': () => import('@/components/activities/PetParade')
    };

    const importFn = activityImports[activityId];
    if (importFn) {
      preloadActivity(importFn);
    }
  };

  return { preloadActivityOnHover };
};

export default LazyLoadWrapper;