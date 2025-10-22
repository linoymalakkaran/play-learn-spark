import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  resource: string;
  action: string;
  description?: string;
  conditions?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 100
  },
  resource: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  action: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  conditions: Schema.Types.Mixed, // JSON conditions for advanced permission logic
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Indexes
permissionSchema.index({ name: 1 }, { unique: true });
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ isActive: 1 });

export const Permission = model<IPermission>('Permission', permissionSchema);

// Role-based permissions interface
export interface IRolePermission extends Document {
  role: 'parent' | 'child' | 'educator' | 'admin' | 'guest';
  permissions: ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const rolePermissionSchema = new Schema<IRolePermission>({
  role: {
    type: String,
    enum: ['parent', 'child', 'educator', 'admin', 'guest'],
    required: true,
    unique: true
  },
  permissions: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Permission' 
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

rolePermissionSchema.index({ role: 1 }, { unique: true });
rolePermissionSchema.index({ isActive: 1 });

export const RolePermission = model<IRolePermission>('RolePermission', rolePermissionSchema);

// Initialize default permissions
export const initializeDefaultPermissions = async () => {
  try {
    const defaultPermissions = [
      // User Management
      { name: 'view_own_profile', resource: 'user', action: 'view_own', description: 'View own user profile' },
      { name: 'edit_own_profile', resource: 'user', action: 'edit_own', description: 'Edit own user profile' },
      { name: 'delete_own_account', resource: 'user', action: 'delete_own', description: 'Delete own user account' },
      { name: 'view_all_users', resource: 'user', action: 'view_all', description: 'View all user profiles (admin only)' },
      { name: 'edit_any_user', resource: 'user', action: 'edit_any', description: 'Edit any user profile (admin only)' },
      { name: 'delete_any_user', resource: 'user', action: 'delete_any', description: 'Delete any user account (admin only)' },

      // Activity Management
      { name: 'create_activity', resource: 'activity', action: 'create', description: 'Create new activities' },
      { name: 'view_activity', resource: 'activity', action: 'view', description: 'View activities' },
      { name: 'edit_own_activity', resource: 'activity', action: 'edit_own', description: 'Edit own created activities' },
      { name: 'edit_any_activity', resource: 'activity', action: 'edit_any', description: 'Edit any activity (admin only)' },
      { name: 'delete_own_activity', resource: 'activity', action: 'delete_own', description: 'Delete own created activities' },
      { name: 'delete_any_activity', resource: 'activity', action: 'delete_any', description: 'Delete any activity (admin only)' },
      { name: 'publish_activity', resource: 'activity', action: 'publish', description: 'Publish activities to platform' },
      { name: 'complete_activity', resource: 'activity', action: 'complete', description: 'Complete and interact with activities' },

      // Class Management
      { name: 'create_class', resource: 'class', action: 'create', description: 'Create new classes' },
      { name: 'view_own_classes', resource: 'class', action: 'view_own', description: 'View own classes' },
      { name: 'view_enrolled_classes', resource: 'class', action: 'view_enrolled', description: 'View enrolled classes' },
      { name: 'edit_own_class', resource: 'class', action: 'edit_own', description: 'Edit own created classes' },
      { name: 'delete_own_class', resource: 'class', action: 'delete_own', description: 'Delete own created classes' },
      { name: 'manage_class_members', resource: 'class', action: 'manage_members', description: 'Add/remove class members' },
      { name: 'join_class', resource: 'class', action: 'join', description: 'Join classes using invitation codes' },

      // Assignment Management
      { name: 'create_assignment', resource: 'assignment', action: 'create', description: 'Create assignments' },
      { name: 'view_own_assignments', resource: 'assignment', action: 'view_own', description: 'View own created assignments' },
      { name: 'view_assigned_assignments', resource: 'assignment', action: 'view_assigned', description: 'View assigned assignments' },
      { name: 'edit_own_assignment', resource: 'assignment', action: 'edit_own', description: 'Edit own created assignments' },
      { name: 'delete_own_assignment', resource: 'assignment', action: 'delete_own', description: 'Delete own created assignments' },
      { name: 'submit_assignment', resource: 'assignment', action: 'submit', description: 'Submit assignment solutions' },
      { name: 'grade_assignment', resource: 'assignment', action: 'grade', description: 'Grade student assignments' },

      // Progress Tracking
      { name: 'view_own_progress', resource: 'progress', action: 'view_own', description: 'View own learning progress' },
      { name: 'view_child_progress', resource: 'progress', action: 'view_child', description: 'View child\'s learning progress' },
      { name: 'view_student_progress', resource: 'progress', action: 'view_student', description: 'View student learning progress' },
      { name: 'view_class_progress', resource: 'progress', action: 'view_class', description: 'View class-wide progress analytics' },
      { name: 'export_progress', resource: 'progress', action: 'export', description: 'Export progress reports' },

      // Communication
      { name: 'send_message', resource: 'message', action: 'send', description: 'Send messages to other users' },
      { name: 'view_own_messages', resource: 'message', action: 'view_own', description: 'View own messages' },
      { name: 'delete_own_message', resource: 'message', action: 'delete_own', description: 'Delete own messages' },
      { name: 'moderate_messages', resource: 'message', action: 'moderate', description: 'Moderate platform messages (admin only)' },

      // Relationship Management
      { name: 'create_invitation', resource: 'relationship', action: 'create_invitation', description: 'Create relationship invitations' },
      { name: 'accept_invitation', resource: 'relationship', action: 'accept_invitation', description: 'Accept relationship invitations' },
      { name: 'view_own_relationships', resource: 'relationship', action: 'view_own', description: 'View own relationships' },
      { name: 'manage_own_relationships', resource: 'relationship', action: 'manage_own', description: 'Manage own relationships' },

      // Analytics and Reporting
      { name: 'view_basic_analytics', resource: 'analytics', action: 'view_basic', description: 'View basic analytics' },
      { name: 'view_advanced_analytics', resource: 'analytics', action: 'view_advanced', description: 'View advanced analytics' },
      { name: 'export_analytics', resource: 'analytics', action: 'export', description: 'Export analytics data' },

      // Content Management
      { name: 'manage_content', resource: 'content', action: 'manage', description: 'Manage platform content' },
      { name: 'moderate_content', resource: 'content', action: 'moderate', description: 'Moderate user-generated content' },

      // System Administration
      { name: 'view_system_logs', resource: 'system', action: 'view_logs', description: 'View system logs' },
      { name: 'manage_platform_settings', resource: 'system', action: 'manage_settings', description: 'Manage platform settings' },
      { name: 'backup_data', resource: 'system', action: 'backup', description: 'Create data backups' }
    ];

    // Insert permissions if they don't exist
    for (const perm of defaultPermissions) {
      await Permission.findOneAndUpdate(
        { name: perm.name },
        perm,
        { upsert: true, new: true }
      );
    }

    // Define default role permissions
    const rolePermissions = {
      admin: [
        // Admin has all permissions
        'view_own_profile', 'edit_own_profile', 'delete_own_account',
        'view_all_users', 'edit_any_user', 'delete_any_user',
        'create_activity', 'view_activity', 'edit_any_activity', 'delete_any_activity', 'publish_activity', 'complete_activity',
        'create_class', 'view_own_classes', 'edit_own_class', 'delete_own_class', 'manage_class_members',
        'create_assignment', 'view_own_assignments', 'edit_own_assignment', 'delete_own_assignment', 'grade_assignment',
        'view_own_progress', 'view_child_progress', 'view_student_progress', 'view_class_progress', 'export_progress',
        'send_message', 'view_own_messages', 'delete_own_message', 'moderate_messages',
        'create_invitation', 'accept_invitation', 'view_own_relationships', 'manage_own_relationships',
        'view_advanced_analytics', 'export_analytics',
        'manage_content', 'moderate_content',
        'view_system_logs', 'manage_platform_settings', 'backup_data'
      ],
      educator: [
        'view_own_profile', 'edit_own_profile', 'delete_own_account',
        'create_activity', 'view_activity', 'edit_own_activity', 'delete_own_activity', 'publish_activity', 'complete_activity',
        'create_class', 'view_own_classes', 'edit_own_class', 'delete_own_class', 'manage_class_members',
        'create_assignment', 'view_own_assignments', 'edit_own_assignment', 'delete_own_assignment', 'grade_assignment',
        'view_own_progress', 'view_student_progress', 'view_class_progress', 'export_progress',
        'send_message', 'view_own_messages', 'delete_own_message',
        'create_invitation', 'accept_invitation', 'view_own_relationships', 'manage_own_relationships',
        'view_advanced_analytics', 'export_analytics'
      ],
      parent: [
        'view_own_profile', 'edit_own_profile', 'delete_own_account',
        'view_activity', 'complete_activity',
        'view_enrolled_classes', 'join_class',
        'view_assigned_assignments', 'submit_assignment',
        'view_own_progress', 'view_child_progress', 'export_progress',
        'send_message', 'view_own_messages', 'delete_own_message',
        'create_invitation', 'accept_invitation', 'view_own_relationships', 'manage_own_relationships',
        'view_basic_analytics'
      ],
      child: [
        'view_own_profile', 'edit_own_profile',
        'view_activity', 'complete_activity',
        'view_enrolled_classes', 'join_class',
        'view_assigned_assignments', 'submit_assignment',
        'view_own_progress',
        'send_message', 'view_own_messages', 'delete_own_message',
        'accept_invitation', 'view_own_relationships'
      ],
      guest: [
        'view_activity', 'complete_activity',
        'view_own_progress'
      ]
    };

    // Create role permissions
    for (const [role, permissionNames] of Object.entries(rolePermissions)) {
      const permissions = await Permission.find({ name: { $in: permissionNames } });
      const permissionIds = permissions.map(p => p._id);

      await RolePermission.findOneAndUpdate(
        { role },
        { 
          role, 
          permissions: permissionIds, 
          isActive: true 
        },
        { upsert: true, new: true }
      );
    }

    console.log('✅ Default permissions and role permissions initialized');
  } catch (error) {
    console.error('❌ Failed to initialize default permissions:', error);
    throw error;
  }
};

export default Permission;