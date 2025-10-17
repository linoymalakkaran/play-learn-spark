/**
 * Content Filter Component
 * Advanced filtering interface for personalized content discovery
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  X,
  Settings,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterOptions } from '@/types/recommendation.types';

interface ContentFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showAdvanced?: boolean;
  className?: string;
}

const AVAILABLE_CATEGORIES = [
  'Math', 'Science', 'Reading', 'Art', 'Music', 'Social Studies', 
  'Language', 'Physical Education', 'Technology', 'Life Skills'
];

const AVAILABLE_SKILLS = [
  'Addition', 'Subtraction', 'Multiplication', 'Division', 'Fractions',
  'Reading Comprehension', 'Vocabulary', 'Grammar', 'Writing',
  'Critical Thinking', 'Problem Solving', 'Creativity', 'Memory',
  'Pattern Recognition', 'Logical Reasoning', 'Spatial Awareness'
];

const CONTENT_TYPES = [
  { value: 'activity', label: 'Activities' },
  { value: 'story', label: 'Stories' },
  { value: 'game', label: 'Games' },
  { value: 'video', label: 'Videos' },
  { value: 'lesson', label: 'Lessons' }
];

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
];

const AGE_RANGES = [
  { value: 'all', label: 'All Ages' },
  { value: '3-5', label: '3-5 years' },
  { value: '6-8', label: '6-8 years' },
  { value: '9-11', label: '9-11 years' },
  { value: '12+', label: '12+ years' }
];

export const ContentFilter: React.FC<ContentFilterProps> = ({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  showAdvanced = true,
  className
}) => {
  const updateFilter = <K extends keyof FilterOptions>(
    key: K, 
    value: FilterOptions[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof FilterOptions>(
    key: K,
    value: string,
    currentArray: string[]
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as FilterOptions[K]);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      skills: [],
      difficulty: [],
      duration: { min: 0, max: 60 },
      contentTypes: [],
      ageRange: 'all',
      onlyNewContent: false,
      includeCompleted: false,
      socialMode: 'all'
    });
    onSearchChange('');
  };

  const activeFilterCount = 
    filters.categories.length + 
    filters.skills.length + 
    filters.difficulty.length + 
    filters.contentTypes.length +
    (filters.ageRange !== 'all' ? 1 : 0) +
    (filters.onlyNewContent ? 1 : 0) +
    (filters.includeCompleted ? 1 : 0) +
    (filters.socialMode !== 'all' ? 1 : 0);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content, skills, or topics..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Content Type</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  variant={filters.contentTypes.includes(type.value) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => toggleArrayFilter('contentTypes', type.value, filters.contentTypes)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <Badge
                  key={level.value}
                  variant={filters.difficulty.includes(level.value) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:opacity-80",
                    filters.difficulty.includes(level.value) ? level.color : ""
                  )}
                  onClick={() => toggleArrayFilter('difficulty', level.value, filters.difficulty)}
                >
                  {level.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Duration: {filters.duration.min}-{filters.duration.max} minutes
            </label>
            <div className="px-2">
              <Slider
                value={[filters.duration.min, filters.duration.max]}
                onValueChange={([min, max]) => updateFilter('duration', { min, max })}
                max={120}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleArrayFilter('categories', category, filters.categories)}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="skills" className="space-y-3">
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {AVAILABLE_SKILLS.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={filters.skills.includes(skill)}
                      onCheckedChange={() => toggleArrayFilter('skills', skill, filters.skills)}
                    />
                    <label
                      htmlFor={`skill-${skill}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Age Range</label>
                <Select 
                  value={filters.ageRange} 
                  onValueChange={(value) => updateFilter('ageRange', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="only-new"
                    checked={filters.onlyNewContent}
                    onCheckedChange={(checked) => updateFilter('onlyNewContent', checked as boolean)}
                  />
                  <label htmlFor="only-new" className="text-sm font-medium">
                    Only show new content
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-completed"
                    checked={filters.includeCompleted}
                    onCheckedChange={(checked) => updateFilter('includeCompleted', checked as boolean)}
                  />
                  <label htmlFor="include-completed" className="text-sm font-medium">
                    Include completed content
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Social Mode</label>
                <Select 
                  value={filters.socialMode} 
                  onValueChange={(value) => updateFilter('socialMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content</SelectItem>
                    <SelectItem value="solo">Solo Activities</SelectItem>
                    <SelectItem value="collaborative">Group Activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Filters:</label>
            <div className="flex flex-wrap gap-1">
              {filters.categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => toggleArrayFilter('categories', category, filters.categories)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => toggleArrayFilter('skills', skill, filters.skills)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.difficulty.map((diff) => (
                <Badge key={diff} variant="secondary" className="text-xs">
                  {diff}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => toggleArrayFilter('difficulty', diff, filters.difficulty)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};