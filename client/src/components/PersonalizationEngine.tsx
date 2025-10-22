import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Area,
  AreaChart
} from 'recharts';

import {
  Brain,
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
  Star,
  Award,
  BookOpen,
  Users,
  User,
  Clock,
  Calendar,
  Settings,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  Save,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Flag,
  Bookmark,
  Archive,
  Pin,
  ThumbsUp,
  Heart,
  Smile,
  Eye,
  EyeOff,
  Download,
  Upload,
  FileText,
  Image,
  Video,
  MessageCircle,
  Mail,
  Phone,
  Lightbulb,
  Cpu,
  Database,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Gauge,
  Compass,
  MapPin,
  Route,
  Navigation,
  Shuffle,
  RotateCcw,
  FastForward,
  Play,
  Pause,
  SkipForward,
  Rewind,
  Volume2,
  VolumeX,
  Headphones,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Globe,
  Wifi,
  Signal,
  Battery,
  Bluetooth,
  Gamepad2,
  Puzzle,
  Layers,
  GitBranch,
  TreePine,
  Network,
  Workflow,
  Atom,
  Microscope,
  FlaskConical
} from 'lucide-react';

interface PersonalizationEngineProps {
  studentId: string;
  userRole: 'student' | 'teacher' | 'parent' | 'admin';
}

interface LearningProfile {
  id: string;
  studentId: string;
  learningStyle: LearningStyle;
  cognitiveAbilities: CognitiveProfile;
  preferences: LearningPreferences;
  strengths: string[];
  challenges: string[];
  interests: string[];
  motivationalFactors: MotivationalProfile;
  attentionSpan: number; // minutes
  optimalStudyTime: TimeRange[];
  devicePreferences: DevicePreference[];
  accessibilityNeeds: AccessibilityProfile;
  lastUpdated: Date;
  confidence: number; // 0-100, AI confidence in profile accuracy
}

interface LearningStyle {
  visual: number; // 0-100
  auditory: number; // 0-100
  kinesthetic: number; // 0-100
  readWrite: number; // 0-100
  dominant: 'visual' | 'auditory' | 'kinesthetic' | 'read-write' | 'multimodal';
  adaptability: number; // how well student adapts to different styles
}

interface CognitiveProfile {
  processingSpeed: number; // 0-100
  workingMemory: number; // 0-100
  attention: number; // 0-100
  reasoning: number; // 0-100
  comprehension: number; // 0-100
  retention: number; // 0-100
  transferAbility: number; // ability to apply learning to new contexts
}

interface LearningPreferences {
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  pace: 'slow' | 'medium' | 'fast' | 'self-paced';
  feedback: 'immediate' | 'delayed' | 'summary';
  contentLength: 'short' | 'medium' | 'long' | 'varied';
  interaction: 'individual' | 'collaborative' | 'competitive' | 'mixed';
  structure: 'guided' | 'exploratory' | 'mixed';
  repetition: number; // preferred number of practice attempts
}

interface MotivationalProfile {
  intrinsicMotivation: number; // 0-100
  extrinsicMotivation: number; // 0-100
  competitionLevel: number; // 0-100
  collaborationLevel: number; // 0-100
  achievementOrientation: number; // 0-100
  curiosityLevel: number; // 0-100
  persistenceLevel: number; // 0-100
  rewardSensitivity: number; // 0-100
}

interface TimeRange {
  start: string; // HH:MM
  end: string; // HH:MM
  effectiveness: number; // 0-100
}

interface DevicePreference {
  type: 'desktop' | 'tablet' | 'mobile' | 'interactive-board';
  preference: number; // 0-100
  usage: number; // hours per week
}

interface AccessibilityProfile {
  visualImpairment: boolean;
  hearingImpairment: boolean;
  motorImpairment: boolean;
  cognitiveImpairment: boolean;
  learningDisability: string[];
  assistiveTechnologies: string[];
  accommodations: string[];
}

interface PersonalizedContent {
  id: string;
  originalContentId: string;
  studentId: string;
  title: string;
  description: string;
  adaptations: ContentAdaptation[];
  difficulty: number; // 0-100
  estimatedTime: number; // minutes
  learningObjectives: string[];
  prerequisites: string[];
  recommendationScore: number; // 0-100
  adaptationReason: string;
  createdAt: Date;
  lastAccessed?: Date;
  completionRate?: number;
  effectiveness?: number; // measured outcome
}

interface ContentAdaptation {
  type: 'difficulty' | 'style' | 'pace' | 'format' | 'feedback' | 'scaffolding';
  originalValue: any;
  adaptedValue: any;
  reason: string;
  confidence: number; // 0-100
}

interface LearningPath {
  id: string;
  studentId: string;
  title: string;
  description: string;
  subject: string;
  totalSteps: number;
  currentStep: number;
  estimatedDuration: number; // total minutes
  difficulty: number; // 0-100
  steps: LearningPathStep[];
  alternatives: AlternativePath[];
  adaptiveAdjustments: PathAdjustment[];
  progress: number; // 0-100
  effectiveness: number; // measured learning outcome
  lastModified: Date;
  isRecommended: boolean;
  aiGenerated: boolean;
}

interface LearningPathStep {
  id: string;
  order: number;
  contentId: string;
  title: string;
  type: 'lesson' | 'practice' | 'assessment' | 'project' | 'game';
  estimatedTime: number; // minutes
  difficulty: number; // 0-100
  prerequisites: string[];
  learningObjectives: string[];
  status: 'locked' | 'available' | 'in-progress' | 'completed' | 'skipped';
  score?: number;
  attempts?: number;
  timeSpent?: number;
  adaptations: ContentAdaptation[];
  alternatives: string[]; // alternative content IDs
}

interface AlternativePath {
  id: string;
  title: string;
  description: string;
  reason: string; // why this alternative exists
  difficulty: number;
  estimatedDuration: number;
  steps: string[]; // step IDs
  conditions: string[]; // when to suggest this path
}

interface PathAdjustment {
  id: string;
  timestamp: Date;
  type: 'difficulty' | 'pace' | 'content' | 'sequence' | 'support';
  originalValue: any;
  adjustedValue: any;
  reason: string;
  trigger: string; // what caused the adjustment
  effectiveness?: number; // measured impact
}

interface AIRecommendation {
  id: string;
  studentId: string;
  type: 'content' | 'path' | 'activity' | 'break' | 'review' | 'challenge';
  title: string;
  description: string;
  reasoning: string;
  confidence: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedImpact: number; // predicted learning improvement 0-100
  timeRequired: number; // minutes
  contentIds: string[];
  expiresAt?: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  metadata: Record<string, any>;
}

const PersonalizationEngine: React.FC<PersonalizationEngineProps> = ({
  studentId,
  userRole
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'content' | 'paths' | 'recommendations' | 'analytics'>('profile');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommendation');

  // Data state
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [personalizedContent, setPersonalizedContent] = useState<PersonalizedContent[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Sample data
  useEffect(() => {
    // Simulate initial data loading
    setTimeout(() => {
      setLearningProfile({
        id: 'profile-1',
        studentId,
        learningStyle: {
          visual: 85,
          auditory: 45,
          kinesthetic: 70,
          readWrite: 60,
          dominant: 'visual',
          adaptability: 78
        },
        cognitiveAbilities: {
          processingSpeed: 82,
          workingMemory: 76,
          attention: 68,
          reasoning: 88,
          comprehension: 90,
          retention: 75,
          transferAbility: 80
        },
        preferences: {
          difficulty: 'adaptive',
          pace: 'self-paced',
          feedback: 'immediate',
          contentLength: 'medium',
          interaction: 'mixed',
          structure: 'guided',
          repetition: 2
        },
        strengths: ['Visual Processing', 'Pattern Recognition', 'Creative Thinking', 'Problem Solving'],
        challenges: ['Sustained Attention', 'Auditory Processing', 'Sequential Memory'],
        interests: ['Science', 'Art', 'Technology', 'Animals', 'Space'],
        motivationalFactors: {
          intrinsicMotivation: 85,
          extrinsicMotivation: 60,
          competitionLevel: 45,
          collaborationLevel: 70,
          achievementOrientation: 80,
          curiosityLevel: 92,
          persistenceLevel: 65,
          rewardSensitivity: 55
        },
        attentionSpan: 25,
        optimalStudyTime: [
          { start: '09:00', end: '11:00', effectiveness: 95 },
          { start: '14:00', end: '16:00', effectiveness: 85 },
          { start: '19:00', end: '20:30', effectiveness: 70 }
        ],
        devicePreferences: [
          { type: 'tablet', preference: 90, usage: 15 },
          { type: 'desktop', preference: 75, usage: 8 },
          { type: 'mobile', preference: 60, usage: 5 }
        ],
        accessibilityNeeds: {
          visualImpairment: false,
          hearingImpairment: false,
          motorImpairment: false,
          cognitiveImpairment: false,
          learningDisability: [],
          assistiveTechnologies: [],
          accommodations: ['Extended time for complex tasks', 'Visual aids preferred']
        },
        lastUpdated: new Date(),
        confidence: 87
      });

      setPersonalizedContent([
        {
          id: 'content-1',
          originalContentId: 'math-fractions-intro',
          studentId,
          title: 'Visual Fraction Explorer',
          description: 'Interactive visual exploration of fractions adapted for visual learners',
          adaptations: [
            {
              type: 'style',
              originalValue: 'text-based',
              adaptedValue: 'visual-interactive',
              reason: 'Student shows 85% visual learning preference',
              confidence: 95
            },
            {
              type: 'difficulty',
              originalValue: 'standard',
              adaptedValue: 'slightly-easier',
              reason: 'Building confidence before advancing',
              confidence: 78
            }
          ],
          difficulty: 65,
          estimatedTime: 20,
          learningObjectives: ['Understand fraction parts', 'Compare fractions visually', 'Identify equivalent fractions'],
          prerequisites: ['Basic number recognition', 'Part-whole understanding'],
          recommendationScore: 92,
          adaptationReason: 'Optimized for visual learning style and current skill level',
          createdAt: new Date('2025-10-20'),
          completionRate: 85,
          effectiveness: 88
        },
        {
          id: 'content-2',
          originalContentId: 'science-plants',
          studentId,
          title: 'Interactive Plant Life Cycle',
          description: 'Hands-on exploration of plant growth with visual animations',
          adaptations: [
            {
              type: 'format',
              originalValue: 'reading-heavy',
              adaptedValue: 'visual-interactive',
              reason: 'Matches strong visual preference and science interest',
              confidence: 90
            }
          ],
          difficulty: 70,
          estimatedTime: 25,
          learningObjectives: ['Identify plant parts', 'Understand life cycles', 'Observe growth patterns'],
          prerequisites: ['Basic observation skills'],
          recommendationScore: 89,
          adaptationReason: 'Aligns with science interest and visual learning strength',
          createdAt: new Date('2025-10-21'),
          completionRate: 92,
          effectiveness: 91
        }
      ]);

      setLearningPaths([
        {
          id: 'path-1',
          studentId,
          title: 'Visual Math Mastery',
          description: 'Comprehensive math curriculum adapted for visual learners',
          subject: 'Mathematics',
          totalSteps: 12,
          currentStep: 3,
          estimatedDuration: 480, // 8 hours
          difficulty: 70,
          steps: [
            {
              id: 'step-1',
              order: 1,
              contentId: 'content-1',
              title: 'Visual Fraction Explorer',
              type: 'lesson',
              estimatedTime: 20,
              difficulty: 65,
              prerequisites: [],
              learningObjectives: ['Understand fraction parts'],
              status: 'completed',
              score: 88,
              attempts: 1,
              timeSpent: 18,
              adaptations: [],
              alternatives: []
            },
            {
              id: 'step-2',
              order: 2,
              contentId: 'math-decimals-visual',
              title: 'Decimal Point Adventures',
              type: 'lesson',
              estimatedTime: 25,
              difficulty: 70,
              prerequisites: ['step-1'],
              learningObjectives: ['Understand decimal notation'],
              status: 'completed',
              score: 92,
              attempts: 1,
              timeSpent: 22,
              adaptations: [],
              alternatives: []
            },
            {
              id: 'step-3',
              order: 3,
              contentId: 'math-percentage-game',
              title: 'Percentage Playground',
              type: 'game',
              estimatedTime: 30,
              difficulty: 75,
              prerequisites: ['step-1', 'step-2'],
              learningObjectives: ['Convert between fractions, decimals, and percentages'],
              status: 'in-progress',
              attempts: 1,
              timeSpent: 15,
              adaptations: [],
              alternatives: []
            }
          ],
          alternatives: [],
          adaptiveAdjustments: [
            {
              id: 'adj-1',
              timestamp: new Date('2025-10-21'),
              type: 'difficulty',
              originalValue: 80,
              adjustedValue: 70,
              reason: 'Student needed more practice time on fractions',
              trigger: 'Multiple incorrect attempts',
              effectiveness: 85
            }
          ],
          progress: 75,
          effectiveness: 87,
          lastModified: new Date('2025-10-21'),
          isRecommended: true,
          aiGenerated: true
        }
      ]);

      setAIRecommendations([
        {
          id: 'rec-1',
          studentId,
          type: 'break',
          title: 'Take a Learning Break',
          description: 'You\'ve been focused for 25 minutes. A 5-minute break will help refresh your attention.',
          reasoning: 'Student has reached optimal attention span limit. Break will improve subsequent learning efficiency.',
          confidence: 94,
          priority: 'medium',
          estimatedImpact: 15,
          timeRequired: 5,
          contentIds: [],
          status: 'pending',
          createdAt: new Date(),
          metadata: { attentionSpan: 25, currentSessionTime: 26 }
        },
        {
          id: 'rec-2',
          studentId,
          type: 'content',
          title: 'Science Exploration: Animal Habitats',
          description: 'Based on your interest in animals, this interactive habitat exploration is perfect for you!',
          reasoning: 'Matches student interests (animals) and learning style (visual-interactive). High predicted engagement.',
          confidence: 89,
          priority: 'high',
          estimatedImpact: 25,
          timeRequired: 20,
          contentIds: ['science-habitats-visual'],
          status: 'pending',
          createdAt: new Date(),
          metadata: { interests: ['animals'], learningStyle: 'visual' }
        },
        {
          id: 'rec-3',
          studentId,
          type: 'challenge',
          title: 'Advanced Pattern Recognition',
          description: 'Ready for a challenge? This advanced pattern activity will stretch your strong reasoning skills.',
          reasoning: 'Student excels in pattern recognition (88% reasoning ability). Appropriate challenge level to maintain engagement.',
          confidence: 82,
          priority: 'low',
          estimatedImpact: 20,
          timeRequired: 15,
          contentIds: ['math-patterns-advanced'],
          status: 'pending',
          createdAt: new Date(),
          metadata: { strength: 'reasoning', currentDifficulty: 70, suggestedDifficulty: 85 }
        }
      ]);

      setAnalytics({
        adaptationEffectiveness: 87,
        learningAcceleration: 23, // % improvement
        engagementIncrease: 34,
        retentionImprovement: 19,
        pathOptimization: 91,
        recommendationAccuracy: 84,
        trends: {
          weeklyProgress: [85, 87, 89, 88, 92, 90, 94],
          difficultyAdaptation: [70, 68, 72, 70, 75, 73, 78],
          engagementLevels: [78, 82, 85, 88, 91, 89, 93]
        }
      });

      setIsLoading(false);
    }, 1500);
  }, [studentId]);

  const analyzeProfile = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      // Update learning profile with new insights
      if (learningProfile) {
        setLearningProfile(prev => ({
          ...prev!,
          confidence: Math.min(prev!.confidence + 5, 100),
          lastUpdated: new Date()
        }));
      }
      
      // Generate new recommendations
      const newRecommendation: AIRecommendation = {
        id: `rec-${Date.now()}`,
        studentId,
        type: 'review',
        title: 'Review Previous Concepts',
        description: 'Based on recent performance, reviewing fractions will strengthen your foundation.',
        reasoning: 'Analysis shows slight decline in retention for fraction concepts. Review will reinforce learning.',
        confidence: 91,
        priority: 'medium',
        estimatedImpact: 18,
        timeRequired: 10,
        contentIds: ['math-fractions-review'],
        status: 'pending',
        createdAt: new Date(),
        metadata: { analysisType: 'performance-trend', retentionScore: 75 }
      };
      
      setAIRecommendations(prev => [newRecommendation, ...prev]);
      setIsAnalyzing(false);
    }, 3000);
  }, [studentId, learningProfile]);

  const acceptRecommendation = (recommendationId: string) => {
    setAIRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, status: 'accepted' }
        : rec
    ));
  };

  const rejectRecommendation = (recommendationId: string) => {
    setAIRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, status: 'rejected' }
        : rec
    ));
  };

  const getStyleColor = (value: number) => {
    if (value >= 80) return 'text-green-600 bg-green-50';
    if (value >= 60) return 'text-blue-600 bg-blue-50';
    if (value >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRecommendationIcon = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'content': return <BookOpen className="w-5 h-5" />;
      case 'path': return <Route className="w-5 h-5" />;
      case 'activity': return <Zap className="w-5 h-5" />;
      case 'break': return <Clock className="w-5 h-5" />;
      case 'review': return <RefreshCw className="w-5 h-5" />;
      case 'challenge': return <Target className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-pulse" />
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">Analyzing learning patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            Personalization Engine
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered adaptive learning experience
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={analyzeProfile}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Cpu className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Profile'}
          </Button>
          
          <Button onClick={() => setShowProfileEditor(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Key Insights Alert */}
      {learningProfile && (
        <Alert>
          <Lightbulb className="w-4 h-4" />
          <AlertDescription>
            <strong>Key Insight:</strong> This student learns best through visual content (85% preference) 
            with immediate feedback during optimal focus time (9-11 AM). 
            Current profile confidence: {learningProfile.confidence}%
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Learning Profile</TabsTrigger>
          <TabsTrigger value="content">Personalized Content</TabsTrigger>
          <TabsTrigger value="paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Learning Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {learningProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learning Style */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    Learning Style Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(learningProfile.learningStyle)
                        .filter(([key]) => key !== 'dominant' && key !== 'adaptability')
                        .map(([style, value]) => (
                        <div key={style} className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="capitalize">{style === 'readWrite' ? 'Read/Write' : style}</Label>
                            <Badge className={getStyleColor(value as number)}>
                              {value}%
                            </Badge>
                          </div>
                          <Progress value={value as number} className="h-2" />
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Dominant Style:</span>
                      <Badge variant="default" className="capitalize">
                        {learningProfile.learningStyle.dominant.replace('-', '/')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Adaptability:</span>
                      <Badge className={getStyleColor(learningProfile.learningStyle.adaptability)}>
                        {learningProfile.learningStyle.adaptability}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cognitive Abilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Cognitive Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(learningProfile.cognitiveAbilities).map(([ability, value]) => (
                      <div key={ability} className="space-y-1">
                        <div className="flex justify-between">
                          <Label className="text-sm capitalize">
                            {ability.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <span className="text-sm text-gray-600">{value}/100</span>
                        </div>
                        <Progress value={value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Strengths & Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-green-700 mb-2 block">Strengths</Label>
                    <div className="flex flex-wrap gap-2">
                      {learningProfile.strengths.map((strength, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-orange-700 mb-2 block">Areas for Growth</Label>
                    <div className="flex flex-wrap gap-2">
                      {learningProfile.challenges.map((challenge, index) => (
                        <Badge key={index} variant="secondary" className="bg-orange-50 text-orange-700">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interests & Motivation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    Interests & Motivation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Interests</Label>
                    <div className="flex flex-wrap gap-2">
                      {learningProfile.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span>Intrinsic Motivation:</span>
                      <Badge className={getStyleColor(learningProfile.motivationalFactors.intrinsicMotivation)}>
                        {learningProfile.motivationalFactors.intrinsicMotivation}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Curiosity Level:</span>
                      <Badge className={getStyleColor(learningProfile.motivationalFactors.curiosityLevel)}>
                        {learningProfile.motivationalFactors.curiosityLevel}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Achievement Focus:</span>
                      <Badge className={getStyleColor(learningProfile.motivationalFactors.achievementOrientation)}>
                        {learningProfile.motivationalFactors.achievementOrientation}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Persistence:</span>
                      <Badge className={getStyleColor(learningProfile.motivationalFactors.persistenceLevel)}>
                        {learningProfile.motivationalFactors.persistenceLevel}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Optimal Learning Conditions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Optimal Learning Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Study Time Effectiveness</Label>
                      <div className="space-y-2">
                        {learningProfile.optimalStudyTime.map((timeRange, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{timeRange.start} - {timeRange.end}</span>
                            <Badge className={getStyleColor(timeRange.effectiveness)}>
                              {timeRange.effectiveness}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Device Preferences</Label>
                      <div className="space-y-2">
                        {learningProfile.devicePreferences.map((device, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{device.type}</span>
                            <div className="flex items-center gap-2">
                              <Progress value={device.preference} className="w-16 h-2" />
                              <span className="text-xs text-gray-600">{device.preference}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Learning Preferences</Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Attention Span:</span>
                          <span className="font-medium">{learningProfile.attentionSpan} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Preferred Pace:</span>
                          <span className="font-medium capitalize">{learningProfile.preferences.pace}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Feedback Type:</span>
                          <span className="font-medium capitalize">{learningProfile.preferences.feedback}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Content Length:</span>
                          <span className="font-medium capitalize">{learningProfile.preferences.contentLength}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Personalized Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Personalized Content</h2>
            <div className="flex items-center gap-2">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommendation">Recommended</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="time">Est. Time</SelectItem>
                  <SelectItem value="effectiveness">Effectiveness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedContent.map((content) => (
              <PersonalizedContentCard
                key={content.id}
                content={content}
                onStart={() => console.log('Start content', content.id)}
                onBookmark={() => console.log('Bookmark', content.id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Learning Paths Tab */}
        <TabsContent value="paths" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Adaptive Learning Paths</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Path
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <LearningPathCard
                key={path.id}
                path={path}
                onSelect={() => setSelectedPath(path)}
                onContinue={() => console.log('Continue path', path.id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">AI Recommendations</h2>
            <Badge variant="secondary">
              {aiRecommendations.filter(r => r.status === 'pending').length} pending
            </Badge>
          </div>
          
          <div className="space-y-4">
            {aiRecommendations
              .filter(rec => rec.status === 'pending')
              .map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onAccept={() => acceptRecommendation(recommendation.id)}
                onReject={() => rejectRecommendation(recommendation.id)}
              />
            ))}
            
            {aiRecommendations.filter(r => r.status === 'pending').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No new recommendations at this time</p>
                <p className="text-sm">Check back later or trigger analysis for new insights</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && <PersonalizationAnalytics analytics={analytics} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Personalized Content Card Component
interface PersonalizedContentCardProps {
  content: PersonalizedContent;
  onStart: () => void;
  onBookmark: () => void;
}

const PersonalizedContentCard: React.FC<PersonalizedContentCardProps> = ({
  content,
  onStart,
  onBookmark
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{content.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{content.description}</p>
          </div>
          <Badge className="shrink-0 ml-2">
            {content.recommendationScore}% match
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{content.estimatedTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>Level {Math.round(content.difficulty / 10)}</span>
          </div>
          {content.effectiveness && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>{content.effectiveness}% effective</span>
            </div>
          )}
        </div>
        
        <div>
          <Label className="text-xs font-medium text-gray-500">ADAPTATIONS</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {content.adaptations.map((adaptation, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {adaptation.type}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="text-xs font-medium text-gray-500">WHY THIS CONTENT?</Label>
          <p className="text-xs text-gray-600 mt-1">{content.adaptationReason}</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onStart} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            Start Learning
          </Button>
          <Button variant="outline" size="sm" onClick={onBookmark}>
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Learning Path Card Component
interface LearningPathCardProps {
  path: LearningPath;
  onSelect: () => void;
  onContinue: () => void;
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({
  path,
  onSelect,
  onContinue
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{path.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{path.description}</p>
          </div>
          {path.isRecommended && (
            <Badge variant="default">Recommended</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{path.currentStep}/{path.totalSteps} steps</span>
          </div>
          <Progress value={path.progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{Math.round(path.estimatedDuration / 60)}h total</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>Level {Math.round(path.difficulty / 10)}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{path.effectiveness}% effective</span>
          </div>
          <div className="flex items-center gap-1">
            {path.aiGenerated ? <Brain className="w-4 h-4" /> : <User className="w-4 h-4" />}
            <span>{path.aiGenerated ? 'AI Generated' : 'Custom'}</span>
          </div>
        </div>
        
        <div>
          <Label className="text-xs font-medium text-gray-500">RECENT ADJUSTMENTS</Label>
          <p className="text-xs text-gray-600 mt-1">
            {path.adaptiveAdjustments.length > 0 
              ? `${path.adaptiveAdjustments[path.adaptiveAdjustments.length - 1].reason}`
              : 'No recent adjustments'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onContinue} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            Continue Path
          </Button>
          <Button variant="outline" size="sm" onClick={onSelect}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Recommendation Card Component
interface RecommendationCardProps {
  recommendation: AIRecommendation;
  onAccept: () => void;
  onReject: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAccept,
  onReject
}) => {
  return (
    <Card className={`border-l-4 ${getPriorityColor(recommendation.priority).replace('text-', 'border-').replace(' bg-', '').replace(' border-', ' border-l-')}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1">
            {getRecommendationIcon(recommendation.type)}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{recommendation.title}</h4>
                <p className="text-sm text-gray-600">{recommendation.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Badge className={getPriorityColor(recommendation.priority)}>
                  {recommendation.priority.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {recommendation.confidence}% confident
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{recommendation.timeRequired} min</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+{recommendation.estimatedImpact}% impact</span>
              </div>
            </div>
            
            <div>
              <Label className="text-xs font-medium text-gray-500">AI REASONING</Label>
              <p className="text-xs text-gray-600 mt-1">{recommendation.reasoning}</p>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={onAccept}>
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button variant="outline" size="sm" onClick={onReject}>
                <X className="w-4 h-4 mr-2" />
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Personalization Analytics Component
interface PersonalizationAnalyticsProps {
  analytics: any;
}

const PersonalizationAnalytics: React.FC<PersonalizationAnalyticsProps> = ({
  analytics
}) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Adaptation Effectiveness</p>
                <p className="text-2xl font-bold text-green-600">{analytics.adaptationEffectiveness}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Acceleration</p>
                <p className="text-2xl font-bold text-blue-600">+{analytics.learningAcceleration}%</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Increase</p>
                <p className="text-2xl font-bold text-purple-600">+{analytics.engagementIncrease}%</p>
              </div>
              <Heart className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Improvement</p>
                <p className="text-2xl font-bold text-orange-600">+{analytics.retentionImprovement}%</p>
              </div>
              <Brain className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trends.weeklyProgress.map((value: number, index: number) => ({
                week: `Week ${index + 1}`,
                progress: value
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Engagement Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.trends.engagementLevels.map((value: number, index: number) => ({
                day: `Day ${index + 1}`,
                engagement: value
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="engagement" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalizationEngine;