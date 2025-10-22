import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  BarChart3, 
  Plus,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Copy,
  Check,
  Eye,
  EyeOff,
  MoreVertical,
  Edit,
  Archive,
  RefreshCw,
  Download,
  Mail,
  Shield,
  Award,
  TrendingUp,
  Activity,
  PieChart,
  Filter,
  Search,
  Grid,
  List,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { classService, ClassData, GroupData } from '../services/classService';

interface ClassDashboardProps {
  classId: string;
  userRole: 'teacher' | 'student' | 'admin';
  userId: string;
}

type DashboardTab = 'overview' | 'students' | 'groups' | 'analytics' | 'settings';
type StudentStatus = 'approved' | 'pending' | 'rejected';
type ViewMode = 'grid' | 'list';

interface StudentData {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  enrolledAt: string;
  status: StudentStatus;
  lastActive?: string;
  progress?: {
    completedActivities: number;
    totalActivities: number;
    averageScore: number;
  };
}

const ClassDashboard: React.FC<ClassDashboardProps> = ({
  classId,
  userRole,
  userId
}) => {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StudentStatus>('all');
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load class data
  useEffect(() => {
    loadClassData();
  }, [classId]);

  // Load groups when groups tab is active
  useEffect(() => {
    if (activeTab === 'groups') {
      loadGroups();
    }
  }, [activeTab, classId]);

  const loadClassData = async () => {
    try {
      setIsLoading(true);
      const data = await classService.getClassById(classId);
      setClassData(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load class data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const groupsData = await classService.getClassGroups(classId);
      setGroups(groupsData);
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  const handleApproveStudent = async (studentId: string) => {
    try {
      await classService.approveStudent(classId, studentId);
      await loadClassData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve student');
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await classService.removeStudentFromClass(classId, studentId);
      await loadClassData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove student');
    }
  };

  const handleRegenerateJoinCode = async () => {
    try {
      const newCode = await classService.regenerateJoinCode(classId);
      if (classData) {
        setClassData({ ...classData, joinCode: newCode });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate join code');
    }
  };

  const copyJoinCode = async () => {
    if (classData?.joinCode) {
      try {
        await navigator.clipboard.writeText(classData.joinCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        console.error('Failed to copy join code:', err);
      }
    }
  };

  // Filter students based on search and status
  const filteredStudents = classData?.students.filter(student => {
    const matchesSearch = student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Get statistics
  const getStudentStats = () => {
    const students = classData?.students || [];
    return {
      total: students.length,
      approved: students.filter(s => s.status === 'approved').length,
      pending: students.filter(s => s.status === 'pending').length,
      rejected: students.filter(s => s.status === 'rejected').length
    };
  };

  const isTeacher = userRole === 'teacher';
  const stats = getStudentStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Class</h2>
          <p className="text-gray-600 mb-4">{error || 'Class not found'}</p>
          <button
            onClick={loadClassData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Class Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderLeftColor: classData.settings.color }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{classData.name}</h1>
            <p className="text-gray-600">{classData.subject} • {classData.gradeLevel}</p>
            {classData.description && (
              <p className="text-gray-700 mt-2">{classData.description}</p>
            )}
          </div>
          {isTeacher && (
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Edit className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Students</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            {stats.pending > 0 && (
              <p className="text-xs text-orange-600 mt-1">{stats.pending} pending approval</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Schedule</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {classData.schedule.meetingDays.slice(0, 3).join(', ')}
            </p>
            {classData.schedule.startTime && classData.schedule.endTime && (
              <p className="text-xs text-gray-600">
                {classData.schedule.startTime} - {classData.schedule.endTime}
              </p>
            )}
          </div>

          {isTeacher && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Join Code</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowJoinCode(!showJoinCode)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showJoinCode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={copyJoinCode}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedCode ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={handleRegenerateJoinCode}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 font-mono tracking-wider">
                {showJoinCode ? classData.joinCode : '••••••'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {isTeacher && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <UserPlus className="h-6 w-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Add Student</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Plus className="h-6 w-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Create Group</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">View Analytics</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Download className="h-6 w-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">Export Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {/* Mock recent activities */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <UserCheck className="h-5 w-5 text-green-500 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">2 new students joined the class</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-500 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">New group "Study Team A" created</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Activity className="h-5 w-5 text-purple-500 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-gray-900">Class activity completed by 15 students</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentsTab = () => (
    <div className="space-y-6">
      {/* Student Management Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Student Management</h2>
            <p className="text-gray-600 mt-1">
              {stats.total} students • {stats.approved} approved • {stats.pending} pending
            </p>
          </div>
          {isTeacher && (
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Mail className="h-4 w-4 mr-2" />
                Invite via Email
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | StudentStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
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

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No students have joined this class yet'
              }
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-3'
          }>
            {filteredStudents.map((student) => (
              <motion.div
                key={student.user._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all ${
                  viewMode === 'list' ? 'flex items-center justify-between' : ''
                }`}
              >
                <div className={`${viewMode === 'list' ? 'flex items-center flex-1' : ''}`}>
                  <div className={`${viewMode === 'list' ? 'flex items-center space-x-4 flex-1' : 'mb-3'}`}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {student.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={viewMode === 'list' ? 'flex-1' : 'mt-2'}>
                      <h4 className="font-medium text-gray-900">{student.user.name}</h4>
                      <p className="text-sm text-gray-600">{student.user.email}</p>
                      {viewMode === 'grid' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {new Date(student.enrolledAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Joined {new Date(student.enrolledAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className={`flex items-center ${viewMode === 'list' ? 'space-x-3' : 'justify-between mt-3'}`}>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : student.status === 'pending'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </span>

                  {isTeacher && (
                    <div className="flex items-center space-x-1">
                      {student.status === 'pending' && (
                        <button
                          onClick={() => handleApproveStudent(student.user._id)}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          title="Approve student"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveStudent(student.user._id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Remove student"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderGroupsTab = () => (
    <div className="space-y-6">
      {/* Groups Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Class Groups</h2>
            <p className="text-gray-600 mt-1">{groups.length} groups created</p>
          </div>
          {isTeacher && (
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.open(`/class/${classId}/groups`, '_blank')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Groups
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group._id} className="bg-white rounded-xl shadow-md p-6 border-l-4" style={{ borderLeftColor: group.settings.color || '#3B82F6' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                {group.description && (
                  <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                )}
              </div>
              {isTeacher && (
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Users className="h-4 w-4 mr-1" />
              <span>{group.members.length} members</span>
              {group.settings.maxMembers && (
                <span className="ml-1">/ {group.settings.maxMembers}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {group.members.slice(0, 3).map((member, index) => (
                  <div
                    key={member.user._id}
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                    title={member.user.name}
                  >
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {group.members.length > 3 && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                    +{group.members.length - 3}
                  </div>
                )}
              </div>
              <button 
                onClick={() => window.open(`/class/${classId}/groups`, '_blank')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups created yet</h3>
          <p className="text-gray-600 mb-6">
            {isTeacher 
              ? 'Create groups to organize students for collaborative learning'
              : 'Your teacher hasn\'t created any groups yet'
            }
          </p>
          {isTeacher && (
            <button 
              onClick={() => window.open(`/class/${classId}/groups`, '_blank')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Group
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Class Analytics</h2>
        <p className="text-gray-600">Insights and performance metrics for your class</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-2">+12% from last week</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">92%</p>
            </div>
            <Award className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-2">+5% from last week</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-2">Last 7 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">94%</p>
            </div>
            <PieChart className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-2">All assignments</p>
        </div>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Analytics Coming Soon</h3>
        <p className="text-gray-600">
          We're working on comprehensive analytics including progress tracking, 
          performance insights, and detailed reporting.
        </p>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Class Settings</h2>
        <p className="text-gray-600">Manage your class preferences and configuration</p>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Settings Panel Coming Soon</h3>
        <p className="text-gray-600">
          Advanced class settings and configuration options will be available here.
        </p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ...(isTeacher ? [{ id: 'settings', label: 'Settings', icon: Settings }] : [])
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div 
                className="w-3 h-8 rounded-sm mr-3"
                style={{ backgroundColor: classData.settings.color }}
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{classData.name}</h1>
                <p className="text-sm text-gray-600">{classData.subject} • {classData.gradeLevel}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                classData.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {classData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'students' && renderStudentsTab()}
            {activeTab === 'groups' && renderGroupsTab()}
            {activeTab === 'analytics' && renderAnalyticsTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClassDashboard;