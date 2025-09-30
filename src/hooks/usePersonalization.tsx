import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Child } from '@/types/learning';
import { useContent } from './useContent';

export interface UserPreference {
  id: string;
  childId: string;
  category: 'ui' | 'content' | 'accessibility' | 'learning' | 'cultural';
  key: string;
  value: any;
  metadata: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    options?: any[];
    range?: { min: number; max: number };
    default: any;
  };
  lastUpdated: number;
  source: 'user' | 'system' | 'adaptive' | 'recommendation';
}

export interface PersonalizationProfile {
  childId: string;
  preferences: Record<string, UserPreference>;
  learningStyle: {
    primary: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    secondary?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    confidence: number;
  };
  adaptiveSettings: {
    difficultyAdjustment: 'manual' | 'automatic' | 'assisted';
    paceControl: 'self' | 'guided' | 'adaptive';
    feedbackFrequency: 'immediate' | 'periodic' | 'minimal';
    hintSystem: 'proactive' | 'on-demand' | 'disabled';
  };
  culturalPreferences: {
    primaryCulture: string;
    secondaryCultures: string[];
    languagePreference: string[];
    contentLocalisation: boolean;
    culturalSensitivity: 'high' | 'medium' | 'low';
  };
  accessibilityNeeds: {
    visualSupport: boolean;
    auditorySupport: boolean;
    motorSupport: boolean;
    cognitiveSupport: boolean;
    textSize: 'small' | 'medium' | 'large' | 'xl';
    colorContrast: 'normal' | 'high' | 'inverted';
    animations: 'full' | 'reduced' | 'disabled';
    sounds: 'full' | 'essential' | 'disabled';
  };
  behaviorPatterns: {
    sessionLength: number; // average in minutes
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
    attentionSpan: number; // in minutes
    breakFrequency: number; // minutes between breaks
    motivationTriggers: string[];
    frustrationTolerance: 'low' | 'medium' | 'high';
  };
  contentAffinities: {
    favoriteTypes: string[];
    dislikedTypes: string[];
    subjectPreferences: Record<string, number>; // subject -> preference score
    difficultyComfort: Record<string, number>; // subject -> preferred difficulty
    engagementPatterns: Record<string, number>; // activity type -> engagement score
  };
  createdAt: number;
  lastUpdated: number;
  dataVersion: string;
}

export interface AdaptiveRecommendation {
  type: 'preference' | 'difficulty' | 'content' | 'timing' | 'accessibility';
  confidence: number;
  suggestion: any;
  reasoning: string;
  impact: 'low' | 'medium' | 'high';
  priority: number;
}

interface PersonalizationContextType {
  // Profile Management
  getProfile: (childId: string) => PersonalizationProfile | null;
  createProfile: (child: Child) => PersonalizationProfile;
  updateProfile: (childId: string, updates: Partial<PersonalizationProfile>) => Promise<boolean>;
  
  // Preference Management
  getPreference: (childId: string, key: string) => any;
  setPreference: (childId: string, key: string, value: any, source?: string) => Promise<boolean>;
  resetPreferences: (childId: string, category?: string) => Promise<boolean>;
  
  // Adaptive Learning
  analyzeUsagePatterns: (childId: string) => Promise<AdaptiveRecommendation[]>;
  applyAdaptiveSettings: (childId: string, recommendations: AdaptiveRecommendation[]) => Promise<boolean>;
  
  // Learning Style Detection
  detectLearningStyle: (childId: string) => Promise<PersonalizationProfile['learningStyle']>;
  updateLearningStyle: (childId: string, style: Partial<PersonalizationProfile['learningStyle']>) => Promise<boolean>;
  
  // Cultural Personalization
  setCulturalPreferences: (childId: string, preferences: Partial<PersonalizationProfile['culturalPreferences']>) => Promise<boolean>;
  getLocalizedContent: (childId: string, contentType?: string) => Promise<any[]>;
  
  // Accessibility
  configureAccessibility: (childId: string, needs: Partial<PersonalizationProfile['accessibilityNeeds']>) => Promise<boolean>;
  getAccessibilitySettings: (childId: string) => PersonalizationProfile['accessibilityNeeds'];
  
  // Behavior Analysis
  trackBehavior: (childId: string, action: string, context: any) => void;
  getBehaviorInsights: (childId: string) => PersonalizationProfile['behaviorPatterns'];
  
  // Content Personalization
  getPersonalizedSettings: (childId: string) => Record<string, any>;
  adaptContentForChild: (childId: string, contentId: string) => Promise<any>;
  
  // Data & Privacy
  exportProfileData: (childId: string) => Promise<string>;
  importProfileData: (childId: string, data: string) => Promise<boolean>;
  clearAllData: (childId: string) => Promise<boolean>;
  
  // State
  profiles: Record<string, PersonalizationProfile>;
  isLoading: boolean;
  error: string | null;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};

interface PersonalizationProviderProps {
  children: React.ReactNode;
}

export const PersonalizationProvider: React.FC<PersonalizationProviderProps> = ({ children }) => {
  const [profiles, setProfiles] = useState<Record<string, PersonalizationProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getContent, trackContentUsage } = useContent();

  // Load profiles from storage
  useEffect(() => {
    const savedProfiles = localStorage.getItem('play-learn-spark-personalization');
    if (savedProfiles) {
      try {
        setProfiles(JSON.parse(savedProfiles));
      } catch (err) {
        console.error('Failed to load personalization profiles:', err);
      }
    }
  }, []);

  // Save profiles to storage
  const saveProfiles = useCallback((newProfiles: Record<string, PersonalizationProfile>) => {
    localStorage.setItem('play-learn-spark-personalization', JSON.stringify(newProfiles));
    setProfiles(newProfiles);
  }, []);

  // Get profile for child
  const getProfile = useCallback((childId: string): PersonalizationProfile | null => {
    return profiles[childId] || null;
  }, [profiles]);

  // Create new profile
  const createProfile = useCallback((child: Child): PersonalizationProfile => {
    const profile: PersonalizationProfile = {
      childId: child.id,
      preferences: {},
      learningStyle: {
        primary: 'visual',
        confidence: 0.3
      },
      adaptiveSettings: {
        difficultyAdjustment: 'automatic',
        paceControl: 'adaptive',
        feedbackFrequency: 'immediate',
        hintSystem: 'on-demand'
      },
      culturalPreferences: {
        primaryCulture: 'international',
        secondaryCultures: [],
        languagePreference: ['en'],
        contentLocalisation: true,
        culturalSensitivity: 'medium'
      },
      accessibilityNeeds: {
        visualSupport: false,
        auditorySupport: false,
        motorSupport: false,
        cognitiveSupport: false,
        textSize: 'medium',
        colorContrast: 'normal',
        animations: 'full',
        sounds: 'full'
      },
      behaviorPatterns: {
        sessionLength: 15,
        preferredTimeOfDay: 'flexible',
        attentionSpan: child.age * 2,
        breakFrequency: 10,
        motivationTriggers: ['praise', 'progress', 'stars'],
        frustrationTolerance: 'medium'
      },
      contentAffinities: {
        favoriteTypes: [],
        dislikedTypes: [],
        subjectPreferences: {},
        difficultyComfort: {},
        engagementPatterns: {}
      },
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      dataVersion: '1.0'
    };

    const newProfiles = { ...profiles, [child.id]: profile };
    saveProfiles(newProfiles);
    
    return profile;
  }, [profiles, saveProfiles]);

  // Update profile
  const updateProfile = useCallback(async (childId: string, updates: Partial<PersonalizationProfile>): Promise<boolean> => {
    const existing = profiles[childId];
    if (!existing) return false;

    const updated = {
      ...existing,
      ...updates,
      lastUpdated: Date.now()
    };

    const newProfiles = { ...profiles, [childId]: updated };
    saveProfiles(newProfiles);
    
    return true;
  }, [profiles, saveProfiles]);

  // Get specific preference
  const getPreference = useCallback((childId: string, key: string): any => {
    const profile = profiles[childId];
    if (!profile || !profile.preferences[key]) return null;
    return profile.preferences[key].value;
  }, [profiles]);

  // Set preference
  const setPreference = useCallback(async (childId: string, key: string, value: any, source = 'user'): Promise<boolean> => {
    const profile = profiles[childId];
    if (!profile) return false;

    const preference: UserPreference = {
      id: `${childId}_${key}_${Date.now()}`,
      childId,
      category: determinePreferenceCategory(key),
      key,
      value,
      metadata: {
        type: Array.isArray(value) ? 'array' : typeof value === 'object' ? 'object' : typeof value as 'string' | 'number' | 'boolean',
        description: getPreferenceDescription(key),
        default: getDefaultPreferenceValue(key)
      },
      lastUpdated: Date.now(),
      source: source as any
    };

    const newProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: preference
      },
      lastUpdated: Date.now()
    };

    const newProfiles = { ...profiles, [childId]: newProfile };
    saveProfiles(newProfiles);
    
    return true;
  }, [profiles, saveProfiles]);

  // Analyze usage patterns
  const analyzeUsagePatterns = useCallback(async (childId: string): Promise<AdaptiveRecommendation[]> => {
    const profile = profiles[childId];
    if (!profile) return [];

    const recommendations: AdaptiveRecommendation[] = [];

    // Analyze session length patterns
    if (profile.behaviorPatterns.sessionLength < 5) {
      recommendations.push({
        type: 'timing',
        confidence: 0.8,
        suggestion: { breakFrequency: 3, sessionReminders: true },
        reasoning: 'Short sessions detected - recommend more frequent breaks',
        impact: 'medium',
        priority: 2
      });
    }

    // Analyze difficulty preferences
    const avgDifficulty = Object.values(profile.contentAffinities.difficultyComfort).reduce((a, b) => a + b, 0) / 
                         Object.keys(profile.contentAffinities.difficultyComfort).length;
    
    if (avgDifficulty > 4) {
      recommendations.push({
        type: 'difficulty',
        confidence: 0.9,
        suggestion: { increaseDifficulty: true, addChallenges: true },
        reasoning: 'Child consistently prefers higher difficulty content',
        impact: 'high',
        priority: 1
      });
    }

    // Analyze engagement patterns
    const lowEngagementTypes = Object.entries(profile.contentAffinities.engagementPatterns)
      .filter(([_, score]) => score < 0.3)
      .map(([type, _]) => type);

    if (lowEngagementTypes.length > 0) {
      recommendations.push({
        type: 'content',
        confidence: 0.7,
        suggestion: { avoidTypes: lowEngagementTypes, suggestAlternatives: true },
        reasoning: `Low engagement with: ${lowEngagementTypes.join(', ')}`,
        impact: 'medium',
        priority: 3
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }, [profiles]);

  // Apply adaptive settings
  const applyAdaptiveSettings = useCallback(async (childId: string, recommendations: AdaptiveRecommendation[]): Promise<boolean> => {
    const profile = profiles[childId];
    if (!profile) return false;

    let updated = { ...profile };

    for (const rec of recommendations) {
      switch (rec.type) {
        case 'timing':
          updated.behaviorPatterns = {
            ...updated.behaviorPatterns,
            ...rec.suggestion
          };
          break;
        case 'difficulty':
          updated.adaptiveSettings = {
            ...updated.adaptiveSettings,
            difficultyAdjustment: rec.suggestion.increaseDifficulty ? 'automatic' : 'assisted'
          };
          break;
        case 'content':
          updated.contentAffinities = {
            ...updated.contentAffinities,
            dislikedTypes: [...updated.contentAffinities.dislikedTypes, ...rec.suggestion.avoidTypes]
          };
          break;
      }
    }

    return updateProfile(childId, updated);
  }, [profiles, updateProfile]);

  // Detect learning style
  const detectLearningStyle = useCallback(async (childId: string): Promise<PersonalizationProfile['learningStyle']> => {
    const profile = profiles[childId];
    if (!profile) {
      return { primary: 'visual', confidence: 0.3 };
    }

    // Analyze engagement patterns to detect learning style
    const engagementData = profile.contentAffinities.engagementPatterns;
    
    let visualScore = 0;
    let auditoryScore = 0;
    let kinestheticScore = 0;
    let readingScore = 0;

    Object.entries(engagementData).forEach(([type, score]) => {
      if (type.includes('visual') || type.includes('image')) visualScore += score;
      if (type.includes('audio') || type.includes('sound')) auditoryScore += score;
      if (type.includes('interactive') || type.includes('touch')) kinestheticScore += score;
      if (type.includes('text') || type.includes('reading')) readingScore += score;
    });

    const scores = { visual: visualScore, auditory: auditoryScore, kinesthetic: kinestheticScore, reading: readingScore };
    const maxScore = Math.max(...Object.values(scores));
    const primary = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) as any;
    
    // Calculate confidence based on score separation
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0.3;

    return {
      primary: primary || 'visual',
      confidence: Math.min(0.95, Math.max(0.3, confidence))
    };
  }, [profiles]);

  // Update learning style
  const updateLearningStyle = useCallback(async (childId: string, style: Partial<PersonalizationProfile['learningStyle']>): Promise<boolean> => {
    const profile = profiles[childId];
    if (!profile) return false;

    const updated = {
      ...profile,
      learningStyle: {
        ...profile.learningStyle,
        ...style
      }
    };

    return updateProfile(childId, updated);
  }, [profiles, updateProfile]);

  // Configure cultural preferences
  const setCulturalPreferences = useCallback(async (childId: string, preferences: Partial<PersonalizationProfile['culturalPreferences']>): Promise<boolean> => {
    const profile = profiles[childId];
    if (!profile) return false;

    const updated = {
      ...profile,
      culturalPreferences: {
        ...profile.culturalPreferences,
        ...preferences
      }
    };

    return updateProfile(childId, updated);
  }, [profiles, updateProfile]);

  // Get localized content
  const getLocalizedContent = useCallback(async (childId: string, contentType?: string): Promise<any[]> => {
    const profile = profiles[childId];
    if (!profile) return [];

    const { primaryCulture, languagePreference } = profile.culturalPreferences;
    
    // This would integrate with the content system to get culturally appropriate content
    // For now, return placeholder
    return [];
  }, [profiles]);

  // Configure accessibility
  const configureAccessibility = useCallback(async (childId: string, needs: Partial<PersonalizationProfile['accessibilityNeeds']>): Promise<boolean> => {
    const profile = profiles[childId];
    if (!profile) return false;

    const updated = {
      ...profile,
      accessibilityNeeds: {
        ...profile.accessibilityNeeds,
        ...needs
      }
    };

    return updateProfile(childId, updated);
  }, [profiles, updateProfile]);

  // Get accessibility settings
  const getAccessibilitySettings = useCallback((childId: string): PersonalizationProfile['accessibilityNeeds'] => {
    const profile = profiles[childId];
    return profile?.accessibilityNeeds || {
      visualSupport: false,
      auditorySupport: false,
      motorSupport: false,
      cognitiveSupport: false,
      textSize: 'medium',
      colorContrast: 'normal',
      animations: 'full',
      sounds: 'full'
    };
  }, [profiles]);

  // Track behavior
  const trackBehavior = useCallback((childId: string, action: string, context: any) => {
    const profile = profiles[childId];
    if (!profile) return;

    // Update behavior patterns based on action
    const behaviorKey = `behavior_${childId}_${Date.now()}`;
    localStorage.setItem(behaviorKey, JSON.stringify({ action, context, timestamp: Date.now() }));

    // Analyze and update patterns (simplified)
    if (action === 'session_start') {
      // Track session patterns
    } else if (action === 'content_interaction') {
      // Update engagement patterns
      const contentType = context.contentType;
      const engagement = context.engagement || 0.5;
      
      const updated = {
        ...profile,
        contentAffinities: {
          ...profile.contentAffinities,
          engagementPatterns: {
            ...profile.contentAffinities.engagementPatterns,
            [contentType]: engagement
          }
        }
      };

      updateProfile(childId, updated);
    }
  }, [profiles, updateProfile]);

  // Get behavior insights
  const getBehaviorInsights = useCallback((childId: string): PersonalizationProfile['behaviorPatterns'] => {
    const profile = profiles[childId];
    return profile?.behaviorPatterns || {
      sessionLength: 15,
      preferredTimeOfDay: 'flexible',
      attentionSpan: 10,
      breakFrequency: 10,
      motivationTriggers: [],
      frustrationTolerance: 'medium'
    };
  }, [profiles]);

  // Get personalized settings
  const getPersonalizedSettings = useCallback((childId: string): Record<string, any> => {
    const profile = profiles[childId];
    if (!profile) return {};

    return {
      language: profile.culturalPreferences.languagePreference[0] || 'en',
      difficulty: 'adaptive',
      culturalContext: profile.culturalPreferences.primaryCulture,
      accessibility: profile.accessibilityNeeds,
      learningStyle: profile.learningStyle.primary,
      sessionLength: profile.behaviorPatterns.sessionLength,
      feedbackFrequency: profile.adaptiveSettings.feedbackFrequency
    };
  }, [profiles]);

  // Adapt content for child
  const adaptContentForChild = useCallback(async (childId: string, contentId: string): Promise<any> => {
    const profile = profiles[childId];
    if (!profile) return null;

    const settings = getPersonalizedSettings(childId);
    const content = getContent(contentId, settings.language);
    
    if (!content) return null;

    // Apply personalization
    let adaptedContent = { ...content };

    // Apply accessibility settings
    if (profile.accessibilityNeeds.textSize !== 'medium') {
      adaptedContent = {
        ...adaptedContent,
        content: {
          ...adaptedContent.content,
          accessibility: {
            ...(adaptedContent.content.accessibility || {}),
            textSize: profile.accessibilityNeeds.textSize
          }
        }
      };
    }

    // Apply learning style adaptations
    if (profile.learningStyle.primary === 'auditory') {
      adaptedContent = {
        ...adaptedContent,
        content: {
          ...adaptedContent.content,
          features: {
            ...(adaptedContent.content.features || {}),
            audioNarration: true,
            soundEffects: true
          }
        }
      };
    }

    return adaptedContent;
  }, [profiles, getPersonalizedSettings, getContent]);

  // Export profile data
  const exportProfileData = useCallback(async (childId: string): Promise<string> => {
    const profile = profiles[childId];
    if (!profile) throw new Error('Profile not found');

    return JSON.stringify(profile, null, 2);
  }, [profiles]);

  // Import profile data
  const importProfileData = useCallback(async (childId: string, data: string): Promise<boolean> => {
    try {
      const profile = JSON.parse(data) as PersonalizationProfile;
      profile.childId = childId;
      profile.lastUpdated = Date.now();

      const newProfiles = { ...profiles, [childId]: profile };
      saveProfiles(newProfiles);
      
      return true;
    } catch (err) {
      setError('Failed to import profile data');
      return false;
    }
  }, [profiles, saveProfiles]);

  // Clear all data
  const clearAllData = useCallback(async (childId: string): Promise<boolean> => {
    const newProfiles = { ...profiles };
    delete newProfiles[childId];
    saveProfiles(newProfiles);

    // Clear behavior tracking data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`behavior_${childId}_`)) {
        localStorage.removeItem(key);
      }
    });

    return true;
  }, [profiles, saveProfiles]);

  // Reset preferences
  const resetPreferences = useCallback(async (childId: string, category?: string): Promise<boolean> => {
    const profile = profiles[childId];
    if (!profile) return false;

    let filteredPreferences = { ...profile.preferences };
    
    if (category) {
      filteredPreferences = Object.fromEntries(
        Object.entries(filteredPreferences).filter(([_, pref]) => pref.category !== category)
      );
    } else {
      filteredPreferences = {};
    }

    const updated = {
      ...profile,
      preferences: filteredPreferences
    };

    return updateProfile(childId, updated);
  }, [profiles, updateProfile]);

  const value: PersonalizationContextType = {
    getProfile,
    createProfile,
    updateProfile,
    getPreference,
    setPreference,
    resetPreferences,
    analyzeUsagePatterns,
    applyAdaptiveSettings,
    detectLearningStyle,
    updateLearningStyle,
    setCulturalPreferences,
    getLocalizedContent,
    configureAccessibility,
    getAccessibilitySettings,
    trackBehavior,
    getBehaviorInsights,
    getPersonalizedSettings,
    adaptContentForChild,
    exportProfileData,
    importProfileData,
    clearAllData,
    profiles,
    isLoading,
    error
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
};

// Helper functions
function determinePreferenceCategory(key: string): UserPreference['category'] {
  if (key.includes('ui') || key.includes('theme') || key.includes('layout')) return 'ui';
  if (key.includes('content') || key.includes('subject')) return 'content';
  if (key.includes('accessibility') || key.includes('support')) return 'accessibility';
  if (key.includes('learning') || key.includes('difficulty')) return 'learning';
  if (key.includes('culture') || key.includes('language')) return 'cultural';
  return 'ui';
}

function getPreferenceDescription(key: string): string {
  const descriptions: Record<string, string> = {
    theme: 'Visual theme preference',
    language: 'Primary language for content',
    difficulty: 'Preferred difficulty level',
    sounds: 'Sound effects preference',
    animations: 'Animation preference',
    textSize: 'Text size preference'
  };
  return descriptions[key] || `Preference for ${key}`;
}

function getDefaultPreferenceValue(key: string): any {
  const defaults: Record<string, any> = {
    theme: 'auto',
    language: 'en',
    difficulty: 3,
    sounds: true,
    animations: true,
    textSize: 'medium'
  };
  return defaults[key] || null;
}

export default PersonalizationProvider;