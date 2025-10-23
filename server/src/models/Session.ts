import mongoose, { Document, Schema } from 'mongoose';

// Session interface
export interface ISession extends Document {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Session schema
const SessionSchema = new Schema<ISession>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0, // TTL index - document will be automatically deleted when expiresAt is reached
  },
}, {
  timestamps: true,
});

// Index for efficient queries
SessionSchema.index({ userId: 1 });
SessionSchema.index({ refreshToken: 1 });

// Static methods
SessionSchema.statics.createSession = function(userId: string, refreshToken: string, expiresAt: Date) {
  return this.create({
    userId,
    refreshToken,
    expiresAt,
  });
};

SessionSchema.statics.findByRefreshToken = function(refreshToken: string) {
  return this.findOne({ refreshToken });
};

SessionSchema.statics.deleteByUserId = function(userId: string) {
  return this.deleteMany({ userId });
};

SessionSchema.statics.deleteByRefreshToken = function(refreshToken: string) {
  return this.deleteOne({ refreshToken });
};

export const Session = mongoose.model<ISession>('Session', SessionSchema);