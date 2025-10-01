import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Activity, Child } from '@/types/learning';
import SmartSearchService from '@/services/SmartSearchService';
import PersonalizationService from '@/services/PersonalizationService';

// Create search service instance
const searchService = new SmartSearchService();
const personalizationService = PersonalizationService.getInstance();

export interface NavigationItem {
  id: string;
  title: string;
  label?: string; // For breadcrumb display
  path: string;
  icon?: string;
  category?: string;
  lastAccessed?: number;
  isFavorite?: boolean;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  path: string;
  relevanceScore: number;
  icon?: string;
  tags?: string[];
}

export interface NavigationHistory {
  path: string;
  title: string;
  timestamp: number;
  data?: any;
}

export interface QuickAccess {
  type: 'activity' | 'category' | 'feature';
  id: string;
  title: string;
  icon: string;
  path: string;
  priority: number;
  lastUsed: number;
}

interface NavigationState {
  // Navigation State
  currentPath: string;
  currentSection: 'dashboard' | 'activities' | 'languages' | 'settings' | 'ai' | 'personalization';
  navigationHistory: NavigationHistory[];
  breadcrumbs: NavigationItem[];
  
  // Search State
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchFilters: {
    categories: string[];
    ageRange: [number, number];
    difficulty: number[];
    duration: [number, number];
    tags: string[];
  };
  recentSearches: string[];
  
  // Favorites & Quick Access
  favorites: NavigationItem[];
  recentlyAccessed: NavigationItem[];
  quickAccess: QuickAccess[];
  
  // User Preferences
  sidebarCollapsed: boolean;
  navigationStyle: 'tabs' | 'sidebar' | 'compact';
  showBreadcrumbs: boolean;
  maxRecentItems: number;
  
  // Available Content
  availableActivities: Activity[];
  availableCategories: string[];
  availableTags: string[];
  
  // Analytics
  analytics: {
    totalNavigations: number;
    popularRoutes: { path: string; count: number }[];
    searchActivity: {
      totalSearches: number;
      successfulSearches: number;
      averageResults: number;
      popularQueries: { query: string; count: number }[];
    };
    userPreferences: {
      favoriteCategories: string[];
      averageSessionTime: number;
    };
  };
}

interface NavigationActions {
  // Navigation Actions
  setCurrentPath: (path: string) => void;
  setCurrentSection: (section: NavigationState['currentSection']) => void;
  navigateTo: (item: NavigationItem) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  updateBreadcrumbs: (items: NavigationItem[]) => void;
  clearHistory: () => void;
  
  // Search Actions
  setSearchQuery: (query: string) => void;
  performSearch: (query: string, filters?: Partial<NavigationState['searchFilters']>) => Promise<SearchResult[]>;
  clearSearch: () => void;
  addRecentSearch: (query: string) => void;
  setSearchFilters: (filters: Partial<NavigationState['searchFilters']>) => void;
  
  // Favorites & Quick Access Actions
  addFavorite: (item: NavigationItem) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (item: NavigationItem) => void;
  isFavorite: (id: string) => boolean;
  addRecentlyAccessed: (item: NavigationItem) => void;
  updateQuickAccess: () => void;
  
  // Preferences Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setNavigationStyle: (style: NavigationState['navigationStyle']) => void;
  setShowBreadcrumbs: (show: boolean) => void;
  
  // Content Management
  setAvailableActivities: (activities: Activity[]) => void;
  updateActivityAccess: (activityId: string) => void;
  getRecommendedContent: (child: Child) => NavigationItem[];
  
  // Analytics
  trackNavigation: (from: string, to: string, method: 'click' | 'search' | 'favorite' | 'recent') => void;
  getNavigationAnalytics: () => {
    mostVisitedPaths: { path: string; visits: number }[];
    popularSearches: { query: string; count: number }[];
    averageSessionTime: number;
  };
  
