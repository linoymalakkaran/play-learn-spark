import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigationStore } from '@/stores/navigationStore';
import { soundEffects } from '@/utils/sounds';
import { 
  Search, 
  Filter, 
  X, 
  History, 
  Star, 
  Clock, 
  TrendingUp,
  Sparkles,
  BookOpen,
  Calculator,
  Microscope,
  Palette,
  Users,
  Brain,
  Globe,
  Target,
  Zap,
  Award,
  ChevronDown,
  Settings,
  ArrowRight,
  Heart
} from 'lucide-react';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchResult: (result: any) => void;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  isOpen, 
  onClose, 
  onSearchResult,
  className = '' 
}) => {
  const [query, setQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    searchResults,
    isSearching,
    recentSearches,
    favorites,
    recentlyAccessed,
    searchFilters,
    performSearch,
    clearSearch,
    addRecentSearch,
    setSearchFilters,
    isFavorite,
    toggleFavorite
  } = useNavigationStore();

  const categoryIcons = {
    english: BookOpen,
    math: Calculator,
    science: Microscope,
    art: Palette,
    social: Users,
    problem: Brain,
    languages: Globe,
    habits: Target,
    physical: Zap,
    world: Award
  };

  const popularSearches = [
    'counting games', 'color matching', 'alphabet learning',
    'addition practice', 'animal sounds', 'shape recognition',
    'phonics', 'multiplication', 'science experiments'
  ];

  // Handle search
  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.trim()) {
      await performSearch(searchQuery);
      addRecentSearch(searchQuery);
      soundEffects.playSuccess();
    } else {
      clearSearch();
    }
  };

  // Handle search result click
  const handleResultClick = (result: any) => {
    onSearchResult(result);
    onClose();
    soundEffects.playClick();
  };

  // Filter search results by tab
  const filteredResults = searchResults.filter(result => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'activities') return result.category !== 'feature';
    if (selectedTab === 'features') return result.category === 'feature';
    return result.category === selectedTab;
  });

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`advanced-search fixed inset-0 bg-black/50 flex items-start justify-center pt-16 z-50 ${className}`}>
      <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Advanced Search</span>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              placeholder="Search for activities, games, topics, or features..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-10 pr-10 text-lg h-12"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setQuery('');
                  clearSearch();
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-1"
              >
                <Filter className="h-3 w-3" />
                <span>Advanced Filters</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              {searchFilters.categories.length > 0 && (
                <Badge variant="secondary">
                  {searchFilters.categories.length} categories selected
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{filteredResults.length} results</span>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Categories */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Categories</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(categoryIcons).map(([category, Icon]) => {
                        const isSelected = searchFilters.categories.includes(category);
                        return (
                          <Button
                            key={category}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newCategories = isSelected
                                ? searchFilters.categories.filter(c => c !== category)
                                : [...searchFilters.categories, category];
                              setSearchFilters({ categories: newCategories });
                            }}
                            className="flex items-center space-x-1 justify-start"
                          >
                            <Icon className="h-3 w-3" />
                            <span className="capitalize">{category}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Age Range</Label>
                    <div className="space-y-2">
                      <Slider
                        value={searchFilters.ageRange}
                        onValueChange={(value) => setSearchFilters({ ageRange: value as [number, number] })}
                        max={12}
                        min={2}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Ages {searchFilters.ageRange[0]} - {searchFilters.ageRange[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Difficulty */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Difficulty</Label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((level) => {
                        const isSelected = searchFilters.difficulty.includes(level);
                        return (
                          <Button
                            key={level}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newDifficulty = isSelected
                                ? searchFilters.difficulty.filter(d => d !== level)
                                : [...searchFilters.difficulty, level];
                              setSearchFilters({ difficulty: newDifficulty });
                            }}
                            className="w-8 h-8 p-0"
                          >
                            {level}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Duration (minutes)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={searchFilters.duration}
                        onValueChange={(value) => setSearchFilters({ duration: value as [number, number] })}
                        max={60}
                        min={1}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{searchFilters.duration[0]} - {searchFilters.duration[1]} min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchFilters({ 
                      categories: [], 
                      ageRange: [2, 12],
                      difficulty: [],
                      duration: [1, 60],
                      tags: []
                    })}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Content */}
          <div className="flex-1">
            {query ? (
              // Search Results
              <div>
                {/* Result Tabs */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All ({searchResults.length})</TabsTrigger>
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="topics">Topics</TabsTrigger>
                  </TabsList>

                  <TabsContent value={selectedTab} className="mt-4">
                    <ScrollArea className="h-64">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        </div>
                      ) : filteredResults.length > 0 ? (
                        <div className="space-y-2">
                          {filteredResults.map((result) => (
                            <div
                              key={result.id}
                              onClick={() => handleResultClick(result)}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer group border"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                  <span className="text-lg">{result.icon || '🎯'}</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{result.title}</h4>
                                  <p className="text-sm text-gray-500 line-clamp-1">{result.description}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {result.category}
                                    </Badge>
                                    {result.subcategory && (
                                      <Badge variant="secondary" className="text-xs">
                                        {result.subcategory}
                                      </Badge>
                                    )}
                                    <Badge variant="secondary" className="text-xs">
                                      {Math.round(result.relevanceScore * 100)}% match
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite({
                                      id: result.id,
                                      title: result.title,
                                      path: result.path,
                                      category: result.category,
                                      icon: result.icon
                                    });
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Heart 
                                    className={`h-4 w-4 ${
                                      isFavorite(result.id) 
                                        ? 'fill-red-500 text-red-500' 
                                        : 'text-gray-400'
                                    }`} 
                                  />
                                </Button>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="h-8 w-8 mx-auto mb-2" />
                          <p>No results found for "{query}"</p>
                          <p className="text-sm mt-1">Try adjusting your search terms or filters</p>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              // Search Suggestions
              <Tabs defaultValue="recent" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                </TabsList>

                <TabsContent value="recent" className="space-y-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <History className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Recent Searches</span>
                  </div>
                  {recentSearches.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {recentSearches.slice(0, 8).map((search, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuery(search);
                            handleSearch(search);
                          }}
                          className="justify-start"
                        >
                          <Clock className="h-3 w-3 mr-2" />
                          {search}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No recent searches</p>
                  )}
                </TabsContent>

                <TabsContent value="popular" className="space-y-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Popular Searches</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {popularSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuery(search);
                          handleSearch(search);
                        }}
                        className="justify-start"
                      >
                        <Sparkles className="h-3 w-3 mr-2" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="favorites" className="space-y-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <Star className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Favorite Items</span>
                  </div>
                  {favorites.length > 0 ? (
                    <div className="space-y-2">
                      {favorites.slice(0, 5).map((item) => (
                        <Button
                          key={item.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleResultClick(item)}
                          className="w-full justify-start"
                        >
                          <Heart className="h-3 w-3 mr-2 text-red-500 fill-current" />
                          {item.title}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No favorites yet</p>
                  )}
                </TabsContent>

                <TabsContent value="trending" className="space-y-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Trending Now</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {recentlyAccessed.slice(0, 6).map((item) => (
                      <Button
                        key={item.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleResultClick(item)}
                        className="justify-start"
                      >
                        <TrendingUp className="h-3 w-3 mr-2" />
                        {item.title}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSearch;