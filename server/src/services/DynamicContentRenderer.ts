import { ActivityContent, IActivityContent } from '../models/ActivityContent.js';
import { LanguageResource, ILanguageResource } from '../models/LanguageResource.js';
import React from 'react';

// Language context for the application
interface LanguageContext {
  currentLanguage: string;
  availableLanguages: string[];
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  fallbackLanguage: string;
  config: {
    typography: any;
    cultural: any;
    formatting: any;
  };
}

// Content rendering options
interface RenderingOptions {
  enableFallback: boolean;
  cacheContent: boolean;
  lazyLoad: boolean;
  optimizeImages: boolean;
  prefetchNext: boolean;
  accessibility: {
    enableScreenReader: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'xl';
  };
}

// Rendered content structure
interface RenderedContent {
  content: {
    text?: string;
    html?: string;
    markdown?: string;
    variations?: any[];
  };
  media: {
    images: Array<{
      url: string;
      alt: string;
      caption?: string;
      optimized?: boolean;
    }>;
    audio: Array<{
      url: string;
      transcript?: string;
      autoplay?: boolean;
    }>;
    video: Array<{
      url: string;
      subtitles?: Array<{
        language: string;
        url: string;
      }>;
    }>;
  };
  metadata: {
    language: string;
    direction: 'ltr' | 'rtl';
    loadTime: number;
    fallbackUsed: boolean;
    cacheHit: boolean;
  };
  styling: {
    fontFamily: string[];
    fontSize: string;
    lineHeight: string;
    textAlign: 'left' | 'right' | 'center';
    direction: 'ltr' | 'rtl';
  };
}

// Performance metrics
interface PerformanceMetrics {
  renderTime: number;
  cacheHitRate: number;
  fallbackUsage: number;
  imageOptimization: number;
  totalRequests: number;
  averageLoadTime: number;
}

// Dynamic content rendering service
export class DynamicContentRenderer {
  private contentCache: Map<string, RenderedContent> = new Map();
  private languageConfigs: Map<string, any> = new Map();
  private performanceMetrics: PerformanceMetrics = {
    renderTime: 0,
    cacheHitRate: 0,
    fallbackUsage: 0,
    imageOptimization: 0,
    totalRequests: 0,
    averageLoadTime: 0
  };
  
  constructor() {
    this.initializeRenderer();
  }
  
  private async initializeRenderer() {
    console.log('Initializing Dynamic Content Renderer...');
    await this.loadLanguageConfigurations();
    this.setupPerformanceMonitoring();
    console.log('Dynamic Content Renderer initialized successfully');
  }
  
  // Main content rendering method
  async renderContent(
    activityId: string,
    language: string,
    context: LanguageContext,
    options: RenderingOptions = this.getDefaultOptions()
  ): Promise<RenderedContent> {
    const startTime = performance.now();
    const cacheKey = `${activityId}_${language}_${JSON.stringify(options)}`;
    
    try {
      // Check cache first
      if (options.cacheContent && this.contentCache.has(cacheKey)) {
        const cachedContent = this.contentCache.get(cacheKey)!;
        this.updateMetrics('cache_hit', performance.now() - startTime);
        return {
          ...cachedContent,
          metadata: {
            ...cachedContent.metadata,
            cacheHit: true,
            loadTime: performance.now() - startTime
          }
        };
      }
      
      // Fetch activity content
      const activityContent = await ActivityContent.findOne({ 
        activityId, 
        isActive: true 
      });
      
      if (!activityContent) {
        throw new Error(`Activity not found: ${activityId}`);
      }
      
      // Get localized content or fallback
      let localizedContent = activityContent.getLocalizedContent(language);
      let fallbackUsed = false;
      
      if (!localizedContent && options.enableFallback) {
        localizedContent = activityContent.getLocalizedContent(context.fallbackLanguage);
        fallbackUsed = true;
        
        if (!localizedContent) {
          localizedContent = activityContent.sourceContent;
          fallbackUsed = true;
        }
      }
      
      if (!localizedContent) {
        throw new Error(`No content available for language: ${language}`);
      }
      
      // Get language configuration
      const languageConfig = await this.getLanguageConfiguration(language);
      
      // Process content
      const processedContent = await this.processContent(
        localizedContent,
        languageConfig,
        context,
        options
      );
      
      // Optimize media
      const optimizedMedia = await this.optimizeMedia(
        localizedContent.media,
        language,
        options
      );
      
      // Generate styling
      const styling = this.generateStyling(languageConfig, context, options);
      
      // Create rendered content
      const renderedContent: RenderedContent = {
        content: processedContent,
        media: optimizedMedia,
        metadata: {
          language,
          direction: languageConfig?.configuration?.typography?.textDirection || 'ltr',
          loadTime: performance.now() - startTime,
          fallbackUsed,
          cacheHit: false
        },
        styling
      };
      
      // Cache the content
      if (options.cacheContent) {
        this.contentCache.set(cacheKey, renderedContent);
        
        // Limit cache size
        if (this.contentCache.size > 1000) {
          const firstKey = this.contentCache.keys().next().value;
          this.contentCache.delete(firstKey);
        }
      }
      
      // Update performance metrics
      this.updateMetrics('render', performance.now() - startTime, fallbackUsed);
      
      return renderedContent;
      
    } catch (error) {
      console.error('Content rendering error:', error);
      this.updateMetrics('error', performance.now() - startTime);
      throw error;
    }
  }
  
