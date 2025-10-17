/**
 * Recommendation Display Component
 * Displays recommended content with detailed information and interaction options
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star,
  Clock,
  Target,
  Brain,
  Heart,
  TrendingUp,
  Sparkles,
  Play,
  BookOpen,
  Award,
  Users,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Eye,
  ChevronRight,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecommendedContent, RecommendationReason } from '@/types/recommendation.types';

interface RecommendationDisplayProps {
  recommendations: RecommendedContent[];
  onContentSelect?: (content: RecommendedContent) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const getTypeIcon = (type: string) => {
  const icons = {
    activity: <Lightbulb className="h-4 w-4" />,
    story: <BookOpen className="h-4 w-4" />,
    game: <Play className="h-4 w-4" />,
    video: <Eye className="h-4 w-4" />,
    lesson: <Brain className="h-4 w-4" />
  };
  return icons[type as keyof typeof icons] || <Sparkles className="h-4 w-4" />;
};

const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    hard: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getReasonIcon = (type: string) => {
  const icons = {
    age_match: <Target className="h-3 w-3" />,
    skill_level: <TrendingUp className="h-3 w-3" />,
    interest: <Heart className="h-3 w-3" />,
    learning_style: <Brain className="h-3 w-3" />,
    difficulty: <Sparkles className="h-3 w-3" />,
    social: <Users className="h-3 w-3" />,
    trending: <TrendingUp className="h-3 w-3" />
  };
  return icons[type as keyof typeof icons] || <Star className="h-3 w-3" />;
};

const RecommendationCard: React.FC<{
  content: RecommendedContent;
  onSelect?: (content: RecommendedContent) => void;
  viewMode: 'grid' | 'list';
}> = ({ content, onSelect, viewMode }) => {
  const [isBookmarked, setIsBookmarked] = React.useState(content.isBookmarked);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    // Here you would typically update the bookmark status in your backend
  };

  const topReasons = content.recommendationReasons
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3);

  if (viewMode === 'list') {
    return (
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer group"
        onClick={() => onSelect?.(content)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                {getTypeIcon(content.type)}
              </div>
            </div>

            {/* Content Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-primary">
                    {content.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                    {content.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-2">
                  <Badge variant="outline" className="text-xs">
                    {content.recommendationScore}% match
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={handleBookmark}
                  >
                    {isBookmarked ? 
                      <BookmarkCheck className="h-4 w-4 text-primary" /> :
                      <Bookmark className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {content.duration} min
                </div>
                <Badge className={cn("text-xs", getDifficultyColor(content.difficulty))}>
                  {content.difficulty}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {content.userRating.toFixed(1)}
                </div>
              </div>

              {/* Top Reasons */}
              <div className="flex gap-2 mb-2">
                {topReasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs"
                  >
                    {getReasonIcon(reason.type)}
                    <span>{reason.explanation}</span>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1">
                {content.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {content.skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{content.skills.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0 flex items-center">
              <Button className="group-hover:bg-primary group-hover:text-primary-foreground">
                Start
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
      onClick={() => onSelect?.(content)}
    >
      <div className="relative">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          {getTypeIcon(content.type)}
          {content.isCompleted && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-green-600 text-white">
                ✓ Completed
              </Badge>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
            onClick={handleBookmark}
          >
            {isBookmarked ? 
              <BookmarkCheck className="h-4 w-4 text-primary" /> :
              <Bookmark className="h-4 w-4" />
            }
          </Button>
        </div>

        {/* Recommendation Score */}
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-primary text-primary-foreground">
            {content.recommendationScore}% match
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title and Rating */}
          <div>
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary line-clamp-1">
              {content.title}
            </h3>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {content.duration} min
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {content.userRating.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-2">
            {content.description}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", getDifficultyColor(content.difficulty))}>
              {content.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {content.category}
            </Badge>
          </div>

          {/* Top Reason */}
          {topReasons.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {getReasonIcon(topReasons[0].type)}
              <span>{topReasons[0].explanation}</span>
            </div>
          )}

          {/* Skills */}
          <div className="flex flex-wrap gap-1">
            {content.skills.slice(0, 2).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {content.skills.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{content.skills.length - 2}
              </Badge>
            )}
          </div>

          {/* Progress Bar for completed content */}
          {content.isCompleted && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Completion</span>
                <span>{content.completionRate}%</span>
              </div>
              <Progress value={content.completionRate} className="h-2" />
            </div>
          )}

          {/* Action Button */}
          <Button 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(content);
            }}
          >
            {content.isCompleted ? 'Review' : 'Start'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({
  recommendations,
  onContentSelect,
  viewMode = 'grid',
  className
}) => {
  if (recommendations.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms to discover more content.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Recommended for You ({recommendations.length})
        </h2>
      </div>

      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
      )}>
        {recommendations.map((content) => (
          <RecommendationCard
            key={content.id}
            content={content}
            onSelect={onContentSelect}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};