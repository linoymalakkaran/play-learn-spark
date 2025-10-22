import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Trash2, 
  User, 
  Eye, 
  EyeOff,
  Clock,
  MessageCircle,
  Shield,
  Award
} from 'lucide-react';
import { relationshipService } from '@/services/relationshipService';
import { useToast } from '@/components/ui/use-toast';

interface RelationshipCardProps {
  relationship: {
    _id: string;
    requester: any;
    recipient: any;
    relationshipType: string;
    status: string;
    permissions: Record<string, boolean>;
    createdAt: string;
    updatedAt: string;
  };
  onUpdate: () => void;
}

export const RelationshipCard: React.FC<RelationshipCardProps> = ({ relationship, onUpdate }) => {
  const [showPermissions, setShowPermissions] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [permissions, setPermissions] = useState(relationship.permissions);
  const [removeReason, setRemoveReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const otherUser = relationship.requester._id === getCurrentUserId() 
    ? relationship.recipient 
    : relationship.requester;

  const isManageable = relationship.requester._id === getCurrentUserId();

  function getCurrentUserId() {
    // This should come from your auth context
    return localStorage.getItem('userId') || '';
  }

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

  const getStatusColor = (status: string) => {
    const colors = {
      'accepted': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'declined': 'bg-red-100 text-red-800',
      'blocked': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUserInitials = (user: any) => {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName[0]}${user.profile.lastName[0]}`;
    }
    return user.username?.[0]?.toUpperCase() || '?';
  };

  const handlePermissionChange = async (permission: string, value: boolean) => {
    const newPermissions = { ...permissions, [permission]: value };
    setPermissions(newPermissions);

    try {
      setIsUpdating(true);
      await relationshipService.updatePermissions(relationship._id, { [permission]: value });
      toast({
        title: 'Success',
        description: 'Permission updated successfully'
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error updating permission:', error);
      setPermissions(permissions); // Revert on error
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update permission',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveRelationship = async () => {
    try {
      setIsUpdating(true);
      await relationshipService.removeRelationship(relationship._id, removeReason);
      toast({
        title: 'Success',
        description: 'Relationship removed successfully'
      });
      setShowRemoveDialog(false);
      onUpdate();
    } catch (error: any) {
      console.error('Error removing relationship:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove relationship',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const permissionLabels = {
    viewProgress: { label: 'View Progress', icon: Eye, description: 'Can view learning progress and statistics' },
    viewActivities: { label: 'View Activities', icon: Eye, description: 'Can see assigned activities and content' },
    manageActivities: { label: 'Manage Activities', icon: Settings, description: 'Can assign and modify activities' },
    receiveNotifications: { label: 'Receive Notifications', icon: MessageCircle, description: 'Gets notified about important updates' },
    communicateDirectly: { label: 'Direct Communication', icon: MessageCircle, description: 'Can send direct messages' },
    viewReports: { label: 'View Reports', icon: Eye, description: 'Can access detailed progress reports' },
    approveRewards: { label: 'Approve Rewards', icon: Award, description: 'Can approve reward redemptions' },
    setTimeRestrictions: { label: 'Set Time Limits', icon: Clock, description: 'Can set usage time restrictions' }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.profile?.avatarUrl} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getUserInitials(otherUser)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {otherUser.profile?.firstName && otherUser.profile?.lastName 
                  ? `${otherUser.profile.firstName} ${otherUser.profile.lastName}`
                  : otherUser.username
                }
              </h3>
              <p className="text-sm text-gray-600">{otherUser.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getStatusColor(relationship.status)}>
                  {relationship.status}
                </Badge>
                <Badge variant="secondary">
                  {getRelationshipTypeLabel(relationship.relationshipType)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isManageable && (
              <>
                <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings size={16} className="mr-1" />
                      Permissions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Relationship Permissions</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <p className="text-sm text-gray-600">
                        Manage what {otherUser.profile?.firstName || otherUser.username} can see and do.
                      </p>
                      
                      <div className="space-y-4">
                        {Object.entries(permissionLabels).map(([key, config]) => {
                          const IconComponent = config.icon;
                          return (
                            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-start space-x-3">
                                <IconComponent size={18} className="text-gray-500 mt-0.5" />
                                <div>
                                  <Label className="font-medium">{config.label}</Label>
                                  <p className="text-sm text-gray-600">{config.description}</p>
                                </div>
                              </div>
                              <Switch
                                checked={permissions[key] || false}
                                onCheckedChange={(value) => handlePermissionChange(key, value)}
                                disabled={isUpdating}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Remove Relationship</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Are you sure you want to remove this relationship? This action cannot be undone.
                      </p>
                      
                      <div>
                        <Label htmlFor="reason">Reason (Optional)</Label>
                        <Textarea
                          id="reason"
                          value={removeReason}
                          onChange={(e) => setRemoveReason(e.target.value)}
                          placeholder="Why are you removing this relationship?"
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleRemoveRelationship}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Removing...' : 'Remove Relationship'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Connected: {new Date(relationship.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(relationship.updatedAt).toLocaleDateString()}</span>
        </div>

        {/* Quick permission summary */}
        <div className="mt-3 flex flex-wrap gap-1">
          {Object.entries(permissions).filter(([_, value]) => value).map(([key, _]) => (
            <Badge key={key} variant="secondary" className="text-xs">
              {permissionLabels[key as keyof typeof permissionLabels]?.label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};