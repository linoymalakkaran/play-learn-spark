import mongoose, { Document, Schema } from 'mongoose';

// Plagiarism Detection Result Interface
export interface IPlagiarismDetectionResult {
  overallSimilarity: number; // 0-100%
  suspiciousSegments: {
    text: string;
    startIndex: number;
    endIndex: number;
    similarity: number;
    possibleSources: {
      source: string;
      url?: string;
      similarity: number;
      confidence: number;
    }[];
  }[];
  externalMatches: {
    source: string;
    url: string;
    matchedText: string;
    similarity: number;
    reliability: 'high' | 'medium' | 'low';
  }[];
  internalMatches: {
    userId: string;
    assessmentId: string;
    questionId: string;
    matchedText: string;
    similarity: number;
    timestamp: Date;
  }[];
  aiGeneratedProbability: number; // 0-100%
  languageFingerprint: {
    complexity: number;
    vocabulary: number;
    sentiment: number;
    writingStyle: string;
  };
}

// Typing Behavior Analysis Interface
export interface ITypingBehaviorAnalysis {
  keystrokeDynamics: {
    averageKeyPressTime: number;
    averageKeyReleaseTime: number;
    averageDwellTime: number;
    averageFlightTime: number;
    typingRhythm: number[];
    pausePatterns: {
      shortPauses: number; // <2 seconds
      mediumPauses: number; // 2-10 seconds
      longPauses: number; // >10 seconds
    };
  };
  typingSpeed: {
    wordsPerMinute: number;
    charactersPerMinute: number;
    accuracy: number;
    consistency: number;
  };
  typingPattern: {
    backspaceFrequency: number;
    correctionRate: number;
    deletionPatterns: string[];
    insertionPatterns: string[];
  };
  behavioralSignatures: {
    fingerprint: string;
    confidence: number;
    uniqueness: number;
    stability: number;
  };
  anomalies: {
    speedAnomalies: number[];
    rhythmAnomalies: number[];
    patternAnomalies: number[];
    suspicionScore: number;
  };
}

// Response Time Analysis Interface
export interface IResponseTimeAnalysis {
  questionResponseTimes: {
    questionId: string;
    questionType: string;
    timeToFirstInput: number;
    totalResponseTime: number;
    thinkingTime: number;
    typingTime: number;
    reviewTime: number;
  }[];
  overallPatterns: {
    averageResponseTime: number;
    medianResponseTime: number;
    standardDeviation: number;
    outliers: number[];
  };
  difficultyTimeCorrelation: {
    easyQuestions: number;
    mediumQuestions: number;
    hardQuestions: number;
    correlationCoefficient: number;
  };
  timeAnomalies: {
    tooFast: number; // responses that are suspiciously quick
    tooSlow: number; // responses that are suspiciously slow
    inconsistent: number; // responses with inconsistent timing
    suspicious: number; // overall suspicious timing patterns
  };
  predictedTimes: {
    questionId: string;
    predicted: number;
    actual: number;
    deviation: number;
  }[];
}

// Answer Pattern Analysis Interface
export interface IAnswerPatternAnalysis {
  similarityToOthers: {
    userId: string;
    similarity: number;
    matchingAnswers: number;
    suspiciousPatterns: string[];
  }[];
  answerProgression: {
    difficultyProgression: number; // how well answers match expected difficulty curve
    knowledgeConsistency: number; // consistency of knowledge demonstration
    logicalFlow: number; // logical progression in answers
  };
  contentAnalysis: {
    vocabularyLevel: number;
    grammarQuality: number;
    writingStyle: string;
    knowledgeDepth: number;
    technicalAccuracy: number;
  };
  suspiciousPatterns: {
    identicalPhrasing: number;
    unusualKnowledge: number;
    inconsistentAbility: number;
    templatedResponses: number;
  };
  collaborationIndicators: {
    sharedAnswers: number;
    synchronizedSubmissions: number;
    similarErrorPatterns: number;
    communicationEvidence: number;
  };
}

