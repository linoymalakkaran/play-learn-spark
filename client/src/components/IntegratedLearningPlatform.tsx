/**
 * Integrated Learning Platform
 * Combines all implemented features into a cohesive learning environment
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  BookOpen, 
  Video, 
  Upload, 
  BarChart3, 
  Stars, 
  Brain, 
  Target,
  TrendingUp,
  Users,
  Award,
  Calendar,
  Clock,
  Heart,
  Sparkles,
  ChevronRight,
  PlayCircle,
  FileText,
  Image,
  Mic,
  Camera,
  Globe,
  Lightbulb,
  Zap,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

// Import all major components
import VideoTutorialSystem from './VideoTutorialSystem';
import AnalyticsDashboard from './AnalyticsDashboard';
import { RecommendationEngine } from './RecommendationEngine';

// Import custom hooks
import { useAuthRequired } from '@/hooks/useAuthRequired';
import {
  useRecommendations,
  useChildAnalytics,
  useFileUpload,
  useAiGeneration,
  useLearningPath,
  useRealtimeUpdates
} from '../hooks/useApi';

// Import services
import { staticModeService } from '../services/staticModeService';
import BackendStatus, { useBackendStatus } from './BackendStatus';

interface IntegratedLearningPlatformProps {
  childId: string;
  userName: string;
  userAge: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
  color?: string;
}

interface LearningMetric {
  id: string;
  label: string;
  value: number;
  total: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

const IntegratedLearningPlatform: React.FC<IntegratedLearningPlatformProps> = ({
  childId,
  userName,
  userAge
}) => {
  // Auth requirement check
  const { checkFeatureAccess, AuthRequiredModal } = useAuthRequired();

  // Check if user has access to this feature
  useEffect(() => {
    checkFeatureAccess('integrated_platform');
  }, []);

  // Backend status
  const { isOnline: backendOnline, isChecking: checkingBackend } = useBackendStatus();

  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userPreferences, setUserPreferences] = useState({
    difficulty: 'medium',
    interests: ['animals', 'colors', 'numbers'],
    learningStyle: 'visual'
  });

  // Custom hooks for data management
  const { data: recommendations, loading: loadingRecs } = useRecommendations({
    childId,
    ageGroup: `${Math.floor(userAge / 12)}-${Math.ceil(userAge / 12)}`,
    topics: userPreferences.interests,
    difficulty: userPreferences.difficulty,
    limit: 8
  });

  const { data: analytics, loading: loadingAnalytics } = useChildAnalytics(childId, '7d');
  const { uploading, uploadedFiles, uploadSingle, uploadMultiple } = useFileUpload();
  const { generating, generateContent, generateStory, generateImage } = useAiGeneration();
  const { paths: learningPaths, generatePath } = useLearningPath(childId);
  const { connected: realtimeConnected, updates: realtimeUpdates } = useRealtimeUpdates(childId);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      id: 'create-story',
      title: 'Create Story',
      description: 'Generate a personalized story with AI',
      icon: <BookOpen className="h-5 w-5" />,
      action: () => handleCreateStory(),
      badge: 'AI',
      color: 'bg-purple-500'
    },
    {
      id: 'upload-content',
      title: 'Upload Content',
      description: 'Upload images, videos, or documents',
      icon: <Upload className="h-5 w-5" />,
      action: () => handleUploadContent(),
      badge: 'New',
      color: 'bg-blue-500'
    },
    {
      id: 'watch-video',
      title: 'Watch Tutorial',
      description: 'Interactive video learning',
      icon: <Video className="h-5 w-5" />,
      action: () => setActiveTab('videos'),
      color: 'bg-green-500'
    },
    {
      id: 'view-progress',
      title: 'Learning Progress',
      description: 'See your achievements and analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => setActiveTab('analytics'),
      color: 'bg-orange-500'
    },
    {
      id: 'get-recommendations',
      title: 'Discover Content',
      description: 'AI-powered content suggestions',
      icon: <Stars className="h-5 w-5" />,
      action: () => setActiveTab('recommendations'),
      badge: 'Smart',
      color: 'bg-pink-500'
    },
    {
      id: 'learning-path',
      title: 'Learning Path',
      description: 'Structured learning journey',
      icon: <Target className="h-5 w-5" />,
      action: () => handleCreateLearningPath(),
      badge: 'Path',
      color: 'bg-indigo-500'
    }
  ];

  // Learning metrics for dashboard overview
  const learningMetrics: LearningMetric[] = [
    {
      id: 'activities-completed',
      label: 'Activities Completed',
      value: analytics?.activitiesCompleted || 12,
      total: 20,
      unit: 'activities',
      trend: 'up',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      id: 'learning-time',
      label: 'Learning Time',
      value: analytics?.totalLearningTime || 45,
      total: 60,
      unit: 'minutes',
      trend: 'up',
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: 'skills-mastered',
      label: 'Skills Mastered',
      value: analytics?.skillsMastered || 8,
      total: 15,
      unit: 'skills',
      trend: 'stable',
      icon: <Brain className="h-4 w-4" />
    },
    {
      id: 'streak-days',
      label: 'Learning Streak',
      value: analytics?.streakDays || 5,
      total: 7,
      unit: 'days',
      trend: 'up',
      icon: <Award className="h-4 w-4" />
    }
  ];

  // Event handlers
  const handleCreateStory = useCallback(async () => {
    try {
      await generateStory({
        theme: userPreferences.interests[0] || 'adventure',
        characters: ['friendly animal', 'curious child'],
        ageGroup: `${Math.floor(userAge / 12)}-${Math.ceil(userAge / 12)}`,
        length: 'medium'
      });
      
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'New story created! Check your content library.',
        timestamp: new Date()
      }]);
    } catch (error) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to create story. Please try again.',
        timestamp: new Date()
      }]);
    }
  }, [generateStory, userPreferences.interests, userAge]);

  const handleUploadContent = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,.pdf,.doc,.docx';
    
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        try {
          await uploadMultiple(files as File[], {
            childId,
            category: 'user-content'
          });
          
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'success',
            message: `${files.length} file(s) uploaded successfully!`,
            timestamp: new Date()
          }]);
        } catch (error) {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'error',
            message: 'Upload failed. Please try again.',
            timestamp: new Date()
          }]);
        }
      }
    };
    
    input.click();
  }, [uploadMultiple, childId]);

  const handleCreateLearningPath = useCallback(async () => {
    try {
      await generatePath({
        targetSkills: ['reading', 'counting', 'colors'],
        durationWeeks: 4,
        priorityAreas: userPreferences.interests
      });
      
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'Learning path created! View it in the recommendations tab.',
        timestamp: new Date()
      }]);
    } catch (error) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to create learning path. Please try again.',
        timestamp: new Date()
      }]);
    }
  }, [generatePath, userPreferences.interests]);

  const dismissNotification = useCallback((notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Real-time updates effect
  useEffect(() => {
    if (realtimeUpdates.length > 0) {
      const latestUpdate = realtimeUpdates[realtimeUpdates.length - 1];
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'info',
        message: latestUpdate.message,
        timestamp: new Date()
      }]);
    }
  }, [realtimeUpdates]);

  // Render notification
  const renderNotification = (notification: any) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'success': return <CheckCircle className="h-4 w-4" />;
        case 'error': return <AlertTriangle className="h-4 w-4" />;
        default: return <Info className="h-4 w-4" />;
      }
    };

    const getColor = () => {
      switch (notification.type) {
        case 'success': return 'bg-green-50 border-green-200 text-green-800';
        case 'error': return 'bg-red-50 border-red-200 text-red-800';
        default: return 'bg-blue-50 border-blue-200 text-blue-800';
      }
    };

    return (
      <Alert key={notification.id} className={`mb-2 ${getColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <AlertDescription>{notification.message}</AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismissNotification(notification.id)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Backend Status Indicator */}
      <BackendStatus showInCorner={true} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  PlayLearnSpark
                </h1>
              </div>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{userName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${realtimeConnected && backendOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {realtimeConnected && backendOnline ? 'Connected' : backendOnline === false ? 'Static Mode' : 'Offline'}
                </span>
              </div>
              
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Age {userAge} months
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Status Alert */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <BackendStatus />
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="space-y-2">
            {notifications.slice(-3).map(renderNotification)}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="recommendations">Discover</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Learning Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {learningMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {metric.icon}
                        <span className="text-sm font-medium text-gray-600">
                          {metric.label}
                        </span>
                      </div>
                      <TrendingUp className={`h-4 w-4 ${
                        metric.trend === 'up' ? 'text-green-500' : 
                        metric.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.value}
                        </span>
                        <span className="text-sm text-gray-500">
                          / {metric.total} {metric.unit}
                        </span>
                      </div>
                      
                      <Progress 
                        value={(metric.value / metric.total) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Jump into learning activities and explore new content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <div
                      key={action.id}
                      className="group relative p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                      onClick={action.action}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${action.color || 'bg-gray-500'} text-white`}>
                          {action.icon}
                        </div>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {action.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-purple-600 group-hover:text-purple-700">
                        <span>Get started</span>
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities & Recommendations Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Animal Safari', type: 'game', completed: true, time: '2 hours ago' },
                      { name: 'Color Rainbow', type: 'activity', completed: true, time: '1 day ago' },
                      { name: 'Counting Train', type: 'lesson', completed: false, time: 'In progress' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${activity.completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <div>
                            <p className="font-medium text-gray-900">{activity.name}</p>
                            <p className="text-sm text-gray-600 capitalize">{activity.type}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stars className="h-5 w-5 text-purple-500" />
                    Recommended for You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingRecs ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(recommendations?.slice(0, 3) || []).map((rec: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Heart className="h-4 w-4 text-pink-500" />
                            <div>
                              <p className="font-medium text-gray-900">{rec.title || `Recommendation ${index + 1}`}</p>
                              <p className="text-sm text-gray-600">{rec.category || 'Learning Activity'}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <VideoTutorialSystem userId={childId} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard childId={childId} />
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <RecommendationEngine 
              userId={childId}
              userPreferences={userPreferences}
              onPreferencesChange={setUserPreferences}
            />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Content Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-500" />
                    Upload Content
                  </CardTitle>
                  <CardDescription>
                    Upload images, videos, documents, or other learning materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2"
                        onClick={handleUploadContent}
                        disabled={uploading}
                      >
                        <Image className="h-6 w-6" />
                        <span className="text-xs">Images</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2"
                        onClick={handleUploadContent}
                        disabled={uploading}
                      >
                        <Video className="h-6 w-6" />
                        <span className="text-xs">Videos</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2"
                        onClick={handleUploadContent}
                        disabled={uploading}
                      >
                        <FileText className="h-6 w-6" />
                        <span className="text-xs">Documents</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2"
                        onClick={handleUploadContent}
                        disabled={uploading}
                      >
                        <Mic className="h-6 w-6" />
                        <span className="text-xs">Audio</span>
                      </Button>
                    </div>
                    
                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading...</span>
                          <span>Processing files</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    )}
                    
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Recently Uploaded ({uploadedFiles.length})
                        </p>
                        <div className="space-y-1">
                          {uploadedFiles.slice(-3).map((file: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{file.name || `File ${index + 1}`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Content Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    AI Content Creation
                  </CardTitle>
                  <CardDescription>
                    Generate personalized stories, activities, and learning content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        variant="outline"
                        className="justify-start gap-2"
                        onClick={handleCreateStory}
                        disabled={generating}
                      >
                        <BookOpen className="h-4 w-4" />
                        Generate Story
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="justify-start gap-2"
                        onClick={() => generateContent({
                          prompt: 'Create a fun learning activity',
                          type: 'activity',
                          ageGroup: `${Math.floor(userAge / 12)}-${Math.ceil(userAge / 12)}`
                        })}
                        disabled={generating}
                      >
                        <Target className="h-4 w-4" />
                        Create Activity
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="justify-start gap-2"
                        onClick={() => generateImage({
                          prompt: 'Colorful educational illustration for children'
                        })}
                        disabled={generating}
                      >
                        <Camera className="h-4 w-4" />
                        Generate Image
                      </Button>
                    </div>
                    
                    {generating && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                        <span>Creating content with AI...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {AuthRequiredModal}
    </div>
  );
};

export default IntegratedLearningPlatform;