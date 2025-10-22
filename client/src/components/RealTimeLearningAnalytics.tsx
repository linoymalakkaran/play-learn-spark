import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';

import {
  Activity,
  Brain,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
  User,
  Users,
  BookOpen,
  Award,
  Star,
  Trophy,
  Lightbulb,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  MapPin,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Timer,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  Settings,
  Filter,
  Search,
  Download,
  Share,
  Bookmark,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Save,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface RealTimeLearningAnalyticsProps {
  studentId: string;
  timeframe?: 'day' | 'week' | 'month' | 'semester';
  onInsightAction?: (insight: LearningInsight) => void;
}

interface LearningSession {
  id: string;
  studentId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  activity: string;
  subject: string;
  topic: string;
  contentId: string;
  performanceMetrics: SessionPerformance;
  engagementMetrics: SessionEngagement;
  cognitiveMetrics: CognitiveMetrics;
  behavioralMetrics: BehavioralMetrics;
  environmentMetrics: EnvironmentMetrics;
  isActive: boolean;
}

interface SessionPerformance {
  accuracy: number;
  completionRate: number;
  questionsAttempted: number;
  questionsCorrect: number;
  averageResponseTime: number;
  improvementRate: number;
  masteryLevel: number;
  difficultyLevel: number;
  skillsAssessed: SkillAssessment[];
  errorPatterns: ErrorPattern[];
}

interface SessionEngagement {
  attentionScore: number;
  interactionFrequency: number;
  timeOnTask: number;
  distractionEvents: number;
  motivationIndicators: MotivationMetric[];
  emotionalState: EmotionalState;
  participationLevel: number;
  curiosityMarkers: CuriosityMarker[];
}

interface CognitiveMetrics {
  cognitiveLoad: number;
  memoryUtilization: number;
  processingSpeed: number;
  comprehensionLevel: number;
  criticalThinkingScore: number;
  problemSolvingEfficiency: number;
  creativityIndicators: CreativityIndicator[];
  metacognitionLevel: number;
}

interface BehavioralMetrics {
  persistenceLevel: number;
  helpSeekingBehavior: number;
  collaborationFrequency: number;
  selfRegulationScore: number;
  riskTakingBehavior: number;
  adaptabilityScore: number;
  communicationPatterns: CommunicationPattern[];
  socialLearningEngagement: number;
}

interface EnvironmentMetrics {
  timeOfDay: string;
  sessionLocation: string;
  deviceUsed: string;
  environmentalFactors: EnvironmentalFactor[];
  socialContext: string;
  backgroundNoise: number;
  lightingConditions: string;
  ergonomicFactors: ErgonomicFactor[];
}

interface SkillAssessment {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  progressRate: number;
  masteryConfidence: number;
  lastAssessed: Date;
  improvementAreas: string[];
}

interface ErrorPattern {
  type: string;
  frequency: number;
  context: string;
  severity: 'low' | 'medium' | 'high';
  intervention: string;
  firstOccurrence: Date;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface MotivationMetric {
  type: 'intrinsic' | 'extrinsic';
  level: number;
  indicators: string[];
  triggers: string[];
  sustainabilityScore: number;
}

interface EmotionalState {
  frustration: number;
  confidence: number;
  excitement: number;
  anxiety: number;
  satisfaction: number;
  curiosity: number;
  overall: 'positive' | 'neutral' | 'negative';
}

interface CuriosityMarker {
  type: string;
  strength: number;
  topic: string;
  timestamp: Date;
  followUpActions: string[];
}

interface CreativityIndicator {
  type: string;
  score: number;
  context: string;
  uniquenessLevel: number;
  originalityMarkers: string[];
}

interface CommunicationPattern {
  type: string;
  frequency: number;
  effectiveness: number;
  context: string;
  improvementAreas: string[];
}

interface EnvironmentalFactor {
  type: string;
  impact: 'positive' | 'negative' | 'neutral';
  strength: number;
  recommendations: string[];
}

interface ErgonomicFactor {
  aspect: string;
  rating: number;
  recommendations: string[];
}

interface LearningInsight {
  id: string;
  type: 'performance' | 'engagement' | 'cognitive' | 'behavioral' | 'environmental';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  data: Record<string, any>;
  recommendations: Recommendation[];
  actionRequired: boolean;
  timeToAddress: number; // hours
  impactLevel: number; // 1-10
  confidence: number; // percentage
  relatedInsights: string[];
  createdAt: Date;
}

interface Recommendation {
  action: string;
  rationale: string;
  expectedOutcome: string;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: number; // hours
  successProbability: number; // percentage
  resources: string[];
}

interface LearningTrend {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  rate: number;
  significance: number;
  timeframe: string;
  dataPoints: TrendDataPoint[];
  projections: TrendProjection[];
}

interface TrendDataPoint {
  timestamp: Date;
  value: number;
  context: Record<string, any>;
}

interface TrendProjection {
  timeframe: string;
  expectedValue: number;
  confidence: number;
  factors: string[];
}

const RealTimeLearningAnalytics: React.FC<RealTimeLearningAnalyticsProps> = ({
  studentId,
  timeframe = 'week',
  onInsightAction
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'trends' | 'insights' | 'comparison' | 'predictions'>('live');
  const [selectedSession, setSelectedSession] = useState<LearningSession | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  // Data state
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<LearningSession[]>([]);
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([]);
  const [learningTrends, setLearningTrends] = useState<LearningTrend[]>([]);
  const [comparativeData, setComparativeData] = useState<any[]>([]);
  
  // Filter and view state
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['accuracy', 'engagement', 'cognitive_load']);
  const [viewMode, setViewMode] = useState<'detailed' | 'summary' | 'dashboard'>('dashboard');
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Sample data initialization
  useEffect(() => {
    const initializeData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Initialize current session
      setCurrentSession({
        id: 'session-live',
        studentId,
        startTime: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
        activity: 'Interactive Fraction Explorer',
        subject: 'Mathematics',
        topic: 'Fractions',
        contentId: 'math-fractions-advanced',
        performanceMetrics: {
          accuracy: 87,
          completionRate: 75,
          questionsAttempted: 24,
          questionsCorrect: 21,
          averageResponseTime: 8.5,
          improvementRate: 12,
          masteryLevel: 79,
          difficultyLevel: 7,
          skillsAssessed: [
            {
              skillName: 'Fraction Comparison',
              currentLevel: 8,
              targetLevel: 9,
              progressRate: 15,
              masteryConfidence: 92,
              lastAssessed: new Date(),
              improvementAreas: ['complex denominators']
            },
            {
              skillName: 'Equivalent Fractions',
              currentLevel: 7,
              targetLevel: 8,
              progressRate: 8,
              masteryConfidence: 78,
              lastAssessed: new Date(),
              improvementAreas: ['pattern recognition', 'visual representation']
            }
          ],
          errorPatterns: [
            {
              type: 'Denominator Confusion',
              frequency: 3,
              context: 'Comparing fractions with different denominators',
              severity: 'medium',
              intervention: 'Visual modeling exercises',
              firstOccurrence: new Date(Date.now() - 15 * 60 * 1000),
              trend: 'decreasing'
            }
          ]
        },
        engagementMetrics: {
          attentionScore: 85,
          interactionFrequency: 2.3,
          timeOnTask: 22,
          distractionEvents: 2,
          motivationIndicators: [
            {
              type: 'intrinsic',
              level: 8,
              indicators: ['self-directed exploration', 'asking clarifying questions'],
              triggers: ['visual success patterns', 'progressive challenges'],
              sustainabilityScore: 85
            }
          ],
          emotionalState: {
            frustration: 25,
            confidence: 78,
            excitement: 72,
            anxiety: 15,
            satisfaction: 80,
            curiosity: 85,
            overall: 'positive'
          },
          participationLevel: 9,
          curiosityMarkers: [
            {
              type: 'exploratory_behavior',
              strength: 8,
              topic: 'fraction patterns',
              timestamp: new Date(),
              followUpActions: ['related content suggestions', 'advanced challenges']
            }
          ]
        },
        cognitiveMetrics: {
          cognitiveLoad: 68,
          memoryUtilization: 72,
          processingSpeed: 85,
          comprehensionLevel: 82,
          criticalThinkingScore: 76,
          problemSolvingEfficiency: 80,
          creativityIndicators: [
            {
              type: 'alternative_solutions',
              score: 7,
              context: 'fraction comparison strategies',
              uniquenessLevel: 8,
              originalityMarkers: ['visual pattern creation', 'personal mnemonics']
            }
          ],
          metacognitionLevel: 74
        },
        behavioralMetrics: {
          persistenceLevel: 88,
          helpSeekingBehavior: 6,
          collaborationFrequency: 3,
          selfRegulationScore: 79,
          riskTakingBehavior: 65,
          adaptabilityScore: 83,
          communicationPatterns: [
            {
              type: 'question_asking',
              frequency: 4,
              effectiveness: 85,
              context: 'concept clarification',
              improvementAreas: ['specificity', 'follow-up questions']
            }
          ],
          socialLearningEngagement: 72
        },
        environmentMetrics: {
          timeOfDay: 'afternoon',
          sessionLocation: 'home_study_room',
          deviceUsed: 'tablet',
          environmentalFactors: [
            {
              type: 'lighting',
              impact: 'positive',
              strength: 8,
              recommendations: ['maintain current lighting']
            },
            {
              type: 'background_noise',
              impact: 'neutral',
              strength: 3,
              recommendations: ['consider noise reduction for complex tasks']
            }
          ],
          socialContext: 'independent',
          backgroundNoise: 25,
          lightingConditions: 'natural_optimal',
          ergonomicFactors: [
            {
              aspect: 'seating_posture',
              rating: 7,
              recommendations: ['adjust tablet angle', 'consider ergonomic support']
            }
          ]
        },
        isActive: true
      });

      // Initialize learning insights
      setLearningInsights([
        {
          id: 'insight-1',
          type: 'performance',
          priority: 'medium',
          title: 'Accuracy Improvement Opportunity',
          description: 'Student shows consistent improvement in fraction comparison but struggles with complex denominators',
          data: {
            accuracy_trend: 'increasing',
            error_pattern: 'denominator_confusion',
            confidence_level: 78
          },
          recommendations: [
            {
              action: 'Provide visual denominator comparison tools',
              rationale: 'Visual aids help with abstract concept understanding',
              expectedOutcome: '15-20% improvement in denominator-related tasks',
              implementationDifficulty: 'easy',
              timeToImplement: 0.5,
              successProbability: 85,
              resources: ['interactive_visual_tools', 'guided_practice_sets']
            }
          ],
          actionRequired: true,
          timeToAddress: 2,
          impactLevel: 7,
          confidence: 85,
          relatedInsights: ['insight-3'],
          createdAt: new Date()
        },
        {
          id: 'insight-2',
          type: 'engagement',
          priority: 'high',
          title: 'High Intrinsic Motivation Detected',
          description: 'Student shows strong self-directed learning patterns and curiosity-driven exploration',
          data: {
            motivation_type: 'intrinsic',
            exploration_frequency: 'high',
            self_direction: 85
          },
          recommendations: [
            {
              action: 'Introduce advanced challenge problems',
              rationale: 'High motivation suggests readiness for increased complexity',
              expectedOutcome: 'Sustained engagement and accelerated learning',
              implementationDifficulty: 'medium',
              timeToImplement: 1,
              successProbability: 90,
              resources: ['advanced_problem_sets', 'creative_challenges']
            }
          ],
          actionRequired: false,
          timeToAddress: 1,
          impactLevel: 9,
          confidence: 92,
          relatedInsights: [],
          createdAt: new Date()
        },
        {
          id: 'insight-3',
          type: 'cognitive',
          priority: 'low',
          title: 'Optimal Cognitive Load Range',
          description: 'Current cognitive load is within optimal range for learning, with room for slight increase',
          data: {
            cognitive_load: 68,
            optimal_range: [60, 80],
            processing_efficiency: 85
          },
          recommendations: [
            {
              action: 'Gradually increase problem complexity',
              rationale: 'Student can handle additional cognitive challenge',
              expectedOutcome: 'Enhanced learning depth without overwhelming',
              implementationDifficulty: 'easy',
              timeToImplement: 0.25,
              successProbability: 80,
              resources: ['progressive_difficulty_system']
            }
          ],
          actionRequired: false,
          timeToAddress: 0.5,
          impactLevel: 6,
          confidence: 78,
          relatedInsights: ['insight-1'],
          createdAt: new Date()
        },
        {
          id: 'insight-4',
          type: 'behavioral',
          priority: 'critical',
          title: 'Exceptional Persistence Levels',
          description: 'Student demonstrates outstanding persistence and self-regulation behaviors',
          data: {
            persistence_score: 88,
            self_regulation: 79,
            help_seeking: 'appropriate'
          },
          recommendations: [
            {
              action: 'Provide leadership opportunities in collaborative learning',
              rationale: 'Strong self-regulation can benefit peer learning',
              expectedOutcome: 'Enhanced social learning and leadership skills',
              implementationDifficulty: 'medium',
              timeToImplement: 2,
              successProbability: 75,
              resources: ['peer_tutoring_programs', 'collaborative_projects']
            }
          ],
          actionRequired: false,
          timeToAddress: 24,
          impactLevel: 8,
          confidence: 87,
          relatedInsights: [],
          createdAt: new Date()
        }
      ]);

      // Initialize learning trends
      setLearningTrends([
        {
          metric: 'overall_accuracy',
          direction: 'improving',
          rate: 2.3, // percentage points per week
          significance: 0.85,
          timeframe: 'past_month',
          dataPoints: generateTrendData('accuracy', 30),
          projections: [
            {
              timeframe: 'next_week',
              expectedValue: 89,
              confidence: 78,
              factors: ['current_improvement_rate', 'consistent_engagement']
            }
          ]
        },
        {
          metric: 'engagement_score',
          direction: 'stable',
          rate: 0.1,
          significance: 0.65,
          timeframe: 'past_month',
          dataPoints: generateTrendData('engagement', 30),
          projections: [
            {
              timeframe: 'next_week',
              expectedValue: 85,
              confidence: 82,
              factors: ['stable_motivation', 'consistent_environment']
            }
          ]
        },
        {
          metric: 'cognitive_load',
          direction: 'declining',
          rate: -1.2,
          significance: 0.72,
          timeframe: 'past_month',
          dataPoints: generateTrendData('cognitive_load', 30),
          projections: [
            {
              timeframe: 'next_week',
              expectedValue: 65,
              confidence: 75,
              factors: ['skill_automation', 'improved_strategies']
            }
          ]
        }
      ]);

      setIsLoading(false);
    };

    initializeData();
  }, [studentId]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      if (currentSession) {
        setCurrentSession(prev => ({
          ...prev!,
          performanceMetrics: {
            ...prev!.performanceMetrics,
            accuracy: Math.max(70, Math.min(95, prev!.performanceMetrics.accuracy + (Math.random() - 0.5) * 2)),
            completionRate: Math.min(100, prev!.performanceMetrics.completionRate + Math.random() * 2),
            questionsAttempted: prev!.performanceMetrics.questionsAttempted + Math.floor(Math.random() * 2)
          },
          engagementMetrics: {
            ...prev!.engagementMetrics,
            attentionScore: Math.max(60, Math.min(100, prev!.engagementMetrics.attentionScore + (Math.random() - 0.5) * 5)),
            timeOnTask: prev!.engagementMetrics.timeOnTask + 0.5
          },
          cognitiveMetrics: {
            ...prev!.cognitiveMetrics,
            cognitiveLoad: Math.max(40, Math.min(90, prev!.cognitiveMetrics.cognitiveLoad + (Math.random() - 0.5) * 3))
          }
        }));
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, currentSession]);

  // Helper function to generate trend data
  function generateTrendData(metric: string, days: number): TrendDataPoint[] {
    const data: TrendDataPoint[] = [];
    const baseValue = metric === 'accuracy' ? 75 : metric === 'engagement' ? 80 : 70;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const trend = metric === 'accuracy' ? 0.5 : metric === 'engagement' ? 0.1 : -0.3;
      const noise = (Math.random() - 0.5) * 10;
      const value = Math.max(0, Math.min(100, baseValue + (days - i) * trend + noise));
      
      data.push({
        timestamp: date,
        value: Math.round(value * 10) / 10,
        context: {
          day_of_week: date.toLocaleDateString('en', { weekday: 'short' }),
          session_count: Math.floor(Math.random() * 3) + 1
        }
      });
    }
    
    return data;
  }

  const handleInsightAction = useCallback((insight: LearningInsight) => {
    if (onInsightAction) {
      onInsightAction(insight);
    }
    
    // Mark insight as addressed
    setLearningInsights(prev => prev.map(i => 
      i.id === insight.id ? { ...i, actionRequired: false } : i
    ));
  }, [onInsightAction]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'performance': return <Target className="w-5 h-5" />;
      case 'engagement': return <Heart className="w-5 h-5" />;
      case 'cognitive': return <Brain className="w-5 h-5" />;
      case 'behavioral': return <User className="w-5 h-5" />;
      case 'environmental': return <MapPin className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <ArrowRight className="w-4 h-4 text-blue-600" />;
      default: return <ArrowRight className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading learning analytics...</p>
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
            <Activity className="w-8 h-8 text-blue-600" />
            Real-time Learning Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Live monitoring and intelligent insights for personalized learning
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label>Interval:</Label>
            <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">1m</SelectItem>
                <SelectItem value="300">5m</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Live Status */}
      {currentSession && (
        <Alert>
          <PlayCircle className="w-4 h-4" />
          <AlertTitle>Active Learning Session</AlertTitle>
          <AlertDescription>
            <div className="flex items-center gap-6 mt-2 text-sm">
              <div className="flex items-center gap-2">
                <span>Activity:</span>
                <Badge variant="outline">{currentSession.activity}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Duration:</span>
                <Badge>{Math.round((Date.now() - currentSession.startTime.getTime()) / (1000 * 60))} min</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Accuracy:</span>
                <Badge className="bg-green-100 text-green-800">
                  {currentSession.performanceMetrics.accuracy}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Engagement:</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {currentSession.engagementMetrics.attentionScore}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Load:</span>
                <Badge className="bg-orange-100 text-orange-800">
                  {currentSession.cognitiveMetrics.cognitiveLoad}%
                </Badge>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="live">Live Session</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="trends">Learning Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* Live Session Tab */}
        <TabsContent value="live" className="space-y-6">
          {currentSession && <LiveSessionDashboard session={currentSession} />}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <InsightsDashboard 
            insights={learningInsights}
            onInsightAction={handleInsightAction}
          />
        </TabsContent>

        {/* Learning Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <TrendsDashboard trends={learningTrends} />
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <ComparisonDashboard studentId={studentId} />
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <PredictionsDashboard trends={learningTrends} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Live Session Dashboard Component
interface LiveSessionDashboardProps {
  session: LearningSession;
}

const LiveSessionDashboard: React.FC<LiveSessionDashboardProps> = ({ session }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Performance Metrics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {session.performanceMetrics.accuracy}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
              <Progress value={session.performanceMetrics.accuracy} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {session.performanceMetrics.masteryLevel}%
              </div>
              <div className="text-sm text-gray-600">Mastery</div>
              <Progress value={session.performanceMetrics.masteryLevel} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {session.performanceMetrics.averageResponseTime}s
              </div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {session.performanceMetrics.questionsCorrect}/{session.performanceMetrics.questionsAttempted}
              </div>
              <div className="text-sm text-gray-600">Correct/Total</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <Label className="text-sm font-medium mb-3 block">Skill Assessment</Label>
            <div className="space-y-3">
              {session.performanceMetrics.skillsAssessed.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{skill.skillName}</div>
                    <div className="text-sm text-gray-600">
                      Level {skill.currentLevel}/10 → Target: {skill.targetLevel}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{skill.progressRate}% progress</Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      {skill.masteryConfidence}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Attention Score</Label>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={session.engagementMetrics.attentionScore} className="flex-1" />
              <span className="text-sm font-medium w-12">
                {session.engagementMetrics.attentionScore}%
              </span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Cognitive Load</Label>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={session.cognitiveMetrics.cognitiveLoad} className="flex-1" />
              <span className="text-sm font-medium w-12">
                {session.cognitiveMetrics.cognitiveLoad}%
              </span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Emotional State</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className="font-medium">{session.engagementMetrics.emotionalState.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span>Excitement:</span>
                <span className="font-medium">{session.engagementMetrics.emotionalState.excitement}%</span>
              </div>
              <div className="flex justify-between">
                <span>Frustration:</span>
                <span className="font-medium">{session.engagementMetrics.emotionalState.frustration}%</span>
              </div>
              <div className="flex justify-between">
                <span>Curiosity:</span>
                <span className="font-medium">{session.engagementMetrics.emotionalState.curiosity}%</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Behavioral Indicators</Label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Persistence</span>
                <Badge variant="outline">{session.behavioralMetrics.persistenceLevel}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Self-regulation</span>
                <Badge variant="outline">{session.behavioralMetrics.selfRegulationScore}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Help-seeking</span>
                <Badge variant="outline">{session.behavioralMetrics.helpSeekingBehavior}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment & Context */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Learning Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Session Context</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Time of Day:</span>
                  <Badge variant="outline">{session.environmentMetrics.timeOfDay}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <Badge variant="outline">{session.environmentMetrics.sessionLocation}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Device:</span>
                  <Badge variant="outline">{session.environmentMetrics.deviceUsed}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Social Context:</span>
                  <Badge variant="outline">{session.environmentMetrics.socialContext}</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">Environmental Factors</Label>
              <div className="space-y-2">
                {session.environmentMetrics.environmentalFactors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{factor.type}:</span>
                    <Badge className={
                      factor.impact === 'positive' ? 'bg-green-100 text-green-800' :
                      factor.impact === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {factor.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">Error Patterns</Label>
              <div className="space-y-2">
                {session.performanceMetrics.errorPatterns.map((pattern, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{pattern.type}</div>
                    <div className="text-gray-600">Frequency: {pattern.frequency}</div>
                    <div className="text-gray-600">Trend: {pattern.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Insights Dashboard Component
interface InsightsDashboardProps {
  insights: LearningInsight[];
  onInsightAction: (insight: LearningInsight) => void;
}

const InsightsDashboard: React.FC<InsightsDashboardProps> = ({ insights, onInsightAction }) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredInsights = insights.filter(insight => {
    const priorityMatch = filterPriority === 'all' || insight.priority === filterPriority;
    const typeMatch = filterType === 'all' || insight.type === filterType;
    return priorityMatch && typeMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">AI-Generated Learning Insights</h2>
        <div className="flex items-center gap-4">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="cognitive">Cognitive</SelectItem>
              <SelectItem value="behavioral">Behavioral</SelectItem>
              <SelectItem value="environmental">Environmental</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInsights.map((insight) => (
          <Card key={insight.id} className={`border-l-4 ${getPriorityColor(insight.priority)}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getMetricIcon(insight.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <p className="text-gray-600 mt-1">{insight.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority}
                  </Badge>
                  <Badge variant="outline">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-gray-500 mb-2 block">
                  RECOMMENDATIONS
                </Label>
                <div className="space-y-2">
                  {insight.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm">{rec.action}</div>
                      <div className="text-xs text-gray-600 mt-1">{rec.rationale}</div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {rec.successProbability}% success rate
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {rec.timeToImplement}h to implement
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">Impact: {insight.impactLevel}/10</span>
                  <span className="text-gray-500">
                    {insight.actionRequired ? 'Action Required' : 'Informational'}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onInsightAction(insight)}
                  disabled={!insight.actionRequired}
                >
                  {insight.actionRequired ? 'Take Action' : 'Noted'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Trends Dashboard Component
interface TrendsDashboardProps {
  trends: LearningTrend[];
}

const TrendsDashboard: React.FC<TrendsDashboardProps> = ({ trends }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Learning Trends & Patterns</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {trends.map((trend, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">
                  {trend.metric.replace('_', ' ')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getDirectionIcon(trend.direction)}
                  <Badge variant="outline">
                    {trend.direction}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend.dataPoints}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number) => [`${value}%`, trend.metric]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">RATE OF CHANGE</Label>
                    <div className="font-medium">
                      {trend.rate > 0 ? '+' : ''}{trend.rate}% per week
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">SIGNIFICANCE</Label>
                    <div className="font-medium">
                      {Math.round(trend.significance * 100)}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500 mb-2 block">NEXT WEEK PROJECTION</Label>
                  {trend.projections.map((projection, projIndex) => (
                    <div key={projIndex} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between">
                        <span>Expected Value:</span>
                        <span className="font-medium">{projection.expectedValue}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-medium">{projection.confidence}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Comparison Dashboard Component
interface ComparisonDashboardProps {
  studentId: string;
}

const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ studentId }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Performance Comparison</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Peer Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">78th</div>
                <div className="text-sm text-gray-600">Percentile in Grade Level</div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Mathematics</span>
                    <span className="text-sm font-medium">85th percentile</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Reading</span>
                    <span className="text-sm font-medium">72nd percentile</span>
                  </div>
                  <Progress value={72} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Science</span>
                    <span className="text-sm font-medium">79th percentile</span>
                  </div>
                  <Progress value={79} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Historical Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-green-600">+12%</div>
                  <div className="text-xs text-gray-600">This Month</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">+28%</div>
                  <div className="text-xs text-gray-600">This Quarter</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">+45%</div>
                  <div className="text-xs text-gray-600">This Year</div>
                </div>
              </div>
              
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'Jan', progress: 45 },
                    { month: 'Feb', progress: 52 },
                    { month: 'Mar', progress: 58 },
                    { month: 'Apr', progress: 65 },
                    { month: 'May', progress: 73 },
                    { month: 'Jun', progress: 78 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="progress" 
                      stroke="#3b82f6" 
                      fill="#93c5fd" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Predictions Dashboard Component
interface PredictionsDashboardProps {
  trends: LearningTrend[];
}

const PredictionsDashboard: React.FC<PredictionsDashboardProps> = ({ trends }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">AI Predictions & Forecasts</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Outcome Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">92%</div>
                <div className="text-sm text-gray-600">Predicted mastery by end of unit</div>
                <div className="text-xs text-gray-500 mt-1">Based on current trends</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fraction Mastery</span>
                  <div className="flex items-center gap-2">
                    <Progress value={87} className="w-20" />
                    <span className="text-sm font-medium">87%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Problem Solving</span>
                  <div className="flex items-center gap-2">
                    <Progress value={79} className="w-20" />
                    <span className="text-sm font-medium">79%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Conceptual Understanding</span>
                  <div className="flex items-center gap-2">
                    <Progress value={84} className="w-20" />
                    <span className="text-sm font-medium">84%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recommended Interventions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Visual Fraction Models</div>
                <div className="text-xs text-gray-600 mt-1">
                  Predicted to improve understanding by 15%
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">High Impact</Badge>
                  <span className="text-xs text-gray-500">2 weeks</span>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Peer Collaboration</div>
                <div className="text-xs text-gray-600 mt-1">
                  Predicted to boost engagement by 20%
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">Medium Impact</Badge>
                  <span className="text-xs text-gray-500">1 week</span>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Adaptive Difficulty</div>
                <div className="text-xs text-gray-600 mt-1">
                  Predicted to maintain optimal challenge level
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">Ongoing</Badge>
                  <span className="text-xs text-gray-500">Immediate</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeLearningAnalytics;