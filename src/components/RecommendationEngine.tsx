/**
 * Enhanced Recommendation Engine for Play & Learn Spark Frontend
 * Personalized content discovery with advanced filtering, learning paths, and adaptive suggestions
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  Star,
  Clock,
  Target,
  Brain,
  Heart,
  TrendingUp,
  Sparkles,
  MapPin,
  Calendar,
  Play,
  BookOpen,
  Award,
  Users,
  Lightbulb,
  Settings,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Eye,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RecommendedContent {
  id: string;
  title: string;
  description: string;
  type: 'activity' | 'story' | 'game' | 'video' | 'lesson';
  category: string;
  thumbnailUrl: string;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  ageRange: string;
  skills: string[];
  tags: string[];
  recommendationScore: number; // 0-100
  recommendationReasons: RecommendationReason[];
  learningObjectives: string[];
  prerequisites?: string[];
  completionRate: number;
  userRating: number;
  isBookmarked: boolean;
  isCompleted: boolean;
  estimatedLearningGain: number;
  adaptationSuggestions: string[];
}

export interface RecommendationReason {
  type: 'age_match' | 'skill_level' | 'interest' | 'learning_style' | 'difficulty' | 'social' | 'trending';
  explanation: string;
  strength: number; // 0-100
  icon: string;
}

export interface LearningPathSuggestion {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  targetSkills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  milestones: PathMilestone[];
  recommendedContent: string[]; // content IDs
  adaptiveAdjustments: string[];
  successPrediction: number; // 0-100
}

export interface PathMilestone {
  id: string;
  title: string;
  description: string;
  week: number;
  skills: string[];
  activities: string[];
  assessmentCriteria: string[];
}

export interface PersonalizationProfile {
  childId: string;
  age: number; // in months
  interests: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  skillLevels: Record<string, number>;
  attentionSpan: number; // in minutes
  preferredDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  optimalSessionLength: number;
  strugglingAreas: string[];
  strengthAreas: string[];
  completedContent: string[];
  recentPerformance: PerformanceMetric[];
  socialPreferences: 'solo' | 'collaborative' | 'mixed';
  parentGoals: string[];
}

export interface PerformanceMetric {
  contentId: string;
  score: number;
  timeSpent: number;
  attemptsNeeded: number;
  engagementLevel: number;
  completedAt: Date;
  struggledWith: string[];
  excelledAt: string[];
}

export interface FilterOptions {
  categories: string[];
  skills: string[];
  difficulty: string[];
  duration: { min: number; max: number };
  contentTypes: string[];
  ageRange: string;
  onlyNewContent: boolean;
  includeCompleted: boolean;
  socialMode: string;
}

interface RecommendationEngineProps {
  childId: string;
  className?: string;
  onContentSelect?: (content: RecommendedContent) => void;
  onPathSelect?: (path: LearningPathSuggestion) => void;
  showAdvancedFilters?: boolean;
}

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  childId,
  className,
  onContentSelect,
  onPathSelect,
  showAdvancedFilters = true
}) => {
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedContent[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPathSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [showFilters, setShowFilters] = useState(false);

  // Load personalization profile and recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoading(true);
      
      try {
        // Mock data - replace with actual API calls
        const mockProfile = generateMockProfile(childId);
        const mockRecommendations = generateMockRecommendations(mockProfile);
        const mockPaths = generateMockLearningPaths(mockProfile);
        
        setProfile(mockProfile);
        setRecommendations(mockRecommendations);
        setLearningPaths(mockPaths);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [childId]);

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

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(content.category)) {
        return false;
      }

      // Skills filter
      if (filters.skills.length > 0 && !content.skills.some(skill => filters.skills.includes(skill))) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(content.difficulty)) {
        return false;
      }

      // Duration filter
      if (content.duration < filters.duration.min || content.duration > filters.duration.max) {
        return false;
      }

      // Content type filter
      if (filters.contentTypes.length > 0 && !filters.contentTypes.includes(content.type)) {
        return false;
      }

      // New content only
      if (filters.onlyNewContent && content.isCompleted) {
        return false;
      }

      // Include completed
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
          return b.recommendationScore - a.recommendationScore;
      }
    });

    return filtered;
  }, [recommendations, searchQuery, filters, sortBy]);

  const handleContentAction = useCallback((content: RecommendedContent, action: 'select' | 'bookmark' | 'feedback') => {
    switch (action) {
      case 'select':
        onContentSelect?.(content);
        break;
      case 'bookmark':
        setRecommendations(prev => 
          prev.map(item => 
            item.id === content.id 
              ? { ...item, isBookmarked: !item.isBookmarked }
              : item
          )
        );
        break;
      case 'feedback':
        // Handle feedback logic
        break;
    }
  }, [onContentSelect]);

  const refreshRecommendations = useCallback(async () => {
    if (!profile) return;
    
    setIsLoading(true);
    // Simulate API call for fresh recommendations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newRecommendations = generateMockRecommendations(profile);
    setRecommendations(newRecommendations);
    setIsLoading(false);
  }, [profile]);

  if (isLoading && !recommendations.length) {
    return <RecommendationLoadingSkeleton className={className} />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personalized Recommendations</h1>
          <p className="text-muted-foreground">
            Content tailored just for you • {filteredRecommendations.length} recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshRecommendations}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Personalization Summary */}
      {profile && (
        <PersonalizationSummary 
          profile={profile} 
          onProfileUpdate={(updates) => setProfile(prev => prev ? { ...prev, ...updates } : null)}
        />
      )}

      {/* Search and Quick Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities, skills, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2 items-center">
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedView(selectedView === 'grid' ? 'list' : 'grid')}
              >
                {selectedView === 'grid' ? 'List' : 'Grid'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && showAdvancedFilters && (
        <AdvancedFiltersPanel 
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Main Content */}
      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">
            Content Recommendations ({filteredRecommendations.length})
          </TabsTrigger>
          <TabsTrigger value="paths">
            Learning Paths ({learningPaths.length})
          </TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          {selectedView === 'grid' ? (
            <RecommendationGrid 
              recommendations={filteredRecommendations}
              onContentAction={handleContentAction}
            />
          ) : (
            <RecommendationList 
              recommendations={filteredRecommendations}
              onContentAction={handleContentAction}
            />
          )}
        </TabsContent>

        <TabsContent value="paths">
          <LearningPathsSection 
            paths={learningPaths}
            onPathSelect={onPathSelect}
            profile={profile}
          />
        </TabsContent>

        <TabsContent value="trending">
          <TrendingContent 
            recommendations={recommendations.filter(r => r.userRating > 4.0)}
            onContentAction={handleContentAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Personalization Summary Component
interface PersonalizationSummaryProps {
  profile: PersonalizationProfile;
  onProfileUpdate: (updates: Partial<PersonalizationProfile>) => void;
}

const PersonalizationSummary: React.FC<PersonalizationSummaryProps> = ({ profile, onProfileUpdate }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Your Learning Profile
          </h3>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
            Customize
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-primary">Learning Style</div>
            <div className="capitalize">{profile.learningStyle}</div>
          </div>
          <div>
            <div className="font-medium text-primary">Session Length</div>
            <div>{profile.optimalSessionLength} minutes</div>
          </div>
          <div>
            <div className="font-medium text-primary">Interests</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.interests.slice(0, 3).map(interest => (
                <Badge key={interest} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.interests.length - 3}
                </Badge>
              )}
            </div>
          </div>
          <div>
            <div className="font-medium text-primary">Current Focus</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.strengthAreas.slice(0, 2).map(area => (
                <Badge key={area} variant="outline" className="text-xs bg-green-50">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Advanced Filters Panel Component
interface AdvancedFiltersPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
}

const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({ filters, onFiltersChange, onClose }) => {
  const availableCategories = ['Mathematics', 'Reading', 'Art & Creativity', 'Science', 'Social Skills'];
  const availableSkills = ['counting', 'letters', 'colors', 'shapes', 'patterns', 'storytelling'];
  const contentTypes = ['activity', 'story', 'game', 'video', 'lesson'];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Advanced Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Categories */}
          <div>
            <label className="text-sm font-medium">Categories</label>
            <div className="mt-2 space-y-1">
              {availableCategories.map(category => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...filters.categories, category]
                        : filters.categories.filter(c => c !== category);
                      updateFilter('categories', newCategories);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-medium">Skills</label>
            <div className="mt-2 space-y-1">
              {availableSkills.map(skill => (
                <label key={skill} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.skills.includes(skill)}
                    onChange={(e) => {
                      const newSkills = e.target.checked
                        ? [...filters.skills, skill]
                        : filters.skills.filter(s => s !== skill);
                      updateFilter('skills', newSkills);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Content Types */}
          <div>
            <label className="text-sm font-medium">Content Types</label>
            <div className="mt-2 space-y-1">
              {contentTypes.map(type => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.contentTypes.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...filters.contentTypes, type]
                        : filters.contentTypes.filter(t => t !== type);
                      updateFilter('contentTypes', newTypes);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Duration Range */}
        <div>
          <label className="text-sm font-medium">Duration (minutes)</label>
          <div className="mt-2">
            <Slider
              value={[filters.duration.min, filters.duration.max]}
              onValueChange={([min, max]) => updateFilter('duration', { min, max })}
              max={120}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{filters.duration.min} min</span>
              <span>{filters.duration.max} min</span>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.onlyNewContent}
              onChange={(e) => updateFilter('onlyNewContent', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Only new content</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.includeCompleted}
              onChange={(e) => updateFilter('includeCompleted', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Include completed</span>
          </label>
        </div>

        {/* Clear Filters */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onFiltersChange({
              categories: [],
              skills: [],
              difficulty: [],
              duration: { min: 0, max: 60 },
              contentTypes: [],
              ageRange: 'all',
              onlyNewContent: false,
              includeCompleted: false,
              socialMode: 'all'
            })}
          >
            Clear All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Recommendation Grid Component
interface RecommendationGridProps {
  recommendations: RecommendedContent[];
  onContentAction: (content: RecommendedContent, action: 'select' | 'bookmark' | 'feedback') => void;
}

const RecommendationGrid: React.FC<RecommendationGridProps> = ({ recommendations, onContentAction }) => {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No recommendations found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map(content => (
        <RecommendationCard
          key={content.id}
          content={content}
          onAction={onContentAction}
        />
      ))}
    </div>
  );
};

// Recommendation List Component
interface RecommendationListProps {
  recommendations: RecommendedContent[];
  onContentAction: (content: RecommendedContent, action: 'select' | 'bookmark' | 'feedback') => void;
}

const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations, onContentAction }) => {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No recommendations found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map(content => (
        <RecommendationListItem
          key={content.id}
          content={content}
          onAction={onContentAction}
        />
      ))}
    </div>
  );
};

// Individual Recommendation Card Component
interface RecommendationCardProps {
  content: RecommendedContent;
  onAction: (content: RecommendedContent, action: 'select' | 'bookmark' | 'feedback') => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ content, onAction }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <div className="aspect-video bg-muted">
          <img 
            src={content.thumbnailUrl} 
            alt={content.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Overlays */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs bg-black/70 text-white">
            {Math.round(content.recommendationScore)}% match
          </Badge>
        </div>
        
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge 
            variant="secondary" 
            className={cn("text-xs text-white", getDifficultyColor(content.difficulty))}
          >
            {content.difficulty}
          </Badge>
          {content.isCompleted && (
            <Badge variant="secondary" className="text-xs bg-green-600 text-white">
              ✓
            </Badge>
          )}
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {content.duration} min
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            onClick={() => onAction(content, 'select')}
            className="bg-white/90 text-black hover:bg-white"
          >
            <Play className="w-4 h-4 mr-1" />
            Start
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm line-clamp-2 flex-1">{content.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAction(content, 'bookmark')}
              className="ml-2 flex-shrink-0"
            >
              <Heart className={cn("w-4 h-4", content.isBookmarked && "fill-red-500 text-red-500")} />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">{content.description}</p>
          
          {/* Recommendation reasons */}
          <div className="flex flex-wrap gap-1">
            {content.recommendationReasons.slice(0, 2).map(reason => (
              <Badge key={reason.type} variant="outline" className="text-xs">
                {reason.explanation}
              </Badge>
            ))}
          </div>
          
          {/* Skills */}
          <div className="flex flex-wrap gap-1">
            {content.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
          
          {/* Rating and completion */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>{content.userRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{content.completionRate}% complete</span>
            </div>
          </div>
          
          {/* Learning gain estimate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Learning potential</span>
              <span className="font-medium">{content.estimatedLearningGain}%</span>
            </div>
            <Progress value={content.estimatedLearningGain} className="h-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Recommendation List Item Component
interface RecommendationListItemProps {
  content: RecommendedContent;
  onAction: (content: RecommendedContent, action: 'select' | 'bookmark' | 'feedback') => void;
}

const RecommendationListItem: React.FC<RecommendationListItemProps> = ({ content, onAction }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative w-32 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
            <img 
              src={content.thumbnailUrl} 
              alt={content.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
              {content.duration}m
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1 line-clamp-1">{content.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{content.description}</p>
                
                {/* Top recommendation reasons */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {content.recommendationReasons.slice(0, 3).map(reason => (
                    <Badge key={reason.type} variant="outline" className="text-xs">
                      {reason.explanation}
                    </Badge>
                  ))}
                </div>
                
                {/* Metrics */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {content.userRating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {Math.round(content.recommendationScore)}% match
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {content.estimatedLearningGain}% gain
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {content.difficulty}
                  </Badge>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAction(content, 'bookmark')}
                >
                  <Heart className={cn("w-4 h-4", content.isBookmarked && "fill-red-500 text-red-500")} />
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onAction(content, 'select')}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Learning Paths Section Component
interface LearningPathsSectionProps {
  paths: LearningPathSuggestion[];
  onPathSelect?: (path: LearningPathSuggestion) => void;
  profile: PersonalizationProfile | null;
}

const LearningPathsSection: React.FC<LearningPathsSectionProps> = ({ paths, onPathSelect, profile }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Personalized Learning Paths</h2>
        <p className="text-muted-foreground">Structured journeys to achieve your learning goals</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paths.map(path => (
          <LearningPathCard
            key={path.id}
            path={path}
            profile={profile}
            onSelect={() => onPathSelect?.(path)}
          />
        ))}
      </div>
    </div>
  );
};

// Learning Path Card Component
interface LearningPathCardProps {
  path: LearningPathSuggestion;
  profile: PersonalizationProfile | null;
  onSelect: () => void;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ path, profile, onSelect }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{path.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
          </div>
          <Badge className={getDifficultyColor(path.difficulty)}>
            {path.difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Success prediction */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Success prediction</span>
              <span className="font-medium">{path.successPrediction}%</span>
            </div>
            <Progress value={path.successPrediction} className="h-2" />
          </div>
          
          {/* Path details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Duration</div>
              <div>{path.estimatedWeeks} weeks</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Milestones</div>
              <div>{path.milestones.length} checkpoints</div>
            </div>
          </div>
          
          {/* Target skills */}
          <div>
            <div className="font-medium text-sm mb-2">Target Skills</div>
            <div className="flex flex-wrap gap-1">
              {path.targetSkills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Milestones preview */}
          <div>
            <div className="font-medium text-sm mb-2">Learning Journey</div>
            <div className="space-y-1">
              {path.milestones.slice(0, 3).map(milestone => (
                <div key={milestone.id} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Week {milestone.week}: {milestone.title}</span>
                </div>
              ))}
              {path.milestones.length > 3 && (
                <div className="text-xs text-muted-foreground ml-3.5">
                  +{path.milestones.length - 3} more milestones
                </div>
              )}
            </div>
          </div>
          
          <Button onClick={onSelect} className="w-full">
            <MapPin className="w-4 h-4 mr-2" />
            Start Learning Path
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Trending Content Component
interface TrendingContentProps {
  recommendations: RecommendedContent[];
  onContentAction: (content: RecommendedContent, action: 'select' | 'bookmark' | 'feedback') => void;
}

const TrendingContent: React.FC<TrendingContentProps> = ({ recommendations, onContentAction }) => {
  const trendingContent = recommendations
    .sort((a, b) => b.userRating - a.userRating)
    .slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Trending Now</h2>
        <p className="text-muted-foreground">Popular content that kids love</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trendingContent.map((content, index) => (
          <div key={content.id} className="relative">
            {index < 3 && (
              <div className="absolute -top-2 -left-2 z-10">
                <Badge className="bg-yellow-500 text-white">
                  #{index + 1}
                </Badge>
              </div>
            )}
            <RecommendationCard content={content} onAction={onContentAction} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading Skeleton Component
const RecommendationLoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-muted" />
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="flex gap-1">
                <div className="h-5 bg-muted rounded w-16" />
                <div className="h-5 bg-muted rounded w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Mock data generators
const generateMockProfile = (childId: string): PersonalizationProfile => ({
  childId,
  age: 54, // 4.5 years
  interests: ['animals', 'colors', 'music', 'stories'],
  learningStyle: 'visual',
  skillLevels: {
    mathematics: 6,
    reading: 5,
    motor: 7,
    social: 6,
    creativity: 8
  },
  attentionSpan: 15,
  preferredDifficulty: 'medium',
  optimalSessionLength: 12,
  strugglingAreas: ['counting beyond 10', 'letter sounds'],
  strengthAreas: ['pattern recognition', 'color identification'],
  completedContent: ['animal-safari-1', 'color-rainbow-2'],
  recentPerformance: [],
  socialPreferences: 'mixed',
  parentGoals: ['improve math skills', 'develop reading readiness']
});

const generateMockRecommendations = (profile: PersonalizationProfile): RecommendedContent[] => {
  const mockContent = [
    {
      id: 'counting-adventure',
      title: 'Counting Adventure with Friends',
      description: 'Join cute animals on a counting journey from 1 to 20',
      type: 'activity' as const,
      category: 'Mathematics',
      thumbnailUrl: '/api/placeholder/300/200',
      duration: 15,
      difficulty: 'medium' as const,
      ageRange: '4-6 years',
      skills: ['counting', 'number recognition', 'sequencing'],
      tags: ['animals', 'numbers', 'interactive'],
      learningObjectives: ['Count objects 1-20', 'Recognize numerals', 'Understand number sequences'],
      completionRate: 78,
      userRating: 4.6,
      isBookmarked: false,
      isCompleted: false,
      estimatedLearningGain: 85,
      adaptationSuggestions: ['Use visual aids', 'Break into smaller segments'],
      recommendationReasons: [
        {
          type: 'skill_level',
          explanation: 'Perfect for your math level',
          strength: 90,
          icon: 'target'
        },
        {
          type: 'interest',
          explanation: 'Features your favorite animals',
          strength: 85,
          icon: 'heart'
        }
      ],
      recommendationScore: 92
    },
    {
      id: 'letter-sounds-game',
      title: 'Letter Sounds Explorer',
      description: 'Discover letter sounds through fun mini-games and songs',
      type: 'game' as const,
      category: 'Reading',
      thumbnailUrl: '/api/placeholder/300/200',
      duration: 12,
      difficulty: 'easy' as const,
      ageRange: '3-5 years',
      skills: ['phonics', 'letter recognition', 'listening'],
      tags: ['letters', 'sounds', 'music'],
      learningObjectives: ['Learn letter sounds', 'Recognize letter shapes', 'Connect sounds to letters'],
      completionRate: 65,
      userRating: 4.3,
      isBookmarked: true,
      isCompleted: false,
      estimatedLearningGain: 75,
      adaptationSuggestions: ['Repeat sections as needed', 'Use headphones for better audio'],
      recommendationReasons: [
        {
          type: 'learning_style',
          explanation: 'Great for visual learners',
          strength: 80,
          icon: 'eye'
        },
        {
          type: 'difficulty',
          explanation: 'Just right challenge level',
          strength: 85,
          icon: 'target'
        }
      ],
      recommendationScore: 88
    }
  ];

  return mockContent;
};

const generateMockLearningPaths = (profile: PersonalizationProfile): LearningPathSuggestion[] => [
  {
    id: 'math-foundations',
    title: 'Math Foundations Journey',
    description: 'Build strong number sense and counting skills',
    estimatedWeeks: 6,
    targetSkills: ['counting', 'number recognition', 'basic addition'],
    difficulty: 'intermediate',
    prerequisites: ['basic counting to 5'],
    recommendedContent: ['counting-adventure', 'number-garden', 'math-puzzles'],
    adaptiveAdjustments: ['Visual support', 'Extra practice time'],
    successPrediction: 87,
    milestones: [
      {
        id: 'm1',
        title: 'Count to 10',
        description: 'Master counting from 1 to 10',
        week: 1,
        skills: ['counting', 'one-to-one correspondence'],
        activities: ['counting-train', 'animal-counting'],
        assessmentCriteria: ['accuracy', 'fluency', 'understanding']
      },
      {
        id: 'm2',
        title: 'Number Recognition',
        description: 'Recognize and name numbers 1-10',
        week: 3,
        skills: ['number recognition', 'visual discrimination'],
        activities: ['number-matching', 'number-hunt'],
        assessmentCriteria: ['speed', 'accuracy', 'confidence']
      }
    ]
  }
];

export default RecommendationEngine;