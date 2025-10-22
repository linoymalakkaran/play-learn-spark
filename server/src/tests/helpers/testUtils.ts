import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../../models/UserSQLite';
import { Class } from '../../models/Class';
import { Group } from '../../models/Group';
import mongoose from 'mongoose';

// @ts-ignore - Jest globals are available in test environment
declare const jest: any;
declare const expect: any;

/**
 * Test Utilities for Class Management System Testing
 */

export interface TestUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  roles: string[];
  profile: {
    firstName: string;
    lastName: string;
    name: string;
  };
}

/**
 * Generate a JWT token for testing
 */
export const generateTestToken = (user: any): string => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    roles: user.roles || ['student'],
    username: user.username
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '24h'
  });
};

/**
 * Create a test user with specified role
 */
export const createTestUser = async (role: 'teacher' | 'student' = 'student', suffix: string = ''): Promise<TestUser> => {
  const userData = {
    email: `test-${role}${suffix}@example.com`,
    username: `test${role}${suffix}`,
    password: await bcrypt.hash('Test123!', 10),
    roles: [role],
    profile: {
      firstName: `Test${suffix}`,
      lastName: role === 'teacher' ? 'Teacher' : 'Student',
      name: `Test${suffix} ${role === 'teacher' ? 'Teacher' : 'Student'}`,
      dateOfBirth: role === 'student' ? '2010-01-01' : '1985-01-01',
      gradeLevel: role === 'student' ? '5th' : undefined
    },
    preferences: {
      language: 'English',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: false
      }
    },
    status: 'active',
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Create user in SQLite for auth system
  const sqliteUser = await User.create({
    username: userData.username,
    email: userData.email,
    password: userData.password,
    roles: userData.roles,
    firstName: userData.profile.firstName,
    lastName: userData.profile.lastName,
    status: 'active'
  });

  // Create MongoDB user document for class system compatibility
  const UserModel = mongoose.model('User', new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    roles: [String],
    profile: {
      firstName: String,
      lastName: String,
      name: String,
      dateOfBirth: String,
      gradeLevel: String
    },
    preferences: mongoose.Schema.Types.Mixed,
    status: String,
    lastLogin: Date,
    createdAt: Date,
    updatedAt: Date
  }));

  const mongoUser = new UserModel({
    ...userData,
    _id: new mongoose.Types.ObjectId()
  });

  await mongoUser.save();

  return {
    _id: mongoUser._id.toString(),
    email: userData.email,
    username: userData.username,
    password: userData.password,
    roles: userData.roles,
    profile: userData.profile
  };
};

/**
 * Create a test class
 */
export const createTestClass = async (teacherId: string, overrides: any = {}) => {
  const classData = {
    name: 'Test Math Class',
    description: 'A test class for mathematics',
    teacher: teacherId,
    subject: 'math',
    gradeLevel: '5th',
    settings: {
      maxStudents: 25,
      autoApproval: false,
      allowParentView: true,
      public: false,
      allowLateJoin: true,
      requireApproval: true
    },
    joinCode: generateJoinCode(),
    students: [],
    schedule: {
      days: ['monday', 'wednesday', 'friday'],
      startTime: '09:00',
      endTime: '10:00',
      timezone: 'UTC',
      recurring: true
    },
    analytics: {
      totalStudents: 0,
      activeStudents: 0,
      totalAssignments: 0,
      averageCompletion: 0,
      lastActivity: new Date()
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      academicYear: '2024-2025',
      semester: 'Fall'
    },
    ...overrides
  };

  const testClass = new Class(classData);
  await testClass.save();
  return testClass;
};

/**
 * Create a test group
 */
export const createTestGroup = async (classId: string, teacherId: string, overrides: any = {}) => {
  const groupData = {
    name: 'Test Study Group',
    description: 'A test group for collaborative learning',
    class: classId,
    teacher: teacherId,
    type: 'study-group',
    members: [],
    settings: {
      maxMembers: 6,
      allowSelfJoin: false,
      requireApproval: true,
      isPrivate: false
    },
    color: '#3B82F6',
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date()
    },
    ...overrides
  };

  const testGroup = new Group(groupData);
  await testGroup.save();
  return testGroup;
};

/**
 * Add a student to a class
 */
