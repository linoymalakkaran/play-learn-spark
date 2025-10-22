import { ActivityContent, IActivityContent } from '../models/ActivityContent.js';
import { LanguageResource, ILanguageResource } from '../models/LanguageResource.js';

// Fallback strategy configuration
interface FallbackStrategy {
  primary: string[];        // Primary fallback languages in order of preference
  emergency: string;        // Emergency fallback language (usually 'en')
  enablePartialFallback: boolean;  // Allow mixing content from different languages
  maxFallbackDepth: number; // Maximum number of fallback attempts
  cacheResults: boolean;    // Cache fallback results for performance
  logFallbacks: boolean;    // Log fallback usage for analytics
}

// Fallback result information
interface FallbackResult {
  content: any;
  originalLanguage: string;
  actualLanguage: string;
  fallbackUsed: boolean;
  fallbackChain: string[];
  missingFields: string[];
  completeness: number;     // Percentage of content available in target language
  quality: 'perfect' | 'good' | 'partial' | 'emergency';
  timestamp: number;
}

// Content field mapping for partial fallbacks
interface ContentFieldMapping {
  [field: string]: {
    priority: number;
    fallbackEnabled: boolean;
    requiredLanguages?: string[];
  };
}

// Fallback analytics
interface FallbackAnalytics {
  totalRequests: number;
  fallbackRequests: number;
  fallbackRate: number;
  languageUsage: Record<string, number>;
  fieldMissingRate: Record<string, number>;
  averageCompleteness: number;
  qualityDistribution: Record<string, number>;
  performanceMetrics: {
    averageResolveTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

// Cache entry structure
interface CacheEntry {
  result: FallbackResult;
  timestamp: number;
  ttl: number;
  accessCount: number;
}

export class ContentFallbackManager {
  private fallbackStrategies: Map<string, FallbackStrategy> = new Map();
  private fieldMappings: Map<string, ContentFieldMapping> = new Map();
  private fallbackCache: Map<string, CacheEntry> = new Map();
  private analytics: FallbackAnalytics = {
    totalRequests: 0,
    fallbackRequests: 0,
    fallbackRate: 0,
    languageUsage: {},
    fieldMissingRate: {},
    averageCompleteness: 0,
    qualityDistribution: {},
    performanceMetrics: {
      averageResolveTime: 0,
      cacheHitRate: 0,
      errorRate: 0
    }
  };

  constructor() {
    this.initializeFallbackManager();
  }

  private async initializeFallbackManager() {
    console.log('Initializing Content Fallback Manager...');
    await this.loadFallbackStrategies();
    await this.loadFieldMappings();
    this.setupCacheCleanup();
    console.log('Content Fallback Manager initialized successfully');
  }

  // Main content resolution method with fallback
  async resolveContentWithFallback(
    contentId: string,
    targetLanguage: string,
    contentType: string = 'activity',
    customStrategy?: Partial<FallbackStrategy>
  ): Promise<FallbackResult> {
    const startTime = performance.now();
    this.analytics.totalRequests++;

    try {
      // Get fallback strategy
      const strategy = this.getFallbackStrategy(contentType, customStrategy);
      
      // Check cache first
      const cacheKey = `${contentId}_${targetLanguage}_${contentType}`;
      if (strategy.cacheResults) {
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          this.analytics.performanceMetrics.cacheHitRate++;
          return cached;
        }
      }

      // Try to resolve content
      const result = await this.resolveContent(
        contentId,
        targetLanguage,
        strategy,
        contentType
      );

      // Update analytics
      this.updateAnalytics(result, performance.now() - startTime);

      // Cache the result
      if (strategy.cacheResults) {
        this.cacheResult(cacheKey, result);
      }

      return result;

    } catch (error) {
      console.error('Content resolution error:', error);
      this.analytics.performanceMetrics.errorRate++;
      
      // Return emergency fallback
      return this.getEmergencyFallback(contentId, targetLanguage, contentType);
    }
  }

  // Resolve content with fallback chain
  private async resolveContent(
    contentId: string,
    targetLanguage: string,
    strategy: FallbackStrategy,
    contentType: string
  ): Promise<FallbackResult> {
    const fallbackChain: string[] = [];
    const missingFields: string[] = [];
    let bestContent: any = null;
    let bestLanguage = targetLanguage;
    let bestCompleteness = 0;

    // Build language priority list
    const languagePriority = [
      targetLanguage,
      ...strategy.primary,
      strategy.emergency
    ].filter((lang, index, arr) => arr.indexOf(lang) === index); // Remove duplicates

    // Try each language in order
    for (const language of languagePriority.slice(0, strategy.maxFallbackDepth)) {
      fallbackChain.push(language);
      
      try {
        const content = await this.fetchContent(contentId, language, contentType);
        
        if (content) {
          const completeness = this.calculateCompleteness(content, contentType);
          
          if (completeness === 100) {
            // Perfect match found
            return {
              content,
              originalLanguage: targetLanguage,
              actualLanguage: language,
              fallbackUsed: language !== targetLanguage,
              fallbackChain,
              missingFields: [],
              completeness,
              quality: 'perfect',
              timestamp: Date.now()
            };
          }
          
          // Track best partial content
          if (completeness > bestCompleteness) {
            bestContent = content;
            bestLanguage = language;
            bestCompleteness = completeness;
          }
        }
        
      } catch (error) {
        console.warn(`Failed to fetch content for language ${language}:`, error);
        continue;
      }
    }

    // If partial fallback is enabled, try to enhance content
    if (strategy.enablePartialFallback && bestContent) {
      const enhancedContent = await this.enhanceWithPartialFallback(
        contentId,
        bestContent,
        targetLanguage,
        strategy,
        contentType
      );
      
      if (enhancedContent.completeness > bestCompleteness) {
        bestContent = enhancedContent.content;
        bestCompleteness = enhancedContent.completeness;
        missingFields.push(...enhancedContent.missingFields);
      }
    }

    // Determine quality
    const quality = this.determineContentQuality(bestCompleteness, fallbackChain.length);

    return {
      content: bestContent,
      originalLanguage: targetLanguage,
      actualLanguage: bestLanguage,
      fallbackUsed: bestLanguage !== targetLanguage,
      fallbackChain,
      missingFields,
      completeness: bestCompleteness,
      quality,
      timestamp: Date.now()
    };
  }

  // Enhance content with partial fallback from multiple languages
  private async enhanceWithPartialFallback(
    contentId: string,
    baseContent: any,
    targetLanguage: string,
    strategy: FallbackStrategy,
    contentType: string
  ): Promise<{ content: any; completeness: number; missingFields: string[] }> {
    const fieldMapping = this.getFieldMapping(contentType);
    const enhancedContent = { ...baseContent };
    const missingFields: string[] = [];

    // Identify missing or incomplete fields
    const incompleteFields = this.identifyIncompleteFields(baseContent, fieldMapping);

    if (incompleteFields.length === 0) {
      return {
        content: enhancedContent,
        completeness: this.calculateCompleteness(enhancedContent, contentType),
        missingFields
      };
    }

    // Try to fill missing fields from fallback languages
    for (const field of incompleteFields) {
      const fieldConfig = fieldMapping[field];
      if (!fieldConfig?.fallbackEnabled) continue;

      let fieldFilled = false;
      
      // Try fallback languages for this specific field
      for (const language of strategy.primary) {
        if (fieldFilled) break;
        
        try {
          const fallbackContent = await this.fetchContent(contentId, language, contentType);
          
          if (fallbackContent && this.hasCompleteField(fallbackContent, field)) {
            enhancedContent[field] = fallbackContent[field];
            fieldFilled = true;
            
            if (strategy.logFallbacks) {
              console.log(`Field '${field}' filled from ${language} fallback`);
            }
          }
        } catch (error) {
          console.warn(`Failed to get fallback for field ${field} from ${language}:`, error);
        }
      }
      
      if (!fieldFilled) {
        missingFields.push(field);
      }
    }

    return {
      content: enhancedContent,
      completeness: this.calculateCompleteness(enhancedContent, contentType),
      missingFields
    };
  }

  // Fetch content from database
  private async fetchContent(
    contentId: string,
    language: string,
    contentType: string
  ): Promise<any | null> {
    try {
      if (contentType === 'activity') {
        const activity = await ActivityContent.findOne({
          activityId: contentId,
          isActive: true
        });
        
        return activity?.getLocalizedContent(language);
      }
      
      if (contentType === 'resource') {
        const resource = await LanguageResource.findOne({
          resourceId: contentId,
          language,
          isActive: true
        });
        
        return resource?.content;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching ${contentType} content:`, error);
      return null;
    }
  }

  // Calculate content completeness percentage
  private calculateCompleteness(content: any, contentType: string): number {
    const fieldMapping = this.getFieldMapping(contentType);
    const fields = Object.keys(fieldMapping);
    
    if (fields.length === 0) return 100;
    
    let completeFields = 0;
    let totalWeight = 0;
    
    for (const field of fields) {
      const weight = fieldMapping[field]?.priority || 1;
      totalWeight += weight;
      
      if (this.hasCompleteField(content, field)) {
        completeFields += weight;
      }
    }
    
    return totalWeight > 0 ? Math.round((completeFields / totalWeight) * 100) : 0;
  }

  // Check if field is complete and meaningful
  private hasCompleteField(content: any, field: string): boolean {
    const value = this.getNestedValue(content, field);
    
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    
    return true;
  }

  // Get nested value from object using dot notation
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Identify incomplete fields
  private identifyIncompleteFields(content: any, fieldMapping: ContentFieldMapping): string[] {
    const incompleteFields: string[] = [];
    
    for (const field of Object.keys(fieldMapping)) {
      if (!this.hasCompleteField(content, field)) {
        incompleteFields.push(field);
      }
    }
    
    return incompleteFields;
  }

  // Determine content quality based on completeness and fallback depth
  private determineContentQuality(
    completeness: number,
    fallbackDepth: number
  ): 'perfect' | 'good' | 'partial' | 'emergency' {
    if (completeness === 100 && fallbackDepth === 1) return 'perfect';
    if (completeness >= 90 && fallbackDepth <= 2) return 'good';
    if (completeness >= 60) return 'partial';
    return 'emergency';
  }

  // Get emergency fallback content
  private async getEmergencyFallback(
    contentId: string,
    targetLanguage: string,
    contentType: string
  ): Promise<FallbackResult> {
    return {
      content: {
        title: `Content Not Available`,
        description: `Content for ${contentId} is not available in ${targetLanguage}.`,
        fallbackMessage: true
      },
      originalLanguage: targetLanguage,
      actualLanguage: 'emergency',
      fallbackUsed: true,
      fallbackChain: ['emergency'],
      missingFields: [],
      completeness: 0,
      quality: 'emergency',
      timestamp: Date.now()
    };
  }

  // Get fallback strategy for content type
  private getFallbackStrategy(
    contentType: string,
    customStrategy?: Partial<FallbackStrategy>
  ): FallbackStrategy {
    const defaultStrategy = this.fallbackStrategies.get(contentType) || this.getDefaultStrategy();
    
    if (customStrategy) {
      return { ...defaultStrategy, ...customStrategy };
    }
    
    return defaultStrategy;
  }

  // Get default fallback strategy
  private getDefaultStrategy(): FallbackStrategy {
    return {
      primary: ['en', 'es', 'fr'],
      emergency: 'en',
      enablePartialFallback: true,
      maxFallbackDepth: 5,
      cacheResults: true,
      logFallbacks: true
    };
  }

  // Get field mapping for content type
  private getFieldMapping(contentType: string): ContentFieldMapping {
    return this.fieldMappings.get(contentType) || this.getDefaultFieldMapping();
  }

  // Get default field mapping
  private getDefaultFieldMapping(): ContentFieldMapping {
    return {
      'title': { priority: 3, fallbackEnabled: true },
      'description': { priority: 2, fallbackEnabled: true },
      'content.text': { priority: 3, fallbackEnabled: true },
      'content.instructions': { priority: 2, fallbackEnabled: true },
      'metadata.keywords': { priority: 1, fallbackEnabled: true },
      'media.images': { priority: 1, fallbackEnabled: false },
      'media.audio': { priority: 1, fallbackEnabled: false }
    };
  }

  // Load fallback strategies from configuration
  private async loadFallbackStrategies(): Promise<void> {
    try {
      // Set default strategies for different content types
      this.fallbackStrategies.set('activity', {
        primary: ['en', 'es', 'fr', 'de'],
        emergency: 'en',
        enablePartialFallback: true,
        maxFallbackDepth: 4,
        cacheResults: true,
        logFallbacks: true
      });

      this.fallbackStrategies.set('resource', {
        primary: ['en', 'es'],
        emergency: 'en',
        enablePartialFallback: false,
        maxFallbackDepth: 3,
        cacheResults: true,
        logFallbacks: false
      });

      this.fallbackStrategies.set('assessment', {
        primary: ['en'],
        emergency: 'en',
        enablePartialFallback: false,
        maxFallbackDepth: 2,
        cacheResults: false,
        logFallbacks: true
      });

      console.log('Fallback strategies loaded successfully');
    } catch (error) {
      console.error('Error loading fallback strategies:', error);
    }
  }

  // Load field mappings from configuration
  private async loadFieldMappings(): Promise<void> {
    try {
      // Activity content field mapping
      this.fieldMappings.set('activity', {
        'title': { priority: 3, fallbackEnabled: true },
        'description': { priority: 3, fallbackEnabled: true },
        'content.text': { priority: 3, fallbackEnabled: true },
        'content.instructions': { priority: 2, fallbackEnabled: true },
        'content.questions': { priority: 2, fallbackEnabled: true },
        'content.answers': { priority: 2, fallbackEnabled: true },
        'metadata.keywords': { priority: 1, fallbackEnabled: true },
        'metadata.tags': { priority: 1, fallbackEnabled: true },
        'media.images': { priority: 1, fallbackEnabled: false },
        'media.audio': { priority: 1, fallbackEnabled: false },
        'media.video': { priority: 1, fallbackEnabled: false }
      });

      // Resource content field mapping
      this.fieldMappings.set('resource', {
        'name': { priority: 3, fallbackEnabled: true },
        'description': { priority: 2, fallbackEnabled: true },
        'content': { priority: 3, fallbackEnabled: true },
        'metadata': { priority: 1, fallbackEnabled: true }
      });

      console.log('Field mappings loaded successfully');
    } catch (error) {
      console.error('Error loading field mappings:', error);
    }
  }

  // Cache management methods
  private getCachedResult(cacheKey: string): FallbackResult | null {
    const entry = this.fallbackCache.get(cacheKey);
    
    if (!entry) return null;
    
    // Check TTL
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.fallbackCache.delete(cacheKey);
      return null;
    }
    
    // Update access count
    entry.accessCount++;
    
    return entry.result;
  }

  private cacheResult(cacheKey: string, result: FallbackResult): void {
    const ttl = 30 * 60 * 1000; // 30 minutes
    
    this.fallbackCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      ttl,
      accessCount: 1
    });
    
    // Limit cache size
    if (this.fallbackCache.size > 1000) {
      this.cleanupCache();
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.fallbackCache.entries());
    
    // Remove expired entries and least used entries
    entries
      .filter(([_, entry]) => now > entry.timestamp + entry.ttl || entry.accessCount < 2)
      .slice(0, 200) // Remove up to 200 entries
      .forEach(([key, _]) => this.fallbackCache.delete(key));
  }

  private setupCacheCleanup(): void {
    // Clean up cache every 10 minutes
    setInterval(() => {
      this.cleanupCache();
    }, 10 * 60 * 1000);
  }

  // Analytics and monitoring methods
  private updateAnalytics(result: FallbackResult, resolveTime: number): void {
    if (result.fallbackUsed) {
      this.analytics.fallbackRequests++;
    }

    this.analytics.fallbackRate = (this.analytics.fallbackRequests / this.analytics.totalRequests) * 100;

    // Update language usage
    this.analytics.languageUsage[result.actualLanguage] = 
      (this.analytics.languageUsage[result.actualLanguage] || 0) + 1;

    // Update field missing rate
    result.missingFields.forEach(field => {
      this.analytics.fieldMissingRate[field] = 
        (this.analytics.fieldMissingRate[field] || 0) + 1;
    });

    // Update completeness average
    this.analytics.averageCompleteness = 
      (this.analytics.averageCompleteness * (this.analytics.totalRequests - 1) + result.completeness) / 
      this.analytics.totalRequests;

    // Update quality distribution
    this.analytics.qualityDistribution[result.quality] = 
      (this.analytics.qualityDistribution[result.quality] || 0) + 1;

    // Update performance metrics
    this.analytics.performanceMetrics.averageResolveTime = 
      (this.analytics.performanceMetrics.averageResolveTime * (this.analytics.totalRequests - 1) + resolveTime) / 
      this.analytics.totalRequests;
  }

  // Public API methods
  public async configureFallbackStrategy(
    contentType: string,
    strategy: FallbackStrategy
  ): Promise<void> {
    this.fallbackStrategies.set(contentType, strategy);
    console.log(`Fallback strategy updated for content type: ${contentType}`);
  }

  public async configureFieldMapping(
    contentType: string,
    mapping: ContentFieldMapping
  ): Promise<void> {
    this.fieldMappings.set(contentType, mapping);
    console.log(`Field mapping updated for content type: ${contentType}`);
  }

  public getAnalytics(): FallbackAnalytics {
    return { ...this.analytics };
  }

  public getCacheStats(): { size: number; hitRate: number; totalHits: number } {
    const totalHits = Array.from(this.fallbackCache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);

    return {
      size: this.fallbackCache.size,
      hitRate: this.analytics.performanceMetrics.cacheHitRate,
      totalHits
    };
  }

  public clearCache(): void {
    this.fallbackCache.clear();
    console.log('Fallback cache cleared');
  }

  public async validateFallbackChain(
    contentId: string,
    targetLanguage: string,
    contentType: string = 'activity'
  ): Promise<{
    valid: boolean;
    availableLanguages: string[];
    missingLanguages: string[];
    completenessMap: Record<string, number>;
  }> {
    const strategy = this.getFallbackStrategy(contentType);
    const languages = [targetLanguage, ...strategy.primary, strategy.emergency];
    
    const results = {
      valid: false,
      availableLanguages: [] as string[],
      missingLanguages: [] as string[],
      completenessMap: {} as Record<string, number>
    };

    for (const language of languages) {
      try {
        const content = await this.fetchContent(contentId, language, contentType);
        
        if (content) {
          const completeness = this.calculateCompleteness(content, contentType);
          results.availableLanguages.push(language);
          results.completenessMap[language] = completeness;
          
          if (completeness > 0) {
            results.valid = true;
          }
        } else {
          results.missingLanguages.push(language);
        }
      } catch (error) {
        results.missingLanguages.push(language);
      }
    }

    return results;
  }
}