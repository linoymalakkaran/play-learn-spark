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
  Wifi,
  WifiOff,
  Download,
  Upload,
  Sync,
  Database,
  HardDrive,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Timer,
  Zap,
  Battery,
  Signal,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  FileText,
  Image,
  Video,
  Music,
  File,
  Folder,
  FolderOpen,
  Package,
  Lock,
  Unlock,
  Shield,
  Key,
  Server,
  Activity,
  TrendingUp,
  BarChart3,
  Info,
  HelpCircle,
  Lightbulb,
  Star,
  Bookmark,
  Pin,
  Flag,
  Calendar,
  User,
  Users,
  MessageSquare,
  Bell,
  Home,
  BookOpen,
  PlayCircle,
  PauseCircle,
  Square,
  SkipForward
} from 'lucide-react';

interface OfflineCapabilityManagerProps {
  children: React.ReactNode;
  onConnectionChange?: (isOnline: boolean) => void;
  onSyncProgress?: (progress: SyncProgress) => void;
  settings?: OfflineSettings;
}

interface OfflineSettings {
  enableOfflineMode: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  maxStorageSize: number; // MB
  cachingStrategy: 'aggressive' | 'conservative' | 'minimal';
  priorityContent: string[];
  backgroundSync: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  retentionPolicy: RetentionPolicy;
}

interface RetentionPolicy {
  maxAge: number; // days
  maxItems: number;
  priorityBasedCleanup: boolean;
  autoCleanup: boolean;
}

interface OfflineData {
  id: string;
  type: DataType;
  content: any;
  metadata: DataMetadata;
  size: number; // bytes
  createdAt: Date;
  lastAccessed: Date;
  lastModified: Date;
  syncStatus: SyncStatus;
  priority: Priority;
  version: number;
  checksum?: string;
}

type DataType = 
  | 'activity'
  | 'assessment'
  | 'progress'
  | 'user_profile'
  | 'content'
  | 'media'
  | 'message'
  | 'notification'
  | 'settings'
  | 'cache';

interface DataMetadata {
  userId: string;
  tags: string[];
  category: string;
  dependencies: string[];
  accessCount: number;
  source: string;
  format: string;
  compressed: boolean;
  encrypted: boolean;
}

type SyncStatus = 'synced' | 'pending' | 'failed' | 'conflict' | 'uploading' | 'downloading';
type Priority = 'critical' | 'high' | 'medium' | 'low';

interface SyncProgress {
  operation: 'upload' | 'download' | 'sync';
  total: number;
  completed: number;
  current: string;
  speed: number; // items per second
  estimatedTimeRemaining: number; // seconds
  errors: SyncError[];
}

interface SyncError {
  id: string;
  type: 'network' | 'storage' | 'permission' | 'conflict' | 'validation';
  message: string;
  data?: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

interface StorageInfo {
  used: number; // bytes
  available: number; // bytes
  quota: number; // bytes
  breakdown: StorageBreakdown;
  efficiency: number; // percentage
}

interface StorageBreakdown {
  activities: number;
  assessments: number;
  media: number;
  cache: number;
  other: number;
}

interface NetworkInfo {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveType: '2g' | '3g' | '4g' | '5g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
}

interface CacheStrategy {
  name: string;
  description: string;
  maxSize: number;
  ttl: number; // seconds
  priority: Priority;
  patterns: string[];
  compression: boolean;
  encryption: boolean;
}

interface ServiceWorkerStatus {
  isRegistered: boolean;
  isActivated: boolean;
  isControlling: boolean;
  version: string;
  lastUpdate: Date;
  updateAvailable: boolean;
}

const OfflineCapabilityManager: React.FC<OfflineCapabilityManagerProps> = ({
  children,
  onConnectionChange,
  onSyncProgress,
  settings: initialSettings
}) => {
  // Settings state
  const [settings, setSettings] = useState<OfflineSettings>({
    enableOfflineMode: true,
    autoSync: true,
    syncInterval: 15,
    maxStorageSize: 500, // 500MB
    cachingStrategy: 'conservative',
    priorityContent: ['activities', 'assessments', 'progress'],
    backgroundSync: true,
    compressionEnabled: true,
    encryptionEnabled: false,
    retentionPolicy: {
      maxAge: 30,
      maxItems: 1000,
      priorityBasedCleanup: true,
      autoCleanup: true
    },
    ...initialSettings
  });

  // State management
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<ServiceWorkerStatus | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // UI state
  const [showOfflinePanel, setShowOfflinePanel] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'status' | 'data' | 'sync' | 'settings'>('status');

  // Refs
  const dbRef = useRef<IDBDatabase | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const serviceWorkerRef = useRef<ServiceWorkerRegistration | null>(null);

  // Cache strategies
  const cacheStrategies: Record<string, CacheStrategy> = {
    critical: {
      name: 'Critical Content',
      description: 'Essential app functionality and user data',
      maxSize: 50 * 1024 * 1024, // 50MB
      ttl: 7 * 24 * 60 * 60, // 7 days
      priority: 'critical',
      patterns: ['/api/auth', '/api/user', '/api/emergency'],
      compression: true,
      encryption: true
    },
    activities: {
      name: 'Learning Activities',
      description: 'Interactive learning content and exercises',
      maxSize: 200 * 1024 * 1024, // 200MB
      ttl: 3 * 24 * 60 * 60, // 3 days
      priority: 'high',
      patterns: ['/api/activities', '/content/activities'],
      compression: true,
      encryption: false
    },
    media: {
      name: 'Media Content',
      description: 'Images, videos, and audio files',
      maxSize: 150 * 1024 * 1024, // 150MB
      ttl: 24 * 60 * 60, // 1 day
      priority: 'medium',
      patterns: ['/media', '/assets'],
      compression: false,
      encryption: false
    },
    cache: {
      name: 'App Cache',
      description: 'Static assets and frequently accessed data',
      maxSize: 100 * 1024 * 1024, // 100MB
      ttl: 60 * 60, // 1 hour
      priority: 'low',
      patterns: ['/static', '/api/cache'],
      compression: true,
      encryption: false
    }
  };

  // Initialize offline capabilities
  useEffect(() => {
    const initializeOffline = async () => {
      try {
        // Initialize IndexedDB
        await initializeDatabase();
        
        // Register service worker
        await registerServiceWorker();
        
        // Setup network monitoring
        setupNetworkMonitoring();
        
        // Load existing offline data
        await loadOfflineData();
        
        // Start sync interval
        if (settings.autoSync) {
          startSyncInterval();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize offline capabilities:', error);
      }
    };

    if (settings.enableOfflineMode) {
      initializeOffline();
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [settings.enableOfflineMode, settings.autoSync, settings.syncInterval]);

  // Initialize IndexedDB
  const initializeDatabase = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineCapabilityDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        dbRef.current = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('type', 'type');
          store.createIndex('syncStatus', 'syncStatus');
          store.createIndex('priority', 'priority');
          store.createIndex('lastAccessed', 'lastAccessed');
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        serviceWorkerRef.current = registration;
        
        setServiceWorkerStatus({
          isRegistered: true,
          isActivated: registration.active !== null,
          isControlling: navigator.serviceWorker.controller !== null,
          version: '1.0.0',
          lastUpdate: new Date(),
          updateAvailable: false
        });
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          setServiceWorkerStatus(prev => prev ? { ...prev, updateAvailable: true } : null);
        });
        
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }, []);

  // Setup network monitoring
  const setupNetworkMonitoring = useCallback(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setNetworkInfo({
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false
      });
      
      setIsOnline(navigator.onLine);
      
      if (onConnectionChange) {
        onConnectionChange(navigator.onLine);
      }
    };

    // Initial check
    updateNetworkInfo();
    
    // Listen for changes
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);
    
    // Listen for connection changes
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [onConnectionChange]);

  // Load offline data from IndexedDB
  const loadOfflineData = useCallback(async () => {
    if (!dbRef.current) return;
    
    try {
      const transaction = dbRef.current.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = store.getAll();
      
      request.onsuccess = () => {
        setOfflineData(request.result);
        updateStorageInfo(request.result);
      };
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }, []);

  // Update storage information
  const updateStorageInfo = useCallback(async (data?: OfflineData[]) => {
    try {
      // Get storage estimate
      const estimate = await navigator.storage.estimate();
      const dataToAnalyze = data || offlineData;
      
      const breakdown = dataToAnalyze.reduce((acc, item) => {
        switch (item.type) {
          case 'activity':
          case 'assessment':
            acc.activities += item.size;
            break;
          case 'content':
          case 'media':
            acc.media += item.size;
            break;
          case 'cache':
            acc.cache += item.size;
            break;
          default:
            acc.other += item.size;
        }
        return acc;
      }, { activities: 0, assessments: 0, media: 0, cache: 0, other: 0 });
      
      const totalUsed = estimate.usage || 0;
      const totalQuota = estimate.quota || 0;
      
      setStorageInfo({
        used: totalUsed,
        available: totalQuota - totalUsed,
        quota: totalQuota,
        breakdown,
        efficiency: totalQuota > 0 ? (totalUsed / totalQuota) * 100 : 0
      });
    } catch (error) {
      console.error('Failed to update storage info:', error);
    }
  }, [offlineData]);

  // Start automatic sync interval
  const startSyncInterval = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    
    syncIntervalRef.current = setInterval(() => {
      if (isOnline && settings.autoSync) {
        performSync();
      }
    }, settings.syncInterval * 60 * 1000);
  }, [isOnline, settings.autoSync, settings.syncInterval]);

  // Store data offline
  const storeOfflineData = useCallback(async (data: Omit<OfflineData, 'id' | 'createdAt' | 'lastAccessed' | 'version'>): Promise<string> => {
    if (!dbRef.current || !settings.enableOfflineMode) {
      throw new Error('Offline mode not enabled');
    }
    
    const id = generateId();
    const offlineItem: OfflineData = {
      id,
      createdAt: new Date(),
      lastAccessed: new Date(),
      version: 1,
      ...data
    };
    
    // Compress if enabled
    if (settings.compressionEnabled && offlineItem.size > 1024) {
      offlineItem.content = await compressData(offlineItem.content);
      offlineItem.metadata.compressed = true;
    }
    
    // Encrypt if enabled
    if (settings.encryptionEnabled) {
      offlineItem.content = await encryptData(offlineItem.content);
      offlineItem.metadata.encrypted = true;
    }
    
    try {
      const transaction = dbRef.current.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      await new Promise((resolve, reject) => {
        const request = store.add(offlineItem);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      setOfflineData(prev => [...prev, offlineItem]);
      await updateStorageInfo();
      
      return id;
    } catch (error) {
      console.error('Failed to store offline data:', error);
      throw error;
    }
  }, [settings.enableOfflineMode, settings.compressionEnabled, settings.encryptionEnabled]);

  // Retrieve offline data
  const getOfflineData = useCallback(async (id: string): Promise<OfflineData | null> => {
    if (!dbRef.current) return null;
    
    try {
      const transaction = dbRef.current.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const request = store.get(id);
      const result = await new Promise<OfflineData>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (result) {
        // Update last accessed
        result.lastAccessed = new Date();
        result.metadata.accessCount++;
        
        store.put(result);
        
        // Decrypt if needed
        if (result.metadata.encrypted) {
          result.content = await decryptData(result.content);
        }
        
        // Decompress if needed
        if (result.metadata.compressed) {
          result.content = await decompressData(result.content);
        }
      }
      
      return result || null;
    } catch (error) {
      console.error('Failed to retrieve offline data:', error);
      return null;
    }
  }, []);

  // Perform data synchronization
  const performSync = useCallback(async () => {
    if (!isOnline || !dbRef.current) return;
    
    const pendingItems = offlineData.filter(item => item.syncStatus === 'pending');
    if (pendingItems.length === 0) return;
    
    const progress: SyncProgress = {
      operation: 'sync',
      total: pendingItems.length,
      completed: 0,
      current: '',
      speed: 0,
      estimatedTimeRemaining: 0,
      errors: []
    };
    
    setSyncProgress(progress);
    
    const startTime = Date.now();
    
    for (const item of pendingItems) {
      try {
        progress.current = item.id;
        progress.completed++;
        
        // Calculate speed and ETA
        const elapsed = (Date.now() - startTime) / 1000;
        progress.speed = progress.completed / elapsed;
        progress.estimatedTimeRemaining = (progress.total - progress.completed) / progress.speed;
        
        setSyncProgress({ ...progress });
        if (onSyncProgress) onSyncProgress({ ...progress });
        
        // Simulate sync operation
        await syncItemToServer(item);
        
        // Update sync status
        item.syncStatus = 'synced';
        await updateOfflineItem(item);
        
      } catch (error) {
        const syncError: SyncError = {
          id: item.id,
          type: 'network',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: 3
        };
        
        progress.errors.push(syncError);
        item.syncStatus = 'failed';
        await updateOfflineItem(item);
      }
    }
    
    setSyncProgress(null);
  }, [isOnline, offlineData, onSyncProgress]);

  // Sync item to server (mock implementation)
  const syncItemToServer = useCallback(async (item: OfflineData): Promise<void> => {
    // Mock API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.9) {
          reject(new Error('Network error'));
        } else {
          resolve();
        }
      }, Math.random() * 1000 + 500);
    });
  }, []);

  // Update offline item
  const updateOfflineItem = useCallback(async (item: OfflineData): Promise<void> => {
    if (!dbRef.current) return;
    
    try {
      const transaction = dbRef.current.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      await new Promise((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      setOfflineData(prev => prev.map(i => i.id === item.id ? item : i));
    } catch (error) {
      console.error('Failed to update offline item:', error);
    }
  }, []);

  // Clear offline data
  const clearOfflineData = useCallback(async (filter?: Partial<OfflineData>) => {
    if (!dbRef.current) return;
    
    try {
      const transaction = dbRef.current.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      if (!filter) {
        // Clear all
        await new Promise((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        setOfflineData([]);
      } else {
        // Clear filtered items
        const itemsToDelete = offlineData.filter(item => {
          return Object.entries(filter).every(([key, value]) => item[key as keyof OfflineData] === value);
        });
        
        for (const item of itemsToDelete) {
          await new Promise((resolve, reject) => {
            const request = store.delete(item.id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
        }
        
        setOfflineData(prev => prev.filter(item => 
          !itemsToDelete.some(deleted => deleted.id === item.id)
        ));
      }
      
      await updateStorageInfo();
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }, [offlineData]);

  // Utility functions
  const generateId = (): string => {
    return `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const compressData = async (data: any): Promise<string> => {
    // Mock compression
    return JSON.stringify(data);
  };

  const decompressData = async (data: string): Promise<any> => {
    // Mock decompression
    return JSON.parse(data);
  };

  const encryptData = async (data: any): Promise<string> => {
    // Mock encryption
    return btoa(JSON.stringify(data));
  };

  const decryptData = async (data: string): Promise<any> => {
    // Mock decryption
    return JSON.parse(atob(data));
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="offline-capability-manager">
      {children}
      
      {/* Offline Status Indicator */}
      {!isOnline && (
        <Alert className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-auto">
          <WifiOff className="w-4 h-4" />
          <AlertTitle>You're offline</AlertTitle>
          <AlertDescription>
            You can continue using the app. Changes will sync when you're back online.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Sync Progress Indicator */}
      {syncProgress && (
        <Card className="fixed bottom-4 right-4 z-50 w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sync className="w-4 h-4 animate-spin" />
              Syncing Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={(syncProgress.completed / syncProgress.total) * 100} />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{syncProgress.completed} of {syncProgress.total}</span>
                <span>{Math.round(syncProgress.speed)} items/sec</span>
              </div>
              <div className="text-xs text-gray-500 truncate">
                Current: {syncProgress.current}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Offline Management Panel */}
      <Dialog open={showOfflinePanel} onOpenChange={setShowOfflinePanel}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed bottom-4 left-4 z-40"
          >
            <Database className="w-4 h-4 mr-2" />
            Offline
            {!isOnline && <WifiOff className="w-3 h-3 ml-1" />}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Offline Capability Manager
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab as any}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="data">Offline Data</TabsTrigger>
              <TabsTrigger value="sync">Sync</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Status Tab */}
            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Connection Status */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
                      Connection Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant={isOnline ? 'default' : 'destructive'}>
                        {isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    {networkInfo && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Type:</span>
                          <span className="text-sm font-medium capitalize">{networkInfo.connectionType}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Speed:</span>
                          <span className="text-sm font-medium">{networkInfo.effectiveType.toUpperCase()}</span>
                        </div>
                        {networkInfo.downlink > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Bandwidth:</span>
                            <span className="text-sm font-medium">{networkInfo.downlink} Mbps</span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Storage Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Storage Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {storageInfo && (
                      <>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Used:</span>
                            <span>{formatBytes(storageInfo.used)}</span>
                          </div>
                          <Progress value={storageInfo.efficiency} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Activities: {formatBytes(storageInfo.breakdown.activities)}</div>
                          <div>Media: {formatBytes(storageInfo.breakdown.media)}</div>
                          <div>Cache: {formatBytes(storageInfo.breakdown.cache)}</div>
                          <div>Other: {formatBytes(storageInfo.breakdown.other)}</div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Service Worker Status */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Service Worker
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {serviceWorkerStatus && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge variant={serviceWorkerStatus.isActivated ? 'default' : 'secondary'}>
                            {serviceWorkerStatus.isActivated ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Version:</span>
                          <span className="text-sm font-medium">{serviceWorkerStatus.version}</span>
                        </div>
                        {serviceWorkerStatus.updateAvailable && (
                          <Alert>
                            <Info className="w-4 h-4" />
                            <AlertDescription className="text-xs">
                              Update available. Refresh to apply.
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Sync Status */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sync className="w-4 h-4" />
                      Sync Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto Sync:</span>
                      <Badge variant={settings.autoSync ? 'default' : 'secondary'}>
                        {settings.autoSync ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pending Items:</span>
                      <span className="text-sm font-medium">
                        {offlineData.filter(item => item.syncStatus === 'pending').length}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={performSync}
                      disabled={!isOnline || syncProgress !== null}
                      className="w-full"
                    >
                      {syncProgress ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sync className="w-4 h-4 mr-2" />
                      )}
                      Sync Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Offline Data Tab */}
            <TabsContent value="data" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Offline Data ({offlineData.length} items)</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearOfflineData()}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {offlineData.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="capitalize">
                              {item.type.replace('_', ' ')}
                            </Badge>
                            <Badge 
                              variant={
                                item.syncStatus === 'synced' ? 'default' :
                                item.syncStatus === 'pending' ? 'secondary' :
                                item.syncStatus === 'failed' ? 'destructive' : 'outline'
                              }
                            >
                              {item.syncStatus}
                            </Badge>
                            <Badge variant="outline">{item.priority}</Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Size: {formatBytes(item.size)} • 
                            Created: {item.createdAt.toLocaleDateString()} • 
                            Accessed: {item.metadata.accessCount} times
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearOfflineData({ id: item.id })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {offlineData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No offline data stored</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Sync Tab */}
            <TabsContent value="sync" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Sync Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Total Items</div>
                        <div className="font-semibold">{offlineData.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Synced</div>
                        <div className="font-semibold text-green-600">
                          {offlineData.filter(item => item.syncStatus === 'synced').length}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Pending</div>
                        <div className="font-semibold text-yellow-600">
                          {offlineData.filter(item => item.syncStatus === 'pending').length}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Failed</div>
                        <div className="font-semibold text-red-600">
                          {offlineData.filter(item => item.syncStatus === 'failed').length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Sync Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Auto Sync</Label>
                      <Switch
                        checked={settings.autoSync}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, autoSync: checked }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Sync Interval: {settings.syncInterval} minutes</Label>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        value={settings.syncInterval}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          syncInterval: parseInt(e.target.value) 
                        }))}
                        className="w-full"
                      />
                    </div>
                    
                    <Button
                      onClick={performSync}
                      disabled={!isOnline || syncProgress !== null}
                      className="w-full"
                    >
                      {syncProgress ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sync className="w-4 h-4 mr-2" />
                      )}
                      Force Sync All
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Offline Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Enable Offline Mode</Label>
                        <Switch
                          checked={settings.enableOfflineMode}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, enableOfflineMode: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Background Sync</Label>
                        <Switch
                          checked={settings.backgroundSync}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, backgroundSync: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Compression</Label>
                        <Switch
                          checked={settings.compressionEnabled}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, compressionEnabled: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Encryption</Label>
                        <Switch
                          checked={settings.encryptionEnabled}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, encryptionEnabled: checked }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Max Storage: {settings.maxStorageSize} MB</Label>
                        <input
                          type="range"
                          min="100"
                          max="2000"
                          step="100"
                          value={settings.maxStorageSize}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            maxStorageSize: parseInt(e.target.value) 
                          }))}
                          className="w-full mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm">Caching Strategy</Label>
                        <select
                          value={settings.cachingStrategy}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            cachingStrategy: e.target.value as any 
                          }))}
                          className="w-full mt-2 p-2 border rounded"
                        >
                          <option value="minimal">Minimal</option>
                          <option value="conservative">Conservative</option>
                          <option value="aggressive">Aggressive</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Retention Period: {settings.retentionPolicy.maxAge} days</Label>
                        <input
                          type="range"
                          min="1"
                          max="90"
                          value={settings.retentionPolicy.maxAge}
                          onChange={(e) => setSettings(prev => ({ 
                            ...prev, 
                            retentionPolicy: {
                              ...prev.retentionPolicy,
                              maxAge: parseInt(e.target.value)
                            }
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

export default OfflineCapabilityManager;