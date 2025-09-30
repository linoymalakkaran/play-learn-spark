import React, { useEffect, useRef, useState } from 'react';
import { Child } from '@/types/learning';

interface UseAutoSaveOptions {
  key: string;
  child: Child;
  onSave?: (child: Child) => void;
  debounceMs?: number;
  showVisualFeedback?: boolean;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  saveCount: number;
  error: string | null;
}

export const useAutoSave = ({
  key,
  child,
  onSave,
  debounceMs = 2000,
  showVisualFeedback = true
}: UseAutoSaveOptions) => {
  const [saveState, setSaveState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    saveCount: 0,
    error: null
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const prevChildRef = useRef<string>();

  const saveData = async (childData: Child) => {
    setSaveState(prev => ({ ...prev, isSaving: true, error: null }));
    
    try {
      localStorage.setItem(key, JSON.stringify(childData));
      
      if (onSave) {
        await onSave(childData);
      }

      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        saveCount: prev.saveCount + 1,
        error: null
      }));

      if (showVisualFeedback) {
        console.log(`✅ Auto-saved: ${key}`);
      }
    } catch (error) {
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Save failed'
      }));
    }
  };

  useEffect(() => {
    if (!child) return;

    const currentChildStr = JSON.stringify(child);
    
    // Don't save if data hasn't changed
    if (currentChildStr === prevChildRef.current) {
      return;
    }

    prevChildRef.current = currentChildStr;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveData(child);
    }, debounceMs);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [child, key, onSave, debounceMs, showVisualFeedback]);

  const forceSave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (child) {
      saveData(child);
    }
  };

  const loadFromStorage = (): Child | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        setSaveState(prev => ({ ...prev, lastSaved: new Date() }));
        return data;
      }
    } catch (error) {
      setSaveState(prev => ({ ...prev, error: 'Failed to load saved data' }));
    }
    return null;
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveState,
    forceSave,
    loadFromStorage
  };
};