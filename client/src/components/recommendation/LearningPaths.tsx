/**
 * Learning Paths Component
 * Displays personalized learning paths with milestones and progress tracking
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin,
  Calendar,
  Target,
  Award,
  CheckCircle,
  Circle,
  Clock,
  TrendingUp,
  Users,
  ChevronRight,
  Star,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LearningPathSuggestion, PathMilestone } from '@/types/recommendation.types';

interface LearningPathsProps {
  paths: LearningPathSuggestion[];
  onPathSelect?: (path: LearningPathSuggestion) => void;
  className?: string;
}

const getDifficultyColor = (difficulty: string) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const MilestoneCard: React.FC<{
  milestone: PathMilestone;
  isCompleted: boolean;
  isCurrent: boolean;
}> = ({ milestone, isCompleted, isCurrent }) => {
  return (
    <div className={cn(
      "flex gap-3 p-3 rounded-lg border transition-colors",
      isCurrent ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-muted",
      isCompleted && "bg-green-50 border-green-200"
    )}>
      <div className="flex-shrink-0 mt-1">
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : isCurrent ? (
          <Circle className="h-5 w-5 text-primary" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={cn(
            "font-medium text-sm",
            isCurrent && "text-primary",
            isCompleted && "text-green-700"
          )}>
            {milestone.title}
          </h4>
          <Badge variant="outline" className="text-xs">
            Week {milestone.week}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground mb-2">
          {milestone.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {milestone.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {milestone.skills.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{milestone.skills.length - 3}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const LearningPathCard: React.FC<{
  path: LearningPathSuggestion;
  onSelect?: (path: LearningPathSuggestion) => void;
}> = ({ path, onSelect }) => {
  // Mock completion data - in real app, this would come from user progress
  const completedMilestones = Math.floor(path.milestones.length * 0.3); // 30% completed
  const currentMilestone = completedMilestones;
  const progressPercentage = (completedMilestones / path.milestones.length) * 100;

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary line-clamp-1">
              {path.title}
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {path.description}
            </p>
          </div>
          <div className="ml-2 text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              <span>{path.successPrediction}% success</span>
            </div>
            <Badge className={cn("text-xs", getDifficultyColor(path.difficulty))}>
              {path.difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Path Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{path.estimatedWeeks} weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>{path.targetSkills.length} skills</span>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedMilestones}/{path.milestones.length} milestones
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-1" />
          <p className="text-xs text-muted-foreground">
            {progressPercentage.toFixed(0)}% complete
          </p>
        </div>

        {/* Target Skills */}
        <div>
          <h4 className="text-sm font-medium mb-2">Target Skills</h4>
          <div className="flex flex-wrap gap-1">
            {path.targetSkills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {path.targetSkills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{path.targetSkills.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {/* Next Milestone Preview */}
        {currentMilestone < path.milestones.length && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Next Milestone
            </h4>
            <MilestoneCard
              milestone={path.milestones[currentMilestone]}
              isCompleted={false}
              isCurrent={true}
            />
          </div>
        )}

        {/* Action Button */}
        <Button 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(path);
          }}
        >
          {progressPercentage > 0 ? 'Continue Path' : 'Start Path'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

const PathDetailView: React.FC<{
  path: LearningPathSuggestion;
  onBack: () => void;
}> = ({ path, onBack }) => {
  // Mock completion data
  const completedMilestones = Math.floor(path.milestones.length * 0.3);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2 -ml-2">
            ← Back to Paths
          </Button>
          <h1 className="text-2xl font-bold">{path.title}</h1>
          <p className="text-muted-foreground mt-1">{path.description}</p>
        </div>
        <Badge className={cn("text-sm", getDifficultyColor(path.difficulty))}>
          {path.difficulty}
        </Badge>
      </div>

      {/* Path Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Path Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{path.estimatedWeeks}</div>
              <div className="text-sm text-muted-foreground">Weeks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{path.successPrediction}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{path.milestones.length}</div>
              <div className="text-sm text-muted-foreground">Milestones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{path.targetSkills.length}</div>
              <div className="text-sm text-muted-foreground">Skills</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {path.milestones.map((milestone, index) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                isCompleted={index < completedMilestones}
                isCurrent={index === completedMilestones}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites & Adaptations */}
      <div className="grid md:grid-cols-2 gap-6">
        {path.prerequisites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {path.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {path.adaptiveAdjustments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {path.adaptiveAdjustments.map((adjustment, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {adjustment}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export const LearningPaths: React.FC<LearningPathsProps> = ({
  paths,
  onPathSelect,
  className
}) => {
  const [selectedPath, setSelectedPath] = React.useState<LearningPathSuggestion | null>(null);

  if (selectedPath) {
    return (
      <PathDetailView
        path={selectedPath}
        onBack={() => setSelectedPath(null)}
      />
    );
  }

  if (paths.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No learning paths available</h3>
        <p className="text-muted-foreground">
          Complete more activities to unlock personalized learning paths.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Learning Paths ({paths.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paths.map((path) => (
          <LearningPathCard
            key={path.id}
            path={path}
            onSelect={(path) => {
              setSelectedPath(path);
              onPathSelect?.(path);
            }}
          />
        ))}
      </div>
    </div>
  );
};