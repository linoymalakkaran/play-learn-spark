import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useRewardStore } from '../stores/rewardStore';
import { useStudent } from '../hooks/useStudent';
import { RewardItem } from '../types/rewards';
import { REWARD_CATALOG, getAgeAppropriateRewards } from '../data/rewardsData';
import { ArrowLeft, Gift, Star, Trophy, Heart, Award, Crown, Zap } from 'lucide-react';

const RewardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { student } = useStudent();
  
  const {
    getRewardCard,
    getAvailablePoints,
    getCurrentLevel,
    getProgressToNextLevel,
    requestReward,
    dailyChallenges,
    generateDailyChallenges,
    initializeRewardCard,
  } = useRewardStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get child information from student context
  const childId = student?.name || 'default-child';
  const childAge = student?.age || 5;
  const childName = student?.name || 'Student';

  const card = getRewardCard(childId);
  const availablePoints = getAvailablePoints(childId) || 0;
  const currentLevelString = getCurrentLevel(childId) || 'bronze';
  const levelProgressData = getProgressToNextLevel(childId) || { current: 0, required: 100, percentage: 0 };

  // Convert level string to level number for display
  const getLevelNumber = (level: string) => {
    switch (level) {
      case 'bronze': return 1;
      case 'silver': return 2;
      case 'gold': return 3;
      case 'platinum': return 4;
      default: return 1;
    }
  };

  const currentLevel = {
    level: getLevelNumber(currentLevelString),
    pointsInLevel: levelProgressData.current,
    pointsToNext: levelProgressData.required
  };

  // Initialize reward card and daily challenges when page loads
  useEffect(() => {
    initializeRewardCard(childId);
    generateDailyChallenges();
  }, [childId, initializeRewardCard, generateDailyChallenges]);

  // Redirect to home if no student is set up
  if (!student?.setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Gift className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-2">Student Setup Required</h2>
            <p className="text-muted-foreground mb-4">
              Please complete student setup to access rewards.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create a default card if none exists
  const displayCard = card || {
    id: `card-${childId}`,
    childId,
    totalPoints: 0,
    availablePoints: 0,
    currentLevel: 'bronze' as const,
    achievements: [],
    redeemedRewards: [],
    pendingRequests: [],
    streakCount: 0,
    lastActivityDate: new Date().toISOString().split('T')[0]
  };

  const ageAppropriateRewards = getAgeAppropriateRewards(childAge);
  
  const filteredRewards = selectedCategory === 'all' 
    ? ageAppropriateRewards 
    : ageAppropriateRewards.filter(reward => reward.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Rewards', icon: Gift },
    { id: 'treats', label: 'Treats', icon: Heart },
    { id: 'activities', label: 'Activities', icon: Star },
    { id: 'privileges', label: 'Privileges', icon: Crown },
    { id: 'experiences', label: 'Experiences', icon: Trophy },
  ];

  const handleRequestReward = async (reward: RewardItem) => {
    if (availablePoints >= reward.pointsCost) {
      try {
        requestReward(childId, reward.id, reward.pointsCost, `I would like to redeem: ${reward.name}!`);
        // Show success message or notification
        alert(`Requested ${reward.name}! Parents will be notified.`);
      } catch (error) {
        console.error('Failed to request reward:', error);
        alert('Failed to request reward. Please try again.');
      }
    }
  };

  const getLevelIcon = (level: number) => {
    if (level <= 2) return '🌱';
    if (level <= 5) return '⭐';
    if (level <= 10) return '🏆';
    if (level <= 15) return '👑';
    return '🎯';
  };

  const getLevelColor = (level: number) => {
    if (level <= 2) return 'from-green-500 to-green-600';
    if (level <= 5) return 'from-blue-500 to-blue-600';
    if (level <= 10) return 'from-purple-500 to-purple-600';
    if (level <= 15) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-['Fredoka_One'] bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🏆 Rewards Center
                </h1>
                <p className="text-sm text-muted-foreground">
                  Redeem your points for amazing rewards!
                </p>
              </div>
            </div>
            
            {/* Points Display */}
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {availablePoints} ⭐
              </div>
              <div className="text-xs text-muted-foreground">
                Available Points
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Level Progress Card */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`text-6xl mb-2 bg-gradient-to-r ${getLevelColor(currentLevel.level)} bg-clip-text text-transparent`}>
                  {getLevelIcon(currentLevel.level)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    Level {currentLevel.level}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentLevel.pointsInLevel} / {currentLevel.pointsToNext} points
                  </p>
                  {/* Streak Display */}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-2xl">🔥</span>
                    <span className="font-semibold text-orange-600">{displayCard.streakCount || 0} day streak!</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-2">Progress to next level</div>
                <Progress value={levelProgressData.percentage} className="w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Challenges */}
        {(() => {
          const todaysChallenges = dailyChallenges.filter(
            challenge => challenge.date === new Date().toISOString().split('T')[0]
          );
          return todaysChallenges.length > 0 ? (
            <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">⭐</span>
                  <span>Today's Challenges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaysChallenges.map((challenge) => (
                    <div key={challenge.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{challenge.icon}</span>
                        <div>
                          <h4 className="font-semibold">{challenge.name}</h4>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">+{challenge.bonusPoints} points</div>
                        {challenge.completed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            ✓ Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null;
        })()}

        {/* Pending Requests */}
        {displayCard.pendingRequests && displayCard.pendingRequests.length > 0 && (
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">⏳</span>
                <span>Pending Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayCard.pendingRequests.map((request) => {
                  const reward = REWARD_CATALOG.find(r => r.id === request.rewardId);
                  return (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{reward?.icon}</span>
                        <div>
                          <h4 className="font-semibold">{reward?.name}</h4>
                          <p className="text-sm text-gray-600">{request.pointsRequired} points</p>
                          {request.childMessage && (
                            <p className="text-xs text-gray-500 italic">"{request.childMessage}"</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Waiting for Parent
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Rewards */}
        {displayCard.redeemedRewards && displayCard.redeemedRewards.length > 0 && (
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">🎉</span>
                <span>Recent Rewards</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {displayCard.redeemedRewards.slice(-3).reverse().map((redemption) => {
                  const reward = REWARD_CATALOG.find(r => r.id === redemption.rewardId);
                  return (
                    <div key={redemption.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{reward?.icon}</span>
                        <span className="text-sm font-medium">{reward?.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        -{redemption.pointsUsed} points
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/50">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex flex-col items-center space-y-1 p-3"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{category.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Rewards Grid */}
          <TabsContent value={selectedCategory} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRewards.map((reward) => {
                const canAfford = availablePoints >= reward.pointsCost;
                const isPopular = reward.pointsCost <= 20;
                
                return (
                  <Card 
                    key={reward.id}
                    className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                      canAfford ? 'hover:scale-105' : 'opacity-60'
                    } ${isPopular ? 'ring-2 ring-yellow-400/30' : ''}`}
                  >
                    {isPopular && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <div className="text-4xl mb-2">{reward.icon}</div>
                      <CardTitle className="text-lg font-['Comic_Neue']">
                        {reward.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {reward.description}
                      </p>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="font-bold text-primary">
                            {reward.pointsCost} points
                          </span>
                        </div>
                        <Badge variant={canAfford ? "default" : "secondary"}>
                          {reward.category}
                        </Badge>
                      </div>

                      <Button
                        onClick={() => handleRequestReward(reward)}
                        disabled={!canAfford}
                        className={`w-full ${
                          canAfford 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                            : ''
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <Gift className="h-4 w-4 mr-2" />
                            Request Reward
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Need {reward.pointsCost - availablePoints} more points
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredRewards.length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">🎁</div>
                <h3 className="text-lg font-semibold mb-2">No rewards found</h3>
                <p className="text-muted-foreground">
                  Try selecting a different category or complete more activities to unlock rewards!
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Motivation Section */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-xl font-bold mb-2">Keep Learning!</h3>
            <p className="text-muted-foreground mb-4">
              Complete more activities to earn points and unlock amazing rewards!
            </p>
            <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-500 to-purple-500">
              <Star className="h-4 w-4 mr-2" />
              Continue Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RewardsPage;