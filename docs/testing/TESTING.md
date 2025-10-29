# Testing Documentation

## Overview

This document provides comprehensive testing strategies and documentation for the Play-Learn-Spark Class & Group Management System.

## Backend Testing

### Test Structure

The backend uses Jest with Supertest for API testing and Mocha for enhanced testing. Tests are organized as follows:

```
server/src/tests/
├── setup.ts                    # Global test configuration
├── helpers/
│   └── testUtils.ts            # Test utilities and helpers
├── class.test.ts               # Integration tests for class APIs
├── classController.test.ts     # Unit tests for class controller
└── auth.enhanced.test.ts       # Authentication tests
```

### Running Backend Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- class.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run enhanced tests (Mocha)
npm run test:enhanced
```

### Test Environment Setup

Tests use MongoDB Memory Server for isolated database testing:

```typescript
// Automatic setup in setup.ts
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
```

### API Test Examples

#### Class Creation Test
```typescript
it('should create a new class with valid data', async () => {
  const classData = {
    name: 'Test Math Class',
    subject: 'math',
    gradeLevel: '5th',
    description: 'A test math class'
  };

  const response = await request(app)
    .post('/api/classes')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send(classData)
    .expect(201);

  expect(response.body.success).toBe(true);
  expect(response.body.data.class.name).toBe(classData.name);
  expect(response.body.data.class.joinCode).toMatch(/^[A-Z0-9]{6}$/);
});
```

#### Group Management Test
```typescript
it('should add member to group', async () => {
  const response = await request(app)
    .post(`/api/groups/${testGroupId}/members`)
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({ userId: studentId, role: 'member' })
    .expect(200);

  expect(response.body.success).toBe(true);
  
  // Verify member was added
  const updatedGroup = await Group.findById(testGroupId);
  expect(updatedGroup.members.some(m => m.user.toString() === studentId)).toBe(true);
});
```

### Controller Unit Tests

#### Mock Setup
```typescript
import { createMockReq, createMockRes, createMockNext } from './helpers/testUtils';

// Mock the models
jest.mock('../models/Class');
jest.mock('../models/Group');

const MockedClass = Class as jest.MockedClass<typeof Class>;
```

#### Test Example
```typescript
it('should create a new class successfully', async () => {
  mockReq.body = classData;
  mockReq.user = { id: 'teacher123', roles: ['teacher'] };

  const mockClass = {
    _id: 'class123',
    ...classData,
    save: jest.fn().mockResolvedValue(true)
  };

  MockedClass.prototype.save = jest.fn().mockResolvedValue(mockClass);

  await createClass(mockReq, mockRes, mockNext);

  expect(mockRes.status).toHaveBeenCalledWith(201);
  expect(mockRes.json).toHaveBeenCalledWith({
    success: true,
    message: 'Class created successfully',
    data: { class: expect.any(Object) }
  });
});
```

## Frontend Testing

### Test Structure

Frontend tests use React Testing Library with Jest/Vitest:

```
client/src/tests/
├── ClassComponents.test.tsx    # Component integration tests
├── setup.ts                   # Test environment setup
└── helpers/
    └── testUtils.tsx          # React testing utilities
```

### Test Environment Setup

```typescript
// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockAuthValue = {
    user: {
      id: 'test-user-id',
      roles: ['teacher'],
      profile: { name: 'Test Teacher' }
    },
    isAuthenticated: true,
    // ... other auth properties
  };

  return (
    <BrowserRouter>
      <AuthContextEnhanced.Provider value={mockAuthValue}>
        {children}
      </AuthContextEnhanced.Provider>
    </BrowserRouter>
  );
};
```

### Component Testing Examples

#### Class Management Component
```typescript
it('creates a new class', async () => {
  mockClassService.createClass.mockResolvedValue({
    success: true,
    data: { class: { _id: 'new-class', name: 'New Test Class' } }
  });

  render(
    <TestWrapper>
      <ClassManagement />
    </TestWrapper>
  );

  // Open modal
  fireEvent.click(screen.getByText('Create New Class'));

  // Fill form
  fireEvent.change(screen.getByLabelText(/class name/i), {
    target: { value: 'New Test Class' }
  });

  // Submit
  fireEvent.click(screen.getByText('Create Class'));

  await waitFor(() => {
    expect(mockClassService.createClass).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Test Class' })
    );
  });
});
```

#### Group Management Component
```typescript
it('uses auto-assignment feature', async () => {
  mockClassService.autoAssignStudents.mockResolvedValue({
    success: true,
    data: { message: 'Students assigned successfully' }
  });

  render(
    <TestWrapper>
      <GroupManagementSimple />
    </TestWrapper>
  );

  fireEvent.click(screen.getByText('Auto Assign'));

  await waitFor(() => {
    expect(mockClassService.autoAssignStudents).toHaveBeenCalledWith('test-class-id');
  });
});
```

### Service Mocking

```typescript
// Mock the services
jest.mock('../services/classService', () => ({
  getMyClasses: jest.fn(),
  createClass: jest.fn(),
  joinClass: jest.fn(),
  createGroup: jest.fn(),
  addStudentToGroup: jest.fn(),
  // ... other service methods
}));
```

## Test Data Utilities

### Backend Test Helpers

```typescript
// Create test users
export const createTestUser = async (role: 'teacher' | 'student', suffix: string = '') => {
  // Creates both SQLite and MongoDB user documents
  // Returns user with _id, email, roles, etc.
};

// Create test classes
export const createTestClass = async (teacherId: string, overrides: any = {}) => {
  // Creates class with default test data
  // Allows overrides for specific test scenarios
};