  // Personalization
  trackActivityCompletion: (
    childId: string, 
    activityId: string, 
    performance: {
      completed: boolean;
      timeSpent: number;
      difficulty: number;
      enjoymentRating?: number;
      struggledWith?: string[];
      excelled?: string[];
    }
  ) => void;
  generatePersonalizedRecommendations: (childId: string) => Promise<any[]>;
  updateUserPreferences: (childId: string, category: string) => void;
}

type NavigationStore = NavigationState & NavigationActions;

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentPath: '/',
      currentSection: 'dashboard',
      navigationHistory: [],
      breadcrumbs: [],
      
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      searchFilters: {
        categories: [],
        ageRange: [3, 6],
        difficulty: [1, 2, 3, 4, 5],
        duration: [0, 60],
        tags: []
      },
      recentSearches: [],
      
      favorites: [],
      recentlyAccessed: [],
      quickAccess: [],
      
      sidebarCollapsed: false,
      navigationStyle: 'tabs',
      showBreadcrumbs: true,
      maxRecentItems: 10,
      
      availableActivities: [],
      availableCategories: ['english', 'math', 'science', 'habits', 'art', 'social', 'problem', 'physical', 'world', 'languages'],
      availableTags: [],
      
      analytics: {
        totalNavigations: 0,
        popularRoutes: [],
        searchActivity: {
          totalSearches: 0,
          successfulSearches: 0,
          averageResults: 0,
          popularQueries: []
        },
        userPreferences: {
          favoriteCategories: [],
          averageSessionTime: 0
        }
      },
      
      // Navigation Actions
      setCurrentPath: (path) => {
        const currentPath = get().currentPath;
        if (currentPath !== path) {
          set((state) => ({
            currentPath: path,
            navigationHistory: [
              ...state.navigationHistory,
              {
                path: currentPath,
                title: currentPath,
                timestamp: Date.now()
              }
            ].slice(-50) // Keep last 50 entries
          }));
        }
      },
      
      setCurrentSection: (section) => set({ currentSection: section }),
      
      navigateTo: (item) => {
        const { addRecentlyAccessed, setCurrentPath, trackNavigation } = get();
        
        addRecentlyAccessed(item);
        setCurrentPath(item.path);
        trackNavigation(get().currentPath, item.path, 'click');
        
        // Update quick access based on usage
        setTimeout(() => get().updateQuickAccess(), 100);
      },
      
      goBack: () => {
        const { navigationHistory } = get();
        if (navigationHistory.length > 0) {
          const previousItem = navigationHistory[navigationHistory.length - 1];
          set((state) => ({
            currentPath: previousItem.path,
            navigationHistory: state.navigationHistory.slice(0, -1)
          }));
        }
      },
      
      goForward: () => {
        // Implementation would require forward history tracking
        // For now, this is a placeholder
      },
      
      canGoBack: () => {
        return get().navigationHistory.length > 1;
      },
      
      canGoForward: () => {
        // For now, return false until forward history is implemented
        return false;
      },
      
      updateBreadcrumbs: (items) => set({ breadcrumbs: items }),
      
      clearHistory: () => set({ navigationHistory: [] }),
      
      // Search Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      performSearch: async (query, filters = {}) => {
        set({ isSearching: true });
        
        const {
          availableActivities,
          searchFilters: currentFilters,
          addRecentSearch,
          analytics
        } = get();
        
        const mergedFilters = { ...currentFilters, ...filters };
        
        try {
          // Initialize search service if needed
          await searchService.initializeIndex(availableActivities);
          
          // Use SmartSearchService for intelligent search
          const results = await searchService.search(
            query,
            mergedFilters
          );
          
          // Track search analytics
          const searchAnalytics = {
            ...analytics,
            searchActivity: {
              totalSearches: analytics.searchActivity.totalSearches + 1,
              successfulSearches: results.length > 0 ? analytics.searchActivity.successfulSearches + 1 : analytics.searchActivity.successfulSearches,
              averageResults: Math.round(
                ((analytics.searchActivity.averageResults * analytics.searchActivity.totalSearches) + results.length) / 
                (analytics.searchActivity.totalSearches + 1)
              ),
              popularQueries: [...analytics.searchActivity.popularQueries]
            }
          };
          
          // Update popular queries
          const existingQuery = searchAnalytics.searchActivity.popularQueries.find(q => q.query === query);
          if (existingQuery) {
            existingQuery.count += 1;
          } else {
            searchAnalytics.searchActivity.popularQueries.push({ query, count: 1 });
          }
          
          // Sort and limit popular queries
          searchAnalytics.searchActivity.popularQueries = searchAnalytics.searchActivity.popularQueries
            .sort((a, b) => b.count - a.count)
          set((state) => ({ 
            searchResults: results, 
            isSearching: false,
            analytics: {
              ...state.analytics,
              searchActivity: searchAnalytics.searchActivity
            }
          }));
          
          if (query.trim()) {
            addRecentSearch(query);
          }
          
          return results;
          
        } catch (error) {
          console.error('Search error:', error);
          set({ searchResults: [], isSearching: false });
          return [];
        }
      },
      
      clearSearch: () => set({ 
        searchQuery: '', 
        searchResults: [], 
        isSearching: false 
      }),
      
      addRecentSearch: (query) => {
        if (!query.trim()) return;
        
        set((state) => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter(q => q !== query)
          ].slice(0, 10)
        }));
      },
      
      setSearchFilters: (filters) => {
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters }
        }));
      },
      
      // Favorites & Quick Access Actions
      addFavorite: (item) => {
        set((state) => {
          if (state.favorites.some(fav => fav.id === item.id)) {
            return state;
          }
          return {
            favorites: [...state.favorites, { ...item, isFavorite: true }]
          };
        });
      },
      
      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter(fav => fav.id !== id)
        }));
      },
      
      toggleFavorite: (item) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        
        if (isFavorite(item.id)) {
          removeFavorite(item.id);
        } else {
          addFavorite(item);
        }
      },
      
      isFavorite: (id) => {
        return get().favorites.some(fav => fav.id === id);
      },
      
      addRecentlyAccessed: (item) => {
        set((state) => {
          const updated = [
            { ...item, lastAccessed: Date.now() },
            ...state.recentlyAccessed.filter(recent => recent.id !== item.id)
          ].slice(0, state.maxRecentItems);
          
          return { recentlyAccessed: updated };
        });
      },
      
      updateQuickAccess: () => {
        const { recentlyAccessed, favorites } = get();
        
        const quickAccess: QuickAccess[] = [
          // Add favorites with high priority
          ...favorites.map((fav) => ({
            type: 'activity' as const,
            id: fav.id,
            title: fav.title,
            icon: fav.icon || '📚',
            path: fav.path,
            priority: 10,
            lastUsed: fav.lastAccessed || 0
          })),
          
          // Add frequently accessed items
          ...recentlyAccessed
            .slice(0, 5)
            .map((recent, index) => ({
              type: 'activity' as const,
              id: recent.id,
              title: recent.title,
              icon: recent.icon || '🎯',
              path: recent.path,
              priority: 5 - index,
              lastUsed: recent.lastAccessed || 0
            }))
        ]
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 8);
        
        set({ quickAccess });
      },
      
      // Preferences Actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setNavigationStyle: (style) => set({ navigationStyle: style }),
      setShowBreadcrumbs: (show) => set({ showBreadcrumbs: show }),
      
      // Content Management
      setAvailableActivities: (activities) => {
        const tags = Array.from(new Set(
          activities.flatMap(activity => activity.title.split(' ').concat(activity.category))
        ));
        
        set({ 
          availableActivities: activities,
          availableTags: tags
        });
      },
      
      updateActivityAccess: (activityId) => {
        const activity = get().availableActivities.find(a => a.id === activityId);
        if (activity) {
          get().addRecentlyAccessed({
            id: activity.id,
            title: activity.title,
            path: `/activity/${activity.id}`,
            category: activity.category,
            icon: activity.icon
          });
        }
      },
      
      getRecommendedContent: (child) => {
        const { availableActivities, recentlyAccessed } = get();
        
        // Get age-appropriate activities
        const ageAppropriate = availableActivities.filter(
          activity => activity.minAge <= child.age && activity.maxAge >= child.age
        );
        
        // Filter out recently accessed to suggest new content
        const recentIds = new Set(recentlyAccessed.map(r => r.id));
        const newContent = ageAppropriate.filter(activity => !recentIds.has(activity.id));
        
        // Return top recommendations
        return newContent
          .slice(0, 6)
          .map(activity => ({
            id: activity.id,
            title: activity.title,
            path: `/activity/${activity.id}`,
            category: activity.category,
            icon: activity.icon
          }));
      },
      
      // Analytics
      trackNavigation: (from, to, method) => {
        // Store navigation analytics in localStorage for now
        const analytics = JSON.parse(localStorage.getItem('navigation-analytics') || '{}');
        
        if (!analytics.navigation) {
          analytics.navigation = [];
        }
        
        analytics.navigation.push({
          from,
          to,
          method,
          timestamp: Date.now()
        });
        
        // Keep only last 1000 entries
        if (analytics.navigation.length > 1000) {
          analytics.navigation = analytics.navigation.slice(-1000);
        }
        
        localStorage.setItem('navigation-analytics', JSON.stringify(analytics));
      },
      
      getNavigationAnalytics: () => {
        const analytics = JSON.parse(localStorage.getItem('navigation-analytics') || '{}');
        const navigation = analytics.navigation || [];
        
        // Calculate most visited paths
        const pathCounts: Record<string, number> = {};
        navigation.forEach((nav: any) => {
          pathCounts[nav.to] = (pathCounts[nav.to] || 0) + 1;
        });
        
        const mostVisitedPaths = Object.entries(pathCounts)
          .map(([path, visits]) => ({ path, visits }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 10);
        
        // Get popular searches from recent searches
        const { recentSearches } = get();
        const popularSearches = recentSearches.map(query => ({ query, count: 1 }));
        
        // Calculate average session time (simplified)
        const averageSessionTime = 15; // minutes, placeholder
        
        return {
          mostVisitedPaths,
          popularSearches,
          averageSessionTime
        };
      },
      
      // Personalization Methods
      trackActivityCompletion: (childId, activityId, performance) => {
        personalizationService.updateUserProfile(childId, activityId, performance);
        
        // Update analytics
        const { analytics } = get();
        set((state) => ({
          analytics: {
            ...state.analytics,
            userPreferences: {
              ...state.analytics.userPreferences,
              // Update based on performance data
              favoriteCategories: [...state.analytics.userPreferences.favoriteCategories],
              averageSessionTime: Math.round(
                (state.analytics.userPreferences.averageSessionTime * 0.8) + 
                (performance.timeSpent * 0.2)
              )
            }
          }
        }));
      },
      
      generatePersonalizedRecommendations: async (childId) => {
        const { availableActivities } = get();
        return await personalizationService.generateRecommendations(childId, availableActivities);
      },
      
      updateUserPreferences: (childId, category) => {
        personalizationService.updateFavoriteCategories(childId, category);
        
        // Update store analytics
        set((state) => {
          const currentCategories = state.analytics.userPreferences.favoriteCategories;
          const updatedCategories = currentCategories.includes(category) 
            ? currentCategories 
            : [...currentCategories, category].slice(-5); // Keep last 5
            
          return {
            analytics: {
              ...state.analytics,
              userPreferences: {
                ...state.analytics.userPreferences,
                favoriteCategories: updatedCategories
              }
            }
          };
        });
      }
    }),
    {
      name: 'navigation-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favorites: state.favorites,
        recentlyAccessed: state.recentlyAccessed,
        recentSearches: state.recentSearches,
        sidebarCollapsed: state.sidebarCollapsed,
        navigationStyle: state.navigationStyle,
        showBreadcrumbs: state.showBreadcrumbs,
        searchFilters: state.searchFilters,
        quickAccess: state.quickAccess
      })
    }
  )
);

export default useNavigationStore;