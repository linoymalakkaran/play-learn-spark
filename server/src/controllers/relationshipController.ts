import { Request, Response } from 'express';
import { Types } from 'mongoose';
import relationshipService from '../services/relationshipService';
import logger from '../utils/logger';
import { validationResult } from 'express-validator';
import { Relationship } from '../models/Relationship';

export class RelationshipController {
  /**
   * Create a new relationship invitation
   */
  async createInvitation(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { recipientEmail, relationshipType, message, permissions, timeRestrictions, expiresInHours } = req.body;
      const requesterId = new Types.ObjectId(req.user!.id);

      const result = await relationshipService.createRelationshipInvitation({
        requesterId,
        recipientEmail,
        relationshipType,
        message,
        permissions,
        timeRestrictions,
        expiresInHours
      });

      res.status(201).json({
        success: true,
        message: 'Relationship invitation created successfully',
        data: {
          relationshipId: result.relationship._id,
          invitationCode: result.relationship.invitation.code,
          invitationUrl: result.invitationUrl,
          qrCode: result.qrCodeData,
          expiresAt: result.relationship.invitation.expiresAt
        }
      });

    } catch (error) {
      logger.error('Error creating relationship invitation:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create invitation'
      });
    }
  }

  /**
   * Accept a relationship invitation
   */
  async acceptInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { invitationCode } = req.params;
      const userId = new Types.ObjectId(req.user!.id);

      const relationship = await relationshipService.acceptInvitation(invitationCode, userId);

      res.status(200).json({
        success: true,
        message: 'Invitation accepted successfully',
        data: {
          relationshipId: relationship._id,
          relationshipType: relationship.relationshipType,
          requester: relationship.requester,
          permissions: relationship.permissions
        }
      });

    } catch (error) {
      logger.error('Error accepting invitation:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to accept invitation'
      });
    }
  }

  /**
   * Decline a relationship invitation
   */
  async declineInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { invitationCode } = req.params;
      const { reason } = req.body;
      const userId = new Types.ObjectId(req.user!.id);

      await relationshipService.declineInvitation(invitationCode, userId, reason);

      res.status(200).json({
        success: true,
        message: 'Invitation declined successfully'
      });

    } catch (error) {
      logger.error('Error declining invitation:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to decline invitation'
      });
    }
  }

  /**
   * Get user's relationships
   */
  async getUserRelationships(req: Request, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user!.id);
      const includeInactive = req.query.includeInactive === 'true';

      const relationships = await relationshipService.getUserRelationships(userId, includeInactive);

      res.status(200).json({
        success: true,
        message: 'Relationships retrieved successfully',
        data: {
          relationships,
          count: relationships.length
        }
      });

    } catch (error) {
      logger.error('Error getting user relationships:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve relationships'
      });
    }
  }

  /**
   * Get pending invitations
   */
  async getPendingInvitations(req: Request, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user!.id);

      const invitations = await relationshipService.getPendingInvitations(userId);

      res.status(200).json({
        success: true,
        message: 'Pending invitations retrieved successfully',
        data: {
          invitations,
          count: invitations.length
        }
      });

    } catch (error) {
      logger.error('Error getting pending invitations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending invitations'
      });
    }
  }

  /**
   * Get invitation details by code
   */
  async getInvitationDetails(req: Request, res: Response): Promise<void> {
    try {
      const { invitationCode } = req.params;

      const relationship = await Relationship.findByInvitationCode(invitationCode);

      if (!relationship) {
        res.status(404).json({
          success: false,
          message: 'Invitation not found or expired'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Invitation details retrieved successfully',
        data: {
          invitationCode: relationship.invitation.code,
          relationshipType: relationship.relationshipType,
          requester: relationship.requester,
          message: relationship.invitation.message,
          expiresAt: relationship.invitation.expiresAt,
          permissions: relationship.permissions
        }
      });

    } catch (error) {
      logger.error('Error getting invitation details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve invitation details'
      });
    }
  }

  /**
   * Update relationship permissions
   */
  async updatePermissions(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { relationshipId } = req.params;
      const { permissions } = req.body;
      const userId = new Types.ObjectId(req.user!.id);

      const relationship = await relationshipService.updateRelationshipPermissions(
        new Types.ObjectId(relationshipId),
        userId,
        permissions
      );

      res.status(200).json({
        success: true,
        message: 'Relationship permissions updated successfully',
        data: {
          relationshipId: relationship._id,
          permissions: relationship.permissions
        }
      });

    } catch (error) {
      logger.error('Error updating relationship permissions:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update permissions'
      });
    }
  }

  /**
   * Remove a relationship
   */
  async removeRelationship(req: Request, res: Response): Promise<void> {
    try {
      const { relationshipId } = req.params;
      const { reason } = req.body;
      const userId = new Types.ObjectId(req.user!.id);

      await relationshipService.removeRelationship(
        new Types.ObjectId(relationshipId),
        userId,
        reason
      );

      res.status(200).json({
        success: true,
        message: 'Relationship removed successfully'
      });

    } catch (error) {
      logger.error('Error removing relationship:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove relationship'
      });
    }
  }

  /**
   * Get parent's children
   */
  async getParentChildren(req: Request, res: Response): Promise<void> {
    try {
      const parentId = new Types.ObjectId(req.user!.id);

      // Verify user is a parent
      if (req.user!.role !== 'parent') {
        res.status(403).json({
          success: false,
          message: 'Only parents can access this endpoint'
        });
        return;
      }

      const children = await relationshipService.getParentChildren(parentId);

      res.status(200).json({
        success: true,
        message: 'Children retrieved successfully',
        data: {
          children,
          count: children.length
        }
      });

    } catch (error) {
      logger.error('Error getting parent children:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve children'
      });
    }
  }

  /**
   * Get teacher's students
   */
  async getTeacherStudents(req: Request, res: Response): Promise<void> {
    try {
      const teacherId = new Types.ObjectId(req.user!.id);

      // Verify user is a teacher
      if (req.user!.role !== 'educator') {
        res.status(403).json({
          success: false,
          message: 'Only teachers can access this endpoint'
        });
        return;
      }

      const students = await relationshipService.getTeacherStudents(teacherId);

      res.status(200).json({
        success: true,
        message: 'Students retrieved successfully',
        data: {
          students,
          count: students.length
        }
      });

    } catch (error) {
      logger.error('Error getting teacher students:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve students'
      });
    }
  }

  /**
   * Get relationship statistics
   */
  async getRelationshipStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = new Types.ObjectId(req.user!.id);

      const [relationships, pendingInvitations] = await Promise.all([
        relationshipService.getUserRelationships(userId),
        relationshipService.getPendingInvitations(userId)
      ]);

      const stats = {
        totalRelationships: relationships.length,
        activeRelationships: relationships.filter(r => r.status === 'accepted').length,
        pendingInvitations: pendingInvitations.length,
        relationshipTypes: relationships.reduce((acc, rel) => {
          acc[rel.relationshipType] = (acc[rel.relationshipType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      res.status(200).json({
        success: true,
        message: 'Relationship statistics retrieved successfully',
        data: stats
      });

    } catch (error) {
      logger.error('Error getting relationship stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve relationship statistics'
      });
    }
  }
}

export default new RelationshipController();

export default new RelationshipController();