import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

import {
  Hand,
  MousePointer,
  TouchpadOff,
  Zap,
  RotateCcw,
  Move,
  ZoomIn,
  ZoomOut,
  Volume2,
  Vibrate,
  Timer,
  Target,
  Activity,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  Check,
  Heart,
  Star,
  Bookmark,
  Share,
  Download,
  Upload,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  Info,
  HelpCircle,
  Lightbulb,
  Brain,
  Gamepad2,
  Smartphone,
  Tablet,
  Monitor,
  Headphones
} from 'lucide-react';

interface TouchInteractionEngineProps {
  children: React.ReactNode;
  onGesture?: (gesture: GestureEvent) => void;
  onTouch?: (touch: TouchEvent) => void;
  settings?: TouchSettings;
}

interface TouchSettings {
  sensitivity: number; // 0-100
  hapticFeedback: boolean;
  audioFeedback: boolean;
  gesturesEnabled: boolean;
  multiTouchEnabled: boolean;
  preventDefaultBehavior: boolean;
  debounceTime: number; // milliseconds
  longPressThreshold: number; // milliseconds
  swipeThreshold: number; // pixels
  pinchThreshold: number; // scale factor
  rotateThreshold: number; // degrees
}

interface GestureEvent {
  type: GestureType;
  data: GestureData;
  timestamp: number;
  element: HTMLElement;
  confidence: number;
  metadata: GestureMetadata;
}

type GestureType = 
  | 'tap' 
  | 'double_tap' 
  | 'long_press' 
  | 'swipe' 
  | 'pinch' 
  | 'rotate' 
  | 'pan' 
  | 'flick'
  | 'two_finger_tap'
  | 'three_finger_tap'
  | 'force_touch'
  | 'edge_swipe';

interface GestureData {
  startPoint: Point;
  endPoint: Point;
  deltaX: number;
  deltaY: number;
  distance: number;
  velocity: number;
  direction: Direction;
  duration: number;
  pressure?: number;
  scale?: number;
  rotation?: number;
  touchPoints: TouchPoint[];
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  pressure: number;
  radiusX: number;
  radiusY: number;
  timestamp: number;
}

interface Point {
  x: number;
  y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';

interface GestureMetadata {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  inputSource: 'touch' | 'mouse' | 'pen' | 'trackpad';
  targetElement: string;
  elementBounds: DOMRect;
  sessionId: string;
}

interface TouchAnalytics {
  totalGestures: number;
  gestureFrequency: Record<GestureType, number>;
  averageDuration: number;
  averageVelocity: number;
  preferredGestures: GestureType[];
  errorRate: number;
  accuracy: number;
  efficiency: number;
  usabilityScore: number;
}

interface HapticPattern {
  type: 'success' | 'error' | 'warning' | 'info' | 'selection' | 'custom';
  pattern: HapticFrame[];
  repeat?: number;
  delay?: number;
}

interface HapticFrame {
  intensity: number; // 0-1
  duration: number; // milliseconds
  frequency?: number; // Hz
}

interface TouchFeedback {
  visual: VisualFeedback;
  haptic?: HapticPattern;
  audio?: AudioFeedback;
}

interface VisualFeedback {
  type: 'ripple' | 'highlight' | 'scale' | 'glow' | 'shake' | 'pulse';
  color: string;
  duration: number;
  intensity: number;
}

interface AudioFeedback {
  type: 'click' | 'success' | 'error' | 'selection' | 'navigation';
  volume: number;
  pitch?: number;
}

interface GestureRecognizer {
  type: GestureType;
  recognizer: (touches: TouchPoint[], history: TouchPoint[][]) => number; // confidence 0-1
  threshold: number;
  isEnabled: boolean;
}

const TouchInteractionEngine: React.FC<TouchInteractionEngineProps> = ({
  children,
  onGesture,
  onTouch,
  settings: initialSettings
}) => {
  // Settings state
  const [settings, setSettings] = useState<TouchSettings>({
    sensitivity: 75,
    hapticFeedback: true,
    audioFeedback: false,
    gesturesEnabled: true,
    multiTouchEnabled: true,
    preventDefaultBehavior: true,
    debounceTime: 50,
    longPressThreshold: 500,
    swipeThreshold: 50,
    pinchThreshold: 0.1,
    rotateThreshold: 15,
    ...initialSettings
  });

  // Touch state
  const [isActive, setIsActive] = useState(false);
  const [activeTouches, setActiveTouches] = useState<TouchPoint[]>([]);
  const [gestureInProgress, setGestureInProgress] = useState<GestureType | null>(null);
  const [analytics, setAnalytics] = useState<TouchAnalytics>({
    totalGestures: 0,
    gestureFrequency: {} as Record<GestureType, number>,
    averageDuration: 0,
    averageVelocity: 0,
    preferredGestures: [],
    errorRate: 0,
    accuracy: 0,
    efficiency: 0,
    usabilityScore: 0
  });

  // Refs for tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const touchHistoryRef = useRef<TouchPoint[][]>([]);
  const gestureTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ timestamp: number; point: Point } | null>(null);
  const sessionIdRef = useRef(generateSessionId());

  // Gesture recognizers
  const gestureRecognizers = useRef<GestureRecognizer[]>([
    {
      type: 'tap',
      recognizer: recognizeTap,
      threshold: 0.8,
      isEnabled: true
    },
    {
      type: 'double_tap',
      recognizer: recognizeDoubleTap,
      threshold: 0.8,
      isEnabled: true
    },
    {
      type: 'long_press',
      recognizer: recognizeLongPress,
      threshold: 0.9,
      isEnabled: true
    },
    {
      type: 'swipe',
      recognizer: recognizeSwipe,
      threshold: 0.7,
      isEnabled: true
    },
    {
      type: 'pinch',
      recognizer: recognizePinch,
      threshold: 0.8,
      isEnabled: settings.multiTouchEnabled
    },
    {
      type: 'rotate',
      recognizer: recognizeRotate,
      threshold: 0.8,
      isEnabled: settings.multiTouchEnabled
    },
    {
      type: 'pan',
      recognizer: recognizePan,
      threshold: 0.7,
      isEnabled: true
    },
    {
      type: 'flick',
      recognizer: recognizeFlick,
      threshold: 0.8,
      isEnabled: true
    }
  ]);

  // Initialize audio context for feedback
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (settings.audioFeedback && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported');
      }
    }
  }, [settings.audioFeedback]);

  // Generate unique session ID
  function generateSessionId(): string {
    return `touch-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Convert touch event to touch points
  const convertTouchEvent = useCallback((e: TouchEvent): TouchPoint[] => {
    return Array.from(e.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      pressure: (touch as any).force || 0.5,
      radiusX: touch.radiusX || 10,
      radiusY: touch.radiusY || 10,
      timestamp: Date.now()
    }));
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  // Calculate direction from start to end point
  const calculateDirection = useCallback((start: Point, end: Point): Direction => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    
    if (angle >= -22.5 && angle < 22.5) return 'right';
    if (angle >= 22.5 && angle < 67.5) return 'down-right';
    if (angle >= 67.5 && angle < 112.5) return 'down';
    if (angle >= 112.5 && angle < 157.5) return 'down-left';
    if (angle >= 157.5 || angle < -157.5) return 'left';
    if (angle >= -157.5 && angle < -112.5) return 'up-left';
    if (angle >= -112.5 && angle < -67.5) return 'up';
    return 'up-right';
  }, []);

  // Provide haptic feedback
  const triggerHapticFeedback = useCallback((pattern: HapticPattern) => {
    if (!settings.hapticFeedback || !navigator.vibrate) return;
    
    const vibrationPattern = pattern.pattern.map(frame => frame.duration);
    navigator.vibrate(vibrationPattern);
  }, [settings.hapticFeedback]);

  // Provide audio feedback
  const triggerAudioFeedback = useCallback((feedback: AudioFeedback) => {
    if (!settings.audioFeedback || !audioContextRef.current) return;
    
    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = feedback.pitch || 800;
      gainNode.gain.value = feedback.volume * 0.1;
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.warn('Audio feedback failed:', error);
    }
  }, [settings.audioFeedback]);

  // Provide visual feedback
  const triggerVisualFeedback = useCallback((element: HTMLElement, feedback: VisualFeedback) => {
    const className = `touch-feedback-${feedback.type}`;
    element.classList.add(className);
    
    setTimeout(() => {
      element.classList.remove(className);
    }, feedback.duration);
  }, []);

  // Gesture recognizer functions
  function recognizeTap(touches: TouchPoint[], history: TouchPoint[][]): number {
    if (touches.length !== 1 || history.length < 2) return 0;
    
    const duration = touches[0].timestamp - history[0][0].timestamp;
    const distance = calculateDistance(
      { x: history[0][0].x, y: history[0][0].y },
      { x: touches[0].x, y: touches[0].y }
    );
    
    if (duration < 300 && distance < 20) return 0.9;
    return 0;
  }

  function recognizeDoubleTap(touches: TouchPoint[], history: TouchPoint[][]): number {
    if (!lastTapRef.current || touches.length !== 1) return 0;
    
    const timeDiff = Date.now() - lastTapRef.current.timestamp;
    const distance = calculateDistance(
      lastTapRef.current.point,
      { x: touches[0].x, y: touches[0].y }
    );
    
    if (timeDiff < 300 && distance < 30) return 0.95;
    return 0;
  }

  function recognizeLongPress(touches: TouchPoint[], history: TouchPoint[][]): number {
    if (touches.length !== 1 || history.length < 2) return 0;
    
    const duration = touches[0].timestamp - history[0][0].timestamp;
    const distance = calculateDistance(
      { x: history[0][0].x, y: history[0][0].y },
      { x: touches[0].x, y: touches[0].y }
    );
    
    if (duration >= settings.longPressThreshold && distance < 15) return 0.9;
    return 0;
  }

  function recognizeSwipe(touches: TouchPoint[], history: TouchPoint[][]): number {
    if (touches.length !== 1 || history.length < 3) return 0;
    
    const start = history[0][0];
    const end = touches[0];
    const distance = calculateDistance(
      { x: start.x, y: start.y },
      { x: end.x, y: end.y }
    );
    const duration = end.timestamp - start.timestamp;
    const velocity = distance / duration;
    
    if (distance > settings.swipeThreshold && velocity > 0.3) return 0.8;
    return 0;
  }

  function recognizePinch(touches: TouchPoint[], history: TouchPoint[][]): number {
    if (touches.length !== 2 || history.length < 2) return 0;
    
    const currentDistance = calculateDistance(
      { x: touches[0].x, y: touches[0].y },
      { x: touches[1].x, y: touches[1].y }
    );
    const initialDistance = calculateDistance(
      { x: history[0][0].x, y: history[0][0].y },
      { x: history[0][1].x, y: history[0][1].y }
    );
    
    const scale = currentDistance / initialDistance;
    if (Math.abs(scale - 1) > settings.pinchThreshold) return 0.85;
    return 0;
  }

  function recognizeRotate(touches: TouchPoint[], history: TouchPoint[][]): number {
    if (touches.length !== 2 || history.length < 2) return 0;
    
    const currentAngle = Math.atan2(
      touches[1].y - touches[0].y,
      touches[1].x - touches[0].x
    );
    const initialAngle = Math.atan2(
      history[0][1].y - history[0][0].y,
      history[0][1].x - history[0][0].x
    );
    
    const rotation = Math.abs(currentAngle - initialAngle) * 180 / Math.PI;
    if (rotation > settings.rotateThreshold) return 0.8;
    return 0;
  }

  function recognizePan(touches: TouchPoint[], history: TouchPoint[][]): number {
    if (touches.length !== 1 || history.length < 3) return 0;
    
    const recentMoves = history.slice(-3);
    const isConsistent = recentMoves.every((frame, index) => {
      if (index === 0) return true;
      const prevFrame = recentMoves[index - 1];
      const distance = calculateDistance(
        { x: prevFrame[0].x, y: prevFrame[0].y },
        { x: frame[0].x, y: frame[0].y }
      );
      return distance > 5;
    });
    
    return isConsistent ? 0.7 : 0;
  }

  function recognizeFlick(touches: TouchPoint[], history: TouchPoint[][]): number {
    if (touches.length !== 1 || history.length < 2) return 0;
    
    const start = history[0][0];
    const end = touches[0];
    const distance = calculateDistance(
      { x: start.x, y: start.y },
      { x: end.x, y: end.y }
    );
    const duration = end.timestamp - start.timestamp;
    const velocity = distance / duration;
    
    if (velocity > 1.0 && distance > 30 && duration < 200) return 0.85;
    return 0;
  }

  // Process touch events and recognize gestures
  const processGesture = useCallback((touches: TouchPoint[], element: HTMLElement) => {
    if (!settings.gesturesEnabled) return;
    
    const history = touchHistoryRef.current;
    let bestMatch: { type: GestureType; confidence: number } | null = null;
    
    for (const recognizer of gestureRecognizers.current) {
      if (!recognizer.isEnabled) continue;
      
      const confidence = recognizer.recognizer(touches, history);
      if (confidence >= recognizer.threshold && 
          (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { type: recognizer.type, confidence };
      }
    }
    
    if (bestMatch && bestMatch.confidence > 0.7) {
      const startPoint = history[0] ? { x: history[0][0].x, y: history[0][0].y } : { x: 0, y: 0 };
      const endPoint = touches[0] ? { x: touches[0].x, y: touches[0].y } : { x: 0, y: 0 };
      
      const gestureEvent: GestureEvent = {
        type: bestMatch.type,
        data: {
          startPoint,
          endPoint,
          deltaX: endPoint.x - startPoint.x,
          deltaY: endPoint.y - startPoint.y,
          distance: calculateDistance(startPoint, endPoint),
          velocity: history.length > 1 ? 
            calculateDistance(startPoint, endPoint) / (touches[0]?.timestamp - history[0][0]?.timestamp || 1) : 0,
          direction: calculateDirection(startPoint, endPoint),
          duration: touches[0]?.timestamp - history[0][0]?.timestamp || 0,
          pressure: touches[0]?.pressure,
          touchPoints: touches
        },
        timestamp: Date.now(),
        element,
        confidence: bestMatch.confidence,
        metadata: {
          deviceType: window.innerWidth <= 768 ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'desktop',
          inputSource: 'touch',
          targetElement: element.tagName.toLowerCase(),
          elementBounds: element.getBoundingClientRect(),
          sessionId: sessionIdRef.current
        }
      };
      
      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        totalGestures: prev.totalGestures + 1,
        gestureFrequency: {
          ...prev.gestureFrequency,
          [bestMatch.type]: (prev.gestureFrequency[bestMatch.type] || 0) + 1
        }
      }));
      
      // Provide feedback
      const feedback: TouchFeedback = {
        visual: {
          type: 'ripple',
          color: '#3b82f6',
          duration: 300,
          intensity: 0.8
        },
        haptic: {
          type: 'selection',
          pattern: [{ intensity: 0.5, duration: 50 }]
        },
        audio: {
          type: 'selection',
          volume: 0.3
        }
      };
      
      triggerVisualFeedback(element, feedback.visual);
      if (feedback.haptic) triggerHapticFeedback(feedback.haptic);
      if (feedback.audio) triggerAudioFeedback(feedback.audio);
      
      // Call gesture handler
      if (onGesture) {
        onGesture(gestureEvent);
      }
      
      // Update last tap for double-tap detection
      if (bestMatch.type === 'tap') {
        lastTapRef.current = {
          timestamp: Date.now(),
          point: endPoint
        };
      }
      
      setGestureInProgress(bestMatch.type);
      setTimeout(() => setGestureInProgress(null), 500);
    }
  }, [settings, onGesture, calculateDistance, calculateDirection, triggerVisualFeedback, triggerHapticFeedback, triggerAudioFeedback]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (settings.preventDefaultBehavior) {
      e.preventDefault();
    }
    
    const touches = convertTouchEvent(e);
    setActiveTouches(touches);
    setIsActive(true);
    
    // Start touch history
    touchHistoryRef.current = [touches];
    
    // Start long press timer
    if (touches.length === 1) {
      gestureTimerRef.current = setTimeout(() => {
        processGesture(touches, e.target as HTMLElement);
      }, settings.longPressThreshold);
    }
    
    if (onTouch) {
      onTouch(e);
    }
  }, [settings, convertTouchEvent, processGesture, onTouch]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (settings.preventDefaultBehavior) {
      e.preventDefault();
    }
    
    const touches = convertTouchEvent(e);
    setActiveTouches(touches);
    
    // Add to touch history
    touchHistoryRef.current.push(touches);
    
    // Limit history size
    if (touchHistoryRef.current.length > 20) {
      touchHistoryRef.current = touchHistoryRef.current.slice(-20);
    }
    
    // Cancel long press if movement detected
    if (gestureTimerRef.current && touches.length === 1) {
      const firstTouch = touchHistoryRef.current[0][0];
      const currentTouch = touches[0];
      const distance = calculateDistance(
        { x: firstTouch.x, y: firstTouch.y },
        { x: currentTouch.x, y: currentTouch.y }
      );
      
      if (distance > 15) {
        clearTimeout(gestureTimerRef.current);
        gestureTimerRef.current = null;
      }
    }
    
    if (onTouch) {
      onTouch(e);
    }
  }, [settings, convertTouchEvent, calculateDistance, onTouch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (settings.preventDefaultBehavior) {
      e.preventDefault();
    }
    
    const touches = convertTouchEvent(e);
    
    // Clear timers
    if (gestureTimerRef.current) {
      clearTimeout(gestureTimerRef.current);
      gestureTimerRef.current = null;
    }
    
    // Process final gesture
    if (touchHistoryRef.current.length > 0) {
      processGesture(activeTouches, e.target as HTMLElement);
    }
    
    // Clean up
    if (touches.length === 0) {
      setActiveTouches([]);
      setIsActive(false);
      touchHistoryRef.current = [];
    } else {
      setActiveTouches(touches);
    }
    
    if (onTouch) {
      onTouch(e);
    }
  }, [settings, convertTouchEvent, activeTouches, processGesture, onTouch]);

  // Attach event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const options = { passive: !settings.preventDefaultBehavior };
    
    container.addEventListener('touchstart', handleTouchStart, options);
    container.addEventListener('touchmove', handleTouchMove, options);
    container.addEventListener('touchend', handleTouchEnd, options);
    container.addEventListener('touchcancel', handleTouchEnd, options);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, settings.preventDefaultBehavior]);

  // Update gesture recognizers when settings change
  useEffect(() => {
    gestureRecognizers.current = gestureRecognizers.current.map(recognizer => ({
      ...recognizer,
      isEnabled: recognizer.type === 'pinch' || recognizer.type === 'rotate' 
        ? settings.multiTouchEnabled && settings.gesturesEnabled
        : settings.gesturesEnabled
    }));
  }, [settings.gesturesEnabled, settings.multiTouchEnabled]);

  return (
    <div 
      ref={containerRef}
      className={`touch-interaction-engine ${isActive ? 'touch-active' : ''} ${gestureInProgress ? `gesture-${gestureInProgress}` : ''}`}
      data-touch-enabled={settings.gesturesEnabled}
      data-multitouch-enabled={settings.multiTouchEnabled}
    >
      {children}
      
      {/* Touch Debug Overlay (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <TouchDebugOverlay
          activeTouches={activeTouches}
          gestureInProgress={gestureInProgress}
          analytics={analytics}
          settings={settings}
          onSettingsChange={setSettings}
        />
      )}
      
      {/* Touch Analytics Panel */}
      <TouchAnalyticsPanel
        analytics={analytics}
        isVisible={false} // Toggle based on admin settings
      />
    </div>
  );
};

// Touch Debug Overlay for Development
interface TouchDebugOverlayProps {
  activeTouches: TouchPoint[];
  gestureInProgress: GestureType | null;
  analytics: TouchAnalytics;
  settings: TouchSettings;
  onSettingsChange: (settings: TouchSettings) => void;
}

const TouchDebugOverlay: React.FC<TouchDebugOverlayProps> = ({
  activeTouches,
  gestureInProgress,
  analytics,
  settings,
  onSettingsChange
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      {/* Debug Toggle */}
      <Button
        className="fixed bottom-4 left-4 z-50 bg-purple-600 hover:bg-purple-700"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
      >
        <Hand className="w-4 h-4 mr-2" />
        Touch Debug
      </Button>

      {/* Debug Panel */}
      {isVisible && (
        <Card className="fixed bottom-16 left-4 z-50 w-80 max-h-96 overflow-y-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Touch Debug Panel
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 text-sm">
            {/* Active Touches */}
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-2 block">Active Touches</Label>
              <div className="space-y-1">
                {activeTouches.map(touch => (
                  <div key={touch.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                    <span>Touch {touch.id}</span>
                    <span>({Math.round(touch.x)}, {Math.round(touch.y)})</span>
                  </div>
                ))}
                {activeTouches.length === 0 && (
                  <div className="text-gray-500 text-xs">No active touches</div>
                )}
              </div>
            </div>
            
            {/* Current Gesture */}
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-2 block">Current Gesture</Label>
              <Badge variant={gestureInProgress ? 'default' : 'outline'}>
                {gestureInProgress || 'None'}
              </Badge>
            </div>
            
            {/* Analytics */}
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-2 block">Session Analytics</Label>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Total Gestures:</span>
                  <span>{analytics.totalGestures}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Duration:</span>
                  <span>{Math.round(analytics.averageDuration)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span>{Math.round(analytics.accuracy)}%</span>
                </div>
              </div>
            </div>
            
            {/* Settings */}
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-2 block">Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs">Haptic Feedback</span>
                  <Switch
                    checked={settings.hapticFeedback}
                    onCheckedChange={(checked) => 
                      onSettingsChange({ ...settings, hapticFeedback: checked })
                    }
                    size="sm"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs">Audio Feedback</span>
                  <Switch
                    checked={settings.audioFeedback}
                    onCheckedChange={(checked) => 
                      onSettingsChange({ ...settings, audioFeedback: checked })
                    }
                    size="sm"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Sensitivity: {settings.sensitivity}%</Label>
                  <Slider
                    value={[settings.sensitivity]}
                    onValueChange={([value]) => 
                      onSettingsChange({ ...settings, sensitivity: value })
                    }
                    max={100}
                    min={0}
                    step={5}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Touch Visualization */}
      {activeTouches.map(touch => (
        <div
          key={touch.id}
          className="fixed pointer-events-none z-40 w-12 h-12 border-2 border-blue-500 rounded-full bg-blue-200 bg-opacity-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: touch.x,
            top: touch.y,
            width: Math.max(24, touch.radiusX * 2),
            height: Math.max(24, touch.radiusY * 2)
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-700">
            {touch.id}
          </div>
        </div>
      ))}
    </>
  );
};

// Touch Analytics Panel
interface TouchAnalyticsPanelProps {
  analytics: TouchAnalytics;
  isVisible: boolean;
}

const TouchAnalyticsPanel: React.FC<TouchAnalyticsPanelProps> = ({ analytics, isVisible }) => {
  if (!isVisible) return null;

  return (
    <Card className="fixed top-4 right-4 z-30 w-64">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Touch Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{analytics.totalGestures}</div>
            <div className="text-xs text-gray-500">Total Gestures</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{Math.round(analytics.accuracy)}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{Math.round(analytics.efficiency)}%</div>
            <div className="text-xs text-gray-500">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{Math.round(analytics.usabilityScore)}</div>
            <div className="text-xs text-gray-500">Usability</div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <Label className="text-xs font-medium text-gray-500 mb-2 block">Most Used Gestures</Label>
          <div className="space-y-1">
            {Object.entries(analytics.gestureFrequency)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([gesture, count]) => (
                <div key={gesture} className="flex items-center justify-between text-xs">
                  <span className="capitalize">{gesture.replace('_', ' ')}</span>
                  <Badge variant="outline" className="text-xs">{count}</Badge>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TouchInteractionEngine;