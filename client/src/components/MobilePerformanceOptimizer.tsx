import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  Activity,
  Zap,
  Timer,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Battery,
  Cpu,
  HardDrive,
  Wifi,
  Signal,
  Smartphone,
  Monitor,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Settings,
  Eye,
  EyeOff,
  Filter,
  Download,
  Upload,
  Globe,
  Image,
  Video,
  Music,
  FileText,
  Layers,
  Code,
  Database,
  Server,
  Cloud,
  Gauge,
  Target,
  Optimize,
  MemoryStick,
  Thermometer,
  NetworkIcon,
  MousePointer,
  TouchpadIcon,
  Gesture,
  Phone,
  Tablet,
  Laptop,
  Camera,
  Mic,
  Speaker,
  Bluetooth,
  Vibrate,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  SkipForward,
  Rewind,
  FastForward
} from 'lucide-react';

interface MobilePerformanceOptimizerProps {
  children: React.ReactNode;
  onPerformanceAlert?: (alert: PerformanceAlert) => void;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  settings?: PerformanceSettings;
}

interface PerformanceSettings {
  enableMonitoring: boolean;
  enableOptimizations: boolean;
  alertThresholds: AlertThresholds;
  samplingInterval: number; // milliseconds
  retentionPeriod: number; // hours
  autoOptimize: boolean;
  debugMode: boolean;
  reportingEnabled: boolean;
}

interface AlertThresholds {
  memoryUsage: number; // percentage
  cpuUsage: number; // percentage
  loadTime: number; // milliseconds
  frameRate: number; // fps
  batteryLevel: number; // percentage
  networkLatency: number; // milliseconds
}

interface PerformanceMetrics {
  timestamp: Date;
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  battery: BatteryMetrics;
  network: NetworkMetrics;
  rendering: RenderingMetrics;
  userInteraction: InteractionMetrics;
  deviceInfo: DeviceInfo;
}

interface CPUMetrics {
  usage: number; // percentage
  temperature: number; // celsius
  frequency: number; // MHz
  cores: number;
  load: number[]; // per core
}

interface MemoryMetrics {
  used: number; // bytes
  available: number; // bytes
  total: number; // bytes
  pressure: 'low' | 'medium' | 'high' | 'critical';
  heap: HeapMetrics;
}

interface HeapMetrics {
  usedSize: number;
  totalSize: number;
  limit: number;
  allocations: number;
  deallocations: number;
}

interface BatteryMetrics {
  level: number; // percentage
  charging: boolean;
  chargingTime: number; // minutes
  dischargingTime: number; // minutes
  temperature: number; // celsius
}

interface NetworkMetrics {
  latency: number; // milliseconds
  bandwidth: number; // Mbps
  packetLoss: number; // percentage
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'none';
  strength: number; // percentage
}

interface RenderingMetrics {
  fps: number;
  frameTime: number; // milliseconds
  drawCalls: number;
  triangles: number;
  textureMemory: number; // bytes
  shaderCompileTime: number; // milliseconds
}

interface InteractionMetrics {
  touchLatency: number; // milliseconds
  scrollPerformance: number; // fps
  tapAccuracy: number; // percentage
  gestureRecognition: number; // milliseconds
  inputDelay: number; // milliseconds
}

interface DeviceInfo {
  model: string;
  os: string;
  version: string;
  screenSize: { width: number; height: number };
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
  isDarkMode: boolean;
  isLowPowerMode: boolean;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  category: 'cpu' | 'memory' | 'battery' | 'network' | 'rendering' | 'interaction';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  suggestions: string[];
}

interface OptimizationStrategy {
  name: string;
  description: string;
  category: 'memory' | 'cpu' | 'battery' | 'network' | 'rendering';
  impact: 'low' | 'medium' | 'high';
  enabled: boolean;
  auto: boolean;
  config: Record<string, any>;
}

interface PerformanceReport {
  id: string;
  timestamp: Date;
  duration: number; // minutes
  metrics: PerformanceMetrics[];
  alerts: PerformanceAlert[];
  optimizations: OptimizationResult[];
  summary: ReportSummary;
}

interface OptimizationResult {
  strategy: string;
  applied: boolean;
  impact: number; // percentage improvement
  metric: string;
  before: number;
  after: number;
}

interface ReportSummary {
  averageFPS: number;
  averageCPU: number;
  averageMemory: number;
  totalAlerts: number;
  optimizationsApplied: number;
  performanceScore: number; // 0-100
}

const MobilePerformanceOptimizer: React.FC<MobilePerformanceOptimizerProps> = ({
  children,
  onPerformanceAlert,
  onMetricsUpdate,
  settings: initialSettings
}) => {
  // Settings state
  const [settings, setSettings] = useState<PerformanceSettings>({
    enableMonitoring: true,
    enableOptimizations: true,
    alertThresholds: {
      memoryUsage: 80,
      cpuUsage: 75,
      loadTime: 3000,
      frameRate: 30,
      batteryLevel: 20,
      networkLatency: 500
    },
    samplingInterval: 1000,
    retentionPeriod: 24,
    autoOptimize: true,
    debugMode: false,
    reportingEnabled: true,
    ...initialSettings
  });

  // State management
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<PerformanceMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationStrategy[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number>(100);

  // UI state
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'metrics' | 'alerts' | 'optimizations' | 'reports'>('metrics');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  // Refs
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const metricsBufferRef = useRef<PerformanceMetrics[]>([]);

  // Optimization strategies
  const optimizationStrategies: OptimizationStrategy[] = [
    {
      name: 'Image Compression',
      description: 'Automatically compress images based on network conditions',
      category: 'network',
      impact: 'high',
      enabled: true,
      auto: true,
      config: {
        quality: 0.8,
        format: 'webp',
        lazy: true
      }
    },
    {
      name: 'Component Lazy Loading',
      description: 'Load React components only when needed',
      category: 'memory',
      impact: 'medium',
      enabled: true,
      auto: true,
      config: {
        threshold: 0.1,
        rootMargin: '50px'
      }
    },
    {
      name: 'Animation Optimization',
      description: 'Reduce animation complexity on low-end devices',
      category: 'rendering',
      impact: 'medium',
      enabled: true,
      auto: true,
      config: {
        disableOnLowFPS: true,
        simplifyOnBattery: true
      }
    },
    {
      name: 'Bundle Splitting',
      description: 'Split JavaScript bundles for faster loading',
      category: 'network',
      impact: 'high',
      enabled: true,
      auto: false,
      config: {
        chunks: 'async',
        maxSize: 250000
      }
    },
    {
      name: 'Memory Cleanup',
      description: 'Automatically clean up unused objects and listeners',
      category: 'memory',
      impact: 'medium',
      enabled: true,
      auto: true,
      config: {
        interval: 30000,
        threshold: 0.8
      }
    },
    {
      name: 'Battery Optimization',
      description: 'Reduce CPU usage when battery is low',
      category: 'battery',
      impact: 'high',
      enabled: true,
      auto: true,
      config: {
        batteryThreshold: 20,
        reducedFrameRate: 30
      }
    }
  ];

  useEffect(() => {
    setOptimizations(optimizationStrategies);
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    if (settings.enableMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [settings.enableMonitoring, settings.samplingInterval]);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);

    // Set up performance observer
    if ('PerformanceObserver' in window) {
      performanceObserverRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        processPerformanceEntries(entries);
      });

      performanceObserverRef.current.observe({
        entryTypes: ['measure', 'navigation', 'resource', 'paint', 'largest-contentful-paint']
      });
    }

    // Start metrics collection interval
    monitoringIntervalRef.current = setInterval(() => {
      collectMetrics();
    }, settings.samplingInterval);

    console.log('Performance monitoring started');
  }, [isMonitoring, settings.samplingInterval]);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);

    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
      performanceObserverRef.current = null;
    }

    console.log('Performance monitoring stopped');
  }, [isMonitoring]);

  // Collect performance metrics
  const collectMetrics = useCallback(async () => {
    try {
      const metrics: PerformanceMetrics = {
        timestamp: new Date(),
        cpu: await collectCPUMetrics(),
        memory: await collectMemoryMetrics(),
        battery: await collectBatteryMetrics(),
        network: await collectNetworkMetrics(),
        rendering: await collectRenderingMetrics(),
        userInteraction: await collectInteractionMetrics(),
        deviceInfo: await collectDeviceInfo()
      };

      setCurrentMetrics(metrics);
      
      // Add to history
      setMetricsHistory(prev => {
        const updated = [...prev, metrics];
        const cutoff = Date.now() - (settings.retentionPeriod * 60 * 60 * 1000);
        return updated.filter(m => m.timestamp.getTime() > cutoff);
      });

      // Buffer for analysis
      metricsBufferRef.current.push(metrics);
      if (metricsBufferRef.current.length > 100) {
        metricsBufferRef.current = metricsBufferRef.current.slice(-100);
      }

      // Check for alerts
      checkPerformanceAlerts(metrics);

      // Apply auto optimizations
      if (settings.autoOptimize) {
        applyAutoOptimizations(metrics);
      }

      // Calculate performance score
      updatePerformanceScore(metrics);

      // Notify parent component
      if (onMetricsUpdate) {
        onMetricsUpdate(metrics);
      }

    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    }
  }, [settings.retentionPeriod, settings.autoOptimize, onMetricsUpdate]);

  // Collect CPU metrics
  const collectCPUMetrics = useCallback(async (): Promise<CPUMetrics> => {
    // Mock CPU metrics (in real implementation, use native APIs)
    return {
      usage: Math.random() * 100,
      temperature: 40 + Math.random() * 30,
      frequency: 1800 + Math.random() * 1200,
      cores: navigator.hardwareConcurrency || 4,
      load: Array(navigator.hardwareConcurrency || 4).fill(0).map(() => Math.random() * 100)
    };
  }, []);

  // Collect memory metrics
  const collectMemoryMetrics = useCallback(async (): Promise<MemoryMetrics> => {
    const memInfo = (performance as any).memory;
    
    return {
      used: memInfo?.usedJSHeapSize || 0,
      available: memInfo?.totalJSHeapSize || 0,
      total: memInfo?.jsHeapSizeLimit || 0,
      pressure: memInfo?.usedJSHeapSize > (memInfo?.totalJSHeapSize * 0.8) ? 'high' : 'low',
      heap: {
        usedSize: memInfo?.usedJSHeapSize || 0,
        totalSize: memInfo?.totalJSHeapSize || 0,
        limit: memInfo?.jsHeapSizeLimit || 0,
        allocations: 0,
        deallocations: 0
      }
    };
  }, []);

  // Collect battery metrics
  const collectBatteryMetrics = useCallback(async (): Promise<BatteryMetrics> => {
    try {
      const battery = await (navigator as any).getBattery?.();
      return {
        level: (battery?.level || 1) * 100,
        charging: battery?.charging || false,
        chargingTime: battery?.chargingTime || 0,
        dischargingTime: battery?.dischargingTime || 0,
        temperature: 25 + Math.random() * 15 // Mock temperature
      };
    } catch {
      return {
        level: 100,
        charging: false,
        chargingTime: 0,
        dischargingTime: 0,
        temperature: 30
      };
    }
  }, []);

  // Collect network metrics
  const collectNetworkMetrics = useCallback(async (): Promise<NetworkMetrics> => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      latency: connection?.rtt || 50,
      bandwidth: connection?.downlink || 10,
      packetLoss: Math.random() * 5,
      connectionType: connection?.type || 'wifi',
      strength: 70 + Math.random() * 30
    };
  }, []);

  // Collect rendering metrics
  const collectRenderingMetrics = useCallback(async (): Promise<RenderingMetrics> => {
    const paintEntries = performance.getEntriesByType('paint');
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      fps: 60 - Math.random() * 30,
      frameTime: 16 + Math.random() * 10,
      drawCalls: Math.floor(Math.random() * 1000),
      triangles: Math.floor(Math.random() * 10000),
      textureMemory: Math.floor(Math.random() * 50) * 1024 * 1024,
      shaderCompileTime: Math.random() * 100
    };
  }, []);

  // Collect interaction metrics
  const collectInteractionMetrics = useCallback(async (): Promise<InteractionMetrics> => {
    return {
      touchLatency: 10 + Math.random() * 40,
      scrollPerformance: 55 + Math.random() * 10,
      tapAccuracy: 85 + Math.random() * 15,
      gestureRecognition: 50 + Math.random() * 100,
      inputDelay: 5 + Math.random() * 20
    };
  }, []);

  // Collect device information
  const collectDeviceInfo = useCallback(async (): Promise<DeviceInfo> => {
    return {
      model: navigator.userAgent.match(/\(([^)]+)\)/)?.[1] || 'Unknown',
      os: navigator.platform,
      version: navigator.appVersion,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      pixelRatio: window.devicePixelRatio,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      isLowPowerMode: false // Would need native integration
    };
  }, []);

  // Process performance entries
  const processPerformanceEntries = useCallback((entries: PerformanceEntry[]) => {
    entries.forEach(entry => {
      if (settings.debugMode) {
        console.log('Performance entry:', entry);
      }

      // Process specific entry types
      if (entry.entryType === 'largest-contentful-paint') {
        if (entry.startTime > settings.alertThresholds.loadTime) {
          createAlert('warning', 'rendering', 'Slow LCP detected', 'LCP', entry.startTime, settings.alertThresholds.loadTime);
        }
      }
    });
  }, [settings.debugMode, settings.alertThresholds]);

  // Check for performance alerts
  const checkPerformanceAlerts = useCallback((metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];

    // CPU usage alert
    if (metrics.cpu.usage > settings.alertThresholds.cpuUsage) {
      newAlerts.push(createAlert(
        metrics.cpu.usage > 90 ? 'critical' : 'warning',
        'cpu',
        `High CPU usage detected: ${metrics.cpu.usage.toFixed(1)}%`,
        'CPU Usage',
        metrics.cpu.usage,
        settings.alertThresholds.cpuUsage
      ));
    }

    // Memory usage alert
    const memoryUsage = (metrics.memory.used / metrics.memory.total) * 100;
    if (memoryUsage > settings.alertThresholds.memoryUsage) {
      newAlerts.push(createAlert(
        memoryUsage > 95 ? 'critical' : 'warning',
        'memory',
        `High memory usage detected: ${memoryUsage.toFixed(1)}%`,
        'Memory Usage',
        memoryUsage,
        settings.alertThresholds.memoryUsage
      ));
    }

    // Battery level alert
    if (metrics.battery.level < settings.alertThresholds.batteryLevel) {
      newAlerts.push(createAlert(
        metrics.battery.level < 10 ? 'critical' : 'warning',
        'battery',
        `Low battery level: ${metrics.battery.level.toFixed(1)}%`,
        'Battery Level',
        metrics.battery.level,
        settings.alertThresholds.batteryLevel
      ));
    }

    // Frame rate alert
    if (metrics.rendering.fps < settings.alertThresholds.frameRate) {
      newAlerts.push(createAlert(
        metrics.rendering.fps < 15 ? 'critical' : 'warning',
        'rendering',
        `Low frame rate detected: ${metrics.rendering.fps.toFixed(1)} FPS`,
        'Frame Rate',
        metrics.rendering.fps,
        settings.alertThresholds.frameRate
      ));
    }

    // Network latency alert
    if (metrics.network.latency > settings.alertThresholds.networkLatency) {
      newAlerts.push(createAlert(
        metrics.network.latency > 1000 ? 'critical' : 'warning',
        'network',
        `High network latency: ${metrics.network.latency}ms`,
        'Network Latency',
        metrics.network.latency,
        settings.alertThresholds.networkLatency
      ));
    }

    // Add new alerts
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-50)); // Keep last 50 alerts
      
      newAlerts.forEach(alert => {
        if (onPerformanceAlert) {
          onPerformanceAlert(alert);
        }
      });
    }
  }, [settings.alertThresholds, onPerformanceAlert]);

  // Create performance alert
  const createAlert = (
    type: 'warning' | 'error' | 'critical',
    category: 'cpu' | 'memory' | 'battery' | 'network' | 'rendering' | 'interaction',
    message: string,
    metric: string,
    value: number,
    threshold: number
  ): PerformanceAlert => {
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      message,
      metric,
      value,
      threshold,
      timestamp: new Date(),
      suggestions: getOptimizationSuggestions(category, value, threshold)
    };
  };

  // Get optimization suggestions
  const getOptimizationSuggestions = (
    category: string,
    value: number,
    threshold: number
  ): string[] => {
    const suggestions: Record<string, string[]> = {
      cpu: [
        'Reduce animation complexity',
        'Optimize heavy computations',
        'Use Web Workers for background tasks',
        'Implement component lazy loading'
      ],
      memory: [
        'Clear unused component references',
        'Optimize image sizes',
        'Implement virtual scrolling',
        'Use object pooling for frequently created objects'
      ],
      battery: [
        'Reduce screen brightness',
        'Disable background processes',
        'Lower frame rate for animations',
        'Use efficient data structures'
      ],
      network: [
        'Compress data transfers',
        'Use caching strategies',
        'Optimize API calls',
        'Implement request bundling'
      ],
      rendering: [
        'Reduce draw calls',
        'Optimize shaders',
        'Use hardware acceleration',
        'Implement level-of-detail rendering'
      ]
    };

    return suggestions[category] || ['Monitor performance closely'];
  };

  // Apply automatic optimizations
  const applyAutoOptimizations = useCallback((metrics: PerformanceMetrics) => {
    optimizations.forEach(async optimization => {
      if (!optimization.enabled || !optimization.auto) return;

      let shouldApply = false;
      
      switch (optimization.category) {
        case 'memory':
          shouldApply = (metrics.memory.used / metrics.memory.total) > 0.8;
          break;
        case 'cpu':
          shouldApply = metrics.cpu.usage > 80;
          break;
        case 'battery':
          shouldApply = metrics.battery.level < 20;
          break;
        case 'network':
          shouldApply = metrics.network.latency > 300;
          break;
        case 'rendering':
          shouldApply = metrics.rendering.fps < 30;
          break;
      }

      if (shouldApply) {
        await applyOptimization(optimization, metrics);
      }
    });
  }, [optimizations]);

  // Apply specific optimization
  const applyOptimization = useCallback(async (
    optimization: OptimizationStrategy,
    metrics: PerformanceMetrics
  ): Promise<void> => {
    try {
      console.log(`Applying optimization: ${optimization.name}`);

      switch (optimization.name) {
        case 'Image Compression':
          applyImageCompression(optimization.config);
          break;
        case 'Component Lazy Loading':
          applyLazyLoading(optimization.config);
          break;
        case 'Animation Optimization':
          applyAnimationOptimization(optimization.config, metrics);
          break;
        case 'Memory Cleanup':
          applyMemoryCleanup(optimization.config);
          break;
        case 'Battery Optimization':
          applyBatteryOptimization(optimization.config, metrics);
          break;
      }
    } catch (error) {
      console.error(`Failed to apply optimization ${optimization.name}:`, error);
    }
  }, []);

  // Optimization implementations
  const applyImageCompression = (config: any) => {
    // Mock implementation
    console.log('Applying image compression with config:', config);
  };

  const applyLazyLoading = (config: any) => {
    // Mock implementation
    console.log('Applying lazy loading with config:', config);
  };

  const applyAnimationOptimization = (config: any, metrics: PerformanceMetrics) => {
    if (config.disableOnLowFPS && metrics.rendering.fps < 30) {
      console.log('Disabling complex animations due to low FPS');
    }
    if (config.simplifyOnBattery && metrics.battery.level < 20) {
      console.log('Simplifying animations due to low battery');
    }
  };

  const applyMemoryCleanup = (config: any) => {
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    console.log('Applied memory cleanup');
  };

  const applyBatteryOptimization = (config: any, metrics: PerformanceMetrics) => {
    if (metrics.battery.level < config.batteryThreshold) {
      console.log('Applying battery optimizations');
      // Reduce frame rate, disable non-essential features
    }
  };

  // Update performance score
  const updatePerformanceScore = useCallback((metrics: PerformanceMetrics) => {
    let score = 100;

    // CPU score (25% weight)
    score -= Math.max(0, (metrics.cpu.usage - 50) * 0.5);

    // Memory score (25% weight)
    const memoryUsage = (metrics.memory.used / metrics.memory.total) * 100;
    score -= Math.max(0, (memoryUsage - 60) * 0.625);

    // FPS score (25% weight)
    score -= Math.max(0, (60 - metrics.rendering.fps) * 0.833);

    // Network score (25% weight)
    score -= Math.max(0, (metrics.network.latency - 100) * 0.025);

    setPerformanceScore(Math.max(0, Math.min(100, score)));
  }, []);

  // Format metrics for display
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Get performance status color
  const getPerformanceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="mobile-performance-optimizer">
      {children}
      
      {/* Performance Status Badge */}
      <div className="fixed top-4 right-4 z-50">
        <Badge 
          variant={performanceScore >= 80 ? 'default' : performanceScore >= 60 ? 'secondary' : 'destructive'}
          className="flex items-center gap-2"
        >
          <Activity className="w-3 h-3" />
          {performanceScore.toFixed(0)}%
        </Badge>
      </div>

      {/* Critical Alerts */}
      {alerts.filter(alert => alert.type === 'critical').slice(-1).map(alert => (
        <Alert key={alert.id} className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-auto">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Critical Performance Issue</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}

      {/* Performance Panel */}
      <Dialog open={showPerformancePanel} onOpenChange={setShowPerformancePanel}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-16 left-4 z-40"
          >
            <Gauge className="w-4 h-4 mr-2" />
            Performance
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Mobile Performance Optimizer
              <Badge variant={performanceScore >= 80 ? 'default' : 'secondary'}>
                Score: {performanceScore.toFixed(0)}%
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab as any}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="alerts">
                Alerts {alerts.length > 0 && <Badge className="ml-1">{alerts.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-4">
              {currentMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* CPU Metrics */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        CPU Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Usage:</span>
                          <span className={getPerformanceColor(100 - currentMetrics.cpu.usage)}>
                            {formatPercentage(currentMetrics.cpu.usage)}
                          </span>
                        </div>
                        <Progress value={currentMetrics.cpu.usage} />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Temp: {currentMetrics.cpu.temperature.toFixed(1)}°C</div>
                          <div>Cores: {currentMetrics.cpu.cores}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Memory Metrics */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MemoryStick className="w-4 h-4" />
                        Memory Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Used:</span>
                          <span>{formatBytes(currentMetrics.memory.used)}</span>
                        </div>
                        <Progress value={(currentMetrics.memory.used / currentMetrics.memory.total) * 100} />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Available: {formatBytes(currentMetrics.memory.available)}</div>
                          <div>Pressure: {currentMetrics.memory.pressure}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Battery Metrics */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Battery className="w-4 h-4" />
                        Battery Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Level:</span>
                          <span className={getPerformanceColor(currentMetrics.battery.level)}>
                            {formatPercentage(currentMetrics.battery.level)}
                          </span>
                        </div>
                        <Progress value={currentMetrics.battery.level} />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Charging: {currentMetrics.battery.charging ? 'Yes' : 'No'}</div>
                          <div>Temp: {currentMetrics.battery.temperature.toFixed(1)}°C</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Network Metrics */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Signal className="w-4 h-4" />
                        Network Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Latency:</span>
                          <span>{currentMetrics.network.latency}ms</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Type: {currentMetrics.network.connectionType}</div>
                          <div>Bandwidth: {currentMetrics.network.bandwidth} Mbps</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rendering Metrics */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Rendering Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>FPS:</span>
                          <span className={getPerformanceColor(currentMetrics.rendering.fps * 1.67)}>
                            {currentMetrics.rendering.fps.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={(currentMetrics.rendering.fps / 60) * 100} />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Frame Time: {currentMetrics.rendering.frameTime.toFixed(1)}ms</div>
                          <div>Draw Calls: {currentMetrics.rendering.drawCalls}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interaction Metrics */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MousePointer className="w-4 h-4" />
                        User Interaction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Touch Latency:</span>
                          <span>{currentMetrics.userInteraction.touchLatency.toFixed(1)}ms</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Scroll FPS: {currentMetrics.userInteraction.scrollPerformance.toFixed(1)}</div>
                          <div>Tap Accuracy: {formatPercentage(currentMetrics.userInteraction.tapAccuracy)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Performance Alerts</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAlerts([])}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alerts.slice().reverse().map((alert) => (
                  <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {alert.type === 'critical' ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : alert.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                          <Badge variant="outline" className="capitalize">
                            {alert.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm">{alert.message}</div>
                        {alert.suggestions.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium mb-1">Suggestions:</div>
                            <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                              {alert.suggestions.map((suggestion, idx) => (
                                <li key={idx}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
                
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No performance alerts</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Optimizations Tab */}
            <TabsContent value="optimizations" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Optimization Strategies</h3>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Auto Optimize</Label>
                  <Switch
                    checked={settings.autoOptimize}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, autoOptimize: checked }))
                    }
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                {optimizations.map((optimization, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{optimization.name}</h4>
                            <Badge variant="outline" className="capitalize">
                              {optimization.category}
                            </Badge>
                            <Badge variant={
                              optimization.impact === 'high' ? 'default' :
                              optimization.impact === 'medium' ? 'secondary' : 'outline'
                            }>
                              {optimization.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {optimization.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Enabled</Label>
                              <Switch
                                checked={optimization.enabled}
                                onCheckedChange={(checked) => {
                                  const updated = [...optimizations];
                                  updated[index].enabled = checked;
                                  setOptimizations(updated);
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Auto</Label>
                              <Switch
                                checked={optimization.auto}
                                onCheckedChange={(checked) => {
                                  const updated = [...optimizations];
                                  updated[index].auto = checked;
                                  setOptimizations(updated);
                                }}
                                disabled={!optimization.enabled}
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyOptimization(optimization, currentMetrics!)}
                          disabled={!optimization.enabled || !currentMetrics}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Performance Reports</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="1h">Last Hour</option>
                    <option value="6h">Last 6 Hours</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                  </select>
                </div>
              </div>

              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {performanceScore.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">Performance Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {metricsHistory.length > 0 ? 
                          (metricsHistory.reduce((sum, m) => sum + m.rendering.fps, 0) / metricsHistory.length).toFixed(1) : 
                          '60.0'
                        }
                      </div>
                      <div className="text-xs text-gray-500">Avg FPS</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {alerts.length}
                      </div>
                      <div className="text-xs text-gray-500">Total Alerts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {optimizations.filter(o => o.enabled).length}
                      </div>
                      <div className="text-xs text-gray-500">Active Optimizations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monitoring Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Monitoring Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Enable Monitoring</Label>
                        <Switch
                          checked={settings.enableMonitoring}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, enableMonitoring: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Debug Mode</Label>
                        <Switch
                          checked={settings.debugMode}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, debugMode: checked }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Sampling Interval: {settings.samplingInterval}ms</Label>
                        <input
                          type="range"
                          min="500"
                          max="5000"
                          step="500"
                          value={settings.samplingInterval}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            samplingInterval: parseInt(e.target.value) 
                          }))}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MobilePerformanceOptimizer;