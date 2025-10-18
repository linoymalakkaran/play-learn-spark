import { useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { activityCompletionService } from '../services/activityCompletionService';
import { useRewardStore } from '../stores/rewardStore';

interface SyncResult {
  success: boolean;
  syncedActivities: number;
  error?: string;
}

export const useSyncService = () => {
  const { user, isAuthenticated, isGuest } = useAuth();
  const { initializeRewardCard } = useRewardStore();

  // Sync local data to backend when user logs in
  const syncLocalDataToBackend = useCallback(async (): Promise<SyncResult> => {
    if (!user || !isAuthenticated || isGuest) {
      return { success: false, syncedActivities: 0, error: 'User not authenticated' };
    }

    try {
      const guestUserId = 'guest-user'; // This could be more sophisticated
      
      // Check if there's local data to sync
      if (!activityCompletionService.needsSync(guestUserId)) {
        console.log('No local data to sync');
        return { success: true, syncedActivities: 0 };
      }

      console.log('Starting sync process for user:', user.id);
      
      // Perform the sync
      const syncResult = await activityCompletionService.performSync(
        Number(user.id),
        guestUserId
      );

      if (syncResult.success) {
        // Initialize reward card after sync
        initializeRewardCard(user.id.toString());
        
        console.log(`✅ Sync completed: ${syncResult.syncedCount} activities synced`);
        return { 
          success: true, 
          syncedActivities: syncResult.syncedCount 
        };
      } else {
        console.error('❌ Sync failed:', syncResult.error);
        return { 
          success: false, 
          syncedActivities: 0, 
          error: syncResult.error 
        };
      }
    } catch (error) {
      console.error('❌ Sync process error:', error);
      return { 
        success: false, 
        syncedActivities: 0, 
        error: error instanceof Error ? error.message : 'Unknown sync error' 
      };
    }
  }, [user, isAuthenticated, isGuest, initializeRewardCard]);

  // Backup current progress to local storage before logout
  const backupProgressToLocal = useCallback(async (): Promise<void> => {
    if (!user || !isAuthenticated || isGuest) {
      return;
    }

    try {
      console.log('Backing up progress to local storage before logout...');
      
      // Get user's completed activities from backend
      const response = await activityCompletionService.getCompletedActivities(Number(user.id));
      
      if (response.success && response.data) {
        // Store backup with user-specific key
        const backupKey = `backup-${user.id}-${Date.now()}`;
        const backupData = {
          userId: user.id,
          completedActivities: response.data,
          backedUpAt: new Date().toISOString(),
        };
        
        localStorage.setItem(backupKey, JSON.stringify(backupData));
        
        // Keep only the latest 3 backups per user
        const allKeys = Object.keys(localStorage);
        const userBackupKeys = allKeys
          .filter(key => key.startsWith(`backup-${user.id}`))
          .sort()
          .reverse();
        
        // Remove old backups, keep only latest 3
        userBackupKeys.slice(3).forEach(key => {
          localStorage.removeItem(key);
        });
        
        console.log('✅ Progress backed up to local storage');
      }
    } catch (error) {
      console.error('❌ Failed to backup progress:', error);
    }
  }, [user, isAuthenticated, isGuest]);

  // Handle authentication state changes
  useEffect(() => {
    let syncTimeout: NodeJS.Timeout;
    
    if (isAuthenticated && user && !isGuest) {
      // User just logged in - trigger sync after a small delay
      syncTimeout = setTimeout(() => {
        syncLocalDataToBackend().then(result => {
          if (result.success && result.syncedActivities > 0) {
            console.log(`🔄 Synced ${result.syncedActivities} activities from local storage`);
            
            // Optional: Show a notification to user
            // You could emit an event or use a toast notification here
          }
        });
      }, 1000); // 1 second delay to allow other auth processes to complete
    }

    return () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
    };
  }, [isAuthenticated, user, isGuest, syncLocalDataToBackend]);

  // Listen for beforeunload to backup progress before page refresh/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && user && !isGuest) {
        // This runs synchronously, so we can't use async/await
        // Instead, we'll just mark that we need to backup
        navigator.sendBeacon && console.log('Page unloading, progress should be backed up');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, user, isGuest]);

  // Get sync status
  const getSyncStatus = useCallback(() => {
    if (!isAuthenticated || isGuest) {
      return { needsSync: false, localActivities: 0 };
    }

    const guestUserId = 'guest-user';
    const needsSync = activityCompletionService.needsSync(guestUserId);
    const stats = activityCompletionService.getActivityStats(guestUserId);
    
    return {
      needsSync,
      localActivities: stats.totalCompleted,
      totalPoints: stats.totalPoints,
      lastActivity: stats.lastActivity,
    };
  }, [isAuthenticated, isGuest]);

  // Force sync (can be called manually)
  const forceSyncNow = useCallback(async (): Promise<SyncResult> => {
    console.log('Force sync requested');
    return await syncLocalDataToBackend();
  }, [syncLocalDataToBackend]);

  // Clear local sync data (useful for testing)
  const clearLocalSyncData = useCallback(() => {
    const guestUserId = 'guest-user';
    activityCompletionService.clearLocalData(guestUserId);
    console.log('Local sync data cleared');
  }, []);

  return {
    syncLocalDataToBackend,
    backupProgressToLocal,
    getSyncStatus,
    forceSyncNow,
    clearLocalSyncData,
  };
};