import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IAssignment extends Document {
  _id: ObjectId;
  title: string;
  description: string;
  instructor: ObjectId; // Reference to User
  activities: Array<{
    activityId: ObjectId;
    order: number;
    isRequired: boolean;
    timeLimit?: number; // minutes
    passingScore?: number; // percentage
    attempts?: number; // max attempts allowed
    weight?: number; // for grading
  }>;
  
  // Assignment Configuration
  configuration: {
    type: 'individual' | 'group' | 'self-paced' | 'timed';
    difficulty: 'adaptive' | 'fixed';
    randomization: boolean;
    allowRetakes: boolean;
    maxAttempts: number;
    timeLimit?: number; // total time limit in minutes
    passingGrade: number; // percentage
    gradingMethod: 'points' | 'percentage' | 'pass-fail' | 'rubric';
    showResults: 'immediate' | 'after-completion' | 'after-due-date' | 'manual';
  };

  // Scheduling
  schedule: {
    assignedDate: Date;
    startDate?: Date;
    dueDate?: Date;
    availableFrom?: Date;
    availableUntil?: Date;
    timezone: string;
    reminderSettings: {
      enabled: boolean;
      intervals: number[]; // days before due date
      methods: ('email' | 'push' | 'in-app')[];
    };
  };

  // Target Audience
  audience: {
    type: 'class' | 'group' | 'individual' | 'all';
    classIds?: ObjectId[];
    groupIds?: ObjectId[];
    studentIds?: ObjectId[];
    excludeIds?: ObjectId[];
    criteria?: {
      gradeLevel?: string[];
      ageRange?: { min: number; max: number };
      skillLevel?: string[];
      tags?: string[];
    };
  };

  // Adaptive Learning
  adaptiveSettings?: {
    enabled: boolean;
    adjustDifficulty: boolean;
    personalizedPath: boolean;
    prerequisiteCheck: boolean;
    skillMapping: {
      skillId: string;
      weight: number;
      required: boolean;
    }[];
    adaptationRules: {
      condition: string;
      action: string;
      parameters: any;
    }[];
  };

  // Progress Tracking
  progressTracking: {
    trackTime: boolean;
    trackAttempts: boolean;
    trackInteractions: boolean;
    analyticsEnabled: boolean;
    detailedReporting: boolean;
    realTimeUpdates: boolean;
  };

  // Collaboration (for group assignments)
  collaboration?: {
    enabled: boolean;
    groupSize: { min: number; max: number };
    groupFormation: 'auto' | 'manual' | 'student-choice';
    roleAssignment: boolean;
    peerReview: boolean;
    sharedSubmission: boolean;
    individualGrading: boolean;
  };

  // Resources & Materials
  resources: {
    documents: Array<{
      name: string;
      url: string;
      type: 'pdf' | 'doc' | 'link' | 'video';
      required: boolean;
    }>;
    links: Array<{
      title: string;
      url: string;
      description?: string;
    }>;
    instructions: string;
    rubric?: {
      criteriaId: string;
      description: string;
      weight: number;
      levels: Array<{
        score: number;
        description: string;
      }>;
    }[];
  };

  // Status & Metadata
  status: 'draft' | 'published' | 'active' | 'completed' | 'archived' | 'cancelled';
  visibility: 'public' | 'private' | 'restricted';
  tags: string[];
  category: string;
  estimatedDuration: number; // minutes
  points: {
    total: number;
    bonus?: number;
  };

  // Analytics Summary
  analytics: {
    enrolledCount: number;
    startedCount: number;
    completedCount: number;
    averageScore: number;
    averageTime: number; // minutes
    completionRate: number; // percentage
    lastUpdated: Date;
  };

  // Timestamps & Audit
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    archivedAt?: Date;
  };
  
  createdBy: ObjectId;
  modifiedBy?: ObjectId;
  version: {
    major: number;
    minor: number;
    notes?: string;
  };
}

const assignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  activities: [{
    activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
    order: { type: Number, required: true, min: 1 },
    isRequired: { type: Boolean, default: true },
    timeLimit: { type: Number, min: 1, max: 480 }, // max 8 hours
    passingScore: { type: Number, min: 0, max: 100 },
    attempts: { type: Number, min: 1, max: 10, default: 3 },
    weight: { type: Number, min: 0, max: 100, default: 1 }
  }],

  configuration: {
    type: { 
      type: String, 
      enum: ['individual', 'group', 'self-paced', 'timed'], 
      default: 'individual' 
    },
    difficulty: { 
      type: String, 
      enum: ['adaptive', 'fixed'], 
      default: 'fixed' 
    },
    randomization: { type: Boolean, default: false },
    allowRetakes: { type: Boolean, default: true },
    maxAttempts: { type: Number, min: 1, max: 10, default: 3 },
    timeLimit: { type: Number, min: 5, max: 1440 }, // max 24 hours
    passingGrade: { type: Number, min: 0, max: 100, default: 70 },
    gradingMethod: { 
      type: String, 
      enum: ['points', 'percentage', 'pass-fail', 'rubric'], 
      default: 'percentage' 
    },
    showResults: { 
      type: String, 
      enum: ['immediate', 'after-completion', 'after-due-date', 'manual'], 
      default: 'after-completion' 
    }
  },

  schedule: {
    assignedDate: { type: Date, required: true, default: Date.now },
    startDate: { type: Date },
    dueDate: { type: Date },
    availableFrom: { type: Date },
    availableUntil: { type: Date },
    timezone: { type: String, default: 'UTC' },
    reminderSettings: {
      enabled: { type: Boolean, default: true },
      intervals: [{ type: Number }], // days
      methods: [{ type: String, enum: ['email', 'push', 'in-app'] }]
    }
  },

  audience: {
    type: { 
      type: String, 
      enum: ['class', 'group', 'individual', 'all'], 
      required: true 
    },
    classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    groupIds: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    studentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    excludeIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    criteria: {
      gradeLevel: [{ type: String }],
      ageRange: {
        min: { type: Number, min: 3, max: 18 },
        max: { type: Number, min: 3, max: 18 }
      },
      skillLevel: [{ type: String }],
      tags: [{ type: String }]
    }
  },

  adaptiveSettings: {
    enabled: { type: Boolean, default: false },
    adjustDifficulty: { type: Boolean, default: false },
    personalizedPath: { type: Boolean, default: false },
    prerequisiteCheck: { type: Boolean, default: false },
    skillMapping: [{
      skillId: { type: String, required: true },
      weight: { type: Number, min: 0, max: 1, default: 1 },
      required: { type: Boolean, default: false }
    }],
    adaptationRules: [{
      condition: { type: String, required: true },
      action: { type: String, required: true },
      parameters: { type: Schema.Types.Mixed }
    }]
  },

  progressTracking: {
    trackTime: { type: Boolean, default: true },
    trackAttempts: { type: Boolean, default: true },
    trackInteractions: { type: Boolean, default: false },
    analyticsEnabled: { type: Boolean, default: true },
    detailedReporting: { type: Boolean, default: false },
    realTimeUpdates: { type: Boolean, default: true }
  },

  collaboration: {
    enabled: { type: Boolean, default: false },
    groupSize: {
      min: { type: Number, min: 2, max: 10, default: 2 },
      max: { type: Number, min: 2, max: 10, default: 4 }
    },
    groupFormation: { 
      type: String, 
      enum: ['auto', 'manual', 'student-choice'], 
      default: 'manual' 
    },
    roleAssignment: { type: Boolean, default: false },
    peerReview: { type: Boolean, default: false },
    sharedSubmission: { type: Boolean, default: true },
    individualGrading: { type: Boolean, default: false }
  },

  resources: {
    documents: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, enum: ['pdf', 'doc', 'link', 'video'], required: true },
      required: { type: Boolean, default: false }
    }],
    links: [{
      title: { type: String, required: true },
      url: { type: String, required: true },
      description: { type: String }
    }],
    instructions: { type: String, maxlength: 5000 },
    rubric: [{
      criteriaId: { type: String, required: true },
      description: { type: String, required: true },
      weight: { type: Number, min: 0, max: 1, required: true },
      levels: [{
        score: { type: Number, required: true },
        description: { type: String, required: true }
      }]
    }]
  },

  status: { 
    type: String, 
    enum: ['draft', 'published', 'active', 'completed', 'archived', 'cancelled'], 
    default: 'draft' 
  },
  visibility: { 
    type: String, 
    enum: ['public', 'private', 'restricted'], 
    default: 'private' 
  },
  tags: [{ type: String, trim: true }],
  category: { type: String, required: true },
  estimatedDuration: { type: Number, min: 5, max: 1440, required: true },
  
  points: {
    total: { type: Number, min: 0, required: true },
    bonus: { type: Number, min: 0 }
  },

  analytics: {
    enrolledCount: { type: Number, default: 0 },
    startedCount: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },

  timestamps: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date },
    archivedAt: { type: Date }
  },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  modifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  version: {
    major: { type: Number, default: 1 },
    minor: { type: Number, default: 0 },
    notes: { type: String, maxlength: 500 }
  }
});

