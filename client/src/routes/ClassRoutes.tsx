// Route configuration for integrating ClassDashboard and GroupManagement
// This would be added to your main router setup

import React from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextEnhanced';
import ClassManagement from '../components/ClassManagement';
import ClassDashboardPage from '../components/ClassDashboardPage';
import GroupManagementSimple from '../components/GroupManagementSimple';

export const ClassRoutes = () => {
  return (
    <Routes>
      {/* Class Management Routes */}
      <Route path="/classes" element={<ClassManagement userRole="teacher" userId="current-user-id" />} />
      <Route path="/class/:classId/dashboard" element={<ClassDashboardPage />} />
      <Route path="/class/:classId/groups" element={<GroupManagementPage />} />
    </Routes>
  );
};

// Group Management Page Wrapper
const GroupManagementPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!classId) {
    return <Navigate to="/classes" replace />;
  }

  const userRole = user.role === 'educator' ? 'teacher' : 'student';

  return (
    <GroupManagementSimple
      classId={classId}
      userRole={userRole as 'teacher' | 'student' | 'admin'}
      userId={user._id}
    />
  );
};

export default ClassRoutes;