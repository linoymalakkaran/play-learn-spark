/**
 * React Hooks for API Integration
 * Custom hooks for managing API calls, loading states, and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, contentService, aiService, ApiResponse } from '../services/apiService';
import { staticModeService } from '../services/staticModeService';

// Generic API hook
interface UseApiOptions<T> {
  immediate?: boolean;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  cacheKey?: string;
  cacheTTL?: number;
}

export function useApi<T>(
  apiFunction: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction();
      
      if (!mountedRef.current) return;
      
      if (response.success && response.data) {
        setData(response.data);
        options.onSuccess?.(response.data);
      } else {
        const errorMessage = response.error || 'Request failed';
        setError(errorMessage);
        options.onError?.(errorMessage);
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, options]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, options.dependencies || []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}

// Content recommendations hook with static fallback
export function useRecommendations(params: {
  childId?: string;
  ageGroup?: string;
  topics?: string[];
  skills?: string[];
  difficulty?: string;
  limit?: number;
}) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if backend is available
      const backendAvailable = await apiService.checkBackendAvailability();
      
      if (backendAvailable) {
        // Use API service
        const response = await contentService.getRecommendations({
          ...params,
          topics: params.topics?.join(','),
          skills: params.skills?.join(',')
        });
        
        if (response.success && response.data) {
          setData(Array.isArray(response.data) ? response.data : [response.data]);
        } else {
          throw new Error(response.error || 'Failed to fetch recommendations');
        }
      } else {
        // Use static mode
        const recommendations = await staticModeService.getRecommendations(params);
        setData(recommendations);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recommendations');
      // Fallback to static mode on error
      try {
        const recommendations = await staticModeService.getRecommendations(params);
        setData(recommendations);
        setError(null);
      } catch (staticErr) {
        console.error('Static mode also failed:', staticErr);
      }
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    }
  };
}

// Child analytics hook with static fallback
export function useChildAnalytics(childId: string, timeframe: string = '30d') {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if backend is available
      const backendAvailable = await apiService.checkBackendAvailability();
      
      if (backendAvailable) {
        // Use API service
        const response = await contentService.getChildAnalytics({ childId, timeframe });
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch analytics');
        }
      } else {
        // Use static mode
        const analytics = await staticModeService.getAnalytics(timeframe);
        setData(analytics);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics');
      // Fallback to static mode on error
      try {
        const analytics = await staticModeService.getAnalytics(timeframe);
        setData(analytics);
        setError(null);
      } catch (staticErr) {
        console.error('Static mode also failed:', staticErr);
      }
    } finally {
      setLoading(false);
    }
  }, [childId, timeframe]);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    }
  };
}

// File upload hook
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const uploadSingle = useCallback(async (file: File, metadata?: any) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress (in real implementation, you'd use XMLHttpRequest for progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await contentService.uploadFile(file, metadata);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (response.success && response.data) {
        setUploadedFiles(prev => [...prev, response.data as any]);
        return response.data;
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const uploadMultiple = useCallback(async (files: File[], metadata?: any) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 300);

      const response = await contentService.uploadMultipleFiles(files, metadata);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        const uploadedData = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
        setUploadedFiles(prev => [...prev, ...uploadedData]);
        return response.data;
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadedFiles([]);
    setError(null);
    setProgress(0);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadedFiles,
    uploadSingle,
    uploadMultiple,
    reset
  };
}

// AI content generation hook
export function useAiGeneration() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);

  const generateContent = useCallback(async (data: {
    prompt: string;
    type: 'story' | 'activity' | 'lesson';
    ageGroup: string;
    provider?: 'openai' | 'anthropic' | 'huggingface';
  }) => {
    setGenerating(true);
    setError(null);

    try {
      const response = await aiService.generateContent(data);
      
      if (response.success) {
        setGeneratedContent(prev => [...prev, response.data]);
        return response.data;
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed');
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const generateStory = useCallback(async (data: {
    theme: string;
    characters: string[];
    ageGroup: string;
    length: 'short' | 'medium' | 'long';
  }) => {
    setGenerating(true);
    setError(null);

    try {
      const response = await aiService.generateStory(data);
      
      if (response.success) {
        setGeneratedContent(prev => [...prev, response.data]);
        return response.data;
      } else {
        throw new Error(response.error || 'Story generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Story generation failed');
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const generateImage = useCallback(async (data: {
    prompt: string;
    style?: string;
    size?: string;
  }) => {
    setGenerating(true);
    setError(null);

    try {
      const response = await aiService.generateImage(data);
      
      if (response.success) {
        setGeneratedContent(prev => [...prev, response.data]);
        return response.data;
      } else {
        throw new Error(response.error || 'Image generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Image generation failed');
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGeneratedContent([]);
    setError(null);
  }, []);

  return {
    generating,
    error,
    generatedContent,
    generateContent,
    generateStory,
    generateImage,
    reset
  };
}

// Learning path hook
export function useLearningPath(childId: string) {
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePath = useCallback(async (data: {
    targetSkills: string[];
    durationWeeks?: number;
    priorityAreas?: string[];
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await contentService.generateLearningPath({
        childId,
        ...data
      });
      
      if (response.success) {
        setPaths(prev => [...prev, response.data]);
        return response.data;
      } else {
        throw new Error(response.error || 'Learning path generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Learning path generation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [childId]);

  const loadPaths = useCallback(async () => {
    // This would fetch existing learning paths for the child
    // For now, it's a placeholder
    setLoading(true);
    try {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPaths([]); // Would load actual paths here
    } catch (err: any) {
      setError(err.message || 'Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (childId) {
      loadPaths();
    }
  }, [childId, loadPaths]);

  return {
    paths,
    loading,
    error,
    generatePath,
    loadPaths
  };
}

// Real-time updates hook
export function useRealtimeUpdates(userId: string) {
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock WebSocket connection
    const mockConnect = () => {
      setConnected(true);
      
      // Simulate receiving updates
      const interval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance of update
          setUpdates(prev => [...prev, {
            id: Date.now(),
            type: 'achievement',
            message: 'New achievement unlocked!',
            timestamp: new Date()
          }]);
        }
      }, 10000);

      return () => {
        clearInterval(interval);
        setConnected(false);
      };
    };

    const cleanup = mockConnect();
    return cleanup;
  }, [userId]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    connected,
    updates,
    error,
    clearUpdates
  };
}

// Debounced search hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Search hook with debouncing
export function useSearch(searchFunction: (query: string) => Promise<ApiResponse<any>>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const performSearch = useCallback(async (searchQuery: string) => {
    setSearching(true);
    setError(null);

    try {
      const response = await searchFunction(searchQuery);
      
      if (response.success) {
        setResults(response.data || []);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [searchFunction]);

  return {
    query,
    setQuery,
    results,
    searching,
    error,
    clearResults: () => setResults([])
  };
}

// Infinite scroll hook for paginated data
export function useInfiniteScroll<T>(
  fetchFunction: (page: number) => Promise<ApiResponse<T[]>>,
  options: { pageSize?: number; initialPage?: number } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(options.initialPage || 1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchFunction(page);
      
      if (response.success && response.data) {
        const newData = response.data;
        setData(prev => [...prev, ...newData]);
        
        // Check if there's more data
        const pageSize = options.pageSize || 20;
        setHasMore(newData.length >= pageSize);
        setPage(prev => prev + 1);
      } else {
        setError(response.error || 'Failed to load data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchFunction, options.pageSize]);

  const reset = useCallback(() => {
    setData([]);
    setPage(options.initialPage || 1);
    setHasMore(true);
    setError(null);
  }, [options.initialPage]);

  // Load initial data
  useEffect(() => {
    loadMore();
  }, []); // Only run once on mount

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset
  };
}

// Local storage hook with API sync
export function useLocalStorageSync<T>(
  key: string,
  defaultValue: T,
  syncFunction?: () => Promise<ApiResponse<T>>
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const updated = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  }, [key]);

  const sync = useCallback(async () => {
    if (!syncFunction || syncing) return;

    setSyncing(true);
    try {
      const response = await syncFunction();
      if (response.success && response.data) {
        updateValue(response.data);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  }, [syncFunction, syncing, updateValue]);

  return {
    value,
    setValue: updateValue,
    sync,
    syncing,
    lastSync
  };
}

export default {
  useApi,
  useRecommendations,
  useChildAnalytics,
  useFileUpload,
  useAiGeneration,
  useLearningPath,
  useRealtimeUpdates,
  useDebounce,
  useSearch,
  useInfiniteScroll,
  useLocalStorageSync
};