// Behavioral Authentication Interface
export interface IBehavioralAuthentication {
  mouseMovementPattern: {
    averageSpeed: number;
    acceleration: number;
    jerk: number; // rate of change of acceleration
    trajectoryPattern: string;
    clickPatterns: {
      singleClicks: number;
      doubleClicks: number;
      dragOperations: number;
      scrollBehavior: number;
    };
  };
  navigationBehavior: {
    pageNavigation: string[];
    backtrackingFrequency: number;
    timePerQuestion: number[];
    reviewPatterns: string[];
  };
  cognitiveLoad: {
    pauseBeforeAnswering: number;
    changeOfMind: number; // answer modifications
    uncertaintyIndicators: number;
    confidenceLevel: number;
  };
  environmentalFactors: {
    timeOfDay: string;
    deviceUsed: string;
    locationConsistency: number;
    networkStability: number;
  };
  authenticityScore: number; // 0-100%
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// AI Integrity Session Interface
export interface IAIIntegritySession extends Document {
  sessionId: string;
  userId: string;
  assessmentId: string;
  lockdownSessionId: string;
  webcamSessionId?: string;
  
  // Configuration
  config: {
    plagiarismDetectionEnabled: boolean;
    typingAnalysisEnabled: boolean;
    responseTimeAnalysisEnabled: boolean;
    answerPatternAnalysisEnabled: boolean;
    behavioralAuthEnabled: boolean;
    aiModelVersion: string;
    sensitivityLevel: 'low' | 'medium' | 'high' | 'maximum';
    realTimeProcessing: boolean;
    batchProcessing: boolean;
  };
  
  status: 'initializing' | 'active' | 'processing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  
  // Analysis Results
  plagiarismResults: {
    [questionId: string]: IPlagiarismDetectionResult;
  };
  
  typingAnalysis: ITypingBehaviorAnalysis;
  responseTimeAnalysis: IResponseTimeAnalysis;
  answerPatternAnalysis: IAnswerPatternAnalysis;
  behavioralAuth: IBehavioralAuthentication;
  
  // Real-time Monitoring
  realTimeAlerts: {
    timestamp: Date;
    type: 'plagiarism' | 'typing_anomaly' | 'time_anomaly' | 'pattern_anomaly' | 'behavioral_anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    details: any;
    handled: boolean;
    response?: string;
  }[];
  
  // AI Models Used
  modelsUsed: {
    plagiarismModel: {
      name: string;
      version: string;
      accuracy: number;
      trainingDate: Date;
    };
    behaviorModel: {
      name: string;
      version: string;
      accuracy: number;
      trainingDate: Date;
    };
    anomalyModel: {
      name: string;
      version: string;
      accuracy: number;
      trainingDate: Date;
    };
  };
  
  // Processing Performance
  processingMetrics: {
    plagiarismProcessingTime: number;
    typingAnalysisTime: number;
    responseAnalysisTime: number;
    patternAnalysisTime: number;
    totalProcessingTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  
  // Integrity Scores
  integrityScores: {
    plagiarismScore: number; // 0-100, lower is more suspicious
    typingIntegrityScore: number;
    responseIntegrityScore: number;
    patternIntegrityScore: number;
    behavioralIntegrityScore: number;
    overallIntegrityScore: number;
    confidenceLevel: number;
  };
  
  // Risk Assessment
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    mitigatingFactors: string[];
    recommendedAction: 'approve' | 'review' | 'investigate' | 'reject';
    confidence: number;
    reasoning: string;
  };
  
