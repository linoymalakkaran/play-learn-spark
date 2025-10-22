import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wand2, 
  Upload, 
  Save, 
  Eye, 
  Copy, 
  Share, 
  FileText, 
  Image, 
  Video, 
  Music,
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ActivityBuilderProps {
  initialActivity?: any;
  templates?: any[];
  onSave?: (activity: any) => void;
  onPreview?: (activity: any) => void;
  onPublish?: (activity: any) => void;
}

interface ActivityData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  ageRange: { min: number; max: number };
  language: string;
  contentType: string;
  duration: { estimated: number; minimum: number; maximum: number };
  objectives: Array<{
    id: string;
    description: string;
    bloomLevel: string;
    measurable: boolean;
  }>;
  contentData: {
    introduction: string;
    mainActivity: string;
    assessment: string;
    conclusion: string;
  };
  materials: string[];
  tags: string[];
  multimedia: {
    images: string[];
    videos: string[];
    audio: string[];
  };
  adaptations: {
    easier: string;
    harder: string;
    accessibility: string;
  };
  aiGenerated?: {
    isAiGenerated: boolean;
    provider?: string;
    confidence?: number;
  };
}

export const ActivityBuilder: React.FC<ActivityBuilderProps> = ({
  initialActivity,
  templates = [],
  onSave,
  onPreview,
  onPublish
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [activity, setActivity] = useState<ActivityData>({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'medium',
    ageRange: { min: 6, max: 12 },
    language: 'en',
    contentType: 'interactive',
    duration: { estimated: 15, minimum: 10, maximum: 30 },
    objectives: [{
      id: 'obj_1',
      description: '',
      bloomLevel: 'understand',
      measurable: true
    }],
    contentData: {
      introduction: '',
      mainActivity: '',
      assessment: '',
      conclusion: ''
    },
    materials: [],
    tags: [],
    multimedia: {
      images: [],
      videos: [],
      audio: []
    },
    adaptations: {
      easier: '',
      harder: '',
      accessibility: ''
    },
    ...initialActivity
  });

  // AI Integration state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiProvider, setAiProvider] = useState('openai');
  const [aiCreativity, setAiCreativity] = useState([0.7]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // Template state
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateVariables, setTemplateVariables] = useState<any>({});

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Progress tracking
  const [completionProgress, setCompletionProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculate completion progress
  useEffect(() => {
    const requiredFields = [
      activity.title,
      activity.description,
      activity.category,
      activity.contentData.introduction,
      activity.contentData.mainActivity,
      activity.objectives[0]?.description
    ];
    
    const completedFields = requiredFields.filter(field => field && field.trim() !== '').length;
    const progress = Math.round((completedFields / requiredFields.length) * 100);
    setCompletionProgress(progress);
  }, [activity]);

  // Validation
  const validateActivity = useCallback(() => {
    const errors: string[] = [];
    
    if (!activity.title.trim()) errors.push('Title is required');
    if (!activity.description.trim()) errors.push('Description is required');
    if (!activity.contentData.introduction.trim()) errors.push('Introduction is required');
    if (!activity.contentData.mainActivity.trim()) errors.push('Main activity content is required');
    if (!activity.objectives[0]?.description.trim()) errors.push('At least one learning objective is required');
    if (activity.ageRange.min >= activity.ageRange.max) errors.push('Invalid age range');
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [activity]);

  // Update activity data
  const updateActivity = useCallback((field: string, value: any) => {
    setActivity(prev => {
      const updated = { ...prev };
      const keys = field.split('.');
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  }, []);

  // AI Content Generation
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/activities/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'activity',
          prompt: aiPrompt,
          parameters: {
            category: activity.category,
            difficulty: activity.difficulty,
            ageRange: activity.ageRange,
            language: activity.language,
            contentType: activity.contentType,
            duration: activity.duration.estimated
          },
          preferences: {
            provider: aiProvider,
            creativity: aiCreativity[0],
            formatStructured: true
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Merge AI-generated content with existing activity
        setActivity(prev => ({
          ...prev,
          ...result.content,
          aiGenerated: {
            isAiGenerated: true,
            provider: result.metadata.provider,
            confidence: result.metadata.confidence
          }
        }));
        
        setAiSuggestions(result.suggestions);
        setShowAIPanel(false);
        setActiveTab('content'); // Switch to content tab to see results
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Template Application
  const applyTemplate = async (template: any) => {
    try {
      const response = await fetch(`/api/templates/${template._id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: templateVariables })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setActivity(prev => ({
          ...prev,
          ...result.activity,
          title: activity.title || result.activity.title, // Keep user's title if set
          metadata: {
            ...result.activity.metadata,
            templateId: template._id,
            templateVariables
          }
        }));
        
        setSelectedTemplate(null);
        setShowTemplates(false);
        setActiveTab('content');
      }
    } catch (error) {
      console.error('Template application failed:', error);
    }
  };

  // File Upload
  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));
    
    try {
      const response = await fetch('/api/activities/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadedFiles(prev => [...prev, ...result.files]);
        
        // Auto-assign files to multimedia based on type
        result.files.forEach((file: any) => {
          if (file.mimetype.startsWith('image/')) {
            updateActivity('multimedia.images', [...activity.multimedia.images, file.url]);
          } else if (file.mimetype.startsWith('video/')) {
            updateActivity('multimedia.videos', [...activity.multimedia.videos, file.url]);
          } else if (file.mimetype.startsWith('audio/')) {
            updateActivity('multimedia.audio', [...activity.multimedia.audio, file.url]);
          }
        });
      }
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Add objective
  const addObjective = () => {
    const newObjective = {
      id: `obj_${activity.objectives.length + 1}`,
      description: '',
      bloomLevel: 'understand',
      measurable: true
    };
    updateActivity('objectives', [...activity.objectives, newObjective]);
  };

  // Remove objective
  const removeObjective = (index: number) => {
    if (activity.objectives.length > 1) {
      const updated = activity.objectives.filter((_, i) => i !== index);
      updateActivity('objectives', updated);
    }
  };

  // Add material
  const addMaterial = () => {
    updateActivity('materials', [...activity.materials, '']);
  };

  // Add tag
  const addTag = (tag: string) => {
    if (tag.trim() && !activity.tags.includes(tag.trim())) {
      updateActivity('tags', [...activity.tags, tag.trim()]);
    }
  };

  // Save handlers
  const handleSave = () => {
    if (validateActivity()) {
      onSave?.(activity);
    }
  };

  const handlePreview = () => {
    onPreview?.(activity);
  };

  const handlePublish = () => {
    if (validateActivity()) {
      onPublish?.(activity);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Builder</h1>
          <p className="text-muted-foreground">Create engaging educational activities</p>
        </div>
        
        {/* Progress and Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <Progress value={completionProgress} className="w-24" />
            <span className="text-sm font-medium">{completionProgress}%</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAIPanel(true)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              AI Assistant
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowTemplates(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
            
            <Button
              variant="outline"
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={completionProgress < 60}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            
            <Button
              onClick={handlePublish}
              disabled={completionProgress < 90}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* AI Suggestions */}
      {aiSuggestions && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">AI Suggestions:</div>
              {aiSuggestions.improvements?.map((suggestion: string, index: number) => (
                <div key={index} className="text-sm">• {suggestion}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="multimedia">Media</TabsTrigger>
          <TabsTrigger value="adaptations">Adaptations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={activity.title}
                    onChange={(e) => updateActivity('title', e.target.value)}
                    placeholder="Enter activity title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={activity.category} onValueChange={(value) => updateActivity('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alphabet">Alphabet</SelectItem>
                      <SelectItem value="numbers">Numbers</SelectItem>
                      <SelectItem value="shapes">Shapes</SelectItem>
                      <SelectItem value="colors">Colors</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={activity.description}
                  onChange={(e) => updateActivity('description', e.target.value)}
                  placeholder="Describe what this activity is about"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={activity.difficulty} onValueChange={(value) => updateActivity('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={activity.contentType} onValueChange={(value) => updateActivity('contentType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interactive">Interactive</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={activity.language} onValueChange={(value) => updateActivity('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Age Range: {activity.ageRange.min} - {activity.ageRange.max} years</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Min:</span>
                    <Slider
                      value={[activity.ageRange.min]}
                      onValueChange={([value]) => updateActivity('ageRange.min', value)}
                      max={18}
                      min={3}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Max:</span>
                    <Slider
                      value={[activity.ageRange.max]}
                      onValueChange={([value]) => updateActivity('ageRange.max', value)}
                      max={18}
                      min={3}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Duration (minutes)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Estimated</Label>
                    <Input
                      type="number"
                      value={activity.duration.estimated}
                      onChange={(e) => updateActivity('duration.estimated', parseInt(e.target.value) || 15)}
                      min={5}
                      max={120}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Minimum</Label>
                    <Input
                      type="number"
                      value={activity.duration.minimum}
                      onChange={(e) => updateActivity('duration.minimum', parseInt(e.target.value) || 10)}
                      min={5}
                      max={120}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Maximum</Label>
                    <Input
                      type="number"
                      value={activity.duration.maximum}
                      onChange={(e) => updateActivity('duration.maximum', parseInt(e.target.value) || 30)}
                      min={5}
                      max={120}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="introduction">Introduction *</Label>
                <Textarea
                  id="introduction"
                  value={activity.contentData.introduction}
                  onChange={(e) => updateActivity('contentData.introduction', e.target.value)}
                  placeholder="How should the activity begin? Set the context and engage students."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainActivity">Main Activity *</Label>
                <Textarea
                  id="mainActivity"
                  value={activity.contentData.mainActivity}
                  onChange={(e) => updateActivity('contentData.mainActivity', e.target.value)}
                  placeholder="Describe the main activity steps and instructions."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment</Label>
                <Textarea
                  id="assessment"
                  value={activity.contentData.assessment}
                  onChange={(e) => updateActivity('contentData.assessment', e.target.value)}
                  placeholder="How will you assess student understanding?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conclusion">Conclusion</Label>
                <Textarea
                  id="conclusion"
                  value={activity.contentData.conclusion}
                  onChange={(e) => updateActivity('contentData.conclusion', e.target.value)}
                  placeholder="How should the activity wrap up?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Objectives Tab */}
        <TabsContent value="objectives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Learning Objectives
                <Button onClick={addObjective} size="sm">
                  Add Objective
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activity.objectives.map((objective, index) => (
                <div key={objective.id} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label>Objective {index + 1}</Label>
                    {activity.objectives.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeObjective(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <Textarea
                    value={objective.description}
                    onChange={(e) => {
                      const updated = [...activity.objectives];
                      updated[index].description = e.target.value;
                      updateActivity('objectives', updated);
                    }}
                    placeholder="Students will be able to..."
                    rows={2}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bloom's Level</Label>
                      <Select
                        value={objective.bloomLevel}
                        onValueChange={(value) => {
                          const updated = [...activity.objectives];
                          updated[index].bloomLevel = value;
                          updateActivity('objectives', updated);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remember">Remember</SelectItem>
                          <SelectItem value="understand">Understand</SelectItem>
                          <SelectItem value="apply">Apply</SelectItem>
                          <SelectItem value="analyze">Analyze</SelectItem>
                          <SelectItem value="evaluate">Evaluate</SelectItem>
                          <SelectItem value="create">Create</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={objective.measurable}
                        onCheckedChange={(checked) => {
                          const updated = [...activity.objectives];
                          updated[index].measurable = checked;
                          updateActivity('objectives', updated);
                        }}
                      />
                      <Label>Measurable</Label>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multimedia Tab */}
        <TabsContent value="multimedia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Multimedia Resources
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload Files
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />

              {/* Images */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Images
                </Label>
                <div className="grid grid-cols-4 gap-4">
                  {activity.multimedia.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Activity image ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => {
                          const updated = activity.multimedia.images.filter((_, i) => i !== index);
                          updateActivity('multimedia.images', updated);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Videos
                </Label>
                <div className="space-y-2">
                  {activity.multimedia.videos.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="truncate">{url}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = activity.multimedia.videos.filter((_, i) => i !== index);
                          updateActivity('multimedia.videos', updated);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Audio
                </Label>
                <div className="space-y-2">
                  {activity.multimedia.audio.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="truncate">{url}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = activity.multimedia.audio.filter((_, i) => i !== index);
                          updateActivity('multimedia.audio', updated);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="space-y-2">
                <Label>Required Materials</Label>
                <div className="space-y-2">
                  {activity.materials.map((material, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={material}
                        onChange={(e) => {
                          const updated = [...activity.materials];
                          updated[index] = e.target.value;
                          updateActivity('materials', updated);
                        }}
                        placeholder="Enter material needed"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = activity.materials.filter((_, i) => i !== index);
                          updateActivity('materials', updated);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button onClick={addMaterial} variant="outline" size="sm">
                    Add Material
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adaptations Tab */}
        <TabsContent value="adaptations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adaptations & Differentiation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="easier">Make it Easier</Label>
                <Textarea
                  id="easier"
                  value={activity.adaptations.easier}
                  onChange={(e) => updateActivity('adaptations.easier', e.target.value)}
                  placeholder="How can this activity be simplified for struggling learners?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="harder">Make it Harder</Label>
                <Textarea
                  id="harder"
                  value={activity.adaptations.harder}
                  onChange={(e) => updateActivity('adaptations.harder', e.target.value)}
                  placeholder="How can this activity be extended for advanced learners?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessibility">Accessibility Considerations</Label>
                <Textarea
                  id="accessibility"
                  value={activity.adaptations.accessibility}
                  onChange={(e) => updateActivity('adaptations.accessibility', e.target.value)}
                  placeholder="What accommodations are needed for students with disabilities?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tags & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {activity.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => {
                          const updated = activity.tags.filter((_, i) => i !== index);
                          updateActivity('tags', updated);
                        }}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tag (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              {activity.aiGenerated?.isAiGenerated && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    This activity was generated using AI ({activity.aiGenerated.provider}) with 
                    {Math.round((activity.aiGenerated.confidence || 0) * 100)}% confidence.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Panel Modal - Would be implemented as a separate component */}
      {/* Template Selection Modal - Would be implemented as a separate component */}
      
    </div>
  );
};