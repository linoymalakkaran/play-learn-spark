import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  PlayCircle,
  PauseCircle,
  Clock,
  Calendar,
  Users,
  Target,
  BarChart3,
  FileText,
  Settings,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
  Timer,
  Star,
  Send,
  Archive,
  RefreshCw
} from 'lucide-react';

interface Class {
  _id: string;
  name: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'active' | 'completed' | 'archived';
  schedule: {
    assignedDate: Date;
    dueDate?: Date;
    startDate?: Date;
  };
  analytics: {
    enrolledCount: number;
    startedCount: number;
    completedCount: number;
    averageScore: number;
  };
  points: {
    total: number;
  };
  estimatedDuration: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

interface AssignmentManagerProps {
  classData: Class;
  assignments: Assignment[];
  onCreateAssignment: () => void;
  onEditAssignment: (assignmentId: string) => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  classData,
  assignments,
  onCreateAssignment,
  onEditAssignment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'created' | 'completion' | 'score'>('dueDate');
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  // Enhanced assignments with additional data
  const enhancedAssignments = assignments.map(assignment => ({
    ...assignment,
    analytics: {
      ...assignment.analytics,
      completionRate: assignment.analytics.enrolledCount > 0 
        ? Math.round((assignment.analytics.completedCount / assignment.analytics.enrolledCount) * 100)
        : 0,
      startedRate: assignment.analytics.enrolledCount > 0
        ? Math.round((assignment.analytics.startedCount / assignment.analytics.enrolledCount) * 100)
        : 0
    },
    difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard',
    category: ['Math', 'Science', 'Reading', 'Social Studies'][Math.floor(Math.random() * 4)],
    tags: ['interactive', 'multimedia', 'group-work'].slice(0, Math.floor(Math.random() * 3) + 1)
  }));

  // Filter and sort assignments
  const filteredAssignments = enhancedAssignments
    .filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      return assignment.status === statusFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.schedule.dueDate && !b.schedule.dueDate) return 0;
          if (!a.schedule.dueDate) return 1;
          if (!b.schedule.dueDate) return -1;
          return new Date(a.schedule.dueDate).getTime() - new Date(b.schedule.dueDate).getTime();
        case 'completion':
          return b.analytics.completionRate - a.analytics.completionRate;
        case 'score':
          return b.analytics.averageScore - a.analytics.averageScore;
        default:
          return new Date(b.schedule.assignedDate).getTime() - new Date(a.schedule.assignedDate).getTime();
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'archived': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDue = (dueDate?: Date) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleAssignmentAction = (action: string, assignmentId: string) => {
    switch (action) {
      case 'edit':
        onEditAssignment(assignmentId);
        break;
      case 'duplicate':
        console.log('Duplicate assignment:', assignmentId);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this assignment?')) {
          console.log('Delete assignment:', assignmentId);
        }
        break;
      case 'archive':
        console.log('Archive assignment:', assignmentId);
        break;
      case 'publish':
        console.log('Publish assignment:', assignmentId);
        break;
      default:
        break;
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedAssignments.length === 0) return;
    