  // Training Data Contribution
  trainingContribution: {
    contributesToTraining: boolean;
    dataQuality: number;
    labelAccuracy: number;
    usedForModelImprovement: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// AI Integrity Schema
const aiIntegritySchema = new Schema<IAIIntegritySession>({
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
  webcamSessionId: {
    type: String,
    index: true
  },
  
  config: {
    plagiarismDetectionEnabled: { type: Boolean, default: true },
    typingAnalysisEnabled: { type: Boolean, default: true },
    responseTimeAnalysisEnabled: { type: Boolean, default: true },
    answerPatternAnalysisEnabled: { type: Boolean, default: true },
    behavioralAuthEnabled: { type: Boolean, default: true },
    aiModelVersion: { type: String, default: '1.0.0' },
    sensitivityLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'maximum'],
      default: 'medium'
    },
    realTimeProcessing: { type: Boolean, default: true },
    batchProcessing: { type: Boolean, default: false }
  },
  
  status: {
    type: String,
    enum: ['initializing', 'active', 'processing', 'completed', 'failed'],
    default: 'initializing'
  },
  
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  
  plagiarismResults: {
    type: Map,
    of: Schema.Types.Mixed
  },
  
  typingAnalysis: {
    keystrokeDynamics: {
      averageKeyPressTime: Number,
      averageKeyReleaseTime: Number,
      averageDwellTime: Number,
      averageFlightTime: Number,
      typingRhythm: [Number],
      pausePatterns: {
        shortPauses: Number,
        mediumPauses: Number,
        longPauses: Number
      }
    },
    typingSpeed: {
      wordsPerMinute: Number,
      charactersPerMinute: Number,
      accuracy: Number,
      consistency: Number
    },
    typingPattern: {
      backspaceFrequency: Number,
      correctionRate: Number,
      deletionPatterns: [String],
      insertionPatterns: [String]
    },
    behavioralSignatures: {
      fingerprint: String,
      confidence: Number,
      uniqueness: Number,
      stability: Number
    },
    anomalies: {
      speedAnomalies: [Number],
      rhythmAnomalies: [Number],
      patternAnomalies: [Number],
      suspicionScore: Number
    }
  },
  
  responseTimeAnalysis: {
    questionResponseTimes: [{
      questionId: String,
      questionType: String,
      timeToFirstInput: Number,
      totalResponseTime: Number,
      thinkingTime: Number,
      typingTime: Number,
      reviewTime: Number
    }],
    overallPatterns: {
      averageResponseTime: Number,
      medianResponseTime: Number,
      standardDeviation: Number,
      outliers: [Number]
    },
    difficultyTimeCorrelation: {
      easyQuestions: Number,
      mediumQuestions: Number,
      hardQuestions: Number,
      correlationCoefficient: Number
    },
    timeAnomalies: {
      tooFast: Number,
      tooSlow: Number,
      inconsistent: Number,
      suspicious: Number
    },
    predictedTimes: [{
      questionId: String,
      predicted: Number,
      actual: Number,
      deviation: Number
    }]
  },
  
  answerPatternAnalysis: {
    similarityToOthers: [{
      userId: String,
      similarity: Number,
      matchingAnswers: Number,
      suspiciousPatterns: [String]
    }],
    answerProgression: {
      difficultyProgression: Number,
      knowledgeConsistency: Number,
      logicalFlow: Number
    },
    contentAnalysis: {
      vocabularyLevel: Number,
      grammarQuality: Number,
      writingStyle: String,
      knowledgeDepth: Number,
      technicalAccuracy: Number
    },
    suspiciousPatterns: {
      identicalPhrasing: Number,
      unusualKnowledge: Number,
      inconsistentAbility: Number,
      templatedResponses: Number
    },
    collaborationIndicators: {
      sharedAnswers: Number,
      synchronizedSubmissions: Number,
      similarErrorPatterns: Number,
      communicationEvidence: Number
    }
  },
  
  behavioralAuth: {
    mouseMovementPattern: {
      averageSpeed: Number,
      acceleration: Number,
      jerk: Number,
      trajectoryPattern: String,
      clickPatterns: {
        singleClicks: Number,
        doubleClicks: Number,
        dragOperations: Number,
        scrollBehavior: Number
      }
    },
    navigationBehavior: {
      pageNavigation: [String],
      backtrackingFrequency: Number,
      timePerQuestion: [Number],
      reviewPatterns: [String]
    },
    cognitiveLoad: {
      pauseBeforeAnswering: Number,
      changeOfMind: Number,
      uncertaintyIndicators: Number,
      confidenceLevel: Number
    },
    environmentalFactors: {
      timeOfDay: String,
      deviceUsed: String,
      locationConsistency: Number,
      networkStability: Number
    },
    authenticityScore: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    }
  },
  
  realTimeAlerts: [{
    timestamp: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['plagiarism', 'typing_anomaly', 'time_anomaly', 'pattern_anomaly', 'behavioral_anomaly'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    confidence: { type: Number, required: true },
    details: Schema.Types.Mixed,
    handled: { type: Boolean, default: false },
    response: String
  }],
  
  modelsUsed: {
    plagiarismModel: {
      name: String,
      version: String,
      accuracy: Number,
      trainingDate: Date
    },
    behaviorModel: {
      name: String,
      version: String,
      accuracy: Number,
      trainingDate: Date
    },
    anomalyModel: {
      name: String,
      version: String,
      accuracy: Number,
      trainingDate: Date
    }
  },
  
  processingMetrics: {
    plagiarismProcessingTime: { type: Number, default: 0 },
    typingAnalysisTime: { type: Number, default: 0 },
    responseAnalysisTime: { type: Number, default: 0 },
    patternAnalysisTime: { type: Number, default: 0 },
    totalProcessingTime: { type: Number, default: 0 },
    memoryUsage: { type: Number, default: 0 },
    cpuUsage: { type: Number, default: 0 }
  },
  
  integrityScores: {
    plagiarismScore: { type: Number, default: 100 },
    typingIntegrityScore: { type: Number, default: 100 },
    responseIntegrityScore: { type: Number, default: 100 },
    patternIntegrityScore: { type: Number, default: 100 },
    behavioralIntegrityScore: { type: Number, default: 100 },
    overallIntegrityScore: { type: Number, default: 100 },
    confidenceLevel: { type: Number, default: 95 }
  },
  
  riskAssessment: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    riskFactors: [String],
    mitigatingFactors: [String],
    recommendedAction: {
      type: String,
      enum: ['approve', 'review', 'investigate', 'reject'],
      default: 'approve'
    },
    confidence: { type: Number, default: 95 },
    reasoning: String
  },
  
  trainingContribution: {
    contributesToTraining: { type: Boolean, default: false },
    dataQuality: { type: Number, default: 0 },
    labelAccuracy: { type: Number, default: 0 },
    usedForModelImprovement: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  collection: 'ai_integrity_sessions'
});

// Indexes for performance
aiIntegritySchema.index({ sessionId: 1, userId: 1 });
aiIntegritySchema.index({ assessmentId: 1, status: 1 });
aiIntegritySchema.index({ userId: 1, createdAt: -1 });
aiIntegritySchema.index({ 'integrityScores.overallIntegrityScore': -1 });
aiIntegritySchema.index({ 'riskAssessment.riskLevel': 1, createdAt: -1 });
aiIntegritySchema.index({ 'realTimeAlerts.type': 1, 'realTimeAlerts.timestamp': -1 });

// Instance methods
aiIntegritySchema.methods.addRealTimeAlert = function(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  confidence: number,
  details: any
) {
  const alert = {
    timestamp: new Date(),
    type,
    severity,
    confidence,
    details,
    handled: false
  };
  
  this.realTimeAlerts.push(alert);
  
  // Update risk level based on alert severity
  if (severity === 'critical' && this.riskAssessment.riskLevel !== 'critical') {
    this.riskAssessment.riskLevel = 'critical';
    this.riskAssessment.riskFactors.push(`Critical ${type} alert detected`);
  } else if (severity === 'high' && this.riskAssessment.riskLevel === 'low') {
    this.riskAssessment.riskLevel = 'high';
    this.riskAssessment.riskFactors.push(`High severity ${type} alert detected`);
  }
  
  return this.save();
};

aiIntegritySchema.methods.updateIntegrityScores = function(scores: Partial<any>) {
  // Update individual scores
  Object.assign(this.integrityScores, scores);
  
  // Calculate overall integrity score
  const weights = {
    plagiarismScore: 0.3,
    typingIntegrityScore: 0.2,
    responseIntegrityScore: 0.2,
    patternIntegrityScore: 0.2,
    behavioralIntegrityScore: 0.1
  };
  
  this.integrityScores.overallIntegrityScore = Math.round(
    (this.integrityScores.plagiarismScore * weights.plagiarismScore) +
    (this.integrityScores.typingIntegrityScore * weights.typingIntegrityScore) +
    (this.integrityScores.responseIntegrityScore * weights.responseIntegrityScore) +
    (this.integrityScores.patternIntegrityScore * weights.patternIntegrityScore) +
    (this.integrityScores.behavioralIntegrityScore * weights.behavioralIntegrityScore)
  );
  
  // Update risk assessment based on overall score
  if (this.integrityScores.overallIntegrityScore < 30) {
    this.riskAssessment.riskLevel = 'critical';
    this.riskAssessment.recommendedAction = 'reject';
  } else if (this.integrityScores.overallIntegrityScore < 60) {
    this.riskAssessment.riskLevel = 'high';
    this.riskAssessment.recommendedAction = 'investigate';
  } else if (this.integrityScores.overallIntegrityScore < 80) {
    this.riskAssessment.riskLevel = 'medium';
    this.riskAssessment.recommendedAction = 'review';
  }
  
  return this.save();
};

aiIntegritySchema.methods.generateIntegrityReport = function() {
  const duration = this.endTime 
    ? this.endTime.getTime() - this.startTime.getTime()
    : Date.now() - this.startTime.getTime();
  
  const alertsByType = this.realTimeAlerts.reduce((acc: Record<string, number>, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});
  
  const alertsBySeverity = this.realTimeAlerts.reduce((acc: Record<string, number>, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1;
    return acc;
  }, {});
  
  return {
    sessionId: this.sessionId,
    userId: this.userId,
    assessmentId: this.assessmentId,
    duration: Math.round(duration / 1000), // seconds
    status: this.status,
    integrityScores: this.integrityScores,
    riskAssessment: this.riskAssessment,
    totalAlerts: this.realTimeAlerts.length,
    alertsByType,
    alertsBySeverity,
    processingMetrics: this.processingMetrics,
    modelsUsed: this.modelsUsed,
    recommendations: this.generateRecommendations()
  };
};

aiIntegritySchema.methods.generateRecommendations = function() {
  const recommendations: string[] = [];
  
  if (this.integrityScores.plagiarismScore < 70) {
    recommendations.push('High plagiarism risk detected - manual review required');
  }
  
  if (this.integrityScores.typingIntegrityScore < 70) {
    recommendations.push('Typing behavior anomalies detected - verify user identity');
  }
  
  if (this.integrityScores.responseIntegrityScore < 70) {
    recommendations.push('Response time patterns are suspicious - investigate further');
  }
  
  if (this.integrityScores.patternIntegrityScore < 70) {
    recommendations.push('Answer patterns indicate possible collaboration or cheating');
  }
  
  if (this.integrityScores.behavioralIntegrityScore < 70) {
    recommendations.push('Behavioral authentication failed - user may not be authentic');
  }
  
  if (this.realTimeAlerts.filter(alert => alert.severity === 'critical').length > 0) {
    recommendations.push('Critical security alerts detected - immediate investigation required');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Assessment shows good integrity compliance');
  }
  
  return recommendations;
};

// Static methods
aiIntegritySchema.statics.createIntegritySession = async function(
  sessionId: string,
  userId: string,
  assessmentId: string,
  lockdownSessionId: string,
  webcamSessionId?: string,
  config?: any
) {
  const defaultConfig = {
    plagiarismDetectionEnabled: true,
    typingAnalysisEnabled: true,
    responseTimeAnalysisEnabled: true,
    answerPatternAnalysisEnabled: true,
    behavioralAuthEnabled: true,
    aiModelVersion: '1.0.0',
    sensitivityLevel: 'medium',
    realTimeProcessing: true,
    batchProcessing: false
  };
  
  const session = new this({
    sessionId,
    userId,
    assessmentId,
    lockdownSessionId,
    webcamSessionId,
    config: { ...defaultConfig, ...config },
    status: 'initializing',
    modelsUsed: {
      plagiarismModel: {
        name: 'PlagiarismDetector-v1',
        version: '1.0.0',
        accuracy: 0.95,
        trainingDate: new Date('2024-01-01')
      },
      behaviorModel: {
        name: 'BehaviorAnalyzer-v1',
        version: '1.0.0',
        accuracy: 0.92,
        trainingDate: new Date('2024-01-01')
      },
      anomalyModel: {
        name: 'AnomalyDetector-v1',
        version: '1.0.0',
        accuracy: 0.88,
        trainingDate: new Date('2024-01-01')
      }
    }
  });
  
  return session.save();
};

export const AIIntegritySession = mongoose.model<IAIIntegritySession>(
  'AIIntegritySession', 
  aiIntegritySchema
);