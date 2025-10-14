import { DataTypes, Model, Optional } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';

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
  features: string;
  emailVerified: boolean;
  lastLogin: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  childrenIds: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

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
  public features!: string;
  public emailVerified!: boolean;
  public lastLogin!: Date;
  public loginAttempts!: number;
  public lockedUntil?: Date;
  public passwordResetToken?: string;
  public passwordResetExpires?: Date;
  public childrenIds!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public async incrementLoginAttempts(): Promise<void> {
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
      lockedUntil: undefined,
    });
  }
}

User.init(
  {
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
      get() {
        const value = this.getDataValue('topics');
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue('topics', JSON.stringify(value));
      },
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
      get() {
        const value = this.getDataValue('badges');
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue('badges', JSON.stringify(value));
      },
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
    features: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '["basic_activities", "progress_tracking"]',
      get() {
        const value = this.getDataValue('features');
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue('features', JSON.stringify(value));
      },
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
    childrenIds: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('childrenIds');
        return value ? JSON.parse(value) : [];
      },
      set(value: number[]) {
        this.setDataValue('childrenIds', JSON.stringify(value));
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['emailVerified'] },
      { fields: ['role'] },
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
  }
);

export default User;