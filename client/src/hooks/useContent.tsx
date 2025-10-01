import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Child } from '@/types/learning';

export interface ContentItem {
  id: string;
  type: 'activity' | 'lesson' | 'story' | 'quiz' | 'game';
  title: string;
  description: string;
  content: any;
  metadata: ContentMetadata;
  translations: Record<string, ContentTranslation>;
  adaptations: DifficultyAdaptation[];
  tags: string[];
  categories: string[];
  targetAge: number[];
  estimatedDuration: number;
  prerequisites: string[];
  learningObjectives: string[];
  culturalContext?: string;
  createdAt: number;
  updatedAt: number;
  version: string;
  status: 'draft' | 'review' | 'published' | 'archived';
}

export interface ContentMetadata {
  difficulty: 1 | 2 | 3 | 4 | 5;
  subject: string;
  skills: string[];
  concepts: string[];
  bloomsTaxonomy: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  multipleIntelligences: string[];
  accessibilityFeatures: string[];
  interactionTypes: string[];
  mediaTypes: string[];
  language: string;
  region?: string;
}

export interface ContentTranslation {
  language: string;
  title: string;
  description: string;
  content: any;
  culturalAdaptations?: string[];
  localizedAssets?: Record<string, string>;
  translatedBy?: string;
  reviewedBy?: string;
  status: 'pending' | 'translated' | 'reviewed' | 'approved';
}

export interface DifficultyAdaptation {
  level: 1 | 2 | 3 | 4 | 5;
  modifications: {
    content?: any;
    instructions?: string;
    hints?: string[];
    timeLimit?: number;
    attempts?: number;
    scaffolding?: any[];
    simplifications?: string[];
    extensions?: string[];
  };
}

export interface ContentFilter {
  type?: string[];
  subject?: string[];
  difficulty?: number[];
  age?: number[];
  duration?: { min: number; max: number };
  language?: string;
  tags?: string[];
  status?: string[];
}

export interface ContentRecommendation {
  contentId: string;
  score: number;
  reasons: string[];
  type: 'skill-based' | 'interest-based' | 'sequential' | 'review' | 'challenge' | 'cultural';
  adaptedDifficulty?: number;
  estimatedSuccess: number;
}

interface ContentContextType {
  // Content Management
  content: Record<string, ContentItem>;
  loadContent: (filter?: ContentFilter) => Promise<ContentItem[]>;
  getContent: (id: string, language?: string, difficulty?: number) => ContentItem | null;
  createContent: (content: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateContent: (id: string, updates: Partial<ContentItem>) => Promise<boolean>;
  deleteContent: (id: string) => Promise<boolean>;
  
  // Recommendations
  getRecommendations: (child: Child, limit?: number) => Promise<ContentRecommendation[]>;
  getPersonalizedContent: (child: Child, type?: string) => Promise<ContentItem[]>;
  
  // Adaptive Difficulty
  adaptContentDifficulty: (contentId: string, targetDifficulty: number) => ContentItem | null;
  getOptimalDifficulty: (child: Child, contentId: string) => number;
  
  // Language & Localization
  getAvailableLanguages: () => string[];
  translateContent: (id: string, targetLanguage: string) => Promise<boolean>;
  
  // Content Analytics
  trackContentUsage: (contentId: string, childId: string, metrics: ContentUsageMetrics) => void;
  getContentAnalytics: (contentId: string) => ContentAnalytics;
  
  // Content Creation
  isCreatorMode: boolean;
  toggleCreatorMode: () => void;
  validateContent: (content: Partial<ContentItem>) => ValidationResult;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastSync: number;
}

export interface ContentUsageMetrics {
  startTime: number;
  endTime: number;
  completed: boolean;
  score?: number;
  attempts: number;
  hintsUsed: number;
  timeSpent: number;
  difficultyUsed: number;
  interactions: number;
  errors: number;
}

export interface ContentAnalytics {
  totalViews: number;
  completionRate: number;
  averageScore: number;
  averageTime: number;
  difficultyDistribution: Record<number, number>;
  ageGroupUsage: Record<string, number>;
  popularityTrend: number[];
  userFeedback: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

interface ContentProviderProps {
  children: React.ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [content, setContent] = useState<Record<string, ContentItem>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState(0);
  const [isCreatorMode, setIsCreatorMode] = useState(false);

