import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  createClass, 
  getMyClasses, 
  joinClass, 
  createGroup, 
  getClassGroups,
  addStudentToClass as addStudentController,
  removeStudentFromClass,
  approveStudent,
  deleteGroup
} from '../controllers/classController';
import { Class } from '../models/Class';
import { Group } from '../models/Group';
import { createMockReq, createMockRes, createMockNext } from './helpers/testUtils';

// Mock the models
jest.mock('../models/Class');
jest.mock('../models/Group');

const MockedClass = Class as jest.MockedClass<typeof Class>;
const MockedGroup = Group as jest.MockedClass<typeof Group>;

describe('Class Controller Unit Tests', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = createMockReq();
    mockRes = createMockRes();
    mockNext = createMockNext();
    jest.clearAllMocks();
  });

  describe('createClass', () => {
    it('should create a new class successfully', async () => {
      const classData = {
        name: 'Test Math Class',
        subject: 'math',
        gradeLevel: '5th',
        description: 'A test math class'
      };

      mockReq.body = classData;
      mockReq.user = { id: 'teacher123', roles: ['teacher'] };

      const mockClass = {
        _id: 'class123',
        ...classData,
        teacher: 'teacher123',
        joinCode: 'ABC123',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: 'class123',
          ...classData,
          teacher: { _id: 'teacher123', profile: { name: 'Test Teacher' } }
        })
      };

      MockedClass.prototype.constructor = jest.fn().mockReturnValue(mockClass);
      MockedClass.prototype.save = jest.fn().mockResolvedValue(mockClass);

      await createClass(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Class created successfully',
        data: { class: expect.any(Object) }
      });
    });

    it('should return 400 for invalid data', async () => {
      mockReq.body = { name: '' }; // Invalid data
      mockReq.user = { id: 'teacher123', roles: ['teacher'] };

      await createClass(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should return 403 for non-teacher users', async () => {
      mockReq.body = { name: 'Test Class' };
      mockReq.user = { id: 'student123', roles: ['student'] };

      await createClass(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Only teachers can create classes'
      });
    });
  });

  describe('getMyClasses', () => {
    it('should return teacher classes', async () => {
      mockReq.user = { id: 'teacher123', roles: ['teacher'] };

      const mockClasses = [
        { _id: 'class1', name: 'Math Class', teacher: 'teacher123' },
        { _id: 'class2', name: 'Science Class', teacher: 'teacher123' }
      ];

      MockedClass.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockClasses)
      });

      await getMyClasses(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { classes: mockClasses }
      });
    });

    it('should return student classes', async () => {
      mockReq.user = { id: 'student123', roles: ['student'] };

      const mockClasses = [
        { _id: 'class1', name: 'Math Class', students: [{ user: 'student123' }] }
      ];

      MockedClass.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockClasses)
      });

      await getMyClasses(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { classes: mockClasses }
      });
    });
  });

  describe('joinClass', () => {
    it('should allow student to join class', async () => {
      const joinCode = 'ABC123';
      mockReq.body = { joinCode };
      mockReq.user = { id: 'student123', roles: ['student'] };

      const mockClass = {
        _id: 'class123',
        name: 'Test Class',
        joinCode,
        students: [],
        settings: { requireApproval: false },
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue({
          _id: 'class123',
          name: 'Test Class',
          teacher: { profile: { name: 'Test Teacher' } }
        })
      };

      MockedClass.findOne = jest.fn().mockResolvedValue(mockClass);

      await joinClass(mockReq, mockRes, mockNext);

      expect(mockClass.students).toHaveLength(1);
      expect(mockClass.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 for invalid join code', async () => {
      mockReq.body = { joinCode: 'INVALID' };
      mockReq.user = { id: 'student123', roles: ['student'] };

      MockedClass.findOne = jest.fn().mockResolvedValue(null);

      await joinClass(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Class not found with this join code'
      });
    });

    it('should prevent duplicate enrollment', async () => {
      const joinCode = 'ABC123';
      mockReq.body = { joinCode };
      mockReq.user = { id: 'student123', roles: ['student'] };

      const mockClass = {
        _id: 'class123',
        joinCode,
        students: [{ user: 'student123', status: 'approved' }]
      };

      MockedClass.findOne = jest.fn().mockResolvedValue(mockClass);

      await joinClass(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'You are already enrolled in this class'
      });
    });
  });

  describe('Group Management', () => {
    describe('createGroup', () => {
      it('should create a new group', async () => {
        const groupData = {
          name: 'Study Group A',
          description: 'A study group',
          settings: { maxMembers: 6, isPublic: true }
        };

        mockReq.params = { classId: 'class123' };
        mockReq.body = groupData;
        mockReq.user = { id: 'teacher123', roles: ['teacher'] };

        const mockClass = {
          _id: 'class123',
          teacher: 'teacher123'
        };

        const mockGroup = {
          _id: 'group123',
          ...groupData,
          class: 'class123',
          teacher: 'teacher123',
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockResolvedValue({
            _id: 'group123',
            ...groupData,
            class: { name: 'Test Class' }
          })
        };

        MockedClass.findById = jest.fn().mockResolvedValue(mockClass);
        MockedGroup.prototype.constructor = jest.fn().mockReturnValue(mockGroup);
        MockedGroup.prototype.save = jest.fn().mockResolvedValue(mockGroup);

        await createGroup(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          message: 'Group created successfully',
          data: { group: expect.any(Object) }
        });
      });

      it('should return 403 for non-teachers', async () => {
        mockReq.params = { classId: 'class123' };
        mockReq.user = { id: 'student123', roles: ['student'] };

        await createGroup(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
      });
    });

    describe('getClassGroups', () => {
      it('should return groups for a class', async () => {
        mockReq.params = { classId: 'class123' };
        mockReq.user = { id: 'teacher123', roles: ['teacher'] };

        const mockClass = {
          _id: 'class123',
          teacher: 'teacher123'
        };

        const mockGroups = [
          { _id: 'group1', name: 'Group A', class: 'class123' },
          { _id: 'group2', name: 'Group B', class: 'class123' }
        ];

        MockedClass.findById = jest.fn().mockResolvedValue(mockClass);
        MockedGroup.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockGroups)
        });

        await getClassGroups(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          data: { groups: mockGroups }
        });
      });
    });

    describe('deleteGroup', () => {
      it('should delete a group', async () => {
        mockReq.params = { groupId: 'group123' };
        mockReq.user = { id: 'teacher123', roles: ['teacher'] };

        const mockGroup = {
          _id: 'group123',
          teacher: 'teacher123',
          class: 'class123'
        };

        MockedGroup.findById = jest.fn().mockResolvedValue(mockGroup);
        MockedGroup.findByIdAndDelete = jest.fn().mockResolvedValue(mockGroup);

        await deleteGroup(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          message: 'Group deleted successfully'
        });
      });

      it('should return 403 for unauthorized deletion', async () => {
        mockReq.params = { groupId: 'group123' };
        mockReq.user = { id: 'other-teacher', roles: ['teacher'] };

        const mockGroup = {
          _id: 'group123',
          teacher: 'teacher123'
        };

        MockedGroup.findById = jest.fn().mockResolvedValue(mockGroup);

        await deleteGroup(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
      });
    });
  });

  describe('Student Management', () => {
    describe('approveStudent', () => {
      it('should approve a pending student', async () => {
        mockReq.params = { classId: 'class123', studentId: 'student123' };
        mockReq.user = { id: 'teacher123', roles: ['teacher'] };

        const mockStudent = { user: 'student123', status: 'pending' };
        const mockClass = {
          _id: 'class123',
          teacher: 'teacher123',
          students: [mockStudent],
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockResolvedValue({
            _id: 'class123',
            students: [{ ...mockStudent, status: 'approved' }]
          })
        };

        MockedClass.findById = jest.fn().mockResolvedValue(mockClass);

        await approveStudent(mockReq, mockRes, mockNext);

        expect(mockStudent.status).toBe('approved');
        expect(mockClass.save).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });

    describe('removeStudentFromClass', () => {
      it('should remove a student from class', async () => {
        mockReq.params = { classId: 'class123', studentId: 'student123' };
        mockReq.user = { id: 'teacher123', roles: ['teacher'] };

        const mockClass = {
          _id: 'class123',
          teacher: 'teacher123',
          students: [{ user: 'student123', status: 'approved' }],
          save: jest.fn().mockResolvedValue(true)
        };

        MockedClass.findById = jest.fn().mockResolvedValue(mockClass);

        await removeStudentFromClass(mockReq, mockRes, mockNext);

        expect(mockClass.students).toHaveLength(0);
        expect(mockClass.save).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
      });
    });
  });
});