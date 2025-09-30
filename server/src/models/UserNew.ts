import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';

// User attributes interface
export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  username: string;
  role: 'parent' | 'child' | 'educator' | 'admin';
  firstName: string;
  lastName: string;
  age?: number;
  avatarUrl?: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string;
  totalActivitiesCompleted: number;
  currentLevel: number;
  totalPoints: number;
  badges: string;
  streakDays: number;
  lastActiveDate: Date;
  subscriptionType: 'free' | 'premium' | 'family';
  subscriptionExpiresAt?: Date;
  subscriptionFeatures: string;
  emailVerified: boolean;
  lastLogin: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Optional attributes for creation
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'age' | 'avatarUrl' | 'subscriptionExpiresAt' | 'lockedUntil' | 'passwordResetToken' | 'passwordResetExpires' | 'createdAt' | 'updatedAt'> {}

// User model class
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public username!: string;
  public role!: 'parent' | 'child' | 'educator' | 'admin';
  public firstName!: string;
  public lastName!: string;
  public age?: number;
  public avatarUrl?: string;
  public language!: string;
  public difficulty!: 'easy' | 'medium' | 'hard';
  public topics!: string;
  public totalActivitiesCompleted!: number;
  public currentLevel!: number;
  public totalPoints!: number;
  public badges!: string;
  public streakDays!: number;
  public lastActiveDate!: Date;
  public subscriptionType!: 'free' | 'premium' | 'family';
  public subscriptionExpiresAt?: Date;
  public subscriptionFeatures!: string;
  public emailVerified!: boolean;
  public lastLogin!: Date;
  public loginAttempts!: number;
  public lockedUntil?: Date;
  public passwordResetToken?: string;
  public passwordResetExpires?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public async incrementLoginAttempts(): Promise<void> {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockedUntil && this.lockedUntil < new Date()) {
      await this.update({
        lockedUntil: null,
        loginAttempts: 1
      });
      return;
    }

    const updates: any = { loginAttempts: this.loginAttempts + 1 };
    
    // If we have 5 failed attempts and are not locked yet, lock account
    if (this.loginAttempts + 1 >= 5 && !this.lockedUntil) {
      updates.lockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    }
    
    await this.update(updates);
  }

  public async resetLoginAttempts(): Promise<void> {
    await this.update({
      loginAttempts: 0,
      lockedUntil: null
    });
  }

  // Helper methods for JSON serialization
  public toJSON(): any {
    const values = Object.assign({}, this.get());
    delete values.password;
    
    // Parse JSON fields
    try {
      values.topics = JSON.parse(values.topics || '[]');
      values.badges = JSON.parse(values.badges || '[]');
      values.subscriptionFeatures = JSON.parse(values.subscriptionFeatures || '["basic_activities", "progress_tracking"]');
    } catch (error) {
      // Keep as strings if parsing fails
    }
    
    return values;
  }
}

// Define the model
User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255],
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
      is: /^[a-zA-Z0-9_]+$/,
    },
  },
  role: {
    type: DataTypes.ENUM('parent', 'child', 'educator', 'admin'),
    allowNull: false,
    defaultValue: 'parent',
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 50],
    },
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 50],
    },
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 3,
      max: 12,
    },
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  language: {
    type: DataTypes.ENUM('en', 'ar', 'ml', 'es', 'fr'),
    allowNull: false,
    defaultValue: 'en',
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'easy',
  },
  topics: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    comment: 'JSON array of topic strings',
  },
  totalActivitiesCompleted: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  currentLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  badges: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    comment: 'JSON array of badge strings',
  },
  streakDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  lastActiveDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  subscriptionType: {
    type: DataTypes.ENUM('free', 'premium', 'family'),
    allowNull: false,
    defaultValue: 'free',
  },
  subscriptionExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subscriptionFeatures: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '["basic_activities", "progress_tracking"]',
    comment: 'JSON array of feature strings',
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['username']
    },
    {
      fields: ['role']
    },
    {
      fields: ['emailVerified']
    },
  ],
  hooks: {
    beforeCreate: async (user: User) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user: User) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

export default User;