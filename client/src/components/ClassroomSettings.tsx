import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Settings,
  Users,
  Shield,
  Clock,
  Calendar,
  Mail,
  Bell,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Download,
  Upload,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  School,
  QrCode,
  Share,
  Archive,
  RotateCcw,
  Info,
  Globe,
  UserCheck,
  UserX,
  Timer,
  Target,
  BookOpen,
  Award
} from 'lucide-react';

interface Class {
  _id: string;
  name: string;
  description?: string;
  subject?: string;
  gradeLevel: string;
  settings: {
    maxStudents: number;
    autoApproval: boolean;
    allowParentView: boolean;
    public: boolean;
    allowLateJoin: boolean;
    requireApproval: boolean;
  };
  joinCode: string;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
    timezone: string;
  };
  analytics: {
    totalStudents: number;
    activeStudents: number;
  };
}

interface ClassroomSettingsProps {
  classData: Class;
  onUpdateClass: (updates: Partial<Class>) => void;
}

export const ClassroomSettings: React.FC<ClassroomSettingsProps> = ({
  classData,
  onUpdateClass
}) => {
  const [formData, setFormData] = useState({
    name: classData.name,
    description: classData.description || '',
    subject: classData.subject || '',
    gradeLevel: classData.gradeLevel,
    maxStudents: classData.settings.maxStudents,
    autoApproval: classData.settings.autoApproval,
    allowParentView: classData.settings.allowParentView,
    public: classData.settings.public,
    allowLateJoin: classData.settings.allowLateJoin,
    requireApproval: classData.settings.requireApproval,
    scheduleEnabled: !!classData.schedule,
    scheduleDays: classData.schedule?.days || [],
    startTime: classData.schedule?.startTime || '09:00',
    endTime: classData.schedule?.endTime || '17:00',
    timezone: classData.schedule?.timezone || 'UTC'
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const subjects = [
    'math', 'science', 'english', 'history', 'art', 'music', 'physical-education', 'other'
  ];

  const gradeLevels = [
    'pre-k', 'kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', 'mixed'
  ];

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleDayToggle = (day: string) => {
    const newDays = formData.scheduleDays.includes(day)
      ? formData.scheduleDays.filter(d => d !== day)
      : [...formData.scheduleDays, day];
    
    handleInputChange('scheduleDays', newDays);
  };

  const handleSave = () => {
    const updates = {
      name: formData.name,
      description: formData.description,
      subject: formData.subject,
      gradeLevel: formData.gradeLevel,
      settings: {
        ...classData.settings,
        maxStudents: formData.maxStudents,
        autoApproval: formData.autoApproval,
        allowParentView: formData.allowParentView,
        public: formData.public,
        allowLateJoin: formData.allowLateJoin,
        requireApproval: formData.requireApproval
      },
      schedule: formData.scheduleEnabled ? {
        days: formData.scheduleDays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        timezone: formData.timezone
      } : undefined
    };

    onUpdateClass(updates);
    setHasUnsavedChanges(false);
  };

  const handleGenerateNewCode = async () => {
    setIsGeneratingCode(true);
    // Simulate API call
    setTimeout(() => {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      console.log('New join code:', newCode);
      setIsGeneratingCode(false);
    }, 1000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      setFormData({
        name: classData.name,
        description: classData.description || '',
        subject: classData.subject || '',
        gradeLevel: classData.gradeLevel,
        maxStudents: classData.settings.maxStudents,
        autoApproval: classData.settings.autoApproval,
        allowParentView: classData.settings.allowParentView,
        public: classData.settings.public,
        allowLateJoin: classData.settings.allowLateJoin,
        requireApproval: classData.settings.requireApproval,
        scheduleEnabled: !!classData.schedule,
        scheduleDays: classData.schedule?.days || [],
        startTime: classData.schedule?.startTime || '09:00',
        endTime: classData.schedule?.endTime || '17:00',
        timezone: classData.schedule?.timezone || 'UTC'
      });
      setHasUnsavedChanges(false);
    }
  };

  const handleArchiveClass = () => {
    if (confirm('Are you sure you want to archive this class? Students will no longer be able to access it.')) {
      console.log('Archive class:', classData._id);
    }
  };

  const handleDeleteClass = () => {
    if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      if (confirm('This will permanently delete all class data, assignments, and student progress. Type "DELETE" to confirm.')) {
        console.log('Delete class:', classData._id);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Classroom Settings</h2>
          <p className="text-gray-600">Manage your classroom configuration and preferences</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset} disabled={!hasUnsavedChanges}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter class name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>
                            {subject.charAt(0).toUpperCase() + subject.slice(1).replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    <Select value={formData.gradeLevel} onValueChange={(value) => handleInputChange('gradeLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeLevels.map(grade => (
                          <SelectItem key={grade} value={grade}>
                            {grade.charAt(0).toUpperCase() + grade.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Maximum Students: {formData.maxStudents}</Label>
                    <Slider
                      value={[formData.maxStudents]}
                      onValueChange={(value) => handleInputChange('maxStudents', value[0])}
                      max={100}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter class description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Class Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {classData.analytics.totalStudents}
                    </div>
                    <div className="text-sm text-blue-700">Total Students</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {classData.analytics.activeStudents}
                    </div>
                    <div className="text-sm text-green-700">Active Students</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((classData.analytics.totalStudents / formData.maxStudents) * 100)}%
                    </div>
                    <div className="text-sm text-purple-700">Capacity Used</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Access Control */}
        <TabsContent value="access">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Join Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-2xl font-bold font-mono tracking-wider">
                      {classData.joinCode}
                    </div>
                    <div className="text-sm text-gray-600">Students use this code to join your class</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGenerateNewCode}
                      disabled={isGeneratingCode}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                      Generate New
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Access Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-approve join requests</Label>
                    <p className="text-sm text-gray-600">Students join immediately without your approval</p>
                  </div>
                  <Switch
                    checked={formData.autoApproval}
                    onCheckedChange={(checked) => handleInputChange('autoApproval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require manual approval</Label>
                    <p className="text-sm text-gray-600">You must approve each student before they can access the class</p>
                  </div>
                  <Switch
                    checked={formData.requireApproval}
                    onCheckedChange={(checked) => handleInputChange('requireApproval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow late joining</Label>
                    <p className="text-sm text-gray-600">Students can join even after the semester has started</p>
                  </div>
                  <Switch
                    checked={formData.allowLateJoin}
                    onCheckedChange={(checked) => handleInputChange('allowLateJoin', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public class</Label>
                    <p className="text-sm text-gray-600">Class appears in public directory for discovery</p>
                  </div>
                  <Switch
                    checked={formData.public}
                    onCheckedChange={(checked) => handleInputChange('public', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow parent view</Label>
                    <p className="text-sm text-gray-600">Parents can view their child's progress in this class</p>
                  </div>
                  <Switch
                    checked={formData.allowParentView}
                    onCheckedChange={(checked) => handleInputChange('allowParentView', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Class Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable scheduled classes</Label>
                  <p className="text-sm text-gray-600">Set regular meeting times for your class</p>
                </div>
                <Switch
                  checked={formData.scheduleEnabled}
                  onCheckedChange={(checked) => handleInputChange('scheduleEnabled', checked)}
                />
              </div>

              {formData.scheduleEnabled && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Meeting Days</Label>
                    <div className="grid grid-cols-7 gap-2 mt-3">
                      {daysOfWeek.map(day => (
                        <Button
                          key={day}
                          variant={formData.scheduleDays.includes(day) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDayToggle(day)}
                          className="h-12"
                        >
                          {day.substring(0, 3).toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map(tz => (
                            <SelectItem key={tz} value={tz}>
                              {tz.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Student Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>New student joins</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Assignment submissions</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Low engagement alerts</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">System Updates</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Weekly progress reports</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Platform updates</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Maintenance notifications</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share class analytics</Label>
                    <p className="text-sm text-gray-600">Allow platform to use anonymized class data for research</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Student data retention</Label>
                    <p className="text-sm text-gray-600">Keep student progress data after class ends</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Parent access logs</Label>
                    <p className="text-sm text-gray-600">Log when parents view their child's progress</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Export student data</Label>
                    <p className="text-sm text-gray-600">Allow exporting individual student progress</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-4">Data Export</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Class Data
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Student Progress
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Assignment Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Advanced Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Students
                  </Button>
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Class
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Backup Class
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Restore Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Archive className="h-5 w-5" />
                  Archive Class
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Archive this class to preserve data while making it inactive. Students won't be able to access archived classes.
                </p>
                <Button variant="outline" onClick={handleArchiveClass}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Class
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Delete Class</h4>
                    <p className="text-red-700 text-sm mb-3">
                      Permanently delete this class and all associated data. This action cannot be undone.
                    </p>
                    <Button variant="destructive" onClick={handleDeleteClass}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Class
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassroomSettings;