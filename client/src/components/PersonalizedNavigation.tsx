import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '@/stores/navigationStore';
import PersonalizationService from '@/services/PersonalizationService';
import { Activity, Child } from '@/types/learning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  TrendingUp, 
  Clock, 
  Target, 
  Lightbulb,
  ArrowRight,
  Sparkles,
  Brain,
  Heart
} from 'lucide-react';

interface PersonalizedNavigationProps {
  child: Child;
  className?: string;
}

interface RecommendationCardProps {
  activity: Activity;
  score: number;
  reasons: string[];
  confidence: number;
  onSelect: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  activity,
  score,
  reasons,
  confidence,
  onSelect
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={onSelect}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activity.icon || '📖'}</span>
              <div>
                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                  {activity.title}
                </CardTitle>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {activity.category}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      confidence > 0.8 ? 'border-green-300 text-green-700' :
                      confidence > 0.6 ? 'border-yellow-300 text-yellow-700' :
                      'border-gray-300 text-gray-600'
                    }`}
                  >
                    {Math.round(confidence * 100)}% match
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{(score * 5).toFixed(1)}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {activity.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{activity.estimatedDuration || 15} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>Level {activity.difficultyLevel}</span>
              </div>
            </div>
            
            {reasons.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-medium">Why recommended:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {reasons.slice(0, 2).map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                      {reason}
                    </Badge>
                  ))}
                  {reasons.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{reasons.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Button size="sm" className="w-full mt-3 group-hover:bg-primary/90 transition-colors">
            Start Activity
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PersonalizedNavigation: React.FC<PersonalizedNavigationProps> = ({
  child,
  className = ""
}) => {
  const { 
    availableActivities, 
    navigateTo, 
    quickAccess,
    updateQuickAccess,
    currentPath
  } = useNavigationStore();
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [navigationSuggestions, setNavigationSuggestions] = useState<any[]>([]);
  const [personalizedQuickAccess, setPersonalizedQuickAccess] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [personalizationService] = useState(() => PersonalizationService.getInstance());

  useEffect(() => {
    initializePersonalization();
  }, [child.id, availableActivities]);

  useEffect(() => {
    updateContextualSuggestions();
  }, [currentPath, child.id]);

  const initializePersonalization = async () => {
    if (!child || availableActivities.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // Initialize user profile
      personalizationService.initializeUserProfile(child);
      
      // Generate recommendations
      const recs = await personalizationService.generateRecommendations(
        child.id,
        availableActivities
      );
      
      // Get activities with their recommendation data
      const recommendationsWithActivities = recs
        .slice(0, 6) // Show top 6 recommendations
        .map(rec => {
          const activity = availableActivities.find(a => a.id === rec.activityId);
          return activity ? { ...rec, activity } : null;
        })
        .filter(Boolean);
      
      setRecommendations(recommendationsWithActivities);
      
      // Generate personalized quick access
      const quickAccessItems = await personalizationService.generateQuickAccess(
        child.id,
        availableActivities
      );
      setPersonalizedQuickAccess(quickAccessItems);
      
    } catch (error) {
      console.error('Error initializing personalization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContextualSuggestions = () => {
    if (!child || availableActivities.length === 0) return;
    
    const suggestions = personalizationService.generateNavigationSuggestions(
      child.id,
      currentPath,
      availableActivities
    );
    
    setNavigationSuggestions(suggestions);
  };

  const handleActivitySelect = (activity: Activity) => {
    // Track the navigation
    personalizationService.updateFavoriteCategories(child.id, activity.category);
    
    // Navigate to activity
    navigateTo({
      id: activity.id,
      title: activity.title,
      path: `/activity/${activity.id}`,
      icon: activity.icon
    });
  };

  const handleQuickAccessClick = (item: any) => {
    navigateTo({
      id: item.id,
      title: item.title,
      path: item.path,
      icon: item.icon
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Personalized Quick Access */}
      {personalizedQuickAccess.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Quick Access for {child.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <AnimatePresence>
                {personalizedQuickAccess.slice(0, 4).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-primary/5"
                      onClick={() => handleQuickAccessClick(item)}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs text-center leading-tight">{item.title}</span>
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI Recommendations</CardTitle>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Heart className="h-3 w-3" />
                Personalized
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {recommendations.map((rec, index) => (
                  <RecommendationCard
                    key={rec.activityId}
                    activity={rec.activity}
                    score={rec.score}
                    reasons={rec.reasons}
                    confidence={rec.confidence}
                    onSelect={() => handleActivitySelect(rec.activity)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contextual Suggestions */}
      {navigationSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">What's Next?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {navigationSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto"
                      onClick={() => navigateTo(suggestion)}
                    >
                      <span className="text-lg mr-3">{suggestion.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{suggestion.title}</div>
                        {suggestion.tags && (
                          <div className="flex gap-1 mt-1">
                            {suggestion.tags.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-50" />
                    </Button>
                    {index < navigationSuggestions.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Learning Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {personalizationService.getUserPreferences(child.id)?.completedActivities.length || 0}
              </div>
              <div className="text-sm text-blue-600 font-medium">Activities Completed</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {personalizationService.getUserPreferences(child.id)?.favoriteCategories.length || 0}
              </div>
              <div className="text-sm text-green-600 font-medium">Favorite Topics</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(personalizationService.getUserPreferences(child.id)?.avgSessionTime || 0)}m
              </div>
              <div className="text-sm text-purple-600 font-medium">Avg Session Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedNavigation;