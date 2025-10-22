import { Request, Response } from 'express';
import { communicationService } from '../services/communicationService';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

export class CommunicationController {
  // Message endpoints
  async createMessage(req: Request, res: Response): Promise<void> {
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

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const messageData = {
        ...req.body,
        sender: userId.toString()
      };

      const message = await communicationService.createMessage(messageData);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } catch (error: any) {
      logger.error('Message creation failed', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }
  }

  async getMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const message = await communicationService.getMessage(id, userId.toString());

      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        });
        return;
      }

      res.json({
        success: true,
        data: message
      });
    } catch (error: any) {
      logger.error('Failed to get message', {
        error: error.message,
        messageId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('Access denied') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async editMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!content || content.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
        return;
      }

      const message = await communicationService.editMessage(id, content, userId.toString());

      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Message updated successfully',
        data: message
      });
    } catch (error: any) {
      logger.error('Message edit failed', {
        error: error.message,
        messageId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('Cannot edit') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role || 'user';

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      await communicationService.deleteMessage(id, userId.toString(), userRole);

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error: any) {
      logger.error('Message deletion failed', {
        error: error.message,
        messageId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('Cannot delete') ? 403 : 
                        error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async addReaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { emoji } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!emoji) {
        res.status(400).json({
          success: false,
          message: 'Emoji is required'
        });
        return;
      }

      const message = await communicationService.addReaction(id, userId.toString(), emoji);

      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Reaction added successfully',
        data: message
      });
    } catch (error: any) {
      logger.error('Failed to add reaction', {
        error: error.message,
        messageId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to add reaction',
        error: error.message
      });
    }
  }

  async removeReaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const message = await communicationService.removeReaction(id, userId.toString());

      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Reaction removed successfully',
        data: message
      });
    } catch (error: any) {
      logger.error('Failed to remove reaction', {
        error: error.message,
        messageId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to remove reaction',
        error: error.message
      });
    }
  }

  // Conversation endpoints
  async createConversation(req: Request, res: Response): Promise<void> {
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

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const conversationData = {
        ...req.body,
        createdBy: userId.toString()
      };

      const conversation = await communicationService.createConversation(conversationData);

      res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: conversation
      });
    } catch (error: any) {
      logger.error('Conversation creation failed', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create conversation',
        error: error.message
      });
    }
  }

  async getConversation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const conversation = await communicationService.getConversation(id, userId.toString());

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
        return;
      }

      res.json({
        success: true,
        data: conversation
      });
    } catch (error: any) {
      logger.error('Failed to get conversation', {
        error: error.message,
        conversationId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('Access denied') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async getUserConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { type, status } = req.query;
      const options: any = {};
      
      if (type) options.type = type;
      if (status) options.status = status;

      const conversations = await communicationService.getUserConversations(userId.toString(), options);

      res.json({
        success: true,
        data: conversations
      });
    } catch (error: any) {
      logger.error('Failed to get user conversations', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get conversations',
        error: error.message
      });
    }
  }

  async getConversationMessages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const {
        page = '1',
        limit = '50',
        since,
        until,
        messageType,
        search
      } = req.query;

      const options: any = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      if (since) options.since = new Date(since as string);
      if (until) options.until = new Date(until as string);
      if (messageType) options.messageType = messageType;
      if (search) options.search = search;

      const messages = await communicationService.getConversationMessages(id, userId.toString(), options);

      res.json({
        success: true,
        data: messages
      });
    } catch (error: any) {
      logger.error('Failed to get conversation messages', {
        error: error.message,
        conversationId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('Access denied') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId: newParticipantId, role = 'member' } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      if (!newParticipantId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const conversation = await communicationService.addParticipant(
        id,
        userId.toString(),
        newParticipantId,
        role
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Participant added successfully',
        data: conversation
      });
    } catch (error: any) {
      logger.error('Failed to add participant', {
        error: error.message,
        conversationId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('Insufficient permissions') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async removeParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { id, participantId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const conversation = await communicationService.removeParticipant(
        id,
        userId.toString(),
        participantId
      );

      if (!conversation) {
        res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Participant removed successfully',
        data: conversation
      });
    } catch (error: any) {
      logger.error('Failed to remove participant', {
        error: error.message,
        conversationId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      const statusCode = error.message.includes('Insufficient permissions') ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async markConversationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      await communicationService.markConversationAsRead(id, userId.toString());

      res.json({
        success: true,
        message: 'Conversation marked as read'
      });
    } catch (error: any) {
      logger.error('Failed to mark conversation as read', {
        error: error.message,
        conversationId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to mark conversation as read',
        error: error.message
      });
    }
  }

  // Notification endpoints
  async createNotification(req: Request, res: Response): Promise<void> {
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

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const notificationData = {
        ...req.body,
        sender: userId.toString()
      };

      const notification = await communicationService.createNotification(notificationData);

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error: any) {
      logger.error('Notification creation failed', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create notification',
        error: error.message
      });
    }
  }

  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const {
        page = '1',
        limit = '20',
        type,
        isRead,
        priority,
        since
      } = req.query;

      const options: any = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      if (type) options.type = type;
      if (isRead !== undefined) options.isRead = isRead === 'true';
      if (priority) options.priority = priority;
      if (since) options.since = new Date(since as string);

      const result = await communicationService.getUserNotifications(userId.toString(), options);

      res.json({
        success: true,
        data: result.notifications,
        pagination: {
          current: parseInt(page as string),
          total: Math.ceil(result.total / parseInt(limit as string)),
          count: result.total,
          limit: parseInt(limit as string)
        },
        unreadCount: result.unread
      });
    } catch (error: any) {
      logger.error('Failed to get user notifications', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get notifications',
        error: error.message
      });
    }
  }

  async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const notification = await communicationService.markNotificationAsRead(id, userId.toString());

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error: any) {
      logger.error('Failed to mark notification as read', {
        error: error.message,
        notificationId: req.params.id,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  async markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      await communicationService.markAllNotificationsAsRead(userId.toString());

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error: any) {
      logger.error('Failed to mark all notifications as read', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }

  async getUnreadCounts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { conversationId } = req.query;

      const [messageCount, notificationCount] = await Promise.all([
        communicationService.getUnreadMessageCount(
          userId.toString(),
          conversationId as string
        ),
        communicationService.getUserNotifications(userId.toString(), { isRead: false })
          .then(result => result.unread)
      ]);

      res.json({
        success: true,
        data: {
          messages: messageCount,
          notifications: notificationCount,
          total: messageCount + notificationCount
        }
      });
    } catch (error: any) {
      logger.error('Failed to get unread counts', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to get unread counts',
        error: error.message
      });
    }
  }

  // Announcement endpoints
  async createAnnouncement(req: Request, res: Response): Promise<void> {
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

      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Check if user can create announcements
      if (!['admin', 'teacher', 'instructor'].includes(userRole || '')) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create announcements'
        });
        return;
      }

      const { title, content, targetAudience, priority = 'normal', expiresAt } = req.body;

      // Create announcement conversation
      const conversationData = {
        title: `📢 ${title}`,
        description: content,
        type: 'announcement' as const,
        participants: targetAudience.map((audienceId: string) => ({
          userId: audienceId,
          role: 'member' as const
        })),
        settings: {
          isPublic: true,
          allowInvites: false,
          requireApproval: false,
          allowFileSharing: false,
          allowReactions: true,
          allowEditing: false
        },
        metadata: {
          category: 'announcement',
          priority: priority,
          topicTags: ['announcement']
        },
        createdBy: userId.toString()
      };

      const conversation = await communicationService.createConversation(conversationData);

      // Create announcement message
      const messageData = {
        content: content,
        sender: userId.toString(),
        conversationId: conversation._id.toString(),
        messageType: 'announcement' as const,
        priority: priority,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      };

      const message = await communicationService.createMessage(messageData);

      // Create notifications for all participants
      for (const audienceId of targetAudience) {
        const notificationData = {
          recipient: audienceId,
          sender: userId.toString(),
          type: 'announcement' as const,
          title: `📢 ${title}`,
          content: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          data: {
            conversationId: conversation._id,
            messageId: message._id,
            priority: priority,
            url: `/announcements/${conversation._id}`,
            actionRequired: false
          },
          channels: {
            inApp: true,
            email: priority === 'urgent' || priority === 'high',
            push: true
          },
          priority: priority,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        };

        await communicationService.createNotification(notificationData);
      }

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: {
          conversation,
          message,
          recipientCount: targetAudience.length
        }
      });
    } catch (error: any) {
      logger.error('Announcement creation failed', {
        error: error.message,
        userId: req.user?.id,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create announcement',
        error: error.message
      });
    }
  }
}

export const communicationController = new CommunicationController();