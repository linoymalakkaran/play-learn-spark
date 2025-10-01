import { Activity, Child } from '@/types/learning';
import { SearchResult, NavigationItem } from '@/stores/navigationStore';

interface SearchFilters {
  categories: string[];
  ageRange: [number, number];
  difficulty: number[];
  duration: [number, number];
  tags: string[];
  status?: string;
  language?: string;
}

interface SearchOptions {
  fuzzyThreshold?: number;
  maxResults?: number;
  boostRecent?: boolean;
  boostFavorites?: boolean;
  includeActivities?: boolean;
  includeFeatures?: boolean;
  includeContent?: boolean;
}

class SmartSearchService {
  private static instance: SmartSearchService;
  private searchIndex: Map<string, any> = new Map();
  private searchHistory: string[] = [];
  private contentCache: Map<string, any> = new Map();

  static getInstance(): SmartSearchService {
    if (!SmartSearchService.instance) {
      SmartSearchService.instance = new SmartSearchService();
    }
    return SmartSearchService.instance;
  }

  // Initialize search index with activities and content
  async initializeIndex(activities: Activity[], features: any[] = [], content: any[] = []) {
    this.searchIndex.clear();

    // Index activities
    activities.forEach(activity => {
      const searchableText = [
        activity.title,
        activity.description,
        activity.category,
        activity.subcategory
      ].filter(Boolean).join(' ').toLowerCase();

      this.searchIndex.set(activity.id, {
        id: activity.id,
        type: 'activity',
        title: activity.title,
        description: activity.description,
        category: activity.category,
        subcategory: activity.subcategory,
        path: `/activity/${activity.id}`,
        icon: activity.icon,
        searchableText,
        activity,
        relevanceBoost: 1.0
      });
    });

    // Index features (navigation items, tools, etc.)
    const defaultFeatures = [
      {
        id: 'personalization',
        title: 'Personalization Center',
        description: 'Customize your learning experience',
        category: 'feature',
        path: '/personalization',
        icon: '🎨'
      },
      {
        id: 'content-manager',
        title: 'Content Manager',
        description: 'Manage learning content and activities',
        category: 'feature',
        path: '/content',
        icon: '⚙️'
      },
      {
        id: 'ai-tools',
        title: 'AI Learning Tools',
        description: 'AI-powered learning assistance',
        category: 'feature',
        path: '/ai',
        icon: '🤖'
      },
      {
        id: 'progress-tracker',
        title: 'Progress Tracker',
        description: 'Track your learning progress',
        category: 'feature',
        path: '/progress',
        icon: '📊'
      },
      {
        id: 'favorites',
        title: 'Favorites',
        description: 'Your favorite activities and content',
        category: 'feature',
        path: '/favorites',
        icon: '❤️'
      }
    ];

    [...defaultFeatures, ...features].forEach(feature => {
      const searchableText = [
        feature.title,
        feature.description,
        feature.category,
        ...(feature.tags || [])
      ].filter(Boolean).join(' ').toLowerCase();

      this.searchIndex.set(feature.id, {
        id: feature.id,
        type: 'feature',
        title: feature.title,
        description: feature.description,
        category: feature.category,
        path: feature.path,
        icon: feature.icon,
        searchableText,
        feature,
        relevanceBoost: 0.8
      });
    });

    // Index additional content
    content.forEach(item => {
      const searchableText = [
        item.title,
        item.description,
        item.content,
        ...(item.tags || [])
      ].filter(Boolean).join(' ').toLowerCase();

      this.searchIndex.set(item.id, {
        id: item.id,
        type: 'content',
        title: item.title,
        description: item.description,
        category: item.category || 'content',
        path: item.path || `/content/${item.id}`,
        icon: item.icon || '📄',
        searchableText,
        content: item,
        relevanceBoost: 0.6
      });
    });
  }

  // Perform smart search with fuzzy matching and ranking
  async search(
    query: string, 
    filters: Partial<SearchFilters> = {},
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      fuzzyThreshold = 0.3,
      maxResults = 50,
      boostRecent = true,
      boostFavorites = true,
      includeActivities = true,
      includeFeatures = true,
      includeContent = true
    } = options;

    if (!query.trim()) {
      return this.getDefaultResults(filters, options);
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
    const results: SearchResult[] = [];

    // Search through index
    for (const [id, item] of this.searchIndex) {
      // Type filtering
      if (!includeActivities && item.type === 'activity') continue;
      if (!includeFeatures && item.type === 'feature') continue;
      if (!includeContent && item.type === 'content') continue;

      // Apply filters
      if (!this.passesFilters(item, filters)) continue;

      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(item, searchTerms, {
        boostRecent,
        boostFavorites
      });

      if (relevanceScore > fuzzyThreshold) {
        results.push({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          subcategory: item.subcategory,
          path: item.path,
          icon: item.icon,
          relevanceScore,
          tags: item.tags
        });
      }
    }

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  // Get search suggestions based on partial query
  async getSuggestions(partialQuery: string, limit: number = 5): Promise<string[]> {
    const query = partialQuery.toLowerCase().trim();
    if (query.length < 2) return [];

    const suggestions = new Set<string>();

    // Get suggestions from search index
    for (const [id, item] of this.searchIndex) {
      // Title matches
      if (item.title.toLowerCase().includes(query)) {
        suggestions.add(item.title);
      }

      // Category matches
      if (item.category.toLowerCase().includes(query)) {
        suggestions.add(item.category);
      }

      // Tag matches
      if (item.tags) {
        item.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(query)) {
            suggestions.add(tag);
          }
        });
      }

