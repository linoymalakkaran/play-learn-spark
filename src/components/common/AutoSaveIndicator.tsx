import React from 'react';
import { AutoSaveState } from '@/hooks/useAutoSave';

interface AutoSaveIndicatorProps {
  saveState: AutoSaveState;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ saveState }) => {
  if (saveState.error) {
    return (
      <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg border border-red-200">
        <span>❌</span>
        <span>Save failed</span>
      </div>
    );
  }

  if (saveState.isSaving) {
    return (
      <div className="flex items-center space-x-2 text-blue-500 text-sm bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 animate-pulse">
        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Saving...</span>
      </div>
    );
  }

  if (saveState.lastSaved) {
    const timeAgo = Math.floor((Date.now() - saveState.lastSaved.getTime()) / 1000);
    const timeText = timeAgo < 60 ? 'just now' : `${Math.floor(timeAgo / 60)}m ago`;
    
    return (
      <div className="flex items-center space-x-2 text-green-500 text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200">
        <span>✅</span>
        <span>Saved {timeText} ({saveState.saveCount} saves)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-gray-500 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
      <span>💾</span>
      <span>Auto-save ready</span>
    </div>
  );
};