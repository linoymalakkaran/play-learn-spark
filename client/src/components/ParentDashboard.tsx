import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Bell, 
  Settings, 
  Eye,
  EyeOff,
  MessageCircle,
  Calendar,
  BarChart3,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Heart,
  Star,
  Zap,
  Timer,
  Shield
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { relationshipService } from '@/services/relationshipService';
import { ParentRewardApproval } from '@/components/ParentRewardApproval';

interface Child {
  _id: string;
  username: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    age?: number;
    grade?: string;
    avatarUrl?: string;
    dateOfBirth?: Date;
  };
  progress: {
    totalActivitiesCompleted: number;
    currentLevel: number;
    totalPoints: number;
    badges: string[];
    streakDays: number;
    lastActiveDate: Date;
    weeklyGoal?: number;
  };
  preferences: {
    language: string;
    difficulty: string;
    topics: string[];
    notifications: Record<string, boolean>;
    privacy: Record<string, boolean>;
  };
  relationship: {
    _id: string;
    permissions: Record<string, boolean>;
    timeRestrictions?: {
      dailyLimit: number;
      weeklyLimit: number;
      allowedDays: string[];
      allowedTimeSlots: { start: string; end: string; }[];
    };
  };
}

interface FamilyStats {
  totalChildren: number;
  totalActivitiesCompleted: number;
  totalPointsEarned: number;
  averageWeeklyProgress: number;
  activeChildrenToday: number;
  pendingRewards: number;
  upcomingDeadlines: number;
}

