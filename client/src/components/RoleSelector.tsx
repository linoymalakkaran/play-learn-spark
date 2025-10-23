import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Users, GraduationCap, Baby } from 'lucide-react';

const RoleSelector: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const roles = [
    { value: 'child', label: 'Student', icon: User, color: 'bg-blue-500', description: 'Learn and explore' },
    { value: 'parent', label: 'Parent', icon: Baby, color: 'bg-green-500', description: 'Monitor children\'s progress' },
    { value: 'educator', label: 'Teacher', icon: GraduationCap, color: 'bg-purple-500', description: 'Create and teach' },
    { value: 'admin', label: 'Admin', icon: Users, color: 'bg-red-500', description: 'System administration' }
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Current Role Information</CardTitle>
        <CardDescription>
          Your current role determines which features and dashboards you can access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
          <div>
            <h3 className="font-semibold">Current User</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">{user.profile?.firstName} {user.profile?.lastName}</p>
          </div>
          <Badge variant="default" className="flex items-center gap-1">
            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'No Role Set'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isCurrentRole = user.role === role.value;
            
            return (
              <div 
                key={role.value}
                className={`p-4 border rounded-lg transition-all ${
                  isCurrentRole 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${role.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{role.label}</h4>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>
                {isCurrentRole && (
                  <Badge variant="default" className="mt-2">
                    Active Role
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 border rounded-lg bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-2">Role-Based Features:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Student:</strong> Access learning activities, assignments, and progress tracking</li>
            <li>• <strong>Parent:</strong> Monitor multiple children, communicate with teachers, manage safety settings</li>
            <li>• <strong>Teacher:</strong> Create activities, manage classes, assign homework, view analytics</li>
            <li>• <strong>Admin:</strong> System administration and user management</li>
          </ul>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Note: This is a demonstration of the role-based system. In production, roles would be managed by administrators.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleSelector;