import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Child } from '@/types/learning';

interface ProgressState {
  currentChild: Child | null;
  sessionData: Record<string, any>;
  activityStates: Record<string, ActivityState>;
  learningStreaks: Record<string, number>;
  achievements: Achievement[];
  lastSaveTime: number;
}

interface ActivityState {
  id: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  progress: number;
  score?: number;
  timeSpent: number;
  lastAccessed: number;
  saveData?: any;
  attempts: number;
  bestScore?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number;
  category: string;
}

interface ProgressContextType extends ProgressState {
  saveProgress: (childId: string, data: Partial<ProgressState>) => Promise<void>;
  loadProgress: (childId: string) => Promise<void>;
  getChildProgress: (childId: string) => Child['progress'] | null;
  updateActivityState: (activityId: string, state: Partial<ActivityState>) => void;
  getActivityState: (activityId: string) => ActivityState | null;
  addAchievement: (achievement: Omit<Achievement, 'unlockedAt'>) => void;
  updateStreak: (category: string) => void;
  clearProgress: () => void;
  exportProgress: () => string;
  importProgress: (data: string) => boolean;
  isLoading: boolean;
  lastSync: number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: React.ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [sessionData, setSessionData] = useState<Record<string, any>>({});
  const [activityStates, setActivityStates] = useState<Record<string, ActivityState>>({});
  const [learningStreaks, setLearningStreaks] = useState<Record<string, number>>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(0);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentChild && Date.now() - lastSaveTime > 30000) {
        saveProgress(currentChild.name, {});
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentChild, lastSaveTime]);

  // Save progress before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentChild) {
        // Synchronous save for page unload
        const progressData = {
          currentChild,
          sessionData,
          activityStates,
          learningStreaks,
          achievements,
          lastSaveTime: Date.now()
        };
        localStorage.setItem(`play-learn-spark-progress-${currentChild.name}`, JSON.stringify(progressData));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentChild, sessionData, activityStates, learningStreaks, achievements]);

  const saveProgress = useCallback(async (childId: string, data: Partial<ProgressState>) => {
    setIsLoading(true);
    try {
      const progressData = {
        currentChild,
        sessionData: { ...sessionData, ...data.sessionData },
        activityStates: { ...activityStates, ...data.activityStates },
        learningStreaks: { ...learningStreaks, ...data.learningStreaks },
        achievements: data.achievements || achievements,
        lastSaveTime: Date.now()
      };

      // Save to localStorage
      localStorage.setItem(`play-learn-spark-progress-${childId}`, JSON.stringify(progressData));
      
      // Save to session storage for current session
      sessionStorage.setItem('play-learn-spark-current-session', JSON.stringify({
        childId,
        sessionStart: sessionData.sessionStart || Date.now(),
        activitiesCompleted: Object.values(activityStates).filter(s => s.status === 'completed').length,
        totalTimeSpent: Object.values(activityStates).reduce((sum, s) => sum + s.timeSpent, 0)
      }));

      setLastSaveTime(Date.now());
      setLastSync(Date.now());
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentChild, sessionData, activityStates, learningStreaks, achievements]);

  const loadProgress = useCallback(async (childId: string) => {
    setIsLoading(true);
    try {
      const savedData = localStorage.getItem(`play-learn-spark-progress-${childId}`);
      if (savedData) {
        const progressData = JSON.parse(savedData);
        
        setCurrentChild(progressData.currentChild);
        setSessionData(progressData.sessionData || {});
        setActivityStates(progressData.activityStates || {});
        setLearningStreaks(progressData.learningStreaks || {});
        setAchievements(progressData.achievements || []);
        setLastSaveTime(progressData.lastSaveTime || Date.now());
        setLastSync(Date.now());
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateActivityState = useCallback((activityId: string, state: Partial<ActivityState>) => {
    setActivityStates(prev => ({
      ...prev,
      [activityId]: {
        id: activityId,
        status: 'not-started',
        progress: 0,
        timeSpent: 0,
        attempts: 0,
        ...prev[activityId],
        ...state,
        lastAccessed: Date.now()
      }
    }));
    setLastSaveTime(Date.now());
  }, []);

  const getActivityState = useCallback((activityId: string): ActivityState | null => {
    return activityStates[activityId] || null;
  }, [activityStates]);

  const addAchievement = useCallback((achievement: Omit<Achievement, 'unlockedAt'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      unlockedAt: Date.now()
    };
    
    setAchievements(prev => {
      // Check if achievement already exists
      if (prev.some(a => a.id === achievement.id)) {
        return prev;
      }
      return [...prev, newAchievement];
    });
    setLastSaveTime(Date.now());
  }, []);

  const updateStreak = useCallback((category: string) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    setLearningStreaks(prev => {
      const streakKey = `${category}-${today}`;
      const yesterdayKey = `${category}-${yesterday}`;
      
      const currentStreak = prev[category] || 0;
      const hadYesterday = prev[yesterdayKey] > 0;
      const hadToday = prev[streakKey] > 0;
      
      if (!hadToday) {
        const newStreak = hadYesterday ? currentStreak + 1 : 1;
        return {
          ...prev,
          [category]: newStreak,
          [streakKey]: 1
        };
      }
      
      return prev;
    });
  }, []);

  const clearProgress = useCallback(() => {
    setCurrentChild(null);
    setSessionData({});
    setActivityStates({});
    setLearningStreaks({});
    setAchievements([]);
    setLastSaveTime(Date.now());
    
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('play-learn-spark-progress-')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const exportProgress = useCallback(() => {
    const data = {
      currentChild,
      sessionData,
      activityStates,
      learningStreaks,
      achievements,
      lastSaveTime,
      exportedAt: Date.now(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  }, [currentChild, sessionData, activityStates, learningStreaks, achievements, lastSaveTime]);

  const importProgress = useCallback((data: string): boolean => {
    try {
      const imported = JSON.parse(data);
      
      if (imported.version === '1.0') {
        setCurrentChild(imported.currentChild);
        setSessionData(imported.sessionData || {});
        setActivityStates(imported.activityStates || {});
        setLearningStreaks(imported.learningStreaks || {});
        setAchievements(imported.achievements || []);
        setLastSaveTime(Date.now());
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import progress:', error);
      return false;
    }
  }, []);

  // Get child progress by ID
  const getChildProgress = useCallback((childId: string): Child['progress'] | null => {
    if (currentChild?.id === childId) {
      return currentChild.progress;
    }
    
    // Try to load from sessionData or localStorage
    const savedData = sessionData[childId] || localStorage.getItem(`progress_${childId}`);
    if (savedData) {
      try {
        const parsed = typeof savedData === 'string' ? JSON.parse(savedData) : savedData;
        return parsed.currentChild?.progress || null;
      } catch (error) {
        console.error('Failed to parse saved progress:', error);
      }
    }
    
    return null;
  }, [currentChild, sessionData]);

  const value: ProgressContextType = {
    currentChild,
    sessionData,
    activityStates,
    learningStreaks,
    achievements,
    lastSaveTime,
    isLoading,
    lastSync,
    saveProgress,
    loadProgress,
    getChildProgress,
    updateActivityState,
    getActivityState,
    addAchievement,
    updateStreak,
    clearProgress,
    exportProgress,
    importProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export default ProgressProvider;