import request from 'supertest';
import app from '../../server';
import { User } from '../../models/UserSQLite';
import { generateToken } from '../../middleware/auth';

describe('Assessment System Integration Tests', () => {
  let testUser: User;
  let authToken: string;
  let assessmentId: string;
  let sessionId: string;

  beforeAll(async () => {
    // Create a test user
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'hashedpassword',
      role: 'teacher',
      isEmailVerified: true,
      subscriptionType: 'premium',
      isActive: true
    });

    authToken = generateToken(testUser);
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUser) {
      await testUser.destroy();
    }
  });

  describe('Assessment CRUD Operations', () => {
    test('Should create a new assessment', async () => {
      const assessmentData = {
        title: 'Test Math Quiz',
        description: 'A comprehensive math quiz for grade 5 students',
        type: 'quiz',
        subject: 'mathematics',
        grade: 'grade-5',
        topic: ['arithmetic', 'fractions'],
        difficulty: 'intermediate',
        estimatedDuration: 30,
        questions: [
          {
            type: 'multiple_choice',
            text: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            points: 10,
            timeLimit: 60,
            explanation: '2 + 2 equals 4 in basic arithmetic'
          },
          {
            type: 'true_false',
            text: 'The square root of 16 is 4',
            correctAnswer: true,
            points: 5,
            timeLimit: 30,
            explanation: '√16 = 4 because 4 × 4 = 16'
          }
        ],
        settings: {
          randomizeQuestions: true,
          allowBackNavigation: true,
          showProgressBar: true,
          requireFullScreen: false,
          preventCopyPaste: true,
          maxAttempts: 3,
          passingScore: 70
        }
      };

      const response = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assessmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(assessmentData.title);
      expect(response.body.data.questions).toHaveLength(2);
      
      assessmentId = response.body.data._id;
    });

    test('Should retrieve assessment by ID', async () => {
      const response = await request(app)
        .get(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(assessmentId);
      expect(response.body.data.title).toBe('Test Math Quiz');
    });

    test('Should update assessment', async () => {
      const updateData = {
        title: 'Updated Math Quiz',
        description: 'An updated comprehensive math quiz'
      };

      const response = await request(app)
        .put(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
    });

    test('Should search assessments', async () => {
      const response = await request(app)
        .get('/api/assessments/search?q=math&subject=mathematics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Assessment Session Management', () => {
    test('Should create a new assessment session', async () => {
      const sessionData = {
        deviceInfo: {
          userAgent: 'Test Browser',
          screenResolution: '1920x1080',
          timezone: 'UTC'
        }
      };

      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/sessions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.status).toBe('not_started');
      expect(response.body.data.userId).toBe(testUser.id.toString());
      
      sessionId = response.body.data._id;
    });

    test('Should start assessment session', async () => {
      const response = await request(app)
        .post(`/api/assessments/sessions/${sessionId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data).toHaveProperty('startedAt');
      expect(response.body.data).toHaveProperty('currentQuestion');
    });

    test('Should retrieve session details', async () => {
      const response = await request(app)
        .get(`/api/assessments/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(sessionId);
      expect(response.body.data.status).toBe('in_progress');
    });

    test('Should submit answer to current question', async () => {
      // Get current question first
      const sessionResponse = await request(app)
        .get(`/api/assessments/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const currentQuestionId = sessionResponse.body.data.currentQuestion;

      const answerData = {
        questionId: currentQuestionId,
        answer: '4',
        timeSpent: 45,
        attempts: 1
      };

      const response = await request(app)
        .post(`/api/assessments/sessions/${sessionId}/answers`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(answerData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isCorrect');
      expect(response.body.data).toHaveProperty('score');
    });

    test('Should navigate to next question', async () => {
      // Get session to find next question
      const sessionResponse = await request(app)
        .get(`/api/assessments/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const questions = sessionResponse.body.data.assessmentSnapshot.questions;
      const nextQuestionId = questions[1]._id; // Second question

      const navData = {
        questionId: nextQuestionId
      };

      const response = await request(app)
        .post(`/api/assessments/sessions/${sessionId}/navigate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(navData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentQuestion).toBe(nextQuestionId);
    });

    test('Should pause session', async () => {
      const response = await request(app)
        .post(`/api/assessments/sessions/${sessionId}/pause`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('paused');
      expect(response.body.data).toHaveProperty('pausedAt');
    });

    test('Should resume session', async () => {
      const response = await request(app)
        .post(`/api/assessments/sessions/${sessionId}/resume`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data).toHaveProperty('resumedAt');
    });

    test('Should submit session', async () => {
      const response = await request(app)
        .post(`/api/assessments/sessions/${sessionId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('submitted');
      expect(response.body.data).toHaveProperty('submittedAt');
      expect(response.body.data).toHaveProperty('totalScore');
    });

    test('Should get session results', async () => {
      const response = await request(app)
        .get(`/api/assessments/sessions/${sessionId}/results`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('score');
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data).toHaveProperty('analytics');
    });
  });

  describe('Security Features', () => {
    test('Should record security events', async () => {
      const securityEvent = {
        type: 'tab_switch',
        details: {
          timestamp: new Date().toISOString(),
          fromTab: 'assessment',
          toTab: 'unknown'
        },
        severity: 'medium'
      };

      const response = await request(app)
        .post(`/api/assessments/sessions/${sessionId}/security-events`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(securityEvent)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Security event recorded');
    });
  });

  describe('Analytics and Reporting', () => {
    test('Should get assessment analytics', async () => {
      const response = await request(app)
        .get(`/api/assessments/${assessmentId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalAttempts');
      expect(response.body.data).toHaveProperty('averageScore');
      expect(response.body.data).toHaveProperty('questionAnalytics');
    });

    test('Should get user sessions', async () => {
      const response = await request(app)
        .get(`/api/assessments/users/${testUser.id}/sessions`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Assessment Publishing and Sharing', () => {
    test('Should publish assessment', async () => {
      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isPublished).toBe(true);
      expect(response.body.data).toHaveProperty('publishedAt');
    });

    test('Should clone assessment', async () => {
      const response = await request(app)
        .post(`/api/assessments/${assessmentId}/clone`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toContain('Copy of');
      expect(response.body.data.isPublished).toBe(false);
    });

    test('Should export assessment', async () => {
      const response = await request(app)
        .get(`/api/assessments/${assessmentId}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('assessment');
      expect(response.body.data).toHaveProperty('exportFormat');
    });
  });

  describe('Error Handling', () => {
    test('Should handle invalid assessment ID', async () => {
      const response = await request(app)
        .get('/api/assessments/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });

    test('Should handle unauthorized access', async () => {
      const response = await request(app)
        .get(`/api/assessments/${assessmentId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token is required');
    });

    test('Should handle invalid assessment creation', async () => {
      const invalidData = {
        title: '', // Empty title should fail validation
        type: 'invalid-type'
      };

      const response = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('Question Type Validation', () => {
    test('Should handle multiple choice questions correctly', async () => {
      const mcqAssessment = {
        title: 'MCQ Test',
        description: 'Multiple choice question test',
        type: 'quiz',
        subject: 'science',
        grade: 'grade-6',
        topic: ['biology'],
        questions: [
          {
            type: 'multiple_choice',
            text: 'Which organelle is called the powerhouse of the cell?',
            options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Body'],
            correctAnswer: 'Mitochondria',
            points: 10,
            explanation: 'Mitochondria produce ATP, the energy currency of cells'
          }
        ]
      };

      const response = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mcqAssessment)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.questions[0].type).toBe('multiple_choice');
      expect(response.body.data.questions[0].options).toHaveLength(4);
    });

    test('Should handle essay questions correctly', async () => {
      const essayAssessment = {
        title: 'Essay Test',
        description: 'Essay writing assessment',
        type: 'assignment',
        subject: 'english',
        grade: 'grade-8',
        topic: ['writing'],
        questions: [
          {
            type: 'essay',
            text: 'Write a 500-word essay about the importance of education.',
            points: 50,
            timeLimit: 1800, // 30 minutes
            rubric: {
              criteria: [
                { name: 'Content', weight: 40, maxScore: 10 },
                { name: 'Grammar', weight: 30, maxScore: 10 },
                { name: 'Structure', weight: 30, maxScore: 10 }
              ]
            },
            wordLimit: { min: 400, max: 600 }
          }
        ]
      };

      const response = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(essayAssessment)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.questions[0].type).toBe('essay');
      expect(response.body.data.questions[0].rubric).toBeDefined();
      expect(response.body.data.questions[0].wordLimit).toBeDefined();
    });
  });
});

describe('Assessment System Performance Tests', () => {
  let testUser: User;
  let authToken: string;

  beforeAll(async () => {
    testUser = await User.create({
      firstName: 'Perf',
      lastName: 'User',
      email: 'perfuser@example.com',
      password: 'hashedpassword',
      role: 'teacher',
      isEmailVerified: true,
      subscriptionType: 'premium',
      isActive: true
    });

    authToken = generateToken(testUser);
  });

  afterAll(async () => {
    if (testUser) {
      await testUser.destroy();
    }
  });

  test('Should handle large assessment creation efficiently', async () => {
    const largeAssessment = {
      title: 'Large Assessment Test',
      description: 'Assessment with many questions',
      type: 'exam',
      subject: 'mathematics',
      grade: 'grade-10',
      topic: ['algebra', 'geometry'],
      questions: Array.from({ length: 50 }, (_, i) => ({
        type: 'multiple_choice',
        text: `Question ${i + 1}: What is ${i + 1} + ${i + 1}?`,
        options: [`${i}`, `${(i + 1) * 2}`, `${i + 2}`, `${i + 3}`],
        correctAnswer: `${(i + 1) * 2}`,
        points: 2
      }))
    };

    const startTime = Date.now();
    
    const response = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(largeAssessment)
      .expect(201);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.body.success).toBe(true);
    expect(response.body.data.questions).toHaveLength(50);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  }, 10000);

  test('Should handle concurrent session creation', async () => {
    // Create assessment first
    const assessment = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Concurrent Test',
        description: 'Test for concurrent sessions',
        type: 'quiz',
        subject: 'science',
        grade: 'grade-7',
        topic: ['physics'],
        questions: [{
          type: 'true_false',
          text: 'Light travels faster than sound.',
          correctAnswer: true,
          points: 5
        }]
      });

    const assessmentId = assessment.body.data._id;

    // Create multiple sessions concurrently
    const sessionPromises = Array.from({ length: 5 }, () =>
      request(app)
        .post(`/api/assessments/${assessmentId}/sessions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          deviceInfo: {
            userAgent: 'Test Browser',
            screenResolution: '1920x1080'
          }
        })
    );

    const responses = await Promise.all(sessionPromises);

    responses.forEach(response => {
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});