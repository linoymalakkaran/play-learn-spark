import { Request, Response, NextFunction } from 'express';
import { Permission, RolePermission } from '../models/Permission';
import { UserMongo } from '../models/UserMongo';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Check if user has specific permission
 */
export const checkPermission = (resource: string, action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin has all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // Get user's role permissions
      const rolePermission = await RolePermission.findOne({ 
        role: req.user.role,
        isActive: true 
      }).populate('permissions');

      if (!rolePermission) {
        logger.warn(`No role permissions found for role: ${req.user.role}`);
        return res.status(403).json({
          success: false,
          message: 'Access denied: No permissions defined for your role'
        });
      }

      // Check if user has the required permission
      const hasPermission = rolePermission.permissions.some((permission: any) => 
        permission.resource === resource && 
        permission.action === action &&
        permission.isActive === true
      );

      if (!hasPermission) {
        // Check for wildcard permissions
        const hasWildcardPermission = rolePermission.permissions.some((permission: any) => 
          (permission.resource === resource && permission.action === '*') ||
          (permission.resource === '*' && permission.action === action) ||
          (permission.resource === '*' && permission.action === '*')
        );

        if (!hasWildcardPermission) {
          logger.warn(`Permission denied for user ${req.user.id}: ${resource}:${action}`);
          return res.status(403).json({
            success: false,
            message: `Access denied: You don't have permission to ${action} ${resource}`
          });
        }
      }

      // Additional condition checks if needed
      const permission = rolePermission.permissions.find((p: any) => 
        p.resource === resource && p.action === action
      );

      if (permission && permission.conditions) {
        const conditionMet = await evaluateConditions(permission.conditions, req.user, req);
        if (!conditionMet) {
          logger.warn(`Condition check failed for user ${req.user.id}: ${resource}:${action}`);
          return res.status(403).json({
            success: false,
            message: 'Access denied: Conditions not met'
          });
        }
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

/**
 * Evaluate permission conditions
 */
const evaluateConditions = async (conditions: any, user: any, req: Request): Promise<boolean> => {
  try {
    // Basic condition evaluation logic
    if (conditions.ownResource) {
      // Check if the resource belongs to the user
      const resourceId = req.params.id || req.params.userId || req.body.userId;
      if (resourceId && resourceId !== user.id) {
        return false;
      }
    }

    if (conditions.timeRestriction) {
      // Check time-based restrictions (e.g., only during school hours)
      const now = new Date();
      const hour = now.getHours();
      if (conditions.timeRestriction.startHour && hour < conditions.timeRestriction.startHour) {
        return false;
      }
      if (conditions.timeRestriction.endHour && hour > conditions.timeRestriction.endHour) {
        return false;
      }
    }

    if (conditions.subscriptionLevel) {
      // Check subscription level requirements
      if (user.subscription && user.subscription.type !== conditions.subscriptionLevel) {
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.error('Condition evaluation error:', error);
    return false;
  }
};

/**
 * Check if user has specific role(s)
 */
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
      logger.warn(`Role check failed for user ${req.user.id}: Required ${allowedRoles}, has ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: `Access denied: Required role(s): ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Check if user can access specific child data (for parents)
 */
export const canAccessChild = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const childId = req.params.childId || req.body.childId;
    
    if (!childId) {
      return res.status(400).json({
        success: false,
        message: 'Child ID is required'
      });
    }

    // Admin can access any child data
    if (req.user.role === 'admin') {
      return next();
    }

    // Parents can only access their own children
    if (req.user.role === 'parent') {
      // This will be enhanced when relationship system is implemented
      // For now, we'll use a basic check
      const childrenIds = req.user.relationships?.children || [];
      if (!childrenIds.includes(childId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only access your own children\'s data'
        });
      }
    }

    // Children can only access their own data
    if (req.user.role === 'child' && req.user.id !== childId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own data'
      });
    }

    next();
  } catch (error) {
    logger.error('Child access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Access check failed'
    });
  }
};

/**
 * Check if user can access specific class data
 */
export const canAccessClass = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const classId = req.params.classId || req.body.classId;
    
    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'Class ID is required'
      });
    }

    // Admin can access any class
    if (req.user.role === 'admin') {
      return next();
    }

    // This will be enhanced when class system is implemented
    // For now, we'll allow educators and enrolled students/parents
    if (['educator', 'parent', 'child'].includes(req.user.role)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: 'Access denied: You don\'t have permission to access this class'
    });
  } catch (error) {
    logger.error('Class access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Access check failed'
    });
  }
};

/**
 * Enhanced authentication middleware that works with MongoDB
 */
export const authenticateTokenMongo = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token (using existing JWT verification)
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'play-learn-spark-secret') as any;

    // Get user from MongoDB
    const user = await UserMongo.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: User not found'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to too many failed login attempts'
      });
    }

    // Update last active time
    user.metadata.lastActiveAt = new Date();
    await user.save();

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Get user permissions for frontend
 */
export const getUserPermissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get user's role permissions
    const rolePermission = await RolePermission.findOne({ 
      role: req.user.role,
      isActive: true 
    }).populate('permissions');

    if (!rolePermission) {
      return res.status(200).json({
        success: true,
        data: {
          role: req.user.role,
          permissions: []
        }
      });
    }

    const permissions = rolePermission.permissions.map((permission: any) => ({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description
    }));

    res.status(200).json({
      success: true,
      data: {
        role: req.user.role,
        permissions
      }
    });
  } catch (error) {
    logger.error('Get user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve permissions'
    });
  }
};

export default {
  checkPermission,
  hasRole,
  canAccessChild,
  canAccessClass,
  authenticateTokenMongo,
  getUserPermissions
};