import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface PerformanceThresholds {
  LCP: { good: number; poor: number };
  FID: { good: number; poor: number };
  CLS: { good: number; poor: number };
  FCP: { good: number; poor: number };
  TTFB: { good: number; poor: number };
}

class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private thresholds: PerformanceThresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 }
  };

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  // Initialize Core Web Vitals monitoring
  initializeMonitoring(): void {
    // Largest Contentful Paint
    getLCP((metric) => this.handleMetric(metric));
    
    // First Input Delay
    getFID((metric) => this.handleMetric(metric));
    
    // Cumulative Layout Shift
    getCLS((metric) => this.handleMetric(metric));
    
    // First Contentful Paint
    getFCP((metric) => this.handleMetric(metric));
    
    // Time to First Byte
    getTTFB((metric) => this.handleMetric(metric));

    // Custom performance observers
    this.initializeCustomObservers();
  }

  private handleMetric(metric: any): void {
    const rating = this.getRating(metric.name, metric.value);
    
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      rating,
      timestamp: Date.now()
    };

    this.metrics.push(performanceMetric);
    this.reportMetric(performanceMetric);
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.thresholds[name as keyof PerformanceThresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private initializeCustomObservers(): void {
    // Resource loading performance
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.trackResourcePerformance(entry as PerformanceResourceTiming);
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Long tasks observer
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.trackLongTask(entry);
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }
  }

  private trackResourcePerformance(entry: PerformanceResourceTiming): void {
    const slowThreshold = 1000; // 1 second
    const loadTime = entry.responseEnd - entry.requestStart;

    if (loadTime > slowThreshold) {
      console.warn(`Slow resource detected: ${entry.name} took ${loadTime}ms`);
      
      // Report slow resource
      this.reportSlowResource({
        url: entry.name,
        loadTime,
        size: entry.transferSize || 0,
        type: this.getResourceType(entry.name)
      });
    }
  }

  private trackLongTask(entry: PerformanceEntry): void {
    console.warn(`Long task detected: ${entry.duration}ms`);
    
    this.reportLongTask({
      duration: entry.duration,
      startTime: entry.startTime,
      timestamp: Date.now()
    });
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js|jsx|ts|tsx)$/)) return 'script';
    if (url.match(/\.(css|scss|sass)$/)) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  private reportMetric(metric: PerformanceMetric): void {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        timestamp: new Date(metric.timestamp).toISOString()
      });
    }

    // Send to analytics (implement your analytics service)
    this.sendToAnalytics('core-web-vital', metric);
  }

  private reportSlowResource(resource: any): void {
    this.sendToAnalytics('slow-resource', resource);
  }

  private reportLongTask(task: any): void {
    this.sendToAnalytics('long-task', task);
  }

  private sendToAnalytics(type: string, data: any): void {
    // Implement your analytics service integration here
    // For now, we'll just log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Analytics Event - ${type}:`, data);
    }
  }

  // Measure component render performance
  measureComponentRender(componentName: string, renderFn: () => void): void {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) { // More than one frame (60fps)
      console.warn(`Slow component render: ${componentName} took ${duration}ms`);
      
      this.sendToAnalytics('slow-component-render', {
        component: componentName,
        duration,
        timestamp: Date.now()
      });
    }
  }

  // Measure bundle size impact
  measureBundleLoad(bundleName: string): { finish: () => void } {
    const startTime = performance.now();
    
    return {
      finish: () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        this.sendToAnalytics('bundle-load', {
          bundle: bundleName,
          loadTime,
          timestamp: Date.now()
        });
      }
    };
  }

  // Get performance summary
  getPerformanceSummary(): {
    metrics: PerformanceMetric[];
    overallScore: number;
    recommendations: string[];
  } {
    const recentMetrics = this.metrics.slice(-50); // Last 50 metrics
    const recommendations: string[] = [];

    // Calculate overall score
    let totalScore = 0;
    let metricCount = 0;

    recentMetrics.forEach(metric => {
      let score = 0;
      switch (metric.rating) {
        case 'good': score = 100; break;
        case 'needs-improvement': score = 50; break;
        case 'poor': score = 0; break;
      }
      totalScore += score;
      metricCount++;

      // Add recommendations based on poor metrics
      if (metric.rating === 'poor') {
        recommendations.push(this.getRecommendation(metric.name));
      }
    });

    const overallScore = metricCount > 0 ? Math.round(totalScore / metricCount) : 100;

    return {
      metrics: recentMetrics,
      overallScore,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    };
  }

  private getRecommendation(metricName: string): string {
    const recommendations: Record<string, string> = {
      'LCP': 'Optimize images and remove unnecessary third-party scripts to improve Largest Contentful Paint',
      'FID': 'Reduce JavaScript execution time and use web workers for heavy computations',
      'CLS': 'Set size attributes on images and avoid inserting content above existing content',
      'FCP': 'Eliminate render-blocking resources and optimize critical resource loading',
      'TTFB': 'Optimize server response times and use CDN for static assets'
    };

    return recommendations[metricName] || 'Monitor and optimize this metric for better performance';
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export default PerformanceMonitoringService;