import jwt from 'jsonwebtoken';
import { UserMongo, IUser } from '../models/UserMongo';
import { initializeDefaultPermissions } from '../models/Permission';
import { emailService } from './emailService';
import { logger } from '../utils/logger';

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  role?: 'parent' | 'child' | 'educator' | 'admin';
  firstName: string;
  lastName: string;
  age?: number;
  grade?: string;
  language?: string;
  invitedBy?: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    user: any;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  message?: string;
  error?: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'play-learn-spark-secret';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'play-learn-spark-refresh-secret';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  private readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  constructor() {
    // Initialize default permissions on service startup
    this.initializePermissions();
  }

  private async initializePermissions() {
    try {
      await initializeDefaultPermissions();
    } catch (error) {
      logger.error('Failed to initialize permissions:', error);
    }
  }

  /**
   * Generate access token
   */
  generateAccessToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isGuest: user.metadata.isGuest
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user._id,
        type: 'refresh'
      },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.JWT_REFRESH_EXPIRES_IN }
    );
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<LoginResponse> {
    try {
      // Check if user already exists
      const existingUserByEmail = await UserMongo.findByEmail(userData.email);
      if (existingUserByEmail) {
        return {
          success: false,
          error: 'Email is already registered'
        };
      }

      const existingUserByUsername = await UserMongo.findByUsername(userData.username);
      if (existingUserByUsername) {
        return {
          success: false,
          error: 'Username is already taken'
        };
      }

      // Set default subscription features based on role
      const defaultFeatures = this.getDefaultFeatures(userData.role || 'parent');

      // Create new user
      const user = new UserMongo({
        email: userData.email.toLowerCase(),
        password: userData.password,
        username: userData.username,
        role: userData.role || 'parent',
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          age: userData.age,
          grade: userData.grade
        },
        preferences: {
          language: userData.language || 'en',
          difficulty: userData.age && userData.age <= 4 ? 'easy' : 'medium',
          topics: [],
          notifications: {
            email: true,
            push: true,
            assignments: true,
            progress: true,
            achievements: true,
            reminders: true
          },
          privacy: {
            profileVisible: true,
            progressVisible: true,
            allowMessages: true
          },
          accessibility: {
            highContrast: false,
            largeText: false,
            screenReader: false,
            reducedMotion: false
          }
        },
        progress: {
          totalActivitiesCompleted: 0,
          currentLevel: 1,
          totalPoints: 0,
          badges: [],
          streakDays: 0,
          lastActiveDate: new Date(),
          achievements: []
        },
        subscription: {
          type: 'free',
          features: defaultFeatures,
          trialUsed: false
        },
        verification: {
          email: false,
          parentVerification: false,
          teacherVerification: false,
          identityVerified: false
        },
        security: {
          loginAttempts: 0,
          lastLogin: new Date(),
          twoFactorEnabled: false,
          sessionTimeoutMinutes: 60
        },
        metadata: {
          isGuest: false,
          invitedBy: userData.invitedBy,
          source: 'web',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActiveAt: new Date()
        }
      });

      // Generate email verification token
      const emailToken = user.generateEmailToken();
      await user.save();

      // Send verification email
      try {
        await this.sendVerificationEmail(user, emailToken);
      } catch (emailError) {
        logger.warn('Failed to send verification email:', emailError);
        // Don't fail registration if email sending fails
      }

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`New user registered: ${userData.email} (${userData.role})`);

      return {
        success: true,
        data: {
          user: user.toSafeObject(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      };
    } catch (error) {
      logger.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Find user by email and include password for comparison
      const user = await UserMongo.findOne({ email: email.toLowerCase() }).select('+password');
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check if account is locked
      if (user.isLocked()) {
        const lockTimeRemaining = Math.ceil((user.security.lockedUntil!.getTime() - Date.now()) / (1000 * 60));
        return {
          success: false,
          error: `Account is locked. Please try again in ${lockTimeRemaining} minutes.`
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incrementLoginAttempts();
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Reset login attempts on successful login
      if (user.security.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login and activity
      user.security.lastLogin = new Date();
      user.metadata.lastActiveAt = new Date();
      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`User logged in: ${email} (${user.role})`);

      return {
        success: true,
        data: {
          user: user.toSafeObject(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Guest login
   */
  async loginAsGuest(name: string, grade?: string): Promise<LoginResponse> {
    try {
      if (!name || !name.trim()) {
        return {
          success: false,
          error: 'Name is required for guest access'
        };
      }

      // Create a temporary guest user
      const guestUser = new UserMongo({
        email: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@guest.playlearnspark.com`,
        password: Math.random().toString(36).substring(2, 15), // Random password for guest
        username: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        role: 'guest',
        profile: {
          firstName: name.trim(),
          lastName: 'Guest',
          grade: grade || ''
        },
        preferences: {
          language: 'en',
          difficulty: 'easy',
          topics: [],
          notifications: {
            email: false,
            push: false,
            assignments: false,
            progress: false,
            achievements: false,
            reminders: false
          },
          privacy: {
            profileVisible: false,
            progressVisible: false,
            allowMessages: false
          },
          accessibility: {
            highContrast: false,
            largeText: false,
            screenReader: false,
            reducedMotion: false
          }
        },
        progress: {
          totalActivitiesCompleted: 0,
          currentLevel: 1,
          totalPoints: 0,
          badges: [],
          streakDays: 0,
          lastActiveDate: new Date(),
          achievements: []
        },
        subscription: {
          type: 'free',
          features: ['basic_activities', 'offline_mode'],
          trialUsed: false
        },
        verification: {
          email: false,
          parentVerification: false,
          teacherVerification: false,
          identityVerified: false
        },
        security: {
          loginAttempts: 0,
          lastLogin: new Date(),
          twoFactorEnabled: false,
          sessionTimeoutMinutes: 30 // Shorter session for guests
        },
        metadata: {
          isGuest: true,
          source: 'web',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActiveAt: new Date()
        }
      });

      await guestUser.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(guestUser);
      const refreshToken = this.generateRefreshToken(guestUser);

      logger.info(`Guest user created: ${name} (Grade: ${grade || 'not specified'})`);

      return {
        success: true,
        data: {
          user: guestUser.toSafeObject(),
          tokens: {
            accessToken,
            refreshToken
          }
        }
      };
    } catch (error) {
      logger.error('Guest login error:', error);
      return {
        success: false,
        error: 'Guest login failed. Please try again.'
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ success: boolean; data?: { accessToken: string }; error?: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;
      
      if (decoded.type !== 'refresh') {
        return {
          success: false,
          error: 'Invalid refresh token'
        };
      }

      const user = await UserMongo.findById(decoded.userId);
      if (!user) {
        return {
          success: false,
          error: 'Invalid refresh token: User not found'
        };
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      return {
        success: true,
        data: {
          accessToken: newAccessToken
        }
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Invalid refresh token'
      };
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const user = await UserMongo.findOne({ 
        'verification.emailToken': token,
        'verification.emailTokenExpiry': { $gt: new Date() }
      });

      if (!user) {
        return {
          success: false,
          error: 'Invalid or expired verification token'
        };
      }

      user.verification.email = true;
      user.verification.emailToken = undefined;
      user.verification.emailTokenExpiry = undefined;
      await user.save();

      logger.info(`Email verified for user: ${user.email}`);

      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      logger.error('Email verification error:', error);
      return {
        success: false,
        error: 'Email verification failed'
      };
    }
  }

  /**
   * Send verification email
   */
  private async sendVerificationEmail(user: IUser, token: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    await emailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Play Learn Spark',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Play Learn Spark, ${user.profile.firstName}!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
        </div>
      `
    });
  }

  /**
   * Get default features based on role
   */
  private getDefaultFeatures(role: string): string[] {
    const features = {
      admin: ['*'],
      educator: ['create_activity', 'manage_class', 'view_analytics', 'assign_activities', 'grade_assignments'],
      parent: ['view_child_progress', 'basic_activities', 'progress_tracking', 'communication'],
      child: ['basic_activities', 'progress_tracking', 'achievements'],
      guest: ['basic_activities', 'offline_mode']
    };

    return features[role as keyof typeof features] || features.child;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const user = await UserMongo.findById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Update profile fields
      if (updates.firstName) user.profile.firstName = updates.firstName;
      if (updates.lastName) user.profile.lastName = updates.lastName;
      if (updates.age !== undefined) user.profile.age = updates.age;
      if (updates.grade !== undefined) user.profile.grade = updates.grade;
      if (updates.avatarUrl !== undefined) user.profile.avatarUrl = updates.avatarUrl;
      if (updates.bio !== undefined) user.profile.bio = updates.bio;

      // Update preferences
      if (updates.language) user.preferences.language = updates.language;
      if (updates.difficulty) user.preferences.difficulty = updates.difficulty;
      if (updates.topics) user.preferences.topics = updates.topics;

      user.metadata.updatedAt = new Date();
      await user.save();

      logger.info(`Profile updated for user: ${user.email}`);

      return {
        success: true,
        data: {
          user: user.toSafeObject()
        }
      };
    } catch (error) {
      logger.error('Profile update error:', error);
      return {
        success: false,
        error: 'Profile update failed'
      };
    }
  }
}

export const authService = new AuthService();
export default authService;