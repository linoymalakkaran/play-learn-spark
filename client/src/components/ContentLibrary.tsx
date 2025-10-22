import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

import ActivityCreationWizard from './ActivityCreationWizard';
import { InteractiveActivity } from '@/types/ActivityTemplates';

import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Clock,
  Users,
  TrendingUp,
  Download,
  Upload,
  Share,
  BookOpen,
  Gamepad2,
  Video,
  Headphones,
  Image as ImageIcon,
  FileText,
  MoreHorizontal,
  Calendar,
  Tag,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Award,
  Target,
  Sparkles,
  Archive,
  RefreshCw,
  Hash
} from 'lucide-react';

interface ContentLibraryProps {
  onActivitySelect?: (activity: InteractiveActivity) => void;
  readOnly?: boolean;
}

interface ActivityData extends InteractiveActivity {
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  status: 'draft' | 'published' | 'archived';
  creator: {
    id: number;
    name: string;
    avatar?: string;
  };
  usage: {
    totalPlays: number;
    averageRating: number;
    totalRatings: number;
  };
  tags: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
}

interface FilterState {
  search: string;
  category: string;
  difficulty: string;
  status: string;
  language: string;
  createdBy: string;
  sortBy: 'created' | 'updated' | 'title' | 'rating' | 'usage';
  sortOrder: 'asc' | 'desc';
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({
  onActivitySelect,
  readOnly = false
}) => {
  // State
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [editingActivity, setEditingActivity] = useState<InteractiveActivity | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'my-activities' | 'public-library' | 'templates'>('my-activities');

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    difficulty: 'all',
    status: 'all',
    language: 'all',
    createdBy: 'all',
    sortBy: 'updated',
    sortOrder: 'desc'
  });

  // Statistics
  const [libraryStats, setLibraryStats] = useState({
    totalActivities: 0,
    myActivities: 0,
    publicActivities: 0,
    totalPlays: 0,
    averageRating: 0
  });

  // Load activities
  useEffect(() => {
    loadActivities();
  }, [currentPage, filters, activeTab]);

  // Filter activities
  useEffect(() => {
    filterAndSortActivities();
  }, [activities, filters]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - in real app, fetch from backend
      const mockActivities: ActivityData[] = [
        {
          id: '1',
          title: '🔤 Letter Detective Adventure',
          description: 'Help students identify and match uppercase and lowercase letters through fun detective scenarios.',
          type: 'matching',
          instructions: 'Drag the uppercase letters to match with their lowercase partners!',
          questions: [],
          rewards: {
            points: 20,
            badges: ['Letter Detective', 'Alphabet Explorer'],
            stickers: ['⭐', '🔍', '🎯'],
            celebrationMessage: 'Amazing detective work! You found all the letter pairs!'
          },
          estimatedTime: 8,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z',
          isPublic: true,
          status: 'published',
          creator: {
            id: 1,
            name: 'Sarah Johnson',
            avatar: '/avatars/sarah.jpg'
          },
          usage: {
            totalPlays: 1250,
            averageRating: 4.8,
            totalRatings: 89
          },
          tags: ['alphabet', 'matching', 'literacy', 'detective'],
          category: 'language',
          difficulty: 'easy',
          language: 'en'
        },
        {
          id: '2',
          title: '🔢 Number Safari Expedition',
          description: 'Count animals and objects in a virtual safari while learning number recognition.',
          type: 'counting',
          instructions: 'Count the animals you see and click the correct number!',
          questions: [],
          rewards: {
            points: 25,
            badges: ['Safari Counter', 'Number Explorer'],
            stickers: ['🦁', '🐘', '🌟'],
            celebrationMessage: 'Fantastic counting! You are a safari number expert!'
          },
          estimatedTime: 12,
          createdAt: '2024-01-10T09:15:00Z',
          updatedAt: '2024-01-18T16:45:00Z',
          isPublic: true,
          status: 'published',
          creator: {
            id: 2,
            name: 'Michael Chen',
            avatar: '/avatars/michael.jpg'
          },
          usage: {
            totalPlays: 980,
            averageRating: 4.6,
            totalRatings: 67
          },
          tags: ['numbers', 'counting', 'animals', 'safari'],
          category: 'math',
          difficulty: 'easy',
          language: 'en'
        },
        {
          id: '3',
          title: '🎨 Color Mixing Magic Workshop',
          description: 'Discover how primary colors combine to create secondary colors in this interactive workshop.',
          type: 'drawing',
          instructions: 'Mix two primary colors together to create a new color!',
          questions: [],
          rewards: {
            points: 30,
            badges: ['Color Wizard', 'Art Master'],
            stickers: ['🎨', '✨', '🌈'],
            celebrationMessage: 'Wonderful! You are a color mixing magician!'
          },
          estimatedTime: 15,
          createdAt: '2024-01-08T11:30:00Z',
          updatedAt: '2024-01-16T13:20:00Z',
          isPublic: false,
          status: 'draft',
          creator: {
            id: 3,
            name: 'Emma Rodriguez',
            avatar: '/avatars/emma.jpg'
          },
          usage: {
            totalPlays: 45,
            averageRating: 4.9,
            totalRatings: 8
          },
          tags: ['colors', 'art', 'mixing', 'creativity'],
          category: 'art',
          difficulty: 'medium',
          language: 'en'
        },
        {
          id: '4',
          title: '🌍 World Geography Quiz',
          description: 'Test knowledge of countries, capitals, and continents through engaging quizzes.',
          type: 'multiple_choice',
          instructions: 'Answer questions about different countries and their locations!',
          questions: [],
          rewards: {
            points: 40,
            badges: ['World Explorer', 'Geography Expert'],
            stickers: ['🌍', '🗺️', '🎯'],
            celebrationMessage: 'Excellent! You know your way around the world!'
          },
          estimatedTime: 20,
          createdAt: '2024-01-05T14:45:00Z',
          updatedAt: '2024-01-22T10:15:00Z',
          isPublic: true,
          status: 'published',
          creator: {
            id: 4,
            name: 'David Kim',
            avatar: '/avatars/david.jpg'
          },
          usage: {
            totalPlays: 2100,
            averageRating: 4.7,
            totalRatings: 156
          },
          tags: ['geography', 'world', 'countries', 'quiz'],
          category: 'social-studies',
          difficulty: 'hard',
          language: 'en'
        },
        {
          id: '5',
          title: '🎵 Musical Instruments Discovery',
          description: 'Learn about different musical instruments and their sounds.',
          type: 'matching',
          instructions: 'Listen to the sounds and match them with the correct instruments!',
          questions: [],
          rewards: {
            points: 35,
            badges: ['Music Lover', 'Sound Detective'],
            stickers: ['🎵', '🎼', '🎹'],
            celebrationMessage: 'Bravo! You have a great musical ear!'
          },
          estimatedTime: 18,
          createdAt: '2024-01-12T16:20:00Z',
          updatedAt: '2024-01-19T12:10:00Z',
          isPublic: true,
          status: 'published',
          creator: {
            id: 5,
            name: 'Lisa Thompson',
            avatar: '/avatars/lisa.jpg'
          },
          usage: {
            totalPlays: 750,
            averageRating: 4.5,
            totalRatings: 42
          },
          tags: ['music', 'instruments', 'sounds', 'audio'],
          category: 'music',
          difficulty: 'medium',
          language: 'en'
        }
      ];

      setActivities(mockActivities);
      
      // Update stats
      setLibraryStats({
        totalActivities: mockActivities.length,
        myActivities: mockActivities.filter(a => a.creator.id === 1).length, // Simulate current user
        publicActivities: mockActivities.filter(a => a.isPublic).length,
        totalPlays: mockActivities.reduce((sum, a) => sum + a.usage.totalPlays, 0),
        averageRating: mockActivities.reduce((sum, a) => sum + a.usage.averageRating, 0) / mockActivities.length
      });

      setTotalPages(Math.ceil(mockActivities.length / 10));
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortActivities = () => {
    let filtered = [...activities];

    // Apply filters
    if (filters.search) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(activity => activity.category === filters.category);
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(activity => activity.difficulty === filters.difficulty);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(activity => activity.status === filters.status);
    }

    if (filters.language !== 'all') {
      filtered = filtered.filter(activity => activity.language === filters.language);
    }

    // Apply tab-specific filters
    if (activeTab === 'my-activities') {
      filtered = filtered.filter(activity => activity.creator.id === 1); // Simulate current user
    } else if (activeTab === 'public-library') {
      filtered = filtered.filter(activity => activity.isPublic && activity.status === 'published');
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (filters.sortBy) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'rating':
          aVal = a.usage.averageRating;
          bVal = b.usage.averageRating;
          break;
        case 'usage':
          aVal = a.usage.totalPlays;
          bVal = b.usage.totalPlays;
          break;
        case 'updated':
          aVal = new Date(a.updatedAt).getTime();
          bVal = new Date(b.updatedAt).getTime();
          break;
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }

      if (typeof aVal === 'string') {
        return filters.sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      } else {
        return filters.sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      }
    });

    setFilteredActivities(filtered);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'matching': return <Target className="w-4 h-4" />;
      case 'drag_drop': return <Gamepad2 className="w-4 h-4" />;
      case 'multiple_choice': return <CheckCircle2 className="w-4 h-4" />;
      case 'fill_blank': return <FileText className="w-4 h-4" />;
      case 'drawing': return <ImageIcon className="w-4 h-4" />;
      case 'counting': return <Hash className="w-4 h-4" />;
      case 'tracing': return <Edit className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleActivityAction = async (action: string, activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    switch (action) {
      case 'edit':
        setEditingActivity(activity);
        setShowCreateWizard(true);
        break;
      case 'duplicate':
        // Simulate duplication
        const duplicated = {
          ...activity,
          id: `${activity.id}_copy`,
          title: `${activity.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft' as const,
          usage: { totalPlays: 0, averageRating: 0, totalRatings: 0 }
        };
        setActivities(prev => [duplicated, ...prev]);
        break;
      case 'delete':
        setActivities(prev => prev.filter(a => a.id !== activityId));
        break;
      case 'archive':
        setActivities(prev => prev.map(a => 
          a.id === activityId ? { ...a, status: 'archived' as const } : a
        ));
        break;
      case 'publish':
        setActivities(prev => prev.map(a => 
          a.id === activityId ? { ...a, status: 'published' as const, isPublic: true } : a
        ));
        break;
    }
  };

  const handleBulkAction = async (action: string) => {
    // Handle bulk operations
    switch (action) {
      case 'delete':
        setActivities(prev => prev.filter(a => !selectedActivities.includes(a.id)));
        break;
      case 'archive':
        setActivities(prev => prev.map(a => 
          selectedActivities.includes(a.id) ? { ...a, status: 'archived' as const } : a
        ));
        break;
      case 'publish':
        setActivities(prev => prev.map(a => 
          selectedActivities.includes(a.id) ? { ...a, status: 'published' as const, isPublic: true } : a
        ));
        break;
    }
    setSelectedActivities([]);
  };

  const toggleActivitySelection = (activityId: string) => {
    setSelectedActivities(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const selectAllActivities = () => {
    if (selectedActivities.length === filteredActivities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(filteredActivities.map(a => a.id));
    }
  };

  if (showCreateWizard) {
    return (
      <ActivityCreationWizard
        onActivityCreated={(activity) => {
          // Add or update activity
          if (editingActivity) {
            setActivities(prev => prev.map(a => 
              a.id === editingActivity.id ? { ...a, ...activity } : a
            ));
          } else {
            const newActivity: ActivityData = {
              ...activity,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPublic: true,
              status: 'published',
              creator: { id: 1, name: 'Current User' },
              usage: { totalPlays: 0, averageRating: 0, totalRatings: 0 },
              tags: [],
              category: 'general',
              difficulty: 'easy',
              language: 'en'
            };
            setActivities(prev => [newActivity, ...prev]);
          }
          setShowCreateWizard(false);
          setEditingActivity(null);
        }}
        onClose={() => {
          setShowCreateWizard(false);
          setEditingActivity(null);
        }}
        editingActivity={editingActivity}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            Content Library
          </h1>
          <p className="text-gray-600 mt-1">Manage and discover educational activities</p>
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setShowCreateWizard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Activity
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{libraryStats.totalActivities}</div>
            <div className="text-sm text-gray-600">Total Activities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{libraryStats.myActivities}</div>
            <div className="text-sm text-gray-600">My Activities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{libraryStats.publicActivities}</div>
            <div className="text-sm text-gray-600">Public Library</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{libraryStats.totalPlays.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Plays</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{libraryStats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="my-activities" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              My Activities
            </TabsTrigger>
            <TabsTrigger value="public-library" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Public Library
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search activities..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                    <SelectItem value="math">Math</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="art">Art</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="social-studies">Social Studies</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.difficulty} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="usage">Usage</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedActivities.length > 0 && !readOnly && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
                <Checkbox
                  checked={selectedActivities.length === filteredActivities.length}
                  onCheckedChange={selectAllActivities}
                />
                <span className="text-sm font-medium">
                  {selectedActivities.length} selected
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('publish')}>
                    Publish
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('archive')}>
                    Archive
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Activities</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedActivities.length} activities? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleBulkAction('delete')}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activities Content */}
        <TabsContent value="my-activities" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onAction={handleActivityAction}
                  onSelect={onActivitySelect}
                  isSelected={selectedActivities.includes(activity.id)}
                  onToggleSelect={() => toggleActivitySelection(activity.id)}
                  showActions={!readOnly}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredActivities.map((activity) => (
                <ActivityListItem
                  key={activity.id}
                  activity={activity}
                  onAction={handleActivityAction}
                  onSelect={onActivitySelect}
                  isSelected={selectedActivities.includes(activity.id)}
                  onToggleSelect={() => toggleActivitySelection(activity.id)}
                  showActions={!readOnly}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public-library" className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onAction={handleActivityAction}
                  onSelect={onActivitySelect}
                  isSelected={selectedActivities.includes(activity.id)}
                  onToggleSelect={() => toggleActivitySelection(activity.id)}
                  showActions={false}
                  showPublicInfo={true}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredActivities.map((activity) => (
                <ActivityListItem
                  key={activity.id}
                  activity={activity}
                  onAction={handleActivityAction}
                  onSelect={onActivitySelect}
                  isSelected={selectedActivities.includes(activity.id)}
                  onToggleSelect={() => toggleActivitySelection(activity.id)}
                  showActions={false}
                  showPublicInfo={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Activity Templates</h3>
            <p className="text-gray-500 mb-4">Pre-built templates to jumpstart your activity creation</p>
            <Button onClick={() => setShowCreateWizard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Browse Templates
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

// Activity Card Component
interface ActivityCardProps {
  activity: ActivityData;
  onAction: (action: string, activityId: string) => void;
  onSelect?: (activity: InteractiveActivity) => void;
  isSelected: boolean;
  onToggleSelect: () => void;
  showActions: boolean;
  showPublicInfo?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onAction,
  onSelect,
  isSelected,
  onToggleSelect,
  showActions,
  showPublicInfo = false
}) => {
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'matching': return <Target className="w-4 h-4" />;
      case 'drag_drop': return <Gamepad2 className="w-4 h-4" />;
      case 'multiple_choice': return <CheckCircle2 className="w-4 h-4" />;
      case 'fill_blank': return <FileText className="w-4 h-4" />;
      case 'drawing': return <ImageIcon className="w-4 h-4" />;
      case 'counting': return <Hash className="w-4 h-4" />;
      case 'tracing': return <Edit className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-purple-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {showActions && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
              />
            )}
            {getContentTypeIcon(activity.type)}
            <Badge className={`text-xs ${getDifficultyColor(activity.difficulty)}`}>
              {activity.difficulty}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
              {activity.status}
            </Badge>
          </div>
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAction('edit', activity.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('duplicate', activity.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAction('archive', activity.id)}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onAction('delete', activity.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <CardTitle className="text-lg line-clamp-2">
          {activity.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm line-clamp-3">
          {activity.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {activity.estimatedTime} min
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            {activity.usage.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {activity.usage.totalPlays}
          </div>
        </div>

        {showPublicInfo && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <span>by {activity.creator.name}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {activity.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button 
          onClick={() => onSelect?.(activity)}
          className="w-full"
          variant="outline"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Activity
        </Button>
      </CardContent>
    </Card>
  );
};

// Activity List Item Component
interface ActivityListItemProps extends ActivityCardProps {}

const ActivityListItem: React.FC<ActivityListItemProps> = ({
  activity,
  onAction,
  onSelect,
  isSelected,
  onToggleSelect,
  showActions,
  showPublicInfo = false
}) => {
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'matching': return <Target className="w-4 h-4" />;
      case 'drag_drop': return <Gamepad2 className="w-4 h-4" />;
      case 'multiple_choice': return <CheckCircle2 className="w-4 h-4" />;
      case 'fill_blank': return <FileText className="w-4 h-4" />;
      case 'drawing': return <ImageIcon className="w-4 h-4" />;
      case 'counting': return <Hash className="w-4 h-4" />;
      case 'tracing': return <Edit className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`hover:bg-gray-50 transition-colors ${isSelected ? 'ring-2 ring-purple-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {showActions && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
            />
          )}
          
          <div className="flex items-center gap-2">
            {getContentTypeIcon(activity.type)}
            <Badge className={`text-xs ${getDifficultyColor(activity.difficulty)}`}>
              {activity.difficulty}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
              {activity.status}
            </Badge>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {activity.title}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {activity.description}
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {activity.estimatedTime}m
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              {activity.usage.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {activity.usage.totalPlays}
            </div>
          </div>

          {showPublicInfo && (
            <div className="text-sm text-gray-600">
              by {activity.creator.name}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect?.(activity)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onAction('edit', activity.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction('duplicate', activity.id)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAction('archive', activity.id)}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onAction('delete', activity.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentLibrary;