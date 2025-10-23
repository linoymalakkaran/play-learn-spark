import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import TeacherDashboard from './TeacherDashboard';
import ParentDashboard from './ParentDashboard';
import StudentDashboard from './StudentDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Settings } from 'lucide-react';

const RoleBasedDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access your personalized dashboard.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/register')} 
                variant="outline" 
                className="w-full"
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user role - default to 'child' if not specified
  const userRole = user.role || 'child';

  // Render dashboard based on user role
  switch (userRole) {
    case 'educator':
      return <TeacherDashboard />;
    
    case 'parent':
      return <ParentDashboard />;
    
    case 'child':
    case 'admin':
    case 'guest':
    default:
      return <StudentDashboard />;
  }
};

export default RoleBasedDashboard;