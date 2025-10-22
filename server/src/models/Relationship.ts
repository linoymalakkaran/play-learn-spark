import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IRelationship extends Document {
  _id: ObjectId;
  requester: ObjectId; // The user who initiated the relationship
  recipient: ObjectId; // The user who received the request
  relationshipType: 'parent-child' | 'teacher-student' | 'guardian-child' | 'sibling' | 'peer';
  status: 'pending' | 'accepted' | 'declined' | 'blocked' | 'suspended';
  
  // Invitation details
  invitation: {
    code: string; // Unique invitation code
    qrCode?: string; // Base64 QR code image
    expiresAt: Date;
    message?: string;
    createdAt: Date;
    usedAt?: Date;
  };

  // Relationship permissions and settings
  permissions: {
    viewProgress: boolean;
    viewActivities: boolean;
    manageActivities: boolean;
    receiveNotifications: boolean;
    communicateDirectly: boolean;
    viewReports: boolean;
    approveRewards: boolean;
    setTimeRestrictions: boolean;
  };

  // Time restrictions (for parent-child relationships)
  timeRestrictions?: {
    dailyLimit: number; // minutes per day
    weeklyLimit: number; // minutes per week
    allowedDays: string[]; // ['monday', 'tuesday', etc.]
    allowedTimeSlots: {
      start: string; // HH:MM format
      end: string;   // HH:MM format
    }[];
    timezone: string;
  };

  // Relationship metadata
  metadata: {
    initiatedBy: ObjectId; // Who started this relationship
    approvedBy?: ObjectId; // Who approved it (for institutional relationships)
    notes?: string;
    priority: 'low' | 'medium' | 'high';
    tags: string[];
    lastInteraction: Date;
    interactionCount: number;
  };

  // Audit trail
  history: {
    action: 'created' | 'accepted' | 'declined' | 'modified' | 'suspended' | 'reactivated';
    performedBy: ObjectId;
    performedAt: Date;
    details?: string;
    previousStatus?: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const RelationshipSchema = new Schema<IRelationship>({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  relationshipType: { 
    type: String, 
    enum: ['parent-child', 'teacher-student', 'guardian-child', 'sibling', 'peer'],
    required: true,
    index: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'blocked', 'suspended'],
    default: 'pending',
    index: true
  },

  invitation: {
    code: { type: String, required: true, unique: true, index: true },
    qrCode: { type: String },
    expiresAt: { type: Date, required: true, index: true },
    message: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
    usedAt: { type: Date }
  },

  permissions: {
    viewProgress: { type: Boolean, default: true },
    viewActivities: { type: Boolean, default: true },
    manageActivities: { type: Boolean, default: false },
    receiveNotifications: { type: Boolean, default: true },
    communicateDirectly: { type: Boolean, default: true },
    viewReports: { type: Boolean, default: true },
    approveRewards: { type: Boolean, default: false },
    setTimeRestrictions: { type: Boolean, default: false }
  },

  timeRestrictions: {
    dailyLimit: { type: Number, min: 0, max: 1440 }, // max 24 hours
    weeklyLimit: { type: Number, min: 0, max: 10080 }, // max 7 days
    allowedDays: [{ 
      type: String, 
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] 
    }],
    allowedTimeSlots: [{
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ }
    }],
    timezone: { type: String, default: 'UTC' }
  },

  metadata: {
    initiatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, maxlength: 1000 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    tags: [{ type: String, maxlength: 50 }],
    lastInteraction: { type: Date, default: Date.now },
    interactionCount: { type: Number, default: 0 }
  },

  history: [{
    action: { 
      type: String, 
      enum: ['created', 'accepted', 'declined', 'modified', 'suspended', 'reactivated'],
      required: true 
    },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performedAt: { type: Date, default: Date.now },
    details: { type: String, maxlength: 500 },
    previousStatus: { type: String }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date }
}, {
  timestamps: true,
  indexes: [
    { requester: 1, recipient: 1 },
    { relationshipType: 1, status: 1 },
    { 'invitation.code': 1 },
    { 'invitation.expiresAt': 1 },
    { status: 1, updatedAt: -1 }
  ]
});

// Compound index to prevent duplicate relationships
RelationshipSchema.index(
  { requester: 1, recipient: 1, relationshipType: 1 }, 
  { unique: true, name: 'unique_relationship' }
);

// Index for active relationships
RelationshipSchema.index(
  { status: 1, deletedAt: 1 },
  { name: 'active_relationships', partialFilterExpression: { deletedAt: null } }
);

// Methods
RelationshipSchema.methods.addHistoryEntry = function(action: string, performedBy: ObjectId, details?: string) {
  this.history.push({
    action,
    performedBy,
    performedAt: new Date(),
    details,
    previousStatus: this.status
  });
  this.metadata.lastInteraction = new Date();
  this.metadata.interactionCount += 1;
};

RelationshipSchema.methods.updatePermissions = function(newPermissions: Partial<IRelationship['permissions']>) {
  this.permissions = { ...this.permissions, ...newPermissions };
  this.updatedAt = new Date();
};

RelationshipSchema.methods.isExpired = function() {
  return this.invitation.expiresAt < new Date();
};

RelationshipSchema.methods.canManage = function(userId: ObjectId) {
  const userIdStr = userId.toString();
  return (
    this.requester.toString() === userIdStr || 
    this.recipient.toString() === userIdStr ||
    (this.metadata.approvedBy && this.metadata.approvedBy.toString() === userIdStr)
  );
};

// Static methods
RelationshipSchema.statics.findActiveRelationships = function(userId: ObjectId) {
  return this.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted',
    deletedAt: null
  }).populate('requester recipient', 'username profile role');
};

RelationshipSchema.statics.findPendingInvitations = function(userId: ObjectId) {
  return this.find({
    recipient: userId,
    status: 'pending',
    'invitation.expiresAt': { $gt: new Date() },
    deletedAt: null
  }).populate('requester', 'username profile role');
};

RelationshipSchema.statics.findByInvitationCode = function(code: string) {
  return this.findOne({
    'invitation.code': code,
    status: 'pending',
    'invitation.expiresAt': { $gt: new Date() },
    deletedAt: null
  }).populate('requester', 'username profile role');
};

RelationshipSchema.statics.createInvitationCode = function(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Pre-save middleware
RelationshipSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Post-save middleware for cleanup
RelationshipSchema.post('save', async function() {
  // Clean up expired invitations (run occasionally)
  if (Math.random() < 0.1) { // 10% chance to run cleanup
    try {
      await this.constructor.deleteMany({
        status: 'pending',
        'invitation.expiresAt': { $lt: new Date() },
        createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // older than 7 days
      });
    } catch (error) {
      console.error('Error cleaning up expired invitations:', error);
    }
  }
});

export const Relationship = model<IRelationship>('Relationship', RelationshipSchema);
export default Relationship;