      if (suggestions.size >= limit * 2) break;
    }

    // Add from search history
    this.searchHistory.forEach(historyItem => {
      if (historyItem.toLowerCase().includes(query)) {
        suggestions.add(historyItem);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // Get trending/popular searches
  getTrendingSearches(): string[] {
    const trending = [
      'counting games',
      'alphabet learning',
      'color matching',
      'animal sounds',
      'math practice',
      'story time',
      'puzzle games',
      'creative drawing',
      'memory games',
      'music activities'
    ];

    return trending;
  }

  // Get recommended searches based on child profile
  getRecommendedSearches(child: Child): string[] {
    const recommendations = [];
    const age = child.age;

    // Age-based recommendations
    if (age <= 4) {
      recommendations.push('colors', 'shapes', 'animals', 'counting');
    } else if (age <= 6) {
      recommendations.push('phonics', 'addition', 'reading', 'science');
    } else {
      recommendations.push('multiplication', 'writing', 'geography', 'history');
    }

    // Interest-based recommendations (if available)
    const childAny = child as any;
    if (childAny.interests && Array.isArray(childAny.interests)) {
      recommendations.push(...childAny.interests);
    }

    // Recent activity-based recommendations (if available)
    if (childAny.progress?.recentCategories && Array.isArray(childAny.progress.recentCategories)) {
      recommendations.push(...childAny.progress.recentCategories);
    }

    return [...new Set(recommendations)].slice(0, 8);
  }

  // Add to search history
  addToHistory(query: string) {
    if (query.trim() && !this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query);
      this.searchHistory = this.searchHistory.slice(0, 20); // Keep last 20 searches
    }
  }

  // Get search history
  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  // Clear search history
  clearSearchHistory() {
    this.searchHistory = [];
  }

  // Private helper methods
  private passesFilters(item: any, filters: Partial<SearchFilters>): boolean {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(item.category)) {
        return false;
      }
    }

    // Age range filter (for activities)
    if (filters.ageRange && item.activity) {
      const [minAge, maxAge] = filters.ageRange;
      if (item.activity.minAge > maxAge || item.activity.maxAge < minAge) {
        return false;
      }
    }

    // Difficulty filter (for activities)
    if (filters.difficulty && filters.difficulty.length > 0 && item.activity) {
      if (!filters.difficulty.includes(item.activity.difficulty)) {
        return false;
      }
    }

    // Duration filter (for activities)
    if (filters.duration && item.activity) {
      const [minDuration, maxDuration] = filters.duration;
      if (item.activity.estimatedDuration < minDuration || 
          item.activity.estimatedDuration > maxDuration) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0 && item.tags) {
      const hasMatchingTag = filters.tags.some(tag => 
        item.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    return true;
  }

  private calculateRelevanceScore(
    item: any, 
    searchTerms: string[], 
    options: { boostRecent?: boolean; boostFavorites?: boolean }
  ): number {
    let score = 0;

    // Base relevance from text matching
    searchTerms.forEach(term => {
      // Exact title match (highest weight)
      if (item.title.toLowerCase().includes(term)) {
        score += 10;
      }

      // Exact category match
      if (item.category.toLowerCase().includes(term)) {
        score += 5;
      }

      // Description match
      if (item.description.toLowerCase().includes(term)) {
        score += 3;
      }

      // Full searchable text match
      if (item.searchableText.includes(term)) {
        score += 1;
      }

      // Fuzzy matching for typos
      const fuzzyMatch = this.calculateFuzzyMatch(term, item.searchableText);
      score += fuzzyMatch * 2;
    });

    // Apply base relevance boost
    score *= item.relevanceBoost;

    // Boost for recent items (if enabled)
    if (options.boostRecent && item.activity?.lastAccessed) {
      const daysSinceAccess = (Date.now() - item.activity.lastAccessed) / (1000 * 60 * 60 * 24);
      if (daysSinceAccess < 7) {
        score *= 1.5;
      }
    }

    // Boost for favorites (if enabled)
    if (options.boostFavorites && item.activity?.isFavorite) {
      score *= 1.3;
    }

    // Normalize score to 0-1 range
    return Math.min(score / 20, 1);
  }

  private calculateFuzzyMatch(term: string, text: string): number {
    // Simple fuzzy matching implementation
    const termLength = term.length;
    const textLength = text.length;
    
    if (termLength === 0) return 0;
    if (termLength > textLength) return 0;

    let matches = 0;
    let termIndex = 0;
    
    for (let i = 0; i < textLength && termIndex < termLength; i++) {
      if (text[i] === term[termIndex]) {
        matches++;
        termIndex++;
      }
    }

    return matches / termLength;
  }

  private getDefaultResults(
    filters: Partial<SearchFilters>, 
    options: SearchOptions
  ): SearchResult[] {
    // Return popular/recommended items when no search query
    const results: SearchResult[] = [];
    const popular = ['animal-safari', 'number-garden', 'color-rainbow', 'shape-detective'];
    
    for (const id of popular) {
      const item = this.searchIndex.get(id);
      if (item && this.passesFilters(item, filters)) {
        results.push({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          subcategory: item.subcategory,
          path: item.path,
          icon: item.icon,
          relevanceScore: 1.0,
          tags: item.tags
        });
      }
    }

    return results.slice(0, options.maxResults || 20);
  }
}

export default SmartSearchService;