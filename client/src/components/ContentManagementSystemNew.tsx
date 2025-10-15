import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Tag
} from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ageRange: string;
  category: string;
  tags: string[];
  estimatedTime: number;
  isPublic: boolean;
  createdBy: number;
  creator?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  name: string;
  totalActivities: number;
  difficulties: {
    easy: number;
    medium: number;
    hard: number;
  };
  averageTime: number;
  publicActivities: number;
}

interface ContentManagementSystemNewProps {
  onClose?: () => void;
}

export const ContentManagementSystemNew: React.FC<ContentManagementSystemNewProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [showOnlyMyActivities, setShowOnlyMyActivities] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    ageRange: '6-12',
    category: '',
    tags: '',
    estimatedTime: 15,
    isPublic: true
  });

  // Bulk operations
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [bulkOperation, setBulkOperation] = useState('');

  useEffect(() => {
    fetchActivities();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory, selectedDifficulty, showOnlyMyActivities]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedDifficulty && { difficulty: selectedDifficulty }),
        ...(showOnlyMyActivities && user && { createdBy: user.id.toString() })
      });

      const response = await fetch(`/api/content/activities?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activities);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError('Failed to fetch activities');
      }
    } catch (err) {
      setError('Network error while fetching activities');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/content/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const url = editingActivity ? `/api/content/activities/${editingActivity.id}` : '/api/content/activities';
      const method = editingActivity ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(editingActivity ? 'Activity updated successfully!' : 'Activity created successfully!');
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        resetForm();
        fetchActivities();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save activity');
      }
    } catch (err) {
      setError('Network error while saving activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (activityId: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const response = await fetch(`/api/content/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setSuccess('Activity deleted successfully!');
        fetchActivities();
      } else {
        setError('Failed to delete activity');
      }
    } catch (err) {
      setError('Network error while deleting activity');
    }
  };

  const handleClone = async (activityId: number) => {
    try {
      const response = await fetch(`/api/content/activities/${activityId}/clone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setSuccess('Activity cloned successfully!');
        fetchActivities();
      } else {
        setError('Failed to clone activity');
      }
    } catch (err) {
      setError('Network error while cloning activity');
    }
  };

  const handleBulkOperation = async () => {
    if (!bulkOperation || selectedActivities.length === 0) return;

    try {
      const response = await fetch('/api/content/activities/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          operation: bulkOperation,
          activityIds: selectedActivities
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Bulk ${bulkOperation} completed: ${data.data.successful} successful, ${data.data.failed} failed`);
        setSelectedActivities([]);
        setBulkOperation('');
        fetchActivities();
      } else {
        setError(`Failed to perform bulk ${bulkOperation}`);
      }
    } catch (err) {
      setError('Network error during bulk operation');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      difficulty: 'easy',
      ageRange: '6-12',
      category: '',
      tags: '',
      estimatedTime: 15,
      isPublic: true
    });
    setEditingActivity(null);
  };

  const openEditDialog = (activity: Activity) => {
    setFormData({
      title: activity.title,
      description: activity.description,
      content: activity.content,
      difficulty: activity.difficulty,
      ageRange: activity.ageRange,
      category: activity.category,
      tags: activity.tags.join(', '),
      estimatedTime: activity.estimatedTime,
      isPublic: activity.isPublic
    });
    setEditingActivity(activity);
    setIsEditDialogOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditActivity = (activity: Activity) => {
    return user?.role === 'admin' || activity.createdBy === Number(user?.id);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-gray-600">Create and manage educational activities</p>
        </div>
        <div className="flex gap-2">
          {(user?.role === 'admin' || user?.role === 'educator' || user?.role === 'parent') && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Activity
            </Button>
          )}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category.name} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(selectedCategory === category.name ? '' : category.name)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Activities:</span>
                  <span className="font-semibold">{category.totalActivities}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Public:</span>
                  <span className="font-semibold">{category.publicActivities}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Time:</span>
                  <span className="font-semibold">{category.averageTime}min</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    E: {category.difficulties.easy}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    M: {category.difficulties.medium}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    H: {category.difficulties.hard}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="myActivities"
                checked={showOnlyMyActivities}
                onChange={(e) => setShowOnlyMyActivities(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="myActivities" className="text-sm">My Activities Only</label>
            </div>
          </div>

          {/* Bulk Operations */}
          {selectedActivities.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedActivities.length} activities selected
              </span>
              <Select value={bulkOperation} onValueChange={setBulkOperation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">Publish</SelectItem>
                  <SelectItem value="unpublish">Unpublish</SelectItem>
                  {user?.role === 'admin' && <SelectItem value="delete">Delete</SelectItem>}
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkOperation}
                disabled={!bulkOperation}
                size="sm"
              >
                Execute
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedActivities([])}
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activities List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No activities found. Try adjusting your filters or create a new activity.</p>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedActivities([...selectedActivities, activity.id]);
                          } else {
                            setSelectedActivities(selectedActivities.filter(id => id !== activity.id));
                          }
                        }}
                        className="rounded"
                      />
                      <CardTitle className="text-xl">{activity.title}</CardTitle>
                      <Badge className={getDifficultyColor(activity.difficulty)}>
                        {activity.difficulty}
                      </Badge>
                      {activity.isPublic ? (
                        <Badge variant="default">
                          <Eye className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base mb-3">
                      {activity.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {activity.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.estimatedTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {activity.creator ? 
                          `${activity.creator.firstName} ${activity.creator.lastName}` : 
                          'Unknown'
                        }
                      </span>
                      <span>Age: {activity.ageRange}</span>
                    </div>
                    {activity.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {activity.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClone(activity.id)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {canEditActivity(activity) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(activity)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(activity.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Activity Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? 'Edit Activity' : 'Create New Activity'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingActivity ? 'update' : 'create'} an educational activity.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Content *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                placeholder="Enter the activity content, instructions, or JSON structure..."
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Age Range</label>
                <Input
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  placeholder="e.g., 6-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time (minutes)</label>
                <Input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 15 })}
                  min={1}
                  max={180}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tags</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="math, problem-solving, critical-thinking (comma separated)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isPublic" className="text-sm font-medium">
                Make this activity public
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingActivity ? 'Update Activity' : 'Create Activity'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagementSystemNew;