import { apiService, ApiResponse } from './apiService';

export interface CreateClassData {
  name: string;
  subject: string;
  gradeLevel: string;
  description?: string;
  maxStudents?: number;
  requireApproval: boolean;
  allowLateSubmissions: boolean;
  autoGenJoinCode: boolean;
  color: string;
  tags?: string[];
  meetingDays: string[];
  startTime?: string;
  endTime?: string;
  classroom?: string;
  semester: string;
  startDate: string;
  endDate: string;
}

export interface ClassData {
  _id: string;
  name: string;
  subject: string;
  gradeLevel: string;
  description?: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
  };
  students: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    enrolledAt: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  joinCode: string;
  settings: {
    maxStudents?: number;
    requireApproval: boolean;
    allowLateSubmissions: boolean;
    autoGenJoinCode: boolean;
    color: string;
    tags?: string[];
  };
  schedule: {
    meetingDays: string[];
    startTime?: string;
    endTime?: string;
    classroom?: string;
    semester: string;
    startDate: string;
    endDate: string;
  };
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupData {
  _id: string;
  name: string;
  description?: string;
  class: string;
  members: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    role: 'leader' | 'member';
    joinedAt: string;
  }>;
  settings: {
    color?: string;
    isPublic: boolean;
    maxMembers?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JoinClassData {
  joinCode: string;
}

export interface UpdateClassData extends Partial<CreateClassData> {
  isActive?: boolean;
  isArchived?: boolean;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  settings?: {
    color?: string;
    isPublic?: boolean;
    maxMembers?: number;
  };
}

class ClassService {
  async createClass(data: CreateClassData): Promise<ClassData> {
    const response = await apiService.post<{ class: ClassData }>('/classes', data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create class');
    }
    return response.data!.class;
  }

  async getMyClasses(): Promise<ClassData[]> {
    const response = await apiService.get<{ classes: ClassData[] }>('/classes');
    if (!response.success) {
      throw new Error(response.error || 'Failed to get classes');
    }
    return response.data!.classes;
  }

  async getClassById(classId: string): Promise<ClassData> {
    const response = await apiService.get<{ class: ClassData }>(`/classes/${classId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get class');
    }
    return response.data!.class;
  }

  async updateClass(classId: string, data: UpdateClassData): Promise<ClassData> {
    const response = await apiService.put<{ class: ClassData }>(`/classes/${classId}`, data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update class');
    }
    return response.data!.class;
  }

  async joinClass(data: JoinClassData): Promise<ClassData> {
    const response = await apiService.post<{ class: ClassData }>('/classes/join', data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to join class');
    }
    return response.data!.class;
  }

  async previewClass(joinCode: string): Promise<ClassData> {
    const response = await apiService.post<{ class: ClassData }>('/classes/preview', { joinCode });
    if (!response.success) {
      throw new Error(response.error || 'Failed to preview class');
    }
    return response.data!.class;
  }

  async addStudentToClass(classId: string, studentId: string): Promise<void> {
    const response = await apiService.post(`/classes/${classId}/students`, { studentId });
    if (!response.success) {
      throw new Error(response.error || 'Failed to add student to class');
    }
  }

  async approveStudent(classId: string, studentId: string): Promise<void> {
    const response = await apiService.put(`/classes/${classId}/students/${studentId}/approve`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to approve student');
    }
  }

  async removeStudentFromClass(classId: string, studentId: string): Promise<void> {
    const response = await apiService.delete(`/classes/${classId}/students/${studentId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove student from class');
    }
  }

  async regenerateJoinCode(classId: string): Promise<string> {
    const response = await apiService.post<{ joinCode: string }>(`/classes/${classId}/regenerate-code`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to regenerate join code');
    }
    return response.data!.joinCode;
  }

  async archiveClass(classId: string): Promise<void> {
    const response = await apiService.post(`/classes/${classId}/archive`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to archive class');
    }
  }

  // Group Management
  async createGroup(classId: string, data: CreateGroupData): Promise<GroupData> {
    const response = await apiService.post<{ group: GroupData }>(`/classes/${classId}/groups`, data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create group');
    }
    return response.data!.group;
  }

  async getClassGroups(classId: string): Promise<GroupData[]> {
    const response = await apiService.get<{ groups: GroupData[] }>(`/classes/${classId}/groups`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get groups');
    }
    return response.data!.groups;
  }

  async getUserGroups(): Promise<GroupData[]> {
    const response = await apiService.get<{ groups: GroupData[] }>('/groups/my-groups');
    if (!response.success) {
      throw new Error(response.error || 'Failed to get user groups');
    }
    return response.data!.groups;
  }

  async addMemberToGroup(groupId: string, userId: string, role: 'leader' | 'member' = 'member'): Promise<void> {
    const response = await apiService.post(`/groups/${groupId}/members`, { userId, role });
    if (!response.success) {
      throw new Error(response.error || 'Failed to add member to group');
    }
  }

  async removeMemberFromGroup(groupId: string, userId: string): Promise<void> {
    const response = await apiService.delete(`/groups/${groupId}/members/${userId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove member from group');
    }
  }

  async updateGroup(groupId: string, data: Partial<CreateGroupData>): Promise<GroupData> {
    const response = await apiService.put<{ group: GroupData }>(`/groups/${groupId}`, data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update group');
    }
    return response.data!.group;
  }

  async deleteGroup(groupId: string): Promise<void> {
    const response = await apiService.delete(`/groups/${groupId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete group');
    }
  }

  // Analytics methods (placeholder - to be implemented when backend is ready)
  async getClassAnalytics(classId: string): Promise<any> {
    const response = await apiService.get(`/classes/${classId}/analytics`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get class analytics');
    }
    return response.data;
  }

  async getStudentProgress(classId: string, studentId: string): Promise<any> {
    const response = await apiService.get(`/classes/${classId}/students/${studentId}/progress`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get student progress');
    }
    return response.data;
  }
}

export const classService = new ClassService();