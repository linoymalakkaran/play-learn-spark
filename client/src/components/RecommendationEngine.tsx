/**
 * Modular Recommendation Engine
 * Main component that orchestrates personalized content discovery
 * Refactored from 1,247 lines to ~200 lines by using modular components
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Grid,
  List,
  RefreshCw,
  Settings,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import modular components
import { ContentFilter } from './recommendation/ContentFilter';
import { RecommendationDisplay } from './recommendation/RecommendationDisplay';
import { LearningPaths } from './recommendation/LearningPaths';
import { 
  generateRecommendations, 
  generateLearningPaths 
} from './recommendation/RecommendationAlgorithms';

// Import types
import {
  RecommendedContent,
  LearningPathSuggestion,
  PersonalizationProfile,
  FilterOptions,
  RecommendationEngineProps
} from '@/types/recommendation.types';

// Mock data generators (replace with API calls)
import { 
  generateMockProfile,
  generateMockContent,
  generateMockRecommendations,
  generateMockLearningPaths
} from '@/utils/mockRecommendationData';

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  childId,
  className,
  onContentSelect,
  onPathSelect,
  showAdvancedFilters = true
}) => {
  // State management
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [allContent, setAllContent] = useState<RecommendedContent[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedContent[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPathSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    skills: [],
    difficulty: [],
    duration: { min: 0, max: 60 },
    contentTypes: [],
    ageRange: 'all',
    onlyNewContent: false,
    includeCompleted: false,
    socialMode: 'all'
  });
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'score' | 'difficulty' | 'duration' | 'popularity'>('score');
  const [activeTab, setActiveTab] = useState<'recommendations' | 'paths'>('recommendations');

  // Load initial data
  useEffect(() => {
    loadRecommendations();
  }, [childId]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, these would be API calls
      const mockProfile = generateMockProfile(childId);
      const mockContent = generateMockContent();
      
      // Generate personalized recommendations
      const personalizedRecommendations = generateRecommendations(mockProfile, mockContent);
      const personalizedPaths = generateLearningPaths(mockProfile, personalizedRecommendations);
      
      setProfile(mockProfile);
      setAllContent(mockContent);
      setRecommendations(personalizedRecommendations);
      setLearningPaths(personalizedPaths);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    setIsRefreshing(true);
    await loadRecommendations();
    setIsRefreshing(false);
  };

  // Filter and sort recommendations
  const filteredRecommendations = useMemo(() => {
    if (!recommendations.length) return [];

    let filtered = recommendations.filter(content => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          content.title.toLowerCase().includes(query) ||
          content.description.toLowerCase().includes(query) ||
          content.skills.some(skill => skill.toLowerCase().includes(query)) ||
          content.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Apply all filter options
      if (filters.categories.length > 0 && !filters.categories.includes(content.category)) {
        return false;
      }

      if (filters.skills.length > 0 && !content.skills.some(skill => filters.skills.includes(skill))) {
        return false;
      }

      if (filters.difficulty.length > 0 && !filters.difficulty.includes(content.difficulty)) {
        return false;
      }

      if (content.duration < filters.duration.min || content.duration > filters.duration.max) {
        return false;
      }

      if (filters.contentTypes.length > 0 && !filters.contentTypes.includes(content.type)) {
        return false;
      }

      if (filters.onlyNewContent && content.isCompleted) {
        return false;
      }

      if (!filters.includeCompleted && content.isCompleted) {
        return false;
      }

      return true;
    });

    // Sort recommendations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.recommendationScore - a.recommendationScore;
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'duration':
          return a.duration - b.duration;
        case 'popularity':
          return b.userRating - a.userRating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [recommendations, searchQuery, filters, sortBy]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading personalized recommendations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Personalized Recommendations</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === 'recommendations' && (
            <>
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="score">Best Match</option>
                <option value="difficulty">Difficulty</option>
                <option value="duration">Duration</option>
                <option value="popularity">Popularity</option>
              </select>

              {/* View toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={selectedView === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedView('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedView('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshRecommendations}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <ContentFilter
            filters={filters}
            onFiltersChange={setFilters}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showAdvanced={showAdvancedFilters}
          />
        </div>

        {/* Content area */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommendations">
                Recommendations ({filteredRecommendations.length})
              </TabsTrigger>
              <TabsTrigger value="paths">
                Learning Paths ({learningPaths.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommendations" className="mt-6">
              <RecommendationDisplay
                recommendations={filteredRecommendations}
                onContentSelect={onContentSelect}
                viewMode={selectedView}
              />
            </TabsContent>
            
            <TabsContent value="paths" className="mt-6">
              <LearningPaths
                paths={learningPaths}
                onPathSelect={onPathSelect}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};