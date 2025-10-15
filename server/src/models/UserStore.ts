import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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

export interface Session {
  id: string;
  userId: number;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordReset {
  id: string;
  userId: number;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ageRange: string;
  category: string;
  tags: string[];
  estimatedTime: number;
  aiGenerated: boolean;
  sourceContent?: string;
  createdBy: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityCompletion {
  id: number;
  userId: number;
  activityId: number;
  score: number;
  completed: boolean;
  timeSpent: number;
  attempts: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Progress {
  id: number;
  userId: number;
  totalActivitiesCompleted: number;
  totalTimeSpent: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  badges: string[];
  lastActivityDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class UserStore {
  private users: Map<number, User> = new Map();
  private emailIndex: Map<string, number> = new Map();
  private usernameIndex: Map<string, number> = new Map();
  private nextId = 1;

  constructor() {
    this.seedInitialData();
  }

  private async seedInitialData() {
    // Create admin user
    await this.create({
      email: 'admin@playlearnspark.com',
      password: 'admin123',
      username: 'admin',
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      language: 'en',
      difficulty: 'medium',
      topics: '[]',
      totalActivitiesCompleted: 0,
      currentLevel: 1,
      totalPoints: 0,
      badges: '[]',
      streakDays: 0,
      lastActiveDate: new Date(),
      subscriptionType: 'premium',
      features: '["all_features"]',
      emailVerified: true,
      lastLogin: new Date(),
      loginAttempts: 0,
      childrenIds: '[]',
    });

    // Create demo parent
    const parent = await this.create({
      email: 'parent@example.com',
      password: 'parent123',
      username: 'demo_parent',
      role: 'parent',
      firstName: 'Demo',
      lastName: 'Parent',
      language: 'en',
      difficulty: 'medium',
      topics: '[]',
      totalActivitiesCompleted: 0,
      currentLevel: 1,
      totalPoints: 0,
      badges: '[]',
      streakDays: 0,
      lastActiveDate: new Date(),
      subscriptionType: 'free',
      features: '["basic_activities", "progress_tracking"]',
      emailVerified: true,
      lastLogin: new Date(),
      loginAttempts: 0,
      childrenIds: '[]',
    });

    // Create demo child
    const child = await this.create({
      email: 'child@example.com',
      password: 'child123',
      username: 'demo_child',
      role: 'child',
      firstName: 'Demo',
      lastName: 'Child',
      age: 8,
      language: 'en',
      difficulty: 'easy',
      topics: '["math", "reading"]',
      totalActivitiesCompleted: 5,
      currentLevel: 2,
      totalPoints: 150,
      badges: '["first_activity", "math_star"]',
      streakDays: 3,
      lastActiveDate: new Date(),
      subscriptionType: 'free',
      features: '["basic_activities"]',
      emailVerified: true,
      lastLogin: new Date(),
      loginAttempts: 0,
      childrenIds: '[]',
    });

    // Update parent's children
    if (parent && child) {
      await this.update(parent.id, {
        childrenIds: JSON.stringify([child.id])
      });
    }
  }

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

  async createPasswordResetToken(userId: number): Promise<string> {
    const token = uuidv4();
    const user = this.users.get(userId);
    if (user) {
      await this.update(userId, {
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });
    }
    return token;
  }

  async validatePasswordResetToken(token: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.passwordResetToken === token && 
          user.passwordResetExpires && 
          user.passwordResetExpires > new Date()) {
        return { ...user };
      }
    }
    return null;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.validatePasswordResetToken(token);
    if (!user) return false;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.update(user.id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      loginAttempts: 0,
      lockedUntil: undefined
    });

    return true;
  }
}

class ActivityStore {
  private activities: Map<number, Activity> = new Map();
  private nextId = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Create sample activities
    this.create({
      title: 'Basic Addition',
      description: 'Learn to add numbers from 1 to 10',
      content: JSON.stringify({
        type: 'math',
        exercises: [
          { question: '2 + 3 = ?', answer: 5 },
          { question: '4 + 1 = ?', answer: 5 },
          { question: '3 + 4 = ?', answer: 7 }
        ]
      }),
      difficulty: 'easy',
      ageRange: '5-7',
      category: 'Math',
      tags: ['addition', 'numbers', 'basic'],
      estimatedTime: 15,
      aiGenerated: false,
      createdBy: 1, // admin user
      isPublic: true
    });

    this.create({
      title: 'Reading Comprehension',
      description: 'Read short stories and answer questions',
      content: JSON.stringify({
        type: 'reading',
        story: 'The cat sat on the mat. The cat was happy.',
        questions: [
          { question: 'Where did the cat sit?', answer: 'on the mat' },
          { question: 'How did the cat feel?', answer: 'happy' }
        ]
      }),
      difficulty: 'easy',
      ageRange: '6-8',
      category: 'Reading',
      tags: ['reading', 'comprehension', 'stories'],
      estimatedTime: 20,
      aiGenerated: false,
      createdBy: 1,
      isPublic: true
    });

    this.create({
      title: 'Shape Recognition',
      description: 'Identify different shapes and their properties',
      content: JSON.stringify({
        type: 'shapes',
        shapes: [
          { name: 'circle', sides: 0, corners: 0 },
          { name: 'triangle', sides: 3, corners: 3 },
          { name: 'square', sides: 4, corners: 4 }
        ]
      }),
      difficulty: 'easy',
      ageRange: '4-6',
      category: 'Geometry',
      tags: ['shapes', 'geometry', 'visual'],
      estimatedTime: 10,
      aiGenerated: false,
      createdBy: 1,
      isPublic: true
    });
  }

  async create(activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
    const now = new Date();
    
    const activity: Activity = {
      ...activityData,
      id: this.nextId++,
      createdAt: now,
      updatedAt: now,
    };

    this.activities.set(activity.id, activity);
    return { ...activity };
  }

  async findByPk(id: number): Promise<Activity | null> {
    const activity = this.activities.get(id);
    return activity ? { ...activity } : null;
  }

  async findAll(options?: { where?: any; limit?: number; offset?: number }): Promise<Activity[]> {
    let activities = Array.from(this.activities.values());
    
    if (options?.where) {
      if (options.where.category) {
        activities = activities.filter(a => a.category === options.where.category);
      }
      if (options.where.difficulty) {
        activities = activities.filter(a => a.difficulty === options.where.difficulty);
      }
      if (options.where.isPublic !== undefined) {
        activities = activities.filter(a => a.isPublic === options.where.isPublic);
      }
    }

    if (options?.offset) {
      activities = activities.slice(options.offset);
    }
    
    if (options?.limit) {
      activities = activities.slice(0, options.limit);
    }

    return activities.map(activity => ({ ...activity }));
  }

  async update(id: number, updates: Partial<Activity>): Promise<boolean> {
    const activity = this.activities.get(id);
    if (!activity) return false;

    Object.assign(activity, updates, { updatedAt: new Date() });
    return true;
  }

  async delete(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }
}

class ActivityCompletionStore {
  private completions: Map<string, ActivityCompletion> = new Map(); // key: userId-activityId
  private nextId = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Create sample completions for demo child
    this.create({
      userId: 3, // demo child
      activityId: 1,
      score: 85,
      completed: true,
      timeSpent: 300, // 5 minutes
      attempts: 1,
      completedAt: new Date()
    });

