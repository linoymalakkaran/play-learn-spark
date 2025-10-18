import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '@/services/apiService';

export interface User {
  id: string;
  email?: string; // Optional for guest users
  username: string;
  role: 'parent' | 'child' | 'educator' | 'admin' | 'guest';
  isGuest?: boolean; // Flag to identify guest users
  profile: {
    firstName: string;
    lastName: string;
    grade?: string; // Add grade for students
    age?: number;
    avatarUrl?: string;
    preferences: {
      language: string;
      difficulty: 'easy' | 'medium' | 'hard';
      topics: string[];
    };
  };
  subscription: {
    type: 'free' | 'premium' | 'family' | 'guest';
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
  isGuest: boolean;
  requiresAuth: (feature: string) => { allowed: boolean; message?: string };
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  loginAsGuest: (name: string, grade?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (updates: Partial<User['profile']>) => Promise<{ success: boolean; message?: string }>;
  clearAuth: () => void;
  saveUserProgress: (progress: any) => void;
  getUserProgress: () => any;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  role?: 'parent' | 'child' | 'educator';
  firstName: string;
  lastName: string;
  age?: number;
  grade?: string;
  language?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'play-learn-spark-auth';
const TOKEN_STORAGE_KEY = 'authToken';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
const REMEMBER_ME_KEY = 'rememberMe';
const USER_PROGRESS_KEY = 'userProgress';

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

        if (savedAuth) {
          const userData = JSON.parse(savedAuth);
          setUser(userData);
          
          // Only set tokens for authenticated users (not guests)
          if (savedToken && !userData.isGuest) {
            setTokens({
              accessToken: savedToken,
              refreshToken: savedRefreshToken || ''
            });
          }
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
    if (user) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        
        // Only save tokens for authenticated users (not guests)
        if (tokens?.accessToken && !user.isGuest) {
          localStorage.setItem(TOKEN_STORAGE_KEY, tokens.accessToken);
          if (tokens.refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
          }
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

  const loginAsGuest = useCallback(async (name: string, grade?: string) => {
    setIsLoading(true);
    try {
      // Try to use backend guest login if available
      try {
        const response = await authService.loginAsGuest(name, grade);

        if (response.success && response.data) {
          const userData = (response.data as any).user;
          const tokenData = (response.data as any).tokens;
          if (userData && tokenData) {
            // Mark user as guest and add grade info
            userData.isGuest = true;
            userData.profile = userData.profile || {};
            userData.profile.grade = grade || '';
            
            setUser(userData);
            setTokens(tokenData);
            
            // Store auth data in localStorage for guest
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
            localStorage.setItem(TOKEN_STORAGE_KEY, tokenData.accessToken);
            localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokenData.refreshToken);
            
            return { success: true, message: 'Welcome! You can now use the app with full features.' };
          }
        }
      } catch (apiError) {
        console.warn('Backend guest login failed, falling back to local guest:', apiError);
      }

      // Fallback to local guest user if backend is not available
      const guestUser: User = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username: name,
        role: 'guest',
        isGuest: true,
        profile: {
          firstName: name,
          lastName: '',
          grade: grade || '',
          preferences: {
            language: 'en',
            difficulty: 'easy',
            topics: []
          }
        },
        subscription: {
          type: 'guest',
          features: ['offline_activities', 'local_progress']
        },
        progress: {
          totalActivitiesCompleted: 0,
          currentLevel: 1,
          totalPoints: 0,
          streakDays: 0
        },
        createdAt: new Date().toISOString()
      };

      setUser(guestUser);
      setTokens(null); // No tokens for local guest users
      
      // Store guest user locally
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(guestUser));
      
      return { success: true, message: 'Welcome! You can now use the app (offline mode).' };
    } catch (error) {
      console.error('Guest login failed:', error);
      return { success: false, message: 'Failed to start guest session. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);

      if (response.success && response.data) {
        const userData = (response.data as any).user;
        const tokenData = (response.data as any).tokens;
        if (userData && tokenData) {
          setUser(userData);
          setTokens(tokenData);
          
          // Store remember me preference
          if (rememberMe) {
            localStorage.setItem(REMEMBER_ME_KEY, 'true');
          } else {
            localStorage.removeItem(REMEMBER_ME_KEY);
          }
          
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

  const saveUserProgress = useCallback((progress: any) => {
    try {
      const progressData = {
        userId: user?.id,
        progress,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(progressData));
    } catch (error) {
      console.warn('Failed to save user progress:', error);
    }
  }, [user?.id]);

  const getUserProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(USER_PROGRESS_KEY);
      if (saved) {
        const progressData = JSON.parse(saved);
        if (progressData.userId === user?.id) {
          return progressData.progress;
        }
      }
      return null;
    } catch (error) {
      console.warn('Failed to load user progress:', error);
      return null;
    }
  }, [user?.id]);

  const isAuthenticated = !!user && !!tokens?.accessToken;
  const isGuest = !!user && user.isGuest === true;

  const requiresAuth = useCallback((feature: string) => {
    // Features that require backend authentication
    const authRequiredFeatures = [
      'integrated_platform',
      'analytics_dashboard', 
      'ai_features',
      'content_management',
      'cloud_sync',
      'multiplayer',
      'progress_sharing'
    ];

    if (authRequiredFeatures.includes(feature)) {
      if (!isAuthenticated) {
        return {
          allowed: false,
          message: 'This feature requires you to create an account. Please log in or register to continue.'
        };
      }
    }

    return { allowed: true };
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    isGuest,
    requiresAuth,
    login,
    loginAsGuest,
    logout,
    register,
    refreshToken,
    updateProfile,
    clearAuth,
    saveUserProgress,
    getUserProgress,
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