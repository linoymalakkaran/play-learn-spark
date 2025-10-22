import { performance } from 'perf_hooks';
import mongoose from 'mongoose';
import { ProctoringSecurity } from '../models/ProctoringSecurity';
import { WebcamMonitoring } from '../models/WebcamMonitoring';
import { AIIntegritySession } from '../models/AIIntegrity';
import { ProctoringSecurity as ProctoringSService } from '../services/proctoringSecurity';
import { WebcamMonitoringService } from '../services/webcamMonitoring';
import AIIntegrityService from '../services/aiIntegrity';

interface PerformanceMetrics {
  sessionInitialization: number;
  securityEventProcessing: number;
  frameProcessing: number;
  plagiarismDetection: number;
  typingAnalysis: number;
  memoryUsage: number;
  databaseOperations: number;
}

class ProctorPerformanceValidator {
  private proctoringSService: ProctoringSService;
  private webcamService: WebcamMonitoringService;
  private aiIntegrityService: AIIntegrityService;
  private metrics: PerformanceMetrics;

  constructor() {
    this.proctoringSService = ProctoringSService.getInstance();
    this.webcamService = WebcamMonitoringService.getInstance();
    this.aiIntegrityService = AIIntegrityService.getInstance();
    this.metrics = {
      sessionInitialization: 0,
      securityEventProcessing: 0,
      frameProcessing: 0,
      plagiarismDetection: 0,
      typingAnalysis: 0,
      memoryUsage: 0,
      databaseOperations: 0
    };
  }

  async initialize() {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/proctoring_performance';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for performance testing');
  }

  async cleanup() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  // Performance Test: Session Initialization
  async testSessionInitialization(iterations = 100): Promise<number> {
    console.log(`\n🚀 Testing Session Initialization (${iterations} iterations)...`);
    
    const startTime = performance.now();
    const promises = [];

    for (let i = 0; i < iterations; i++) {
      const userId = new mongoose.Types.ObjectId().toString();
      const assessmentId = new mongoose.Types.ObjectId().toString();
      
      const promise = this.proctoringSService.initializeSession(
        userId,
        assessmentId,
        'Mozilla/5.0 (Test Browser)',
        '1920x1080',
        `test-device-${i}`
      );
      
      promises.push(promise);
    }

    await Promise.all(promises);
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log(`✅ Session Initialization: ${avgTime.toFixed(2)}ms average, ${totalTime.toFixed(2)}ms total`);
    this.metrics.sessionInitialization = avgTime;
    
    return avgTime;
  }

  // Performance Test: Security Event Processing
  async testSecurityEventProcessing(iterations = 1000): Promise<number> {
    console.log(`\n⚠️ Testing Security Event Processing (${iterations} iterations)...`);
    
    // Create a test session first
    const session = await this.proctoringSService.initializeSession(
      new mongoose.Types.ObjectId().toString(),
      new mongoose.Types.ObjectId().toString(),
      'Mozilla/5.0 (Test Browser)',
      '1920x1080',
      'test-device-events'
    );

    const startTime = performance.now();
    const eventTypes = ['window_blur', 'tab_switch', 'fullscreen_exit', 'right_click', 'copy_attempt'];

    for (let i = 0; i < iterations; i++) {
      const eventType = eventTypes[i % eventTypes.length];
      await this.proctoringSService.logSecurityEvent(
        session.sessionId,
        eventType,
        { timestamp: new Date(), testData: `event-${i}` },
        'medium'
      );
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log(`✅ Security Event Processing: ${avgTime.toFixed(2)}ms average, ${totalTime.toFixed(2)}ms total`);
    this.metrics.securityEventProcessing = avgTime;
    
    return avgTime;
  }

  // Performance Test: Webcam Frame Processing
  async testFrameProcessing(iterations = 500): Promise<number> {
    console.log(`\n📹 Testing Webcam Frame Processing (${iterations} iterations)...`);
    
    // Create a webcam monitoring session
    const webcamSession = await this.webcamService.initializeMonitoring(
      new mongoose.Types.ObjectId().toString(),
      new mongoose.Types.ObjectId().toString(),
      'test-lockdown-session'
    );

    const startTime = performance.now();
    const mockFrameData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD'; // Mock base64 image

    for (let i = 0; i < iterations; i++) {
      await this.webcamService.processFrame(
        webcamSession.sessionId,
        mockFrameData,
        new Date(),
        i
      );
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;
    const fps = 1000 / avgTime; // Frames per second

    console.log(`✅ Frame Processing: ${avgTime.toFixed(2)}ms average, ${fps.toFixed(1)} FPS capability`);
    this.metrics.frameProcessing = avgTime;
    
    return avgTime;
  }

  // Performance Test: Plagiarism Detection
  async testPlagiarismDetection(iterations = 50): Promise<number> {
    console.log(`\n🧠 Testing Plagiarism Detection (${iterations} iterations)...`);
    
    // Create an AI integrity session
    const aiSession = await this.aiIntegrityService.initializeIntegritySession(
      'test-ai-session',
      new mongoose.Types.ObjectId().toString(),
      new mongoose.Types.ObjectId().toString(),
      'test-lockdown-session'
    );

    const testTexts = [
      'This is a comprehensive analysis of the economic factors affecting global trade.',
      'The implementation of machine learning algorithms requires careful consideration of data quality.',
      'Climate change represents one of the most significant challenges of our time.',
      'The development of sustainable energy solutions is crucial for future generations.',
      'Artificial intelligence has the potential to revolutionize healthcare diagnostics.'
    ];

    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const text = testTexts[i % testTexts.length];
      await this.aiIntegrityService.detectPlagiarism(
        aiSession.sessionId,
        `question-${i}`,
        text + ` Additional content for iteration ${i}.`
      );
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log(`✅ Plagiarism Detection: ${avgTime.toFixed(2)}ms average, ${totalTime.toFixed(2)}ms total`);
    this.metrics.plagiarismDetection = avgTime;
    
    return avgTime;
  }

  // Performance Test: Typing Behavior Analysis
  async testTypingAnalysis(iterations = 100): Promise<number> {
    console.log(`\n⌨️ Testing Typing Behavior Analysis (${iterations} iterations)...`);
    
    // Create an AI integrity session
    const aiSession = await this.aiIntegrityService.initializeIntegritySession(
      'test-typing-session',
      new mongoose.Types.ObjectId().toString(),
      new mongoose.Types.ObjectId().toString(),
      'test-lockdown-session'
    );

    const generateKeystrokeData = (length: number) => {
      const data = [];
      let timestamp = Date.now();
      
      for (let i = 0; i < length; i++) {
        data.push({
          key: String.fromCharCode(97 + (i % 26)), // a-z
          keyDown: timestamp,
          keyUp: timestamp + Math.random() * 100 + 50,
          timestamp: timestamp
        });
        timestamp += Math.random() * 200 + 100;
      }
      
      return data;
    };

    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const keystrokeData = generateKeystrokeData(50); // 50 keystrokes per analysis
      await this.aiIntegrityService.analyzeTypingBehavior(
        aiSession.sessionId,
        keystrokeData
      );
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log(`✅ Typing Analysis: ${avgTime.toFixed(2)}ms average, ${totalTime.toFixed(2)}ms total`);
    this.metrics.typingAnalysis = avgTime;
    
    return avgTime;
  }

  // Memory Usage Test
  async testMemoryUsage(): Promise<number> {
    console.log('\n💾 Testing Memory Usage...');
    
    const initialMemory = process.memoryUsage();
    
    // Create multiple sessions to test memory consumption
    const sessions = [];
    for (let i = 0; i < 50; i++) {
      const session = await this.proctoringSService.initializeSession(
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
        'Mozilla/5.0 (Test Browser)',
        '1920x1080',
        `memory-test-${i}`
      );
      sessions.push(session);
    }

    const afterSessionsMemory = process.memoryUsage();
    const memoryIncrease = afterSessionsMemory.heapUsed - initialMemory.heapUsed;
    const memoryPerSession = memoryIncrease / sessions.length;

    console.log(`✅ Memory Usage: ${(memoryPerSession / 1024 / 1024).toFixed(2)}MB per session`);
    console.log(`   Total heap: ${(afterSessionsMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    
    this.metrics.memoryUsage = memoryPerSession;
    
    return memoryPerSession;
  }

  // Database Operations Performance
  async testDatabasePerformance(iterations = 200): Promise<number> {
    console.log(`\n🗄️ Testing Database Operations (${iterations} iterations)...`);
    
    const startTime = performance.now();

    // Test various database operations
    for (let i = 0; i < iterations; i++) {
      // Create
      const session = await ProctoringSecurity.create({
        sessionId: `db-test-${i}`,
        userId: new mongoose.Types.ObjectId().toString(),
        assessmentId: new mongoose.Types.ObjectId().toString(),
        userAgent: 'Test Browser',
        deviceFingerprint: `db-test-fingerprint-${i}`,
        status: 'active'
      });

      // Read
      await ProctoringSecurity.findOne({ sessionId: session.sessionId });

      // Update
      await ProctoringSecurity.updateOne(
        { sessionId: session.sessionId },
        { $set: { integrityScore: Math.floor(Math.random() * 100) } }
      );

      // Delete (cleanup)
      await ProctoringSecurity.deleteOne({ sessionId: session.sessionId });
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    console.log(`✅ Database Operations: ${avgTime.toFixed(2)}ms average per CRUD cycle`);
    this.metrics.databaseOperations = avgTime;
    
    return avgTime;
  }

  // Concurrent Load Test
  async testConcurrentLoad(concurrentSessions = 20): Promise<void> {
    console.log(`\n🔄 Testing Concurrent Load (${concurrentSessions} concurrent sessions)...`);
    
    const startTime = performance.now();
    const promises = [];

    for (let i = 0; i < concurrentSessions; i++) {
      const promise = this.simulateUserSession(i);
      promises.push(promise);
    }

    await Promise.all(promises);
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log(`✅ Concurrent Load Test: ${totalTime.toFixed(2)}ms for ${concurrentSessions} sessions`);
    console.log(`   Average time per session: ${(totalTime / concurrentSessions).toFixed(2)}ms`);
  }

  // Simulate a complete user session
  private async simulateUserSession(sessionIndex: number): Promise<void> {
    const userId = new mongoose.Types.ObjectId().toString();
    const assessmentId = new mongoose.Types.ObjectId().toString();
    
    // Initialize session
    const session = await this.proctoringSService.initializeSession(
      userId,
      assessmentId,
      'Mozilla/5.0 (Test Browser)',
      '1920x1080',
      `concurrent-test-${sessionIndex}`
    );

    // Simulate some security events
    for (let i = 0; i < 5; i++) {
      await this.proctoringSService.logSecurityEvent(
        session.sessionId,
        'window_blur',
        { duration: 1000 * i },
        'low'
      );
    }

    // Initialize webcam monitoring
    const webcamSession = await this.webcamService.initializeMonitoring(
      userId,
      assessmentId,
      session.sessionId
    );

    // Process some frames
    for (let i = 0; i < 10; i++) {
      await this.webcamService.processFrame(
        webcamSession.sessionId,
        'mock-frame-data',
        new Date(),
        i
      );
    }

    // End session
    await this.proctoringSService.endSession(session.sessionId, 'test_completed');
  }

  // Performance Benchmarks and Validation
  validatePerformance(): boolean {
    console.log('\n📊 Performance Validation Results:');
    console.log('=====================================');

    const benchmarks = {
      sessionInitialization: 500, // 500ms max
      securityEventProcessing: 50, // 50ms max
      frameProcessing: 200, // 200ms max (5 FPS minimum)
      plagiarismDetection: 2000, // 2s max
      typingAnalysis: 300, // 300ms max
      databaseOperations: 100 // 100ms max per CRUD cycle
    };

    let allPassed = true;

    Object.entries(benchmarks).forEach(([metric, benchmark]) => {
      const actualValue = this.metrics[metric as keyof PerformanceMetrics];
      const passed = actualValue <= benchmark;
      const status = passed ? '✅' : '❌';
      
      console.log(`${status} ${metric}: ${actualValue.toFixed(2)}ms (benchmark: ${benchmark}ms)`);
      
      if (!passed) {
        allPassed = false;
        console.log(`   ⚠️ Performance issue detected in ${metric}`);
      }
    });

    console.log('\n🔍 Memory Usage:');
    console.log(`   Heap per session: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    
    if (this.metrics.memoryUsage > 10 * 1024 * 1024) { // 10MB per session
      console.log('   ⚠️ High memory usage detected');
      allPassed = false;
    }

    console.log('\n' + (allPassed ? '🎉 All performance benchmarks passed!' : '⚠️ Some performance issues detected'));
    
    return allPassed;
  }

  // Generate Performance Report
  generateReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      recommendations: this.generateRecommendations(),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage()
      }
    };

    console.log('\n📄 Performance Report:');
    console.log(JSON.stringify(report, null, 2));
  }

  private generateRecommendations(): string[] {
    const recommendations = [];

    if (this.metrics.sessionInitialization > 500) {
      recommendations.push('Consider optimizing session initialization - possibly by lazy loading components');
    }

    if (this.metrics.frameProcessing > 200) {
      recommendations.push('Frame processing is slow - consider reducing frame rate or optimizing computer vision algorithms');
    }

    if (this.metrics.plagiarismDetection > 2000) {
      recommendations.push('Plagiarism detection is slow - consider implementing caching or optimizing NLP algorithms');
    }

    if (this.metrics.memoryUsage > 10 * 1024 * 1024) {
      recommendations.push('High memory usage per session - implement memory cleanup and garbage collection optimization');
    }

    if (this.metrics.databaseOperations > 100) {
      recommendations.push('Database operations are slow - add appropriate indexes and consider connection pooling');
    }

    if (recommendations.length === 0) {
      recommendations.push('All performance metrics are within acceptable ranges');
    }

    return recommendations;
  }

  // Run All Tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Proctoring System Performance Validation');
    console.log('====================================================');

    try {
      await this.initialize();

      // Run all performance tests
      await this.testSessionInitialization();
      await this.testSecurityEventProcessing();
      await this.testFrameProcessing();
      await this.testPlagiarismDetection();
      await this.testTypingAnalysis();
      await this.testMemoryUsage();
      await this.testDatabasePerformance();
      await this.testConcurrentLoad();

      // Validate and report
      this.validatePerformance();
      this.generateReport();

    } catch (error) {
      console.error('❌ Performance testing failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run performance validation if this file is executed directly
if (require.main === module) {
  const validator = new ProctorPerformanceValidator();
  validator.runAllTests().catch(console.error);
}

export default ProctorPerformanceValidator;