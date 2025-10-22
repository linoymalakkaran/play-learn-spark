import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  BookOpen, 
  Search, 
  Filter,
  GraduationCap,
  UserPlus,
  Settings,
  Grid,
  List,
  Calendar,
  MoreVertical
} from 'lucide-react';
import CreateClassForm from './CreateClassForm';
import JoinClassForm from './JoinClassForm';
import { classService, ClassData, CreateClassData } from '../services/classService';

type ViewMode = 'grid' | 'list';
type ActiveModal = 'none' | 'create' | 'join';

interface ClassManagementProps {
  userRole: 'teacher' | 'student' | 'admin';
  userId: string;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ userRole, userId }) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [error, setError] = useState<string>('');

  // Navigation handler
  const handleViewClassDashboard = (classId: string) => {
    navigate(`/class/${classId}/dashboard`);
  };

  // Load user's classes
  useEffect(() => {
    loadClasses();
  }, []);

  // Filter classes based on search and subject filter
  useEffect(() => {
    let filtered = classes;

    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSubject !== 'all') {
      filtered = filtered.filter(cls => cls.subject === filterSubject);
    }

    setFilteredClasses(filtered);
  }, [classes, searchTerm, filterSubject]);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const userClasses = await classService.getMyClasses();
      setClasses(userClasses);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = async (classData: CreateClassData) => {
    try {
      const newClass = await classService.createClass(classData);
      setClasses(prev => [newClass, ...prev]);
      setActiveModal('none');
    } catch (err) {
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleJoinClass = (classData: ClassData) => {
    setClasses(prev => [classData, ...prev]);
    setActiveModal('none');
  };

  const getSubjects = () => {
    const subjects = [...new Set(classes.map(cls => cls.subject))];
    return subjects.sort();
  };

  const renderClassCard = (classData: ClassData) => {
    const isTeacher = userRole === 'teacher';
    const studentCount = classData.students?.length || 0;
    
    return (
      <motion.div
        key={classData._id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border-l-4"
        style={{ borderLeftColor: classData.settings.color }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{classData.name}</h3>
              <p className="text-gray-600 text-sm">{classData.subject} • {classData.gradeLevel}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {classData.description && (
            <p className="text-gray-700 text-sm mb-4 line-clamp-2">{classData.description}</p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
            </div>
            {!isTeacher && (
              <div className="flex items-center">
                <GraduationCap className="h-4 w-4 mr-1" />
                <span>{classData.teacher.name}</span>
              </div>
            )}
          </div>

          {classData.schedule.meetingDays.length > 0 && (
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{classData.schedule.meetingDays.slice(0, 3).join(', ')}</span>
              {classData.schedule.meetingDays.length > 3 && (
                <span className="ml-1">+{classData.schedule.meetingDays.length - 3} more</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                classData.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {classData.isActive ? 'Active' : 'Inactive'}
              </span>
              {isTeacher && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {classData.joinCode}
                </span>
              )}
            </div>
            <button 
              onClick={() => handleViewClassDashboard(classData._id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderClassList = (classData: ClassData) => {
    const isTeacher = userRole === 'teacher';
    const studentCount = classData.students?.length || 0;

    return (
      <motion.div
        key={classData._id}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 p-4"
        style={{ borderLeftColor: classData.settings.color }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{classData.name}</h3>
                <p className="text-gray-600 text-sm">{classData.subject} • {classData.gradeLevel}</p>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{studentCount}</span>
                </div>
                {!isTeacher && (
                  <div className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    <span>{classData.teacher.name}</span>
                  </div>
                )}
                {classData.schedule.meetingDays.length > 0 && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{classData.schedule.meetingDays.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  classData.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {classData.isActive ? 'Active' : 'Inactive'}
                </span>
                {isTeacher && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {classData.joinCode}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button 
              onClick={() => handleViewClassDashboard(classData._id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              View Dashboard
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                {userRole === 'teacher' ? 'My Classes' : 'My Classes'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {userRole === 'teacher' ? (
                <button
                  onClick={() => setActiveModal('create')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Class
                </button>
              ) : (
                <button
                  onClick={() => setActiveModal('join')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Class
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Subject Filter */}
              <div className="relative">
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Subjects</option>
                  {getSubjects().map(subject => (
                    <option key={subject} value={subject}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </option>
                  ))}
                </select>
                <Filter className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading classes...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadClasses}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredClasses.length === 0 && classes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {userRole === 'teacher' ? 'No classes created yet' : 'No classes joined yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {userRole === 'teacher' 
                ? 'Get started by creating your first class'
                : 'Ask your teacher for a join code to get started'
              }
            </p>
            <button
              onClick={() => setActiveModal(userRole === 'teacher' ? 'create' : 'join')}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                userRole === 'teacher' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {userRole === 'teacher' ? 'Create First Class' : 'Join a Class'}
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && !error && filteredClasses.length === 0 && classes.length > 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Classes Display */}
        {!isLoading && !error && filteredClasses.length > 0 && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            <AnimatePresence>
              {filteredClasses.map(classData => 
                viewMode === 'grid' 
                  ? renderClassCard(classData)
                  : renderClassList(classData)
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && !error && filteredClasses.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            Showing {filteredClasses.length} of {classes.length} classes
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'create' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <CreateClassForm
                onSubmit={handleCreateClass}
                onCancel={() => setActiveModal('none')}
              />
            </motion.div>
          </div>
        )}

        {activeModal === 'join' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl"
            >
              <JoinClassForm
                onSuccess={handleJoinClass}
                onCancel={() => setActiveModal('none')}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassManagement;