import { Schema, model, Document, ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  username: string;
  role: 'parent' | 'child' | 'educator' | 'admin' | 'guest';
  
  // Profile information
  profile: {
    firstName: string;
    lastName: string;
    age?: number;
    grade?: string;
    avatarUrl?: string;
    dateOfBirth?: Date;
    bio?: string;
  };

  // User preferences and settings
  preferences: {
    language: 'en' | 'ar' | 'ml' | 'es' | 'fr';
    difficulty: 'easy' | 'medium' | 'hard';
    topics: string[];
    notifications: {
      email: boolean;
      push: boolean;
      assignments: boolean;
      progress: boolean;
      achievements: boolean;
      reminders: boolean;
    };
    privacy: {
      profileVisible: boolean;
      progressVisible: boolean;
      allowMessages: boolean;
    };
    accessibility: {
      highContrast: boolean;
      largeText: boolean;
      screenReader: boolean;
      reducedMotion: boolean;
    };
  };

  // Progress and gamification
  progress: {
    totalActivitiesCompleted: number;
    currentLevel: number;
    totalPoints: number;
    badges: string[];
    streakDays: number;
    lastActiveDate: Date;
    weeklyGoal?: number;
    achievements: {
      id: string;
      unlockedAt: Date;
      category: string;
    }[];
  };

  // Subscription and features
  subscription: {
    type: 'free' | 'premium' | 'family' | 'school' | 'trial';
    expiresAt?: Date;
    features: string[];
    trialUsed: boolean;
    billingCycle?: 'monthly' | 'yearly';
  };

  // Verification and security
  verification: {
    email: boolean;
    emailToken?: string;
    emailTokenExpiry?: Date;
    parentVerification: boolean;
    teacherVerification: boolean;
    identityVerified: boolean;
  };

  // Security settings
  security: {
    loginAttempts: number;
    lockedUntil?: Date;
    lastLogin: Date;
    passwordResetToken?: string;
    passwordResetExpiry?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    allowedIPs?: string[];
    sessionTimeoutMinutes: number;
  };

  // Metadata
  metadata: {
    isGuest: boolean;
    invitedBy?: ObjectId;
    timezone?: string;
    lastIP?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
    lastActiveAt: Date;
    deletedAt?: Date;
    source: 'web' | 'mobile' | 'api' | 'import';
  };

  // Relationships (will be populated by relationship service)
  relationships?: ObjectId[];

  // Instance methods
  comparePassword(password: string): Promise<boolean>;
  generateEmailToken(): string;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  isLocked(): boolean;
  canPerformAction(action: string): boolean;
  toSafeObject(): any;
}

const userSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    index: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    minlength: 3,
    maxlength: 50,
    index: true,
    validate: {
      validator: function(v: string) {
        return /^[a-zA-Z0-9_]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, and underscores'
    }
  },
  role: { 
    type: String, 
    enum: ['parent', 'child', 'educator', 'admin', 'guest'], 
    required: true,
    default: 'parent',
    index: true
  },

  // Profile information
  profile: {
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    age: { type: Number, min: 1, max: 150 },
    grade: { type: String, trim: true, maxlength: 20 },
    avatarUrl: { type: String, trim: true },
    dateOfBirth: { type: Date },
    bio: { type: String, maxlength: 500, trim: true }
  },

  // User preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'ar', 'ml', 'es', 'fr'],
      default: 'en'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy'
    },
    topics: [{ type: String, trim: true }],
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      assignments: { type: Boolean, default: true },
      progress: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true }
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      progressVisible: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true }
    },
    accessibility: {
      highContrast: { type: Boolean, default: false },
      largeText: { type: Boolean, default: false },
      screenReader: { type: Boolean, default: false },
      reducedMotion: { type: Boolean, default: false }
    }
  },

  // Progress tracking
  progress: {
    totalActivitiesCompleted: { type: Number, default: 0, min: 0 },
    currentLevel: { type: Number, default: 1, min: 1 },
    totalPoints: { type: Number, default: 0, min: 0 },
    badges: [{ type: String, trim: true }],
    streakDays: { type: Number, default: 0, min: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    weeklyGoal: { type: Number, min: 1 },
    achievements: [{
      id: { type: String, required: true },
      unlockedAt: { type: Date, required: true },
      category: { type: String, required: true }
    }]
  },

  // Subscription management
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'family', 'school', 'trial'],
      default: 'free'
    },
    expiresAt: { type: Date },
    features: [{ type: String, trim: true }],
    trialUsed: { type: Boolean, default: false },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly']
    }
  },

  // Verification status
  verification: {
    email: { type: Boolean, default: false },
    emailToken: { type: String, select: false },
    emailTokenExpiry: { type: Date, select: false },
    parentVerification: { type: Boolean, default: false },
    teacherVerification: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false }
  },

  // Security settings
  security: {
    loginAttempts: { type: Number, default: 0, min: 0 },
    lockedUntil: { type: Date },
    lastLogin: { type: Date, default: Date.now },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    allowedIPs: [{ type: String, trim: true }],
    sessionTimeoutMinutes: { type: Number, default: 60, min: 15 }
  },

  // Metadata
  metadata: {
    isGuest: { type: Boolean, default: false, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    timezone: { type: String, trim: true },
    lastIP: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    deletedAt: { type: Date },
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'import'],
      default: 'web'
    }
  },

  relationships: [{ type: Schema.Types.ObjectId, ref: 'Relationship' }]
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) { 
      delete ret.password; 
      delete ret.verification.emailToken;
      delete ret.verification.emailTokenExpiry;
      delete ret.security.passwordResetToken;
      delete ret.security.passwordResetExpiry;
      delete ret.security.twoFactorSecret;
      return ret; 
    } 
  },
  toObject: { 
    transform: function(doc, ret) { 
      delete ret.password; 
      delete ret.verification.emailToken;
      delete ret.verification.emailTokenExpiry;
      delete ret.security.passwordResetToken;
      delete ret.security.passwordResetExpiry;
      delete ret.security.twoFactorSecret;
      return ret; 
    } 
  }
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ 'metadata.isGuest': 1 });
userSchema.index({ 'verification.email': 1 });
userSchema.index({ 'subscription.type': 1 });
userSchema.index({ 'metadata.createdAt': 1 });
userSchema.index({ 'metadata.lastActiveAt': 1 });
userSchema.index({ 'progress.totalPoints': -1 });
userSchema.index({ 'security.lockedUntil': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date();
  if (this.isNew) {
    this.metadata.createdAt = new Date();
  }
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateEmailToken = function(): string {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  this.verification.emailToken = token;
  this.verification.emailTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  this.security.loginAttempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.security.loginAttempts >= 5) {
    this.security.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  
  await this.save();
};

userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  this.security.loginAttempts = 0;
  this.security.lockedUntil = undefined;
  await this.save();
};

userSchema.methods.isLocked = function(): boolean {
  return !!(this.security.lockedUntil && this.security.lockedUntil > new Date());
};

userSchema.methods.canPerformAction = function(action: string): boolean {
  // Basic role-based permissions (will be enhanced by Permission system)
  const rolePermissions = {
    admin: ['*'],
    educator: ['create_activity', 'manage_class', 'view_student_progress', 'assign_activities'],
    parent: ['view_child_progress', 'manage_child_account', 'set_restrictions'],
    child: ['complete_activity', 'view_own_progress'],
    guest: ['complete_activity']
  };

  const permissions = rolePermissions[this.role] || [];
  return permissions.includes('*') || permissions.includes(action);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verification.emailToken;
  delete obj.verification.emailTokenExpiry;
  delete obj.security.passwordResetToken;
  delete obj.security.passwordResetExpiry;
  delete obj.security.twoFactorSecret;
  return obj;
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ 'metadata.deletedAt': { $exists: false } });
};

export const UserMongo = model<IUser>('User', userSchema);
export default UserMongo;