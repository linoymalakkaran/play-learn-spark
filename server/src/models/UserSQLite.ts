import { DataTypes, Model, Optional } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { sequelize } from '../config/database-sqlite';

export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  username: string;
  role: 'parent' | 'child' | 'educator' | 'admin' | 'guest';
  firstName: string;
  lastName: string;
  age?: number;
  grade?: string;
  isGuest: boolean;
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
  public role!: 'parent' | 'child' | 'educator' | 'admin' | 'guest';
  public firstName!: string;
  public lastName!: string;
  public age?: number;
  public grade?: string;
  public isGuest!: boolean;
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
  public async validatePassword(password: string): Promise<boolean> {
    // Temporarily use plain text comparison for testing
    return password === this.password;
    // return bcrypt.compare(password, this.password);
  }

  public isLocked(): boolean {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
  }

  public async incrementLoginAttempts(): Promise<void> {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockedUntil && this.lockedUntil < new Date()) {
      await this.update({
        loginAttempts: 1,
        lockedUntil: undefined,
      });
      return;
    }

    const updates: Partial<UserAttributes> = { loginAttempts: this.loginAttempts + 1 };

    // Lock the account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
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

  // Static methods
  public static async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email: email.toLowerCase() } });
  }

  public static async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  }

  public static async createUser(userData: UserCreationAttributes): Promise<User> {
    return this.create({
      ...userData,
      email: userData.email.toLowerCase(),
      loginAttempts: 0,
      lockedUntil: undefined,
    });
  }

  // Association methods
  public static associate() {
    // Define associations here if needed
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
      set(value: string) {
        this.setDataValue('email', value.toLowerCase());
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
        len: [3, 50],
      },
    },
    role: {
      type: DataTypes.ENUM('parent', 'child', 'educator', 'admin', 'guest'),
      allowNull: false,
      defaultValue: 'parent',
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
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
    grade: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isGuest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
        try {
          return value ? JSON.parse(value) : [];
        } catch {
          return [];
        }
      },
      set(value: string[] | string) {
        if (typeof value === 'string') {
          this.setDataValue('topics', value);
        } else {
          this.setDataValue('topics', JSON.stringify(value));
        }
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
        try {
          return value ? JSON.parse(value) : [];
        } catch {
          return [];
        }
      },
      set(value: string[] | string) {
        if (typeof value === 'string') {
          this.setDataValue('badges', value);
        } else {
          this.setDataValue('badges', JSON.stringify(value));
        }
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
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('features');
        try {
          return value ? JSON.parse(value) : [];
        } catch {
          return [];
        }
      },
      set(value: string[] | string) {
        if (typeof value === 'string') {
          this.setDataValue('features', value);
        } else {
          this.setDataValue('features', JSON.stringify(value));
        }
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
        try {
          return value ? JSON.parse(value) : [];
        } catch {
          return [];
        }
      },
      set(value: number[] | string) {
        if (typeof value === 'string') {
          this.setDataValue('childrenIds', value);
        } else {
          this.setDataValue('childrenIds', JSON.stringify(value));
        }
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['username'], unique: true },
      { fields: ['emailVerified'] },
      { fields: ['role'] },
      { fields: ['lastActiveDate'] },
      { fields: ['subscriptionType'] },
    ],
    // Temporarily disable password hashing for testing
    // hooks: {
    //   beforeCreate: async (user: User) => {
    //     if (user.password) {
    //       const salt = await bcrypt.genSalt(12);
    //       user.password = await bcrypt.hash(user.password, salt);
    //     }
    //   },
    //   beforeUpdate: async (user: User) => {
    //     if (user.changed('password')) {
    //       const salt = await bcrypt.genSalt(12);
    //       user.password = await bcrypt.hash(user.password, salt);
    //     }
    //   },
    // },
  }
);

export default User;