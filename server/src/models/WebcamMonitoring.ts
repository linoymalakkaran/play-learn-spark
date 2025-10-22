import mongoose, { Document, Schema } from 'mongoose';

// Face Detection Result Interface
export interface IFaceDetectionResult {
  detected: boolean;
  count: number;
  confidence: number;
  boundingBoxes: {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }[];
  landmarks?: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    nose: { x: number; y: number };
    leftMouth: { x: number; y: number };
    rightMouth: { x: number; y: number };
  }[];
  emotions?: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    neutral: number;
    fearful: number;
    disgusted: number;
  }[];
}

// Eye Tracking Data Interface
export interface IEyeTrackingData {
  leftEye: {
    isOpen: boolean;
    confidence: number;
    pupilPosition: { x: number; y: number };
    gazeDirection: { x: number; y: number };
  };
  rightEye: {
    isOpen: boolean;
    confidence: number;
    pupilPosition: { x: number; y: number };
    gazeDirection: { x: number; y: number };
  };
  combinedGaze: {
    screenX: number;
    screenY: number;
    confidence: number;
  };
  blinkRate: number;
  attentionScore: number;
}

// Screen Activity Detection Interface
export interface IScreenActivityDetection {
  screenRecordingDetected: boolean;
  screenSharingDetected: boolean;
  multipleDisplaysDetected: boolean;
  suspiciousApplications: string[];
  virtualMachineDetected: boolean;
  remoteDesktopDetected: boolean;
  confidence: number;
}

// Behavior Analysis Interface
export interface IBehaviorAnalysis {
  suspiciousMovementDetected: boolean;
  lookAwayFrequency: number;
  typingPatternAnomaly: boolean;
  responseTimeAnomaly: boolean;
  multitaskingIndicators: string[];
  attentionLapses: number;
  overallSuspicionScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Audio Analysis Interface
export interface IAudioAnalysis {
  backgroundNoiseLevel: number;
  voiceDetected: boolean;
  multipleVoicesDetected: boolean;
  keyboardSounds: boolean;
  phoneRinging: boolean;
  suspiciousAudioEvents: string[];
  audioQuality: 'poor' | 'fair' | 'good' | 'excellent';
}

// Recording Frame Interface
export interface IRecordingFrame {
  timestamp: Date;
  frameId: string;
  webcamFrame?: {
    imageData: string; // base64 encoded
    quality: number;
    resolution: { width: number; height: number };
    fileSize: number;
  };
  screenFrame?: {
    imageData: string; // base64 encoded
    quality: number;
    resolution: { width: number; height: number };
    fileSize: number;
  };
  audioFrame?: {
    audioData: string; // base64 encoded
    duration: number;
    sampleRate: number;
    fileSize: number;
  };
  processingResults: {
    faceDetection: IFaceDetectionResult;
    eyeTracking: IEyeTrackingData;
    screenActivity: IScreenActivityDetection;
    behaviorAnalysis: IBehaviorAnalysis;
    audioAnalysis: IAudioAnalysis;
  };
}

// Monitoring Configuration Interface
export interface IMonitoringConfig {
  webcamRequired: boolean;
  webcamResolution: { width: number; height: number };
  webcamFrameRate: number;
  screenRecordingEnabled: boolean;
  screenRecordingQuality: 'low' | 'medium' | 'high';
  audioRecordingEnabled: boolean;
  audioSampleRate: number;
  
  // AI Analysis Settings
  faceDetectionEnabled: boolean;
  eyeTrackingEnabled: boolean;
  emotionDetectionEnabled: boolean;
  behaviorAnalysisEnabled: boolean;
  audioAnalysisEnabled: boolean;
  
  // Real-time Processing
  realTimeProcessing: boolean;
  processingInterval: number; // seconds
  alertThresholds: {
    multipleFaces: number;
    lookAwayDuration: number;
    suspiciousBehaviorScore: number;
    audioAnomalyScore: number;
  };
  
  // Storage Settings
  recordingRetentionDays: number;
  compressRecordings: boolean;
  encryptRecordings: boolean;
  uploadToCloud: boolean;
  
  // Privacy Settings
  blurBackground: boolean;
  anonymizeFaces: boolean;
  audioTranscriptionEnabled: boolean;
  dataMinimization: boolean;
}

// Webcam Monitoring Session Interface
export interface IWebcamMonitoringSession extends Document {
  sessionId: string;
  userId: string;
  assessmentId: string;
  lockdownSessionId: string;
  
  config: IMonitoringConfig;
  status: 'initializing' | 'calibrating' | 'active' | 'paused' | 'terminated' | 'error';
  
  // Session Info
  startTime: Date;
  endTime?: Date;
  totalDuration: number; // seconds
  
  // Device Capabilities
  deviceCapabilities: {
    hasWebcam: boolean;
    hasMicrophone: boolean;
    webcamPermission: boolean;
    microphonePermission: boolean;
    screenSharePermission: boolean;
    supportedResolutions: { width: number; height: number }[];
    deviceName: string;
    deviceId: string;
  };
  
  // Recording Data
  frames: IRecordingFrame[];
  recordingFiles: {
    webcamVideo?: {
      filename: string;
      duration: number;
      fileSize: number;
      resolution: { width: number; height: number };
      encoding: string;
    };
    screenVideo?: {
      filename: string;
      duration: number;
      fileSize: number;
      resolution: { width: number; height: number };
      encoding: string;
    };
    audioRecording?: {
      filename: string;
      duration: number;
      fileSize: number;
      sampleRate: number;
      encoding: string;
    };
  };
  
  // Real-time Analysis Results
  currentAnalysis: {
    lastFaceDetection: IFaceDetectionResult;
    lastEyeTracking: IEyeTrackingData;
    lastScreenActivity: IScreenActivityDetection;
    lastBehaviorAnalysis: IBehaviorAnalysis;
    lastAudioAnalysis: IAudioAnalysis;
    lastUpdate: Date;
  };
  
  // Violation Tracking
  violations: {
    timestamp: Date;
    type: 'multiple_faces' | 'no_face_detected' | 'looking_away' | 'screen_recording' | 
          'screen_sharing' | 'suspicious_behavior' | 'audio_anomaly' | 'device_changed';
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: any;
    frameId?: string;
    handled: boolean;
    response?: string;
  }[];
  
  // Performance Metrics
  performanceMetrics: {
    frameProcessingTime: number[];
    averageProcessingTime: number;
    droppedFrames: number;
    errorCount: number;
    cpuUsage: number[];
    memoryUsage: number[];
    networkBandwidth: number[];
  };
  
  // Calibration Data
  calibrationData: {
    faceBaseline: IFaceDetectionResult;
    eyeTrackingBaseline: IEyeTrackingData;
    behaviorBaseline: IBehaviorAnalysis;
    audioBaseline: IAudioAnalysis;
    calibrationCompleted: boolean;
    calibrationTimestamp: Date;
  };
  
  // Summary Statistics
  sessionSummary: {
    totalFramesProcessed: number;
    totalViolations: number;
    averageAttentionScore: number;
    faceDetectionAccuracy: number;
    eyeTrackingAccuracy: number;
    overallComplianceScore: number;
    recommendedAction: 'approve' | 'review' | 'flag' | 'reject';
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Webcam Monitoring Schema
const webcamMonitoringSchema = new Schema<IWebcamMonitoringSession>({
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
  lockdownSessionId: {
    type: String,
    required: true,
    index: true
  },
  
  config: {
    webcamRequired: { type: Boolean, default: true },
    webcamResolution: {
      width: { type: Number, default: 1280 },
      height: { type: Number, default: 720 }
    },
    webcamFrameRate: { type: Number, default: 10 },
    screenRecordingEnabled: { type: Boolean, default: false },
    screenRecordingQuality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    audioRecordingEnabled: { type: Boolean, default: true },
    audioSampleRate: { type: Number, default: 44100 },
    
    faceDetectionEnabled: { type: Boolean, default: true },
    eyeTrackingEnabled: { type: Boolean, default: true },
    emotionDetectionEnabled: { type: Boolean, default: false },
    behaviorAnalysisEnabled: { type: Boolean, default: true },
    audioAnalysisEnabled: { type: Boolean, default: true },
    
    realTimeProcessing: { type: Boolean, default: true },
    processingInterval: { type: Number, default: 5 },
    alertThresholds: {
      multipleFaces: { type: Number, default: 1 },
      lookAwayDuration: { type: Number, default: 10 },
      suspiciousBehaviorScore: { type: Number, default: 70 },
      audioAnomalyScore: { type: Number, default: 60 }
    },
    
    recordingRetentionDays: { type: Number, default: 30 },
    compressRecordings: { type: Boolean, default: true },
    encryptRecordings: { type: Boolean, default: true },
    uploadToCloud: { type: Boolean, default: false },
    
    blurBackground: { type: Boolean, default: false },
    anonymizeFaces: { type: Boolean, default: false },
    audioTranscriptionEnabled: { type: Boolean, default: false },
    dataMinimization: { type: Boolean, default: true }
  },
  
  status: {
    type: String,
    enum: ['initializing', 'calibrating', 'active', 'paused', 'terminated', 'error'],
    default: 'initializing'
  },
  
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  totalDuration: { type: Number, default: 0 },
  
  deviceCapabilities: {
    hasWebcam: { type: Boolean, required: true },
    hasMicrophone: { type: Boolean, required: true },
    webcamPermission: { type: Boolean, required: true },
    microphonePermission: { type: Boolean, required: true },
    screenSharePermission: { type: Boolean, default: false },
    supportedResolutions: [{
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    }],
    deviceName: String,
    deviceId: String
  },
  
  frames: [{
    timestamp: { type: Date, default: Date.now },
    frameId: { type: String, required: true },
    webcamFrame: {
      imageData: String,
      quality: Number,
      resolution: {
        width: Number,
        height: Number
      },
      fileSize: Number
    },
    screenFrame: {
      imageData: String,
      quality: Number,
      resolution: {
        width: Number,
        height: Number
      },
      fileSize: Number
    },
    audioFrame: {
      audioData: String,
      duration: Number,
      sampleRate: Number,
      fileSize: Number
    },
    processingResults: {
      faceDetection: {
        detected: Boolean,
        count: Number,
        confidence: Number,
        boundingBoxes: [Schema.Types.Mixed],
        landmarks: [Schema.Types.Mixed],
        emotions: [Schema.Types.Mixed]
      },
      eyeTracking: Schema.Types.Mixed,
      screenActivity: Schema.Types.Mixed,
      behaviorAnalysis: Schema.Types.Mixed,
      audioAnalysis: Schema.Types.Mixed
    }
  }],
  
  recordingFiles: {
    webcamVideo: {
      filename: String,
      duration: Number,
      fileSize: Number,
      resolution: {
        width: Number,
        height: Number
      },
      encoding: String
    },
    screenVideo: {
      filename: String,
      duration: Number,
      fileSize: Number,
      resolution: {
        width: Number,
        height: Number
      },
      encoding: String
    },
    audioRecording: {
      filename: String,
      duration: Number,
      fileSize: Number,
      sampleRate: Number,
      encoding: String
    }
  },
  
  currentAnalysis: {
    lastFaceDetection: Schema.Types.Mixed,
    lastEyeTracking: Schema.Types.Mixed,
    lastScreenActivity: Schema.Types.Mixed,
    lastBehaviorAnalysis: Schema.Types.Mixed,
    lastAudioAnalysis: Schema.Types.Mixed,
    lastUpdate: { type: Date, default: Date.now }
  },
  
  violations: [{
    timestamp: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['multiple_faces', 'no_face_detected', 'looking_away', 'screen_recording', 
             'screen_sharing', 'suspicious_behavior', 'audio_anomaly', 'device_changed'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    details: Schema.Types.Mixed,
    frameId: String,
    handled: { type: Boolean, default: false },
    response: String
  }],
  
  performanceMetrics: {
    frameProcessingTime: [Number],
    averageProcessingTime: { type: Number, default: 0 },
    droppedFrames: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    cpuUsage: [Number],
    memoryUsage: [Number],
    networkBandwidth: [Number]
  },
  
  calibrationData: {
    faceBaseline: Schema.Types.Mixed,
    eyeTrackingBaseline: Schema.Types.Mixed,
    behaviorBaseline: Schema.Types.Mixed,
    audioBaseline: Schema.Types.Mixed,
    calibrationCompleted: { type: Boolean, default: false },
    calibrationTimestamp: Date
  },
  
  sessionSummary: {
    totalFramesProcessed: { type: Number, default: 0 },
    totalViolations: { type: Number, default: 0 },
    averageAttentionScore: { type: Number, default: 100 },
    faceDetectionAccuracy: { type: Number, default: 0 },
    eyeTrackingAccuracy: { type: Number, default: 0 },
    overallComplianceScore: { type: Number, default: 100 },
    recommendedAction: {
      type: String,
      enum: ['approve', 'review', 'flag', 'reject'],
      default: 'approve'
    }
  }
}, {
  timestamps: true,
  collection: 'webcam_monitoring_sessions'
});

// Indexes for performance
webcamMonitoringSchema.index({ sessionId: 1, userId: 1 });
webcamMonitoringSchema.index({ assessmentId: 1, status: 1 });
webcamMonitoringSchema.index({ userId: 1, createdAt: -1 });
webcamMonitoringSchema.index({ 'violations.type': 1, 'violations.timestamp': -1 });
webcamMonitoringSchema.index({ 'sessionSummary.overallComplianceScore': -1 });

// Instance methods
webcamMonitoringSchema.methods.addFrame = function(frameData: Omit<IRecordingFrame, 'timestamp'>) {
  const frame = {
    ...frameData,
    timestamp: new Date()
  };
  
  this.frames.push(frame);
  this.sessionSummary.totalFramesProcessed += 1;
  
  // Limit stored frames to prevent memory issues
  if (this.frames.length > 1000) {
    this.frames.splice(0, 500); // Remove oldest 500 frames
  }
  
  return this.save();
};

webcamMonitoringSchema.methods.addViolation = function(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: any,
  frameId?: string
) {
  const violation = {
    timestamp: new Date(),
    type,
    severity,
    details,
    frameId,
    handled: false
  };
  
  this.violations.push(violation);
  this.sessionSummary.totalViolations += 1;
  
  // Update compliance score based on violation severity
  const severityWeights = { low: 1, medium: 3, high: 7, critical: 15 };
  const impactScore = severityWeights[severity];
  this.sessionSummary.overallComplianceScore = Math.max(0, 
    this.sessionSummary.overallComplianceScore - impactScore);
  
  // Update recommended action based on compliance score
  if (this.sessionSummary.overallComplianceScore < 30) {
    this.sessionSummary.recommendedAction = 'reject';
  } else if (this.sessionSummary.overallComplianceScore < 60) {
    this.sessionSummary.recommendedAction = 'flag';
  } else if (this.sessionSummary.overallComplianceScore < 80) {
    this.sessionSummary.recommendedAction = 'review';
  }
  
  return this.save();
};

webcamMonitoringSchema.methods.updateCurrentAnalysis = function(analysisResults: any) {
  this.currentAnalysis = {
    ...analysisResults,
    lastUpdate: new Date()
  };
  
  // Update session summary based on analysis
  if (analysisResults.eyeTracking?.attentionScore) {
    const currentAttention = analysisResults.eyeTracking.attentionScore;
    const totalFrames = this.sessionSummary.totalFramesProcessed;
    this.sessionSummary.averageAttentionScore = 
      ((this.sessionSummary.averageAttentionScore * (totalFrames - 1)) + currentAttention) / totalFrames;
  }
  
  return this.save();
};

webcamMonitoringSchema.methods.updatePerformanceMetrics = function(
  metricType: 'frameProcessingTime' | 'cpuUsage' | 'memoryUsage' | 'networkBandwidth',
  value: number
) {
  const maxMetrics = 100;
  
  switch (metricType) {
    case 'frameProcessingTime':
      this.performanceMetrics.frameProcessingTime.push(value);
      if (this.performanceMetrics.frameProcessingTime.length > maxMetrics) {
        this.performanceMetrics.frameProcessingTime.splice(0, 50);
      }
      // Update average processing time
      this.performanceMetrics.averageProcessingTime = 
        this.performanceMetrics.frameProcessingTime.reduce((a, b) => a + b, 0) / 
        this.performanceMetrics.frameProcessingTime.length;
      break;
    case 'cpuUsage':
      this.performanceMetrics.cpuUsage.push(value);
      if (this.performanceMetrics.cpuUsage.length > maxMetrics) {
        this.performanceMetrics.cpuUsage.splice(0, 50);
      }
      break;
    case 'memoryUsage':
      this.performanceMetrics.memoryUsage.push(value);
      if (this.performanceMetrics.memoryUsage.length > maxMetrics) {
        this.performanceMetrics.memoryUsage.splice(0, 50);
      }
      break;
    case 'networkBandwidth':
      this.performanceMetrics.networkBandwidth.push(value);
      if (this.performanceMetrics.networkBandwidth.length > maxMetrics) {
        this.performanceMetrics.networkBandwidth.splice(0, 50);
      }
      break;
  }
  
  return this.save();
};

webcamMonitoringSchema.methods.generateSessionReport = function() {
  const duration = this.endTime 
    ? this.endTime.getTime() - this.startTime.getTime()
    : Date.now() - this.startTime.getTime();
  
  const violationsByType = this.violations.reduce((acc: Record<string, number>, violation) => {
    acc[violation.type] = (acc[violation.type] || 0) + 1;
    return acc;
  }, {});
  
  const violationsBySeverity = this.violations.reduce((acc: Record<string, number>, violation) => {
    acc[violation.severity] = (acc[violation.severity] || 0) + 1;
    return acc;
  }, {});
  
  return {
    sessionId: this.sessionId,
    userId: this.userId,
    assessmentId: this.assessmentId,
    duration: Math.round(duration / 1000), // seconds
    status: this.status,
    totalFramesProcessed: this.sessionSummary.totalFramesProcessed,
    totalViolations: this.sessionSummary.totalViolations,
    overallComplianceScore: this.sessionSummary.overallComplianceScore,
    recommendedAction: this.sessionSummary.recommendedAction,
    violationsByType,
    violationsBySeverity,
    averageAttentionScore: this.sessionSummary.averageAttentionScore,
    performanceMetrics: {
      averageProcessingTime: this.performanceMetrics.averageProcessingTime,
      droppedFrames: this.performanceMetrics.droppedFrames,
      errorCount: this.performanceMetrics.errorCount
    },
    deviceCapabilities: this.deviceCapabilities,
    recordingFiles: this.recordingFiles
  };
};

// Static methods
webcamMonitoringSchema.statics.createMonitoringSession = async function(
  sessionId: string,
  userId: string,
  assessmentId: string,
  lockdownSessionId: string,
  deviceCapabilities: any,
  config?: Partial<IMonitoringConfig>
) {
  const defaultConfig: IMonitoringConfig = {
    webcamRequired: true,
    webcamResolution: { width: 1280, height: 720 },
    webcamFrameRate: 10,
    screenRecordingEnabled: false,
    screenRecordingQuality: 'medium',
    audioRecordingEnabled: true,
    audioSampleRate: 44100,
    faceDetectionEnabled: true,
    eyeTrackingEnabled: true,
    emotionDetectionEnabled: false,
    behaviorAnalysisEnabled: true,
    audioAnalysisEnabled: true,
    realTimeProcessing: true,
    processingInterval: 5,
    alertThresholds: {
      multipleFaces: 1,
      lookAwayDuration: 10,
      suspiciousBehaviorScore: 70,
      audioAnomalyScore: 60
    },
    recordingRetentionDays: 30,
    compressRecordings: true,
    encryptRecordings: true,
    uploadToCloud: false,
    blurBackground: false,
    anonymizeFaces: false,
    audioTranscriptionEnabled: false,
    dataMinimization: true
  };
  
  const session = new this({
    sessionId,
    userId,
    assessmentId,
    lockdownSessionId,
    config: { ...defaultConfig, ...config },
    deviceCapabilities,
    status: 'initializing'
  });
  
  return session.save();
};

export const WebcamMonitoringSession = mongoose.model<IWebcamMonitoringSession>(
  'WebcamMonitoringSession', 
  webcamMonitoringSchema
);