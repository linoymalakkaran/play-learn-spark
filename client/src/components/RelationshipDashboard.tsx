import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserPlus, 
  QrCode, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Copy,
  Download,
  Trash2,
  Settings,
  Eye
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { relationshipService } from '@/services/relationshipService';
import { QRCodeDisplay } from './QRCodeDisplay';
import { RelationshipCard } from './RelationshipCard';
import { InvitationCard } from './InvitationCard';

interface Relationship {
  _id: string;
  requester: any;
  recipient: any;
  relationshipType: string;
  status: string;
  permissions: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

interface Invitation {
  _id: string;
  requester: any;
  relationshipType: string;
  invitation: {
    code: string;
    message?: string;
    expiresAt: string;
  };
  permissions: Record<string, boolean>;
}

interface RelationshipStats {
  totalRelationships: number;
  activeRelationships: number;
  pendingInvitations: number;
  relationshipTypes: Record<string, number>;
}

export const RelationshipDashboard: React.FC = () => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<RelationshipStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('relationships');
  const [showCreateInvitation, setShowCreateInvitation] = useState(false);
  const [invitationResult, setInvitationResult] = useState<any>(null);
  const { toast } = useToast();

  // Create invitation form state
  const [invitationForm, setInvitationForm] = useState({
    recipientEmail: '',
    relationshipType: '',
    message: '',
    expiresInHours: 168 // 7 days default
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [relationshipsData, invitationsData, statsData] = await Promise.all([
        relationshipService.getUserRelationships(),
        relationshipService.getPendingInvitations(),
        relationshipService.getRelationshipStats()
      ]);

      setRelationships(relationshipsData.data.relationships);
      setPendingInvitations(invitationsData.data.invitations);
      setStats(statsData.data);
    } catch (error) {
      console.error('Error loading relationship data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load relationship data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvitation = async () => {
    try {
      if (!invitationForm.recipientEmail || !invitationForm.relationshipType) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      const result = await relationshipService.createInvitation(invitationForm);
      setInvitationResult(result.data);
      setShowCreateInvitation(false);
      
      toast({
        title: 'Success',
        description: 'Invitation created successfully!'
      });

      // Reset form
      setInvitationForm({
        recipientEmail: '',
        relationshipType: '',
        message: '',
        expiresInHours: 168
      });

      // Reload data
      loadData();
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create invitation',
        variant: 'destructive'
      });
    }
  };

  const handleAcceptInvitation = async (invitationCode: string) => {
    try {
      await relationshipService.acceptInvitation(invitationCode);
      toast({
        title: 'Success',
        description: 'Invitation accepted successfully!'
      });
      loadData();
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to accept invitation',
        variant: 'destructive'
      });
    }
  };

  const handleDeclineInvitation = async (invitationCode: string, reason?: string) => {
    try {
      await relationshipService.declineInvitation(invitationCode, reason);
      toast({
        title: 'Success',
        description: 'Invitation declined'
      });
      loadData();
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to decline invitation',
        variant: 'destructive'
      });
    }
  };

  const copyInvitationLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'Invitation link copied to clipboard'
    });
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relationship Management</h1>
          <p className="text-gray-600 mt-2">Manage your family and classroom connections</p>
        </div>
        
        <Dialog open={showCreateInvitation} onOpenChange={setShowCreateInvitation}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={16} />
              Create Invitation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Relationship Invitation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={invitationForm.recipientEmail}
                  onChange={(e) => setInvitationForm({ ...invitationForm, recipientEmail: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <Label htmlFor="relationship-type">Relationship Type</Label>
                <Select 
                  value={invitationForm.relationshipType} 
                  onValueChange={(value) => setInvitationForm({ ...invitationForm, relationshipType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent-child">Parent-Child</SelectItem>
                    <SelectItem value="teacher-student">Teacher-Student</SelectItem>
                    <SelectItem value="guardian-child">Guardian-Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="peer">Peer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={invitationForm.message}
                  onChange={(e) => setInvitationForm({ ...invitationForm, message: e.target.value })}
                  placeholder="Add a personal message..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="expires">Expires In (Hours)</Label>
                <Input
                  id="expires"
                  type="number"
                  min="1"
                  max="720"
                  value={invitationForm.expiresInHours}
                  onChange={(e) => setInvitationForm({ ...invitationForm, expiresInHours: parseInt(e.target.value) || 168 })}
                />
              </div>

              <Button onClick={handleCreateInvitation} className="w-full">
                Create Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Relationships</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRelationships}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeRelationships}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingInvitations}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Types</p>
                  <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.relationshipTypes).length}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invitation Result Modal */}
      {invitationResult && (
        <Dialog open={!!invitationResult} onOpenChange={() => setInvitationResult(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Invitation Created Successfully!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Share this invitation with the recipient. They can use either the code or scan the QR code.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Invitation Code</Label>
                <div className="flex items-center gap-2">
                  <Input value={invitationResult.invitationCode} readOnly />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(invitationResult.invitationCode)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Invitation Link</Label>
                <div className="flex items-center gap-2">
                  <Input value={invitationResult.invitationUrl} readOnly className="text-xs" />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyInvitationLink(invitationResult.invitationUrl)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              {invitationResult.qrCode && (
                <QRCodeDisplay qrCode={invitationResult.qrCode} />
              )}

              <p className="text-sm text-gray-600">
                Expires: {new Date(invitationResult.expiresAt).toLocaleString()}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="relationships">
            My Relationships ({relationships.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Pending Invitations ({pendingInvitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="relationships" className="space-y-4">
          {relationships.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Relationships Yet</h3>
                <p className="text-gray-600 mb-4">Start by creating an invitation to connect with family or students.</p>
                <Button onClick={() => setShowCreateInvitation(true)}>
                  <UserPlus size={16} className="mr-2" />
                  Create Your First Invitation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {relationships.map((relationship) => (
                <RelationshipCard
                  key={relationship._id}
                  relationship={relationship}
                  onUpdate={loadData}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          {pendingInvitations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Invitations</h3>
                <p className="text-gray-600">You don't have any pending relationship invitations.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingInvitations.map((invitation) => (
                <InvitationCard
                  key={invitation._id}
                  invitation={invitation}
                  onAccept={() => handleAcceptInvitation(invitation.invitation.code)}
                  onDecline={(reason) => handleDeclineInvitation(invitation.invitation.code, reason)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};