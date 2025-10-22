import mongoose, { Document, Schema } from 'mongoose';

// Browser Security Configuration Interface
export interface IBrowserSecurityConfig {
  enableFullscreen: boolean;
  blockRightClick: boolean;
  blockKeyboardShortcuts: string[];
  blockDeveloperTools: boolean;
  blockVirtualKeyboard: boolean;
  enableWindowFocusTracking: boolean;
  enableMouseTracking: boolean;
  allowCopyPaste: boolean;
  enablePrintScreenBlocking: boolean;
  blockNavigationKeys: boolean;
  minimumScreenResolution: {
    width: number;
    height: number;
  };
  allowedBrowsers: string[];
  blockIncognitoMode: boolean;
  enableTabSwitchDetection: boolean;
  maxTabSwitchViolations: number;
  enableIdleDetection: boolean;
  maxIdleTimeSeconds: number;
}

// Security Event Interface
export interface ISecurityEvent {
  type: 'window_blur' | 'window_focus' | 'right_click' | 'keyboard_shortcut' | 
        'developer_tools' | 'tab_switch' | 'copy_paste' | 'print_screen' | 
        'navigation_key' | 'resize' | 'idle_detected' | 'mouse_leave' | 
        'fullscreen_exit' | 'virtual_keyboard' | 'suspicious_activity';
  timestamp: Date;
  details: {
    keyPressed?: string;
    shortcut?: string;
    windowDimensions?: { width: number; height: number };
    mousePosition?: { x: number; y: number };
    idleDuration?: number;
    userAgent?: string;
    url?: string;
    additionalData?: any;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
  response?: string;
}

// Browser Lockdown Session Interface
export interface IBrowserLockdownSession extends Document {
  sessionId: string;
  userId: string;
  assessmentId: string;
  config: IBrowserSecurityConfig;
  status: 'initializing' | 'locked' | 'monitoring' | 'violated' | 'terminated';
  startTime: Date;
  endTime?: Date;
  
  // Security monitoring
  securityEvents: ISecurityEvent[];
  violationCount: number;
  violationScore: number;
  lastActivity: Date;
  
  // Browser environment
  browserInfo: {
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
  };
  
  // Device fingerprinting
  deviceFingerprint: {
    canvasFingerprint: string;
    webglFingerprint: string;
    audioFingerprint: string;
    hardwareConcurrency: number;
    deviceMemory?: number;
    connectionType?: string;
    batteryLevel?: number;
    touchSupport: boolean;
  };
  
  // Window tracking
  windowTracking: {
    focusEvents: { timestamp: Date; focused: boolean }[];
    resizeEvents: { timestamp: Date; width: number; height: number }[];
    visibilityChanges: { timestamp: Date; visible: boolean }[];
    mouseMoveTracking: { timestamp: Date; x: number; y: number }[];
    clickTracking: { timestamp: Date; x: number; y: number; button: number }[];
  };
  
  // Performance metrics
  performanceMetrics: {
    cpuUsage: number[];
    memoryUsage: number[];
    networkLatency: number[];
    framerate: number[];
    loadTimes: { component: string; time: number }[];
  };
  
  // Integrity scores
  integrityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  trustScore: number;
  
  // Violation handling
  violationPolicy: {
    autoTerminate: boolean;
    warningThreshold: number;
    terminationThreshold: number;
    allowedViolationTypes: string[];
    gracePeriodSeconds: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Browser Lockdown Schema
const browserLockdownSchema = new Schema<IBrowserLockdownSession>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  assessmentId: {
    type: String,
    required: true,
    index: true
  },
  config: {
    enableFullscreen: { type: Boolean, default: true },
    blockRightClick: { type: Boolean, default: true },
    blockKeyboardShortcuts: [{
      type: String,
      enum: ['ctrl+c', 'ctrl+v', 'ctrl+x', 'ctrl+a', 'ctrl+s', 'ctrl+p', 
             'ctrl+shift+i', 'f12', 'ctrl+u', 'ctrl+shift+j', 'ctrl+shift+c',
             'alt+tab', 'ctrl+tab', 'ctrl+w', 'ctrl+t', 'ctrl+n', 'ctrl+shift+n']
    }],
    blockDeveloperTools: { type: Boolean, default: true },
    blockVirtualKeyboard: { type: Boolean, default: false },
    enableWindowFocusTracking: { type: Boolean, default: true },
    enableMouseTracking: { type: Boolean, default: true },
    allowCopyPaste: { type: Boolean, default: false },
    enablePrintScreenBlocking: { type: Boolean, default: true },
    blockNavigationKeys: { type: Boolean, default: true },
    minimumScreenResolution: {
      width: { type: Number, default: 1024 },
      height: { type: Number, default: 768 }
    },
    allowedBrowsers: [{
      type: String,
      enum: ['chrome', 'firefox', 'edge', 'safari']
    }],
    blockIncognitoMode: { type: Boolean, default: true },
    enableTabSwitchDetection: { type: Boolean, default: true },
    maxTabSwitchViolations: { type: Number, default: 3 },
    enableIdleDetection: { type: Boolean, default: true },
    maxIdleTimeSeconds: { type: Number, default: 300 }
  },
  status: {
    type: String,
    enum: ['initializing', 'locked', 'monitoring', 'violated', 'terminated'],
    default: 'initializing'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  
  securityEvents: [{
    type: {
      type: String,
      enum: ['window_blur', 'window_focus', 'right_click', 'keyboard_shortcut', 
             'developer_tools', 'tab_switch', 'copy_paste', 'print_screen', 
             'navigation_key', 'resize', 'idle_detected', 'mouse_leave', 
             'fullscreen_exit', 'virtual_keyboard', 'suspicious_activity'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    details: {
      keyPressed: String,
      shortcut: String,
      windowDimensions: {
        width: Number,
        height: Number
      },
      mousePosition: {
        x: Number,
        y: Number
      },
      idleDuration: Number,
      userAgent: String,
      url: String,
      additionalData: Schema.Types.Mixed
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    handled: { type: Boolean, default: false },
    response: String
  }],
  
  violationCount: { type: Number, default: 0 },
  violationScore: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  
  browserInfo: {
    userAgent: { type: String, required: true },
    browserName: { type: String, required: true },
    browserVersion: { type: String, required: true },
    platform: { type: String, required: true },
    screenResolution: {
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    viewportSize: {
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    isIncognito: { type: Boolean, default: false },
    plugins: [String],
    languages: [String],
    timezone: String
  },
  
  deviceFingerprint: {
    canvasFingerprint: { type: String, required: true },
    webglFingerprint: { type: String, required: true },
    audioFingerprint: String,
    hardwareConcurrency: { type: Number, required: true },
    deviceMemory: Number,
    connectionType: String,
    batteryLevel: Number,
    touchSupport: { type: Boolean, default: false }
  },
  
  windowTracking: {
    focusEvents: [{
      timestamp: { type: Date, default: Date.now },
      focused: { type: Boolean, required: true }
    }],
    resizeEvents: [{
      timestamp: { type: Date, default: Date.now },
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    }],
    visibilityChanges: [{
      timestamp: { type: Date, default: Date.now },
      visible: { type: Boolean, required: true }
    }],
    mouseMoveTracking: [{
      timestamp: { type: Date, default: Date.now },
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    }],
    clickTracking: [{
      timestamp: { type: Date, default: Date.now },
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      button: { type: Number, required: true }
    }]
  },
  
  performanceMetrics: {
    cpuUsage: [Number],
    memoryUsage: [Number],
    networkLatency: [Number],
    framerate: [Number],
    loadTimes: [{
      component: { type: String, required: true },
      time: { type: Number, required: true }
    }]
  },
  
  integrityScore: { type: Number, default: 100, min: 0, max: 100 },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  trustScore: { type: Number, default: 100, min: 0, max: 100 },
  
  violationPolicy: {
    autoTerminate: { type: Boolean, default: false },
    warningThreshold: { type: Number, default: 3 },
    terminationThreshold: { type: Number, default: 5 },
    allowedViolationTypes: [String],
    gracePeriodSeconds: { type: Number, default: 30 }
  }
}, {
  timestamps: true,
  collection: 'browser_lockdown_sessions'
});

// Indexes for performance
browserLockdownSchema.index({ sessionId: 1, userId: 1 });
browserLockdownSchema.index({ assessmentId: 1, status: 1 });
browserLockdownSchema.index({ userId: 1, createdAt: -1 });
browserLockdownSchema.index({ violationScore: -1, riskLevel: 1 });
browserLockdownSchema.index({ 'securityEvents.type': 1, 'securityEvents.timestamp': -1 });

// Instance methods
browserLockdownSchema.methods.addSecurityEvent = function(
  type: string, 
  details: any, 
  severity: 'low' | 'medium' | 'high' | 'critical'
) {
  const event: ISecurityEvent = {
    type: type as any,
    timestamp: new Date(),
    details,
    severity,
    handled: false
  };
  
  this.securityEvents.push(event);
  this.violationCount += 1;
  this.lastActivity = new Date();
  
  // Calculate violation score based on severity
  const severityWeights = { low: 1, medium: 3, high: 7, critical: 15 };
  this.violationScore += severityWeights[severity];
  
  // Update risk level based on violation score
  if (this.violationScore >= 50) {
    this.riskLevel = 'critical';
  } else if (this.violationScore >= 25) {
    this.riskLevel = 'high';
  } else if (this.violationScore >= 10) {
    this.riskLevel = 'medium';
  }
  
  // Update integrity and trust scores
  this.integrityScore = Math.max(0, 100 - this.violationScore);
  this.trustScore = Math.max(0, this.trustScore - severityWeights[severity]);
  
  return this.save();
};

browserLockdownSchema.methods.updateWindowTracking = function(
  trackingType: 'focus' | 'resize' | 'visibility' | 'mouseMove' | 'click',
  data: any
) {
  const timestamp = new Date();
  
  switch (trackingType) {
    case 'focus':
      this.windowTracking.focusEvents.push({ timestamp, focused: data.focused });
      break;
    case 'resize':
      this.windowTracking.resizeEvents.push({ 
        timestamp, 
        width: data.width, 
        height: data.height 
      });
      break;
    case 'visibility':
      this.windowTracking.visibilityChanges.push({ 
        timestamp, 
        visible: data.visible 
      });
      break;
    case 'mouseMove':
      // Limit mouse tracking to prevent data overflow
      if (this.windowTracking.mouseMoveTracking.length > 1000) {
        this.windowTracking.mouseMoveTracking.splice(0, 500);
      }
      this.windowTracking.mouseMoveTracking.push({ 
        timestamp, 
        x: data.x, 
        y: data.y 
      });
      break;
    case 'click':
      this.windowTracking.clickTracking.push({ 
        timestamp, 
        x: data.x, 
        y: data.y, 
        button: data.button 
      });
      break;
  }
  
  this.lastActivity = timestamp;
  return this.save();
};

browserLockdownSchema.methods.updatePerformanceMetrics = function(
  metricType: 'cpu' | 'memory' | 'network' | 'framerate' | 'loadTime',
  value: number | { component: string; time: number }
) {
  const maxMetrics = 100; // Limit stored metrics
  
  switch (metricType) {
    case 'cpu':
      this.performanceMetrics.cpuUsage.push(value as number);
      if (this.performanceMetrics.cpuUsage.length > maxMetrics) {
        this.performanceMetrics.cpuUsage.splice(0, 50);
      }
      break;
    case 'memory':
      this.performanceMetrics.memoryUsage.push(value as number);
      if (this.performanceMetrics.memoryUsage.length > maxMetrics) {
        this.performanceMetrics.memoryUsage.splice(0, 50);
      }
      break;
    case 'network':
      this.performanceMetrics.networkLatency.push(value as number);
      if (this.performanceMetrics.networkLatency.length > maxMetrics) {
        this.performanceMetrics.networkLatency.splice(0, 50);
      }
      break;
    case 'framerate':
      this.performanceMetrics.framerate.push(value as number);
      if (this.performanceMetrics.framerate.length > maxMetrics) {
        this.performanceMetrics.framerate.splice(0, 50);
      }
      break;
    case 'loadTime':
      this.performanceMetrics.loadTimes.push(value as any);
      if (this.performanceMetrics.loadTimes.length > 50) {
        this.performanceMetrics.loadTimes.splice(0, 25);
      }
      break;
  }
  
  return this.save();
};

browserLockdownSchema.methods.checkViolationThresholds = function() {
  const policy = this.violationPolicy;
  
  if (policy.autoTerminate) {
    if (this.violationCount >= policy.terminationThreshold) {
      this.status = 'terminated';
      this.endTime = new Date();
      return { action: 'terminate', reason: 'Violation threshold exceeded' };
    }
    
    if (this.violationCount >= policy.warningThreshold) {
      return { action: 'warning', reason: 'Warning threshold reached' };
    }
  }
  
  return { action: 'continue', reason: 'Within acceptable limits' };
};

browserLockdownSchema.methods.generateSecurityReport = function() {
  const totalEvents = this.securityEvents.length;
  const eventsByType = this.securityEvents.reduce((acc: Record<string, number>, event: ISecurityEvent) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const eventsBySeverity = this.securityEvents.reduce((acc: Record<string, number>, event: ISecurityEvent) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const duration = this.endTime 
    ? this.endTime.getTime() - this.startTime.getTime()
    : Date.now() - this.startTime.getTime();
  
  return {
    sessionId: this.sessionId,
    userId: this.userId,
    assessmentId: this.assessmentId,
    duration: Math.round(duration / 1000), // seconds
    status: this.status,
    violationCount: this.violationCount,
    violationScore: this.violationScore,
    integrityScore: this.integrityScore,
    trustScore: this.trustScore,
    riskLevel: this.riskLevel,
    totalSecurityEvents: totalEvents,
    eventsByType,
    eventsBySeverity,
    browserInfo: this.browserInfo,
    deviceFingerprint: this.deviceFingerprint,
    recommendation: this.integrityScore < 70 
      ? 'Review required - low integrity score'
      : this.violationCount > 5 
        ? 'Manual review recommended'
        : 'Acceptable security compliance'
  };
};

// Static methods
browserLockdownSchema.statics.createLockdownSession = async function(
  sessionId: string,
  userId: string,
  assessmentId: string,
  browserInfo: any,
  deviceFingerprint: any,
  config?: Partial<IBrowserSecurityConfig>
) {
  const defaultConfig: IBrowserSecurityConfig = {
    enableFullscreen: true,
    blockRightClick: true,
    blockKeyboardShortcuts: ['ctrl+c', 'ctrl+v', 'ctrl+shift+i', 'f12'],
    blockDeveloperTools: true,
    blockVirtualKeyboard: false,
    enableWindowFocusTracking: true,
    enableMouseTracking: true,
    allowCopyPaste: false,
    enablePrintScreenBlocking: true,
    blockNavigationKeys: true,
    minimumScreenResolution: { width: 1024, height: 768 },
    allowedBrowsers: ['chrome', 'firefox', 'edge'],
    blockIncognitoMode: true,
    enableTabSwitchDetection: true,
    maxTabSwitchViolations: 3,
    enableIdleDetection: true,
    maxIdleTimeSeconds: 300
  };
  
  const session = new this({
    sessionId,
    userId,
    assessmentId,
    config: { ...defaultConfig, ...config },
    browserInfo,
    deviceFingerprint,
    status: 'initializing',
    violationPolicy: {
      autoTerminate: false,
      warningThreshold: 3,
      terminationThreshold: 5,
      allowedViolationTypes: ['window_blur'],
      gracePeriodSeconds: 30
    }
  });
  
  return session.save();
};

export const BrowserLockdownSession = mongoose.model<IBrowserLockdownSession>(
  'BrowserLockdownSession', 
  browserLockdownSchema
);