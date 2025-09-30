/**
 * React hook for offline support and network status monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { globalErrorHandler } from '@/services/GlobalErrorHandler';
import { accessibilityService } from '@/services/AccessibilityService';

interface NetworkInfo {
  isOnline: boolean;
  wasOffline: boolean;
  downlink?: number;
  effectiveType?: string;
  saveData?: boolean;
}

interface OfflineQueueItem {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  retries: number;
}

export function useNetworkStatus() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    wasOffline: false
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setNetworkInfo(prev => ({
        isOnline: navigator.onLine,
        wasOffline: prev.isOnline === false && navigator.onLine === true,
        downlink: connection?.downlink,
        effectiveType: connection?.effectiveType,
        saveData: connection?.saveData
      }));
    };

    const handleOnline = () => {
      updateNetworkInfo();
      accessibilityService.announce('Connection restored', 'polite');
    };

    const handleOffline = () => {
      updateNetworkInfo();
      accessibilityService.announce('Connection lost. Working offline.', 'assertive');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isOnline } = useNetworkStatus();

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('offlineQueue');
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load offline queue:', error);
    }
  }, []);

  // Save queue to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('offlineQueue', JSON.stringify(queue));
    } catch (error) {
      console.warn('Failed to save offline queue:', error);
    }
  }, [queue]);

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      processQueue();
    }
  }, [isOnline, queue.length, isProcessing]);

  const addToQueue = useCallback((action: string, data: any) => {
    const item: OfflineQueueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    setQueue(prev => [...prev, item]);
    
    accessibilityService.announce(
      `Action queued for when connection is restored: ${action}`,
      'polite'
    );

    return item.id;
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing || !isOnline || queue.length === 0) return;

    setIsProcessing(true);
    
    try {
      accessibilityService.announce(
        `Processing ${queue.length} queued actions`,
        'polite'
      );

      const results = await Promise.allSettled(
        queue.map(async (item) => {
          try {
            // Dispatch custom event for queue processing
            const event = new CustomEvent('process-offline-queue-item', {
              detail: { action: item.action, data: item.data }
            });
            
            window.dispatchEvent(event);
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return { success: true, id: item.id };
          } catch (error) {
            console.warn(`Failed to process queue item ${item.id}:`, error);
            
            if (item.retries < 3) {
              // Retry with exponential backoff
              setTimeout(() => {
                setQueue(prev => prev.map(queueItem => 
                  queueItem.id === item.id 
                    ? { ...queueItem, retries: queueItem.retries + 1 }
                    : queueItem
                ));
              }, Math.pow(2, item.retries) * 1000);
              
              return { success: false, id: item.id, retry: true };
            }
            
            globalErrorHandler.handleError(error as Error, {
              component: 'offline-queue',
              action: 'process-item',
              metadata: { queueItem: item }
            });
            
            return { success: false, id: item.id, retry: false };
          }
        })
      );

      // Remove successfully processed items
      const successfulIds = results
        .filter((result, index) => 
          result.status === 'fulfilled' && 
          result.value.success
        )
        .map((result, index) => queue[index].id);

      setQueue(prev => prev.filter(item => !successfulIds.includes(item.id)));

      const processedCount = successfulIds.length;
      const failedCount = results.length - processedCount;

      if (processedCount > 0) {
        accessibilityService.announce(
          `Successfully processed ${processedCount} queued actions`,
          'polite'
        );
      }

      if (failedCount > 0) {
        accessibilityService.announce(
          `${failedCount} actions failed to process`,
          'assertive'
        );
      }

    } catch (error) {
      console.error('Queue processing failed:', error);
      globalErrorHandler.handleError(error as Error, {
        component: 'offline-queue',
        action: 'process-all'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isOnline, queue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem('offlineQueue');
    accessibilityService.announce('Offline queue cleared', 'polite');
  }, []);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
    isProcessing,
    queueSize: queue.length
  };
}

export function useOfflineStorage<T>(key: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (error) {
      console.warn(`Failed to load offline data for ${key}:`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  // Save data to localStorage when it changes
  const saveData = useCallback((newData: T) => {
    try {
      setData(newData);
      localStorage.setItem(`offline_${key}`, JSON.stringify(newData));
    } catch (error) {
      console.warn(`Failed to save offline data for ${key}:`, error);
      globalErrorHandler.handleError(error as Error, {
        component: 'offline-storage',
        action: 'save',
        metadata: { key }
      });
    }
  }, [key]);

  const clearData = useCallback(() => {
    try {
      setData(defaultValue);
      localStorage.removeItem(`offline_${key}`);
    } catch (error) {
      console.warn(`Failed to clear offline data for ${key}:`, error);
    }
  }, [key, defaultValue]);

  return {
    data,
    saveData,
    clearData,
    isLoaded
  };
}

export function useRetryableAction() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(async <T>(
    action: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> => {
    setIsRetrying(true);
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        const result = await action();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        
        if (attempt === maxRetries) {
          setIsRetrying(false);
          setRetryCount(0);
          throw error;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }
    
    throw new Error('Max retries exceeded');
  }, []);

  return {
    executeWithRetry,
    isRetrying,
    retryCount
  };
}