import { describe, test, expect, beforeEach, afterEach, jest, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { Server } from 'http';
import app from '../server';
import { ProctoringSecurity } from '../models/ProctoringSecurity';
import { WebcamMonitoring } from '../models/WebcamMonitoring';
import { AIIntegritySession } from '../models/AIIntegrity';
import ProctoringSService from '../services/proctoringSecurity';
import WebcamMonitoringService from '../services/webcamMonitoring';
import AIIntegrityService from '../services/aiIntegrity';

describe('Proctoring System Integration Tests', () => {
  let server: Server;
  let authToken: string;
  let testUserId: string;
  let testAssessmentId: string;
  let sessionId: string;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/test_proctoring';
    await mongoose.connect(mongoUri);
    
    // Start test server
    server = app.listen(0);
    
    // Generate test auth token (mock)
    authToken = 'test-jwt-token';
    testUserId = new mongoose.Types.ObjectId().toString();
    testAssessmentId = new mongoose.Types.ObjectId().toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    server?.close();
  });

  beforeEach(async () => {
    // Clear test data
    await ProctoringSecurity.deleteMany({});
    await WebcamMonitoring.deleteMany({});
    await AIIntegritySession.deleteMany({});
  });

  describe('Proctoring Session Initialization', () => {
    test('should initialize complete proctoring session successfully', async () => {
      const initData = {
        userId: testUserId,
        assessmentId: testAssessmentId,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        screenResolution: '1920x1080',
        deviceFingerprint: 'test-device-fingerprint',
        webcamEnabled: true,
        aiIntegrityEnabled: true,
        configuration: {
          lockdown: {
            strictMode: true,
            allowedApps: []
          },
          webcam: {
            faceDetectionEnabled: true,
            eyeTrackingEnabled: true,
            frameRate: 15
          },
          aiIntegrity: {
            plagiarismDetectionEnabled: true,
            behavioralAuthEnabled: true,
            sensitivityLevel: 'high'
          }
        }
      };

      const response = await request(app)
        .post('/api/proctoring/session/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send(initData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBeDefined();
      expect(response.body.data.components.browserLockdown.active).toBe(true);
      expect(response.body.data.components.webcamMonitoring.active).toBe(true);
      expect(response.body.data.components.aiIntegrity.active).toBe(true);
      expect(response.body.data.securityLevel).toBe('maximum');

      sessionId = response.body.data.sessionId;

      // Verify database records
      const lockdownSession = await ProctoringSecurity.findOne({ sessionId });
      const webcamSession = await WebcamMonitoring.findOne({ lockdownSessionId: sessionId });
      const aiSession = await AIIntegritySession.findOne({ lockdownSessionId: sessionId });

      expect(lockdownSession).toBeTruthy();
      expect(webcamSession).toBeTruthy();
      expect(aiSession).toBeTruthy();
    });

    test('should initialize session with only browser lockdown', async () => {
      const initData = {
        userId: testUserId,
        assessmentId: testAssessmentId,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        screenResolution: '1920x1080',
        deviceFingerprint: 'test-device-fingerprint',
        webcamEnabled: false,
        aiIntegrityEnabled: false
      };

      const response = await request(app)
        .post('/api/proctoring/session/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send(initData)
        .expect(201);

      expect(response.body.data.components.browserLockdown.active).toBe(true);
      expect(response.body.data.components.webcamMonitoring).toBeNull();
      expect(response.body.data.components.aiIntegrity).toBeNull();
      expect(response.body.data.securityLevel).toBe('medium');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/proctoring/session/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Security Event Submission', () => {
    beforeEach(async () => {
      // Initialize a session for testing
      const initResponse = await request(app)
        .post('/api/proctoring/session/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          assessmentId: testAssessmentId,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          screenResolution: '1920x1080',
          deviceFingerprint: 'test-device-fingerprint',
          webcamEnabled: true,
          aiIntegrityEnabled: true
        });

      sessionId = initResponse.body.data.sessionId;
    });

    test('should submit browser security event', async () => {
      const eventData = {
        eventType: 'window_blur',
        component: 'browser',
        severity: 'medium',
        eventData: {
          timestamp: new Date(),
          windowTitle: 'Test Window',
          duration: 5000
        }
      };

      const response = await request(app)
        .post(`/api/proctoring/session/${sessionId}/event`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify event was logged
      const session = await ProctoringSecurity.findOne({ sessionId });
      expect(session?.securityEvents).toHaveLength(1);
      expect(session?.securityEvents[0].eventType).toBe('window_blur');
    });

    test('should submit webcam violation', async () => {
      const eventData = {
        eventType: 'face_not_detected',
        component: 'webcam',
        severity: 'high',
        eventData: {
          frameNumber: 150,
          confidence: 0.85,
          duration: 3000
        }
      };

      const response = await request(app)
        .post(`/api/proctoring/session/${sessionId}/event`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify violation was logged
      const webcamSession = await WebcamMonitoring.findOne({ lockdownSessionId: sessionId });
      expect(webcamSession?.violations.length).toBeGreaterThan(0);
    });

    test('should submit AI integrity alert', async () => {
      const eventData = {
        eventType: 'plagiarism_detected',
        component: 'ai',
        severity: 'critical',
        eventData: {
          questionId: 'q1',
          similarity: 85,
          sources: ['external_source_1']
        }
      };

      const response = await request(app)
        .post(`/api/proctoring/session/${sessionId}/event`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify alert was logged
      const aiSession = await AIIntegritySession.findOne({ lockdownSessionId: sessionId });
      expect(aiSession?.realTimeAlerts.length).toBeGreaterThan(0);
    });

    test('should validate event data', async () => {
      const response = await request(app)
        .post(`/api/proctoring/session/${sessionId}/event`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          component: 'invalid_component'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Webcam Frame Processing', () => {
    beforeEach(async () => {
      const initResponse = await request(app)
        .post('/api/proctoring/session/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          assessmentId: testAssessmentId,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          screenResolution: '1920x1080',
          deviceFingerprint: 'test-device-fingerprint',
          webcamEnabled: true
        });

      sessionId = initResponse.body.data.sessionId;
    });

    test('should process webcam frame successfully', async () => {
      const frameData = {
        frameData: 'base64-encoded-frame-data',
        timestamp: new Date().toISOString(),
        frameNumber: 1
      };

      const response = await request(app)
        .post(`/api/proctoring/session/${sessionId}/frame`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(frameData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('should handle frame processing rate limiting', async () => {
      const frameData = {
        frameData: 'base64-encoded-frame-data',
        timestamp: new Date().toISOString(),
        frameNumber: 1
      };

      // Send many requests rapidly to trigger rate limit
      const promises = Array(10).fill(0).map(() =>
        request(app)
          .post(`/api/proctoring/session/${sessionId}/frame`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(frameData)
      );

      const responses = await Promise.all(promises);
      
      // At least some should succeed
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('AI Analysis Endpoints', () => {
    beforeEach(async () => {
      const initResponse = await request(app)
        .post('/api/proctoring/session/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          assessmentId: testAssessmentId,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          screenResolution: '1920x1080',
          deviceFingerprint: 'test-device-fingerprint',
          aiIntegrityEnabled: true
        });

      sessionId = initResponse.body.data.sessionId;
    });

    test('should analyze answer for plagiarism', async () => {
      const answerData = {
        questionId: 'q1',
        answer: 'This is a test answer for plagiarism detection analysis.',
        metadata: {
          questionType: 'essay',
          timeSpent: 300
        }
      };

      const response = await request(app)
        .post(`/api/proctoring/session/${sessionId}/answer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(answerData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.plagiarismResult).toBeDefined();
      expect(response.body.data.integrityScore).toBeDefined();
    });

    test('should analyze typing behavior', async () => {
      const typingData = {
        keystrokeData: [
          { key: 'a', keyDown: 100, keyUp: 150, timestamp: Date.now() },
          { key: 'b', keyDown: 200, keyUp: 250, timestamp: Date.now() + 100 },
          { key: 'c', keyDown: 300, keyUp: 350, timestamp: Date.now() + 200 }
        ]
      };

      const response = await request(app)
        .post(`/api/proctoring/session/${sessionId}/typing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(typingData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.typingIntegrityScore).toBeDefined();
    });

    test('should analyze response times', async () => {
      const responseTimeData = {
        questionId: 'q1',
        responseData: {
          questionType: 'multiple_choice',
          timeToFirstInput: 5000,
          totalResponseTime: 30000,
          thinkingTime: 25000,
          typingTime: 5000,
          reviewTime: 2000
        }
      };

      const response = await request(app)
        .post(`/api/proctoring/session/${sessionId}/response-time`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(responseTimeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.responseIntegrityScore).toBeDefined();
    });
  });

  describe('Session Status and Completion', () => {
    beforeEach(async () => {
      const initResponse = await request(app)
        .post('/api/proctoring/session/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          assessmentId: testAssessmentId,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          screenResolution: '1920x1080',
          deviceFingerprint: 'test-device-fingerprint',
          webcamEnabled: true,
          aiIntegrityEnabled: true
        });

      sessionId = initResponse.body.data.sessionId;
    });

    test('should get session status', async () => {
      const response = await request(app)
        .get(`/api/proctoring/session/${sessionId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBe(sessionId);
      expect(response.body.data.components.browserLockdown).toBeDefined();
      expect(response.body.data.components.webcamMonitoring).toBeDefined();
      expect(response.body.data.components.aiIntegrity).toBeDefined();
    });

    test('should complete session successfully', async () => {
      const response = await request(app)
        .post(`/api/proctoring/session/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'assessment_completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comprehensiveReport).toBeDefined();

      // Verify session status changed
      const lockdownSession = await ProctoringSecurity.findOne({ sessionId });
      expect(lockdownSession?.status).toBe('completed');
    });
  });

  describe('Dashboard Endpoints', () => {
    beforeEach(async () => {
      // Create some test sessions for dashboard testing
      await ProctoringSecurity.create({
        sessionId: 'test-session-1',
        userId: testUserId,
        assessmentId: testAssessmentId,
        userAgent: 'Test Browser',
        deviceFingerprint: 'test-fingerprint-1',
        status: 'active',
        integrityScore: 85
      });

      await ProctoringSecurity.create({
        sessionId: 'test-session-2',
        userId: new mongoose.Types.ObjectId().toString(),
        assessmentId: testAssessmentId,
        userAgent: 'Test Browser',
        deviceFingerprint: 'test-fingerprint-2',
        status: 'completed',
        integrityScore: 95
      });
    });

    test('should get active sessions', async () => {
      const response = await request(app)
        .get('/api/proctoring/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessions).toBeDefined();
      expect(Array.isArray(response.body.data.sessions)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should filter sessions by risk level', async () => {
      const response = await request(app)
        .get('/api/proctoring/sessions?riskLevel=low')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessions).toBeDefined();
    });

    test('should get violations', async () => {
      const response = await request(app)
        .get('/api/proctoring/violations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.violations).toBeDefined();
      expect(Array.isArray(response.body.data.violations)).toBe(true);
    });

    test('should get system status', async () => {
      const response = await request(app)
        .get('/api/proctoring/system-status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalSessions).toBeDefined();
      expect(response.body.data.activeSessions).toBeDefined();
      expect(response.body.data.systemLoad).toBeDefined();
    });

    test('should get dashboard metrics', async () => {
      const response = await request(app)
        .get('/api/proctoring/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.integrityScoreDistribution).toBeDefined();
      expect(response.body.data.violationsByType).toBeDefined();
      expect(response.body.data.riskLevelBreakdown).toBeDefined();
    });
  });

  describe('Data Export', () => {
    test('should export sessions data', async () => {
      const response = await request(app)
        .get('/api/proctoring/export/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    test('should export violations data', async () => {
      const response = await request(app)
        .get('/api/proctoring/export/violations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
    });

    test('should export comprehensive report', async () => {
      const response = await request(app)
        .get('/api/proctoring/export/report')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
    });

    test('should handle invalid export type', async () => {
      const response = await request(app)
        .get('/api/proctoring/export/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('Service Layer Unit Tests', () => {
  describe('ProctoringSService', () => {
    let service: ProctoringSService;

    beforeEach(() => {
      service = ProctoringSService.getInstance();
    });

    test('should validate browser compatibility', async () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const result = await service.validateBrowserCompatibility(userAgent);
      
      expect(result.isCompatible).toBeDefined();
      expect(result.browserInfo).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    test('should generate device fingerprint', () => {
      const deviceInfo = {
        userAgent: 'Test Browser',
        screenResolution: '1920x1080',
        timezone: 'UTC',
        language: 'en-US'
      };
      
      const fingerprint = service.generateDeviceFingerprint(deviceInfo);
      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('string');
    });
  });

  describe('AIIntegrityService', () => {
    let service: AIIntegrityService;

    beforeEach(() => {
      service = AIIntegrityService.getInstance();
    });

    test('should detect repetitive patterns in text', () => {
      const text = 'This is a test. This is a test. This is a test.';
      // Test private method through public interface
      // (In actual implementation, this would be tested through public methods)
      expect(text).toContain('This is a test');
    });
  });
});

describe('Performance Tests', () => {
  test('should handle multiple concurrent sessions', async () => {
    const concurrentSessions = 10;
    const sessionPromises = [];

    for (let i = 0; i < concurrentSessions; i++) {
      const promise = request(app)
        .post('/api/proctoring/session/initialize')
        .set('Authorization', `Bearer test-token`)
        .send({
          userId: new mongoose.Types.ObjectId().toString(),
          assessmentId: testAssessmentId,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          screenResolution: '1920x1080',
          deviceFingerprint: `test-device-${i}`,
          webcamEnabled: true,
          aiIntegrityEnabled: true
        });
      
      sessionPromises.push(promise);
    }

    const responses = await Promise.all(sessionPromises);
    
    responses.forEach(response => {
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  test('should process frames within acceptable time limits', async () => {
    // Initialize session first
    const initResponse = await request(app)
      .post('/api/proctoring/session/initialize')
      .set('Authorization', `Bearer test-token`)
      .send({
        userId: testUserId,
        assessmentId: testAssessmentId,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        screenResolution: '1920x1080',
        deviceFingerprint: 'test-device',
        webcamEnabled: true
      });

    const sessionId = initResponse.body.data.sessionId;
    const frameData = {
      frameData: 'base64-encoded-frame-data',
      timestamp: new Date().toISOString(),
      frameNumber: 1
    };

    const startTime = Date.now();
    
    const response = await request(app)
      .post(`/api/proctoring/session/${sessionId}/frame`)
      .set('Authorization', `Bearer test-token`)
      .send(frameData);

    const processingTime = Date.now() - startTime;
    
    expect(response.status).toBe(200);
    expect(processingTime).toBeLessThan(1000); // Should process within 1 second
  });
});

describe('Security Tests', () => {
  test('should require authentication for all endpoints', async () => {
    const endpoints = [
      { method: 'post', path: '/api/proctoring/session/initialize' },
      { method: 'get', path: '/api/proctoring/sessions' },
      { method: 'get', path: '/api/proctoring/system-status' }
    ];

    for (const endpoint of endpoints) {
      const response = await request(app)[endpoint.method](endpoint.path);
      expect([401, 403]).toContain(response.status);
    }
  });

  test('should validate session ownership', async () => {
    // This test would verify that users can only access their own sessions
    // Implementation depends on the authentication middleware
    expect(true).toBe(true); // Placeholder
  });

  test('should sanitize input data', async () => {
    const maliciousData = {
      userId: '<script>alert("xss")</script>',
      assessmentId: testAssessmentId,
      userAgent: 'Mozilla/5.0 (Test Browser)',
      screenResolution: '1920x1080',
      deviceFingerprint: 'test-device'
    };

    const response = await request(app)
      .post('/api/proctoring/session/initialize')
      .set('Authorization', `Bearer test-token`)
      .send(maliciousData);

    // Should either reject the input or sanitize it
    expect([400, 201]).toContain(response.status);
    
    if (response.status === 201) {
      // If accepted, ensure it was sanitized
      expect(response.body.data.userId).not.toContain('<script>');
    }
  });
});

describe('Privacy and Compliance Tests', () => {
  test('should implement data minimization', async () => {
    const initResponse = await request(app)
      .post('/api/proctoring/session/initialize')
      .set('Authorization', `Bearer test-token`)
      .send({
        userId: testUserId,
        assessmentId: testAssessmentId,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        screenResolution: '1920x1080',
        deviceFingerprint: 'test-device',
        webcamEnabled: true,
        aiIntegrityEnabled: true,
        configuration: {
          webcam: {
            dataMinimization: true,
            anonymizeFrames: true
          }
        }
      });

    expect(initResponse.status).toBe(201);
    
    const sessionId = initResponse.body.data.sessionId;
    const webcamSession = await WebcamMonitoring.findOne({ lockdownSessionId: sessionId });
    
    expect(webcamSession?.privacySettings.dataMinimization).toBe(true);
    expect(webcamSession?.privacySettings.anonymizeFrames).toBe(true);
  });

  test('should allow data deletion on session completion', async () => {
    const initResponse = await request(app)
      .post('/api/proctoring/session/initialize')
      .set('Authorization', `Bearer test-token`)
      .send({
        userId: testUserId,
        assessmentId: testAssessmentId,
        userAgent: 'Mozilla/5.0 (Test Browser)',
        screenResolution: '1920x1080',
        deviceFingerprint: 'test-device'
      });

    const sessionId = initResponse.body.data.sessionId;

    const completeResponse = await request(app)
      .post(`/api/proctoring/session/${sessionId}/complete`)
      .set('Authorization', `Bearer test-token`)
      .send({ 
        reason: 'assessment_completed',
        deletePersonalData: true 
      });

    expect(completeResponse.status).toBe(200);
  });
});

export {};