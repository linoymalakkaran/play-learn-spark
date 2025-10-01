import { useRef, useCallback, useEffect } from 'react';

export interface GestureEvent {
  type: 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch' | 'rotate';
  target: HTMLElement;
  touches: Touch[];
  deltaX?: number;
  deltaY?: number;
  distance?: number;
  angle?: number;
  scale?: number;
  rotation?: number;
}

export interface UseGestureOptions {
  onTap?: (event: GestureEvent) => void;
  onDoubleTap?: (event: GestureEvent) => void;
  onLongPress?: (event: GestureEvent) => void;
  onSwipe?: (event: GestureEvent) => void;
  onPinch?: (event: GestureEvent) => void;
  onRotate?: (event: GestureEvent) => void;
  
  // Configuration
  tapThreshold?: number; // ms
  doubleTapThreshold?: number; // ms
  longPressThreshold?: number; // ms
  swipeThreshold?: number; // pixels
  pinchThreshold?: number; // scale difference
  rotateThreshold?: number; // degrees
  
  // Haptic feedback
  hapticFeedback?: boolean;
}

interface TouchData {
  startTime: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  identifier: number;
}

interface MultiTouchData {
  touches: TouchData[];
  startDistance: number;
  startAngle: number;
  initialScale: number;
  initialRotation: number;
}

export const useGesture = (element: HTMLElement | null, options: UseGestureOptions = {}) => {
  const {
    onTap,
    onDoubleTap,
    onLongPress,
    onSwipe,
    onPinch,
    onRotate,
    tapThreshold = 300,
    doubleTapThreshold = 300,
    longPressThreshold = 500,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    rotateThreshold = 15,
    hapticFeedback = true,
  } = options;

  const touchData = useRef<TouchData[]>([]);
  const multiTouchData = useRef<MultiTouchData | null>(null);
  const lastTapTime = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef<boolean>(false);

  // Haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (hapticFeedback && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, [hapticFeedback]);

  // Calculate distance between two points
  const getDistance = useCallback((touch1: TouchData, touch2: TouchData): number => {
    const dx = touch1.currentX - touch2.currentX;
    const dy = touch1.currentY - touch2.currentY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate angle between two points
  const getAngle = useCallback((touch1: TouchData, touch2: TouchData): number => {
    const dx = touch1.currentX - touch2.currentX;
    const dy = touch1.currentY - touch2.currentY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    const touches = Array.from(e.touches);
    touchData.current = touches.map(touch => ({
      startTime: Date.now(),
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      identifier: touch.identifier,
    }));

    isLongPress.current = false;

    // Handle multi-touch gestures
    if (touches.length === 2) {
      const touch1 = touchData.current[0];
      const touch2 = touchData.current[1];
      
      multiTouchData.current = {
        touches: touchData.current,
        startDistance: getDistance(touch1, touch2),
        startAngle: getAngle(touch1, touch2),
        initialScale: 1,
        initialRotation: 0,
      };
    }

    // Start long press timer for single touch
    if (touches.length === 1 && onLongPress) {
      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        triggerHaptic('medium');
        
        const gestureEvent: GestureEvent = {
          type: 'longPress',
          target: e.target as HTMLElement,
          touches: e.touches as any,
        };
        
        onLongPress(gestureEvent);
      }, longPressThreshold);
    }
  }, [onLongPress, longPressThreshold, triggerHaptic, getDistance, getAngle]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    const touches = Array.from(e.touches);
    
    // Update current touch positions
    touches.forEach(touch => {
      const touchIndex = touchData.current.findIndex(t => t.identifier === touch.identifier);
      if (touchIndex !== -1) {
        touchData.current[touchIndex].currentX = touch.clientX;
        touchData.current[touchIndex].currentY = touch.clientY;
      }
    });

    // Handle multi-touch gestures
    if (touches.length === 2 && multiTouchData.current) {
      const touch1 = touchData.current[0];
      const touch2 = touchData.current[1];
      
      const currentDistance = getDistance(touch1, touch2);
      const currentAngle = getAngle(touch1, touch2);
      
      const scale = currentDistance / multiTouchData.current.startDistance;
      const rotation = currentAngle - multiTouchData.current.startAngle;

      // Detect pinch gesture
      if (onPinch && Math.abs(scale - 1) > pinchThreshold) {
        const gestureEvent: GestureEvent = {
          type: 'pinch',
          target: e.target as HTMLElement,
          touches: e.touches as any,
          scale,
          distance: currentDistance,
        };
        
        onPinch(gestureEvent);
        triggerHaptic('light');
      }

      // Detect rotation gesture
      if (onRotate && Math.abs(rotation) > rotateThreshold) {
        const gestureEvent: GestureEvent = {
          type: 'rotate',
          target: e.target as HTMLElement,
          touches: e.touches as any,
          rotation,
          angle: currentAngle,
        };
        
        onRotate(gestureEvent);
        triggerHaptic('light');
      }
    }

    // Cancel long press if moved too much
    if (longPressTimer.current && touchData.current.length === 1) {
      const touch = touchData.current[0];
      const deltaX = Math.abs(touch.currentX - touch.startX);
      const deltaY = Math.abs(touch.currentY - touch.startY);
      
      if (deltaX > 10 || deltaY > 10) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, [onPinch, onRotate, pinchThreshold, rotateThreshold, triggerHaptic, getDistance, getAngle]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Don't process other gestures if it was a long press
    if (isLongPress.current) {
      touchData.current = [];
      multiTouchData.current = null;
      return;
    }

    // Handle single touch gestures
    if (touchData.current.length === 1) {
      const touch = touchData.current[0];
      const deltaX = touch.currentX - touch.startX;
      const deltaY = touch.currentY - touch.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = Date.now() - touch.startTime;

      // Detect swipe gesture
      if (distance > swipeThreshold && onSwipe) {
        triggerHaptic('medium');
        
        const gestureEvent: GestureEvent = {
          type: 'swipe',
          target: e.target as HTMLElement,
          touches: e.changedTouches as any,
          deltaX,
          deltaY,
          distance,
        };
        
        onSwipe(gestureEvent);
      }
      // Detect tap gestures
      else if (distance < 10 && duration < tapThreshold) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTime.current;

        // Double tap
        if (timeSinceLastTap < doubleTapThreshold && onDoubleTap) {
          triggerHaptic('light');
          
          const gestureEvent: GestureEvent = {
            type: 'doubleTap',
            target: e.target as HTMLElement,
            touches: e.changedTouches as any,
          };
          
          onDoubleTap(gestureEvent);
          lastTapTime.current = 0; // Reset to prevent triple tap
        }
        // Single tap
        else if (onTap) {
          triggerHaptic('light');
          
          const gestureEvent: GestureEvent = {
            type: 'tap',
            target: e.target as HTMLElement,
            touches: e.changedTouches as any,
          };
          
          onTap(gestureEvent);
          lastTapTime.current = now;
        }
      }
    }

    // Reset touch data
    touchData.current = [];
    multiTouchData.current = null;
  }, [onTap, onDoubleTap, onSwipe, swipeThreshold, tapThreshold, doubleTapThreshold, triggerHaptic]);

  // Set up event listeners
  useEffect(() => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [element, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isListening: !!element,
  };
};

// Hook for gesture-enabled components
export const useGestureElement = (options: UseGestureOptions = {}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const gestureState = useGesture(elementRef.current, options);

  return {
    ref: elementRef,
    ...gestureState,
  };
};