  // Batch render multiple contents
  async batchRenderContent(
    requests: Array<{
      activityId: string;
      language: string;
      context: LanguageContext;
      options?: RenderingOptions;
    }>
  ): Promise<Array<{
    activityId: string;
    language: string;
    content?: RenderedContent;
    error?: string;
  }>> {
    const results = [];
    
    // Process in parallel with concurrency limit
    const BATCH_SIZE = 5;
    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const batch = requests.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (request) => {
        try {
          const content = await this.renderContent(
            request.activityId,
            request.language,
            request.context,
            request.options
          );
          
          return {
            activityId: request.activityId,
            language: request.language,
            content
          };
        } catch (error) {
          return {
            activityId: request.activityId,
            language: request.language,
            error: error.message
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
  
  // Switch language for existing content
  async switchLanguage(
    currentContent: RenderedContent,
    newLanguage: string,
    context: LanguageContext,
    options: RenderingOptions = this.getDefaultOptions()
  ): Promise<RenderedContent> {
    // Extract activity ID from metadata (this would need to be included in metadata)
    const activityId = 'extracted_from_metadata'; // Placeholder
    
    return this.renderContent(activityId, newLanguage, context, options);
  }
  
  // Prefetch content for better performance
  async prefetchContent(
    activityIds: string[],
    languages: string[],
    context: LanguageContext,
    options: RenderingOptions = this.getDefaultOptions()
  ): Promise<void> {
    const prefetchPromises = [];
    
    for (const activityId of activityIds) {
      for (const language of languages) {
        const prefetchOptions = { ...options, cacheContent: true };
        
        prefetchPromises.push(
          this.renderContent(activityId, language, context, prefetchOptions)
            .catch(error => {
              console.warn(`Prefetch failed for ${activityId}:${language}`, error);
            })
        );
      }
    }
    
    // Limit concurrent prefetch requests
    const PREFETCH_BATCH_SIZE = 3;
    for (let i = 0; i < prefetchPromises.length; i += PREFETCH_BATCH_SIZE) {
      const batch = prefetchPromises.slice(i, i + PREFETCH_BATCH_SIZE);
      await Promise.all(batch);
      
      // Small delay between batches to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Generate language-specific styling
  private generateStyling(
    languageConfig: any,
    context: LanguageContext,
    options: RenderingOptions
  ): RenderedContent['styling'] {
    const config = languageConfig?.configuration;
    const typography = config?.typography || {};
    const accessibility = options.accessibility;
    
    // Base font size calculation
    let baseFontSize = 16; // Default 16px
    if (accessibility.fontSize === 'small') baseFontSize = 14;
    else if (accessibility.fontSize === 'large') baseFontSize = 18;
    else if (accessibility.fontSize === 'xl') baseFontSize = 22;
    
    // Scale font size for language if needed
    const languageScale = typography.fontSize?.scale || 1;
    const finalFontSize = Math.round(baseFontSize * languageScale);
    
    return {
      fontFamily: typography.fontFamily || ['Arial', 'sans-serif'],
      fontSize: `${finalFontSize}px`,
      lineHeight: typography.lineHeight?.toString() || '1.5',
      textAlign: context.isRTL ? 'right' : 'left',
      direction: context.direction
    };
  }
  
  // Process content based on language and context
  private async processContent(
    localizedContent: any,
    languageConfig: any,
    context: LanguageContext,
    options: RenderingOptions
  ): Promise<RenderedContent['content']> {
    let processedContent = { ...localizedContent.content };
    
    // Apply content variations based on context
    if (localizedContent.content.variations?.length > 0) {
      const appropriateVariation = this.selectContentVariation(
        localizedContent.content.variations,
        context
      );
      
      if (appropriateVariation) {
        processedContent.text = appropriateVariation.text;
      }
    }
    
    // Apply text processing rules
    if (processedContent.text) {
      processedContent.text = await this.applyTextProcessingRules(
        processedContent.text,
        languageConfig,
        context
      );
    }
    
    // Process HTML content for RTL support
    if (processedContent.html) {
      processedContent.html = this.processHTMLForLanguage(
        processedContent.html,
        context
      );
    }
    
    // Add accessibility enhancements
    if (options.accessibility.enableScreenReader) {
      processedContent = this.addAccessibilityAttributes(
        processedContent,
        context.currentLanguage
      );
    }
    
    return processedContent;
  }
  
  // Optimize media for language and context
  private async optimizeMedia(
    media: any,
    language: string,
    options: RenderingOptions
  ): Promise<RenderedContent['media']> {
    const optimizedMedia: RenderedContent['media'] = {
      images: [],
      audio: [],
      video: []
    };
    
    // Process images
    if (media.images?.length > 0) {
      for (const image of media.images) {
        let optimizedImage = { ...image };
        
        if (options.optimizeImages) {
          optimizedImage = await this.optimizeImage(image, language);
        }
        
        optimizedMedia.images.push(optimizedImage);
      }
    }
    
    // Process audio
    if (media.audio?.length > 0) {
      for (const audio of media.audio) {
        const processedAudio = {
          ...audio,
          autoplay: false // Default to no autoplay for accessibility
        };
        
        optimizedMedia.audio.push(processedAudio);
      }
    }
    
    // Process video
    if (media.video?.length > 0) {
      for (const video of media.video) {
        const processedVideo = {
          ...video,
          subtitles: video.subtitles?.filter(
            (subtitle: any) => subtitle.language === language
          ) || []
        };
        
        optimizedMedia.video.push(processedVideo);
      }
    }
    
    return optimizedMedia;
  }
  
  // Select appropriate content variation
  private selectContentVariation(variations: any[], context: LanguageContext): any | null {
    // Priority: exact match > partial match > default
    const exactMatch = variations.find(v => 
      v.context === 'educational' && 
      v.ageGroup === 'elementary' // This would come from context
    );
    
    if (exactMatch) return exactMatch;
    
    // Fallback to first variation
    return variations[0] || null;
  }
  
  // Apply text processing rules
  private async applyTextProcessingRules(
    text: string,
    languageConfig: any,
    context: LanguageContext
  ): Promise<string> {
    let processedText = text;
    
    // Apply language-specific text processing
    if (languageConfig?.translationRules?.length > 0) {
      for (const rule of languageConfig.translationRules) {
        if (rule.enabled && rule.targetPattern) {
          try {
            const regex = new RegExp(rule.sourcePattern, 'gi');
            processedText = processedText.replace(regex, rule.targetPattern);
          } catch (error) {
            console.warn(`Error applying text rule ${rule.ruleId}:`, error);
          }
        }
      }
    }
    
    // Apply RTL text adjustments
    if (context.isRTL) {
      processedText = this.adjustTextForRTL(processedText);
    }
    
    return processedText;
  }
  
  // Process HTML content for language-specific needs
  private processHTMLForLanguage(html: string, context: LanguageContext): string {
    let processedHTML = html;
    
    // Add language and direction attributes
    if (!processedHTML.includes('lang=')) {
      processedHTML = processedHTML.replace(
        /<(\w+)/g,
        `<$1 lang="${context.currentLanguage}"`
      );
    }
    
    if (context.isRTL && !processedHTML.includes('dir=')) {
      processedHTML = processedHTML.replace(
        /<(\w+)/g,
        `<$1 dir="${context.direction}"`
      );
    }
    
    return processedHTML;
  }
  
  // Add accessibility attributes
  private addAccessibilityAttributes(content: any, language: string): any {
    const accessibleContent = { ...content };
    
    if (accessibleContent.text) {
      // Add language markers for screen readers
      accessibleContent.text = `<span lang="${language}">${accessibleContent.text}</span>`;
    }
    
    return accessibleContent;
  }
  
  // Optimize image for language/region
  private async optimizeImage(image: any, language: string): Promise<any> {
    // This would typically involve:
    // 1. Checking if culturally appropriate for the language/region
    // 2. Optimizing file size and format
    // 3. Adding appropriate alt text in the target language
    
    return {
      ...image,
      optimized: true,
      // In a real implementation, this would generate optimized URLs
      url: image.url + '?optimized=true&lang=' + language
    };
  }
  
  // Adjust text for RTL languages
  private adjustTextForRTL(text: string): string {
    // Handle mixed LTR/RTL content
    // Add appropriate Unicode direction markers
    // This is a simplified implementation
    
    return text;
  }
  
  // Load language configurations
  private async loadLanguageConfigurations(): Promise<void> {
    try {
      const languageResources = await LanguageResource.find({
        resourceType: 'configuration',
        isActive: true
      });
      
      languageResources.forEach(resource => {
        this.languageConfigs.set(resource.language, resource);
      });
      
      console.log(`Loaded configurations for ${languageResources.length} languages`);
    } catch (error) {
      console.error('Error loading language configurations:', error);
    }
  }
  
  // Get language configuration
  private async getLanguageConfiguration(language: string): Promise<any> {
    if (this.languageConfigs.has(language)) {
      return this.languageConfigs.get(language);
    }
    
    // Try to load from database
    try {
      const config = await LanguageResource.getLanguageConfiguration(language);
      if (config) {
        this.languageConfigs.set(language, config);
        return config;
      }
    } catch (error) {
      console.warn(`Could not load configuration for language: ${language}`);
    }
    
    // Return default configuration
    return this.getDefaultLanguageConfiguration(language);
  }
  
  // Get default rendering options
  private getDefaultOptions(): RenderingOptions {
    return {
      enableFallback: true,
      cacheContent: true,
      lazyLoad: false,
      optimizeImages: true,
      prefetchNext: false,
      accessibility: {
        enableScreenReader: false,
        highContrast: false,
        fontSize: 'medium'
      }
    };
  }
  
  // Get default language configuration
  private getDefaultLanguageConfiguration(language: string): any {
    const isRTL = ['ar', 'he', 'fa', 'ur'].includes(language);
    
    return {
      language,
      configuration: {
        code: language,
        isRTL,
        typography: {
          fontFamily: ['Arial', 'sans-serif'],
          textDirection: isRTL ? 'rtl' : 'ltr',
          fontSize: { base: 16, scale: 1 },
          lineHeight: 1.5
        },
        cultural: {
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          firstDayOfWeek: 1
        }
      }
    };
  }
  
  // Setup performance monitoring
  private setupPerformanceMonitoring(): void {
    // Reset metrics periodically
    setInterval(() => {
      console.log('Content Renderer Performance:', this.performanceMetrics);
      
      // Reset metrics for next period
      this.performanceMetrics = {
        renderTime: 0,
        cacheHitRate: 0,
        fallbackUsage: 0,
        imageOptimization: 0,
        totalRequests: 0,
        averageLoadTime: 0
      };
    }, 60000); // Every minute
  }
  
  // Update performance metrics
  private updateMetrics(type: string, duration: number, fallbackUsed?: boolean): void {
    this.performanceMetrics.totalRequests++;
    this.performanceMetrics.averageLoadTime = 
      (this.performanceMetrics.averageLoadTime * (this.performanceMetrics.totalRequests - 1) + duration) / 
      this.performanceMetrics.totalRequests;
    
    switch (type) {
      case 'cache_hit':
        this.performanceMetrics.cacheHitRate++;
        break;
      case 'render':
        this.performanceMetrics.renderTime += duration;
        if (fallbackUsed) {
          this.performanceMetrics.fallbackUsage++;
        }
        break;
    }
  }
  
  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    const totalRequests = this.performanceMetrics.totalRequests || 1;
    
    return {
      ...this.performanceMetrics,
      cacheHitRate: (this.performanceMetrics.cacheHitRate / totalRequests) * 100,
      fallbackUsage: (this.performanceMetrics.fallbackUsage / totalRequests) * 100,
      imageOptimization: (this.performanceMetrics.imageOptimization / totalRequests) * 100
    };
  }
  
  // Clear cache
  clearCache(): void {
    this.contentCache.clear();
    console.log('Content cache cleared');
  }
  
  // Get cache stats
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.contentCache.size,
      maxSize: 1000,
      hitRate: this.getPerformanceMetrics().cacheHitRate
    };
  }
}