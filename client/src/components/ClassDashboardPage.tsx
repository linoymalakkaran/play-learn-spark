import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextEnhanced';
import ClassDashboard from './ClassDashboard';
import LoadingSpinner from './LoadingSpinner';

/**
 * ClassDashboardPage - Route wrapper for the ClassDashboard component
 * Handles URL parameters, authentication, and role-based access
 */
const ClassDashboardPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { user, isLoading } = useAuth();

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show error if no class ID in URL
  if (!classId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Class</h2>
          <p className="text-gray-600">No class ID provided in the URL.</p>
        </div>
      </div>
    );
  }

  // Determine user role (you may need to adjust this based on your auth system)
  const userRole = user.role === 'educator' ? 'teacher' : 'student'; // Map educator to teacher

  return (
    <ClassDashboard
      classId={classId}
      userRole={userRole as 'teacher' | 'student' | 'admin'}
      userId={user._id}
    />
  );
};

export default ClassDashboardPage;