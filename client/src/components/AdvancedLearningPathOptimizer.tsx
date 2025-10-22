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
import { Textarea } from '@/components/ui/textarea';

import {
  Sankey,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  TreeMap,
  ComposedChart
} from 'recharts';

import {
  Route,
  Map,
  MapPin,
  Navigation,
  Compass,
  Target,
  Flag,
  Star,
  Trophy,
  Award,
  Zap,
  Brain,
  Lightbulb,
  BookOpen,
  PlayCircle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Users,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Settings,
  Filter,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Save,
  Download,
  Upload,
  Share,
  Bookmark,
  Pin,
  Archive,
  RefreshCw,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Play,
  Pause,
  Square,
  Maximize,
  Minimize,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Network,
  GitBranch,
  Workflow,
  Database,
  Cpu,
  Monitor,
  Smartphone,
  Tablet,
  Headphones,
  Volume2,
  VolumeX,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff
} from 'lucide-react';

interface AdvancedLearningPathOptimizerProps {
  studentId: string;
  currentSubject?: string;
  onPathUpdate?: (path: LearningPath) => void;
}

interface LearningPath {
  id: string;
  studentId: string;
  name: string;
  subject: string;
  description: string;
  totalNodes: number;
  completedNodes: number;
  estimatedDuration: number; // in hours
  difficultyProgression: DifficultyProgression;
  adaptations: PathAdaptation[];
  milestones: Milestone[];
  nodes: LearningNode[];
  connections: PathConnection[];
  metadata: PathMetadata;
  performance: PathPerformance;
  predictions: PathPrediction[];
  createdAt: Date;
  lastOptimized: Date;
  nextOptimization: Date;
}

interface LearningNode {
  id: string;
  type: 'concept' | 'skill' | 'assessment' | 'practice' | 'project' | 'review' | 'enrichment';
  title: string;
  description: string;
  subject: string;
  topic: string;
  prerequisiteIds: string[];
  dependentIds: string[];
  estimatedTime: number; // in minutes
  difficultyLevel: number; // 1-10
  masteryThreshold: number; // percentage
  contentIds: string[];
  assessmentIds: string[];
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered' | 'skipped';
  completionDate?: Date;
  attempts: number;
  bestScore: number;
  timeSpent: number;
  engagementScore: number;
  adaptations: NodeAdaptation[];
  position: NodePosition;
  learningObjectives: string[];
  skills: string[];
  concepts: string[];
}

interface PathConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  connectionType: 'prerequisite' | 'sequence' | 'optional' | 'alternative' | 'enrichment';
  strength: number; // 0-1
  conditions: ConnectionCondition[];
  adaptiveWeight: number;
  isActive: boolean;
}

interface ConnectionCondition {
  type: 'mastery' | 'time' | 'performance' | 'preference' | 'difficulty';
  parameter: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number;
  weight: number;
}

interface DifficultyProgression {
  startLevel: number;
  currentLevel: number;
  targetLevel: number;
  adaptiveRate: number;
  progressionType: 'linear' | 'exponential' | 'adaptive' | 'personalized';
  milestoneAdjustments: DifficultyAdjustment[];
}

interface DifficultyAdjustment {
  nodeId: string;
  originalDifficulty: number;
  adjustedDifficulty: number;
  reason: string;
  timestamp: Date;
  effectiveness?: number;
}

interface PathAdaptation {
  id: string;
  type: 'route_change' | 'difficulty_adjustment' | 'content_substitution' | 'pacing_modification' | 'enrichment_addition';
  description: string;
  trigger: AdaptationTrigger;
  changes: PathChange[];
  timestamp: Date;
  effectiveness?: number;
  confidence: number;
  impactRadius: number; // nodes affected
}

interface AdaptationTrigger {
  type: 'performance' | 'engagement' | 'time' | 'mastery' | 'preference' | 'external';
  condition: string;
  threshold: number;
  data: Record<string, any>;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface PathChange {
  elementType: 'node' | 'connection' | 'sequence' | 'milestone';
  elementId: string;
  changeType: 'add' | 'remove' | 'modify' | 'reorder';
  fromValue: any;
  toValue: any;
  reason: string;
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  nodeIds: string[];
  requiredMastery: number;
  estimatedCompletion: Date;
  actualCompletion?: Date;
  rewards: MilestoneReward[];
  celebrations: Celebration[];
  isCompleted: boolean;
  progress: number;
}

interface MilestoneReward {
  type: 'badge' | 'points' | 'unlock' | 'privilege' | 'recognition';
  value: string;
  description: string;
}

interface Celebration {
  type: 'visual' | 'audio' | 'interactive' | 'social';
  content: string;
  duration: number;
}

interface NodePosition {
  x: number;
  y: number;
  layer: number;
  cluster?: string;
}

interface NodeAdaptation {
  type: 'difficulty' | 'content' | 'modality' | 'timing' | 'scaffolding';
  description: string;
  timestamp: Date;
  effectiveness?: number;
}

interface PathMetadata {
  learningStyle: string[];
  preferredModalities: string[];
  cognitiveProfile: CognitiveProfile;
  motivationalFactors: MotivationalFactor[];
  constraints: LearningConstraint[];
  goals: LearningGoal[];
  context: LearningContext;
}

interface CognitiveProfile {
  workingMemoryCapacity: number;
  processingSpeed: number;
  attentionSpan: number;
  cognitiveFlexibility: number;
  metacognitionLevel: number;
  learningPreferences: LearningPreference[];
}

interface LearningPreference {
  dimension: string;
  value: number;
  confidence: number;
  stability: number;
}

interface MotivationalFactor {
  type: 'intrinsic' | 'extrinsic';
  factor: string;
  strength: number;
  persistence: number;
  context: string[];
}

interface LearningConstraint {
  type: 'time' | 'device' | 'environment' | 'accessibility' | 'curriculum';
  description: string;
  severity: 'low' | 'medium' | 'high';
  workarounds: string[];
}

interface LearningGoal {
  id: string;
  type: 'skill' | 'concept' | 'competency' | 'milestone' | 'personal';
  description: string;
  targetDate: Date;
  priority: number;
  progress: number;
  subgoals: SubGoal[];
}

interface SubGoal {
  id: string;
  description: string;
  isCompleted: boolean;
  weight: number;
}

interface LearningContext {
  timeAvailable: number; // minutes per session
  sessionFrequency: number; // per week
  preferredTimes: string[];
  environment: string;
  supportLevel: string;
  collaborationPreference: string;
}

interface PathPerformance {
  overallProgress: number;
  averageNodeCompletion: number;
  masteryRate: number;
  timeEfficiency: number;
  engagementLevel: number;
  adaptationSuccess: number;
  predictionAccuracy: number;
  satisfactionScore: number;
  challengeLevel: number;
  retentionRate: number;
}

interface PathPrediction {
  type: 'completion_time' | 'mastery_level' | 'difficulty_adjustment' | 'engagement_drop' | 'acceleration_opportunity';
  description: string;
  confidence: number;
  timeframe: string;
  value: number;
  factors: PredictionFactor[];
  recommendations: PredictionRecommendation[];
}

interface PredictionFactor {
  factor: string;
  weight: number;
  direction: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

interface PredictionRecommendation {
  action: string;
  rationale: string;
  expectedImpact: number;
  implementationDifficulty: string;
  timeToSeeResults: number;
}

interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'engagement' | 'efficiency' | 'mastery' | 'personalization';
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
  successRate: number;
  applications: number;
}

const AdvancedLearningPathOptimizer: React.FC<AdvancedLearningPathOptimizerProps> = ({
  studentId,
  currentSubject = 'Mathematics',
  onPathUpdate
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'nodes' | 'optimization' | 'analytics' | 'settings'>('overview');
  const [selectedNode, setSelectedNode] = useState<LearningNode | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'timeline' | 'layers' | 'clusters'>('graph');
  
  // Data state
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([]);
  const [alternativePaths, setAlternativePaths] = useState<LearningPath[]>([]);
  
  // Settings state
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [optimizationFrequency, setOptimizationFrequency] = useState(24); // hours
  const [adaptationSensitivity, setAdaptationSensitivity] = useState([75]);

  // Sample data initialization
  useEffect(() => {
    const initializeData = async () => {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Initialize learning path
      setLearningPath({
        id: 'path-math-fractions',
        studentId,
        name: 'Comprehensive Fractions Mastery',
        subject: 'Mathematics',
        description: 'Adaptive learning path for complete fraction understanding and application',
        totalNodes: 24,
        completedNodes: 7,
        estimatedDuration: 18.5,
        difficultyProgression: {
          startLevel: 4,
          currentLevel: 6,
          targetLevel: 8,
          adaptiveRate: 0.3,
          progressionType: 'adaptive',
          milestoneAdjustments: [
            {
              nodeId: 'node-5',
              originalDifficulty: 6,
              adjustedDifficulty: 5,
              reason: 'Student showed early mastery of prerequisite concepts',
              timestamp: new Date('2025-10-23T10:15:00'),
              effectiveness: 87
            }
          ]
        },
        adaptations: [
          {
            id: 'adapt-1',
            type: 'route_change',
            description: 'Added enrichment branch for advanced fraction operations',
            trigger: {
              type: 'mastery',
              condition: 'average_mastery > 90%',
              threshold: 90,
              data: { average_mastery: 93, consecutive_masteries: 4 },
              urgency: 'medium'
            },
            changes: [
              {
                elementType: 'node',
                elementId: 'enrichment-complex-fractions',
                changeType: 'add',
                fromValue: null,
                toValue: { position: 'after_node_12', difficulty: 8 },
                reason: 'Student ready for advanced challenges'
              }
            ],
            timestamp: new Date('2025-10-23T10:20:00'),
            effectiveness: 91,
            confidence: 88,
            impactRadius: 3
          }
        ],
        milestones: [
          {
            id: 'milestone-1',
            name: 'Basic Fraction Understanding',
            description: 'Identify, compare, and represent simple fractions',
            nodeIds: ['node-1', 'node-2', 'node-3', 'node-4'],
            requiredMastery: 85,
            estimatedCompletion: new Date('2025-10-25T16:00:00'),
            actualCompletion: new Date('2025-10-23T14:30:00'),
            rewards: [
              {
                type: 'badge',
                value: 'Fraction Explorer',
                description: 'Mastered basic fraction concepts'
              },
              {
                type: 'points',
                value: '250',
                description: 'Excellence in foundational understanding'
              }
            ],
            celebrations: [
              {
                type: 'visual',
                content: 'animated_badge_unlock',
                duration: 3000
              }
            ],
            isCompleted: true,
            progress: 100
          },
          {
            id: 'milestone-2',
            name: 'Equivalent Fractions Mastery',
            description: 'Create and identify equivalent fractions confidently',
            nodeIds: ['node-5', 'node-6', 'node-7', 'node-8'],
            requiredMastery: 80,
            estimatedCompletion: new Date('2025-10-27T16:00:00'),
            rewards: [
              {
                type: 'badge',
                value: 'Equivalence Expert',
                description: 'Mastered equivalent fraction concepts'
              }
            ],
            celebrations: [],
            isCompleted: false,
            progress: 65
          }
        ],
        nodes: generateSampleNodes(),
        connections: generateSampleConnections(),
        metadata: {
          learningStyle: ['visual', 'kinesthetic'],
          preferredModalities: ['interactive', 'visual', 'collaborative'],
          cognitiveProfile: {
            workingMemoryCapacity: 7,
            processingSpeed: 8,
            attentionSpan: 6,
            cognitiveFlexibility: 7,
            metacognitionLevel: 6,
            learningPreferences: [
              {
                dimension: 'visual_verbal',
                value: 7.5,
                confidence: 85,
                stability: 82
              },
              {
                dimension: 'sequential_global',
                value: 6.2,
                confidence: 78,
                stability: 75
              }
            ]
          },
          motivationalFactors: [
            {
              type: 'intrinsic',
              factor: 'curiosity_driven_exploration',
              strength: 8,
              persistence: 85,
              context: ['visual_patterns', 'hands_on_activities']
            },
            {
              type: 'extrinsic',
              factor: 'achievement_recognition',
              strength: 6,
              persistence: 70,
              context: ['peer_comparison', 'teacher_praise']
            }
          ],
          constraints: [
            {
              type: 'time',
              description: 'Limited to 30-minute sessions',
              severity: 'medium',
              workarounds: ['break_into_chunks', 'save_progress', 'quick_recap']
            }
          ],
          goals: [
            {
              id: 'goal-1',
              type: 'competency',
              description: 'Master all fraction operations by end of semester',
              targetDate: new Date('2025-12-15T00:00:00'),
              priority: 9,
              progress: 42,
              subgoals: [
                {
                  id: 'subgoal-1',
                  description: 'Understand fraction representation',
                  isCompleted: true,
                  weight: 20
                },
                {
                  id: 'subgoal-2',
                  description: 'Master equivalent fractions',
                  isCompleted: false,
                  weight: 25
                }
              ]
            }
          ],
          context: {
            timeAvailable: 30,
            sessionFrequency: 4,
            preferredTimes: ['after_school', 'weekend_morning'],
            environment: 'home_quiet_space',
            supportLevel: 'parent_available',
            collaborationPreference: 'small_group'
          }
        },
        performance: {
          overallProgress: 42,
          averageNodeCompletion: 87,
          masteryRate: 78,
          timeEfficiency: 92,
          engagementLevel: 85,
          adaptationSuccess: 88,
          predictionAccuracy: 82,
          satisfactionScore: 89,
          challengeLevel: 7.2,
          retentionRate: 91
        },
        predictions: [
          {
            type: 'completion_time',
            description: 'Expected to complete entire path in 14 more hours',
            confidence: 84,
            timeframe: 'next_3_weeks',
            value: 14,
            factors: [
              {
                factor: 'current_pace',
                weight: 0.4,
                direction: 'positive',
                confidence: 88
              },
              {
                factor: 'increasing_complexity',
                weight: 0.3,
                direction: 'negative',
                confidence: 76
              }
            ],
            recommendations: [
              {
                action: 'Maintain current engagement strategies',
                rationale: 'High motivation and steady progress',
                expectedImpact: 85,
                implementationDifficulty: 'easy',
                timeToSeeResults: 1
              }
            ]
          }
        ],
        createdAt: new Date('2025-10-20T08:00:00'),
        lastOptimized: new Date('2025-10-23T10:20:00'),
        nextOptimization: new Date('2025-10-24T10:20:00')
      });

      // Initialize optimization rules
      setOptimizationRules([
        {
          id: 'rule-1',
          name: 'Mastery-Based Advancement',
          description: 'Automatically advance when mastery threshold is exceeded',
          category: 'mastery',
          condition: 'node_mastery > 90% AND time_spent < expected_time * 0.8',
          action: 'unlock_advanced_content',
          priority: 9,
          isActive: true,
          successRate: 91,
          applications: 23
        },
        {
          id: 'rule-2',
          name: 'Struggle Pattern Detection',
          description: 'Provide additional support when struggle patterns emerge',
          category: 'performance',
          condition: 'consecutive_failures > 2 OR time_spent > expected_time * 2',
          action: 'add_scaffolding_nodes',
          priority: 8,
          isActive: true,
          successRate: 86,
          applications: 15
        },
        {
          id: 'rule-3',
          name: 'Engagement Optimization',
          description: 'Switch learning modalities when engagement drops',
          category: 'engagement',
          condition: 'engagement_score < 60 FOR consecutive_nodes > 2',
          action: 'switch_modality',
          priority: 7,
          isActive: true,
          successRate: 78,
          applications: 12
        },
        {
          id: 'rule-4',
          name: 'Personalized Pacing',
          description: 'Adjust content density based on processing speed',
          category: 'efficiency',
          condition: 'processing_speed < average AND cognitive_load > 75%',
          action: 'reduce_content_density',
          priority: 6,
          isActive: true,
          successRate: 83,
          applications: 8
        }
      ]);

      setIsLoading(false);
    };

    initializeData();
  }, [studentId]);

  // Generate sample nodes
  function generateSampleNodes(): LearningNode[] {
    const nodeTemplates = [
      { title: 'What is a Fraction?', type: 'concept', difficulty: 3, estimatedTime: 15 },
      { title: 'Parts of a Fraction', type: 'concept', difficulty: 3, estimatedTime: 12 },
      { title: 'Visual Fraction Models', type: 'skill', difficulty: 4, estimatedTime: 18 },
      { title: 'Fraction Assessment 1', type: 'assessment', difficulty: 4, estimatedTime: 20 },
      { title: 'Equivalent Fractions', type: 'concept', difficulty: 5, estimatedTime: 22 },
      { title: 'Finding Equivalents', type: 'skill', difficulty: 5, estimatedTime: 25 },
      { title: 'Comparing Fractions', type: 'skill', difficulty: 6, estimatedTime: 20 },
      { title: 'Fraction Comparison Practice', type: 'practice', difficulty: 6, estimatedTime: 30 },
      { title: 'Adding Like Fractions', type: 'concept', difficulty: 6, estimatedTime: 18 },
      { title: 'Addition Practice', type: 'practice', difficulty: 6, estimatedTime: 25 },
      { title: 'Subtracting Like Fractions', type: 'concept', difficulty: 6, estimatedTime: 18 },
      { title: 'Subtraction Practice', type: 'practice', difficulty: 6, estimatedTime: 25 },
      { title: 'Adding Unlike Fractions', type: 'concept', difficulty: 7, estimatedTime: 22 },
      { title: 'Unlike Addition Practice', type: 'practice', difficulty: 7, estimatedTime: 30 },
      { title: 'Mixed Numbers', type: 'concept', difficulty: 7, estimatedTime: 20 },
      { title: 'Converting Mixed Numbers', type: 'skill', difficulty: 7, estimatedTime: 25 },
      { title: 'Multiplying Fractions', type: 'concept', difficulty: 8, estimatedTime: 20 },
      { title: 'Multiplication Practice', type: 'practice', difficulty: 8, estimatedTime: 30 },
      { title: 'Dividing Fractions', type: 'concept', difficulty: 8, estimatedTime: 22 },
      { title: 'Division Practice', type: 'practice', difficulty: 8, estimatedTime: 30 },
      { title: 'Real-World Problems', type: 'project', difficulty: 9, estimatedTime: 45 },
      { title: 'Fraction Games', type: 'enrichment', difficulty: 7, estimatedTime: 35 },
      { title: 'Complex Fractions', type: 'enrichment', difficulty: 9, estimatedTime: 40 },
      { title: 'Final Assessment', type: 'assessment', difficulty: 8, estimatedTime: 30 }
    ];

    return nodeTemplates.map((template, index) => ({
      id: `node-${index + 1}`,
      type: template.type as any,
      title: template.title,
      description: `Learn ${template.title.toLowerCase()} with interactive activities and assessments`,
      subject: 'Mathematics',
      topic: 'Fractions',
      prerequisiteIds: index > 0 ? [`node-${index}`] : [],
      dependentIds: index < nodeTemplates.length - 1 ? [`node-${index + 2}`] : [],
      estimatedTime: template.estimatedTime,
      difficultyLevel: template.difficulty,
      masteryThreshold: template.type === 'assessment' ? 85 : 80,
      contentIds: [`content-${index + 1}`],
      assessmentIds: template.type === 'assessment' ? [`assessment-${index + 1}`] : [],
      status: index < 7 ? 'completed' : index === 7 ? 'in_progress' : 'locked',
      completionDate: index < 7 ? new Date(Date.now() - (7 - index) * 24 * 60 * 60 * 1000) : undefined,
      attempts: index < 7 ? Math.floor(Math.random() * 3) + 1 : 0,
      bestScore: index < 7 ? Math.floor(Math.random() * 20) + 80 : 0,
      timeSpent: index < 7 ? template.estimatedTime + Math.floor(Math.random() * 10) : 0,
      engagementScore: index < 7 ? Math.floor(Math.random() * 20) + 80 : 0,
      adaptations: [],
      position: {
        x: (index % 6) * 200 + 100,
        y: Math.floor(index / 6) * 150 + 100,
        layer: Math.floor(index / 6),
        cluster: template.type
      },
      learningObjectives: [`Understand ${template.title}`, `Apply ${template.title} concepts`],
      skills: [`${template.title}_skills`],
      concepts: [`${template.title}_concepts`]
    }));
  }

  // Generate sample connections
  function generateSampleConnections(): PathConnection[] {
    const connections: PathConnection[] = [];
    
    for (let i = 1; i < 24; i++) {
      connections.push({
        id: `conn-${i}`,
        fromNodeId: `node-${i}`,
        toNodeId: `node-${i + 1}`,
        connectionType: 'sequence',
        strength: 0.9,
        conditions: [
          {
            type: 'mastery',
            parameter: 'mastery_score',
            operator: '>=',
            value: 80,
            weight: 1.0
          }
        ],
        adaptiveWeight: 0.9,
        isActive: true
      });
    }
    
    return connections;
  }

  const optimizePath = useCallback(async () => {
    setIsOptimizing(true);
    
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (learningPath) {
      const optimizedPath = {
        ...learningPath,
        lastOptimized: new Date(),
        nextOptimization: new Date(Date.now() + optimizationFrequency * 60 * 60 * 1000),
        adaptations: [
          ...learningPath.adaptations,
          {
            id: `adapt-${Date.now()}`,
            type: 'difficulty_adjustment',
            description: 'Optimized difficulty progression based on recent performance',
            trigger: {
              type: 'performance',
              condition: 'optimization_requested',
              threshold: 0,
              data: { trigger_type: 'manual', performance_trend: 'improving' },
              urgency: 'medium'
            },
            changes: [
              {
                elementType: 'node',
                elementId: 'node-8',
                changeType: 'modify',
                fromValue: { difficulty: 6 },
                toValue: { difficulty: 7 },
                reason: 'Student ready for increased challenge'
              }
            ],
            timestamp: new Date(),
            confidence: 87,
            impactRadius: 2
          } as PathAdaptation
        ]
      };
      
      setLearningPath(optimizedPath);
      
      if (onPathUpdate) {
        onPathUpdate(optimizedPath);
      }
    }
    
    setIsOptimizing(false);
  }, [learningPath, optimizationFrequency, onPathUpdate]);

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'mastered': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'available': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'locked': return 'bg-red-100 text-red-800 border-red-200';
      case 'skipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'concept': return <BookOpen className="w-4 h-4" />;
      case 'skill': return <Target className="w-4 h-4" />;
      case 'assessment': return <CheckCircle className="w-4 h-4" />;
      case 'practice': return <RefreshCw className="w-4 h-4" />;
      case 'project': return <Star className="w-4 h-4" />;
      case 'review': return <RotateCcw className="w-4 h-4" />;
      case 'enrichment': return <Lightbulb className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Route className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Optimizing learning path...</p>
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
            <Route className="w-8 h-8 text-blue-600" />
            Advanced Learning Path Optimizer
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered personalized learning journey optimization
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-optimize">Auto-Optimize</Label>
            <Switch
              id="auto-optimize"
              checked={autoOptimization}
              onCheckedChange={setAutoOptimization}
            />
          </div>
          
          <Button 
            onClick={optimizePath}
            disabled={isOptimizing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isOptimizing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isOptimizing ? 'Optimizing...' : 'Optimize Path'}
          </Button>
        </div>
      </div>

      {/* Path Overview */}
      {learningPath && (
        <Alert>
          <Map className="w-4 h-4" />
          <AlertTitle>{learningPath.name}</AlertTitle>
          <AlertDescription>
            <div className="flex items-center gap-6 mt-2 text-sm">
              <div className="flex items-center gap-2">
                <span>Progress:</span>
                <Badge>{learningPath.completedNodes}/{learningPath.totalNodes} nodes</Badge>
                <Progress value={(learningPath.completedNodes / learningPath.totalNodes) * 100} className="w-20" />
              </div>
              <div className="flex items-center gap-2">
                <span>Est. Remaining:</span>
                <Badge variant="outline">{learningPath.estimatedDuration}h</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Difficulty:</span>
                <Badge>{learningPath.difficultyProgression.currentLevel}/10</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Performance:</span>
                <Badge className="bg-green-100 text-green-800">
                  {learningPath.performance.overallProgress}%
                </Badge>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Path Overview</TabsTrigger>
          <TabsTrigger value="nodes">Learning Nodes</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Path Analytics</TabsTrigger>
          <TabsTrigger value="settings">Optimizer Settings</TabsTrigger>
        </TabsList>

        {/* Path Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {learningPath && <PathOverviewDashboard path={learningPath} onNodeSelect={setSelectedNode} />}
        </TabsContent>

        {/* Learning Nodes Tab */}
        <TabsContent value="nodes" className="space-y-6">
          {learningPath && <LearningNodesDashboard 
            nodes={learningPath.nodes} 
            connections={learningPath.connections}
            onNodeSelect={setSelectedNode}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />}
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <OptimizationDashboard 
            rules={optimizationRules}
            path={learningPath}
            onOptimize={optimizePath}
            isOptimizing={isOptimizing}
          />
        </TabsContent>

        {/* Path Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {learningPath && <PathAnalyticsDashboard path={learningPath} />}
        </TabsContent>

        {/* Optimizer Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <OptimizerSettings 
            autoOptimization={autoOptimization}
            onAutoOptimizationChange={setAutoOptimization}
            optimizationFrequency={optimizationFrequency}
            onOptimizationFrequencyChange={setOptimizationFrequency}
            adaptationSensitivity={adaptationSensitivity[0]}
            onAdaptationSensitivityChange={(value) => setAdaptationSensitivity([value])}
          />
        </TabsContent>
      </Tabs>

      {/* Node Detail Modal */}
      {selectedNode && (
        <NodeDetailModal 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
};

// Path Overview Dashboard Component
interface PathOverviewDashboardProps {
  path: LearningPath;
  onNodeSelect: (node: LearningNode) => void;
}

const PathOverviewDashboard: React.FC<PathOverviewDashboardProps> = ({ path, onNodeSelect }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Progress Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Learning Journey Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {Math.round(path.performance.overallProgress)}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
                <Progress value={path.performance.overallProgress} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {path.performance.masteryRate}%
                </div>
                <div className="text-sm text-gray-600">Mastery Rate</div>
                <Progress value={path.performance.masteryRate} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {path.performance.engagementLevel}%
                </div>
                <div className="text-sm text-gray-600">Engagement</div>
                <Progress value={path.performance.engagementLevel} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {path.performance.timeEfficiency}%
                </div>
                <div className="text-sm text-gray-600">Time Efficiency</div>
                <Progress value={path.performance.timeEfficiency} className="mt-2" />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium mb-3 block">Active Milestones</Label>
              <div className="space-y-3">
                {path.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{milestone.name}</div>
                      <div className="text-sm text-gray-600">{milestone.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {milestone.isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-orange-600" />
                        )}
                        <Badge variant={milestone.isCompleted ? 'default' : 'outline'}>
                          {milestone.progress}%
                        </Badge>
                      </div>
                      {!milestone.isCompleted && (
                        <div className="text-xs text-gray-600">
                          Est: {milestone.estimatedCompletion.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Difficulty Progression</Label>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={(path.difficultyProgression.currentLevel / 10) * 100} className="flex-1" />
              <span className="text-sm font-medium">
                {path.difficultyProgression.currentLevel}/10
              </span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Adaptation Success Rate</Label>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={path.performance.adaptationSuccess} className="flex-1" />
              <span className="text-sm font-medium">
                {path.performance.adaptationSuccess}%
              </span>
            </div>
          </div>
          
          <div>
            <Label className="text-sm">Prediction Accuracy</Label>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={path.performance.predictionAccuracy} className="flex-1" />
              <span className="text-sm font-medium">
                {path.performance.predictionAccuracy}%
              </span>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Recent Adaptations</Label>
            <div className="space-y-2">
              {path.adaptations.slice(-3).map((adaptation) => (
                <div key={adaptation.id} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{adaptation.description}</div>
                  <div className="text-gray-600 text-xs mt-1">
                    {adaptation.timestamp.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Next Optimization</Label>
            <div className="text-sm text-gray-600">
              {path.nextOptimization.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Path Visualization */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Learning Path Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 rounded-lg p-4 overflow-auto">
            <div className="grid grid-cols-6 gap-4">
              {path.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getNodeStatusColor(node.status)}`}
                  onClick={() => onNodeSelect(node)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getNodeTypeIcon(node.type)}
                    <span className="text-xs font-medium truncate">{node.title}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {node.estimatedTime}min • L{node.difficultyLevel}
                  </div>
                  {node.status === 'completed' && (
                    <div className="text-xs text-green-600 mt-1">
                      Score: {node.bestScore}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Placeholder components for other tabs
const LearningNodesDashboard: React.FC<any> = ({ nodes, onNodeSelect, viewMode, onViewModeChange }) => (
  <div>Learning Nodes Dashboard - {viewMode} view</div>
);

const OptimizationDashboard: React.FC<any> = ({ rules, isOptimizing }) => (
  <div>Optimization Dashboard - {isOptimizing ? 'Optimizing...' : 'Ready'}</div>
);

const PathAnalyticsDashboard: React.FC<any> = ({ path }) => (
  <div>Path Analytics Dashboard</div>
);

const OptimizerSettings: React.FC<any> = ({ autoOptimization, onAutoOptimizationChange }) => (
  <div>Optimizer Settings</div>
);

const NodeDetailModal: React.FC<any> = ({ node, onClose }) => (
  <Dialog open={!!node} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{node?.title}</DialogTitle>
      </DialogHeader>
      <div>Node details for {node?.title}</div>
    </DialogContent>
  </Dialog>
);

export default AdvancedLearningPathOptimizer;