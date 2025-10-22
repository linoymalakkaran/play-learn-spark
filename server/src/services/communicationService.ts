import { Message, IMessage } from '../models/Message';
import { Conversation, IConversation } from '../models/Conversation';
import { Notification, INotification } from '../models/Notification';
import { logger } from '../utils/logger';
import { ObjectId } from 'mongoose';
import { EventEmitter } from 'events';

export interface MessageCreationData {
  content: string;
  sender: string;
  conversationId: string;
  messageType?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system' | 'announcement';
  attachments?: Array<{
    type: 'file' | 'image' | 'audio' | 'video' | 'document';
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>;
  replyTo?: string;
  mentions?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: Date;
  expiresAt?: Date;
}

export interface ConversationCreationData {
  title: string;
  description?: string;
  type: 'direct' | 'group' | 'class' | 'announcement' | 'forum' | 'support';
  participants: Array<{
    userId: string;
    role?: 'admin' | 'moderator' | 'member';
  }>;
  settings?: any;
  metadata?: any;
  createdBy: string;
}

export interface NotificationCreationData {
  recipient: string;
  sender?: string;
  type: 'message' | 'assignment' | 'announcement' | 'reminder' | 'achievement' | 'system' | 'deadline' | 'grade' | 'comment' | 'mention';
  title: string;
  content: string;
  data?: any;
  channels?: {
    inApp?: boolean;
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: Date;
  expiresAt?: Date;
}

export class CommunicationService extends EventEmitter {
  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('messageCreated', this.handleMessageCreated.bind(this));
    this.on('conversationCreated', this.handleConversationCreated.bind(this));
    this.on('notificationCreated', this.handleNotificationCreated.bind(this));
  }

  // Message Management
  async createMessage(data: MessageCreationData): Promise<IMessage> {
    try {
      logger.info('Creating new message', { 
        conversationId: data.conversationId,
        sender: data.sender,
        messageType: data.messageType
      });

      // Validate conversation exists and user can post
      const conversation = await Conversation.findById(data.conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      if (!conversation.canUserPost(new ObjectId(data.sender))) {
        throw new Error('User is not allowed to post in this conversation');
      }

      // Get conversation participants for recipients
      const activeParticipants = conversation.getActiveParticipants();
      const recipients = activeParticipants
        .filter(p => p.userId.toString() !== data.sender)
        .map(p => ({
          userId: p.userId,
          deliveredAt: new Date()
        }));

      const messageData = {
        content: data.content,
        sender: new ObjectId(data.sender),
        recipients,
        conversation: new ObjectId(data.conversationId),
        messageType: data.messageType || 'text',
        attachments: data.attachments || [],
        replyTo: data.replyTo ? new ObjectId(data.replyTo) : undefined,
        mentions: data.mentions?.map(id => new ObjectId(id)) || [],
        priority: data.priority || 'normal',
        scheduledFor: data.scheduledFor,
        expiresAt: data.expiresAt,
        status: 'sent',
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
          sentAt: new Date()
        }
      };

      const message = new Message(messageData);
      const savedMessage = await message.save();

      // Update conversation statistics
      await conversation.updateStatistics({
        senderId: data.sender,
        createdAt: new Date()
      });

      // Emit event for real-time updates
      this.emit('messageCreated', {
        message: savedMessage,
        conversation,
        participants: activeParticipants
      });

      // Create notifications for recipients
      await this.createMessageNotifications(savedMessage, conversation);

      logger.info('Message created successfully', { 
        messageId: savedMessage._id,
        conversationId: data.conversationId
      });

      return savedMessage;
    } catch (error: any) {
      logger.error('Failed to create message', { 
        error: error.message,
        conversationId: data.conversationId,
        sender: data.sender
      });
      throw error;
    }
  }

