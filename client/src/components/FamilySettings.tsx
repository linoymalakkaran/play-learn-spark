import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Shield, 
  Clock, 
  Eye, 
  Smartphone, 
  Settings, 
  Bell, 
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Mail,
  MessageSquare,
  Trophy,
  Star,
  Users,
  Home,
  Globe,
  Wifi,
  Monitor,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Palette,
  Zap,
  Heart,
  Target,
  BookOpen,
  FileText,
  Save,
  RotateCcw
} from 'lucide-react';

interface FamilySettingsProps {
  children: Array<{
    _id: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
      age?: number;
      grade?: string;
    };
  }>;
  onSettingsUpdate: (settings: any) => void;
}

interface TimeRestriction {
  day: string;
  startTime: string;
  endTime: string;
  maxDuration: number; // in minutes
  enabled: boolean;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  achievements: boolean;
  progress: boolean;
  warnings: boolean;
  dailyReport: boolean;
  weeklyReport: boolean;
}

interface ContentFilters {
  maxAgeRating: number;
  blockedKeywords: string[];
  allowedDomains: string[];
  restrictedCategories: string[];
  educationalOnly: boolean;
}

interface PrivacySettings {
  shareProgressWithTeachers: boolean;
  allowDataCollection: boolean;
  shareAchievements: boolean;
  publicProfile: boolean;
  allowFriendRequests: boolean;
  locationTracking: boolean;
}

