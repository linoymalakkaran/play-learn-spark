import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  transitionKey 
}) => {
  const location = useLocation();
  const { isTransitioning, setTransitioning } = useNavigation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionClass, setTransitionClass] = useState('transition-in');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitioning(true);
      setTransitionClass('transition-out');
      
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionClass('transition-in');
        
        const timeout2 = setTimeout(() => {
          setTransitioning(false);
        }, 300);
        
        return () => clearTimeout(timeout2);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation, setTransitioning]);

  const getPageTransitionStyles = () => {
    const baseStyle = {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transformStyle: 'preserve-3d' as const,
      width: '100%',
      height: '100%'
    };

    if (transitionClass === 'transition-in') {
      return {
        ...baseStyle,
        opacity: 1,
        transform: 'translateY(0) scale(1)'
      };
    } else {
      return {
        ...baseStyle,
        opacity: 0,
        transform: 'translateY(-20px) scale(1.02)'
      };
    }
  };

  return (
    <div
      ref={containerRef}
      className={`page-transition w-full h-full ${transitionClass}`}
      style={getPageTransitionStyles()}
    >
      {children}
    </div>
  );
};

interface RouteTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale';
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ 
  children, 
  type = 'scale' 
}) => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location.pathname !== currentPath) {
      setIsTransitioning(true);
      
      const timeout = setTimeout(() => {
        setCurrentPath(location.pathname);
        setIsTransitioning(false);
      }, 150);
      
      return () => clearTimeout(timeout);
    }
  }, [location.pathname, currentPath]);

  const getTransitionClass = () => {
    const base = 'route-transition';
    const typeClass = `route-transition-${type}`;
    const stateClass = isTransitioning ? 'transitioning' : 'active';
    return `${base} ${typeClass} ${stateClass}`;
  };

  const getRouteTransitionStyles = () => {
    const baseStyle = {
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      width: '100%'
    };

    if (type === 'fade') {
      return {
        ...baseStyle,
        opacity: isTransitioning ? 0 : 1
      };
    } else if (type === 'slide') {
      return {
        ...baseStyle,
        transform: isTransitioning ? 'translateX(-100%)' : 'translateX(0)',
        opacity: isTransitioning ? 0 : 1
      };
    } else { // scale
      return {
        ...baseStyle,
        transform: isTransitioning ? 'scale(0.98) translateY(20px)' : 'scale(1) translateY(0)',
        opacity: isTransitioning ? 0 : 1
      };
    }
  };

  return (
    <div className={getTransitionClass()} style={getRouteTransitionStyles()}>
      {children}
    </div>
  );
};

interface ActivityTransitionProps {
  children: React.ReactNode;
  activityId: string;
  isVisible: boolean;
}

export const ActivityTransition: React.FC<ActivityTransitionProps> = ({
  children,
  activityId,
  isVisible
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setAnimationClass('activity-enter-active');
      });
    } else {
      setAnimationClass('activity-exit-active');
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  const getActivityTransitionStyles = () => {
    const baseStyle = {
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      transformStyle: 'preserve-3d' as const,
      perspective: '1000px',
      width: '100%',
      height: '100%'
    };

    if (animationClass === 'activity-enter-active') {
      return {
        ...baseStyle,
        opacity: 1,
        transform: 'scale(1) rotateY(0deg)'
      };
    } else if (animationClass === 'activity-exit-active') {
      return {
        ...baseStyle,
        opacity: 0,
        transform: 'scale(1.1) rotateY(10deg)'
      };
    } else {
      return {
        ...baseStyle,
        opacity: 0,
        transform: 'scale(0.9) rotateY(-10deg)'
      };
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={`activity-transition ${animationClass}`} style={getActivityTransitionStyles()}>
      {children}
    </div>
  );
};

interface LoadingTransitionProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  isLoading,
  children,
  loadingComponent
}) => {
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
    } else {
      const timeout = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const loadingContentStyle = {
    transition: 'opacity 0.3s ease-in-out',
    position: 'absolute' as const,
    width: '100%',
    top: 0,
    left: 0,
    opacity: isLoading ? 1 : 0,
    pointerEvents: isLoading ? 'auto' as const : 'none' as const
  };

  const mainContentStyle = {
    transition: 'opacity 0.3s ease-in-out',
    position: 'absolute' as const,
    width: '100%',
    top: 0,
    left: 0,
    opacity: showContent ? 1 : 0,
    pointerEvents: showContent ? 'auto' as const : 'none' as const
  };

  const spinnerStyle = {
    width: '32px',
    height: '32px',
    border: '4px solid var(--primary)',
    borderTop: '4px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div className="loading-transition" style={{ position: 'relative', width: '100%', minHeight: '200px' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={loadingContentStyle}>
        {loadingComponent || (
          <div className="flex items-center justify-center h-64">
            <div style={spinnerStyle} />
          </div>
        )}
      </div>
      
      <div style={mainContentStyle}>
        {children}
      </div>
    </div>
  );
};

export default PageTransition;