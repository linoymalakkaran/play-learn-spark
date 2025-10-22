import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  Heart,
  Star,
  Trophy,
  Clock,
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Users,
  MessageCircle,
  Bell,
  Download,
  Share,
  Eye,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Home,
  School,
  Camera,
  Gift,
  ThumbsUp,
  Smile,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  HelpCircle,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Timer,
  Bookmark,
  Flag,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  X,
  Check,
  Info
} from 'lucide-react';

interface ParentProgressDashboardProps {
  studentId: string;
  studentName?: string;
}

interface WeeklyHighlight {
  id: string;
  type: 'achievement' | 'milestone' | 'improvement' | 'activity';
  title: string;
  description: string;
  date: Date;
  icon: string;
  color: string;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  subject: string;
  targetDate: Date;
  progress: number;
  status: 'on-track' | 'behind' | 'ahead' | 'completed';
}

interface ActivitySummary {
  id: string;
  name: string;
  subject: string;
  completedAt: Date;
  timeSpent: number;
  score: number;
  skillsLearned: string[];
  funLevel: number;
}

interface SkillProgress {
  skill: string;
  currentLevel: number;
  previousLevel: number;
  maxLevel: number;
  activities: number;
}

interface ParentTip {
  id: string;
  category: 'learning' | 'motivation' | 'practice' | 'social';
  title: string;
  description: string;
  actionSteps: string[];
  relevantSkills: string[];
}

interface TeacherMessage {
  id: string;
  from: string;
  subject: string;
  message: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
}

