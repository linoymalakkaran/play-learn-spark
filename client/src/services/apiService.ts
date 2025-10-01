/**
 * API Integration Service for Play & Learn Spark Frontend
 * Centralized service for connecting frontend components with backend APIs
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API configuration - Use import.meta.env for Vite compatibility
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Backend availability state
let isBackendAvailable = false;
let backendCheckPromise: Promise<boolean> | null = null;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// API Service Class
class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
        
        // Handle common error scenarios
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        } else if (error.response?.status === 403) {
          // Forbidden - show permission error
          console.error('Access forbidden');
        } else if (error.response?.status >= 500) {
          // Server error - show generic error message
          console.error('Server error occurred');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Check if backend is available
  async checkBackendAvailability(): Promise<boolean> {
    if (backendCheckPromise) {
      return backendCheckPromise;
    }

    backendCheckPromise = new Promise(async (resolve) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
        isBackendAvailable = response.status === 200;
        resolve(isBackendAvailable);
      } catch (error) {
        console.warn('Backend not available, running in static mode');
        isBackendAvailable = false;
        resolve(false);
      }
    });

    return backendCheckPromise;
  }

  // Check if backend is currently available
  isBackendOnline(): boolean {
    return isBackendAvailable;
  }

  // Generic API methods with backend availability checks
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Check backend availability first
      const backendAvailable = await this.checkBackendAvailability();
      if (!backendAvailable) {
        return {
          success: false,
          error: 'Backend service is not available. Some features may be limited.'
        };
      }

      const response = await this.api.get(url, config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Request failed'
      };
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Check backend availability first
      const backendAvailable = await this.checkBackendAvailability();
      if (!backendAvailable) {
        return {
          success: false,
          error: 'Backend service is not available. Some features may be limited.'
        };
      }

      const response = await this.api.post(url, data, config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Request failed'
      };
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Check backend availability first
      const backendAvailable = await this.checkBackendAvailability();
      if (!backendAvailable) {
        return {
          success: false,
          error: 'Backend service is not available. Some features may be limited.'
        };
      }

      const response = await this.api.put(url, data, config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Request failed'
      };
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      // Check backend availability first
      const backendAvailable = await this.checkBackendAvailability();
      if (!backendAvailable) {
        return {
          success: false,
          error: 'Backend service is not available. Some features may be limited.'
        };
      }

      const response = await this.api.delete(url, config);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Request failed'
      };
    }
  }

  // File upload method
  async uploadFile<T>(url: string, file: File, additionalData?: any): Promise<ApiResponse<T>> {
    // Check backend availability first
    const backendAvailable = await this.checkBackendAvailability();
    if (!backendAvailable) {
      return {
        success: false,
        error: 'File upload requires backend service. Please try again later.'
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    try {
      const response = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Upload failed'
      };
    }
  }

  // Multiple file upload
  async uploadMultipleFiles<T>(url: string, files: File[], additionalData?: any): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    try {
      const response = await this.api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Upload failed'
      };
    }
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();

// Specific API endpoints

// AI Services API
export const aiService = {
  // Generate content with AI
  generateContent: async (data: {
    prompt: string;
    type: 'story' | 'activity' | 'lesson';
    ageGroup: string;
    provider?: 'openai' | 'anthropic' | 'huggingface';
  }) => {
    return apiService.post('/ai/generate-content', data);
  },

  // Generate story
  generateStory: async (data: {
    theme: string;
    characters: string[];
    ageGroup: string;
    length: 'short' | 'medium' | 'long';
  }) => {
    return apiService.post('/ai/generate-story', data);
  },

  // Generate image
  generateImage: async (data: {
    prompt: string;
    style?: string;
    size?: string;
  }) => {
    return apiService.post('/ai/generate-image', data);
  },

  // Check content safety
  checkSafety: async (data: {
    content: string;
    type: 'text' | 'image';
  }) => {
    return apiService.post('/ai/check-safety', data);
  },

  // Get AI service health
  getHealth: async () => {
    return apiService.get('/ai/health');
  }
};

// Content Management API
export const contentService = {
  // Upload single file
  uploadFile: async (file: File, metadata?: any) => {
    return apiService.uploadFile('/content/upload', file, metadata);
  },

  // Upload multiple files
  uploadMultipleFiles: async (files: File[], metadata?: any) => {
    return apiService.uploadMultipleFiles('/content/upload-multiple', files, metadata);
  },

  // Process URL content
  processUrl: async (data: { url: string; type?: string }) => {
    return apiService.post('/content/process-url', data);
  },

  // Get file status
  getFileStatus: async (fileId: string) => {
    return apiService.get(`/content/file-status/${fileId}`);
  },

  // Delete file
  deleteFile: async (fileId: string) => {
    return apiService.delete(`/content/file/${fileId}`);
  },

  // Get upload statistics
  getUploadStats: async () => {
    return apiService.get('/content/upload-stats');
  },

  // Get recommendations
  getRecommendations: async (params: {
    childId?: string;
    ageGroup?: string;
    topics?: string;
    skills?: string;
    difficulty?: string;
    duration?: string;
    contentType?: string;
    language?: string;
    learningStyle?: string;
    excludeCompleted?: boolean;
    prioritizeStruggling?: boolean;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return apiService.get(`/content/recommendations?${queryParams.toString()}`);
  },

  // Generate learning path
  generateLearningPath: async (data: {
    childId: string;
    targetSkills: string[];
    durationWeeks?: number;
    priorityAreas?: string[];
  }) => {
    return apiService.post('/content/learning-path', data);
  },

  // Get age-appropriate content
  getAgeAppropriateContent: async (params: {
    age: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return apiService.get(`/content/age-appropriate?${queryParams.toString()}`);
  },

  // Adjust difficulty
  adjustDifficulty: async (data: {
    childId: string;
    recentPerformance: any[];
  }) => {
    return apiService.post('/content/adjust-difficulty', data);
  },

  // Discover content by interests
  discoverByInterests: async (params: {
    interests: string;
    diversityFactor?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return apiService.get(`/content/discover-interests?${queryParams.toString()}`);
  },

  // Get child analytics
  getChildAnalytics: async (params: {
    childId: string;
    timeframe?: string;
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    return apiService.get(`/content/child-analytics?${queryParams.toString()}`);
  }
};

// User Management API (placeholder for future implementation)
export const userService = {
  // Get user profile
  getProfile: async (userId: string) => {
    return apiService.get(`/users/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId: string, data: any) => {
    return apiService.put(`/users/${userId}`, data);
  },

  // Get user preferences
  getPreferences: async (userId: string) => {
    return apiService.get(`/users/${userId}/preferences`);
  },

  // Update user preferences
  updatePreferences: async (userId: string, preferences: any) => {
    return apiService.put(`/users/${userId}/preferences`, preferences);
  }
};

// Analytics API (placeholder for future implementation)
export const analyticsService = {
  // Track user activity
  trackActivity: async (data: {
    userId: string;
    activity: string;
    metadata?: any;
  }) => {
    return apiService.post('/analytics/track', data);
  },

  // Get user analytics
  getUserAnalytics: async (userId: string, timeframe?: string) => {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return apiService.get(`/analytics/users/${userId}${params}`);
  },

  // Get content analytics
  getContentAnalytics: async (contentId: string) => {
    return apiService.get(`/analytics/content/${contentId}`);
  }
};

// WebSocket service for real-time features
class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: string) {
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws?userId=${userId}`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    const listeners = this.listeners.get(type) || [];
    listeners.forEach(listener => listener(payload));
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        // Re-establish connection logic would go here
      }, delay);
    }
  }

  subscribe(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(callback);
  }

  unsubscribe(eventType: string, callback: Function) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

export const wsService = new WebSocketService();

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    return new ApiError(
      error.response.data?.message || error.message,
      error.response.status,
      error.response.data?.code,
      error.response.data
    );
  } else if (error.request) {
    // Request was made but no response received
    return new ApiError('Network error - please check your connection', 0, 'NETWORK_ERROR');
  } else {
    // Something else happened
    return new ApiError(error.message || 'Unknown error occurred', 0, 'UNKNOWN_ERROR');
  }
};

// Retry mechanism for failed requests
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError;
};

// Caching utilities
class CacheService {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  set(key: string, data: any, ttlMinutes: number = 5) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const cacheService = new CacheService();

// Cached API wrapper
export const withCache = async <T>(
  key: string,
  operation: () => Promise<ApiResponse<T>>,
  ttlMinutes: number = 5
): Promise<ApiResponse<T>> => {
  // Check cache first
  const cached = cacheService.get(key);
  if (cached) {
    console.log(`📦 Cache hit: ${key}`);
    return cached;
  }

  // Execute operation and cache result
  console.log(`🔄 Cache miss: ${key}`);
  const result = await operation();
  
  if (result.success) {
    cacheService.set(key, result, ttlMinutes);
  }
  
  return result;
};

export default apiService;