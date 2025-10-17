import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { usePersonalization, PersonalizationProfile } from '@/hooks/usePersonalization';
import { Child } from '@/types/learning';

interface PersonalizationCenterProps {
  child: Child;
  onClose?: () => void;
}

const PersonalizationCenterNew: React.FC<PersonalizationCenterProps> = ({ child, onClose }) => {
  const { getProfile, createProfile, setPreference } = usePersonalization();
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [activeTab, setActiveTab] = useState('preferences');

  useEffect(() => {
    let childProfile = getProfile(child.id);
    if (!childProfile) {
      childProfile = createProfile(child);
    }
    setProfile(childProfile);
  }, [child.id, getProfile, createProfile]);

  const updatePreference = async (key: string, value: any) => {
    await setPreference(child.id, key, value);
    const updated = getProfile(child.id);
    setProfile(updated);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚙️</div>
          <p className="text-xl font-['Comic_Neue'] text-purple-700">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Kid-Friendly Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-5xl animate-bounce">⚙️</div>
            <h1 className="text-4xl font-['Fredoka_One'] bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              {child.name}'s Special Settings! 
            </h1>
            <div className="text-5xl animate-bounce delay-150">✨</div>
          </div>
          <p className="text-lg font-['Comic_Neue'] text-purple-600">
            Make your learning adventure just the way you like it! 🎨
          </p>
        </div>

        {/* Main Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50 backdrop-blur-sm">
            <TabsTrigger 
              value="preferences" 
              className="font-['Comic_Neue'] font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              🎮 Fun Settings
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="font-['Comic_Neue'] font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-500 data-[state=active]:text-white"
            >
              🧠 How I Learn
            </TabsTrigger>
            <TabsTrigger 
              value="themes" 
              className="font-['Comic_Neue'] font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
            >
              🎨 Colors & Sounds
            </TabsTrigger>
            <TabsTrigger 
              value="helper" 
              className="font-['Comic_Neue'] font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
            >
              🤝 Helper Tools
            </TabsTrigger>
          </TabsList>

          {/* Fun Settings Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Activity Difficulty */}
              <Card className="bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-xl transition-all transform hover:scale-105">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <CardTitle className="font-['Comic_Neue'] text-purple-700">How Hard Should It Be?</CardTitle>
                  <CardDescription>Choose if you want easy, medium, or hard activities!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-['Comic_Neue'] font-bold">Difficulty Level: {profile.preferences.difficulty || 'medium'}</Label>
                    <Slider
                      value={[profile.preferences.difficulty === 'easy' ? 1 : profile.preferences.difficulty === 'hard' ? 3 : 2]}
                      onValueChange={(value) => {
                        const level = value[0] === 1 ? 'easy' : value[0] === 3 ? 'hard' : 'medium';
                        updatePreference('difficulty', level);
                      }}
                      max={3}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-purple-600 font-['Comic_Neue']">
                      <span>😊 Easy</span>
                      <span>🤔 Medium</span>
                      <span>🤯 Hard</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Duration */}
              <Card className="bg-white/70 backdrop-blur-sm border-blue-200 hover:shadow-xl transition-all transform hover:scale-105">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">⏰</div>
                  <CardTitle className="font-['Comic_Neue'] text-blue-700">How Long to Play?</CardTitle>
                  <CardDescription>Pick how many minutes you want to play each activity!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-['Comic_Neue'] font-bold">
                      Play Time: {profile.preferences.sessionDuration || 15} minutes
                    </Label>
                    <Slider
                      value={[profile.preferences.sessionDuration || 15]}
                      onValueChange={(value) => updatePreference('sessionDuration', value[0])}
                      max={30}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-blue-600 font-['Comic_Neue']">
                      <span>⚡ Quick (5)</span>
                      <span>✨ Perfect (15)</span>
                      <span>🎯 Long (30)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Language Settings */}
              <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all transform hover:scale-105">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">🗣️</div>
                  <CardTitle className="font-['Comic_Neue'] text-green-700">What Language?</CardTitle>
                  <CardDescription>Choose your favorite language for activities!</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={profile.cultural?.primaryLanguage || 'english'}
                    onValueChange={(value) => updatePreference('primaryLanguage', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">🇺🇸 English</SelectItem>
                      <SelectItem value="malayalam">🇮🇳 Malayalam</SelectItem>
                      <SelectItem value="arabic">🇸🇦 Arabic</SelectItem>
                      <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="french">🇫🇷 French</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Quick Settings */}
              <Card className="bg-white/70 backdrop-blur-sm border-pink-200 hover:shadow-xl transition-all transform hover:scale-105">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <CardTitle className="font-['Comic_Neue'] text-pink-700">Quick Settings</CardTitle>
                  <CardDescription>Turn on or off special features!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-['Comic_Neue'] font-bold">🔊 Sound Effects</Label>
                    <Switch
                      checked={profile.preferences.soundEnabled || true}
                      onCheckedChange={(checked) => updatePreference('soundEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-['Comic_Neue'] font-bold">🎬 Animations</Label>
                    <Switch
                      checked={profile.preferences.animationsEnabled || true}
                      onCheckedChange={(checked) => updatePreference('animationsEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-['Comic_Neue'] font-bold">🏆 Show Progress</Label>
                    <Switch
                      checked={profile.preferences.showProgress || true}
                      onCheckedChange={(checked) => updatePreference('showProgress', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Style Tab */}
          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Visual Learner */}
              <Card className="bg-white/70 backdrop-blur-sm border-yellow-200 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                    onClick={() => updatePreference('learningStyle', 'visual')}>
                <CardHeader className="text-center">
                  <div className="text-5xl mb-2">👀</div>
                  <CardTitle className="font-['Comic_Neue'] text-yellow-700">I Learn by Seeing!</CardTitle>
                  <CardDescription>Pictures, colors, and videos help me learn best!</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant={profile.learningStyle?.primaryStyle === 'visual' ? 'default' : 'outline'} 
                         className="font-['Comic_Neue'] font-bold">
                    {profile.learningStyle?.primaryStyle === 'visual' ? '✨ Selected!' : 'Choose This'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Audio Learner */}
              <Card className="bg-white/70 backdrop-blur-sm border-blue-200 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                    onClick={() => updatePreference('learningStyle', 'auditory')}>
                <CardHeader className="text-center">
                  <div className="text-5xl mb-2">👂</div>
                  <CardTitle className="font-['Comic_Neue'] text-blue-700">I Learn by Hearing!</CardTitle>
                  <CardDescription>Sounds, music, and voices help me learn best!</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant={profile.learningStyle?.primaryStyle === 'auditory' ? 'default' : 'outline'} 
                         className="font-['Comic_Neue'] font-bold">
                    {profile.learningStyle?.primaryStyle === 'auditory' ? '✨ Selected!' : 'Choose This'}
                  </Badge>
                </CardContent>
              </Card>

              {/* Kinesthetic Learner */}
              <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
                    onClick={() => updatePreference('learningStyle', 'kinesthetic')}>
                <CardHeader className="text-center">
                  <div className="text-5xl mb-2">✋</div>
                  <CardTitle className="font-['Comic_Neue'] text-green-700">I Learn by Doing!</CardTitle>
                  <CardDescription>Moving, touching, and playing help me learn best!</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant={profile.learningStyle?.primaryStyle === 'kinesthetic' ? 'default' : 'outline'} 
                         className="font-['Comic_Neue'] font-bold">
                    {profile.learningStyle?.primaryStyle === 'kinesthetic' ? '✨ Selected!' : 'Choose This'}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Theme Options */}
              {[
                { name: 'Rainbow', emoji: '🌈', gradient: 'from-red-400 via-yellow-400 to-green-400' },
                { name: 'Ocean', emoji: '🌊', gradient: 'from-blue-400 via-cyan-400 to-teal-400' },
                { name: 'Forest', emoji: '🌲', gradient: 'from-green-400 via-emerald-400 to-lime-400' },
                { name: 'Sunset', emoji: '🌅', gradient: 'from-orange-400 via-red-400 to-pink-400' },
                { name: 'Galaxy', emoji: '🌌', gradient: 'from-purple-400 via-indigo-400 to-blue-400' },
                { name: 'Garden', emoji: '🌸', gradient: 'from-pink-400 via-rose-400 to-red-400' },
                { name: 'Magic', emoji: '✨', gradient: 'from-yellow-400 via-purple-400 to-pink-400' },
                { name: 'Candy', emoji: '🍭', gradient: 'from-pink-400 via-purple-400 to-blue-400' },
              ].map((theme) => (
                <Card key={theme.name} 
                      className={`bg-gradient-to-br ${theme.gradient} hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer border-2 ${
                        profile.preferences.theme === theme.name.toLowerCase() ? 'border-white border-4' : 'border-white/20'
                      }`}
                      onClick={() => updatePreference('theme', theme.name.toLowerCase())}>
                  <CardContent className="text-center p-4">
                    <div className="text-3xl mb-2">{theme.emoji}</div>
                    <p className="font-['Comic_Neue'] font-bold text-white text-shadow">
                      {theme.name}
                    </p>
                    {profile.preferences.theme === theme.name.toLowerCase() && (
                      <div className="text-xl mt-2">✨</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Volume Control */}
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🔊</div>
                <CardTitle className="font-['Comic_Neue'] text-purple-700">Sound Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="font-['Comic_Neue'] font-bold">
                    Volume: {Math.round((profile.preferences.volume || 0.7) * 100)}%
                  </Label>
                  <Slider
                    value={[(profile.preferences.volume || 0.7) * 100]}
                    onValueChange={(value) => updatePreference('volume', value[0] / 100)}
                    max={100}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Helper Tools Tab */}
          <TabsContent value="helper" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Reading Helper */}
              <Card className="bg-white/70 backdrop-blur-sm border-purple-200 hover:shadow-xl transition-all transform hover:scale-105">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">📖</div>
                  <CardTitle className="font-['Comic_Neue'] text-purple-700">Reading Helper</CardTitle>
                  <CardDescription>Make reading easier and more fun!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-['Comic_Neue'] font-bold">🔤 Big Letters</Label>
                    <Switch
                      checked={profile.accessibility?.fontSize === 'large'}
                      onCheckedChange={(checked) => updatePreference('fontSize', checked ? 'large' : 'medium')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-['Comic_Neue'] font-bold">🗣️ Read Aloud</Label>
                    <Switch
                      checked={profile.accessibility?.textToSpeech || false}
                      onCheckedChange={(checked) => updatePreference('textToSpeech', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-['Comic_Neue'] font-bold">🌈 Color Words</Label>
                    <Switch
                      checked={profile.accessibility?.colorCoding || false}
                      onCheckedChange={(checked) => updatePreference('colorCoding', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Focus Helper */}
              <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all transform hover:scale-105">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <CardTitle className="font-['Comic_Neue'] text-green-700">Focus Helper</CardTitle>
                  <CardDescription>Tools to help you pay attention!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-['Comic_Neue'] font-bold">⏸️ Fewer Distractions</Label>
                    <Switch
                      checked={profile.accessibility?.reducedMotion || false}
                      onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-['Comic_Neue'] font-bold">🔇 Quiet Mode</Label>
                    <Switch
                      checked={profile.accessibility?.quietMode || false}
                      onCheckedChange={(checked) => updatePreference('quietMode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-['Comic_Neue'] font-bold">⏰ Break Reminders</Label>
                    <Switch
                      checked={profile.preferences.breakReminders || false}
                      onCheckedChange={(checked) => updatePreference('breakReminders', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Fun Progress Display */}
        <Card className="mt-8 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-3xl animate-bounce">🌟</div>
              <h3 className="text-xl font-['Comic_Neue'] font-bold">You're doing AMAZING!</h3>
              <div className="text-3xl animate-bounce delay-150">🎉</div>
            </div>
            <p className="text-white/90 font-['Comic_Neue']">
              These settings will make your learning adventure even more fun! 
              You can change them anytime by asking a grown-up to help you! 💝
            </p>
          </CardContent>
        </Card>

        {/* Close Button */}
        {onClose && (
          <div className="text-center mt-8">
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-['Comic_Neue'] font-bold text-lg py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
            >
              ✨ All Done! Let's Learn! ✨
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizationCenterNew;