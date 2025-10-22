/**
 * Content Management API Test Suite
 * 
 * Comprehensive test suite covering content management APIs,
 * integration tests, and performance tests.
 */

import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Express } from 'express';
import { createApp } from '../server';
import { ContentItem, Lesson, Activity, MediaAsset, ContentCollection } from '../models/ContentModels';

// Test app instance
let app: Express;
let mongoServer: MongoMemoryServer;

// Test data
const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  roles: ['teacher', 'content_creator'],
  permissions: ['content:read', 'content:write', 'content:delete']
};

const testContent = {
  title: 'Test Algebra Lesson',
  description: 'A test lesson about basic algebra concepts',
  contentType: 'lesson',
  difficulty: 'beginner',
  subject: ['Mathematics', 'Algebra'],
  duration: 45,
  tags: ['algebra', 'math', 'equations'],
  format: 'text',
  language: 'English',
  targetAudience: {
    ageRange: { min: 12, max: 16 },
    gradeLevel: ['6th', '7th', '8th'],
    prerequisites: ['basic arithmetic']
  },
  learningObjectives: [
    'Understand basic algebraic expressions',
    'Solve simple linear equations'
  ],
  body: {
    type: 'rich_text',
    content: 'This is a test lesson about algebra...'
  },
  metadata: {
    estimatedReadingTime: 10,
    estimatedCompletionTime: 45,
    complexity: 'low'
  },
  isPublished: true,
  status: 'published'
};

const testActivity = {
  title: 'Algebra Practice Quiz',
  description: 'Practice quiz for algebra concepts',
  contentType: 'activity',
  activityType: 'quiz',
  difficulty: 'beginner',
  subject: ['Mathematics'],
  duration: 20,
  tags: ['quiz', 'algebra', 'practice'],
  format: 'interactive',
  language: 'English',
  targetAudience: {
    ageRange: { min: 12, max: 16 },
    gradeLevel: ['6th', '7th', '8th']
  },
  instructions: 'Complete the following algebra questions',
  configuration: {
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What is x in the equation x + 5 = 12?',
        options: ['5', '7', '12', '17'],
        correctAnswer: '7',
        points: 1
      }
    ],
    timeLimit: 1200,
    attemptsAllowed: 3,
    passingScore: 70
  },
  isPublished: true,
  status: 'published'
};

// Setup and teardown
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Authentication helper
const getAuthToken = () => {
  // Mock JWT token generation for testing
  return 'mock-jwt-token-' + testUser.id;
};

describe('Content Management API', () => {
  describe('Content CRUD Operations', () => {
    test('POST /api/content - Create content item', async () => {
      const response = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(testContent)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(testContent.title);
      expect(response.body.createdBy).toBe(testUser.id);
      expect(response.body.status).toBe('published');
    });

    test('GET /api/content - Get all content items', async () => {
      // Create test content first
      const content = new ContentItem({ ...testContent, createdBy: testUser.id });
      await content.save();

      const response = await request(app)
        .get('/api/content')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toBe(testContent.title);
      expect(response.body.pagination).toHaveProperty('total', 1);
    });

    test('GET /api/content/:id - Get specific content item', async () => {
      const content = new ContentItem({ ...testContent, createdBy: testUser.id });
      await content.save();

      const response = await request(app)
        .get(`/api/content/${content._id}`)
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body.title).toBe(testContent.title);
      expect(response.body.id).toBe(content._id.toString());
    });

    test('PUT /api/content/:id - Update content item', async () => {
      const content = new ContentItem({ ...testContent, createdBy: testUser.id });
      await content.save();

      const updatedData = { title: 'Updated Algebra Lesson' };

      const response = await request(app)
        .put(`/api/content/${content._id}`)
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.version).toBe(2);
    });

    test('DELETE /api/content/:id - Delete content item', async () => {
      const content = new ContentItem({ ...testContent, createdBy: testUser.id });
      await content.save();

      await request(app)
        .delete(`/api/content/${content._id}`)
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(204);

      const deletedContent = await ContentItem.findById(content._id);
      expect(deletedContent).toBeNull();
    });
  });

  describe('Content Search and Filtering', () => {
    beforeEach(async () => {
      // Create test content with different attributes
      const contents = [
        { ...testContent, title: 'Algebra Basics', subject: ['Mathematics'], difficulty: 'beginner' },
        { ...testContent, title: 'Advanced Calculus', subject: ['Mathematics'], difficulty: 'advanced' },
        { ...testContent, title: 'Physics Fundamentals', subject: ['Physics'], difficulty: 'intermediate' },
        { ...testContent, title: 'Chemistry Lab', subject: ['Chemistry'], difficulty: 'intermediate' }
      ];

      for (const content of contents) {
        const item = new ContentItem({ ...content, createdBy: testUser.id });
        await item.save();
      }
    });

    test('GET /api/content/search - Text search', async () => {
      const response = await request(app)
        .get('/api/content/search')
        .query({ q: 'algebra' })
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toContain('Algebra');
    });

    test('GET /api/content/search - Filter by subject', async () => {
      const response = await request(app)
        .get('/api/content/search')
        .query({ subject: 'Mathematics' })
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      response.body.items.forEach((item: any) => {
        expect(item.subject).toContain('Mathematics');
      });
    });

    test('GET /api/content/search - Filter by difficulty', async () => {
      const response = await request(app)
        .get('/api/content/search')
        .query({ difficulty: 'intermediate' })
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      response.body.items.forEach((item: any) => {
        expect(item.difficulty).toBe('intermediate');
      });
    });

    test('GET /api/content/search - Combined filters', async () => {
      const response = await request(app)
        .get('/api/content/search')
        .query({ 
          subject: 'Mathematics',
          difficulty: 'beginner'
        })
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toContain('Basics');
    });

    test('GET /api/content/search - Pagination', async () => {
      const response = await request(app)
        .get('/api/content/search')
        .query({ page: 1, limit: 2 })
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(4);
    });
  });

  describe('Lesson Management', () => {
    test('POST /api/content/lessons - Create lesson', async () => {
      const lessonData = {
        ...testContent,
        contentType: 'lesson',
        structure: {
          sections: [
            {
              id: 'intro',
              title: 'Introduction',
              content: 'Introduction to algebra',
              order: 1
            },
            {
              id: 'examples',
              title: 'Examples',
              content: 'Practice examples',
              order: 2
            }
          ]
        }
      };

      const response = await request(app)
        .post('/api/content/lessons')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(lessonData)
        .expect(201);

      expect(response.body.contentType).toBe('lesson');
      expect(response.body.structure.sections).toHaveLength(2);
    });

    test('GET /api/content/lessons/:id/progress - Get lesson progress', async () => {
      const lesson = new Lesson({ ...testContent, createdBy: testUser.id });
      await lesson.save();

      const response = await request(app)
        .get(`/api/content/lessons/${lesson._id}/progress`)
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body).toHaveProperty('progress');
      expect(response.body).toHaveProperty('completedSections');
    });
  });

  describe('Activity Management', () => {
    test('POST /api/content/activities - Create activity', async () => {
      const response = await request(app)
        .post('/api/content/activities')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(testActivity)
        .expect(201);

      expect(response.body.contentType).toBe('activity');
      expect(response.body.activityType).toBe('quiz');
      expect(response.body.configuration.questions).toHaveLength(1);
    });

    test('POST /api/content/activities/:id/submit - Submit activity attempt', async () => {
      const activity = new Activity({ ...testActivity, createdBy: testUser.id });
      await activity.save();

      const submission = {
        answers: [
          {
            questionId: 'q1',
            answer: '7'
          }
        ]
      };

      const response = await request(app)
        .post(`/api/content/activities/${activity._id}/submit`)
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(submission)
        .expect(200);

      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('passed');
      expect(response.body.score).toBe(100);
    });
  });

  describe('Content Collections', () => {
    test('POST /api/content/collections - Create collection', async () => {
      const content1 = new ContentItem({ ...testContent, createdBy: testUser.id });
      const content2 = new ContentItem({ ...testContent, title: 'Algebra Part 2', createdBy: testUser.id });
      await Promise.all([content1.save(), content2.save()]);

      const collectionData = {
        title: 'Algebra Course',
        description: 'Complete algebra course',
        contentItems: [
          { contentId: content1._id, order: 1 },
          { contentId: content2._id, order: 2 }
        ],
        tags: ['course', 'algebra'],
        isPublished: true
      };

      const response = await request(app)
        .post('/api/content/collections')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(collectionData)
        .expect(201);

      expect(response.body.title).toBe(collectionData.title);
      expect(response.body.contentItems).toHaveLength(2);
    });

    test('GET /api/content/collections/:id/progress - Get collection progress', async () => {
      const content = new ContentItem({ ...testContent, createdBy: testUser.id });
      await content.save();

      const collection = new ContentCollection({
        title: 'Test Collection',
        description: 'Test collection',
        contentItems: [{ contentId: content._id, order: 1 }],
        createdBy: testUser.id
      });
      await collection.save();

      const response = await request(app)
        .get(`/api/content/collections/${collection._id}/progress`)
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body).toHaveProperty('overallProgress');
      expect(response.body).toHaveProperty('itemProgress');
    });
  });

  describe('Content Analytics', () => {
    test('GET /api/content/analytics/overview - Get analytics overview', async () => {
      const content = new ContentItem({ ...testContent, createdBy: testUser.id });
      await content.save();

      const response = await request(app)
        .get('/api/content/analytics/overview')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalContent');
      expect(response.body).toHaveProperty('contentByType');
      expect(response.body).toHaveProperty('contentByDifficulty');
    });

    test('GET /api/content/:id/analytics - Get content-specific analytics', async () => {
      const content = new ContentItem({ ...testContent, createdBy: testUser.id });
      await content.save();

      const response = await request(app)
        .get(`/api/content/${content._id}/analytics`)
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body).toHaveProperty('views');
      expect(response.body).toHaveProperty('completions');
      expect(response.body).toHaveProperty('averageRating');
    });
  });

  describe('Error Handling', () => {
    test('GET /api/content/nonexistent - 404 for non-existent content', async () => {
      const response = await request(app)
        .get('/api/content/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(404);

      expect(response.body.error).toBe('Content not found');
    });

    test('POST /api/content - 400 for invalid data', async () => {
      const invalidData = { title: '' }; // Missing required fields

      const response = await request(app)
        .post('/api/content')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('PUT /api/content/:id - 403 for unauthorized update', async () => {
      const content = new ContentItem({ ...testContent, createdBy: 'other-user-id' });
      await content.save();

      const response = await request(app)
        .put(`/api/content/${content._id}`)
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ title: 'Updated Title' })
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });
  });
});

describe('Media Management API', () => {
  describe('File Upload', () => {
    test('POST /api/media/upload - Upload image file', async () => {
      const response = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .attach('file', Buffer.from('fake image data'), 'test-image.jpg')
        .field('title', 'Test Image')
        .field('description', 'A test image')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.originalName).toBe('test-image.jpg');
      expect(response.body.mimeType).toBe('image/jpeg');
    });

    test('POST /api/media/upload - Reject unsupported file type', async () => {
      const response = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .attach('file', Buffer.from('fake file data'), 'test.exe')
        .expect(400);

      expect(response.body.error).toBe('Unsupported file type');
    });

    test('POST /api/media/upload - Reject oversized file', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      
      const response = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .attach('file', largeBuffer, 'large-image.jpg')
        .expect(400);

      expect(response.body.error).toBe('File too large');
    });
  });

  describe('Media Management', () => {
    test('GET /api/media - Get media library', async () => {
      const media = new MediaAsset({
        title: 'Test Media',
        description: 'Test media file',
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        path: '/uploads/test.jpg',
        uploadedBy: testUser.id
      });
      await media.save();

      const response = await request(app)
        .get('/api/media')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toBe('Test Media');
    });

    test('DELETE /api/media/:id - Delete media file', async () => {
      const media = new MediaAsset({
        title: 'Test Media',
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        path: '/uploads/test.jpg',
        uploadedBy: testUser.id
      });
      await media.save();

      await request(app)
        .delete(`/api/media/${media._id}`)
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .expect(204);

      const deletedMedia = await MediaAsset.findById(media._id);
      expect(deletedMedia).toBeNull();
    });
  });
});

