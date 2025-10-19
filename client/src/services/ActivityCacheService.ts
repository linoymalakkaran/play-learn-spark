/**
 * Activity Cache Service
 * Handles caching of AI-generated activities to avoid repeated API calls
 */

import { InteractiveActivity, ActivityCache } from '@/types/ActivityTemplates';

class ActivityCacheService {
  private static instance: ActivityCacheService;
  private cache: Map<string, ActivityCache> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly STORAGE_KEY = 'ai_activity_cache';

  constructor() {
    this.loadFromStorage();
    this.setupCleanupInterval();
  }

  static getInstance(): ActivityCacheService {
    if (!ActivityCacheService.instance) {
      ActivityCacheService.instance = new ActivityCacheService();
    }
    return ActivityCacheService.instance;
  }

  /**
   * Generate a cache key based on content
   */
  private generateCacheKey(content: string): string {
    // Simple hash function for content
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `content_${Math.abs(hash)}`;
  }

  /**
   * Check if activities are cached for given content
   */
  isCached(content: string): boolean {
    const key = this.generateCacheKey(content);
    const cached = this.cache.get(key);
    
    if (!cached) return false;
    
    // Check if cache has expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      this.saveToStorage();
      return false;
    }
    
    return true;
  }

  /**
   * Get cached activities for content
   */
  getCachedActivities(content: string): InteractiveActivity[] | null {
    if (!this.isCached(content)) return null;
    
    const key = this.generateCacheKey(content);
    const cached = this.cache.get(key);
    return cached?.activities || null;
  }

  /**
   * Cache activities for content
   */
  cacheActivities(content: string, activities: InteractiveActivity[]): void {
    const key = this.generateCacheKey(content);
    const now = Date.now();
    
    const cacheEntry: ActivityCache = {
      key,
      content: content.substring(0, 500), // Store first 500 chars for reference
      activities,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };
    
    this.cache.set(key, cacheEntry);
    this.saveToStorage();
    
    console.log(`✅ Cached ${activities.length} activities for content (key: ${key})`);
  }

  /**
   * Clear all cached activities
   */
  clearCache(): void {
    this.cache.clear();
    this.saveToStorage();
    console.log('🗑️ Activity cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalEntries: number, oldestEntry: Date | null, newestEntry: Date | null } {
    const entries = Array.from(this.cache.values());
    
    return {
      totalEntries: entries.length,
      oldestEntry: entries.length > 0 ? new Date(Math.min(...entries.map(e => e.timestamp))) : null,
      newestEntry: entries.length > 0 ? new Date(Math.max(...entries.map(e => e.timestamp))) : null
    };
  }

  /**
   * Get all cached content summaries
   */
  getCachedContentList(): Array<{ key: string, contentPreview: string, activityCount: number, timestamp: Date }> {
    return Array.from(this.cache.values()).map(cached => ({
      key: cached.key,
      contentPreview: cached.content,
      activityCount: cached.activities.length,
      timestamp: new Date(cached.timestamp)
    }));
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Only load non-expired entries
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          if (value.expiresAt > now) {
            this.cache.set(key, value);
          }
        });
        
        console.log(`📦 Loaded ${this.cache.size} cached activities from storage`);
      }
    } catch (error) {
      console.warn('Failed to load activity cache from storage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save activity cache to storage:', error);
      
      // If storage is full, clear some old entries and try again
      if (error instanceof Error && error.message.includes('quota')) {
        this.clearOldEntries();
        try {
          const data = Object.fromEntries(this.cache.entries());
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (retryError) {
          console.error('Failed to save cache even after cleanup:', retryError);
        }
      }
    }
  }

  /**
   * Clear old cache entries when storage is full
   */
  private clearOldEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 50% of entries
    const toRemove = Math.floor(entries.length / 2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
    
    console.log(`🧹 Cleaned up ${toRemove} old cache entries`);
  }

  /**
   * Setup interval to clean expired entries
   */
  private setupCleanupInterval(): void {
    // Clean up expired entries every hour
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      for (const [key, cached] of this.cache.entries()) {
        if (now > cached.expiresAt) {
          this.cache.delete(key);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        this.saveToStorage();
        console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

export const activityCacheService = ActivityCacheService.getInstance();