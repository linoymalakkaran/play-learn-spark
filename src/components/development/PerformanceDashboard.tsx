import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import PerformanceMonitoringService from '@/services/PerformanceMonitoringService';

interface PerformanceDashboardProps {
  className?: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className = "" }) => {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [performanceService] = useState(() => PerformanceMonitoringService.getInstance());

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
      updatePerformanceData();
      
      // Update performance data every 5 seconds
      const interval = setInterval(updatePerformanceData, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const updatePerformanceData = () => {
    const summary = performanceService.getPerformanceSummary();
    setPerformanceData(summary);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4" />;
      case 'poor': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatMetricValue = (name: string, value: number) => {
    switch (name) {
      case 'LCP':
      case 'FCP':
      case 'TTFB':
        return `${Math.round(value)}ms`;
      case 'FID':
        return `${Math.round(value)}ms`;
      case 'CLS':
        return value.toFixed(3);
      default:
        return Math.round(value).toString();
    }
  };

  const getMetricDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      'LCP': 'Largest Contentful Paint - Time to render the largest element',
      'FID': 'First Input Delay - Time from first interaction to browser response',
      'CLS': 'Cumulative Layout Shift - Visual stability of the page',
      'FCP': 'First Contentful Paint - Time to render first content',
      'TTFB': 'Time to First Byte - Server response time'
    };
    return descriptions[name] || 'Performance metric';
  };

  if (!isVisible || !performanceData) {
    return null;
  }

  const { metrics, overallScore, recommendations } = performanceData;
  const latestMetrics = metrics.slice(-5); // Show last 5 metrics

  return (
    <div className={`fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50 ${className}`}>
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Performance Monitor</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${
                  overallScore >= 90 ? 'border-green-500 text-green-700' :
                  overallScore >= 70 ? 'border-yellow-500 text-yellow-700' :
                  'border-red-500 text-red-700'
                }`}
              >
                Score: {overallScore}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={updatePerformanceData}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Progress value={overallScore} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Core Web Vitals */}
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Core Web Vitals
            </h4>
            <div className="space-y-2">
              {latestMetrics.map((metric, index) => (
                <div key={`${metric.name}-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRatingIcon(metric.rating)}
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {formatMetricValue(metric.name, metric.value)}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRatingColor(metric.rating)}`}
                    >
                      {metric.rating}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Recommendations
              </h4>
              <div className="space-y-1">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Tips */}
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Development Tips
            </h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Use React DevTools Profiler to identify slow components</div>
              <div>• Implement code splitting for large bundles</div>
              <div>• Optimize images and use modern formats (WebP)</div>
              <div>• Enable service worker for caching</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Open Lighthouse in new tab
                  window.open(`chrome://lighthouse/?url=${window.location.href}`, '_blank');
                }}
                className="flex-1 text-xs"
              >
                Run Lighthouse
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Log performance data to console
                  console.table(metrics);
                }}
                className="flex-1 text-xs"
              >
                Log Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;