import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { User } from './User';

// Password Reset interface
export interface IPasswordReset extends Document {
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Password Reset schema
const PasswordResetSchema = new Schema<IPasswordReset>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0, // TTL index
  },
  used: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
PasswordResetSchema.index({ userId: 1 });
PasswordResetSchema.index({ token: 1 });
PasswordResetSchema.index({ expiresAt: 1 });

// Static method to create password reset token
PasswordResetSchema.statics.createPasswordResetToken = async function(userId: string): Promise<string | null> {
  try {
    // Delete any existing reset tokens for this user
    await this.deleteMany({ userId });
    
    // Generate unique token
    const token = uuidv4();
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    // Create new reset token
    await this.create({
      userId,
      token,
      expiresAt,
      used: false,
    });
    
    return token;
  } catch (error) {
    console.error('Error creating password reset token:', error);
    return null;
  }
};

// Static method to reset password using token
PasswordResetSchema.statics.resetPassword = async function(token: string, newPassword: string): Promise<boolean> {
  try {
    // Find valid reset token
    const resetRecord = await this.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });
    
    if (!resetRecord) {
      return false;
    }
    
    // Find user
    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return false;
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    await User.findByIdAndUpdate(resetRecord.userId, {
      password: hashedPassword,
      loginAttempts: 0,
      $unset: { lockedUntil: 1 },
    });
    
    // Mark token as used
    await this.findByIdAndUpdate(resetRecord._id, { used: true });
    
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
};

// Static method to validate reset token
PasswordResetSchema.statics.validateToken = function(token: string) {
  return this.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() },
  });
};

// Add interface for static methods
interface IPasswordResetModel extends mongoose.Model<IPasswordReset> {
  createPasswordResetToken(userId: string): Promise<string | null>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  validateToken(token: string): Promise<IPasswordReset | null>;
}

export const PasswordReset = mongoose.model<IPasswordReset, IPasswordResetModel>('PasswordReset', PasswordResetSchema);