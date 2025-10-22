import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface INotification extends Document {
  _id: ObjectId;
  recipient: ObjectId;
  sender?: ObjectId;
  type: 'message' | 'assignment' | 'announcement' | 'reminder' | 'achievement' | 'system' | 'deadline' | 'grade' | 'comment' | 'mention';
  title: string;
  content: string;
  data: {
    messageId?: ObjectId;
    conversationId?: ObjectId;
    assignmentId?: ObjectId;
    activityId?: ObjectId;
    achievementId?: ObjectId;
    gradeId?: ObjectId;
    url?: string;
    actionRequired?: boolean;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category: string;
    metadata?: any;
  };
  channels: {
    inApp: {
      enabled: boolean;
      delivered: boolean;
      deliveredAt?: Date;
    };
    email: {
      enabled: boolean;
      delivered: boolean;
      deliveredAt?: Date;
      emailId?: string;
    };
    push: {
      enabled: boolean;
      delivered: boolean;
      deliveredAt?: Date;
      pushId?: string;
    };
    sms: {
      enabled: boolean;
      delivered: boolean;
      deliveredAt?: Date;
      smsId?: string;
    };
  };
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
  isRead: boolean;
  readAt?: Date;
  actions: Array<{
    type: 'button' | 'link' | 'form';
    label: string;
    url?: string;
    action?: string;
    data?: any;
    style: 'primary' | 'secondary' | 'danger' | 'success';
  }>;
  scheduling: {
    scheduledFor?: Date;
    isRecurring: boolean;
    recurringPattern?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      daysOfWeek?: number[];
      endDate?: Date;
    };
    timezone?: string;
  };
  targeting: {
    userGroups?: string[];
    userRoles?: string[];
    classIds?: ObjectId[];
    conditions?: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater' | 'less';
      value: any;
    }>;
  };
  analytics: {
    impressions: number;
    clicks: number;
    clickRate: number;
    engagementScore: number;
    timeToRead?: number; // in seconds
  };
  template: {
    templateId?: string;
    variables?: { [key: string]: any };
    personalized: boolean;
  };
  delivery: {
    attempts: number;
    maxAttempts: number;
    retryAfter?: Date;
    failures: Array<{
      channel: 'inApp' | 'email' | 'push' | 'sms';
      error: string;
      timestamp: Date;
    }>;
  };
  preferences: {
    respectUserSettings: boolean;
    allowOptOut: boolean;
    requireConfirmation: boolean;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    sentAt?: Date;
    expiresAt?: Date;
  };
}

const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  type: {
    type: String,
    enum: ['message', 'assignment', 'announcement', 'reminder', 'achievement', 'system', 'deadline', 'grade', 'comment', 'mention'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    trim: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters'],
    trim: true
  },
  data: {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity' },
    achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement' },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade' },
    url: { type: String, maxlength: 500 },
    actionRequired: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
      index: true
    },
    category: { type: String, default: 'general', maxlength: 100 },
    metadata: { type: Schema.Types.Mixed }
  },
  channels: {
    inApp: {
      enabled: { type: Boolean, default: true },
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date }
    },
    email: {
      enabled: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date },
      emailId: { type: String }
    },
    push: {
      enabled: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date },
      pushId: { type: String }
    },
    sms: {
      enabled: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      deliveredAt: { type: Date },
      smsId: { type: String }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    index: true
  },
  actions: [{
    type: {
      type: String,
      enum: ['button', 'link', 'form'],
      required: true
    },
    label: {
      type: String,
      required: true,
      maxlength: 100
    },
    url: { type: String, maxlength: 500 },
    action: { type: String, maxlength: 100 },
    data: { type: Schema.Types.Mixed },
    style: {
      type: String,
      enum: ['primary', 'secondary', 'danger', 'success'],
      default: 'primary'
    }
  }],
  scheduling: {
    scheduledFor: { type: Date, index: true },
    isRecurring: { type: Boolean, default: false },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
      },
      interval: { type: Number, min: 1, max: 365 },
      daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0 = Sunday
      endDate: { type: Date }
    },
    timezone: { type: String, default: 'UTC' }
  },
  targeting: {
    userGroups: [{ type: String, maxlength: 100 }],
    userRoles: [{ type: String, maxlength: 50 }],
    classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    conditions: [{
      field: { type: String, required: true },
      operator: {
        type: String,
        enum: ['equals', 'contains', 'greater', 'less'],
        required: true
      },
      value: { type: Schema.Types.Mixed, required: true }
    }]
  },
  analytics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    clickRate: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    timeToRead: { type: Number } // in seconds
  },
  template: {
    templateId: { type: String, maxlength: 100 },
    variables: { type: Schema.Types.Mixed },
    personalized: { type: Boolean, default: false }
  },
  delivery: {
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    retryAfter: { type: Date },
    failures: [{
      channel: {
        type: String,
        enum: ['inApp', 'email', 'push', 'sms'],
        required: true
      },
      error: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  preferences: {
    respectUserSettings: { type: Boolean, default: true },
    allowOptOut: { type: Boolean, default: true },
    requireConfirmation: { type: Boolean, default: false }
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    sentAt: { type: Date },
    expiresAt: { type: Date, index: true }
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Indexes for better query performance
NotificationSchema.index({ recipient: 1, isRead: 1, 'timestamps.createdAt': -1 });
NotificationSchema.index({ type: 1, status: 1 });
NotificationSchema.index({ 'data.priority': 1, 'timestamps.createdAt': -1 });
NotificationSchema.index({ 'scheduling.scheduledFor': 1, status: 1 });
NotificationSchema.index({ 'targeting.userRoles': 1 });
NotificationSchema.index({ 'targeting.classIds': 1 });
NotificationSchema.index({ 'timestamps.expiresAt': 1 }, { expireAfterSeconds: 0 });

// Instance methods
NotificationSchema.methods.markAsRead = function(): Promise<INotification> {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    this.status = 'read';
    this.timestamps.updatedAt = new Date();
    
    // Calculate time to read
    if (this.timestamps.sentAt) {
      this.analytics.timeToRead = Math.floor(
        (this.readAt.getTime() - this.timestamps.sentAt.getTime()) / 1000
      );
    }
  }
  
  return this.save();
};

NotificationSchema.methods.markAsUnread = function(): Promise<INotification> {
  this.isRead = false;
  this.readAt = undefined;
  this.status = 'delivered';
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

NotificationSchema.methods.recordClick = function(): Promise<INotification> {
  this.analytics.clicks++;
  this.analytics.clickRate = this.analytics.impressions > 0 
    ? (this.analytics.clicks / this.analytics.impressions) * 100 
    : 0;
  this.analytics.engagementScore = this.calculateEngagementScore();
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

NotificationSchema.methods.recordImpression = function(): Promise<INotification> {
  this.analytics.impressions++;
  this.analytics.clickRate = this.analytics.impressions > 0 
    ? (this.analytics.clicks / this.analytics.impressions) * 100 
    : 0;
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

NotificationSchema.methods.calculateEngagementScore = function(): number {
  let score = 0;
  
  // Base score for delivery
  if (this.status === 'delivered' || this.status === 'read') score += 20;
  
  // Score for reading
  if (this.isRead) score += 30;
  
  // Score for clicking
  if (this.analytics.clicks > 0) score += 30;
  
  // Score for quick response (within 1 hour)
  if (this.analytics.timeToRead && this.analytics.timeToRead < 3600) score += 20;
  
  return Math.min(score, 100);
};

NotificationSchema.methods.deliverToChannel = function(
  channel: 'inApp' | 'email' | 'push' | 'sms',
  deliveryId?: string
): Promise<INotification> {
  const channelData = this.channels[channel];
  
  if (channelData.enabled && !channelData.delivered) {
    channelData.delivered = true;
    channelData.deliveredAt = new Date();
    
    if (deliveryId) {
      if (channel === 'email') channelData.emailId = deliveryId;
      else if (channel === 'push') channelData.pushId = deliveryId;
      else if (channel === 'sms') channelData.smsId = deliveryId;
    }
    
    // Update overall status
    if (this.status === 'pending' || this.status === 'sent') {
      this.status = 'delivered';
      this.timestamps.sentAt = new Date();
    }
    
    this.timestamps.updatedAt = new Date();
  }
  
  return this.save();
};

NotificationSchema.methods.recordDeliveryFailure = function(
  channel: 'inApp' | 'email' | 'push' | 'sms',
  error: string
): Promise<INotification> {
  this.delivery.failures.push({
    channel,
    error,
    timestamp: new Date()
  });
  
  this.delivery.attempts++;
  
  if (this.delivery.attempts >= this.delivery.maxAttempts) {
    this.status = 'failed';
  } else {
    // Schedule retry
    this.delivery.retryAfter = new Date(Date.now() + (this.delivery.attempts * 5 * 60 * 1000)); // exponential backoff
  }
  
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

NotificationSchema.methods.cancel = function(): Promise<INotification> {
  this.status = 'cancelled';
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

NotificationSchema.methods.reschedule = function(newDate: Date): Promise<INotification> {
  this.scheduling.scheduledFor = newDate;
  this.status = 'pending';
  this.timestamps.updatedAt = new Date();
  
  return this.save();
};

NotificationSchema.methods.shouldDeliver = function(): boolean {
  if (this.status !== 'pending') return false;
  if (this.timestamps.expiresAt && this.timestamps.expiresAt < new Date()) return false;
  if (this.scheduling.scheduledFor && this.scheduling.scheduledFor > new Date()) return false;
  
  return true;
};

NotificationSchema.methods.getEnabledChannels = function(): string[] {
  const enabled: string[] = [];
  
  Object.entries(this.channels).forEach(([channel, config]) => {
    if (config.enabled && !config.delivered) {
      enabled.push(channel);
    }
  });
  
  return enabled;
};

NotificationSchema.methods.isExpired = function(): boolean {
  return this.timestamps.expiresAt ? this.timestamps.expiresAt < new Date() : false;
};

// Static methods
NotificationSchema.statics.getUnreadCount = function(userId: ObjectId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    status: { $in: ['delivered', 'sent'] }
  });
};

NotificationSchema.statics.markAllAsRead = function(userId: ObjectId) {
  return this.updateMany(
    {
      recipient: userId,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
        status: 'read',
        'timestamps.updatedAt': new Date()
      }
    }
  );
};

NotificationSchema.statics.getByUser = function(
  userId: ObjectId,
  options: {
    page?: number;
    limit?: number;
    type?: string;
    isRead?: boolean;
    priority?: string;
    since?: Date;
  } = {}
) {
  const {
    page = 1,
    limit = 20,
    type,
    isRead,
    priority,
    since
  } = options;

  const query: any = { recipient: userId };
  
  if (type) query.type = type;
  if (isRead !== undefined) query.isRead = isRead;
  if (priority) query['data.priority'] = priority;
  if (since) query['timestamps.createdAt'] = { $gte: since };

  return this.find(query)
    .populate('sender', 'username firstName lastName avatar')
    .sort({ 'timestamps.createdAt': -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

NotificationSchema.statics.getPendingDeliveries = function() {
  return this.find({
    status: 'pending',
    $or: [
      { 'scheduling.scheduledFor': { $lte: new Date() } },
      { 'scheduling.scheduledFor': { $exists: false } }
    ],
    'timestamps.expiresAt': { $gt: new Date() }
  });
};

NotificationSchema.statics.getFailedDeliveries = function() {
  return this.find({
    status: 'failed',
    'delivery.retryAfter': { $lte: new Date() },
    'delivery.attempts': { $lt: this.delivery?.maxAttempts || 3 }
  });
};

NotificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    $or: [
      { 'timestamps.expiresAt': { $lte: new Date() } },
      { 
        'timestamps.createdAt': { 
          $lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days old
        },
        isRead: true
      }
    ]
  });
};

NotificationSchema.statics.getBulkAnalytics = function(filters: any = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: '$type',
        totalNotifications: { $sum: 1 },
        readNotifications: { $sum: { $cond: ['$isRead', 1, 0] } },
        totalImpressions: { $sum: '$analytics.impressions' },
        totalClicks: { $sum: '$analytics.clicks' },
        avgEngagementScore: { $avg: '$analytics.engagementScore' }
      }
    },
    {
      $addFields: {
        readRate: {
          $multiply: [
            { $divide: ['$readNotifications', '$totalNotifications'] },
            100
          ]
        },
        clickRate: {
          $multiply: [
            { $divide: ['$totalClicks', '$totalImpressions'] },
            100
          ]
        }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

NotificationSchema.statics.createRecurringNotifications = function(notificationData: any) {
  const notifications = [];
  const { scheduling } = notificationData;
  
  if (!scheduling.isRecurring || !scheduling.recurringPattern) {
    return Promise.resolve([]);
  }
  
  const { frequency, interval, daysOfWeek, endDate } = scheduling.recurringPattern;
  const startDate = scheduling.scheduledFor || new Date();
  let currentDate = new Date(startDate);
  
  while (!endDate || currentDate <= endDate) {
    // Create notification for current date
    const notification = new this({
      ...notificationData,
      scheduling: {
        ...scheduling,
        scheduledFor: new Date(currentDate),
        isRecurring: false // Individual instances are not recurring
      }
    });
    
    notifications.push(notification);
    
    // Calculate next date based on frequency
    if (frequency === 'daily') {
      currentDate.setDate(currentDate.getDate() + interval);
    } else if (frequency === 'weekly') {
      if (daysOfWeek && daysOfWeek.length > 0) {
        // Find next day of week
        let nextDay = currentDate.getDay();
        do {
          nextDay = (nextDay + 1) % 7;
        } while (!daysOfWeek.includes(nextDay));
        
        const daysToAdd = (nextDay + 7 - currentDate.getDay()) % 7 || 7;
        currentDate.setDate(currentDate.getDate() + daysToAdd);
      } else {
        currentDate.setDate(currentDate.getDate() + (7 * interval));
      }
    } else if (frequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + interval);
    }
    
    // Safety limit
    if (notifications.length > 100) break;
  }
  
  return Promise.all(notifications.map(n => n.save()));
};

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  
  // Update engagement score
  this.analytics.engagementScore = this.calculateEngagementScore();
  
  next();
});

// Post-save middleware for real-time delivery
NotificationSchema.post('save', function(doc) {
  // Trigger notification delivery service
  // This would be handled by the notification service
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);