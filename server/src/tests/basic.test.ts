import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Class } from '../models/Class';
import { Group } from '../models/Group';

describe('Class and Group Models - Basic Tests', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
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
    // Clear all collections before each test
    await Class.deleteMany({});
    await Group.deleteMany({});
  });

  describe('Class Model', () => {
    it('should create a class successfully', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
      const classData = {
        name: 'Test Math Class',
        teacher: teacherId,
        gradeLevel: '5th',
        subject: 'math'
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
      const teacherId = new mongoose.Types.ObjectId();
      
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

      const saved1 = await class1.save();
      const saved2 = await class2.save();

      expect(saved1.joinCode).toBeDefined();
      expect(saved2.joinCode).toBeDefined();
      expect(saved1.joinCode).not.toBe(saved2.joinCode);
    });

    it('should find class by join code using findOne', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
      const testClass = new Class({
        name: 'Test Class',
        teacher: teacherId,
        gradeLevel: '5th'
      });

      const saved = await testClass.save();
      
      const found = await Class.findOne({ joinCode: saved.joinCode });
      expect(found).toBeTruthy();
      expect(found?._id.toString()).toBe(saved._id.toString());

      const notFound = await Class.findOne({ joinCode: 'INVALID' });
      expect(notFound).toBeNull();
    });

    it('should find teacher classes using find', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
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

      const teacherClasses = await Class.find({ teacher: teacherId });
      expect(teacherClasses).toHaveLength(2);
    });

    it('should validate required fields', async () => {
      const incompleteClass = new Class({
        teacher: new mongoose.Types.ObjectId()
        // Missing required name and gradeLevel
      });

      await expect(incompleteClass.save()).rejects.toThrow();
    });

    it('should enforce grade level enum', async () => {
      const invalidClass = new Class({
        name: 'Invalid Class',
        teacher: new mongoose.Types.ObjectId(),
        gradeLevel: 'invalid-grade' // Not in enum
      });

      await expect(invalidClass.save()).rejects.toThrow();
    });

    it('should have default settings', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
      const testClass = new Class({
        name: 'Test Class',
        teacher: teacherId,
        gradeLevel: '5th'
      });

      const saved = await testClass.save();

      expect(saved.settings.maxStudents).toBe(30);
      expect(saved.settings.autoApproval).toBe(false);
      expect(saved.settings.allowParentView).toBe(true);
      expect(saved.settings.public).toBe(false);
      expect(saved.settings.allowLateJoin).toBe(true);
      expect(saved.settings.requireApproval).toBe(true);
    });

    it('should generate join code on save', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
      const testClass = new Class({
        name: 'Test Class',
        teacher: teacherId,
        gradeLevel: '5th'
      });

      // Join code should be generated during save
      expect(testClass.joinCode).toBeUndefined();
      
      const saved = await testClass.save();
      expect(saved.joinCode).toBeDefined();
      expect(saved.joinCode).toMatch(/^[A-Z0-9]{6,8}$/);
    });
  });

  describe('Group Model', () => {
    let testClass: any;
    let teacherId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      teacherId = new mongoose.Types.ObjectId();
      
      testClass = new Class({
        name: 'Test Class for Groups',
        teacher: teacherId,
        gradeLevel: '5th'
      });
      
      await testClass.save();
    });

    it('should create a group successfully', async () => {
      const groupData = {
        name: 'Study Group A',
        class: testClass._id,
        teacher: teacherId,
        type: 'study-group'
      };

      const newGroup = new Group(groupData);
      const savedGroup = await newGroup.save();

      expect(savedGroup._id).toBeDefined();
      expect(savedGroup.name).toBe('Study Group A');
      expect(savedGroup.class.toString()).toBe(testClass._id.toString());
      expect(savedGroup.teacher.toString()).toBe(teacherId.toString());
      expect(savedGroup.members).toHaveLength(0);
      expect(savedGroup.color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should have default settings', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId
      });

      const saved = await testGroup.save();

      expect(saved.settings.maxMembers).toBe(6);
      expect(saved.settings.isPrivate).toBe(false);
      expect(saved.settings.allowSelfJoin).toBe(true);
      expect(saved.settings.requireApproval).toBe(false);
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

    it('should find groups by class using find', async () => {
      const group1 = new Group({
        name: 'Group 1',
        class: testClass._id,
        teacher: teacherId
      });

      const group2 = new Group({
        name: 'Group 2',
        class: testClass._id,
        teacher: teacherId
      });

      await group1.save();
      await group2.save();

      const classGroups = await Group.find({ class: testClass._id });
      expect(classGroups).toHaveLength(2);
    });

    it('should find groups by teacher using find', async () => {
      const testGroup = new Group({
        name: 'Test Group',
        class: testClass._id,
        teacher: teacherId
      });

      await testGroup.save();

      const teacherGroups = await Group.find({ teacher: teacherId });
      expect(teacherGroups).toHaveLength(1);
      expect(teacherGroups[0]._id.toString()).toBe(testGroup._id.toString());
    });

    it('should validate required fields', async () => {
      const incompleteGroup = new Group({
        class: testClass._id
        // Missing required name and teacher
      });

      await expect(incompleteGroup.save()).rejects.toThrow();
    });

    it('should enforce type enum', async () => {
      const invalidGroup = new Group({
        name: 'Invalid Group',
        class: testClass._id,
        teacher: teacherId,
        type: 'invalid-type' as any
      });

      await expect(invalidGroup.save()).rejects.toThrow();
    });

    it('should generate random color on save', async () => {
      const testGroup = new Group({
        name: 'Color Test Group',
        class: testClass._id,
        teacher: teacherId
      });

      const saved = await testGroup.save();
      expect(saved.color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('Basic Analytics', () => {
    it('should initialize analytics correctly', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
      const testClass = new Class({
        name: 'Analytics Test',
        teacher: teacherId,
        gradeLevel: '5th'
      });

      const saved = await testClass.save();

      expect(saved.analytics.totalStudents).toBe(0);
      expect(saved.analytics.activeStudents).toBe(0);
      expect(saved.analytics.totalAssignments).toBe(0);
      expect(saved.analytics.averageCompletion).toBe(0);
      expect(saved.analytics.lastActivity).toBeDefined();
    });

    it('should have proper metadata', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
      const testClass = new Class({
        name: 'Metadata Test',
        teacher: teacherId,
        gradeLevel: '5th'
      });

      const saved = await testClass.save();

      expect(saved.metadata.createdAt).toBeDefined();
      expect(saved.metadata.updatedAt).toBeDefined();
      expect(saved.metadata.archivedAt).toBeUndefined();
    });
  });

  describe('Database Validation', () => {
    it('should respect maxStudents setting', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
      const testClass = new Class({
        name: 'Small Class',
        teacher: teacherId,
        gradeLevel: '5th',
        settings: {
          maxStudents: 2,
          autoApproval: true,
          allowParentView: true,
          public: false,
          allowLateJoin: true,
          requireApproval: false
        }
      });

      const saved = await testClass.save();
      expect(saved.settings.maxStudents).toBe(2);
    });

    it('should respect maxMembers setting for groups', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
      const testClass = new Class({
        name: 'Test Class',
        teacher: teacherId,
        gradeLevel: '5th'
      });
      
      await testClass.save();

      const testGroup = new Group({
        name: 'Small Group',
        class: testClass._id,
        teacher: teacherId,
        settings: {
          maxMembers: 3,
          allowSelfJoin: true,
          requireApproval: false,
          isPrivate: false
        }
      });

      const saved = await testGroup.save();
      expect(saved.settings.maxMembers).toBe(3);
    });

    it('should handle concurrent class creation', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
      const promises = Array.from({ length: 5 }, (_, i) => {
        const testClass = new Class({
          name: `Concurrent Class ${i}`,
          teacher: teacherId,
          gradeLevel: '5th'
        });
        return testClass.save();
      });

      const results = await Promise.all(promises);
      
      // All should be saved successfully
      expect(results).toHaveLength(5);
      
      // All should have unique join codes
      const joinCodes = results.map(r => r.joinCode);
      const uniqueCodes = new Set(joinCodes);
      expect(uniqueCodes.size).toBe(5);
    });
  });

  describe('Model Relationships', () => {
    it('should reference class in group correctly', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      
      const testClass = new Class({
        name: 'Parent Class',
        teacher: teacherId,
        gradeLevel: '5th'
      });
      
      const savedClass = await testClass.save();

      const testGroup = new Group({
        name: 'Child Group',
        class: savedClass._id,
        teacher: teacherId
      });

      const savedGroup = await testGroup.save();

      // Verify relationship
      expect(savedGroup.class.toString()).toBe(savedClass._id.toString());

      // Test population would require actual data in referenced collection
      const populatedGroup = await Group.findById(savedGroup._id).populate('class');
      expect(populatedGroup?.class).toBeDefined();
    });

    it('should handle missing references gracefully', async () => {
      const teacherId = new mongoose.Types.ObjectId();
      const nonExistentClassId = new mongoose.Types.ObjectId();
      
      const testGroup = new Group({
        name: 'Orphan Group',
        class: nonExistentClassId,
        teacher: teacherId
      });

      // Should save even with non-existent reference (MongoDB doesn't enforce referential integrity by default)
      const saved = await testGroup.save();
      expect(saved).toBeDefined();
      expect(saved.class.toString()).toBe(nonExistentClassId.toString());
    });
  });
});