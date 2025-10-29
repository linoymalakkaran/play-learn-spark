# Educational Platform Enhancement - Implementation Plan by Batch

## Executive Summary

This document outlines the implementation plan for transforming the existing Play-Learn-Spark educational platform from a SQLite-based single-user system to a comprehensive multi-role MongoDB-based platform supporting students, parents, and teachers.

## Current System Analysis

### Existing SQLite Database Schema

Based on code analysis, the current system includes these main entities:

**User (SQLite)**
- Basic user management with roles: `parent`, `child`, `educator`, `admin`, `guest`
- Authentication with JWT tokens
- Profile information (firstName, lastName, age, grade)
- Progress tracking (totalActivitiesCompleted, currentLevel, totalPoints, badges)
- Subscription management (free, premium, family)
- Parent-child relationships via `childrenIds` JSON field

**Activity (SQLite)**
- Educational activities with categories (alphabet, numbers, shapes, etc.)
- Multi-language support (en, ar, ml, es, fr)
- Difficulty levels and age ranges
- AI-generated content support
- Creator tracking and status management

**Progress (SQLite)**
- Individual activity progress per user
- Attempt tracking with JSON data
- Mastery levels and achievements
- Time tracking and streak counts

**Supporting Tables**
- Sessions (authentication)
- PasswordReset (password recovery)
- RewardCard, RewardItem, RewardRedemption (gamification)
- Achievement (badges and accomplishments)
- Feedback (user feedback)

### Current Frontend Architecture

**Technology Stack**
- React 18 with TypeScript
- Vite build system
- Tailwind CSS with Radix UI components
- React Router for navigation
- Zustand for state management
- React Query for API state

**Key Components**
- Dashboard with activity management
- Multi-language learning modules
- Authentication system (login, register, guest)
- Progress tracking and analytics
- Reward system
- Admin panel for user management

## Migration Strategy

### Database Migration Approach
1. **Gradual Migration**: Maintain SQLite during transition
2. **Data Integrity**: Validate all data transfers
3. **Rollback Capability**: Maintain fallback to SQLite
4. **Zero-Downtime**: Implement blue-green deployment

---

## Batch Implementation Plan

### **Batch 1: Multi-Role Authentication & Authorization System**
**Duration:** 2 weeks  
**Dependencies:** None (Foundation batch)  

#### **Week 1: Backend Implementation**

##### **Day 1-2: MongoDB Schema & Models Setup**

1. **Create MongoDB User Schema**
   - **File:** `server/src/models/UserMongo.ts`
   ```typescript
   import { Schema, model, Document, ObjectId } from 'mongoose';
   import bcrypt from 'bcryptjs';

   export interface IUser extends Document {
     _id: ObjectId;
     email: string;
     password: string;
     username: string;
     role: 'student' | 'parent' | 'teacher' | 'admin';
     profile: {
       firstName: string;
       lastName: string;
       age?: number;
       grade?: string;
       avatarUrl?: string;
       bio?: string;
     };
     preferences: {
       language: 'en' | 'ar' | 'ml' | 'es' | 'fr';
       difficulty: 'easy' | 'medium' | 'hard';
       topics: string[];
       notifications: {
         email: boolean;
         push: boolean;
         assignments: boolean;
         progress: boolean;
       };
     };
     subscription: {
       type: 'free' | 'premium' | 'family';
       expiresAt?: Date;
       features: string[];
     };
     verification: {
       email: boolean;
       emailToken?: string;
       emailTokenExpiry?: Date;
       parentVerification?: boolean;
       teacherVerification?: boolean;
     };
     security: {
       loginAttempts: number;
       lockedUntil?: Date;
       lastLogin?: Date;
       passwordResetToken?: string;
       passwordResetExpiry?: Date;
     };
     metadata: {
       isGuest: boolean;
       createdAt: Date;
       updatedAt: Date;
       lastActiveAt: Date;
     };
     
     // Methods
     comparePassword(password: string): Promise<boolean>;
     generateEmailToken(): string;
     toSafeObject(): any;
   }

   const userSchema = new Schema<IUser>({
     email: { type: String, required: true, unique: true, lowercase: true },
     password: { type: String, required: true, minlength: 6 },
     username: { type: String, required: true, unique: true },
     role: { 
       type: String, 
       enum: ['student', 'parent', 'teacher', 'admin'], 
       required: true 
     },
     profile: {
       firstName: { type: String, required: true },
       lastName: { type: String, required: true },
       age: { type: Number, min: 3, max: 18 },
       grade: String,
       avatarUrl: String,
       bio: String
     },
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
       topics: [String],
       notifications: {
         email: { type: Boolean, default: true },
         push: { type: Boolean, default: true },
         assignments: { type: Boolean, default: true },
         progress: { type: Boolean, default: true }
       }
     },
     subscription: {
       type: { 
         type: String, 
         enum: ['free', 'premium', 'family'], 
         default: 'free' 
       },
       expiresAt: Date,
       features: [String]
     },
     verification: {
       email: { type: Boolean, default: false },
       emailToken: String,
       emailTokenExpiry: Date,
       parentVerification: { type: Boolean, default: false },
       teacherVerification: { type: Boolean, default: false }
     },
     security: {
       loginAttempts: { type: Number, default: 0 },
       lockedUntil: Date,
       lastLogin: Date,
       passwordResetToken: String,
       passwordResetExpiry: Date
     },
     metadata: {
       isGuest: { type: Boolean, default: false },
       createdAt: { type: Date, default: Date.now },
       updatedAt: { type: Date, default: Date.now },
       lastActiveAt: { type: Date, default: Date.now }
     }
   }, {
     timestamps: true,
     toJSON: { transform: function(doc, ret) { delete ret.password; return ret; } }
   });

   // Hash password before saving
   userSchema.pre('save', async function(next) {
     if (!this.isModified('password')) return next();
     this.password = await bcrypt.hash(this.password, 12);
     next();
   });

   // Instance methods
   userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
     return bcrypt.compare(password, this.password);
   };

   userSchema.methods.generateEmailToken = function(): string {
     const token = Math.random().toString(36).substring(2, 15);
     this.verification.emailToken = token;
     this.verification.emailTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
     return token;
   };

   userSchema.methods.toSafeObject = function() {
     const obj = this.toObject();
     delete obj.password;
     delete obj.security.passwordResetToken;
     delete obj.verification.emailToken;
     return obj;
   };

   export const UserMongo = model<IUser>('User', userSchema);
   ```

2. **Create Permission System**
   - **File:** `server/src/models/Permission.ts`
   ```typescript
   import { Schema, model, Document, ObjectId } from 'mongoose';

   export interface IPermission extends Document {
     name: string;
     resource: string;
     action: string;
     roles: string[];
     conditions?: any;
   }

   const permissionSchema = new Schema<IPermission>({
     name: { type: String, required: true, unique: true },
     resource: { type: String, required: true },
     action: { type: String, required: true },
     roles: [{ type: String, enum: ['student', 'parent', 'teacher', 'admin'] }],
     conditions: Schema.Types.Mixed
   });

   export const Permission = model<IPermission>('Permission', permissionSchema);
   ```

##### **Day 3-4: RBAC Middleware & Services**

1. **RBAC Middleware**
   - **File:** `server/src/middleware/rbac.ts`
   ```typescript
   import { Request, Response, NextFunction } from 'express';
   import { Permission } from '../models/Permission';
   import { UserMongo } from '../models/UserMongo';

   export interface AuthenticatedRequest extends Request {
     user?: any;
   }

   export const checkPermission = (resource: string, action: string) => {
     return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
       try {
         if (!req.user) {
           return res.status(401).json({ 
             success: false, 
             message: 'Authentication required' 
           });
         }

         const userRole = req.user.role;
         
         // Admin has all permissions
         if (userRole === 'admin') {
           return next();
         }

         // Check specific permission
         const permission = await Permission.findOne({
           resource,
           action,
           roles: userRole
         });

         if (!permission) {
           return res.status(403).json({
             success: false,
             message: 'Insufficient permissions'
           });
         }

         // Check conditions if any
         if (permission.conditions) {
           const conditionMet = await evaluateConditions(
             permission.conditions, 
             req.user, 
             req
           );
           
           if (!conditionMet) {
             return res.status(403).json({
               success: false,
               message: 'Permission conditions not met'
             });
           }
         }

         next();
       } catch (error) {
         console.error('Permission check error:', error);
         res.status(500).json({
           success: false,
           message: 'Permission check failed'
         });
       }
     };
   };

   const evaluateConditions = async (conditions: any, user: any, req: Request): Promise<boolean> => {
     // Implement condition evaluation logic
     // Example: owner can only access their own resources
     if (conditions.owner && req.params.userId) {
       return user._id.toString() === req.params.userId;
     }
     return true;
   };

   export const hasRole = (roles: string | string[]) => {
     return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
       if (!req.user) {
         return res.status(401).json({ 
           success: false, 
           message: 'Authentication required' 
         });
       }

       const allowedRoles = Array.isArray(roles) ? roles : [roles];
       
       if (!allowedRoles.includes(req.user.role)) {
         return res.status(403).json({
           success: false,
           message: 'Insufficient role permissions'
         });
       }

       next();
     };
   };
   ```

2. **Enhanced Auth Service**
   - **File:** `server/src/services/authService.ts`
   ```typescript
   import jwt from 'jsonwebtoken';
   import { UserMongo, IUser } from '../models/UserMongo';
   import { emailService } from './emailService';

   export class AuthService {
     private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
     private readonly JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
     private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

     async register(userData: {
       email: string;
       password: string;
       username: string;
       role: 'student' | 'parent' | 'teacher';
       profile: {
         firstName: string;
         lastName: string;
         age?: number;
         grade?: string;
       };
     }): Promise<{ user: IUser; tokens: any }> {
       
       // Check if user exists
       const existingUser = await UserMongo.findOne({
         $or: [{ email: userData.email }, { username: userData.username }]
       });

       if (existingUser) {
         throw new Error('User already exists');
       }

       // Create user
       const user = new UserMongo({
         email: userData.email,
         password: userData.password,
         username: userData.username,
         role: userData.role,
         profile: userData.profile,
         preferences: {
           language: 'en',
           difficulty: userData.profile.age && userData.profile.age <= 6 ? 'easy' : 'medium',
           topics: [],
           notifications: {
             email: true,
             push: true,
             assignments: true,
             progress: true
           }
         },
         subscription: {
           type: 'free',
           features: ['basic_activities']
         }
       });

       await user.save();

       // Generate email verification token
       const emailToken = user.generateEmailToken();
       await user.save();

       // Send verification email
       await emailService.sendVerificationEmail(user.email, emailToken, user.profile.firstName);

       // Generate tokens
       const tokens = this.generateTokens(user);

       return { user, tokens };
     }

     async login(email: string, password: string): Promise<{ user: IUser; tokens: any }> {
       const user = await UserMongo.findOne({ email: email.toLowerCase() }).select('+password');
       
       if (!user || !await user.comparePassword(password)) {
         throw new Error('Invalid credentials');
       }

       // Check if account is locked
       if (user.security.lockedUntil && user.security.lockedUntil > new Date()) {
         throw new Error('Account is locked. Please try again later.');
       }

       // Reset login attempts on successful login
       if (user.security.loginAttempts > 0) {
         user.security.loginAttempts = 0;
         user.security.lockedUntil = undefined;
       }

       // Update last login
       user.security.lastLogin = new Date();
       user.metadata.lastActiveAt = new Date();
       await user.save();

       const tokens = this.generateTokens(user);
       
       return { user, tokens };
     }

     private generateTokens(user: IUser) {
       const payload = {
         userId: user._id,
         email: user.email,
         role: user.role
       };

       const accessToken = jwt.sign(payload, this.JWT_SECRET, { expiresIn: '15m' });
       const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: this.JWT_EXPIRE });

       return { accessToken, refreshToken };
     }

     async verifyEmail(token: string): Promise<boolean> {
       const user = await UserMongo.findOne({
         'verification.emailToken': token,
         'verification.emailTokenExpiry': { $gt: new Date() }
       });

       if (!user) {
         return false;
       }

       user.verification.email = true;
       user.verification.emailToken = undefined;
       user.verification.emailTokenExpiry = undefined;
       await user.save();

       return true;
     }
   }

   export const authService = new AuthService();
   ```

##### **Day 5-7: API Controllers & Routes**

1. **Enhanced Auth Controller**
   - **File:** `server/src/controllers/authController.ts`
   ```typescript
   import { Request, Response } from 'express';
   import { validationResult } from 'express-validator';
   import { authService } from '../services/authService';
   import { UserMongo } from '../models/UserMongo';
   import { logger } from '../utils/logger';

   export const register = async (req: Request, res: Response) => {
     try {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({
           success: false,
           message: 'Validation failed',
           errors: errors.array()
         });
       }

       const { user, tokens } = await authService.register(req.body);

       res.status(201).json({
         success: true,
         message: 'Registration successful. Please check your email for verification.',
         data: {
           user: user.toSafeObject(),
           tokens
         }
       });
     } catch (error) {
       logger.error('Registration error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Registration failed'
       });
     }
   };

   export const login = async (req: Request, res: Response) => {
     try {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({
           success: false,
           message: 'Validation failed',
           errors: errors.array()
         });
       }

       const { email, password } = req.body;
       const { user, tokens } = await authService.login(email, password);

       res.json({
         success: true,
         message: 'Login successful',
         data: {
           user: user.toSafeObject(),
           tokens
         }
       });
     } catch (error) {
       logger.error('Login error:', error);
       res.status(401).json({
         success: false,
         message: error instanceof Error ? error.message : 'Login failed'
       });
     }
   };

   export const verifyEmail = async (req: Request, res: Response) => {
     try {
       const { token } = req.body;
       const success = await authService.verifyEmail(token);

       if (!success) {
         return res.status(400).json({
           success: false,
           message: 'Invalid or expired verification token'
         });
       }

       res.json({
         success: true,
         message: 'Email verified successfully'
       });
     } catch (error) {
       logger.error('Email verification error:', error);
       res.status(500).json({
         success: false,
         message: 'Email verification failed'
       });
     }
   };

   export const getProfile = async (req: Request, res: Response) => {
     try {
       const user = await UserMongo.findById(req.user.userId);
       
       if (!user) {
         return res.status(404).json({
           success: false,
           message: 'User not found'
         });
       }

       res.json({
         success: true,
         data: { user: user.toSafeObject() }
       });
     } catch (error) {
       logger.error('Get profile error:', error);
       res.status(500).json({
         success: false,
         message: 'Failed to get profile'
       });
     }
   };

   export const getUserPermissions = async (req: Request, res: Response) => {
     try {
       const user = await UserMongo.findById(req.user.userId);
       
       if (!user) {
         return res.status(404).json({
           success: false,
           message: 'User not found'
         });
       }

       // Get permissions for user role
       const { Permission } = await import('../models/Permission');
       const permissions = await Permission.find({ roles: user.role });

       res.json({
         success: true,
         data: {
           role: user.role,
           permissions: permissions.map(p => ({
             resource: p.resource,
             action: p.action,
             name: p.name
           }))
         }
       });
     } catch (error) {
       logger.error('Get permissions error:', error);
       res.status(500).json({
         success: false,
         message: 'Failed to get permissions'
       });
     }
   };
   ```

2. **Enhanced Auth Routes**
   - **File:** `server/src/routes/authRoutes.ts`
   ```typescript
   import { Router } from 'express';
   import { body } from 'express-validator';
   import {
     register,
     login,
     verifyEmail,
     getProfile,
     getUserPermissions
   } from '../controllers/authController';
   import { authenticateToken } from '../middleware/auth';
   import { checkPermission } from '../middleware/rbac';

   const router = Router();

   // Validation middleware
   const registerValidation = [
     body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
     body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
     body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/)
       .withMessage('Username must be 3-30 characters, letters/numbers/underscore only'),
     body('role').isIn(['student', 'parent', 'teacher']).withMessage('Invalid role'),
     body('profile.firstName').trim().isLength({ min: 1 }).withMessage('First name required'),
     body('profile.lastName').trim().isLength({ min: 1 }).withMessage('Last name required'),
     body('profile.age').optional().isInt({ min: 3, max: 18 }).withMessage('Age must be 3-18'),
     body('profile.grade').optional().isString().withMessage('Grade must be a string')
   ];

   const loginValidation = [
     body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
     body('password').notEmpty().withMessage('Password required')
   ];

   // Public routes
   router.post('/register', registerValidation, register);
   router.post('/login', loginValidation, login);
   router.post('/verify-email', body('token').notEmpty(), verifyEmail);

   // Protected routes
   router.get('/profile', authenticateToken, getProfile);
   router.get('/permissions', authenticateToken, getUserPermissions);

   export default router;
   ```

#### **Week 2: Frontend Implementation**

##### **Day 8-10: Enhanced Auth Context & Hooks**

1. **Enhanced Auth Context**
   - **File:** `client/src/contexts/AuthContext.tsx`
   ```typescript
   import React, { createContext, useContext, useReducer, useEffect } from 'react';
   import { authAPI } from '../services/authAPI';

   export interface User {
     _id: string;
     email: string;
     username: string;
     role: 'student' | 'parent' | 'teacher' | 'admin';
     profile: {
       firstName: string;
       lastName: string;
       age?: number;
       grade?: string;
       avatarUrl?: string;
       bio?: string;
     };
     preferences: {
       language: 'en' | 'ar' | 'ml' | 'es' | 'fr';
       difficulty: 'easy' | 'medium' | 'hard';
       topics: string[];
       notifications: {
         email: boolean;
         push: boolean;
         assignments: boolean;
         progress: boolean;
       };
     };
     subscription: {
       type: 'free' | 'premium' | 'family';
       expiresAt?: string;
       features: string[];
     };
     verification: {
       email: boolean;
       parentVerification?: boolean;
       teacherVerification?: boolean;
     };
     metadata: {
       isGuest: boolean;
       createdAt: string;
       lastActiveAt: string;
     };
   }

   export interface Permission {
     resource: string;
     action: string;
     name: string;
   }

   interface AuthState {
     user: User | null;
     tokens: {
       accessToken: string;
       refreshToken: string;
     } | null;
     permissions: Permission[];
     isAuthenticated: boolean;
     isLoading: boolean;
     error: string | null;
   }

   type AuthAction =
     | { type: 'AUTH_START' }
     | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: any; permissions?: Permission[] } }
     | { type: 'AUTH_FAILURE'; payload: string }
     | { type: 'LOGOUT' }
     | { type: 'UPDATE_USER'; payload: Partial<User> }
     | { type: 'SET_PERMISSIONS'; payload: Permission[] };

   const initialState: AuthState = {
     user: null,
     tokens: null,
     permissions: [],
     isAuthenticated: false,
     isLoading: false,
     error: null
   };

   const authReducer = (state: AuthState, action: AuthAction): AuthState => {
     switch (action.type) {
       case 'AUTH_START':
         return { ...state, isLoading: true, error: null };
       
       case 'AUTH_SUCCESS':
         return {
           ...state,
           user: action.payload.user,
           tokens: action.payload.tokens,
           permissions: action.payload.permissions || [],
           isAuthenticated: true,
           isLoading: false,
           error: null
         };
       
       case 'AUTH_FAILURE':
         return {
           ...state,
           user: null,
           tokens: null,
           permissions: [],
           isAuthenticated: false,
           isLoading: false,
           error: action.payload
         };
       
       case 'LOGOUT':
         return initialState;
       
       case 'UPDATE_USER':
         return {
           ...state,
           user: state.user ? { ...state.user, ...action.payload } : null
         };
       
       case 'SET_PERMISSIONS':
         return { ...state, permissions: action.payload };
       
       default:
         return state;
     }
   };

   interface AuthContextType extends AuthState {
     login: (email: string, password: string) => Promise<void>;
     register: (userData: RegisterData) => Promise<void>;
     logout: () => void;
     updateProfile: (updates: Partial<User>) => Promise<void>;
     checkPermission: (resource: string, action: string) => boolean;
     hasRole: (role: string | string[]) => boolean;
     verifyEmail: (token: string) => Promise<void>;
   }

   interface RegisterData {
     email: string;
     password: string;
     username: string;
     role: 'student' | 'parent' | 'teacher';
     profile: {
       firstName: string;
       lastName: string;
       age?: number;
       grade?: string;
     };
   }

   const AuthContext = createContext<AuthContextType | undefined>(undefined);

   export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const [state, dispatch] = useReducer(authReducer, initialState);

     useEffect(() => {
       const initAuth = async () => {
         const token = localStorage.getItem('accessToken');
         if (token) {
           try {
             dispatch({ type: 'AUTH_START' });
             const response = await authAPI.getProfile();
             const permissionsResponse = await authAPI.getPermissions();
             
             dispatch({
               type: 'AUTH_SUCCESS',
               payload: {
                 user: response.data.user,
                 tokens: { accessToken: token, refreshToken: localStorage.getItem('refreshToken') || '' },
                 permissions: permissionsResponse.data.permissions
               }
             });
           } catch (error) {
             localStorage.removeItem('accessToken');
             localStorage.removeItem('refreshToken');
             dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
           }
         }
       };

       initAuth();
     }, []);

     const login = async (email: string, password: string) => {
       try {
         dispatch({ type: 'AUTH_START' });
         const response = await authAPI.login({ email, password });
         
         localStorage.setItem('accessToken', response.data.tokens.accessToken);
         localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
         
         const permissionsResponse = await authAPI.getPermissions();
         
         dispatch({
           type: 'AUTH_SUCCESS',
           payload: {
             user: response.data.user,
             tokens: response.data.tokens,
             permissions: permissionsResponse.data.permissions
           }
         });
       } catch (error: any) {
         dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message || 'Login failed' });
         throw error;
       }
     };

     const register = async (userData: RegisterData) => {
       try {
         dispatch({ type: 'AUTH_START' });
         const response = await authAPI.register(userData);
         
         localStorage.setItem('accessToken', response.data.tokens.accessToken);
         localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
         
         dispatch({
           type: 'AUTH_SUCCESS',
           payload: {
             user: response.data.user,
             tokens: response.data.tokens
           }
         });
       } catch (error: any) {
         dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message || 'Registration failed' });
         throw error;
       }
     };

     const logout = () => {
       localStorage.removeItem('accessToken');
       localStorage.removeItem('refreshToken');
       dispatch({ type: 'LOGOUT' });
     };

     const updateProfile = async (updates: Partial<User>) => {
       try {
         const response = await authAPI.updateProfile(updates);
         dispatch({ type: 'UPDATE_USER', payload: response.data.user });
       } catch (error: any) {
         throw new Error(error.response?.data?.message || 'Profile update failed');
       }
     };

     const checkPermission = (resource: string, action: string): boolean => {
       if (state.user?.role === 'admin') return true;
       return state.permissions.some(p => p.resource === resource && p.action === action);
     };

     const hasRole = (role: string | string[]): boolean => {
       if (!state.user) return false;
       const roles = Array.isArray(role) ? role : [role];
       return roles.includes(state.user.role);
     };

     const verifyEmail = async (token: string) => {
       try {
         await authAPI.verifyEmail(token);
         if (state.user) {
           dispatch({
             type: 'UPDATE_USER',
             payload: {
               verification: { ...state.user.verification, email: true }
             }
           });
         }
       } catch (error: any) {
         throw new Error(error.response?.data?.message || 'Email verification failed');
       }
     };

     return (
       <AuthContext.Provider
         value={{
           ...state,
           login,
           register,
           logout,
           updateProfile,
           checkPermission,
           hasRole,
           verifyEmail
         }}
       >
         {children}
       </AuthContext.Provider>
     );
   };

   export const useAuth = () => {
     const context = useContext(AuthContext);
     if (context === undefined) {
       throw new Error('useAuth must be used within an AuthProvider');
     }
     return context;
   };
   ```

##### **Day 11-12: Role-based Registration Components**

1. **Enhanced Registration Component**
   - **File:** `client/src/components/auth/RegistrationForm.tsx`
   ```typescript
   import React, { useState } from 'react';
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import * as z from 'zod';
   import { useAuth } from '../../contexts/AuthContext';
   import { Button } from '../ui/button';
   import { Input } from '../ui/input';
   import { Label } from '../ui/label';
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
   import { Alert, AlertDescription } from '../ui/alert';
   import { Loader2, User, Users, GraduationCap } from 'lucide-react';

   const registrationSchema = z.object({
     email: z.string().email('Invalid email address'),
     password: z.string().min(6, 'Password must be at least 6 characters'),
     confirmPassword: z.string(),
     username: z.string().min(3, 'Username must be at least 3 characters')
       .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
     role: z.enum(['student', 'parent', 'teacher']),
     profile: z.object({
       firstName: z.string().min(1, 'First name is required'),
       lastName: z.string().min(1, 'Last name is required'),
       age: z.number().min(3).max(18).optional(),
       grade: z.string().optional()
     })
   }).refine((data) => data.password === data.confirmPassword, {
     message: "Passwords don't match",
     path: ["confirmPassword"],
   });

   type RegistrationFormData = z.infer<typeof registrationSchema>;

   const roleOptions = [
     {
       value: 'student',
       label: 'Student',
       description: 'I am a student who wants to learn',
       icon: User
     },
     {
       value: 'parent',
       label: 'Parent',
       description: 'I want to manage my children\'s learning',
       icon: Users
     },
     {
       value: 'teacher',
       label: 'Teacher',
       description: 'I want to create content and manage classes',
       icon: GraduationCap
     }
   ];

   export const RegistrationForm: React.FC = () => {
     const { register: registerUser, isLoading, error } = useAuth();
     const [selectedRole, setSelectedRole] = useState<string>('');

     const {
       register,
       handleSubmit,
       formState: { errors },
       watch,
       setValue
     } = useForm<RegistrationFormData>({
       resolver: zodResolver(registrationSchema)
     });

     const watchedRole = watch('role');

     const onSubmit = async (data: RegistrationFormData) => {
       try {
         await registerUser({
           email: data.email,
           password: data.password,
           username: data.username,
           role: data.role,
           profile: {
             firstName: data.profile.firstName,
             lastName: data.profile.lastName,
             age: data.profile.age,
             grade: data.profile.grade
           }
         });
       } catch (error) {
         // Error handled by context
       }
     };

     return (
       <Card className="w-full max-w-md mx-auto">
         <CardHeader>
           <CardTitle>Create Your Account</CardTitle>
           <CardDescription>
             Join our learning community and start your educational journey
           </CardDescription>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             {/* Role Selection */}
             <div className="space-y-3">
               <Label>I am a...</Label>
               <div className="grid gap-3">
                 {roleOptions.map((option) => {
                   const Icon = option.icon;
                   return (
                     <div
                       key={option.value}
                       className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                         watchedRole === option.value
                           ? 'border-blue-500 bg-blue-50'
                           : 'border-gray-200 hover:border-gray-300'
                       }`}
                       onClick={() => setValue('role', option.value as any)}
                     >
                       <div className="flex items-center space-x-3">
                         <Icon className="h-5 w-5 text-blue-600" />
                         <div>
                           <div className="font-medium">{option.label}</div>
                           <div className="text-sm text-gray-500">{option.description}</div>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
               {errors.role && (
                 <p className="text-sm text-red-600">{errors.role.message}</p>
               )}
             </div>

             {/* Personal Information */}
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="firstName">First Name</Label>
                 <Input
                   id="firstName"
                   {...register('profile.firstName')}
                   placeholder="John"
                 />
                 {errors.profile?.firstName && (
                   <p className="text-sm text-red-600">{errors.profile.firstName.message}</p>
                 )}
               </div>
               <div>
                 <Label htmlFor="lastName">Last Name</Label>
                 <Input
                   id="lastName"
                   {...register('profile.lastName')}
                   placeholder="Doe"
                 />
                 {errors.profile?.lastName && (
                   <p className="text-sm text-red-600">{errors.profile.lastName.message}</p>
                 )}
               </div>
             </div>

             {/* Age and Grade for Students */}
             {watchedRole === 'student' && (
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label htmlFor="age">Age</Label>
                   <Input
                     id="age"
                     type="number"
                     min="3"
                     max="18"
                     {...register('profile.age', { valueAsNumber: true })}
                     placeholder="8"
                   />
                   {errors.profile?.age && (
                     <p className="text-sm text-red-600">{errors.profile.age.message}</p>
                   )}
                 </div>
                 <div>
                   <Label htmlFor="grade">Grade</Label>
                   <Input
                     id="grade"
                     {...register('profile.grade')}
                     placeholder="3rd Grade"
                   />
                 </div>
               </div>
             )}

             {/* Account Information */}
             <div>
               <Label htmlFor="email">Email</Label>
               <Input
                 id="email"
                 type="email"
                 {...register('email')}
                 placeholder="john@example.com"
               />
               {errors.email && (
                 <p className="text-sm text-red-600">{errors.email.message}</p>
               )}
             </div>

             <div>
               <Label htmlFor="username">Username</Label>
               <Input
                 id="username"
                 {...register('username')}
                 placeholder="johndoe123"
               />
               {errors.username && (
                 <p className="text-sm text-red-600">{errors.username.message}</p>
               )}
             </div>

             <div>
               <Label htmlFor="password">Password</Label>
               <Input
                 id="password"
                 type="password"
                 {...register('password')}
                 placeholder="••••••••"
               />
               {errors.password && (
                 <p className="text-sm text-red-600">{errors.password.message}</p>
               )}
             </div>

             <div>
               <Label htmlFor="confirmPassword">Confirm Password</Label>
               <Input
                 id="confirmPassword"
                 type="password"
                 {...register('confirmPassword')}
                 placeholder="••••••••"
               />
               {errors.confirmPassword && (
                 <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
               )}
             </div>

             {error && (
               <Alert variant="destructive">
                 <AlertDescription>{error}</AlertDescription>
               </Alert>
             )}

             <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading ? (
                 <>
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                   Creating Account...
                 </>
               ) : (
                 'Create Account'
               )}
             </Button>
           </form>
         </CardContent>
       </Card>
     );
   };
   ```

##### **Day 13-14: Testing & Integration**

1. **Backend Tests**
   - **File:** `server/src/tests/auth.test.ts`
   ```typescript
   import request from 'supertest';
   import { app } from '../app';
   import { UserMongo } from '../models/UserMongo';
   import { connectDB, disconnectDB } from '../config/database';

   describe('Authentication', () => {
     beforeAll(async () => {
       await connectDB();
     });

     afterAll(async () => {
       await disconnectDB();
     });

     beforeEach(async () => {
       await UserMongo.deleteMany({});
     });

     describe('POST /api/auth/register', () => {
       it('should register a new user successfully', async () => {
         const userData = {
           email: 'test@example.com',
           password: 'password123',
           username: 'testuser',
           role: 'student',
           profile: {
             firstName: 'Test',
             lastName: 'User',
             age: 8,
             grade: '3rd Grade'
           }
         };

         const response = await request(app)
           .post('/api/auth/register')
           .send(userData)
           .expect(201);

         expect(response.body.success).toBe(true);
         expect(response.body.data.user.email).toBe(userData.email);
         expect(response.body.data.user.role).toBe(userData.role);
         expect(response.body.data.tokens).toBeDefined();
       });

       it('should not register user with existing email', async () => {
         const userData = {
           email: 'test@example.com',
           password: 'password123',
           username: 'testuser',
           role: 'student',
           profile: { firstName: 'Test', lastName: 'User' }
         };

         // First registration
         await request(app).post('/api/auth/register').send(userData);

         // Second registration with same email
         const response = await request(app)
           .post('/api/auth/register')
           .send({ ...userData, username: 'different' })
           .expect(400);

         expect(response.body.success).toBe(false);
       });
     });

     describe('POST /api/auth/login', () => {
       beforeEach(async () => {
         const user = new UserMongo({
           email: 'test@example.com',
           password: 'password123',
           username: 'testuser',
           role: 'student',
           profile: { firstName: 'Test', lastName: 'User' }
         });
         await user.save();
       });

       it('should login with valid credentials', async () => {
         const response = await request(app)
           .post('/api/auth/login')
           .send({
             email: 'test@example.com',
             password: 'password123'
           })
           .expect(200);

         expect(response.body.success).toBe(true);
         expect(response.body.data.user.email).toBe('test@example.com');
         expect(response.body.data.tokens).toBeDefined();
       });

       it('should not login with invalid credentials', async () => {
         const response = await request(app)
           .post('/api/auth/login')
           .send({
             email: 'test@example.com',
             password: 'wrongpassword'
           })
           .expect(401);

         expect(response.body.success).toBe(false);
       });
     });
   });
   ```

#### **Database Migration Tasks**

1. **Migration Script**
   - **File:** `server/src/scripts/migrateSQLiteToMongo.ts`
   ```typescript
   import { UserMongo } from '../models/UserMongo';
   import { User as SQLiteUser } from '../models/UserSQLite';
   import { connectDB } from '../config/database';
   import { sequelize } from '../config/database-sqlite';

   async function migrateSQLiteToMongo() {
     try {
       // Connect to both databases
       await connectDB();
       await sequelize.authenticate();

       console.log('Starting SQLite to MongoDB migration...');

       // Get all users from SQLite
       const sqliteUsers = await SQLiteUser.findAll();
       console.log(`Found ${sqliteUsers.length} users to migrate`);

       let migrated = 0;
       let errors = 0;

       for (const sqliteUser of sqliteUsers) {
         try {
           // Check if user already exists in MongoDB
           const existingUser = await UserMongo.findOne({ email: sqliteUser.email });
           if (existingUser) {
             console.log(`User ${sqliteUser.email} already exists in MongoDB`);
             continue;
           }

           // Create MongoDB user
           const mongoUser = new UserMongo({
             email: sqliteUser.email,
             password: sqliteUser.password, // Already hashed
             username: sqliteUser.username,
             role: sqliteUser.role,
             profile: {
               firstName: sqliteUser.firstName,
               lastName: sqliteUser.lastName,
               age: sqliteUser.age,
               grade: sqliteUser.grade,
               avatarUrl: sqliteUser.avatarUrl
             },
             preferences: {
               language: sqliteUser.language,
               difficulty: sqliteUser.difficulty,
               topics: JSON.parse(sqliteUser.topics || '[]'),
               notifications: {
                 email: true,
                 push: true,
                 assignments: true,
                 progress: true
               }
             },
             subscription: {
               type: sqliteUser.subscriptionType,
               expiresAt: sqliteUser.subscriptionExpiresAt,
               features: JSON.parse(sqliteUser.features || '[]')
             },
             verification: {
               email: sqliteUser.emailVerified,
               parentVerification: false,
               teacherVerification: false
             },
             security: {
               loginAttempts: sqliteUser.loginAttempts,
               lockedUntil: sqliteUser.lockedUntil,
               lastLogin: sqliteUser.lastLogin,
               passwordResetToken: sqliteUser.passwordResetToken,
               passwordResetExpiry: sqliteUser.passwordResetExpires
             },
             metadata: {
               isGuest: sqliteUser.isGuest,
               createdAt: sqliteUser.createdAt,
               lastActiveAt: sqliteUser.lastActiveDate
             }
           });

           await mongoUser.save();
           migrated++;
           console.log(`Migrated user: ${sqliteUser.email}`);

         } catch (error) {
           console.error(`Error migrating user ${sqliteUser.email}:`, error);
           errors++;
         }
       }

       console.log(`Migration completed: ${migrated} successful, ${errors} errors`);

     } catch (error) {
       console.error('Migration failed:', error);
       process.exit(1);
     }
   }

   // Run migration if called directly
   if (require.main === module) {
     migrateSQLiteToMongo()
       .then(() => process.exit(0))
       .catch(() => process.exit(1));
   }

   export { migrateSQLiteToMongo };
   ```

#### **Testing Requirements**

1. **Unit Tests:** RBAC middleware, auth service methods, user model methods
2. **Integration Tests:** Authentication flows, permission checks, email verification
3. **E2E Tests:** Registration workflow, login with different roles, permission-based access
4. **Security Tests:** Password hashing, token validation, rate limiting

#### **Deployment Steps**

1. **Backend Deployment:**
   ```bash
   # Install MongoDB dependencies
   npm install mongoose @types/mongoose

   # Set up environment variables
   MONGODB_URI=mongodb://localhost:27017/playlearnspark
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret

   # Run migrations
   npm run migrate:users

   # Start server with feature flags
   ENABLE_MONGO_AUTH=true npm start
   ```

2. **Frontend Deployment:**
   ```bash
   # Install new dependencies
   npm install @hookform/resolvers zod

   # Update environment variables
   VITE_API_URL=http://localhost:3001/api

   # Build and deploy
   npm run build
   ```

#### **Rollback Plan**

1. **Feature Flags:** Toggle between SQLite and MongoDB auth
2. **Data Sync:** Maintain dual-write during transition
3. **Monitoring:** Track error rates and performance
4. **Automated Rollback:** Trigger rollback if error threshold exceeded

#### **Success Criteria**

- [ ] All existing users migrated successfully
- [ ] Role-based registration working for all roles
- [ ] Permission system functioning correctly
- [ ] Email verification working
- [ ] No authentication regressions
- [ ] Performance within acceptable limits (< 500ms auth requests)
- [ ] Security audit passed

---

### **Batch 2: Student-Parent-Teacher Relationship Management**
**Duration:** 2 weeks  
**Dependencies:** Batch 1 (Multi-role auth system)

#### **Week 1: Backend Implementation**

##### **Day 1-3: Relationship Schema & Models**

1. **Relationship Schema Design**
   - **File:** `server/src/models/Relationship.ts`
   ```typescript
   import { Schema, model, Document, ObjectId } from 'mongoose';

   export interface IRelationship extends Document {
     _id: ObjectId;
     type: 'parent-child' | 'teacher-student' | 'teacher-parent';
     initiator: ObjectId; // User who created the relationship
     target: ObjectId; // User being connected to
     status: 'pending' | 'approved' | 'declined' | 'blocked';
     permissions: {
       viewProgress: boolean;
       assignActivities: boolean;
       receiveNotifications: boolean;
       manageSettings: boolean;
       viewReports: boolean;
       communicateWithTeacher: boolean; // For parent-teacher relationships
     };
     invitationCode?: string;
     invitationExpiry?: Date;
     metadata: {
       createdAt: Date;
       updatedAt: Date;
       approvedAt?: Date;
       approvedBy?: ObjectId;
       declinedAt?: Date;
       notes?: string;
     };
     
     // Virtual methods
     isActive(): boolean;
     canPerformAction(action: string): boolean;
   }

   const relationshipSchema = new Schema<IRelationship>({
     type: {
       type: String,
       enum: ['parent-child', 'teacher-student', 'teacher-parent'],
       required: true
     },
     initiator: {
       type: Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     target: {
       type: Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     status: {
       type: String,
       enum: ['pending', 'approved', 'declined', 'blocked'],
       default: 'pending'
     },
     permissions: {
       viewProgress: { type: Boolean, default: true },
       assignActivities: { type: Boolean, default: false },
       receiveNotifications: { type: Boolean, default: true },
       manageSettings: { type: Boolean, default: false },
       viewReports: { type: Boolean, default: true },
       communicateWithTeacher: { type: Boolean, default: true }
     },
     invitationCode: {
       type: String,
       unique: true,
       sparse: true
     },
     invitationExpiry: Date,
     metadata: {
       createdAt: { type: Date, default: Date.now },
       updatedAt: { type: Date, default: Date.now },
       approvedAt: Date,
       approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
       declinedAt: Date,
       notes: String
     }
   }, {
     timestamps: true
   });

   // Indexes for performance
   relationshipSchema.index({ initiator: 1, target: 1, type: 1 }, { unique: true });
   relationshipSchema.index({ invitationCode: 1 });
   relationshipSchema.index({ status: 1 });
   relationshipSchema.index({ type: 1, status: 1 });

   // Instance methods
   relationshipSchema.methods.isActive = function(): boolean {
     return this.status === 'approved';
   };

   relationshipSchema.methods.canPerformAction = function(action: string): boolean {
     return this.status === 'approved' && this.permissions[action] === true;
   };

   // Static methods
   relationshipSchema.statics.findUserRelationships = function(userId: ObjectId, type?: string) {
     const query: any = {
       $or: [{ initiator: userId }, { target: userId }],
       status: 'approved'
     };
     if (type) query.type = type;
     return this.find(query).populate('initiator target', 'profile role email username');
   };

   relationshipSchema.statics.findPendingInvitations = function(userId: ObjectId) {
     return this.find({
       target: userId,
       status: 'pending'
     }).populate('initiator', 'profile role email username');
   };

   export const Relationship = model<IRelationship>('Relationship', relationshipSchema);
   ```

2. **Invitation System Schema**
   - **File:** `server/src/models/Invitation.ts`
   ```typescript
   import { Schema, model, Document, ObjectId } from 'mongoose';
   import { v4 as uuidv4 } from 'uuid';

   export interface IInvitation extends Document {
     _id: ObjectId;
     type: 'email' | 'code' | 'qr' | 'link';
     relationshipType: 'parent-child' | 'teacher-student' | 'teacher-parent';
     inviter: ObjectId;
     inviteeEmail?: string;
     inviteeRole: 'student' | 'parent' | 'teacher';
     code: string;
     qrCode?: string;
     shareableLink: string;
     permissions: {
       viewProgress: boolean;
       assignActivities: boolean;
       receiveNotifications: boolean;
       manageSettings: boolean;
     };
     settings: {
       expiresAt: Date;
       maxUses: number;
       currentUses: number;
       allowMultipleStudents: boolean; // For teacher invitations
     };
     status: 'active' | 'used' | 'expired' | 'cancelled';
     metadata: {
       createdAt: Date;
       updatedAt: Date;
       usedAt?: Date;
       usedBy?: ObjectId;
       notes?: string;
     };
     
     generateCode(): string;
     generateQRCode(): Promise<string>;
     isValid(): boolean;
   }

   const invitationSchema = new Schema<IInvitation>({
     type: {
       type: String,
       enum: ['email', 'code', 'qr', 'link'],
       required: true
     },
     relationshipType: {
       type: String,
       enum: ['parent-child', 'teacher-student', 'teacher-parent'],
       required: true
     },
     inviter: {
       type: Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     inviteeEmail: {
       type: String,
       lowercase: true
     },
     inviteeRole: {
       type: String,
       enum: ['student', 'parent', 'teacher'],
       required: true
     },
     code: {
       type: String,
       unique: true,
       required: true
     },
     qrCode: String,
     shareableLink: {
       type: String,
       unique: true,
       required: true
     },
     permissions: {
       viewProgress: { type: Boolean, default: true },
       assignActivities: { type: Boolean, default: false },
       receiveNotifications: { type: Boolean, default: true },
       manageSettings: { type: Boolean, default: false }
     },
     settings: {
       expiresAt: {
         type: Date,
         default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
       },
       maxUses: { type: Number, default: 1 },
       currentUses: { type: Number, default: 0 },
       allowMultipleStudents: { type: Boolean, default: false }
     },
     status: {
       type: String,
       enum: ['active', 'used', 'expired', 'cancelled'],
       default: 'active'
     },
     metadata: {
       createdAt: { type: Date, default: Date.now },
       updatedAt: { type: Date, default: Date.now },
       usedAt: Date,
       usedBy: { type: Schema.Types.ObjectId, ref: 'User' },
       notes: String
     }
   });

   // Indexes
   invitationSchema.index({ code: 1 });
   invitationSchema.index({ shareableLink: 1 });
   invitationSchema.index({ inviter: 1, status: 1 });
   invitationSchema.index({ settings.expiresAt: 1 });

   // Methods
   invitationSchema.methods.generateCode = function(): string {
     this.code = Math.random().toString(36).substring(2, 8).toUpperCase();
     return this.code;
   };

   invitationSchema.methods.generateQRCode = async function(): Promise<string> {
     const QRCode = require('qrcode');
     const qrData = {
       type: 'invitation',
       code: this.code,
       inviter: this.inviter,
       relationshipType: this.relationshipType
     };
     this.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
     return this.qrCode;
   };

   invitationSchema.methods.isValid = function(): boolean {
     return this.status === 'active' && 
            this.settings.expiresAt > new Date() && 
            this.settings.currentUses < this.settings.maxUses;
   };

   // Pre-save middleware
   invitationSchema.pre('save', function(next) {
     if (this.isNew) {
       this.shareableLink = `${process.env.CLIENT_URL}/invite/${this.code}`;
     }
     next();
   });

   export const Invitation = model<IInvitation>('Invitation', invitationSchema);
   ```

##### **Day 4-5: Relationship Service & Controllers**

1. **Relationship Service**
   - **File:** `server/src/services/relationshipService.ts`
   ```typescript
   import { ObjectId } from 'mongoose';
   import { Relationship, IRelationship } from '../models/Relationship';
   import { Invitation, IInvitation } from '../models/Invitation';
   import { UserMongo } from '../models/UserMongo';
   import { emailService } from './emailService';
   import { logger } from '../utils/logger';

   export class RelationshipService {
     
     async createInvitation(inviterData: {
       inviterId: ObjectId;
       relationshipType: 'parent-child' | 'teacher-student' | 'teacher-parent';
       inviteeEmail?: string;
       inviteeRole: 'student' | 'parent' | 'teacher';
       type: 'email' | 'code' | 'qr' | 'link';
       permissions?: any;
       settings?: any;
     }): Promise<IInvitation> {
       
       const inviter = await UserMongo.findById(inviterData.inviterId);
       if (!inviter) {
         throw new Error('Inviter not found');
       }

       // Validate relationship type based on roles
       this.validateRelationshipType(inviter.role, inviterData.relationshipType, inviterData.inviteeRole);

       const invitation = new Invitation({
         type: inviterData.type,
         relationshipType: inviterData.relationshipType,
         inviter: inviterData.inviterId,
         inviteeEmail: inviterData.inviteeEmail,
         inviteeRole: inviterData.inviteeRole,
         code: '', // Will be generated
         shareableLink: '', // Will be generated
         permissions: inviterData.permissions || this.getDefaultPermissions(inviterData.relationshipType),
         settings: {
           ...this.getDefaultSettings(),
           ...inviterData.settings
         }
       });

       invitation.generateCode();
       
       if (inviterData.type === 'qr') {
         await invitation.generateQRCode();
       }

       await invitation.save();

       // Send email invitation if email provided
       if (inviterData.inviteeEmail && inviterData.type === 'email') {
         await this.sendEmailInvitation(invitation, inviter);
       }

       logger.info(`Invitation created: ${invitation._id} by ${inviter.email}`);
       return invitation;
     }

     async acceptInvitation(invitationCode: string, acceptorId: ObjectId): Promise<IRelationship> {
       const invitation = await Invitation.findOne({ code: invitationCode })
         .populate('inviter', 'profile role email');

       if (!invitation || !invitation.isValid()) {
         throw new Error('Invalid or expired invitation');
       }

       const acceptor = await UserMongo.findById(acceptorId);
       if (!acceptor) {
         throw new Error('Acceptor not found');
       }

       // Validate acceptor role matches invitation
       if (acceptor.role !== invitation.inviteeRole) {
         throw new Error('Role mismatch for invitation');
       }

       // Check if relationship already exists
       const existingRelationship = await Relationship.findOne({
         $or: [
           { initiator: invitation.inviter._id, target: acceptorId },
           { initiator: acceptorId, target: invitation.inviter._id }
         ],
         type: invitation.relationshipType
       });

       if (existingRelationship) {
         throw new Error('Relationship already exists');
       }

       // Create relationship
       const relationship = new Relationship({
         type: invitation.relationshipType,
         initiator: invitation.inviter._id,
         target: acceptorId,
         status: 'approved', // Auto-approve for invitation-based relationships
         permissions: invitation.permissions,
         metadata: {
           approvedAt: new Date(),
           approvedBy: acceptorId,
           notes: `Created via invitation ${invitation.code}`
         }
       });

       await relationship.save();

       // Update invitation status
       invitation.status = 'used';
       invitation.settings.currentUses += 1;
       invitation.metadata.usedAt = new Date();
       invitation.metadata.usedBy = acceptorId;
       await invitation.save();

       logger.info(`Relationship created: ${relationship._id} via invitation ${invitation.code}`);
       return relationship;
     }

     async createDirectRelationship(initiatorId: ObjectId, targetId: ObjectId, type: string): Promise<IRelationship> {
       const initiator = await UserMongo.findById(initiatorId);
       const target = await UserMongo.findById(targetId);

       if (!initiator || !target) {
         throw new Error('User not found');
       }

       this.validateRelationshipType(initiator.role, type as any, target.role);

       // Check if relationship already exists
       const existingRelationship = await Relationship.findOne({
         $or: [
           { initiator: initiatorId, target: targetId },
           { initiator: targetId, target: initiatorId }
         ],
         type
       });

       if (existingRelationship) {
         throw new Error('Relationship already exists');
       }

       const relationship = new Relationship({
         type,
         initiator: initiatorId,
         target: targetId,
         status: 'pending',
         permissions: this.getDefaultPermissions(type as any)
       });

       await relationship.save();

       // Send notification to target user
       await this.sendRelationshipNotification(relationship, target);

       logger.info(`Direct relationship request created: ${relationship._id}`);
       return relationship;
     }

     async approveRelationship(relationshipId: ObjectId, approverId: ObjectId): Promise<IRelationship> {
       const relationship = await Relationship.findById(relationshipId)
         .populate('initiator target', 'profile role email');

       if (!relationship) {
         throw new Error('Relationship not found');
       }

       // Only target user can approve
       if (relationship.target._id.toString() !== approverId.toString()) {
         throw new Error('Only the target user can approve this relationship');
       }

       relationship.status = 'approved';
       relationship.metadata.approvedAt = new Date();
       relationship.metadata.approvedBy = approverId;
       await relationship.save();

       // Send confirmation notifications
       await this.sendApprovalNotification(relationship);

       logger.info(`Relationship approved: ${relationship._id}`);
       return relationship;
     }

     async getUserRelationships(userId: ObjectId, type?: string): Promise<IRelationship[]> {
       return await Relationship.findUserRelationships(userId, type);
     }

     async getChildrenForParent(parentId: ObjectId): Promise<any[]> {
       const relationships = await Relationship.find({
         initiator: parentId,
         type: 'parent-child',
         status: 'approved'
       }).populate('target', 'profile email username metadata.lastActiveAt');

       return relationships.map(rel => rel.target);
     }

     async getStudentsForTeacher(teacherId: ObjectId): Promise<any[]> {
       const relationships = await Relationship.find({
         initiator: teacherId,
         type: 'teacher-student',
         status: 'approved'
       }).populate('target', 'profile email username metadata.lastActiveAt');

       return relationships.map(rel => rel.target);
     }

     async getParentsForStudent(studentId: ObjectId): Promise<any[]> {
       const relationships = await Relationship.find({
         target: studentId,
         type: 'parent-child',
         status: 'approved'
       }).populate('initiator', 'profile email username');

       return relationships.map(rel => rel.initiator);
     }

     async removeRelationship(relationshipId: ObjectId, requesterId: ObjectId): Promise<boolean> {
       const relationship = await Relationship.findById(relationshipId);
       
       if (!relationship) {
         throw new Error('Relationship not found');
       }

       // Only participants can remove relationship
       if (relationship.initiator.toString() !== requesterId.toString() && 
           relationship.target.toString() !== requesterId.toString()) {
         throw new Error('Unauthorized to remove this relationship');
       }

       await Relationship.findByIdAndDelete(relationshipId);
       logger.info(`Relationship removed: ${relationshipId}`);
       return true;
     }

     private validateRelationshipType(initiatorRole: string, relationshipType: string, targetRole: string): void {
       const validCombinations = {
         'parent-child': { initiator: 'parent', target: 'student' },
         'teacher-student': { initiator: 'teacher', target: 'student' },
         'teacher-parent': { initiator: 'teacher', target: 'parent' }
       };

       const combo = validCombinations[relationshipType];
       if (!combo || combo.initiator !== initiatorRole || combo.target !== targetRole) {
         throw new Error('Invalid relationship type for given roles');
       }
     }

     private getDefaultPermissions(relationshipType: string): any {
       const permissions = {
         'parent-child': {
           viewProgress: true,
           assignActivities: true,
           receiveNotifications: true,
           manageSettings: true,
           viewReports: true,
           communicateWithTeacher: true
         },
         'teacher-student': {
           viewProgress: true,
           assignActivities: true,
           receiveNotifications: true,
           manageSettings: false,
           viewReports: true,
           communicateWithTeacher: false
         },
         'teacher-parent': {
           viewProgress: true,
           assignActivities: false,
           receiveNotifications: true,
           manageSettings: false,
           viewReports: true,
           communicateWithTeacher: true
         }
       };

       return permissions[relationshipType] || {};
     }

     private getDefaultSettings(): any {
       return {
         expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
         maxUses: 1,
         currentUses: 0,
         allowMultipleStudents: false
       };
     }

     private async sendEmailInvitation(invitation: IInvitation, inviter: any): Promise<void> {
       const inviteLink = `${process.env.CLIENT_URL}/invite/${invitation.code}`;
       
       await emailService.sendInvitationEmail(
         invitation.inviteeEmail!,
         {
           inviterName: `${inviter.profile.firstName} ${inviter.profile.lastName}`,
           inviterRole: inviter.role,
           relationshipType: invitation.relationshipType,
           inviteLink,
           expiresAt: invitation.settings.expiresAt
         }
       );
     }

     private async sendRelationshipNotification(relationship: IRelationship, target: any): Promise<void> {
       // Implement notification sending logic
       logger.info(`Relationship notification sent to ${target.email}`);
     }

     private async sendApprovalNotification(relationship: IRelationship): Promise<void> {
       // Implement approval notification logic
       logger.info(`Approval notification sent for relationship ${relationship._id}`);
     }
   }

   export const relationshipService = new RelationshipService();
   ```

2. **Relationship Controller**
   - **File:** `server/src/controllers/relationshipController.ts`
   ```typescript
   import { Request, Response } from 'express';
   import { validationResult } from 'express-validator';
   import { relationshipService } from '../services/relationshipService';
   import { logger } from '../utils/logger';

   interface AuthenticatedRequest extends Request {
     user?: {
       userId: string;
       role: string;
       email: string;
     };
   }

   export const createInvitation = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({
           success: false,
           message: 'Validation failed',
           errors: errors.array()
         });
       }

       const invitationData = {
         inviterId: req.user!.userId,
         ...req.body
       };

       const invitation = await relationshipService.createInvitation(invitationData);

       res.status(201).json({
         success: true,
         message: 'Invitation created successfully',
         data: {
           invitation: {
             _id: invitation._id,
             code: invitation.code,
             shareableLink: invitation.shareableLink,
             qrCode: invitation.qrCode,
             type: invitation.type,
             relationshipType: invitation.relationshipType,
             expiresAt: invitation.settings.expiresAt
           }
         }
       });
     } catch (error) {
       logger.error('Create invitation error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to create invitation'
       });
     }
   };

   export const acceptInvitation = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { code } = req.body;
       const acceptorId = req.user!.userId;

       const relationship = await relationshipService.acceptInvitation(code, acceptorId);

       res.json({
         success: true,
         message: 'Invitation accepted successfully',
         data: { relationship }
       });
     } catch (error) {
       logger.error('Accept invitation error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to accept invitation'
       });
     }
   };

   export const createDirectRelationship = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { targetUserId, relationshipType } = req.body;
       const initiatorId = req.user!.userId;

       const relationship = await relationshipService.createDirectRelationship(
         initiatorId,
         targetUserId,
         relationshipType
       );

       res.status(201).json({
         success: true,
         message: 'Relationship request created successfully',
         data: { relationship }
       });
     } catch (error) {
       logger.error('Create relationship error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to create relationship'
       });
     }
   };

   export const approveRelationship = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { relationshipId } = req.params;
       const approverId = req.user!.userId;

       const relationship = await relationshipService.approveRelationship(relationshipId, approverId);

       res.json({
         success: true,
         message: 'Relationship approved successfully',
         data: { relationship }
       });
     } catch (error) {
       logger.error('Approve relationship error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to approve relationship'
       });
     }
   };

   export const getUserRelationships = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const userId = req.user!.userId;
       const { type } = req.query;

       const relationships = await relationshipService.getUserRelationships(userId, type as string);

       res.json({
         success: true,
         data: { relationships }
       });
     } catch (error) {
       logger.error('Get relationships error:', error);
       res.status(500).json({
         success: false,
         message: 'Failed to get relationships'
       });
     }
   };

   export const getChildren = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const parentId = req.user!.userId;
       const children = await relationshipService.getChildrenForParent(parentId);

       res.json({
         success: true,
         data: { children }
       });
     } catch (error) {
       logger.error('Get children error:', error);
       res.status(500).json({
         success: false,
         message: 'Failed to get children'
       });
     }
   };

   export const getStudents = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const teacherId = req.user!.userId;
       const students = await relationshipService.getStudentsForTeacher(teacherId);

       res.json({
         success: true,
         data: { students }
       });
     } catch (error) {
       logger.error('Get students error:', error);
       res.status(500).json({
         success: false,
         message: 'Failed to get students'
       });
     }
   };

   export const removeRelationship = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { relationshipId } = req.params;
       const requesterId = req.user!.userId;

       await relationshipService.removeRelationship(relationshipId, requesterId);

       res.json({
         success: true,
         message: 'Relationship removed successfully'
       });
     } catch (error) {
       logger.error('Remove relationship error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to remove relationship'
       });
     }
   };
   ```

#### **Week 2: Frontend Implementation**

##### **Day 8-10: Relationship Management Components**

1. **Invitation Creation Component**
   - **File:** `client/src/components/relationships/CreateInvitation.tsx`
   ```typescript
   import React, { useState } from 'react';
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import * as z from 'zod';
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
   import { Button } from '../ui/button';
   import { Input } from '../ui/input';
   import { Label } from '../ui/label';
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
   import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
   import { Alert, AlertDescription } from '../ui/alert';
   import { Badge } from '../ui/badge';
   import { Copy, Mail, QrCode, Link, Users, User, GraduationCap } from 'lucide-react';
   import { useAuth } from '../../contexts/AuthContext';
   import { relationshipAPI } from '../../services/relationshipAPI';
   import { toast } from '../../hooks/use-toast';

   const invitationSchema = z.object({
     relationshipType: z.enum(['parent-child', 'teacher-student', 'teacher-parent']),
     inviteeRole: z.enum(['student', 'parent', 'teacher']),
     inviteeEmail: z.string().email().optional(),
     type: z.enum(['email', 'code', 'qr', 'link']),
     permissions: z.object({
       viewProgress: z.boolean().default(true),
       assignActivities: z.boolean().default(false),
       receiveNotifications: z.boolean().default(true),
       manageSettings: z.boolean().default(false)
     }).optional(),
     expiryDays: z.number().min(1).max(30).default(7)
   });

   type InvitationFormData = z.infer<typeof invitationSchema>;

   interface CreateInvitationProps {
     onInvitationCreated?: (invitation: any) => void;
   }

   export const CreateInvitation: React.FC<CreateInvitationProps> = ({ onInvitationCreated }) => {
     const { user, hasRole } = useAuth();
     const [isLoading, setIsLoading] = useState(false);
     const [createdInvitation, setCreatedInvitation] = useState<any>(null);

     const {
       register,
       handleSubmit,
       formState: { errors },
       watch,
       setValue,
       reset
     } = useForm<InvitationFormData>({
       resolver: zodResolver(invitationSchema),
       defaultValues: {
         type: 'email',
         permissions: {
           viewProgress: true,
           assignActivities: false,
           receiveNotifications: true,
           manageSettings: false
         },
         expiryDays: 7
       }
     });

     const watchedType = watch('type');
     const watchedRelationshipType = watch('relationshipType');

     const getAvailableRelationshipTypes = () => {
       if (hasRole('parent')) {
         return [{ value: 'parent-child', label: 'Parent-Child', role: 'student' }];
       }
       if (hasRole('teacher')) {
         return [
           { value: 'teacher-student', label: 'Teacher-Student', role: 'student' },
           { value: 'teacher-parent', label: 'Teacher-Parent', role: 'parent' }
         ];
       }
       return [];
     };

     const onSubmit = async (data: InvitationFormData) => {
       try {
         setIsLoading(true);

         const invitationData = {
           ...data,
           settings: {
             expiresAt: new Date(Date.now() + data.expiryDays * 24 * 60 * 60 * 1000)
           }
         };

         const response = await relationshipAPI.createInvitation(invitationData);
         
         setCreatedInvitation(response.data.invitation);
         onInvitationCreated?.(response.data.invitation);
         
         toast({
           title: "Invitation Created",
           description: "Your invitation has been created successfully.",
         });

         reset();
       } catch (error: any) {
         toast({
           title: "Error",
           description: error.response?.data?.message || "Failed to create invitation",
           variant: "destructive"
         });
       } finally {
         setIsLoading(false);
       }
     };

     const copyToClipboard = (text: string, type: string) => {
       navigator.clipboard.writeText(text);
       toast({
         title: "Copied!",
         description: `${type} copied to clipboard`,
       });
     };

     const availableTypes = getAvailableRelationshipTypes();

     if (availableTypes.length === 0) {
       return (
         <Alert>
           <AlertDescription>
             You don't have permission to create invitations.
           </AlertDescription>
         </Alert>
       );
     }

     return (
       <div className="space-y-6">
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Users className="h-5 w-5" />
               Create Invitation
             </CardTitle>
             <CardDescription>
               Invite students, parents, or teachers to connect with you
             </CardDescription>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               {/* Relationship Type Selection */}
               <div className="space-y-3">
                 <Label>Relationship Type</Label>
                 <div className="grid gap-3">
                   {availableTypes.map((type) => (
                     <div
                       key={type.value}
                       className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                         watchedRelationshipType === type.value
                           ? 'border-blue-500 bg-blue-50'
                           : 'border-gray-200 hover:border-gray-300'
                       }`}
                       onClick={() => {
                         setValue('relationshipType', type.value as any);
                         setValue('inviteeRole', type.role as any);
                       }}
                     >
                       <div className="flex items-center justify-between">
                         <span className="font-medium">{type.label}</span>
                         <Badge variant="outline">{type.role}</Badge>
                       </div>
                     </div>
                   ))}
                 </div>
                 {errors.relationshipType && (
                   <p className="text-sm text-red-600">{errors.relationshipType.message}</p>
                 )}
               </div>

               {/* Invitation Type */}
               <div className="space-y-3">
                 <Label>Invitation Method</Label>
                 <Tabs value={watchedType} onValueChange={(value) => setValue('type', value as any)}>
                   <TabsList className="grid w-full grid-cols-4">
                     <TabsTrigger value="email" className="flex items-center gap-2">
                       <Mail className="h-4 w-4" />
                       Email
                     </TabsTrigger>
                     <TabsTrigger value="code" className="flex items-center gap-2">
                       <User className="h-4 w-4" />
                       Code
                     </TabsTrigger>
                     <TabsTrigger value="qr" className="flex items-center gap-2">
                       <QrCode className="h-4 w-4" />
                       QR Code
                     </TabsTrigger>
                     <TabsTrigger value="link" className="flex items-center gap-2">
                       <Link className="h-4 w-4" />
                       Link
                     </TabsTrigger>
                   </TabsList>

                   <TabsContent value="email" className="space-y-3">
                     <div>
                       <Label htmlFor="email">Recipient Email</Label>
                       <Input
                         id="email"
                         type="email"
                         {...register('inviteeEmail')}
                         placeholder="recipient@example.com"
                       />
                       {errors.inviteeEmail && (
                         <p className="text-sm text-red-600">{errors.inviteeEmail.message}</p>
                       )}
                     </div>
                   </TabsContent>

                   <TabsContent value="code">
                     <p className="text-sm text-gray-600">
                       A unique code will be generated that can be shared manually.
                     </p>
                   </TabsContent>

                   <TabsContent value="qr">
                     <p className="text-sm text-gray-600">
                       A QR code will be generated for easy mobile scanning.
                     </p>
                   </TabsContent>

                   <TabsContent value="link">
                     <p className="text-sm text-gray-600">
                       A shareable link will be generated for easy access.
                     </p>
                   </TabsContent>
                 </Tabs>
               </div>

               {/* Expiry Settings */}
               <div>
                 <Label htmlFor="expiryDays">Expires in (days)</Label>
                 <Input
                   id="expiryDays"
                   type="number"
                   min="1"
                   max="30"
                   {...register('expiryDays', { valueAsNumber: true })}
                 />
                 {errors.expiryDays && (
                   <p className="text-sm text-red-600">{errors.expiryDays.message}</p>
                 )}
               </div>

               <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading ? 'Creating...' : 'Create Invitation'}
               </Button>
             </form>
           </CardContent>
         </Card>

         {/* Created Invitation Display */}
         {createdInvitation && (
           <Card>
             <CardHeader>
               <CardTitle>Invitation Created</CardTitle>
               <CardDescription>
                 Share this invitation with the intended recipient
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               {createdInvitation.code && (
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                   <div>
                     <p className="font-medium">Invitation Code</p>
                     <p className="text-2xl font-mono">{createdInvitation.code}</p>
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => copyToClipboard(createdInvitation.code, 'Code')}
                   >
                     <Copy className="h-4 w-4" />
                   </Button>
                 </div>
               )}

               {createdInvitation.shareableLink && (
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                   <div className="flex-1 min-w-0">
                     <p className="font-medium">Shareable Link</p>
                     <p className="text-sm text-gray-600 truncate">{createdInvitation.shareableLink}</p>
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => copyToClipboard(createdInvitation.shareableLink, 'Link')}
                   >
                     <Copy className="h-4 w-4" />
                   </Button>
                 </div>
               )}

               {createdInvitation.qrCode && (
                 <div className="text-center">
                   <p className="font-medium mb-3">QR Code</p>
                   <img 
                     src={createdInvitation.qrCode} 
                     alt="QR Code"
                     className="mx-auto border rounded-lg"
                   />
                 </div>
               )}

               <div className="text-sm text-gray-500">
                 Expires: {new Date(createdInvitation.expiresAt).toLocaleDateString()}
               </div>
             </CardContent>
           </Card>
         )}
       </div>
     );
   };
   ```

##### **Day 11-12: Relationship Dashboard Components**

1. **Parent-Child Management Dashboard**
   - **File:** `client/src/components/relationships/ParentChildDashboard.tsx`
   ```typescript
   import React, { useState, useEffect } from 'react';
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
   import { Button } from '../ui/button';
   import { Badge } from '../ui/badge';
   import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
   import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
   import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
   import { Plus, Users, UserPlus, Settings, MoreVertical, Trash2, Eye } from 'lucide-react';
   import { useAuth } from '../../contexts/AuthContext';
   import { relationshipAPI } from '../../services/relationshipAPI';
   import { CreateInvitation } from './CreateInvitation';
   import { toast } from '../../hooks/use-toast';

   interface Child {
     _id: string;
     profile: {
       firstName: string;
       lastName: string;
       age?: number;
       grade?: string;
       avatarUrl?: string;
     };
     email: string;
     username: string;
     metadata: {
       lastActiveAt: string;
     };
   }

   interface Relationship {
     _id: string;
     type: string;
     status: string;
     target: Child;
     permissions: {
       viewProgress: boolean;
       assignActivities: boolean;
       receiveNotifications: boolean;
       manageSettings: boolean;
     };
   }

   export const ParentChildDashboard: React.FC = () => {
     const { user, hasRole } = useAuth();
     const [children, setChildren] = useState<Child[]>([]);
     const [relationships, setRelationships] = useState<Relationship[]>([]);
     const [isLoading, setIsLoading] = useState(true);
     const [showInviteForm, setShowInviteForm] = useState(false);

     useEffect(() => {
       if (hasRole('parent')) {
         loadChildren();
         loadRelationships();
       }
     }, []);

     const loadChildren = async () => {
       try {
         const response = await relationshipAPI.getChildren();
         setChildren(response.data.children);
       } catch (error) {
         console.error('Error loading children:', error);
       }
     };

     const loadRelationships = async () => {
       try {
         const response = await relationshipAPI.getUserRelationships('parent-child');
         setRelationships(response.data.relationships);
       } catch (error) {
         console.error('Error loading relationships:', error);
       } finally {
         setIsLoading(false);
       }
     };

     const removeChild = async (relationshipId: string) => {
       try {
         await relationshipAPI.removeRelationship(relationshipId);
         toast({
           title: "Child Removed",
           description: "The child has been removed from your account.",
         });
         loadChildren();
         loadRelationships();
       } catch (error: any) {
         toast({
           title: "Error",
           description: error.response?.data?.message || "Failed to remove child",
           variant: "destructive"
         });
       }
     };

     const getLastActiveStatus = (lastActiveAt: string) => {
       const lastActive = new Date(lastActiveAt);
       const now = new Date();
       const diffHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));

       if (diffHours < 1) return { text: 'Active now', color: 'green' };
       if (diffHours < 24) return { text: `${diffHours}h ago`, color: 'yellow' };
       if (diffHours < 168) return { text: `${Math.floor(diffHours / 24)}d ago`, color: 'orange' };
       return { text: 'Inactive', color: 'gray' };
     };

     if (!hasRole('parent')) {
       return (
         <Card>
           <CardContent className="pt-6">
             <p className="text-center text-gray-500">
               This feature is only available for parent accounts.
             </p>
           </CardContent>
         </Card>
       );
     }

     return (
       <div className="space-y-6">
         <div className="flex items-center justify-between">
           <div>
             <h2 className="text-2xl font-bold">My Children</h2>
             <p className="text-gray-600">Manage your children's learning accounts</p>
           </div>
           <Button onClick={() => setShowInviteForm(true)}>
             <Plus className="h-4 w-4 mr-2" />
             Add Child
           </Button>
         </div>

         {showInviteForm && (
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <CardTitle>Invite a Child</CardTitle>
                 <Button variant="ghost" onClick={() => setShowInviteForm(false)}>
                   ×
                 </Button>
               </div>
             </CardHeader>
             <CardContent>
               <CreateInvitation
                 onInvitationCreated={() => {
                   setShowInviteForm(false);
                   toast({
                     title: "Invitation Created",
                     description: "Your child invitation has been created successfully.",
                   });
                 }}
               />
             </CardContent>
           </Card>
         )}

         {isLoading ? (
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {[1, 2, 3].map((i) => (
               <Card key={i}>
                 <CardContent className="p-6">
                   <div className="animate-pulse">
                     <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                     <div className="h-4 bg-gray-200 rounded mb-2"></div>
                     <div className="h-3 bg-gray-200 rounded"></div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         ) : children.length === 0 ? (
           <Card>
             <CardContent className="pt-6">
               <div className="text-center">
                 <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                 <h3 className="text-lg font-medium mb-2">No children connected</h3>
                 <p className="text-gray-600 mb-4">
                   Start by inviting your children to join the platform
                 </p>
                 <Button onClick={() => setShowInviteForm(true)}>
                   <UserPlus className="h-4 w-4 mr-2" />
                   Invite First Child
                 </Button>
               </div>
             </CardContent>
           </Card>
         ) : (
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {children.map((child) => {
               const relationship = relationships.find(r => r.target._id === child._id);
               const lastActiveStatus = getLastActiveStatus(child.metadata.lastActiveAt);

               return (
                 <Card key={child._id} className="relative">
                   <CardContent className="p-6">
                     <div className="flex items-start justify-between mb-4">
                       <div className="flex items-center space-x-3">
                         <Avatar className="h-12 w-12">
                           <AvatarImage src={child.profile.avatarUrl} />
                           <AvatarFallback>
                             {child.profile.firstName[0]}{child.profile.lastName[0]}
                           </AvatarFallback>
                         </Avatar>
                         <div>
                           <h3 className="font-medium">
                             {child.profile.firstName} {child.profile.lastName}
                           </h3>
                           <p className="text-sm text-gray-600">
                             {child.profile.grade && `Grade ${child.profile.grade}`}
                             {child.profile.age && ` • Age ${child.profile.age}`}
                           </p>
                         </div>
                       </div>
                       
                       <AlertDialog>
                         <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="sm">
                             <MoreVertical className="h-4 w-4" />
                           </Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                           <AlertDialogHeader>
                             <AlertDialogTitle>Remove Child</AlertDialogTitle>
                             <AlertDialogDescription>
                               Are you sure you want to remove {child.profile.firstName} from your account? 
                               This action cannot be undone.
                             </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction
                               onClick={() => relationship && removeChild(relationship._id)}
                               className="bg-red-600 hover:bg-red-700"
                             >
                               Remove
                             </AlertDialogAction>
                           </AlertDialogFooter>
                         </AlertDialogContent>
                       </AlertDialog>
                     </div>

                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-600">Status</span>
                         <Badge variant="outline" style={{ color: lastActiveStatus.color }}>
                           {lastActiveStatus.text}
                         </Badge>
                       </div>

                       {relationship && (
                         <div className="space-y-1">
                           <div className="flex items-center justify-between">
                             <span className="text-sm text-gray-600">Permissions</span>
                           </div>
                           <div className="flex flex-wrap gap-1">
                             {relationship.permissions.viewProgress && (
                               <Badge variant="secondary" className="text-xs">View Progress</Badge>
                             )}
                             {relationship.permissions.assignActivities && (
                               <Badge variant="secondary" className="text-xs">Assign Activities</Badge>
                             )}
                             {relationship.permissions.manageSettings && (
                               <Badge variant="secondary" className="text-xs">Manage Settings</Badge>
                             )}
                           </div>
                         </div>
                       )}
                     </div>

                     <div className="flex gap-2 mt-4">
                       <Button variant="outline" size="sm" className="flex-1">
                         <Eye className="h-4 w-4 mr-2" />
                         View Progress
                       </Button>
                       <Button variant="outline" size="sm">
                         <Settings className="h-4 w-4" />
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               );
             })}
           </div>
         )}
       </div>
     );
   };
   ```

#### **Testing Requirements**

1. **Backend Tests**
   - **Relationship Model Tests:** CRUD operations, validation, relationships
   - **Invitation System Tests:** Creation, acceptance, expiry, QR codes
   - **API Endpoint Tests:** All relationship management endpoints
   - **Permission Tests:** Role-based access control

2. **Frontend Tests**
   - **Component Tests:** Invitation creation, relationship management
   - **Integration Tests:** Full invitation flow, relationship approval
   - **E2E Tests:** Parent-child connection, teacher-student enrollment

3. **Security Tests**
   - **Authorization Tests:** Role-based access to relationships
   - **Invitation Security:** Code generation, expiry validation
   - **Data Privacy:** Ensure users can only access their relationships

#### **Deployment Steps**

1. **Database Setup:**
   ```bash
   # Create MongoDB collections and indexes
   db.relationships.createIndex({ "initiator": 1, "target": 1, "type": 1 }, { "unique": true })
   db.invitations.createIndex({ "code": 1 })
   db.invitations.createIndex({ "settings.expiresAt": 1 })
   ```

2. **Backend Deployment:**
   ```bash
   npm install mongoose uuid qrcode
   npm run build
   pm2 restart api
   ```

3. **Frontend Deployment:**
   ```bash
   npm install @hookform/resolvers zod
   npm run build
   ```

#### **Success Criteria**

- [ ] Parents can create child invitations successfully
- [ ] Teachers can create student invitations
- [ ] QR code generation working
- [ ] Email invitations sent correctly
- [ ] Relationship approval workflow functional
- [ ] Permission system enforced
- [ ] All relationship types supported
- [ ] Mobile-responsive design
- [ ] Performance under 300ms for relationship operations

---

### **Batch 3: Class & Group Management System**
**Duration:** 2 weeks  
**Dependencies:** Batch 2 (Relationship management)

#### **Week 1: Backend Implementation**

##### **Day 1-3: Class Schema & Models**

1. **Class Schema Design**
   - **File:** `server/src/models/Class.ts`
   ```typescript
   import { Schema, model, Document, ObjectId } from 'mongoose';

   export interface IClass extends Document {
     _id: ObjectId;
     name: string;
     description?: string;
     teacher: ObjectId;
     subject?: string;
     gradeLevel: string;
     settings: {
       maxStudents: number;
       autoApproval: boolean;
       allowParentView: boolean;
       public: boolean;
       allowLateJoin: boolean;
       requireApproval: boolean;
     };
     joinCode: string;
     joinCodeExpiry?: Date;
     students: Array<{
       userId: ObjectId;
       enrolledAt: Date;
       status: 'active' | 'inactive' | 'pending' | 'removed';
       invitedBy?: ObjectId;
       approvedBy?: ObjectId;
       permissions: {
         viewClassmates: boolean;
         participateInDiscussions: boolean;
         submitAssignments: boolean;
       };
     }>;
     schedule?: {
       days: string[]; // ['monday', 'wednesday', 'friday']
       startTime: string; // '09:00'
       endTime: string; // '10:30'
       timezone: string;
       recurring: boolean;
     };
     analytics: {
       totalStudents: number;
       activeStudents: number;
       totalAssignments: number;
       averageCompletion: number;
       lastActivity: Date;
     };
     metadata: {
       createdAt: Date;
       updatedAt: Date;
       archivedAt?: Date;
       academicYear?: string;
       semester?: string;
     };
     
     // Methods
     generateJoinCode(): string;
     addStudent(studentId: ObjectId, addedBy: ObjectId): Promise<void>;
     removeStudent(studentId: ObjectId): Promise<void>;
     updateAnalytics(): Promise<void>;
     isStudentEnrolled(studentId: ObjectId): boolean;
   }

   const classSchema = new Schema<IClass>({
     name: {
       type: String,
       required: true,
       trim: true,
       maxlength: 100
     },
     description: {
       type: String,
       trim: true,
       maxlength: 500
     },
     teacher: {
       type: Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     subject: {
       type: String,
       trim: true,
       enum: ['math', 'science', 'english', 'history', 'art', 'music', 'physical-education', 'other']
     },
     gradeLevel: {
       type: String,
       required: true,
       enum: ['pre-k', 'kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', 'mixed']
     },
     settings: {
       maxStudents: {
         type: Number,
         default: 30,
         min: 1,
         max: 100
       },
       autoApproval: {
         type: Boolean,
         default: false
       },
       allowParentView: {
         type: Boolean,
         default: true
       },
       public: {
         type: Boolean,
         default: false
       },
       allowLateJoin: {
         type: Boolean,
         default: true
       },
       requireApproval: {
         type: Boolean,
         default: true
       }
     },
     joinCode: {
       type: String,
       unique: true,
       required: true
     },
     joinCodeExpiry: Date,
     students: [{
       userId: {
         type: Schema.Types.ObjectId,
         ref: 'User',
         required: true
       },
       enrolledAt: {
         type: Date,
         default: Date.now
       },
       status: {
         type: String,
         enum: ['active', 'inactive', 'pending', 'removed'],
         default: 'pending'
       },
       invitedBy: {
         type: Schema.Types.ObjectId,
         ref: 'User'
       },
       approvedBy: {
         type: Schema.Types.ObjectId,
         ref: 'User'
       },
       permissions: {
         viewClassmates: { type: Boolean, default: true },
         participateInDiscussions: { type: Boolean, default: true },
         submitAssignments: { type: Boolean, default: true }
       }
     }],
     schedule: {
       days: [String],
       startTime: String,
       endTime: String,
       timezone: { type: String, default: 'UTC' },
       recurring: { type: Boolean, default: true }
     },
     analytics: {
       totalStudents: { type: Number, default: 0 },
       activeStudents: { type: Number, default: 0 },
       totalAssignments: { type: Number, default: 0 },
       averageCompletion: { type: Number, default: 0 },
       lastActivity: { type: Date, default: Date.now }
     },
     metadata: {
       createdAt: { type: Date, default: Date.now },
       updatedAt: { type: Date, default: Date.now },
       archivedAt: Date,
       academicYear: String,
       semester: String
     }
   }, {
     timestamps: true
   });

   // Indexes
   classSchema.index({ teacher: 1 });
   classSchema.index({ joinCode: 1 });
   classSchema.index({ 'students.userId': 1 });
   classSchema.index({ gradeLevel: 1, subject: 1 });
   classSchema.index({ 'settings.public': 1 });

   // Instance methods
   classSchema.methods.generateJoinCode = function(): string {
     this.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
     return this.joinCode;
   };

   classSchema.methods.addStudent = async function(studentId: ObjectId, addedBy: ObjectId): Promise<void> {
     // Check if student already exists
     const existingStudent = this.students.find(s => s.userId.toString() === studentId.toString());
     if (existingStudent) {
       throw new Error('Student already enrolled in this class');
     }

     // Check max capacity
     if (this.students.length >= this.settings.maxStudents) {
       throw new Error('Class has reached maximum capacity');
     }

     this.students.push({
       userId: studentId,
       enrolledAt: new Date(),
       status: this.settings.autoApproval ? 'active' : 'pending',
       invitedBy: addedBy,
       approvedBy: this.settings.autoApproval ? addedBy : undefined,
       permissions: {
         viewClassmates: true,
         participateInDiscussions: true,
         submitAssignments: true
       }
     });

     await this.updateAnalytics();
     await this.save();
   };

   classSchema.methods.removeStudent = async function(studentId: ObjectId): Promise<void> {
     this.students = this.students.filter(s => s.userId.toString() !== studentId.toString());
     await this.updateAnalytics();
     await this.save();
   };

   classSchema.methods.updateAnalytics = async function(): Promise<void> {
     this.analytics.totalStudents = this.students.length;
     this.analytics.activeStudents = this.students.filter(s => s.status === 'active').length;
     this.analytics.lastActivity = new Date();
   };

   classSchema.methods.isStudentEnrolled = function(studentId: ObjectId): boolean {
     return this.students.some(s => 
       s.userId.toString() === studentId.toString() && 
       ['active', 'pending'].includes(s.status)
     );
   };

   // Static methods
   classSchema.statics.findByJoinCode = function(code: string) {
     return this.findOne({ joinCode: code });
   };

   classSchema.statics.findTeacherClasses = function(teacherId: ObjectId) {
     return this.find({ 
       teacher: teacherId,
       'metadata.archivedAt': { $exists: false }
     }).populate('students.userId', 'profile email username');
   };

   classSchema.statics.findStudentClasses = function(studentId: ObjectId) {
     return this.find({
       'students.userId': studentId,
       'students.status': 'active',
       'metadata.archivedAt': { $exists: false }
     }).populate('teacher', 'profile email username');
   };

   export const Class = model<IClass>('Class', classSchema);
   ```

2. **Group Schema for Sub-groups within Classes**
   - **File:** `server/src/models/Group.ts`
   ```typescript
   import { Schema, model, Document, ObjectId } from 'mongoose';

   export interface IGroup extends Document {
     _id: ObjectId;
     name: string;
     description?: string;
     class: ObjectId;
     teacher: ObjectId;
     type: 'study-group' | 'project-team' | 'reading-circle' | 'skill-level' | 'custom';
     members: Array<{
       userId: ObjectId;
       role: 'member' | 'leader' | 'helper';
       joinedAt: Date;
       status: 'active' | 'inactive';
     }>;
     settings: {
       maxMembers: number;
       allowSelfJoin: boolean;
       requireApproval: boolean;
       isPrivate: boolean;
     };
     color: string; // For UI visualization
     metadata: {
       createdAt: Date;
       updatedAt: Date;
       archivedAt?: Date;
     };
   }

   const groupSchema = new Schema<IGroup>({
     name: {
       type: String,
       required: true,
       trim: true,
       maxlength: 50
     },
     description: {
       type: String,
       trim: true,
       maxlength: 200
     },
     class: {
       type: Schema.Types.ObjectId,
       ref: 'Class',
       required: true
     },
     teacher: {
       type: Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     type: {
       type: String,
       enum: ['study-group', 'project-team', 'reading-circle', 'skill-level', 'custom'],
       default: 'custom'
     },
     members: [{
       userId: {
         type: Schema.Types.ObjectId,
         ref: 'User',
         required: true
       },
       role: {
         type: String,
         enum: ['member', 'leader', 'helper'],
         default: 'member'
       },
       joinedAt: {
         type: Date,
         default: Date.now
       },
       status: {
         type: String,
         enum: ['active', 'inactive'],
         default: 'active'
       }
     }],
     settings: {
       maxMembers: { type: Number, default: 8, min: 2, max: 20 },
       allowSelfJoin: { type: Boolean, default: false },
       requireApproval: { type: Boolean, default: true },
       isPrivate: { type: Boolean, default: false }
     },
     color: {
       type: String,
       default: '#3B82F6'
     },
     metadata: {
       createdAt: { type: Date, default: Date.now },
       updatedAt: { type: Date, default: Date.now },
       archivedAt: Date
     }
   }, {
     timestamps: true
   });

   // Indexes
   groupSchema.index({ class: 1 });
   groupSchema.index({ teacher: 1 });
   groupSchema.index({ 'members.userId': 1 });

   export const Group = model<IGroup>('Group', groupSchema);
   ```

##### **Day 4-5: Class Service & Controllers**

1. **Class Management Service**
   - **File:** `server/src/services/classService.ts`
   ```typescript
   import { ObjectId } from 'mongoose';
   import { Class, IClass } from '../models/Class';
   import { Group, IGroup } from '../models/Group';
   import { UserMongo } from '../models/UserMongo';
   import { Relationship } from '../models/Relationship';
   import { emailService } from './emailService';
   import { logger } from '../utils/logger';

   export class ClassService {
     
     async createClass(teacherId: ObjectId, classData: {
       name: string;
       description?: string;
       subject?: string;
       gradeLevel: string;
       settings?: any;
       schedule?: any;
     }): Promise<IClass> {
       
       const teacher = await UserMongo.findById(teacherId);
       if (!teacher || teacher.role !== 'teacher') {
         throw new Error('Only teachers can create classes');
       }

       const newClass = new Class({
         name: classData.name,
         description: classData.description,
         teacher: teacherId,
         subject: classData.subject,
         gradeLevel: classData.gradeLevel,
         settings: {
           maxStudents: 30,
           autoApproval: false,
           allowParentView: true,
           public: false,
           allowLateJoin: true,
           requireApproval: true,
           ...classData.settings
         },
         joinCode: '', // Will be generated
         schedule: classData.schedule,
         analytics: {
           totalStudents: 0,
           activeStudents: 0,
           totalAssignments: 0,
           averageCompletion: 0,
           lastActivity: new Date()
         }
       });

       newClass.generateJoinCode();
       await newClass.save();

       logger.info(`Class created: ${newClass._id} by teacher ${teacher.email}`);
       return newClass;
     }

     async joinClassWithCode(joinCode: string, studentId: ObjectId): Promise<IClass> {
       const classDoc = await Class.findByJoinCode(joinCode);
       if (!classDoc) {
         throw new Error('Invalid join code');
       }

       // Check if join code is expired
       if (classDoc.joinCodeExpiry && classDoc.joinCodeExpiry < new Date()) {
         throw new Error('Join code has expired');
       }

       const student = await UserMongo.findById(studentId);
       if (!student || student.role !== 'student') {
         throw new Error('Only students can join classes');
       }

       // Check if student is already enrolled
       if (classDoc.isStudentEnrolled(studentId)) {
         throw new Error('Student is already enrolled in this class');
       }

       await classDoc.addStudent(studentId, classDoc.teacher);
       
       // Notify teacher of new enrollment
       await this.notifyTeacherOfEnrollment(classDoc, student);

       logger.info(`Student ${student.email} joined class ${classDoc._id}`);
       return classDoc;
     }

     async addStudentToClass(classId: ObjectId, studentId: ObjectId, teacherId: ObjectId): Promise<void> {
       const classDoc = await Class.findById(classId);
       if (!classDoc) {
         throw new Error('Class not found');
       }

       // Verify teacher owns the class
       if (classDoc.teacher.toString() !== teacherId.toString()) {
         throw new Error('Only the class teacher can add students');
       }

       const student = await UserMongo.findById(studentId);
       if (!student || student.role !== 'student') {
         throw new Error('Invalid student');
       }

       await classDoc.addStudent(studentId, teacherId);
       
       // Create teacher-student relationship if it doesn't exist
       await this.createTeacherStudentRelationship(teacherId, studentId);
       
       // Notify student and parents
       await this.notifyOfClassEnrollment(classDoc, student);
     }

     async approveStudentEnrollment(classId: ObjectId, studentId: ObjectId, teacherId: ObjectId): Promise<void> {
       const classDoc = await Class.findById(classId);
       if (!classDoc) {
         throw new Error('Class not found');
       }

       if (classDoc.teacher.toString() !== teacherId.toString()) {
         throw new Error('Only the class teacher can approve enrollments');
       }

       const studentEntry = classDoc.students.find(s => s.userId.toString() === studentId.toString());
       if (!studentEntry) {
         throw new Error('Student not found in class');
       }

       if (studentEntry.status !== 'pending') {
         throw new Error('Student enrollment is not pending');
       }

       studentEntry.status = 'active';
       studentEntry.approvedBy = teacherId;
       
       await classDoc.updateAnalytics();
       await classDoc.save();

       // Notify student and parents of approval
       const student = await UserMongo.findById(studentId);
       await this.notifyOfEnrollmentApproval(classDoc, student);
     }

     async removeStudentFromClass(classId: ObjectId, studentId: ObjectId, requesterId: ObjectId): Promise<void> {
       const classDoc = await Class.findById(classId);
       if (!classDoc) {
         throw new Error('Class not found');
       }

       const requester = await UserMongo.findById(requesterId);
       if (!requester) {
         throw new Error('Requester not found');
       }

       // Check permissions
       const canRemove = 
         classDoc.teacher.toString() === requesterId.toString() || // Teacher
         studentId.toString() === requesterId.toString() || // Student themselves
         await this.isParentOfStudent(requesterId, studentId); // Parent

       if (!canRemove) {
         throw new Error('Insufficient permissions to remove student');
       }

       await classDoc.removeStudent(studentId);
       logger.info(`Student ${studentId} removed from class ${classId} by ${requester.email}`);
     }

     async getTeacherClasses(teacherId: ObjectId): Promise<IClass[]> {
       return await Class.findTeacherClasses(teacherId);
     }

     async getStudentClasses(studentId: ObjectId): Promise<IClass[]> {
       return await Class.findStudentClasses(studentId);
     }

     async getClassById(classId: ObjectId, userId: ObjectId): Promise<IClass> {
       const classDoc = await Class.findById(classId)
         .populate('teacher', 'profile email username')
         .populate('students.userId', 'profile email username');

       if (!classDoc) {
         throw new Error('Class not found');
       }

       // Check if user has access to this class
       const hasAccess = 
         classDoc.teacher._id.toString() === userId.toString() || // Teacher
         classDoc.isStudentEnrolled(userId) || // Student
         await this.isParentOfClassStudent(userId, classId); // Parent

       if (!hasAccess) {
         throw new Error('Access denied to this class');
       }

       return classDoc;
     }

     async updateClass(classId: ObjectId, teacherId: ObjectId, updates: any): Promise<IClass> {
       const classDoc = await Class.findById(classId);
       if (!classDoc) {
         throw new Error('Class not found');
       }

       if (classDoc.teacher.toString() !== teacherId.toString()) {
         throw new Error('Only the class teacher can update class details');
       }

       // Apply updates
       Object.keys(updates).forEach(key => {
         if (key in classDoc.toObject()) {
           classDoc[key] = updates[key];
         }
       });

       await classDoc.save();
       return classDoc;
     }

     async regenerateJoinCode(classId: ObjectId, teacherId: ObjectId): Promise<string> {
       const classDoc = await Class.findById(classId);
       if (!classDoc) {
         throw new Error('Class not found');
       }

       if (classDoc.teacher.toString() !== teacherId.toString()) {
         throw new Error('Only the class teacher can regenerate join codes');
       }

       const newCode = classDoc.generateJoinCode();
       classDoc.joinCodeExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
       await classDoc.save();

       return newCode;
     }

     async createGroup(classId: ObjectId, teacherId: ObjectId, groupData: {
       name: string;
       description?: string;
       type: string;
       members?: ObjectId[];
       settings?: any;
     }): Promise<IGroup> {
       
       const classDoc = await Class.findById(classId);
       if (!classDoc) {
         throw new Error('Class not found');
       }

       if (classDoc.teacher.toString() !== teacherId.toString()) {
         throw new Error('Only the class teacher can create groups');
       }

       const group = new Group({
         name: groupData.name,
         description: groupData.description,
         class: classId,
         teacher: teacherId,
         type: groupData.type,
         members: (groupData.members || []).map(userId => ({
           userId,
           role: 'member',
           joinedAt: new Date(),
           status: 'active'
         })),
         settings: {
           maxMembers: 8,
           allowSelfJoin: false,
           requireApproval: true,
           isPrivate: false,
           ...groupData.settings
         }
       });

       await group.save();
       logger.info(`Group created: ${group._id} in class ${classId}`);
       return group;
     }

     async getClassGroups(classId: ObjectId): Promise<IGroup[]> {
       return await Group.find({
         class: classId,
         'metadata.archivedAt': { $exists: false }
       }).populate('members.userId', 'profile email username');
     }

     private async createTeacherStudentRelationship(teacherId: ObjectId, studentId: ObjectId): Promise<void> {
       try {
         const existingRelationship = await Relationship.findOne({
           initiator: teacherId,
           target: studentId,
           type: 'teacher-student'
         });

         if (!existingRelationship) {
           const relationship = new Relationship({
             type: 'teacher-student',
             initiator: teacherId,
             target: studentId,
             status: 'approved',
             permissions: {
               viewProgress: true,
               assignActivities: true,
               receiveNotifications: true,
               manageSettings: false,
               viewReports: true,
               communicateWithTeacher: false
             }
           });

           await relationship.save();
         }
       } catch (error) {
         logger.error('Error creating teacher-student relationship:', error);
       }
     }

     private async isParentOfStudent(parentId: ObjectId, studentId: ObjectId): Promise<boolean> {
       const relationship = await Relationship.findOne({
         initiator: parentId,
         target: studentId,
         type: 'parent-child',
         status: 'approved'
       });

       return !!relationship;
     }

     private async isParentOfClassStudent(parentId: ObjectId, classId: ObjectId): Promise<boolean> {
       const classDoc = await Class.findById(classId);
       if (!classDoc) return false;

       for (const student of classDoc.students) {
         if (await this.isParentOfStudent(parentId, student.userId)) {
           return true;
         }
       }

       return false;
     }

     private async notifyTeacherOfEnrollment(classDoc: IClass, student: any): Promise<void> {
       // Implementation for teacher notification
       logger.info(`Notified teacher of new enrollment: ${student.email} in ${classDoc.name}`);
     }

     private async notifyOfClassEnrollment(classDoc: IClass, student: any): Promise<void> {
       // Implementation for student/parent notification
       logger.info(`Notified of class enrollment: ${student.email} in ${classDoc.name}`);
     }

     private async notifyOfEnrollmentApproval(classDoc: IClass, student: any): Promise<void> {
       // Implementation for approval notification
       logger.info(`Notified of enrollment approval: ${student.email} in ${classDoc.name}`);
     }
   }

   export const classService = new ClassService();
   ```

2. **Class Controller**
   - **File:** `server/src/controllers/classController.ts`
   ```typescript
   import { Request, Response } from 'express';
   import { validationResult } from 'express-validator';
   import { classService } from '../services/classService';
   import { logger } from '../utils/logger';

   interface AuthenticatedRequest extends Request {
     user?: {
       userId: string;
       role: string;
       email: string;
     };
   }

   export const createClass = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({
           success: false,
           message: 'Validation failed',
           errors: errors.array()
         });
       }

       const teacherId = req.user!.userId;
       const classData = req.body;

       const newClass = await classService.createClass(teacherId, classData);

       res.status(201).json({
         success: true,
         message: 'Class created successfully',
         data: { class: newClass }
       });
     } catch (error) {
       logger.error('Create class error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to create class'
       });
     }
   };

   export const joinClass = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { joinCode } = req.body;
       const studentId = req.user!.userId;

       const classDoc = await classService.joinClassWithCode(joinCode, studentId);

       res.json({
         success: true,
         message: 'Successfully joined class',
         data: { class: classDoc }
       });
     } catch (error) {
       logger.error('Join class error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to join class'
       });
     }
   };

   export const getMyClasses = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const userId = req.user!.userId;
       const userRole = req.user!.role;

       let classes;
       if (userRole === 'teacher') {
         classes = await classService.getTeacherClasses(userId);
       } else if (userRole === 'student') {
         classes = await classService.getStudentClasses(userId);
       } else {
         return res.status(403).json({
           success: false,
           message: 'Only teachers and students can access classes'
         });
       }

       res.json({
         success: true,
         data: { classes }
       });
     } catch (error) {
       logger.error('Get classes error:', error);
       res.status(500).json({
         success: false,
         message: 'Failed to get classes'
       });
     }
   };

   export const getClassById = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { classId } = req.params;
       const userId = req.user!.userId;

       const classDoc = await classService.getClassById(classId, userId);

       res.json({
         success: true,
         data: { class: classDoc }
       });
     } catch (error) {
       logger.error('Get class error:', error);
       res.status(error instanceof Error && error.message === 'Access denied to this class' ? 403 : 404).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to get class'
       });
     }
   };

   export const addStudentToClass = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { classId } = req.params;
       const { studentId } = req.body;
       const teacherId = req.user!.userId;

       await classService.addStudentToClass(classId, studentId, teacherId);

       res.json({
         success: true,
         message: 'Student added to class successfully'
       });
     } catch (error) {
       logger.error('Add student error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to add student to class'
       });
     }
   };

   export const approveStudent = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { classId, studentId } = req.params;
       const teacherId = req.user!.userId;

       await classService.approveStudentEnrollment(classId, studentId, teacherId);

       res.json({
         success: true,
         message: 'Student enrollment approved'
       });
     } catch (error) {
       logger.error('Approve student error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to approve student'
       });
     }
   };

   export const removeStudentFromClass = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { classId, studentId } = req.params;
       const requesterId = req.user!.userId;

       await classService.removeStudentFromClass(classId, studentId, requesterId);

       res.json({
         success: true,
         message: 'Student removed from class'
       });
     } catch (error) {
       logger.error('Remove student error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to remove student'
       });
     }
   };

   export const regenerateJoinCode = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { classId } = req.params;
       const teacherId = req.user!.userId;

       const newCode = await classService.regenerateJoinCode(classId, teacherId);

       res.json({
         success: true,
         message: 'Join code regenerated',
         data: { joinCode: newCode }
       });
     } catch (error) {
       logger.error('Regenerate join code error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to regenerate join code'
       });
     }
   };

   export const createGroup = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { classId } = req.params;
       const teacherId = req.user!.userId;
       const groupData = req.body;

       const group = await classService.createGroup(classId, teacherId, groupData);

       res.status(201).json({
         success: true,
         message: 'Group created successfully',
         data: { group }
       });
     } catch (error) {
       logger.error('Create group error:', error);
       res.status(400).json({
         success: false,
         message: error instanceof Error ? error.message : 'Failed to create group'
       });
     }
   };

   export const getClassGroups = async (req: AuthenticatedRequest, res: Response) => {
     try {
       const { classId } = req.params;
       
       const groups = await classService.getClassGroups(classId);

       res.json({
         success: true,
         data: { groups }
       });
     } catch (error) {
       logger.error('Get groups error:', error);
       res.status(500).json({
         success: false,
         message: 'Failed to get groups'
       });
     }
   };
   ```

#### **Week 2: Frontend Implementation**

##### **Day 8-10: Class Management Components**

1. **Class Creation Component**
   - **File:** `client/src/components/classes/CreateClassForm.tsx`
   ```typescript
   import React, { useState } from 'react';
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import * as z from 'zod';
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
   import { Button } from '../ui/button';
   import { Input } from '../ui/input';
   import { Label } from '../ui/label';
   import { Textarea } from '../ui/textarea';
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
   import { Switch } from '../ui/switch';
   import { Alert, AlertDescription } from '../ui/alert';
   import { GraduationCap, Users, Settings, Clock } from 'lucide-react';
   import { classAPI } from '../../services/classAPI';
   import { toast } from '../../hooks/use-toast';

   const createClassSchema = z.object({
     name: z.string().min(1, 'Class name is required').max(100, 'Name too long'),
     description: z.string().max(500, 'Description too long').optional(),
     subject: z.enum(['math', 'science', 'english', 'history', 'art', 'music', 'physical-education', 'other']).optional(),
     gradeLevel: z.enum(['pre-k', 'kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th', 'mixed']),
     settings: z.object({
       maxStudents: z.number().min(1).max(100).default(30),
       autoApproval: z.boolean().default(false),
       allowParentView: z.boolean().default(true),
       public: z.boolean().default(false),
       allowLateJoin: z.boolean().default(true),
       requireApproval: z.boolean().default(true)
     }).optional(),
     schedule: z.object({
       days: z.array(z.string()).min(1, 'Select at least one day'),
       startTime: z.string().min(1, 'Start time is required'),
       endTime: z.string().min(1, 'End time is required'),
       timezone: z.string().default('UTC'),
       recurring: z.boolean().default(true)
     }).optional()
   });

   type CreateClassFormData = z.infer<typeof createClassSchema>;

   interface CreateClassFormProps {
     onClassCreated?: (classData: any) => void;
     onCancel?: () => void;
   }

   const subjects = [
     { value: 'math', label: 'Mathematics' },
     { value: 'science', label: 'Science' },
     { value: 'english', label: 'English Language Arts' },
     { value: 'history', label: 'History/Social Studies' },
     { value: 'art', label: 'Art' },
     { value: 'music', label: 'Music' },
     { value: 'physical-education', label: 'Physical Education' },
     { value: 'other', label: 'Other' }
   ];

   const gradeLevels = [
     { value: 'pre-k', label: 'Pre-K' },
     { value: 'kindergarten', label: 'Kindergarten' },
     { value: '1st', label: '1st Grade' },
     { value: '2nd', label: '2nd Grade' },
     { value: '3rd', label: '3rd Grade' },
     { value: '4th', label: '4th Grade' },
     { value: '5th', label: '5th Grade' },
     { value: '6th', label: '6th Grade' },
     { value: 'mixed', label: 'Mixed Grades' }
   ];

   const weekDays = [
     { value: 'monday', label: 'Monday' },
     { value: 'tuesday', label: 'Tuesday' },
     { value: 'wednesday', label: 'Wednesday' },
     { value: 'thursday', label: 'Thursday' },
     { value: 'friday', label: 'Friday' },
     { value: 'saturday', label: 'Saturday' },
     { value: 'sunday', label: 'Sunday' }
   ];

   export const CreateClassForm: React.FC<CreateClassFormProps> = ({ onClassCreated, onCancel }) => {
     const [isLoading, setIsLoading] = useState(false);
     const [activeTab, setActiveTab] = useState<'basic' | 'settings' | 'schedule'>('basic');

     const {
       register,
       handleSubmit,
       formState: { errors },
       watch,
       setValue,
       getValues
     } = useForm<CreateClassFormData>({
       resolver: zodResolver(createClassSchema),
       defaultValues: {
         settings: {
           maxStudents: 30,
           autoApproval: false,
           allowParentView: true,
           public: false,
           allowLateJoin: true,
           requireApproval: true
         },
         schedule: {
           days: [],
           timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
           recurring: true
         }
       }
     });

     const watchedDays = watch('schedule.days') || [];

     const onSubmit = async (data: CreateClassFormData) => {
       try {
         setIsLoading(true);
         
         const response = await classAPI.createClass(data);
         
         toast({
           title: "Class Created",
           description: `${data.name} has been created successfully.`,
         });

         onClassCreated?.(response.data.class);
       } catch (error: any) {
         toast({
           title: "Error",
           description: error.response?.data?.message || "Failed to create class",
           variant: "destructive"
         });
       } finally {
         setIsLoading(false);
       }
     };

     const toggleDay = (day: string) => {
       const currentDays = getValues('schedule.days') || [];
       const newDays = currentDays.includes(day)
         ? currentDays.filter(d => d !== day)
         : [...currentDays, day];
       setValue('schedule.days', newDays);
     };

     const tabs = [
       { id: 'basic', label: 'Basic Info', icon: GraduationCap },
       { id: 'settings', label: 'Settings', icon: Settings },
       { id: 'schedule', label: 'Schedule', icon: Clock }
     ];

     return (
       <Card className="w-full max-w-2xl mx-auto">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <GraduationCap className="h-5 w-5" />
             Create New Class
           </CardTitle>
           <CardDescription>
             Set up a new virtual classroom for your students
           </CardDescription>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
             {/* Tab Navigation */}
             <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
               {tabs.map((tab) => {
                 const Icon = tab.icon;
                 return (
                   <button
                     key={tab.id}
                     type="button"
                     className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                       activeTab === tab.id
                         ? 'bg-white text-blue-600 shadow-sm'
                         : 'text-gray-600 hover:text-gray-900'
                     }`}
                     onClick={() => setActiveTab(tab.id as any)}
                   >
                     <Icon className="h-4 w-4" />
                     {tab.label}
                   </button>
                 );
               })}
             </div>

             {/* Basic Information Tab */}
             {activeTab === 'basic' && (
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="name">Class Name *</Label>
                   <Input
                     id="name"
                     {...register('name')}
                     placeholder="e.g., 3rd Grade Math"
                   />
                   {errors.name && (
                     <p className="text-sm text-red-600">{errors.name.message}</p>
                   )}
                 </div>

                 <div>
                   <Label htmlFor="description">Description</Label>
                   <Textarea
                     id="description"
                     {...register('description')}
                     placeholder="Brief description of the class"
                     rows={3}
                   />
                   {errors.description && (
                     <p className="text-sm text-red-600">{errors.description.message}</p>
                   )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label htmlFor="subject">Subject</Label>
                     <Select onValueChange={(value) => setValue('subject', value as any)}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select subject" />
                       </SelectTrigger>
                       <SelectContent>
                         {subjects.map((subject) => (
                           <SelectItem key={subject.value} value={subject.value}>
                             {subject.label}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                   <div>
                     <Label htmlFor="gradeLevel">Grade Level *</Label>
                     <Select onValueChange={(value) => setValue('gradeLevel', value as any)}>
                       <SelectTrigger>
                         <SelectValue placeholder="Select grade" />
                       </SelectTrigger>
                       <SelectContent>
                         {gradeLevels.map((grade) => (
                           <SelectItem key={grade.value} value={grade.value}>
                             {grade.label}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     {errors.gradeLevel && (
                       <p className="text-sm text-red-600">{errors.gradeLevel.message}</p>
                     )}
                   </div>
                 </div>
               </div>
             )}

             {/* Settings Tab */}
             {activeTab === 'settings' && (
               <div className="space-y-6">
                 <div>
                   <Label htmlFor="maxStudents">Maximum Students</Label>
                   <Input
                     id="maxStudents"
                     type="number"
                     min="1"
                     max="100"
                     {...register('settings.maxStudents', { valueAsNumber: true })}
                   />
                   <p className="text-sm text-gray-500">Set the maximum number of students for this class</p>
                 </div>

                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <div>
                       <Label htmlFor="autoApproval">Auto-approve enrollments</Label>
                       <p className="text-sm text-gray-500">Students can join immediately without approval</p>
                     </div>
                     <Switch
                       id="autoApproval"
                       onCheckedChange={(checked) => setValue('settings.autoApproval', checked)}
                     />
                   </div>

                   <div className="flex items-center justify-between">
                     <div>
                       <Label htmlFor="allowParentView">Allow parent access</Label>
                       <p className="text-sm text-gray-500">Parents can view their child's progress in this class</p>
                     </div>
                     <Switch
                       id="allowParentView"
                       defaultChecked={true}
                       onCheckedChange={(checked) => setValue('settings.allowParentView', checked)}
                     />
                   </div>

                   <div className="flex items-center justify-between">
                     <div>
                       <Label htmlFor="allowLateJoin">Allow late joining</Label>
                       <p className="text-sm text-gray-500">Students can join after the class has started</p>
                     </div>
                     <Switch
                       id="allowLateJoin"
                       defaultChecked={true}
                       onCheckedChange={(checked) => setValue('settings.allowLateJoin', checked)}
                     />
                   </div>

                   <div className="flex items-center justify-between">
                     <div>
                       <Label htmlFor="public">Public class</Label>
                       <p className="text-sm text-gray-500">Class appears in public listings</p>
                     </div>
                     <Switch
                       id="public"
                       onCheckedChange={(checked) => setValue('settings.public', checked)}
                     />
                   </div>
                 </div>
               </div>
             )}

             {/* Schedule Tab */}
             {activeTab === 'schedule' && (
               <div className="space-y-6">
                 <div>
                   <Label>Class Days</Label>
                   <div className="grid grid-cols-4 gap-2 mt-2">
                     {weekDays.map((day) => (
                       <button
                         key={day.value}
                         type="button"
                         className={`p-2 rounded-md text-sm font-medium transition-colors ${
                           watchedDays.includes(day.value)
                             ? 'bg-blue-600 text-white'
                             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                         }`}
                         onClick={() => toggleDay(day.value)}
                       >
                         {day.label.substring(0, 3)}
                       </button>
                     ))}
                   </div>
                   {errors.schedule?.days && (
                     <p className="text-sm text-red-600">{errors.schedule.days.message}</p>
                   )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label htmlFor="startTime">Start Time</Label>
                     <Input
                       id="startTime"
                       type="time"
                       {...register('schedule.startTime')}
                     />
                     {errors.schedule?.startTime && (
                       <p className="text-sm text-red-600">{errors.schedule.startTime.message}</p>
                     )}
                   </div>

                   <div>
                     <Label htmlFor="endTime">End Time</Label>
                     <Input
                       id="endTime"
                       type="time"
                       {...register('schedule.endTime')}
                     />
                     {errors.schedule?.endTime && (
                       <p className="text-sm text-red-600">{errors.schedule.endTime.message}</p>
                     )}
                   </div>
                 </div>

                 <div className="flex items-center justify-between">
                   <div>
                     <Label htmlFor="recurring">Recurring Schedule</Label>
                     <p className="text-sm text-gray-500">This schedule repeats weekly</p>
                   </div>
                   <Switch
                     id="recurring"
                     defaultChecked={true}
                     onCheckedChange={(checked) => setValue('schedule.recurring', checked)}
                   />
                 </div>
               </div>
             )}

             {/* Form Actions */}
             <div className="flex justify-between pt-6 border-t">
               <Button type="button" variant="outline" onClick={onCancel}>
                 Cancel
               </Button>
               <Button type="submit" disabled={isLoading}>
                 {isLoading ? 'Creating...' : 'Create Class'}
               </Button>
             </div>
           </form>
         </CardContent>
       </Card>
     );
   };
   ```

2. **Join Class Component**
   - **File:** `client/src/components/classes/JoinClassForm.tsx`
   ```typescript
   import React, { useState } from 'react';
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import * as z from 'zod';
   import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
   import { Button } from '../ui/button';
   import { Input } from '../ui/input';
   import { Label } from '../ui/label';
   import { Alert, AlertDescription } from '../ui/alert';
   import { UserPlus, QrCode, Type } from 'lucide-react';
   import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
   import { classAPI } from '../../services/classAPI';
   import { toast } from '../../hooks/use-toast';

   const joinClassSchema = z.object({
     joinCode: z.string().min(6, 'Join code must be at least 6 characters').max(8, 'Join code too long')
   });

   type JoinClassFormData = z.infer<typeof joinClassSchema>;

   interface JoinClassFormProps {
     onClassJoined?: (classData: any) => void;
     onCancel?: () => void;
   }

   export const JoinClassForm: React.FC<JoinClassFormProps> = ({ onClassJoined, onCancel }) => {
     const [isLoading, setIsLoading] = useState(false);
     const [joinMethod, setJoinMethod] = useState<'code' | 'qr'>('code');

     const {
       register,
       handleSubmit,
       formState: { errors },
       setValue
     } = useForm<JoinClassFormData>({
       resolver: zodResolver(joinClassSchema)
     });

     const onSubmit = async (data: JoinClassFormData) => {
       try {
         setIsLoading(true);
         
         const response = await classAPI.joinClass(data.joinCode);
         
         toast({
           title: "Class Joined",
           description: `Successfully joined ${response.data.class.name}`,
         });

         onClassJoined?.(response.data.class);
       } catch (error: any) {
         toast({
           title: "Error",
           description: error.response?.data?.message || "Failed to join class",
           variant: "destructive"
         });
       } finally {
         setIsLoading(false);
       }
     };

     const handleQRScan = (scannedData: string) => {
       try {
         const data = JSON.parse(scannedData);
         if (data.type === 'class-join' && data.code) {
           setValue('joinCode', data.code);
           toast({
             title: "QR Code Scanned",
             description: "Join code has been filled automatically",
           });
         } else {
           throw new Error('Invalid QR code');
         }
       } catch (error) {
         toast({
           title: "Invalid QR Code",
           description: "This QR code is not for joining a class",
           variant: "destructive"
         });
       }
     };

     return (
       <Card className="w-full max-w-md mx-auto">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <UserPlus className="h-5 w-5" />
             Join a Class
           </CardTitle>
           <CardDescription>
             Enter a class code or scan a QR code to join
           </CardDescription>
         </CardHeader>
         <CardContent>
           <Tabs value={joinMethod} onValueChange={(value) => setJoinMethod(value as any)}>
             <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="code" className="flex items-center gap-2">
                 <Type className="h-4 w-4" />
                 Enter Code
               </TabsTrigger>
               <TabsTrigger value="qr" className="flex items-center gap-2">
                 <QrCode className="h-4 w-4" />
                 Scan QR
               </TabsTrigger>
             </TabsList>

             <TabsContent value="code" className="space-y-4">
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                 <div>
                   <Label htmlFor="joinCode">Class Join Code</Label>
                   <Input
                     id="joinCode"
                     {...register('joinCode')}
                     placeholder="ABC123"
                     className="text-center text-lg font-mono uppercase"
                     maxLength={8}
                     onChange={(e) => {
                       e.target.value = e.target.value.toUpperCase();
                       register('joinCode').onChange(e);
                     }}
                   />
                   {errors.joinCode && (
                     <p className="text-sm text-red-600">{errors.joinCode.message}</p>
                   )}
                   <p className="text-sm text-gray-500 mt-1">
                     Enter the 6-8 character code provided by your teacher
                   </p>
                 </div>

                 <div className="flex gap-2">
                   <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                     Cancel
                   </Button>
                   <Button type="submit" disabled={isLoading} className="flex-1">
                     {isLoading ? 'Joining...' : 'Join Class'}
                   </Button>
                 </div>
               </form>
             </TabsContent>

             <TabsContent value="qr" className="space-y-4">
               <div className="text-center">
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                   <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                   <p className="text-gray-600 mb-4">
                     QR Code scanner will be available here
                   </p>
                   <Button variant="outline" size="sm">
                     Open Camera
                   </Button>
                 </div>
                 
                 <Alert className="mt-4">
                   <AlertDescription>
                     Ask your teacher to show you the class QR code, then use your camera to scan it.
                   </AlertDescription>
                 </Alert>
               </div>
             </TabsContent>
           </Tabs>
         </CardContent>
       </Card>
     );
   };
   ```

#### **Testing Requirements**

1. **Backend Tests**
   - **Class Model Tests:** Creation, join code generation, student management
   - **Group Model Tests:** Creation, member management, permissions
   - **API Tests:** All class management endpoints
   - **Permission Tests:** Teacher-only actions, student enrollment

2. **Frontend Tests**
   - **Component Tests:** Class creation form, join class flow
   - **Integration Tests:** Complete class creation and joining workflow
   - **E2E Tests:** Teacher creates class, student joins, group creation

#### **Success Criteria**

- [ ] Teachers can create classes with custom settings
- [ ] Students can join classes using join codes
- [ ] QR code generation and scanning works
- [ ] Group creation and management functional
- [ ] Class roster management working
- [ ] Permission system enforced correctly
- [ ] Mobile-responsive design
- [ ] Performance under 400ms for class operations

---

### **Batch 4: Enhanced Activity Creation & Management System**
**Duration:** 2.5 weeks  
**Dependencies:** Batch 3 (Class management)

#### **Week 1: Backend Implementation**

##### **Day 1-3: Enhanced Activity Schema & Models**

1. **Enhanced Activity Schema Design**
   - **File:** `server/src/models/ActivityMongo.ts`
   - **Purpose:** Extend existing activity model with teacher creation capabilities, class assignment features, and advanced content management
   - **Key Features:** 
     - Creator attribution with role-based permissions
     - Multiple content types (text, image, audio, video, interactive)
     - Difficulty progression algorithms
     - Class-specific customization options
     - Activity sharing and collaboration settings
     - Version control for iterative improvements
     - AI-generated content support with human review
     - Analytics tracking for usage patterns

2. **Activity Template System**
   - **File:** `server/src/models/ActivityTemplate.ts`
   - **Purpose:** Provide standardized activity structures for quick creation
   - **Key Features:**
     - Pre-built templates for common activity types
     - Customizable template parameters
     - Template sharing between teachers
     - Grade-level appropriate defaults
     - Subject-specific template categories

3. **Activity Version Control**
   - **File:** `server/src/models/ActivityVersion.ts`
   - **Purpose:** Track activity modifications and allow rollback capabilities
   - **Key Features:**
     - Complete activity state snapshots
     - Change attribution and timestamps
     - Diff visualization for modifications
     - Automated backup creation
     - Performance impact tracking

##### **Day 4-7: Activity Creation Services & APIs**

1. **Enhanced Activity Service**
   - **File:** `server/src/services/activityService.ts`
   - **Implementation:** Comprehensive activity management with creation, modification, duplication, and sharing capabilities
   - **Key Methods:**
     - `createActivity()` - Full activity creation with validation
     - `createFromTemplate()` - Template-based activity generation
     - `duplicateActivity()` - Copy activities with modifications
     - `shareWithClass()` - Class-specific activity distribution
     - `generateAIContent()` - AI-powered content creation
     - `validateActivityContent()` - Content quality assurance
     - `trackActivityUsage()` - Analytics and engagement tracking

2. **File Upload & Processing Service**
   - **File:** `server/src/services/fileProcessingService.ts`
   - **Implementation:** Handle multimedia content upload, processing, and optimization
   - **Key Methods:**
     - `processImageUpload()` - Image optimization and format conversion
     - `extractPDFContent()` - PDF text and image extraction
     - `processAudioUpload()` - Audio format conversion and compression
     - `generateThumbnails()` - Automatic preview generation
     - `scanForInappropriateContent()` - Content safety validation

3. **AI Content Generation Service**
   - **File:** `server/src/services/aiContentService.ts`
   - **Implementation:** Integration with AI services for automated content creation
   - **Key Methods:**
     - `generateActivityFromText()` - Text-to-activity conversion
     - `enhanceActivityContent()` - Content improvement suggestions
     - `generateQuestions()` - Automatic question generation
     - `adjustDifficulty()` - Dynamic difficulty modification
     - `suggestSimilarActivities()` - Content recommendation engine

4. **Activity API Controllers**
   - **File:** `server/src/controllers/activityController.ts`
   - **Implementation:** RESTful API endpoints for all activity operations
   - **Key Endpoints:**
     - `POST /api/activities` - Create new activity
     - `GET /api/activities/templates` - Retrieve template library
     - `POST /api/activities/upload` - Handle file uploads
     - `PUT /api/activities/{id}` - Update activity content
     - `POST /api/activities/{id}/duplicate` - Duplicate activity
     - `POST /api/activities/{id}/share` - Share with classes
     - `GET /api/activities/my-activities` - Teacher's activity library

#### **Week 2: Frontend Implementation**

##### **Day 8-10: Activity Builder Interface**

1. **Enhanced Activity Builder Component**
   - **File:** `client/src/components/activities/ActivityBuilder.tsx`
   - **Purpose:** Comprehensive drag-and-drop interface for activity creation
   - **Key Features:**
     - Multi-step activity creation wizard
     - Real-time preview with mobile responsiveness
     - Component library for different question types
     - Rich text editor with multimedia support
     - Template selection and customization
     - Collaborative editing capabilities
     - Auto-save functionality with version history

2. **Content Type Components**
   - **Files:** `client/src/components/activities/content/`
   - **Purpose:** Specialized editors for different content types
   - **Components:**
     - `TextQuestionEditor.tsx` - Multiple choice, fill-in-blank, short answer
     - `ImageActivityEditor.tsx` - Image-based questions with hotspots
     - `AudioActivityEditor.tsx` - Listening comprehension activities
     - `VideoActivityEditor.tsx` - Video-based interactive content
     - `DrawingActivityEditor.tsx` - Creative drawing and annotation tools
     - `MathEquationEditor.tsx` - Mathematical expression builder

3. **Media Upload Manager**
   - **File:** `client/src/components/activities/MediaUploadManager.tsx`
   - **Purpose:** Comprehensive file upload and management system
   - **Key Features:**
     - Drag-and-drop file upload with progress tracking
     - Image cropping and editing tools
     - Audio recording and editing capabilities
     - File format conversion and optimization
     - Media library with search and organization
     - Batch upload processing with error handling

##### **Day 11-12: Template Library & AI Tools**

1. **Template Library Interface**
   - **File:** `client/src/components/activities/TemplateLibrary.tsx`
   - **Purpose:** Browse, search, and customize activity templates
   - **Key Features:**
     - Categorized template browsing by subject and grade
     - Template preview with sample content
     - Customization options before activity creation
     - Teacher-shared template marketplace
     - Rating and review system for templates
     - Advanced search with filters and sorting

2. **AI-Powered Creation Tools**
   - **File:** `client/src/components/activities/AICreationTools.tsx`
   - **Purpose:** AI-assisted activity generation and enhancement
   - **Key Features:**
     - Text-to-activity conversion with natural language processing
     - Content enhancement suggestions and improvements
     - Automatic question generation from provided materials
     - Difficulty adjustment based on class performance data
     - Learning objective alignment recommendations
     - Accessibility improvement suggestions

#### **Week 2.5: Testing & Integration**

##### **Day 13-15: Comprehensive Testing**

1. **Backend Testing Requirements**
   - **Activity Model Tests:** Creation, validation, versioning, sharing
   - **File Processing Tests:** Upload handling, format conversion, content extraction
   - **AI Integration Tests:** Content generation, enhancement, validation
   - **API Endpoint Tests:** All CRUD operations with proper authorization
   - **Performance Tests:** Large file uploads, concurrent activity creation

2. **Frontend Testing Requirements**
   - **Component Tests:** Activity builder, template library, media manager
   - **Integration Tests:** Complete activity creation workflow
   - **User Experience Tests:** Drag-and-drop functionality, responsive design
   - **Accessibility Tests:** Screen reader compatibility, keyboard navigation
   - **Performance Tests:** Large activity rendering, media loading optimization

3. **End-to-End Testing Scenarios**
   - Teacher creates activity from scratch using builder interface
   - Teacher creates activity from template with customizations
   - Teacher uploads PDF and converts to interactive activity
   - AI-powered activity generation from text description
   - Activity sharing with specific classes and permission management
   - Student interaction with created activities on mobile devices

#### **Database Migration Considerations**

1. **Activity Data Enhancement**
   - Migrate existing activities to new enhanced schema
   - Add creator attribution for existing anonymous activities
   - Establish default sharing permissions for legacy content
   - Create activity versions for all existing activities

2. **Template Population**
   - Create default template library from existing high-performing activities
   - Establish template categories and metadata
   - Set up template sharing and collaboration features

#### **Integration Points**

1. **Class Management Integration**
   - Activity assignment to specific classes
   - Class-based activity filtering and organization
   - Student enrollment-based activity access control

2. **User Management Integration**
   - Creator attribution and permission validation
   - Role-based activity creation and modification rights
   - Teacher collaboration on activity development

#### **Success Criteria**

- [ ] Teachers can create activities using intuitive drag-and-drop interface
- [ ] Template library provides quick activity creation options
- [ ] File upload system handles multiple formats with proper processing
- [ ] AI-powered tools enhance activity creation efficiency
- [ ] Activity sharing works seamlessly with class management
- [ ] Version control preserves activity modification history
- [ ] Performance remains optimal with media-rich activities
- [ ] Mobile responsiveness maintained across all creation tools
- [ ] Accessibility standards met for all creation interfaces

---

### **Batch 5: Activity Sharing & Assignment System**
**Duration:** 2 weeks  
**Dependencies:** Batch 4 (Activity creation)

#### **Week 1: Backend Implementation**

##### **Day 1-3: Assignment Schema & Models**

1. **Assignment Schema Design**
   - **File:** `server/src/models/Assignment.ts`
   - **Purpose:** Comprehensive assignment management linking activities to classes and students
   - **Key Features:**
     - Activity-to-class assignment tracking
     - Individual student assignment status
     - Due date management with timezone support
     - Assignment customization per class
     - Bulk assignment capabilities
     - Parent notification preferences
     - Late submission policies
     - Assignment completion analytics

2. **Sharing System Schema**
   - **File:** `server/src/models/ActivityShare.ts`
   - **Purpose:** Track activity sharing across different contexts
   - **Key Features:**
     - Share link generation with expiration
     - Access control and permission management
     - Usage analytics and tracking
     - Download permissions and restrictions
     - Collaborative sharing with other teachers
     - Public library contribution system

##### **Day 4-7: Assignment Services & APIs**

1. **Assignment Management Service**
   - **File:** `server/src/services/assignmentService.ts`
   - **Implementation:** Complete assignment lifecycle management
   - **Key Methods:**
     - `createAssignment()` - Create assignments with multiple activities
     - `assignToClass()` - Bulk assignment to class members
     - `assignToIndividuals()` - Selective student assignment
     - `scheduleAssignment()` - Future assignment scheduling
     - `modifyAssignment()` - Update assignment parameters
     - `trackCompletion()` - Monitor assignment progress
     - `sendReminders()` - Automated reminder system
     - `generateReports()` - Assignment completion analytics

2. **Sharing Service Implementation**
   - **File:** `server/src/services/sharingService.ts`
   - **Implementation:** Activity sharing and link management
   - **Key Methods:**
     - `generateShareLink()` - Create secure sharing URLs
     - `generateQRCode()` - QR code generation for mobile access
     - `validateAccess()` - Permission verification for shared content
     - `trackUsage()` - Analytics for shared activity usage
     - `bulkShare()` - Share multiple activities simultaneously
     - `revokeAccess()` - Remove sharing permissions

3. **Notification Service Enhancement**
   - **File:** `server/src/services/notificationService.ts`
   - **Implementation:** Assignment-related notification system
   - **Key Methods:**
     - `notifyAssignmentCreated()` - Student/parent assignment notifications
     - `sendDueDateReminders()` - Automated due date alerts
     - `notifyCompletion()` - Assignment completion confirmations
     - `sendParentUpdates()` - Parent progress notifications
     - `scheduleReminders()` - Customizable reminder scheduling

4. **Assignment API Controllers**
   - **File:** `server/src/controllers/assignmentController.ts`
   - **Implementation:** RESTful endpoints for assignment management
   - **Key Endpoints:**
     - `POST /api/assignments` - Create new assignment
     - `POST /api/assignments/bulk` - Bulk assignment creation
     - `GET /api/assignments/class/{classId}` - Class assignment overview
     - `PUT /api/assignments/{id}/extend` - Extend due dates
     - `POST /api/assignments/{id}/share` - Share assignment
     - `GET /api/assignments/student/{studentId}` - Student assignments
     - `POST /api/assignments/{id}/submit` - Assignment submission

#### **Week 2: Frontend Implementation**

##### **Day 8-10: Assignment Management Interface**

1. **Assignment Creation Wizard**
   - **File:** `client/src/components/assignments/AssignmentWizard.tsx`
   - **Purpose:** Step-by-step assignment creation process
   - **Key Features:**
     - Activity selection from teacher's library
     - Class and student selection interface
     - Due date scheduling with calendar integration
     - Assignment settings and customization
     - Preview and confirmation steps
     - Bulk assignment capabilities
     - Save as template functionality

2. **Assignment Dashboard Components**
   - **Files:** `client/src/components/assignments/`
   - **Purpose:** Comprehensive assignment management interface
   - **Components:**
     - `AssignmentOverview.tsx` - Teacher assignment dashboard
     - `StudentAssignments.tsx` - Student assignment list
     - `AssignmentProgress.tsx` - Real-time progress tracking
     - `DueDateCalendar.tsx` - Calendar view of assignments
     - `BulkAssignmentTools.tsx` - Batch assignment management
     - `AssignmentAnalytics.tsx` - Completion and performance analytics

3. **Sharing Interface Components**
   - **File:** `client/src/components/sharing/ShareActivityModal.tsx`
   - **Purpose:** Activity sharing and link management
   - **Key Features:**
     - One-click sharing with customizable permissions
     - QR code generation and display
     - Share link management with expiration settings
     - Email invitation system with templates
     - Social media sharing integration
     - Usage analytics dashboard

##### **Day 11-14: Student Assignment Interface**

1. **Student Assignment Dashboard**
   - **File:** `client/src/components/students/StudentAssignmentDashboard.tsx`
   - **Purpose:** Student-focused assignment management
   - **Key Features:**
     - Assignment list with due date sorting
     - Progress indicators and completion status
     - Quick access to assigned activities
     - Due date reminders and notifications
     - Parent communication features
     - Assignment submission tracking

2. **Assignment Completion Tracking**
   - **File:** `client/src/components/assignments/AssignmentTracker.tsx`
   - **Purpose:** Real-time assignment progress monitoring
   - **Key Features:**
     - Live progress updates during activity completion
     - Time tracking and session management
     - Automatic save and resume functionality
     - Completion percentage visualization
     - Performance analytics and feedback
     - Parent/teacher notification triggers

#### **Testing Requirements**

1. **Backend Testing Requirements**
   - **Assignment Model Tests:** Creation, modification, completion tracking
   - **Sharing System Tests:** Link generation, access control, analytics
   - **Notification Tests:** Email delivery, reminder scheduling, parent updates
   - **API Endpoint Tests:** All assignment and sharing endpoints
   - **Performance Tests:** Bulk assignment creation, concurrent access

2. **Frontend Testing Requirements**
   - **Component Tests:** Assignment wizard, dashboard components, sharing modals
   - **Integration Tests:** Complete assignment creation and completion workflow
   - **User Experience Tests:** Mobile responsiveness, accessibility compliance
   - **Performance Tests:** Large assignment lists, real-time updates

3. **End-to-End Testing Scenarios**
   - Teacher creates and assigns activities to multiple classes
   - Students receive assignments and complete them on various devices
   - Parents receive notifications and track child progress
   - Sharing links work correctly with proper permission enforcement
   - Due date reminders and notifications delivered appropriately

#### **Integration Points**

1. **Class Management Integration**
   - Assignment distribution based on class enrollment
   - Class-specific assignment customization
   - Teacher permission validation for class assignments

2. **Activity System Integration**
   - Assignment completion tracking linked to activity progress
   - Activity performance data feeding into assignment analytics
   - Template-based assignment creation from successful activities

3. **Communication System Integration**
   - Assignment notifications through unified messaging system
   - Parent-teacher communication regarding assignments
   - Student progress updates and achievement notifications

#### **Success Criteria**

- [ ] Teachers can assign activities to classes efficiently
- [ ] Bulk assignment tools reduce teacher workload significantly
- [ ] Students receive clear assignment notifications and reminders
- [ ] Sharing system enables easy activity distribution
- [ ] QR code sharing works seamlessly on mobile devices
- [ ] Parents receive appropriate assignment updates
- [ ] Assignment analytics provide actionable insights
- [ ] Due date management prevents student confusion
- [ ] Performance optimization handles large-scale assignments

---

### **Batch 6: Enhanced Progress Tracking & Analytics**
**Duration:** 2 weeks  
**Dependencies:** Batch 5 (Assignment system)

#### **Week 1: Backend Implementation**

##### **Day 1-3: Enhanced Progress Schema & Models**

1. **Enhanced Progress Schema Design**
   - **File:** `server/src/models/ProgressMongo.ts`
   - **Purpose:** Comprehensive progress tracking with detailed analytics and real-time updates
   - **Key Features:**
     - Granular attempt tracking with step-by-step data
     - Real-time progress updates via WebSocket
     - Historical performance analysis
     - Learning curve calculation algorithms
     - Mastery level progression tracking
     - Time-based analytics and session management
     - Difficulty adjustment recommendations
     - Parent-friendly progress summaries

2. **Analytics Aggregation Schema**
   - **File:** `server/src/models/AnalyticsSnapshot.ts`
   - **Purpose:** Pre-computed analytics for fast dashboard loading
   - **Key Features:**
     - Daily, weekly, and monthly progress snapshots
     - Class and individual performance aggregations
     - Trend analysis and pattern recognition
     - Comparative analytics across students
     - Achievement milestone tracking
     - Engagement metrics and time-on-task

3. **Session Tracking Schema**
   - **File:** `server/src/models/LearningSession.ts`
   - **Purpose:** Detailed learning session management and analytics
   - **Key Features:**
     - Session start/end time tracking
     - Activity sequence within sessions
     - Break and pause time management
     - Device and platform tracking
     - Interruption and resumption analysis
     - Focus and attention metrics

##### **Day 4-7: Progress Services & Real-time Updates**

1. **Enhanced Progress Service**
   - **File:** `server/src/services/progressService.ts`
   - **Implementation:** Comprehensive progress tracking with real-time capabilities
   - **Key Methods:**
     - `updateProgress()` - Real-time progress updates with validation
     - `calculateMastery()` - Advanced mastery level algorithms
     - `generateProgressReport()` - Detailed progress report generation
     - `trackLearningPath()` - Learning journey visualization data
     - `predictPerformance()` - AI-powered performance prediction
     - `identifyStruggles()` - Automatic struggle detection
     - `recommendActivities()` - Personalized activity recommendations

2. **Analytics Service Implementation**
   - **File:** `server/src/services/analyticsService.ts`
   - **Implementation:** Advanced analytics processing and aggregation
   - **Key Methods:**
     - `generateDashboardData()` - Real-time dashboard metrics
     - `calculateTrends()` - Performance trend analysis
     - `compareStudents()` - Class-wide performance comparisons
     - `identifyPatterns()` - Learning pattern recognition
     - `generateInsights()` - Actionable insights for teachers/parents
     - `createReports()` - Automated report generation

3. **Real-time Update Service**
   - **File:** `server/src/services/realtimeService.ts`
   - **Implementation:** WebSocket-based real-time progress updates
   - **Key Methods:**
     - `broadcastProgress()` - Live progress updates to parents/teachers
     - `notifyMilestones()` - Real-time achievement notifications
     - `updateDashboards()` - Live dashboard data updates
     - `syncAcrossDevices()` - Multi-device progress synchronization
     - `handleDisconnection()` - Graceful connection handling

4. **Progress API Controllers**
   - **File:** `server/src/controllers/progressController.ts`
   - **Implementation:** RESTful and WebSocket endpoints for progress management
   - **Key Endpoints:**
     - `POST /api/progress/update` - Update activity progress
     - `GET /api/progress/student/{id}` - Student progress overview
     - `GET /api/progress/analytics/{id}` - Detailed analytics data
     - `POST /api/progress/session/start` - Start learning session
     - `PUT /api/progress/session/end` - End learning session
     - `GET /api/progress/reports/{id}` - Generate progress reports

#### **Week 2: Frontend Implementation**

##### **Day 8-10: Enhanced Progress Components**

1. **Real-time Progress Dashboard**
   - **File:** `client/src/components/progress/ProgressDashboard.tsx`
   - **Purpose:** Comprehensive progress visualization with real-time updates
   - **Key Features:**
     - Live progress indicators with WebSocket integration
     - Interactive charts and graphs for performance trends
     - Mastery level visualization with skill breakdown
     - Learning time analytics and session summaries
     - Goal setting and achievement tracking
     - Comparative progress against class averages
     - Parent-friendly progress summaries

2. **Advanced Analytics Components**
   - **Files:** `client/src/components/analytics/`
   - **Purpose:** Detailed analytics visualization and insights
   - **Components:**
     - `PerformanceTrends.tsx` - Time-based performance visualization
     - `MasteryMap.tsx` - Skill mastery heat map visualization
     - `LearningPath.tsx` - Student learning journey visualization
     - `EngagementMetrics.tsx` - Engagement and time-on-task analytics
     - `ComparativeAnalytics.tsx` - Class and peer comparison charts
     - `ProgressInsights.tsx` - AI-generated insights and recommendations

3. **Progress Tracking Widgets**
   - **File:** `client/src/components/progress/ProgressWidgets.tsx`
   - **Purpose:** Modular progress display components for various contexts
   - **Key Features:**
     - Compact progress cards for dashboard overview
     - Detailed progress modals with drill-down capabilities
     - Progress celebration animations and achievements
     - Time-based progress indicators with session tracking
     - Goal progress visualization with milestone markers
     - Activity-specific progress breakdown

##### **Day 11-14: Reporting and Insights Interface**

1. **Progress Report Generator**
   - **File:** `client/src/components/reports/ProgressReportGenerator.tsx`
   - **Purpose:** Automated and customizable progress report creation
   - **Key Features:**
     - Template-based report generation with customization
     - Date range selection for specific time periods
     - Multiple export formats (PDF, Excel, HTML)
     - Parent and teacher-specific report versions
     - Automated report scheduling and delivery
     - Report sharing and collaboration tools

2. **Learning Insights Dashboard**
   - **File:** `client/src/components/insights/LearningInsightsDashboard.tsx`
   - **Purpose:** AI-powered insights and recommendations interface
   - **Key Features:**
     - Personalized learning recommendations
     - Struggle identification and intervention suggestions
     - Performance prediction and goal setting
     - Learning style analysis and adaptation recommendations
     - Time management insights and optimization
     - Parent guidance and support suggestions

#### **Testing Requirements**

1. **Backend Testing Requirements**
   - **Progress Model Tests:** Complex progress calculations, mastery algorithms
   - **Analytics Tests:** Data aggregation accuracy, trend calculations
   - **Real-time Tests:** WebSocket connections, concurrent updates
   - **API Endpoint Tests:** All progress and analytics endpoints
   - **Performance Tests:** Large dataset analytics, real-time update loads

2. **Frontend Testing Requirements**
   - **Component Tests:** Progress widgets, analytics charts, report generators
   - **Real-time Tests:** WebSocket integration, live updates
   - **Performance Tests:** Large dataset visualization, chart rendering
   - **Accessibility Tests:** Screen reader compatibility, keyboard navigation

3. **End-to-End Testing Scenarios**
   - Student completes activities with real-time progress updates
   - Teachers and parents receive live progress notifications
   - Analytics dashboards update automatically with new data
   - Progress reports generate accurately for various time periods
   - Insights and recommendations adapt to student performance

#### **Integration Points**

1. **Assignment System Integration**
   - Progress tracking linked to assignment completion
   - Assignment analytics feeding into overall progress
   - Due date impact on progress calculations

2. **Activity System Integration**
   - Activity completion data flowing into progress tracking
   - Activity difficulty influencing mastery calculations
   - Activity type affecting engagement metrics

3. **Communication System Integration**
   - Progress milestones triggering notifications
   - Parent updates based on progress thresholds
   - Teacher alerts for student struggles or achievements

#### **Success Criteria**

- [ ] Real-time progress updates work seamlessly across devices
- [ ] Analytics provide actionable insights for teachers and parents
- [ ] Progress reports generate accurately and efficiently
- [ ] Mastery calculations reflect actual student understanding
- [ ] Performance optimization handles large-scale data processing
- [ ] WebSocket connections remain stable under load
- [ ] Progress visualization enhances user engagement
- [ ] AI-powered insights improve learning outcomes

---

### **Batch 7: Parent Dashboard & Multi-Child Management**
**Duration:** 2.5 weeks  
**Dependencies:** Batch 6 (Progress tracking)

#### **Week 1: Backend Implementation**

##### **Day 1-3: Parent-Child Data Models**

1. **Parent Dashboard Schema Design**
   - **File:** `server/src/models/ParentDashboard.ts`
   - **Purpose:** Aggregated parent view of multiple children's activities and progress
   - **Key Features:**
     - Multi-child progress aggregation and comparison
     - Family-wide learning goals and achievements
     - Consolidated notification preferences
     - Parent involvement tracking and engagement metrics
     - Time management and screen time controls
     - Collaborative goal setting with children
     - Family learning challenges and competitions

2. **Child Management Schema**
   - **File:** `server/src/models/ChildProfile.ts`
   - **Purpose:** Enhanced child profile management for parents
   - **Key Features:**
     - Detailed child profile with learning preferences
     - Parent-set goals and milestones
     - Screen time limits and scheduling
     - Activity restriction and content filtering
     - Learning difficulty preferences and adjustments
     - Parent notes and observations
     - Teacher communication preferences

3. **Family Communication Schema**
   - **File:** `server/src/models/FamilyMessage.ts`
   - **Purpose:** Family-focused communication between parents, children, and teachers
   - **Key Features:**
     - Parent-teacher messaging with child context
     - Family announcement and celebration system
     - Homework reminder and support system
     - Achievement sharing and celebration
     - Concern escalation and intervention requests

##### **Day 4-7: Parent Services & Analytics**

1. **Parent Dashboard Service**
   - **File:** `server/src/services/parentDashboardService.ts`
   - **Implementation:** Comprehensive parent dashboard data aggregation
   - **Key Methods:**
     - `getMultiChildOverview()` - Consolidated progress across all children
     - `generateFamilyReport()` - Family-wide learning reports
     - `compareChildProgress()` - Sibling comparison analytics
     - `setFamilyGoals()` - Family learning goal management
     - `trackParentEngagement()` - Parent involvement analytics
     - `manageScreenTime()` - Screen time control and monitoring
     - `scheduleFamily Learning()` - Family learning session planning

2. **Child Management Service**
   - **File:** `server/src/services/childManagementService.ts`
   - **Implementation:** Individual child management from parent perspective
   - **Key Methods:**
     - `updateChildProfile()` - Child profile and preference management
     - `setLearningGoals()` - Individual child goal setting
     - `managePermissions()` - Activity access and content filtering
     - `trackMilestones()` - Achievement and milestone tracking
     - `communicateWithTeacher()` - Teacher communication coordination
     - `monitorProgress()` - Detailed child progress monitoring

3. **Family Analytics Service**
   - **File:** `server/src/services/familyAnalyticsService.ts`
   - **Implementation:** Family-focused analytics and insights
   - **Key Methods:**
     - `generateFamilyInsights()` - Family learning pattern analysis
     - `compareWithPeers()` - Anonymous peer comparison analytics
     - `identifyFamilyTrends()` - Learning trend identification
     - `recommendFamilyActivities()` - Family learning recommendations
     - `trackFamilyEngagement()` - Family participation analytics

4. **Parent API Controllers**
   - **File:** `server/src/controllers/parentController.ts`
   - **Implementation:** Parent-specific API endpoints
   - **Key Endpoints:**
     - `GET /api/parent/dashboard` - Multi-child dashboard data
     - `POST /api/parent/child/{id}/goals` - Set child goals
     - `PUT /api/parent/child/{id}/permissions` - Update child permissions
     - `GET /api/parent/family/report` - Family progress reports
     - `POST /api/parent/teacher/message` - Send teacher messages
     - `GET /api/parent/analytics/family` - Family analytics data

#### **Week 2: Frontend Implementation**

##### **Day 8-12: Multi-Child Dashboard Interface**

1. **Parent Dashboard Overview**
   - **File:** `client/src/components/parent/ParentDashboard.tsx`
   - **Purpose:** Comprehensive overview of all children's learning activities
   - **Key Features:**
     - Multi-child progress cards with quick comparison
     - Family learning calendar with all children's schedules
     - Consolidated notification center for all children
     - Quick access to teacher communications
     - Family learning goals and achievement tracking
     - Screen time management across all devices
     - Emergency alerts and urgent notifications

2. **Individual Child Management Components**
   - **Files:** `client/src/components/parent/child/`
   - **Purpose:** Detailed management interface for each child
   - **Components:**
     - `ChildProfileManager.tsx` - Individual child profile and settings
     - `ChildProgressDetailed.tsx` - Detailed progress and analytics
     - `ChildGoalSetting.tsx` - Goal setting and milestone tracking
     - `ChildPermissions.tsx` - Activity access and content filtering
     - `ChildSchedule.tsx` - Learning schedule and time management
     - `TeacherCommunication.tsx` - Child-specific teacher communication

3. **Family Analytics Dashboard**
   - **File:** `client/src/components/parent/FamilyAnalyticsDashboard.tsx`
   - **Purpose:** Family-wide learning analytics and insights
   - **Key Features:**
     - Comparative progress charts across children
     - Family learning time analytics and trends
     - Achievement comparison and celebration
     - Learning style analysis for each child
     - Family goal progress and milestone tracking
     - Peer comparison (anonymous) for motivation

##### **Day 13-15: Communication and Control Features**

1. **Parent-Teacher Communication Hub**
   - **File:** `client/src/components/parent/TeacherCommunicationHub.tsx`
   - **Purpose:** Centralized communication with all teachers
   - **Key Features:**
     - Unified messaging interface with all teachers
     - Child-specific conversation threading
     - Automatic translation for multilingual families
     - Attachment sharing for homework and projects
     - Meeting scheduling and video call integration
     - Concern escalation and priority messaging

2. **Child Control and Safety Interface**
   - **File:** `client/src/components/parent/ChildControlPanel.tsx`
   - **Purpose:** Comprehensive child safety and control management
   - **Key Features:**
     - Screen time limits with flexible scheduling
     - Content filtering and age-appropriate controls
     - Activity approval and restriction management
     - Location-based learning access controls
     - Emergency contact and safety features
     - Report generation for inappropriate content

#### **Week 2.5: Advanced Features and Testing**

##### **Day 16-18: Advanced Parent Features**

1. **Family Learning Planner**
   - **File:** `client/src/components/parent/FamilyLearningPlanner.tsx`
   - **Purpose:** Collaborative family learning experience planning
   - **Key Features:**
     - Family learning session scheduling
     - Educational trip and activity planning
     - Skill-building activity recommendations
     - Family challenge and competition creation
     - Collaborative goal setting across children
     - Learning celebration and reward planning

2. **Parent Support and Resources**
   - **File:** `client/src/components/parent/ParentResourceCenter.tsx`
   - **Purpose:** Educational resources and support for parents
   - **Key Features:**
     - Age-appropriate parenting guidance
     - Learning support strategies and tips
     - Educational resource library and recommendations
     - Parent community forums and support groups
     - Expert advice and consultation booking
     - Workshop and webinar access

#### **Testing Requirements**

1. **Backend Testing Requirements**
   - **Multi-Child Data Tests:** Aggregation accuracy, comparison algorithms
   - **Permission Tests:** Child access control, content filtering
   - **Communication Tests:** Message threading, notification delivery
   - **Analytics Tests:** Family analytics accuracy, trend calculations
   - **Performance Tests:** Multi-child data loading, concurrent access

2. **Frontend Testing Requirements**
   - **Dashboard Tests:** Multi-child display, responsive design
   - **Control Tests:** Permission settings, screen time management
   - **Communication Tests:** Teacher messaging, notification center
   - **Analytics Tests:** Chart rendering, data visualization accuracy

3. **End-to-End Testing Scenarios**
   - Parent manages multiple children from single dashboard
   - Screen time controls work across all devices and platforms
   - Teacher communication maintains proper child context
   - Family analytics provide accurate insights and comparisons
   - Content filtering and safety controls function properly

#### **Integration Points**

1. **Child Account Integration**
   - Seamless switching between child profiles
   - Unified progress tracking across multiple children
   - Consolidated notification and communication management

2. **Teacher System Integration**
   - Context-aware teacher communication
   - Progress sharing and collaboration
   - Permission coordination for class activities

3. **Analytics System Integration**
   - Family-wide analytics aggregation
   - Comparative analysis across children
   - Peer comparison and benchmarking

#### **Success Criteria**

- [ ] Parents can efficiently manage multiple children from single dashboard
- [ ] Screen time and content controls work reliably across devices
- [ ] Teacher communication maintains proper child context
- [ ] Family analytics provide valuable insights for learning
- [ ] Child comparison features motivate without causing pressure
- [ ] Safety and control features meet parent expectations
- [ ] Performance remains optimal with multiple child data
- [ ] Mobile experience supports on-the-go parent management

---

### **Batch 8: Teacher Dashboard & Classroom Management**
**Duration:** 2.5 weeks  
**Dependencies:** Batch 7 (Parent dashboard)

#### **Week 1: Backend Implementation**

##### **Day 1-4: Classroom Analytics & Grade Book Models**

1. **Classroom Analytics Schema Design**
   - **File:** `server/src/models/ClassroomAnalytics.ts`
   - **Purpose:** Comprehensive classroom performance tracking and insights
   - **Key Features:**
     - Class-wide performance metrics and trends
     - Individual student progress within class context
     - Engagement analytics and participation tracking
     - Curriculum coverage and pacing analysis
     - Assessment effectiveness and difficulty analysis
     - Intervention identification and tracking
     - Differentiated instruction analytics

2. **Grade Book Schema**
   - **File:** `server/src/models/GradeBook.ts`
   - **Purpose:** Comprehensive grade management and reporting system
   - **Key Features:**
     - Assignment grade tracking with rubric support
     - Weighted grading categories and calculations
     - Progress report generation and automation
     - Parent communication integration
     - Grade export and integration capabilities
     - Historical grade tracking and trend analysis
     - Standardized test integration and correlation

3. **Student Assessment Schema**
   - **File:** `server/src/models/StudentAssessment.ts`
   - **Purpose:** Detailed assessment tracking and analysis
   - **Key Features:**
     - Formative and summative assessment tracking
     - Rubric-based assessment scoring
     - Learning objective mastery tracking
     - Portfolio and work sample management
     - Peer and self-assessment integration
     - Assessment accommodation tracking

##### **Day 5-7: Teacher Services & Classroom Management**

1. **Teacher Dashboard Service**
   - **File:** `server/src/services/teacherDashboardService.ts`
   - **Implementation:** Comprehensive teacher dashboard data aggregation
   - **Key Methods:**
     - `getClassroomOverview()` - Multi-class dashboard summary
     - `generateClassAnalytics()` - Detailed class performance analytics
     - `trackStudentEngagement()` - Individual student engagement metrics
     - `identifyAtRiskStudents()` - Early intervention identification
     - `planInstruction()` - Data-driven instruction planning
     - `communicateWithParents()` - Parent communication management
     - `manageClassroom()` - Classroom organization and management

2. **Grade Book Service**
   - **File:** `server/src/services/gradeBookService.ts`
   - **Implementation:** Complete grade management system
   - **Key Methods:**
     - `recordGrades()` - Grade entry and validation
     - `calculateGPA()` - GPA and weighted grade calculations
     - `generateReportCards()` - Automated report card creation
     - `trackProgress()` - Progress monitoring and alerting
     - `communicateGrades()` - Grade communication to parents
     - `exportGrades()` - Grade export for school systems
     - `analyzePerformance()` - Grade trend analysis

3. **Classroom Management Service**
   - **File:** `server/src/services/classroomManagementService.ts`
   - **Implementation:** Classroom organization and student management
   - **Key Methods:**
     - `organizeSeatChart()` - Digital seating arrangements
     - `trackAttendance()` - Attendance monitoring and reporting
     - `manageBehavior()` - Behavior tracking and intervention
     - `scheduleActivities()` - Class activity and lesson planning
     - `manageResources()` - Classroom resource allocation
     - `facilitateCollaboration()` - Group work and collaboration tools

4. **Teacher API Controllers**
   - **File:** `server/src/controllers/teacherController.ts`
   - **Implementation:** Teacher-specific API endpoints
   - **Key Endpoints:**
     - `GET /api/teacher/dashboard` - Teacher dashboard data
     - `GET /api/teacher/class/{id}/analytics` - Class analytics
     - `POST /api/teacher/grades` - Grade entry and management
     - `GET /api/teacher/students/at-risk` - At-risk student identification
     - `POST /api/teacher/parent/communication` - Parent communication
     - `GET /api/teacher/reports/progress` - Progress report generation

#### **Week 2: Frontend Implementation**

##### **Day 8-12: Teacher Dashboard Interface**

1. **Teacher Dashboard Overview**
   - **File:** `client/src/components/teacher/TeacherDashboard.tsx`
   - **Purpose:** Comprehensive teacher workspace with multi-class management
   - **Key Features:**
     - Multi-class overview with quick switching
     - Real-time student engagement indicators
     - Upcoming assignments and deadlines
     - Parent communication center
     - At-risk student alerts and interventions
     - Quick access to grade book and analytics
     - Daily lesson planning integration

2. **Classroom Analytics Components**
   - **Files:** `client/src/components/teacher/analytics/`
   - **Purpose:** Detailed classroom performance visualization
   - **Components:**
     - `ClassPerformanceOverview.tsx` - Class-wide performance metrics
     - `StudentEngagementTracker.tsx` - Individual engagement analytics
     - `CurriculumPacingTracker.tsx` - Curriculum coverage and pacing
     - `AssessmentAnalytics.tsx` - Assessment effectiveness analysis
     - `InterventionTracker.tsx` - Student intervention monitoring
     - `LearningObjectiveProgress.tsx` - Standards and objective tracking

3. **Grade Book Interface**
   - **File:** `client/src/components/teacher/GradeBookInterface.tsx`
   - **Purpose:** Comprehensive grade management and reporting
   - **Key Features:**
     - Spreadsheet-style grade entry with validation
     - Rubric-based grading with customizable rubrics
     - Weighted category calculations and GPA tracking
     - Progress report generation and customization
     - Parent communication integration
     - Grade import/export capabilities

##### **Day 13-15: Student Management Tools**

1. **Individual Student Profiles**
   - **File:** `client/src/components/teacher/StudentProfileManager.tsx`
   - **Purpose:** Detailed student information and progress tracking
   - **Key Features:**
     - Comprehensive student profile with learning history
     - Individual progress tracking and goal setting
     - Intervention history and effectiveness tracking
     - Parent communication history and preferences
     - Accommodation and modification tracking
     - Behavioral observation and documentation

2. **Classroom Management Tools**
   - **File:** `client/src/components/teacher/ClassroomManagementTools.tsx`
   - **Purpose:** Digital classroom organization and management
   - **Key Features:**
     - Interactive seating chart with student information
     - Attendance tracking with pattern analysis
     - Behavior management and positive reinforcement
     - Resource allocation and equipment tracking
     - Group formation and collaboration tools
     - Digital hall passes and permission management

#### **Week 2.5: Advanced Features and Integration**

##### **Day 16-18: Advanced Teacher Features**

1. **Lesson Planning Integration**
   - **File:** `client/src/components/teacher/LessonPlanningIntegration.tsx`
   - **Purpose:** Data-driven lesson planning and curriculum alignment
   - **Key Features:**
     - Standards-aligned lesson planning tools
     - Assessment data integration for planning
     - Differentiated instruction recommendations
     - Resource recommendation and integration
     - Collaborative planning with other teachers
     - Curriculum pacing and adjustment tools

2. **Parent Communication Center**
   - **File:** `client/src/components/teacher/ParentCommunicationCenter.tsx`
   - **Purpose:** Comprehensive parent communication and engagement
   - **Key Features:**
     - Mass communication with personalization
     - Individual parent conferences and meetings
     - Progress sharing and celebration
     - Concern documentation and follow-up
     - Language translation for diverse families
     - Communication analytics and effectiveness tracking

#### **Testing Requirements**

1. **Backend Testing Requirements**
   - **Analytics Tests:** Classroom data aggregation, trend calculations
   - **Grade Book Tests:** Calculation accuracy, report generation
   - **Performance Tests:** Large class data processing, concurrent access
   - **Integration Tests:** Grade book and communication system integration

2. **Frontend Testing Requirements**
   - **Dashboard Tests:** Multi-class display, real-time updates
   - **Grade Book Tests:** Grade entry, calculation accuracy
   - **Analytics Tests:** Chart rendering, data visualization
   - **Mobile Tests:** Responsive design, touch interface optimization

3. **End-to-End Testing Scenarios**
   - Teacher manages multiple classes from single dashboard
   - Grade entry and calculation work accurately across devices
   - Parent communication maintains student privacy and context
   - Analytics provide actionable insights for instruction
   - Intervention tracking improves student outcomes

#### **Integration Points**

1. **Parent Dashboard Integration**
   - Coordinated parent-teacher communication
   - Shared student progress and goal tracking
   - Consistent messaging and notification systems

2. **Student System Integration**
   - Real-time progress updates from student activities
   - Assignment completion feeding into grade book
   - Engagement metrics informing instruction

3. **Analytics System Integration**
   - Classroom analytics feeding into school-wide reporting
   - Individual teacher effectiveness metrics
   - Curriculum effectiveness and pacing analysis

#### **Success Criteria**

- [ ] Teachers can efficiently manage multiple classes from single interface
- [ ] Grade book calculations are accurate and reliable
- [ ] Parent communication streamlines teacher workflow
- [ ] Analytics provide actionable insights for instruction
- [ ] Student intervention tracking improves outcomes
- [ ] Performance optimization handles large class sizes
- [ ] Mobile interface supports classroom mobility
- [ ] Integration with existing school systems works seamlessly

---

### **Batch 9: Evaluation & Review System**
**Duration:** 2 weeks  
**Dependencies:** Batch 8 (Teacher dashboard)

#### **Week 1: Backend Implementation**

##### **Day 1-3: Review System Models**

1. **Review System Schema Design**
   - **File:** `server/src/models/Review.ts`
   - **Purpose:** Comprehensive review and evaluation tracking system
   - **Key Features:**
     - Multi-reviewer assignment and workflow management
     - Rubric-based evaluation with customizable criteria
     - Peer review and self-assessment capabilities
     - Review queue prioritization and assignment
     - Feedback aggregation and synthesis
     - Review quality and reliability metrics
     - Anonymous and identified review options

2. **Rubric Management Schema**
   - **File:** `server/src/models/Rubric.ts`
   - **Purpose:** Flexible rubric creation and application system
   - **Key Features:**
     - Multi-dimensional rubric design with criteria weighting
     - Performance level definitions and scoring
     - Subject-specific and grade-level rubric templates
     - Collaborative rubric development and sharing
     - Rubric effectiveness analytics and optimization
     - Standards alignment and correlation tracking

3. **Feedback Management Schema**
   - **File:** `server/src/models/Feedback.ts`
   - **Purpose:** Structured feedback collection and delivery system
   - **Key Features:**
     - Multi-modal feedback (text, audio, video, annotations)
     - Structured feedback templates and prompts
     - Feedback threading and conversation tracking
     - Sentiment analysis and tone monitoring
     - Feedback effectiveness and impact measurement
     - Personalized feedback recommendation engine

##### **Day 4-7: Review Services & Workflow Management**

1. **Review Management Service**
   - **File:** `server/src/services/reviewService.ts`
   - **Implementation:** Complete review workflow and assignment management
   - **Key Methods:**
     - `createReviewQueue()` - Review assignment and prioritization
     - `assignReviewers()` - Intelligent reviewer assignment system
     - `trackReviewProgress()` - Review completion monitoring
     - `aggregateReviews()` - Multi-reviewer score compilation
     - `generateFeedbackSummary()` - Feedback synthesis and delivery
     - `validateReviewQuality()` - Review reliability assessment
     - `escalateDiscrepancies()` - Conflict resolution management

2. **Rubric Application Service**
   - **File:** `server/src/services/rubricService.ts`
   - **Implementation:** Rubric-based assessment and scoring system
   - **Key Methods:**
     - `applyRubric()` - Structured rubric-based evaluation
     - `calculateScores()` - Weighted scoring and grade calculation
     - `generateRubricReport()` - Performance breakdown reporting
     - `recommendImprovements()` - Targeted improvement suggestions
     - `trackMastery()` - Learning objective mastery assessment
     - `adaptRubric()` - Dynamic rubric adjustment based on performance

3. **Feedback Generation Service**
   - **File:** `server/src/services/feedbackService.ts`
   - **Implementation:** Intelligent feedback generation and delivery
   - **Key Methods:**
     - `generatePersonalizedFeedback()` - AI-enhanced feedback creation
     - `consolidateFeedback()` - Multi-source feedback synthesis
     - `deliverFeedback()` - Timely and appropriate feedback delivery
     - `trackFeedbackImpact()` - Feedback effectiveness measurement
     - `recommendFeedbackStrategies()` - Teacher feedback coaching

4. **Review API Controllers**
   - **File:** `server/src/controllers/reviewController.ts`
   - **Implementation:** Review system API endpoints
   - **Key Endpoints:**
     - `POST /api/reviews/assign` - Create review assignments
     - `GET /api/reviews/queue/{teacherId}` - Teacher review queue
     - `PUT /api/reviews/{id}/complete` - Submit completed review
     - `GET /api/reviews/{id}/feedback` - Retrieve feedback summary
     - `POST /api/rubrics/apply` - Apply rubric to submission
     - `GET /api/reviews/analytics/{classId}` - Review analytics

#### **Week 2: Frontend Implementation**

##### **Day 8-10: Review Interface Components**

1. **Review Queue Dashboard**
   - **File:** `client/src/components/review/ReviewQueueDashboard.tsx`
   - **Purpose:** Centralized review management interface for teachers
   - **Key Features:**
     - Prioritized review queue with smart sorting
     - Review assignment status and progress tracking
     - Quick preview and detailed review modes
     - Batch review capabilities for efficiency
     - Review deadline management and alerts
     - Quality metrics and reviewer performance
     - Review distribution and workload balancing

2. **Rubric Application Interface**
   - **File:** `client/src/components/review/RubricApplicationInterface.tsx`
   - **Purpose:** Interactive rubric-based evaluation system
   - **Key Features:**
     - Dynamic rubric display with criterion weighting
     - Interactive scoring with immediate feedback
     - Evidence collection and annotation tools
     - Performance level justification and comments
     - Real-time score calculation and visualization
     - Rubric effectiveness feedback and suggestions

3. **Review Submission Components**
   - **Files:** `client/src/components/review/submission/`
   - **Purpose:** Comprehensive review submission and management
   - **Components:**
     - `SubmissionViewer.tsx` - Multi-format submission display
     - `AnnotationTools.tsx` - Interactive annotation and markup
     - `FeedbackComposer.tsx` - Structured feedback creation
     - `ScoreCalculator.tsx` - Automated scoring with manual override
     - `ReviewSummary.tsx` - Review completion summary
     - `FeedbackPreview.tsx` - Student-facing feedback preview

##### **Day 11-14: Advanced Review Features**

1. **Collaborative Review System**
   - **File:** `client/src/components/review/CollaborativeReviewSystem.tsx`
   - **Purpose:** Multi-reviewer coordination and consensus building
   - **Key Features:**
     - Reviewer assignment and notification system
     - Real-time collaboration and discussion tools
     - Score reconciliation and consensus building
     - Bias detection and mitigation features
     - Review calibration and standardization
     - Expert reviewer consultation integration

2. **Feedback Management Dashboard**
   - **File:** `client/src/components/review/FeedbackManagementDashboard.tsx`
   - **Purpose:** Comprehensive feedback delivery and tracking system
   - **Key Features:**
     - Feedback scheduling and delivery automation
     - Multi-modal feedback composition (text, audio, video)
     - Feedback template library and customization
     - Student feedback receipt and acknowledgment tracking
     - Feedback impact measurement and analytics
     - Parent notification and communication integration

#### **Testing Requirements**

1. **Backend Testing Requirements**
   - **Review Workflow Tests:** Assignment, completion, quality validation
   - **Rubric Tests:** Scoring accuracy, criteria weighting, calculation
   - **Feedback Tests:** Generation, aggregation, delivery timing
   - **Performance Tests:** Large review queue processing, concurrent reviews

2. **Frontend Testing Requirements**
   - **Review Interface Tests:** Rubric application, score calculation
   - **Collaborative Tests:** Multi-reviewer coordination, consensus building
   - **Feedback Tests:** Composition tools, delivery interface
   - **Mobile Tests:** Review interface on mobile devices

3. **End-to-End Testing Scenarios**
   - Teacher creates and assigns reviews with rubrics
   - Multiple reviewers complete evaluations collaboratively
   - Feedback is generated, aggregated, and delivered appropriately
   - Students receive and acknowledge feedback
   - Review analytics inform instruction and assessment improvement

#### **Integration Points**

1. **Teacher Dashboard Integration**
   - Review queue integration with teacher workflow
   - Grade book connectivity for score recording
   - Analytics integration for assessment effectiveness

2. **Student Progress Integration**
   - Review scores feeding into progress tracking
   - Feedback integration with learning recommendations
   - Mastery tracking based on rubric performance

3. **Communication System Integration**
   - Feedback delivery through unified messaging
   - Parent notifications for significant evaluations
   - Teacher collaboration on review standards

#### **Success Criteria**

- [ ] Review workflow efficiently manages large volumes of submissions
- [ ] Rubric-based scoring is consistent and reliable across reviewers
- [ ] Feedback quality improves student learning outcomes
- [ ] Multi-reviewer consensus building reduces bias and improves accuracy
- [ ] Review analytics inform assessment and instruction improvements
- [ ] System scales effectively with increased review volume
- [ ] Mobile interface supports flexible review completion
- [ ] Integration with existing systems maintains data consistency

---

### **Batch 10: Communication & Notification System**
**Duration:** 2 weeks  
**Dependencies:** Batch 9 (Review system)

#### **Week 1: Backend Implementation**

##### **Day 1-3: Communication Models & Infrastructure**

1. **Unified Messaging Schema Design**
   - **File:** `server/src/models/Message.ts`
   - **Purpose:** Comprehensive messaging system for all platform communications
   - **Key Features:**
     - Multi-party conversations (parent-teacher-student)
     - Message threading and conversation management
     - File attachment and media sharing
     - Message priority and urgency levels
     - Read receipts and delivery confirmations
     - Message translation and accessibility features
     - Scheduled messaging and automated responses

2. **Notification Management Schema**
   - **File:** `server/src/models/Notification.ts`
   - **Purpose:** Intelligent notification delivery and preference management
   - **Key Features:**
     - Multi-channel delivery (email, SMS, push, in-app)
     - User preference management and opt-out controls
     - Notification batching and digest creation
     - Priority-based delivery timing optimization
     - Notification analytics and engagement tracking
     - Template management and personalization
     - Emergency notification and escalation procedures

3. **Communication Channel Schema**
   - **File:** `server/src/models/CommunicationChannel.ts`
   - **Purpose:** Flexible communication channel management
   - **Key Features:**
     - Role-based channel access and permissions
     - Class-wide and group communication channels
     - Private and public communication spaces
     - Moderation and content filtering capabilities
     - Communication analytics and engagement metrics
     - Integration with external communication platforms

##### **Day 4-7: Communication Services & Delivery Systems**

1. **Messaging Service Implementation**
   - **File:** `server/src/services/messagingService.ts`
   - **Implementation:** Real-time messaging with comprehensive features
   - **Key Methods:**
     - `sendMessage()` - Multi-recipient message delivery
     - `createConversation()` - Conversation initiation and management
     - `manageThreads()` - Message threading and organization
     - `handleAttachments()` - File and media sharing
     - `translateMessages()` - Real-time language translation
     - `moderateContent()` - Content filtering and safety
     - `archiveConversations()` - Message history management

2. **Notification Service Implementation**
   - **File:** `server/src/services/notificationService.ts`
   - **Implementation:** Intelligent notification delivery and management
   - **Key Methods:**
     - `scheduleNotification()` - Smart notification scheduling
     - `batchNotifications()` - Notification grouping and digest creation
     - `deliverMultiChannel()` - Cross-platform notification delivery
     - `trackEngagement()` - Notification effectiveness monitoring
     - `managePreferences()` - User notification preference management
     - `escalateUrgent()` - Emergency notification handling

3. **Communication Analytics Service**
   - **File:** `server/src/services/communicationAnalyticsService.ts`
   - **Implementation:** Communication effectiveness and engagement analytics
   - **Key Methods:**
     - `trackEngagement()` - Communication engagement metrics
     - `analyzeResponseTimes()` - Response time and efficiency analysis
     - `measureEffectiveness()` - Communication impact assessment
     - `identifyTrends()` - Communication pattern analysis
     - `recommendOptimizations()` - Communication improvement suggestions

4. **Communication API Controllers**
   - **File:** `server/src/controllers/communicationController.ts`
   - **Implementation:** Communication system API endpoints
   - **Key Endpoints:**
     - `POST /api/messages/send` - Send message to recipients
     - `GET /api/conversations/{userId}` - User conversations
     - `PUT /api/notifications/preferences` - Update notification settings
     - `GET /api/messages/unread` - Unread message count
     - `POST /api/conversations/create` - Create new conversation
     - `GET /api/communication/analytics` - Communication analytics

#### **Week 2: Frontend Implementation**

##### **Day 8-10: Messaging Interface Components**

1. **Unified Messaging Center**
   - **File:** `client/src/components/communication/MessagingCenter.tsx`
   - **Purpose:** Centralized communication hub for all users
   - **Key Features:**
     - Unified inbox with conversation management
     - Real-time messaging with typing indicators
     - File and media sharing with preview
     - Message search and filtering capabilities
     - Conversation archiving and organization
     - Quick reply and template responses
     - Multi-language support and translation

2. **Conversation Management Components**
   - **Files:** `client/src/components/communication/conversations/`
   - **Purpose:** Comprehensive conversation management interface
   - **Components:**
     - `ConversationList.tsx` - Conversation listing and organization
     - `MessageThread.tsx` - Threaded message display
     - `MessageComposer.tsx` - Rich message composition
     - `AttachmentManager.tsx` - File and media handling
     - `ConversationSettings.tsx` - Conversation preferences
     - `ParticipantManager.tsx` - Conversation participant management

3. **Notification Center**
   - **File:** `client/src/components/communication/NotificationCenter.tsx`
   - **Purpose:** Comprehensive notification management interface
   - **Key Features:**
     - Notification timeline with categorization
     - Read/unread status management
     - Notification action buttons and quick responses
     - Notification preference controls
     - Notification history and search
     - Priority notification highlighting
     - Notification analytics and insights

##### **Day 11-14: Advanced Communication Features**

1. **Communication Preferences Dashboard**
   - **File:** `client/src/components/communication/CommunicationPreferences.tsx`
   - **Purpose:** User communication preference management
   - **Key Features:**
     - Channel preference configuration (email, SMS, push)
     - Timing preference management (quiet hours, digest timing)
     - Contact and blocking management
     - Privacy and security settings
     - Communication frequency controls
     - Emergency contact configuration

2. **Communication Analytics Dashboard**
   - **File:** `client/src/components/communication/CommunicationAnalytics.tsx`
   - **Purpose:** Communication effectiveness and engagement analytics
   - **Key Features:**
     - Response time analytics and trends
     - Communication volume and frequency metrics
     - Engagement rate and effectiveness measurement
     - Communication pattern visualization
     - Improvement recommendations and insights
     - Comparative analytics across roles and classes

#### **Testing Requirements**

1. **Backend Testing Requirements**
   - **Messaging Tests:** Real-time delivery, threading, attachment handling
   - **Notification Tests:** Multi-channel delivery, preference management
   - **Performance Tests:** High-volume messaging, concurrent notifications
   - **Security Tests:** Message encryption, privacy protection

2. **Frontend Testing Requirements**
   - **Interface Tests:** Message composition, conversation management
   - **Real-time Tests:** Live messaging, notification updates
   - **Mobile Tests:** Communication interface on mobile devices
   - **Accessibility Tests:** Screen reader compatibility, keyboard navigation

3. **End-to-End Testing Scenarios**
   - Users send and receive messages across different roles
   - Notifications are delivered according to user preferences
   - File attachments are shared and accessed correctly
   - Communication preferences are respected consistently
   - Emergency notifications are delivered promptly

#### **Integration Points**

1. **User Management Integration**
   - Communication permissions based on relationships
   - Role-based communication capabilities
   - Privacy and safety controls

2. **Educational System Integration**
   - Assignment and progress-related communications
   - Grade and feedback notifications
   - Class and activity announcements

3. **Analytics Integration**
   - Communication effectiveness feeding into user engagement metrics
   - Response time analysis informing system optimization
   - Communication pattern analysis for improvement recommendations

#### **Success Criteria**

- [ ] Real-time messaging works reliably across all platforms
- [ ] Notification delivery respects user preferences consistently
- [ ] Communication enhances rather than overwhelms user experience
- [ ] File sharing is secure and accessible across devices
- [ ] Multi-language support enables diverse family communication
- [ ] Privacy and safety controls protect user communications
- [ ] Performance remains optimal under high communication volumes
- [ ] Integration with existing systems maintains data consistency

---

### **Batch 11: Analytics & Reporting System**
**Duration:** 2.5 weeks  
**Dependencies:** Batch 10 (Communication system)

#### **Week 1: Backend Analytics Infrastructure**

##### **Day 1-4: Analytics Data Pipeline & Models**

1. **Analytics Data Models**
   - **File:** `server/src/models/Analytics.ts`
   - **Purpose:** Comprehensive analytics data structure and aggregation
   - **Key Features:**
     - Multi-dimensional data collection (user, activity, time, performance)
     - Real-time and batch data processing capabilities
     - Hierarchical data aggregation (individual, class, school, district)
     - Performance metrics and learning outcome tracking
     - Engagement analytics and usage pattern analysis
     - Comparative analytics and benchmarking data
     - Privacy-compliant data collection and anonymization

2. **Reporting Configuration Schema**
   - **File:** `server/src/models/Report.ts`
   - **Purpose:** Flexible report configuration and template management
   - **Key Features:**
     - Custom report templates with drag-and-drop configuration
     - Automated report scheduling and delivery
     - Multi-format export capabilities (PDF, Excel, CSV, JSON)
     - Dynamic filtering and data segmentation
     - Role-based report access and permissions
     - Report sharing and collaboration features
     - Version control and template management

3. **Analytics Event Tracking Schema**
   - **File:** `server/src/models/AnalyticsEvent.ts`
   - **Purpose:** Detailed event tracking and behavioral analytics
   - **Key Features:**
     - Granular user interaction tracking
     - Learning path and progression analytics
     - Performance milestone and achievement tracking
     - Error and difficulty pattern identification
     - Time-on-task and engagement duration analysis
     - Multi-device and cross-platform usage tracking

##### **Day 5-7: Analytics Processing Services**

1. **Real-Time Analytics Service**
   - **File:** `server/src/services/realTimeAnalyticsService.ts`
   - **Implementation:** Live analytics processing and dashboard updates
   - **Key Methods:**
     - `processLiveEvents()` - Real-time event processing and aggregation
     - `updateDashboards()` - Live dashboard data updates
     - `trackPerformance()` - Real-time performance monitoring
     - `generateAlerts()` - Automated alert and notification system
     - `streamAnalytics()` - WebSocket-based analytics streaming
     - `calculateMetrics()` - Live metric calculation and caching

2. **Batch Analytics Service**
   - **File:** `server/src/services/batchAnalyticsService.ts`
   - **Implementation:** Comprehensive batch processing and historical analysis
   - **Key Methods:**
     - `runDailyAggregation()` - Daily analytics data aggregation
     - `generateReports()` - Scheduled report generation and delivery
     - `processHistoricalData()` - Historical data analysis and insights
     - `calculateTrends()` - Trend analysis and forecasting
     - `optimizePerformance()` - Performance optimization recommendations
     - `archiveData()` - Data archival and cleanup processes

3. **Report Generation Service**
   - **File:** `server/src/services/reportGenerationService.ts`
   - **Implementation:** Dynamic report creation and customization
   - **Key Methods:**
     - `buildCustomReport()` - Custom report creation from templates
     - `exportMultiFormat()` - Multi-format report export
     - `scheduleDelivery()` - Automated report scheduling and delivery
     - `manageTemplates()` - Report template management and versioning
     - `applyFilters()` - Dynamic data filtering and segmentation
     - `generateVisualizations()` - Chart and graph generation

#### **Week 2: Advanced Analytics & Intelligence**

##### **Day 8-11: Machine Learning & Predictive Analytics**

1. **Learning Analytics Engine**
   - **File:** `server/src/services/learningAnalyticsService.ts`
   - **Implementation:** AI-powered learning insights and recommendations
   - **Key Methods:**
     - `analyzeLearningPatterns()` - Learning pattern recognition and analysis
     - `predictPerformance()` - Performance prediction and early intervention
     - `recommendContent()` - Personalized content and activity recommendations
     - `identifyStruggles()` - Learning difficulty identification and support
     - `optimizePaths()` - Learning path optimization and adaptation
     - `measureEffectiveness()` - Teaching and content effectiveness analysis

2. **Engagement Analytics Service**
   - **File:** `server/src/services/engagementAnalyticsService.ts`
   - **Implementation:** Comprehensive engagement tracking and optimization
   - **Key Methods:**
     - `trackEngagement()` - Multi-dimensional engagement measurement
     - `analyzeDropoff()` - User dropoff pattern analysis and intervention
     - `measureSatisfaction()` - User satisfaction and experience analytics
     - `optimizeExperience()` - User experience optimization recommendations
     - `segmentUsers()` - User behavior segmentation and personalization
     - `predictChurn()` - User retention prediction and intervention strategies

3. **Performance Analytics Service**
   - **File:** `server/src/services/performanceAnalyticsService.ts`
   - **Implementation:** System and learning performance analytics
   - **Key Methods:**
     - `monitorSystem()` - System performance monitoring and optimization
     - `analyzeUsage()` - Usage pattern analysis and capacity planning
     - `trackOutcomes()` - Learning outcome measurement and analysis
     - `benchmarkPerformance()` - Comparative performance benchmarking
     - `identifyBottlenecks()` - Performance bottleneck identification
     - `recommendImprovements()` - Performance improvement recommendations

##### **Day 12-17: Analytics API & Integration**

1. **Analytics API Controllers**
   - **File:** `server/src/controllers/analyticsController.ts`
   - **Implementation:** Comprehensive analytics API endpoints
   - **Key Endpoints:**
     - `GET /api/analytics/dashboard/{role}` - Role-specific dashboard data
     - `POST /api/analytics/custom-report` - Custom report generation
     - `GET /api/analytics/real-time/{metric}` - Real-time metric data
     - `POST /api/analytics/export` - Data export in multiple formats
     - `GET /api/analytics/insights/{userId}` - Personalized insights
     - `POST /api/analytics/schedule-report` - Report scheduling
     - `GET /api/analytics/benchmarks` - Comparative benchmarking data

#### **Week 3: Frontend Analytics Implementation**

##### **Day 18-21: Dashboard & Visualization Components**

1. **Unified Analytics Dashboard**
   - **File:** `client/src/components/analytics/AnalyticsDashboard.tsx`
   - **Purpose:** Comprehensive analytics overview for all user roles
   - **Key Features:**
     - Role-specific dashboard layouts and metrics
     - Interactive charts and visualizations
     - Real-time data updates and streaming
     - Customizable widget arrangement and preferences
     - Drill-down capabilities and detailed views
     - Export and sharing functionality
     - Mobile-responsive design and touch interactions

2. **Custom Report Builder**
   - **File:** `client/src/components/analytics/ReportBuilder.tsx`
   - **Purpose:** Drag-and-drop report creation interface
   - **Key Features:**
     - Visual report designer with drag-and-drop functionality
     - Chart type selection and customization
     - Data source selection and filtering
     - Template management and sharing
     - Report scheduling and automated delivery
     - Collaborative report building and sharing
     - Export options and format selection

3. **Advanced Visualization Suite**
   - **Files:** `client/src/components/analytics/visualizations/`
   - **Purpose:** Comprehensive data visualization components
   - **Components:**
     - `InteractiveCharts.tsx` - Dynamic chart library integration
     - `PerformanceGraphs.tsx` - Performance tracking visualizations
     - `EngagementHeatmaps.tsx` - User engagement heatmaps
     - `ProgressTimelines.tsx` - Learning progress visualizations
     - `ComparisonCharts.tsx` - Comparative analysis charts
     - `PredictiveModels.tsx` - AI-powered prediction visualizations

##### **Day 22-25: Intelligence & Insights Interface**

1. **Intelligent Insights Panel**
   - **File:** `client/src/components/analytics/IntelligentInsights.tsx`
   - **Purpose:** AI-powered insights and recommendations interface
   - **Key Features:**
     - Automated insight generation and presentation
     - Personalized recommendations and action items
     - Trend analysis and pattern recognition
     - Performance prediction and early warning systems
     - Comparative analysis and benchmarking
     - Natural language insight explanations
     - Action-oriented recommendations with implementation guidance

2. **Analytics Export & Sharing Center**
   - **File:** `client/src/components/analytics/ExportCenter.tsx`
   - **Purpose:** Comprehensive data export and sharing interface
   - **Key Features:**
     - Multi-format export capabilities (PDF, Excel, CSV, PowerPoint)
     - Scheduled report delivery and automation
     - Secure sharing with permission controls
     - Report collaboration and annotation
     - Version control and template management
     - Integration with external systems and platforms

#### **Testing Requirements**

1. **Backend Testing Requirements**
   - **Analytics Tests:** Data aggregation accuracy, real-time processing
   - **Performance Tests:** Large dataset processing, concurrent analytics
   - **Report Tests:** Multi-format export, scheduled delivery
   - **Machine Learning Tests:** Prediction accuracy, recommendation relevance

2. **Frontend Testing Requirements**
   - **Dashboard Tests:** Interactive charts, real-time updates
   - **Report Builder Tests:** Drag-and-drop functionality, template management
   - **Visualization Tests:** Chart rendering, data accuracy
   - **Mobile Tests:** Analytics interface on mobile devices

3. **End-to-End Testing Scenarios**
   - Analytics data flows from collection to visualization
   - Custom reports are generated and delivered correctly
   - Real-time dashboards update with live data
   - Insights and recommendations are accurate and actionable
   - Export functionality works across all formats

#### **Integration Points**

1. **Educational System Integration**
   - Learning outcome measurement and tracking
   - Performance analytics across all system components
   - Activity and assignment effectiveness analysis

2. **User Management Integration**
   - Role-based analytics access and permissions
   - Privacy-compliant data collection and processing
   - Personalized analytics and recommendations

3. **Communication Integration**
   - Analytics-driven communication and notifications
   - Report sharing and collaborative analysis
   - Automated insight delivery and alerts

#### **Success Criteria**

- [ ] Analytics provide actionable insights for all user roles
- [ ] Real-time dashboards update reliably with live data
- [ ] Custom reports can be created, scheduled, and delivered automatically
- [ ] Machine learning insights improve learning outcomes measurably
- [ ] Performance analytics enable system optimization and scaling
- [ ] Privacy and security are maintained throughout analytics pipeline
- [ ] Export functionality supports all required formats and use cases
- [ ] Integration with existing systems maintains data accuracy and consistency

---

### **Batch 12: Final Polish, Testing & Deployment**
**Duration:** 2.5 weeks  
**Dependencies:** All previous batches

#### **Week 1: Performance Optimization & Security Hardening**

##### **Day 1-4: System Performance Optimization**

1. **Database Performance Optimization**
   - **File:** `server/src/config/database/optimization.ts`
   - **Purpose:** Comprehensive database performance tuning and optimization
   - **Key Optimizations:**
     - MongoDB index optimization for all query patterns
     - Connection pooling and timeout configuration
     - Query performance monitoring and auto-tuning
     - Data archival and cleanup strategies
     - Replica set configuration for high availability
     - Sharding strategy for horizontal scaling
     - Cache warming and preloading strategies

2. **API Performance Enhancement**
   - **File:** `server/src/middleware/performanceMiddleware.ts`
   - **Purpose:** API response time optimization and resource management
   - **Key Features:**
     - Response compression and minification
     - API rate limiting and throttling
     - Request/response caching with Redis
     - Database query optimization and batching
     - Image and asset optimization pipeline
     - CDN integration and asset delivery optimization
     - Memory leak detection and prevention

3. **Frontend Performance Optimization**
   - **Files:** `client/src/optimization/`
   - **Purpose:** Client-side performance enhancement and user experience optimization
   - **Key Components:**
     - `LazyLoading.tsx` - Component and route lazy loading
     - `AssetOptimization.tsx` - Image and asset optimization
     - `BundleOptimization.ts` - JavaScript bundle optimization
     - `CacheManager.ts` - Client-side caching strategies
     - `PerformanceMonitor.tsx` - Real-time performance monitoring
     - `MemoryManager.ts` - Memory usage optimization

##### **Day 5-7: Security Hardening & Compliance**

1. **Advanced Security Implementation**
   - **File:** `server/src/security/advancedSecurity.ts`
   - **Purpose:** Comprehensive security hardening and threat protection
   - **Key Features:**
     - Advanced encryption for sensitive data (AES-256)
     - Multi-factor authentication and biometric support
     - Session management and token rotation
     - SQL injection and XSS protection enhancement
     - CSRF protection and secure headers
     - Rate limiting and DDoS protection
     - Audit logging and security monitoring

2. **COPPA & Privacy Compliance**
   - **File:** `server/src/compliance/privacyCompliance.ts`
   - **Purpose:** Comprehensive privacy and regulatory compliance
   - **Key Features:**
     - COPPA compliance validation and enforcement
     - GDPR data protection and user rights management
     - Data anonymization and pseudonymization
     - Consent management and tracking
     - Data retention policy enforcement
     - Privacy impact assessment automation
     - Regulatory reporting and documentation

3. **Security Testing & Validation**
   - **Files:** `server/src/tests/security/`
   - **Purpose:** Comprehensive security testing and vulnerability assessment
   - **Test Coverage:**
     - Penetration testing automation
     - Vulnerability scanning and assessment
     - Authentication and authorization testing
     - Data encryption and privacy testing
     - Session security and token validation
     - Input validation and sanitization testing

#### **Week 2: Progressive Web App & Mobile Optimization**

##### **Day 8-11: PWA Implementation**

1. **Service Worker Implementation**
   - **File:** `client/public/sw.js`
   - **Purpose:** Comprehensive offline functionality and caching strategy
   - **Key Features:**
     - Intelligent caching strategy for assets and data
     - Offline mode with full functionality
     - Background sync for data synchronization
     - Push notification handling and display
     - Update management and cache invalidation
     - Network-first, cache-first, and stale-while-revalidate strategies
     - Offline queue management for user actions

2. **Progressive Enhancement Features**
   - **Files:** `client/src/pwa/`
   - **Purpose:** Native app-like experience and functionality
   - **Components:**
     - `InstallPrompt.tsx` - App installation guidance
     - `UpdateManager.tsx` - Automatic update handling
     - `OfflineIndicator.tsx` - Offline status management
     - `SyncManager.tsx` - Background data synchronization
     - `NotificationManager.tsx` - Push notification handling
     - `AppShortcuts.tsx` - App shortcuts and quick actions

3. **Mobile Optimization Suite**
   - **Files:** `client/src/mobile/`
   - **Purpose:** Mobile-first design and touch interactions
   - **Components:**
     - `TouchGestures.tsx` - Advanced touch gesture support
     - `MobileNavigation.tsx` - Mobile-optimized navigation
     - `ResponsiveLayouts.tsx` - Adaptive layout components
     - `MobilePerformance.tsx` - Mobile performance optimization
     - `AccessibilityEnhanced.tsx` - Mobile accessibility features

##### **Day 12-14: Cross-Platform Compatibility**

1. **Browser Compatibility Suite**
   - **File:** `client/src/compatibility/browserSupport.ts`
   - **Purpose:** Comprehensive cross-browser compatibility and polyfills
   - **Key Features:**
     - Automated browser feature detection
     - Polyfill loading and compatibility shims
     - Graceful degradation strategies
     - Progressive enhancement implementation
     - Cross-browser testing automation
     - Legacy browser support and fallbacks

2. **Device Adaptation Framework**
   - **Files:** `client/src/adaptation/`
   - **Purpose:** Device-specific optimization and adaptation
   - **Components:**
     - `DeviceDetection.tsx` - Device capability detection
     - `AdaptiveUI.tsx` - Device-specific UI adaptations
     - `PerformanceAdaptation.tsx` - Performance-based feature toggling
     - `AccessibilityAdaptation.tsx` - Accessibility feature adaptation
     - `InputMethodAdaptation.tsx` - Input method optimization

#### **Week 3: Comprehensive Testing & Production Deployment**

##### **Day 15-18: Comprehensive Testing Suite**

1. **End-to-End Testing Automation**
   - **Files:** `tests/e2e/`
   - **Purpose:** Comprehensive user journey and system integration testing
   - **Test Scenarios:**
     - Complete user onboarding and setup workflows
     - Multi-role interaction and collaboration scenarios
     - Activity creation, assignment, and completion flows
     - Parent-teacher communication and progress tracking
     - Assessment and evaluation workflows
     - System performance under load conditions
     - Mobile and desktop cross-platform scenarios

2. **Load Testing & Performance Validation**
   - **Files:** `tests/performance/`
   - **Purpose:** System scalability and performance validation
   - **Test Coverage:**
     - Concurrent user load testing (1000+ simultaneous users)
     - Database performance under heavy load
     - API response time and throughput testing
     - Memory usage and leak detection
     - CDN and asset delivery performance
     - Real-time feature performance (messaging, analytics)
     - Mobile performance on various devices

3. **Security & Compliance Testing**
   - **Files:** `tests/security/`
   - **Purpose:** Security vulnerability and compliance validation
   - **Test Coverage:**
     - Automated penetration testing
     - Data privacy and encryption validation
     - Authentication and authorization testing
     - COPPA compliance verification
     - Cross-site scripting (XSS) prevention testing
     - SQL injection protection validation
     - Session security and token management testing

##### **Day 19-21: Production Deployment & Monitoring**

1. **Production Infrastructure Setup**
   - **Files:** `deployment/production/`
   - **Purpose:** Scalable production environment configuration
   - **Infrastructure Components:**
     - Load balancer configuration and SSL termination
     - Auto-scaling group setup for high availability
     - Database clustering and replication
     - CDN configuration and asset optimization
     - Monitoring and alerting system setup
     - Backup and disaster recovery procedures
     - Security group and network configuration

2. **Deployment Automation & CI/CD**
   - **Files:** `deployment/automation/`
   - **Purpose:** Automated deployment pipeline and continuous delivery
   - **Pipeline Features:**
     - Blue-green deployment strategy
     - Automated database migration and rollback
     - Environment-specific configuration management
     - Automated testing integration and validation
     - Performance monitoring and health checks
     - Rollback procedures and emergency protocols
     - Feature flag management and gradual rollouts

3. **Production Monitoring & Analytics**
   - **Files:** `monitoring/production/`
   - **Purpose:** Comprehensive production system monitoring
   - **Monitoring Coverage:**
     - Real-time system performance and health monitoring
     - User experience and performance analytics
     - Error tracking and automated alerting
     - Security incident detection and response
     - Business metrics and usage analytics
     - Infrastructure cost optimization monitoring
     - Compliance and audit trail maintenance

#### **Testing Requirements**

1. **Comprehensive Testing Suite**
   - **Unit Tests:** 95%+ code coverage across all components
   - **Integration Tests:** All API endpoints and service interactions
   - **End-to-End Tests:** Complete user workflows across all roles
   - **Performance Tests:** Load testing for 1000+ concurrent users
   - **Security Tests:** Penetration testing and vulnerability assessment
   - **Mobile Tests:** Cross-device compatibility and performance
   - **Accessibility Tests:** WCAG 2.1 AA compliance validation

2. **Quality Assurance Process**
   - **Code Review:** Peer review for all code changes
   - **Security Review:** Security specialist review for sensitive components
   - **Performance Review:** Performance impact assessment for changes
   - **User Testing:** Beta testing with real educators and families
   - **Compliance Review:** Privacy and regulatory compliance validation

#### **Deployment Strategy**

1. **Production Deployment Plan**
   - **Phase 1:** Infrastructure setup and configuration
   - **Phase 2:** Blue-green deployment with traffic routing
   - **Phase 3:** Database migration with zero-downtime strategy
   - **Phase 4:** Feature enablement with gradual rollout
   - **Phase 5:** Full production traffic with monitoring

2. **Rollback and Emergency Procedures**
   - **Automated Rollback:** Triggered by performance or error thresholds
   - **Manual Rollback:** Emergency procedures for critical issues
   - **Data Recovery:** Database backup and restoration procedures
   - **Communication Plan:** User notification and status updates
   - **Incident Response:** Escalation procedures and team coordination

#### **Success Criteria**

- [ ] System performance meets or exceeds all benchmarks under load
- [ ] Security audit passes with zero critical vulnerabilities
- [ ] PWA functionality works seamlessly across all devices
- [ ] Cross-browser compatibility is validated for all target browsers
- [ ] Load testing confirms system scalability for projected user growth
- [ ] Privacy and compliance requirements are fully met
- [ ] Production deployment completes without service interruption
- [ ] Monitoring and alerting systems are fully operational
- [ ] User acceptance testing achieves 95%+ satisfaction rating
- [ ] All automated testing achieves 95%+ pass rate
- [ ] Performance metrics meet established SLA requirements
- [ ] Security and compliance audits pass all requirements

---

## Database Migration Plan

### **Phase 1: Parallel System Setup (Week 1-2)**
1. Set up MongoDB Atlas/Local instance
2. Create MongoDB schemas based on SQLite analysis
3. Implement dual-write system (SQLite + MongoDB)
4. Validate data consistency between systems

### **Phase 2: Data Migration (Week 3-4)**
1. **User Migration**
   ```sql
   -- SQLite to MongoDB mapping
   SELECT 
     id, email, password, username, role,
     firstName, lastName, age, grade, isGuest,
     language, difficulty, topics,
     totalActivitiesCompleted, currentLevel, totalPoints,
     badges, streakDays, subscriptionType
   FROM users;
   ```

2. **Activity Migration**
   - Preserve all activity content and metadata
   - Maintain creator relationships
   - Update content references

3. **Progress Migration**
   - Convert JSON fields to proper MongoDB structures
   - Preserve all attempt history
   - Maintain user-activity relationships

### **Phase 3: System Cutover (Week 5-6)**
1. Switch to read from MongoDB
2. Validate all functionality
3. Maintain SQLite as backup
4. Monitor performance and data integrity

### **Rollback Strategy**
- Maintain SQLite database during transition
- Implement feature flags for system switching
- Real-time data sync validation
- Automated rollback triggers on error thresholds

---

## Technology Stack Recommendations

### **Backend Enhancements**
```json
{
  "database": "MongoDB Atlas",
  "orm": "Mongoose",
  "cache": "Redis",
  "fileStorage": "AWS S3 / GridFS",
  "messaging": "Socket.io",
  "email": "SendGrid / AWS SES",
  "monitoring": "Sentry + DataDog"
}
```

### **Frontend Enhancements**
```json
{
  "stateManagement": "Redux Toolkit + RTK Query",
  "charts": "Recharts + D3.js",
  "realtime": "Socket.io-client",
  "forms": "React Hook Form + Zod",
  "testing": "Jest + Testing Library + Playwright"
}
```

### **Infrastructure**
```json
{
  "hosting": "AWS / Azure / Google Cloud",
  "containerization": "Docker + Kubernetes",
  "monitoring": "Prometheus + Grafana",
  "logging": "ELK Stack",
  "cdn": "CloudFlare"
}
```

---

## Security & Compliance

### **COPPA Compliance**
- Parental consent workflows
- Minimal data collection for under-13 users
- Secure data handling procedures
- Regular compliance audits

### **Data Protection**
- Encryption at rest and in transit
- GDPR compliance features
- Data export and deletion capabilities
- Privacy by design principles

### **Security Measures**
- Multi-factor authentication
- Rate limiting and DDoS protection
- Regular security audits
- Penetration testing

---

## Success Metrics & KPIs

### **Technical Metrics**
- Database migration success rate: >99.9%
- System uptime during transition: >99.5%
- API response time: <200ms average
- User data integrity: 100%

### **User Experience Metrics**
- User adoption rate for new features: >80%
- Feature completion rate: >90%
- User satisfaction score: >4.5/5
- Support ticket reduction: >50%

### **Business Metrics**
- Multi-user account creation: Track adoption
- Teacher platform usage: Monitor engagement
- Parent-child connections: Measure success
- Premium feature adoption: Conversion rates

---

## Risk Mitigation

### **Technical Risks**
1. **Data Loss During Migration**
   - Mitigation: Comprehensive backup strategy, rollback plan
   
2. **Performance Degradation**
   - Mitigation: Load testing, performance monitoring, optimization

3. **Security Vulnerabilities**
   - Mitigation: Regular audits, penetration testing, security reviews

### **User Experience Risks**
1. **Feature Complexity**
   - Mitigation: Progressive disclosure, user testing, onboarding flows

2. **Migration Disruption**
   - Mitigation: Gradual rollout, feature flags, user communication

---

## Conclusion

This implementation plan provides a structured approach to transforming the Play-Learn-Spark platform into a comprehensive multi-role educational system. The batch-based approach ensures manageable development cycles while maintaining system stability and user experience throughout the transition.

Each batch builds upon previous work and includes comprehensive testing and validation to ensure successful delivery. The plan accommodates the existing SQLite infrastructure while providing a clear path to the enhanced MongoDB-based system.

The estimated total development time is 24-26 weeks (6-7 months) with a team of 4-6 developers, including frontend, backend, and DevOps specialists.