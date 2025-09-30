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

  return (
    <div
      ref={containerRef}
      className={`page-transition w-full h-full ${transitionClass}`}
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transformStyle: 'preserve-3d'
      }}
    >
      <style jsx>{`
        .page-transition.transition-in {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .page-transition.transition-out {
          opacity: 0;
          transform: translateY(-20px) scale(1.02);
        }
        
        .page-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
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

  return (
    <div className={getTransitionClass()}>
      <style jsx>{`
        .route-transition {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }
        
        .route-transition-fade.active {
          opacity: 1;
        }
        
        .route-transition-fade.transitioning {
          opacity: 0;
        }
        
        .route-transition-slide.active {
          transform: translateX(0);
          opacity: 1;
        }
        
        .route-transition-slide.transitioning {
          transform: translateX(-100%);
          opacity: 0;
        }
        
        .route-transition-scale.active {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
        
        .route-transition-scale.transitioning {
          transform: scale(0.98) translateY(20px);
          opacity: 0;
        }
      `}</style>
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

  if (!shouldRender) return null;

  return (
    <div className={`activity-transition ${animationClass}`}>
      <style jsx>{`
        .activity-transition {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          perspective: 1000px;
          width: 100%;
          height: 100%;
        }
        
        .activity-enter-active {
          opacity: 1;
          transform: scale(1) rotateY(0deg);
        }
        
        .activity-exit-active {
          opacity: 0;
          transform: scale(1.1) rotateY(10deg);
        }
        
        .activity-transition:not(.activity-enter-active) {
          opacity: 0;
          transform: scale(0.9) rotateY(-10deg);
        }
      `}</style>
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

  return (
    <div className="loading-transition">
      <style jsx>{`
        .loading-transition {
          position: relative;
          width: 100%;
          min-height: 200px;
        }
        
        .loading-content,
        .main-content {
          transition: opacity 0.3s ease-in-out;
          position: absolute;
          width: 100%;
          top: 0;
          left: 0;
        }
        
        .loading-content {
          opacity: ${isLoading ? 1 : 0};
          pointer-events: ${isLoading ? 'auto' : 'none'};
        }
        
        .main-content {
          opacity: ${showContent ? 1 : 0};
          pointer-events: ${showContent ? 'auto' : 'none'};
        }
        
        .spinner {
          width: 32px;
          height: 32px;
          border: 4px solid var(--primary);
          border-top: 4px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="loading-content">
        {loadingComponent || (
          <div className="flex items-center justify-center h-64">
            <div className="spinner" />
          </div>
        )}
      </div>
      
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default PageTransition;