  async getMessage(id: string, userId: string): Promise<IMessage | null> {
    try {
      const message = await Message.findById(id)
        .populate('sender', 'username email firstName lastName avatar')
        .populate('replyTo', 'content sender messageType')
        .populate('mentions', 'username firstName lastName');

      if (!message) return null;

      // Check if user is participant in conversation
      const conversation = await Conversation.findById(message.conversation);
      if (!conversation) return null;

      const isParticipant = conversation.participants.some(
        p => p.userId.toString() === userId && p.isActive
      );

      if (!isParticipant) {
        throw new Error('Access denied');
      }

      // Mark as read if not already read
      if (!message.isReadBy(new ObjectId(userId))) {
        await message.markAsRead(new ObjectId(userId));
      }

      return message;
    } catch (error: any) {
      logger.error('Failed to get message', { 
        error: error.message,
        messageId: id,
        userId
      });
      throw error;
    }
  }

  async editMessage(id: string, newContent: string, userId: string): Promise<IMessage | null> {
    try {
      const message = await Message.findById(id);
      if (!message) {
        throw new Error('Message not found');
      }

      if (!message.canEdit(new ObjectId(userId))) {
        throw new Error('Cannot edit this message');
      }

      const updatedMessage = await message.editContent(newContent, new ObjectId(userId));

      this.emit('messageUpdated', {
        message: updatedMessage,
        userId
      });

      return updatedMessage;
    } catch (error: any) {
      logger.error('Failed to edit message', { 
        error: error.message,
        messageId: id,
        userId
      });
      throw error;
    }
  }

  async deleteMessage(id: string, userId: string, userRole: string): Promise<void> {
    try {
      const message = await Message.findById(id);
      if (!message) {
        throw new Error('Message not found');
      }

      if (!message.canDelete(new ObjectId(userId), userRole)) {
        throw new Error('Cannot delete this message');
      }

      await message.softDelete(new ObjectId(userId));

      this.emit('messageDeleted', {
        messageId: id,
        conversationId: message.conversation,
        deletedBy: userId
      });

      logger.info('Message deleted', { messageId: id, deletedBy: userId });
    } catch (error: any) {
      logger.error('Failed to delete message', { 
        error: error.message,
        messageId: id,
        userId
      });
      throw error;
    }
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<IMessage | null> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const updatedMessage = await message.addReaction(new ObjectId(userId), emoji);

      this.emit('reactionAdded', {
        messageId,
        userId,
        emoji,
        conversationId: message.conversation
      });

      return updatedMessage;
    } catch (error: any) {
      logger.error('Failed to add reaction', { 
        error: error.message,
        messageId,
        userId,
        emoji
      });
      throw error;
    }
  }

  async removeReaction(messageId: string, userId: string): Promise<IMessage | null> {
    try {
      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const updatedMessage = await message.removeReaction(new ObjectId(userId));

      this.emit('reactionRemoved', {
        messageId,
        userId,
        conversationId: message.conversation
      });

      return updatedMessage;
    } catch (error: any) {
      logger.error('Failed to remove reaction', { 
        error: error.message,
        messageId,
        userId
      });
      throw error;
    }
  }

  // Conversation Management
  async createConversation(data: ConversationCreationData): Promise<IConversation> {
    try {
      logger.info('Creating new conversation', { 
        title: data.title,
        type: data.type,
        createdBy: data.createdBy
      });

      const conversationData = {
        title: data.title,
        description: data.description,
        type: data.type,
        participants: data.participants.map(p => ({
          userId: new ObjectId(p.userId),
          role: p.role || 'member',
          joinedAt: new Date(),
          lastSeenAt: new Date(),
          isActive: true,
          permissions: this.getDefaultPermissions(p.role || 'member', data.type)
        })),
        settings: {
          isPublic: false,
          allowInvites: true,
          requireApproval: false,
          muteNotifications: false,
          autoDeleteMessages: false,
          allowFileSharing: true,
          allowReactions: true,
          allowEditing: true,
          allowMentions: true,
          ...data.settings
        },
        metadata: {
          category: 'general',
          priority: 'normal',
          topicTags: [],
          ...data.metadata
        },
        createdBy: new ObjectId(data.createdBy),
        status: 'active',
        visibility: data.type === 'announcement' ? 'public' : 'private',
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      const conversation = new Conversation(conversationData);
      const savedConversation = await conversation.save();

      this.emit('conversationCreated', {
        conversation: savedConversation,
        participants: data.participants
      });

      logger.info('Conversation created successfully', { 
        conversationId: savedConversation._id,
        title: data.title
      });

      return savedConversation;
    } catch (error: any) {
      logger.error('Failed to create conversation', { 
        error: error.message,
        title: data.title,
        createdBy: data.createdBy
      });
      throw error;
    }
  }

  async getConversation(id: string, userId: string): Promise<IConversation | null> {
    try {
      const conversation = await Conversation.findById(id)
        .populate('participants.userId', 'username email firstName lastName avatar')
        .populate('createdBy', 'username firstName lastName')
        .populate('pinnedMessages');

      if (!conversation) return null;

      // Check if user is participant
      const isParticipant = conversation.participants.some(
        p => p.userId._id.toString() === userId && p.isActive
      );

      if (!isParticipant && conversation.visibility !== 'public') {
        throw new Error('Access denied');
      }

      // Update last seen
      if (isParticipant) {
        await conversation.updateLastSeen(new ObjectId(userId));
      }

      return conversation;
    } catch (error: any) {
      logger.error('Failed to get conversation', { 
        error: error.message,
        conversationId: id,
        userId
      });
      throw error;
    }
  }

  async getUserConversations(userId: string, options: any = {}): Promise<IConversation[]> {
    try {
      return await Conversation.findByParticipant(new ObjectId(userId), options);
    } catch (error: any) {
      logger.error('Failed to get user conversations', { 
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async addParticipant(
    conversationId: string,
    userId: string,
    newParticipantId: string,
    role: 'admin' | 'moderator' | 'member' = 'member'
  ): Promise<IConversation | null> {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Check permissions
      const userRole = conversation.getParticipantRole(new ObjectId(userId));
      if (!userRole || !['admin', 'moderator'].includes(userRole)) {
        throw new Error('Insufficient permissions to add participants');
      }

      await conversation.addParticipant(new ObjectId(newParticipantId), role);

      this.emit('participantAdded', {
        conversationId,
        newParticipantId,
        addedBy: userId,
        role
      });

      return conversation;
    } catch (error: any) {
      logger.error('Failed to add participant', { 
        error: error.message,
        conversationId,
        userId,
        newParticipantId
      });
      throw error;
    }
  }

  async removeParticipant(
    conversationId: string,
    userId: string,
    participantToRemove: string
  ): Promise<IConversation | null> {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Check permissions
      const userRole = conversation.getParticipantRole(new ObjectId(userId));
      if (!userRole || (userRole !== 'admin' && userId !== participantToRemove)) {
        throw new Error('Insufficient permissions to remove participants');
      }

      await conversation.removeParticipant(new ObjectId(participantToRemove));

      this.emit('participantRemoved', {
        conversationId,
        participantToRemove,
        removedBy: userId
      });

      return conversation;
    } catch (error: any) {
      logger.error('Failed to remove participant', { 
        error: error.message,
        conversationId,
        userId,
        participantToRemove
      });
      throw error;
    }
  }

  // Notification Management
  async createNotification(data: NotificationCreationData): Promise<INotification> {
    try {
      logger.info('Creating notification', { 
        recipient: data.recipient,
        type: data.type,
        title: data.title
      });

      const notificationData = {
        recipient: new ObjectId(data.recipient),
        sender: data.sender ? new ObjectId(data.sender) : undefined,
        type: data.type,
        title: data.title,
        content: data.content,
        data: {
          priority: data.priority || 'normal',
          category: 'general',
          actionRequired: false,
          ...data.data
        },
        channels: {
          inApp: { enabled: data.channels?.inApp !== false, delivered: false },
          email: { enabled: data.channels?.email === true, delivered: false },
          push: { enabled: data.channels?.push === true, delivered: false },
          sms: { enabled: data.channels?.sms === true, delivered: false }
        },
        scheduling: {
          scheduledFor: data.scheduledFor,
          isRecurring: false
        },
        status: 'pending',
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: data.expiresAt
        }
      };

      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();

      this.emit('notificationCreated', savedNotification);

      logger.info('Notification created', { notificationId: savedNotification._id });

      return savedNotification;
    } catch (error: any) {
      logger.error('Failed to create notification', { 
        error: error.message,
        recipient: data.recipient,
        type: data.type
      });
      throw error;
    }
  }

  async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: string;
      isRead?: boolean;
      priority?: string;
      since?: Date;
    } = {}
  ): Promise<{ notifications: INotification[]; total: number; unread: number }> {
    try {
      const notifications = await Notification.getByUser(new ObjectId(userId), options);
      const total = await Notification.countDocuments({ recipient: new ObjectId(userId) });
      const unread = await Notification.getUnreadCount(new ObjectId(userId));

      return { notifications, total, unread };
    } catch (error: any) {
      logger.error('Failed to get user notifications', { 
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return await notification.markAsRead();
    } catch (error: any) {
      logger.error('Failed to mark notification as read', { 
        error: error.message,
        notificationId,
        userId
      });
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      await Notification.markAllAsRead(new ObjectId(userId));
      
      this.emit('allNotificationsRead', { userId });
    } catch (error: any) {
      logger.error('Failed to mark all notifications as read', { 
        error: error.message,
        userId
      });
      throw error;
    }
  }

  // Real-time features
  async getConversationMessages(
    conversationId: string,
    userId: string,
    options: {
      page?: number;
      limit?: number;
      since?: Date;
      until?: Date;
      messageType?: string;
      search?: string;
    } = {}
  ): Promise<IMessage[]> {
    try {
      // Verify user is participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const isParticipant = conversation.participants.some(
        p => p.userId.toString() === userId && p.isActive
      );

      if (!isParticipant) {
        throw new Error('Access denied');
      }

      return await Message.getMessagesByConversation(new ObjectId(conversationId), options);
    } catch (error: any) {
      logger.error('Failed to get conversation messages', { 
        error: error.message,
        conversationId,
        userId
      });
      throw error;
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await Message.markConversationAsRead(new ObjectId(conversationId), new ObjectId(userId));
      
      this.emit('conversationRead', { conversationId, userId });
    } catch (error: any) {
      logger.error('Failed to mark conversation as read', { 
        error: error.message,
        conversationId,
        userId
      });
      throw error;
    }
  }

  async getUnreadMessageCount(userId: string, conversationId?: string): Promise<number> {
    try {
      return await Message.getUnreadCount(
        new ObjectId(userId),
        conversationId ? new ObjectId(conversationId) : undefined
      );
    } catch (error: any) {
      logger.error('Failed to get unread message count', { 
        error: error.message,
        userId,
        conversationId
      });
      throw error;
    }
  }

  // Utility methods
  private getDefaultPermissions(role: string, conversationType: string): any {
    const basePermissions = {
      canPost: true,
      canReact: true,
      canInvite: false,
      canRemove: false,
      canManage: false
    };

    if (role === 'admin') {
      return {
        ...basePermissions,
        canInvite: true,
        canRemove: true,
        canManage: true
      };
    }

    if (role === 'moderator') {
      return {
        ...basePermissions,
        canInvite: true
      };
    }

    return basePermissions;
  }

  private async createMessageNotifications(message: IMessage, conversation: IConversation): Promise<void> {
    try {
      const recipients = message.recipients.filter(r => r.userId.toString() !== message.sender.toString());
      
      for (const recipient of recipients) {
        const notificationData: NotificationCreationData = {
          recipient: recipient.userId.toString(),
          sender: message.sender.toString(),
          type: 'message',
          title: `New message in ${conversation.title}`,
          content: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
          data: {
            messageId: message._id,
            conversationId: conversation._id,
            priority: message.priority,
            url: `/conversations/${conversation._id}`,
            actionRequired: false
          },
          channels: {
            inApp: true,
            email: false, // Would check user preferences
            push: true
          }
        };

        await this.createNotification(notificationData);
      }
    } catch (error: any) {
      logger.error('Failed to create message notifications', { 
        error: error.message,
        messageId: message._id
      });
    }
  }

  // Event handlers
  private async handleMessageCreated(data: any): Promise<void> {
    // Handle real-time message broadcasting
    logger.debug('Message created event handled', { messageId: data.message._id });
  }

  private async handleConversationCreated(data: any): Promise<void> {
    // Handle conversation creation notifications
    logger.debug('Conversation created event handled', { conversationId: data.conversation._id });
  }

  private async handleNotificationCreated(notification: INotification): Promise<void> {
    // Handle notification delivery
    logger.debug('Notification created event handled', { notificationId: notification._id });
  }
}

export const communicationService = new CommunicationService();