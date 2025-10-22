import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import app from '../server';
import { Class } from '../models/Class';
import { Group } from '../models/Group';
import { generateTestToken, createTestUser, cleanupTestData, createTestClass, addStudentToClass } from './helpers/testUtils';

describe('Class API Tests', () => {
  let teacherToken: string;
  let studentToken: string;
  let teacherId: string;
  let studentId: string;
  let testClassId: string;
  let testGroupId: string;

  beforeAll(async () => {
    // Setup test database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/test-play-learn-spark');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test users and tokens
    const teacher = await createTestUser('teacher', 'teacher');
    const student = await createTestUser('student', 'student');
    
    teacherId = teacher._id.toString();
    studentId = student._id.toString();
    teacherToken = generateTestToken(teacher);
    studentToken = generateTestToken(student);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/classes', () => {
    it('should create a new class with valid data', async () => {
      const classData = {
        name: 'Test Math Class',
        subject: 'math',
        gradeLevel: '5th',
        description: 'A test math class for 5th graders',
        settings: {
          maxStudents: 25,
          requireApproval: true,
          allowLateSubmissions: false,
          autoGenJoinCode: true,
          color: '#3B82F6'
        },
        schedule: {
          meetingDays: ['monday', 'wednesday', 'friday'],
          startTime: '09:00',
          endTime: '10:00',
          semester: 'Fall 2025',
          startDate: '2025-09-01',
          endDate: '2025-12-15'
        }
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(classData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.class).toBeDefined();
      expect(response.body.data.class.name).toBe(classData.name);
      expect(response.body.data.class.teacher._id).toBe(teacherId);
      expect(response.body.data.class.joinCode).toBeDefined();
      expect(response.body.data.class.joinCode).toMatch(/^[A-Z0-9]{6}$/);

      testClassId = response.body.data.class._id;
    });

    it('should reject class creation with invalid data', async () => {
      const invalidClassData = {
        name: '', // Empty name
        subject: 'invalid-subject',
        gradeLevel: 'invalid-grade'
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(invalidClassData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject class creation without authentication', async () => {
      const classData = {
        name: 'Test Class',
        subject: 'math',
        gradeLevel: '5th'
      };

      await request(app)
        .post('/api/classes')
        .send(classData)
        .expect(401);
    });

    it('should reject class creation from non-teacher users', async () => {
      const classData = {
        name: 'Test Class',
        subject: 'math',
        gradeLevel: '5th'
      };

      const response = await request(app)
        .post('/api/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(classData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('teacher');
    });
  });

  describe('GET /api/classes', () => {
    beforeEach(async () => {
      // Create a test class
      const testClass = new Class({
        name: 'Test Class',
        subject: 'math',
        gradeLevel: '5th',
        teacher: teacherId,
        joinCode: 'TEST123',
        settings: {
          requireApproval: false,
          allowLateSubmissions: true,
          color: '#3B82F6'
        },
        schedule: {
          meetingDays: ['monday'],
          semester: 'Fall 2025',
          startDate: '2025-09-01',
          endDate: '2025-12-15'
        }
      });
      await testClass.save();
      testClassId = testClass._id.toString();
    });

    it('should return teacher classes for authenticated teacher', async () => {
      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.classes).toBeDefined();
      expect(Array.isArray(response.body.data.classes)).toBe(true);
      expect(response.body.data.classes.length).toBeGreaterThan(0);
      expect(response.body.data.classes[0].teacher._id).toBe(teacherId);
    });

    it('should return student classes for authenticated student', async () => {
      // Add student to class
      await Class.findByIdAndUpdate(testClassId, {
        $push: {
          students: {
            user: studentId,
            status: 'approved',
            enrolledAt: new Date()
          }
        }
      });

      const response = await request(app)
        .get('/api/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.classes).toBeDefined();
      expect(Array.isArray(response.body.data.classes)).toBe(true);
    });
  });

  describe('POST /api/classes/join', () => {
    beforeEach(async () => {
      const testClass = new Class({
        name: 'Test Class',
        subject: 'math',
        gradeLevel: '5th',
        teacher: teacherId,
        joinCode: 'TEST123',
        settings: {
          requireApproval: false,
          allowLateSubmissions: true,
          color: '#3B82F6'
        },
        schedule: {
          meetingDays: ['monday'],
          semester: 'Fall 2025',
          startDate: '2025-09-01',
          endDate: '2025-12-15'
        }
      });
      await testClass.save();
      testClassId = testClass._id.toString();
    });

    it('should allow student to join class with valid join code', async () => {
      const response = await request(app)
        .post('/api/classes/join')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ joinCode: 'TEST123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.class).toBeDefined();
      expect(response.body.data.class._id).toBe(testClassId);

      // Verify student was added to class
      const updatedClass = await Class.findById(testClassId);
      expect(updatedClass.students.some(s => s.user.toString() === studentId)).toBe(true);
    });

    it('should reject join with invalid join code', async () => {
      const response = await request(app)
        .post('/api/classes/join')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ joinCode: 'INVALID' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Class not found');
    });

    it('should prevent duplicate joins', async () => {
      // Join class first time
      await request(app)
        .post('/api/classes/join')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ joinCode: 'TEST123' })
        .expect(200);

      // Try to join again
      const response = await request(app)
        .post('/api/classes/join')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ joinCode: 'TEST123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already enrolled');
    });
  });

  describe('POST /api/classes/preview', () => {
    beforeEach(async () => {
      const testClass = new Class({
        name: 'Preview Test Class',
        subject: 'science',
        gradeLevel: '4th',
        teacher: teacherId,
        joinCode: 'PREV123',
        settings: {
          requireApproval: false,
          color: '#10B981'
        },
        schedule: {
          meetingDays: ['tuesday', 'thursday'],
          semester: 'Fall 2025',
          startDate: '2025-09-01',
          endDate: '2025-12-15'
        }
      });
      await testClass.save();
      testClassId = testClass._id.toString();
    });

    it('should return class preview without joining', async () => {
      const response = await request(app)
        .post('/api/classes/preview')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ joinCode: 'PREV123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.class).toBeDefined();
      expect(response.body.data.class.name).toBe('Preview Test Class');
      expect(response.body.data.class.teacher.name).toBeDefined();
      expect(response.body.data.class.studentCount).toBeDefined();

      // Should not contain sensitive information
      expect(response.body.data.class.students).toBeUndefined();
    });
  });

  describe('Group Management', () => {
    beforeEach(async () => {
      // Create test class first
      const testClass = new Class({
        name: 'Group Test Class',
        subject: 'math',
        gradeLevel: '5th',
        teacher: teacherId,
        joinCode: 'GRP123',
        settings: {
          requireApproval: false,
          color: '#3B82F6'
        },
        schedule: {
          meetingDays: ['monday'],
          semester: 'Fall 2025',
          startDate: '2025-09-01',
          endDate: '2025-12-15'
        },
        students: [{
          user: studentId,
          status: 'approved',
          enrolledAt: new Date()
        }]
      });
      await testClass.save();
      testClassId = testClass._id.toString();
    });

    describe('POST /api/classes/:classId/groups', () => {
      it('should create a new group', async () => {
        const groupData = {
          name: 'Study Group A',
          description: 'A group for collaborative study',
          settings: {
            maxMembers: 6,
            isPublic: true,
            color: '#EF4444'
          }
        };

        const response = await request(app)
          .post(`/api/classes/${testClassId}/groups`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(groupData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.group).toBeDefined();
        expect(response.body.data.group.name).toBe(groupData.name);
        expect(response.body.data.group.class).toBe(testClassId);

        testGroupId = response.body.data.group._id;
      });

      it('should reject group creation by non-teachers', async () => {
        const groupData = {
          name: 'Invalid Group',
          settings: { isPublic: true }
        };

        const response = await request(app)
          .post(`/api/classes/${testClassId}/groups`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send(groupData)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/classes/:classId/groups', () => {
      beforeEach(async () => {
        // Create a test group
        const testGroup = new Group({
          name: 'Test Group',
          class: testClassId,
          members: [],
          settings: {
            isPublic: true,
            maxMembers: 4
          }
        });
        await testGroup.save();
        testGroupId = testGroup._id.toString();
      });

      it('should return groups for class', async () => {
        const response = await request(app)
          .get(`/api/classes/${testClassId}/groups`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.groups).toBeDefined();
        expect(Array.isArray(response.body.data.groups)).toBe(true);
        expect(response.body.data.groups.length).toBeGreaterThan(0);
      });
    });

    describe('POST /api/groups/:groupId/members', () => {
      beforeEach(async () => {
        const testGroup = new Group({
          name: 'Member Test Group',
          class: testClassId,
          members: [],
          settings: {
            isPublic: true,
            maxMembers: 4
          }
        });
        await testGroup.save();
        testGroupId = testGroup._id.toString();
      });

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

      it('should prevent adding member when group is full', async () => {
        // Fill the group to capacity
        await Group.findByIdAndUpdate(testGroupId, {
          members: [
            { user: studentId, role: 'member', joinedAt: new Date() },
            { user: teacherId, role: 'member', joinedAt: new Date() },
            { user: studentId, role: 'member', joinedAt: new Date() },
            { user: teacherId, role: 'member', joinedAt: new Date() }
          ]
        });

        const response = await request(app)
          .post(`/api/groups/${testGroupId}/members`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({ userId: studentId, role: 'member' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('full');
      });
    });

    describe('DELETE /api/groups/:groupId/members/:userId', () => {
      beforeEach(async () => {
        const testGroup = new Group({
          name: 'Remove Test Group',
          class: testClassId,
          members: [{
            user: studentId,
            role: 'member',
            joinedAt: new Date()
          }],
          settings: { isPublic: true }
        });
        await testGroup.save();
        testGroupId = testGroup._id.toString();
      });

      it('should remove member from group', async () => {
        const response = await request(app)
          .delete(`/api/groups/${testGroupId}/members/${studentId}`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify member was removed
        const updatedGroup = await Group.findById(testGroupId);
        expect(updatedGroup.members.some(m => m.user.toString() === studentId)).toBe(false);
      });
    });

    describe('DELETE /api/groups/:groupId', () => {
      beforeEach(async () => {
        const testGroup = new Group({
          name: 'Delete Test Group',
          class: testClassId,
          members: [],
          settings: { isPublic: true }
        });
        await testGroup.save();
        testGroupId = testGroup._id.toString();
      });

      it('should delete group', async () => {
        const response = await request(app)
          .delete(`/api/groups/${testGroupId}`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify group was deleted
        const deletedGroup = await Group.findById(testGroupId);
        expect(deletedGroup).toBeNull();
      });

      it('should reject group deletion by non-teachers', async () => {
        const response = await request(app)
          .delete(`/api/groups/${testGroupId}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Student Management', () => {
    beforeEach(async () => {
      const testClass = new Class({
        name: 'Student Management Test',
        subject: 'math',
        gradeLevel: '5th',
        teacher: teacherId,
        joinCode: 'STU123',
        settings: {
          requireApproval: true,
          color: '#3B82F6'
        },
        schedule: {
          meetingDays: ['monday'],
          semester: 'Fall 2025',
          startDate: '2025-09-01',
          endDate: '2025-12-15'
        },
        students: [{
          user: studentId,
          status: 'pending',
          enrolledAt: new Date()
        }]
      });
      await testClass.save();
      testClassId = testClass._id.toString();
    });

    describe('PUT /api/classes/:classId/students/:studentId/approve', () => {
      it('should approve pending student', async () => {
        const response = await request(app)
          .put(`/api/classes/${testClassId}/students/${studentId}/approve`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify student was approved
        const updatedClass = await Class.findById(testClassId);
        const student = updatedClass.students.find(s => s.user.toString() === studentId);
        expect(student.status).toBe('approved');
      });
    });

    describe('DELETE /api/classes/:classId/students/:studentId', () => {
      it('should remove student from class', async () => {
        const response = await request(app)
          .delete(`/api/classes/${testClassId}/students/${studentId}`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify student was removed
        const updatedClass = await Class.findById(testClassId);
        expect(updatedClass.students.some(s => s.user.toString() === studentId)).toBe(false);
      });
    });

    describe('POST /api/classes/:classId/regenerate-code', () => {
      it('should regenerate join code', async () => {
        const response = await request(app)
          .post(`/api/classes/${testClassId}/regenerate-code`)
          .set('Authorization', `Bearer ${teacherToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.joinCode).toBeDefined();
        expect(response.body.data.joinCode).not.toBe('STU123');
        expect(response.body.data.joinCode).toMatch(/^[A-Z0-9]{6}$/);
      });
    });
  });
});