export const FamilySettings: React.FC<FamilySettingsProps> = ({
  children,
  onSettingsUpdate
}) => {
  const [selectedChild, setSelectedChild] = useState<string>(children[0]?._id || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Time restrictions state
  const [timeRestrictions, setTimeRestrictions] = useState<TimeRestriction[]>([
    { day: 'Monday', startTime: '16:00', endTime: '18:00', maxDuration: 120, enabled: true },
    { day: 'Tuesday', startTime: '16:00', endTime: '18:00', maxDuration: 120, enabled: true },
    { day: 'Wednesday', startTime: '16:00', endTime: '18:00', maxDuration: 120, enabled: true },
    { day: 'Thursday', startTime: '16:00', endTime: '18:00', maxDuration: 120, enabled: true },
    { day: 'Friday', startTime: '16:00', endTime: '19:00', maxDuration: 180, enabled: true },
    { day: 'Saturday', startTime: '09:00', endTime: '17:00', maxDuration: 240, enabled: true },
    { day: 'Sunday', startTime: '09:00', endTime: '17:00', maxDuration: 240, enabled: true },
  ]);

  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    achievements: true,
    progress: true,
    warnings: true,
    dailyReport: false,
    weeklyReport: true,
  });

  // Content filters state
  const [contentFilters, setContentFilters] = useState<ContentFilters>({
    maxAgeRating: 13,
    blockedKeywords: ['inappropriate', 'violent'],
    allowedDomains: ['edu', 'educational-games.com'],
    restrictedCategories: ['social-media', 'gaming'],
    educationalOnly: false,
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    shareProgressWithTeachers: true,
    allowDataCollection: true,
    shareAchievements: true,
    publicProfile: false,
    allowFriendRequests: true,
    locationTracking: false,
  });

  // Device settings state
  const [deviceSettings, setDeviceSettings] = useState({
    soundEnabled: true,
    nightMode: false,
    fontSize: 'medium',
    theme: 'colorful',
    offlineMode: false,
    autoSave: true,
    language: 'en',
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      reducedMotion: false,
    }
  });

  const [parentalControls, setParentalControls] = useState({
    requireApprovalForRewards: true,
    requireApprovalForFriends: true,
    blockInappropriateContent: true,
    monitorChatMessages: true,
    restrictPurchases: true,
    emergencyContactsOnly: false,
    geofencing: {
      enabled: false,
      locations: [],
      notifications: true,
    }
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const themes = ['colorful', 'minimal', 'dark', 'nature', 'space'];
  const fontSizes = ['small', 'medium', 'large', 'extra-large'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
  ];

  const handleSaveSettings = () => {
    const allSettings = {
      childId: selectedChild,
      timeRestrictions,
      notifications,
      contentFilters,
      privacy,
      deviceSettings,
      parentalControls,
      lastUpdated: new Date(),
    };

    onSettingsUpdate(allSettings);
    setHasUnsavedChanges(false);
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      // Reset all settings to defaults
      setTimeRestrictions([
        { day: 'Monday', startTime: '16:00', endTime: '18:00', maxDuration: 120, enabled: true },
        { day: 'Tuesday', startTime: '16:00', endTime: '18:00', maxDuration: 120, enabled: true },
        { day: 'Wednesday', startTime: '16:00', endTime: '18:00', maxDuration: 120, enabled: true },
        { day: 'Thursday', startTime: '16:00', endTime: '18:00', maxDuration: 120, enabled: true },
        { day: 'Friday', startTime: '16:00', endTime: '19:00', maxDuration: 180, enabled: true },
        { day: 'Saturday', startTime: '09:00', endTime: '17:00', maxDuration: 240, enabled: true },
        { day: 'Sunday', startTime: '09:00', endTime: '17:00', maxDuration: 240, enabled: true },
      ]);
      
      setNotifications({
        email: true,
        push: true,
        sms: false,
        achievements: true,
        progress: true,
        warnings: true,
        dailyReport: false,
        weeklyReport: true,
      });

      setContentFilters({
        maxAgeRating: 13,
        blockedKeywords: [],
        allowedDomains: [],
        restrictedCategories: [],
        educationalOnly: false,
      });

      setPrivacy({
        shareProgressWithTeachers: true,
        allowDataCollection: true,
        shareAchievements: true,
        publicProfile: false,
        allowFriendRequests: true,
        locationTracking: false,
      });

      setHasUnsavedChanges(true);
    }
  };

  const updateTimeRestriction = (day: string, field: string, value: any) => {
    setTimeRestrictions(prev => 
      prev.map(restriction => 
        restriction.day === day 
          ? { ...restriction, [field]: value }
          : restriction
      )
    );
    setHasUnsavedChanges(true);
  };

  const updateNotifications = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const updateContentFilters = (field: string, value: any) => {
    setContentFilters(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const updatePrivacy = (field: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const addBlockedKeyword = (keyword: string) => {
    if (keyword.trim() && !contentFilters.blockedKeywords.includes(keyword.trim())) {
      updateContentFilters('blockedKeywords', [...contentFilters.blockedKeywords, keyword.trim()]);
    }
  };

  const removeBlockedKeyword = (keyword: string) => {
    updateContentFilters('blockedKeywords', contentFilters.blockedKeywords.filter(k => k !== keyword));
  };

  const selectedChildData = children.find(child => child._id === selectedChild);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Family Settings</h2>
          <p className="text-gray-600">Manage controls and preferences for your children</p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleResetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Defaults
          </Button>
          <Button onClick={handleSaveSettings} disabled={!hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Child
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger>
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {children.map(child => (
                  <SelectItem key={child._id} value={child._id}>
                    {child.profile?.firstName || child.username} 
                    {child.profile?.age && ` (Age ${child.profile.age})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="time" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="device" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Device
          </TabsTrigger>
          <TabsTrigger value="parental" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Controls
          </TabsTrigger>
        </TabsList>

        {/* Time Restrictions */}
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Restrictions
              </CardTitle>
              <p className="text-sm text-gray-600">
                Set daily usage limits and allowed hours for {selectedChildData?.profile?.firstName || 'this child'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {timeRestrictions.map((restriction) => (
                <div key={restriction.day} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={restriction.enabled}
                      onCheckedChange={(checked) => updateTimeRestriction(restriction.day, 'enabled', checked)}
                    />
                    <Label className="font-medium w-20">{restriction.day}</Label>
                  </div>
                  
                  {restriction.enabled && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">From:</Label>
                        <Input
                          type="time"
                          value={restriction.startTime}
                          onChange={(e) => updateTimeRestriction(restriction.day, 'startTime', e.target.value)}
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">To:</Label>
                        <Input
                          type="time"
                          value={restriction.endTime}
                          onChange={(e) => updateTimeRestriction(restriction.day, 'endTime', e.target.value)}
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Max:</Label>
                        <Input
                          type="number"
                          value={restriction.maxDuration}
                          onChange={(e) => updateTimeRestriction(restriction.day, 'maxDuration', parseInt(e.target.value))}
                          className="w-20"
                          min="30"
                          max="480"
                        />
                        <span className="text-sm text-gray-500">min</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Filters */}
        <TabsContent value="content">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Content Filtering
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Maximum Age Rating: {contentFilters.maxAgeRating}</Label>
                    <Slider
                      value={[contentFilters.maxAgeRating]}
                      onValueChange={(value) => updateContentFilters('maxAgeRating', value[0])}
                      max={18}
                      min={3}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>3+</span>
                      <span>7+</span>
                      <span>13+</span>
                      <span>18+</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Educational Content Only</Label>
                    <Switch
                      checked={contentFilters.educationalOnly}
                      onCheckedChange={(checked) => updateContentFilters('educationalOnly', checked)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Blocked Keywords</Label>
                  <div className="flex gap-2 mt-2 mb-2">
                    <Input
                      placeholder="Add keyword to block..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addBlockedKeyword(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {contentFilters.blockedKeywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="cursor-pointer" onClick={() => removeBlockedKeyword(keyword)}>
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Delivery Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <Label>Email Notifications</Label>
                      </div>
                      <Switch checked={notifications.email} onCheckedChange={(checked) => updateNotifications('email', checked)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <Label>Push Notifications</Label>
                      </div>
                      <Switch checked={notifications.push} onCheckedChange={(checked) => updateNotifications('push', checked)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <Label>SMS Notifications</Label>
                      </div>
                      <Switch checked={notifications.sms} onCheckedChange={(checked) => updateNotifications('sms', checked)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <Label>Achievements</Label>
                      </div>
                      <Switch checked={notifications.achievements} onCheckedChange={(checked) => updateNotifications('achievements', checked)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <Label>Progress Updates</Label>
                      </div>
                      <Switch checked={notifications.progress} onCheckedChange={(checked) => updateNotifications('progress', checked)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <Label>Warnings & Alerts</Label>
                      </div>
                      <Switch checked={notifications.warnings} onCheckedChange={(checked) => updateNotifications('warnings', checked)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <Label>Weekly Reports</Label>
                      </div>
                      <Switch checked={notifications.weeklyReport} onCheckedChange={(checked) => updateNotifications('weeklyReport', checked)} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Progress with Teachers</Label>
                  <p className="text-sm text-gray-600">Allow teachers to see learning progress</p>
                </div>
                <Switch checked={privacy.shareProgressWithTeachers} onCheckedChange={(checked) => updatePrivacy('shareProgressWithTeachers', checked)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Data Collection</Label>
                  <p className="text-sm text-gray-600">Help improve the platform with usage analytics</p>
                </div>
                <Switch checked={privacy.allowDataCollection} onCheckedChange={(checked) => updatePrivacy('allowDataCollection', checked)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Achievements</Label>
                  <p className="text-sm text-gray-600">Allow achievements to be shared with family</p>
                </div>
                <Switch checked={privacy.shareAchievements} onCheckedChange={(checked) => updatePrivacy('shareAchievements', checked)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-gray-600">Make profile visible to other users</p>
                </div>
                <Switch checked={privacy.publicProfile} onCheckedChange={(checked) => updatePrivacy('publicProfile', checked)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Friend Requests</Label>
                  <p className="text-sm text-gray-600">Enable friend connections with other children</p>
                </div>
                <Switch checked={privacy.allowFriendRequests} onCheckedChange={(checked) => updatePrivacy('allowFriendRequests', checked)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Location Tracking</Label>
                  <p className="text-sm text-gray-600">Track device location for safety features</p>
                </div>
                <Switch checked={privacy.locationTracking} onCheckedChange={(checked) => updatePrivacy('locationTracking', checked)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Device Settings */}
        <TabsContent value="device">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Device & Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Sound Effects</Label>
                    <Switch 
                      checked={deviceSettings.soundEnabled} 
                      onCheckedChange={(checked) => {
                        setDeviceSettings(prev => ({ ...prev, soundEnabled: checked }));
                        setHasUnsavedChanges(true);
                      }} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Night Mode</Label>
                    <Switch 
                      checked={deviceSettings.nightMode} 
                      onCheckedChange={(checked) => {
                        setDeviceSettings(prev => ({ ...prev, nightMode: checked }));
                        setHasUnsavedChanges(true);
                      }} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Auto-Save Progress</Label>
                    <Switch 
                      checked={deviceSettings.autoSave} 
                      onCheckedChange={(checked) => {
                        setDeviceSettings(prev => ({ ...prev, autoSave: checked }));
                        setHasUnsavedChanges(true);
                      }} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Font Size</Label>
                    <Select 
                      value={deviceSettings.fontSize} 
                      onValueChange={(value) => {
                        setDeviceSettings(prev => ({ ...prev, fontSize: value }));
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontSizes.map(size => (
                          <SelectItem key={size} value={size}>
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Theme</Label>
                    <Select 
                      value={deviceSettings.theme} 
                      onValueChange={(value) => {
                        setDeviceSettings(prev => ({ ...prev, theme: value }));
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map(theme => (
                          <SelectItem key={theme} value={theme}>
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select 
                      value={deviceSettings.language} 
                      onValueChange={(value) => {
                        setDeviceSettings(prev => ({ ...prev, language: value }));
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Accessibility Options */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-4">Accessibility</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>High Contrast</Label>
                    <Switch 
                      checked={deviceSettings.accessibility.highContrast} 
                      onCheckedChange={(checked) => {
                        setDeviceSettings(prev => ({ 
                          ...prev, 
                          accessibility: { ...prev.accessibility, highContrast: checked }
                        }));
                        setHasUnsavedChanges(true);
                      }} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Large Text</Label>
                    <Switch 
                      checked={deviceSettings.accessibility.largeText} 
                      onCheckedChange={(checked) => {
                        setDeviceSettings(prev => ({ 
                          ...prev, 
                          accessibility: { ...prev.accessibility, largeText: checked }
                        }));
                        setHasUnsavedChanges(true);
                      }} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Screen Reader Support</Label>
                    <Switch 
                      checked={deviceSettings.accessibility.screenReader} 
                      onCheckedChange={(checked) => {
                        setDeviceSettings(prev => ({ 
                          ...prev, 
                          accessibility: { ...prev.accessibility, screenReader: checked }
                        }));
                        setHasUnsavedChanges(true);
                      }} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Reduced Motion</Label>
                    <Switch 
                      checked={deviceSettings.accessibility.reducedMotion} 
                      onCheckedChange={(checked) => {
                        setDeviceSettings(prev => ({ 
                          ...prev, 
                          accessibility: { ...prev.accessibility, reducedMotion: checked }
                        }));
                        setHasUnsavedChanges(true);
                      }} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parental Controls */}
        <TabsContent value="parental">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Parental Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Approval for Rewards</Label>
                  <p className="text-sm text-gray-600">Parent must approve reward redemptions</p>
                </div>
                <Switch 
                  checked={parentalControls.requireApprovalForRewards} 
                  onCheckedChange={(checked) => {
                    setParentalControls(prev => ({ ...prev, requireApprovalForRewards: checked }));
                    setHasUnsavedChanges(true);
                  }} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Approval for Friends</Label>
                  <p className="text-sm text-gray-600">Parent must approve friend requests</p>
                </div>
                <Switch 
                  checked={parentalControls.requireApprovalForFriends} 
                  onCheckedChange={(checked) => {
                    setParentalControls(prev => ({ ...prev, requireApprovalForFriends: checked }));
                    setHasUnsavedChanges(true);
                  }} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Block Inappropriate Content</Label>
                  <p className="text-sm text-gray-600">Automatically filter harmful content</p>
                </div>
                <Switch 
                  checked={parentalControls.blockInappropriateContent} 
                  onCheckedChange={(checked) => {
                    setParentalControls(prev => ({ ...prev, blockInappropriateContent: checked }));
                    setHasUnsavedChanges(true);
                  }} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Monitor Chat Messages</Label>
                  <p className="text-sm text-gray-600">Review messages with other users</p>
                </div>
                <Switch 
                  checked={parentalControls.monitorChatMessages} 
                  onCheckedChange={(checked) => {
                    setParentalControls(prev => ({ ...prev, monitorChatMessages: checked }));
                    setHasUnsavedChanges(true);
                  }} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Restrict Purchases</Label>
                  <p className="text-sm text-gray-600">Prevent in-app purchases</p>
                </div>
                <Switch 
                  checked={parentalControls.restrictPurchases} 
                  onCheckedChange={(checked) => {
                    setParentalControls(prev => ({ ...prev, restrictPurchases: checked }));
                    setHasUnsavedChanges(true);
                  }} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Emergency Contacts Only</Label>
                  <p className="text-sm text-gray-600">Limit communication to approved contacts</p>
                </div>
                <Switch 
                  checked={parentalControls.emergencyContactsOnly} 
                  onCheckedChange={(checked) => {
                    setParentalControls(prev => ({ ...prev, emergencyContactsOnly: checked }));
                    setHasUnsavedChanges(true);
                  }} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilySettings;