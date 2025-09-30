import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { usePersonalization, PersonalizationProfile, AdaptiveRecommendation } from '@/hooks/usePersonalization';
import { useProgress } from '@/hooks/useProgress';
import { Child } from '@/types/learning';
import { Settings, User, Brain, Globe, Accessibility, BarChart3, Download, Upload, Trash2, RefreshCw, Eye, Languages, Palette, Volume2, MousePointer, Clock, Star, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Target } from 'lucide-react';

interface PersonalizationCenterProps {
  child: Child;
  onClose?: () => void;
}

const PersonalizationCenter: React.FC<PersonalizationCenterProps> = ({ child, onClose }) => {
  const {
    getProfile,
    createProfile,
    updateProfile,
    getPreference,
    setPreference,
    analyzeUsagePatterns,
    applyAdaptiveSettings,
    detectLearningStyle,
    updateLearningStyle,
    setCulturalPreferences,
    configureAccessibility,
    getAccessibilitySettings,
    getBehaviorInsights,
    getPersonalizedSettings,
    exportProfileData,
    importProfileData,
    clearAllData
  } = usePersonalization();

  const { getChildProgress } = useProgress();

  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [learningStyleDetection, setLearningStyleDetection] = useState(false);

  useEffect(() => {
    let childProfile = getProfile(child.id);
    if (!childProfile) {
      childProfile = createProfile(child);
    }
    setProfile(childProfile);
  }, [child.id, getProfile, createProfile]);

  useEffect(() => {
    if (profile) {
      analyzePatterns();
    }
  }, [profile]);

  const analyzePatterns = async () => {
    if (!profile) return;
    
    setIsAnalyzing(true);
    try {
      const patterns = await analyzeUsagePatterns(child.id);
      setRecommendations(patterns);
    } catch (error) {
      console.error('Failed to analyze patterns:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyRecommendations = async () => {
    if (!profile || recommendations.length === 0) return;

    try {
      await applyAdaptiveSettings(child.id, recommendations);
      // Refresh profile
      const updated = getProfile(child.id);
      setProfile(updated);
      setRecommendations([]);
    } catch (error) {
      console.error('Failed to apply recommendations:', error);
    }
  };

  const handleDetectLearningStyle = async () => {
    setLearningStyleDetection(true);
    try {
      const detectedStyle = await detectLearningStyle(child.id);
      await updateLearningStyle(child.id, detectedStyle);
      
      const updated = getProfile(child.id);
      setProfile(updated);
    } catch (error) {
      console.error('Failed to detect learning style:', error);
    } finally {
      setLearningStyleDetection(false);
    }
  };

  const updatePreference = async (key: string, value: any) => {
    await setPreference(child.id, key, value);
    const updated = getProfile(child.id);
    setProfile(updated);
  };

  const updateProfileSection = async (section: keyof PersonalizationProfile, data: any) => {
    if (!profile) return;
    
    await updateProfile(child.id, { [section]: data });
    const updated = getProfile(child.id);
    setProfile(updated);
  };

  const handleExportData = async () => {
    try {
      const data = await exportProfileData(child.id);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${child.name}-personalization-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleClearData = async () => {
    try {
      await clearAllData(child.id);
      const newProfile = createProfile(child);
      setProfile(newProfile);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  if (!profile) {
    return <div>Loading personalization data...</div>;
  }

  const progressData = getChildProgress(child.id);
  const accessibilitySettings = getAccessibilitySettings(child.id);
  const behaviorInsights = getBehaviorInsights(child.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Personalization Center for {child.name}
            </h1>
            <p className="text-gray-600">
              Customize learning experience and adaptive settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowConfirmDialog(true)} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Reset
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="learning">Learning Style</TabsTrigger>
            <TabsTrigger value="cultural">Cultural</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="adaptive">Adaptive AI</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Profile Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Style</CardTitle>
                  <Brain className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{profile.learningStyle.primary}</div>
                  <p className="text-xs text-muted-foreground">
                    {(profile.learningStyle.confidence * 100).toFixed(0)}% confidence
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cultural Context</CardTitle>
                  <Globe className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.culturalPreferences.primaryCulture}</div>
                  <p className="text-xs text-muted-foreground">
                    {profile.culturalPreferences.languagePreference.length} languages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Session Length</CardTitle>
                  <Clock className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{behaviorInsights.sessionLength} min</div>
                  <p className="text-xs text-muted-foreground">
                    Average session duration
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Recommendations */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>
                    Based on {child.name}'s learning patterns and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <div className={`p-1 rounded ${
                          rec.impact === 'high' ? 'bg-red-100' : 
                          rec.impact === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          <Target className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium capitalize">{rec.type} Optimization</h4>
                          <p className="text-sm text-gray-600">{rec.reasoning}</p>
                          <div className="flex items-center mt-2">
                            <Badge variant="outline" className="mr-2">
                              {rec.confidence * 100}% confidence
                            </Badge>
                            <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'default' : 'secondary'}>
                              {rec.impact} impact
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleApplyRecommendations} className="w-full">
                      Apply All Recommendations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-difficulty">Auto Difficulty Adjustment</Label>
                      <Switch
                        id="auto-difficulty"
                        checked={profile.adaptiveSettings.difficultyAdjustment === 'automatic'}
                        onCheckedChange={(checked) => 
                          updateProfileSection('adaptiveSettings', {
                            ...profile.adaptiveSettings,
                            difficultyAdjustment: checked ? 'automatic' : 'manual'
                          })
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="content-localization">Content Localization</Label>
                      <Switch
                        id="content-localization"
                        checked={profile.culturalPreferences.contentLocalisation}
                        onCheckedChange={(checked) => 
                          updateProfileSection('culturalPreferences', {
                            ...profile.culturalPreferences,
                            contentLocalisation: checked
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound-effects">Sound Effects</Label>
                      <Switch
                        id="sound-effects"
                        checked={accessibilitySettings.sounds === 'full'}
                        onCheckedChange={(checked) => 
                          updateProfileSection('accessibilityNeeds', {
                            ...profile.accessibilityNeeds,
                            sounds: checked ? 'full' : 'disabled'
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Feedback Frequency</Label>
                      <Select 
                        value={profile.adaptiveSettings.feedbackFrequency} 
                        onValueChange={(value) => 
                          updateProfileSection('adaptiveSettings', {
                            ...profile.adaptiveSettings,
                            feedbackFrequency: value
                          })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="periodic">Periodic</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Text Size</Label>
                      <Select 
                        value={accessibilitySettings.textSize} 
                        onValueChange={(value) => 
                          updateProfileSection('accessibilityNeeds', {
                            ...profile.accessibilityNeeds,
                            textSize: value
                          })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="xl">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Style Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Learning Style Analysis
                </CardTitle>
                <CardDescription>
                  Understanding how {child.name} learns best
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { style: 'visual', icon: Eye, label: 'Visual', description: 'Learns through seeing' },
                    { style: 'auditory', icon: Volume2, label: 'Auditory', description: 'Learns through hearing' },
                    { style: 'kinesthetic', icon: MousePointer, label: 'Kinesthetic', description: 'Learns through touch' },
                    { style: 'reading', icon: Settings, label: 'Reading', description: 'Learns through text' }
                  ].map(({ style, icon: Icon, label, description }) => (
                    <Card 
                      key={style}
                      className={`cursor-pointer transition-all ${
                        profile.learningStyle.primary === style 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => updateLearningStyle(child.id, { primary: style as any })}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <h3 className="font-medium">{label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{description}</p>
                        {profile.learningStyle.primary === style && (
                          <Badge className="mt-2">Primary</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">AI Learning Style Detection</h4>
                    <p className="text-sm text-gray-600">
                      Analyze {child.name}'s activity patterns to automatically detect learning style
                    </p>
                  </div>
                  <Button 
                    onClick={handleDetectLearningStyle}
                    disabled={learningStyleDetection}
                  >
                    {learningStyleDetection ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Detect Style
                      </>
                    )}
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Learning Preferences</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Pace Control</Label>
                      <Select 
                        value={profile.adaptiveSettings.paceControl} 
                        onValueChange={(value) => 
                          updateProfileSection('adaptiveSettings', {
                            ...profile.adaptiveSettings,
                            paceControl: value
                          })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="self">Self-Paced</SelectItem>
                          <SelectItem value="guided">Guided Pace</SelectItem>
                          <SelectItem value="adaptive">Adaptive Pace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Hint System</Label>
                      <Select 
                        value={profile.adaptiveSettings.hintSystem} 
                        onValueChange={(value) => 
                          updateProfileSection('adaptiveSettings', {
                            ...profile.adaptiveSettings,
                            hintSystem: value
                          })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="proactive">Proactive Hints</SelectItem>
                          <SelectItem value="on-demand">On-Demand</SelectItem>
                          <SelectItem value="disabled">No Hints</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cultural Tab */}
          <TabsContent value="cultural" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Cultural Preferences
                </CardTitle>
                <CardDescription>
                  Customize content to reflect {child.name}'s cultural background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Primary Culture</Label>
                    <Select 
                      value={profile.culturalPreferences.primaryCulture} 
                      onValueChange={(value) => 
                        setCulturalPreferences(child.id, { primaryCulture: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="international">International</SelectItem>
                        <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                        <SelectItem value="south-asian">South Asian</SelectItem>
                        <SelectItem value="east-asian">East Asian</SelectItem>
                        <SelectItem value="african">African</SelectItem>
                        <SelectItem value="european">European</SelectItem>
                        <SelectItem value="latin-american">Latin American</SelectItem>
                        <SelectItem value="north-american">North American</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language Preference</Label>
                    <Select 
                      value={profile.culturalPreferences.languagePreference[0] || 'en'} 
                      onValueChange={(value) => 
                        setCulturalPreferences(child.id, { 
                          languagePreference: [value, ...profile.culturalPreferences.languagePreference.filter(l => l !== value)] 
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="ml">Malayalam</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Cultural Sensitivity Level</Label>
                  <div className="mt-3">
                    <Slider
                      value={[profile.culturalPreferences.culturalSensitivity === 'low' ? 1 : 
                              profile.culturalPreferences.culturalSensitivity === 'medium' ? 2 : 3]}
                      onValueChange={([value]) => 
                        setCulturalPreferences(child.id, { 
                          culturalSensitivity: value === 1 ? 'low' : value === 2 ? 'medium' : 'high' 
                        })
                      }
                      min={1}
                      max={3}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Content Localization</Label>
                    <p className="text-sm text-gray-500">
                      Adapt stories and examples to cultural context
                    </p>
                  </div>
                  <Switch
                    checked={profile.culturalPreferences.contentLocalisation}
                    onCheckedChange={(checked) => 
                      setCulturalPreferences(child.id, { contentLocalisation: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Accessibility className="h-5 w-5 mr-2" />
                  Accessibility Settings
                </CardTitle>
                <CardDescription>
                  Configure accessibility features for {child.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Visual Support</Label>
                        <p className="text-sm text-gray-500">Enhanced visual cues and indicators</p>
                      </div>
                      <Switch
                        checked={accessibilitySettings.visualSupport}
                        onCheckedChange={(checked) => 
                          configureAccessibility(child.id, { visualSupport: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auditory Support</Label>
                        <p className="text-sm text-gray-500">Text-to-speech and audio cues</p>
                      </div>
                      <Switch
                        checked={accessibilitySettings.auditorySupport}
                        onCheckedChange={(checked) => 
                          configureAccessibility(child.id, { auditorySupport: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Motor Support</Label>
                        <p className="text-sm text-gray-500">Larger touch targets and simplified gestures</p>
                      </div>
                      <Switch
                        checked={accessibilitySettings.motorSupport}
                        onCheckedChange={(checked) => 
                          configureAccessibility(child.id, { motorSupport: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Cognitive Support</Label>
                        <p className="text-sm text-gray-500">Simplified interfaces and extra guidance</p>
                      </div>
                      <Switch
                        checked={accessibilitySettings.cognitiveSupport}
                        onCheckedChange={(checked) => 
                          configureAccessibility(child.id, { cognitiveSupport: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Color Contrast</Label>
                      <Select 
                        value={accessibilitySettings.colorContrast} 
                        onValueChange={(value) => 
                          configureAccessibility(child.id, { colorContrast: value as any })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High Contrast</SelectItem>
                          <SelectItem value="inverted">Inverted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Animation Level</Label>
                      <Select 
                        value={accessibilitySettings.animations} 
                        onValueChange={(value) => 
                          configureAccessibility(child.id, { animations: value as any })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Animations</SelectItem>
                          <SelectItem value="reduced">Reduced Motion</SelectItem>
                          <SelectItem value="disabled">No Animations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Sound Preferences</Label>
                      <Select 
                        value={accessibilitySettings.sounds} 
                        onValueChange={(value) => 
                          configureAccessibility(child.id, { sounds: value as any })
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">All Sounds</SelectItem>
                          <SelectItem value="essential">Essential Only</SelectItem>
                          <SelectItem value="disabled">No Sounds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Behavior Insights
                </CardTitle>
                <CardDescription>
                  Understanding {child.name}'s learning patterns and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Session Length</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{behaviorInsights.sessionLength} min</div>
                      <Progress value={Math.min(100, (behaviorInsights.sessionLength / 30) * 100)} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Attention Span</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{behaviorInsights.attentionSpan} min</div>
                      <Progress value={Math.min(100, (behaviorInsights.attentionSpan / 20) * 100)} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Break Frequency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{behaviorInsights.breakFrequency} min</div>
                      <Progress value={Math.min(100, (behaviorInsights.breakFrequency / 15) * 100)} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Preferred Learning Time</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['morning', 'afternoon', 'evening', 'flexible'].map((time) => (
                      <Button
                        key={time}
                        variant={behaviorInsights.preferredTimeOfDay === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => 
                          updateProfileSection('behaviorPatterns', {
                            ...profile.behaviorPatterns,
                            preferredTimeOfDay: time
                          })
                        }
                      >
                        {time.charAt(0).toUpperCase() + time.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Motivation Triggers</h4>
                  <div className="flex flex-wrap gap-2">
                    {['praise', 'progress', 'stars', 'badges', 'challenges', 'stories'].map((trigger) => (
                      <Badge
                        key={trigger}
                        variant={behaviorInsights.motivationTriggers.includes(trigger) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const triggers = behaviorInsights.motivationTriggers.includes(trigger)
                            ? behaviorInsights.motivationTriggers.filter(t => t !== trigger)
                            : [...behaviorInsights.motivationTriggers, trigger];
                          
                          updateProfileSection('behaviorPatterns', {
                            ...profile.behaviorPatterns,
                            motivationTriggers: triggers
                          });
                        }}
                      >
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adaptive AI Tab */}
          <TabsContent value="adaptive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Adaptive AI Insights
                </CardTitle>
                <CardDescription>
                  AI-powered personalization and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Analyze Learning Patterns</h4>
                    <p className="text-sm text-gray-600">
                      Run AI analysis on {child.name}'s activity data
                    </p>
                  </div>
                  <Button onClick={analyzePatterns} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>

                {recommendations.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Recommendations</h4>
                    {recommendations.map((rec, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium capitalize">{rec.type} Optimization</h5>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {(rec.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                            <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'default' : 'secondary'}>
                              {rec.impact}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{rec.reasoning}</p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <pre>{JSON.stringify(rec.suggestion, null, 2)}</pre>
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleApplyRecommendations} className="w-full">
                      Apply All Recommendations
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Learning Style Confidence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {(profile.learningStyle.confidence * 100).toFixed(0)}%
                      </div>
                      <Progress value={profile.learningStyle.confidence * 100} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Profile Completeness</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {Math.round(Object.keys(profile.preferences).length / 10 * 100)}%
                      </div>
                      <Progress value={Object.keys(profile.preferences).length / 10 * 100} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Personalization Data</DialogTitle>
              <DialogDescription>
                This will permanently delete all personalization data for {child.name}. 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearData}>
                Reset Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PersonalizationCenter;