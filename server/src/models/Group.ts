import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IGroup extends Document {
  _id: ObjectId;
  name: string;
  description?: string;
  class: ObjectId;
  teacher: ObjectId;
  type: 'study-group' | 'project-team' | 'reading-circle' | 'skill-level' | 'custom';
  members: Array<{
    userId: ObjectId;
    role: 'member' | 'leader' | 'helper';
    joinedAt: Date;
    status: 'active' | 'inactive';
  }>;
  settings: {
    maxMembers: number;
    allowSelfJoin: boolean;
    requireApproval: boolean;
    isPrivate: boolean;
  };
  color: string; // For UI visualization
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    archivedAt?: Date;
  };
  
  // Methods
  addMember(userId: ObjectId, role?: string): Promise<void>;
  removeMember(userId: ObjectId): Promise<void>;
  updateMemberRole(userId: ObjectId, role: string): Promise<void>;
  isMember(userId: ObjectId): boolean;
  getActiveMembers(): Array<any>;
}

const groupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['study-group', 'project-team', 'reading-circle', 'skill-level', 'custom'],
    default: 'custom'
  },
  members: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'leader', 'helper'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  }],
  settings: {
    maxMembers: { type: Number, default: 8, min: 2, max: 20 },
    allowSelfJoin: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: true },
    isPrivate: { type: Boolean, default: false }
  },
  color: {
    type: String,
    default: '#3B82F6',
    validate: {
      validator: function(v: string) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    archivedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
groupSchema.index({ class: 1 });
groupSchema.index({ teacher: 1 });
groupSchema.index({ 'members.userId': 1 });
groupSchema.index({ type: 1 });

// Instance methods
groupSchema.methods.addMember = async function(userId: ObjectId, role: string = 'member'): Promise<void> {
  // Check if user is already a member
  const existingMember = this.members.find((m: any) => m.userId.toString() === userId.toString());
  if (existingMember) {
    throw new Error('User is already a member of this group');
  }

  // Check max capacity
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('Group has reached maximum capacity');
  }

  this.members.push({
    userId,
    role,
    joinedAt: new Date(),
    status: 'active'
  });

  await this.save();
};

groupSchema.methods.removeMember = async function(userId: ObjectId): Promise<void> {
  this.members = this.members.filter((m: any) => m.userId.toString() !== userId.toString());
  await this.save();
};

groupSchema.methods.updateMemberRole = async function(userId: ObjectId, role: string): Promise<void> {
  const member = this.members.find((m: any) => m.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('User is not a member of this group');
  }

  member.role = role;
  await this.save();
};

groupSchema.methods.isMember = function(userId: ObjectId): boolean {
  return this.members.some((m: any) => 
    m.userId.toString() === userId.toString() && 
    m.status === 'active'
  );
};

groupSchema.methods.getActiveMembers = function(): Array<any> {
  return this.members.filter((m: any) => m.status === 'active');
};

// Static methods
groupSchema.statics.findByClass = function(classId: ObjectId) {
  return this.find({
    class: classId,
    'metadata.archivedAt': { $exists: false }
  }).populate('members.userId', 'profile email username');
};

groupSchema.statics.findByTeacher = function(teacherId: ObjectId) {
  return this.find({
    teacher: teacherId,
    'metadata.archivedAt': { $exists: false }
  }).populate('class', 'name gradeLevel')
    .populate('members.userId', 'profile email username');
};

groupSchema.statics.findUserGroups = function(userId: ObjectId) {
  return this.find({
    'members.userId': userId,
    'members.status': 'active',
    'metadata.archivedAt': { $exists: false }
  }).populate('class', 'name gradeLevel')
    .populate('teacher', 'profile email username');
};

// Pre-save middleware
groupSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  next();
});

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members.filter(m => m.status === 'active').length;
});

// Ensure virtual fields are serialized
groupSchema.set('toJSON', { virtuals: true });
groupSchema.set('toObject', { virtuals: true });

export const Group = model<IGroup>('Group', groupSchema);