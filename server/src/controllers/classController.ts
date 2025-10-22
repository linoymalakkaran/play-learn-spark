import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { classService, CreateClassData, CreateGroupData } from '../services/classService';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    userId?: string;
    role: string;
    email: string;
  };
}

// Helper function to get user ID compatible with both SQLite and MongoDB
const getUserId = (req: AuthenticatedRequest): string => {
  return req.user?.id || req.user?.userId || '';
};

// Helper function to validate ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Class Management Controllers
export const createClass = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create classes'
      });
    }

    const teacherId = getUserId(req);
    const classData: CreateClassData = req.body;

    const newClass = await classService.createClass(teacherId as any, classData);

    return res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: { 
        class: newClass,
        joinCode: newClass.joinCode
      }
    });
  } catch (error) {
    logger.error('Create class error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create class'
    });
  }
};

export const joinClass = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (req.user?.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can join classes'
      });
    }

    const { joinCode } = req.body;
    const studentId = getUserId(req);

    const classDoc = await classService.joinClassWithCode(joinCode, studentId as any);

    return res.json({
      success: true,
      message: 'Successfully joined class',
      data: { class: classDoc }
    });
  } catch (error) {
    logger.error('Join class error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to join class'
    });
  }
};

export const getMyClasses = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = getUserId(req);
    const userRole = req.user!.role;

    let classes;
    if (userRole === 'teacher') {
      classes = await classService.getTeacherClasses(userId as any);
    } else if (userRole === 'student') {
      classes = await classService.getStudentClasses(userId as any);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and students can access classes'
      });
    }

    return res.json({
      success: true,
      data: { classes }
    });
  } catch (error) {
    logger.error('Get classes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get classes'
    });
  }
};

export const getClassById = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { classId } = req.params;
    const userId = getUserId(req);

    if (!isValidObjectId(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID'
      });
    }

    const classDoc = await classService.getClassById(classId as any, userId as any);

    return res.json({
      success: true,
      data: { class: classDoc }
    });
  } catch (error) {
    logger.error('Get class error:', error);
    const statusCode = error instanceof Error && error.message === 'Access denied to this class' ? 403 : 
                      error instanceof Error && error.message === 'Class not found' ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get class'
    });
  }
};

export const updateClass = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { classId } = req.params;
    const teacherId = getUserId(req);
    const updates = req.body;

    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can update classes'
      });
    }

    if (!isValidObjectId(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID'
      });
    }

    const updatedClass = await classService.updateClass(classId as any, teacherId as any, updates);

    return res.json({
      success: true,
      message: 'Class updated successfully',
      data: { class: updatedClass }
    });
  } catch (error) {
    logger.error('Update class error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update class'
    });
  }
};

export const addStudentToClass = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;
    const teacherId = getUserId(req);

    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can add students to classes'
      });
    }

    if (!isValidObjectId(classId) || !isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID or student ID'
      });
    }

    await classService.addStudentToClass(classId as any, studentId as any, teacherId as any);

    return res.json({
      success: true,
      message: 'Student added to class successfully'
    });
  } catch (error) {
    logger.error('Add student error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add student to class'
    });
  }
};

export const approveStudent = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { classId, studentId } = req.params;
    const teacherId = getUserId(req);

    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can approve student enrollments'
      });
    }

    if (!isValidObjectId(classId) || !isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID or student ID'
      });
    }

    await classService.approveStudentEnrollment(classId as any, studentId as any, teacherId as any);

    return res.json({
      success: true,
      message: 'Student enrollment approved'
    });
  } catch (error) {
    logger.error('Approve student error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to approve student'
    });
  }
};

export const removeStudentFromClass = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { classId, studentId } = req.params;
    const requesterId = getUserId(req);

    if (!isValidObjectId(classId) || !isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID or student ID'
      });
    }

    await classService.removeStudentFromClass(classId as any, studentId as any, requesterId as any);

    return res.json({
      success: true,
      message: 'Student removed from class'
    });
  } catch (error) {
    logger.error('Remove student error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to remove student'
    });
  }
};

export const regenerateJoinCode = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { classId } = req.params;
    const teacherId = getUserId(req);

    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can regenerate join codes'
      });
    }

    if (!isValidObjectId(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID'
      });
    }

    const newCode = await classService.regenerateJoinCode(classId as any, teacherId as any);

    return res.json({
      success: true,
      message: 'Join code regenerated',
      data: { joinCode: newCode }
    });
  } catch (error) {
    logger.error('Regenerate join code error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to regenerate join code'
    });
  }
};

