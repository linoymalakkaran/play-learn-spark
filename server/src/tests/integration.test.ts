import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import mongoose, { Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Class } from '../models/Class';
import { Group } from '../models/Group';
import bcrypt from 'bcryptjs';

describe('Class and Group Models Integration Tests', () => {
  let mongod: MongoMemoryServer;
  let teacherId: Schema.Types.ObjectId;
  let studentId: Schema.Types.ObjectId;
  let testClass: any;

  beforeAll(async () => {
    // Setup MongoDB Memory Server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    // Clear collections
    await Class.deleteMany({});
    await Group.deleteMany({});

    // Create test user IDs
    teacherId = new mongoose.Types.ObjectId() as Schema.Types.ObjectId;
    studentId = new mongoose.Types.ObjectId() as Schema.Types.ObjectId;
  });

  describe('Class Model', () => {
    it('should create a class with required fields', async () => {
      const classData = {
        name: 'Test Math Class',
        teacher: teacherId,
        gradeLevel: '5th',
        subject: 'math',
        settings: {
          maxStudents: 25,
          requireApproval: true
        }
      };

      const newClass = new Class(classData);
      const savedClass = await newClass.save();

      expect(savedClass._id).toBeDefined();
      expect(savedClass.name).toBe('Test Math Class');
      expect(savedClass.teacher.toString()).toBe(teacherId.toString());
      expect(savedClass.joinCode).toBeDefined();
      expect(savedClass.joinCode).toMatch(/^[A-Z0-9]{6,8}$/);
      expect(savedClass.students).toHaveLength(0);
    });

    it('should generate unique join codes', async () => {
      const class1 = new Class({
        name: 'Class 1',
        teacher: teacherId,
        gradeLevel: '5th'
      });

      const class2 = new Class({
        name: 'Class 2', 
        teacher: teacherId,
        gradeLevel: '4th'
      });

      await class1.save();
      await class2.save();

      expect(class1.joinCode).toBeDefined();
      expect(class2.joinCode).toBeDefined();
      expect(class1.joinCode).not.toBe(class2.joinCode);
    });

    it('should add students to class', async () => {
      const testClass = new Class({
        name: 'Test Class',
        teacher: teacherId,
        gradeLevel: '5th'
      });

      await testClass.save();

      // Add student using the model method
      await testClass.addStudent(studentId, teacherId);

      expect(testClass.students).toHaveLength(1);
      expect(testClass.students[0].userId.toString()).toBe(studentId.toString());
      expect(testClass.students[0].status).toBe('pending'); // default with requireApproval true
    });

    it('should prevent duplicate student enrollment', async () => {
      const testClass = new Class({
        name: 'Test Class',
        teacher: teacherId,
        gradeLevel: '5th'
      });

      await testClass.save();
      await testClass.addStudent(studentId, teacherId);

      // Try to add same student again
      await expect(testClass.addStudent(studentId, teacherId))
        .rejects.toThrow('Student already enrolled in this class');
    });

    it('should enforce max students limit', async () => {
      const testClass = new Class({
        name: 'Small Class',
        teacher: teacherId,
        gradeLevel: '5th',
        settings: {
          maxStudents: 1,
          requireApproval: false
        }
      });

      await testClass.save();

      // Add first student
      await testClass.addStudent(studentId, teacherId);

      // Try to add second student
      const student2Id = new mongoose.Types.ObjectId() as Schema.Types.ObjectId;
      await expect(testClass.addStudent(student2Id, teacherId))
        .rejects.toThrow('Class has reached maximum capacity');
    });

    it('should remove students from class', async () => {
      const testClass = new Class({
        name: 'Test Class',
        teacher: teacherId,
        gradeLevel: '5th'
      });

      await testClass.save();
      await testClass.addStudent(studentId, teacherId);

      expect(testClass.students).toHaveLength(1);

      await testClass.removeStudent(studentId);
      expect(testClass.students).toHaveLength(0);
    });

    it('should check if student is enrolled', async () => {
      const testClass = new Class({
        name: 'Test Class',
        teacher: teacherId,
        gradeLevel: '5th'
      });

      await testClass.save();

      expect(testClass.isStudentEnrolled(studentId)).toBe(false);

      await testClass.addStudent(studentId, teacherId);
      expect(testClass.isStudentEnrolled(studentId)).toBe(true);
    });

    it('should update analytics when students are added/removed', async () => {
      const testClass = new Class({
        name: 'Test Class',
        teacher: teacherId,
        gradeLevel: '5th',
        settings: { requireApproval: false }
      });

      await testClass.save();

      const initialTotal = testClass.analytics.totalStudents;
      await testClass.addStudent(studentId, teacherId);

      expect(testClass.analytics.totalStudents).toBe(initialTotal + 1);
    });
  });

  describe('Group Model', () => {
    beforeEach(async () => {
      // Create a test class for group tests
      testClass = new Class({
        name: 'Test Class for Groups',
        teacher: teacherId,
        gradeLevel: '5th'
      });
      await testClass.save();
    });

    it('should create a group with required fields', async () => {
      const groupData = {
        name: 'Study Group A',
        class: testClass._id,
        teacher: teacherId,
        type: 'study-group',
        settings: {
          maxMembers: 6,
          isPrivate: false
        }
      };

      const newGroup = new Group(groupData);
      const savedGroup = await newGroup.save();

      expect(savedGroup._id).toBeDefined();
      expect(savedGroup.name).toBe('Study Group A');
      expect(savedGroup.class.toString()).toBe(testClass._id.toString());
      expect(savedGroup.teacher.toString()).toBe(teacherId);
      expect(savedGroup.members).toHaveLength(0);
      expect(savedGroup.color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should add members to group', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId,
        settings: { maxMembers: 4 }
      });

      await testGroup.save();

      await testGroup.addMember(studentId, 'member');

      expect(testGroup.members).toHaveLength(1);
      expect(testGroup.members[0].userId.toString()).toBe(studentId);
      expect(testGroup.members[0].role).toBe('member');
      expect(testGroup.members[0].status).toBe('active');
    });

    it('should prevent duplicate group membership', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId
      });

      await testGroup.save();
      await testGroup.addMember(studentId, 'member');

      await expect(testGroup.addMember(studentId, 'member'))
        .rejects.toThrow('User is already a member of this group');
    });

    it('should enforce max members limit', async () => {
      const testGroup = new Group({
        name: 'Small Group',
        class: testClass._id,
        teacher: teacherId,
        settings: { maxMembers: 1 }
      });

      await testGroup.save();
      await testGroup.addMember(studentId, 'member');

      const student2Id = new mongoose.Types.ObjectId().toString();
      await expect(testGroup.addMember(student2Id, 'member'))
        .rejects.toThrow('Group has reached maximum capacity');
    });

    it('should remove members from group', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId
      });

      await testGroup.save();
      await testGroup.addMember(studentId, 'member');

      expect(testGroup.members).toHaveLength(1);

      await testGroup.removeMember(studentId);
      expect(testGroup.members).toHaveLength(0);
    });

    it('should update member roles', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId
      });

      await testGroup.save();
      await testGroup.addMember(studentId, 'member');

      await testGroup.updateMemberRole(studentId, 'leader');

      const member = testGroup.members.find(m => m.userId.toString() === studentId);
      expect(member?.role).toBe('leader');
    });

    it('should check if user is a member', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId
      });

      await testGroup.save();

      expect(testGroup.isMember(studentId)).toBe(false);

      await testGroup.addMember(studentId, 'member');
      expect(testGroup.isMember(studentId)).toBe(true);
    });

    it('should get active members only', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId
      });

      await testGroup.save();
      await testGroup.addMember(studentId, 'member');

      // Manually add an inactive member for testing
      const student2Id = new mongoose.Types.ObjectId() as Schema.Types.ObjectId;
      testGroup.members.push({
        userId: student2Id,
        role: 'member',
        status: 'inactive',
        joinedAt: new Date()
      });
      await testGroup.save();

      const activeMembers = testGroup.getActiveMembers();
      expect(activeMembers).toHaveLength(1);
      expect(activeMembers[0].userId.toString()).toBe(studentId);
    });

    it('should calculate member count correctly', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId
      });

      await testGroup.save();

      expect(testGroup.memberCount).toBe(0);

      await testGroup.addMember(studentId, 'member');
      expect(testGroup.memberCount).toBe(1);
    });

    it('should validate color format', async () => {
      const groupWithInvalidColor = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId,
        color: 'invalid-color'
      });

      await expect(groupWithInvalidColor.save())
        .rejects.toThrow(/Color must be a valid hex color code/);
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      testClass = new Class({
        name: 'Test Class',
        teacher: teacherId,
        gradeLevel: '5th'
      });
      await testClass.save();
    });

    it('should find class by join code', async () => {
      const foundClass = await Class.findByJoinCode(testClass.joinCode);
      expect(foundClass).toBeTruthy();
      expect(foundClass?._id.toString()).toBe(testClass._id.toString());

      const notFound = await Class.findByJoinCode('INVALID');
      expect(notFound).toBeNull();
    });

    it('should find teacher classes', async () => {
      const teacherClasses = await Class.findTeacherClasses(teacherId);
      expect(teacherClasses).toHaveLength(1);
      expect(teacherClasses[0]._id.toString()).toBe(testClass._id.toString());
    });

    it('should find groups by class', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId
      });
      await testGroup.save();

      const classGroups = await Group.findByClass(testClass._id);
      expect(classGroups).toHaveLength(1);
      expect(classGroups[0]._id.toString()).toBe(testGroup._id.toString());
    });

    it('should find groups by teacher', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId
      });
      await testGroup.save();

      const teacherGroups = await Group.findByTeacher(teacherId);
      expect(teacherGroups).toHaveLength(1);
      expect(teacherGroups[0]._id.toString()).toBe(testGroup._id.toString());
    });
  });

  describe('Class and Group Integration', () => {
    it('should create class with groups workflow', async () => {
      // Create class
      const testClass = new Class({
        name: 'Integration Test Class',
        teacher: teacherId,
        gradeLevel: '5th',
        settings: { requireApproval: false }
      });
      await testClass.save();

      // Add students to class
      const student1Id = new mongoose.Types.ObjectId() as Schema.Types.ObjectId;
      const student2Id = new mongoose.Types.ObjectId() as Schema.Types.ObjectId;
      await testClass.addStudent(student1Id, teacherId);
      await testClass.addStudent(student2Id, teacherId);

      expect(testClass.students).toHaveLength(2);

      // Create groups in the class
      const group1 = new Group({
        name: 'Group Alpha',
        class: testClass._id,
        teacher: teacherId,
        settings: { maxMembers: 3 }
      });

      const group2 = new Group({
        name: 'Group Beta',
        class: testClass._id,
        teacher: teacherId,
        settings: { maxMembers: 3 }
      });

      await group1.save();
      await group2.save();

      // Assign students to groups
      await group1.addMember(student1Id, 'leader');
      await group2.addMember(student2Id, 'member');

      // Verify the complete setup
      const finalClass = await Class.findById(testClass._id);
      const classGroups = await Group.findByClass(testClass._id);

      expect(finalClass?.students).toHaveLength(2);
      expect(classGroups).toHaveLength(2);
      expect(group1.members).toHaveLength(1);
      expect(group2.members).toHaveLength(1);
    });

    it('should handle complex group reassignment', async () => {
      const testClass = new Class({
        name: 'Reassignment Test',
        teacher: teacherId,
        gradeLevel: '5th',
        settings: { requireApproval: false }
      });
      await testClass.save();

      const studentIds = [
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString(),
        new mongoose.Types.ObjectId().toString()
      ];

      // Add all students to class
      for (const id of studentIds) {
        await testClass.addStudent(id, teacherId);
      }

      // Create two groups
      const group1 = new Group({
        name: 'Initial Group',
        class: testClass._id,
        teacher: teacherId
      });

      const group2 = new Group({
        name: 'Reassignment Group',
        class: testClass._id,
        teacher: teacherId
      });

      await group1.save();
      await group2.save();

      // Initially assign all students to group1
      for (const id of studentIds) {
        await group1.addMember(id, 'member');
      }

      expect(group1.members).toHaveLength(3);
      expect(group2.members).toHaveLength(0);

      // Move one student to group2
      await group1.removeMember(studentIds[0]);
      await group2.addMember(studentIds[0], 'leader');

      expect(group1.members).toHaveLength(2);
      expect(group2.members).toHaveLength(1);
      expect(group2.members[0].role).toBe('leader');
    });
  });
});