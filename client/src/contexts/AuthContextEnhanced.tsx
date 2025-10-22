import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/authAPI';

export interface User {
  _id: string;
  email?: string;
  username: string;
  role: 'parent' | 'child' | 'educator' | 'admin' | 'guest';
  isGuest?: boolean;
  profile: {
    firstName: string;
    lastName: string;
    age?: number;
    grade?: string;
    avatarUrl?: string;
    dateOfBirth?: Date;
    bio?: string;
    preferences: {
      language: 'en' | 'ar' | 'ml' | 'es' | 'fr';
      difficulty: 'easy' | 'medium' | 'hard';
      topics: string[];
      notifications: {
        email: boolean;
        push: boolean;
        assignments: boolean;
        progress: boolean;
        achievements: boolean;
        reminders: boolean;
      };
      privacy: {
        profileVisible: boolean;
        progressVisible: boolean;
        allowMessages: boolean;
      };
      accessibility: {
        highContrast: boolean;
        largeText: boolean;
        screenReader: boolean;
        reducedMotion: boolean;
      };
    };
  };
  progress: {
    totalActivitiesCompleted: number;
    currentLevel: number;
    totalPoints: number;
    badges: string[];
    streakDays: number;
    lastActiveDate: Date;
    weeklyGoal?: number;
    achievements: {
      id: string;
      unlockedAt: Date;
      category: string;
    }[];
  };
  subscription: {
    type: 'free' | 'premium' | 'family' | 'school' | 'trial';
    expiresAt?: Date;
    features: string[];
    trialUsed: boolean;
    billingCycle?: 'monthly' | 'yearly';
  };
  verification: {
    email: boolean;
    parentVerification: boolean;
    teacherVerification: boolean;
    identityVerified: boolean;
  };
  metadata: {
    isGuest: boolean;
    createdAt: Date;
    lastActiveAt: Date;
  };
}

export interface Permission {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

interface AuthState {
  user: User | null;
  permissions: Permission[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
  } | null;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: any } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_PERMISSIONS'; payload: Permission[] }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  permissions: [],
  isLoading: false,
  isAuthenticated: false,
  isGuest: false,
  tokens: null,
  error: null
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        isGuest: action.payload.user.metadata?.isGuest || false,
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        isGuest: false,
        user: null,
        tokens: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...initialState
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'SET_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  loginAsGuest: (name: string, grade?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User['profile']>) => Promise<void>;
  refreshToken: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  canPerformAction: (action: string) => boolean;
  clearError: () => void;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load saved auth state on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const savedAuth = localStorage.getItem('auth-state');
        const savedTokens = localStorage.getItem('auth-tokens');

        if (savedAuth && savedTokens) {
          const userData = JSON.parse(savedAuth);
          const tokensData = JSON.parse(savedTokens);

          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: userData,
              tokens: tokensData
            }
          });

          // Load user permissions
          await loadUserPermissions();
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        localStorage.removeItem('auth-state');
        localStorage.removeItem('auth-tokens');
      }
    };

    loadAuthState();
  }, []);

  // Save auth state to localStorage
  useEffect(() => {
    if (state.user && state.tokens) {
      localStorage.setItem('auth-state', JSON.stringify(state.user));
      localStorage.setItem('auth-tokens', JSON.stringify(state.tokens));
    } else {
      localStorage.removeItem('auth-state');
      localStorage.removeItem('auth-tokens');
    }
  }, [state.user, state.tokens]);

  const loadUserPermissions = async () => {
    try {
      const response = await authAPI.getUserPermissions();
      if (response.success && response.data) {
        dispatch({
          type: 'SET_PERMISSIONS',
          payload: response.data.permissions || []
        });
      }
    } catch (error) {
      console.error('Failed to load user permissions:', error);
    }
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            tokens: response.data.tokens
          }
        });

        // Load user permissions after successful login
        await loadUserPermissions();
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message || 'Login failed'
        });
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Network error occurred'
      });
    }
  };

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authAPI.register(userData);
      
      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            tokens: response.data.tokens
          }
        });

        // Load user permissions after successful registration
        await loadUserPermissions();
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message || 'Registration failed'
        });
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Network error occurred'
      });
    }
  };

  const loginAsGuest = async (name: string, grade?: string) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authAPI.loginAsGuest(name, grade);
      
      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.user,
            tokens: response.data.tokens
          }
        });

        // Load guest permissions
        await loadUserPermissions();
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message || 'Guest login failed'
        });
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Network error occurred'
      });
    }
  };

  const logout = async () => {
    try {
      if (state.tokens?.accessToken) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (updates: Partial<User['profile']>) => {
    try {
      const response = await authAPI.updateProfile(updates);
      
      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user
        });
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Network error occurred');
    }
  };

  const refreshToken = async () => {
    if (!state.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authAPI.refreshToken(state.tokens.refreshToken);
      
      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: state.user!,
            tokens: {
              ...state.tokens,
              accessToken: response.data.accessToken
            }
          }
        });
      } else {
        dispatch({ type: 'LOGOUT' });
        throw new Error('Token refresh failed');
      }
    } catch (error: any) {
      dispatch({ type: 'LOGOUT' });
      throw new Error(error.message || 'Token refresh failed');
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await authAPI.verifyEmail(token);
      
      if (response.success) {
        // Update user's email verification status
        if (state.user) {
          const updatedUser = {
            ...state.user,
            verification: {
              ...state.user.verification,
              email: true
            }
          };
          dispatch({
            type: 'UPDATE_USER',
            payload: updatedUser
          });
        }
      } else {
        throw new Error(response.message || 'Email verification failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!state.user || !state.permissions) return false;
    
    // Admin has all permissions
    if (state.user.role === 'admin') return true;
    
    // Check specific permission
    return state.permissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!state.user) return false;
    
    const allowedRoles = Array.isArray(role) ? role : [role];
    return allowedRoles.includes(state.user.role);
  };

  const canPerformAction = (action: string): boolean => {
    if (!state.user) return false;
    
    // Basic action checks based on role and features
    const userFeatures = state.user.subscription?.features || [];
    
    switch (action) {
      case 'create_activity':
        return hasRole(['educator', 'admin']) && userFeatures.includes('create_activity');
      case 'view_analytics':
        return hasRole(['educator', 'admin', 'parent']) && userFeatures.includes('view_analytics');
      case 'manage_class':
        return hasRole(['educator', 'admin']) && userFeatures.includes('manage_class');
      default:
        return hasPermission('*', action) || hasPermission('general', action);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    loginAsGuest,
    logout,
    updateProfile,
    refreshToken,
    verifyEmail,
    hasPermission,
    hasRole,
    canPerformAction,
    clearError
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