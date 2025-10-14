import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '@/services/apiService';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'parent' | 'child' | 'educator' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    age?: number;
    avatarUrl?: string;
    preferences: {
      language: string;
      difficulty: 'easy' | 'medium' | 'hard';
      topics: string[];
    };
  };
  subscription: {
    type: 'free' | 'premium' | 'family';
    features: string[];
  };
  progress?: {
    totalActivitiesCompleted: number;
    currentLevel: number;
    totalPoints: number;
    streakDays: number;
  };
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (updates: Partial<User['profile']>) => Promise<{ success: boolean; message?: string }>;
  clearAuth: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  role?: 'parent' | 'child' | 'educator';
  firstName: string;
  lastName: string;
  age?: number;
  language?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'play-learn-spark-auth';
const TOKEN_STORAGE_KEY = 'authToken';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

        if (savedAuth && savedToken) {
          const userData = JSON.parse(savedAuth);
          setUser(userData);
          setTokens({
            accessToken: savedToken,
            refreshToken: savedRefreshToken || ''
          });
        }
      } catch (error) {
        console.warn('Failed to load auth state from localStorage:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (user && tokens?.accessToken) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(TOKEN_STORAGE_KEY, tokens.accessToken);
        if (tokens.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
        }
      } catch (error) {
        console.warn('Failed to save auth state to localStorage:', error);
      }
    }
  }, [user, tokens]);

  const clearAuth = useCallback(() => {
    setUser(null);
    setTokens(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear auth state from localStorage:', error);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);

      if (response.success && response.data) {
        const userData = (response.data as any).user;
        const tokenData = (response.data as any).tokens;
        if (userData && tokenData) {
          setUser(userData);
          setTokens(tokenData);
          return { success: true };
        }
      }
      return { success: false, message: response.error || response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call logout endpoint if we have a token
      if (tokens?.accessToken) {
        await authService.logout();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      clearAuth();
      setIsLoading(false);
      // Redirect to home page after logout
      window.location.href = '/';
    }
  }, [tokens?.accessToken, clearAuth]);

  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);

      if (response.success && response.data) {
        const newUser = (response.data as any).user;
        const tokenData = (response.data as any).tokens;
        if (newUser && tokenData) {
          setUser(newUser);
          setTokens(tokenData);
          return { success: true };
        }
      }
      return { success: false, message: response.error || response.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!tokens?.refreshToken) return false;

    try {
      const response = await authService.refreshToken(tokens.refreshToken);

      if (response.success && response.data) {
        const newAccessToken = (response.data as any).accessToken;
        if (newAccessToken) {
          setTokens(prev => prev ? {
            ...prev,
            accessToken: newAccessToken
          } : null);
          return true;
        }
      }
      clearAuth();
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
      return false;
    }
  }, [tokens?.refreshToken, clearAuth]);

  const updateProfile = useCallback(async (updates: Partial<User['profile']>) => {
    if (!tokens?.accessToken) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const response = await authService.updateProfile(updates);

      if (response.success && response.data) {
        const updatedUser = (response.data as any).user;
        if (updatedUser) {
          setUser(updatedUser);
          return { success: true };
        }
      }
      return { success: false, message: response.error || response.message || 'Profile update failed' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }, [tokens?.accessToken]);

  const isAuthenticated = !!user && !!tokens?.accessToken;

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    refreshToken,
    updateProfile,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;