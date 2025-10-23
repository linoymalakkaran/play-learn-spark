import mongoose, { Document, Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

// User interface
export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  role: 'parent' | 'child' | 'educator' | 'student' | 'teacher' | 'guest';
  firstName: string;
  lastName: string;
  age?: number;
  grade?: string;
  isGuest: boolean;
  language: string;
  difficulty: string;
  topics: string[]; // Array of topic IDs/names
  totalActivitiesCompleted: number;
  currentLevel: number;
  totalPoints: number;
  badges: string[]; // Array of badge IDs
  streakDays: number;
  lastActiveDate: Date;
  subscriptionType: string;
  features: string[]; // Array of available features
  emailVerified: boolean;
  lastLogin: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  childrenIds: string[]; // Array of child user IDs (for parents)
  parentId?: string; // Parent user ID (for children)
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  validatePassword(password: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

// User schema
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  role: {
    type: String,
    enum: ['parent', 'child', 'educator', 'student', 'teacher', 'guest'],
    default: 'parent',
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  age: {
    type: Number,
    min: 3,
    max: 100,
  },
  grade: {
    type: String,
    trim: true,
  },
  isGuest: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    enum: ['en', 'ar', 'ml', 'es', 'fr'],
    default: 'en',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  topics: [{
    type: String,
  }],
  totalActivitiesCompleted: {
    type: Number,
    default: 0,
  },
  currentLevel: {
    type: Number,
    default: 1,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  badges: [{
    type: String,
  }],
  streakDays: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
  },
  subscriptionType: {
    type: String,
    enum: ['free', 'premium', 'pro'],
    default: 'free',
  },
  features: [{
    type: String,
  }],
  emailVerified: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: {
    type: Date,
  },
  childrenIds: [{
    type: String,
  }],
  parentId: {
    type: String,
  },
  avatarUrl: {
    type: String,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as any);
  }
});

// Instance method to validate password
UserSchema.methods.validatePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Instance method to increment login attempts
UserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockedUntil && this.lockedUntil < new Date()) {
    return this.updateOne({
      $unset: { lockedUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // If we have max attempts and it's not locked yet, lock it!
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }; // 15 minutes
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
UserSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockedUntil: 1
    }
  });
};

// Virtual for checking if account is locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockedUntil && this.lockedUntil > new Date());
});

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username });
};

UserSchema.statics.createUser = function(userData: Partial<IUser>) {
  return this.create(userData);
};

// Add interface for static methods
interface IUserModel extends mongoose.Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser & Document>;
}

// Create and export the model
export const User = mongoose.model<IUser, IUserModel>('User', UserSchema);