import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ActivityCard from '@/components/common/ActivityCard';
import { Activity } from '@/types/learning';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc,
  Settings,
  X
} from 'lucide-react';

interface ActivityGridProps {
  activities: Activity[];
  onActivityLaunch: (activityId: string) => void;
  onActivityFavorite?: (activity: Activity) => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showTabs?: boolean;
  defaultView?: 'grid' | 'list';
  cardSize?: 'sm' | 'md' | 'lg';
  cardVariant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

const ActivityGrid: React.FC<ActivityGridProps> = ({
  activities,
  onActivityLaunch,
  onActivityFavorite,
  title = "Activities",
  description,
  isLoading = false,
  showSearch = true,
  showFilters = true,
  showTabs = true,
  defaultView = 'grid',
  cardSize = 'md',
  cardVariant = 'default',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'duration' | 'progress'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(activities.map(activity => activity.category)));
    return ['all', ...cats];
  }, [activities]);

  // Filter and sort activities
  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities.filter(activity => {
      // Search filter
      if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !activity.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && activity.category !== selectedCategory) {
        return false;
      }

      // Difficulty filter
      if (difficultyFilter.length > 0 && activity.difficulty && 
          !difficultyFilter.includes(activity.difficulty)) {
        return false;
      }

      // Status filter
      if (statusFilter === 'completed' && !activity.isCompleted) return false;
      if (statusFilter === 'in-progress' && (!activity.progress || activity.progress === 0)) return false;
      if (statusFilter === 'locked' && !activity.isLocked) return false;
      if (statusFilter === 'available' && (activity.isLocked || activity.isCompleted)) return false;

      return true;
    });

    // Sort activities
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'difficulty':
          comparison = (a.difficulty || 0) - (b.difficulty || 0);
          break;
        case 'duration':
          comparison = a.estimatedDuration - b.estimatedDuration;
          break;
        case 'progress':
          comparison = (a.progress || 0) - (b.progress || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [activities, searchQuery, selectedCategory, difficultyFilter, statusFilter, sortBy, sortOrder]);

  // Get activity counts by category
  const getCategoryCount = (category: string) => {
    if (category === 'all') return activities.length;
    return activities.filter(activity => activity.category === category).length;
  };

  // Get grid classes based on card size
  const getGridClasses = () => {
    const baseClasses = 'grid gap-4';
    
    switch (cardSize) {
      case 'sm':
        return `${baseClasses} grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`;
      case 'lg':
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
      default:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
    }
  };

  return (
    <div className={`activity-grid space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            {description && (
              <p className="text-gray-600 mt-1">{description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none border-r"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Advanced Filters Toggle */}
            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={showAdvancedFilters ? 'bg-blue-50 border-blue-300' : ''}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search and Basic Filters */}
        {(showSearch || showFilters) && (
          <div className="flex items-center space-x-4">
            {/* Search */}
            {showSearch && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Category Filter */}
            {showFilters && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center justify-between w-full">
                        <span className="capitalize">{category}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {getCategoryCount(category)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort */}
            {showFilters && (
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="difficulty-asc">Difficulty ↑</SelectItem>
                  <SelectItem value="difficulty-desc">Difficulty ↓</SelectItem>
                  <SelectItem value="duration-asc">Duration ↑</SelectItem>
                  <SelectItem value="duration-desc">Duration ↓</SelectItem>
                  <SelectItem value="progress-asc">Progress ↑</SelectItem>
                  <SelectItem value="progress-desc">Progress ↓</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button
                        key={level}
                        variant={difficultyFilter.includes(level) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setDifficultyFilter(prev => 
                            prev.includes(level) 
                              ? prev.filter(l => l !== level)
                              : [...prev, level]
                          );
                        }}
                        className="w-8 h-8 p-0"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="locked">Locked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setDifficultyFilter([]);
                      setStatusFilter('all');
                      setSortBy('name');
                      setSortOrder('asc');
                    }}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredAndSortedActivities.length} of {activities.length} activities
          </span>
          
          {(searchQuery || selectedCategory !== 'all' || difficultyFilter.length > 0 || statusFilter !== 'all') && (
            <div className="flex items-center space-x-2">
              <span>Filters:</span>
              {searchQuery && (
                <Badge variant="secondary">"{searchQuery}"</Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary">{selectedCategory}</Badge>
              )}
              {difficultyFilter.length > 0 && (
                <Badge variant="secondary">Difficulty: {difficultyFilter.join(', ')}</Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary">{statusFilter}</Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Activity Content */}
      {showTabs ? (
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-auto">
            {categories.slice(0, 6).map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category} ({getCategoryCount(category)})
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-6">
              <ActivityGridContent
                activities={filteredAndSortedActivities}
                viewMode={viewMode}
                gridClasses={getGridClasses()}
                cardSize={cardSize}
                cardVariant={cardVariant}
                onActivityLaunch={onActivityLaunch}
                onActivityFavorite={onActivityFavorite}
                isLoading={isLoading}
              />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <ActivityGridContent
          activities={filteredAndSortedActivities}
          viewMode={viewMode}
          gridClasses={getGridClasses()}
          cardSize={cardSize}
          cardVariant={cardVariant}
          onActivityLaunch={onActivityLaunch}
          onActivityFavorite={onActivityFavorite}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Separate component for the actual grid/list content
interface ActivityGridContentProps {
  activities: Activity[];
  viewMode: 'grid' | 'list';
  gridClasses: string;
  cardSize: 'sm' | 'md' | 'lg';
  cardVariant: 'default' | 'compact' | 'detailed';
  onActivityLaunch: (activityId: string) => void;
  onActivityFavorite?: (activity: Activity) => void;
  isLoading: boolean;
}

const ActivityGridContent: React.FC<ActivityGridContentProps> = ({
  activities,
  viewMode,
  gridClasses,
  cardSize,
  cardVariant,
  onActivityLaunch,
  onActivityFavorite,
  isLoading
}) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onLaunch={onActivityLaunch}
            onFavorite={onActivityFavorite}
            isLoading={isLoading}
            size={cardSize}
            variant="compact"
            className="w-full"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onLaunch={onActivityLaunch}
          onFavorite={onActivityFavorite}
          isLoading={isLoading}
          size={cardSize}
          variant={cardVariant}
        />
      ))}
    </div>
  );
};

export default ActivityGrid;