// Indexes for performance
assignmentSchema.index({ instructor: 1, status: 1 });
assignmentSchema.index({ 'audience.classIds': 1 });
assignmentSchema.index({ 'audience.studentIds': 1 });
assignmentSchema.index({ 'schedule.dueDate': 1 });
assignmentSchema.index({ 'schedule.assignedDate': 1 });
assignmentSchema.index({ status: 1, visibility: 1 });
assignmentSchema.index({ category: 1 });
assignmentSchema.index({ tags: 1 });
assignmentSchema.index({ 'timestamps.createdAt': -1 });

// Virtual for total enrolled students
assignmentSchema.virtual('totalStudents').get(function() {
  return this.analytics.enrolledCount;
});

// Virtual for completion percentage
assignmentSchema.virtual('completionPercentage').get(function() {
  return this.analytics.enrolledCount > 0 
    ? Math.round((this.analytics.completedCount / this.analytics.enrolledCount) * 100)
    : 0;
});

// Virtual for average grade
assignmentSchema.virtual('averageGrade').get(function() {
  return Math.round(this.analytics.averageScore * 100) / 100;
});

// Virtual for time remaining
assignmentSchema.virtual('timeRemaining').get(function() {
  if (!this.schedule.dueDate) return null;
  
  const now = new Date();
  const due = new Date(this.schedule.dueDate);
  const diff = due.getTime() - now.getTime();
  
  if (diff <= 0) return 0;
  
  return Math.ceil(diff / (1000 * 60 * 60 * 24)); // days remaining
});

// Virtual for assignment status
assignmentSchema.virtual('assignmentStatus').get(function() {
  const now = new Date();
  
  if (this.status !== 'published' && this.status !== 'active') {
    return this.status;
  }
  
  if (this.schedule.availableFrom && now < this.schedule.availableFrom) {
    return 'upcoming';
  }
  
  if (this.schedule.dueDate && now > this.schedule.dueDate) {
    return 'overdue';
  }
  
  if (this.schedule.availableUntil && now > this.schedule.availableUntil) {
    return 'expired';
  }
  
  return 'active';
});

// Instance methods
assignmentSchema.methods.publish = async function(): Promise<IAssignment> {
  this.status = 'published';
  this.timestamps.publishedAt = new Date();
  this.timestamps.updatedAt = new Date();
  
  // Auto-set to active if start date is now or past
  const now = new Date();
  if (!this.schedule.startDate || this.schedule.startDate <= now) {
    this.status = 'active';
  }
  
  return await this.save();
};

assignmentSchema.methods.archive = async function(): Promise<IAssignment> {
  this.status = 'archived';
  this.timestamps.archivedAt = new Date();
  this.timestamps.updatedAt = new Date();
  
  return await this.save();
};

