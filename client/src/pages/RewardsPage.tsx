import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useRewardStore } from '../stores/rewardStore';
import { RewardItem } from '../types/rewards';
import { REWARD_CATALOG, getAgeAppropriateRewards } from '../data/rewardsData';

interface RewardsPageProps {
  childId: string;
  childAge: number;
  childName: string;
  onBack: () => void;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({ 
  childId, 
  childAge, 
  childName, 
  onBack 
}) => {
  const {
    getRewardCard,
    getAvailablePoints,
    getCurrentLevel,
    getProgressToNextLevel,
    requestReward,
    getRedemptionHistory,
  } = useRewardStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [redemptionHistory, setRedemptionHistory] = useState<any[]>([]);

  const card = getRewardCard(childId);
  const availablePoints = getAvailablePoints(childId);
  const currentLevel = getCurrentLevel(childId);
  const levelProgress = getProgressToNextLevel(childId);

  useEffect(() => {
    // Load redemption history
    const history = getRedemptionHistory(childId);
    setRedemptionHistory(history);
  }, [childId, getRedemptionHistory]);

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">🎁</div>
            <p className="text-muted-foreground font-['Comic_Neue']">
              Loading your rewards...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ageAppropriateRewards = getAgeAppropriateRewards(childAge);
  
  const filteredRewards = selectedCategory === 'all' 
    ? ageAppropriateRewards 
    : ageAppropriateRewards.filter(reward => reward.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Rewards', icon: '🎁' },
    { id: 'treats', name: 'Treats', icon: '🍭' },
    { id: 'gifts', name: 'Gifts', icon: '🎁' },
    { id: 'experiences', name: 'Adventures', icon: '🎈' },
    { id: 'food', name: 'Food Fun', icon: '🍕' },
    { id: 'digital', name: 'Screen Time', icon: '📱' },
    { id: 'recognition', name: 'Awards', icon: '⭐' },
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      default: return '🏅';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'from-amber-600 to-amber-700';
      case 'silver': return 'from-gray-400 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-500';
      case 'platinum': return 'from-purple-400 to-purple-500';
      default: return 'from-blue-400 to-blue-500';
    }
  };

  const getRewardCategoryColor = (category: string) => {
    switch (category) {
      case 'treats': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'gifts': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'experiences': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'food': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'digital': return 'bg-green-100 text-green-700 border-green-200';
      case 'recognition': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleRewardRequest = async (reward: RewardItem) => {
    try {
      await requestReward(childId, reward.id);
      // Show success message or update UI
      alert(`Reward "${reward.name}" requested successfully!`);
    } catch (error) {
      console.error('Failed to request reward:', error);
      alert('Failed to request reward. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft via-background to-secondary-soft p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="font-['Comic_Neue'] font-bold"
        >
          ← Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold font-['Comic_Neue'] text-center flex-1">
          🎁 {childName}'s Reward Store
        </h1>
        <div></div> {/* Spacer for centering */}
      </div>

      {/* Points and Level Display */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Points Display */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {availablePoints}
              </div>
              <div className="text-sm text-muted-foreground font-['Comic_Neue']">
                Available Points
              </div>
            </div>

            {/* Level Display */}
            <div className="text-center">
              <div className={`text-6xl mb-2 bg-gradient-to-r ${getLevelColor(currentLevel.level)} bg-clip-text text-transparent`}>
                {getLevelIcon(currentLevel.level)}
              </div>
              <div className="text-lg font-bold font-['Comic_Neue'] capitalize">
                {currentLevel.level} Level
              </div>
              <div className="text-sm text-muted-foreground">
                {currentLevel.pointsInLevel} / {currentLevel.pointsToNext} points
              </div>
              <Progress 
                value={levelProgress} 
                className="w-32 mt-2"
              />
            </div>

            {/* Streak Display */}
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-lg font-bold font-['Comic_Neue']">
                {card.streakCount} Day{card.streakCount !== 1 ? 's' : ''}
              </div>
              <div className="text-sm text-muted-foreground">
                Learning Streak
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="rewards" className="font-['Comic_Neue'] font-bold">
            🎁 Rewards
          </TabsTrigger>
          <TabsTrigger value="achievements" className="font-['Comic_Neue'] font-bold">
            🏆 Achievements
          </TabsTrigger>
          <TabsTrigger value="history" className="font-['Comic_Neue'] font-bold">
            📜 History
          </TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  className="font-['Comic_Neue'] font-bold"
                  size="sm"
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRewards.map((reward) => (
              <Card key={reward.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-3xl">{reward.icon}</div>
                    <Badge 
                      variant="outline" 
                      className={`font-['Comic_Neue'] ${getRewardCategoryColor(reward.category)}`}
                    >
                      {reward.category.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-['Comic_Neue'] font-bold">
                    {reward.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-['Comic_Neue'] mb-4">
                    {reward.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        {reward.pointsCost}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        points
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => handleRewardRequest(reward)}
                      disabled={availablePoints < reward.pointsCost}
                      className="font-['Comic_Neue'] font-bold"
                      size="sm"
                    >
                      {availablePoints >= reward.pointsCost ? '🎁 Get Reward' : '💰 Need More Points'}
                    </Button>
                  </div>
                  
                  {reward.parentApprovalRequired && (
                    <div className="mt-2 text-xs text-amber-600 font-['Comic_Neue']">
                      📋 Requires parent approval
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold font-['Comic_Neue'] mb-2">
              Achievements Coming Soon!
            </h3>
            <p className="text-muted-foreground font-['Comic_Neue']">
              Keep learning to unlock amazing achievement badges!
            </p>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="space-y-4">
            {redemptionHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📜</div>
                <h3 className="text-xl font-bold font-['Comic_Neue'] mb-2">
                  No Rewards Yet!
                </h3>
                <p className="text-muted-foreground font-['Comic_Neue']">
                  Start earning points and redeeming rewards to see your history here.
                </p>
              </div>
            ) : (
              redemptionHistory.map((redemption, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🎁</div>
                        <div>
                          <div className="font-bold font-['Comic_Neue']">
                            Reward Redeemed
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(redemption.redeemedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        -{redemption.pointsUsed} points
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RewardsPage;