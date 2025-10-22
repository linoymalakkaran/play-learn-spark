import express from 'express';
import { communicationController } from '../controllers/communicationController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Validation middleware
const messageValidation = [
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Message content must be between 1 and 10,000 characters'),
  
  body('conversationId')
    .notEmpty()
    .withMessage('Conversation ID is required')
    .isMongoId()
    .withMessage('Invalid conversation ID'),
  
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'audio', 'video', 'system', 'announcement'])
    .withMessage('Invalid message type'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid reply-to message ID'),
  
  body('mentions')
    .optional()
    .isArray()
    .withMessage('Mentions must be an array'),
  
  body('mentions.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID in mentions'),
  
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date format'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date format')
];

const conversationValidation = [
  body('title')
    .notEmpty()
    .withMessage('Conversation title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('type')
    .isIn(['direct', 'group', 'class', 'announcement', 'forum', 'support'])
    .withMessage('Invalid conversation type'),
  
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  
  body('participants.*.userId')
    .isMongoId()
    .withMessage('Invalid participant user ID'),
  
  body('participants.*.role')
    .optional()
    .isIn(['admin', 'moderator', 'member'])
    .withMessage('Invalid participant role'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
];

const notificationValidation = [
  body('recipient')
    .notEmpty()
    .withMessage('Recipient is required')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  
  body('type')
    .isIn(['message', 'assignment', 'announcement', 'reminder', 'achievement', 'system', 'deadline', 'grade', 'comment', 'mention'])
    .withMessage('Invalid notification type'),
  
  body('title')
    .notEmpty()
    .withMessage('Notification title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('content')
    .notEmpty()
    .withMessage('Notification content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date format'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date format')
];

const announcementValidation = [
  body('title')
    .notEmpty()
    .withMessage('Announcement title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('content')
    .notEmpty()
    .withMessage('Announcement content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  
  body('targetAudience')
    .isArray({ min: 1 })
    .withMessage('Target audience is required'),
  
  body('targetAudience.*')
    .isMongoId()
    .withMessage('Invalid user ID in target audience'),
  
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiration date format')
];

const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Message Routes
router.post('/messages',
  authenticateToken,
  messageValidation,
  communicationController.createMessage
);

router.get('/messages/:id',
  authenticateToken,
  mongoIdValidation,
  communicationController.getMessage
);

router.put('/messages/:id',
  authenticateToken,
  mongoIdValidation,
  [
    body('content')
      .notEmpty()
      .withMessage('Message content is required')
      .isLength({ min: 1, max: 10000 })
      .withMessage('Message content must be between 1 and 10,000 characters')
  ],
  communicationController.editMessage
);

router.delete('/messages/:id',
  authenticateToken,
  mongoIdValidation,
  communicationController.deleteMessage
);

router.post('/messages/:id/reactions',
  authenticateToken,
  mongoIdValidation,
  [
    body('emoji')
      .notEmpty()
      .withMessage('Emoji is required')
      .isLength({ min: 1, max: 10 })
      .withMessage('Emoji must be between 1 and 10 characters')
  ],
  communicationController.addReaction
);

router.delete('/messages/:id/reactions',
  authenticateToken,
  mongoIdValidation,
  communicationController.removeReaction
);

// Conversation Routes
router.post('/conversations',
  authenticateToken,
  conversationValidation,
  communicationController.createConversation
);

router.get('/conversations',
  authenticateToken,
  [
    query('type')
      .optional()
      .isIn(['direct', 'group', 'class', 'announcement', 'forum', 'support'])
      .withMessage('Invalid conversation type'),
    
    query('status')
      .optional()
      .isIn(['active', 'archived', 'deleted', 'locked'])
      .withMessage('Invalid conversation status')
  ],
  communicationController.getUserConversations
);

router.get('/conversations/:id',
  authenticateToken,
  mongoIdValidation,
  communicationController.getConversation
);

router.get('/conversations/:id/messages',
  authenticateToken,
  mongoIdValidation,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('since')
      .optional()
      .isISO8601()
      .withMessage('Invalid since date format'),
    
    query('until')
      .optional()
      .isISO8601()
      .withMessage('Invalid until date format'),
    
    query('messageType')
      .optional()
      .isIn(['text', 'image', 'file', 'audio', 'video', 'system', 'announcement'])
      .withMessage('Invalid message type'),
    
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters')
  ],
  communicationController.getConversationMessages
);

router.post('/conversations/:id/participants',
  authenticateToken,
  mongoIdValidation,
  [
    body('userId')
      .notEmpty()
      .withMessage('User ID is required')
      .isMongoId()
      .withMessage('Invalid user ID'),
    
    body('role')
      .optional()
      .isIn(['admin', 'moderator', 'member'])
      .withMessage('Invalid role')
  ],
  communicationController.addParticipant
);

router.delete('/conversations/:id/participants/:participantId',
  authenticateToken,
  [
    param('id').isMongoId().withMessage('Invalid conversation ID'),
    param('participantId').isMongoId().withMessage('Invalid participant ID')
  ],
  communicationController.removeParticipant
);

router.patch('/conversations/:id/read',
  authenticateToken,
  mongoIdValidation,
  communicationController.markConversationAsRead
);

// Notification Routes
router.post('/notifications',
  authenticateToken,
  notificationValidation,
  communicationController.createNotification
);

router.get('/notifications',
  authenticateToken,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('type')
      .optional()
      .isIn(['message', 'assignment', 'announcement', 'reminder', 'achievement', 'system', 'deadline', 'grade', 'comment', 'mention'])
      .withMessage('Invalid notification type'),
    
    query('isRead')
      .optional()
      .isBoolean()
      .withMessage('isRead must be a boolean'),
    
    query('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Invalid priority level'),
    
    query('since')
      .optional()
      .isISO8601()
      .withMessage('Invalid since date format')
  ],
  communicationController.getUserNotifications
);

router.patch('/notifications/:id/read',
  authenticateToken,
  mongoIdValidation,
  communicationController.markNotificationAsRead
);

router.patch('/notifications/read-all',
  authenticateToken,
  communicationController.markAllNotificationsAsRead
);

// Utility Routes
router.get('/unread-counts',
  authenticateToken,
  [
    query('conversationId')
      .optional()
      .isMongoId()
      .withMessage('Invalid conversation ID')
  ],
  communicationController.getUnreadCounts
);

// Announcement Routes
router.post('/announcements',
  authenticateToken,
  announcementValidation,
  communicationController.createAnnouncement
);

// Real-time status endpoints (would be enhanced with WebSocket)
router.get('/status/online-users',
  authenticateToken,
  async (req: Request, res: Response) => {
    // This would integrate with WebSocket service to get online users
    res.json({
      success: true,
      data: {
        onlineUsers: [],
        totalOnline: 0,
        message: 'Real-time status tracking - to be implemented with WebSocket service'
      }
    });
  }
);

router.get('/status/typing',
  authenticateToken,
  [
    query('conversationId')
      .notEmpty()
      .withMessage('Conversation ID is required')
      .isMongoId()
      .withMessage('Invalid conversation ID')
  ],
  async (req: Request, res: Response) => {
    // This would integrate with WebSocket service to get typing indicators
    res.json({
      success: true,
      data: {
        typingUsers: [],
        conversationId: req.query.conversationId,
        message: 'Typing indicators - to be implemented with WebSocket service'
      }
    });
  }
);

// File upload endpoints (would integrate with file upload service)
router.post('/upload/attachments',
  authenticateToken,
  async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        message: 'File upload for message attachments - to be implemented with file upload service',
        supportedTypes: ['image', 'document', 'audio', 'video'],
        maxSize: '10MB'
      }
    });
  }
);

// Video chat integration endpoints
router.post('/video-chat/create-room',
  authenticateToken,
  [
    body('conversationId')
      .notEmpty()
      .withMessage('Conversation ID is required')
      .isMongoId()
      .withMessage('Invalid conversation ID'),
    
    body('participants')
      .optional()
      .isArray()
      .withMessage('Participants must be an array')
  ],
  async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        message: 'Video chat room creation - to be implemented with video service integration',
        roomId: 'placeholder-room-id',
        joinUrl: 'https://placeholder-video-service.com/room/placeholder-room-id'
      }
    });
  }
);

router.post('/video-chat/:roomId/join',
  authenticateToken,
  [
    param('roomId')
      .notEmpty()
      .withMessage('Room ID is required')
  ],
  async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        message: 'Video chat room join - to be implemented with video service integration',
        roomId: req.params.roomId,
        accessToken: 'placeholder-access-token'
      }
    });
  }
);

export default router;