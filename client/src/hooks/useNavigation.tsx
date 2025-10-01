import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface NavigationState {
  currentPath: string;
  previousPath: string;
  navigationStack: string[];
  isTransitioning: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

interface NavigationContextType extends NavigationState {
  navigate: (path: string, options?: NavigationOptions) => void;
  goBack: () => void;
  goForward: () => void;
  setTransitioning: (isTransitioning: boolean) => void;
  clearNavigationStack: () => void;
  getNavigationHistory: () => string[];
}

interface NavigationOptions {
  replace?: boolean;
  state?: any;
  preventTransition?: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [previousPath, setPreviousPath] = useState('');
  const [navigationStack, setNavigationStack] = useState<string[]>([window.location.pathname]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [forwardStack, setForwardStack] = useState<string[]>([]);

  // Listen to browser navigation events
  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname;
      setPreviousPath(currentPath);
      setCurrentPath(newPath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPath]);

  // Save navigation state to localStorage
  useEffect(() => {
    const navigationState = {
      currentPath,
      previousPath,
      navigationStack: navigationStack.slice(-10), // Keep last 10 items
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('play-learn-spark-navigation', JSON.stringify(navigationState));
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }, [currentPath, previousPath, navigationStack]);

  // Restore navigation state on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('play-learn-spark-navigation');
      if (savedState) {
        const state = JSON.parse(savedState);
        const isRecent = Date.now() - state.timestamp < 30 * 60 * 1000; // 30 minutes
        
        if (isRecent && state.navigationStack) {
          setNavigationStack(state.navigationStack);
          if (state.previousPath) {
            setPreviousPath(state.previousPath);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore navigation state:', error);
    }
  }, []);

  const navigate = useCallback((path: string, options: NavigationOptions = {}) => {
    if (path === currentPath) return; // Prevent navigation to same path

    if (!options.preventTransition) {
      setIsTransitioning(true);
    }

    setPreviousPath(currentPath);
    setCurrentPath(path);

    // Update navigation stack
    setNavigationStack(prev => {
      const newStack = options.replace ? 
        [...prev.slice(0, -1), path] : 
        [...prev, path];
      return newStack.slice(-50); // Keep last 50 items
    });

    // Clear forward stack when navigating to new path
    setForwardStack([]);

    // Navigate using browser API
    if (options.replace) {
      window.history.replaceState(options.state, '', path);
    } else {
      window.history.pushState(options.state, '', path);
    }

    // Reset transition after animation
    if (!options.preventTransition) {
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentPath]);

  const goBack = useCallback(() => {
    if (navigationStack.length > 1) {
      const currentIndex = navigationStack.length - 1;
      const previousPath = navigationStack[currentIndex - 1];
      
      setForwardStack(prev => [currentPath, ...prev]);
      navigate(previousPath, { preventTransition: false });
      setNavigationStack(prev => prev.slice(0, -1));
    } else {
      // Fallback to browser back
      window.history.back();
    }
  }, [navigationStack, currentPath, navigate]);

  const goForward = useCallback(() => {
    if (forwardStack.length > 0) {
      const [nextPath, ...restForward] = forwardStack;
      setForwardStack(restForward);
      navigate(nextPath, { preventTransition: false });
    } else {
      // Fallback to browser forward
      window.history.forward();
    }
  }, [forwardStack, navigate]);

  const clearNavigationStack = useCallback(() => {
    setNavigationStack([currentPath]);
    setForwardStack([]);
    localStorage.removeItem('play-learn-spark-navigation');
  }, [currentPath]);

  const getNavigationHistory = useCallback(() => {
    return [...navigationStack];
  }, [navigationStack]);

  const setTransitioning = useCallback((transitioning: boolean) => {
    setIsTransitioning(transitioning);
  }, []);

  const value: NavigationContextType = {
    currentPath,
    previousPath,
    navigationStack,
    isTransitioning,
    canGoBack: navigationStack.length > 1,
    canGoForward: forwardStack.length > 0,
    navigate,
    goBack,
    goForward,
    setTransitioning,
    clearNavigationStack,
    getNavigationHistory
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;