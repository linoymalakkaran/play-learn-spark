# Testing Documentation

## Overview

This document provides comprehensive information about the testing framework and strategies used in the PlayLearnSpark Content Management System.

## Testing Framework

### Jest Configuration
- **Framework:** Jest with TypeScript support
- **Test Environment:** Node.js with MongoDB Memory Server
- **Coverage:** Comprehensive code coverage reporting
- **Mocking:** Extensive mocking of external services

### Test Structure
```
src/tests/
├── setup.ts                 # Global test configuration
├── content.test.ts          # Content management API tests
├── media.test.ts           # Media management tests
├── auth.test.ts            # Authentication tests
├── integration.test.ts     # Integration tests
└── performance.test.ts     # Performance tests
```

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- content.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Content CRUD"
```

### Test Categories

#### Unit Tests
Test individual functions and components in isolation.
```bash
npm test -- --testPathPattern="unit"
```

#### Integration Tests
Test complete workflows and API endpoints.
```bash
npm test -- --testPathPattern="integration"
```

#### Performance Tests
Test system performance under load.
```bash
npm test -- --testPathPattern="performance"
```

## Test Structure and Patterns

### Test Organization
Each test file follows a consistent structure:

```typescript
describe('Feature Name', () => {
  describe('Specific Functionality', () => {
    test('should do something specific', async () => {
      // Arrange
      const testData = createTestData();
      
      // Act
      const result = await performAction(testData);
      
      // Assert
      expect(result).toMatchExpected();
    });
  });
});
```

### Test Data Management
Use factories and fixtures for consistent test data:

```typescript
// Test factories
const createTestContent = (overrides = {}) => ({
  title: 'Test Content',
  description: 'Test description',
  contentType: 'lesson',
  ...overrides
});

// Use in tests
const content = createTestContent({ difficulty: 'advanced' });
```

### Assertion Patterns
Follow consistent assertion patterns:

```typescript
// API Response Assertions
expect(response.status).toBe(200);
expect(response.body).toHaveProperty('id');
expect(response.body.title).toBe(expectedTitle);

// Database Assertions
const savedContent = await ContentItem.findById(contentId);
expect(savedContent).not.toBeNull();
expect(savedContent.status).toBe('published');

// Error Assertions
expect(() => invalidOperation()).toThrow('Expected error message');
await expect(asyncInvalidOperation()).rejects.toThrow();
```

## API Testing

### Request Testing
Test all HTTP methods and endpoints:

```typescript
describe('Content API', () => {
  test('POST /api/content - Create content', async () => {
    const response = await request(app)
      .post('/api/content')
      .set('Authorization', `Bearer ${token}`)
      .send(contentData)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });
  
  test('GET /api/content/:id - Get specific content', async () => {
    const content = await createTestContent();
    
    const response = await request(app)
      .get(`/api/content/${content._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.title).toBe(content.title);
  });
});
```

### Authentication Testing
Test authentication and authorization:

```typescript
test('should require authentication', async () => {
  await request(app)
    .get('/api/content')
    .expect(401);
});

test('should require proper permissions', async () => {
  const limitedToken = createTokenWithoutPermissions();
  
  await request(app)
    .post('/api/content')
    .set('Authorization', `Bearer ${limitedToken}`)
    .send(contentData)
    .expect(403);
});
```

### Validation Testing
Test input validation and error handling:

```typescript
test('should validate required fields', async () => {
  const invalidData = { description: 'Missing title' };
  
  const response = await request(app)
    .post('/api/content')
    .set('Authorization', `Bearer ${token}`)
    .send(invalidData)
    .expect(400);
  
  expect(response.body.errors).toBeDefined();
  expect(response.body.errors.some(e => e.field === 'title')).toBe(true);
});
```

## Database Testing

### MongoDB Memory Server
Tests use MongoDB Memory Server for isolation:

```typescript
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // Clear database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

### Model Testing
Test Mongoose models and schemas:

```typescript
describe('Content Model', () => {
  test('should create valid content item', async () => {
    const content = new ContentItem(validContentData);
    const savedContent = await content.save();
    
    expect(savedContent._id).toBeDefined();
    expect(savedContent.createdAt).toBeDefined();
  });
  
  test('should validate required fields', async () => {
    const content = new ContentItem({});
    
    await expect(content.save()).rejects.toThrow();
  });
});
```

## Service Testing

### External Service Mocking
Mock external services for reliable testing:

```typescript
// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock response' } }]
        })
      }
    }
  }))
}));

// Use in tests
test('should generate AI content', async () => {
  const result = await aiService.generateContent(prompt);
  expect(result).toBe('Mock response');
});
```

### File Upload Testing
Test file upload functionality:

```typescript
test('should upload image file', async () => {
  const response = await request(app)
    .post('/api/media/upload')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', Buffer.from('fake image'), 'test.jpg')
    .field('title', 'Test Image')
    .expect(201);
  
  expect(response.body.filename).toBeDefined();
  expect(response.body.mimeType).toBe('image/jpeg');
});
```

## Performance Testing

### Load Testing
Test system performance under load:

```typescript
describe('Performance Tests', () => {
  test('should handle multiple concurrent requests', async () => {
    const requests = Array.from({ length: 50 }, () =>
      request(app)
        .get('/api/content/search')
        .set('Authorization', `Bearer ${token}`)
        .query({ q: 'test' })
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
```

### Memory Testing
Monitor memory usage during tests:

```typescript
test('should not have memory leaks', async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  // Perform memory-intensive operations
  for (let i = 0; i < 100; i++) {
    await createAndDeleteContent();
  }
  
  // Force garbage collection
  if (global.gc) global.gc();
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;
  
  expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
});
```

## Integration Testing

### End-to-End Workflows
Test complete user workflows:

```typescript
describe('Content Creation Workflow', () => {
  test('should create, update, and publish content', async () => {
    // 1. Create content
    const createResponse = await request(app)
      .post('/api/content')
      .set('Authorization', `Bearer ${token}`)
      .send(contentData)
      .expect(201);
    
    const contentId = createResponse.body.id;
    
    // 2. Update content
    await request(app)
      .put(`/api/content/${contentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Updated description' })
      .expect(200);
    
    // 3. Publish content
    await request(app)
      .patch(`/api/content/${contentId}/publish`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    // 4. Verify published status
    const getResponse = await request(app)
      .get(`/api/content/${contentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(getResponse.body.status).toBe('published');
  });
});
```

### Cross-Service Integration
Test integration between different services:

```typescript
test('should integrate content and media services', async () => {
  // Upload media
  const mediaResponse = await request(app)
    .post('/api/media/upload')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', imageBuffer, 'test.jpg')
    .expect(201);
  
  const mediaId = mediaResponse.body.id;
  
  // Create content with media
  const contentData = {
    title: 'Content with Media',
    body: {
      type: 'rich_text',
      content: `![Image](media://${mediaId})`
    }
  };
  
  const contentResponse = await request(app)
    .post('/api/content')
    .set('Authorization', `Bearer ${token}`)
    .send(contentData)
    .expect(201);
  
  // Verify media is linked
  expect(contentResponse.body.body.content).toContain(mediaId);
});
```

## Test Utilities

### Helper Functions
Common test utilities and helpers:

```typescript
// Authentication helpers
export const createAuthToken = (user = defaultUser) => {
  return jwt.sign(user, process.env.JWT_SECRET);
};

export const createUserWithRoles = (roles: string[]) => ({
  id: 'test-user',
  email: 'test@example.com',
  roles,
  permissions: getPermissionsForRoles(roles)
});

// Data factories
export const createTestContent = (overrides = {}) => ({
  title: 'Test Content',
  description: 'Test description',
  contentType: 'lesson',
  difficulty: 'beginner',
  subject: ['Test Subject'],
  ...overrides
});

// Assertion helpers
export const expectValidationError = (response: any, field: string) => {
  expect(response.status).toBe(400);
  expect(response.body.errors.some(e => e.field === field)).toBe(true);
};

export const expectPermissionDenied = (response: any) => {
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Insufficient permissions');
};
```

### Mock Data
Comprehensive mock data for testing:

```typescript
export const mockData = {
  users: {
    teacher: {
      id: 'teacher-1',
      email: 'teacher@example.com',
      roles: ['teacher'],
      permissions: ['content:read', 'content:write']
    },
    admin: {
      id: 'admin-1',
      email: 'admin@example.com',
      roles: ['admin'],
      permissions: ['*']
    }
  },
  
  content: {
    lesson: {
      title: 'Sample Lesson',
      description: 'A sample lesson for testing',
      contentType: 'lesson',
      difficulty: 'beginner',
      subject: ['Mathematics'],
      duration: 30
    },
    
    activity: {
      title: 'Sample Activity',
      description: 'A sample activity for testing',
      contentType: 'activity',
      activityType: 'quiz',
      difficulty: 'intermediate',
      configuration: {
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            question: 'Test question?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A'
          }
        ]
      }
    }
  }
};
```

## Continuous Integration

### GitHub Actions
Automated testing in CI/CD pipeline:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Upload coverage
      uses: codecov/codecov-action@v1
      with:
        file: ./coverage/lcov.info
```

### Pre-commit Hooks
Run tests before commits:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test && npm run lint",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

## Coverage Requirements

### Minimum Coverage Thresholds
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      },
      "./src/controllers/": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

### Coverage Reports
- **HTML Report:** `coverage/lcov-report/index.html`
- **LCOV Format:** `coverage/lcov.info`
- **JSON Summary:** `coverage/coverage-summary.json`

## Best Practices

### Test Writing Guidelines
1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Test the public interface, not internal details

2. **Keep Tests Simple and Focused**
   - One assertion per test when possible
   - Clear test names that describe the behavior

3. **Use Descriptive Test Names**
   ```typescript
   // Good
   test('should return 404 when content does not exist')
   
   // Bad
   test('content test')
   ```

4. **Follow AAA Pattern**
   - **Arrange:** Set up test data and conditions
   - **Act:** Execute the code being tested
   - **Assert:** Verify the results

5. **Clean Up After Tests**
   - Clear database state between tests
   - Remove temporary files
   - Reset mocks and spies

### Performance Considerations
1. **Use Memory Database**
   - Faster than real database connections
   - Isolated test environment

2. **Minimize Network Calls**
   - Mock external services
   - Use local test data

3. **Parallel Test Execution**
   - Configure Jest for parallel execution
   - Ensure tests are independent

4. **Selective Test Running**
   - Run only affected tests during development
   - Use test patterns and filters

## Troubleshooting

### Common Issues

#### Test Timeouts
```typescript
// Increase timeout for slow tests
test('slow operation', async () => {
  // Test implementation
}, 30000); // 30 second timeout
```

#### Memory Issues
```typescript
// Clear large objects after tests
afterEach(() => {
  largeTestData = null;
  if (global.gc) global.gc();
});
```

#### Database Connection Issues
```typescript
// Ensure proper cleanup
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
```

#### Mock Issues
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Debugging Tests
1. **Use Console Logging**
   ```typescript
   test('debug test', () => {
     console.log('Debug info:', testData);
     expect(result).toBe(expected);
   });
   ```

2. **Run Single Tests**
   ```bash
   npm test -- --testNamePattern="specific test name"
   ```

3. **Debug Mode**
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

4. **Verbose Output**
   ```bash
   npm test -- --verbose
   ```

This comprehensive testing documentation ensures reliable, maintainable, and effective testing of the Content Management System.