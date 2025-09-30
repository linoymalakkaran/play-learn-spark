import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useContent, ContentItem, ContentRecommendation } from '@/hooks/useContent';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useProgress } from '@/hooks/useProgress';
import { Child } from '@/types/learning';
import { Gamepad2, BookOpen, FileText, Star, Clock, TrendingUp, Brain, Target, Lightbulb, Zap, Award, ChevronRight, Play, Pause, RotateCcw, Settings, Filter, SortAsc, Heart, Bookmark, MoreHorizontal } from 'lucide-react';

interface AdaptiveContentEngineProps {
  child: Child;
  onContentSelect?: (content: ContentItem) => void;
  onClose?: () => void;
}

const AdaptiveContentEngine: React.FC<AdaptiveContentEngineProps> = ({ 
  child, 
  onContentSelect, 
  onClose 
}) => {
  const { 
    getRecommendations, 
    getPersonalizedContent, 
    adaptContentDifficulty, 
    getOptimalDifficulty,
    getContent,
    trackContentUsage 
  } = useContent();

  const { 
    getPersonalizedSettings, 
    trackBehavior, 
    getProfile 
  } = usePersonalization();

  const { getChildProgress } = useProgress();

  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [personalizedContent, setPersonalizedContent] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [difficultyOverride, setDifficultyOverride] = useState<number | null>(null);
  const [contentType, setContentType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [filterByInterest, setFilterByInterest] = useState(true);

  const profile = getProfile(child.id);
  const settings = getPersonalizedSettings(child.id);
  const progress = getChildProgress(child.id);

  useEffect(() => {
    loadRecommendations();
    loadPersonalizedContent();
  }, [child.id, contentType, adaptiveMode, filterByInterest]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const recs = await getRecommendations(child, 12);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPersonalizedContent = async () => {
    try {
      const content = await getPersonalizedContent(
        child, 
        contentType === 'all' ? undefined : contentType
      );
      setPersonalizedContent(content);
    } catch (error) {
      console.error('Failed to load personalized content:', error);
    }
  };

  const handleContentSelection = (contentId: string) => {
    const difficulty = difficultyOverride || getOptimalDifficulty(child, contentId);
    const content = getContent(contentId, settings.language, difficulty);
    
    if (content) {
      setSelectedContent(content);
      
      // Track behavior
      trackBehavior(child.id, 'content_selection', {
        contentId,
        contentType: content.type,
        difficulty,
        recommendationType: 'adaptive'
      });
    }
  };

  const handleStartContent = () => {
    if (selectedContent && onContentSelect) {
      // Track content usage start
      trackContentUsage(selectedContent.id, child.id, {
        startTime: Date.now(),
        endTime: 0,
        completed: false,
        attempts: 1,
        hintsUsed: 0,
        timeSpent: 0,
        difficultyUsed: selectedContent.metadata.difficulty,
        interactions: 0,
        errors: 0
      });

      onContentSelect(selectedContent);
      setSelectedContent(null);
    }
  };

  const getContentTypeIcon = (type: string) => {
    const icons = {
      activity: <Gamepad2 className="h-4 w-4" />,
      lesson: <BookOpen className="h-4 w-4" />,
      story: <FileText className="h-4 w-4" />,
      quiz: <Target className="h-4 w-4" />,
      game: <Gamepad2 className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
  };

  const getRecommendationTypeIcon = (type: string) => {
    const icons = {
      'skill-based': <Brain className="h-4 w-4 text-blue-500" />,
      'interest-based': <Heart className="h-4 w-4 text-pink-500" />,
      'sequential': <TrendingUp className="h-4 w-4 text-green-500" />,
      'review': <RotateCcw className="h-4 w-4 text-orange-500" />,
      'challenge': <Zap className="h-4 w-4 text-purple-500" />,
      'cultural': <Star className="h-4 w-4 text-yellow-500" />
    };
    return icons[type as keyof typeof icons] || <Lightbulb className="h-4 w-4" />;
  };

  const getSuccessColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (contentType !== 'all') {
      const content = getContent(rec.contentId);
      if (!content || content.type !== contentType) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Adaptive Content Engine
            </h1>
            <p className="text-gray-600">
              AI-powered personalized learning for {child.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="adaptive-mode">Adaptive Mode</Label>
              <Switch
                id="adaptive-mode"
                checked={adaptiveMode}
                onCheckedChange={setAdaptiveMode}
              />
            </div>
            {onClose && (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Learning Style</p>
                  <p className="text-lg font-semibold capitalize">
                    {profile?.learningStyle.primary || 'Visual'}
                  </p>
                </div>
                <Brain className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Optimal Difficulty</p>
                  <p className="text-lg font-semibold">
                    Level {Math.floor((progress?.englishLevel + progress?.mathLevel) / 2) || 3}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Session Length</p>
                  <p className="text-lg font-semibold">
                    {profile?.behaviorPatterns.sessionLength || 15} min
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recommendations</p>
                  <p className="text-lg font-semibold">{recommendations.length}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label>Content Type:</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="activity">Activities</SelectItem>
                    <SelectItem value="lesson">Lessons</SelectItem>
                    <SelectItem value="story">Stories</SelectItem>
                    <SelectItem value="quiz">Quizzes</SelectItem>
                    <SelectItem value="game">Games</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label>Difficulty Override:</Label>
                <Select 
                  value={difficultyOverride?.toString() || ''} 
                  onValueChange={(value) => setDifficultyOverride(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Auto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Auto</SelectItem>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="filter-interest">Interest-Based</Label>
                <Switch
                  id="filter-interest"
                  checked={filterByInterest}
                  onCheckedChange={setFilterByInterest}
                />
              </div>

              <Button onClick={loadRecommendations} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="personalized">Personalized Content</TabsTrigger>
            <TabsTrigger value="adaptive">Adaptive Settings</TabsTrigger>
          </TabsList>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((rec) => {
                const content = getContent(rec.contentId);
                if (!content) return null;

                const difficulty = rec.adaptedDifficulty || content.metadata.difficulty;
                const adaptedContent = adaptContentDifficulty(content.id, difficulty);

                return (
                  <Card 
                    key={rec.contentId} 
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleContentSelection(rec.contentId)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getContentTypeIcon(content.type)}
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                            {adaptedContent?.title || content.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getRecommendationTypeIcon(rec.type)}
                          <Badge 
                            variant="outline" 
                            className={`${getSuccessColor(rec.estimatedSuccess)} border-0`}
                          >
                            {rec.estimatedSuccess}%
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {adaptedContent?.description || content.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Difficulty: {difficulty}/5</span>
                          <span>{content.estimatedDuration} min</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Success Probability</span>
                            <span>{rec.estimatedSuccess}%</span>
                          </div>
                          <Progress value={rec.estimatedSuccess} className="h-2" />
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {rec.reasons.slice(0, 2).map((reason, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                          {rec.reasons.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{rec.reasons.length - 2}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Badge 
                            variant="outline" 
                            className="capitalize"
                          >
                            {rec.type.replace('-', ' ')}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredRecommendations.length === 0 && !isLoading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Lightbulb className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No recommendations found
                  </h3>
                  <p className="text-gray-500 text-center mb-4">
                    Try adjusting your filters or let the AI analyze more data.
                  </p>
                  <Button onClick={loadRecommendations}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refresh Recommendations
                  </Button>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Personalized Content Tab */}
          <TabsContent value="personalized" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalizedContent.map((content) => (
                <Card 
                  key={content.id} 
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleContentSelection(content.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getContentTypeIcon(content.type)}
                        <CardTitle className="text-lg">{content.title}</CardTitle>
                      </div>
                      <Badge variant="outline">
                        Level {content.metadata.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {content.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{content.metadata.subject}</span>
                        <span>{content.estimatedDuration} min</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {content.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {content.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{content.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-500">Personalized</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Adaptive Settings Tab */}
          <TabsContent value="adaptive" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Difficulty Adaptation</CardTitle>
                  <CardDescription>
                    How the system adapts content difficulty
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Skill Level</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>English: Level {progress?.englishLevel || 3}</span>
                        <span>Math: Level {progress?.mathLevel || 3}</span>
                      </div>
                      <Progress value={(progress?.englishLevel || 3) * 20} />
                      <Progress value={(progress?.mathLevel || 3) * 20} />
                    </div>
                  </div>

                  <div>
                    <Label>Adaptation Strategy</Label>
                    <Select 
                      value={profile?.adaptiveSettings.difficultyAdjustment || 'automatic'}
                      onValueChange={(value) => {
                        // Update profile settings
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="assisted">Assisted</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Preferences</CardTitle>
                  <CardDescription>
                    Based on engagement patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.contentAffinities.favoriteTypes.map((type) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getContentTypeIcon(type)}
                        <span className="capitalize">{type}</span>
                      </div>
                      <Badge variant="outline">Preferred</Badge>
                    </div>
                  ))}
                  
                  {(!profile?.contentAffinities.favoriteTypes || profile.contentAffinities.favoriteTypes.length === 0) && (
                    <p className="text-sm text-gray-500">
                      No preferences detected yet. Play more activities to help the AI learn your preferences.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Learning Analytics</CardTitle>
                <CardDescription>
                  Performance insights and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile?.learningStyle.confidence ? 
                        (profile.learningStyle.confidence * 100).toFixed(0) : 70}%
                    </div>
                    <p className="text-sm text-gray-500">Learning Style Confidence</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {progress?.currentStreak || 0}
                    </div>
                    <p className="text-sm text-gray-500">Day Streak</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {recommendations.length}
                    </div>
                    <p className="text-sm text-gray-500">Active Recommendations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Content Preview Dialog */}
        {selectedContent && (
          <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {getContentTypeIcon(selectedContent.type)}
                  <span>{selectedContent.title}</span>
                </DialogTitle>
                <DialogDescription>
                  {selectedContent.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {selectedContent.type}
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span> {selectedContent.metadata.difficulty}/5
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {selectedContent.estimatedDuration} min
                  </div>
                  <div>
                    <span className="font-medium">Subject:</span> {selectedContent.metadata.subject}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Learning Objectives:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedContent.learningObjectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Target className="h-3 w-3 mt-1 text-blue-500" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-1">
                  {selectedContent.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedContent(null)}>
                  Cancel
                </Button>
                <Button onClick={handleStartContent}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Activity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdaptiveContentEngine;