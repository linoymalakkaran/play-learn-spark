import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useRewardStore } from '../stores/rewardStore';
import { getAgeAppropriateRewards, REWARD_CATALOG } from '../data/rewardsData';
import { RewardItem } from '../types/rewards';

interface RewardCardProps {
  childId: string;
  childAge: number;
  childName: string;
}

export const RewardCard: React.FC<RewardCardProps> = ({ childId, childAge, childName }) => {
  const {
    initializeRewardCard,
    getRewardCard,
    getAvailablePoints,
    getCurrentLevel,
    getProgressToNextLevel,
    requestReward,
    redeemReward,
    generateDailyChallenges,
    dailyChallenges,
  } = useRewardStore();

  const card = getRewardCard(childId);
  const availablePoints = getAvailablePoints(childId);
  const currentLevel = getCurrentLevel(childId);
  const levelProgress = getProgressToNextLevel(childId);

  useEffect(() => {
    initializeRewardCard(childId);
    generateDailyChallenges();
  }, [childId, initializeRewardCard, generateDailyChallenges]);

  if (!card) {
    return <div>Loading reward card...</div>;
  }

  const ageAppropriateRewards = getAgeAppropriateRewards(childAge);
  const affordableRewards = ageAppropriateRewards.filter(reward => reward.pointsCost <= availablePoints);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '🥉';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'from-orange-400 to-orange-600';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-400 to-purple-600';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  const handleRewardRequest = (reward: RewardItem) => {
    if (reward.parentApprovalRequired) {
      requestReward(childId, reward.id, reward.pointsCost, `I would like to redeem: ${reward.name}!`);
    } else {
      redeemReward(childId, reward.id, reward.pointsCost);
    }
  };

  const todaysChallenges = dailyChallenges.filter(
    challenge => challenge.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🎁 {childName}'s Reward Card 🎁
        </h2>
        <p className="text-gray-600">Earn points and unlock amazing rewards!</p>
      </div>

      {/* Points and Level Display */}
      <Card className={`bg-gradient-to-r ${getLevelColor(currentLevel)} text-white shadow-xl`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{getLevelIcon(currentLevel)}</span>
              <div>
                <h3 className="text-2xl font-bold capitalize">{currentLevel} Member</h3>
                <p className="text-white/90">Level {currentLevel}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{availablePoints}</div>
              <div className="text-white/90">Available Points</div>
            </div>
          </div>

          {/* Progress to Next Level */}
          {currentLevel !== 'platinum' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next level</span>
                <span>{levelProgress.current}/{levelProgress.required} points</span>
              </div>
              <Progress value={levelProgress.percentage} className="h-2 bg-white/20">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${levelProgress.percentage}%` }}
                />
              </Progress>
            </div>
          )}

          {/* Streak Display */}
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-2xl">🔥</span>
            <span className="font-semibold">{card.streakCount} day streak!</span>
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      {todaysChallenges.length > 0 && (
        <Card className="shadow-lg">
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
                    <div className="font-bold text-blue-600">+{challenge.bonusPoints}</div>
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
      )}

      {/* Available Rewards */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🏪</span>
            <span>Reward Store</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ageAppropriateRewards.slice(0, 9).map((reward) => {
              const canAfford = reward.pointsCost <= availablePoints;
              return (
                <div
                  key={reward.id}
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    canAfford 
                      ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{reward.icon}</div>
                    <h4 className="font-semibold text-sm">{reward.name}</h4>
                    <p className="text-xs text-gray-600">{reward.description}</p>
                    <div className="font-bold text-purple-600">{reward.pointsCost} points</div>
                    
                    {canAfford ? (
                      <Button
                        onClick={() => handleRewardRequest(reward)}
                        size="sm"
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        {reward.parentApprovalRequired ? 'Ask Parent' : 'Get Now!'}
                      </Button>
                    ) : (
                      <Button
                        disabled
                        size="sm"
                        className="w-full"
                        variant="outline"
                      >
                        Need {reward.pointsCost - availablePoints} more
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {card.pendingRequests.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">⏳</span>
              <span>Pending Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {card.pendingRequests.map((request) => {
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
      {card.redeemedRewards.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="text-2xl">🎉</span>
              <span>Recent Rewards</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {card.redeemedRewards.slice(-3).reverse().map((redemption) => {
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
    </div>
  );
};