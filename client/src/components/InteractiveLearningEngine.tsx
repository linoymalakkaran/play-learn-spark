import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import InteractiveActivityPlayer from './InteractiveActivityPlayer';
import ActivityCompletionStatus from './ActivityCompletionStatus';
import { InteractiveActivity, ACTIVITY_TEMPLATES } from '@/types/ActivityTemplates';

import { 
  Play, 
  BookOpen, 
  Gamepad2, 
  Star, 
  Trophy, 
  Clock,
  Target,
  Zap,
  Brain,
  Sparkles,
  RotateCcw,
  Search,
  TrendingUp,
  Award,
  Volume2,
  Video,
  Headphones,
  GamepadIcon,
  FileText,
  CheckCircle2,
  Rocket,
  Crown,
  Medal
} from 'lucide-react';

interface LearningEngineProps {
  studentId: number;
  currentClass?: string;
  onActivityComplete?: (activityId: string, score: number, timeSpent: number) => void;
  onProgressUpdate?: (studentId: number, progress: any) => void;
}

interface ActivityWithProgress {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ageMin: number;
  ageMax: number;
  contentType: 'interactive' | 'video' | 'audio' | 'game' | 'quiz' | 'story';
  contentData: any;
  contentAssets: any;
  objectives: string[];
  instructions: string;
  duration: number;
  points: number;
  prerequisites: number[];
  tags: string[];
  popularity: number;
  rating: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  completion?: {
    id: number;
    score: number;
    completed: boolean;
    timeSpent: number;
    attempts: number;
    completedAt?: Date;
  };
}

interface StudentProgress {
  totalActivitiesCompleted: number;
  totalTimeSpent: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  badges: string[];
  recentActivities: string[];
}

const InteractiveLearningEngine: React.FC<LearningEngineProps> = ({
  studentId,
  currentClass,
  onActivityComplete,
  onProgressUpdate
}) => {
  // Core State
  const [activities, setActivities] = useState<ActivityWithProgress[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<InteractiveActivity | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [studentProgress, setStudentProgress] = useState<StudentProgress>({
    totalActivitiesCompleted: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    experience: 0,
    badges: [],
    recentActivities: []
  });

  // Filter and Search State
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    contentType: 'all',
    language: 'all',
    completed: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'difficulty' | 'rating' | 'popularity' | 'duration'>('title');

  // UI State
  const [activeTab, setActiveTab] = useState<'discover' | 'progress' | 'achievements'>('discover');
  const [isLoading, setIsLoading] = useState(true);

  // Load activities and student progress
  useEffect(() => {
    loadActivities();
    loadStudentProgress();
  }, [studentId]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call - in real app, fetch from backend
      const mockActivities: ActivityWithProgress[] = [
        {
          id: 1,
          title: "🔤 Letter Detective",
          description: "Find and match letters like a super detective!",
          category: "alphabet",
          language: "en",
          difficulty: "easy",
          ageMin: 4,
          ageMax: 6,
          contentType: "interactive",
          contentData: { type: "letter_matching" },
          contentAssets: { images: [], audio: [], videos: [] },
          objectives: ["Recognize uppercase letters", "Match uppercase to lowercase"],
          instructions: "Drag the uppercase letters to match with their lowercase friends!",
          duration: 5,
          points: 10,
          prerequisites: [],
          tags: ["letters", "matching", "recognition"],
          popularity: 95,
          rating: 4.8,
          status: "published",
          completion: {
            id: 1,
            score: 8,
            completed: true,
            timeSpent: 420,
            attempts: 2,
            completedAt: new Date('2024-01-15')
          }
        },
        {
          id: 2,
          title: "🔢 Counting Safari",
          description: "Count animals and objects on your adventure!",
          category: "numbers",
          language: "en",
          difficulty: "easy",
          ageMin: 4,
          ageMax: 7,
          contentType: "game",
          contentData: { type: "counting_game" },
          contentAssets: { images: [], audio: [], videos: [] },
          objectives: ["Count objects 1-10", "Number recognition", "One-to-one correspondence"],
          instructions: "Count the objects and click the correct number!",
          duration: 7,
          points: 15,
          prerequisites: [],
          tags: ["counting", "numbers", "animals"],
          popularity: 92,
          rating: 4.9,
          status: "published"
        },
        {
          id: 3,
          title: "🔷 Shape Hunter",
          description: "Hunt for shapes hidden everywhere!",
          category: "shapes",
          language: "en",
          difficulty: "medium",
          ageMin: 5,
          ageMax: 8,
          contentType: "interactive",
          contentData: { type: "shape_recognition" },
          contentAssets: { images: [], audio: [], videos: [] },
          objectives: ["Identify basic shapes", "Classify shapes by properties"],
          instructions: "Drag each shape to its matching shadow!",
          duration: 6,
          points: 12,
          prerequisites: [],
          tags: ["shapes", "geometry", "visual"],
          popularity: 88,
          rating: 4.7,
          status: "published"
        },
        {
          id: 4,
          title: "🌈 Color Magic",
          description: "Mix and match colors to create magical combinations!",
          category: "colors",
          language: "en",
          difficulty: "easy",
          ageMin: 3,
          ageMax: 6,
          contentType: "interactive",
          contentData: { type: "color_mixing" },
          contentAssets: { images: [], audio: [], videos: [] },
          objectives: ["Identify primary colors", "Understand color mixing"],
          instructions: "Mix colors together to create new ones!",
          duration: 8,
          points: 18,
          prerequisites: [],
          tags: ["colors", "art", "creativity"],
          popularity: 85,
          rating: 4.6,
          status: "published"
        },
        {
          id: 5,
          title: "📚 Word Explorer",
          description: "Discover new words and their meanings!",
          category: "language",
          language: "en",
          difficulty: "medium",
          ageMin: 6,
          ageMax: 10,
          contentType: "quiz",
          contentData: { type: "vocabulary_builder" },
          contentAssets: { images: [], audio: [], videos: [] },
          objectives: ["Expand vocabulary", "Word-picture association", "Reading comprehension"],
          instructions: "Match each picture with the correct word!",
          duration: 10,
          points: 20,
          prerequisites: [1],
          tags: ["vocabulary", "reading", "words"],
          popularity: 78,
          rating: 4.5,
          status: "published"
        },
        {
          id: 6,
          title: "🎵 Music Makers",
          description: "Create beautiful music and learn about rhythm!",
          category: "music",
          language: "en",
          difficulty: "easy",
          ageMin: 4,
          ageMax: 8,
          contentType: "audio",
          contentData: { type: "music_creation" },
          contentAssets: { images: [], audio: [], videos: [] },
          objectives: ["Understand rhythm", "Create simple melodies", "Music appreciation"],
          instructions: "Tap the instruments to make music!",
          duration: 12,
          points: 25,
          prerequisites: [],
          tags: ["music", "rhythm", "creativity"],
          popularity: 82,
          rating: 4.7,
          status: "published"
        }
      ];

      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentProgress = async () => {
    try {
      // Simulate API call
      const mockProgress: StudentProgress = {
        totalActivitiesCompleted: 3,
        totalTimeSpent: 1800, // 30 minutes
        averageScore: 85,
        currentStreak: 3,
        longestStreak: 5,
        level: 2,
        experience: 350,
        badges: ['Letter Detective', 'Number Explorer', 'Shape Master'],
        recentActivities: ['Letter Detective', 'Counting Safari', 'Shape Hunter']
      };

      setStudentProgress(mockProgress);
    } catch (error) {
      console.error('Failed to load student progress:', error);
    }
  };

  // Filter and sort activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = filters.category === 'all' || activity.category === filters.category;
    const matchesDifficulty = filters.difficulty === 'all' || activity.difficulty === filters.difficulty;
    const matchesContentType = filters.contentType === 'all' || activity.contentType === filters.contentType;
    const matchesLanguage = filters.language === 'all' || activity.language === filters.language;
    const matchesCompleted = filters.completed === 'all' || 
                            (filters.completed === 'completed' && activity.completion?.completed) ||
                            (filters.completed === 'incomplete' && !activity.completion?.completed);

    return matchesSearch && matchesCategory && matchesDifficulty && matchesContentType && matchesLanguage && matchesCompleted;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      case 'rating':
        return b.rating - a.rating;
      case 'popularity':
        return b.popularity - a.popularity;
      case 'duration':
        return a.duration - b.duration;
      default:
        return a.title.localeCompare(b.title);
    }
  });

  const handleActivityStart = (activityId: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    // Convert to InteractiveActivity format
    const interactiveActivity: InteractiveActivity = {
      id: activity.id.toString(),
      title: activity.title,
      description: activity.description,
      type: 'multiple_choice', // Default type
      instructions: activity.instructions,
      questions: generateQuestionsForActivity(activity),
      rewards: {
        points: activity.points,
        badges: activity.category === 'alphabet' ? ['Letter Detective'] : 
                activity.category === 'numbers' ? ['Number Explorer'] : 
                activity.category === 'shapes' ? ['Shape Master'] : 
                activity.category === 'colors' ? ['Color Artist'] :
                activity.category === 'music' ? ['Music Maker'] :
                ['Learning Champion'],
        stickers: ['⭐', '🌟', '🎉'],
        celebrationMessage: `Amazing! You completed ${activity.title}! 🎊`
      },
      estimatedTime: activity.duration
    };

    setSelectedActivity(interactiveActivity);
    setIsPlaying(true);
  };

  const handleActivityComplete = (score: number, timeSpent: number) => {
    if (!selectedActivity) return;

    const activityId = parseInt(selectedActivity.id);
    
    // Update activity completion
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const attempts = (activity.completion?.attempts || 0) + 1;
        return {
          ...activity,
          completion: {
            id: Date.now(),
            score,
            completed: score >= 7, // 70% to complete
            timeSpent,
            attempts,
            completedAt: new Date()
          }
        };
      }
      return activity;
    }));

    // Update student progress
    setStudentProgress(prev => {
      const newProgress = {
        ...prev,
        totalActivitiesCompleted: score >= 7 ? prev.totalActivitiesCompleted + 1 : prev.totalActivitiesCompleted,
        totalTimeSpent: prev.totalTimeSpent + timeSpent,
        averageScore: Math.round(((prev.averageScore * prev.totalActivitiesCompleted) + (score * 10)) / (prev.totalActivitiesCompleted + 1)),
        currentStreak: score >= 7 ? prev.currentStreak + 1 : 0,
        longestStreak: Math.max(prev.longestStreak, score >= 7 ? prev.currentStreak + 1 : 0),
        experience: prev.experience + (score * 5),
        recentActivities: [selectedActivity.title, ...prev.recentActivities.slice(0, 4)]
      };

      // Level up logic
      const experienceThreshold = newProgress.level * 200;
      if (newProgress.experience >= experienceThreshold) {
        newProgress.level += 1;
        newProgress.badges = [...newProgress.badges, `Level ${newProgress.level}`];
      }

      return newProgress;
    });

    // Notify parent components
    onActivityComplete?.(selectedActivity.id, score, timeSpent);
    onProgressUpdate?.(studentId, studentProgress);

    setIsPlaying(false);
    setSelectedActivity(null);
  };

  const handleActivityClose = () => {
    setIsPlaying(false);
    setSelectedActivity(null);
  };

  // Generate mock questions for activities
  const generateQuestionsForActivity = (activity: ActivityWithProgress) => {
    // This would typically fetch from the activity's contentData
    // For demo purposes, generating based on category
    const template = ACTIVITY_TEMPLATES.find(t => t.category.includes(activity.category));
    if (template) {
      return template.generateActivity(activity.description).questions;
    }

    // Fallback generic questions
    return [
      {
        id: 'q1',
        type: 'multiple_choice' as const,
        question: `Let's practice with ${activity.title}!`,
        options: [
          { id: 'opt1', value: 'Option A', isCorrect: true },
          { id: 'opt2', value: 'Option B', isCorrect: false },
          { id: 'opt3', value: 'Option C', isCorrect: false }
        ],
        correctAnswer: 'Option A',
        feedback: {
          correct: 'Great job!',
          incorrect: 'Try again!',
          encouragement: 'Keep learning!'
        }
      }
    ];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'interactive': return <Gamepad2 className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      case 'game': return <GamepadIcon className="w-4 h-4" />;
      case 'quiz': return <Brain className="w-4 h-4" />;
      case 'story': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (isPlaying && selectedActivity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
        <InteractiveActivityPlayer
          activity={selectedActivity}
          onComplete={handleActivityComplete}
          onClose={handleActivityClose}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Rocket className="w-8 h-8" />
              Interactive Learning Hub
            </h1>
            <p className="text-purple-100 text-lg">
              Discover, learn, and grow with personalized activities!
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">Level {studentProgress.level}</span>
              </div>
              <div className="text-sm text-purple-100">
                {studentProgress.experience} XP
              </div>
              <Progress 
                value={(studentProgress.experience % 200) / 2} 
                className="mt-2 h-2 bg-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {studentProgress.totalActivitiesCompleted}
            </div>
            <div className="text-sm text-green-700">Activities Completed</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {studentProgress.averageScore}%
            </div>
            <div className="text-sm text-blue-700">Average Score</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {studentProgress.currentStreak}
            </div>
            <div className="text-sm text-orange-700">Current Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Medal className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {studentProgress.badges.length}
            </div>
            <div className="text-sm text-purple-700">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        {/* Discover Activities Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="alphabet">Alphabet</SelectItem>
                      <SelectItem value="numbers">Numbers</SelectItem>
                      <SelectItem value="shapes">Shapes</SelectItem>
                      <SelectItem value="colors">Colors</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy as any}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="difficulty">Difficulty</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="popularity">Popular</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))
            ) : filteredActivities.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No activities found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getContentTypeIcon(activity.contentType)}
                        <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                          {activity.title}
                        </CardTitle>
                      </div>
                      <Badge className={`text-xs ${getDifficultyColor(activity.difficulty)}`}>
                        {activity.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {activity.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {activity.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {activity.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-orange-500" />
                        {activity.points}
                      </div>
                    </div>

                    {activity.completion && (
                      <ActivityCompletionStatus
                        activityId={activity.id.toString()}
                        completedActivities={activity.completion.completed ? [activity.id.toString()] : []}
                        activityScores={{ [activity.id]: activity.completion.score * 10 }}
                        bestScores={{ [activity.id]: activity.completion.score * 10 }}
                        attempts={{ [activity.id]: activity.completion.attempts }}
                      />
                    )}

                    <div className="flex flex-wrap gap-1">
                      {activity.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      onClick={() => handleActivityStart(activity.id)}
                      className="w-full group-hover:bg-purple-600 group-hover:text-white transition-colors"
                      variant={activity.completion?.completed ? "outline" : "default"}
                    >
                      <div className="flex items-center gap-2">
                        {activity.completion?.completed ? (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            Play Again
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Start Learning
                          </>
                        )}
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Level Progress</span>
                    <span>{studentProgress.experience % 200}/200 XP</span>
                  </div>
                  <Progress value={(studentProgress.experience % 200) / 2} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.floor(studentProgress.totalTimeSpent / 60)}
                    </div>
                    <div className="text-sm text-blue-700">Minutes Learned</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {studentProgress.longestStreak}
                    </div>
                    <div className="text-sm text-green-700">Best Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentProgress.recentActivities.map((activityTitle, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="flex-1 font-medium">{activityTitle}</span>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  ))}
                  {studentProgress.recentActivities.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Complete your first activity to see it here!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Badges Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentProgress.badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <Medal className="w-8 h-8 text-purple-600" />
                    <div>
                      <span className="font-medium text-purple-800">{badge}</span>
                      <div className="text-sm text-purple-600">Earned recently</div>
                    </div>
                  </div>
                ))}
                {studentProgress.badges.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">No badges yet</h3>
                    <p>Complete activities to earn your first badge!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractiveLearningEngine;