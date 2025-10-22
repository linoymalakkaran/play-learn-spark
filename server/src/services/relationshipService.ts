import { Types } from 'mongoose';
import { Relationship, IRelationship } from '../models/Relationship';
import { UserMongo as User } from '../models/UserMongo';
import QRCode from 'qrcode';
import logger from '../utils/logger';

export interface CreateRelationshipRequest {
  requesterId: Types.ObjectId;
  recipientEmail: string;
  relationshipType: 'parent-child' | 'teacher-student' | 'guardian-child' | 'sibling' | 'peer';
  message?: string;
  permissions?: Partial<IRelationship['permissions']>;
  timeRestrictions?: IRelationship['timeRestrictions'];
  expiresInHours?: number;
}

export interface InvitationResponse {
  relationship: IRelationship;
  invitationUrl: string;
  qrCodeData: string;
}

export class RelationshipService {
  /**
   * Create a new relationship invitation
   */
  async createRelationshipInvitation(request: CreateRelationshipRequest): Promise<InvitationResponse> {
    try {
      // Find recipient by email
      const recipient = await User.findOne({ email: request.recipientEmail });
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      // Check if relationship already exists
      const existingRelationship = await Relationship.findOne({
        $or: [
          { requester: request.requesterId, recipient: recipient._id },
          { requester: recipient._id, recipient: request.requesterId }
        ],
        relationshipType: request.relationshipType,
        status: { $in: ['pending', 'accepted'] }
      });

      if (existingRelationship) {
        throw new Error('Relationship already exists or is pending');
      }

      // Validate relationship type permissions
      await this.validateRelationshipType(request.requesterId, recipient._id, request.relationshipType);

      // Generate invitation code and QR code
      const invitationCode = await this.generateUniqueInvitationCode();
      const expiresAt = new Date(Date.now() + (request.expiresInHours || 168) * 60 * 60 * 1000); // Default 7 days

      // Create invitation URL
      const invitationUrl = `${process.env.CLIENT_URL}/relationships/accept/${invitationCode}`;
      
      // Generate QR code
      const qrCodeData = await QRCode.toDataURL(invitationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Set default permissions based on relationship type
      const defaultPermissions = this.getDefaultPermissions(request.relationshipType);
      const permissions = { ...defaultPermissions, ...request.permissions };

      // Create relationship
      const relationship = new Relationship({
        requester: request.requesterId,
        recipient: recipient._id,
        relationshipType: request.relationshipType,
        status: 'pending',
        invitation: {
          code: invitationCode,
          qrCode: qrCodeData,
          expiresAt,
          message: request.message,
          createdAt: new Date()
        },
        permissions,
        timeRestrictions: request.timeRestrictions,
        metadata: {
          initiatedBy: request.requesterId,
          priority: 'medium',
          tags: [],
          lastInteraction: new Date(),
          interactionCount: 1
        },
        history: [{
          action: 'created',
          performedBy: request.requesterId,
          performedAt: new Date(),
          details: `Invitation sent to ${request.recipientEmail}`
        }]
      });

      await relationship.save();

      logger.info(`Relationship invitation created: ${invitationCode}`, {
        requesterId: request.requesterId,
        recipientId: recipient._id,
        relationshipType: request.relationshipType
      });

      return {
        relationship,
        invitationUrl,
        qrCodeData
      };

    } catch (error) {
      logger.error('Error creating relationship invitation:', error);
      throw error;
    }
  }

  /**
   * Accept a relationship invitation
   */
  async acceptInvitation(invitationCode: string, userId: Types.ObjectId): Promise<IRelationship> {
    try {
      const relationship = await Relationship.findByInvitationCode(invitationCode);
      
      if (!relationship) {
        throw new Error('Invalid or expired invitation code');
      }

      if (relationship.recipient.toString() !== userId.toString()) {
        throw new Error('You are not authorized to accept this invitation');
      }

      if (relationship.isExpired()) {
        throw new Error('This invitation has expired');
      }

      // Update relationship status
      relationship.status = 'accepted';
      relationship.invitation.usedAt = new Date();
      relationship.addHistoryEntry('accepted', userId, 'Invitation accepted');

      await relationship.save();

      // Update user relationships
      await this.updateUserRelationships(relationship.requester, relationship.recipient);

      logger.info(`Relationship invitation accepted: ${invitationCode}`, {
        relationshipId: relationship._id,
        userId
      });

      return relationship;

    } catch (error) {
      logger.error('Error accepting invitation:', error);
      throw error;
    }
  }

  /**
   * Decline a relationship invitation
   */
  async declineInvitation(invitationCode: string, userId: Types.ObjectId, reason?: string): Promise<void> {
    try {
      const relationship = await Relationship.findByInvitationCode(invitationCode);
      
      if (!relationship) {
        throw new Error('Invalid or expired invitation code');
      }

      if (relationship.recipient.toString() !== userId.toString()) {
        throw new Error('You are not authorized to decline this invitation');
      }

      relationship.status = 'declined';
      relationship.addHistoryEntry('declined', userId, reason || 'Invitation declined');

      await relationship.save();

      logger.info(`Relationship invitation declined: ${invitationCode}`, {
        relationshipId: relationship._id,
        userId,
        reason
      });

    } catch (error) {
      logger.error('Error declining invitation:', error);
      throw error;
    }
  }

  /**
   * Get user's relationships
   */
  async getUserRelationships(userId: Types.ObjectId, includeInactive = false): Promise<IRelationship[]> {
    try {
      const query: any = {
        $or: [{ requester: userId }, { recipient: userId }],
        deletedAt: null
      };

      if (!includeInactive) {
        query.status = 'accepted';
      }

      const relationships = await Relationship.find(query)
        .populate('requester', 'username profile role email')
        .populate('recipient', 'username profile role email')
        .sort({ updatedAt: -1 });

      return relationships;

    } catch (error) {
      logger.error('Error getting user relationships:', error);
      throw error;
    }
  }

  /**
   * Get pending invitations for a user
   */
  async getPendingInvitations(userId: Types.ObjectId): Promise<IRelationship[]> {
    try {
      const invitations = await Relationship.findPendingInvitations(userId);
      return invitations;

    } catch (error) {
      logger.error('Error getting pending invitations:', error);
      throw error;
    }
  }

  /**
   * Update relationship permissions
   */
  async updateRelationshipPermissions(
    relationshipId: Types.ObjectId, 
    userId: Types.ObjectId, 
    permissions: Partial<IRelationship['permissions']>
  ): Promise<IRelationship> {
    try {
      const relationship = await Relationship.findById(relationshipId);
      
      if (!relationship) {
        throw new Error('Relationship not found');
      }

      if (!relationship.canManage(userId)) {
        throw new Error('You are not authorized to modify this relationship');
      }

      relationship.updatePermissions(permissions);
      relationship.addHistoryEntry('modified', userId, 'Permissions updated');

      await relationship.save();

      logger.info(`Relationship permissions updated: ${relationshipId}`, {
        userId,
        permissions
      });

      return relationship;

    } catch (error) {
      logger.error('Error updating relationship permissions:', error);
      throw error;
    }
  }

  /**
   * Remove a relationship
   */
  async removeRelationship(relationshipId: Types.ObjectId, userId: Types.ObjectId, reason?: string): Promise<void> {
    try {
      const relationship = await Relationship.findById(relationshipId);
      
      if (!relationship) {
        throw new Error('Relationship not found');
      }

      if (!relationship.canManage(userId)) {
        throw new Error('You are not authorized to remove this relationship');
      }

      relationship.deletedAt = new Date();
      relationship.addHistoryEntry('suspended', userId, reason || 'Relationship removed');

      await relationship.save();

      // Update user relationships
      await this.removeUserRelationshipReference(relationship.requester, relationship.recipient);

      logger.info(`Relationship removed: ${relationshipId}`, {
        userId,
        reason
      });

    } catch (error) {
      logger.error('Error removing relationship:', error);
      throw error;
    }
  }

  /**
   * Get children for a parent
   */
  async getParentChildren(parentId: Types.ObjectId): Promise<any[]> {
    try {
      const relationships = await Relationship.find({
        requester: parentId,
        relationshipType: { $in: ['parent-child', 'guardian-child'] },
        status: 'accepted',
        deletedAt: null
      }).populate('recipient', 'username profile progress preferences');

      return relationships.map(rel => ({
        relationship: rel,
        child: rel.recipient
      }));

    } catch (error) {
      logger.error('Error getting parent children:', error);
      throw error;
    }
  }

  /**
   * Get students for a teacher
   */
  async getTeacherStudents(teacherId: Types.ObjectId): Promise<any[]> {
    try {
      const relationships = await Relationship.find({
        requester: teacherId,
        relationshipType: 'teacher-student',
        status: 'accepted',
        deletedAt: null
      }).populate('recipient', 'username profile progress preferences');

      return relationships.map(rel => ({
        relationship: rel,
        student: rel.recipient
      }));

    } catch (error) {
      logger.error('Error getting teacher students:', error);
      throw error;
    }
  }

  /**
   * Generate a unique invitation code
   */
  private async generateUniqueInvitationCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = Relationship.createInvitationCode();
      const existing = await Relationship.findOne({ 'invitation.code': code });
      
      if (!existing) {
        return code;
      }
      attempts++;
    }

    throw new Error('Unable to generate unique invitation code');
  }

  /**
   * Get default permissions based on relationship type
   */
  private getDefaultPermissions(relationshipType: string): IRelationship['permissions'] {
    const defaults = {
      'parent-child': {
        viewProgress: true,
        viewActivities: true,
        manageActivities: true,
        receiveNotifications: true,
        communicateDirectly: true,
        viewReports: true,
        approveRewards: true,
        setTimeRestrictions: true
      },
      'guardian-child': {
        viewProgress: true,
        viewActivities: true,
        manageActivities: true,
        receiveNotifications: true,
        communicateDirectly: true,
        viewReports: true,
        approveRewards: true,
        setTimeRestrictions: true
      },
      'teacher-student': {
        viewProgress: true,
        viewActivities: true,
        manageActivities: true,
        receiveNotifications: true,
        communicateDirectly: true,
        viewReports: true,
        approveRewards: false,
        setTimeRestrictions: false
      },
      'sibling': {
        viewProgress: false,
        viewActivities: false,
        manageActivities: false,
        receiveNotifications: false,
        communicateDirectly: true,
        viewReports: false,
        approveRewards: false,
        setTimeRestrictions: false
      },
      'peer': {
        viewProgress: false,
        viewActivities: false,
        manageActivities: false,
        receiveNotifications: false,
        communicateDirectly: true,
        viewReports: false,
        approveRewards: false,
        setTimeRestrictions: false
      }
    };

    return defaults[relationshipType] || defaults['peer'];
  }

  /**
   * Validate relationship type permissions
   */
  private async validateRelationshipType(
    requesterId: Types.ObjectId, 
    recipientId: Types.ObjectId, 
    relationshipType: string
  ): Promise<void> {
    const requester = await User.findById(requesterId);
    const recipient = await User.findById(recipientId);

    if (!requester || !recipient) {
      throw new Error('Invalid user IDs');
    }

    // Validate based on relationship type
    switch (relationshipType) {
      case 'parent-child':
      case 'guardian-child':
        if (requester.role !== 'parent' || recipient.role !== 'child') {
          throw new Error('Invalid roles for parent-child relationship');
        }
        break;
      case 'teacher-student':
        if (requester.role !== 'educator' || recipient.role !== 'child') {
          throw new Error('Invalid roles for teacher-student relationship');
        }
        break;
      case 'sibling':
        if (requester.role !== 'child' || recipient.role !== 'child') {
          throw new Error('Invalid roles for sibling relationship');
        }
        break;
    }
  }

  /**
   * Update user relationships references
   */
  private async updateUserRelationships(userId1: Types.ObjectId, userId2: Types.ObjectId): Promise<void> {
    try {
      const relationships = await Relationship.find({
        $or: [
          { requester: userId1, recipient: userId2 },
          { requester: userId2, recipient: userId1 }
        ],
        status: 'accepted',
        deletedAt: null
      });

      const relationshipIds = relationships.map(rel => rel._id);

      // Update both users' relationship arrays
      await User.findByIdAndUpdate(userId1, {
        $addToSet: { relationships: { $each: relationshipIds } }
      });

      await User.findByIdAndUpdate(userId2, {
        $addToSet: { relationships: { $each: relationshipIds } }
      });

    } catch (error) {
      logger.error('Error updating user relationships:', error);
    }
  }

  /**
   * Remove relationship reference from users
   */
  private async removeUserRelationshipReference(userId1: Types.ObjectId, userId2: Types.ObjectId): Promise<void> {
    try {
      const relationships = await Relationship.find({
        $or: [
          { requester: userId1, recipient: userId2 },
          { requester: userId2, recipient: userId1 }
        ],
        deletedAt: { $ne: null }
      });

      const relationshipIds = relationships.map(rel => rel._id);

      // Remove from both users' relationship arrays
      await User.findByIdAndUpdate(userId1, {
        $pull: { relationships: { $in: relationshipIds } }
      });

      await User.findByIdAndUpdate(userId2, {
        $pull: { relationships: { $in: relationshipIds } }
      });

    } catch (error) {
      logger.error('Error removing user relationship references:', error);
    }
  }
}

export default new RelationshipService();