// Add students to classes
export const addStudentToClass = async (classId: string, studentId: string, status = 'active') => {
  // Adds student with proper enrollment data
};
```

### Frontend Test Helpers

```typescript
// Mock user data
const mockTeacher = {
  id: 'teacher-id',
  email: 'teacher@example.com',
  roles: ['teacher'],
  profile: { name: 'Test Teacher' }
};

// Mock service responses
const mockClassResponse = {
  success: true,
  data: {
    class: {
      _id: 'class-id',
      name: 'Test Class',
      students: [...],
      analytics: { totalStudents: 25 }
    }
  }
};
```

## Testing Best Practices

### 1. Test Organization

- **Unit Tests**: Test individual functions/methods in isolation
- **Integration Tests**: Test API endpoints and component interactions
- **E2E Tests**: Test complete user workflows (future enhancement)

### 2. Test Naming Convention

```typescript
describe('ClassController', () => {
  describe('createClass', () => {
    it('should create class with valid data', () => {});
    it('should reject invalid data', () => {});
    it('should require teacher authorization', () => {});
  });
});
```

### 3. AAA Pattern

```typescript
it('should approve pending student', async () => {
  // Arrange
  const mockClass = createMockClass();
  const mockStudent = { user: 'student123', status: 'pending' };
  
  // Act
  await approveStudent(mockReq, mockRes, mockNext);
  
  // Assert
  expect(mockStudent.status).toBe('approved');
  expect(mockRes.status).toHaveBeenCalledWith(200);
});
```

### 4. Mock Strategy

- **Shallow Mocking**: Mock external dependencies (databases, APIs)
- **Service Mocking**: Mock service layer for component tests
- **Preserve Business Logic**: Don't mock the code under test

### 5. Test Data Management

- Use factories for consistent test data creation
- Clean up after each test to prevent interference
- Use meaningful test data that reflects real usage

## Coverage Requirements

### Backend Coverage Targets
- **Controllers**: 95%+ line coverage
- **Services**: 90%+ line coverage
- **Models**: 85%+ line coverage
- **Routes**: 95%+ line coverage

### Frontend Coverage Targets
- **Components**: 80%+ line coverage
- **Services**: 90%+ line coverage
- **Hooks**: 85%+ line coverage
- **Utils**: 95%+ line coverage

## Continuous Testing

### Pre-commit Hooks
```bash
# Run tests before commit
npm test
npm run lint
```

### CI/CD Pipeline
```yaml
# Example GitHub Actions
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
```

## Debugging Tests

### Common Issues

1. **Async/Await**: Ensure all async operations are properly awaited
2. **Mock Cleanup**: Clear mocks between tests
3. **Database State**: Ensure clean state between tests
4. **Environment Variables**: Set appropriate test environment variables

### Debug Commands

```bash
# Debug specific test
npm test -- --verbose class.test.ts

# Debug with node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug frontend tests
npm run test:debug
```

## Performance Testing

### Load Testing
```typescript
// Example using supertest for load testing
describe('Load Tests', () => {
  it('should handle multiple concurrent class creations', async () => {
    const promises = Array(10).fill(null).map(() =>
      request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(validClassData)
    );

    const responses = await Promise.all(promises);
    responses.forEach(response => {
      expect(response.status).toBe(201);
    });
  });
});
```

### Memory Testing
```typescript
// Monitor memory usage during tests
beforeEach(() => {
  const memBefore = process.memoryUsage();
  console.log('Memory before test:', memBefore);
});
```

## Security Testing

### Authentication Tests
```typescript
it('should reject requests without authentication', async () => {
  const response = await request(app)
    .post('/api/classes')
    .send(validClassData)
    .expect(401);

  expect(response.body.message).toContain('authentication');
});
```

### Authorization Tests
```typescript
it('should reject non-teacher class creation', async () => {
  const response = await request(app)
    .post('/api/classes')
    .set('Authorization', `Bearer ${studentToken}`)
    .send(validClassData)
    .expect(403);
});
```

### Input Validation Tests
```typescript
it('should sanitize malicious input', async () => {
  const maliciousData = {
    name: '<script>alert("xss")</script>',
    description: '{{ malicious_template }}'
  };

  const response = await request(app)
    .post('/api/classes')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send(maliciousData)
    .expect(400);
});
```

## Future Enhancements

### 1. E2E Testing with Playwright
- Full user journey testing
- Cross-browser compatibility
- Visual regression testing

### 2. Performance Monitoring
- Real user monitoring (RUM)
- Synthetic testing
- Performance budgets

### 3. Accessibility Testing
- Automated a11y testing
- Screen reader compatibility
- Keyboard navigation testing

### 4. API Contract Testing
- OpenAPI/Swagger validation
- Contract testing with Pact
- Schema validation

## Troubleshooting

### Common Test Failures

1. **Timeout Issues**: Increase Jest timeout for async operations
2. **MongoDB Connection**: Ensure proper cleanup of database connections
3. **React Testing**: Use proper async utilities (waitFor, findBy)
4. **Mock Issues**: Ensure mocks are reset between tests

### Getting Help

- Check Jest documentation for testing patterns
- React Testing Library docs for component testing
- MongoDB Memory Server docs for database testing
- Consult team leads for complex testing scenarios

---

## Quick Reference

### Backend Test Commands
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
npm run test:auth          # Auth tests only
```

### Frontend Test Commands
```bash
npm run test               # Run tests (when configured)
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
```

### Key Testing Files
- `server/src/tests/setup.ts` - Global test configuration
- `server/src/tests/helpers/testUtils.ts` - Backend utilities
- `client/src/tests/setup.ts` - Frontend test setup
- `jest.config.json` - Jest configuration