assignmentSchema.methods.duplicate = async function(newTitle?: string): Promise<IAssignment> {
  const duplicateData = this.toObject();
  delete duplicateData._id;
  delete duplicateData.__v;
  delete duplicateData.timestamps;
  delete duplicateData.analytics;
  
  duplicateData.title = newTitle || `${this.title} (Copy)`;
  duplicateData.status = 'draft';
  duplicateData.version = { major: 1, minor: 0 };
  
  // Reset dates
  duplicateData.schedule.assignedDate = new Date();
  delete duplicateData.schedule.publishedAt;
  delete duplicateData.schedule.archivedAt;
  
  const newAssignment = new Assignment(duplicateData);
  return await newAssignment.save();
};

assignmentSchema.methods.updateAnalytics = async function(metrics: any): Promise<void> {
  Object.assign(this.analytics, metrics);
  this.analytics.lastUpdated = new Date();
  this.timestamps.updatedAt = new Date();
  
  await this.save();
};

assignmentSchema.methods.getEligibleStudents = async function(): Promise<ObjectId[]> {
  // This would integrate with the class/group/student management system
  // For now, return the explicitly assigned students
  const studentIds: ObjectId[] = [];
  
  if (this.audience.type === 'individual' && this.audience.studentIds) {
    studentIds.push(...this.audience.studentIds);
  }
  
  // TODO: Implement logic for class and group audience types
  // This would query the Class and Group models to get student lists
  
  // Apply exclusions
  if (this.audience.excludeIds) {
    return studentIds.filter(id => 
      !this.audience.excludeIds?.some(excludeId => excludeId.equals(id))
    );
  }
  
  return studentIds;
};

assignmentSchema.methods.calculateTotalPoints = function(): number {
  return this.activities.reduce((total, activity) => {
    return total + (activity.weight || 1);
  }, 0);
};

assignmentSchema.methods.isAvailable = function(): boolean {
  const now = new Date();
  
  if (this.status !== 'active' && this.status !== 'published') {
    return false;
  }
  
  if (this.schedule.availableFrom && now < this.schedule.availableFrom) {
    return false;
  }
  
  if (this.schedule.availableUntil && now > this.schedule.availableUntil) {
    return false;
  }
  
  return true;
};

assignmentSchema.methods.isOverdue = function(): boolean {
  if (!this.schedule.dueDate) return false;
  return new Date() > this.schedule.dueDate;
};

// Static methods
assignmentSchema.statics.findByInstructor = function(instructorId: ObjectId, status?: string) {
  const query: any = { instructor: instructorId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ 'timestamps.updatedAt': -1 })
    .populate('activities.activityId', 'title difficulty estimatedDuration');
};

assignmentSchema.statics.findForStudent = function(studentId: ObjectId, status?: string) {
  const query: any = {
    $or: [
      { 'audience.studentIds': studentId },
      { 'audience.type': 'all' }
      // TODO: Add class and group queries
    ]
  };
  
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ 'schedule.dueDate': 1 })
    .populate('instructor', 'username email')
    .populate('activities.activityId', 'title difficulty');
};

assignmentSchema.statics.findDueSoon = function(days: number = 3) {
  const now = new Date();
  const future = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    status: 'active',
    'schedule.dueDate': {
      $gte: now,
      $lte: future
    }
  }).populate('instructor', 'username email');
};

assignmentSchema.statics.findOverdue = function() {
  const now = new Date();
  
  return this.find({
    status: 'active',
    'schedule.dueDate': { $lt: now }
  }).populate('instructor', 'username email');
};

// Pre-save middleware
assignmentSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  
  // Auto-calculate total points if not set
  if (!this.points.total) {
    this.points.total = this.calculateTotalPoints();
  }
  
  // Validate schedule dates
  if (this.schedule.startDate && this.schedule.dueDate) {
    if (this.schedule.startDate >= this.schedule.dueDate) {
      return next(new Error('Start date must be before due date'));
    }
  }
  
  if (this.schedule.availableFrom && this.schedule.availableUntil) {
    if (this.schedule.availableFrom >= this.schedule.availableUntil) {
      return next(new Error('Available from date must be before available until date'));
    }
  }
  
  next();
});

// Pre-find middleware to populate common fields
assignmentSchema.pre(/^find/, function() {
  this.populate('instructor', 'username email firstName lastName');
});

export const Assignment = model<IAssignment>('Assignment', assignmentSchema);