const ParentProgressDashboard: React.FC<ParentProgressDashboardProps> = ({
  studentId,
  studentName = "Emma"
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'activities' | 'communication' | 'support'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['highlights']));

  // Data
  const [weeklyHighlights, setWeeklyHighlights] = useState<WeeklyHighlight[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'Reading Milestone Achieved!',
      description: 'Emma completed her first chapter book and earned the "Bookworm" badge',
      date: new Date('2024-01-20'),
      icon: '📚',
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'improvement',
      title: 'Math Skills Improving',
      description: 'Multiplication facts score improved from 65% to 78% this week',
      date: new Date('2024-01-19'),
      icon: '📈',
      color: 'text-blue-600'
    },
    {
      id: '3',
      type: 'activity',
      title: 'Science Explorer',
      description: 'Loved the volcano experiment and asked great questions about chemical reactions',
      date: new Date('2024-01-18'),
      icon: '🔬',
      color: 'text-purple-600'
    },
    {
      id: '4',
      type: 'milestone',
      title: 'Weekly Learning Goal Met',
      description: 'Completed all planned activities for the week with enthusiasm',
      date: new Date('2024-01-17'),
      icon: '🎯',
      color: 'text-orange-600'
    }
  ]);

  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([
    {
      id: '1',
      title: 'Master Multiplication Tables (1-10)',
      description: 'Memorize and recall multiplication facts quickly and accurately',
      subject: 'Mathematics',
      targetDate: new Date('2024-02-15'),
      progress: 78,
      status: 'on-track'
    },
    {
      id: '2',
      title: 'Read 5 Chapter Books',
      description: 'Build reading fluency and comprehension with longer texts',
      subject: 'Reading',
      targetDate: new Date('2024-02-28'),
      progress: 40,
      status: 'on-track'
    },
    {
      id: '3',
      title: 'Scientific Method Understanding',
      description: 'Learn to ask questions, make predictions, and test ideas',
      subject: 'Science',
      targetDate: new Date('2024-02-10'),
      progress: 85,
      status: 'ahead'
    }
  ]);

  const [recentActivities, setRecentActivities] = useState<ActivitySummary[]>([
    {
      id: '1',
      name: 'Letter Detective Adventure',
      subject: 'Reading',
      completedAt: new Date('2024-01-20T14:30:00'),
      timeSpent: 25,
      score: 92,
      skillsLearned: ['Letter Recognition', 'Phonics'],
      funLevel: 5
    },
    {
      id: '2',
      name: 'Number Safari Expedition',
      subject: 'Mathematics',
      completedAt: new Date('2024-01-20T10:15:00'),
      timeSpent: 18,
      score: 78,
      skillsLearned: ['Counting', 'Number Patterns'],
      funLevel: 4
    },
    {
      id: '3',
      name: 'Science Lab Explorer',
      subject: 'Science',
      completedAt: new Date('2024-01-19T15:45:00'),
      timeSpent: 35,
      score: 88,
      skillsLearned: ['Observation', 'Hypothesis'],
      funLevel: 5
    }
  ]);

  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([
    { skill: 'Reading Comprehension', currentLevel: 82, previousLevel: 78, maxLevel: 100, activities: 12 },
    { skill: 'Math Operations', currentLevel: 75, previousLevel: 70, maxLevel: 100, activities: 15 },
    { skill: 'Scientific Thinking', currentLevel: 88, previousLevel: 85, maxLevel: 100, activities: 8 },
    { skill: 'Creative Writing', currentLevel: 70, previousLevel: 68, maxLevel: 100, activities: 6 },
    { skill: 'Problem Solving', currentLevel: 79, previousLevel: 75, maxLevel: 100, activities: 10 }
  ]);

  const [parentTips, setParentTips] = useState<ParentTip[]>([
    {
      id: '1',
      category: 'practice',
      title: 'Multiplication Practice at Home',
      description: 'Help Emma master multiplication facts with these fun activities',
      actionSteps: [
        'Practice multiplication songs during car rides',
        'Use everyday objects for skip counting games',
        'Try multiplication apps for 10 minutes daily',
        'Create multiplication stories together'
      ],
      relevantSkills: ['Math Operations', 'Memory']
    },
    {
      id: '2',
      category: 'learning',
      title: 'Encouraging Reading at Home',
      description: 'Support Emma\'s reading journey with these strategies',
      actionSteps: [
        'Read together for 20 minutes before bedtime',
        'Ask questions about characters and plot',
        'Visit the library weekly for new books',
        'Let her choose books that interest her'
      ],
      relevantSkills: ['Reading Comprehension', 'Vocabulary']
    },
    {
      id: '3',
      category: 'motivation',
      title: 'Building Confidence in Science',
      description: 'Emma shows great curiosity in science - here\'s how to nurture it',
      actionSteps: [
        'Do simple experiments with household items',
        'Watch educational science videos together',
        'Encourage her to ask "why" and "how" questions',
        'Visit science museums or nature centers'
      ],
      relevantSkills: ['Scientific Thinking', 'Curiosity']
    }
  ]);

  const [teacherMessages, setTeacherMessages] = useState<TeacherMessage[]>([
    {
      id: '1',
      from: 'Ms. Johnson',
      subject: 'Great Progress in Reading!',
      message: 'Emma has shown remarkable improvement in her reading comprehension this week. She\'s asking thoughtful questions and making excellent connections between stories.',
      timestamp: new Date('2024-01-20T09:30:00'),
      priority: 'medium',
      read: false
    },
    {
      id: '2',
      from: 'Ms. Johnson',
      subject: 'Math Practice Recommendation',
      message: 'Emma would benefit from additional multiplication practice. I\'ve noticed she hesitates with facts for 7s and 8s. Some fun games at home could really help!',
      timestamp: new Date('2024-01-18T16:45:00'),
      priority: 'high',
      read: true
    }
  ]);

  // Chart data
  const weeklyProgressData = [
    { day: 'Mon', reading: 80, math: 75, science: 85 },
    { day: 'Tue', reading: 82, math: 72, science: 87 },
    { day: 'Wed', reading: 78, math: 78, science: 85 },
    { day: 'Thu', reading: 85, math: 80, science: 90 },
    { day: 'Fri', reading: 88, math: 75, science: 88 }
  ];

  const timeSpentData = [
    { subject: 'Reading', minutes: 180, color: '#10B981' },
    { subject: 'Math', minutes: 150, color: '#3B82F6' },
    { subject: 'Science', minutes: 120, color: '#8B5CF6' },
    { subject: 'Writing', minutes: 90, color: '#F59E0B' }
  ];

  const skillRadarData = skillProgress.map(skill => ({
    skill: skill.skill.split(' ')[0],
    current: skill.currentLevel,
    target: 85
  }));

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'text-green-600';
      case 'on-track': return 'text-blue-600';
      case 'behind': return 'text-orange-600';
      case 'completed': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ahead': return <Badge className="bg-green-100 text-green-800">Ahead</Badge>;
      case 'on-track': return <Badge className="bg-blue-100 text-blue-800">On Track</Badge>;
      case 'behind': return <Badge className="bg-orange-100 text-orange-800">Needs Support</Badge>;
      case 'completed': return <Badge className="bg-purple-100 text-purple-800">Completed</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getFunStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {studentName}'s progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src="/placeholder-student.jpg" />
            <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-semibold">
              {studentName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {studentName}'s Learning Journey
            </h1>
            <p className="text-gray-600">
              Week of January 15-21, 2024 • Grade 3
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">8 hours</p>
                <p className="text-xs text-gray-500">Learning Time</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activities</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500">New This Week</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fun Level</p>
                <div className="flex items-center gap-1 mt-1">
                  {getFunStars(4)}
                </div>
                <p className="text-xs text-gray-500">Average Rating</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-full">
                <Smile className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="communication">Messages</TabsTrigger>
          <TabsTrigger value="support">How to Help</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Weekly Highlights */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  This Week's Highlights
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('highlights')}
                >
                  {expandedSections.has('highlights') ? <ChevronDown /> : <ChevronRight />}
                </Button>
              </div>
            </CardHeader>
            {expandedSections.has('highlights') && (
              <CardContent>
                <div className="space-y-4">
                  {weeklyHighlights.map((highlight) => (
                    <div key={highlight.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{highlight.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{highlight.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{highlight.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {highlight.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Learning Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Learning Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningGoals.map((goal) => (
                  <div key={goal.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                      {getStatusBadge(goal.status)}
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{goal.progress}% complete</span>
                      <span>Target: {goal.targetDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="reading" stroke="#10B981" strokeWidth={2} name="Reading" />
                    <Line type="monotone" dataKey="math" stroke="#3B82F6" strokeWidth={2} name="Math" />
                    <Line type="monotone" dataKey="science" stroke="#8B5CF6" strokeWidth={2} name="Science" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Time by Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={timeSpentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="minutes"
                      label={({ subject, minutes }) => `${subject}: ${minutes}m`}
                    >
                      {timeSpentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Skill Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillProgress.map((skill) => (
                    <div key={skill.skill} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{skill.skill}</span>
                        <div className="flex items-center gap-2">
                          {skill.currentLevel > skill.previousLevel && (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          )}
                          <span className="text-sm font-medium">
                            {skill.currentLevel}%
                          </span>
                        </div>
                      </div>
                      <Progress value={skill.currentLevel} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Previous: {skill.previousLevel}%</span>
                        <span>{skill.activities} activities</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Skills Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Current"
                      dataKey="current"
                      stroke="#7C3AED"
                      fill="#7C3AED"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Target"
                      dataKey="target"
                      stroke="#E5E7EB"
                      fill="#E5E7EB"
                      fillOpacity={0.1}
                      strokeWidth={1}
                      strokeDasharray="5 5"
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{activity.name}</h4>
                        <p className="text-sm text-gray-600">{activity.subject}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {activity.score}%
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {activity.timeSpent} minutes
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Fun Level:</span>
                        <div className="flex items-center gap-1">
                          {getFunStars(activity.funLevel)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {activity.completedAt.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Skills Practiced:</p>
                      <div className="flex flex-wrap gap-1">
                        {activity.skillsLearned.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
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

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages from Teacher
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherMessages.map((message) => (
                  <div key={message.id} className={`p-4 border rounded-lg ${!message.read ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {message.subject}
                          {!message.read && <Badge variant="secondary" className="text-xs">New</Badge>}
                        </h4>
                        <p className="text-sm text-gray-600">From: {message.from}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={message.priority === 'high' ? 'destructive' : 'secondary'}
                          className="mb-1"
                        >
                          {message.priority}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {message.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{message.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-6">
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Here are personalized tips to help support {studentName}'s learning at home based on her current progress and interests.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {parentTips.map((tip) => (
              <Card key={tip.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      tip.category === 'practice' ? 'bg-blue-100 text-blue-600' :
                      tip.category === 'learning' ? 'bg-green-100 text-green-600' :
                      tip.category === 'motivation' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {tip.category === 'practice' ? <Target className="w-5 h-5" /> :
                       tip.category === 'learning' ? <BookOpen className="w-5 h-5" /> :
                       tip.category === 'motivation' ? <Heart className="w-5 h-5" /> :
                       <Lightbulb className="w-5 h-5" />}
                    </div>
                    {tip.title}
                  </CardTitle>
                  <p className="text-gray-600">{tip.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Action Steps:</h4>
                      <ul className="space-y-1">
                        {tip.actionSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Relevant Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {tip.relevantSkills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentProgressDashboard;