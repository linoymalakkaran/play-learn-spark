import { BrowserLockdownSession, IBrowserLockdownSession, IBrowserSecurityConfig } from '../models/ProctoringSecurity';
import { logger } from '../utils/logger';

export interface DeviceInfo {
  userAgent: string;
  browserName: string;
  browserVersion: string;
  platform: string;
  screenResolution: { width: number; height: number };
  viewportSize: { width: number; height: number };
  isIncognito: boolean;
  plugins: string[];
  languages: string[];
  timezone: string;
}

export interface DeviceFingerprint {
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint?: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  connectionType?: string;
  batteryLevel?: number;
  touchSupport: boolean;
}

export interface SecurityEventData {
  type: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  url?: string;
}

export class ProctoringSecurity {
  
  /**
   * Initialize browser lockdown session
   */
  static async initializeLockdownSession(
    sessionId: string,
    userId: string,
    assessmentId: string,
    deviceInfo: DeviceInfo,
    deviceFingerprint: DeviceFingerprint,
    config?: Partial<IBrowserSecurityConfig>
  ): Promise<IBrowserLockdownSession> {
    try {
      logger.info(`Initializing browser lockdown for session: ${sessionId}`);
      
      // Check if session already exists
      const existingSession = await BrowserLockdownSession.findOne({ sessionId });
      if (existingSession) {
        logger.warn(`Lockdown session already exists: ${sessionId}`);
        return existingSession;
      }
      
      // Validate browser compatibility
      const isCompatibleBrowser = this.validateBrowserCompatibility(deviceInfo, config);
      if (!isCompatibleBrowser.valid) {
        throw new Error(`Incompatible browser: ${isCompatibleBrowser.reason}`);
      }
      
      // Validate screen resolution
      const isValidResolution = this.validateScreenResolution(deviceInfo, config);
      if (!isValidResolution.valid) {
        throw new Error(`Invalid screen resolution: ${isValidResolution.reason}`);
      }
      
      // Check for incognito mode if blocked
      if (config?.blockIncognitoMode && deviceInfo.isIncognito) {
        throw new Error('Incognito/private browsing mode is not allowed');
      }
      
      // Create lockdown session
      const session = await BrowserLockdownSession.createLockdownSession(
        sessionId,
        userId,
        assessmentId,
        deviceInfo,
        deviceFingerprint,
        config
      );
      
      logger.info(`Browser lockdown session created: ${session._id}`);
      return session;
      
    } catch (error) {
      logger.error('Error initializing lockdown session:', error);
      throw error;
    }
  }
  
  /**
   * Activate browser lockdown
   */
  static async activateLockdown(sessionId: string): Promise<{
    success: boolean;
    lockdownConfig: IBrowserSecurityConfig;
    restrictions: string[];
    message: string;
  }> {
    try {
      const session = await BrowserLockdownSession.findOne({ sessionId });
      if (!session) {
        throw new Error('Lockdown session not found');
      }
      
      // Update session status
      session.status = 'locked';
      await session.save();
      
      // Generate lockdown restrictions list
      const restrictions = this.generateRestrictionsList(session.config);
      
      logger.info(`Browser lockdown activated for session: ${sessionId}`);
      
      return {
        success: true,
        lockdownConfig: session.config,
        restrictions,
        message: 'Browser lockdown activated successfully'
      };
      
    } catch (error) {
      logger.error('Error activating lockdown:', error);
      throw error;
    }
  }
  
  /**
   * Start monitoring session
   */
  static async startMonitoring(sessionId: string): Promise<{
    success: boolean;
    monitoringConfig: any;
    message: string;
  }> {
    try {
      const session = await BrowserLockdownSession.findOne({ sessionId });
      if (!session) {
        throw new Error('Lockdown session not found');
      }
      
      session.status = 'monitoring';
      await session.save();
      
      const monitoringConfig = {
        windowFocusTracking: session.config.enableWindowFocusTracking,
        mouseTracking: session.config.enableMouseTracking,
        tabSwitchDetection: session.config.enableTabSwitchDetection,
        idleDetection: session.config.enableIdleDetection,
        performanceMonitoring: true,
        securityEventLogging: true,
        realTimeAlerts: true
      };
      
      logger.info(`Security monitoring started for session: ${sessionId}`);
      
      return {
        success: true,
        monitoringConfig,
        message: 'Security monitoring started successfully'
      };
      
    } catch (error) {
      logger.error('Error starting monitoring:', error);
      throw error;
    }
  }
  
  /**
   * Record security event
   */
  static async recordSecurityEvent(
    sessionId: string,
    eventData: SecurityEventData
  ): Promise<{
    success: boolean;
    violationAction?: string;
    message: string;
  }> {
    try {
      const session = await BrowserLockdownSession.findOne({ sessionId });
      if (!session) {
        throw new Error('Lockdown session not found');
      }
      
      // Add security event
      await session.addSecurityEvent(eventData.type, eventData.details, eventData.severity);
      
      // Check violation thresholds
      const violationCheck = session.checkViolationThresholds();
      
      // Log security event
      logger.warn(`Security event recorded: ${eventData.type} - ${eventData.severity}`, {
        sessionId,
        userId: session.userId,
        eventType: eventData.type,
        severity: eventData.severity,
        violationCount: session.violationCount,
        violationScore: session.violationScore
      });
      
      // Handle critical violations
      if (eventData.severity === 'critical' || violationCheck.action === 'terminate') {
        await this.handleCriticalViolation(session, eventData);
      }
      
      return {
        success: true,
        violationAction: violationCheck.action,
        message: `Security event recorded: ${eventData.type}`
      };
      
    } catch (error) {
      logger.error('Error recording security event:', error);
      throw error;
    }
  }
  
  /**
   * Update window tracking data
   */
  static async updateWindowTracking(
    sessionId: string,
    trackingType: 'focus' | 'resize' | 'visibility' | 'mouseMove' | 'click',
    data: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      const session = await BrowserLockdownSession.findOne({ sessionId });
      if (!session) {
        throw new Error('Lockdown session not found');
      }
      
      await session.updateWindowTracking(trackingType, data);
      
      // Check for suspicious patterns
      if (trackingType === 'focus' && !data.focused) {
        await this.recordSecurityEvent(sessionId, {
          type: 'window_blur',
          details: { timestamp: new Date().toISOString() },
          severity: 'medium'
        });
      }
      
      return {
        success: true,
        message: `Window tracking updated: ${trackingType}`
      };
      
    } catch (error) {
      logger.error('Error updating window tracking:', error);
      throw error;
    }
  }
  
  /**
   * Update performance metrics
   */
  static async updatePerformanceMetrics(
    sessionId: string,
    metricType: 'cpu' | 'memory' | 'network' | 'framerate' | 'loadTime',
    value: number | { component: string; time: number }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const session = await BrowserLockdownSession.findOne({ sessionId });
      if (!session) {
        throw new Error('Lockdown session not found');
      }
      
      await session.updatePerformanceMetrics(metricType, value);
      
      // Check for performance anomalies that might indicate cheating
      if (metricType === 'cpu' && typeof value === 'number' && value > 80) {
        await this.recordSecurityEvent(sessionId, {
          type: 'suspicious_activity',
          details: { 
            anomaly: 'high_cpu_usage', 
            value,
            timestamp: new Date().toISOString()
          },
          severity: 'medium'
        });
      }
      
      return {
        success: true,
        message: `Performance metrics updated: ${metricType}`
      };
      
    } catch (error) {
      logger.error('Error updating performance metrics:', error);
      throw error;
    }
  }
  
  /**
   * Get session security status
   */
  static async getSessionSecurityStatus(sessionId: string): Promise<{
    sessionId: string;
    status: string;
    integrityScore: number;
    trustScore: number;
    riskLevel: string;
    violationCount: number;
    recentEvents: any[];
    recommendations: string[];
  }> {
    try {
      const session = await BrowserLockdownSession.findOne({ sessionId });
      if (!session) {
        throw new Error('Lockdown session not found');
      }
      
      // Get recent security events (last 10)
      const recentEvents = session.securityEvents
        .slice(-10)
        .map(event => ({
          type: event.type,
          timestamp: event.timestamp,
          severity: event.severity,
          handled: event.handled
        }));
      
      // Generate recommendations
      const recommendations = this.generateSecurityRecommendations(session);
      
      return {
        sessionId: session.sessionId,
        status: session.status,
        integrityScore: session.integrityScore,
        trustScore: session.trustScore,
        riskLevel: session.riskLevel,
        violationCount: session.violationCount,
        recentEvents,
        recommendations
      };
      
    } catch (error) {
      logger.error('Error getting session security status:', error);
      throw error;
    }
  }
  
  /**
   * Terminate lockdown session
   */
  static async terminateLockdown(
    sessionId: string,
    reason: string = 'Session completed'
  ): Promise<{
    success: boolean;
    securityReport: any;
    message: string;
  }> {
    try {
      const session = await BrowserLockdownSession.findOne({ sessionId });
      if (!session) {
        throw new Error('Lockdown session not found');
      }
      
      // Update session status
      session.status = 'terminated';
      session.endTime = new Date();
      await session.save();
      
      // Generate final security report
      const securityReport = session.generateSecurityReport();
      
      logger.info(`Browser lockdown terminated for session: ${sessionId}`, {
        reason,
        finalIntegrityScore: session.integrityScore,
        totalViolations: session.violationCount
      });
      
      return {
        success: true,
        securityReport,
        message: `Lockdown session terminated: ${reason}`
      };
      
    } catch (error) {
      logger.error('Error terminating lockdown:', error);
      throw error;
    }
  }
  
  /**
   * Get security analytics for assessment
   */
  static async getSecurityAnalytics(assessmentId: string): Promise<{
    totalSessions: number;
    averageIntegrityScore: number;
    violationStatistics: any;
    riskDistribution: any;
    commonViolations: any[];
    securityTrends: any;
  }> {
    try {
      const sessions = await BrowserLockdownSession.find({ assessmentId });
      
      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          averageIntegrityScore: 0,
          violationStatistics: {},
          riskDistribution: {},
          commonViolations: [],
          securityTrends: {}
        };
      }
      
      // Calculate average integrity score
      const averageIntegrityScore = sessions.reduce((sum, session) => 
        sum + session.integrityScore, 0) / sessions.length;
      
      // Violation statistics
      const violationStatistics = {
        totalViolations: sessions.reduce((sum, session) => sum + session.violationCount, 0),
        averageViolationsPerSession: sessions.reduce((sum, session) => 
          sum + session.violationCount, 0) / sessions.length,
        sessionsWithViolations: sessions.filter(session => session.violationCount > 0).length
      };
      
      // Risk distribution
      const riskDistribution = sessions.reduce((acc: Record<string, number>, session) => {
        acc[session.riskLevel] = (acc[session.riskLevel] || 0) + 1;
        return acc;
      }, {});
      
      // Common violations
      const allEvents = sessions.flatMap(session => session.securityEvents);
      const violationCounts = allEvents.reduce((acc: Record<string, number>, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {});
      
      const commonViolations = Object.entries(violationCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Security trends (simplified)
      const securityTrends = {
        dailyViolations: this.calculateDailyViolationTrends(sessions),
        integrityTrends: this.calculateIntegrityTrends(sessions)
      };
      
      return {
        totalSessions: sessions.length,
        averageIntegrityScore: Math.round(averageIntegrityScore * 100) / 100,
        violationStatistics,
        riskDistribution,
        commonViolations,
        securityTrends
      };
      
    } catch (error) {
      logger.error('Error getting security analytics:', error);
      throw error;
    }
  }
  
  // Helper methods
  
  private static validateBrowserCompatibility(
    deviceInfo: DeviceInfo,
    config?: Partial<IBrowserSecurityConfig>
  ): { valid: boolean; reason?: string } {
    const allowedBrowsers = config?.allowedBrowsers || ['chrome', 'firefox', 'edge', 'safari'];
    
    if (!allowedBrowsers.includes(deviceInfo.browserName.toLowerCase())) {
      return {
        valid: false,
        reason: `Browser ${deviceInfo.browserName} is not allowed. Allowed browsers: ${allowedBrowsers.join(', ')}`
      };
    }
    
    return { valid: true };
  }
  
  private static validateScreenResolution(
    deviceInfo: DeviceInfo,
    config?: Partial<IBrowserSecurityConfig>
  ): { valid: boolean; reason?: string } {
    const minResolution = config?.minimumScreenResolution || { width: 1024, height: 768 };
    
    if (deviceInfo.screenResolution.width < minResolution.width ||
        deviceInfo.screenResolution.height < minResolution.height) {
      return {
        valid: false,
        reason: `Screen resolution ${deviceInfo.screenResolution.width}x${deviceInfo.screenResolution.height} is below minimum ${minResolution.width}x${minResolution.height}`
      };
    }
    
    return { valid: true };
  }
  
  private static generateRestrictionsList(config: IBrowserSecurityConfig): string[] {
    const restrictions: string[] = [];
    
    if (config.enableFullscreen) {
      restrictions.push('Fullscreen mode required');
    }
    
    if (config.blockRightClick) {
      restrictions.push('Right-click disabled');
    }
    
    if (config.blockDeveloperTools) {
      restrictions.push('Developer tools blocked');
    }
    
    if (!config.allowCopyPaste) {
      restrictions.push('Copy/paste disabled');
    }
    
    if (config.blockKeyboardShortcuts.length > 0) {
      restrictions.push(`Keyboard shortcuts blocked: ${config.blockKeyboardShortcuts.join(', ')}`);
    }
    
    if (config.enableTabSwitchDetection) {
      restrictions.push('Tab switching monitored');
    }
    
    if (config.enableIdleDetection) {
      restrictions.push(`Idle detection active (${config.maxIdleTimeSeconds}s limit)`);
    }
    
    return restrictions;
  }
  
  private static async handleCriticalViolation(
    session: IBrowserLockdownSession,
    eventData: SecurityEventData
  ): Promise<void> {
    logger.error(`Critical security violation detected:`, {
      sessionId: session.sessionId,
      userId: session.userId,
      eventType: eventData.type,
      violationCount: session.violationCount
    });
    
    // Additional critical violation handling can be added here
    // Such as immediate session termination, alerts to proctors, etc.
  }
  
  private static generateSecurityRecommendations(session: IBrowserLockdownSession): string[] {
    const recommendations: string[] = [];
    
    if (session.integrityScore < 70) {
      recommendations.push('Manual review recommended due to low integrity score');
    }
    
    if (session.violationCount > 5) {
      recommendations.push('High violation count requires investigation');
    }
    
    if (session.riskLevel === 'critical' || session.riskLevel === 'high') {
      recommendations.push('Immediate attention required due to high risk level');
    }
    
    const recentCriticalEvents = session.securityEvents
      .filter(event => event.severity === 'critical')
      .slice(-5);
    
    if (recentCriticalEvents.length > 0) {
      recommendations.push('Recent critical security events detected');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Security compliance acceptable');
    }
    
    return recommendations;
  }
  
  private static calculateDailyViolationTrends(sessions: IBrowserLockdownSession[]): any {
    // Simplified daily violation calculation
    const dailyData = sessions.reduce((acc: Record<string, number>, session) => {
      const date = session.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + session.violationCount;
      return acc;
    }, {});
    
    return Object.entries(dailyData)
      .map(([date, violations]) => ({ date, violations }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  private static calculateIntegrityTrends(sessions: IBrowserLockdownSession[]): any {
    // Simplified integrity trend calculation
    return sessions
      .map(session => ({
        timestamp: session.createdAt,
        integrityScore: session.integrityScore,
        trustScore: session.trustScore
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}