export const addStudentToClass = async (classId: string, studentId: string, status: 'active' | 'pending' | 'inactive' = 'active') => {
  const testClass = await Class.findById(classId);
  if (!testClass) throw new Error('Class not found');

  testClass.students.push({
    userId: studentId as any,
    enrolledAt: new Date(),
    status,
    permissions: {
      viewClassmates: true,
      participateInDiscussions: true,
      submitAssignments: true
    }
  });

  await testClass.save();
  return testClass;
};

/**
 * Add a member to a group
 */
export const addMemberToGroup = async (groupId: string, userId: string, role: 'member' | 'leader' | 'helper' = 'member') => {
  const testGroup = await Group.findById(groupId);
  if (!testGroup) throw new Error('Group not found');

  testGroup.members.push({
    userId: userId as any,
    role,
    joinedAt: new Date(),
    status: 'active'
  });

  await testGroup.save();
  return testGroup;
};

/**
 * Generate a random join code
 */
export const generateJoinCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Clean up test data
 */
export const cleanupTestData = async () => {
  // Clean MongoDB collections
  await Class.deleteMany({});
  await Group.deleteMany({});
  
  // Clean SQLite tables
  await User.destroy({ where: {}, truncate: true });
  
  // Clean any other test collections that might exist
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (key !== 'classes' && key !== 'groups') {
      await collections[key].deleteMany({});
    }
  }
};

/**
 * Mock Express request object
 */
export const createMockReq = (overrides: any = {}) => ({
  user: null,
  params: {},
  query: {},
  body: {},
  headers: {},
  ...overrides
});

/**
 * Mock Express response object
 */
export const createMockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Mock Express next function
 */
export const createMockNext = () => jest.fn();

/**
 * Validation helpers
 */
export const expectValidClass = (classObj: any) => {
  expect(classObj).toBeDefined();
  expect(classObj._id).toBeDefined();
  expect(classObj.name).toBeDefined();
  expect(classObj.teacher).toBeDefined();
  expect(classObj.joinCode).toBeDefined();
  expect(classObj.settings).toBeDefined();
  expect(classObj.metadata).toBeDefined();
};

export const expectValidGroup = (groupObj: any) => {
  expect(groupObj).toBeDefined();
  expect(groupObj._id).toBeDefined();
  expect(groupObj.name).toBeDefined();
  expect(groupObj.class).toBeDefined();
  expect(groupObj.teacher).toBeDefined();
  expect(groupObj.settings).toBeDefined();
  expect(groupObj.metadata).toBeDefined();
};

export const expectValidUser = (userObj: any) => {
  expect(userObj).toBeDefined();
  expect(userObj._id || userObj.id).toBeDefined();
  expect(userObj.email).toBeDefined();
  expect(userObj.username).toBeDefined();
  expect(userObj.roles).toBeDefined();
  expect(Array.isArray(userObj.roles)).toBe(true);
};

/**
 * API response validation helpers
 */
export const expectSuccessResponse = (response: any, expectedData?: any) => {
  expect(response.status).toBeLessThan(400);
  expect(response.body.success).toBe(true);
  if (expectedData) {
    expect(response.body.data).toMatchObject(expectedData);
  }
};

export const expectErrorResponse = (response: any, expectedStatus: number, expectedMessage?: string) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body.success).toBe(false);
  if (expectedMessage) {
    expect(response.body.message || response.body.error).toContain(expectedMessage);
  }
};

export const expectValidationErrors = (response: any, expectedFields?: string[]) => {
  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.errors).toBeDefined();
  expect(Array.isArray(response.body.errors)).toBe(true);
  
  if (expectedFields) {
    expectedFields.forEach(field => {
      expect(response.body.errors.some((error: any) => 
        error.field === field || error.path === field || error.param === field
      )).toBe(true);
    });
  }
};

/**
 * Time utilities for testing
 */
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Random data generators
 */
export const randomString = (length: number = 10): string => 
  Math.random().toString(36).substring(2, 2 + length);

export const randomEmail = (): string => 
  `test.${randomString(8)}@example.com`;

export const randomGrade = (): string => {
  const grades = ['pre-k', 'kindergarten', '1st', '2nd', '3rd', '4th', '5th', '6th'];
  return grades[Math.floor(Math.random() * grades.length)];
};

export const randomSubject = (): string => {
  const subjects = ['math', 'science', 'english', 'history', 'art', 'music'];
  return subjects[Math.floor(Math.random() * subjects.length)];
};