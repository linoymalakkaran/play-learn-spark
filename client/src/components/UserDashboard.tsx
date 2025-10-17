import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Star, 
  BookOpen, 
  LogOut, 
  Settings,
  Crown,
  Activity
} from 'lucide-react';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, getUserProgress } = useAuth();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  const userProgress = getUserProgress();
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'educator': return 'bg-blue-500';
      case 'parent': return 'bg-green-500';
      case 'child': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getSubscriptionBadgeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-yellow-500';
      case 'family': return 'bg-purple-500';
      case 'free': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.profile.firstName}! 🎉
          </h1>
          <p className="text-gray-600">
            Your learning journey continues here
          </p>
        </div>

        {/* User Profile Card */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profile.avatarUrl} />
                  <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {getInitials(user.profile.firstName, user.profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <CardTitle className="text-xl">
                    {user.profile.firstName} {user.profile.lastName}
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </CardDescription>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                      <Crown className="h-3 w-3 mr-1" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <Badge className={`${getSubscriptionBadgeColor(user.subscription.type)} text-white`}>
                      <Star className="h-3 w-3 mr-1" />
                      {user.subscription.type.charAt(0).toUpperCase() + user.subscription.type.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Account Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Account Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Username:</span> {user.username}
                  </div>
                  <div>
                    <span className="font-medium">Member since:</span>{' '}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  {user.profile.age && (
                    <div>
                      <span className="font-medium">Age:</span> {user.profile.age}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Language:</span> {user.profile.preferences.language}
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span> {user.profile.preferences.difficulty}
                  </div>
                </div>
              </div>

              {/* Learning Progress */}
              {(user.progress || userProgress) && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Trophy className="h-4 w-4 mr-2" />
                    Learning Progress
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Activities Completed:</span>{' '}
                      {user.progress?.totalActivitiesCompleted || userProgress?.totalActivitiesCompleted || 0}
                    </div>
                    <div>
                      <span className="font-medium">Current Level:</span>{' '}
                      {user.progress?.currentLevel || userProgress?.currentLevel || 1}
                    </div>
                    <div>
                      <span className="font-medium">Total Points:</span>{' '}
                      {user.progress?.totalPoints || userProgress?.totalPoints || 0}
                    </div>
                    <div>
                      <span className="font-medium">Streak:</span>{' '}
                      {user.progress?.streakDays || userProgress?.streakDays || 0} days
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Features */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Available Features
                </h3>
                <div className="space-y-1">
                  {user.subscription.features.length > 0 ? (
                    user.subscription.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {feature}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No features listed</p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center space-y-2"
                onClick={() => navigate('/')}
              >
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">Dashboard</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center space-y-2"
                onClick={() => navigate('/activities')}
              >
                <Activity className="h-6 w-6" />
                <span className="text-sm">Activities</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center space-y-2"
                onClick={() => navigate('/rewards')}
              >
                <Trophy className="h-6 w-6" />
                <span className="text-sm">Rewards</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center space-y-2"
                onClick={() => navigate('/profile')}
              >
                <Settings className="h-6 w-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Learning Topics */}
          {user.profile.preferences.topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Favorite Topics</CardTitle>
                <CardDescription>Your preferred learning subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.profile.preferences.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
              <CardDescription>Your account summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Account Type:</span>
                  <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Subscription:</span>
                  <Badge className={getSubscriptionBadgeColor(user.subscription.type)}>
                    {user.subscription.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {user.progress && (
                  <div className="flex justify-between">
                    <span>Learning Level:</span>
                    <span>Level {user.progress.currentLevel}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;