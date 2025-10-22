import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { InteractiveActivity } from '@/types/ActivityTemplates';

import {
  Send,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Globe,
  Lock,
  Calendar as CalendarIcon,
  Tag,
  Star,
  Share2,
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Headphones,
  Target,
  Award,
  TrendingUp,
  BarChart,
  Settings,
  Bell,
  Mail,
  MessageSquare,
  ThumbsUp,
  Flag,
  Archive,
  Trash2,
  Edit,
  Copy,
  RefreshCw,
  Sparkles,
  Zap,
  BookOpen,
  Gamepad2,
  PlusCircle,
  MinusCircle,
  Info,
  ExternalLink,
  Upload,
  Shield,
  UserCheck,
  Calendar as CalendarCheck
} from 'lucide-react';

interface PublishingWorkflowProps {
  activity: InteractiveActivity;
  onPublish?: (publishData: PublishingData) => void;
  onSaveDraft?: (draftData: PublishingData) => void;
  onCancel?: () => void;
}

interface PublishingData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  targetAudience: {
    ageGroups: string[];
    skillLevels: string[];
    subjects: string[];
  };
  visibility: 'public' | 'private' | 'unlisted' | 'organization';
  accessibility: {
    hasAltText: boolean;
    hasTranscripts: boolean;
    hasSubtitles: boolean;
    colorBlindFriendly: boolean;
    keyboardNavigable: boolean;
  };
  licensing: {
    type: 'cc-by' | 'cc-by-sa' | 'cc-by-nc' | 'cc-by-nc-sa' | 'all-rights-reserved' | 'custom';
    customTerms?: string;
    allowCommercialUse: boolean;
    allowModifications: boolean;
  };
  scheduling: {
    publishNow: boolean;
    scheduledDate?: Date;
    expirationDate?: Date;
  };
  notifications: {
    notifyFollowers: boolean;
    sendNewsletterUpdate: boolean;
    shareOnSocialMedia: boolean;
  };
  review: {
    requiresPeerReview: boolean;
    assignedReviewers: string[];
    reviewDeadline?: Date;
  };
  analytics: {
    trackEngagement: boolean;
    trackCompletionRates: boolean;
    allowPublicStats: boolean;
  };
  monetization: {
    isPremium: boolean;
    price?: number;
    currency?: string;
  };
}

const PublishingWorkflow: React.FC<PublishingWorkflowProps> = ({
  activity,
  onPublish,
  onSaveDraft,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);

  const [publishingData, setPublishingData] = useState<PublishingData>({
    title: activity.title || '',
    description: activity.description || '',
    category: 'general',
    tags: [],
    targetAudience: {
      ageGroups: [],
      skillLevels: [],
      subjects: []
    },
    visibility: 'public',
    accessibility: {
      hasAltText: false,
      hasTranscripts: false,
      hasSubtitles: false,
      colorBlindFriendly: false,
      keyboardNavigable: false
    },
    licensing: {
      type: 'cc-by',
      allowCommercialUse: true,
      allowModifications: true
    },
    scheduling: {
      publishNow: true
    },
    notifications: {
      notifyFollowers: true,
      sendNewsletterUpdate: false,
      shareOnSocialMedia: false
    },
    review: {
      requiresPeerReview: false,
      assignedReviewers: []
    },
    analytics: {
      trackEngagement: true,
      trackCompletionRates: true,
      allowPublicStats: true
    },
    monetization: {
      isPremium: false
    }
  });

  // Validation functions
  const validateStep = (step: number): string[] => {
    const errors: string[] = [];

    switch (step) {
      case 1: // Basic Info
        if (!publishingData.title.trim()) {
          errors.push('Title is required');
        }
        if (!publishingData.description.trim()) {
          errors.push('Description is required');
        }
        if (publishingData.tags.length === 0) {
          errors.push('At least one tag is required');
        }
        break;
      
      case 2: // Audience & Category
        if (publishingData.targetAudience.ageGroups.length === 0) {
          errors.push('At least one age group must be selected');
        }
        break;
      
      case 3: // Visibility & Licensing
        if (publishingData.licensing.type === 'custom' && !publishingData.licensing.customTerms) {
          errors.push('Custom license terms are required');
        }
        break;
      
      case 4: // Scheduling & Review
        if (!publishingData.scheduling.publishNow && !publishingData.scheduling.scheduledDate) {
          errors.push('Scheduled date is required when not publishing immediately');
        }
        if (publishingData.review.requiresPeerReview && publishingData.review.assignedReviewers.length === 0) {
          errors.push('At least one reviewer must be assigned for peer review');
        }
        break;
    }

    return errors;
  };

  const validateAllSteps = (): boolean => {
    const allErrors: string[] = [];
    for (let i = 1; i <= 6; i++) {
      allErrors.push(...validateStep(i));
    }
    setValidationErrors(allErrors);
    return allErrors.length === 0;
  };

  // Step navigation
  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (errors.length === 0) {
      setCurrentStep(prev => Math.min(6, prev + 1));
      setValidationErrors([]);
    } else {
      setValidationErrors(errors);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    setValidationErrors([]);
  };

  // Publishing actions
  const handlePublish = async () => {
    if (!validateAllSteps()) return;

    setIsPublishing(true);
    try {
      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      onPublish?.(publishingData);
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    onSaveDraft?.(publishingData);
  };

  // Helper functions
  const updatePublishingData = (updates: Partial<PublishingData>) => {
    setPublishingData(prev => ({ ...prev, ...updates }));
  };

  const updateNestedData = (path: string, value: any) => {
    setPublishingData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  };

  const addTag = (tag: string) => {
    if (tag && !publishingData.tags.includes(tag)) {
      updatePublishingData({
        tags: [...publishingData.tags, tag]
      });
    }
  };

  const removeTag = (tag: string) => {
    updatePublishingData({
      tags: publishingData.tags.filter(t => t !== tag)
    });
  };

  const getStepProgress = () => {
    return (currentStep / 6) * 100;
  };

  const steps = [
    { number: 1, title: 'Basic Information', icon: <FileText className="w-5 h-5" /> },
    { number: 2, title: 'Audience & Category', icon: <Users className="w-5 h-5" /> },
    { number: 3, title: 'Visibility & Licensing', icon: <Shield className="w-5 h-5" /> },
    { number: 4, title: 'Scheduling & Review', icon: <CalendarCheck className="w-5 h-5" /> },
    { number: 5, title: 'Accessibility & Analytics', icon: <BarChart className="w-5 h-5" /> },
    { number: 6, title: 'Final Review', icon: <CheckCircle2 className="w-5 h-5" /> }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Send className="w-8 h-8 text-purple-600" />
            Publishing Workflow
          </h1>
          <p className="text-gray-600 mt-1">Prepare your activity for publication</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Archive className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <Progress value={getStepProgress()} className="h-2" />
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex flex-col items-center text-center ${
                step.number === currentStep 
                  ? 'text-purple-600' 
                  : step.number < currentStep 
                    ? 'text-green-600' 
                    : 'text-gray-400'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step.number === currentStep 
                  ? 'bg-purple-100 text-purple-600' 
                  : step.number < currentStep 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {step.number < currentStep ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
              </div>
              <span className="text-xs font-medium">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep - 1].icon}
            {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Activity Title *</Label>
                <Input
                  id="title"
                  value={publishingData.title}
                  onChange={(e) => updatePublishingData({ title: e.target.value })}
                  placeholder="Enter a descriptive title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={publishingData.description}
                  onChange={(e) => updatePublishingData({ description: e.target.value })}
                  placeholder="Describe what students will learn and do in this activity"
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={publishingData.category} 
                  onValueChange={(value) => updatePublishingData({ category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="language">Language Arts</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="social-studies">Social Studies</SelectItem>
                    <SelectItem value="art">Art & Creativity</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="physical-education">Physical Education</SelectItem>
                    <SelectItem value="life-skills">Life Skills</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="general">General Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tags *</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {publishingData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-xs hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button variant="outline" size="sm">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Suggested: learning-type, subject, skill-level, age-group
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Audience & Category */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Target Age Groups *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    { value: 'preschool', label: 'Preschool (3-5)' },
                    { value: 'kindergarten', label: 'Kindergarten (5-6)' },
                    { value: 'elementary', label: 'Elementary (6-11)' },
                    { value: 'middle-school', label: 'Middle School (11-14)' },
                    { value: 'high-school', label: 'High School (14-18)' },
                    { value: 'adult', label: 'Adult (18+)' }
                  ].map((age) => (
                    <div key={age.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={age.value}
                        checked={publishingData.targetAudience.ageGroups.includes(age.value)}
                        onCheckedChange={(checked) => {
                          const ageGroups = checked
                            ? [...publishingData.targetAudience.ageGroups, age.value]
                            : publishingData.targetAudience.ageGroups.filter(a => a !== age.value);
                          updateNestedData('targetAudience.ageGroups', ageGroups);
                        }}
                      />
                      <Label htmlFor={age.value} className="text-sm">{age.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Skill Levels</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' }
                  ].map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={level.value}
                        checked={publishingData.targetAudience.skillLevels.includes(level.value)}
                        onCheckedChange={(checked) => {
                          const skillLevels = checked
                            ? [...publishingData.targetAudience.skillLevels, level.value]
                            : publishingData.targetAudience.skillLevels.filter(s => s !== level.value);
                          updateNestedData('targetAudience.skillLevels', skillLevels);
                        }}
                      />
                      <Label htmlFor={level.value} className="text-sm">{level.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Subject Areas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {[
                    'Reading', 'Writing', 'Math', 'Science', 'History',
                    'Geography', 'Art', 'Music', 'Physical Education',
                    'Social Skills', 'Critical Thinking', 'Problem Solving'
                  ].map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject}
                        checked={publishingData.targetAudience.subjects.includes(subject)}
                        onCheckedChange={(checked) => {
                          const subjects = checked
                            ? [...publishingData.targetAudience.subjects, subject]
                            : publishingData.targetAudience.subjects.filter(s => s !== subject);
                          updateNestedData('targetAudience.subjects', subjects);
                        }}
                      />
                      <Label htmlFor={subject} className="text-sm">{subject}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Visibility & Licensing */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Visibility</Label>
                <RadioGroup 
                  value={publishingData.visibility} 
                  onValueChange={(value: any) => updatePublishingData({ visibility: value })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Public - Anyone can discover and use this activity
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unlisted" id="unlisted" />
                    <Label htmlFor="unlisted" className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Unlisted - Only people with the link can access
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="organization" id="organization" />
                    <Label htmlFor="organization" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Organization - Only members of your organization
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Private - Only you can access
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div>
                <Label>License</Label>
                <Select 
                  value={publishingData.licensing.type} 
                  onValueChange={(value: any) => updateNestedData('licensing.type', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cc-by">CC BY - Attribution</SelectItem>
                    <SelectItem value="cc-by-sa">CC BY-SA - Attribution ShareAlike</SelectItem>
                    <SelectItem value="cc-by-nc">CC BY-NC - Attribution NonCommercial</SelectItem>
                    <SelectItem value="cc-by-nc-sa">CC BY-NC-SA - Attribution NonCommercial ShareAlike</SelectItem>
                    <SelectItem value="all-rights-reserved">All Rights Reserved</SelectItem>
                    <SelectItem value="custom">Custom License</SelectItem>
                  </SelectContent>
                </Select>

                {publishingData.licensing.type === 'custom' && (
                  <Textarea
                    placeholder="Enter your custom license terms"
                    value={publishingData.licensing.customTerms || ''}
                    onChange={(e) => updateNestedData('licensing.customTerms', e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                )}

                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="commercial"
                      checked={publishingData.licensing.allowCommercialUse}
                      onCheckedChange={(checked) => updateNestedData('licensing.allowCommercialUse', checked)}
                    />
                    <Label htmlFor="commercial" className="text-sm">Allow commercial use</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="modifications"
                      checked={publishingData.licensing.allowModifications}
                      onCheckedChange={(checked) => updateNestedData('licensing.allowModifications', checked)}
                    />
                    <Label htmlFor="modifications" className="text-sm">Allow modifications</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Scheduling & Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <Label>Publishing Schedule</Label>
                <RadioGroup 
                  value={publishingData.scheduling.publishNow ? 'now' : 'later'} 
                  onValueChange={(value) => updateNestedData('scheduling.publishNow', value === 'now')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="now" id="now" />
                    <Label htmlFor="now">Publish immediately</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="later" id="later" />
                    <Label htmlFor="later">Schedule for later</Label>
                  </div>
                </RadioGroup>

                {!publishingData.scheduling.publishNow && (
                  <div className="mt-3">
                    <Popover open={showSchedulePicker} onOpenChange={setShowSchedulePicker}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {publishingData.scheduling.scheduledDate 
                            ? publishingData.scheduling.scheduledDate.toLocaleDateString()
                            : 'Select date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={publishingData.scheduling.scheduledDate}
                          onSelect={(date) => {
                            updateNestedData('scheduling.scheduledDate', date);
                            setShowSchedulePicker(false);
                          }}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              <div>
                <Label>Expiration (Optional)</Label>
                <div className="mt-2">
                  <Popover open={showExpirationPicker} onOpenChange={setShowExpirationPicker}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {publishingData.scheduling.expirationDate 
                          ? publishingData.scheduling.expirationDate.toLocaleDateString()
                          : 'No expiration'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={publishingData.scheduling.expirationDate}
                        onSelect={(date) => {
                          updateNestedData('scheduling.expirationDate', date);
                          setShowExpirationPicker(false);
                        }}
                        disabled={(date) => date <= new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="peerReview"
                    checked={publishingData.review.requiresPeerReview}
                    onCheckedChange={(checked) => updateNestedData('review.requiresPeerReview', checked)}
                  />
                  <Label htmlFor="peerReview">Require peer review before publishing</Label>
                </div>

                {publishingData.review.requiresPeerReview && (
                  <div className="ml-6 space-y-3">
                    <div>
                      <Label>Assigned Reviewers</Label>
                      <Input
                        placeholder="Enter reviewer email addresses (comma separated)"
                        value={publishingData.review.assignedReviewers.join(', ')}
                        onChange={(e) => {
                          const reviewers = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                          updateNestedData('review.assignedReviewers', reviewers);
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Notifications</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifyFollowers"
                      checked={publishingData.notifications.notifyFollowers}
                      onCheckedChange={(checked) => updateNestedData('notifications.notifyFollowers', checked)}
                    />
                    <Label htmlFor="notifyFollowers" className="text-sm">Notify followers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={publishingData.notifications.sendNewsletterUpdate}
                      onCheckedChange={(checked) => updateNestedData('notifications.sendNewsletterUpdate', checked)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">Include in newsletter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="socialMedia"
                      checked={publishingData.notifications.shareOnSocialMedia}
                      onCheckedChange={(checked) => updateNestedData('notifications.shareOnSocialMedia', checked)}
                    />
                    <Label htmlFor="socialMedia" className="text-sm">Share on social media</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Accessibility & Analytics */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <Label>Accessibility Features</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="altText"
                      checked={publishingData.accessibility.hasAltText}
                      onCheckedChange={(checked) => updateNestedData('accessibility.hasAltText', checked)}
                    />
                    <Label htmlFor="altText" className="text-sm">Images have alt text</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="transcripts"
                      checked={publishingData.accessibility.hasTranscripts}
                      onCheckedChange={(checked) => updateNestedData('accessibility.hasTranscripts', checked)}
                    />
                    <Label htmlFor="transcripts" className="text-sm">Audio has transcripts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="subtitles"
                      checked={publishingData.accessibility.hasSubtitles}
                      onCheckedChange={(checked) => updateNestedData('accessibility.hasSubtitles', checked)}
                    />
                    <Label htmlFor="subtitles" className="text-sm">Videos have subtitles</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="colorBlind"
                      checked={publishingData.accessibility.colorBlindFriendly}
                      onCheckedChange={(checked) => updateNestedData('accessibility.colorBlindFriendly', checked)}
                    />
                    <Label htmlFor="colorBlind" className="text-sm">Color-blind friendly design</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="keyboard"
                      checked={publishingData.accessibility.keyboardNavigable}
                      onCheckedChange={(checked) => updateNestedData('accessibility.keyboardNavigable', checked)}
                    />
                    <Label htmlFor="keyboard" className="text-sm">Keyboard navigable</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Analytics & Tracking</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackEngagement"
                      checked={publishingData.analytics.trackEngagement}
                      onCheckedChange={(checked) => updateNestedData('analytics.trackEngagement', checked)}
                    />
                    <Label htmlFor="trackEngagement" className="text-sm">Track user engagement</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackCompletion"
                      checked={publishingData.analytics.trackCompletionRates}
                      onCheckedChange={(checked) => updateNestedData('analytics.trackCompletionRates', checked)}
                    />
                    <Label htmlFor="trackCompletion" className="text-sm">Track completion rates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="publicStats"
                      checked={publishingData.analytics.allowPublicStats}
                      onCheckedChange={(checked) => updateNestedData('analytics.allowPublicStats', checked)}
                    />
                    <Label htmlFor="publicStats" className="text-sm">Allow public statistics</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="premium"
                    checked={publishingData.monetization.isPremium}
                    onCheckedChange={(checked) => updateNestedData('monetization.isPremium', checked)}
                  />
                  <Label htmlFor="premium">Premium Content</Label>
                </div>

                {publishingData.monetization.isPremium && (
                  <div className="ml-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={publishingData.monetization.price || ''}
                        onChange={(e) => updateNestedData('monetization.price', parseFloat(e.target.value))}
                        className="w-24"
                      />
                      <Select 
                        value={publishingData.monetization.currency || 'USD'} 
                        onValueChange={(value) => updateNestedData('monetization.currency', value)}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Final Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Review all settings before publishing. You can edit most of these after publication.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {publishingData.title}</div>
                    <div><strong>Category:</strong> {publishingData.category}</div>
                    <div><strong>Tags:</strong> {publishingData.tags.join(', ')}</div>
                    <div><strong>Description:</strong> {publishingData.description.substring(0, 100)}...</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Audience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Age Groups:</strong> {publishingData.targetAudience.ageGroups.join(', ')}</div>
                    <div><strong>Skill Levels:</strong> {publishingData.targetAudience.skillLevels.join(', ')}</div>
                    <div><strong>Subjects:</strong> {publishingData.targetAudience.subjects.join(', ')}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Visibility & License</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Visibility:</strong> {publishingData.visibility}</div>
                    <div><strong>License:</strong> {publishingData.licensing.type}</div>
                    <div><strong>Commercial Use:</strong> {publishingData.licensing.allowCommercialUse ? 'Yes' : 'No'}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Publishing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>Schedule:</strong> {publishingData.scheduling.publishNow ? 'Immediate' : 'Scheduled'}</div>
                    {publishingData.scheduling.scheduledDate && (
                      <div><strong>Date:</strong> {publishingData.scheduling.scheduledDate.toLocaleDateString()}</div>
                    )}
                    <div><strong>Peer Review:</strong> {publishingData.review.requiresPeerReview ? 'Required' : 'Not required'}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{publishingData.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{publishingData.description}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary">{publishingData.category}</Badge>
                          <Badge variant="outline">{publishingData.visibility}</Badge>
                          {publishingData.monetization.isPremium && (
                            <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {publishingData.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStep === 6 ? (
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publish Activity
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishingWorkflow;