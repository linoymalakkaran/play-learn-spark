import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface InvitationCardProps {
  invitation: {
    _id: string;
    requester: any;
    relationshipType: string;
    invitation: {
      code: string;
      message?: string;
      expiresAt: string;
    };
    permissions: Record<string, boolean>;
  };
  onAccept: () => void;
  onDecline: (reason?: string) => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({ 
  invitation, 
  onAccept, 
  onDecline 
}) => {
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getRelationshipTypeLabel = (type: string) => {
    const labels = {
      'parent-child': 'Parent-Child',
      'teacher-student': 'Teacher-Student',
      'guardian-child': 'Guardian-Child',
      'sibling': 'Sibling',
      'peer': 'Peer'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getUserInitials = (user: any) => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`;
    }
    return user.username?.[0]?.toUpperCase() || '?';
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await onDecline(declineReason);
      setShowDeclineDialog(false);
      setDeclineReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const isExpiringSoon = () => {
    const expiresAt = new Date(invitation.invitation.expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24;
  };

  const getRelationshipDescription = (type: string) => {
    const descriptions = {
      'parent-child': 'This will allow them to monitor your learning progress and manage your activities.',
      'teacher-student': 'This will give them access to assign activities and track your classroom progress.',
      'guardian-child': 'This will allow them to supervise your learning and approve rewards.',
      'sibling': 'This will let you communicate and share learning achievements.',
      'peer': 'This will enable you to connect and collaborate on learning activities.'
    };
    return descriptions[type as keyof typeof descriptions] || 'This will establish a learning connection between you.';
  };

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={invitation.requester.profile?.avatarUrl} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getUserInitials(invitation.requester)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {invitation.requester.profile?.firstName && invitation.requester.profile?.lastName 
                  ? `${invitation.requester.profile.firstName} ${invitation.requester.profile.lastName}`
                  : invitation.requester.username
                }
              </h3>
              <p className="text-sm text-gray-600">{invitation.requester.email}</p>
              <Badge variant="outline" className="mt-1">
                {getRelationshipTypeLabel(invitation.relationshipType)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleAccept} 
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle size={16} className="mr-1" />
              Accept
            </Button>
            
            <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={isProcessing}>
                  <XCircle size={16} className="mr-1" />
                  Decline
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Decline Invitation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Are you sure you want to decline this relationship invitation from {invitation.requester.username}?
                  </p>
                  
                  <div>
                    <Label htmlFor="decline-reason">Reason (Optional)</Label>
                    <Textarea
                      id="decline-reason"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Let them know why you're declining..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDecline}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Declining...' : 'Decline Invitation'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Invitation Message */}
        {invitation.invitation.message && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageSquare size={16} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Personal Message</p>
                <p className="text-sm text-blue-800 mt-1">{invitation.invitation.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Relationship Description */}
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-1">What this means:</p>
          <p>{getRelationshipDescription(invitation.relationshipType)}</p>
        </div>

        {/* Permissions Preview */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">They will be able to:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(invitation.permissions)
              .filter(([_, value]) => value)
              .slice(0, 6) // Show first 6 permissions
              .map(([key, _]) => {
                const permissionLabels = {
                  viewProgress: 'View your progress',
                  viewActivities: 'See your activities',
                  manageActivities: 'Assign activities',
                  receiveNotifications: 'Get notifications',
                  communicateDirectly: 'Send messages',
                  viewReports: 'View reports',
                  approveRewards: 'Approve rewards',
                  setTimeRestrictions: 'Set time limits'
                };
                return (
                  <div key={key} className="flex items-center space-x-2 text-xs text-gray-600">
                    <CheckCircle size={12} className="text-green-500" />
                    <span>{permissionLabels[key as keyof typeof permissionLabels] || key}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Expiry Information */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>
              Expires: {new Date(invitation.invitation.expiresAt).toLocaleDateString()} at{' '}
              {new Date(invitation.invitation.expiresAt).toLocaleTimeString()}
            </span>
          </div>
          
          {isExpiringSoon() && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <Clock size={12} className="mr-1" />
              Expires Soon
            </Badge>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Invitation Code: {invitation.invitation.code}
        </div>
      </CardContent>
    </Card>
  );
};