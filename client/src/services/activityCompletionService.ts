import apiService, { activityService, rewardsService } from './apiService';

export interface ActivityCompletion {
  activityId: string;
  languagePage: string;
  completedAt: string;
  score?: number;
  timeSpent?: number;
  pointsEarned: number;
  isFirstTime?: boolean;
  isNewCategory?: boolean;
}

interface LocalActivityData {
  userId: string;
  completedActivities: ActivityCompletion[];
  totalPoints: number;
  lastSyncAttempt?: string;
  needsSync: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ActivityCompletionService {
  private readonly STORAGE_KEY = 'play-learn-spark-activity-completions';
  private readonly SYNC_KEY = 'play-learn-spark-sync-needed';
  
  // ==========================================
  // Backend API Methods (for authenticated users)
  // ==========================================
  
  async completeActivity(
    userId: number,
    completion: ActivityCompletion
  ): Promise<ApiResponse<ActivityCompletion>> {
    try {
      const response = await activityService.completeActivity({
        userId,
        activityId: completion.activityId,
        languagePage: completion.languagePage,
        score: completion.score || 100,
        timeSpent: completion.timeSpent || 0,
        pointsEarned: completion.pointsEarned,
        completedAt: completion.completedAt,
      });

      if (response.success) {
        // Also award points through reward system
        await this.awardActivityPoints(userId, completion);
        
        return {
          success: true,
          data: completion
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to complete activity'
      };
    } catch (error) {
      console.error('Failed to complete activity via API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async getCompletedActivities(userId: number): Promise<ApiResponse<ActivityCompletion[]>> {
    try {
      const response = await activityService.getCompletedActivities(userId);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as ActivityCompletion[]
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to get completed activities'
      };
    } catch (error) {
      console.error('Failed to get completed activities via API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async awardActivityPoints(
    userId: number,
    completion: ActivityCompletion
  ): Promise<ApiResponse<any>> {
    try {
      const response = await rewardsService.awardActivityCompletion(userId, {
        activityId: completion.activityId,
        score: completion.score || 100,
        isFirstTime: completion.isFirstTime || false,
        isNewCategory: completion.isNewCategory || false,
      });

      return response;
    } catch (error) {
      console.error('Failed to award points via API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async resetUserProgress(userId: number): Promise<ApiResponse<any>> {
    try {
      const response = await activityService.resetUserProgress(userId);
      return response;
    } catch (error) {
      console.error('Failed to reset progress via API:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async syncLocalToBackend(
    userId: number,
    localData: LocalActivityData
  ): Promise<ApiResponse<{ synced: number; skipped: number }>> {
    try {
      const response = await activityService.syncLocalData({
        userId,
        completions: localData.completedActivities,
        totalPoints: localData.totalPoints,
      });

      if (response.success) {
        // Clear the sync flag
        this.clearSyncFlag(localData.userId);
        
        return response;
      }

      return {
        success: false,
        error: response.error || 'Sync failed'
      };
    } catch (error) {
      console.error('Failed to sync to backend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // ==========================================
  // Local Storage Methods (for guest users and offline backup)
  // ==========================================

  saveLocalCompletion(userId: string, completion: ActivityCompletion): void {
    try {
      const existingData = this.getLocalData(userId);
      
      // Check if activity already completed
      const alreadyCompleted = existingData.completedActivities.some(
        c => c.activityId === completion.activityId
      );
      
      if (alreadyCompleted) {
        console.warn('Activity already completed locally:', completion.activityId);
        return;
      }

      const updatedData: LocalActivityData = {
        ...existingData,
        completedActivities: [...existingData.completedActivities, completion],
        totalPoints: existingData.totalPoints + completion.pointsEarned,
        needsSync: true, // Mark as needing sync for when user logs in
      };

      localStorage.setItem(
        this.getStorageKey(userId),
        JSON.stringify(updatedData)
      );

      // Set sync flag for authentication state change handling
      this.setSyncFlag(userId);

      console.log('Activity completion saved locally:', completion.activityId);
    } catch (error) {
      console.error('Failed to save completion to localStorage:', error);
    }
  }

  getLocalCompletedActivities(userId: string): string[] {
    try {
      const data = this.getLocalData(userId);
      return data.completedActivities.map(c => c.activityId);
    } catch (error) {
      console.error('Failed to get local completed activities:', error);
      return [];
    }
  }

  getLocalData(userId: string): LocalActivityData {
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to parse local activity data:', error);
    }

    // Return default structure
    return {
      userId,
      completedActivities: [],
      totalPoints: 0,
      needsSync: false,
    };
  }

  clearLocalData(userId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(userId));
      localStorage.removeItem(this.getSyncKey(userId));
      console.log('Local activity data cleared for user:', userId);
    } catch (error) {
      console.error('Failed to clear local data:', error);
    }
  }

  // ==========================================
  // Sync Management
  // ==========================================

  needsSync(userId: string): boolean {
    try {
      const data = this.getLocalData(userId);
      return data.needsSync || this.hasSyncFlag(userId);
    } catch (error) {
      return false;
    }
  }

  setSyncFlag(userId: string): void {
    try {
      localStorage.setItem(this.getSyncKey(userId), 'true');
    } catch (error) {
      console.error('Failed to set sync flag:', error);
    }
  }

  clearSyncFlag(userId: string): void {
    try {
      localStorage.removeItem(this.getSyncKey(userId));
      
      // Also update the main data to clear needsSync flag
      const data = this.getLocalData(userId);
      if (data.needsSync) {
        data.needsSync = false;
        localStorage.setItem(this.getStorageKey(userId), JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to clear sync flag:', error);
    }
  }

  hasSyncFlag(userId: string): boolean {
    try {
      return localStorage.getItem(this.getSyncKey(userId)) === 'true';
    } catch (error) {
      return false;
    }
  }

  async performSync(userId: number, guestUserId: string): Promise<{
    success: boolean;
    syncedCount: number;
    error?: string;
  }> {
    try {
      const localData = this.getLocalData(guestUserId);
      
      if (!localData.needsSync || localData.completedActivities.length === 0) {
        return { success: true, syncedCount: 0 };
      }

      console.log('Syncing local data to backend:', {
        activitiesCount: localData.completedActivities.length,
        totalPoints: localData.totalPoints,
      });

      const syncResponse = await this.syncLocalToBackend(userId, localData);
      
      if (syncResponse.success) {
        const syncedCount = syncResponse.data?.synced || localData.completedActivities.length;
        
        // Clear local data after successful sync
        this.clearLocalData(guestUserId);
        
        return {
          success: true,
          syncedCount,
        };
      } else {
        return {
          success: false,
          syncedCount: 0,
          error: syncResponse.error || 'Sync failed',
        };
      }
    } catch (error) {
      console.error('Sync process failed:', error);
      return {
        success: false,
        syncedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      };
    }
  }

  // ==========================================
  // Utility Methods
  // ==========================================

  private getStorageKey(userId: string): string {
    return `${this.STORAGE_KEY}-${userId}`;
  }

  private getSyncKey(userId: string): string {
    return `${this.SYNC_KEY}-${userId}`;
  }

  // Get statistics for a user
  getActivityStats(userId: string): {
    totalCompleted: number;
    totalPoints: number;
    languageBreakdown: Record<string, number>;
    lastActivity?: string;
  } {
    try {
      const data = this.getLocalData(userId);
      const languageBreakdown: Record<string, number> = {};
      
      data.completedActivities.forEach(activity => {
        languageBreakdown[activity.languagePage] = 
          (languageBreakdown[activity.languagePage] || 0) + 1;
      });

      const lastActivity = data.completedActivities.length > 0
        ? data.completedActivities[data.completedActivities.length - 1].completedAt
        : undefined;

      return {
        totalCompleted: data.completedActivities.length,
        totalPoints: data.totalPoints,
        languageBreakdown,
        lastActivity,
      };
    } catch (error) {
      console.error('Failed to get activity stats:', error);
      return {
        totalCompleted: 0,
        totalPoints: 0,
        languageBreakdown: {},
      };
    }
  }

  // Check if a specific activity is completed
  isActivityCompleted(userId: string, activityId: string): boolean {
    try {
      const data = this.getLocalData(userId);
      return data.completedActivities.some(c => c.activityId === activityId);
    } catch (error) {
      return false;
    }
  }

  // Get completion data for a specific activity
  getActivityCompletion(userId: string, activityId: string): ActivityCompletion | null {
    try {
      const data = this.getLocalData(userId);
      return data.completedActivities.find(c => c.activityId === activityId) || null;
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const activityCompletionService = new ActivityCompletionService();