import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings, 
  UserPlus, 
  UserMinus,
  Crown,
  Shield,
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
  Shuffle,
  Copy,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { classService, GroupData, ClassData } from '../services/classService';

interface GroupManagementProps {
  classId: string;
  userRole: 'teacher' | 'student' | 'admin';
  userId: string;
}

interface StudentData {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  enrolledAt: string;
  status: 'pending' | 'approved' | 'rejected';
  lastActive?: string;
}

interface CreateGroupFormData {
  name: string;
  description: string;
  type: 'study-group' | 'project-team' | 'reading-circle' | 'skill-level' | 'custom';
  maxMembers: number;
  color: string;
  settings: {
    isPublic: boolean;
    allowSelfJoin: boolean;
    requireApproval: boolean;
  };
}

type ViewMode = 'grid' | 'list';
type ActiveModal = 'none' | 'create' | 'edit' | 'assign' | 'settings';

const GroupManagement: React.FC<GroupManagementProps> = ({
  classId,
  userRole,
  userId
}) => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [unassignedStudents, setUnassignedStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [draggedStudent, setDraggedStudent] = useState<StudentData | null>(null);
  const [showSettings, setShowSettings] = useState<Record<string, boolean>>({});

  // Load data
  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [groupsData, classInfo] = await Promise.all([
        classService.getClassGroups(classId),
        classService.getClassById(classId)
      ]);
      
      setGroups(groupsData);
      setClassData(classInfo);
      
      // Calculate unassigned students
      const assignedStudentIds = groupsData.flatMap(group => 
        group.members.map(member => member.user._id)
      );
      
      const unassigned = classInfo.students.filter(student => 
        student.status === 'approved' && 
        !assignedStudentIds.includes(student.user._id)
      );
      
      setUnassignedStudents(unassigned);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group data');
    } finally {
      setIsLoading(false);
    }
  };

  // Group creation
  const handleCreateGroup = async (formData: CreateGroupFormData) => {
    try {
      const newGroup = await classService.createGroup(classId, {
        name: formData.name,
        description: formData.description,
        settings: {
          ...formData.settings,
          maxMembers: formData.maxMembers,
          color: formData.color
        }
      });
      
      setGroups(prev => [...prev, newGroup]);
      setActiveModal('none');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  // Student assignment via drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const student = unassignedStudents.find(s => s._id === active.id);
    setDraggedStudent(student || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedStudent(null);

    if (!over) return;

    const studentId = active.id as string;
    const groupId = over.id as string;

    // Check if dropping on a group
    const targetGroup = groups.find(g => g._id === groupId);
    if (!targetGroup) return;

    // Check if group has space
    if (targetGroup.settings.maxMembers && 
        targetGroup.members.length >= targetGroup.settings.maxMembers) {
      setError('Group is full');
      return;
    }

    try {
      await classService.addMemberToGroup(groupId, studentId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add student to group');
    }
  };

  // Remove student from group
  const handleRemoveFromGroup = async (groupId: string, studentId: string) => {
    try {
      await classService.removeMemberFromGroup(groupId, studentId);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove student from group');
    }
  };

  // Auto-assign students to groups
  const handleAutoAssign = async () => {
    if (groups.length === 0 || unassignedStudents.length === 0) return;

    try {
      const shuffledStudents = [...unassignedStudents].sort(() => Math.random() - 0.5);
      let groupIndex = 0;

      for (const student of shuffledStudents) {
        const targetGroup = groups[groupIndex];
        
        // Check if group has space
        if (!targetGroup.settings.maxMembers || 
            targetGroup.members.length < targetGroup.settings.maxMembers) {
          await classService.addMemberToGroup(targetGroup._id, student.user._id);
        }
        
        groupIndex = (groupIndex + 1) % groups.length;
      }

      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to auto-assign students');
    }
  };

  // Delete group
  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await classService.deleteGroup(groupId);
      await loadData(); // Refresh to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  const isTeacher = userRole === 'teacher';
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading group management...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
                  <p className="text-sm text-gray-600">
                    {classData?.name} • {groups.length} groups • {unassignedStudents.length} unassigned
                  </p>
                </div>
              </div>
              {isTeacher && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAutoAssign}
                    disabled={groups.length === 0 || unassignedStudents.length === 0}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Auto Assign
                  </button>
                  <button
                    onClick={() => setActiveModal('create')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
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

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Groups Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Groups ({filteredGroups.length})
                  </h2>
                  {isTeacher && groups.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </button>
                      <button className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </button>
                    </div>
                  )}
                </div>

                {filteredGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {groups.length === 0 ? 'No groups created yet' : 'No groups found'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {groups.length === 0 
                        ? 'Create groups to organize students for collaborative learning'
                        : 'Try adjusting your search terms'
                      }
                    </p>
                    {isTeacher && groups.length === 0 && (
                      <button
                        onClick={() => setActiveModal('create')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create First Group
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' 
                    : 'space-y-4'
                  }>
                    <SortableContext items={filteredGroups.map(g => g._id)} strategy={verticalListSortingStrategy}>
                      {filteredGroups.map(group => (
                        <GroupCard
                          key={group._id}
                          group={group}
                          viewMode={viewMode}
                          isTeacher={isTeacher}
                          showSettings={showSettings[group._id] || false}
                          onToggleSettings={() => setShowSettings(prev => ({
                            ...prev,
                            [group._id]: !prev[group._id]
                          }))}
                          onRemoveMember={handleRemoveFromGroup}
                          onEdit={() => {
                            setSelectedGroup(group);
                            setActiveModal('edit');
                          }}
                          onDelete={() => handleDeleteGroup(group._id)}
                        />
                      ))}
                    </SortableContext>
                  </div>
                )}
              </div>
            </div>

            {/* Unassigned Students Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Unassigned Students ({unassignedStudents.length})
                </h3>
                {unassignedStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">All students are assigned to groups!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unassignedStudents.map(student => (
                      <DraggableStudent
                        key={student._id}
                        student={student}
                        isTeacher={isTeacher}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedStudent && (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {draggedStudent.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{draggedStudent.user.name}</p>
                  <p className="text-xs text-gray-600">{draggedStudent.user.email}</p>
                </div>
              </div>
            </div>
          )}
        </DragOverlay>

        {/* Modals */}
        <AnimatePresence>
          {activeModal === 'create' && (
            <CreateGroupModal
              onSubmit={handleCreateGroup}
              onCancel={() => setActiveModal('none')}
            />
          )}
          {activeModal === 'edit' && selectedGroup && (
            <EditGroupModal
              group={selectedGroup}
              onSubmit={async (data) => {
                try {
                  await classService.updateGroup(selectedGroup._id, data);
                  await loadData();
                  setActiveModal('none');
                  setSelectedGroup(null);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to update group');
                }
              }}
              onCancel={() => {
                setActiveModal('none');
                setSelectedGroup(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </DndContext>
  );
};

// Draggable Student Component
interface DraggableStudentProps {
  student: StudentData;
  isTeacher: boolean;
}

const DraggableStudent: React.FC<DraggableStudentProps> = ({ student, isTeacher }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student._id, disabled: !isTeacher });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isTeacher ? listeners : {})}
      className={`bg-gray-50 rounded-lg p-3 border border-gray-200 ${
        isTeacher ? 'cursor-grab active:cursor-grabbing hover:bg-gray-100' : ''
      } transition-colors`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {student.user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{student.user.name}</p>
          <p className="text-xs text-gray-600 truncate">{student.user.email}</p>
        </div>
      </div>
    </div>
  );
};

// Group Card Component
interface GroupCardProps {
  group: GroupData;
  viewMode: ViewMode;
  isTeacher: boolean;
  showSettings: boolean;
  onToggleSettings: () => void;
  onRemoveMember: (groupId: string, studentId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  viewMode,
  isTeacher,
  showSettings,
  onToggleSettings,
  onRemoveMember,
  onEdit,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ 
    id: group._id,
    data: { type: 'group' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const canAcceptDrop = !group.settings.maxMembers || 
    group.members.length < group.settings.maxMembers;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl shadow-md border-l-4 overflow-hidden transition-all ${
        viewMode === 'list' ? 'flex items-center' : ''
      } ${
        isDragging ? 'opacity-50' : ''
      } ${
        isOver && canAcceptDrop ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      } ${
        isOver && !canAcceptDrop ? 'ring-2 ring-red-500 bg-red-50' : ''
      }`}
      style={{ 
        ...style,
        borderLeftColor: group.settings.color || '#3B82F6' 
      }}
    >
      <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex items-center justify-between' : ''}`}>
        <div className={viewMode === 'list' ? 'flex items-center space-x-4 flex-1' : ''}>
          <div className={viewMode === 'list' ? 'flex-1' : ''}>
            <div className={`flex items-start justify-between ${viewMode === 'list' ? 'mb-0' : 'mb-4'}`}>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name}</h3>
                {group.description && viewMode === 'grid' && (
                  <p className="text-gray-600 text-sm mb-3">{group.description}</p>
                )}
              </div>
              {isTeacher && (
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={onEdit}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onToggleSettings}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {viewMode === 'grid' && (
              <>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{group.members.length} members</span>
                  {group.settings.maxMembers && (
                    <span className="ml-1">/ {group.settings.maxMembers}</span>
                  )}
                  {group.settings.maxMembers && group.members.length >= group.settings.maxMembers && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      Full
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 5).map((member, index) => (
                      <div
                        key={member.user._id}
                        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                        title={member.user.name}
                      >
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {group.members.length > 5 && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                        +{group.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {viewMode === 'list' && (
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{group.members.length}</span>
                {group.settings.maxMembers && (
                  <span>/{group.settings.maxMembers}</span>
                )}
              </div>
              <div className="flex -space-x-1">
                {group.members.slice(0, 3).map((member) => (
                  <div
                    key={member.user._id}
                    className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border border-white"
                    title={member.user.name}
                  >
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {group.members.length > 3 && (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold border border-white">
                    +{group.members.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Member List (shown when settings are expanded) */}
        {showSettings && viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 pt-4 mt-4"
          >
            <h4 className="text-sm font-medium text-gray-900 mb-3">Members</h4>
            <div className="space-y-2">
              {group.members.map((member) => (
                <div key={member.user._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-900">{member.user.name}</span>
                    {member.role === 'leader' && (
                      <Crown className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                  {isTeacher && (
                    <button
                      onClick={() => onRemoveMember(group._id, member.user._id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <UserMinus className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Create Group Modal Component (to be implemented separately)
const CreateGroupModal: React.FC<{
  onSubmit: (data: CreateGroupFormData) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateGroupFormData>({
    name: '',
    description: '',
    type: 'study-group',
    maxMembers: 6,
    color: '#3B82F6',
    settings: {
      isPublic: true,
      allowSelfJoin: false,
      requireApproval: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Group</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter group name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="study-group">Study Group</option>
                <option value="project-team">Project Team</option>
                <option value="reading-circle">Reading Circle</option>
                <option value="skill-level">Skill Level</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Members
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={formData.maxMembers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Group
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Edit Group Modal (simplified version)
const EditGroupModal: React.FC<{
  group: GroupData;
  onSubmit: (data: Partial<CreateGroupFormData>) => void;
  onCancel: () => void;
}> = ({ group, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description || '',
    color: group.settings.color || '#3B82F6'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Group</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Group
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default GroupManagement;