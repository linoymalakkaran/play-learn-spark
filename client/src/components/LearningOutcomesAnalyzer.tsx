import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart
} from 'recharts';

import {
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  BookOpen,
  Users,
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  Info,
  Settings,
  Calendar,
  Grid,
  List,
  Search,
  Plus
} from 'lucide-react';

interface LearningOutcomesAnalyzerProps {
  classId?: string;
  studentId?: string;
  userRole?: 'teacher' | 'parent' | 'admin';
}

interface LearningOutcome {
  id: string;
  title: string;
  description: string;
  category: string;
  standardId: string;
  targetMastery: number;
  currentMastery: number;
  trend: 'improving' | 'stable' | 'declining';
  activities: string[];
  assessmentDate: Date;
  dueDate?: Date;
}

interface SkillArea {
  id: string;
  name: string;
  description: string;
  outcomes: LearningOutcome[];
  overallMastery: number;
  studentsAtMastery: number;
  totalStudents: number;
  lastAssessed: Date;
}

interface StandardsAlignment {
  standardId: string;
  name: string;
  category: string;
  alignedOutcomes: string[];
  masteryLevel: number;
  coverage: number;
}

interface PerformanceGap {
  area: string;
  expectedLevel: number;
  actualLevel: number;
  gap: number;
  affectedStudents: number;
  severity: 'low' | 'medium' | 'high';
  interventions: string[];
}

const LearningOutcomesAnalyzer: React.FC<LearningOutcomesAnalyzerProps> = ({
  classId,
  studentId,
  userRole = 'teacher'
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'outcomes' | 'standards' | 'gaps' | 'interventions'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('quarter');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['all']);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(['all']);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  // Data
  const [skillAreas, setSkillAreas] = useState<SkillArea[]>([
    {
      id: 'reading',
      name: 'Reading Comprehension',
      description: 'Understanding and interpreting written text',
      overallMastery: 78,
      studentsAtMastery: 18,
      totalStudents: 25,
      lastAssessed: new Date('2024-01-20'),
      outcomes: [
        {
          id: 'reading-1',
          title: 'Identify Main Idea',
          description: 'Students can identify the main idea in grade-level texts',
          category: 'Comprehension',
          standardId: 'CCSS.ELA-LITERACY.RL.3.2',
          targetMastery: 80,
          currentMastery: 82,
          trend: 'improving',
          activities: ['reading-adventure', 'story-detective'],
          assessmentDate: new Date('2024-01-20')
        },
        {
          id: 'reading-2',
          title: 'Make Inferences',
          description: 'Students can make logical inferences from text evidence',
          category: 'Critical Thinking',
          standardId: 'CCSS.ELA-LITERACY.RL.3.1',
          targetMastery: 75,
          currentMastery: 68,
          trend: 'stable',
          activities: ['inference-island', 'clue-collector'],
          assessmentDate: new Date('2024-01-18')
        },
        {
          id: 'reading-3',
          title: 'Vocabulary Development',
          description: 'Students understand grade-appropriate vocabulary',
          category: 'Language',
          standardId: 'CCSS.ELA-LITERACY.L.3.4',
          targetMastery: 85,
          currentMastery: 74,
          trend: 'improving',
          activities: ['word-explorer', 'vocabulary-quest'],
          assessmentDate: new Date('2024-01-19')
        }
      ]
    },
    {
      id: 'math',
      name: 'Mathematical Operations',
      description: 'Basic arithmetic and problem-solving skills',
      overallMastery: 71,
      studentsAtMastery: 16,
      totalStudents: 25,
      lastAssessed: new Date('2024-01-19'),
      outcomes: [
        {
          id: 'math-1',
          title: 'Addition & Subtraction',
          description: 'Fluent addition and subtraction within 1000',
          category: 'Operations',
          standardId: 'CCSS.MATH.CONTENT.3.NBT.A.2',
          targetMastery: 90,
          currentMastery: 85,
          trend: 'improving',
          activities: ['number-safari', 'calculation-challenge'],
          assessmentDate: new Date('2024-01-19')
        },
        {
          id: 'math-2',
          title: 'Multiplication Facts',
          description: 'Memorize multiplication facts 0-10',
          category: 'Fluency',
          standardId: 'CCSS.MATH.CONTENT.3.OA.C.7',
          targetMastery: 80,
          currentMastery: 62,
          trend: 'declining',
          activities: ['times-table-race', 'multiplication-memory'],
          assessmentDate: new Date('2024-01-17')
        },
        {
          id: 'math-3',
          title: 'Word Problems',
          description: 'Solve multi-step word problems',
          category: 'Problem Solving',
          standardId: 'CCSS.MATH.CONTENT.3.OA.D.8',
          targetMastery: 75,
          currentMastery: 58,
          trend: 'stable',
          activities: ['problem-solver', 'real-world-math'],
          assessmentDate: new Date('2024-01-18')
        }
      ]
    },
    {
      id: 'science',
      name: 'Scientific Inquiry',
      description: 'Science process skills and understanding',
      overallMastery: 76,
      studentsAtMastery: 19,
      totalStudents: 25,
      lastAssessed: new Date('2024-01-18'),
      outcomes: [
        {
          id: 'science-1',
          title: 'Scientific Method',
          description: 'Use scientific method to investigate questions',
          category: 'Process Skills',
          standardId: 'NGSS.3-PS2-1',
          targetMastery: 75,
          currentMastery: 79,
          trend: 'improving',
          activities: ['lab-explorer', 'experiment-station'],
          assessmentDate: new Date('2024-01-18')
        },
        {
          id: 'science-2',
          title: 'Data Collection',
          description: 'Collect and organize scientific data',
          category: 'Data Analysis',
          standardId: 'NGSS.3-5-ETS1-2',
          targetMastery: 70,
          currentMastery: 73,
          trend: 'stable',
          activities: ['data-detective', 'measurement-mission'],
          assessmentDate: new Date('2024-01-16')
        }
      ]
    }
  ]);

  const [standardsAlignment, setStandardsAlignment] = useState<StandardsAlignment[]>([
    {
      standardId: 'CCSS.ELA-LITERACY.RL.3.2',
      name: 'Determine central message/lesson',
      category: 'Reading Literature',
      alignedOutcomes: ['reading-1'],
      masteryLevel: 82,
      coverage: 95
    },
    {
      standardId: 'CCSS.MATH.CONTENT.3.NBT.A.2',
      name: 'Add and subtract within 1000',
      category: 'Number & Operations',
      alignedOutcomes: ['math-1'],
      masteryLevel: 85,
      coverage: 100
    },
    {
      standardId: 'NGSS.3-PS2-1',
      name: 'Plan and conduct investigations',
      category: 'Physical Science',
      alignedOutcomes: ['science-1'],
      masteryLevel: 79,
      coverage: 90
    }
  ]);

  const [performanceGaps, setPerformanceGaps] = useState<PerformanceGap[]>([
    {
      area: 'Multiplication Facts',
      expectedLevel: 80,
      actualLevel: 62,
      gap: 18,
      affectedStudents: 15,
      severity: 'high',
      interventions: ['Additional practice time', 'Peer tutoring', 'Games-based learning']
    },
    {
      area: 'Word Problems',
      expectedLevel: 75,
      actualLevel: 58,
      gap: 17,
      affectedStudents: 12,
      severity: 'high',
      interventions: ['Step-by-step strategies', 'Visual problem solving', 'Real-world connections']
    },
    {
      area: 'Making Inferences',
      expectedLevel: 75,
      actualLevel: 68,
      gap: 7,
      affectedStudents: 8,
      severity: 'medium',
      interventions: ['Text evidence practice', 'Think-aloud strategies', 'Guided reading']
    }
  ]);

  // Chart data
  const masteryOverviewData = skillAreas.map(area => ({
    name: area.name.split(' ')[0],
    current: area.overallMastery,
    target: 80,
    students: area.studentsAtMastery
  }));

  const trendData = [
    { week: 'Week 1', reading: 72, math: 68, science: 74 },
    { week: 'Week 2', reading: 74, math: 69, science: 75 },
    { week: 'Week 3', reading: 76, math: 70, science: 75 },
    { week: 'Week 4', reading: 78, math: 71, science: 76 }
  ];

  const gapAnalysisData = performanceGaps.map(gap => ({
    area: gap.area,
    expected: gap.expectedLevel,
    actual: gap.actualLevel,
    gap: gap.gap
  }));

  const masteryDistributionData = [
    { level: 'Mastered (80%+)', students: 18, color: '#10B981' },
    { level: 'Approaching (60-79%)', students: 5, color: '#F59E0B' },
    { level: 'Below (< 60%)', students: 2, color: '#EF4444' }
  ];

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const getMasteryColor = (mastery: number, target: number) => {
    if (mastery >= target) return 'text-green-600';
    if (mastery >= target * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            Learning Outcomes Analyzer
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis of learning objectives and skill mastery
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe as any}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Mastery</p>
                <p className="text-2xl font-bold text-gray-900">75%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students at Mastery</p>
                <p className="text-2xl font-bold text-gray-900">18/25</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Outcomes</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Gaps</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
          <TabsTrigger value="gaps">Performance Gaps</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mastery Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Mastery Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={masteryOverviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="target" fill="#E5E7EB" name="Target" />
                    <Bar dataKey="current" fill="#7C3AED" name="Current" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Progress Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progress Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reading" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="math" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="science" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Mastery Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Mastery Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={masteryDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="students"
                      label={({ level, students }) => `${level}: ${students}`}
                    >
                      {masteryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gap Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Performance Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gapAnalysisData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="area" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="expected" fill="#E5E7EB" name="Expected" />
                    <Bar dataKey="actual" fill="#EF4444" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Outcomes Tab */}
        <TabsContent value="outcomes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {skillAreas.map((area) => (
              <Card key={area.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{area.name}</span>
                    <Badge variant="secondary">{area.overallMastery}%</Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{area.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Students at Mastery:</span>
                    <span className="font-medium">
                      {area.studentsAtMastery}/{area.totalStudents}
                    </span>
                  </div>
                  
                  <Progress value={(area.studentsAtMastery / area.totalStudents) * 100} />
                  
                  <div className="space-y-3">
                    {area.outcomes.map((outcome) => (
                      <div key={outcome.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{outcome.title}</h4>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(outcome.trend)}
                            <span className={`text-sm font-medium ${getMasteryColor(outcome.currentMastery, outcome.targetMastery)}`}>
                              {outcome.currentMastery}%
                            </span>
                          </div>
                        </div>
                        <Progress value={outcome.currentMastery} className="h-2 mb-2" />
                        <p className="text-xs text-gray-600">{outcome.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {outcome.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Target: {outcome.targetMastery}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Standards Tab */}
        <TabsContent value="standards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Standards Alignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {standardsAlignment.map((standard) => (
                  <div key={standard.standardId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{standard.name}</h4>
                        <p className="text-sm text-gray-600">{standard.standardId}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {standard.masteryLevel}%
                        </div>
                        <p className="text-xs text-gray-500">Mastery Level</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Coverage</p>
                        <Progress value={standard.coverage} className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">{standard.coverage}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <Badge variant="secondary" className="mt-1">
                          {standard.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Aligned Outcomes:</p>
                      <div className="flex flex-wrap gap-1">
                        {standard.alignedOutcomes.map((outcomeId) => (
                          <Badge key={outcomeId} variant="outline" className="text-xs">
                            {outcomeId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Gaps Tab */}
        <TabsContent value="gaps" className="space-y-6">
          <div className="space-y-4">
            {performanceGaps.map((gap, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{gap.area}</h3>
                      <p className="text-sm text-gray-600">
                        {gap.affectedStudents} students affected
                      </p>
                    </div>
                    <Badge variant={getSeverityColor(gap.severity) as any}>
                      {gap.severity.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Expected</p>
                      <p className="text-2xl font-bold text-gray-900">{gap.expectedLevel}%</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Actual</p>
                      <p className="text-2xl font-bold text-red-600">{gap.actualLevel}%</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-gray-600">Gap</p>
                      <p className="text-2xl font-bold text-orange-600">{gap.gap}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommended Interventions:</h4>
                    <ul className="space-y-1">
                      {gap.interventions.map((intervention, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          {intervention}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Interventions Tab */}
        <TabsContent value="interventions" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Based on the performance gaps identified, here are recommended interventions and support strategies.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">High Priority Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-red-500 bg-red-50">
                    <h4 className="font-semibold">Multiplication Facts</h4>
                    <p className="text-sm text-gray-600 mb-2">18% gap, 15 students affected</p>
                    <ul className="text-sm space-y-1">
                      <li>• Daily 10-minute practice sessions</li>
                      <li>• Gamified learning apps</li>
                      <li>• Peer tutoring partnerships</li>
                      <li>• Visual multiplication charts</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border-l-4 border-red-500 bg-red-50">
                    <h4 className="font-semibold">Word Problems</h4>
                    <p className="text-sm text-gray-600 mb-2">17% gap, 12 students affected</p>
                    <ul className="text-sm space-y-1">
                      <li>• Step-by-step problem solving strategies</li>
                      <li>• Visual problem representation</li>
                      <li>• Real-world problem contexts</li>
                      <li>• Think-aloud modeling</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-yellow-600">Medium Priority Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                    <h4 className="font-semibold">Making Inferences</h4>
                    <p className="text-sm text-gray-600 mb-2">7% gap, 8 students affected</p>
                    <ul className="text-sm space-y-1">
                      <li>• Text evidence highlighting practice</li>
                      <li>• Guided reading sessions</li>
                      <li>• Inference graphic organizers</li>
                      <li>• Discussion-based activities</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Implementation Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Week 1-2: Setup Phase</h4>
                    <p className="text-sm text-gray-600">Introduce intervention strategies, form peer groups</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Week 3-6: Active Implementation</h4>
                    <p className="text-sm text-gray-600">Daily practice sessions, monitor progress</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Week 7-8: Assessment & Adjustment</h4>
                    <p className="text-sm text-gray-600">Evaluate effectiveness, adjust strategies</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningOutcomesAnalyzer;