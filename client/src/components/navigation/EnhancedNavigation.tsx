import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/stores/navigationStore';
import { soundEffects } from '@/utils/sounds';
import { 
  Search, 
  Star, 
  Clock, 
  TrendingUp, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  BookOpen, 
  Calculator, 
  Microscope, 
  Palette, 
  Users, 
  Brain, 
  Globe, 
  Settings, 
  Heart,
  Menu,
  X,
  Sparkles,
  Zap,
  Target,
  Award,
  MoreHorizontal,
  ArrowRight,
  History
} from 'lucide-react';

interface EnhancedNavigationProps {
  className?: string;
}

const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    currentSection,
    setCurrentSection,
    searchResults,
    isSearching,
    recentSearches,
    favorites,
    recentlyAccessed,
    quickAccess,
    sidebarCollapsed,
    setSidebarCollapsed,
    navigationStyle,
    performSearch,
    clearSearch,
    addRecentSearch,
    toggleFavorite,
    isFavorite,
    navigateTo,
    searchFilters,
    setSearchFilters,
    trackNavigation
  } = useNavigationStore();

  // Update current section based on location
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrentSection('dashboard');
    else if (path.includes('/activity')) setCurrentSection('activities');
    else if (path.includes('/malayalam')) setCurrentSection('malayalam');
    else if (path.includes('/arabic')) setCurrentSection('arabic');
    else if (path.includes('/rewards')) setCurrentSection('rewards');
    else if (path.includes('/language')) setCurrentSection('languages');
    else if (path.includes('/settings')) setCurrentSection('settings');
    else if (path.includes('/ai')) setCurrentSection('ai');
    else if (path.includes('/personalization')) setCurrentSection('personalization');
  }, [location.pathname, setCurrentSection]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await performSearch(query);
      addRecentSearch(query);
    } else {
      clearSearch();
    }
  };

  // Handle search item click
  const handleSearchItemClick = (item: any) => {
    navigateTo({
      id: item.id,
      title: item.title,
      path: item.path,
      category: item.category,
      icon: item.icon
    });
    
    setIsSearchOpen(false);
    setSearchQuery('');
    clearSearch();
    
    soundEffects.playSuccess();
    trackNavigation(location.pathname, item.path, 'search');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      
      // Escape to close search
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
        clearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, clearSearch]);

  const navigationSections = [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/' },
    { id: 'activities', label: 'Learning Activities', icon: BookOpen, path: '/activities' },
    { id: 'malayalam', label: 'Malayalam', icon: Globe, path: '/malayalam' },
    { id: 'arabic', label: 'Arabic', icon: Globe, path: '/arabic' },
    { id: 'rewards', label: 'Rewards', icon: Award, path: '/rewards' },
    { id: 'ai', label: 'AI Tools', icon: Sparkles, path: '/ai' },
    { id: 'personalization', label: 'Personalize', icon: Heart, path: '/personalization' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

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

  return (
    <div className={`enhanced-navigation ${className}`}>
      {/* Main Navigation Bar */}
      <Card className="border-0 bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Logo & Menu Toggle */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h1 className="font-['Fredoka_One'] text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Play Learn Spark
                </h1>
              </div>
            </div>

            {/* Main Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationSections.map((section) => {
                const Icon = section.icon;
                const isActive = currentSection === section.id;
                
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      navigate(section.path);
                      setCurrentSection(section.id as any);
                      trackNavigation(location.pathname, section.path, 'click');
                    }}
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'hover:bg-purple-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{section.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Search & Quick Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Search</span>
                    <Badge variant="secondary" className="hidden md:inline text-xs">
                      ⌘K
                    </Badge>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Search Activities & Content</DialogTitle>
                    <DialogDescription>
                      Find activities, games, and learning content quickly
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Search for activities, games, or topics..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSearchQuery('');
                            clearSearch();
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Search Filters */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-1"
                      >
                        <Filter className="h-3 w-3" />
                        <span>Filters</span>
                      </Button>
                      
                      {searchFilters.categories.length > 0 && (
                        <Badge variant="secondary">
                          {searchFilters.categories.length} categories
                        </Badge>
                      )}
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                      <Card>
                        <CardContent className="p-4 space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Categories</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(categoryIcons).map((category) => {
                                const Icon = categoryIcons[category as keyof typeof categoryIcons];
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
                                    className="flex items-center space-x-1"
                                  >
                                    <Icon className="h-3 w-3" />
                                    <span className="capitalize">{category}</span>
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Age Range</h4>
                            <div className="flex items-center space-x-2">
                              <span>Ages {searchFilters.ageRange[0]} - {searchFilters.ageRange[1]}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Search Results */}
                    <ScrollArea className="max-h-96">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                          {searchResults.map((result) => (
                            <div
                              key={result.id}
                              onClick={() => handleSearchItemClick(result)}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                  <span className="text-lg">{result.icon || '🎯'}</span>
                                </div>
                                <div>
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
                      ) : searchQuery ? (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="h-8 w-8 mx-auto mb-2" />
                          <p>No results found for "{searchQuery}"</p>
                        </div>
                      ) : (
                        <Tabs defaultValue="recent" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="recent">Recent</TabsTrigger>
                            <TabsTrigger value="favorites">Favorites</TabsTrigger>
                            <TabsTrigger value="quick">Quick Access</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="recent" className="space-y-2">
                            {recentlyAccessed.length > 0 ? (
                              recentlyAccessed.slice(0, 5).map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => handleSearchItemClick(item)}
                                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                >
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{item.title}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-4">No recent activities</p>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="favorites" className="space-y-2">
                            {favorites.length > 0 ? (
                              favorites.slice(0, 5).map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => handleSearchItemClick(item)}
                                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                >
                                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                                  <span>{item.title}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-4">No favorites yet</p>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="quick" className="space-y-2">
                            {quickAccess.length > 0 ? (
                              quickAccess.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => handleSearchItemClick(item)}
                                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                >
                                  <Zap className="h-4 w-4 text-yellow-500" />
                                  <span>{item.title}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-4">No quick access items</p>
                            )}
                          </TabsContent>
                        </Tabs>
                      )}
                    </ScrollArea>

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && !searchQuery && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <History className="h-4 w-4" />
                          <span>Recent Searches</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.slice(0, 5).map((search, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSearch(search)}
                              className="text-xs"
                            >
                              {search}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Quick Access Dropdown */}
              {quickAccess.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Zap className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-2">
                      <h4 className="font-medium">Quick Access</h4>
                      {quickAccess.slice(0, 6).map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate(item.path);
                            trackNavigation(location.pathname, item.path, 'click');
                          }}
                          className="w-full justify-start"
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.title}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Navigation */}
      {!sidebarCollapsed && (
        <div className="md:hidden bg-white border-t">
          <div className="grid grid-cols-3 gap-1 p-2">
            {navigationSections.slice(0, 6).map((section) => {
              const Icon = section.icon;
              const isActive = currentSection === section.id;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    navigate(section.path);
                    setCurrentSection(section.id as any);
                    setSidebarCollapsed(true);
                  }}
                  className="flex flex-col items-center space-y-1 h-auto py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{section.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedNavigation;