import * as bcrypt from 'bcryptjs';

export interface User {
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

class UserStore {
  private users: Map<number, User> = new Map();
  private emailIndex: Map<string, number> = new Map();
  private usernameIndex: Map<string, number> = new Map();
  private nextId = 1;

  async create(userData: Omit<User, 'id' | 'password' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const now = new Date();
    
    const user: User = {
      ...userData,
      id: this.nextId++,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);
    this.usernameIndex.set(user.username, user.id);

    return { ...user };
  }

  async findByPk(id: number): Promise<User | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async findOne(options: { where: any }): Promise<User | null> {
    if (options.where.email) {
      const id = this.emailIndex.get(options.where.email);
      return id ? this.findByPk(id) : null;
    }
    
    if (options.where.username) {
      const id = this.usernameIndex.get(options.where.username);
      return id ? this.findByPk(id) : null;
    }

    // For OR conditions (email or username) - check both patterns
    const orConditions = options.where[Symbol.for('Op.or')] || options.where['$or'];
    if (orConditions && Array.isArray(orConditions)) {
      for (const condition of orConditions) {
        if (condition.email) {
          const id = this.emailIndex.get(condition.email);
          if (id) return this.findByPk(id);
        }
        if (condition.username) {
          const id = this.usernameIndex.get(condition.username);
          if (id) return this.findByPk(id);
        }
      }
    }

    return null;
  }

  async findAll(options?: any): Promise<User[]> {
    return Array.from(this.users.values()).map(user => ({ ...user }));
  }

  async update(id: number, updates: Partial<User>): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;

    Object.assign(user, updates, { updatedAt: new Date() });
    return true;
  }

  async save(user: User): Promise<User> {
    user.updatedAt = new Date();
    this.users.set(user.id, { ...user });
    return { ...user };
  }

  async comparePassword(user: User, candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, user.password);
  }

  async incrementLoginAttempts(user: User): Promise<void> {
    const updates: Partial<User> = { loginAttempts: user.loginAttempts + 1 };
    
    // If we have 5 failed attempts and are not locked yet, lock account
    if (user.loginAttempts + 1 >= 5 && !user.lockedUntil) {
      updates.lockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    }
    
    await this.update(user.id, updates);
  }

  async resetLoginAttempts(user: User): Promise<void> {
    await this.update(user.id, {
      loginAttempts: 0,
      lockedUntil: undefined,
    });
  }
}

// Create a singleton instance
export const userStore = new UserStore();

// User class that works with the store
export class UserModel {
  constructor(private data: User) {}

  static async create(userData: Omit<User, 'id' | 'password' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<UserModel> {
    const user = await userStore.create(userData);
    return new UserModel(user);
  }

  static async findByPk(id: number): Promise<UserModel | null> {
    const user = await userStore.findByPk(id);
    return user ? new UserModel(user) : null;
  }

  static async findOne(options: { where: any }): Promise<UserModel | null> {
    const user = await userStore.findOne(options);
    return user ? new UserModel(user) : null;
  }

  static async findAll(options?: any): Promise<UserModel[]> {
    const users = await userStore.findAll(options);
    return users.map(user => new UserModel(user));
  }

  async save(): Promise<UserModel> {
    const updated = await userStore.save(this.data);
    this.data = updated;
    return this;
  }

  async update(updates: Partial<User>): Promise<void> {
    await userStore.update(this.data.id, updates);
    Object.assign(this.data, updates, { updatedAt: new Date() });
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return userStore.comparePassword(this.data, candidatePassword);
  }

  async incrementLoginAttempts(): Promise<void> {
    await userStore.incrementLoginAttempts(this.data);
    this.data.loginAttempts += 1;
    if (this.data.loginAttempts >= 5) {
      this.data.lockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
    }
  }

  async resetLoginAttempts(): Promise<void> {
    await userStore.resetLoginAttempts(this.data);
    this.data.loginAttempts = 0;
    this.data.lockedUntil = undefined;
  }

  // Getters for all properties
  get id() { return this.data.id; }
  get email() { return this.data.email; }
  get password() { return this.data.password; }
  get username() { return this.data.username; }
  get role() { return this.data.role; }
  get firstName() { return this.data.firstName; }
  get lastName() { return this.data.lastName; }
  get age() { return this.data.age; }
  get avatarUrl() { return this.data.avatarUrl; }
  get language() { return this.data.language; }
  get difficulty() { return this.data.difficulty; }
  get topics() { return this.data.topics; }
  get totalActivitiesCompleted() { return this.data.totalActivitiesCompleted; }
  get currentLevel() { return this.data.currentLevel; }
  get totalPoints() { return this.data.totalPoints; }
  get badges() { return this.data.badges; }
  get streakDays() { return this.data.streakDays; }
  get lastActiveDate() { return this.data.lastActiveDate; }
  get subscriptionType() { return this.data.subscriptionType; }
  get subscriptionExpiresAt() { return this.data.subscriptionExpiresAt; }
  get features() { return this.data.features; }
  get emailVerified() { return this.data.emailVerified; }
  get lastLogin() { return this.data.lastLogin; }
  get loginAttempts() { return this.data.loginAttempts; }
  get lockedUntil() { return this.data.lockedUntil; }
  get passwordResetToken() { return this.data.passwordResetToken; }
  get passwordResetExpires() { return this.data.passwordResetExpires; }
  get childrenIds() { return this.data.childrenIds; }
  get createdAt() { return this.data.createdAt; }
  get updatedAt() { return this.data.updatedAt; }

  // Setters for editable properties
  set firstName(value: string) { this.data.firstName = value; }
  set lastName(value: string) { this.data.lastName = value; }
  set age(value: number | undefined) { this.data.age = value; }
  set avatarUrl(value: string | undefined) { this.data.avatarUrl = value; }
  set language(value: string) { this.data.language = value; }
  set difficulty(value: 'easy' | 'medium' | 'hard') { this.data.difficulty = value; }
  set topics(value: string) { this.data.topics = value; }
  set lastLogin(value: Date) { this.data.lastLogin = value; }
  set password(value: string) { 
    // Hash the password when setting it
    bcrypt.hash(value, 10).then(hash => {
      this.data.password = hash;
    });
  }
}