describe('Performance Tests', () => {
  test('Content search performance', async () => {
    // Create 100 test content items
    const contentItems = Array.from({ length: 100 }, (_, i) => ({
      ...testContent,
      title: `Test Content ${i}`,
      createdBy: testUser.id
    }));

    await ContentItem.insertMany(contentItems);

    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/content/search')
      .query({ q: 'Test' })
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .expect(200);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(1000); // Should complete within 1 second
    expect(response.body.items.length).toBeGreaterThan(0);
  });

  test('Bulk content creation performance', async () => {
    const contentData = Array.from({ length: 50 }, (_, i) => ({
      ...testContent,
      title: `Bulk Content ${i}`
    }));

    const startTime = Date.now();

    const response = await request(app)
      .post('/api/content/bulk')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ items: contentData })
      .expect(201);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    expect(response.body.created).toHaveLength(50);
  });
});

describe('Integration Tests', () => {
  test('Complete content workflow', async () => {
    // 1. Create content
    const createResponse = await request(app)
      .post('/api/content')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send(testContent)
      .expect(201);

    const contentId = createResponse.body.id;

    // 2. Search for content
    const searchResponse = await request(app)
      .get('/api/content/search')
      .query({ q: testContent.title })
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .expect(200);

    expect(searchResponse.body.items).toHaveLength(1);

    // 3. Update content
    const updateResponse = await request(app)
      .put(`/api/content/${contentId}`)
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({ description: 'Updated description' })
      .expect(200);

    expect(updateResponse.body.description).toBe('Updated description');

    // 4. Create collection with content
    const collectionResponse = await request(app)
      .post('/api/content/collections')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({
        title: 'Test Collection',
        description: 'Test collection',
        contentItems: [{ contentId, order: 1 }]
      })
      .expect(201);

    expect(collectionResponse.body.contentItems).toHaveLength(1);

    // 5. Get analytics
    const analyticsResponse = await request(app)
      .get(`/api/content/${contentId}/analytics`)
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .expect(200);

    expect(analyticsResponse.body).toHaveProperty('views');
  });

  test('Activity submission workflow', async () => {
    // 1. Create activity
    const activityResponse = await request(app)
      .post('/api/content/activities')
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send(testActivity)
      .expect(201);

    const activityId = activityResponse.body.id;

    // 2. Submit attempt
    const submissionResponse = await request(app)
      .post(`/api/content/activities/${activityId}/submit`)
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .send({
        answers: [{ questionId: 'q1', answer: '7' }]
      })
      .expect(200);

    expect(submissionResponse.body.passed).toBe(true);

    // 3. Get attempt history
    const historyResponse = await request(app)
      .get(`/api/content/activities/${activityId}/attempts`)
      .set('Authorization', `Bearer ${getAuthToken()}`)
      .expect(200);

    expect(historyResponse.body.attempts).toHaveLength(1);
  });
});

// Test utilities
export const testUtils = {
  createTestContent: async (overrides = {}) => {
    const content = new ContentItem({
      ...testContent,
      ...overrides,
      createdBy: testUser.id
    });
    return await content.save();
  },

  createTestActivity: async (overrides = {}) => {
    const activity = new Activity({
      ...testActivity,
      ...overrides,
      createdBy: testUser.id
    });
    return await activity.save();
  },

  createTestCollection: async (contentIds: string[], overrides = {}) => {
    const collection = new ContentCollection({
      title: 'Test Collection',
      description: 'Test collection',
      contentItems: contentIds.map((id, index) => ({ contentId: id, order: index + 1 })),
      createdBy: testUser.id,
      ...overrides
    });
    return await collection.save();
  },

  getAuthHeaders: () => ({
    Authorization: `Bearer ${getAuthToken()}`
  })
};