    this.create({
      userId: 3,
      activityId: 2,
      score: 92,
      completed: true,
      timeSpent: 420, // 7 minutes
      attempts: 2,
      completedAt: new Date()
    });
  }

  private getKey(userId: number, activityId: number): string {
    return `${userId}-${activityId}`;
  }

  async create(completionData: Omit<ActivityCompletion, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActivityCompletion> {
    const now = new Date();
    
    const completion: ActivityCompletion = {
      ...completionData,
      id: this.nextId++,
      createdAt: now,
      updatedAt: now,
    };

    const key = this.getKey(completion.userId, completion.activityId);
    this.completions.set(key, completion);
    return { ...completion };
  }

  async findOne(options: { where: { userId: number; activityId: number } }): Promise<ActivityCompletion | null> {
    const key = this.getKey(options.where.userId, options.where.activityId);
    const completion = this.completions.get(key);
    return completion ? { ...completion } : null;
  }

  async findAll(options: { where: { userId: number } }): Promise<ActivityCompletion[]> {
    return Array.from(this.completions.values())
      .filter(c => c.userId === options.where.userId)
      .map(completion => ({ ...completion }));
  }

  async update(userId: number, activityId: number, updates: Partial<ActivityCompletion>): Promise<boolean> {
    const key = this.getKey(userId, activityId);
    const completion = this.completions.get(key);
    if (!completion) return false;

    Object.assign(completion, updates, { updatedAt: new Date() });
    return true;
  }

  async upsert(completionData: Omit<ActivityCompletion, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActivityCompletion> {
    const existing = await this.findOne({
      where: { userId: completionData.userId, activityId: completionData.activityId }
    });

    if (existing) {
      await this.update(completionData.userId, completionData.activityId, completionData);
      return await this.findOne({
        where: { userId: completionData.userId, activityId: completionData.activityId }
      }) || existing;
    } else {
      return await this.create(completionData);
    }
  }

  findByUserId(userId: number): ActivityCompletion[] {
    return Array.from(this.completions.values())
      .filter(c => c.userId === userId)
      .map(completion => ({ ...completion }));
  }
}

class ProgressStore {
  private progress: Map<number, Progress> = new Map(); // key: userId
  private nextId = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Create progress for all users
    this.create({
      userId: 1, // admin
      totalActivitiesCompleted: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      experience: 0,
      badges: []
    });

    this.create({
      userId: 2, // parent
      totalActivitiesCompleted: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      experience: 0,
      badges: []
    });

    this.create({
      userId: 3, // child
      totalActivitiesCompleted: 2,
      totalTimeSpent: 720, // 12 minutes
      averageScore: 88.5,
      currentStreak: 2,
      longestStreak: 2,
      level: 2,
      experience: 180,
      badges: ['first_activity', 'quick_learner'],
      lastActivityDate: new Date()
    });
  }

  async create(progressData: Omit<Progress, 'id' | 'createdAt' | 'updatedAt'>): Promise<Progress> {
    const now = new Date();
    
    const progress: Progress = {
      ...progressData,
      id: this.nextId++,
      createdAt: now,
      updatedAt: now,
    };

    this.progress.set(progress.userId, progress);
    return { ...progress };
  }

  async update(userId: number, updates: Partial<Progress>): Promise<boolean> {
    const progress = this.progress.get(userId);
    if (!progress) return false;

    Object.assign(progress, updates, { updatedAt: new Date() });
    return true;
  }

  async updateActivityCompletion(userId: number, score: number, timeSpent: number): Promise<void> {
    const progress = this.progress.get(userId);
    if (!progress) {
      // Create new progress if doesn't exist
      await this.create({
        userId,
        totalActivitiesCompleted: 1,
        totalTimeSpent: timeSpent,
        averageScore: score,
        currentStreak: 1,
        longestStreak: 1,
        level: 1,
        experience: score,
        badges: score >= 80 ? ['first_activity'] : [],
        lastActivityDate: new Date()
      });
      return;
    }

    const totalActivities = progress.totalActivitiesCompleted + 1;
    const totalTime = progress.totalTimeSpent + timeSpent;
    const newAverage = ((progress.averageScore * progress.totalActivitiesCompleted) + score) / totalActivities;
    
    // Calculate streak
    const lastActivityDate = progress.lastActivityDate;
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    let currentStreak = progress.currentStreak;
    if (!lastActivityDate || lastActivityDate.toDateString() === yesterday.toDateString()) {
      currentStreak += 1;
    } else if (lastActivityDate.toDateString() !== today.toDateString()) {
      currentStreak = 1;
    }

    const longestStreak = Math.max(progress.longestStreak, currentStreak);
    
    // Calculate level and experience
    const experience = progress.experience + score;
    const level = Math.floor(experience / 100) + 1;

    // Award badges
    const badges = [...progress.badges];
    if (!badges.includes('first_activity') && totalActivities === 1) {
      badges.push('first_activity');
    }
    if (!badges.includes('streak_master') && currentStreak >= 7) {
      badges.push('streak_master');
    }
    if (!badges.includes('high_scorer') && newAverage >= 90) {
      badges.push('high_scorer');
    }

    await this.update(userId, {
      totalActivitiesCompleted: totalActivities,
      totalTimeSpent: totalTime,
      averageScore: newAverage,
      currentStreak,
      longestStreak,
      level,
      experience,
      badges,
      lastActivityDate: new Date()
    });
  }

  async resetProgress(userId: number): Promise<boolean> {
    return await this.update(userId, {
      totalActivitiesCompleted: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      currentStreak: 0,
      level: 1,
      experience: 0,
      badges: [],
      lastActivityDate: undefined
    });
  }

  findByUserId(userId: number): Progress | null {
    const progress = this.progress.get(userId);
    return progress ? { ...progress } : null;
  }
}

// Create singleton instances
export const userStore = new UserStore();
export const activityStore = new ActivityStore();
export const activityCompletionStore = new ActivityCompletionStore();
export const progressStore = new ProgressStore();