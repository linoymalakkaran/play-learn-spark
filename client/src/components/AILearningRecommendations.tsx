import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
  Radar
} from 'recharts';

import {
  Brain,
  Target,
  TrendingUp,
  Lightbulb,
  Star,
  Clock,
  BookOpen,
  Zap,
  Award,
  Heart,
  User,
  Users,
  Play,
  Pause,
  SkipForward,
  RefreshCw,
  Settings,
  Filter,
  Search,
  Check,
  X,
  ChevronRight,
  MoreVertical,
  Bookmark,
  Share,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Headphones,
  Volume2,
  Gamepad2,
  Puzzle,
  FlaskConical,
  Microscope,
  Calculator,
  PenTool,
  Music,
  Palette,
  Camera,
  Cpu,
  Database,
  Network,
  Workflow,
  GitBranch,
  Layers,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  Sparkles,
  Wand2,
  Robot,
  Atom,
  Dna,
  Leaf,
  Mountain,
  Waves,
  Sun,
  Moon,
  Flame,
  Snowflake
} from 'lucide-react';

interface AILearningRecommendationsProps {
  studentId: string;
  userRole: 'student' | 'teacher' | 'parent' | 'admin';
}

interface RecommendationEngine {
  id: string;
  name: string;
  description: string;
  type: 'content' | 'skill' | 'pathway' | 'intervention' | 'enrichment';
  aiModel: string;
  confidence: number;
  accuracy: number;
  isActive: boolean;
  lastTrained: Date;
  parameters: EngineParameters;
}

interface EngineParameters {
  learningStyleWeight: number;
  performanceWeight: number;
  interestWeight: number;
  difficultyAdaptation: number;
  diversityFactor: number;
  recencyBias: number;
  socialLearningFactor: number;
  attentionSpanConsideration: number;
}

interface SmartRecommendation {
  id: string;
  studentId: string;
  type: 'next-activity' | 'skill-gap' | 'enrichment' | 'review' | 'challenge' | 'break' | 'social';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: number;
  timeToComplete: number;
  difficulty: number;
  contentIds: string[];
  skills: string[];
  learningObjectives: string[];
  prerequisites: string[];
  alternatives: AlternativeRecommendation[];
  metadata: RecommendationMetadata;
  createdAt: Date;
  expiresAt?: Date;
  status: 'pending' | 'viewed' | 'accepted' | 'rejected' | 'completed' | 'expired';
  feedback?: StudentFeedback;
  effectiveness?: number;
}

interface AlternativeRecommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  confidence: number;
  contentIds: string[];
}

interface RecommendationMetadata {
  engineUsed: string;
  modelVersion: string;
  inputFeatures: string[];
  similarStudents: string[];
  contextFactors: string[];
  adaptationReasons: string[];
  qualityScore: number;
  noveltyScore: number;
  relevanceScore: number;
}

interface StudentFeedback {
  rating: number; // 1-5
  difficulty: 'too-easy' | 'just-right' | 'too-hard';
  engagement: 'boring' | 'okay' | 'engaging' | 'very-engaging';
  helpfulness: number; // 1-5
  comments?: string;
  wouldRecommendToFriend: boolean;
  submittedAt: Date;
}

interface LearningPattern {
  id: string;
  studentId: string;
  pattern: string;
  description: string;
  strength: number; // 0-100
  frequency: number;
  examples: string[];
  firstObserved: Date;
  lastObserved: Date;
  impact: 'positive' | 'neutral' | 'negative';
  actionable: boolean;
}

interface ContentSimilarity {
  contentId: string;
  similarity: number;
  reasons: string[];
  sharedFeatures: string[];
}

interface PeerLearningData {
  studentId: string;
  name: string;
  avatar?: string;
  similarityScore: number;
  sharedInterests: string[];
  learningStyleMatch: number;
  successfulContent: string[];
  recommendationCount: number;
}

const AILearningRecommendations: React.FC<AILearningRecommendationsProps> = ({
  studentId,
  userRole
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'patterns' | 'peers' | 'engines' | 'feedback'>('recommendations');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [selectedRecommendation, setSelectedRecommendation] = useState<SmartRecommendation | null>(null);

  // Data state
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [peerData, setPeerData] = useState<PeerLearningData[]>([]);
  const [engines, setEngines] = useState<RecommendationEngine[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Sample data initialization
  useEffect(() => {
    setTimeout(() => {
      // Initialize recommendation engines
      setEngines([
        {
          id: 'cognitive-engine',
          name: 'Cognitive Pattern Analyzer',
          description: 'Analyzes cognitive patterns and learning preferences to suggest optimal content',
          type: 'content',
          aiModel: 'CognitiveNet-v2.1',
          confidence: 92,
          accuracy: 89,
          isActive: true,
          lastTrained: new Date('2025-10-20'),
          parameters: {
            learningStyleWeight: 0.35,
            performanceWeight: 0.25,
            interestWeight: 0.20,
            difficultyAdaptation: 0.80,
            diversityFactor: 0.60,
            recencyBias: 0.70,
            socialLearningFactor: 0.40,
            attentionSpanConsideration: 0.85
          }
        },
        {
          id: 'adaptive-engine',
          name: 'Adaptive Difficulty Engine',
          description: 'Dynamically adjusts content difficulty based on real-time performance',
          type: 'skill',
          aiModel: 'AdaptiveAI-v1.8',
          confidence: 88,
          accuracy: 91,
          isActive: true,
          lastTrained: new Date('2025-10-22'),
          parameters: {
            learningStyleWeight: 0.20,
            performanceWeight: 0.50,
            interestWeight: 0.15,
            difficultyAdaptation: 0.95,
            diversityFactor: 0.30,
            recencyBias: 0.85,
            socialLearningFactor: 0.25,
            attentionSpanConsideration: 0.70
          }
        },
        {
          id: 'social-engine',
          name: 'Collaborative Learning Engine',
          description: 'Recommends peer learning opportunities and social activities',
          type: 'pathway',
          aiModel: 'SocialNet-v1.5',
          confidence: 85,
          accuracy: 82,
          isActive: true,
          lastTrained: new Date('2025-10-19'),
          parameters: {
            learningStyleWeight: 0.25,
            performanceWeight: 0.20,
            interestWeight: 0.30,
            difficultyAdaptation: 0.50,
            diversityFactor: 0.80,
            recencyBias: 0.40,
            socialLearningFactor: 0.90,
            attentionSpanConsideration: 0.60
          }
        }
      ]);

      // Initialize recommendations
      setRecommendations([
        {
          id: 'rec-1',
          studentId,
          type: 'next-activity',
          title: 'Visual Fraction Mastery Challenge',
          description: 'Perfect your fraction skills with this interactive visual challenge that adapts to your learning pace.',
          reasoning: 'Based on your strong visual learning preference (85%) and recent improvement in basic fractions, this challenge will reinforce your understanding while introducing equivalent fractions through visual representations.',
          confidence: 94,
          priority: 'high',
          estimatedImpact: 28,
          timeToComplete: 25,
          difficulty: 75,
          contentIds: ['math-fractions-visual-challenge'],
          skills: ['Fraction Comparison', 'Equivalent Fractions', 'Visual Math'],
          learningObjectives: [
            'Compare fractions using visual models',
            'Identify equivalent fractions',
            'Apply fraction concepts to real-world scenarios'
          ],
          prerequisites: ['Basic fraction understanding', 'Part-whole concepts'],
          alternatives: [
            {
              id: 'alt-1',
              title: 'Fraction Story Problems',
              description: 'Text-based fraction problems with real-world contexts',
              reason: 'Alternative for students who prefer reading-based learning',
              confidence: 78,
              contentIds: ['math-fractions-story']
            }
          ],
          metadata: {
            engineUsed: 'cognitive-engine',
            modelVersion: 'CognitiveNet-v2.1',
            inputFeatures: ['learning_style', 'recent_performance', 'attention_span', 'interests'],
            similarStudents: ['student-234', 'student-567'],
            contextFactors: ['morning_session', 'high_energy', 'visual_preference'],
            adaptationReasons: ['visual_learning_style', 'appropriate_difficulty_level'],
            qualityScore: 92,
            noveltyScore: 76,
            relevanceScore: 89
          },
          createdAt: new Date(),
          status: 'pending'
        },
        {
          id: 'rec-2',
          studentId,
          type: 'break',
          title: 'Mindful Movement Break',
          description: 'Take a 5-minute guided movement break to refresh your focus and energy.',
          reasoning: 'You\'ve been learning for 23 minutes, approaching your optimal attention span of 25 minutes. A kinesthetic break will help reset your focus for the next learning session.',
          confidence: 91,
          priority: 'medium',
          estimatedImpact: 15,
          timeToComplete: 5,
          difficulty: 10,
          contentIds: ['wellness-movement-break'],
          skills: ['Self-regulation', 'Mindfulness', 'Physical Wellness'],
          learningObjectives: [
            'Practice mindful breathing',
            'Engage in gentle movement',
            'Reset mental focus'
          ],
          prerequisites: [],
          alternatives: [
            {
              id: 'alt-2',
              title: 'Quiet Reflection Time',
              description: 'Silent reflection and deep breathing exercise',
              reason: 'For students who prefer calm, quiet breaks',
              confidence: 85,
              contentIds: ['wellness-quiet-break']
            }
          ],
          metadata: {
            engineUsed: 'cognitive-engine',
            modelVersion: 'CognitiveNet-v2.1',
            inputFeatures: ['session_time', 'attention_span', 'energy_level'],
            similarStudents: [],
            contextFactors: ['approaching_attention_limit', 'kinesthetic_preference'],
            adaptationReasons: ['attention_span_optimization'],
            qualityScore: 88,
            noveltyScore: 45,
            relevanceScore: 95
          },
          createdAt: new Date(),
          status: 'pending'
        },
        {
          id: 'rec-3',
          studentId,
          type: 'enrichment',
          title: 'Space Exploration Discovery',
          description: 'Dive deeper into your favorite topic with this interactive space mission simulator.',
          reasoning: 'Your high interest in space (95% engagement) and strong problem-solving skills make this enrichment activity perfect for extending your learning beyond the curriculum.',
          confidence: 89,
          priority: 'high',
          estimatedImpact: 32,
          timeToComplete: 40,
          difficulty: 80,
          contentIds: ['science-space-mission-sim'],
          skills: ['Scientific Inquiry', 'Problem Solving', 'Space Science'],
          learningObjectives: [
            'Plan a space mission',
            'Apply physics concepts',
            'Make scientific observations'
          ],
          prerequisites: ['Basic physics concepts', 'Scientific method understanding'],
          alternatives: [
            {
              id: 'alt-3',
              title: 'Space Documentary Analysis',
              description: 'Watch and analyze space exploration documentaries',
              reason: 'For students who prefer video-based learning',
              confidence: 82,
              contentIds: ['science-space-documentary']
            }
          ],
          metadata: {
            engineUsed: 'cognitive-engine',
            modelVersion: 'CognitiveNet-v2.1',
            inputFeatures: ['interests', 'skill_level', 'engagement_history'],
            similarStudents: ['student-123', 'student-789'],
            contextFactors: ['high_interest_topic', 'advanced_readiness'],
            adaptationReasons: ['interest_alignment', 'skill_extension'],
            qualityScore: 91,
            noveltyScore: 88,
            relevanceScore: 87
          },
          createdAt: new Date(),
          status: 'pending'
        },
        {
          id: 'rec-4',
          studentId,
          type: 'social',
          title: 'Collaborative Science Project',
          description: 'Join Emma and Liam in a fun plant growth experiment that combines your interests.',
          reasoning: 'Based on your collaboration preference (70%) and shared interest in science with similar learners, this group activity will enhance learning through peer interaction.',
          confidence: 86,
          priority: 'medium',
          estimatedImpact: 24,
          timeToComplete: 35,
          difficulty: 70,
          contentIds: ['science-plant-experiment-collab'],
          skills: ['Scientific Method', 'Collaboration', 'Data Collection'],
          learningObjectives: [
            'Design controlled experiments',
            'Collaborate effectively with peers',
            'Collect and analyze data'
          ],
          prerequisites: ['Basic plant knowledge', 'Measurement skills'],
          alternatives: [
            {
              id: 'alt-4',
              title: 'Individual Plant Study',
              description: 'Conduct your own plant growth experiment',
              reason: 'For students who prefer individual work',
              confidence: 79,
              contentIds: ['science-plant-experiment-solo']
            }
          ],
          metadata: {
            engineUsed: 'social-engine',
            modelVersion: 'SocialNet-v1.5',
            inputFeatures: ['collaboration_preference', 'peer_compatibility', 'shared_interests'],
            similarStudents: ['student-101', 'student-202'],
            contextFactors: ['peer_availability', 'group_dynamics'],
            adaptationReasons: ['social_learning_preference', 'peer_motivation'],
            qualityScore: 85,
            noveltyScore: 72,
            relevanceScore: 88
          },
          createdAt: new Date(),
          status: 'pending'
        }
      ]);

      // Initialize learning patterns
      setLearningPatterns([
        {
          id: 'pattern-1',
          studentId,
          pattern: 'Visual Processing Advantage',
          description: 'Consistently performs 25% better on visual content compared to text-based materials',
          strength: 87,
          frequency: 0.85,
          examples: [
            'Diagram-based math problems: 92% accuracy',
            'Visual science experiments: 89% completion',
            'Infographic reading: 88% comprehension'
          ],
          firstObserved: new Date('2025-09-15'),
          lastObserved: new Date('2025-10-22'),
          impact: 'positive',
          actionable: true
        },
        {
          id: 'pattern-2',
          studentId,
          pattern: 'Optimal Learning Window',
          description: 'Peak performance occurs during 9-11 AM sessions with 95% higher engagement',
          strength: 92,
          frequency: 0.90,
          examples: [
            'Morning math sessions: 94% average score',
            '9 AM science activities: 96% completion rate',
            'Late afternoon sessions: 72% engagement'
          ],
          firstObserved: new Date('2025-09-20'),
          lastObserved: new Date('2025-10-23'),
          impact: 'positive',
          actionable: true
        },
        {
          id: 'pattern-3',
          studentId,
          pattern: 'Attention Span Cycles',
          description: 'Attention decreases after 25 minutes, recovers after 5-minute breaks',
          strength: 78,
          frequency: 0.88,
          examples: [
            'Session minute 26-30: 45% accuracy drop',
            'Post-break performance: 88% recovery',
            'Continuous 45-min sessions: 60% efficiency'
          ],
          firstObserved: new Date('2025-09-25'),
          lastObserved: new Date('2025-10-23'),
          impact: 'neutral',
          actionable: true
        },
        {
          id: 'pattern-4',
          studentId,
          pattern: 'Interest-Driven Persistence',
          description: 'Spends 3x more time on space and science topics with higher completion rates',
          strength: 94,
          frequency: 0.95,
          examples: [
            'Space topics: 98% completion, 45 min average time',
            'Math topics: 85% completion, 15 min average time',
            'Science experiments: 92% completion, 35 min average time'
          ],
          firstObserved: new Date('2025-09-10'),
          lastObserved: new Date('2025-10-23'),
          impact: 'positive',
          actionable: true
        }
      ]);

      // Initialize peer data
      setPeerData([
        {
          studentId: 'peer-1',
          name: 'Emma Johnson',
          avatar: '/avatars/emma.jpg',
          similarityScore: 87,
          sharedInterests: ['Science', 'Art', 'Reading'],
          learningStyleMatch: 82,
          successfulContent: [
            'Visual fraction explorer',
            'Interactive plant life cycle',
            'Creative writing prompts'
          ],
          recommendationCount: 12
        },
        {
          studentId: 'peer-2',
          name: 'Alex Chen',
          avatar: '/avatars/alex.jpg',
          similarityScore: 79,
          sharedInterests: ['Technology', 'Science', 'Math'],
          learningStyleMatch: 75,
          successfulContent: [
            'Coding challenges',
            'Physics simulations',
            'Math puzzle games'
          ],
          recommendationCount: 8
        },
        {
          studentId: 'peer-3',
          name: 'Sofia Rodriguez',
          avatar: '/avatars/sofia.jpg',
          similarityScore: 74,
          sharedInterests: ['Art', 'Music', 'Science'],
          learningStyleMatch: 71,
          successfulContent: [
            'Digital art projects',
            'Music theory games',
            'Chemistry experiments'
          ],
          recommendationCount: 6
        }
      ]);

      // Initialize analytics
      setAnalytics({
        recommendationAccuracy: 89,
        acceptanceRate: 76,
        completionRate: 82,
        averageRating: 4.3,
        impactScore: 85,
        trendsData: {
          weekly: [78, 82, 85, 89, 87, 91, 88],
          accuracy: [85, 87, 88, 89, 90, 89, 91],
          engagement: [72, 76, 79, 83, 85, 87, 89]
        }
      });

      setIsLoading(false);
    }, 1500);
  }, [studentId]);

  const generateNewRecommendations = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate AI generation process
    setTimeout(() => {
      const newRecommendation: SmartRecommendation = {
        id: `rec-${Date.now()}`,
        studentId,
        type: 'skill-gap',
        title: 'Multiplication Fluency Booster',
        description: 'Strengthen your multiplication facts with this adaptive game that adjusts to your speed.',
        reasoning: 'Analysis shows multiplication speed is below grade level (65th percentile). This targeted practice will improve fluency and build confidence for more advanced math concepts.',
        confidence: 87,
        priority: 'high',
        estimatedImpact: 22,
        timeToComplete: 15,
        difficulty: 60,
        contentIds: ['math-multiplication-fluency'],
        skills: ['Multiplication Facts', 'Mental Math', 'Number Fluency'],
        learningObjectives: [
          'Recall multiplication facts 0-12',
          'Improve calculation speed',
          'Build math confidence'
        ],
        prerequisites: ['Basic multiplication concepts'],
        alternatives: [],
        metadata: {
          engineUsed: 'adaptive-engine',
          modelVersion: 'AdaptiveAI-v1.8',
          inputFeatures: ['skill_assessment', 'response_time', 'accuracy_patterns'],
          similarStudents: ['student-456', 'student-789'],
          contextFactors: ['skill_gap_identified', 'foundational_skill'],
          adaptationReasons: ['skill_gap_intervention'],
          qualityScore: 86,
          noveltyScore: 65,
          relevanceScore: 92
        },
        createdAt: new Date(),
        status: 'pending'
      };
      
      setRecommendations(prev => [newRecommendation, ...prev]);
      setIsGenerating(false);
    }, 2000);
  }, [studentId]);

  const acceptRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, status: 'accepted' } : rec
    ));
  };

  const rejectRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, status: 'rejected' } : rec
    ));
  };

  const submitFeedback = (id: string, feedback: StudentFeedback) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, feedback, status: 'completed' } : rec
    ));
  };

  const getTypeIcon = (type: SmartRecommendation['type']) => {
    switch (type) {
      case 'next-activity': return <Play className="w-5 h-5" />;
      case 'skill-gap': return <Target className="w-5 h-5" />;
      case 'enrichment': return <Star className="w-5 h-5" />;
      case 'review': return <RefreshCw className="w-5 h-5" />;
      case 'challenge': return <Zap className="w-5 h-5" />;
      case 'break': return <Clock className="w-5 h-5" />;
      case 'social': return <Users className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: SmartRecommendation['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPatternImpactColor = (impact: LearningPattern['impact']) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filterType === 'all') return true;
    return rec.type === filterType;
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'confidence':
        return b.confidence - a.confidence;
      case 'impact':
        return b.estimatedImpact - a.estimatedImpact;
      case 'time':
        return a.timeToComplete - b.timeToComplete;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Robot className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-pulse" />
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-gray-600">AI is analyzing your learning data...</p>
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
            <Robot className="w-8 h-8 text-purple-600" />
            AI Learning Recommendations
          </h1>
          <p className="text-gray-600 mt-1">
            Intelligent suggestions powered by machine learning
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={generateNewRecommendations}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Get New Suggestions'}
          </Button>
          
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure AI
          </Button>
        </div>
      </div>

      {/* AI Insights Alert */}
      <Alert>
        <Wand2 className="w-4 h-4" />
        <AlertDescription>
          <strong>AI Insight:</strong> Based on analysis of {learningPatterns.length} learning patterns, 
          your optimal learning setup is visual content during 9-11 AM with 25-minute focused sessions. 
          Current recommendation accuracy: {analytics.recommendationAccuracy}%
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="patterns">Learning Patterns</TabsTrigger>
          <TabsTrigger value="peers">Peer Insights</TabsTrigger>
          <TabsTrigger value="engines">AI Engines</TabsTrigger>
          <TabsTrigger value="feedback">Analytics</TabsTrigger>
        </TabsList>

        {/* Smart Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Personalized Recommendations</h2>
              <Badge variant="secondary">
                {recommendations.filter(r => r.status === 'pending').length} new
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="next-activity">Next Activities</SelectItem>
                  <SelectItem value="skill-gap">Skill Building</SelectItem>
                  <SelectItem value="enrichment">Enrichment</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="challenge">Challenges</SelectItem>
                  <SelectItem value="break">Breaks</SelectItem>
                  <SelectItem value="social">Social Learning</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                  <SelectItem value="impact">Impact</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            {sortedRecommendations
              .filter(rec => rec.status === 'pending')
              .map((recommendation) => (
              <SmartRecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onAccept={() => acceptRecommendation(recommendation.id)}
                onReject={() => rejectRecommendation(recommendation.id)}
                onViewDetails={() => setSelectedRecommendation(recommendation)}
              />
            ))}
            
            {sortedRecommendations.filter(r => r.status === 'pending').length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No new recommendations available</p>
                <p className="text-sm">Generate new suggestions based on your latest activity</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Learning Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Discovered Learning Patterns</h2>
            <Badge variant="outline">{learningPatterns.length} patterns identified</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningPatterns.map((pattern) => (
              <Card key={pattern.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pattern.pattern}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                    </div>
                    <Badge className={getPatternImpactColor(pattern.impact)}>
                      {pattern.impact}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-gray-500">STRENGTH</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={pattern.strength} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{pattern.strength}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-500">FREQUENCY</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={pattern.frequency * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{Math.round(pattern.frequency * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-500">EXAMPLES</Label>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {pattern.examples.map((example, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-purple-600 rounded-full flex-shrink-0"></div>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>First observed: {pattern.firstObserved.toLocaleDateString()}</span>
                    {pattern.actionable && (
                      <Badge variant="outline" className="text-xs">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        Actionable
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Peer Insights Tab */}
        <TabsContent value="peers" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Learning from Similar Students</h2>
            <Badge variant="outline">{peerData.length} similar learners found</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {peerData.map((peer) => (
              <Card key={peer.studentId}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={peer.avatar} />
                      <AvatarFallback>
                        {peer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{peer.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {peer.similarityScore}% similarity match
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-gray-500">SHARED INTERESTS</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {peer.sharedInterests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-500">LEARNING STYLE MATCH</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={peer.learningStyleMatch} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{peer.learningStyleMatch}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-500">SUCCESSFUL CONTENT</Label>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {peer.successfulContent.slice(0, 3).map((content, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                          {content}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {peer.recommendationCount} recommendations from this peer
                    </span>
                    <Button variant="outline" size="sm">
                      <Share className="w-3 h-3 mr-1" />
                      View Content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Engines Tab */}
        <TabsContent value="engines" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">AI Recommendation Engines</h2>
            <Badge variant="outline">{engines.filter(e => e.isActive).length} active engines</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {engines.map((engine) => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="feedback" className="space-y-6">
          {analytics && <RecommendationAnalytics analytics={analytics} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Smart Recommendation Card Component
interface SmartRecommendationCardProps {
  recommendation: SmartRecommendation;
  onAccept: () => void;
  onReject: () => void;
  onViewDetails: () => void;
}

const SmartRecommendationCard: React.FC<SmartRecommendationCardProps> = ({
  recommendation,
  onAccept,
  onReject,
  onViewDetails
}) => {
  return (
    <Card className={`border-l-4 ${getPriorityColor(recommendation.priority).replace('text-', 'border-').replace(' bg-', '').replace(' border-', ' border-l-')}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-1">
            {getTypeIcon(recommendation.type)}
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-lg">{recommendation.title}</h4>
                <p className="text-gray-600 mt-1">{recommendation.description}</p>
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{recommendation.timeToComplete} min</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>+{recommendation.estimatedImpact}% impact</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Level {Math.round(recommendation.difficulty / 10)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>{recommendation.metadata.engineUsed}</span>
              </div>
            </div>
            
            <div>
              <Label className="text-xs font-medium text-gray-500">AI REASONING</Label>
              <p className="text-sm text-gray-700 mt-1">{recommendation.reasoning}</p>
            </div>
            
            <div>
              <Label className="text-xs font-medium text-gray-500">SKILLS YOU'LL DEVELOP</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {recommendation.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Button onClick={onAccept} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Start Learning
              </Button>
              <Button variant="outline" onClick={onViewDetails}>
                <Eye className="w-4 h-4 mr-2" />
                Details
              </Button>
              <Button variant="outline" size="sm" onClick={onReject}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Engine Card Component
interface EngineCardProps {
  engine: RecommendationEngine;
}

const EngineCard: React.FC<EngineCardProps> = ({ engine }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{engine.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{engine.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={engine.isActive ? "default" : "secondary"}>
              {engine.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="outline">{engine.aiModel}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium text-gray-500">CONFIDENCE</Label>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={engine.confidence} className="flex-1 h-2" />
              <span className="text-sm font-medium">{engine.confidence}%</span>
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-500">ACCURACY</Label>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={engine.accuracy} className="flex-1 h-2" />
              <span className="text-sm font-medium">{engine.accuracy}%</span>
            </div>
          </div>
        </div>
        
        <div>
          <Label className="text-xs font-medium text-gray-500">KEY PARAMETERS</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            <div className="flex justify-between">
              <span>Learning Style:</span>
              <span>{Math.round(engine.parameters.learningStyleWeight * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Performance:</span>
              <span>{Math.round(engine.parameters.performanceWeight * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Interest:</span>
              <span>{Math.round(engine.parameters.interestWeight * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Difficulty Adapt:</span>
              <span>{Math.round(engine.parameters.difficultyAdaptation * 100)}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Last trained: {engine.lastTrained.toLocaleDateString()}</span>
          <div className="flex items-center gap-1">
            <Switch checked={engine.isActive} size="sm" />
            <Settings className="w-4 h-4 cursor-pointer" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Recommendation Analytics Component
interface RecommendationAnalyticsProps {
  analytics: any;
}

const RecommendationAnalytics: React.FC<RecommendationAnalyticsProps> = ({
  analytics
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Recommendation Performance Analytics</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recommendation Accuracy</p>
                <p className="text-2xl font-bold text-green-600">{analytics.recommendationAccuracy}%</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acceptance Rate</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.acceptanceRate}%</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.completionRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.averageRating}/5</p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Recommendation Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trendsData.accuracy.map((value: number, index: number) => ({
                week: `Week ${index + 1}`,
                accuracy: value
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Student Engagement Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.trendsData.engagement.map((value: number, index: number) => ({
                week: `Week ${index + 1}`,
                engagement: value
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="engagement" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AILearningRecommendations;