    switch (action) {
      case 'delete':
        if (confirm(`Delete ${selectedAssignments.length} selected assignments?`)) {
          console.log('Bulk delete:', selectedAssignments);
          setSelectedAssignments([]);
        }
        break;
      case 'archive':
        console.log('Bulk archive:', selectedAssignments);
        setSelectedAssignments([]);
        break;
      case 'publish':
        console.log('Bulk publish:', selectedAssignments);
        setSelectedAssignments([]);
        break;
      default:
        break;
    }
  };

  const toggleAssignmentSelection = (assignmentId: string) => {
    setSelectedAssignments(prev => 
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  const assignmentStats = {
    total: enhancedAssignments.length,
    active: enhancedAssignments.filter(a => a.status === 'active').length,
    draft: enhancedAssignments.filter(a => a.status === 'draft').length,
    overdue: enhancedAssignments.filter(a => 
      a.schedule.dueDate && new Date(a.schedule.dueDate) < new Date() && a.status === 'active'
    ).length,
    avgCompletion: enhancedAssignments.length > 0
      ? Math.round(enhancedAssignments.reduce((sum, a) => sum + a.analytics.completionRate, 0) / enhancedAssignments.length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{assignmentStats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{assignmentStats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{assignmentStats.draft}</div>
              <div className="text-sm text-gray-600">Draft</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{assignmentStats.overdue}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{assignmentStats.avgCompletion}%</div>
              <div className="text-sm text-gray-600">Avg Completion</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="completion">Completion</SelectItem>
                  <SelectItem value="score">Average Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedAssignments.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedAssignments.length} selected
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('publish')}>
                    <Send className="h-4 w-4 mr-1" />
                    Publish
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('archive')}>
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
              
              <Button onClick={onCreateAssignment}>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => {
          const daysUntilDue = getDaysUntilDue(assignment.schedule.dueDate);
          const isSelected = selectedAssignments.includes(assignment._id);
          
          return (
            <Card 
              key={assignment._id} 
              className={`${isSelected ? 'ring-2 ring-blue-500' : ''} transition-all hover:shadow-md`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAssignmentSelection(assignment._id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{assignment.title}</h3>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status}
                          </Badge>
                          <Badge className={getDifficultyColor(assignment.difficulty)}>
                            {assignment.difficulty}
                          </Badge>
                          {assignment.category && (
                            <Badge variant="outline">{assignment.category}</Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {assignment.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{assignment.analytics.enrolledCount} students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            <span>{assignment.estimatedDuration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>{assignment.points.total} points</span>
                          </div>
                          {assignment.schedule.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Due {new Date(assignment.schedule.dueDate).toLocaleDateString()}
                                {daysUntilDue !== null && (
                                  <span className={`ml-1 ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 2 ? 'text-yellow-600' : ''}`}>
                                    ({daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : 
                                      daysUntilDue === 0 ? 'Due today' : 
                                      daysUntilDue === 1 ? 'Due tomorrow' : 
                                      `${daysUntilDue} days left`})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleAssignmentAction('edit', assignment._id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Select onValueChange={(action) => handleAssignmentAction(action, assignment._id)}>
                        <SelectTrigger className="w-auto">
                          <MoreHorizontal className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </div>
                          </SelectItem>
                          <SelectItem value="duplicate">
                            <div className="flex items-center gap-2">
                              <Copy className="h-4 w-4" />
                              Duplicate
                            </div>
                          </SelectItem>
                          {assignment.status === 'draft' && (
                            <SelectItem value="publish">
                              <div className="flex items-center gap-2">
                                <Send className="h-4 w-4" />
                                Publish
                              </div>
                            </SelectItem>
                          )}
                          <SelectItem value="archive">
                            <div className="flex items-center gap-2">
                              <Archive className="h-4 w-4" />
                              Archive
                            </div>
                          </SelectItem>
                          <SelectItem value="delete">
                            <div className="flex items-center gap-2 text-red-600">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Progress and Analytics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span>{assignment.analytics.completionRate}%</span>
                      </div>
                      <Progress value={assignment.analytics.completionRate} className="h-2" />
                      <div className="text-xs text-gray-600">
                        {assignment.analytics.completedCount} of {assignment.analytics.enrolledCount} completed
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Started Rate</span>
                        <span>{assignment.analytics.startedRate}%</span>
                      </div>
                      <Progress value={assignment.analytics.startedRate} className="h-2" />
                      <div className="text-xs text-gray-600">
                        {assignment.analytics.startedCount} students started
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Score</span>
                        <span>{assignment.analytics.averageScore}%</span>
                      </div>
                      <Progress value={assignment.analytics.averageScore} className="h-2" />
                      <div className="text-xs text-gray-600">
                        Class average performance
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {assignment.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Tags:</span>
                      {assignment.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No assignments found' : 'No assignments yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first assignment to start engaging your students.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={onCreateAssignment}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Assignment
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button onClick={onCreateAssignment} className="h-20 flex flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span>Create Assignment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Copy className="h-6 w-6" />
              <span>Duplicate Last</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Import Assignment</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentManager;