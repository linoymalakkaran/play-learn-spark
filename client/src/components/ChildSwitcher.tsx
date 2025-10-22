import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Activity, 
  Trophy, 
  Clock, 
  Target,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  Heart
} from 'lucide-react';

interface Child {
  _id: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    age?: number;
    grade?: string;
  };
  progress: {
    totalActivitiesCompleted: number;
    currentLevel: number;
    totalPoints: number;
    streakDays: number;
    lastActiveDate: Date;
    badges: string[];
  };
  status: 'online' | 'offline' | 'away';
  isActive?: boolean;
}

interface ChildSwitcherProps {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
  showQuickStats?: boolean;
  layout?: 'grid' | 'list' | 'compact';
}

export const ChildSwitcher: React.FC<ChildSwitcherProps> = ({
  children,
  selectedChild,
  onSelectChild,
  showQuickStats = true,
  layout = 'grid'
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Active';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getProgressLevel = (points: number) => {
    if (points >= 2000) return { level: 'Expert', color: 'text-purple-600', icon: '👑' };
    if (points >= 1500) return { level: 'Advanced', color: 'text-blue-600', icon: '🏆' };
    if (points >= 1000) return { level: 'Intermediate', color: 'text-green-600', icon: '⭐' };
    if (points >= 500) return { level: 'Beginner', color: 'text-yellow-600', icon: '🌟' };
    return { level: 'Starter', color: 'text-gray-600', icon: '✨' };
  };

  const getStreakEmoji = (days: number) => {
    if (days >= 30) return '🔥';
    if (days >= 14) return '⚡';
    if (days >= 7) return '✨';
    if (days >= 3) return '🌟';
    return '⭐';
  };

  const isChildActive = (child: Child) => {
    const lastActive = new Date(child.progress?.lastActiveDate || 0);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24; // Active if used within last 24 hours
  };

  if (children.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Children Connected</h3>
          <p className="text-gray-600">Connect with your children to start monitoring their progress.</p>
        </CardContent>
      </Card>
    );
  }

  if (layout === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {children.map((child) => (
          <Button
            key={child._id}
            variant={selectedChild?._id === child._id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectChild(child)}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Avatar className="h-6 w-6">
                <AvatarImage src={child.profile?.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {getChildInitials(child)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(child.status)}`} />
            </div>
            <span className="hidden sm:inline">
              {child.profile?.firstName || child.username}
            </span>
          </Button>
        ))}
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-2">
        {children.map((child) => {
          const progressLevel = getProgressLevel(child.progress?.totalPoints || 0);
          const isActive = isChildActive(child);
          
          return (
            <Card
              key={child._id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedChild?._id === child._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onSelectChild(child)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={child.profile?.avatarUrl} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getChildInitials(child)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(child.status)}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{getChildDisplayName(child)}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{getStatusText(child.status)}</span>
                        {isActive && <CheckCircle className="h-3 w-3 text-green-500" />}
                      </div>
                    </div>
                  </div>
                  
                  {showQuickStats && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">{child.progress?.currentLevel || 1}</div>
                        <div className="text-gray-500">Level</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{child.progress?.totalPoints || 0}</div>
                        <div className="text-gray-500">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-600">{child.progress?.streakDays || 0}</div>
                        <div className="text-gray-500">Streak</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your Children</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'summary' ? 'detailed' : 'summary')}
        >
          {viewMode === 'summary' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <span className="ml-2">{viewMode === 'summary' ? 'Show Details' : 'Hide Details'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child) => {
          const progressLevel = getProgressLevel(child.progress?.totalPoints || 0);
          const isActive = isChildActive(child);
          
          return (
            <Card
              key={child._id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                selectedChild?._id === child._id 
                  ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-blue-100' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectChild(child)}
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={child.profile?.avatarUrl} />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600">
                        {getChildInitials(child)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(child.status)}`} />
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`${progressLevel.color} border-current`}
                    >
                      {progressLevel.icon} {progressLevel.level}
                    </Badge>
                    {isActive && (
                      <div className="flex items-center gap-1 mt-2 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">Active</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name and basic info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold">{getChildDisplayName(child)}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{getStatusText(child.status)}</span>
                    {child.profile?.age && <span>• Age {child.profile.age}</span>}
                    {child.profile?.grade && <span>• Grade {child.profile.grade}</span>}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-white rounded-lg border">
                    <div className="text-lg font-bold text-blue-600">{child.progress?.currentLevel || 1}</div>
                    <div className="text-xs text-gray-600">Level</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg border">
                    <div className="text-lg font-bold text-green-600">{child.progress?.totalPoints || 0}</div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg border">
                    <div className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1">
                      {getStreakEmoji(child.progress?.streakDays || 0)}
                      {child.progress?.streakDays || 0}
                    </div>
                    <div className="text-xs text-gray-600">Streak</div>
                  </div>
                </div>

                {/* Detailed view */}
                {viewMode === 'detailed' && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Activities Completed</span>
                      <span className="font-semibold">{child.progress?.totalActivitiesCompleted || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Badges Earned</span>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        <span className="font-semibold">{child.progress?.badges?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Active</span>
                      <span className="font-semibold">
                        {child.progress?.lastActiveDate 
                          ? new Date(child.progress.lastActiveDate).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Selection indicator */}
                {selectedChild?._id === child._id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick action buttons for selected child */}
      {selectedChild && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedChild.profile?.avatarUrl} />
                  <AvatarFallback>
                    {getChildInitials(selectedChild)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{getChildDisplayName(selectedChild)} Selected</h4>
                  <p className="text-sm text-gray-600">View detailed progress and manage settings</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  View Progress
                </Button>
                <Button size="sm" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Set Goals
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChildSwitcher;