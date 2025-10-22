import { apiService } from './apiService';

export interface CreateInvitationRequest {
  recipientEmail: string;
  relationshipType: 'parent-child' | 'teacher-student' | 'guardian-child' | 'sibling' | 'peer';
  message?: string;
  permissions?: Record<string, boolean>;
  timeRestrictions?: {
    dailyLimit?: number;
    weeklyLimit?: number;
    allowedDays?: string[];
    allowedTimeSlots?: { start: string; end: string; }[];
    timezone?: string;
  };
  expiresInHours?: number;
}

export interface RelationshipPermissions {
  viewProgress: boolean;
  viewActivities: boolean;
  manageActivities: boolean;
  receiveNotifications: boolean;
  communicateDirectly: boolean;
  viewReports: boolean;
  approveRewards: boolean;
  setTimeRestrictions: boolean;
}

class RelationshipService {
  private baseURL = '/api/relationships';

  /**
   * Create a new relationship invitation
   */
  async createInvitation(request: CreateInvitationRequest) {
    const response = await apiService.post(`${this.baseURL}/invite`, request);
    return response.data;
  }

  /**
   * Accept a relationship invitation
   */
  async acceptInvitation(invitationCode: string) {
    const response = await apiService.post(`${this.baseURL}/accept/${invitationCode}`);
    return response.data;
  }

  /**
   * Decline a relationship invitation
   */
  async declineInvitation(invitationCode: string, reason?: string) {
    const response = await apiService.post(`${this.baseURL}/decline/${invitationCode}`, { reason });
    return response.data;
  }

  /**
   * Get user's relationships
   */
  async getUserRelationships(includeInactive = false) {
    const response = await apiService.get(`${this.baseURL}?includeInactive=${includeInactive}`);
    return response.data;
  }

  /**
   * Get pending invitations for user
   */
  async getPendingInvitations() {
    const response = await apiService.get(`${this.baseURL}/pending`);
    return response.data;
  }

  /**
   * Get invitation details by code
   */
  async getInvitationDetails(invitationCode: string) {
    const response = await apiService.get(`${this.baseURL}/invitation/${invitationCode}`);
    return response.data;
  }

  /**
   * Update relationship permissions
   */
  async updatePermissions(relationshipId: string, permissions: Partial<RelationshipPermissions>) {
    const response = await apiService.put(`${this.baseURL}/${relationshipId}/permissions`, { permissions });
    return response.data;
  }

  /**
   * Remove a relationship
   */
  async removeRelationship(relationshipId: string, reason?: string) {
    const response = await apiService.delete(`${this.baseURL}/${relationshipId}`, { 
      data: { reason } 
    });
    return response.data;
  }

  /**
   * Get parent's children
   */
  async getParentChildren() {
    const response = await apiService.get(`${this.baseURL}/parent/children`);
    return response.data;
  }

  /**
   * Get teacher's students
   */
  async getTeacherStudents() {
    const response = await apiService.get(`${this.baseURL}/teacher/students`);
    return response.data;
  }

  /**
   * Get relationship statistics
   */
  async getRelationshipStats() {
    const response = await apiService.get(`${this.baseURL}/stats`);
    return response.data;
  }

  /**
   * Validate invitation code format
   */
  validateInvitationCode(code: string): boolean {
    return /^[A-Z0-9]{8}$/.test(code);
  }

  /**
   * Check if invitation is expired
   */
  isInvitationExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  /**
   * Get time until invitation expires
   */
  getTimeUntilExpiry(expiresAt: string): string {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Expired';
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} remaining`;
    }
  }

  /**
   * Generate invitation URL for sharing
   */
  generateInvitationUrl(invitationCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/relationships/accept/${invitationCode}`;
  }

  /**
   * Get relationship type permissions defaults
   */
  getDefaultPermissions(relationshipType: string): RelationshipPermissions {
    const defaults = {
      'parent-child': {
        viewProgress: true,
        viewActivities: true,
        manageActivities: true,
        receiveNotifications: true,
        communicateDirectly: true,
        viewReports: true,
        approveRewards: true,
        setTimeRestrictions: true
      },
      'guardian-child': {
        viewProgress: true,
        viewActivities: true,
        manageActivities: true,
        receiveNotifications: true,
        communicateDirectly: true,
        viewReports: true,
        approveRewards: true,
        setTimeRestrictions: true
      },
      'teacher-student': {
        viewProgress: true,
        viewActivities: true,
        manageActivities: true,
        receiveNotifications: true,
        communicateDirectly: true,
        viewReports: true,
        approveRewards: false,
        setTimeRestrictions: false
      },
      'sibling': {
        viewProgress: false,
        viewActivities: false,
        manageActivities: false,
        receiveNotifications: false,
        communicateDirectly: true,
        viewReports: false,
        approveRewards: false,
        setTimeRestrictions: false
      },
      'peer': {
        viewProgress: false,
        viewActivities: false,
        manageActivities: false,
        receiveNotifications: false,
        communicateDirectly: true,
        viewReports: false,
        approveRewards: false,
        setTimeRestrictions: false
      }
    };

    return defaults[relationshipType as keyof typeof defaults] || defaults['peer'];
  }

  /**
   * Validate relationship permissions
   */
  validatePermissions(permissions: Partial<RelationshipPermissions>): string[] {
    const errors: string[] = [];
    
    // If someone can manage activities, they should be able to view them
    if (permissions.manageActivities && !permissions.viewActivities) {
      errors.push('To manage activities, viewing activities must also be enabled');
    }

    // If someone can set time restrictions, they should be able to view progress
    if (permissions.setTimeRestrictions && !permissions.viewProgress) {
      errors.push('To set time restrictions, viewing progress must also be enabled');
    }

    // If someone can approve rewards, they should be able to view progress
    if (permissions.approveRewards && !permissions.viewProgress) {
      errors.push('To approve rewards, viewing progress must also be enabled');
    }

    return errors;
  }

  /**
   * Get user role appropriate relationship types
   */
  getAvailableRelationshipTypes(userRole: string): { value: string; label: string; description: string }[] {
    const types = {
      parent: [
        { 
          value: 'parent-child', 
          label: 'Parent-Child', 
          description: 'Full parental control with all permissions' 
        },
        { 
          value: 'guardian-child', 
          label: 'Guardian-Child', 
          description: 'Guardian relationship with full supervisory access' 
        }
      ],
      educator: [
        { 
          value: 'teacher-student', 
          label: 'Teacher-Student', 
          description: 'Educational relationship for classroom management' 
        }
      ],
      child: [
        { 
          value: 'sibling', 
          label: 'Sibling', 
          description: 'Sibling connection for communication and sharing' 
        },
        { 
          value: 'peer', 
          label: 'Peer', 
          description: 'Friend connection for collaboration' 
        }
      ],
      admin: [
        { 
          value: 'parent-child', 
          label: 'Parent-Child', 
          description: 'Full parental control with all permissions' 
        },
        { 
          value: 'teacher-student', 
          label: 'Teacher-Student', 
          description: 'Educational relationship for classroom management' 
        },
        { 
          value: 'guardian-child', 
          label: 'Guardian-Child', 
          description: 'Guardian relationship with full supervisory access' 
        },
        { 
          value: 'sibling', 
          label: 'Sibling', 
          description: 'Sibling connection for communication and sharing' 
        },
        { 
          value: 'peer', 
          label: 'Peer', 
          description: 'Friend connection for collaboration' 
        }
      ]
    };

    return types[userRole as keyof typeof types] || types.child;
  }
}

export const relationshipService = new RelationshipService();
export default relationshipService;