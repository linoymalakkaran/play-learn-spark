/**
 * Test Setup Configuration
 * 
 * Global test setup and configuration for Jest testing environment.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Global test configuration
jest.setTimeout(30000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Global variables
let mongoServer: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  // Mock console methods to reduce test noise
  const originalConsole = { ...console };
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: originalConsole.error, // Keep error for debugging
  };
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect from database
  await mongoose.disconnect();
  
  // Stop the in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  // Restore console
  global.console = console;
});

// Clear database before each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Mock external services
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  }))
}));

jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock AI response' } }]
        })
      }
    }
  }))
}));

jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: 'Mock Anthropic response' }]
      })
    }
  }))
}));

// Mock file system operations
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('mock file content')),
    unlink: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock Sharp image processing
jest.mock('sharp', () => {
  const mockSharp = {
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed image')),
    toFile: jest.fn().mockResolvedValue({ size: 1024 }),
    metadata: jest.fn().mockResolvedValue({ width: 100, height: 100, format: 'jpeg' })
  };
  
  return jest.fn(() => mockSharp);
});

// Mock FFmpeg video processing
jest.mock('fluent-ffmpeg', () => {
  const mockFFmpeg = {
    screenshots: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    save: jest.fn().mockImplementation((path: string) => {
      // Simulate successful processing
      setTimeout(() => {
        mockFFmpeg.on.mock.calls.forEach(([event, callback]) => {
          if (event === 'end') callback();
        });
      }, 100);
      return mockFFmpeg;
    }),
    format: jest.fn().mockReturnThis(),
    outputOptions: jest.fn().mockReturnThis(),
    size: jest.fn().mockReturnThis()
  };
  
  return jest.fn(() => mockFFmpeg);
});

// Test utilities
export const testHelpers = {
  createMockUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    roles: ['teacher', 'content_creator'],
    permissions: ['content:read', 'content:write', 'content:delete']
  }),
  
  createMockJWT: () => 'mock-jwt-token',
  
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  mockMulterFile: (filename: string, mimetype: string, size: number = 1024) => ({
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype,
    destination: '/tmp',
    filename: `test_${filename}`,
    path: `/tmp/test_${filename}`,
    size,
    buffer: Buffer.from('mock file content')
  }),
  
  expectValidationError: (response: any, field: string) => {
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.some((error: any) => 
      error.field === field || error.path === field
    )).toBe(true);
  },
  
  expectPermissionError: (response: any) => {
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Insufficient permissions');
  },
  
  expectNotFoundError: (response: any, resource: string) => {
    expect(response.status).toBe(404);
    expect(response.body.error).toContain(resource);
  }
};

// Global test data
export const testData = {
  validContentItem: {
    title: 'Test Content',
    description: 'Test description',
    contentType: 'lesson',
    difficulty: 'beginner',
    subject: ['Mathematics'],
    duration: 30,
    tags: ['test', 'math'],
    format: 'text',
    language: 'English',
    isPublished: true,
    status: 'published'
  },
  
  validActivity: {
    title: 'Test Activity',
    description: 'Test activity description',
    contentType: 'activity',
    activityType: 'quiz',
    difficulty: 'beginner',
    subject: ['Mathematics'],
    duration: 15,
    tags: ['test', 'quiz'],
    format: 'interactive',
    language: 'English',
    configuration: {
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          points: 1
        }
      ],
      timeLimit: 600,
      attemptsAllowed: 3,
      passingScore: 70
    },
    isPublished: true,
    status: 'published'
  },
  
  validMediaAsset: {
    title: 'Test Image',
    description: 'Test image description',
    filename: 'test.jpg',
    originalName: 'test.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    path: '/uploads/test.jpg'
  }
};