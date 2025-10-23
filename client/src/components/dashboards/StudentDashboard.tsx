import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  Play,
  Brain,
  Calendar,
  Award,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const currentAssignments = [
    {
      id: 1,
      title: 'Math Addition Practice',
      subject: 'Mathematics',
      dueDate: 'Tomorrow',
      progress: 60,
      isOverdue: false,
      emoji: '🔢'
    },
    {
      id: 2,
      title: 'Reading Comprehension',
      subject: 'English',
      dueDate: '2 days',
      progress: 30,
      isOverdue: false,
      emoji: '📖'
    },
    {
      id: 3,
      title: 'Science Quiz',
      subject: 'Science',
      dueDate: 'Today',
      progress: 0,
      isOverdue: true,
      emoji: '🔬'
    }
  ];

  const recentAchievements = [
    { id: 1, title: 'Speed Reader', description: 'Read 10 stories this week!', icon: '📚', earned: 'Today' },
    { id: 2, title: 'Math Wizard', description: 'Solved 50 math problems', icon: '🧙‍♂️', earned: 'Yesterday' },
    { id: 3, title: 'Perfect Score', description: 'Got 100% on alphabet quiz', icon: '🎯', earned: '2 days ago' }
  ];

  const learningStats = {
    weeklyGoal: 120,
    currentMinutes: 95,
    streak: 7,
    totalPoints: 2450,
    badgesEarned: 15,
    level: 8
  };

  const quickActivities = [
    {
      title: 'Continue Learning',
      description: 'Resume your last activity',
      icon: Play,
      action: () => navigate('/activities'),
      color: 'bg-green-500',
      lastActivity: 'Alphabet Practice'
    },
    {
      title: 'Daily Challenge',
      description: 'Complete today\'s challenge',
      icon: Target,
      action: () => navigate('/daily-challenge'),
      color: 'bg-blue-500',
      status: 'Available'
    },
    {
      title: 'My Assignments',
      description: 'View homework and tasks',
      icon: BookOpen,
      action: () => navigate('/student/assignments'),
      color: 'bg-purple-500',
      count: currentAssignments.length
    },
    {
      title: 'Fun Games',
      description: 'Play educational games',
      icon: Brain,
      action: () => navigate('/games'),
      color: 'bg-orange-500',
      status: 'New games available!'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
          <p className="text-gray-600 mt-1">Keep learning and growing every day! 🌟</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            Level {learningStats.level}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            {learningStats.totalPoints} Points
          </Badge>
        </div>
      </div>

      {/* Quick Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActivities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={activity.action}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className={`p-3 rounded-lg ${activity.color} text-white group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    {activity.lastActivity && (
                      <p className="text-xs text-blue-600">Last: {activity.lastActivity}</p>
                    )}
                    {activity.status && (
                      <p className="text-xs text-green-600">{activity.status}</p>
                    )}
                    {activity.count && (
                      <Badge variant="secondary" className="text-xs">{activity.count} pending</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Weekly Learning Goal
            </CardTitle>
            <CardDescription>
              You're doing great! Keep it up! 🎯
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Learning Time</span>
                <span className="text-sm text-gray-600">
                  {learningStats.currentMinutes} / {learningStats.weeklyGoal} minutes
                </span>
              </div>
              <Progress value={(learningStats.currentMinutes / learningStats.weeklyGoal) * 100} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl mb-1">🔥</div>
                <p className="text-lg font-bold text-orange-600">{learningStats.streak}</p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-1">🏆</div>
                <p className="text-lg font-bold text-purple-600">{learningStats.badgesEarned}</p>
                <p className="text-xs text-gray-600">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              My Assignments
            </CardTitle>
            <CardDescription>
              Tasks assigned by your teacher
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl">{assignment.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{assignment.title}</h4>
                    <p className="text-xs text-gray-600">{assignment.subject}</p>
                    <div className="mt-1">
                      <Progress value={assignment.progress} className="h-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={assignment.isOverdue ? 'destructive' : 'default'} className="text-xs">
                      {assignment.isOverdue ? 'Due now!' : `Due in ${assignment.dueDate}`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/student/assignments')}>
              View All Assignments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
          <CardDescription>
            Celebrate your learning milestones! 🎉
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="text-3xl">{achievement.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-orange-600 mt-1">Earned {achievement.earned}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/student/achievements')}>
            View All Achievements
          </Button>
        </CardContent>
      </Card>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-blue-600">{learningStats.totalPoints.toLocaleString()}</p>
              </div>
              <Star className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Level</p>
                <p className="text-2xl font-bold text-green-600">{learningStats.level}</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Day Streak</p>
                <p className="text-2xl font-bold text-orange-600">{learningStats.streak}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Badges</p>
                <p className="text-2xl font-bold text-purple-600">{learningStats.badgesEarned}</p>
              </div>
              <Trophy className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;