import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

import { InteractiveActivity, InteractiveQuestion, ACTIVITY_TEMPLATES, ActivityTemplate } from '@/types/ActivityTemplates';

import {
  Wand2,
  Save,
  Eye,
  Upload,
  Download,
  Palette,
  Type,
  Image as ImageIcon,
  Video,
  Headphones,
  Gamepad2,
  BookOpen,
  Plus,
  Minus,
  Copy,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Sparkles,
  Target,
  Clock,
  Users,
  Tag,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Brain,
  Star
} from 'lucide-react';

interface ActivityCreationWizardProps {
  onActivityCreated: (activity: InteractiveActivity) => void;
  onClose: () => void;
  editingActivity?: InteractiveActivity | null;
}

interface ActivityFormData {
  title: string;
  description: string;
  instructions: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ageGroup: string;
  estimatedTime: number;
  language: string;
  tags: string[];
  isPublic: boolean;
  objectives: string[];
  type: 'drag_drop' | 'multiple_choice' | 'fill_blank' | 'drawing' | 'matching' | 'counting' | 'tracing';
}

interface QuestionFormData extends Omit<InteractiveQuestion, 'id'> {
  tempId: string;
}

const ActivityCreationWizard: React.FC<ActivityCreationWizardProps> = ({
  onActivityCreated,
  onClose,
  editingActivity
}) => {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form data
  const [activityData, setActivityData] = useState<ActivityFormData>({
    title: '',
    description: '',
    instructions: '',
    category: '',
    difficulty: 'easy',
    ageGroup: 'elementary',
    estimatedTime: 10,
    language: 'en',
    tags: [],
    isPublic: true,
    objectives: [],
    type: 'multiple_choice'
  });

  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  // Template and AI generation
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generationSettings, setGenerationSettings] = useState({
    questionCount: 5,
    includeHints: true,
    includeVisuals: true,
    adaptiveDifficulty: false
  });

  // Initialize form with editing data
  useEffect(() => {
    if (editingActivity) {
      setActivityData({
        title: editingActivity.title,
        description: editingActivity.description,
        instructions: editingActivity.instructions,
        category: 'learning', // Default category
        difficulty: 'medium', // Default difficulty
        ageGroup: 'elementary',
        estimatedTime: editingActivity.estimatedTime,
        language: 'en',
        tags: [],
        isPublic: true,
        objectives: [],
        type: editingActivity.type
      });

      setQuestions(editingActivity.questions.map((q, index) => ({
        ...q,
        tempId: `temp_${index}`
      })));
    }
  }, [editingActivity]);

  // Step navigation
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return activityData.title && activityData.description && activityData.category;
      case 2:
        return questions.length > 0;
      case 3:
        return true; // Settings step is optional
      case 4:
        return true; // Preview step
      default:
        return false;
    }
  };

  // AI Generation
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      // Simulate AI generation - in real app, call AI service
      const template = selectedTemplate || ACTIVITY_TEMPLATES[0];
      const generatedActivity = template.generateActivity(aiPrompt);

      setActivityData(prev => ({
        ...prev,
        title: generatedActivity.title,
        description: generatedActivity.description,
        instructions: generatedActivity.instructions,
        type: generatedActivity.type
      }));

      setQuestions(generatedActivity.questions.map((q, index) => ({
        ...q,
        tempId: `generated_${index}`
      })));

      goToNextStep();
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Question management
  const addQuestion = () => {
    const newQuestion: QuestionFormData = {
      tempId: `temp_${Date.now()}`,
      type: activityData.type,
      question: '',
      options: activityData.type === 'multiple_choice' ? [
        { id: 'opt1', value: '', isCorrect: true },
        { id: 'opt2', value: '', isCorrect: false },
        { id: 'opt3', value: '', isCorrect: false }
      ] : undefined,
      correctAnswer: '',
      hints: [''],
      feedback: {
        correct: 'Great job!',
        incorrect: 'Try again!',
        encouragement: 'Keep learning!'
      },
      visualElements: []
    };

    setQuestions(prev => [...prev, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const updateQuestion = (index: number, updates: Partial<QuestionFormData>) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, ...updates } : q
    ));
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    if (currentQuestionIndex >= questions.length - 1) {
      setCurrentQuestionIndex(Math.max(0, questions.length - 2));
    }
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = questions[index];
    const duplicatedQuestion: QuestionFormData = {
      ...questionToDuplicate,
      tempId: `dup_${Date.now()}`,
      question: `${questionToDuplicate.question} (Copy)`
    };
    
    setQuestions(prev => [
      ...prev.slice(0, index + 1),
      duplicatedQuestion,
      ...prev.slice(index + 1)
    ]);
  };

  // Activity creation/update
  const saveActivity = async () => {
    setIsSaving(true);
    try {
      const activityToSave: InteractiveActivity = {
        id: editingActivity?.id || `activity_${Date.now()}`,
        title: activityData.title,
        description: activityData.description,
        type: activityData.type,
        instructions: activityData.instructions,
        questions: questions.map(({ tempId, ...q }) => ({
          ...q,
          id: `q_${Date.now()}_${Math.random()}`
        })),
        rewards: {
          points: activityData.estimatedTime * 2,
          badges: [`${activityData.category} Champion`],
          stickers: ['⭐', '🌟', '🎉'],
          celebrationMessage: `Amazing! You completed ${activityData.title}!`
        },
        estimatedTime: activityData.estimatedTime
      };

      // Simulate saving - in real app, call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onActivityCreated(activityToSave);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderQuestionsStep();
      case 3:
        return renderSettingsStep();
      case 4:
        return renderPreviewStep();
      default:
        return null;
    }
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with the fundamentals of your activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Activity Title *</Label>
            <Input
              id="title"
              value={activityData.title}
              onChange={(e) => setActivityData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter a catchy title..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={activityData.description}
              onChange={(e) => setActivityData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What will students learn from this activity?"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={activityData.instructions}
              onChange={(e) => setActivityData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="How should students complete this activity?"
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={activityData.category} 
                onValueChange={(value) => setActivityData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alphabet">Alphabet</SelectItem>
                  <SelectItem value="numbers">Numbers</SelectItem>
                  <SelectItem value="shapes">Shapes</SelectItem>
                  <SelectItem value="colors">Colors</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                  <SelectItem value="math">Math</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={activityData.difficulty} 
                onValueChange={(value: 'easy' | 'medium' | 'hard') => setActivityData(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ageGroup">Age Group</Label>
              <Select 
                value={activityData.ageGroup} 
                onValueChange={(value) => setActivityData(prev => ({ ...prev, ageGroup: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preschool">Preschool (3-5)</SelectItem>
                  <SelectItem value="elementary">Elementary (6-10)</SelectItem>
                  <SelectItem value="middle">Middle (11-13)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
              <div className="mt-1">
                <Slider
                  value={[activityData.estimatedTime]}
                  onValueChange={(value) => setActivityData(prev => ({ ...prev, estimatedTime: value[0] }))}
                  max={60}
                  min={5}
                  step={5}
                  className="mt-2"
                />
                <div className="text-center mt-1 text-sm text-gray-600">
                  {activityData.estimatedTime} minutes
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="type">Activity Type</Label>
            <Select 
              value={activityData.type} 
              onValueChange={(value: any) => setActivityData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="drag_drop">Drag & Drop</SelectItem>
                <SelectItem value="fill_blank">Fill in the Blanks</SelectItem>
                <SelectItem value="drawing">Drawing</SelectItem>
                <SelectItem value="matching">Matching</SelectItem>
                <SelectItem value="counting">Counting</SelectItem>
                <SelectItem value="tracing">Tracing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column - AI Generation */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              AI-Powered Generation
            </CardTitle>
            <p className="text-sm text-gray-600">
              Let AI help you create engaging activities
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template">Choose Template</Label>
              <Select 
                value={selectedTemplate?.id || ''} 
                onValueChange={(value) => {
                  const template = ACTIVITY_TEMPLATES.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="aiPrompt">Describe Your Activity</Label>
              <Textarea
                id="aiPrompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., 'Create a fun activity about animals that helps kids learn animal names and sounds'"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Number of Questions</Label>
                <span className="text-sm text-gray-600">{generationSettings.questionCount}</span>
              </div>
              <Slider
                value={[generationSettings.questionCount]}
                onValueChange={(value) => setGenerationSettings(prev => ({ ...prev, questionCount: value[0] }))}
                max={10}
                min={3}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Include Hints</Label>
                <Switch
                  checked={generationSettings.includeHints}
                  onCheckedChange={(checked) => setGenerationSettings(prev => ({ ...prev, includeHints: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Include Visual Elements</Label>
                <Switch
                  checked={generationSettings.includeVisuals}
                  onCheckedChange={(checked) => setGenerationSettings(prev => ({ ...prev, includeVisuals: checked }))}
                />
              </div>
            </div>

            <Button
              onClick={generateWithAI}
              disabled={!aiPrompt.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Activity
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Questions & Content</h2>
          <p className="text-gray-600">Create engaging questions for your activity</p>
        </div>
        <Button onClick={addQuestion} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No questions yet</h3>
            <p className="text-gray-500 mb-4">Add your first question to get started</p>
            <Button onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Questions ({questions.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {questions.map((question, index) => (
                <Card 
                  key={question.tempId}
                  className={`cursor-pointer transition-all ${
                    currentQuestionIndex === index 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            Q{index + 1}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-800 truncate">
                          {question.question || 'Untitled question'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateQuestion(index);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQuestion(index);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Question Editor */}
          <div className="lg:col-span-2">
            {questions[currentQuestionIndex] && (
              <QuestionEditor
                question={questions[currentQuestionIndex]}
                questionIndex={currentQuestionIndex}
                onUpdate={(updates) => updateQuestion(currentQuestionIndex, updates)}
                activityType={activityData.type}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Activity Settings</h2>
        <p className="text-gray-600">Configure additional options for your activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Public Activity</Label>
                <p className="text-xs text-gray-600">Allow other educators to use this activity</p>
              </div>
              <Switch
                checked={activityData.isPublic}
                onCheckedChange={(checked) => setActivityData(prev => ({ ...prev, isPublic: checked }))}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={activityData.tags.join(', ')}
                onChange={(e) => setActivityData(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
                placeholder="Add tags separated by commas"
                className="mt-1"
              />
              <p className="text-xs text-gray-600 mt-1">
                Help others discover your activity with relevant tags
              </p>
            </div>

            <div>
              <Label htmlFor="objectives">Learning Objectives</Label>
              <Textarea
                id="objectives"
                value={activityData.objectives.join('\n')}
                onChange={(e) => setActivityData(prev => ({ 
                  ...prev, 
                  objectives: e.target.value.split('\n').filter(Boolean)
                }))}
                placeholder="List learning objectives, one per line"
                className="mt-1"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Advanced Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={activityData.language} 
                onValueChange={(value) => setActivityData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                  <SelectItem value="ml">Malayalam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Estimated Time</Label>
              <div className="px-3">
                <Slider
                  value={[activityData.estimatedTime]}
                  onValueChange={(value) => setActivityData(prev => ({ ...prev, estimatedTime: value[0] }))}
                  max={60}
                  min={5}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>5 min</span>
                  <span className="font-medium">{activityData.estimatedTime} minutes</span>
                  <span>60 min</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Pro Tip</h4>
                  <p className="text-sm text-blue-800">
                    Activities with clear objectives and appropriate difficulty levels 
                    get better engagement from students.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview & Publish</h2>
        <p className="text-gray-600">Review your activity before making it available</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Activity Preview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <Settings className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {previewMode ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-bold mb-2">{activityData.title}</h3>
                <p className="text-gray-600 mb-4">{activityData.description}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {activityData.estimatedTime} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {questions.length} questions
                  </div>
                  <Badge>{activityData.difficulty}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Title</Label>
                  <p className="font-semibold">{activityData.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Category</Label>
                  <p className="font-semibold capitalize">{activityData.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Difficulty</Label>
                  <Badge variant="secondary" className="capitalize">{activityData.difficulty}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Questions</Label>
                  <p className="font-semibold">{questions.length} questions</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p>{activityData.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Instructions</Label>
                <p>{activityData.instructions || 'No specific instructions provided'}</p>
              </div>

              {activityData.objectives.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Learning Objectives</Label>
                  <ul className="list-disc list-inside space-y-1">
                    {activityData.objectives.map((objective, index) => (
                      <li key={index} className="text-sm">{objective}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activityData.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {activityData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-green-800">Ready to Publish</h4>
            <p className="text-sm text-green-700">Your activity is complete and ready for students</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-blue-800">Visibility</h4>
            <p className="text-sm text-blue-700">
              {activityData.isPublic ? 'Public - Other educators can use' : 'Private - Only you can use'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-purple-800">Impact</h4>
            <p className="text-sm text-purple-700">Students will earn {activityData.estimatedTime * 2} points</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {editingActivity ? 'Edit Activity' : 'Create New Activity'}
          </h1>
          <p className="text-gray-600">
            {editingActivity ? 'Update your existing activity' : 'Build an engaging learning experience for your students'}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            
            return (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold
                    ${isActive 
                      ? 'border-purple-500 bg-purple-500 text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < totalSteps && (
                  <div
                    className={`
                      w-20 h-1 mx-2
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between mt-2">
          <span className="text-sm font-medium text-gray-600">Basic Info</span>
          <span className="text-sm font-medium text-gray-600">Questions</span>
          <span className="text-sm font-medium text-gray-600">Settings</span>
          <span className="text-sm font-medium text-gray-600">Preview</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <Progress value={(currentStep / totalSteps) * 100} className="w-32 h-2" />
        </div>

        <div className="flex items-center gap-2">
          {currentStep === totalSteps ? (
            <Button
              onClick={saveActivity}
              disabled={!canProceed() || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingActivity ? 'Update Activity' : 'Publish Activity'}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goToNextStep}
              disabled={!canProceed()}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Question Editor Component
interface QuestionEditorProps {
  question: QuestionFormData;
  questionIndex: number;
  onUpdate: (updates: Partial<QuestionFormData>) => void;
  activityType: string;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  questionIndex,
  onUpdate,
  activityType
}) => {
  const addOption = () => {
    const newOption = {
      id: `opt_${Date.now()}`,
      value: '',
      isCorrect: false
    };
    
    onUpdate({
      options: [...(question.options || []), newOption]
    });
  };

  const updateOption = (optionIndex: number, updates: any) => {
    const updatedOptions = (question.options || []).map((opt, index) =>
      index === optionIndex ? { ...opt, ...updates } : opt
    );
    
    onUpdate({ options: updatedOptions });
  };

  const removeOption = (optionIndex: number) => {
    const updatedOptions = (question.options || []).filter((_, index) => index !== optionIndex);
    onUpdate({ options: updatedOptions });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Question {questionIndex + 1}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="question">Question Text *</Label>
          <Textarea
            id="question"
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter your question here..."
            className="mt-1"
            rows={2}
          />
        </div>

        {activityType === 'multiple_choice' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Answer Options</Label>
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {(question.options || []).map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input
                    value={option.value}
                    onChange={(e) => updateOption(index, { value: e.target.value })}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    variant={option.isCorrect ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateOption(index, { isCorrect: !option.isCorrect })}
                  >
                    {option.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    disabled={(question.options || []).length <= 2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="correct-feedback">Correct Answer Feedback</Label>
            <Textarea
              id="correct-feedback"
              value={question.feedback.correct}
              onChange={(e) => onUpdate({ 
                feedback: { ...question.feedback, correct: e.target.value }
              })}
              placeholder="What to show when answer is correct..."
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="incorrect-feedback">Incorrect Answer Feedback</Label>
            <Textarea
              id="incorrect-feedback"
              value={question.feedback.incorrect}
              onChange={(e) => onUpdate({ 
                feedback: { ...question.feedback, incorrect: e.target.value }
              })}
              placeholder="What to show when answer is incorrect..."
              className="mt-1"
              rows={2}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="hints">Hints (optional)</Label>
          <Textarea
            id="hints"
            value={question.hints?.join('\n') || ''}
            onChange={(e) => onUpdate({ 
              hints: e.target.value.split('\n').filter(Boolean)
            })}
            placeholder="Add helpful hints, one per line..."
            className="mt-1"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCreationWizard;