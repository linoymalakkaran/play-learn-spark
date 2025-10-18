import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { User } from '../models/UserSQLite';
import { logger } from '../utils/logger';
import { tokenBlacklist } from '../utils/tokenBlacklist';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Generate JWT token
export const generateToken = (user: User): string => {
  const payload = {
    userId: user.id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'play-learn-spark-secret-key',
    { expiresIn: '7d' }
  );
};

// Generate refresh token
export const generateRefreshToken = (user: User): string => {
  const payload = {
    userId: user.id.toString(),
    type: 'refresh',
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'play-learn-spark-refresh-secret',
    { expiresIn: '30d' }
  );
};

// Middleware to authenticate JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      res.status(401).json({
        success: false,
        message: 'Token has been invalidated',
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'play-learn-spark-secret-key'
    ) as JWTPayload;

    // Fetch user from database
    const user = await User.findByPk(parseInt(decoded.userId));
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts',
      });
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Middleware to authorize user roles
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

// Middleware to check if user owns resource or is admin
export const authorizeOwnership = (resourceUserIdField = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    if (resourceUserId && resourceUserId !== req.user.id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.',
      });
      return;
    }

    next();
  };
};

// Middleware for optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'play-learn-spark-secret-key'
    ) as JWTPayload;

    const user = await User.findByPk(parseInt(decoded.userId));
    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Silently continue without user if token is invalid
    next();
  }
};

// Middleware to check subscription level
export const requireSubscription = (requiredLevel: 'free' | 'premium' | 'family') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const subscriptionHierarchy: { [key: string]: number } = {
      free: 1,
      premium: 2,
      family: 3,
    };

    const userLevel = subscriptionHierarchy[req.user.subscriptionType];
    const required = subscriptionHierarchy[requiredLevel];

    if (userLevel < required) {
      res.status(403).json({
        success: false,
        message: `${requiredLevel} subscription required`,
        upgradeRequired: true,
      });
      return;
    }

    // Check if subscription has expired
    if (req.user.subscriptionExpiresAt && req.user.subscriptionExpiresAt < new Date()) {
      res.status(403).json({
        success: false,
        message: 'Subscription has expired',
        subscriptionExpired: true,
      });
      return;
    }

    next();
  };
};

// Rate limiting for authentication endpoints
export const authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetTime) {
        attempts.delete(key);
      }
    }

    const userAttempts = attempts.get(identifier);
    
    if (!userAttempts) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userAttempts.count >= maxAttempts) {
      res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000),
      });
      return;
    }

    userAttempts.count++;
    next();
  };
};