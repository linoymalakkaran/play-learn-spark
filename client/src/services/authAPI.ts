import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
const MONGO_API_BASE_URL = `${API_BASE_URL}/v2`; // MongoDB endpoints

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  role?: 'parent' | 'child' | 'educator';
  firstName: string;
  lastName: string;
  age?: number;
  grade?: string;
  language?: string;
  invitedBy?: string;
}

class AuthAPI {
  private api: AxiosInstance;
  private mongoApi: AxiosInstance;

  constructor() {
    // SQLite API instance (legacy)
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // MongoDB API instance (enhanced)
    this.mongoApi = axios.create({
      baseURL: MONGO_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.mongoApi.interceptors.request.use(
      (config) => {
        const tokens = this.getStoredTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.mongoApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = this.getStoredTokens();
            if (tokens?.refreshToken) {
              const response = await this.refreshToken(tokens.refreshToken);
              if (response.success && response.data) {
                this.updateStoredTokens({
                  ...tokens,
                  accessToken: response.data.accessToken
                });
                
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return this.mongoApi(originalRequest);
              }
            }
          } catch (refreshError) {
            this.clearStoredTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getStoredTokens() {
    try {
      const tokens = localStorage.getItem('auth-tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  }

  private updateStoredTokens(tokens: any) {
    localStorage.setItem('auth-tokens', JSON.stringify(tokens));
  }

  private clearStoredTokens() {
    localStorage.removeItem('auth-tokens');
    localStorage.removeItem('auth-state');
  }

  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
    return response.data;
  }

  private handleError(error: any): ApiResponse {
    if (error.response?.data) {
      return error.response.data;
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }

  // Authentication Methods (MongoDB)
  async register(userData: RegisterData): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.post('/auth/register', userData);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.post('/auth/login', {
        email,
        password
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async loginAsGuest(name: string, grade?: string): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.post('/auth/guest-login', {
        name,
        grade
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.post('/auth/logout');
      this.clearStoredTokens();
      return this.handleResponse(response);
    } catch (error) {
      this.clearStoredTokens();
      return this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.post('/auth/refresh-token', {
        refreshToken
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.post('/auth/verify-email', {
        token
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProfile(): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.get('/auth/profile');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProfile(updates: any): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.put('/auth/profile', updates);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserPermissions(): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.get('/auth/permissions');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getChildren(): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.get('/auth/children');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async requestPasswordReset(email: string): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.post('/auth/request-password-reset', {
        email
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await this.mongoApi.post('/auth/reset-password', {
        token,
        newPassword
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Legacy SQLite methods (for backward compatibility)
  async loginLegacy(email: string, password: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/auth/login', {
        email,
        password
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async registerLegacy(userData: RegisterData): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/auth/register', userData);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async loginAsGuestLegacy(name: string, grade?: string): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/auth/guest-login', {
        name,
        grade
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Database status check
  async getDatabaseStatus(): Promise<ApiResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/database-status`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Health check
  async getHealthStatus(): Promise<ApiResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();
export default authAPI;