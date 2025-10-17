import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useRewardStore } from '../stores/rewardStore';
import { RewardRequest } from '../types/rewards';
import { REWARD_CATALOG } from '../data/rewardsData';

interface ParentRewardApprovalProps {
  childId: string;
  childName: string;
}

export const ParentRewardApproval: React.FC<ParentRewardApprovalProps> = ({ 
  childId, 
  childName 
}) => {
  const {
    getRewardCard,
    approveRewardRequest,
  } = useRewardStore();

  const card = getRewardCard(childId);
  const pendingRequests = card?.pendingRequests || [];

  if (pendingRequests.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-lg font-['Comic_Neue'] text-green-600">
            🎉 All Caught Up!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground font-['Comic_Neue']">
            {childName} has no pending reward requests at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleApprove = (requestId: string) => {
    approveRewardRequest(childId, requestId, true);
  };

  const handleDeny = (requestId: string) => {
    approveRewardRequest(childId, requestId, false);
  };

  const getRewardFromId = (rewardId: string) => {
    return REWARD_CATALOG.find(reward => reward.id === rewardId);
  };

  const getRequestTypeIcon = (request: RewardRequest) => {
    const reward = getRewardFromId(request.rewardId);
    if (!reward) return '🎯';
    
    switch (reward.category) {
      case 'treats': return '🍭';
      case 'gifts': return '🎁';
      case 'experiences': return '🎈';
      case 'food': return '🍕';
      case 'digital': return '📱';
      case 'recognition': return '⭐';
      default: return '🎯';
    }
  };

  const getRequestTypeColor = (request: RewardRequest) => {
    const reward = getRewardFromId(request.rewardId);
    if (!reward) return 'bg-gray-100 text-gray-700 border-gray-200';
    
    switch (reward.category) {
      case 'treats': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'gifts': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'experiences': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'food': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'digital': return 'bg-green-100 text-green-700 border-green-200';
      case 'recognition': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-['Comic_Neue'] text-primary">
            🔔 Parent Approval Center
          </CardTitle>
          <p className="text-muted-foreground font-['Comic_Neue']">
            {childName} has {pendingRequests.length} reward{pendingRequests.length > 1 ? 's' : ''} waiting for your approval
          </p>
        </CardHeader>
      </Card>

      {pendingRequests.map((request) => {
        const reward = getRewardFromId(request.rewardId);
        if (!reward) return null;
        
        return (
        <Card key={request.id} className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">
                    {getRequestTypeIcon(request)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold font-['Comic_Neue'] text-foreground">
                      {reward.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-['Comic_Neue'] mb-2">
                      {reward.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge 
                        variant="outline" 
                        className={`font-['Comic_Neue'] ${getRequestTypeColor(request)}`}
                      >
                        {reward.category.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="font-['Comic_Neue'] bg-blue-50 text-blue-700">
                        {request.pointsRequired} Points
                      </Badge>
                      {reward.parentApprovalRequired && (
                        <Badge variant="outline" className="font-['Comic_Neue'] bg-amber-50 text-amber-700">
                          Needs Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground font-['Comic_Neue']">
                  Requested on {new Date(request.requestedAt).toLocaleDateString()} at{' '}
                  {new Date(request.requestedAt).toLocaleTimeString()}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 min-w-[200px]">
                <Button
                  onClick={() => handleApprove(request.id)}
                  className="bg-green-600 hover:bg-green-700 text-white font-['Comic_Neue'] font-bold flex-1"
                  size="sm"
                >
                  ✅ Approve
                </Button>
                <Button
                  onClick={() => handleDeny(request.id)}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 font-['Comic_Neue'] font-bold flex-1"
                  size="sm"
                >
                  ❌ Deny
                </Button>
              </div>
            </div>
            
            {/* Additional Info */}
            {reward.category === 'experiences' && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-['Comic_Neue']">
                  📅 <strong>Planning Note:</strong> Experience rewards may require advance planning and scheduling.
                </p>
              </div>
            )}
            
            {reward.category === 'treats' && (
              <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-200">
                <p className="text-sm text-pink-700 font-['Comic_Neue']">
                  🍭 <strong>Health Note:</strong> Please consider timing and dietary balance when approving treats.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        );
      })}
      
      {/* Quick Actions */}
      {pendingRequests.length > 1 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground font-['Comic_Neue'] mb-3">
              Quick Actions for Multiple Requests
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  pendingRequests.forEach(request => handleApprove(request.id));
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-['Comic_Neue'] font-bold"
                size="sm"
              >
                ✅ Approve All
              </Button>
              <Button
                onClick={() => {
                  pendingRequests.forEach(request => handleDeny(request.id));
                }}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 font-['Comic_Neue'] font-bold"
                size="sm"
              >
                ❌ Deny All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentRewardApproval;