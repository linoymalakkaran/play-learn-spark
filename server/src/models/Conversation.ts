import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IConversation extends Document {
  _id: ObjectId;
  title: string;
  description?: string;
  type: 'direct' | 'group' | 'class' | 'announcement' | 'forum' | 'support';
  participants: Array<{
    userId: ObjectId;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: Date;
    lastSeenAt?: Date;
    isActive: boolean;
    permissions: {
      canInvite: boolean;
      canRemove: boolean;
      canManage: boolean;
      canPost: boolean;
      canReact: boolean;
    };
  }>;
  settings: {
    isPublic: boolean;
    allowInvites: boolean;
    requireApproval: boolean;
    muteNotifications: boolean;
    autoDeleteMessages: boolean;
    autoDeleteAfterDays?: number;
    allowFileSharing: boolean;
    allowReactions: boolean;
    allowEditing: boolean;
    allowMentions: boolean;
    maxParticipants?: number;
    messageRetentionDays?: number;
  };
  metadata: {
    classId?: ObjectId;
    assignmentId?: ObjectId;
    activityId?: ObjectId;
    courseId?: ObjectId;
    topicTags: string[];
    category: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
  };
  statistics: {
    totalMessages: number;
    totalParticipants: number;
    activeParticipants: number;
    lastMessageAt?: Date;
    lastMessageBy?: ObjectId;
    messagesThisWeek: number;
    messagesThisMonth: number;
    averageResponseTime: number; // in minutes
  };
  moderation: {
    isModerated: boolean;
    moderators: ObjectId[];
    bannedUsers: Array<{
      userId: ObjectId;
      bannedBy: ObjectId;
      bannedAt: Date;
      reason: string;
      expiresAt?: Date;
    }>;
    mutedUsers: Array<{
      userId: ObjectId;
      mutedBy: ObjectId;
      mutedAt: Date;
      expiresAt?: Date;
    }>;
    flaggedMessages: number;
    autoModeration: {
      enabled: boolean;
      rules: Array<{
        type: 'profanity' | 'spam' | 'caps' | 'links';
        action: 'warn' | 'delete' | 'mute';
        threshold?: number;
      }>;
    };
  };
  status: 'active' | 'archived' | 'deleted' | 'locked';
  visibility: 'public' | 'private' | 'restricted';
  createdBy: ObjectId;
  pinnedMessages: ObjectId[];
  lastActivity: {
    timestamp: Date;
    type: 'message' | 'join' | 'leave' | 'edit' | 'delete';
    userId: ObjectId;
  };
  integrations: {
    videoChat: {
      enabled: boolean;
      provider?: string;
      roomId?: string;
      activeCall?: {
        startedAt: Date;
        participants: ObjectId[];
      };
    };
    calendar: {
      enabled: boolean;
      events: Array<{
        eventId: string;
        title: string;
        startTime: Date;
        endTime: Date;
      }>;
    };
    fileSharing: {
      enabled: boolean;
      sharedFiles: Array<{
        fileId: string;
        fileName: string;
        uploadedBy: ObjectId;
        uploadedAt: Date;
        size: number;
      }>;
    };
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt?: Date;
    archivedAt?: Date;
  };
}

const ConversationSchema = new Schema<IConversation>({
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'class', 'announcement', 'forum', 'support'],
    required: true,
    index: true
  },
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    permissions: {
      canInvite: { type: Boolean, default: false },
      canRemove: { type: Boolean, default: false },
      canManage: { type: Boolean, default: false },
      canPost: { type: Boolean, default: true },
      canReact: { type: Boolean, default: true }
    }
  }],
  settings: {
    isPublic: { type: Boolean, default: false },
    allowInvites: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    muteNotifications: { type: Boolean, default: false },
    autoDeleteMessages: { type: Boolean, default: false },
    autoDeleteAfterDays: { type: Number, min: 1, max: 365 },
    allowFileSharing: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true },
    allowEditing: { type: Boolean, default: true },
    allowMentions: { type: Boolean, default: true },
    maxParticipants: { type: Number, min: 2, max: 1000 },
    messageRetentionDays: { type: Number, min: 1, max: 3650 }
  },
  metadata: {
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity' },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    topicTags: [{ type: String, maxlength: 50 }],
    category: { type: String, default: 'general', maxlength: 100 },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    }
  },
  statistics: {
    totalMessages: { type: Number, default: 0 },
    totalParticipants: { type: Number, default: 0 },
    activeParticipants: { type: Number, default: 0 },
    lastMessageAt: { type: Date },
    lastMessageBy: { type: Schema.Types.ObjectId, ref: 'User' },
    messagesThisWeek: { type: Number, default: 0 },
    messagesThisMonth: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }
  },
  moderation: {
    isModerated: { type: Boolean, default: false },
    moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    bannedUsers: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      bannedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      bannedAt: { type: Date, default: Date.now },
      reason: { type: String, required: true },
      expiresAt: { type: Date }
    }],
    mutedUsers: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      mutedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      mutedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date }
    }],
    flaggedMessages: { type: Number, default: 0 },
    autoModeration: {
      enabled: { type: Boolean, default: false },
      rules: [{
        type: {
          type: String,
          enum: ['profanity', 'spam', 'caps', 'links'],
          required: true
        },
        action: {
          type: String,
          enum: ['warn', 'delete', 'mute'],
          required: true
        },
        threshold: { type: Number, min: 1, max: 100 }
      }]
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted', 'locked'],
    default: 'active',
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'restricted'],
    default: 'private',
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  pinnedMessages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastActivity: {
    timestamp: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['message', 'join', 'leave', 'edit', 'delete'],
      default: 'message'
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  integrations: {
    videoChat: {
      enabled: { type: Boolean, default: false },
      provider: { type: String },
      roomId: { type: String },
      activeCall: {
        startedAt: { type: Date },
        participants: [{ type: Schema.Types.ObjectId, ref: 'User' }]
      }
    },
    calendar: {
      enabled: { type: Boolean, default: false },
      events: [{
        eventId: { type: String, required: true },
        title: { type: String, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true }
      }]
    },
    fileSharing: {
      enabled: { type: Boolean, default: true },
      sharedFiles: [{
        fileId: { type: String, required: true },
        fileName: { type: String, required: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        uploadedAt: { type: Date, default: Date.now },
        size: { type: Number, required: true }
      }]
    }
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, index: true },
    archivedAt: { type: Date }
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Indexes for better query performance
ConversationSchema.index({ 'participants.userId': 1, status: 1 });
ConversationSchema.index({ type: 1, status: 1, visibility: 1 });
ConversationSchema.index({ 'metadata.classId': 1 });
ConversationSchema.index({ 'metadata.assignmentId': 1 });
ConversationSchema.index({ createdBy: 1, 'timestamps.createdAt': -1 });
ConversationSchema.index({ 'timestamps.lastMessageAt': -1 });
ConversationSchema.index({ 'metadata.topicTags': 1 });

// Instance methods
ConversationSchema.methods.addParticipant = function(
  userId: ObjectId,
  role: 'admin' | 'moderator' | 'member' = 'member',
  permissions?: any
): Promise<IConversation> {
  // Check if user is already a participant
  const existingParticipant = this.participants.find(
    (p: any) => p.userId.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    if (!existingParticipant.isActive) {
      existingParticipant.isActive = true;
      existingParticipant.joinedAt = new Date();
    }
    return this.save();
  }

  // Check max participants limit
  if (this.settings.maxParticipants && this.participants.length >= this.settings.maxParticipants) {
    throw new Error('Maximum participants limit reached');
  }

  const defaultPermissions = {
    canInvite: role === 'admin' || role === 'moderator',
    canRemove: role === 'admin',
    canManage: role === 'admin',
    canPost: true,
    canReact: true
  };

  this.participants.push({
    userId,
    role,
    joinedAt: new Date(),
    lastSeenAt: new Date(),
    isActive: true,
    permissions: { ...defaultPermissions, ...permissions }
  });

  this.statistics.totalParticipants = this.participants.filter((p: any) => p.isActive).length;
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

ConversationSchema.methods.removeParticipant = function(userId: ObjectId): Promise<IConversation> {
  const participantIndex = this.participants.findIndex(
    (p: any) => p.userId.toString() === userId.toString()
  );
  
  if (participantIndex > -1) {
    this.participants[participantIndex].isActive = false;
    this.statistics.totalParticipants = this.participants.filter((p: any) => p.isActive).length;
    this.timestamps.updatedAt = new Date();
  }
  
  return this.save();
};

ConversationSchema.methods.updateParticipantRole = function(
  userId: ObjectId,
  newRole: 'admin' | 'moderator' | 'member'
): Promise<IConversation> {
  const participant = this.participants.find(
    (p: any) => p.userId.toString() === userId.toString() && p.isActive
  );
  
  if (participant) {
    participant.role = newRole;
    
    // Update permissions based on role
    if (newRole === 'admin') {
      Object.assign(participant.permissions, {
        canInvite: true,
        canRemove: true,
        canManage: true,
        canPost: true,
        canReact: true
      });
    } else if (newRole === 'moderator') {
      Object.assign(participant.permissions, {
        canInvite: true,
        canRemove: false,
        canManage: false,
        canPost: true,
        canReact: true
      });
    }
    
    this.timestamps.updatedAt = new Date();
  }
  
  return this.save();
};

ConversationSchema.methods.updateLastSeen = function(userId: ObjectId): Promise<IConversation> {
  const participant = this.participants.find(
    (p: any) => p.userId.toString() === userId.toString() && p.isActive
  );
  
  if (participant) {
    participant.lastSeenAt = new Date();
    this.timestamps.updatedAt = new Date();
  }
  
  return this.save();
};

ConversationSchema.methods.pinMessage = function(messageId: ObjectId): Promise<IConversation> {
  if (!this.pinnedMessages.includes(messageId)) {
    this.pinnedMessages.push(messageId);
    this.timestamps.updatedAt = new Date();
  }
  
  return this.save();
};

ConversationSchema.methods.unpinMessage = function(messageId: ObjectId): Promise<IConversation> {
  this.pinnedMessages = this.pinnedMessages.filter(
    (id: any) => id.toString() !== messageId.toString()
  );
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

ConversationSchema.methods.banUser = function(
  userId: ObjectId,
  bannedBy: ObjectId,
  reason: string,
  expiresAt?: Date
): Promise<IConversation> {
  // Remove from participants
  this.removeParticipant(userId);
  
  // Add to banned list
  const existingBan = this.moderation.bannedUsers.find(
    (b: any) => b.userId.toString() === userId.toString()
  );
  
  if (!existingBan) {
    this.moderation.bannedUsers.push({
      userId,
      bannedBy,
      bannedAt: new Date(),
      reason,
      expiresAt
    });
  }
  
  return this.save();
};

ConversationSchema.methods.unbanUser = function(userId: ObjectId): Promise<IConversation> {
  this.moderation.bannedUsers = this.moderation.bannedUsers.filter(
    (b: any) => b.userId.toString() !== userId.toString()
  );
  
  return this.save();
};

ConversationSchema.methods.muteUser = function(
  userId: ObjectId,
  mutedBy: ObjectId,
  expiresAt?: Date
): Promise<IConversation> {
  const existingMute = this.moderation.mutedUsers.find(
    (m: any) => m.userId.toString() === userId.toString()
  );
  
  if (!existingMute) {
    this.moderation.mutedUsers.push({
      userId,
      mutedBy,
      mutedAt: new Date(),
      expiresAt
    });
  }
  
  return this.save();
};

ConversationSchema.methods.unmuteUser = function(userId: ObjectId): Promise<IConversation> {
  this.moderation.mutedUsers = this.moderation.mutedUsers.filter(
    (m: any) => m.userId.toString() !== userId.toString()
  );
  
  return this.save();
};

ConversationSchema.methods.isUserBanned = function(userId: ObjectId): boolean {
  const ban = this.moderation.bannedUsers.find(
    (b: any) => b.userId.toString() === userId.toString()
  );
  
  if (!ban) return false;
  if (!ban.expiresAt) return true;
  
  return ban.expiresAt > new Date();
};

ConversationSchema.methods.isUserMuted = function(userId: ObjectId): boolean {
  const mute = this.moderation.mutedUsers.find(
    (m: any) => m.userId.toString() === userId.toString()
  );
  
  if (!mute) return false;
  if (!mute.expiresAt) return true;
  
  return mute.expiresAt > new Date();
};

ConversationSchema.methods.canUserPost = function(userId: ObjectId): boolean {
  if (this.isUserBanned(userId) || this.isUserMuted(userId)) return false;
  
  const participant = this.participants.find(
    (p: any) => p.userId.toString() === userId.toString() && p.isActive
  );
  
  return participant ? participant.permissions.canPost : false;
};

ConversationSchema.methods.getActiveParticipants = function(): any[] {
  return this.participants.filter((p: any) => p.isActive);
};

ConversationSchema.methods.getParticipantRole = function(userId: ObjectId): string | null {
  const participant = this.participants.find(
    (p: any) => p.userId.toString() === userId.toString() && p.isActive
  );
  
  return participant ? participant.role : null;
};

ConversationSchema.methods.updateStatistics = function(messageData?: any): Promise<IConversation> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  this.statistics.totalParticipants = this.participants.filter((p: any) => p.isActive).length;
  this.statistics.activeParticipants = this.participants.filter(
    (p: any) => p.isActive && p.lastSeenAt && p.lastSeenAt > oneWeekAgo
  ).length;

  if (messageData) {
    this.statistics.totalMessages++;
    this.statistics.lastMessageAt = now;
    this.statistics.lastMessageBy = messageData.senderId;
    
    // These would typically be calculated from actual message queries
    // For now, we'll increment counters
    if (messageData.createdAt > oneWeekAgo) {
      this.statistics.messagesThisWeek++;
    }
    if (messageData.createdAt > oneMonthAgo) {
      this.statistics.messagesThisMonth++;
    }
  }

  this.timestamps.updatedAt = now;
  
  return this.save();
};

// Static methods
ConversationSchema.statics.findByParticipant = function(userId: ObjectId, options: any = {}) {
  const query: any = {
    'participants.userId': userId,
    'participants.isActive': true,
    status: { $ne: 'deleted' }
  };

  if (options.type) query.type = options.type;
  if (options.status) query.status = options.status;

  return this.find(query)
    .populate('participants.userId', 'username email firstName lastName avatar')
    .populate('lastActivity.userId', 'username firstName lastName')
    .sort({ 'timestamps.lastMessageAt': -1 });
};

ConversationSchema.statics.findPublicConversations = function(options: any = {}) {
  const query: any = {
    visibility: 'public',
    status: 'active'
  };

  if (options.type) query.type = options.type;
  if (options.category) query['metadata.category'] = options.category;
  if (options.tags) query['metadata.topicTags'] = { $in: options.tags };

  return this.find(query)
    .populate('createdBy', 'username firstName lastName')
    .sort({ 'statistics.totalMessages': -1, 'timestamps.createdAt': -1 });
};

ConversationSchema.statics.createDirectConversation = function(user1Id: ObjectId, user2Id: ObjectId) {
  // Check if direct conversation already exists
  return this.findOne({
    type: 'direct',
    'participants.userId': { $all: [user1Id, user2Id] },
    'participants': { $size: 2 }
  }).then((existing: any) => {
    if (existing) return existing;

    // Create new direct conversation
    const conversation = new this({
      title: 'Direct Message',
      type: 'direct',
      participants: [
        {
          userId: user1Id,
          role: 'member',
          permissions: {
            canInvite: false,
            canRemove: false,
            canManage: false,
            canPost: true,
            canReact: true
          }
        },
        {
          userId: user2Id,
          role: 'member',
          permissions: {
            canInvite: false,
            canRemove: false,
            canManage: false,
            canPost: true,
            canReact: true
          }
        }
      ],
      createdBy: user1Id,
      settings: {
        isPublic: false,
        allowInvites: false,
        requireApproval: false,
        maxParticipants: 2
      }
    });

    return conversation.save();
  });
};

ConversationSchema.statics.cleanupExpiredBansAndMutes = function() {
  const now = new Date();
  
  return this.updateMany(
    {
      $or: [
        { 'moderation.bannedUsers.expiresAt': { $lte: now } },
        { 'moderation.mutedUsers.expiresAt': { $lte: now } }
      ]
    },
    {
      $pull: {
        'moderation.bannedUsers': { expiresAt: { $lte: now } },
        'moderation.mutedUsers': { expiresAt: { $lte: now } }
      }
    }
  );
};

// Pre-save middleware
ConversationSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  
  // Update statistics
  this.statistics.totalParticipants = this.participants.filter(p => p.isActive).length;
  
  next();
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);