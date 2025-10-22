import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IClass extends Document {
  _id: ObjectId;
  name: string;
  description?: string;
  teacher: ObjectId;
  subject?: string;
  gradeLevel: string;
  settings: {
    maxStudents: number;
    autoApproval: boolean;
    allowParentView: boolean;
    public: boolean;
    allowLateJoin: boolean;
    requireApproval: boolean;
  };
  joinCode: string;
  joinCodeExpiry?: Date;
  students: Array<{
    userId: ObjectId;
    enrolledAt: Date;
    status: 'active' | 'inactive' | 'pending' | 'removed';
    invitedBy?: ObjectId;
    approvedBy?: ObjectId;
    permissions: {
      viewClassmates: boolean;
      participateInDiscussions: boolean;
      submitAssignments: boolean;
    };
  }>;
  schedule?: {
    days: string[]; // ['monday', 'wednesday', 'friday']
    startTime: string; // '09:00'
    endTime: string; // '10:30'
    timezone: string;
    recurring: boolean;
  };
  analytics: {
    totalStudents: number;
    activeStudents: number;
    totalAssignments: number;
    averageCompletion: number;
    lastActivity: Date;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    archivedAt?: Date;
    academicYear?: string;
    semester?: string;
  };
  
  // Methods
  generateJoinCode(): string;
  addStudent(studentId: ObjectId, addedBy: ObjectId): Promise<void>;
  removeStudent(studentId: ObjectId): Promise<void>;
  updateAnalytics(): Promise<void>;
  isStudentEnrolled(studentId: ObjectId): boolean;
}

const classSchema = new Schema<IClass>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    trim: true,
    enum: ['math', 'science', 'english', 'history', 'art', 'music', 'physical-education', 'other']
  },
  gradeLevel: {
    type: String,
    required: true,
    enum: ['pre-k', 'kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', 'mixed']
  },
  settings: {
    maxStudents: {
      type: Number,
      default: 30,
      min: 1,
      max: 100
    },
    autoApproval: {
      type: Boolean,
      default: false
    },
    allowParentView: {
      type: Boolean,
      default: true
    },
    public: {
      type: Boolean,
      default: false
    },
    allowLateJoin: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: true
    }
  },
  joinCode: {
    type: String,
    unique: true,
    required: true
  },
  joinCodeExpiry: Date,
  students: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'removed'],
      default: 'pending'
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      viewClassmates: { type: Boolean, default: true },
      participateInDiscussions: { type: Boolean, default: true },
      submitAssignments: { type: Boolean, default: true }
    }
  }],
  schedule: {
    days: [String],
    startTime: String,
    endTime: String,
    timezone: { type: String, default: 'UTC' },
    recurring: { type: Boolean, default: true }
  },
  analytics: {
    totalStudents: { type: Number, default: 0 },
    activeStudents: { type: Number, default: 0 },
    totalAssignments: { type: Number, default: 0 },
    averageCompletion: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    archivedAt: Date,
    academicYear: String,
    semester: String
  }
}, {
  timestamps: true
});

// Indexes for performance
classSchema.index({ teacher: 1 });
classSchema.index({ joinCode: 1 });
classSchema.index({ 'students.userId': 1 });
classSchema.index({ gradeLevel: 1, subject: 1 });
classSchema.index({ 'settings.public': 1 });

// Instance methods
classSchema.methods.generateJoinCode = function(): string {
  this.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  return this.joinCode;
};

classSchema.methods.addStudent = async function(studentId: ObjectId, addedBy: ObjectId): Promise<void> {
  // Check if student already exists
  const existingStudent = this.students.find((s: any) => s.userId.toString() === studentId.toString());
  if (existingStudent) {
    throw new Error('Student already enrolled in this class');
  }

  // Check max capacity
  if (this.students.length >= this.settings.maxStudents) {
    throw new Error('Class has reached maximum capacity');
  }

  this.students.push({
    userId: studentId,
    enrolledAt: new Date(),
    status: this.settings.autoApproval ? 'active' : 'pending',
    invitedBy: addedBy,
    approvedBy: this.settings.autoApproval ? addedBy : undefined,
    permissions: {
      viewClassmates: true,
      participateInDiscussions: true,
      submitAssignments: true
    }
  });

  await this.updateAnalytics();
  await this.save();
};

classSchema.methods.removeStudent = async function(studentId: ObjectId): Promise<void> {
  this.students = this.students.filter((s: any) => s.userId.toString() !== studentId.toString());
  await this.updateAnalytics();
  await this.save();
};

classSchema.methods.updateAnalytics = async function(): Promise<void> {
  this.analytics.totalStudents = this.students.length;
  this.analytics.activeStudents = this.students.filter((s: any) => s.status === 'active').length;
  this.analytics.lastActivity = new Date();
};

classSchema.methods.isStudentEnrolled = function(studentId: ObjectId): boolean {
  return this.students.some((s: any) => 
    s.userId.toString() === studentId.toString() && 
    ['active', 'pending'].includes(s.status)
  );
};

// Static methods
classSchema.statics.findByJoinCode = function(code: string) {
  return this.findOne({ joinCode: code });
};

classSchema.statics.findTeacherClasses = function(teacherId: ObjectId) {
  return this.find({ 
    teacher: teacherId,
    'metadata.archivedAt': { $exists: false }
  }).populate('students.userId', 'profile email username');
};

classSchema.statics.findStudentClasses = function(studentId: ObjectId) {
  return this.find({
    'students.userId': studentId,
    'students.status': 'active',
    'metadata.archivedAt': { $exists: false }
  }).populate('teacher', 'profile email username');
};

// Pre-save middleware for join code generation
classSchema.pre('save', function(next) {
  if (this.isNew && !this.joinCode) {
    this.generateJoinCode();
  }
  this.metadata.updatedAt = new Date();
  next();
});

export const Class = model<IClass>('Class', classSchema);