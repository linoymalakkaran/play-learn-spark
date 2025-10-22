import { Request, Response } from 'express';
import * as ProctoringSecurity from '../services/proctoringSecurity';
import { IBrowserSecurityConfig, BrowserLockdownSession } from '../models/ProctoringSecurity';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export class ProctoringSecurity {
  
  /**
   * Initialize browser lockdown session
   */
  static async initializeLockdown(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId, assessmentId, deviceInfo, deviceFingerprint, config } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }
      
      // Validate required fields
      if (!sessionId || !assessmentId || !deviceInfo || !deviceFingerprint) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: sessionId, assessmentId, deviceInfo, deviceFingerprint'
        });
        return;
      }
      
      const lockdownSession = await ProctoringSecurity.initializeLockdownSession(
        sessionId,
        userId,
        assessmentId,
        deviceInfo as ProctoringSecurity.DeviceInfo,
        deviceFingerprint as ProctoringSecurity.DeviceFingerprint,
        config as Partial<IBrowserSecurityConfig>
      );
      
      res.status(201).json({
        success: true,
        message: 'Browser lockdown session initialized successfully',
        data: {
          sessionId: lockdownSession.sessionId,
          status: lockdownSession.status,
          config: lockdownSession.config,
          integrityScore: lockdownSession.integrityScore,
          trustScore: lockdownSession.trustScore
        }
      });
      
    } catch (error) {
      logger.error('Error initializing lockdown:', error);
      
      if (error instanceof Error && error.message.includes('Incompatible browser')) {
        res.status(400).json({
          success: false,
          message: error.message,
          errorType: 'BROWSER_INCOMPATIBLE'
        });
      } else if (error instanceof Error && error.message.includes('Invalid screen resolution')) {
        res.status(400).json({
          success: false,
          message: error.message,
          errorType: 'RESOLUTION_INVALID'
        });
      } else if (error instanceof Error && error.message.includes('Incognito')) {
        res.status(400).json({
          success: false,
          message: error.message,
          errorType: 'INCOGNITO_BLOCKED'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to initialize browser lockdown',
          error: process.env.NODE_ENV === 'development' ? error : undefined
        });
      }
    }
  }
  
  /**
   * Get session security status
   */
  static async getSecurityStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
        return;
      }
      
      const status = await ProctoringSecurity.getSessionSecurityStatus(sessionId);
      
      res.status(200).json({
        success: true,
        message: 'Security status retrieved successfully',
        data: status
      });
      
    } catch (error) {
      logger.error('Error getting security status:', error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Lockdown session not found'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to get security status',
          error: process.env.NODE_ENV === 'development' ? error : undefined
        });
      }
    }
  }
  
  /**
   * Record security event
   */
  static async recordSecurityEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const eventData = req.body as ProctoringSecurity.SecurityEventData;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
        return;
      }
      
      // Validate event data
      if (!eventData.type || !eventData.severity) {
        res.status(400).json({
          success: false,
          message: 'Event type and severity are required'
        });
        return;
      }
      
      // Add request metadata to event
      eventData.userAgent = req.headers['user-agent'];
      eventData.url = req.headers.referer;
      
      const result = await ProctoringSecurity.recordSecurityEvent(sessionId, eventData);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          violationAction: result.violationAction
        }
      });
      
    } catch (error) {
      logger.error('Error recording security event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record security event',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
  
  /**
   * Terminate lockdown session
   */
  static async terminateLockdown(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { reason } = req.body;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
        return;
      }
      
      const result = await ProctoringSecurity.terminateLockdown(sessionId, reason);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          securityReport: result.securityReport
        }
      });
      
    } catch (error) {
      logger.error('Error terminating lockdown:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to terminate lockdown session',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
  
  /**
   * Get security analytics for assessment
   */
  static async getSecurityAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { assessmentId } = req.params;
      
      if (!assessmentId) {
        res.status(400).json({
          success: false,
          message: 'Assessment ID is required'
        });
        return;
      }
      
      const analytics = await ProctoringSecurity.getSecurityAnalytics(assessmentId);
      
      res.status(200).json({
        success: true,
        message: 'Security analytics retrieved successfully',
        data: analytics
      });
      
    } catch (error) {
      logger.error('Error getting security analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get security analytics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
  
  /**
   * Validate browser environment (before starting assessment)
   */
  static async validateEnvironment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { deviceInfo, requirements } = req.body;
      
      if (!deviceInfo) {
        res.status(400).json({
          success: false,
          message: 'Device information is required'
        });
        return;
      }
      
      const validation = {
        browserCompatible: true,
        resolutionValid: true,
        incognitoBlocked: true,
        pluginsDetected: [],
        warnings: [] as string[],
        errors: [] as string[]
      };
      
      // Check browser compatibility
      const allowedBrowsers = requirements?.allowedBrowsers || ['chrome', 'firefox', 'edge', 'safari'];
      if (!allowedBrowsers.includes(deviceInfo.browserName?.toLowerCase())) {
        validation.browserCompatible = false;
        validation.errors.push(`Browser ${deviceInfo.browserName} is not supported. Please use: ${allowedBrowsers.join(', ')}`);
      }
      
      // Check screen resolution
      const minResolution = requirements?.minimumScreenResolution || { width: 1024, height: 768 };
      if (deviceInfo.screenResolution?.width < minResolution.width ||
          deviceInfo.screenResolution?.height < minResolution.height) {
        validation.resolutionValid = false;
        validation.errors.push(`Screen resolution ${deviceInfo.screenResolution?.width}x${deviceInfo.screenResolution?.height} is below minimum ${minResolution.width}x${minResolution.height}`);
      }
      
      // Check incognito mode
      if (requirements?.blockIncognitoMode && deviceInfo.isIncognito) {
        validation.incognitoBlocked = false;
        validation.errors.push('Private/incognito browsing mode is not allowed');
      }
      
      // Check for problematic plugins
      const problematicPlugins = ['screen-capture', 'remote-desktop', 'screen-share'];
      validation.pluginsDetected = deviceInfo.plugins?.filter((plugin: string) =>
        problematicPlugins.some(problematic => plugin.toLowerCase().includes(problematic))
      ) || [];
      
      if (validation.pluginsDetected.length > 0) {
        validation.warnings.push('Potentially problematic browser plugins detected');
      }
      
      const isValid = validation.browserCompatible && 
                     validation.resolutionValid && 
                     (validation.incognitoBlocked || !requirements?.blockIncognitoMode);
      
      res.status(200).json({
        success: true,
        message: isValid ? 'Environment validation passed' : 'Environment validation failed',
        data: {
          valid: isValid,
          validation,
          canProceed: validation.errors.length === 0
        }
      });
      
    } catch (error) {
      logger.error('Error validating environment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate environment',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}