export const archiveClass = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { classId } = req.params;
    const teacherId = getUserId(req);

    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can archive classes'
      });
    }

    if (!isValidObjectId(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID'
      });
    }

    await classService.archiveClass(classId as any, teacherId as any);

    return res.json({
      success: true,
      message: 'Class archived successfully'
    });
  } catch (error) {
    logger.error('Archive class error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to archive class'
    });
  }
};

// Group Management Controllers
export const createGroup = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { classId } = req.params;
    const teacherId = getUserId(req);
    const groupData: CreateGroupData = req.body;

    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create groups'
      });
    }

    if (!isValidObjectId(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID'
      });
    }

    const group = await classService.createGroup(classId as any, teacherId as any, groupData);

    return res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group }
    });
  } catch (error) {
    logger.error('Create group error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create group'
    });
  }
};

export const getClassGroups = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { classId } = req.params;
    const userId = getUserId(req);

    if (!isValidObjectId(classId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID'
      });
    }

    // Verify user has access to this class
    await classService.getClassById(classId as any, userId as any);
    
    const groups = await classService.getClassGroups(classId as any);

    return res.json({
      success: true,
      data: { groups }
    });
  } catch (error) {
    logger.error('Get groups error:', error);
    const statusCode = error instanceof Error && error.message === 'Access denied to this class' ? 403 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get groups'
    });
  }
};

export const addMemberToGroup = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { groupId } = req.params;
    const { userId, role = 'member' } = req.body;
    const teacherId = getUserId(req);

    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can add members to groups'
      });
    }

    if (!isValidObjectId(groupId) || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID or user ID'
      });
    }

    await classService.addMemberToGroup(groupId as any, userId as any, teacherId as any, role);

    return res.json({
      success: true,
      message: 'Member added to group successfully'
    });
  } catch (error) {
    logger.error('Add member to group error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add member to group'
    });
  }
};

export const removeMemberFromGroup = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { groupId, userId } = req.params;
    const requesterId = getUserId(req);

    if (!isValidObjectId(groupId) || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID or user ID'
      });
    }

    await classService.removeMemberFromGroup(groupId as any, userId as any, requesterId as any);

    return res.json({
      success: true,
      message: 'Member removed from group'
    });
  } catch (error) {
    logger.error('Remove member from group error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to remove member from group'
    });
  }
};

export const updateGroup = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { groupId } = req.params;
    const teacherId = getUserId(req);
    const updates = req.body;

    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can update groups'
      });
    }

    if (!isValidObjectId(groupId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID'
      });
    }

    const updatedGroup = await classService.updateGroup(groupId as any, teacherId as any, updates);

    return res.json({
      success: true,
      message: 'Group updated successfully',
      data: { group: updatedGroup }
    });
  } catch (error) {
    logger.error('Update group error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update group'
    });
  }
};

export const deleteGroup = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { groupId } = req.params;
    const teacherId = getUserId(req);

    if (req.user?.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can delete groups'
      });
    }

    if (!isValidObjectId(groupId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID'
      });
    }

    await classService.deleteGroup(groupId as any, teacherId as any);

    return res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    logger.error('Delete group error:', error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete group'
    });
  }
};

export const getUserGroups = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const userId = getUserId(req);
    const groups = await classService.getUserGroups(userId as any);

    return res.json({
      success: true,
      data: { groups }
    });
  } catch (error) {
    logger.error('Get user groups error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user groups'
    });
  }
};

export const previewClass = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { joinCode } = req.body;
    const userId = getUserId(req);

    if (!joinCode) {
      return res.status(400).json({
        success: false,
        message: 'Join code is required'
      });
    }

    // Get class preview without joining
    const classPreview = await classService.previewClassByJoinCode(joinCode, userId as any);

    return res.json({
      success: true,
      data: { class: classPreview }
    });
  } catch (error) {
    logger.error('Preview class error:', error);
    const statusCode = error instanceof Error && error.message === 'Class not found' ? 404 : 
                      error instanceof Error && error.message.includes('not active') ? 410 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to preview class'
    });
  }
};