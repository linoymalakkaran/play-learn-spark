import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IMessage extends Document {
  _id: ObjectId;
  content: string;
  sender: ObjectId;
  recipients: Array<{
    userId: ObjectId;
    readAt?: Date;
    deliveredAt?: Date;
  }>;
  conversation: ObjectId;
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system' | 'announcement';
  metadata: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    duration?: number; // for audio/video
    dimensions?: { width: number; height: number }; // for images
    thumbnail?: string;
    originalFileName?: string;
  };
  attachments: Array<{
    type: 'file' | 'image' | 'audio' | 'video' | 'document';
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  }>;
  reactions: Array<{
    userId: ObjectId;
    emoji: string;
    timestamp: Date;
  }>;
  replyTo?: ObjectId; // Reference to another message
  mentions: ObjectId[]; // Users mentioned in the message
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'deleted';
  editHistory: Array<{
    previousContent: string;
    editedAt: Date;
    editedBy: ObjectId;
  }>;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: ObjectId;
  scheduledFor?: Date; // For scheduled messages
  expiresAt?: Date; // For temporary messages
  flags: Array<{
    type: 'inappropriate' | 'spam' | 'harassment' | 'urgent';
    flaggedBy: ObjectId;
    flaggedAt: Date;
    reason?: string;
  }>;
  analytics: {
    readByCount: number;
    reactionCount: number;
    replyCount: number;
    shareCount: number;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    sentAt: Date;
    lastReadAt?: Date;
  };
}

const MessageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
    maxlength: [10000, 'Message content cannot exceed 10,000 characters'],
    trim: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recipients: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video', 'system', 'announcement'],
    default: 'text',
    index: true
  },
  metadata: {
    fileName: String,
    fileSize: Number,
    fileType: String,
    duration: Number,
    dimensions: {
      width: Number,
      height: Number
    },
    thumbnail: String,
    originalFileName: String
  },
  attachments: [{
    type: {
      type: String,
      enum: ['file', 'image', 'audio', 'video', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true,
      maxlength: 10
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'deleted'],
    default: 'sent',
    index: true
  },
  editHistory: [{
    previousContent: {
      type: String,
      required: true
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  scheduledFor: {
    type: Date,
    default: null,
    index: true
  },
  expiresAt: {
    type: Date,
    default: null,
    index: true
  },
  flags: [{
    type: {
      type: String,
      enum: ['inappropriate', 'spam', 'harassment', 'urgent'],
      required: true
    },
    flaggedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  analytics: {
    readByCount: {
      type: Number,
      default: 0
    },
    reactionCount: {
      type: Number,
      default: 0
    },
    replyCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    }
  },
  timestamps: {
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastReadAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Indexes for better query performance
MessageSchema.index({ conversation: 1, 'timestamps.createdAt': -1 });
MessageSchema.index({ sender: 1, 'timestamps.createdAt': -1 });
MessageSchema.index({ 'recipients.userId': 1, 'recipients.readAt': 1 });
MessageSchema.index({ mentions: 1 });
MessageSchema.index({ messageType: 1, status: 1 });
MessageSchema.index({ scheduledFor: 1, status: 1 });
MessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance methods
MessageSchema.methods.markAsRead = function(userId: ObjectId): Promise<IMessage> {
  const recipient = this.recipients.find((r: any) => r.userId.toString() === userId.toString());
  if (recipient && !recipient.readAt) {
    recipient.readAt = new Date();
    this.analytics.readByCount++;
    this.timestamps.lastReadAt = new Date();
    this.timestamps.updatedAt = new Date();
  }
  return this.save();
};

MessageSchema.methods.addReaction = function(userId: ObjectId, emoji: string): Promise<IMessage> {
  // Remove existing reaction from this user for this message
  this.reactions = this.reactions.filter((r: any) => r.userId.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    userId,
    emoji,
    timestamp: new Date()
  });
  
  this.analytics.reactionCount = this.reactions.length;
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

MessageSchema.methods.removeReaction = function(userId: ObjectId): Promise<IMessage> {
  this.reactions = this.reactions.filter((r: any) => r.userId.toString() !== userId.toString());
  this.analytics.reactionCount = this.reactions.length;
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

MessageSchema.methods.editContent = function(newContent: string, editedBy: ObjectId): Promise<IMessage> {
  // Save edit history
  this.editHistory.push({
    previousContent: this.content,
    editedAt: new Date(),
    editedBy
  });
  
  this.content = newContent;
  this.isEdited = true;
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

MessageSchema.methods.softDelete = function(deletedBy: ObjectId): Promise<IMessage> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.status = 'deleted';
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

MessageSchema.methods.addFlag = function(
  type: 'inappropriate' | 'spam' | 'harassment' | 'urgent',
  flaggedBy: ObjectId,
  reason?: string
): Promise<IMessage> {
  // Check if already flagged by this user
  const existingFlag = this.flags.find(
    (f: any) => f.flaggedBy.toString() === flaggedBy.toString() && f.type === type
  );
  
  if (!existingFlag) {
    this.flags.push({
      type,
      flaggedBy,
      flaggedAt: new Date(),
      reason
    });
    this.timestamps.updatedAt = new Date();
  }
  
  return this.save();
};

MessageSchema.methods.getReadStatus = function(): any {
  const totalRecipients = this.recipients.length;
  const readCount = this.recipients.filter((r: any) => r.readAt).length;
  const deliveredCount = this.recipients.filter((r: any) => r.deliveredAt).length;
  
  return {
    total: totalRecipients,
    delivered: deliveredCount,
    read: readCount,
    unread: totalRecipients - readCount,
    readPercentage: totalRecipients > 0 ? (readCount / totalRecipients) * 100 : 0
  };
};

MessageSchema.methods.getMentionedUsers = function(): ObjectId[] {
  return this.mentions;
};

MessageSchema.methods.isReadBy = function(userId: ObjectId): boolean {
  const recipient = this.recipients.find((r: any) => r.userId.toString() === userId.toString());
  return recipient ? !!recipient.readAt : false;
};

MessageSchema.methods.canEdit = function(userId: ObjectId, timeLimit: number = 300000): boolean {
  // Can edit if sender and within time limit (default 5 minutes)
  if (this.sender.toString() !== userId.toString()) return false;
  if (this.isDeleted) return false;
  
  const timeDiff = Date.now() - this.timestamps.createdAt.getTime();
  return timeDiff < timeLimit;
};

MessageSchema.methods.canDelete = function(userId: ObjectId, userRole: string): boolean {
  // Sender can delete their own messages
  if (this.sender.toString() === userId.toString()) return true;
  
  // Admins and moderators can delete any message
  if (['admin', 'moderator'].includes(userRole)) return true;
  
  return false;
};

// Static methods
MessageSchema.statics.getUnreadCount = function(userId: ObjectId, conversationId?: ObjectId) {
  const query: any = {
    'recipients.userId': userId,
    'recipients.readAt': null,
    isDeleted: false
  };
  
  if (conversationId) {
    query.conversation = conversationId;
  }
  
  return this.countDocuments(query);
};

MessageSchema.statics.markConversationAsRead = function(conversationId: ObjectId, userId: ObjectId) {
  return this.updateMany(
    {
      conversation: conversationId,
      'recipients.userId': userId,
      'recipients.readAt': null
    },
    {
      $set: {
        'recipients.$.readAt': new Date(),
        'timestamps.updatedAt': new Date()
      },
      $inc: { 'analytics.readByCount': 1 }
    }
  );
};

MessageSchema.statics.getMessagesByConversation = function(
  conversationId: ObjectId,
  options: {
    page?: number;
    limit?: number;
    since?: Date;
    until?: Date;
    messageType?: string;
    search?: string;
  } = {}
) {
  const {
    page = 1,
    limit = 50,
    since,
    until,
    messageType,
    search
  } = options;

  const query: any = {
    conversation: conversationId,
    isDeleted: false
  };

  if (since || until) {
    query['timestamps.createdAt'] = {};
    if (since) query['timestamps.createdAt'].$gte = since;
    if (until) query['timestamps.createdAt'].$lte = until;
  }

  if (messageType) {
    query.messageType = messageType;
  }

  if (search) {
    query.content = { $regex: search, $options: 'i' };
  }

  return this.find(query)
    .populate('sender', 'username email firstName lastName avatar')
    .populate('replyTo', 'content sender messageType')
    .populate('mentions', 'username firstName lastName')
    .sort({ 'timestamps.createdAt': -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

MessageSchema.statics.getScheduledMessages = function() {
  return this.find({
    scheduledFor: { $lte: new Date() },
    status: 'sent'
  });
};

MessageSchema.statics.cleanupExpiredMessages = function() {
  return this.deleteMany({
    expiresAt: { $lte: new Date() }
  });
};

// Pre-save middleware
MessageSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  
  // Extract mentions from content
  const mentionRegex = /@(\w+)/g;
  const mentions = this.content.match(mentionRegex);
  if (mentions) {
    // This would need to be resolved to actual user IDs in the service layer
    // For now, we'll just note that mentions were found
  }
  
  // Update analytics
  this.analytics.reactionCount = this.reactions.length;
  
  next();
});

// Post-save middleware for real-time notifications
MessageSchema.post('save', function(doc) {
  // Emit socket event for real-time updates
  // This would be handled by the socket service
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);