  // Load content from API/storage
  const loadContent = useCallback(async (filter?: ContentFilter): Promise<ContentItem[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if backend is available before making API call
      let contentItems: ContentItem[] = [];
      
      // First try to check backend availability
      try {
        const healthCheck = await fetch('/api/health', { method: 'GET' });
        if (healthCheck.ok) {
          // Backend is available, try to load content
          const response = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filter })
          });
          
          if (response.ok) {
            contentItems = await response.json();
          } else {
            throw new Error('Failed to load content from API');
          }
        } else {
          throw new Error('Backend not available');
        }
      } catch (apiError) {
        // Backend not available or API failed, use fallback
        console.log('📱 Using local content - backend not available');
        throw apiError;
      }
      
      // Update local state if we got content from API
      const contentMap = contentItems.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as Record<string, ContentItem>);
      
      setContent(prev => ({ ...prev, ...contentMap }));
      setLastSync(Date.now());
      
      return contentItems;
    } catch (err) {
      // Fallback to localStorage/default content
      const savedContent = localStorage.getItem('play-learn-spark-content');
      if (savedContent) {
        const contentItems = JSON.parse(savedContent);
        setContent(contentItems);
        return Object.values(contentItems);
      }
      
      // Load default content if no saved content
      const defaultContent = generateDefaultContent();
      setContent(defaultContent);
      return Object.values(defaultContent);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get specific content with language and difficulty adaptation
  const getContent = useCallback((id: string, language = 'en', difficulty?: number): ContentItem | null => {
    const item = content[id];
    if (!item) return null;

    let adaptedItem = { ...item };

    // Apply language translation
    if (language !== 'en' && item.translations[language]) {
      const translation = item.translations[language];
      adaptedItem = {
        ...adaptedItem,
        title: translation.title,
        description: translation.description,
        content: translation.content
      };
    }

    // Apply difficulty adaptation
    if (difficulty && difficulty !== item.metadata.difficulty) {
      const adaptation = item.adaptations.find(a => a.level === difficulty);
      if (adaptation) {
        adaptedItem = {
          ...adaptedItem,
          content: { ...adaptedItem.content, ...adaptation.modifications.content },
          metadata: { ...adaptedItem.metadata, difficulty: difficulty as 1 | 2 | 3 | 4 | 5 }
        };
      }
    }

    return adaptedItem;
  }, [content]);

  // Generate personalized recommendations
  const getRecommendations = useCallback(async (child: Child, limit = 10): Promise<ContentRecommendation[]> => {
    const contentItems = Object.values(content);
    const recommendations: ContentRecommendation[] = [];

    for (const item of contentItems) {
      if (!item.targetAge.includes(child.age)) continue;

      let score = 0;
      const reasons: string[] = [];

      // Age appropriateness
      if (item.targetAge.includes(child.age)) {
        score += 20;
        reasons.push('Age appropriate');
      }

      // Skill-based recommendations
      const childSkillLevel = Math.floor((child.progress.englishLevel + child.progress.mathLevel) / 2);
      const difficultyMatch = Math.abs(item.metadata.difficulty - childSkillLevel);
      score += Math.max(0, 30 - (difficultyMatch * 10));
      
      if (difficultyMatch <= 1) {
        reasons.push('Perfect difficulty match');
      }

      // Interest-based (simplified - would use real preference data)
      if (item.categories.includes('interactive') || item.categories.includes('games')) {
        score += 15;
        reasons.push('Interactive content');
      }

      // Sequential learning
      const hasCompletedPrereqs = item.prerequisites.every(prereq => {
        // Check if child has completed prerequisite content
        return true; // Simplified
      });
      
      if (hasCompletedPrereqs) {
        score += 10;
        reasons.push('Prerequisites met');
      }

      if (score > 0) {
        recommendations.push({
          contentId: item.id,
          score,
          reasons,
          type: 'skill-based',
          adaptedDifficulty: Math.min(5, Math.max(1, childSkillLevel)),
          estimatedSuccess: Math.min(100, score * 1.5)
        });
      }
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [content]);

  // Create new content
  const createContent = useCallback(async (contentData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newContent: ContentItem = {
      ...contentData,
      id,
      createdAt: now,
      updatedAt: now
    };

    // Validate content
    const validation = validateContent(newContent);
    if (!validation.isValid) {
      throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
    }

    setContent(prev => ({
      ...prev,
      [id]: newContent
    }));

    // Save to localStorage
    const updatedContent = { ...content, [id]: newContent };
    localStorage.setItem('play-learn-spark-content', JSON.stringify(updatedContent));

    return id;
  }, [content]);

  // Update existing content
  const updateContent = useCallback(async (id: string, updates: Partial<ContentItem>): Promise<boolean> => {
    if (!content[id]) return false;

    const updatedItem = {
      ...content[id],
      ...updates,
      updatedAt: Date.now()
    };

    setContent(prev => ({
      ...prev,
      [id]: updatedItem
    }));

    // Save to localStorage
    const updatedContent = { ...content, [id]: updatedItem };
    localStorage.setItem('play-learn-spark-content', JSON.stringify(updatedContent));

    return true;
  }, [content]);

  // Delete content
  const deleteContent = useCallback(async (id: string): Promise<boolean> => {
    if (!content[id]) return false;

    setContent(prev => {
      const newContent = { ...prev };
      delete newContent[id];
      return newContent;
    });

    return true;
  }, [content]);

  // Additional helper functions
  const getPersonalizedContent = useCallback(async (child: Child, type?: string): Promise<ContentItem[]> => {
    const recommendations = await getRecommendations(child, 20);
    return recommendations
      .map(rec => getContent(rec.contentId, 'en', rec.adaptedDifficulty))
      .filter((item): item is ContentItem => item !== null)
      .filter(item => !type || item.type === type);
  }, [getRecommendations, getContent]);

  const adaptContentDifficulty = useCallback((contentId: string, targetDifficulty: number): ContentItem | null => {
    return getContent(contentId, 'en', targetDifficulty);
  }, [getContent]);

  const getOptimalDifficulty = useCallback((child: Child, contentId: string): number => {
    const avgLevel = Math.floor((child.progress.englishLevel + child.progress.mathLevel) / 2);
    return Math.min(5, Math.max(1, avgLevel));
  }, []);

  const getAvailableLanguages = useCallback((): string[] => {
    const languages = new Set<string>();
    Object.values(content).forEach(item => {
      languages.add(item.metadata.language);
      Object.keys(item.translations).forEach(lang => languages.add(lang));
    });
    return Array.from(languages);
  }, [content]);

  const translateContent = useCallback(async (id: string, targetLanguage: string): Promise<boolean> => {
    // Simulate translation API call
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1000);
    });
  }, []);

  const trackContentUsage = useCallback((contentId: string, childId: string, metrics: ContentUsageMetrics) => {
    // Store usage analytics
    const analyticsKey = `analytics_${contentId}`;
    const existing = localStorage.getItem(analyticsKey);
    const analytics = existing ? JSON.parse(existing) : { usage: [] };
    
    analytics.usage.push({
      childId,
      timestamp: Date.now(),
      ...metrics
    });
    
    localStorage.setItem(analyticsKey, JSON.stringify(analytics));
  }, []);

  const getContentAnalytics = useCallback((contentId: string): ContentAnalytics => {
    const analyticsKey = `analytics_${contentId}`;
    const data = localStorage.getItem(analyticsKey);
    
    if (!data) {
      return {
        totalViews: 0,
        completionRate: 0,
        averageScore: 0,
        averageTime: 0,
        difficultyDistribution: {},
        ageGroupUsage: {},
        popularityTrend: [],
        userFeedback: 0
      };
    }
    
    const analytics = JSON.parse(data);
    const usage = analytics.usage || [];
    
    return {
      totalViews: usage.length,
      completionRate: usage.filter((u: any) => u.completed).length / usage.length * 100,
      averageScore: usage.reduce((sum: number, u: any) => sum + (u.score || 0), 0) / usage.length,
      averageTime: usage.reduce((sum: number, u: any) => sum + u.timeSpent, 0) / usage.length,
      difficultyDistribution: usage.reduce((acc: any, u: any) => {
        acc[u.difficultyUsed] = (acc[u.difficultyUsed] || 0) + 1;
        return acc;
      }, {}),
      ageGroupUsage: {},
      popularityTrend: [],
      userFeedback: 4.2 // Placeholder
    };
  }, []);

  const toggleCreatorMode = useCallback(() => {
    setIsCreatorMode(prev => !prev);
  }, []);

  const validateContent = useCallback((contentData: Partial<ContentItem>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!contentData.title || contentData.title.length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (!contentData.description || contentData.description.length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (!contentData.targetAge || contentData.targetAge.length === 0) {
      errors.push('Target age must be specified');
    }

    if (!contentData.learningObjectives || contentData.learningObjectives.length === 0) {
      warnings.push('Learning objectives should be defined');
    }

    if (!contentData.tags || contentData.tags.length === 0) {
      suggestions.push('Consider adding tags for better discoverability');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }, []);

  // Initialize with default content
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const value: ContentContextType = {
    content,
    loadContent,
    getContent,
    createContent,
    updateContent,
    deleteContent,
    getRecommendations,
    getPersonalizedContent,
    adaptContentDifficulty,
    getOptimalDifficulty,
    getAvailableLanguages,
    translateContent,
    trackContentUsage,
    getContentAnalytics,
    isCreatorMode,
    toggleCreatorMode,
    validateContent,
    isLoading,
    error,
    lastSync
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

// Generate default content for testing
function generateDefaultContent(): Record<string, ContentItem> {
  const defaultItems: ContentItem[] = [
    {
      id: 'story_aladdin',
      type: 'story',
      title: 'Aladdin and the Magic Lamp',
      description: 'A classic tale from Arabian Nights with interactive elements',
      content: {
        chapters: [
          { title: 'The Poor Boy', text: 'Once upon a time, in the city of Agrabah...' },
          { title: 'The Magic Lamp', text: 'Deep in the cave, Aladdin found a dusty lamp...' }
        ],
        interactions: ['touch lamp', 'make wish', 'fly carpet']
      },
      metadata: {
        difficulty: 2,
        subject: 'literature',
        skills: ['reading', 'comprehension', 'cultural awareness'],
        concepts: ['storytelling', 'moral lessons'],
        bloomsTaxonomy: 'understand',
        multipleIntelligences: ['linguistic', 'spatial'],
        accessibilityFeatures: ['audio narration', 'visual cues'],
        interactionTypes: ['touch', 'voice'],
        mediaTypes: ['text', 'audio', 'animation'],
        language: 'en'
      },
      translations: {
        ar: {
          language: 'ar',
          title: 'علاء الدين والمصباح السحري',
          description: 'حكاية كلاسيكية من ألف ليلة وليلة مع عناصر تفاعلية',
          content: { /* Arabic content */ },
          status: 'approved'
        }
      },
      adaptations: [
        {
          level: 1,
          modifications: {
            content: { simplified: true, vocabulary: 'basic' },
            hints: ['Look for pictures', 'Listen to the story'],
            timeLimit: 600
          }
        }
      ],
      tags: ['stories', 'arabic culture', 'interactive', 'adventure'],
      categories: ['literature', 'cultural'],
      targetAge: [4, 5, 6],
      estimatedDuration: 15,
      prerequisites: [],
      learningObjectives: ['Understand story structure', 'Learn about Arabian culture'],
      culturalContext: 'Middle Eastern folklore',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0',
      status: 'published'
    }
  ];

  return defaultItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, ContentItem>);
}

export default ContentProvider;