export const ParentDashboard: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [familyStats, setFamilyStats] = useState<FamilyStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showTimeRestrictions, setShowTimeRestrictions] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [timeRestrictions, setTimeRestrictions] = useState({
    dailyLimit: 60,
    weeklyLimit: 300,
    allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    allowedTimeSlots: [{ start: '09:00', end: '17:00' }]
  });
  const { toast } = useToast();

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    try {
      setIsLoading(true);
      
      // Load children relationships
      const childrenData = await relationshipService.getParentChildren();
      const formattedChildren = childrenData.data.children.map((item: any) => ({
        ...item.child,
        relationship: item.relationship
      }));
      
      setChildren(formattedChildren);
      
      if (formattedChildren.length > 0 && !selectedChild) {
        setSelectedChild(formattedChildren[0]);
      }

      // Calculate family stats
      const stats = calculateFamilyStats(formattedChildren);
      setFamilyStats(stats);

    } catch (error: any) {
      console.error('Error loading parent data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load family data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFamilyStats = (childrenData: Child[]): FamilyStats => {
    const totalActivitiesCompleted = childrenData.reduce((sum, child) => 
      sum + (child.progress?.totalActivitiesCompleted || 0), 0);
    
    const totalPointsEarned = childrenData.reduce((sum, child) => 
      sum + (child.progress?.totalPoints || 0), 0);

    const activeToday = childrenData.filter(child => {
      const lastActive = new Date(child.progress?.lastActiveDate || 0);
      const today = new Date();
      return lastActive.toDateString() === today.toDateString();
    }).length;

    return {
      totalChildren: childrenData.length,
      totalActivitiesCompleted,
      totalPointsEarned,
      averageWeeklyProgress: Math.round(totalActivitiesCompleted / Math.max(childrenData.length, 1)),
      activeChildrenToday: activeToday,
      pendingRewards: 0, // This would come from reward service
      upcomingDeadlines: 0 // This would come from assignment service
    };
  };

  const updateTimeRestrictions = async (childId: string, restrictions: any) => {
    try {
      const child = children.find(c => c._id === childId);
      if (!child) return;

      await relationshipService.updatePermissions(child.relationship._id, {
        timeRestrictions: restrictions
      });

      // Update local state
      setChildren(prev => prev.map(c => 
        c._id === childId 
          ? { ...c, relationship: { ...c.relationship, timeRestrictions: restrictions }}
          : c
      ));

      toast({
        title: 'Success',
        description: 'Time restrictions updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating time restrictions:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update time restrictions',
        variant: 'destructive'
      });
    }
  };

  const getChildInitials = (child: Child) => {
    const firstName = child.profile?.firstName || '';
    const lastName = child.profile?.lastName || '';
    return firstName && lastName ? `${firstName[0]}${lastName[0]}` : child.username[0]?.toUpperCase() || '?';
  };

  const getChildDisplayName = (child: Child) => {
    const firstName = child.profile?.firstName;
    const lastName = child.profile?.lastName;
    return firstName && lastName ? `${firstName} ${lastName}` : child.username;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStreakIcon = (days: number) => {
    if (days >= 30) return '🔥';
    if (days >= 14) return '⭐';
    if (days >= 7) return '✨';
    if (days >= 3) return '🌟';
    return '⚡';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading family dashboard...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">No Children Connected</h2>
            <p className="text-gray-600 mb-6">
              Connect with your children to start monitoring their learning progress.
            </p>
            <Button onClick={() => window.location.href = '/relationships'}>
              <Plus className="h-4 w-4 mr-2" />
              Add Child Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Family Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  Family Dashboard
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Monitor and manage your children's learning journey
                </p>
              </div>
              <Button variant="outline" onClick={loadParentData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          {familyStats && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{familyStats.totalChildren}</div>
                  <div className="text-sm text-gray-600">Children</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{familyStats.totalActivitiesCompleted}</div>
                  <div className="text-sm text-gray-600">Activities Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{familyStats.totalPointsEarned}</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{familyStats.activeChildrenToday}</div>
                  <div className="text-sm text-gray-600">Active Today</div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Child Selector */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Label htmlFor="child-select" className="text-lg font-semibold">
          Select Child:
        </Label>
        <Select
          value={selectedChild?._id || ''}
          onValueChange={(value) => {
            const child = children.find(c => c._id === value);
            setSelectedChild(child || null);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Choose a child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((child) => (
              <SelectItem key={child._id} value={child._id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={child.profile?.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {getChildInitials(child)}
                    </AvatarFallback>
                  </Avatar>
                  {getChildDisplayName(child)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {children.length > 1 && (
          <div className="flex gap-2 ml-auto">
            {children.map((child) => (
              <Button
                key={child._id}
                variant={selectedChild?._id === child._id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChild(child)}
                className="flex items-center gap-2"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={child.profile?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {getChildInitials(child)}
                  </AvatarFallback>
                </Avatar>
                {child.profile?.firstName || child.username}
              </Button>
            ))}
          </div>
        )}
      </div>

      {selectedChild && (
        <>
          {/* Selected Child Overview */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedChild.profile?.avatarUrl} />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                      {getChildInitials(selectedChild)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{getChildDisplayName(selectedChild)}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline">
                        Level {selectedChild.progress?.currentLevel || 1}
                      </Badge>
                      <Badge variant="outline">
                        {selectedChild.progress?.totalPoints || 0} Points
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getStreakIcon(selectedChild.progress?.streakDays || 0)}
                        {selectedChild.progress?.streakDays || 0} Day Streak
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showTimeRestrictions} onOpenChange={setShowTimeRestrictions}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Timer className="h-4 w-4 mr-2" />
                        Time Limits
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Time Restrictions for {getChildDisplayName(selectedChild)}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="daily-limit">Daily Limit (minutes)</Label>
                          <Input
                            id="daily-limit"
                            type="number"
                            value={timeRestrictions.dailyLimit}
                            onChange={(e) => setTimeRestrictions(prev => ({
                              ...prev,
                              dailyLimit: parseInt(e.target.value) || 0
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="weekly-limit">Weekly Limit (minutes)</Label>
                          <Input
                            id="weekly-limit"
                            type="number"
                            value={timeRestrictions.weeklyLimit}
                            onChange={(e) => setTimeRestrictions(prev => ({
                              ...prev,
                              weeklyLimit: parseInt(e.target.value) || 0
                            }))}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowTimeRestrictions(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => {
                            updateTimeRestrictions(selectedChild._id, timeRestrictions);
                            setShowTimeRestrictions(false);
                          }}>
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Weekly Progress</span>
                    <span className="text-sm text-gray-600">
                      {selectedChild.progress?.totalActivitiesCompleted || 0} activities
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((selectedChild.progress?.totalActivitiesCompleted || 0) / (selectedChild.progress?.weeklyGoal || 10) * 100, 100)}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Points This Week</span>
                    <span className="text-sm text-gray-600">
                      {selectedChild.progress?.totalPoints || 0}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((selectedChild.progress?.totalPoints || 0) / 1000 * 100, 100)}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Learning Streak</span>
                    <span className="text-sm text-gray-600">
                      {selectedChild.progress?.streakDays || 0} days
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((selectedChild.progress?.streakDays || 0) / 30 * 100, 100)}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{selectedChild.progress?.totalActivitiesCompleted || 0}</div>
                    <div className="text-sm text-gray-600">Activities Completed</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <div className="text-2xl font-bold">{selectedChild.progress?.badges?.length || 0}</div>
                    <div className="text-sm text-gray-600">Badges Earned</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{selectedChild.progress?.currentLevel || 1}</div>
                    <div className="text-sm text-gray-600">Current Level</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{selectedChild.progress?.streakDays || 0}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Math Exercise Completed</div>
                          <div className="text-sm text-gray-600">2 hours ago</div>
                        </div>
                      </div>
                      <Badge variant="secondary">+50 points</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Reading Badge Earned</div>
                          <div className="text-sm text-gray-600">1 day ago</div>
                        </div>
                      </div>
                      <Badge variant="secondary">Achievement</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Math</span>
                          <span className="text-sm text-gray-600">85%</span>
                        </div>
                        <Progress value={85} className="h-3" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Reading</span>
                          <span className="text-sm text-gray-600">92%</span>
                        </div>
                        <Progress value={92} className="h-3" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Science</span>
                          <span className="text-sm text-gray-600">78%</span>
                        </div>
                        <Progress value={78} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Goals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium">Complete 5 activities</span>
                        </div>
                        <Badge variant="secondary">Done</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-yellow-500" />
                          <span className="font-medium">Read for 30 minutes</span>
                        </div>
                        <Badge variant="outline">3/7 days</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">Earn 500 points</span>
                        </div>
                        <Badge variant="outline">350/500</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4" />
                    <p>Activity history will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-6">
              <ParentRewardApproval 
                childId={selectedChild._id} 
                childName={getChildDisplayName(selectedChild)}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Permissions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(selectedChild.relationship.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key} className="flex-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Label>
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => {
                            // Update permission
                            relationshipService.updatePermissions(selectedChild.relationship._id, {
                              [key]: checked
                            });
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Progress Updates</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Achievement Notifications</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Weekly Reports</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Reward Requests</Label>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ParentDashboard;